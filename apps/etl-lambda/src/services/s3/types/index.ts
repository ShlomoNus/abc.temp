export type S3ObjectExistsResult
  = | { id: number, exists: true, s3Key: string }
    | { id: number, exists: false, s3Key: string, notFound: true, message: string }
    | { id: number, exists: false, s3Key: string, notFound: false, message: string };

export type HeadObjectExistsParams = {
  bucket: string
  key: string
};

export type VerifyS3ObjectParams = {
  id: number
  name: string
  folderPrefix: string
};

export type VerifyS3ObjectByIdAndNameParams = {
  id: number
  name: string
};

export type S3BucketExistsResult
  = | { bucket: string, exists: true }
    | { bucket: string, exists: false, notFound: true, message: string }
    | { bucket: string, exists: false, notFound: false, message: string };
