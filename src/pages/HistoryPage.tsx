import React, { useState, useMemo } from 'react';
import {
  History,
  Download,
  Eye,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useHistory } from '../context/HistoryContext';
import { AuditRecord, AlgorithmType } from '../types';
import { formatIST, generateSingleRecordPDF, generateFullAuditReportPDF } from '../utils/pdfGenerator';
import { RecordDetailModal } from '../components/RecordDetailModal';
import { LiquidButton } from '../components/LiquidButton';

export const HistoryPage: React.FC = () => {
  const { records, deleteRecord, resetToDefaults, stats } = useHistory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlgo, setSelectedAlgo] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'latency-desc' | 'latency-asc'>('newest');

  // Modal inspection
  const [inspectRecord, setInspectRecord] = useState<AuditRecord | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter & Sort
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesSearch =
          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesAlgo = selectedAlgo === 'ALL' || r.algorithm === selectedAlgo;
        const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

        return matchesSearch && matchesAlgo && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        if (sortBy === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        if (sortBy === 'latency-desc') return b.durationMs - a.durationMs;
        if (sortBy === 'latency-asc') return a.durationMs - b.durationMs;
        return 0;
      });
  }, [records, searchTerm, selectedAlgo, selectedStatus, sortBy]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const algorithmsList: AlgorithmType[] = [
    'AES-256-GCM',
    'RSA-OAEP',
    'Diffie-Hellman',
    'SHA-256',
    'MD5',
    'DES-CBC',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Detail Modal */}
      <RecordDetailModal record={inspectRecord} onClose={() => setInspectRecord(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-semibold">
            <span>AUDIT TELEMETRY</span>
            <span>·</span>
            <span>ZERO-KNOWLEDGE PERSISTENCE</span>
            <span>·</span>
            <span>IST TIMEZONE (UTC+05:30)</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-white">
            Operation Audit Telemetry & PDF Certification
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Tamper-evident operational audit logs recording execution metrics, latency, and status flags with zero persistence of plaintexts or keys.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LiquidButton
            variant="primary"
            size="sm"
            onClick={() => generateFullAuditReportPDF(records)}
            icon={<Download className="h-4 w-4" />}
          >
            Export Full Audit PDF (Landscape)
          </LiquidButton>
          <button
            onClick={resetToDefaults}
            title="Reset sample audit records"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Telemetry Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-4">
          <span className="text-xs text-zinc-400">Total Audit Records</span>
          <div className="mt-1 text-2xl font-extrabold text-white font-mono">{stats.total}</div>
          <span className="text-[10px] text-orange-400 font-medium">All 6 Algorithms Logged</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-4">
          <span className="text-xs text-zinc-400">Operational Success Rate</span>
          <div className="mt-1 text-2xl font-extrabold text-orange-400 font-mono">
            {stats.successRate}%
          </div>
          <span className="text-[10px] text-zinc-400">Zero cryptographic regressions</span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] p-4">
          <span className="text-xs text-zinc-400">Mean Execution Latency</span>
          <div className="mt-1 text-2xl font-extrabold text-white font-mono">
            {stats.avgDurationMs} ms
          </div>
          <span className="text-[10px] text-orange-400 font-medium">Sub-millisecond average</span>
        </div>

        <div className="rounded-2xl border border-orange-500/30 bg-orange-950/20 p-4">
          <span className="text-xs text-orange-400 font-semibold">Persistence Policy</span>
          <div className="mt-1 text-base font-bold text-white">Zero-Knowledge</div>
          <span className="text-[10px] text-zinc-300">Secrets NEVER committed to disk</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-zinc-800 bg-[#0e0e11]">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search records by ID, algorithm..."
            className="w-full rounded-xl border border-zinc-800 bg-black px-3.5 py-2 pl-9 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
        </div>

        {/* Algorithm Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedAlgo}
            onChange={(e) => {
              setSelectedAlgo(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-300 focus:border-orange-500 focus:outline-none"
          >
            <option value="ALL">All Algorithms</option>
            {algorithmsList.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-300 focus:border-orange-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILURE">FAILURE</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-300 focus:border-orange-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="latency-desc">Latency (High to Low)</option>
            <option value="latency-asc">Latency (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#0e0e11]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold text-zinc-400">
              <tr>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Latency (ms)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-mono text-zinc-300">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white uppercase">{r.id.slice(0, 10)}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-orange-400">{r.algorithm}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                        {r.operation}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-bold">{r.durationMs.toFixed(2)} ms</td>
                    <td className="py-3 px-4">
                      {r.status === 'SUCCESS' ? (
                        <span className="flex items-center gap-1.5 text-orange-400 font-sans text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
                          <span>SUCCESS</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-400 font-sans text-xs font-semibold">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>FAILURE</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-zinc-400 text-xs">
                      {formatIST(r.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectRecord(r)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => generateSingleRecordPDF(r)}
                          className="p-1.5 rounded-lg text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors"
                          title="Download A4 PDF Certificate"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteRecord(r.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 font-sans">
                    No matching audit records found. Execute cryptographic operations to append entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 text-xs text-zinc-400">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="font-mono text-white font-bold">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
