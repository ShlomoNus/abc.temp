import { estypes } from "@elastic/elasticsearch";

export function getTotalHits(total: estypes.SearchTotalHits | number | undefined): number {
  if (typeof total === "number") {
    return total;
  }

  return total?.value ?? 0;
}
