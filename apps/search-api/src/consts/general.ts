import { type NodeEnvOption } from "@/types/general";

export const nodeEnvOption = ["development", "DEV", "test", "qa", "staging", "preprod", "prod", "production"] as const;

export const testingNodeEnvOption: readonly NodeEnvOption[] = ["development", "DEV", "test", "qa"] as const;
