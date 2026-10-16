/**
 * Data Encryption Standard (DES-CBC) Implementation (FIPS 46-3)
 * Purpose: Historical Feistel network analysis & cryptanalysis demonstration
 * ⚠️ WARNING: DES has a 56-bit key space vulnerable to modern brute-force.
 */

// Initial Permutation (IP)
const IP = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7,
];

// Final Permutation (FP / IP-1)
const FP = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
  38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
  36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25,
];

// Expansion Table (E)
const E = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9,
  8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1,
];

// Permutation P
const P = [
  16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10,
  2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
];

// Permuted Choice 1 (PC-1)
const PC1 = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
];

// Permuted Choice 2 (PC-2)
const PC2 = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10,
  23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2,
  41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
];

// Schedule of Left Shifts for Subkey Generation
const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

// 8 Substitution Boxes (S-Boxes)
const S_BOXES = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
  ],
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
  ],
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
  ],
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
  ],
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
  ],
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
  ],
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
  ],
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
  ],
];

function permute(bits: number[], table: number[]): number[] {
  return table.map((pos) => bits[pos - 1]);
}

function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    for (let j = 7; j >= 0; j--) {
      bits.push((bytes[i] >> j) & 1);
    }
  }
  return bits;
}

function bitsToBytes(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(bits.length / 8);
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i + j];
    }
    bytes[i / 8] = byte;
  }
  return bytes;
}

function generateSubkeys(keyBits: number[]): number[][] {
  const permutedKey = permute(keyBits, PC1);
  let c = permutedKey.slice(0, 28);
  let d = permutedKey.slice(28, 56);
  const subkeys: number[][] = [];

  for (let i = 0; i < 16; i++) {
    const shift = SHIFTS[i];
    c = c.slice(shift).concat(c.slice(0, shift));
    d = d.slice(shift).concat(d.slice(0, shift));
    const cd = c.concat(d);
    subkeys.push(permute(cd, PC2));
  }
  return subkeys;
}

function feistel(r: number[], subkey: number[]): number[] {
  const expanded = permute(r, E);
  const xored = expanded.map((bit, idx) => bit ^ subkey[idx]);
  const sOutputBits: number[] = [];

  for (let s = 0; s < 8; s++) {
    const block = xored.slice(s * 6, (s + 1) * 6);
    const row = (block[0] << 1) | block[5];
    const col = (block[1] << 3) | (block[2] << 2) | (block[3] << 1) | block[4];
    const val = S_BOXES[s][row][col];
    for (let j = 3; j >= 0; j--) {
      sOutputBits.push((val >> j) & 1);
    }
  }
  return permute(sOutputBits, P);
}

function processBlock(blockBits: number[], subkeys: number[][]): number[] {
  const permuted = permute(blockBits, IP);
  let l = permuted.slice(0, 32);
  let r = permuted.slice(32, 64);

  for (let round = 0; round < 16; round++) {
    const nextR = l.map((bit, idx) => bit ^ feistel(r, subkeys[round])[idx]);
    l = r;
    r = nextR;
  }

  // Pre-output swap
  const rl = r.concat(l);
  return permute(rl, FP);
}

function padPKCS7(data: Uint8Array): Uint8Array {
  const padLength = 8 - (data.length % 8);
  const padded = new Uint8Array(data.length + padLength);
  padded.set(data, 0);
  padded.fill(padLength, data.length);
  return padded;
}

function unpadPKCS7(data: Uint8Array): Uint8Array {
  if (data.length === 0 || data.length % 8 !== 0) {
    throw new Error('Invalid padded DES block size');
  }
  const padLength = data[data.length - 1];
  if (padLength < 1 || padLength > 8) {
    throw new Error('Invalid PKCS#7 padding bytes');
  }
  for (let i = data.length - padLength; i < data.length; i++) {
    if (data[i] !== padLength) {
      throw new Error('Corrupted PKCS#7 padding pattern');
    }
  }
  return data.slice(0, data.length - padLength);
}

function normalizeKey(keyStr: string): Uint8Array {
  const enc = new TextEncoder();
  const bytes = enc.encode(keyStr);
  const keyBytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    keyBytes[i] = i < bytes.length ? bytes[i] : 0x00;
  }
  return keyBytes;
}

