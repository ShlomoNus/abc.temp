import { z } from "zod";

const fileMediaTypeSchema = z.enum(["docs", "images", "audio", "video"]);

const mediaTypeSchema = z.enum([
  "audio",
  "video",
  "leaflets",
  "studies",
  "guides",
  "reports",
  "plans"
]);

const statusSchema = z.enum(["init", "deleted", "updated"]);

function normalizeEmptyishTo<T>(fallback: T): (value: unknown) => unknown {
  return (value: unknown): unknown => {
    if (value === "" || value === null || value === undefined) {
      return fallback;
    }

    return value;
  };
}

function normalizeLastModified(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return new Date();
  }

  return value;
}

export const addDocumentBodySchema = z
  .object({
    type: fileMediaTypeSchema,
    mediaType: mediaTypeSchema,
    fileUrl: z.string().min(1, "fileUrl is required"),
    name: z.string().min(1, "name is required"),
    category: z.string().min(1, "category is required"),
    subCategory: z.string().min(1, "subCategory is required"),
    language: z.string().min(1, "language is required"),
    summary: z.string(),
    longSummary: z.string(),
    publishDate: z.string().min(1, "publishDate is required"),
    size: z.string().min(1, "size is required"),
    status: z.preprocess(normalizeEmptyishTo("init"), statusSchema),
    isPublish: z.preprocess(normalizeEmptyishTo(false), z.boolean()),
    lastModified: z.preprocess(normalizeLastModified, z.coerce.date())
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.isPublish) {
      return;
    }

    const hasSummary = data.summary.trim().length > 0;
    const hasLongSummary = data.longSummary.trim().length > 0;

    if (!hasSummary && !hasLongSummary) {
      ctx.addIssue({
        code: "custom",
        message:
          "When isPublish is true, at least one of summary or longSummary must be a non-empty string.",
        path: ["isPublish"]
      });
    }
  });

export type AddDocumentBodyInput = z.infer<typeof addDocumentBodySchema>;
