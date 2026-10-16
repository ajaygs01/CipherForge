/**
 * AES-256-GCM Implementation with Scrypt/PBKDF2 Key Derivation
 * Standards: NIST FIPS 197 / NIST SP 800-38D / RFC 7914
 */

export interface AESEncryptResult {
  ciphertext: string; // Base64
  iv: string; // Base64 (12 bytes / 96-bit)
  tag: string; // Base64 (16 bytes / 128-bit)
  salt: string; // Base64 (16 bytes)
  durationMs: number;
}

export interface AESDecryptResult {
  plaintext: string;
  durationMs: number;
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptAESGCM(
  plaintext: string,
  passphrase: string,
  additionalData?: string
): Promise<AESEncryptResult> {
  const t0 = performance.now();

  const enc = new TextEncoder();
  const plaintextBytes = enc.encode(plaintext);

  // Generate 16 bytes salt and 12 bytes IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(passphrase, salt);

  const gcmParams: AesGcmParams = {
    name: 'AES-GCM',
    iv: iv,
    tagLength: 128,
  };

  if (additionalData && additionalData.trim().length > 0) {
    gcmParams.additionalData = enc.encode(additionalData) as BufferSource;
  }

  // WebCrypto AES-GCM appends the 16-byte tag to the ciphertext
  const encryptedBuffer = await crypto.subtle.encrypt(gcmParams, key, plaintextBytes);
  const encryptedBytes = new Uint8Array(encryptedBuffer);

  // Split ciphertext and tag
  const tagLengthBytes = 16;
  const ciphertextBytes = encryptedBytes.slice(0, encryptedBytes.length - tagLengthBytes);
  const tagBytes = encryptedBytes.slice(encryptedBytes.length - tagLengthBytes);

  const durationMs = Math.max(0.1, Number((performance.now() - t0).toFixed(2)));

  return {
    ciphertext: bufferToBase64(ciphertextBytes),
    iv: bufferToBase64(iv),
    tag: bufferToBase64(tagBytes),
    salt: bufferToBase64(salt),
    durationMs,
  };
}

export async function decryptAESGCM(
  ciphertextBase64: string,
  ivBase64: string,
  tagBase64: string,
  saltBase64: string,
  passphrase: string,
  additionalData?: string
): Promise<AESDecryptResult> {
  const t0 = performance.now();

  const salt = base64ToBuffer(saltBase64);
  const iv = base64ToBuffer(ivBase64);
  const ciphertext = base64ToBuffer(ciphertextBase64);
  const tag = base64ToBuffer(tagBase64);

  // Combine ciphertext and tag for WebCrypto
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext, 0);
  combined.set(tag, ciphertext.length);

  const key = await deriveKey(passphrase, salt);

  const gcmParams: AesGcmParams = {
    name: 'AES-GCM',
    iv: iv as BufferSource,
    tagLength: 128,
  };

  if (additionalData && additionalData.trim().length > 0) {
    const enc = new TextEncoder();
    gcmParams.additionalData = enc.encode(additionalData) as BufferSource;
  }

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(gcmParams, key, combined as BufferSource);
    const dec = new TextDecoder();
    const plaintext = dec.decode(decryptedBuffer);
    const durationMs = Math.max(0.1, Number((performance.now() - t0).toFixed(2)));
    return { plaintext, durationMs };
  } catch {
    throw new Error(
      'Authentication Tag Verification Failed! Data has been corrupted, tampered with, or invalid passphrase.'
    );
  }
}
