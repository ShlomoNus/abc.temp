import { type NodeEnvOption } from "@/types/general";

export const nodeEnvOption = ["development", "test", "qa", "staging", "production"] as const;

export const testingNodeEnvOption: readonly NodeEnvOption[] = ["development", "test", "qa"] as const;
