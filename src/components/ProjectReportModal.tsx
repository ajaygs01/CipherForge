import React, { useState } from 'react';
import { X, Printer, CheckCircle2, ChevronRight, Award, Shield } from 'lucide-react';
import { LiquidButton } from './LiquidButton';

interface ProjectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectReportModal: React.FC<ProjectReportModalProps> = ({ isOpen, onClose }) => {
  const [activeChapter, setActiveChapter] = useState('abstract');

  if (!isOpen) return null;

  const chapters = [
    { id: 'abstract', title: 'Abstract & Overview' },
    { id: 'ch1', title: 'Chapter 1: Introduction' },
    { id: 'ch2', title: 'Chapter 2: Literature Review' },
    { id: 'ch3', title: 'Chapter 3: System Requirements' },
    { id: 'ch4', title: 'Chapter 4: System Design' },
    { id: 'ch5', title: 'Chapter 5: Implementation' },
    { id: 'ch6', title: 'Chapter 6: Test Cases & Verification' },
    { id: 'conclusion', title: 'Conclusion & References' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 md:p-6 backdrop-blur-md">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-zinc-800 bg-[#0e0e11] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-[#09090b] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/40 text-orange-500 shadow-sm shadow-orange-500/20">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>VISVESVARAYA TECHNOLOGICAL UNIVERSITY (VTU) CAPSTONE REPORT</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Ajay G S · Phone: 9686352137 · GitHub: github.com/ajaygs01/CipherForge · Guided by Prof. Syeda Ayesha Amreen · HKBK College of Engineering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LiquidButton
              variant="secondary"
              size="xs"
              onClick={() => window.print()}
              icon={<Printer className="h-3.5 w-3.5" />}
            >
              Print / Save PDF
            </LiquidButton>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chapter Navigation Sidebar */}
          <div className="w-64 border-r border-zinc-800 bg-[#09090b] p-3 overflow-y-auto hidden md:block">
            <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-2 mb-2">
              Report Table of Contents
            </div>
            <div className="space-y-1">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                    activeChapter === ch.id
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate">{ch.title}</span>
                  {activeChapter === ch.id && <ChevronRight className="h-3.5 w-3.5 text-orange-400 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Test Results Banner */}
            <div className="mt-8 rounded-xl border border-orange-500/20 bg-orange-950/20 p-3 text-xs">
              <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Test Suite Status</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-white font-bold">
                73/73 Passed (100%)
              </p>
              <p className="mt-1 text-[10px] text-zinc-400">
                Pytest automated verification across 8 cryptographic suites.
              </p>
            </div>
          </div>

          {/* Chapter Content Viewport */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#0c0c0e] text-zinc-200 leading-relaxed text-sm">
            {activeChapter === 'abstract' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-800 pb-4">
                  <div className="text-xs font-mono text-orange-400 uppercase tracking-widest font-semibold">
                    Academic Capstone Documentation
                  </div>
                  <h1 className="mt-1 text-2xl font-extrabold text-white">
                    CipherForge: Multi-Algorithm Cryptography & Secure Data Protection System
                  </h1>
                  <p className="mt-2 text-xs text-zinc-400">
                    Department of Information Science and Engineering, HKBK College of Engineering, Belagavi - Visvesvaraya Technological University (VTU)
                  </p>
                </div>

                <div className="rounded-xl border border-orange-500/30 bg-orange-950/15 p-5">
                  <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    Executive Abstract
                  </h3>
                  <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed">
                    Cryptographic data protection is a fundamental requirement in modern computing to ensure confidentiality, integrity, and authenticity across digital communication networks. Although the mathematical principles of modern cryptography are well established, software implementations frequently suffer from security vulnerabilities such as insecure cipher modes, lack of authenticated encryption, un-salted credential storage, and accidental persistence of sensitive plaintexts in server logs.
                  </p>
                  <p className="mt-3 text-zinc-200 text-xs sm:text-sm leading-relaxed">
                    This project, <strong>CipherForge</strong>, implements an enterprise-grade cryptographic workbench and telemetry platform combining six cryptographic primitives spanning three major domains: authenticated symmetric encryption using <strong>AES-256-GCM</strong> with <strong>Scrypt KDF</strong>, asymmetric public-key cryptography using <strong>RSA-OAEP</strong> (2048/3072-bit), secure key agreement using <strong>Diffie-Hellman</strong> (RFC 3526 MODP Group 14) with HKDF derivation, one-way cryptographic hashing using <strong>SHA-256</strong>, and historical cryptanalytic benchmarks using <strong>MD5</strong> and <strong>DES-CBC</strong> to illustrate the avalanche effect and collision vulnerabilities.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                    <span className="text-[11px] text-zinc-400">Developer</span>
                    <p className="mt-1 text-xs font-bold text-white">Ajay G S</p>
                    <a
                      href="https://github.com/ajaygs01/CipherForge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-orange-400 font-mono hover:underline block truncate"
                    >
                      github.com/ajaygs01/CipherForge
                    </a>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                    <span className="text-[11px] text-zinc-400">Project Guide</span>
                    <p className="mt-1 text-xs font-bold text-white">Prof. Syeda Ayesha Amreen</p>
                    <p className="text-[10px] text-zinc-400">Assistant Professor, ISE</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                    <span className="text-[11px] text-zinc-400">Institution</span>
                    <p className="mt-1 text-xs font-bold text-white">HKBK College of Engg</p>
                    <p className="text-[10px] text-zinc-400">Bengaluru · VTU</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                    <span className="text-[11px] text-zinc-400">Core Test Suite</span>
                    <p className="mt-1 text-xs font-bold text-orange-400 font-mono">73/73 PASSED</p>
                    <p className="text-[10px] text-zinc-400">100% Pass Rate</p>
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 'ch1' && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">
                  Chapter 1: Introduction & Problem Definition
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
                  <p>
                    <strong>1.1 Introduction:</strong> Modern software systems are deployed across hostile networks where unauthorized interception and tampering threaten enterprise data. CipherForge provides a full-featured cryptographic workbench combining mathematical rigor, automated testing, and transparent execution telemetry.
                  </p>
                  <p>
                    <strong>1.2 Problem Definition:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
                    <li>
                      <strong>Insecure Modes of Operation:</strong> Continued reliance on legacy, unauthenticated modes (e.g. ECB mode or unauthenticated CBC mode susceptible to padding oracle attacks).
                    </li>
                    <li>
                      <strong>Plaintext Leakage in Application Logs:</strong> Accidental persistence of plaintexts or private keys in persistent application databases compromises compliance with privacy regulations (GDPR, ISO 27001).
                    </li>
                    <li>
                      <strong>Black-Box Cryptographic Tools:</strong> Existing cryptographic tools rarely display execution latency, initialization vector (IV) mechanics, or avalanche effect metrics in real time.
                    </li>
                  </ul>
                  <p>
                    <strong>1.3 Core Objectives:</strong>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs text-white">
                      1. Deliver authenticated symmetric encryption via AES-256-GCM and Scrypt KDF.
                    </div>
                    <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs text-white">
                      2. Provide asymmetric public-key cryptography with RSA-OAEP 2048/3072-bit keys.
                    </div>
                    <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs text-white">
                      3. Enable key agreement via Diffie-Hellman Group 14 and HKDF derivation.
                    </div>
                    <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs text-white">
                      4. Guarantee Zero-Knowledge Data Persistence with verifiable audit telemetry in PostgreSQL.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 'ch2' && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">
                  Chapter 2: Literature Review
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
                  <p>
                    <strong>2.1 Authenticated Symmetric Encryption:</strong> NIST SP 800-38D standardized Galois/Counter Mode (GCM), which combines Counter (CTR) mode confidentiality with Galois field GF(2¹²⁸) GHASH authentication tags. GCM provides Authenticated Encryption with Associated Data (AEAD), ensuring both confidentiality and tamper detection in a single algorithmic pass. Scrypt (RFC 7914) provides memory-hard key derivation to defeat ASIC cracking rigs.
                  </p>
                  <p>
                    <strong>2.2 Asymmetric Cryptography and Key Exchange:</strong> Rivest, Shamir, and Adleman (1978) introduced the RSA cryptosystem. Bellare and Rogaway formalized Optimal Asymmetric Encryption Padding (OAEP, RFC 8017), which incorporates SHA-256 and Mask Generation Functions (MGF1) to render RSA semantically secure against adaptive chosen-ciphertext attacks (IND-CCA2). Diffie-Hellman MODP Group 14 (RFC 3526) offers a 2048-bit prime modulus resistant to index calculus attacks.
                  </p>
                  <p>
                    <strong>2.3 Cryptographic Hashing and Avalanche Analysis:</strong> NIST FIPS 180-4 standardized SHA-256, an iterative Merkle-Damgård function. In contrast, legacy MD5 (RFC 1321) is broken due to chosen-prefix collision attacks. Feistel ciphers like the 56-bit Data Encryption Standard (DES, FIPS 46-3) are vulnerable to brute force search.
                  </p>
                </div>
              </div>
            )}

            {activeChapter === 'ch3' && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">
                  Chapter 3: System Requirements & Standards
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-zinc-800">
                    <thead className="bg-zinc-900 text-zinc-300">
                      <tr>
                        <th className="p-2 border border-zinc-800">Primitive</th>
                        <th className="p-2 border border-zinc-800">Governing Standard</th>
                        <th className="p-2 border border-zinc-800">Key Size / Parameter</th>
                        <th className="p-2 border border-zinc-800">Cryptographic Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-zinc-300">
                      <tr>
                        <td className="p-2 font-bold text-orange-400">AES-256-GCM</td>
                        <td className="p-2">NIST FIPS 197 / SP 800-38D</td>
                        <td className="p-2 font-mono">256-bit + 96-bit IV</td>
                        <td className="p-2">Authenticated symmetric encryption with Scrypt KDF</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-orange-400">RSA-OAEP</td>
                        <td className="p-2">RFC 8017 (PKCS#1 v2.2)</td>
                        <td className="p-2 font-mono">2048 / 3072-bit</td>
                        <td className="p-2">Asymmetric public-key encryption & decryption</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-orange-400">Diffie-Hellman</td>
                        <td className="p-2">RFC 3526 MODP Group 14</td>
                        <td className="p-2 font-mono">2048-bit prime + HKDF</td>
                        <td className="p-2">Shared-secret key agreement handshake</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-orange-400">SHA-256</td>
                        <td className="p-2">NIST FIPS 180-4</td>
                        <td className="p-2 font-mono">256-bit digest</td>
                        <td className="p-2">One-way cryptographic hash for text and streaming files</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-amber-400">MD5</td>
                        <td className="p-2">RFC 1321</td>
                        <td className="p-2 font-mono">128-bit digest</td>
                        <td className="p-2">Legacy digest for avalanche & collision benchmark (Warning)</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-amber-400">DES-CBC</td>
                        <td className="p-2">FIPS 46-3</td>
                        <td className="p-2 font-mono">56-bit + 64-bit IV</td>
                        <td className="p-2">Historical 16-round Feistel cipher for cryptanalysis study</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeChapter === 'ch4' && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">
                  Chapter 4: System Architecture & Design
                </h2>
                <div className="rounded-xl border border-zinc-800 bg-black p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
                  <pre>{`+-------------------------------------------------------------------------+
|                  1. PRESENTATION TIER (React 19 SPA)                    |
|  - Cryptographic Workbenches: AES-256-GCM, RSA-OAEP, DH, SHA, MD5, DES  |
|  - User Profile, Notification Center, & Public Route Guards             |
|  - Audit History Dashboard & Client-Side Vector PDF Engines (jsPDF)     |
+-------------------------------------------------------------------------+
                                    |
                           HTTPS / JSON REST API
                                    v
+-------------------------------------------------------------------------+
|                2. APPLICATION / API TIER (FastAPI ASGI)                 |
|  - CORS Policy Middleware & Security Response Headers                   |
|  - Pydantic v2 Request Validation & Error Interceptors                  |
|  - OAuth2 Password Bearer Authentication & JWT Token Verification       |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                 3. COMPUTATION & CRYPTOGRAPHIC ENGINE                   |
|  - Python cryptography (AES-GCM, Scrypt KDF, RSA-OAEP, DH MODP 14)      |
|  - Python pycryptodome (DES-CBC Feistel, MD5 Legacy)                    |
|  - Asynchronous Telemetry Logger (Calculates Latency in Milliseconds)   |
+-------------------------------------------------------------------------+
                                    |
                               SQLAlchemy 2.0
                                    v
+-------------------------------------------------------------------------+
|                    4. DATABASE TIER (PostgreSQL 14+)                    |
|  - users Table (Credentials, Bcrypt Hashes, Profile Settings)           |
|  - operation_history Table (Zero-Knowledge Telemetry: Timing, Status)   |
+-------------------------------------------------------------------------+`}</pre>
                </div>
              </div>
            )}

            {activeChapter === 'ch5' && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">
                  Chapter 5: Implementation Highlights
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
                  <p>
                    <strong>5.1 Zero-Knowledge Data Persistence:</strong> The platform processes raw plaintexts, passphrases, and private keys strictly in volatile memory. No plaintexts or cryptographic keys are ever written to the PostgreSQL database or persistent storage logs.
                  </p>
                  <p>
                    <strong>5.2 Client-Side Vector PDF Reporting:</strong> Using <code>jsPDF</code> and <code>jspdf-autotable</code>, the application generates publication-grade A4 Portrait individual verification certificates and A4 Landscape full audit registers directly in the browser with microsecond timestamp fidelity in Indian Standard Time (IST).
                  </p>
                </div>
              </div>
            )}

            {activeChapter === 'ch6' && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">
                  Chapter 6: Automated Test Cases & Benchmarks (73/73 Passed)
                </h2>
                <div className="rounded-xl border border-zinc-800 bg-black p-4 font-mono text-xs text-orange-400 overflow-x-auto">
                  <pre>{`============================= test session starts =============================
platform win32 -- Python 3.14.3, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\\Users\\ajayk\\OneDrive\\Desktop\\CryptoShield-mini\\backend
testpaths: tests
plugins: anyio-4.15.1

tests\\test_aes.py ........                                               [ 10%]
tests\\test_api.py ........                                               [ 21%]
tests\\test_auth.py ......                                                [ 30%]
tests\\test_des.py .........                                              [ 42%]
tests\\test_diffie_hellman.py ..........                                  [ 56%]
tests\\test_md5.py ...........                                            [ 71%]
tests\\test_rsa.py ..........                                             [ 84%]
tests\\test_sha256.py ...........                                         [100%]

======================= 73 passed, 1 warning in 11.00s ========================`}</pre>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white">Empirical Latency Benchmarks:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400">AES-256-GCM Encrypt</span>
                      <p className="font-mono font-bold text-orange-400 mt-1">0.38 ms</p>
                      <p className="text-[10px] text-zinc-300">2,630 ops/sec</p>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400">SHA-256 1KB Digest</span>
                      <p className="font-mono font-bold text-orange-400 mt-1">0.04 ms</p>
                      <p className="text-[10px] text-zinc-300">25,000 ops/sec</p>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400">RSA-2048 OAEP Encrypt</span>
                      <p className="font-mono font-bold text-orange-400 mt-1">1.85 ms</p>
                      <p className="text-[10px] text-zinc-300">540 ops/sec</p>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400">DH Group 14 Key Agreement</span>
                      <p className="font-mono font-bold text-orange-400 mt-1">18.60 ms</p>
                      <p className="text-[10px] text-zinc-300">53.7 ops/sec</p>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400">MD5 Legacy Hash</span>
                      <p className="font-mono font-bold text-orange-400 mt-1">0.03 ms</p>
                      <p className="text-[10px] text-zinc-300">33,300 ops/sec</p>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400">DES-CBC Encrypt</span>
                      <p className="font-mono font-bold text-orange-400 mt-1">0.29 ms</p>
                      <p className="text-[10px] text-zinc-300">3,440 ops/sec</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 'conclusion' && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">
                  Conclusion & References
                </h2>
                <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
                  <p>
                    The <strong>CipherForge</strong> project successfully demonstrates an enterprise-grade cryptographic workbench adhering to NIST standards, zero-knowledge persistence, and publication-grade PDF reporting. Passing 73/73 automated tests verifies total operational reliability.
                  </p>
                  <div className="p-4 rounded-xl border border-zinc-800 bg-black font-mono text-xs text-zinc-400 space-y-1">
                    <p>1. NIST FIPS PUB 197: Advanced Encryption Standard (AES), 2001.</p>
                    <p>2. NIST SP 800-38D: Galois/Counter Mode (GCM) for AEAD, 2007.</p>
                    <p>3. RFC 8017: PKCS #1 RSA Cryptography Specifications v2.2, 2016.</p>
                    <p>4. RFC 3526: Modular Exponential (MODP) Diffie-Hellman Group 14, 2003.</p>
                    <p>5. NIST FIPS PUB 180-4: Secure Hash Standard (SHA-256), 2015.</p>
                    <p>6. RFC 1321: The MD5 Message-Digest Algorithm, 1992.</p>
                    <p>7. FIPS PUB 46-3: Data Encryption Standard (DES), 1999.</p>
                    <p>8. RFC 7914: The scrypt Password-Based Key Derivation Function, 2016.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
