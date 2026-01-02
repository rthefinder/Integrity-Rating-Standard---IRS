import nacl from 'tweetnacl'
import * as base64 from '@stablelib/base64'
import bs58 from 'bs58'

export function signMessage(message: Uint8Array, secretKey: Uint8Array) {
  const sig = nacl.sign.detached(message, secretKey)
  return base64.encode(sig)
}

export function verifyMessage(message: Uint8Array, signatureBase64: string, publicKey: Uint8Array) {
  const sig = base64.decode(signatureBase64)
  return nacl.sign.detached.verify(message, sig, publicKey)
}

export function generateKeypair() {
  const kp = nacl.sign.keyPair()
  return {
    publicKey: bs58.encode(Buffer.from(kp.publicKey)),
    secretKey: base64.encode(Buffer.from(kp.secretKey))
  }
}
