import { z } from "zod";

export const documentIdParamSchema = z
  .string()
  .regex(/^\d{5}$/, "Document id must be a 5-digit number");
