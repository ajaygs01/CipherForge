/**
 * Cryptographic Entropy Evaluation Engine
 * Calculates Shannon entropy, pool diversity, keyspace bits, and brute-force complexity.
 */

export interface EntropyAnalysis {
  shannonEntropy: number; // Bits per character (0 - 8)
  totalEntropyBits: number; // Total information entropy bits
  score: number; // Normalized 0 - 100 percentage
  strength: 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERY_STRONG';
  strengthLabel: string;
  colorClass: string;
  barColorClass: string;
  crackTimeEstimate: string;
  guessesRequired: string;
  charsetPoolSize: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigits: boolean;
  hasSymbols: boolean;
  hasMinLength: boolean; // >= 8 chars
  isRecommendedLength: boolean; // >= 14 chars
  hasRepetition: boolean;
  feedback: string[];
  algorithmWarning?: string;
}

export type AlgorithmContext = 'aes' | 'des' | 'rsa' | 'dh' | 'sha256' | 'md5' | 'general';

/**
 * Known weak and semi-weak DES 64-bit keys (expressed as hex or ASCII equivalents)
 */
const WEAK_DES_KEYS = [
  '0101010101010101',
  'fefefefefefefefe',
  'e0e0e0e0f1f1f1f1',
  '1f1f1f1f0e0e0e0e',
  '0000000000000000',
  'ffffffffffffffff',
];

/**
 * Evaluates the cryptographic entropy of a user-provided secret, key, or passphrase.
 */
