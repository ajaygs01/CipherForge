import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuditRecord, AlgorithmType, OperationType } from '../types';

interface HistoryContextType {
  records: AuditRecord[];
  addRecord: (
    algorithm: AlgorithmType,
    operation: OperationType,
    durationMs: number,
    status: 'SUCCESS' | 'FAILURE',
    parameters?: Record<string, string | number | undefined>,
    notes?: string
  ) => AuditRecord;
  deleteRecord: (id: string) => void;
  clearHistory: () => void;
  resetToDefaults: () => void;
  stats: {
    total: number;
    successRate: number;
    avgDurationMs: number;
    algorithmCounts: Record<string, number>;
  };
}

const INITIAL_RECORDS: AuditRecord[] = [
  {
    id: 'rec_8f1a2b3c',
    algorithm: 'AES-256-GCM',
    operation: 'ENCRYPT',
    durationMs: 0.38,
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    parameters: {
      keySize: '256-bit',
      mode: 'Galois/Counter Mode (GCM)',
      ivLength: '96-bit (12 bytes)',
      tagLength: '128-bit (16 bytes)',
      kdf: 'Scrypt / PBKDF2 (100k iter)',
    },
    notes: 'Authenticated encryption roundtrip verified. GHASH authentication tag created.',
  },
  {
    id: 'rec_4c5d6e7f',
    algorithm: 'RSA-OAEP',
    operation: 'KEYGEN',
    durationMs: 88.45,
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 3600000 * 4.2).toISOString(),
    parameters: {
      modulusBits: 2048,
      publicExponent: '65537',
      format: 'PKCS#8 Private / SPKI Public',
      padding: 'OAEP-SHA256',
    },
    notes: 'Cryptographic keypair generation completed in compliance with RFC 8017.',
  },
  {
    id: 'rec_1a9b8c7d',
    algorithm: 'Diffie-Hellman',
    operation: 'KEY_EXCHANGE',
    durationMs: 18.6,
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 3600000 * 6.1).toISOString(),
    parameters: {
      group: 'RFC 3526 MODP Group 14',
      primeLength: '2048-bit safe prime',
      generator: 'g = 2',
      kdf: 'HKDF-SHA256',
    },
    notes: 'Alice and Bob shared secret successfully derived and aligned to 256-bit symmetric session key.',
  },
  {
    id: 'rec_9e8d7c6b',
    algorithm: 'SHA-256',
    operation: 'HASH_TEXT',
    durationMs: 0.04,
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 3600000 * 8.0).toISOString(),
    parameters: {
      standard: 'NIST FIPS 180-4',
      hashLength: '256-bit (64 hex characters)',
      inputSize: '1024 bytes',
    },
    notes: 'One-way deterministic hash generated with Merkle-Damgård iterative compression.',
  },
  {
    id: 'rec_3b2a1c0d',
    algorithm: 'MD5',
    operation: 'COMPARE',
    durationMs: 0.03,
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 3600000 * 12.3).toISOString(),
    parameters: {
      standard: 'RFC 1321 (Educational Only)',
      hashLength: '128-bit (32 hex characters)',
      collisionWarning: 'Active chosen-prefix vulnerability',
    },
    notes: 'Benchmarked for educational avalanche diffusion comparison. Production use disallowed.',
  },
  {
    id: 'rec_5e4d3c2b',
    algorithm: 'DES-CBC',
    operation: 'ENCRYPT',
    durationMs: 0.29,
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 3600000 * 15.5).toISOString(),
    parameters: {
      standard: 'FIPS 46-3 (Legacy Study)',
      keySize: '56-bit effective (8-byte parity)',
      blockSize: '64-bit (8 bytes)',
      padding: 'PKCS#7',
    },
    notes: 'Feistel 16-round cipher execution evaluated for cryptanalysis lecture notes.',
  },
];

import { safeStorage } from '../utils/storage';

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<AuditRecord[]>(() => {
    const saved = safeStorage.getItem('securecipher_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_RECORDS;
  });

  useEffect(() => {
    safeStorage.setItem('securecipher_history', JSON.stringify(records));
  }, [records]);

  const addRecord = (
    algorithm: AlgorithmType,
    operation: OperationType,
    durationMs: number,
    status: 'SUCCESS' | 'FAILURE',
    parameters: Record<string, string | number | undefined> = {},
    notes?: string
  ): AuditRecord => {
    const newRecord: AuditRecord = {
      id: `rec_${Math.random().toString(36).substring(2, 10)}`,
      algorithm,
      operation,
      durationMs,
      status,
      timestamp: new Date().toISOString(),
      parameters,
      notes: notes || `Operational execution for ${algorithm} ${operation}`,
    };

    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const clearHistory = () => {
    setRecords([]);
  };

  const resetToDefaults = () => {
    setRecords(INITIAL_RECORDS);
  };

  const total = records.length;
  const successCount = records.filter((r) => r.status === 'SUCCESS').length;
  const successRate = total > 0 ? Number(((successCount / total) * 100).toFixed(1)) : 100;
  const avgDurationMs =
    total > 0
      ? Number((records.reduce((acc, curr) => acc + curr.durationMs, 0) / total).toFixed(2))
      : 0;

  const algorithmCounts: Record<string, number> = {};
  records.forEach((r) => {
    algorithmCounts[r.algorithm] = (algorithmCounts[r.algorithm] || 0) + 1;
  });

  return (
    <HistoryContext.Provider
      value={{
        records,
        addRecord,
        deleteRecord,
        clearHistory,
        resetToDefaults,
        stats: {
          total,
          successRate,
          avgDurationMs,
          algorithmCounts,
        },
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within a HistoryProvider');
  return ctx;
};
