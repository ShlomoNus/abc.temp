export type IdIndexState = {
  currentId: number
  addedIds: number[]
};

export type EnsureIdIndexResult = {
  indexName: string
  created: boolean
  message: string
};

export type AllocateNextDocumentIdResult = {
  id: number
  state: IdIndexState
};
