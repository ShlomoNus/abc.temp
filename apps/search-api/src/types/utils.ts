export type RequireAtLeastOne<T, Keys extends keyof T>
  = Omit<T, Keys>
    & {
      [K in Keys]: Required<Pick<T, K>> & Partial<Omit<Pick<T, Keys>, K>>
    }[Keys];