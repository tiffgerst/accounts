/** Deduplicates in-flight promises by key. */
export function withDedupe<data>(
  fn: () => Promise<data>,
  { enabled = true, id }: withDedupe.Options,
): Promise<data> {
  if (!enabled || !id) return fn()
  if (withDedupe.cache.get(id)) return withDedupe.cache.get(id)!
  const promise = fn().finally(() => withDedupe.cache.delete(id))
  withDedupe.cache.set(id, promise)
  return promise
}

export declare namespace withDedupe {
  type Options = {
    enabled?: boolean | undefined
    id?: string | undefined
  }
}

withDedupe.cache = new Map<string, Promise<any>>()