export interface DESResult {
  ciphertextBase64: string;
  ivBase64: string;
  keyUsedHex: string;
  durationMs: number;
}

export function encryptDESCBC(plaintext: string, keyStr: string): DESResult {
  const t0 = performance.now();
  const enc = new TextEncoder();
  const plainBytes = enc.encode(plaintext);
  const paddedBytes = padPKCS7(plainBytes);

  const keyBytes = normalizeKey(keyStr);
  const keyBits = bytesToBits(keyBytes);
  const subkeys = generateSubkeys(keyBits);

  // Generate 8-byte (64-bit) IV
  const ivBytes = crypto.getRandomValues(new Uint8Array(8));
  let prevCipherBlock: Uint8Array<any> = ivBytes;

  const resultBytes = new Uint8Array(paddedBytes.length);

  for (let offset = 0; offset < paddedBytes.length; offset += 8) {
    const plainBlock = paddedBytes.slice(offset, offset + 8);
    // XOR with prevCipherBlock (CBC mode)
    const xorBlock = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      xorBlock[i] = plainBlock[i] ^ prevCipherBlock[i];
    }
    const cipherBits = processBlock(bytesToBits(xorBlock), subkeys);
    const cipherBlock = bitsToBytes(cipherBits);
    resultBytes.set(cipherBlock, offset);
    prevCipherBlock = cipherBlock;
  }

  const durationMs = Math.max(0.1, Number((performance.now() - t0).toFixed(2)));

  let binaryCipher = '';
  for (let i = 0; i < resultBytes.length; i++) {
    binaryCipher += String.fromCharCode(resultBytes[i]);
  }
  let binaryIv = '';
  for (let i = 0; i < ivBytes.length; i++) {
    binaryIv += String.fromCharCode(ivBytes[i]);
  }

  let keyHex = '';
  for (let i = 0; i < keyBytes.length; i++) {
    keyHex += keyBytes[i].toString(16).padStart(2, '0');
  }

  return {
    ciphertextBase64: btoa(binaryCipher),
    ivBase64: btoa(binaryIv),
    keyUsedHex: keyHex,
    durationMs,
  };
}

export function decryptDESCBC(ciphertextBase64: string, ivBase64: string, keyStr: string): { plaintext: string; durationMs: number } {
  const t0 = performance.now();
  const binaryCipher = atob(ciphertextBase64.trim());
  const cipherBytes = new Uint8Array(binaryCipher.length);
  for (let i = 0; i < binaryCipher.length; i++) {
    cipherBytes[i] = binaryCipher.charCodeAt(i);
  }

  const binaryIv = atob(ivBase64.trim());
  const ivBytes = new Uint8Array(binaryIv.length);
  for (let i = 0; i < binaryIv.length; i++) {
    ivBytes[i] = binaryIv.charCodeAt(i);
  }

  const keyBytes = normalizeKey(keyStr);
  const keyBits = bytesToBits(keyBytes);
  // Reverse subkeys for decryption
  const subkeys = generateSubkeys(keyBits).reverse();

  const decryptedPaddedBytes = new Uint8Array(cipherBytes.length);
  let prevCipherBlock: Uint8Array<any> = ivBytes;

  for (let offset = 0; offset < cipherBytes.length; offset += 8) {
    const cipherBlock = cipherBytes.slice(offset, offset + 8);
    const decryptedBits = processBlock(bytesToBits(cipherBlock), subkeys);
    const decryptedBlock = bitsToBytes(decryptedBits);

    // XOR with prevCipherBlock (CBC mode)
    const plainBlock = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      plainBlock[i] = decryptedBlock[i] ^ prevCipherBlock[i];
    }
    decryptedPaddedBytes.set(plainBlock, offset);
    prevCipherBlock = cipherBlock;
  }

  const unpadded = unpadPKCS7(decryptedPaddedBytes);
  const dec = new TextDecoder();
  const plaintext = dec.decode(unpadded);
  const durationMs = Math.max(0.1, Number((performance.now() - t0).toFixed(2)));

  return { plaintext, durationMs };
}
