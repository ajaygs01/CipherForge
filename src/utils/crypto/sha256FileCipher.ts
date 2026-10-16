/**
 * SHA-256 File & Image Cipher Engine
 * Standard: NIST FIPS 180-4 (SHA-256 Key Derivation & Integrity Verification)
 * Authenticated Encryption: AES-256-GCM (NIST SP 800-38D)
 */

export interface EncryptedFilePackage {
  metadata: {
    version: number;
    filename: string;
    mimeType: string;
    originalSize: number;
    originalSha256: string;
    ciphertextSha256: string;
    ivHex: string;
    saltHex: string;
    timestamp: string;
  };
  encryptedBlob: Blob;
  ciphertextBase64: string;
  ciphertextHexPreview: string;
  cipherSize: number;
  durationMs: number;
  keyHex: string;
}

export interface DecryptedFileResult {
  restoredFile: File;
  previewUrl: string;
  mimeType: string;
  filename: string;
  originalSize: number;
  originalSha256: string;
  decryptedSha256: string;
  ciphertextSha256: string;
  isVerified: boolean;
  restoredText: string | null;
  durationMs: number;
  keyHex: string;
}

// Magic bytes for CipherForge Encrypted Package
export const MAGIC_BYTES = new Uint8Array([0x43, 0x46, 0x45, 0x4e, 0x43, 0x31, 0x00]); // "CFENC1\0"

/**
 * Fast chunked ArrayBuffer to Base64 encoder
 */
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  const chunkSize = 0x8000; // 32KB
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize))));
  }
  return btoa(chunks.join(''));
}

/**
 * Base64 to ArrayBuffer decoder
 */
export function base64ToBuffer(base64: string): ArrayBuffer {
  // Clean whitespace or linebreaks
  const clean = base64.trim().replace(/\s+/g, '');
  const binaryString = atob(clean);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Test if a buffer contains valid printable UTF-8 text
 */
export function isUtf8Text(buffer: ArrayBuffer): { isText: boolean; text: string | null } {
  try {
    const dec = new TextDecoder('utf-8', { fatal: true });
    // Sample first 32KB if large
    const sample = buffer.byteLength > 32768 ? buffer.slice(0, 32768) : buffer;
    const text = dec.decode(sample);
    // Ensure no control characters except \r, \n, \t
    let nonPrintable = 0;
    for (let i = 0; i < Math.min(1000, text.length); i++) {
      const code = text.charCodeAt(i);
      if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
        nonPrintable++;
      }
    }
    if (nonPrintable > 5) return { isText: false, text: null };
    return { isText: true, text: dec.decode(buffer) };
  } catch {
    return { isText: false, text: null };
  }
}

/**
 * Derives a pristine 256-bit symmetric CryptoKey using SHA-256
 */
export async function deriveKeyFromSHA256(
  passphrase: string,
  saltBytes?: Uint8Array
): Promise<{ cryptoKey: CryptoKey; keyHex: string; rawKeyBuffer: ArrayBuffer }> {
  const enc = new TextEncoder();
  const passData = enc.encode(passphrase);

  let combinedData: Uint8Array;
  if (saltBytes && saltBytes.length > 0) {
    combinedData = new Uint8Array(passData.length + saltBytes.length);
    combinedData.set(passData, 0);
    combinedData.set(saltBytes, passData.length);
  } else {
    combinedData = passData;
  }

  // Digest with SHA-256 to produce exactly 32 bytes (256 bits)
  const sha256Buffer = await crypto.subtle.digest('SHA-256', combinedData as unknown as BufferSource);
  const hashArray = Array.from(new Uint8Array(sha256Buffer));
  const keyHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // Import as AES-GCM 256-bit key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    sha256Buffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  return { cryptoKey, keyHex, rawKeyBuffer: sha256Buffer };
}

/**
 * Computes SHA-256 hash of an ArrayBuffer
 */
