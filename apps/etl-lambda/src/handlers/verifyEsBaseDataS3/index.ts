import { HeadObjectCommand, S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";

import { CONFIG } from "@/CONFIG";
import { esBaseData } from "@/handlers/loadInitialDataToDb/consts";
import type { ArchiveDocumentSeed } from "@/types/data";

const S3_URL_PREFIX = "s3://";
const HEAD_CONCURRENCY = 10;

type ParsedS3Uri = {
  bucket: string
  key: string
};

export type VerifyEsBaseDataS3Item = {
  id: number
  fileUrl: string
  status: "found" | "missing" | "invalid_url" | "error"
  detail?: string
};

export type VerifyEsBaseDataS3Result = {
  total: number
  found: number
  missing: number
  invalidUrl: number
  error: number
  items: VerifyEsBaseDataS3Item[]
};

function parseS3Uri(fileUrl: string): ParsedS3Uri | null {
  if (!fileUrl.startsWith(S3_URL_PREFIX)) {
    return null;
  }

  const rest = fileUrl.slice(S3_URL_PREFIX.length);
  const slash = rest.indexOf("/");

  if (slash <= 0 || slash >= rest.length - 1) {
    return null;
  }

  return {
    bucket: rest.slice(0, slash),
    key: rest.slice(slash + 1)
  };
}

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

async function headObjectExists(
  client: S3Client,
  parsed: ParsedS3Uri
): Promise<
  | { ok: true }
  | { ok: false, notFound: boolean, message: string }
> {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: parsed.bucket,
        Key: parsed.key
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
  const parsed = parseS3Uri(item.fileUrl);

  if (!parsed) {
    return {
      id: item.id,
      fileUrl: item.fileUrl,
      status: "invalid_url",
      detail: "Expected s3://bucket/key"
    };
  }

  const result = await headObjectExists(client, parsed);

  if (result.ok) {
    return { id: item.id, fileUrl: item.fileUrl, status: "found" };
  }

  if (result.notFound) {
    return { id: item.id, fileUrl: item.fileUrl, status: "missing", detail: result.message };
  }

  return { id: item.id, fileUrl: item.fileUrl, status: "error", detail: result.message };
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
  let invalidUrl = 0;
  let error = 0;

  for (const it of items) {
    if (it.status === "found") {
      found += 1;
    }
    else if (it.status === "missing") {
      missing += 1;
    }
    else if (it.status === "invalid_url") {
      invalidUrl += 1;
    }
    else {
      error += 1;
    }
  }

  return {
    total: items.length,
    found,
    missing,
    invalidUrl,
    error,
    items
  };
}
