type EsBulkItem = {
  index?: {
    _id?: string
    error?: {
      reason?: string
      type?: string
    }
    status?: number
  }
};

export type EsBulkResponse = {
  errors: boolean
  items: EsBulkItem[]
};

export type EsRequestParams = {
  method: string
  path: string
  body?: string
  contentType?: string
};