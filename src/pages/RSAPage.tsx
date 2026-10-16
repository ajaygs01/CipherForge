import React, { useState } from 'react';
import {
  KeyRound,
  Download,
  Copy,
  Check,
  Clock,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
} from 'lucide-react';
import { generateRSAKeyPair, encryptRSA, decryptRSA } from '../utils/crypto/rsa';
import { useHistory } from '../context/HistoryContext';
import { useNotifications } from '../context/NotificationContext';
import { LiquidButton } from '../components/LiquidButton';
import { EntropyStrengthMeter } from '../components/EntropyStrengthMeter';

export const RSAPage: React.FC = () => {
  const { addRecord } = useHistory();
  const { addNotification } = useNotifications();

  // Keygen state
  const [modulusBits, setModulusBits] = useState<2048 | 3072>(2048);
  const [keyGenLoading, setKeyGenLoading] = useState(false);
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [keyGenDuration, setKeyGenDuration] = useState<number | null>(null);

  // Encrypt state
  const [encryptPlaintext, setEncryptPlaintext] = useState('SecureSessionSecret_RSA_2026');
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [ciphertextBase64, setCiphertextBase64] = useState('');
  const [encryptDuration, setEncryptDuration] = useState<number | null>(null);

  // Decrypt state
  const [decryptCiphertext, setDecryptCiphertext] = useState('');
  const [decryptPrivateKey, setDecryptPrivateKey] = useState('');
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptedPlaintext, setDecryptedPlaintext] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const downloadPemFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateKeys = async () => {
    setKeyGenLoading(true);
    try {
      const res = await generateRSAKeyPair(modulusBits);
      setPublicKeyPem(res.publicKeyPem);
      setPrivateKeyPem(res.privateKeyPem);
      setDecryptPrivateKey(res.privateKeyPem);
      setKeyGenDuration(res.durationMs);

      addRecord(
        'RSA-OAEP',
        'KEYGEN',
        res.durationMs,
        'SUCCESS',
        {
          modulusBits,
          publicExponent: 65537,
          padding: 'OAEP-SHA256',
        },
        `RSA ${modulusBits}-bit keypair generation completed.`
      );
      addNotification('RSA Keypair Generated', `Generated ${modulusBits}-bit RSA keypair in ${res.durationMs} ms.`, 'success');
    } catch (err: any) {
      addNotification('RSA KeyGen Error', err.message || 'Key generation failed', 'error');
    } finally {
      setKeyGenLoading(false);
    }
  };

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKeyPem) {
      addNotification('Missing RSA Public Key', 'Please generate or paste an RSA Public Key first.', 'warning');
      return;
    }
    setEncryptLoading(true);
    try {
      const res = await encryptRSA(publicKeyPem, encryptPlaintext);
      setCiphertextBase64(res.ciphertext);
      setDecryptCiphertext(res.ciphertext);
      setEncryptDuration(res.durationMs);

      addRecord(
        'RSA-OAEP',
        'ENCRYPT',
        res.durationMs,
        'SUCCESS',
        {
          modulusBits,
          padding: 'OAEP-SHA256',
          ciphertextBytes: atob(res.ciphertext).length,
        },
        'Asymmetric encryption using RSA-OAEP with SHA-256 MGF1.'
      );
      addNotification('RSA-OAEP Encryption Succeeded', `Encrypted in ${res.durationMs} ms.`, 'success');
    } catch (err: any) {
      addNotification('RSA Encryption Failed', err.message || 'Encryption error', 'error');
    } finally {
      setEncryptLoading(false);
    }
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setDecryptLoading(true);
    setDecryptError(null);
    setDecryptedPlaintext(null);

    try {
      const res = await decryptRSA(decryptPrivateKey, decryptCiphertext);
      setDecryptedPlaintext(res.plaintext);

      addRecord(
        'RSA-OAEP',
        'DECRYPT',
        res.durationMs,
        'SUCCESS',
        {
          padding: 'OAEP-SHA256',
        },
        'Asymmetric decryption recovered plaintext message.'
      );
      addNotification('RSA-OAEP Decryption Succeeded', `Decrypted in ${res.durationMs} ms.`, 'success');
    } catch (err: any) {
      setDecryptError(err.message);
      addRecord('RSA-OAEP', 'DECRYPT', 1.2, 'FAILURE');
    } finally {
      setDecryptLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Standards Header */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-semibold">
          <span>RFC 8017 (PKCS #1 V2.2)</span>
          <span>·</span>
          <span>NIST SP 800-56B</span>
          <span>·</span>
          <span>OAEP-SHA256 PADDING</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold text-white">
          RSA-OAEP Asymmetric Public-Key Cryptosystem
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Optimal Asymmetric Encryption Padding (OAEP) with SHA-256 Mask Generation Function (MGF1) prevents deterministic chosen-ciphertext attacks (IND-CCA2).
        </p>
      </div>

      {/* Section 1: Key Generation Panel */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-orange-500" />
              <span>1. Asymmetric Key Generation (PEM PKCS#8 & SPKI)</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Generates cryptographic prime factors p and q, modulus n = p · q, and private exponent d.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-black border border-zinc-800 p-1">
              <button
                type="button"
                onClick={() => setModulusBits(2048)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  modulusBits === 2048 ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                2048-bit
              </button>
              <button
                type="button"
                onClick={() => setModulusBits(3072)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  modulusBits === 3072 ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                3072-bit
              </button>
            </div>

            <LiquidButton
              variant="primary"
              size="sm"
              onClick={handleGenerateKeys}
              disabled={keyGenLoading}
              icon={keyGenLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            >
              {keyGenLoading ? 'Generating Primes...' : 'Generate Keypair'}
            </LiquidButton>
          </div>
        </div>

        {keyGenDuration !== null && (
          <div className="flex items-center gap-2 font-mono text-xs text-white">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            <span>Keypair generation latency: {keyGenDuration} ms</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Public Key Display */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
              <span>Public Key (SPKI PEM)</span>
              {publicKeyPem && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(publicKeyPem, 'pub')}
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedLabel === 'pub' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedLabel === 'pub' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => downloadPemFile(publicKeyPem, `rsa_public_${modulusBits}.pem`)}
                    className="text-[11px] text-zinc-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Download className="h-3 w-3" />
                    <span>.pem</span>
                  </button>
                </div>
              )}
            </div>
            <textarea
              readOnly
              rows={6}
              value={publicKeyPem}
              placeholder="Click 'Generate Keypair' to generate an RSA public key..."
              className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-[11px] text-orange-400 font-mono select-all focus:outline-none"
            />
          </div>

          {/* Private Key Display */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
              <span>Private Key (PKCS#8 PEM)</span>
              {privateKeyPem && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(privateKeyPem, 'priv')}
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {copiedLabel === 'priv' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedLabel === 'priv' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => downloadPemFile(privateKeyPem, `rsa_private_${modulusBits}.pem`)}
                    className="text-[11px] text-zinc-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Download className="h-3 w-3" />
                    <span>.pem</span>
                  </button>
                </div>
              )}
            </div>
            <textarea
              readOnly
              rows={6}
              value={privateKeyPem}
              placeholder="Click 'Generate Keypair' to generate an RSA private key..."
              className="w-full rounded-xl border border-zinc-800 bg-black p-3 text-[11px] text-white font-mono select-all focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Encrypt & Decrypt Interactive Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Encrypt Split */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-orange-500" />
              <span>2. Encrypt with Public Key</span>
            </h3>
            {encryptDuration !== null && (
              <span className="font-mono text-xs text-orange-400 font-bold">{encryptDuration} ms</span>
            )}
          </div>

          <form onSubmit={handleEncrypt} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-zinc-300">Plaintext Message</label>
              <textarea
                rows={3}
                value={encryptPlaintext}
                onChange={(e) => setEncryptPlaintext(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 text-xs text-white font-mono placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                placeholder="Message to encrypt with recipient public key..."
              />
              <div className="mt-2.5">
                <EntropyStrengthMeter
                  value={encryptPlaintext}
                  algorithm="rsa"
                  label="Payload / Plaintext Information Entropy"
                />
              </div>
            </div>

            <div className="pt-2">
              <LiquidButton
                type="submit"
                disabled={encryptLoading || !publicKeyPem}
                fullWidth
                variant="primary"
                size="md"
                icon={encryptLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
              >
                {encryptLoading ? 'Computing RSA-OAEP Exponentiation...' : 'Encrypt with RSA Public Key (OAEP)'}
              </LiquidButton>
            </div>
          </form>

          {ciphertextBase64 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                <span>OAEP Ciphertext (Base64)</span>
                <button
                  onClick={() => copyToClipboard(ciphertextBase64, 'rsa_cipher')}
                  className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  {copiedLabel === 'rsa_cipher' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-orange-400 break-all select-all">
                {ciphertextBase64}
              </div>
            </div>
          )}
        </div>

        {/* Decrypt Split */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-zinc-800">
            <Unlock className="h-4 w-4 text-orange-500" />
            <span>3. Decrypt with Private Key</span>
          </h3>

          <form onSubmit={handleDecrypt} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-zinc-300">Ciphertext to Decrypt (Base64)</label>
              <textarea
                rows={2}
                value={decryptCiphertext}
                onChange={(e) => setDecryptCiphertext(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 text-xs text-white font-mono placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                placeholder="Paste OAEP ciphertext..."
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">RSA Private Key (PEM PKCS#8)</label>
              <textarea
                rows={3}
                value={decryptPrivateKey}
                onChange={(e) => setDecryptPrivateKey(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 text-[11px] text-white font-mono placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                placeholder="Auto-filled from Keygen, or paste private key PEM..."
              />
              {decryptPrivateKey && (
                <div className="mt-1.5">
                  <EntropyStrengthMeter
                    value={decryptPrivateKey}
                    algorithm="rsa"
                    variant="compact"
                    label="Private Key Entropy Verification"
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <LiquidButton
                type="submit"
                disabled={decryptLoading || !decryptPrivateKey}
                fullWidth
                variant="primary"
                size="md"
                icon={decryptLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
              >
                {decryptLoading ? 'Inverting RSA Modulus & MGF1...' : 'Decrypt with RSA Private Key (OAEP)'}
              </LiquidButton>
            </div>
          </form>

          {decryptError && (
            <div className="p-3 rounded-xl border border-red-500/20 bg-red-950/20 text-xs text-red-300">
              {decryptError}
            </div>
          )}

          {decryptedPlaintext && (
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-orange-400">Decrypted Plaintext Restored:</span>
              <div className="p-3 rounded-xl border border-orange-500/30 bg-orange-950/20 font-mono text-xs text-white break-all">
                {decryptedPlaintext}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mathematical Theory Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2 text-xs text-zinc-400">
        <h4 className="font-bold text-white text-xs">Mathematical Principle (RFC 8017 / PKCS #1 v2.2):</h4>
        <p className="leading-relaxed">
          RSA is established upon the computational difficulty of composite integer factorization. Public key exponentiation c ≡ m^e (mod n) is reversed via private exponent d such that e · d ≡ 1 (mod φ(n)). Optimal Asymmetric Encryption Padding (OAEP) encodes messages using two rounds of Feistel-like masking with SHA-256 and Mask Generation Function 1 (MGF1). This guarantees semantic security (IND-CCA2) against chosen-ciphertext and Bleichenbacher padding oracle attacks.
        </p>
      </div>
    </div>
  );
};
