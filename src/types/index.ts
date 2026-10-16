export type AlgorithmType =
  | 'AES-256-GCM'
  | 'RSA-OAEP'
  | 'Diffie-Hellman'
  | 'SHA-256'
  | 'MD5'
  | 'DES-CBC';

export type OperationType =
  | 'ENCRYPT'
  | 'DECRYPT'
  | 'KEYGEN'
  | 'HASH_TEXT'
  | 'HASH_FILE'
  | 'FILE_ENCRYPT'
  | 'FILE_DECRYPT'
  | 'KEY_EXCHANGE'
  | 'COMPARE';

export interface AuditRecord {
  id: string;
  algorithm: AlgorithmType;
  operation: OperationType;
  durationMs: number;
  status: 'SUCCESS' | 'FAILURE';
  timestamp: string; // ISO string, formatted as IST
  parameters: {
    keySize?: string;
    mode?: string;
    ivLength?: string;
    tagLength?: string;
    saltLength?: string;
    fileSize?: string;
    inputSize?: string;
    modulusBits?: number;
    hashLength?: string;
    group?: string;
    [key: string]: string | number | undefined;
  };
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  github?: string;
  college: string;
  department: string;
  isVerified: boolean;
  memberSince: string;
  totalOperations: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface BenchmarkStat {
  algorithm: AlgorithmType;
  operation: string;
  keySize: string;
  standard: string;
  avgLatencyMs: number;
  securityStatus: 'NIST Approved' | 'Recommended' | 'Standard' | 'Secure' | 'Broken / Deprecated' | 'Legacy';
}
