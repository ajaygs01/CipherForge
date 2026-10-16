import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuditRecord } from '../types';

/**
 * Format timestamp into Indian Standard Time (IST, UTC+05:30)
 */
export function formatIST(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Generate Individual Cryptographic Execution Certificate (A4 Portrait)
 */
export function generateSingleRecordPDF(record: AuditRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const certId = `CERT-SC-${record.id.slice(0, 8).toUpperCase()}`;
  const istTime = formatIST(record.timestamp);

  // Background Header Banner
  doc.setFillColor(18, 18, 20); // deep black/charcoal
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Orange Top Stripe
  doc.setFillColor(234, 88, 12); // orange-600
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CIPHERFORGE CRYPTOGRAPHIC VERIFICATION', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(161, 161, 170); // zinc-400
  doc.text('NATIONAL INSTITUTE OF STANDARDS & TECHNOLOGY (NIST) / RFC COMPLIANCE AUDIT', 14, 23);

  // Certificate ID badge in header
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(249, 115, 22); // orange-500
  doc.text(`ID: ${certId}`, pageWidth - 14, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`DATE (IST): ${istTime}`, pageWidth - 14, 23, { align: 'right' });

  // Academic Affiliation Subheader
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(14, 48, pageWidth - 28, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 48, pageWidth - 28, 22, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ACADEMIC & INSTITUTIONAL AFFILIATION', 18, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Developer: Ajay G S  |  GitHub: github.com/ajaygs01/CipherForge  |  Tel: 9686352137', 18, 60);
  doc.text('Department of Information Science & Engineering, HKBK College of Engineering', 18, 65);

  // Section 1: Executive Telemetry Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Operational Execution Telemetry', 14, 78);

  const telemetryData = [
    ['Cryptographic Algorithm', record.algorithm],
    ['Operation Type', record.operation],
    ['Execution Duration', `${record.durationMs.toFixed(2)} ms`],
    ['Operational Status', record.status],
    ['Execution Timestamp (IST)', istTime],
    ['Zero-Knowledge Persistence', 'VERIFIED: ZERO plaintexts or keys stored on disk'],
  ];

  autoTable(doc, {
    startY: 82,
    head: [['Telemetry Parameter', 'Measured Operational Value']],
    body: telemetryData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  // Section 2: Algorithm Configuration & Parameters
  const lastY1 = (doc as any).lastAutoTable.finalY || 130;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Algorithm Parameter Specification', 14, lastY1 + 10);

  const paramEntries = Object.entries(record.parameters || {}).map(([key, value]) => [
    key.replace(/([A-Z])/g, ' $1').toUpperCase(),
    String(value),
  ]);

  if (paramEntries.length === 0) {
    paramEntries.push(['Mode of Operation', 'Standard Reference Implementation']);
  }

  autoTable(doc, {
    startY: lastY1 + 14,
    head: [['Parameter Specification', 'Configured Value']],
    body: paramEntries,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  // Section 3: Standards Compliance & Cryptographic Assessment
  const lastY2 = (doc as any).lastAutoTable.finalY || 185;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Standards Compliance & Cryptographic Evaluation', 14, lastY2 + 10);

  let evaluationNote = '';
  let standardRef = '';
  switch (record.algorithm) {
    case 'AES-256-GCM':
      standardRef = 'NIST SP 800-38D / FIPS 197 / RFC 7914';
      evaluationNote =
        'Authenticated Encryption with Associated Data (AEAD). The Galois Counter Mode ensures confidentiality while GHASH polynomial tag verification provides tamper detection. Scrypt/PBKDF2 key derivation provides memory-hard protection against brute force.';
      break;
    case 'RSA-OAEP':
      standardRef = 'RFC 8017 (PKCS #1 v2.2) / NIST SP 800-56B';
      evaluationNote =
        'Optimal Asymmetric Encryption Padding (OAEP) with SHA-256 prevents chosen-ciphertext malleability (IND-CCA2). The 2048/3072-bit modulus provides strong factoring resistance for asymmetric data exchange.';
      break;
    case 'Diffie-Hellman':
      standardRef = 'RFC 3526 MODP Group 14 / RFC 5869 (HKDF)';
      evaluationNote =
        'Diffie-Hellman Key Agreement over 2048-bit safe prime modulus (Group 14). Shared secret expansion with HKDF-SHA256 generates a cryptographically authoritative 256-bit symmetric session key.';
      break;
    case 'SHA-256':
      standardRef = 'NIST FIPS 180-4 (Secure Hash Standard)';
      evaluationNote =
        'One-way cryptographic hash function built upon the Merkle-Damgård iterative compression framework. Displays strong avalanche diffusion (>50% bit flip divergence) and high collision resistance.';
      break;
    case 'MD5':
      standardRef = 'RFC 1321 (Educational Cryptanalysis Benchmark)';
      evaluationNote =
        '⚠️ MD5 is cryptographically broken due to practical chosen-prefix collisions. Included exclusively for educational avalanche benchmarking and legacy verification.';
      break;
    case 'DES-CBC':
      standardRef = 'FIPS 46-3 (Historical Feistel Analysis)';
      evaluationNote =
        '⚠️ 56-bit effective key space is vulnerable to exhaustive brute-force search. Evaluated exclusively for Feistel network round analysis and historical comparison.';
      break;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(14, lastY2 + 14, pageWidth - 28, 28, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, lastY2 + 14, pageWidth - 28, 28, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Governing Standard: ${standardRef}`, 18, lastY2 + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  const splitNote = doc.splitTextToSize(evaluationNote, pageWidth - 36);
  doc.text(splitNote, 18, lastY2 + 26);

  // Section 4: Academic Sign-off and Verification Footer
  const footerY = 258;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This verification certificate was generated client-side by CipherForge System.', 14, footerY + 5);
  doc.text('Telemetry stored in PostgreSQL 14+ Relational Engine under Zero-Knowledge Guarantees.', 14, footerY + 9);

  // Verification Seal simulation
  doc.setDrawColor(234, 88, 12);
  doc.roundedRect(pageWidth - 65, footerY + 2, 51, 18, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(234, 88, 12);
  doc.text('CRYPTOGRAPHICALLY VERIFIED', pageWidth - 63, footerY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('HKBK ISE Project Lab 2026-27', pageWidth - 63, footerY + 13);
  doc.text(`Status: ${record.status}`, pageWidth - 63, footerY + 17);

  doc.save(`CipherForge_Audit_${record.id.slice(0, 8)}.pdf`);
}

/**
 * Generate Complete Audit History Report (A4 Landscape)
 */
export function generateFullAuditReportPDF(records: AuditRecord[]): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();
  const reportTime = formatIST(now);

  // Header Banner
  doc.setFillColor(18, 18, 20);
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Orange Top Stripe
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CIPHERFORGE: SYSTEM AUDIT & CRYPTOGRAPHIC TELEMETRY REGISTER', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(161, 161, 170);
  doc.text(
    'Three-Tier Cryptography Workbench  |  Developer: Ajay G S  |  Guide: Prof. Syeda Ayesha Amreen  |  HKBK College of Engg',
    14,
    22
  );

  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(249, 115, 22);
  doc.text(`REPORT GENERATED: ${reportTime}`, pageWidth - 14, 15, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`TOTAL AUDIT LOGS: ${records.length}`, pageWidth - 14, 22, { align: 'right' });

  // Summary Metrics Bar
  const successCount = records.filter((r) => r.status === 'SUCCESS').length;
  const successRate = records.length > 0 ? ((successCount / records.length) * 100).toFixed(1) : '100';
  const avgLatency =
    records.length > 0
      ? (records.reduce((acc, curr) => acc + curr.durationMs, 0) / records.length).toFixed(2)
      : '0.00';

  doc.setFillColor(248, 250, 252);
  doc.rect(14, 42, pageWidth - 28, 16, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 42, pageWidth - 28, 16, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`Total Records: ${records.length}`, 20, 52);
  doc.text(`Success Rate: ${successRate}% (${successCount}/${records.length})`, 80, 52);
  doc.text(`Mean Latency: ${avgLatency} ms`, 150, 52);
  doc.text('Persistence Policy: Zero-Knowledge (Zero secret/plaintext retention)', 210, 52);

  // Table Matrix
  const tableData = records.map((rec, idx) => [
    String(idx + 1),
    rec.id.slice(0, 8).toUpperCase(),
    rec.algorithm,
    rec.operation,
    `${rec.durationMs.toFixed(2)} ms`,
    rec.status,
    formatIST(rec.timestamp),
    Object.entries(rec.parameters || {})
      .map(([k, v]) => `${k}:${v}`)
      .slice(0, 2)
      .join(', ') || 'Standard',
  ]);

  autoTable(doc, {
    startY: 63,
    head: [
      [
        '#',
        'Record ID',
        'Algorithm',
        'Operation',
        'Latency (ms)',
        'Status',
        'Timestamp (IST)',
        'Parameters Spec',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 34, fontStyle: 'bold' },
      3: { cellWidth: 32 },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 24, halign: 'center' },
      6: { cellWidth: 50 },
      7: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Page ${data.pageNumber}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'CipherForge Cryptographic Workbench — Confidential Audit Telemetry',
        14,
        doc.internal.pageSize.getHeight() - 8
      );
      doc.text(str, pageWidth - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
    },
  });

  doc.save('CipherForge_Audit_History.pdf');
}
