/**
 * RSA-OAEP Implementation (2048-bit & 3072-bit Modulus)
 * Standard: RFC 8017 (PKCS #1 v2.2) with SHA-256 OAEP padding
 */

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64.trim().replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function formatPem(base64: string, type: 'PUBLIC KEY' | 'PRIVATE KEY'): string {
  const lines = base64.match(/.{1,64}/g) || [base64];
  return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`;
}

export function cleanPem(pem: string): string {
  return pem
    .replace(/-----BEGIN [A-Z\s]+-----/g, '')
    .replace(/-----END [A-Z\s]+-----/g, '')
    .replace(/[\r\n\s]/g, '');
}

export interface RSAKeyPairResult {
  publicKeyPem: string;
  privateKeyPem: string;
  modulusLength: number;
  durationMs: number;
}

export async function generateRSAKeyPair(
  modulusLength: 2048 | 3072 = 2048
): Promise<RSAKeyPairResult> {
  const t0 = performance.now();

  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const spkiBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const pkcs8Buffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const publicKeyPem = formatPem(arrayBufferToBase64(spkiBuffer), 'PUBLIC KEY');
  const privateKeyPem = formatPem(arrayBufferToBase64(pkcs8Buffer), 'PRIVATE KEY');

  const durationMs = Number((performance.now() - t0).toFixed(2));

  return {
    publicKeyPem,
    privateKeyPem,
    modulusLength,
    durationMs,
  };
}

export async function encryptRSA(
  publicKeyPem: string,
  plaintext: string
): Promise<{ ciphertext: string; durationMs: number }> {
  const t0 = performance.now();
  const cleaned = cleanPem(publicKeyPem);
  const spkiBuffer = base64ToArrayBuffer(cleaned);

  const publicKey = await crypto.subtle.importKey(
    'spki',
    spkiBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );

  const enc = new TextEncoder();
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    enc.encode(plaintext)
  );

  const durationMs = Number((performance.now() - t0).toFixed(2));

  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    durationMs,
  };
}

export async function decryptRSA(
  privateKeyPem: string,
  ciphertextBase64: string
): Promise<{ plaintext: string; durationMs: number }> {
  const t0 = performance.now();
  const cleanedKey = cleanPem(privateKeyPem);
  const pkcs8Buffer = base64ToArrayBuffer(cleanedKey);

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pkcs8Buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt']
  );

  const cipherBuffer = base64ToArrayBuffer(ciphertextBase64);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      cipherBuffer
    );
    const dec = new TextDecoder();
    const plaintext = dec.decode(decryptedBuffer);
    const durationMs = Number((performance.now() - t0).toFixed(2));
    return { plaintext, durationMs };
  } catch {
    throw new Error('RSA Decryption Failed! Invalid private key, damaged ciphertext, or mismatched padding.');
  }
}
