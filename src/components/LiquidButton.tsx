import React, { useState, useRef, MouseEvent } from 'react';

export interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  glow?: boolean;
  liquidColor?: 'orange' | 'amber' | 'emerald' | 'crimson';
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  glow = true,
  liquidColor = 'orange',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { x, y, id: Date.now() + Math.random() };
      setRipples((prev) => [...prev.slice(-3), newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 750);
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Size styles
  const sizeStyles = {
    xs: 'px-2.5 py-1 text-[11px] rounded-lg gap-1.5',
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-2',
    md: 'px-4 py-2 text-xs sm:text-sm font-bold rounded-xl gap-2.5',
    lg: 'px-6 py-3 text-sm sm:text-base font-bold rounded-2xl gap-3',
  }[size];

  // Base and variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container:
            'bg-orange-500 text-black border border-orange-400/80 shadow-[0_4px_18px_rgba(249,115,22,0.35)] hover:shadow-[0_6px_28px_rgba(249,115,22,0.55)]',
          waveBg: 'fill-orange-400',
          waveSecondary: 'fill-[#ff9033]',
          textColor: 'text-black font-extrabold',
          iconColor: 'text-black',
        };
      case 'secondary':
        return {
          container:
            'bg-[#121113] text-zinc-100 border border-zinc-800 hover:border-orange-500/50 shadow-[0_2px_12px_rgba(0,0,0,0.6)] hover:shadow-[0_4px_20px_rgba(249,115,22,0.25)]',
          waveBg: 'fill-orange-600/30',
          waveSecondary: 'fill-orange-500/20',
          textColor: 'text-zinc-100 group-hover:text-white',
          iconColor: 'text-orange-400',
        };
      case 'outline':
        return {
          container:
            'bg-orange-950/20 text-orange-400 border border-orange-500/40 hover:border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.15)] hover:shadow-[0_0_24px_rgba(249,115,22,0.35)]',
          waveBg: 'fill-orange-500/25',
          waveSecondary: 'fill-orange-400/20',
          textColor: 'text-orange-400 group-hover:text-orange-300',
          iconColor: 'text-orange-400',
        };
      case 'danger':
        return {
          container:
            'bg-rose-950/30 text-rose-300 border border-rose-500/40 hover:border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.2)] hover:shadow-[0_0_24px_rgba(244,63,94,0.4)]',
          waveBg: 'fill-rose-600/30',
          waveSecondary: 'fill-rose-500/20',
          textColor: 'text-rose-300 group-hover:text-white',
          iconColor: 'text-rose-400',
        };
      case 'ghost':
        return {
          container:
            'bg-transparent text-zinc-300 hover:text-white border border-transparent hover:border-zinc-800 hover:bg-zinc-900/60',
          waveBg: 'fill-orange-500/15',
          waveSecondary: 'fill-orange-400/10',
          textColor: 'text-zinc-300 group-hover:text-white',
          iconColor: 'text-orange-400',
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`group relative overflow-hidden inline-flex items-center justify-center transition-all duration-300 select-none cursor-pointer active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${
        fullWidth ? 'w-full' : ''
      } ${sizeStyles} ${currentVariant.container} ${className}`}
      {...props}
    >
      {/* Specular Liquid Gloss Edge (Top Highlight) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-75 group-hover:opacity-100 transition-opacity"
      />

      {/* Dynamic Cursor-Tracking Fluid Orb */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-inherit opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(110px circle at ${coords.x}% ${coords.y}%, ${
            variant === 'primary' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(249, 115, 22, 0.35)'
          }, transparent 70%)`,
        }}
      />

      {/* Internal Liquid Fluid Reservoir & Waves Container */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-85'
        }`}
      >
        {/* SVG Liquid Wave Layer 1 */}
        <div
          className={`absolute inset-x-0 bottom-0 w-[200%] h-[120%] transition-transform duration-700 ease-out ${
            isHovered ? 'translate-y-[10%]' : 'translate-y-[45%]'
          }`}
          style={{
            animation: 'liquidWave1 4.5s cubic-bezier(0.36, 0, 0.66, -0.56) infinite alternate',
          }}
        >
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className={`w-full h-full ${currentVariant.waveSecondary}`}
          >
            <path d="M0,0 C150,90 350,-40 500,60 C650,150 900,10 1050,70 C1150,110 1200,40 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>

        {/* SVG Liquid Wave Layer 2 (Cross-directional swell) */}
        <div
          className={`absolute inset-x-0 bottom-0 w-[200%] h-[110%] transition-transform duration-500 ease-out ${
            isHovered ? 'translate-y-[5%]' : 'translate-y-[55%]'
          }`}
          style={{
            animation: 'liquidWave2 3.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate',
          }}
        >
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className={`w-full h-full ${currentVariant.waveBg}`}
          >
            <path d="M0,40 C180,110 320,10 480,80 C640,140 820,30 980,80 C1100,120 1200,60 1200,60 L1200,120 L0,120 Z" />
          </svg>
        </div>

        {/* Organic Rising Fluid Bubbles on Hover */}
        {isHovered && (
          <>
            <span
              className="absolute left-[20%] bottom-1 w-1.5 h-1.5 rounded-full bg-white/70 pointer-events-none"
              style={{ animation: 'liquidBubbleRise 1.4s ease-in infinite' }}
            />
            <span
              className="absolute left-[55%] bottom-0 w-2 h-2 rounded-full bg-white/60 pointer-events-none"
              style={{ animation: 'liquidBubbleRise 1.8s ease-in infinite 0.4s' }}
            />
            <span
              className="absolute left-[78%] bottom-1 w-1.2 h-1.2 rounded-full bg-white/80 pointer-events-none"
              style={{ animation: 'liquidBubbleRise 1.2s ease-in infinite 0.7s' }}
            />
          </>
        )}
      </div>

      {/* Ripple Bursts on Click */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: size === 'lg' ? '120px' : '80px',
            height: size === 'lg' ? '120px' : '80px',
            opacity: 0.6,
          }}
        />
      ))}

      {/* Button Content Foreground */}
      <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-tight">
        {icon && iconPosition === 'left' && (
          <span className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${currentVariant.iconColor}`}>
            {icon}
          </span>
        )}
        <span className={currentVariant.textColor}>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className={`shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${currentVariant.iconColor}`}>
            {icon}
          </span>
        )}
      </span>
    </button>
  );
};
