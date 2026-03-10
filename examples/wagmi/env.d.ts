import type { Hex } from 'viem'

declare namespace Cloudflare {
  interface Env {
    FEE_PAYER_PRIVATE_KEY: Hex
    KEYS_KV: KVNamespace
  }
}
