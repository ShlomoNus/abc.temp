import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { AIAddIncomingFileSummarizyPayload, AIInitSummarizePayload, AiLambdaBasePayload } from "@earthquake-reports/shared";

import { CONFIG } from "@/CONFIG";
import { S3Service } from "@/services/s3/S3Service";
import type { S3ObjectExistsResult } from "@/services/s3/types";

export class AiService {
  static readonly aiLambdaName = CONFIG.AI_LAMBDA_NAME;
  private static lambdaClient: LambdaClient | undefined;

  private static getLambdaClient(): LambdaClient {
    if (!this.lambdaClient) {
      this.lambdaClient = new LambdaClient({
        region: CONFIG.AWS_REGION
      });
    }

    return this.lambdaClient;
  }

  private static getFunctionName(): string {
    const functionName = this.aiLambdaName.trim();

    if (!functionName) {
      throw new Error("AI_LAMBDA_NAME is not configured");
    }

    return functionName;
  }

  private static async assertAIBucketExists(): Promise<void> {
    const bucketResult = await S3Service.verifyAIBucketExistence();

    if (!bucketResult.exists) {
      const detail = "message" in bucketResult
        ? bucketResult.message
        : "S3 bucket is not available";

      throw new Error(`${detail} (bucket: ${bucketResult.bucket || "unset"})`);
    }
  }

  private static assertObjectExists(result: S3ObjectExistsResult): void {
    if (result.exists) {
      return;
    }

    const detail = "message" in result
      ? result.message
      : "S3 object is not available";

    throw new Error(`${detail} (key: ${result.s3Key})`);
  }

  /** Queue an async Lambda invocation and wait only for the invoke API to accept it. */
  private static async invokeEvent(payload: AiLambdaBasePayload): Promise<void> {
    await this.getLambdaClient().send(
      new InvokeCommand({
        FunctionName: this.getFunctionName(),
        InvocationType: "Event",
        Payload: Buffer.from(JSON.stringify(payload), "utf8")
      })
    );
  }

  static async initSummarize({ id, name, type }: AIInitSummarizePayload): Promise<void> {
    await this.assertAIBucketExists();

    const fileResult = await S3Service.initObjectExistsVerifier({ id, name });

    this.assertObjectExists(fileResult);

    await this.invokeEvent({
      id,
      fileLocation: fileResult.s3Key,
      type,
      isShortSummaryRequired: true
    });
  }

  static async incomingFileSummarize({
    id,
    name,
    type,
    isShortSummaryRequired = false
  }: AIAddIncomingFileSummarizyPayload): Promise<void> {
    await this.assertAIBucketExists();

    const fileResult = await S3Service.incomingObjectExistsVerifier({ id, name });

    this.assertObjectExists(fileResult);

    await this.invokeEvent({
      id,
      fileLocation: fileResult.s3Key,
      type,
      isShortSummaryRequired
    });
  }
}
