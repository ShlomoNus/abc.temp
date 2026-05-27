import { HeadBucketCommand, HeadObjectCommand, S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import dayjs, { type Dayjs } from "dayjs";

import { CONFIG } from "@/CONFIG";
import { logger } from "@/utils/logger";
import { buildS3ObjectKey } from "@/utils/s3";

import type {
  HeadObjectExistsParams,
  S3BucketExistsResult,
  S3ObjectExistsResult,
  VerifyS3ObjectByIdAndNameParams,
  VerifyS3ObjectParams
} from "./types";

type BucketExistenceCacheEntry = {
  bucket: string
  result: S3BucketExistsResult
  cachedAtMs: number
};

export class S3Service {
  static readonly bucketName = CONFIG.S3_BUCKET_NAME;
  private static s3Client: S3Client | undefined;
  private static bucketExistenceCache: BucketExistenceCacheEntry | undefined;

  private static isNotFound(err: unknown): boolean {
    if (!err || typeof err !== "object") {
      return false;
    }

    const e = err as {
      name?: string
      $metadata?: {
        httpStatusCode?: number
      }
    };

    return e.name === "NotFound"
      || e.name === "NoSuchBucket"
      || e.$metadata?.httpStatusCode === 404;
  }

  private static createS3ClientConfig(): S3ClientConfig {
    const region = CONFIG.AWS_REGION.trim();
    const bucket = CONFIG.S3_BUCKET_NAME.trim();
    const accessKeyId = CONFIG.AWS_ACCESS_KEY_ID.trim();
    const secretAccessKey = CONFIG.AWS_SECRET_ACCESS_KEY.trim();
    const sessionToken = CONFIG.AWS_SESSION_TOKEN.trim();

    if (!region) {
      logger.error("S3 client config missing AWS_REGION");
    }

    if (!bucket) {
      logger.error("S3 client config missing S3_BUCKET_NAME");
    }

    if (accessKeyId && !secretAccessKey) {
      logger.error(
        "S3 client config incomplete: AWS_ACCESS_KEY_ID is set but AWS_SECRET_ACCESS_KEY is missing"
      );
    }

    if (!accessKeyId && secretAccessKey) {
      logger.error(
        "S3 client config incomplete: AWS_SECRET_ACCESS_KEY is set but AWS_ACCESS_KEY_ID is missing"
      );
    }

    if (!accessKeyId && !secretAccessKey) {
      logger.warn(
        "S3 client config: no explicit AWS credentials; using the SDK default credential provider chain"
      );
    }

    if (accessKeyId && secretAccessKey) {
      return {
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {})
        }
      };
    }

    return { region };
  }

  private static getS3Client(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client(this.createS3ClientConfig());
    }

    return this.s3Client;
  }

  private static async headObjectExists({
    bucket,
    key
  }: HeadObjectExistsParams): Promise<
    | { ok: true }
    | { ok: false, notFound: boolean, message: string }
  > {
    try {
      await this.getS3Client().send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key
        })
      );

      return { ok: true };
    }
    catch(err: unknown) {
      if (this.isNotFound(err)) {
        return { ok: false, notFound: true, message: "Object not found" };
      }

      const message = err instanceof Error ? err.message : "HeadObject failed";

      return { ok: false, notFound: false, message };
    }
  }

  private static async verifyObjectExists({
    id,
    name,
    folderPrefix
  }: VerifyS3ObjectParams): Promise<S3ObjectExistsResult> {
    const s3Key = buildS3ObjectKey({ name, folderPrefix });
    const result = await this.headObjectExists({
      bucket: this.bucketName,
      key: s3Key
    });

    if (result.ok) {
      return { id, exists: true, s3Key };
    }

    if (result.notFound) {
      return {
        id,
        exists: false,
        s3Key,
        notFound: true,
        message: result.message
      };
    }

    return {
      id,
      exists: false,
      s3Key,
      notFound: false,
      message: result.message
    };
  }

  private static getBucketVerifyCacheExpiresAt(cachedAtMs: number): Dayjs {
    const checksPerDay = Math.max(1, CONFIG.S3_BUCKET_VERIFY_CHECKS_PER_DAY);
    const hoursPerCheck = 24 / checksPerDay;

    return dayjs(cachedAtMs).add(hoursPerCheck, "hour");
  }

  private static isBucketExistenceCacheFresh(cachedAtMs: number): boolean {
    return dayjs().isBefore(this.getBucketVerifyCacheExpiresAt(cachedAtMs));
  }

  private static getCachedBucketExistence(bucket: string): S3BucketExistsResult | undefined {
    const entry = this.bucketExistenceCache;

    if (!entry || entry.bucket !== bucket) {
      return undefined;
    }

    if (!this.isBucketExistenceCacheFresh(entry.cachedAtMs)) {
      return undefined;
    }

    return entry.result;
  }

  private static setCachedBucketExistence(
    bucket: string,
    result: S3BucketExistsResult
  ): void {
    this.bucketExistenceCache = {
      bucket,
      result,
      cachedAtMs: dayjs().valueOf()
    };
  }

  private static async fetchAIBucketExistence(bucket: string): Promise<S3BucketExistsResult> {
    try {
      await this.getS3Client().send(
        new HeadBucketCommand({
          Bucket: bucket
        })
      );

      return { bucket, exists: true };
    }
    catch(err: unknown) {
      if (this.isNotFound(err)) {
        return {
          bucket,
          exists: false,
          notFound: true,
          message: "Bucket not found"
        };
      }

      const message = err instanceof Error ? err.message : "HeadBucket failed";

      logger.error({ err, bucket }, "S3 bucket verification failed");

      return {
        bucket,
        exists: false,
        notFound: false,
        message
      };
    }
  }

  static async verifyAIBucketExistence(): Promise<S3BucketExistsResult> {
    const bucket = this.bucketName.trim();

    if (!bucket) {
      return {
        bucket: "",
        exists: false,
        notFound: false,
        message: "S3_BUCKET_NAME is not configured"
      };
    }

    const cached = this.getCachedBucketExistence(bucket);

    if (cached) {
      logger.debug({ bucket }, "S3 bucket existence cache hit");

      return cached;
    }

    const result = await this.fetchAIBucketExistence(bucket);

    this.setCachedBucketExistence(bucket, result);

    return result;
  }

  static async initObjectExistsVerifier({
    id,
    name
  }: VerifyS3ObjectByIdAndNameParams): Promise<S3ObjectExistsResult> {
    return this.verifyObjectExists({
      id,
      name,
      folderPrefix: CONFIG.S3_INIT_LOAD_FOLDER_PREFIX
    });
  }

  static async incomingObjectExistsVerifier({
    id,
    name
  }: VerifyS3ObjectByIdAndNameParams): Promise<S3ObjectExistsResult> {
    return this.verifyObjectExists({
      id,
      name,
      folderPrefix: CONFIG.S3_INCOMING_FILES_FOLDER_PREFIX
    });
  }
}
