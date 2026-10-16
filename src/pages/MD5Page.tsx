import React, { useState } from 'react';
import {
  AlertTriangle,
  Hash,
  Upload,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { hashTextMD5, hashFileMD5 } from '../utils/crypto/md5';
import { hashTextSHA256 } from '../utils/crypto/sha256';
import { useHistory } from '../context/HistoryContext';
import { useNotifications } from '../context/NotificationContext';
import { LiquidButton } from '../components/LiquidButton';
import { EntropyStrengthMeter } from '../components/EntropyStrengthMeter';

export const MD5Page: React.FC = () => {
  const { addRecord } = useHistory();
  const { addNotification } = useNotifications();

  const [inputMessage, setInputMessage] = useState('CipherForge_Legacy_Test_Payload');
  const [md5Hash, setMd5Hash] = useState('');
  const [shaHash, setShaHash] = useState('');
  const [durationMs, setDurationMs] = useState<number | null>(null);

  const [fileHash, setFileHash] = useState('');
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleComputeHashes = async (e: React.FormEvent) => {
    e.preventDefault();
    const md5Res = hashTextMD5(inputMessage);
    const shaRes = await hashTextSHA256(inputMessage);

    setMd5Hash(md5Res.hashHex);
    setShaHash(shaRes.hashHex);
    setDurationMs(md5Res.durationMs);

    addRecord(
      'MD5',
      'HASH_TEXT',
      md5Res.durationMs,
      'SUCCESS',
      {
        standard: 'RFC 1321 (Educational Only)',
        digestBits: 128,
        warning: 'Collision Broken',
      },
      'MD5 128-bit digest evaluated for historical cryptanalysis comparison.'
    );
    addNotification('MD5 Digest Computed (Educational)', `Computed in ${md5Res.durationMs} ms.`, 'info');
  };

  const handleFileHash = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const res = await hashFileMD5(file);
    setFileHash(res.hashHex);
    setFileDuration(res.durationMs);

    addRecord(
      'MD5',
      'HASH_FILE',
      res.durationMs,
      'SUCCESS',
      {
        standard: 'RFC 1321',
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      },
      'MD5 file digest computed.'
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Warning Header */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-semibold">
          <span>RFC 1321</span>
          <span>·</span>
          <span>128-BIT MESSAGE DIGEST</span>
          <span>·</span>
          <span>EDUCATIONAL CRYPTANALYSIS</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold text-white">
          MD5 Message-Digest & Collision Cryptanalysis
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Evaluates the historical 128-bit MD5 algorithm to demonstrate why it was deprecated due to chosen-prefix collision attacks.
        </p>
      </div>

      {/* Security Advisory Banner */}
      <div className="rounded-2xl border border-orange-500/40 bg-orange-950/20 p-5 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-orange-400">SECURITY ADVISORY: MD5 IS CRYPTOGRAPHICALLY BROKEN</h4>
          <p className="text-zinc-300 leading-relaxed">
            Wang et al. (2004) and Stevens et al. (2007) published practical chosen-prefix collision attacks against MD5 with computational complexity under 2<sup>16</sup> operations. Never use MD5 for digital signatures, SSL/TLS certificates, or password hashing. CipherForge incorporates MD5 exclusively for educational contrast against SHA-256.
          </p>
        </div>
      </div>

      {/* Text Hashing & Comparison */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Hash className="h-4 w-4 text-orange-500" />
          <span>Side-by-Side Digest Comparison (MD5 vs SHA-256)</span>
        </h3>

        <form onSubmit={handleComputeHashes} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-300">Input String Message</label>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 font-mono text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
            <div className="mt-2.5">
              <EntropyStrengthMeter
                value={inputMessage}
                algorithm="md5"
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
            Compute MD5 & Benchmark Against SHA-256
          </LiquidButton>
        </form>

        {md5Hash && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            {/* MD5 Digest */}
            <div className="space-y-1.5 p-4 rounded-xl border border-orange-500/30 bg-black">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-orange-400">MD5 Digest (128-bit / 32 Hex)</span>
                <button
                  onClick={() => copyToClipboard(md5Hash, 'md5')}
                  className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  {copiedLabel === 'md5' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-xs text-zinc-200 break-all select-all pt-1 font-semibold">
                {md5Hash}
              </div>
              <span className="text-[10px] text-zinc-400">Latency: {durationMs} ms · Vulnerable to collisions</span>
            </div>

            {/* SHA-256 Digest */}
            <div className="space-y-1.5 p-4 rounded-xl border border-zinc-700 bg-black">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">SHA-256 Digest (256-bit / 64 Hex)</span>
                <button
                  onClick={() => copyToClipboard(shaHash, 'sha')}
                  className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  {copiedLabel === 'sha' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-xs text-orange-400 break-all select-all pt-1 font-semibold">
                {shaHash}
              </div>
              <span className="text-[10px] text-zinc-400">NIST SP 800-107 Approved · Collision secure</span>
            </div>
          </div>
        )}
      </div>

      {/* File Hashing */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="h-4 w-4 text-orange-500" />
          <span>MD5 File Checksum Hashing</span>
        </h3>

        <div className="border border-zinc-800 rounded-xl p-4 bg-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-white font-medium">Select file for legacy MD5 checksum:</span>
            {selectedFile && (
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          <label className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-black hover:bg-orange-400 cursor-pointer transition-colors shadow-sm shadow-orange-500/20">
            <span>Browse File</span>
            <input type="file" onChange={handleFileHash} className="hidden" />
          </label>
        </div>

        {fileHash && (
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-black space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">MD5 Checksum:</span>
              <span className="font-mono text-orange-400 font-bold">{fileDuration} ms</span>
            </div>
            <div className="font-mono text-xs text-white font-bold break-all select-all">{fileHash}</div>
          </div>
        )}
      </div>
    </div>
  );
};
