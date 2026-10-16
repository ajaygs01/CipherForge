import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  tagline?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  tagline = 'BY AJAY G S',
  className = '',
}) => {
  // Dimension definitions
  const dimensions = {
    sm: { icon: 'h-7 w-7', text: 'text-sm', tag: 'text-[9px]', pad: 'p-1' },
    md: { icon: 'h-9 w-9', text: 'text-base', tag: 'text-[10px]', pad: 'p-1.5' },
    lg: { icon: 'h-11 w-11', text: 'text-xl', tag: 'text-xs', pad: 'p-2' },
    xl: { icon: 'h-14 w-14', text: 'text-2xl', tag: 'text-xs', pad: 'p-2.5' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Bespoke Geometric Cryptographic Mark */}
      <div
        className={`relative ${dimensions.icon} flex items-center justify-center rounded-xl bg-gradient-to-b from-[#18181b] to-black border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.25)] group-hover:border-orange-500 transition-all duration-300`}
      >
        {/* Ambient Corner Accents */}
        <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-orange-400 rounded-tl-sm pointer-events-none" />
        <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-orange-400 rounded-br-sm pointer-events-none" />

        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          <defs>
            <linearGradient id="cf-orange-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff781f" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
            <linearGradient id="cf-core-glow" x1="10" y1="8" x2="22" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffedd5" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Faceted Hexagonal Shield Perimeter */}
          <path
            d="M16 2.5 L27 8.5 V18 C27 24.2 22.3 28.5 16 30 C9.7 28.5 5 24.2 5 18 V8.5 L16 2.5 Z"
            stroke="url(#cf-orange-grad)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]"
          />

          {/* Inner Circuit Crossbars & Encryption Lattice */}
          <path
            d="M16 6.5 V11 M16 21 V26.5"
            stroke="#f97316"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M9 14.5 H13 M19 14.5 H23"
            stroke="#ea580c"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Precision Cipher Padlock Core */}
          <rect
            x="11"
            y="12.5"
            width="10"
            height="8"
            rx="2"
            fill="#09090b"
            stroke="url(#cf-orange-grad)"
            strokeWidth="1.6"
          />

          {/* Hardened Shackle (Curved Top Arch) */}
          <path
            d="M13 12.5 V10 C13 8.34 14.34 7 16 7 C17.66 7 19 8.34 19 10 V12.5"
            stroke="url(#cf-core-glow)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Central Keyway Node / Luminescent Prism */}
          <circle cx="16" cy="15.5" r="1.2" fill="#ff781f" filter="url(#glow-filter)" />
          <path d="M16 16.7 V18.5" stroke="#ffedd5" strokeWidth="1.2" strokeLinecap="round" />

          {/* Micro binary orbit ticks */}
          <circle cx="9.5" cy="10" r="0.7" fill="#f97316" />
          <circle cx="22.5" cy="10" r="0.7" fill="#f97316" />
        </svg>
      </div>

      {/* Typography & High-End Subtitle */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center tracking-tight leading-none">
            <span className={`font-black text-white ${dimensions.text}`}>Cipher</span>
            <span
              className={`font-black text-orange-500 ${dimensions.text} drop-shadow-[0_0_10px_rgba(249,115,22,0.45)]`}
            >
              Forge
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316] animate-pulse" />
            <span className={`${dimensions.tag} text-zinc-400 font-mono tracking-wider font-semibold uppercase`}>
              {tagline}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