export function calculateEntropy(
  secret: string,
  algorithm: AlgorithmContext = 'general'
): EntropyAnalysis {
  if (!secret || secret.length === 0) {
    return {
      shannonEntropy: 0,
      totalEntropyBits: 0,
      score: 0,
      strength: 'VERY_WEAK',
      strengthLabel: 'Empty (0 Bits)',
      colorClass: 'text-zinc-500',
      barColorClass: 'bg-zinc-700',
      crackTimeEstimate: 'Instant (< 1 ms)',
      guessesRequired: '1',
      charsetPoolSize: 0,
      hasUppercase: false,
      hasLowercase: false,
      hasDigits: false,
      hasSymbols: false,
      hasMinLength: false,
      isRecommendedLength: false,
      hasRepetition: false,
      feedback: ['Enter a secret key or passphrase to evaluate cryptographic entropy.'],
    };
  }

  const length = secret.length;

  // 1. Character set pool detection
  const hasLower = /[a-z]/.test(secret);
  const hasUpper = /[A-Z]/.test(secret);
  const hasDigits = /[0-9]/.test(secret);
  const hasSymbols = /[^a-zA-Z0-9]/.test(secret);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigits) poolSize += 10;
  if (hasSymbols) poolSize += 33; // standard ASCII punctuation symbols

  // 2. Shannon Entropy: H = -sum(p_i * log2(p_i))
  const frequencies = new Map<string, number>();
  for (const char of secret) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }

  let shannonEntropy = 0;
  for (const count of frequencies.values()) {
    const p = count / length;
    shannonEntropy -= p * Math.log2(p);
  }

  // 3. Information Entropy (Bits) with repetition and pattern adjustments
  const uniqueChars = frequencies.size;
  const uniquenessRatio = uniqueChars / length;
  const hasRepetition = uniquenessRatio < 0.65 && length > 4;

  // Raw theoretical entropy = length * log2(poolSize)
  const theoreticalEntropy = poolSize > 1 ? length * Math.log2(poolSize) : length;

  // Penalize consecutive sequential patterns (e.g. "1234", "abcd", "qwerty")
  let patternPenalty = 0;
  const lowerSecret = secret.toLowerCase();
  const sequentialPatterns = ['123', '234', '345', '456', '567', '678', '789', 'abc', 'bcd', 'cde', 'def', 'qwe', 'asd'];
  for (const pat of sequentialPatterns) {
    if (lowerSecret.includes(pat)) {
      patternPenalty += 4;
    }
  }

  // Penalize character repeats (e.g., "aaaaa")
  let repeatPenalty = 0;
  for (let i = 0; i < secret.length - 1; i++) {
    if (secret[i] === secret[i + 1]) {
      repeatPenalty += 2;
    }
  }

  // Total adjusted entropy bits
  let totalEntropyBits = Math.max(
    1,
    Math.round(theoreticalEntropy * Math.min(1, uniquenessRatio + 0.15) - patternPenalty - repeatPenalty)
  );

  // DES Algorithm Constraint Override:
  // DES is architecturally bounded at 56 effective bits due to 8 parity bits discarded by PC-1
  let algorithmWarning: string | undefined;
  if (algorithm === 'des') {
    if (totalEntropyBits > 56) {
      totalEntropyBits = 56;
    }
    // Check for weak DES keys
    const cleanHex = secret.toLowerCase().replace(/[^0-9a-f]/g, '');
    if (WEAK_DES_KEYS.some((wk) => cleanHex.startsWith(wk) || wk.startsWith(cleanHex))) {
      algorithmWarning = 'CRITICAL: Known weak DES key pattern detected! Sub-keys produce identical round keys.';
      totalEntropyBits = Math.min(totalEntropyBits, 12);
    } else {
      algorithmWarning = 'DES keyspace is capped at 56 effective bits. 8 parity bits are discarded by permutation PC-1.';
    }
  } else if (algorithm === 'aes') {
    if (totalEntropyBits < 64) {
      algorithmWarning = 'Recommended: Use >= 64 bits of entropy to ensure Scrypt/PBKDF2 key stretching resists GPU clusters.';
    }
  } else if (algorithm === 'rsa') {
    algorithmWarning = 'RSA asymmetric security depends on 2048/3072-bit modulus factorization resistance (NIST SP 800-57).';
  } else if (algorithm === 'md5') {
    algorithmWarning = 'Preimage resistance warning: Low-entropy plaintexts are vulnerable to rainbow table inversion in MD5.';
  }

  // 4. Normalized score (0 - 100%)
  // 80+ bits is considered modern cryptographic baseline for passwords
  let score = Math.min(100, Math.round((totalEntropyBits / 85) * 100));

  // 5. Strength Classification & Crack Time Estimation
  let strength: EntropyAnalysis['strength'] = 'VERY_WEAK';
  let strengthLabel = 'Very Weak';
  let colorClass = 'text-rose-500';
  let barColorClass = 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
  let crackTimeEstimate = 'Instant (< 1 second)';
  let guessesRequired = '2^16 operations';

  if (totalEntropyBits < 28) {
    strength = 'VERY_WEAK';
    strengthLabel = 'Very Weak (< 28 Bits)';
    colorClass = 'text-rose-500';
    barColorClass = 'bg-rose-500';
    crackTimeEstimate = 'Instant (< 1 ms @ 10B/s)';
    guessesRequired = `~${(2 ** Math.min(24, totalEntropyBits)).toLocaleString()} guesses`;
  } else if (totalEntropyBits < 45) {
    strength = 'WEAK';
    strengthLabel = 'Weak (28–44 Bits)';
    colorClass = 'text-amber-500';
    barColorClass = 'bg-amber-500';
    crackTimeEstimate = 'Few seconds to minutes';
    guessesRequired = `~2^${totalEntropyBits} guesses`;
  } else if (totalEntropyBits < 64) {
    strength = 'MODERATE';
    strengthLabel = 'Moderate (45–63 Bits)';
    colorClass = 'text-yellow-400';
    barColorClass = 'bg-yellow-400';
    crackTimeEstimate = 'Several days to months';
    guessesRequired = `~2^${totalEntropyBits} guesses`;
  } else if (totalEntropyBits < 85) {
    strength = 'STRONG';
    strengthLabel = 'Strong (64–84 Bits)';
    colorClass = 'text-emerald-400';
    barColorClass = 'bg-emerald-400';
    crackTimeEstimate = 'Thousands of years';
    guessesRequired = `~2^${totalEntropyBits} guesses`;
  } else {
    strength = 'VERY_STRONG';
    strengthLabel = 'Military-Grade (85+ Bits)';
    colorClass = 'text-orange-400';
    barColorClass = 'bg-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.8)]';
    crackTimeEstimate = 'Billions of years (Resistant to Supercomputers)';
    guessesRequired = `> 2^85 operations`;
  }

  // 6. Actionable Feedback recommendations
  const feedback: string[] = [];
  if (length < 8) {
    feedback.push('Increase length to at least 8 characters (14+ recommended).');
  }
  if (!hasUpper) {
    feedback.push('Add uppercase characters (A-Z) to widen the search alphabet.');
  }
  if (!hasDigits) {
    feedback.push('Include numeric digits (0-9).');
  }
  if (!hasSymbols) {
    feedback.push('Incorporate punctuation or symbols (!@#$%^&*).');
  }
  if (hasRepetition) {
    feedback.push('Eliminate repetitive character runs or predictable keyboard sequences.');
  }

  return {
    shannonEntropy: Number(shannonEntropy.toFixed(2)),
    totalEntropyBits,
    score,
    strength,
    strengthLabel,
    colorClass,
    barColorClass,
    crackTimeEstimate,
    guessesRequired,
    charsetPoolSize: poolSize,
    hasUppercase: hasUpper,
    hasLowercase: hasLower,
    hasDigits,
    hasSymbols,
    hasMinLength: length >= 8,
    isRecommendedLength: length >= 14,
    hasRepetition,
    feedback,
    algorithmWarning,
  };
}
