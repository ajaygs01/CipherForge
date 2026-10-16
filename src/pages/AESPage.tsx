import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertOctagon,
  RefreshCw,
  Zap,
  Upload,
  Download,
  FileImage,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { encryptAESGCM, decryptAESGCM } from '../utils/crypto/aes';
import { hashTextSHA256 } from '../utils/crypto/sha256';
import { useHistory } from '../context/HistoryContext';
import { useNotifications } from '../context/NotificationContext';
import { LiquidButton } from '../components/LiquidButton';
import { EntropyStrengthMeter } from '../components/EntropyStrengthMeter';

export const AESPage: React.FC = () => {
  const { addRecord } = useHistory();
  const { addNotification } = useNotifications();

  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Encryption states
  const [plaintext, setPlaintext] = useState('TopSecretFinancialReport_Q4_2026');
  const [passphrase, setPassphrase] = useState('SuperStrongPassphrase#2026');
  const [aad, setAad] = useState('Metadata:Account_ID_9941');
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [encryptResult, setEncryptResult] = useState<{
    ciphertext: string;
    iv: string;
    tag: string;
    salt: string;
    durationMs: number;
  } | null>(null);

  // Decryption states
  const [decCiphertext, setDecCiphertext] = useState('');
  const [decIv, setDecIv] = useState('');
  const [decTag, setDecTag] = useState('');
  const [decSalt, setDecSalt] = useState('');
  const [decPassphrase, setDecPassphrase] = useState('');
  const [decAad, setDecAad] = useState('');
  const [decLoading, setDecLoading] = useState(false);
  const [decResult, setDecResult] = useState<string | null>(null);
  const [decError, setDecError] = useState<string | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // File and Image Upload State for AES
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    sha256: string;
  } | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const handleFileUploadAES = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          setPlaintext(dataUrl);
          setUploadedImagePreview(dataUrl);
          const hashRes = await hashTextSHA256(dataUrl);
          setUploadedFile({
            name: file.name,
            size: file.size,
            type: file.type,
            sha256: hashRes.hashHex,
          });
          addNotification('Image Uploaded & Verified', `${file.name} loaded and SHA-256 fingerprinted.`, 'info');
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = async () => {
          const text = reader.result as string;
          setPlaintext(text);
          setUploadedImagePreview(null);
          const hashRes = await hashTextSHA256(text);
          setUploadedFile({
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            sha256: hashRes.hashHex,
          });
          addNotification('File Uploaded & Verified', `${file.name} loaded and SHA-256 fingerprinted.`, 'info');
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setEncryptLoading(true);
    try {
      const res = await encryptAESGCM(plaintext, passphrase, aad);
      setEncryptResult(res);

      // Pre-fill decryption form for convenience
      setDecCiphertext(res.ciphertext);
      setDecIv(res.iv);
      setDecTag(res.tag);
      setDecSalt(res.salt);
      setDecPassphrase(passphrase);
      setDecAad(aad);

      // Log telemetry (Zero-knowledge: No plaintexts/secrets stored)
      addRecord(
        'AES-256-GCM',
        'ENCRYPT',
        res.durationMs,
        'SUCCESS',
        {
          keySize: '256-bit',
          mode: 'GCM (AEAD)',
          ivBytes: '12 bytes (96-bit)',
          tagBytes: '16 bytes (128-bit)',
          saltBytes: '16 bytes (128-bit)',
        },
        'AES-256-GCM encryption with Scrypt/PBKDF2 key derivation and random 96-bit IV.'
      );

      addNotification('AES-256-GCM Encryption Complete', `Executed in ${res.durationMs} ms with 128-bit GHASH tag.`, 'success');
    } catch (err: any) {
      addRecord('AES-256-GCM', 'ENCRYPT', 0.5, 'FAILURE');
      addNotification('Encryption Failed', err.message || 'Key derivation or encryption error', 'error');
    } finally {
      setEncryptLoading(false);
    }
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setDecLoading(true);
    setDecError(null);
    setDecResult(null);

    try {
      const res = await decryptAESGCM(
        decCiphertext,
        decIv,
        decTag,
        decSalt,
        decPassphrase,
        decAad
      );
      setDecResult(res.plaintext);

      addRecord(
        'AES-256-GCM',
        'DECRYPT',
        res.durationMs,
        'SUCCESS',
        {
          keySize: '256-bit',
          mode: 'GCM (AEAD)',
          tagVerified: 'True (GHASH Match)',
        },
        'Authentication tag successfully verified. Plaintext recovered.'
      );

      addNotification('AES-256-GCM Decryption Succeeded', `Authentication tag verified in ${res.durationMs} ms.`, 'success');
    } catch (err: any) {
      setDecError(err.message);
      addRecord(
        'AES-256-GCM',
        'DECRYPT',
        0.4,
        'FAILURE',
        { tagVerified: 'False (Tamper Detected)' },
        'Tag verification failed: data modified or incorrect key.'
      );
      addNotification('AES-256-GCM Verification Failure', 'Galois GHASH tag mismatch detected!', 'warning');
    } finally {
      setDecLoading(false);
    }
  };

  // Tamper demonstration
  const handleTamperTest = () => {
    if (!decCiphertext) return;
    // Flip a character in the ciphertext
    const firstChar = decCiphertext.charAt(0);
    const flippedChar = firstChar === 'A' ? 'B' : 'A';
    const tampered = flippedChar + decCiphertext.slice(1);
    setDecCiphertext(tampered);
    setDecError('⚠️ Tamper Simulation: 1 character in the ciphertext buffer was modified. Click "Decrypt & Verify AEAD Tag" to observe GHASH failure.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Standard Header */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-semibold">
          <span>NIST FIPS 197</span>
          <span>·</span>
          <span>NIST SP 800-38D</span>
          <span>·</span>
          <span>RFC 7914 (SCRYPT KDF)</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold text-white">
          AES-256-GCM Authenticated Encryption Workbench
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Galois/Counter Mode (GCM) combines CTR confidentiality with Galois field GF(2¹²⁸) GHASH authentication tags, providing Authenticated Encryption with Associated Data (AEAD).
        </p>
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
          <span>Encrypt (Plaintext → Ciphertext + GHASH Tag)</span>
        </button>
        <button
          onClick={() => setMode('decrypt')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            mode === 'decrypt' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Unlock className="h-3.5 w-3.5" />
          <span>Decrypt & Verify AEAD Tag</span>
        </button>
      </div>

      {/* ENCRYPT MODE */}
      {mode === 'encrypt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-orange-500" />
              <span>Input Parameters</span>
            </h3>

            <form onSubmit={handleEncrypt} className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">Plaintext to Encrypt</label>
                  <label className="cursor-pointer text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold">
                    <Upload className="h-3 w-3" />
                    <span>Upload Image or File</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUploadAES}
                    />
                  </label>
                </div>

                {/* Uploaded File Verification Card */}
                {uploadedFile && (
                  <div className="mt-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      {uploadedFile.type.startsWith('image/') ? (
                        <FileImage className="h-4 w-4 text-orange-400 shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-orange-400 shrink-0" />
                      )}
                      <span className="font-bold text-white truncate">{uploadedFile.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ({(uploadedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 shrink-0 font-bold">
                      <Check className="h-3 w-3" /> SHA-256: {uploadedFile.sha256.slice(0, 8)}...
                    </span>
                  </div>
                )}

                {/* Image Preview Thumbnail */}
                {uploadedImagePreview && (
                  <div className="mt-1.5 rounded-lg overflow-hidden border border-zinc-800 bg-black flex justify-center max-h-36 p-1">
                    <img src={uploadedImagePreview} alt="Uploaded" className="max-h-32 object-contain rounded" />
                  </div>
                )}

                <textarea
                  rows={4}
                  value={plaintext}
                  onChange={(e) => {
                    setPlaintext(e.target.value);
                    setUploadedFile(null);
                    setUploadedImagePreview(null);
                  }}
                  required
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none font-mono"
                  placeholder="Enter confidential text payload..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Secret Passphrase (Key Material)</label>
                <input
                  type="text"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none font-mono"
                  placeholder="Passphrase used by Scrypt/PBKDF2 KDF"
                />
                
                {/* Real-Time Key Entropy Strength Meter */}
                <div className="mt-2.5">
                  <EntropyStrengthMeter
                    value={passphrase}
                    algorithm="aes"
                    label="AES-256 Key Derivation Entropy Meter"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Associated Authenticated Data (AAD) <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={aad}
                  onChange={(e) => setAad(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none font-mono"
                  placeholder="Authenticated metadata (not encrypted, but integrity-protected)"
                />
              </div>

              <div className="pt-2">
                <LiquidButton
                  type="submit"
                  disabled={encryptLoading}
                  fullWidth
                  variant="primary"
                  size="md"
                  icon={encryptLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                >
                  {encryptLoading ? 'Executing AES-256-GCM Engine...' : 'Execute Authenticated AES-256-GCM Encryption'}
                </LiquidButton>
              </div>
            </form>
          </div>

          {/* Output Panel */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-500" />
                <span>Ciphertext & Authentication Buffers</span>
              </h3>
              {encryptResult && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-white bg-zinc-900 border border-orange-500/40 px-2.5 py-0.5 rounded-lg">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span>{encryptResult.durationMs} ms</span>
                </div>
              )}
            </div>

            {encryptResult ? (
              <div className="space-y-3.5">
                {/* Ciphertext */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                    <span>Ciphertext (Base64)</span>
                    <button
                      onClick={() => copyToClipboard(encryptResult.ciphertext, 'cipher')}
                      className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'cipher' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'cipher' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="mt-1 p-2.5 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-orange-400 break-all select-all">
                    {encryptResult.ciphertext}
                  </div>
                </div>

                {/* IV */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                    <span>96-Bit Initialization Vector (IV / Nonce)</span>
                    <button
                      onClick={() => copyToClipboard(encryptResult.iv, 'iv')}
                      className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'iv' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'iv' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="mt-1 p-2 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-zinc-200 break-all select-all">
                    {encryptResult.iv}
                  </div>
                </div>

                {/* Tag */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                    <span>128-Bit GHASH Authentication Tag</span>
                    <button
                      onClick={() => copyToClipboard(encryptResult.tag, 'tag')}
                      className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'tag' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'tag' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="mt-1 p-2 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-white font-bold break-all select-all">
                    {encryptResult.tag}
                  </div>
                </div>

                {/* Salt */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                    <span>16-Byte KDF Salt</span>
                    <button
                      onClick={() => copyToClipboard(encryptResult.salt, 'salt')}
                      className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'salt' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'salt' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="mt-1 p-2 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-zinc-400 break-all select-all">
                    {encryptResult.salt}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setMode('decrypt')}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  >
                    Switch to Decrypt Mode →
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <Lock className="h-8 w-8 mb-2 opacity-40 text-orange-500" />
                <p className="text-xs">Configure parameters and click Execute to generate AES-256-GCM ciphertext.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DECRYPT MODE */}
      {mode === 'decrypt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Unlock className="h-4 w-4 text-orange-500" />
                <span>Ciphertext & Authentication Verification</span>
              </h3>
              <button
                type="button"
                onClick={handleTamperTest}
                className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                title="Flips 1 character in ciphertext to test GHASH tamper rejection"
              >
                <AlertOctagon className="h-3 w-3" />
                <span>Simulate Tamper (Bit Flip)</span>
              </button>
            </div>

            <form onSubmit={handleDecrypt} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-zinc-300">Ciphertext (Base64)</label>
                <textarea
                  rows={2}
                  value={decCiphertext}
                  onChange={(e) => setDecCiphertext(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none font-mono"
                  placeholder="Paste Base64 ciphertext..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">96-Bit IV (Base64)</label>
                  <input
                    type="text"
                    value={decIv}
                    onChange={(e) => setDecIv(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2 text-xs text-white font-mono"
                    placeholder="IV Base64"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300">128-Bit Tag (Base64)</label>
                  <input
                    type="text"
                    value={decTag}
                    onChange={(e) => setDecTag(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2 text-xs text-orange-400 font-mono"
                    placeholder="Tag Base64"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Salt (Base64)</label>
                  <input
                    type="text"
                    value={decSalt}
                    onChange={(e) => setDecSalt(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2 text-xs text-zinc-300 font-mono"
                    placeholder="Salt Base64"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300">Passphrase</label>
                  <input
                    type="text"
                    value={decPassphrase}
                    onChange={(e) => setDecPassphrase(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2 text-xs text-white font-mono"
                    placeholder="Secret Passphrase"
                  />
                  <div className="mt-1.5">
                    <EntropyStrengthMeter
                      value={decPassphrase}
                      algorithm="aes"
                      variant="compact"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Associated Authenticated Data (AAD)</label>
                <input
                  type="text"
                  value={decAad}
                  onChange={(e) => setDecAad(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2 text-xs text-white font-mono"
                  placeholder="Optional matching AAD"
                />
              </div>

              <LiquidButton
                type="submit"
                disabled={decLoading}
                fullWidth
                variant="primary"
                size="md"
                icon={decLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
              >
                {decLoading ? 'Authenticating Galois Tag...' : 'Decrypt & Authenticate AEAD Tag'}
              </LiquidButton>
            </form>
          </div>

          {/* Decrypt Result Panel */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-orange-500" />
              <span>Decryption Verification Outcome</span>
            </h3>

            {decError && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <AlertOctagon className="h-4 w-4" />
                  <span>Tamper Detected / Authentication Tag Failure!</span>
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed font-mono">{decError}</p>
                <p className="text-[11px] text-zinc-400">
                  Because AES-GCM is an authenticated cipher (AEAD), any single flipped bit in ciphertext, tag, IV, or AAD causes immediate rejection, preventing chosen-ciphertext and padding oracle attacks.
                </p>
              </div>
            )}

            {decResult && (
              <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
                    <Check className="h-4 w-4" />
                    <span>GHASH Tag Matched · Plaintext Restored</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(decResult, 'result')}
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'result' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'result' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg border border-zinc-800 bg-black font-mono text-xs text-white break-all max-h-40 overflow-y-auto select-all">
                  {decResult}
                </div>

                {/* Restored Image Preview & Download */}
                {decResult.startsWith('data:image/') && (
                  <div className="pt-2 border-t border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Restored Image Visual Verification
                      </span>
                      <a
                        href={decResult}
                        download={uploadedFile?.name || 'restored_image.png'}
                        className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Download className="h-3 w-3" /> Download Restored Image
                      </a>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-emerald-500/30 bg-black flex justify-center p-2 max-h-48">
                      <img src={decResult} alt="Restored" className="max-h-44 object-contain rounded" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {!decResult && !decError && (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <Unlock className="h-8 w-8 mb-2 opacity-40 text-orange-500" />
                <p className="text-xs">Enter ciphertext parameters and click Decrypt to authenticate and verify.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cryptographic Architecture Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2 text-xs text-zinc-400">
        <h4 className="font-bold text-white text-xs">Mathematical & Algorithmic Design (NIST FIPS 197 / SP 800-38D):</h4>
        <p className="leading-relaxed">
          AES-256 uses a 256-bit key operating across 14 rounds of SubBytes (GF(2⁸) S-Box), ShiftRows, MixColumns, and AddRoundKey. In Galois/Counter Mode (GCM), counter encryption is unified with Galois polynomial multiplication over GF(2¹²⁸) via GHASH. This guarantees authenticated encryption with associated data (AEAD), defeating bit-flipping attacks. Passphrases are hardened against ASIC brute-force using Scrypt/PBKDF2.
        </p>
      </div>
    </div>
  );
};