export async function computeBufferSHA256(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Encrypts any File or Image using a SHA-256 derived 256-bit key and AES-GCM
 */
export async function encryptFileWithSHA256(
  file: File,
  passphrase: string,
  onProgress?: (progress: number) => void
): Promise<EncryptedFilePackage> {
  const t0 = performance.now();
  onProgress?.(10);

  // 1. Read file ArrayBuffer
  const fileBuffer = await file.arrayBuffer();
  onProgress?.(30);

  // 2. Compute SHA-256 checksum of original file for subsequent verification
  const originalSha256 = await computeBufferSHA256(fileBuffer);
  onProgress?.(50);

  // 3. Generate 16-byte random salt and 12-byte random IV (96-bit for GCM)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 4. Derive 256-bit key using SHA-256
  const { cryptoKey, keyHex } = await deriveKeyFromSHA256(passphrase, salt);
  onProgress?.(70);

  // 5. Encrypt with AES-GCM (includes 128-bit GHASH authentication tag)
  const enc = new TextEncoder();
  const aad = enc.encode(`${file.name}|${file.type}|${originalSha256}`);
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: aad,
      tagLength: 128,
    },
    cryptoKey,
    fileBuffer
  );
  onProgress?.(85);

  const ciphertextSha256 = await computeBufferSHA256(ciphertextBuffer);

  // 6. Build structured binary container with metadata header
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join('');

  const metadata = {
    version: 1,
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    originalSize: file.size,
    originalSha256,
    ciphertextSha256,
    ivHex,
    saltHex,
    timestamp: new Date().toISOString(),
  };

  const metadataJson = JSON.stringify(metadata);
  const metadataBytes = enc.encode(metadataJson);

  // Header format: [7 bytes magic][4 bytes header length (big-endian)][metadata JSON bytes][ciphertext + 16-byte tag]
  const headerLen = metadataBytes.length;
  const headerLenBuffer = new ArrayBuffer(4);
  new DataView(headerLenBuffer).setUint32(0, headerLen, false);

  const containerBlob = new Blob(
    [MAGIC_BYTES, headerLenBuffer, metadataBytes, ciphertextBuffer],
    { type: 'application/octet-stream' }
  );

  const fullContainerBuffer = await containerBlob.arrayBuffer();
  const ciphertextBase64 = bufferToBase64(fullContainerBuffer);

  // Ciphertext hex preview (first 128 hex chars of actual ciphertext)
  const firstBytes = new Uint8Array(ciphertextBuffer.slice(0, 64));
  const ciphertextHexPreview = Array.from(firstBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const durationMs = Math.max(0.1, Number((performance.now() - t0).toFixed(2)));
  onProgress?.(100);

  return {
    metadata,
    encryptedBlob: containerBlob,
    ciphertextBase64,
    ciphertextHexPreview,
    cipherSize: containerBlob.size,
    durationMs,
    keyHex,
  };
}

/**
 * Encrypts direct Plaintext string using SHA-256 derived key and AES-GCM
 */
export async function encryptPlaintextWithSHA256(
  plaintext: string,
  passphrase: string,
  filename: string = 'secret_payload.txt'
): Promise<EncryptedFilePackage> {
  const enc = new TextEncoder();
  const bytes = enc.encode(plaintext);
  const file = new File([bytes], filename, { type: 'text/plain;charset=utf-8' });
  return encryptFileWithSHA256(file, passphrase);
}

/**
 * Decrypts and verifies an encrypted package using the SHA-256 derived key
 */
