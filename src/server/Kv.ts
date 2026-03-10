import { Json } from 'ox'

export type Kv = {
  get: <value = unknown>(key: string) => Promise<value>
  set: (key: string, value: unknown) => Promise<void>
  delete: (key: string) => Promise<void>
}

export function from<kv extends Kv>(kv: kv): kv {
  return kv
}

export function cloudflare(kv: cloudflare.Parameters): Kv {
  return from({
    delete: kv.delete.bind(kv),
    async get(key) {
      return kv.get(key, 'json')
    },
    async set(key, value) {
      return kv.put(key, Json.stringify(value))
    },
  })
}

export declare namespace cloudflare {
  export type Parameters = {
    get: <value = unknown>(key: string, format: 'json') => Promise<value>
    put: (key: string, value: string) => Promise<void>
    delete: (key: string) => Promise<void>
  }
}

export function memory(): Kv {
  const store = new Map<string, unknown>()
  return from({
    async delete(key) {
      Promise.resolve(store.delete(key))
    },
    async get(key) {
      return store.get(key) as any
    },
    async set(key, value) {
      store.set(key, value)
    },
  })
}
