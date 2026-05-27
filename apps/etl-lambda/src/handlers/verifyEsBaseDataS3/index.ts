import { S3Service } from "@/services/s3/S3Service";
import type { S3BucketExistsResult } from "@/services/s3/types";

export async function verifyEsBaseDataS3Urls(): Promise<S3BucketExistsResult> {
  return S3Service.verifyAIBucketExistence();
}
