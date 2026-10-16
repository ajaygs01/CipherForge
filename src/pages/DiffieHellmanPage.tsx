import React, { useState } from 'react';
import {
  GitCompare,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  RefreshCw,
  Zap,
  User,
  Users,
} from 'lucide-react';
import {
  simulateFullDHExchange,
  generateDHKeyPair,
  computeDHSharedSecret,
} from '../utils/crypto/diffieHellman';
import { useHistory } from '../context/HistoryContext';
import { useNotifications } from '../context/NotificationContext';
import { LiquidButton } from '../components/LiquidButton';
import { EntropyStrengthMeter } from '../components/EntropyStrengthMeter';

export const DiffieHellmanPage: React.FC = () => {
  const { addRecord } = useHistory();
  const { addNotification } = useNotifications();

  const [activeMode, setActiveMode] = useState<'simulation' | 'manual'>('simulation');

  // Simulation state
  const [simLoading, setSimLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  // Manual mode state
  const [myKeyPair, setMyKeyPair] = useState<{ privateKeyHex: string; publicKeyHex: string } | null>(null);
  const [peerPublicKey, setPeerPublicKey] = useState('');
  const [manualResult, setManualResult] = useState<{
    sharedSecretHex: string;
    derivedSessionKeyHex: string;
    durationMs: number;
  } | null>(null);
  const [manualLoading, setManualLoading] = useState(false);

  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await simulateFullDHExchange();
      setSimulationResult(res);

      addRecord(
        'Diffie-Hellman',
        'KEY_EXCHANGE',
        res.durationMs,
        'SUCCESS',
        {
          group: 'RFC 3526 MODP Group 14',
          primeModulus: '2048-bit Safe Prime',
          generator: 'g = 2',
          kdf: 'HKDF-SHA256 (256-bit)',
          secretsMatched: 'True',
        },
        'Diffie-Hellman Alice and Bob handshake simulation completed. Shared secret aligned.'
      );

      addNotification('Diffie-Hellman Handshake Complete', `Shared secret verified in ${res.durationMs} ms.`, 'success');
    } catch (err: any) {
      addNotification('Diffie-Hellman Handshake Error', err.message || 'Key exchange failed', 'error');
    } finally {
      setSimLoading(false);
    }
  };

  const handleGenerateMyKeys = () => {
    const keys = generateDHKeyPair();
    setMyKeyPair(keys);
  };

  const handleComputeManualSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myKeyPair || !peerPublicKey) return;
    setManualLoading(true);
    try {
      const res = await computeDHSharedSecret(myKeyPair.privateKeyHex, peerPublicKey);
      setManualResult(res);

      addRecord(
        'Diffie-Hellman',
        'KEY_EXCHANGE',
        res.durationMs,
        'SUCCESS',
        {
          group: 'RFC 3526 MODP Group 14',
          derivedKeyBits: 256,
        },
        'Derived symmetric session key from peer public key.'
      );
    } catch (err: any) {
      alert(`DH Derivation Error: ${err.message}`);
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Standard Header */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-semibold">
          <span>RFC 3526 (MODP GROUP 14)</span>
          <span>·</span>
          <span>2048-BIT SAFE PRIME</span>
          <span>·</span>
          <span>RFC 5869 (HKDF DERIVATION)</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold text-white">
          Diffie-Hellman Cryptographic Key Agreement
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Enables two parties to establish a shared symmetric secret over an untrusted channel based on the Discrete Logarithm Problem (DLP).
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveMode('simulation')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeMode === 'simulation' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Alice & Bob Interactive Handshake Simulation</span>
        </button>
        <button
          onClick={() => setActiveMode('manual')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeMode === 'manual' ? 'bg-orange-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Manual Peer Key Agreement</span>
        </button>
      </div>

      {/* SIMULATION MODE */}
      {activeMode === 'simulation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-orange-500" />
                <span>Simulate Complete 2-Party Key Agreement (MODP Group 14)</span>
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Executes discrete exponentiations for Alice (A = g^a mod p) and Bob (B = g^b mod p), and verifies that S_A = B^a = S_B = A^b = g^(ab) mod p.
              </p>
            </div>
            <LiquidButton
              variant="primary"
              size="md"
              onClick={handleSimulate}
              disabled={simLoading}
              icon={simLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            >
              {simLoading ? 'Executing BigInt Modular Exponentiation...' : 'Run Simulation Handshake'}
            </LiquidButton>
          </div>

          {simulationResult && (
            <div className="space-y-6">
              {/* Alice vs Bob Split Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Alice Panel */}
                <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-400 pb-2 border-b border-zinc-800">
                    <User className="h-4 w-4" />
                    <span>Alice's Cryptographic State</span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-zinc-400">1. Alice's Private Exponent (a) - SECRET</span>
                    <div className="mt-1 p-2 rounded-lg bg-black font-mono text-[11px] text-white break-all select-all border border-zinc-800">
                      0x{simulationResult.alicePrivateKey}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-zinc-400">2. Alice's Public Value (A = gᵃ mod p) - TRANSMITTED</span>
                    <div className="mt-1 p-2 rounded-lg bg-black font-mono text-[11px] text-orange-400 break-all select-all border border-zinc-800">
                      0x{simulationResult.alicePublicKey.slice(0, 80)}...
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-zinc-400">3. Alice Computes Shared Secret (Sₐ = Bᵃ mod p)</span>
                    <div className="mt-1 p-2 rounded-lg bg-black font-mono text-[11px] text-white font-bold break-all select-all border border-zinc-800">
                      0x{simulationResult.aliceDerivedSecretHex.slice(0, 80)}...
                    </div>
                  </div>
                </div>

                {/* Bob Panel */}
                <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-400 pb-2 border-b border-zinc-800">
                    <User className="h-4 w-4" />
                    <span>Bob's Cryptographic State</span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-zinc-400">1. Bob's Private Exponent (b) - SECRET</span>
                    <div className="mt-1 p-2 rounded-lg bg-black font-mono text-[11px] text-white break-all select-all border border-zinc-800">
                      0x{simulationResult.bobPrivateKey}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-zinc-400">2. Bob's Public Value (B = gᵇ mod p) - TRANSMITTED</span>
                    <div className="mt-1 p-2 rounded-lg bg-black font-mono text-[11px] text-orange-400 break-all select-all border border-zinc-800">
                      0x{simulationResult.bobPublicKey.slice(0, 80)}...
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-zinc-400">3. Bob Computes Shared Secret (S₆ = Aᵇ mod p)</span>
                    <div className="mt-1 p-2 rounded-lg bg-black font-mono text-[11px] text-white font-bold break-all select-all border border-zinc-800">
                      0x{simulationResult.bobDerivedSecretHex.slice(0, 80)}...
                    </div>
                  </div>
                </div>
              </div>

              {/* Handshake Result Verification & Session Key */}
              <div className="rounded-2xl border border-orange-500/30 bg-orange-950/20 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-400">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Shared Secrets Aligned: Sₐ ≡ S₆ ≡ gᵃᵇ (mod p)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-white bg-zinc-900 border border-orange-500/40 px-3 py-1 rounded-lg">
                    <Clock className="h-3.5 w-3.5 text-orange-500" />
                    <span>Handshake Latency: {simulationResult.durationMs} ms</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                    <span>Derived 256-Bit Symmetric Session Key (via HKDF-SHA256)</span>
                    <button
                      onClick={() => copyToClipboard(simulationResult.derivedSessionKeyHex, 'hkdf')}
                      className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copiedLabel === 'hkdf' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>Copy Key</span>
                    </button>
                  </div>
                  <div className="mt-1.5 p-3 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-orange-400 font-bold break-all select-all">
                    0x{simulationResult.derivedSessionKeyHex}
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400">
                    This derived session key can now be loaded directly into the AES-256-GCM engine for authenticated symmetrical traffic.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL PEER KEY AGREEMENT */}
      {activeMode === 'manual' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 space-y-5">
          <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Manual Key Exchange Step</h3>
            <LiquidButton
              variant="primary"
              size="xs"
              onClick={handleGenerateMyKeys}
            >
              Generate My DH Keypair
            </LiquidButton>
          </div>

          {myKeyPair ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-zinc-300">My Public Key (Send this to peer):</span>
                <textarea
                  readOnly
                  rows={3}
                  value={myKeyPair.publicKeyHex}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-orange-400 select-all"
                />
              </div>

              <form onSubmit={handleComputeManualSecret} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Peer's Public Key (Hex):</label>
                  <textarea
                    rows={3}
                    value={peerPublicKey}
                    onChange={(e) => setPeerPublicKey(e.target.value)}
                    required
                    placeholder="Paste peer's public key hex..."
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                  />
                  {peerPublicKey && (
                    <div className="mt-2">
                      <EntropyStrengthMeter
                        value={peerPublicKey}
                        algorithm="dh"
                        label="Peer Public Key Entropy & Distribution"
                      />
                    </div>
                  )}
                </div>

                <LiquidButton
                  type="submit"
                  disabled={manualLoading || !peerPublicKey}
                  variant="primary"
                  size="md"
                >
                  {manualLoading ? 'Computing BigInt Secret...' : 'Derive Shared Secret & Session Key'}
                </LiquidButton>
              </form>

              {manualResult && (
                <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 p-4 space-y-2">
                  <span className="text-xs font-bold text-orange-400">Derived 256-Bit Session Key:</span>
                  <div className="p-2.5 rounded-lg bg-black font-mono text-xs text-orange-400 font-bold break-all">
                    0x{manualResult.derivedSessionKeyHex}
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">Computation time: {manualResult.durationMs} ms</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 text-xs">
              Click "Generate My DH Keypair" to initialize your local Diffie-Hellman exponent.
            </div>
          )}
        </div>
      )}

      {/* Theory & Parameters */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2 text-xs text-zinc-400">
        <h4 className="font-bold text-white text-xs">Mathematical Foundation (RFC 3526 MODP Group 14):</h4>
        <p className="leading-relaxed">
          Diffie-Hellman key agreement leverages the Discrete Logarithm Problem: while computing g^a mod p is trivial with modular exponentiation, finding a given g^a mod p is computationally intractable for 2048-bit prime modulus. RFC 3526 defines Group 14 using a safe prime p = 2q + 1 where q is also prime, preventing small subgroup confinement attacks. HKDF (RFC 5869) extracts and expands the raw shared integer into a uniformly distributed 256-bit symmetric key.
        </p>
      </div>
    </div>
  );
};
