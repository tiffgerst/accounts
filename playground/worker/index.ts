import { Handler, Kv } from 'zyzz/server'

export default Handler.webauthn({
  kv: Kv.memory(),
  origin: 'http://localhost:5173',
  path: '/webauthn',
  rpId: 'localhost',
}) satisfies ExportedHandler
