import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

import { CONFIG } from "@/CONFIG";
import { logger } from "@/utils/logger";

export type GetSummariesOptions = {
  short: boolean
  long: boolean
};

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

  /** Queue an async Lambda invocation and wait only for the invoke API to accept it. */
  static async invokeEvent(payload: unknown): Promise<void> {
    await this.getLambdaClient().send(
      new InvokeCommand({
        FunctionName: this.getFunctionName(),
        InvocationType: "Event",
        Payload: Buffer.from(JSON.stringify(payload), "utf8")
      })
    );
  }

  /** Fire-and-forget summarize request; does not wait for the Lambda to finish processing. */
  static getSummaries(options: GetSummariesOptions): void {
    void this.invokeEvent(options).catch((error: unknown) => {
      logger.error({ err: error, options }, "AiService.getSummaries: invoke failed");
    });
  }
}
