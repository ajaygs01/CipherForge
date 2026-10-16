import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
} from 'lucide-react';
import { calculateEntropy, AlgorithmContext } from '../utils/crypto/entropy';

interface EntropyStrengthMeterProps {
  value: string;
  algorithm?: AlgorithmContext;
  label?: string;
  variant?: 'full' | 'compact';
  className?: string;
}

export const EntropyStrengthMeter: React.FC<EntropyStrengthMeterProps> = ({
  value,
  algorithm = 'general',
  label = 'Key Entropy & Mathematical Strength',
  variant = 'full',
  className = '',
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const analysis = calculateEntropy(value, algorithm);

  // Segmented 5-tier bars
  const getSegmentActive = (index: number) => {
    const thresholds = [15, 35, 55, 75, 90];
    return analysis.score >= thresholds[index];
  };

  const getSegmentColor = (index: number) => {
    if (!getSegmentActive(index)) return 'bg-zinc-800';
    switch (analysis.strength) {
      case 'VERY_WEAK':
        return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
      case 'WEAK':
        return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
      case 'MODERATE':
        return 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]';
      case 'STRONG':
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
      case 'VERY_STRONG':
        return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]';
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400 flex items-center gap-1">
            <Zap className="h-3 w-3 text-orange-400" />
            <span>Entropy:</span>
            <strong className="text-white font-mono">{analysis.totalEntropyBits} bits</strong>
          </span>
          <span className={`font-bold font-mono ${analysis.colorClass}`}>
            {analysis.strengthLabel}
          </span>
        </div>

        {/* 5-segment bar */}
        <div className="grid grid-cols-5 gap-1.5 h-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${getSegmentColor(i)}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-zinc-800/90 bg-[#0d0d10] p-4 transition-all duration-300 shadow-md ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
            {analysis.totalEntropyBits >= 64 ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{label}</span>
            <span className="text-[10px] text-zinc-400">
              Evaluated via Shannon Equation $H = -\sum p_i \log_2(p_i)$
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="font-mono text-xs font-extrabold text-white">
              {analysis.totalEntropyBits} Bits
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${analysis.colorClass}`}>
              ({analysis.strength.replace('_', ' ')})
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 block">
            {analysis.shannonEntropy} bits/char · {analysis.charsetPoolSize} pool
          </span>
        </div>
      </div>

      {/* Visual Multi-Segment Liquid Bar */}
      <div className="mt-3 space-y-1.5">
        <div className="grid grid-cols-5 gap-1.5 h-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 relative overflow-hidden ${getSegmentColor(
                i
              )}`}
            >
              {getSegmentActive(i) && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-0.5">
          <span>0b (Trivial)</span>
          <span>28b</span>
          <span>56b (DES)</span>
          <span>64b</span>
          <span className="text-orange-400 font-bold">85b+ (Unbreakable)</span>
        </div>
      </div>

      {/* Quick Metrics Strip */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-xl border border-zinc-800/80 bg-black/60 p-2 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-orange-400 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-zinc-500 block">Est. Crack Duration:</span>
            <span className="font-mono font-bold text-white truncate block">
              {analysis.crackTimeEstimate}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-black/60 p-2 flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-orange-400 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-zinc-500 block">Search Keyspace:</span>
            <span className="font-mono font-bold text-orange-400 truncate block">
              {analysis.guessesRequired}
            </span>
          </div>
        </div>
      </div>

      {/* Algorithm-Specific Security Warning (if any) */}
      {analysis.algorithmWarning && (
        <div className="mt-2.5 rounded-xl border border-orange-500/30 bg-orange-950/20 p-2.5 text-[11px] text-orange-300 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
          <p className="leading-snug">{analysis.algorithmWarning}</p>
        </div>
      )}

      {/* Character Composition Pills */}
      <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-colors ${
            analysis.hasMinLength
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
          }`}
        >
          {analysis.hasMinLength ? '✓' : '✗'} 8+ Chars
        </span>

        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-colors ${
            analysis.hasUppercase
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
          }`}
        >
          {analysis.hasUppercase ? '✓' : '✗'} Upper (A-Z)
        </span>

        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-colors ${
            analysis.hasLowercase
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
          }`}
        >
          {analysis.hasLowercase ? '✓' : '✗'} Lower (a-z)
        </span>

        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-colors ${
            analysis.hasDigits
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
          }`}
        >
          {analysis.hasDigits ? '✓' : '✗'} Digits (0-9)
        </span>

        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-colors ${
            analysis.hasSymbols
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
          }`}
        >
          {analysis.hasSymbols ? '✓' : '✗'} Symbols (!@#$)
        </span>

        {analysis.hasRepetition && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-rose-950/40 text-rose-300 border border-rose-500/30">
            ⚠ Repetition Penalty
          </span>
        )}
      </div>

      {/* Expandable Mathematical Telemetry Details Toggle */}
      <div className="mt-2 text-right">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-[10px] font-mono text-zinc-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <span>{showDetails ? 'Hide Entropy Math' : 'Inspect Mathematical Vectors'}</span>
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {showDetails && (
        <div className="mt-2.5 p-3 rounded-xl border border-zinc-800 bg-black space-y-2 text-[10px] font-mono text-zinc-400">
          <div className="flex justify-between border-b border-zinc-900 pb-1">
            <span>Character Count (L):</span>
            <span className="text-white font-bold">{value.length}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-1">
            <span>Alphabet Pool Size (R):</span>
            <span className="text-white font-bold">{analysis.charsetPoolSize}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-1">
            <span>Shannon Entropy per Char:</span>
            <span className="text-orange-400 font-bold">{analysis.shannonEntropy} bits</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-1">
            <span>Total Information Entropy (Bits):</span>
            <span className="text-orange-400 font-bold">{analysis.totalEntropyBits} bits</span>
          </div>
          <div className="flex justify-between">
            <span>Theoretical Keyspace:</span>
            <span className="text-white font-bold">2^{analysis.totalEntropyBits} combinations</span>
          </div>
        </div>
      )}
    </div>
  );
};
