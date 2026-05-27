# Earthquake reports archive ETL

Local Express API for seeding Elasticsearch, managing archive documents, and queueing summarize jobs. See below for HTTP endpoints and Docker setup for Elasticsearch/Kibana.

## Run the API locally

```bash
pnpm run dev
```

Default base URL: `http://127.0.0.1:3080` (override with `PORT`).

## API endpoints

Routes are grouped by intent. **Test** routes are blocked outside testing environments (`NODE_ENV` = `development`, `test`, or `qa`); in `staging` / `production` they return `403`.

| Method | Path | Route type | Description |
|--------|------|------------|-------------|
| `GET` | `/health` | Public | Simple health check (always available). |
| `GET` | `/getAll` | Product | Return all documents from the Elasticsearch index. |
| `POST` | `/add` | Product | Add a document; server assigns a random 5-digit `id`. |
| `PUT` | `/update/:id` | Product | Update a document by 5-digit `id` (`id` in the body cannot change). |
| `GET` | `/verifyEsBaseDataS3` | Product | `HeadBucket` on `S3_BUCKET_NAME`. Returns **503** if the bucket is missing. |
| `GET` | `/loadInitInfo` | Product | Ensure the ES index exists and bulk-index seed catalog data (`esBaseData`). |
| `GET` | `/loadInitSummerize` | Product | Async-invoke the summarize Lambda once per seed file (`InvocationType: Event`). |
| `GET` | `/testing/openapi.json` | Test | OpenAPI 3 document (setup routes + test routes when env allows). |
| `GET` | `/testing/api-docs` | Test | Swagger UI for the API. |
| `GET` | `/testing/documents/ids` | Test | List all document `_id`s in the index. |
| `GET` | `/testing/documents/:id` | Test | Fetch one document by `_id`. |
| `GET` | `/testing/es/health` | Test | Ping Elasticsearch and report whether `ES_INDEX_NAME` exists. |
| `PUT` | `/testing/es/index` | Test | Create the Elasticsearch index with mapping if missing. |
| `DELETE` | `/testing/es/index` | Test | Delete the Elasticsearch index (`ES_INDEX_NAME`). |

**Product** routes are the operational ETL/setup surface (load data, CRUD, S3 verify, summarize queue). **Test** routes are for local/dev inspection and index management. Search endpoints (`/search`, `/getSummary`) live in a separate app and are not mounted here.

## S3 folder naming

Archive files live in a single S3 bucket. Folder prefixes are configured via environment variables (see `.env`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `S3_BUCKET_NAME` | `s3-content-earthquake-dev` | S3 bucket for archive files |
| `S3_BUCKET_VERIFY_CHECKS_PER_DAY` | `1` | Max `HeadBucket` calls per day for `/verifyEsBaseDataS3` (in-process cache; `1` ≈ once every 24h, `24` ≈ hourly) |
| `S3_INIT_LOAD_FOLDER_PREFIX` | `init-load/` | One-time seed catalog files (used by `esBaseData`) |
| `S3_INCOMING_FILES_FOLDER_PREFIX` | `incoming-files/` | New uploads added after initial load |

### Object key layout

S3 object keys are derived from `name` (not stored on the document):

```text
{prefix}{name}.docs
```

- **`prefix`** — `S3_INIT_LOAD_FOLDER_PREFIX` for seed data, or `S3_INCOMING_FILES_FOLDER_PREFIX` for newly added files.
- **`name`** — document display name (must match the `name` field in Elasticsearch).

Full URI for HeadObject / SDK calls: `s3://{S3_BUCKET_NAME}/{prefix}{name}.docs`

Example (seed catalog):

```text
s3://s3-content-earthquake-dev/init-load/העתק אור עקיבא.docs
```

Example (new upload):

```text
s3://s3-content-earthquake-dev/incoming-files/דוח חדש.docs
```

---

## Melingo Elasticsearch Docker Setup

## Prerequisites

Make sure Docker Desktop is installed and running.

## 1. Load the Docker image

Go to the folder where the `.tar` file is located.

Example:

```powershell
cd C:\EKS
```

Load the image:

```powershell
docker load --input "melingo-es-v8.17.1-v12.tar"
```

Verify that the image was loaded:

```powershell
docker images
```

You should see:

```text
melingo-es-v8.17.1:v12
```

## 2. Start Elasticsearch and Kibana

From the project folder, run:

```bash
pnpm run docker:start
```

## 3. Verify Elasticsearch

Open:

```text
http://localhost:9200
```

Or run:

```powershell
curl http://localhost:9200
```

You should see Elasticsearch version `8.17.1`.

## 4. Verify Melingo plugin

Run:

```powershell
curl http://localhost:9200/_cat/plugins?v
```

You should see:

```text
melingo_plugin
```

## 5. Open Kibana

Open:

```text
http://localhost:5609
```

## Notes

The Docker image is loaded manually from the `.tar` file only once.

After the image is loaded, use:

```bash
pnpm run docker:start
```

to start the containers.
