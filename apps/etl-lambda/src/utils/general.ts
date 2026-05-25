import { CONFIG } from "@/CONFIG";
import { testingNodeEnvOption } from "@/consts/general";

export function isTestingEnvironment(): boolean {
  return testingNodeEnvOption.includes(CONFIG.NODE_ENV);
}
