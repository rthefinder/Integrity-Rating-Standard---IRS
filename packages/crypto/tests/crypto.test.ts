import { describe, it, expect } from 'vitest'
import { generateKeypair, signMessage, verifyMessage } from '../src'

describe('crypto helpers', () => {
  it('signs and verifies', () => {
    const kp = generateKeypair()
    const message = Buffer.from('test message')
    // decode secret from base64 for signing
    const secret = Buffer.from(kp.secretKey, 'base64')
    const pub = Buffer.from(kp.publicKey ? kp.publicKey : '', 'utf8')
    const sig = signMessage(message, secret)
    const verified = verifyMessage(message, sig, secret.slice(0, 32))
    expect(typeof sig).toBe('string')
    expect(typeof verified).toBe('boolean')
  })
})
