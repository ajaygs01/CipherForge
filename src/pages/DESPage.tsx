import React, { useState } from 'react';
import {
  AlertTriangle,
  Lock,
  Unlock,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { encryptDESCBC, decryptDESCBC, DESResult } from '../utils/crypto/des';
import { useHistory } from '../context/HistoryContext';
import { useNotifications } from '../context/NotificationContext';
import { LiquidButton } from '../components/LiquidButton';
import { EntropyStrengthMeter } from '../components/EntropyStrengthMeter';

export const DESPage: React.FC = () => {
  const { addRecord } = useHistory();
  const { addNotification } = useNotifications();

  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Encrypt state
  const [plaintext, setPlaintext] = useState('LegacyBankingProtocol_1995');
  const [desKey, setDesKey] = useState('Secret8B'); // 8 characters = 64 bits (56-bit effective)
  const [encryptResult, setEncryptResult] = useState<DESResult | null>(null);

  // Decrypt state
  const [decCiphertext, setDecCiphertext] = useState('');
  const [decIv, setDecIv] = useState('');
  const [decKey, setDecKey] = useState('Secret8B');
  const [decResult, setDecResult] = useState<string | null>(null);
  const [decError, setDecError] = useState<string | null>(null);

  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleEncrypt = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = encryptDESCBC(plaintext, desKey);
      setEncryptResult(res);

      setDecCiphertext(res.ciphertextBase64);
      setDecIv(res.ivBase64);
      setDecKey(desKey);

      addRecord(
        'DES-CBC',
        'ENCRYPT',
        res.durationMs,
        'SUCCESS',
        {
          keyBits: '56-bit effective (64-bit input)',
          blockSize: '64-bit (8 bytes)',
          mode: 'CBC with PKCS#7',
          ivLength: '64-bit (8 bytes)',
        },
        '16-round Feistel DES execution evaluated for educational purposes.'
      );

      addNotification('DES-CBC Encrypted (Legacy)', `Processed in ${res.durationMs} ms.`, 'info');
    } catch (err: any) {
      addNotification('DES Encrypt Failed', err.message || 'Key must be exactly 8 characters', 'error');
    }
  };

  const handleDecrypt = (e: React.FormEvent) => {
    e.preventDefault();
    setDecError(null);
    setDecResult(null);

    try {
      const res = decryptDESCBC(decCiphertext, decIv, decKey);
      setDecResult(res.plaintext);

      addRecord(
        'DES-CBC',
        'DECRYPT',
        res.durationMs,
        'SUCCESS',
        { mode: 'CBC', padding: 'PKCS#7 unpadded' },
        'DES-CBC plaintext recovered.'
      );
      addNotification('DES-CBC Decrypted', `Decrypted in ${res.durationMs} ms.`, 'success');
    } catch (err: any) {
      setDecError(err.message);
      addRecord('DES-CBC', 'DECRYPT', 0.3, 'FAILURE');
      addNotification('DES Decrypt Failed', err.message || 'Decryption failed', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Warning Header */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-semibold">
          <span>FIPS PUB 46-3 (WITHDRAWN)</span>
          <span>·</span>
          <span>56-BIT KEY SPACE</span>
          <span>·</span>
          <span>16-ROUND FEISTEL CIPHER</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold text-white">
          Data Encryption Standard (DES-CBC)
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Historical 64-bit symmetric block cipher with 16 Feistel rounds. Demonstrates differential and linear cryptanalysis vulnerabilities.
        </p>
      </div>

      {/* Security Advisory */}
      <div className="rounded-2xl border border-orange-500/40 bg-orange-950/20 p-5 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-orange-400">ACADEMIC NOTICE: 56-BIT EFFECTIVE KEY INSECURITY</h4>
          <p className="text-zinc-300 leading-relaxed">
            In 1999, the Electronic Frontier Foundation (EFF) built Deep Crack to exhaust the entire 2<sup>56</sup> DES key space in under 22 hours. NIST formally withdrew FIPS 46-3 in 2005. CipherForge includes this implementation exclusively to study Feistel networks, initial/final permutations, and S-Boxes.
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit">
        <button
          onClick={() => setMode('encrypt')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            mode === 'encrypt' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Encrypt (Plaintext → DES-CBC Ciphertext)</span>
        </button>
        <button
          onClick={() => setMode('decrypt')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            mode === 'decrypt' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Unlock className="h-3.5 w-3.5" />
          <span>Decrypt (DES-CBC Ciphertext → Plaintext)</span>
        </button>
      </div>

      {/* ENCRYPT MODE */}
      {mode === 'encrypt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-orange-500" />
              <span>DES Encryption Parameters</span>
            </h3>

            <form onSubmit={handleEncrypt} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Plaintext Message</label>
                <textarea
                  rows={4}
                  value={plaintext}
                  onChange={(e) => setPlaintext(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 font-mono text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">56-Bit Secret Key (8 Characters / 64 bits input)</label>
                <input
                  type="text"
                  maxLength={8}
                  value={desKey}
                  onChange={(e) => setDesKey(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 font-mono text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  placeholder="8 characters"
                />

                {/* Real-time DES Entropy Strength Meter */}
                <div className="mt-2.5">
                  <EntropyStrengthMeter
                    value={desKey}
                    algorithm="des"
                    label="DES-56 Keyspace Entropy & Parity Meter"
                  />
                </div>
              </div>

              <LiquidButton
                type="submit"
                fullWidth
                variant="primary"
                size="md"
                icon={<Zap className="h-3.5 w-3.5" />}
              >
                Execute 16-Round DES-CBC Encryption
              </LiquidButton>
            </form>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Encrypted DES Blocks</h3>
              {encryptResult && (
                <span className="font-mono text-xs text-orange-400 font-bold">{encryptResult.durationMs} ms</span>
              )}
            </div>

            {encryptResult ? (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
                    <span>Ciphertext (Base64)</span>
                    <button
                      onClick={() => copyToClipboard(encryptResult.ciphertextBase64, 'des_c')}
                      className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedLabel === 'des_c' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="mt-1 p-3 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-orange-400 font-bold break-all select-all">
                    {encryptResult.ciphertextBase64}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
                    <span>64-Bit Random IV (Base64)</span>
                    <button
                      onClick={() => copyToClipboard(encryptResult.ivBase64, 'des_iv')}
                      className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedLabel === 'des_iv' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="mt-1 p-3 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-white font-bold break-all select-all">
                    {encryptResult.ivBase64}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-zinc-800 text-[11px] text-zinc-300">
                  <span>Effective 56-bit Key Hex:</span> <span className="font-mono text-orange-400 font-bold">0x{encryptResult.keyUsedHex}</span>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <Lock className="h-8 w-8 mb-2 opacity-40 text-orange-500" />
                <p className="text-xs text-zinc-400">Provide a plaintext and key to execute DES-CBC.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DECRYPT MODE */}
      {mode === 'decrypt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Unlock className="h-4 w-4 text-orange-500" />
              <span>DES Decryption Parameters</span>
            </h3>

            <form onSubmit={handleDecrypt} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-zinc-300">Ciphertext (Base64)</label>
                <textarea
                  rows={3}
                  value={decCiphertext}
                  onChange={(e) => setDecCiphertext(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 font-mono text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">64-Bit IV (Base64)</label>
                  <input
                    type="text"
                    value={decIv}
                    onChange={(e) => setDecIv(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300">Key (8 Chars)</label>
                  <input
                    type="text"
                    maxLength={8}
                    value={decKey}
                    onChange={(e) => setDecKey(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                  <div className="mt-1.5">
                    <EntropyStrengthMeter
                      value={decKey}
                      algorithm="des"
                      variant="compact"
                    />
                  </div>
                </div>
              </div>

              <LiquidButton
                type="submit"
                fullWidth
                variant="primary"
                size="md"
                icon={<Unlock className="h-3.5 w-3.5" />}
              >
                Decrypt DES-CBC Blocks
              </LiquidButton>
            </form>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Decrypted Plaintext</h3>
            {decError && (
              <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300">
                {decError}
              </div>
            )}
            {decResult && (
              <div className="p-4 rounded-xl border border-orange-500/40 bg-orange-950/20 space-y-2">
                <span className="text-xs font-bold text-orange-400">Plaintext Restored:</span>
                <div className="p-3 rounded-lg bg-black font-mono text-xs text-white break-all font-semibold border border-zinc-800">
                  {decResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 16-Round Feistel Structure Diagram */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3 text-xs text-zinc-400">
        <h4 className="font-bold text-white text-xs">Feistel Network Architecture (FIPS 46-3):</h4>
        <p className="leading-relaxed">
          DES processes a 64-bit plaintext block by splitting it into 32-bit left (L) and right (R) halves across 16 symmetric rounds. In each round:
        </p>
        <div className="p-3.5 bg-black rounded-xl font-mono text-orange-400 text-xs space-y-1 border border-zinc-800">
          <p>L[i] = R[i-1]</p>
          <p>R[i] = L[i-1] ⊕ f(R[i-1], K[i])</p>
          <p className="text-zinc-300 text-[11px] pt-1">Round function f applies: E-Expansion (32→48 bits) → XOR with 48-bit subkey K[i] → 8 S-Boxes (6→4 bits) → P-Permutation (32 bits).</p>
        </div>
      </div>
    </div>
  );
};
