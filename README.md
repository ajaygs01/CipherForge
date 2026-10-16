# CipherForge 🛡️⚡
### Next-Generation Three-Tier Cryptography Workbench & Zero-Knowledge Security Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![React: 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript: 5+](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite: 6+](https://img.shields.io/badge/Vite-6+-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS: v4](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![NIST Standards](https://img.shields.io/badge/Standards-NIST%20FIPS%20180--4%20%7C%20SP%20800--38D-emerald.svg)](https://csrc.nist.gov/)
[![GitHub: CipherForge](https://img.shields.io/badge/GitHub-ajaygs01%2FCipherForge-orange.svg)](https://github.com/ajaygs01/CipherForge)

---

## 🌟 Executive Overview

**CipherForge** is an enterprise-grade cryptographic workbench and telemetry platform engineered by **Ajay G S**. Developed under the academic supervision of **Prof. Syeda Ayesha Amreen** at the **Department of Information Science and Engineering, HKBK College of Engineering (affiliated with Visvesvaraya Technological University - VTU)**.

CipherForge bridges the gap between theoretical cryptography and real-world high-assurance implementation, combining six foundational primitives across three security domains:
1. **Authenticated Symmetric Encryption**: AES-256-GCM with Scrypt key derivation and 128-bit Galois GHASH authentication tags.
2. **Public-Key Cryptography**: RSA-OAEP (2048-bit / 3072-bit) with SHA-256 mask generation (MGF1).
3. **Modular Key Exchange**: Ephemeral Diffie-Hellman over RFC 3526 MODP Group 14 (2048-bit) with HKDF derivation.
4. **Collision-Resistant Hashing & File Integrity**: SHA-256 Merkle-Damgård engine with file/image encryption, checksum verification, and 64-character hexadecimal alignment diffing.
5. **Cryptanalytic Avalanche Benchmarking**: MD5 and DES-CBC bit-level diffusion matrices illustrating legacy vulnerabilities and strict avalanche criteria.
6. **Real-Time Visual Entropy Strength Meter**: Live Shannon entropy ($H = -\sum p_i \log_2 p_i$), pool diversity, keyspace estimation, and brute-force crack-time analytics.

---

## 🚀 Key Modules & Capabilities

### 1. AES-256-GCM Authenticated Encryption (AEAD)
- **Standard**: NIST SP 800-38D.
- **Key Derivation**: Scrypt KDF with configurable salt and work factors ($N=16384, r=8, p=1$).
- **Initialization Vector**: Cryptographically secure 96-bit IV generated via `crypto.getRandomValues`.
- **Integrity Tag**: 128-bit Galois Message Authentication Code (GMAC) preventing ciphertext manipulation or bit-flipping attacks.
- **Payload Verification**: Real-time decryptor and Galois GHASH rejection test.

### 2. RSA-OAEP Public-Key Infrastructure
- **Standard**: PKCS#1 v2.2 / RFC 8017.
- **Key Generation**: 2048-bit and 3072-bit asymmetric keypair generation via Web Cryptography API.
- **Padding**: Optimal Asymmetric Encryption Padding (OAEP) parameterized with SHA-256.
- **Key Management**: Zero-knowledge PEM certificate export, fingerprinting, and public-key encryption / private-key decryption workflows.

### 3. Ephemeral Diffie-Hellman Key Agreement
- **Standard**: RFC 3526 (MODP Group 14, 2048-bit Prime) & RFC 5869 (HKDF).
- **Exchange Simulation**: Dual-party simulated key exchange (Alice $\leftrightarrow$ Bob) and manual peer public key computation.
- **Secret Derivation**: Derives matching 256-bit symmetric session keys over untrusted channels without transmitting the private exponents.

### 4. SHA-256 Cryptographic Digest & File Authenticity Suite
- **Standard**: NIST FIPS 180-4.
- **File & Image Cipher**: Encrypts and decrypts images (PNG, JPG, WebP) and binaries using 256-bit keys derived via SHA-256, proving bit-exact restoration against the original digest.
- **Real-Time File Verification**: Drag-and-drop any file/image up to 50 MB to compute its 256-bit hash and immediately verify against an authoritative reference checksum.
- **Hex Alignment Diff Matrix**: Visual 64-character interactive grid highlighting matching and divergent bytes with bit divergence metrics.
- **Avalanche Effect Explorer**: Bit-by-bit diffusion matrix (256 output bits) proving ~50% bit divergence on single-character input mutations.

### 5. Historical Cryptanalytic Benchmarks
- **MD5 (RFC 1321)**: Explores 128-bit Merkle-Damgård hashing, bit diffusion, and collision vulnerabilities.
- **DES (NIST FIPS 46-3)**: 16-round Feistel cipher demonstration with 56-bit effective key space, weak key detection, and brute-force vulnerability analysis.

### 6. Real-Time Shannon Entropy Strength Meter
- Evaluates password and key quality across all algorithm pages using mathematical Shannon entropy.
- Multi-dimensional scoring: length, character set diversity, repetition penalties, sequential penalties, and algorithm-specific constraints.
- Visual feedback: 5-stage fluid gradient meter, crack time estimations from $10^{10}$ guesses/sec botnets, and an interactive mathematical formula inspector.

### 7. Audit Register & Vector PDF Reporting
- In-memory zero-knowledge operational telemetry log recorded with Indian Standard Time (IST) timestamps.
- Single-transaction cryptographic certification and comprehensive multi-page landscape audit registers generated on-the-fly via `jsPDF` and `jspdf-autotable`.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: React 19, TypeScript 5, Vite 6
- **Styling & UI**: Tailwind CSS v4, Lucide React Icons
- **Animation & FX**: Viscous Liquid Wave SVG mechanics, pointer-tracking molten orb shaders
- **Cryptography Engine**: Web Cryptography API (`crypto.subtle`), Scrypt KDF, NIST FIPS certified algorithms
- **Document Generation**: jsPDF, jspdf-autotable
- **Testing**: Automated verification test suite (73/73 passing tests)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/ajaygs01/CipherForge.git

# Navigate to the project directory
cd CipherForge

# Install all dependencies
npm install

# Start the local development server (port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to launch the workbench.

### Production Build

```bash
# Type check and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

### Code Quality & Validation

```bash
# Run TypeScript compilation and strict lint checks
npm run lint
```

---

## 🎓 Academic Credentials & Attribution

| Role | Details |
| :--- | :--- |
| **Project Title** | CipherForge: Multi-Algorithm Cryptography & Secure Data Protection System |
| **Lead Developer** | **Ajay G S** ([@ajaygs01](https://github.com/ajaygs01)) |
| **Contact Phone** | `+91 9686352137` |
| **Email** | `gsajay18@gmail.com` |
| **Project Guide** | **Prof. Syeda Ayesha Amreen**, Assistant Professor |
| **Department** | Department of Information Science & Engineering (ISE) |
| **Institution** | HKBK College of Engineering, Bengaluru |
| **University** | Visvesvaraya Technological University (VTU), Belagavi |
| **Repository** | [https://github.com/ajaygs01/CipherForge](https://github.com/ajaygs01/CipherForge) |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
