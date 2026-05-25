import { Client, estypes } from "@elastic/elasticsearch";

import { CONFIG } from "@/CONFIG";

const {
  ES_API_KEY,
  ES_ENDPOINT,
  ES_PASSWORD,
  ES_TLS_REJECT_UNAUTHORIZED,
  ES_USERNAME
} = CONFIG;

function createEsClient(): Client {
  const endpoint = ES_ENDPOINT?.trim();

  if (!endpoint) {
    throw new Error("Missing ES_ENDPOINT env var");
  }

  const apiKey = ES_API_KEY?.trim();
  const username = ES_USERNAME?.trim();
  const password = ES_PASSWORD?.trim();
  const tls = {
    rejectUnauthorized: ES_TLS_REJECT_UNAUTHORIZED
  };

  if (apiKey) {
    return new Client({
      node: endpoint,
      auth: {
        apiKey
      },
      tls
    });
  }

  if (username && password) {
    return new Client({
      node: endpoint,
      auth: {
        username,
        password
      },
      tls
    });
  }

  return new Client({
    node: endpoint,
    tls
  });
}

export const esClient = createEsClient();

export async function ensureIndexExists(
  indexName: string,
  indexBody: Omit<estypes.IndicesCreateRequest, "index">
): Promise<{ created: boolean }> {
  const exists = await esClient.indices.exists({
    index: indexName
  });

  if (exists) {
    return { created: false };
  }

  await esClient.indices.create({
    index: indexName,
    ...indexBody
  });

  return { created: true };
}