export async function decryptFileWithSHA256(
  encryptedBlobOrBuffer: Blob | ArrayBuffer,
  passphrase: string,
  onProgress?: (progress: number) => void
): Promise<DecryptedFileResult> {
  const t0 = performance.now();
  onProgress?.(15);

  const fullBuffer =
    encryptedBlobOrBuffer instanceof ArrayBuffer
      ? encryptedBlobOrBuffer
      : await encryptedBlobOrBuffer.arrayBuffer();

  const fullBytes = new Uint8Array(fullBuffer);
  onProgress?.(30);

  // 1. Verify Magic Bytes
  if (fullBytes.length < 11) {
    throw new Error('Invalid file format: file too small to contain CipherForge header.');
  }

  for (let i = 0; i < MAGIC_BYTES.length; i++) {
    if (fullBytes[i] !== MAGIC_BYTES[i]) {
      throw new Error('Invalid format: File does not contain valid CipherForge encryption header.');
    }
  }

  // 2. Read Metadata Header Length
  const headerLenView = new DataView(fullBuffer, MAGIC_BYTES.length, 4);
  const headerLen = headerLenView.getUint32(0, false);
  const headerStart = MAGIC_BYTES.length + 4;
  const headerEnd = headerStart + headerLen;

  if (fullBytes.length < headerEnd) {
    throw new Error('Corrupted encryption header: unexpected end of file.');
  }

  // 3. Parse Metadata JSON
  const dec = new TextDecoder();
  const metadataJson = dec.decode(fullBytes.subarray(headerStart, headerEnd));
  const metadata = JSON.parse(metadataJson);
  onProgress?.(50);

  // 4. Extract Salt & IV
  const salt = new Uint8Array(
    metadata.saltHex.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16))
  );
  const iv = new Uint8Array(
    metadata.ivHex.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16))
  );

  // 5. Derive 256-bit key from SHA-256
  const { cryptoKey, keyHex } = await deriveKeyFromSHA256(passphrase, salt);
  onProgress?.(65);

  // 6. Decrypt Ciphertext with AES-GCM
  const ciphertextBytes = fullBytes.subarray(headerEnd);
  const ciphertextSha256 = await computeBufferSHA256(ciphertextBytes.buffer as ArrayBuffer);

  const enc = new TextEncoder();
  const aad = enc.encode(`${metadata.filename}|${metadata.mimeType}|${metadata.originalSha256}`);

  let decryptedBuffer: ArrayBuffer;
  try {
    decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: aad,
        tagLength: 128,
      },
      cryptoKey,
      ciphertextBytes
    );
  } catch (err: any) {
    throw new Error(
      'Authentication Failure: The secret key is incorrect, or the file has been tampered with (GHASH tag verification failed).'
    );
  }
  onProgress?.(85);

  // 7. Verify Integrity via SHA-256 Checksum
  const decryptedSha256 = await computeBufferSHA256(decryptedBuffer);
  const isVerified = decryptedSha256.toLowerCase() === metadata.originalSha256.toLowerCase();
  onProgress?.(100);

  const restoredBlob = new Blob([decryptedBuffer], { type: metadata.mimeType });
  const restoredFile = new File([restoredBlob], metadata.filename, {
    type: metadata.mimeType,
  });
  const previewUrl = URL.createObjectURL(restoredBlob);
  const durationMs = Math.max(0.1, Number((performance.now() - t0).toFixed(2)));

  // Detect text content
  const textInfo = isUtf8Text(decryptedBuffer);

  return {
    restoredFile,
    previewUrl,
    mimeType: metadata.mimeType,
    filename: metadata.filename,
    originalSize: metadata.originalSize,
    originalSha256: metadata.originalSha256,
    decryptedSha256,
    ciphertextSha256,
    isVerified,
    restoredText: textInfo.isText ? textInfo.text : null,
    durationMs,
    keyHex,
  };
}

/**
 * Decrypts a Base64 string container using SHA-256 derived key
 */
export async function decryptCiphertextStringWithSHA256(
  base64String: string,
  passphrase: string
): Promise<DecryptedFileResult> {
  const buffer = base64ToBuffer(base64String);
  return decryptFileWithSHA256(buffer, passphrase);
}

/**
 * Tamper demonstration helper: flips 1 byte inside the ciphertext payload
 */
export async function simulateTamperedBlob(originalEncryptedBlob: Blob): Promise<Blob> {
  const buffer = await originalEncryptedBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // Find offset in ciphertext (after magic + 4-byte length + header)
  const headerLenView = new DataView(buffer, MAGIC_BYTES.length, 4);
  const headerLen = headerLenView.getUint32(0, false);
  const cipherStart = MAGIC_BYTES.length + 4 + headerLen;

  if (bytes.length > cipherStart + 4) {
    // Flip bits of byte at cipherStart + 2
    bytes[cipherStart + 2] ^= 0xff;
  }

  return new Blob([bytes], { type: 'application/octet-stream' });
}
