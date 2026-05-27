import { HeadObjectCommand, S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import type { ArchiveDocumentSeed } from "@earthquake-reports/shared";

import { CONFIG } from "@/CONFIG";
import { esBaseData } from "@/handlers/loadInitialDataToDb/consts";
import { buildS3ObjectKey } from "@/utils/s3";

const HEAD_CONCURRENCY = 10;

export type VerifyEsBaseDataS3Item = {
  id: number
  s3Key: string
  status: "found" | "missing" | "error"
  detail?: string
};

export type VerifyEsBaseDataS3Result = {
  total: number
  found: number
  missing: number
  error: number
  items: VerifyEsBaseDataS3Item[]
};

function isNotFound(err: unknown): boolean {
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
    || e.$metadata?.httpStatusCode === 404;
}

type HeadObjectExistsParams = {
  client: S3Client
  bucket: string
  key: string
};

async function headObjectExists({
  client,
  bucket,
  key
}: HeadObjectExistsParams): Promise<
  | { ok: true }
  | { ok: false, notFound: boolean, message: string }
> {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );

    return { ok: true };
  }
  catch(err: unknown) {
    if (isNotFound(err)) {
      return { ok: false, notFound: true, message: "Object not found" };
    }

    const message = err instanceof Error ? err.message : "HeadObject failed";

    return { ok: false, notFound: false, message };
  }
}

async function verifyOne(
  client: S3Client,
  item: ArchiveDocumentSeed
): Promise<VerifyEsBaseDataS3Item> {
  const s3Key = buildS3ObjectKey({
    name: item.name,
    folderPrefix: CONFIG.S3_INIT_LOAD_FOLDER_PREFIX
  });

  const result = await headObjectExists({
    client,
    bucket: CONFIG.S3_BUCKET_NAME,
    key: s3Key
  });

  if (result.ok) {
    return { id: item.id, s3Key, status: "found" };
  }

  if (result.notFound) {
    return { id: item.id, s3Key, status: "missing", detail: result.message };
  }

  return { id: item.id, s3Key, status: "error", detail: result.message };
}

type MapInChunksOptions<T, R> = {
  items: T[]
  chunkSize: number
  mapper: (item: T) => Promise<R>
};

async function mapInChunks<T, R>(options: MapInChunksOptions<T, R>): Promise<R[]> {
  const { items, chunkSize, mapper } = options;
  const out: R[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const part = await Promise.all(chunk.map(mapper));

    out.push(...part);
  }

  return out;
}

function createS3ClientConfig(): S3ClientConfig {
  const region = CONFIG.AWS_REGION;
  const accessKeyId = CONFIG.AWS_ACCESS_KEY_ID.trim();
  const secretAccessKey = CONFIG.AWS_SECRET_ACCESS_KEY.trim();
  const sessionToken = CONFIG.AWS_SESSION_TOKEN.trim();

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

export async function verifyEsBaseDataS3Urls(): Promise<VerifyEsBaseDataS3Result> {
  const client = new S3Client(createS3ClientConfig());

  const items = await mapInChunks({
    items: esBaseData,
    chunkSize: HEAD_CONCURRENCY,
    mapper: async row => verifyOne(client, row)
  });

  let found = 0;
  let missing = 0;
  let error = 0;

  for (const it of items) {
    if (it.status === "found") {
      found += 1;
    }
    else if (it.status === "missing") {
      missing += 1;
    }
    else {
      error += 1;
    }
  }

  return {
    total: items.length,
    found,
    missing,
    error,
    items
  };
}
