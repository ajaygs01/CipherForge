import React, { useState } from 'react';
import {
  Hash,
  Upload,
  Copy,
  Check,
  Zap,
  Activity,
  FileCheck,
  CheckCircle2,
  XCircle,
  Lock,
  FileImage,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  hashTextSHA256,
  hashFileSHA256,
  analyzeAvalancheEffectSHA256,
  AvalancheAnalysis,
  extractSha256,
  compareSha256Hashes,
  HashComparisonResult,
} from '../utils/crypto/sha256';
import { useHistory } from '../context/HistoryContext';
import { useNotifications } from '../context/NotificationContext';
import { LiquidButton } from '../components/LiquidButton';
import { EntropyStrengthMeter } from '../components/EntropyStrengthMeter';
import { SHA256FileCipherTab } from '../components/SHA256FileCipherTab';

export const SHA256Page: React.FC = () => {
  const { addRecord } = useHistory();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'cipher' | 'text' | 'file' | 'verify' | 'avalanche'>('cipher');

  // Text Hash
  const [textInput, setTextInput] = useState('CipherForge_Cryptographic_Security_Suite_2026');
  const [textHash, setTextHash] = useState('');
  const [textDuration, setTextDuration] = useState<number | null>(null);

  // File Hash Tab
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [quickVerifyExpected, setQuickVerifyExpected] = useState('');

  // Checksum Verify & File Authenticity Verification Tab
  const [verifyMode, setVerifyMode] = useState<'file' | 'manual'>('file');
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyFilePreview, setVerifyFilePreview] = useState<string | null>(null);
  const [verifyFileHash, setVerifyFileHash] = useState('');
  const [verifyFileDuration, setVerifyFileDuration] = useState<number | null>(null);
  const [verifyFileLoading, setVerifyFileLoading] = useState(false);
  const [candidateHash, setCandidateHash] = useState('');
  const [expectedHash, setExpectedHash] = useState('');
  const [checksumFileName, setChecksumFileName] = useState<string | null>(null);

  // Avalanche Explorer
  const [avalancheInput1, setAvalancheInput1] = useState('CipherForge2026');
  const [avalancheInput2, setAvalancheInput2] = useState('CipherForge2027');
  const [avalancheResult, setAvalancheResult] = useState<AvalancheAnalysis | null>(null);

  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleHashText = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await hashTextSHA256(textInput);
    setTextHash(res.hashHex);
    setTextDuration(res.durationMs);

    addRecord(
      'SHA-256',
      'HASH_TEXT',
      res.durationMs,
      'SUCCESS',
      {
        standard: 'NIST FIPS 180-4',
        hashLength: '256-bit (64 hex characters)',
        inputBytes: res.byteSize,
      },
      'Deterministic 256-bit SHA-256 hash digest generated.'
    );
    addNotification('SHA-256 Digest Computed', `Computed in ${res.durationMs} ms.`, 'success');
  };

  const handleHashFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileLoading(true);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSelectedFilePreview(url);
    } else {
      setSelectedFilePreview(null);
    }

    try {
      const res = await hashFileSHA256(file);
      setFileHash(res.hashHex);
      setFileDuration(res.durationMs);

      addRecord(
        'SHA-256',
        'HASH_FILE',
        res.durationMs,
        'SUCCESS',
        {
          standard: 'NIST FIPS 180-4',
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileName: file.name,
          mimeType: file.type || 'binary/stream',
        },
        'Streamed file SHA-256 hash computed.'
      );
      addNotification('File SHA-256 Digest Ready', `${file.name} hashed in ${res.durationMs} ms.`, 'success');
    } catch (err: any) {
      addNotification('File Hashing Error', err.message || 'Failed to hash file', 'error');
    } finally {
      setFileLoading(false);
    }
  };

  const handleQuickUploadChecksumFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const extracted = extractSha256(text);
      if (extracted) {
        setQuickVerifyExpected(extracted);
        addNotification('Authoritative Checksum Loaded', `Extracted SHA-256 from ${file.name}`, 'info');
      } else {
        addNotification('Invalid Checksum File', 'No 64-character hex found in file.', 'warning');
      }
    } catch (err) {
      addNotification('Read Error', 'Could not parse checksum file.', 'error');
    }
  };

  const handleQuickSimulateTamper = () => {
    if (!fileHash) {
      addNotification('No File Hash', 'Please upload a file first.', 'warning');
      return;
    }
    const base = quickVerifyExpected || fileHash;
    const lastChar = base[base.length - 1];
    const flippedChar = lastChar === '0' ? 'f' : (lastChar === 'f' ? 'e' : '0');
    const tampered = base.slice(0, -1) + flippedChar;
    setQuickVerifyExpected(tampered);
    addNotification('Simulated Corruption', 'Flipped last hex character of expected checksum to simulate corruption.', 'warning');
  };

  const handleTransferFileToVerifier = () => {
    if (!selectedFile || !fileHash) return;
    setVerifyFile(selectedFile);
    setVerifyFileHash(fileHash);
    setVerifyFileDuration(fileDuration);
    setCandidateHash(fileHash);
    setVerifyFilePreview(selectedFilePreview);
    if (quickVerifyExpected) {
      setExpectedHash(quickVerifyExpected);
    }
    setVerifyMode('file');
    setActiveTab('verify');
    addNotification('Transferred to Verifier', 'Opened in Deep Integrity Verifier tab.', 'info');
  };

  const handleSelectVerifyFile = async (file: File) => {
    setVerifyFile(file);
    setVerifyFileLoading(true);
    setVerifyFileHash('');
    setVerifyFileDuration(null);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setVerifyFilePreview(url);
    } else {
      setVerifyFilePreview(null);
    }

    try {
      const res = await hashFileSHA256(file);
      setVerifyFileHash(res.hashHex);
      setVerifyFileDuration(res.durationMs);
      setCandidateHash(res.hashHex);
      addNotification(
        'File Hashed for Verification',
        `Computed SHA-256 for ${file.name} in ${res.durationMs} ms.`,
        'success'
      );
    } catch (err: any) {
      addNotification('Hashing Error', err.message || 'Failed to hash file', 'error');
    } finally {
      setVerifyFileLoading(false);
    }
  };

  const handleLoadSampleVerifyFile = () => {
    const content = 'Official Ubuntu 24.04 LTS Kernel Package // Verified by Canonical Security 2026-27';
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const file = new File([blob], 'ubuntu-24.04-verified-package.tar.gz', {
      type: 'application/octet-stream',
    });
    handleSelectVerifyFile(file);
    hashTextSHA256(content).then((res) => {
      setExpectedHash(res.hashHex);
      addNotification('Sample Verified Package Loaded', 'Loaded sample package with exact matching checksum.', 'info');
    });
  };

  const handleUploadChecksumFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setChecksumFileName(file.name);
    try {
      const text = await file.text();
      const extracted = extractSha256(text);
      if (extracted) {
        setExpectedHash(extracted);
        addNotification('Checksum Imported', `Extracted 64-char SHA-256 from ${file.name}`, 'info');
      } else {
        addNotification('Invalid Checksum File', 'No 64-character SHA-256 hex found in file.', 'warning');
      }
    } catch (err) {
      addNotification('Read Error', 'Could not read checksum file.', 'error');
    }
  };

  const handleSimulateTamperExpected = () => {
    const base = activeCandidate || expectedHash;
    if (!base || base.length < 64) {
      addNotification('Cannot Tamper', 'Upload a file or enter candidate hash first.', 'warning');
      return;
    }
    // Flip last character
    const lastChar = base[base.length - 1];
    const flippedChar = lastChar === '0' ? 'f' : (lastChar === 'f' ? 'e' : '0');
    const tampered = base.slice(0, -1) + flippedChar;
    setExpectedHash(tampered);
    addNotification('Simulated Corruption', 'Altered last hex character to simulate corrupted/tampered file.', 'warning');
  };

  const handleRunAvalanche = async (e: React.FormEvent) => {
    e.preventDefault();
    const analysis = await analyzeAvalancheEffectSHA256(avalancheInput1, avalancheInput2);
    setAvalancheResult(analysis);

    addRecord(
      'SHA-256',
      'COMPARE',
      analysis.durationMs,
      'SUCCESS',
      {
        divergencePercentage: `${analysis.divergencePercentage}%`,
        flippedBits: `${analysis.bitDifferences}/256`,
      },
      'Avalanche effect empirical bit divergence analyzed.'
    );
  };

  const activeCandidate = verifyMode === 'file' ? verifyFileHash : candidateHash;
  const comparisonResult: HashComparisonResult | null =
    activeCandidate && expectedHash ? compareSha256Hashes(activeCandidate, expectedHash) : null;
  const checksumMatch = comparisonResult ? comparisonResult.isMatch : false;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Standard Header */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-semibold">
          <span>NIST FIPS 180-4 (SECURE HASH STANDARD)</span>
          <span>·</span>
          <span>256-BIT MERKLE-DAMGÅRD</span>
          <span>·</span>
          <span>COLLISION RESISTANT</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold text-white">
          SHA-256 Cryptographic Hash & Integrity Workbench
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Produces a deterministic, irreversible 256-bit (32-byte) message digest. Features file integrity verification and visual avalanche bit divergence exploration.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab('cipher')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'cipher' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>File & Image Cipher (SHA-256 Key)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-orange-200 border border-orange-400/30">
            AEAD
          </span>
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'text' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Hash className="h-3.5 w-3.5" />
          <span>Text Digest</span>
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'file' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>File & Image Hash + Verifier</span>
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'verify' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileCheck className="h-3.5 w-3.5" />
          <span>Deep Checksum Verifier</span>
        </button>
        <button
          onClick={() => setActiveTab('avalanche')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'avalanche' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Avalanche Effect Explorer</span>
        </button>
      </div>

      {/* TAB 0: FILE & IMAGE CIPHER (SHA-256 KEY) */}
      {activeTab === 'cipher' && <SHA256FileCipherTab />}

      {/* TAB 1: TEXT HASH */}
      {activeTab === 'text' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
          <form onSubmit={handleHashText} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-300">Input String Message</label>
              <textarea
                rows={3}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 font-mono text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                placeholder="Enter string to digest..."
              />
              <div className="mt-2.5">
                <EntropyStrengthMeter
                  value={textInput}
                  algorithm="sha256"
                  label="Pre-Image Message Information Entropy"
                />
              </div>
            </div>

            <LiquidButton
              type="submit"
              variant="primary"
              size="md"
              icon={<Zap className="h-3.5 w-3.5" />}
            >
              Compute SHA-256 Digest
            </LiquidButton>
          </form>

          {textHash && (
            <div className="space-y-2 pt-3 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                <span>Computed 256-Bit Hex Digest:</span>
                <div className="flex items-center gap-3">
                  {textDuration !== null && (
                    <span className="font-mono text-xs text-orange-400 font-bold">{textDuration} ms</span>
                  )}
                  <button
                    onClick={() => copyToClipboard(textHash, 'texthash')}
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedLabel === 'texthash' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-orange-400 font-bold break-all select-all">
                {textHash}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FILE & IMAGE HASH + REAL-TIME VERIFIER */}
      {activeTab === 'file' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-6">
          <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 text-center bg-black/40 hover:border-orange-500/50 transition-colors">
            <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">Select or Drag Any File or Image to Hash & Verify</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Supports PNG, JPG, WebP, PDF, DOCX, ZIP, Binaries up to 50 MB</p>

            <label className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-black hover:bg-orange-400 cursor-pointer transition-colors shadow-md shadow-orange-500/20">
              <Upload className="h-3.5 w-3.5" />
              <span>{fileLoading ? 'Reading & Hashing...' : 'Browse File or Image'}</span>
              <input type="file" onChange={handleHashFile} className="hidden" />
            </label>
          </div>

          {selectedFile && fileHash && (
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              {/* File Meta & Image Preview */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {selectedFile.type.startsWith('image/') ? (
                      <FileImage className="h-6 w-6 text-orange-400 shrink-0" />
                    ) : (
                      <FileText className="h-6 w-6 text-orange-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-md">{selectedFile.name}</h4>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'binary/stream'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-orange-400 font-bold bg-black px-2.5 py-1 rounded-lg border border-zinc-800">
                      {fileDuration} ms
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(fileHash, 'filehash')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-200 flex items-center gap-1 transition-colors"
                    >
                      {copiedLabel === 'filehash' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedLabel === 'filehash' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {selectedFilePreview && (
                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                      Uploaded Image Preview:
                    </span>
                    <div className="rounded-lg overflow-hidden border border-zinc-800 bg-black flex justify-center max-h-48 p-1">
                      <img
                        src={selectedFilePreview}
                        alt="Uploaded file preview"
                        className="max-h-44 object-contain rounded"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-medium text-zinc-400 block mb-1">
                    Computed SHA-256 Digest (Candidate):
                  </span>
                  <div className="p-3 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-orange-400 font-bold break-all select-all">
                    {fileHash}
                  </div>
                </div>
              </div>

              {/* INTEGRATED VERIFICATION FEATURE: VERIFY IF FILE IS CORRECT OR NOT */}
              <div className="rounded-2xl border border-orange-500/20 bg-orange-950/10 p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-orange-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Verify Uploaded File Correctness (Authenticity & Tamper Check)
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickVerifyExpected(fileHash)}
                      className="text-[10px] text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md font-semibold transition-colors"
                      title="Set expected hash to the computed hash to test positive match"
                    >
                      Match Computed Hash
                    </button>
                    <label className="text-[10px] text-orange-400 hover:text-orange-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors flex items-center gap-1">
                      <span>Import .sha256 File</span>
                      <input type="file" onChange={handleQuickUploadChecksumFile} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={handleQuickSimulateTamper}
                      className="text-[10px] text-amber-400 hover:text-amber-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1"
                      title="Flip 1 character to simulate corrupted file detection"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Simulate Tamper</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                    Authoritative Reference Checksum (From Publisher / Trusted Source):
                  </label>
                  <input
                    type="text"
                    value={quickVerifyExpected}
                    onChange={(e) => setQuickVerifyExpected(e.target.value)}
                    placeholder="Paste expected 64-character SHA-256 hash to verify file correctness..."
                    className="w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* VERIFICATION OUTCOME BANNER */}
                {fileHash && quickVerifyExpected.trim() && (() => {
                  const comparison = compareSha256Hashes(fileHash, quickVerifyExpected);
                  return (
                    <div className="space-y-3 pt-2">
                      <div
                        className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                          comparison.isMatch
                            ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 shadow-sm shadow-emerald-500/10'
                            : 'border-red-500/40 bg-red-950/20 text-red-300 shadow-sm shadow-red-500/10'
                        }`}
                      >
                        {comparison.isMatch ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                              {comparison.isMatch
                                ? '✅ Uploaded File Is Authentic & Correct (100% Bit-Exact Match)'
                                : '❌ File Integrity Rejected: Corrupted or Modified File!'}
                            </h4>
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/60 border border-current font-bold">
                              {comparison.charMatches}/64 Hex Chars Matched
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-300">
                            {comparison.isMatch
                              ? `The uploaded file "${selectedFile.name}" matches the authoritative SHA-256 checksum with zero divergence. Integrity and authenticity are 100% cryptographically guaranteed (NIST FIPS 180-4).`
                              : `The uploaded file "${selectedFile.name}" does NOT match the expected checksum! ${comparison.diffIndices.length} hexadecimal character positions diverge. The file is corrupt, modified, or from an untrusted origin.`}
                          </p>
                        </div>
                      </div>

                      {/* Character Diff Visualizer when not matching */}
                      {!comparison.isMatch && (
                        <div className="p-3 rounded-xl bg-black border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Character Alignment Map (Divergent Hex Highlights):</span>
                            <span className="text-red-400 font-mono font-bold">
                              {comparison.diffIndices.length} Mismatches
                            </span>
                          </div>
                          <div className="font-mono text-[11px] tracking-wider break-all p-2 rounded-lg bg-zinc-950 border border-zinc-800 leading-relaxed">
                            <span className="text-zinc-500 block text-[9px] uppercase font-bold">Uploaded File Digest:</span>
                            {comparison.computedHash.split('').map((char, idx) => {
                              const isDiff = comparison.diffIndices.includes(idx);
                              return (
                                <span
                                  key={idx}
                                  className={isDiff ? 'bg-red-500 text-black font-bold px-0.5 rounded' : 'text-zinc-300'}
                                >
                                  {char}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleTransferFileToVerifier}
                          className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-semibold"
                        >
                          <span>Open in Deep Checksum Verifier with Full Diff Grid</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEEP CHECKSUM VERIFIER */}
      {activeTab === 'verify' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-6">
          {/* Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-orange-500" />
                <span>Deep Checksum & File Authenticity Verifier</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Directly upload files or images to verify against an authoritative SHA-256 signature, or compare candidate hashes.
              </p>
            </div>

            <div className="flex gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setVerifyMode('file')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  verifyMode === 'file' ? 'bg-orange-500 text-black shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Verify File / Image</span>
              </button>
              <button
                type="button"
                onClick={() => setVerifyMode('manual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  verifyMode === 'manual' ? 'bg-orange-500 text-black shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                <span>Manual Hash Comparison</span>
              </button>
            </div>
          </div>

          {/* MODE A: UPLOAD FILE / IMAGE */}
          {verifyMode === 'file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 text-center bg-black/40 hover:border-orange-500/50 transition-colors">
                <Upload className="h-7 w-7 text-zinc-500 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-white">Upload Any File or Image to Verify</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Chunk-stream read computes candidate SHA-256 in real-time</p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <label className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-black hover:bg-orange-400 cursor-pointer transition-colors shadow-md shadow-orange-500/20">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{verifyFileLoading ? 'Hashing File...' : 'Browse File / Image'}</span>
                    <input
                      type="file"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSelectVerifyFile(f);
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleLoadSampleVerifyFile}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                    <span>Load Verified Ubuntu Package Sample</span>
                  </button>
                </div>
              </div>

              {/* Uploaded File Detail Card */}
              {verifyFile && verifyFileHash && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {verifyFile.type.startsWith('image/') ? (
                        <FileImage className="h-6 w-6 text-orange-400 shrink-0" />
                      ) : (
                        <FileText className="h-6 w-6 text-orange-400 shrink-0" />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white truncate max-w-md">{verifyFile.name}</h4>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          {(verifyFile.size / 1024).toFixed(1)} KB · {verifyFile.type || 'binary/stream'}
                        </p>
                      </div>
                    </div>
                    {verifyFileDuration !== null && (
                      <span className="font-mono text-xs text-orange-400 font-bold bg-black px-2.5 py-1 rounded-lg border border-zinc-800">
                        {verifyFileDuration} ms
                      </span>
                    )}
                  </div>

                  {verifyFilePreview && (
                    <div className="pt-2 border-t border-zinc-800">
                      <span className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                        Uploaded Image Preview:
                      </span>
                      <div className="rounded-lg overflow-hidden border border-zinc-800 bg-black flex justify-center max-h-44 p-1">
                        <img
                          src={verifyFilePreview}
                          alt="Verification file"
                          className="max-h-40 object-contain rounded"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Candidate Hash (Computed from Uploaded File):</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(verifyFileHash, 'v_cand')}
                        className="text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        {copiedLabel === 'v_cand' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedLabel === 'v_cand' ? 'Copied' : 'Copy Hash'}</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-orange-400 font-bold break-all select-all">
                      {verifyFileHash}
                    </div>
                  </div>
                </div>
              )}

              {/* Authoritative Checksum Input */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-medium text-zinc-300">
                    Authoritative Checksum (Expected Hash from Publisher):
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-orange-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                      <Upload className="h-3 w-3" />
                      <span>{checksumFileName ? `Loaded: ${checksumFileName}` : 'Import .sha256 File'}</span>
                      <input type="file" onChange={handleUploadChecksumFile} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={handleSimulateTamperExpected}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Simulate Tamper</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={expectedHash}
                  onChange={(e) => setExpectedHash(e.target.value)}
                  placeholder="Paste reference 64-character SHA-256 hash or import checksum file..."
                  className="w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* MODE B: MANUAL HASH COMPARISON */}
          {verifyMode === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">1. Candidate Hash (From Test File or Stream)</label>
                <input
                  type="text"
                  value={candidateHash}
                  onChange={(e) => setCandidateHash(e.target.value)}
                  placeholder="Paste candidate 64-character SHA-256 hash..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">2. Authoritative Checksum (Reference)</label>
                  <button
                    type="button"
                    onClick={handleSimulateTamperExpected}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Simulate Tamper</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={expectedHash}
                  onChange={(e) => setExpectedHash(e.target.value)}
                  placeholder="Paste authoritative reference checksum..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* VERIFICATION RESULTS PANEL & HEX DIFF GRID */}
          {comparisonResult && (
            <div className="space-y-4 pt-3 border-t border-zinc-800">
              <div
                className={`p-5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                  checksumMatch
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'border-red-500/40 bg-red-950/20 text-red-300 shadow-md shadow-red-500/10'
                }`}
              >
                {checksumMatch ? (
                  <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-7 w-7 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      {checksumMatch
                        ? '✅ VERIFIED AUTHENTIC: 100% Exact Checksum Match'
                        : '❌ INTEGRITY REJECTED: Corrupted or Modified File'}
                    </h4>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-black/60 border border-current font-bold w-fit">
                      {comparisonResult.charMatches} / 64 Characters Matched ({((comparisonResult.charMatches / 64) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {checksumMatch
                      ? 'The candidate SHA-256 hash matches the authoritative checksum bit-for-bit with zero divergence across all 256 bits. Cryptographic authenticity is confirmed under NIST FIPS 180-4 standard.'
                      : `Integrity check failed: ${comparisonResult.diffIndices.length} hexadecimal characters differ. The uploaded content is damaged, truncated, or tampered.`}
                  </p>
                </div>
              </div>

              {/* Character Diff Matrix */}
              <div className="rounded-2xl border border-zinc-800 bg-black p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">
                    64-Hex Character Difference Map (0 - 63):
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-xs bg-emerald-500"></span>
                      <span>Matching</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-xs bg-red-500"></span>
                      <span>Mismatched</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-8 sm:grid-cols-16 md:grid-cols-32 gap-1.5 font-mono text-[11px] text-center">
                  {Array.from({ length: 64 }).map((_, idx) => {
                    const candChar = comparisonResult.computedHash[idx] || '-';
                    const expChar = comparisonResult.expectedHash[idx] || '-';
                    const isDiff = comparisonResult.diffIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        title={`Pos #${idx}: Candidate '${candChar}' vs Expected '${expChar}'`}
                        className={`p-1.5 rounded-md border flex flex-col items-center justify-center transition-colors ${
                          isDiff
                            ? 'border-red-500/60 bg-red-950/50 text-red-300 font-bold'
                            : 'border-zinc-800 bg-zinc-900/60 text-emerald-400'
                        }`}
                      >
                        <span className="text-[8px] text-zinc-500 leading-none">{idx}</span>
                        <span className="text-xs leading-tight mt-0.5">{candChar}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AVALANCHE EFFECT EXPLORER */}
      {activeTab === 'avalanche' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <span>Avalanche Effect & Bit Diffusion Analyzer</span>
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                In a secure hash function, flipping a single input bit must cause each output bit to flip with 50% probability (strict avalanche criterion).
              </p>
            </div>

            <form onSubmit={handleRunAvalanche} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Message A</label>
                <input
                  type="text"
                  value={avalancheInput1}
                  onChange={(e) => setAvalancheInput1(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Message B (1 Character Difference)</label>
                <input
                  type="text"
                  value={avalancheInput2}
                  onChange={(e) => setAvalancheInput2(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white"
                />
              </div>

              <div className="md:col-span-2">
                <LiquidButton
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Activity className="h-3.5 w-3.5" />}
                >
                  Analyze Bit Divergence & Avalanche Matrix
                </LiquidButton>
              </div>
            </form>
          </div>

          {avalancheResult && (
            <div className="rounded-2xl border border-orange-500/30 bg-orange-950/15 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-orange-400">
                    Avalanche Bit Divergence: {avalancheResult.divergencePercentage}%
                  </h4>
                  <p className="text-xs text-zinc-300">
                    {avalancheResult.bitDifferences} out of {avalancheResult.totalBits} output bits flipped (Ideal target: ~50%).
                  </p>
                </div>
                <div className="font-mono text-xs text-white font-bold">
                  {avalancheResult.durationMs} ms analysis latency
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300">
                  Bit-by-Bit Diffusion Matrix (256 Output Bits):
                </span>
                <div className="flex items-center gap-4 text-[11px] text-zinc-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-orange-500"></span>
                    <span className="text-white font-medium">Flipped Bit (Diverged)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-zinc-800"></span>
                    <span>Identical Bit</span>
                  </span>
                </div>

                <div
                  className="p-3 rounded-xl bg-black border border-zinc-800 gap-1.5"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(14px, 1fr))',
                  }}
                >
                  {Array.from({ length: 256 }).map((_, idx) => {
                    const isFlipped = avalancheResult.flippedIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        title={`Bit #${idx}: ${isFlipped ? 'FLIPPED' : 'IDENTICAL'}`}
                        className={`h-3.5 w-3.5 rounded-xs transition-colors ${
                          isFlipped ? 'bg-orange-500 shadow-xs shadow-orange-500/60' : 'bg-zinc-800'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standards Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2 text-xs text-zinc-400">
        <h4 className="font-bold text-white text-xs">Mathematical Model (NIST FIPS 180-4):</h4>
        <p className="leading-relaxed">
          SHA-256 uses the Merkle-Damgård construction operating on 512-bit message blocks. It maintains an internal state of eight 32-bit registers updated across 64 rounds using non-linear functions Ch(E,F,G), Maj(A,B,C), and bitwise rotations Σ0 and Σ1. Preimage resistance is 2^256 and collision resistance is 2^128.
        </p>
      </div>
    </div>
  );
};
