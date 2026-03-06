import { describe, expect, test } from 'vitest'
import { Registration, Authentication } from 'webauthx/client'

import * as Ceremony from './Ceremony.js'

const ceremony = Ceremony.local({
  origin: 'http://localhost',
  rpId: 'localhost',
})

describe('registration', () => {
  test('default: creates a passkey and verifies registration', async () => {
    const { options } = await ceremony.getRegistrationOptions({ name: 'Test' })
    const credential = await Registration.create({ options })
    const result = await ceremony.verifyRegistration(credential)

    expect(result.publicKey).toMatch(/^0x[0-9a-f]+$/)
  })
})

describe('authentication', () => {
  test('default: authenticates with an existing passkey', async () => {
    // Register first
    const { options: regOptions } = await ceremony.getRegistrationOptions({ name: 'Test' })
    const credential = await Registration.create({ options: regOptions })
    const { publicKey } = await ceremony.verifyRegistration(credential)

    // Authenticate
    const { options: authOptions } = await ceremony.getAuthenticationOptions()
    const response = await Authentication.sign({ options: authOptions })
    const result = await ceremony.verifyAuthentication(response)

    expect(result.publicKey).toMatchInlineSnapshot(`"${publicKey}"`)
  })
})

describe('round-trip', () => {
  test('default: register → authenticate → publicKeys match', async () => {
    const { options: regOptions } = await ceremony.getRegistrationOptions({ name: 'Round-trip' })
    const credential = await Registration.create({ options: regOptions })
    const reg = await ceremony.verifyRegistration(credential)

    const { options: authOptions } = await ceremony.getAuthenticationOptions()
    const response = await Authentication.sign({ options: authOptions })
    const auth = await ceremony.verifyAuthentication(response)

    expect(auth.publicKey).toBe(reg.publicKey)
  })
})
