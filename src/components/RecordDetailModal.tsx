import React from 'react';
import { X, Download, Shield, Clock, CheckCircle2, XCircle, FileCode } from 'lucide-react';
import { AuditRecord } from '../types';
import { generateSingleRecordPDF, formatIST } from '../utils/pdfGenerator';
import { LiquidButton } from './LiquidButton';

interface RecordDetailModalProps {
  record: AuditRecord | null;
  onClose: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-orange-400">
                {record.id.toUpperCase()}
              </span>
              <span className="text-zinc-500">·</span>
              <span className="text-xs text-zinc-400">{formatIST(record.timestamp)}</span>
            </div>
            <h3 className="mt-1 text-lg font-bold text-white flex items-center gap-2">
              <span>{record.algorithm}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                {record.operation}
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-5">
          {/* Status & Latency Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
              <span className="text-[11px] text-zinc-400">Execution Status</span>
              <div className="mt-1 flex items-center gap-1.5 font-semibold text-sm">
                {record.status === 'SUCCESS' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-orange-400" />
                    <span className="text-orange-400 font-bold">SUCCESS</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 font-bold">FAILURE</span>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
              <span className="text-[11px] text-zinc-400">Wall-Clock Latency</span>
              <div className="mt-1 flex items-center gap-1.5 font-mono font-bold text-sm text-white">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>{record.durationMs.toFixed(2)} ms</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
              <span className="text-[11px] text-zinc-400">Privacy Retention</span>
              <div className="mt-1 flex items-center gap-1.5 font-semibold text-xs text-orange-300">
                <Shield className="h-4 w-4 text-orange-500" />
                <span>Zero-Knowledge</span>
              </div>
            </div>
          </div>

          {/* Parameters Spec */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-2 mb-2">
              <FileCode className="h-4 w-4 text-orange-500" />
              <span>Configured Parameters (Non-Sensitive Metadata)</span>
            </h4>
            <div className="rounded-xl border border-zinc-800 bg-black p-3 font-mono text-xs text-zinc-300 space-y-1">
              {Object.entries(record.parameters || {}).map(([key, val]) => (
                <div key={key} className="flex justify-between py-0.5 border-b border-zinc-900 last:border-0">
                  <span className="text-zinc-500">{key}:</span>
                  <span className="text-orange-400 font-semibold">{String(val)}</span>
                </div>
              ))}
              {Object.keys(record.parameters || {}).length === 0 && (
                <span className="text-zinc-500">Standard algorithm configuration</span>
              )}
            </div>
          </div>

          {/* Notes */}
          {record.notes && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <span className="text-[11px] font-semibold text-zinc-400">Auditor Notes</span>
              <p className="mt-1 text-xs text-zinc-200 leading-relaxed">{record.notes}</p>
            </div>
          )}

          {/* Zero-knowledge policy callout */}
          <div className="rounded-xl bg-orange-950/20 border border-orange-500/20 p-3 text-xs text-zinc-300">
            <span className="font-bold text-orange-400">Zero-Knowledge Guarantee:</span> This audit record holds telemetry metrics only. Plaintexts, passphrases, symmetric keys, and private exponents are never persisted to disk or sent to server logs.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800">
          <span className="text-[11px] text-zinc-500">
            Compliant with NIST SP 800-38D / RFC 8017 / RFC 3526
          </span>
          <div className="flex gap-2">
            <LiquidButton
              variant="primary"
              size="xs"
              onClick={() => generateSingleRecordPDF(record)}
              icon={<Download className="h-3.5 w-3.5" />}
            >
              Download A4 PDF Certificate
            </LiquidButton>
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
