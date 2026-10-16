/**
 * Diffie-Hellman Key Agreement Implementation
 * Standards: RFC 3526 MODP Group 14 (2048-bit Modular Exponential Prime) & RFC 5869 (HKDF)
 */

// RFC 3526 - 2048-bit MODP Group 14 Prime (p)
export const MODP_GROUP_14_PRIME_HEX =
  'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1' +
  '29024E088A67CC74020BBEA63B139B22514A08798E3404DD' +
  'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245' +
  'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' +
  'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D' +
  'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F' +
  '83655D23DCA3AD961C62F356208552BB9ED529077096966D' +
  '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B' +
  'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9' +
  'DE2BCBF6955817183995497CEA956AE515D2261898FA0510' +
  '15728E5A8AACAA68FFFFFFFFFFFFFFFF';

export const MODP_GROUP_14_P = BigInt('0x' + MODP_GROUP_14_PRIME_HEX);
export const MODP_GROUP_14_G = 2n;

/**
 * Modular Exponentiation: (base^exp) % mod using square-and-multiply algorithm
 */
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let res = 1n;
  let b = base % mod;
  let e = exp;

  while (e > 0n) {
    if (e % 2n === 1n) {
      res = (res * b) % mod;
    }
    b = (b * b) % mod;
    e = e / 2n;
  }
  return res;
}

/**
 * Generate cryptographically secure random BigInt of given bit length
 */
export function generateRandomBigInt(bits: number = 256): bigint {
  const bytesCount = Math.ceil(bits / 8);
  const randomBytes = crypto.getRandomValues(new Uint8Array(bytesCount));
  let hex = '0x';
  for (let i = 0; i < randomBytes.length; i++) {
    hex += randomBytes[i].toString(16).padStart(2, '0');
  }
  return BigInt(hex);
}

/**
 * Convert BigInt to Hex string with given byte padding
 */
export function bigIntToHex(val: bigint): string {
  let hex = val.toString(16);
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  return hex;
}

/**
 * Derive 256-bit symmetric session key from shared secret using HKDF-SHA256 simulation
 */
export async function deriveHKDFSessionKey(sharedSecretHex: string): Promise<string> {
  const enc = new TextEncoder();
  const rawSecret = enc.encode(sharedSecretHex);
  const digestBuffer = await crypto.subtle.digest('SHA-256', rawSecret);
  const hashArray = Array.from(new Uint8Array(digestBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface DHSingleParty {
  privateKeyHex: string;
  publicKeyHex: string;
}

export interface DHExchangeSimulation {
  alicePrivateKey: string;
  alicePublicKey: string;
  bobPrivateKey: string;
  bobPublicKey: string;
  aliceDerivedSecretHex: string;
  bobDerivedSecretHex: string;
  secretsMatch: boolean;
  derivedSessionKeyHex: string;
  durationMs: number;
}

export function generateDHKeyPair(): DHSingleParty {
  // Generate a random 256-bit exponent
  const priv = generateRandomBigInt(256);
  const pub = modPow(MODP_GROUP_14_G, priv, MODP_GROUP_14_P);
  return {
    privateKeyHex: bigIntToHex(priv),
    publicKeyHex: bigIntToHex(pub),
  };
}

export async function computeDHSharedSecret(
  myPrivateKeyHex: string,
  peerPublicKeyHex: string
): Promise<{ sharedSecretHex: string; derivedSessionKeyHex: string; durationMs: number }> {
  const t0 = performance.now();
  const priv = BigInt('0x' + myPrivateKeyHex.trim());
  const peerPub = BigInt('0x' + peerPublicKeyHex.trim());

  const shared = modPow(peerPub, priv, MODP_GROUP_14_P);
  const sharedSecretHex = bigIntToHex(shared);
  const derivedSessionKeyHex = await deriveHKDFSessionKey(sharedSecretHex);

  const durationMs = Number((performance.now() - t0).toFixed(2));
  return { sharedSecretHex, derivedSessionKeyHex, durationMs };
}

export async function simulateFullDHExchange(): Promise<DHExchangeSimulation> {
  const t0 = performance.now();

  // Alice
  const alicePriv = generateRandomBigInt(256);
  const alicePub = modPow(MODP_GROUP_14_G, alicePriv, MODP_GROUP_14_P);

  // Bob
  const bobPriv = generateRandomBigInt(256);
  const bobPub = modPow(MODP_GROUP_14_G, bobPriv, MODP_GROUP_14_P);

  // Alice computes secret with Bob's public key
  const aliceShared = modPow(bobPub, alicePriv, MODP_GROUP_14_P);

  // Bob computes secret with Alice's public key
  const bobShared = modPow(alicePub, bobPriv, MODP_GROUP_14_P);

  const aliceSecretHex = bigIntToHex(aliceShared);
  const bobSecretHex = bigIntToHex(bobShared);
  const secretsMatch = aliceSecretHex === bobSecretHex;

  const derivedSessionKeyHex = await deriveHKDFSessionKey(aliceSecretHex);
  const durationMs = Number((performance.now() - t0).toFixed(2));

  return {
    alicePrivateKey: bigIntToHex(alicePriv),
    alicePublicKey: bigIntToHex(alicePub),
    bobPrivateKey: bigIntToHex(bobPriv),
    bobPublicKey: bigIntToHex(bobPub),
    aliceDerivedSecretHex: aliceSecretHex,
    bobDerivedSecretHex: bobSecretHex,
    secretsMatch,
    derivedSessionKeyHex,
    durationMs,
  };
}
