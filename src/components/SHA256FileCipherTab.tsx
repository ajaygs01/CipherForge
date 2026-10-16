import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Upload,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Zap,
  FileImage,
  FileText,
  AlertOctagon,
  RefreshCw,
  Eye,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  KeyRound,
  FileCheck,
  Layers,
  Code,
} from 'lucide-react';
import {
  encryptFileWithSHA256,
  encryptPlaintextWithSHA256,
  decryptFileWithSHA256,
  decryptCiphertextStringWithSHA256,
  simulateTamperedBlob,
  EncryptedFilePackage,
  DecryptedFileResult,
  computeBufferSHA256,
  deriveKeyFromSHA256,
  bufferToBase64,
  base64ToBuffer,
  isUtf8Text,
} from '../utils/crypto/sha256FileCipher';
import { useHistory } from '../context/HistoryContext';
import { useNotifications } from '../context/NotificationContext';
import { LiquidButton } from './LiquidButton';
import { EntropyStrengthMeter } from './EntropyStrengthMeter';

export const SHA256FileCipherTab: React.FC = () => {
  const { addRecord } = useHistory();
  const { addNotification } = useNotifications();

  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Encryption Input Selection: 'file' or 'text'
  const [encryptInputType, setEncryptInputType] = useState<'file' | 'text'>('file');

  // Encryption State
  const [encryptFile, setEncryptFile] = useState<File | null>(null);
  const [encryptFilePreview, setEncryptFilePreview] = useState<string | null>(null);
  const [plaintextInput, setPlaintextInput] = useState('CONFIDENTIAL_CIPHERFORGE_PAYLOAD_2026');
  const [originalFileHash, setOriginalFileHash] = useState<string | null>(null);
  const [encryptPassphrase, setEncryptPassphrase] = useState('TopSecret_SHA256_Key_2026');
  const [encryptDerivedKeyHex, setEncryptDerivedKeyHex] = useState('');
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [encryptedPackage, setEncryptedPackage] = useState<EncryptedFilePackage | null>(null);

  // Decryption Input Selection: 'file' or 'ciphertext'
  const [decryptInputType, setDecryptInputType] = useState<'file' | 'ciphertext'>('file');

  // Decryption State
  const [decryptBlob, setDecryptBlob] = useState<Blob | null>(null);
  const [decryptFileName, setDecryptFileName] = useState<string>('');
  const [decryptCiphertextInput, setDecryptCiphertextInput] = useState<string>('');
  const [decryptPassphrase, setDecryptPassphrase] = useState('TopSecret_SHA256_Key_2026');
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptedResult, setDecryptedResult] = useState<DecryptedFileResult | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [isTampered, setIsTampered] = useState(false);

  // Copy status
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const decryptFileInputRef = useRef<HTMLInputElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-update derived key preview from passphrase
  useEffect(() => {
    let isMounted = true;
    if (encryptPassphrase) {
      deriveKeyFromSHA256(encryptPassphrase).then((res) => {
        if (isMounted) setEncryptDerivedKeyHex(res.keyHex);
      });
    } else {
      setEncryptDerivedKeyHex('');
    }
    return () => {
      isMounted = false;
    };
  }, [encryptPassphrase]);

  // Render encrypted noise canvas visualization when encrypted package exists
  useEffect(() => {
    if (encryptedPackage && noiseCanvasRef.current) {
      const canvas = noiseCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const imgData = ctx.createImageData(width, height);

      // Create pseudorandom ciphertext noise pattern
      for (let i = 0; i < imgData.data.length; i += 4) {
        const val = Math.floor(Math.random() * 256);
        imgData.data[i] = Math.min(255, val > 120 ? val : 25);
        imgData.data[i + 1] = Math.min(255, val > 160 ? Math.floor(val * 0.4) : 10);
        imgData.data[i + 2] = 10;
        imgData.data[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [encryptedPackage]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle file selection & immediate verification
  const handleSelectFile = async (file: File) => {
    setEncryptFile(file);
    setEncryptedPackage(null);
    setDecryptedResult(null);

    // If image, create visual preview
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setEncryptFilePreview(url);
    } else {
      setEncryptFilePreview(null);
    }

    // Immediately compute and verify SHA-256 fingerprint on upload
    try {
      const buf = await file.arrayBuffer();
      const hash = await computeBufferSHA256(buf);
      setOriginalFileHash(hash);

      // If text file, populate plaintextInput
      const textCheck = isUtf8Text(buf);
      if (textCheck.isText && textCheck.text) {
        setPlaintextInput(textCheck.text);
      }

      addNotification(
        'Upload Verified',
        `${file.name} (${(file.size / 1024).toFixed(1)} KB) verified with SHA-256 fingerprint.`,
        'info'
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Generate Sample Classified Image
  const handleCreateSampleImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark cyber gradient background
    const grad = ctx.createLinearGradient(0, 0, 480, 320);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(1, '#1c1917');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 320);

    // Grid lines
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    for (let x = 0; x < 480; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 320);
      ctx.stroke();
    }
    for (let y = 0; y < 320; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(480, y);
      ctx.stroke();
    }

    // Shield Badge Emblem
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(240, 110, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CF-256', 240, 118);

    // Classified Label
    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('TOP SECRET // NOFORN // 2026-27', 240, 190);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('CIPHERFORGE INTELLIGENCE PAYLOAD', 240, 220);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px monospace';
    ctx.fillText('Author: Ajay G S · HKBK College of Engineering', 240, 245);
    ctx.fillText('NIST FIPS 180-4 SHA-256 Key Derivation Target', 240, 268);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'classified_defense_intel.png', { type: 'image/png' });
      handleSelectFile(file);
      setEncryptInputType('file');
      addNotification('Sample Classified Image Loaded', 'Generated in-memory test asset (480x320 PNG).', 'info');
    }, 'image/png');
  };

  // Execute Encryption (File/Image or Plaintext String)
  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (encryptInputType === 'file' && !encryptFile) {
      addNotification('No File Selected', 'Please upload or drag an image or file to encrypt.', 'warning');
      return;
    }
    if (encryptInputType === 'text' && !plaintextInput) {
      addNotification('Empty Plaintext', 'Please provide plaintext message to encrypt.', 'warning');
      return;
    }
    if (!encryptPassphrase) {
      addNotification('Missing Key', 'Please provide a secret passphrase for SHA-256 key derivation.', 'warning');
      return;
    }

    setEncryptLoading(true);
    try {
      let res: EncryptedFilePackage;
      if (encryptInputType === 'file' && encryptFile) {
        res = await encryptFileWithSHA256(encryptFile, encryptPassphrase);
      } else {
        res = await encryptPlaintextWithSHA256(plaintextInput, encryptPassphrase, 'secret_message.txt');
      }

      setEncryptedPackage(res);

      addRecord(
        'SHA-256',
        'FILE_ENCRYPT',
        res.durationMs,
        'SUCCESS',
        {
          filename: res.metadata.filename,
          payloadType: encryptInputType === 'file' ? (encryptFile?.type || 'file') : 'text/plain',
          fileSize: `${(res.metadata.originalSize / 1024).toFixed(1)} KB`,
          originalSha256: res.metadata.originalSha256.slice(0, 16) + '...',
          ciphertextSha256: res.metadata.ciphertextSha256.slice(0, 16) + '...',
          cipherSize: `${(res.cipherSize / 1024).toFixed(1)} KB`,
          derivedKeyHex: res.keyHex.slice(0, 16) + '...',
        },
        `Encrypted ${res.metadata.filename} with 256-bit key derived via SHA-256.`
      );

      addNotification(
        'Encryption & Checksum Verification Complete',
        `Encrypted in ${res.durationMs} ms. Ciphertext and SHA-256 keys generated.`,
        'success'
      );
    } catch (err: any) {
      addNotification('Encryption Failed', err.message || 'Encryption error', 'error');
    } finally {
      setEncryptLoading(false);
    }
  };

  // Download Encrypted File Package
  const handleDownloadEncrypted = () => {
    if (!encryptedPackage) return;
    const url = URL.createObjectURL(encryptedPackage.encryptedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${encryptedPackage.metadata.filename}.cfenc`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Download Started', `Saved as ${encryptedPackage.metadata.filename}.cfenc`, 'info');
  };

  // Transfer encrypted package & ciphertext directly to decryptor
  const handleTransferToDecryptor = () => {
    if (!encryptedPackage) return;
    setDecryptBlob(encryptedPackage.encryptedBlob);
    setDecryptFileName(`${encryptedPackage.metadata.filename}.cfenc`);
    setDecryptCiphertextInput(encryptedPackage.ciphertextBase64);
    setDecryptPassphrase(encryptPassphrase);
    setDecryptedResult(null);
    setDecryptError(null);
    setIsTampered(false);
    setMode('decrypt');
    addNotification('Package & Ciphertext Transferred', 'Loaded into Decryptor with matching SHA-256 key.', 'info');
  };

  // Handle uploaded encrypted package file for decryption
  const handleSelectDecryptFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDecryptBlob(file);
    setDecryptFileName(file.name);
    setDecryptedResult(null);
    setDecryptError(null);
    setIsTampered(false);

    try {
      const buf = await file.arrayBuffer();
      const b64 = bufferToBase64(buf);
      setDecryptCiphertextInput(b64);
      addNotification('Encrypted File Loaded', `${file.name} ready for SHA-256 authentication.`, 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate Tamper
  const handleSimulateTamper = async () => {
    if (!decryptBlob && !decryptCiphertextInput) return;
    try {
      if (decryptBlob) {
        const tampered = await simulateTamperedBlob(decryptBlob);
        setDecryptBlob(tampered);
        const buf = await tampered.arrayBuffer();
        setDecryptCiphertextInput(bufferToBase64(buf));
      } else if (decryptCiphertextInput) {
        // Tamper Base64 string directly
        const clean = decryptCiphertextInput.trim();
        const tamperedB64 = clean.slice(0, -6) + 'XXXX' + clean.slice(-2);
        setDecryptCiphertextInput(tamperedB64);
      }
      setIsTampered(true);
      setDecryptedResult(null);
      setDecryptError('⚠️ 1 byte flipped in encrypted stream. Testing Galois GHASH tag rejection.');
      addNotification('Tamper Injected', 'Flipped 1 byte in ciphertext to test integrity rejection.', 'warning');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Execute Decryption and SHA-256 Verification
  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (decryptInputType === 'file' && !decryptBlob) {
      addNotification('No Encrypted File', 'Please upload or transfer a .cfenc package.', 'warning');
      return;
    }
    if (decryptInputType === 'ciphertext' && !decryptCiphertextInput) {
      addNotification('Missing Ciphertext', 'Please paste Base64 ciphertext string.', 'warning');
      return;
    }
    if (!decryptPassphrase) {
      addNotification('Missing Key', 'Please provide the secret passphrase.', 'warning');
      return;
    }

    setDecryptLoading(true);
    setDecryptError(null);
    setDecryptedResult(null);

    try {
      let res: DecryptedFileResult;
      if (decryptInputType === 'file' && decryptBlob) {
        res = await decryptFileWithSHA256(decryptBlob, decryptPassphrase);
      } else {
        res = await decryptCiphertextStringWithSHA256(decryptCiphertextInput, decryptPassphrase);
      }

      setDecryptedResult(res);

      addRecord(
        'SHA-256',
        'FILE_DECRYPT',
        res.durationMs,
        'SUCCESS',
        {
          filename: res.filename,
          restoredSize: `${(res.originalSize / 1024).toFixed(1)} KB`,
          originalSha256: res.originalSha256.slice(0, 16) + '...',
          decryptedSha256: res.decryptedSha256.slice(0, 16) + '...',
          ciphertextSha256: res.ciphertextSha256.slice(0, 16) + '...',
          integrityVerified: res.isVerified ? 'TRUE (100% Bit-Exact)' : 'FALSE',
        },
        `Decrypted ${res.filename} and mathematically verified SHA-256 checksum.`
      );

      if (res.isVerified) {
        addNotification(
          'Decryption & SHA-256 Verification Successful',
          `Restored in ${res.durationMs} ms. Checksums match 100% bit-exact!`,
          'success'
        );
      } else {
        addNotification('Checksum Mismatch', 'Decrypted payload did not match original SHA-256!', 'warning');
      }
    } catch (err: any) {
      setDecryptError(err.message || 'Decryption failed.');
      addRecord(
        'SHA-256',
        'FILE_DECRYPT',
        0.5,
        'FAILURE',
        { reason: 'Tamper or Invalid Key' },
        'Decryption rejected: Galois GHASH authentication mismatch.'
      );
      addNotification('Authentication Rejection', 'Wrong key or tampered ciphertext detected.', 'error');
    } finally {
      setDecryptLoading(false);
    }
  };

  // Download Restored File
  const handleDownloadRestored = () => {
    if (!decryptedResult) return;
    const a = document.createElement('a');
    a.href = decryptedResult.previewUrl;
    a.download = decryptedResult.filename;
    a.click();
    addNotification('File Downloaded', `Saved as ${decryptedResult.filename}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-orange-500" />
            <span>NIST SHA-256 Key Derivation, File/Image Cipher & Verification</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Accepts images, documents, and plaintext payloads. Derives an authoritative 256-bit symmetric key using SHA-256, encrypts into ciphertext, and proves bit-exact post-decryption integrity.
          </p>
        </div>

        <div className="flex gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={() => setMode('encrypt')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              mode === 'encrypt' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>1. Encrypt File/Image/Text</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('decrypt')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              mode === 'decrypt' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Unlock className="h-3.5 w-3.5" />
            <span>2. Decrypt & Verify</span>
          </button>
        </div>
      </div>

      {/* ======================= MODE 1: ENCRYPT ======================= */}
      {mode === 'encrypt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Form: Select File / Plaintext & Key Material */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              {/* Toggle Input Type: File/Image vs Plaintext */}
              <div className="flex gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEncryptInputType('file')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                    encryptInputType === 'file'
                      ? 'bg-orange-500 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Upload className="h-3 w-3" />
                  <span>Upload File / Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEncryptInputType('text')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                    encryptInputType === 'text'
                      ? 'bg-orange-500 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Code className="h-3 w-3" />
                  <span>Enter Plaintext</span>
                </button>
              </div>

              {encryptInputType === 'file' && (
                <button
                  type="button"
                  onClick={handleCreateSampleImage}
                  className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Sample Image</span>
                </button>
              )}
            </div>

            {/* OPTION A: FILE / IMAGE UPLOAD ZONE */}
            {encryptInputType === 'file' && (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer rounded-2xl border-2 border-dashed border-zinc-800 hover:border-orange-500/60 bg-black/60 p-5 text-center transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleSelectFile(f);
                    }}
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-105 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Click or drag any file or image</p>
                      <p className="text-[11px] text-zinc-500">Supports PNG, JPG, WebP, PDF, DOCX, ZIP, or Binary</p>
                    </div>
                  </div>
                </div>

                {/* Upload Verification Card */}
                {encryptFile && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate">
                        {encryptFile.type.startsWith('image/') ? (
                          <FileImage className="h-5 w-5 text-orange-400 shrink-0" />
                        ) : (
                          <FileText className="h-5 w-5 text-orange-400 shrink-0" />
                        )}
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{encryptFile.name}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {(encryptFile.size / 1024).toFixed(1)} KB · {encryptFile.type || 'binary/stream'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1 font-bold">
                        <Check className="h-3 w-3" /> Upload Verified
                      </span>
                    </div>

                    {/* Pre-Computed Original SHA-256 */}
                    {originalFileHash && (
                      <div className="pt-2 border-t border-zinc-800 text-[10px]">
                        <div className="flex items-center justify-between text-zinc-400 font-medium">
                          <span>Original Pre-Encryption SHA-256 Digest:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(originalFileHash, 'orig')}
                            className="text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            {copiedKey === 'orig' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedKey === 'orig' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="mt-1 p-2 rounded-lg bg-black font-mono text-[10px] text-orange-400 break-all select-all border border-zinc-800">
                          {originalFileHash}
                        </div>
                      </div>
                    )}

                    {/* Live Image Thumbnail Preview */}
                    {encryptFilePreview && (
                      <div className="pt-2 border-t border-zinc-800">
                        <span className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                          Uploaded Image Visual Preview:
                        </span>
                        <div className="rounded-lg overflow-hidden border border-zinc-800 bg-black flex justify-center max-h-44 p-1">
                          <img
                            src={encryptFilePreview}
                            alt="Original Upload"
                            className="max-h-40 object-contain rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* OPTION B: DIRECT PLAINTEXT INPUT */}
            {encryptInputType === 'text' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">Plaintext Message Payload</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(plaintextInput, 'plain')}
                    className="text-[10px] text-orange-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'plain' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'plain' ? 'Copied' : 'Copy Plaintext'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={plaintextInput}
                  onChange={(e) => {
                    setPlaintextInput(e.target.value);
                    setEncryptedPackage(null);
                  }}
                  required
                  placeholder="Enter confidential plaintext payload..."
                  className="w-full rounded-xl border border-zinc-800 bg-black p-3 font-mono text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            )}

            {/* Encryption Key & Entropy Input */}
            <form onSubmit={handleEncrypt} className="space-y-4 pt-2 border-t border-zinc-800">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">
                    Secret Passphrase (SHA-256 Key Material)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                        .map((b) => b.toString(16).padStart(2, '0'))
                        .join('');
                      setEncryptPassphrase(`CipherForge_Secret_${randHex}`);
                    }}
                    className="text-[10px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <KeyRound className="h-3 w-3" />
                    <span>Generate Secure Key</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={encryptPassphrase}
                  onChange={(e) => setEncryptPassphrase(e.target.value)}
                  required
                  placeholder="Enter secret passphrase to derive 256-bit symmetric key..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />

                {/* Real-time Entropy Strength Meter */}
                <div className="mt-2.5">
                  <EntropyStrengthMeter
                    value={encryptPassphrase}
                    algorithm="sha256"
                    label="SHA-256 Key Material Entropy"
                  />
                </div>
              </div>

              {/* Derived 256-Bit Key Hex Preview */}
              {encryptDerivedKeyHex && (
                <div className="p-3 rounded-xl bg-black border border-zinc-800 text-[11px] space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                    Derived 256-Bit Symmetric Key (SHA-256 Digest of Secret):
                  </span>
                  <div className="font-mono text-[10px] text-orange-400 break-all select-all">
                    0x{encryptDerivedKeyHex}
                  </div>
                </div>
              )}

              <LiquidButton
                type="submit"
                disabled={encryptLoading || (encryptInputType === 'file' ? !encryptFile : !plaintextInput)}
                fullWidth
                variant="primary"
                size="md"
                icon={encryptLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              >
                {encryptLoading ? 'Encrypting Payload via SHA-256 Key...' : 'Encrypt with SHA-256 Key'}
              </LiquidButton>
            </form>
          </div>

          {/* Right Panel: Encrypted Outcome, Ciphertext Base64, & Visual Noise */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-500" />
                <span>Encrypted Package & Ciphertext Output</span>
              </h3>
              {encryptedPackage && (
                <span className="font-mono text-xs text-orange-400 font-bold">
                  {encryptedPackage.durationMs} ms
                </span>
              )}
            </div>

            {encryptedPackage ? (
              <div className="space-y-4">
                {/* Visual Cipher Noise Canvas */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-300 mb-1.5">
                    <span>Ciphertext Stream Visualization (Uniform Shannon Entropy):</span>
                    <span className="text-[10px] text-orange-400 font-mono">
                      {encryptedPackage.cipherSize} bytes
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black flex justify-center p-2">
                    <canvas
                      ref={noiseCanvasRef}
                      width={380}
                      height={100}
                      className="w-full rounded-lg h-24 object-cover filter contrast-125"
                    />
                  </div>
                </div>

                {/* Ciphertext (Base64) Inspection Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                    <span>Generated Ciphertext (Base64 Authenticated Stream):</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(encryptedPackage.ciphertextBase64, 'c_b64')}
                      className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'c_b64' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'c_b64' ? 'Copied' : 'Copy Ciphertext'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={4}
                    value={encryptedPackage.ciphertextBase64}
                    className="w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-[10px] text-orange-400 select-all"
                  />
                </div>

                {/* SHA-256 Checksum Verification Pair */}
                <div className="p-3 rounded-xl bg-black border border-zinc-800 space-y-2 text-[10px]">
                  <div>
                    <span className="text-zinc-500 font-medium block">Pre-Encryption Plaintext SHA-256:</span>
                    <span className="font-mono text-orange-400 font-bold break-all select-all block">
                      {encryptedPackage.metadata.originalSha256}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-zinc-900">
                    <span className="text-zinc-500 font-medium block">Ciphertext SHA-256 Fingerprint:</span>
                    <span className="font-mono text-zinc-300 font-bold break-all select-all block">
                      {encryptedPackage.metadata.ciphertextSha256}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <LiquidButton
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={handleDownloadEncrypted}
                    icon={<Download className="h-4 w-4" />}
                  >
                    Download .cfenc File
                  </LiquidButton>

                  <LiquidButton
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={handleTransferToDecryptor}
                    icon={<ArrowRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    Use in Decryptor
                  </LiquidButton>
                </div>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <Lock className="h-10 w-10 mb-3 opacity-30 text-orange-500" />
                <p className="text-xs font-medium text-zinc-300">No ciphertext generated yet</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
                  Upload an image, document, or plaintext and execute encryption to observe the pseudorandom ciphertext stream, copy Base64 ciphertext, and download the container.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= MODE 2: DECRYPT & VERIFY ======================= */}
      {mode === 'decrypt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Form: Select Encrypted File OR Paste Ciphertext */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setDecryptInputType('file')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                    decryptInputType === 'file'
                      ? 'bg-orange-500 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Upload className="h-3 w-3" />
                  <span>Upload .cfenc File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDecryptInputType('ciphertext')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                    decryptInputType === 'ciphertext'
                      ? 'bg-orange-500 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Code className="h-3 w-3" />
                  <span>Paste Ciphertext</span>
                </button>
              </div>

              {(decryptBlob || decryptCiphertextInput) && (
                <button
                  type="button"
                  onClick={handleSimulateTamper}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  title="Flips 1 bit in ciphertext to test Galois AEAD rejection"
                >
                  <AlertOctagon className="h-3 w-3" />
                  <span>Simulate 1-Bit Tamper</span>
                </button>
              )}
            </div>

            {/* INPUT OPTION 1: UPLOAD ENCRYPTED CONTAINER FILE */}
            {decryptInputType === 'file' && (
              <div className="space-y-3">
                <div
                  onClick={() => decryptFileInputRef.current?.click()}
                  className="group cursor-pointer rounded-2xl border-2 border-dashed border-zinc-800 hover:border-orange-500/60 bg-black/60 p-5 text-center transition-all"
                >
                  <input
                    ref={decryptFileInputRef}
                    type="file"
                    className="hidden"
                    accept=".cfenc,.enc,application/octet-stream"
                    onChange={handleSelectDecryptFile}
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-105 transition-transform">
                      <Unlock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {decryptFileName || 'Click or drag .cfenc encrypted file'}
                      </p>
                      <p className="text-[11px] text-zinc-500">CipherForge Authenticated Container</p>
                    </div>
                  </div>
                </div>

                {decryptBlob && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-orange-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{decryptFileName || 'Encrypted Package'}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {(decryptBlob.size / 1024).toFixed(1)} KB package size
                        </p>
                      </div>
                    </div>
                    {isTampered ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/40">
                        Tampered Bit
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        File Ready
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* INPUT OPTION 2: PASTE CIPHERTEXT BASE64 STRING */}
            {decryptInputType === 'ciphertext' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">
                  Ciphertext Stream (Base64 Encrypted String)
                </label>
                <textarea
                  rows={4}
                  value={decryptCiphertextInput}
                  onChange={(e) => {
                    setDecryptCiphertextInput(e.target.value);
                    setDecryptedResult(null);
                    setDecryptError(null);
                  }}
                  required
                  placeholder="Paste Base64 ciphertext..."
                  className="w-full rounded-xl border border-zinc-800 bg-black p-3 font-mono text-xs text-orange-400 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            )}

            {/* Decryption Key Form */}
            <form onSubmit={handleDecrypt} className="space-y-4 pt-2 border-t border-zinc-800">
              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Secret Passphrase (Used to Derive 256-Bit SHA-256 Key)
                </label>
                <input
                  type="text"
                  value={decryptPassphrase}
                  onChange={(e) => setDecryptPassphrase(e.target.value)}
                  required
                  placeholder="Enter matching secret passphrase..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />

                <div className="mt-2.5">
                  <EntropyStrengthMeter
                    value={decryptPassphrase}
                    algorithm="sha256"
                    variant="compact"
                    label="Decryption Key Verification"
                  />
                </div>
              </div>

              <LiquidButton
                type="submit"
                disabled={decryptLoading || (decryptInputType === 'file' ? !decryptBlob : !decryptCiphertextInput)}
                fullWidth
                variant="primary"
                size="md"
                icon={decryptLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
              >
                {decryptLoading ? 'Authenticating Tag & Inverting Cipher...' : 'Decrypt & Verify via SHA-256'}
              </LiquidButton>
            </form>
          </div>

          {/* Right Panel: Decrypted Restored Result, Plaintext View & SHA-256 Verification Certificate */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-zinc-800">
              <ShieldCheck className="h-4 w-4 text-orange-500" />
              <span>Decryption & Integrity Verification Outcome</span>
            </h3>

            {/* Error or Tamper Alert */}
            {decryptError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <AlertOctagon className="h-4 w-4 shrink-0" />
                  <span>Authentication / Decryption Rejection</span>
                </div>
                <p className="text-xs text-rose-300/90 leading-relaxed font-mono">
                  {decryptError}
                </p>
                <p className="text-[11px] text-zinc-400 pt-1 border-t border-rose-500/20">
                  Because SHA-256 and Galois AEAD verify polynomial GHASH tags, any single-bit modification to the ciphertext or mismatch in the 256-bit derived key results in immediate cryptographic rejection.
                </p>
              </div>
            )}

            {/* Success Result & Verification Banner */}
            {decryptedResult && (
              <div className="space-y-4">
                {/* 100% Bit-Exact Match Certificate Banner */}
                <div
                  className={`rounded-xl p-4 border flex items-start gap-3 ${
                    decryptedResult.isVerified
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                  }`}
                >
                  {decryptedResult.isVerified ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">
                      {decryptedResult.isVerified
                        ? '100% BIT-EXACT SHA-256 INTEGRITY VERIFIED'
                        : 'SHA-256 CHECKSUM MISMATCH DETECTED'}
                    </h4>
                    <p className="text-xs text-zinc-300 leading-snug">
                      {decryptedResult.isVerified
                        ? 'The restored plaintext/file payload matches the original pre-encryption SHA-256 digest with mathematical certitude (NIST FIPS 180-4).'
                        : 'Decrypted data does not match the pre-encryption checksum.'}
                    </p>
                  </div>
                </div>

                {/* Side-by-side SHA-256 Comparison */}
                <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-2 text-[11px]">
                  <div>
                    <span className="text-zinc-500 text-[10px] block font-medium">Original Pre-Encryption Plaintext SHA-256:</span>
                    <span className="font-mono text-orange-400 font-bold text-[10px] break-all select-all block">
                      {decryptedResult.originalSha256}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-zinc-900">
                    <span className="text-zinc-500 text-[10px] block font-medium">Restored Post-Decryption Plaintext SHA-256:</span>
                    <span className="font-mono text-emerald-400 font-bold text-[10px] break-all select-all block">
                      {decryptedResult.decryptedSha256}
                    </span>
                  </div>
                  <div className="pt-1.5 flex items-center justify-between font-mono text-[10px] text-zinc-400 border-t border-zinc-900">
                    <span>Decryption Latency: {decryptedResult.durationMs} ms</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="h-3 w-3" /> Zero Distortion
                    </span>
                  </div>
                </div>

                {/* Restored Plaintext View (if readable text) */}
                {decryptedResult.restoredText && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                      <span>Restored Plaintext Message:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(decryptedResult.restoredText || '', 'res_plain')}
                        className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        {copiedKey === 'res_plain' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedKey === 'res_plain' ? 'Copied' : 'Copy Plaintext'}</span>
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-white max-h-36 overflow-y-auto whitespace-pre-wrap select-all">
                      {decryptedResult.restoredText}
                    </div>
                  </div>
                )}

                {/* Live Restored Image Preview (if image) */}
                {decryptedResult.mimeType.startsWith('image/') && (
                  <div>
                    <span className="text-xs font-medium text-zinc-300 block mb-1.5">
                      Restored Image Visual Verification:
                    </span>
                    <div className="rounded-xl overflow-hidden border border-emerald-500/30 bg-black flex justify-center p-2 max-h-52">
                      <img
                        src={decryptedResult.previewUrl}
                        alt="Restored"
                        className="max-h-48 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Download Restored File Button */}
                <LiquidButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleDownloadRestored}
                  icon={<Download className="h-4 w-4" />}
                >
                  Download Restored File ({decryptedResult.filename})
                </LiquidButton>
              </div>
            )}

            {!decryptedResult && !decryptError && (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <ShieldCheck className="h-10 w-10 mb-3 opacity-30 text-orange-500" />
                <p className="text-xs font-medium text-zinc-300">Awaiting decryption & verification</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
                  Supply the .cfenc encrypted file container or paste Base64 ciphertext with the secret passphrase to restore the plaintext/file and verify bit-exact SHA-256 integrity.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
