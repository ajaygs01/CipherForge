/**
 * SHA-256 Implementation & Avalanche Effect Analysis
 * Standard: NIST FIPS 180-4 (Secure Hash Standard)
 */

export interface HashResult {
  hashHex: string;
  durationMs: number;
  byteSize: number;
}

export interface AvalancheAnalysis {
  input1: string;
  input2: string;
  hash1Hex: string;
  hash2Hex: string;
  binary1: string;
  binary2: string;
  bitDifferences: number;
  totalBits: number;
  divergencePercentage: number;
  flippedIndices: number[];
  durationMs: number;
}

export async function hashTextSHA256(text: string): Promise<HashResult> {
  const t0 = performance.now();
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const digestBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(digestBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const durationMs = Math.max(0.01, Number((performance.now() - t0).toFixed(2)));

  return {
    hashHex,
    durationMs,
    byteSize: data.length,
  };
}

export async function hashFileSHA256(
  file: File,
  onProgress?: (progress: number) => void
): Promise<HashResult> {
  const t0 = performance.now();
  onProgress?.(10);
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(50);
  const digestBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  onProgress?.(100);

  const hashArray = Array.from(new Uint8Array(digestBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const durationMs = Math.max(0.05, Number((performance.now() - t0).toFixed(2)));

  return {
    hashHex,
    durationMs,
    byteSize: file.size,
  };
}

export function hexToBinary(hex: string): string {
  let bin = '';
  for (let i = 0; i < hex.length; i++) {
    const b = parseInt(hex[i], 16).toString(2).padStart(4, '0');
    bin += b;
  }
  return bin;
}

export async function analyzeAvalancheEffectSHA256(
  text1: string,
  text2: string
): Promise<AvalancheAnalysis> {
  const t0 = performance.now();
  const res1 = await hashTextSHA256(text1);
  const res2 = await hashTextSHA256(text2);

  const bin1 = hexToBinary(res1.hashHex);
  const bin2 = hexToBinary(res2.hashHex);

  let bitDifferences = 0;
  const flippedIndices: number[] = [];

  for (let i = 0; i < bin1.length; i++) {
    if (bin1[i] !== bin2[i]) {
      bitDifferences++;
      flippedIndices.push(i);
    }
  }

  const totalBits = bin1.length; // 256 bits
  const divergencePercentage = Number(((bitDifferences / totalBits) * 100).toFixed(2));
  const durationMs = Number((performance.now() - t0).toFixed(2));

  return {
    input1: text1,
    input2: text2,
    hash1Hex: res1.hashHex,
    hash2Hex: res2.hashHex,
    binary1: bin1,
    binary2: bin2,
    bitDifferences,
    totalBits,
    divergencePercentage,
    flippedIndices,
    durationMs,
  };
}

export function extractSha256(text: string): string | null {
  const match = text.match(/[a-fA-F0-9]{64}/);
  return match ? match[0].toLowerCase() : null;
}

export interface HashComparisonResult {
  isMatch: boolean;
  computedHash: string;
  expectedHash: string;
  charMatches: number;
  totalChars: number;
  diffIndices: number[];
}

export function compareSha256Hashes(hashA: string, hashB: string): HashComparisonResult {
  const cleanA = hashA.trim().toLowerCase();
  const cleanB = hashB.trim().toLowerCase();
  const maxLen = Math.max(cleanA.length, cleanB.length, 64);
  const diffIndices: number[] = [];
  let charMatches = 0;

  for (let i = 0; i < maxLen; i++) {
    if (i < cleanA.length && i < cleanB.length && cleanA[i] === cleanB[i]) {
      charMatches++;
    } else {
      diffIndices.push(i);
    }
  }

  return {
    isMatch: cleanA === cleanB && cleanA.length === 64,
    computedHash: cleanA,
    expectedHash: cleanB,
    charMatches,
    totalChars: 64,
    diffIndices,
  };
}
