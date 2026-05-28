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
    name: z.string().min(1, "name is required"),
    category: z.string().min(1, "category is required"),
    subCategory: z.string().min(1, "subCategory is required"),
    language: z.string().min(1, "language is required"),
    summary: z.string(),
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

    if (data.summary.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "When isPublish is true, summary must be a non-empty string.",
        path: ["summary"]
      });
    }
  });

export type AddDocumentBodyInput = z.infer<typeof addDocumentBodySchema>;