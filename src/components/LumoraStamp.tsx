import React from 'react';

interface LumoraStampProps {
  text?: string;
  variant?: 'green' | 'blue' | 'gold' | 'rose';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  tilted?: boolean;
  className?: string;
}

export default function LumoraStamp({
  text = 'APPROVED',
  variant = 'green',
  size = 'md',
  tilted = true,
  className = ''
}: LumoraStampProps) {
  // Styles based on variant with transparent colored inks
  const colorMap = {
    green: {
      border: 'border-emerald-500/25',
      text: 'text-emerald-500/35',
      bg: 'bg-emerald-500/[0.02]',
      line: 'rgba(16, 185, 129, 0.35)',
      darkLine: 'rgba(16, 185, 129, 0.45)'
    },
    blue: {
      border: 'border-[#0a3d91]/25',
      text: 'text-[#0a3d91]/35',
      bg: 'bg-[#0a3d91]/[0.01]',
      line: 'rgba(10, 61, 145, 0.35)',
      darkLine: 'rgba(10, 61, 145, 0.45)'
    },
    gold: {
      border: 'border-amber-600/25',
      text: 'text-amber-600/35',
      bg: 'bg-amber-600/[0.02]',
      line: 'rgba(217, 119, 6, 0.35)',
      darkLine: 'rgba(217, 119, 6, 0.45)'
    },
    rose: {
      border: 'border-rose-500/25',
      text: 'text-rose-500/35',
      bg: 'bg-rose-500/[0.02]',
      line: 'rgba(244, 63, 94, 0.35)',
      darkLine: 'rgba(244, 63, 94, 0.45)'
    }
  }[variant];

  const sizeMap = {
    xs: {
      outer: 'w-16 h-16 p-1 border-[1.5px]',
      inner: 'border-[0.5px]',
      fontSize: 'text-[6.5px] tracking-[0.1em]',
      logoSize: 'w-6 h-5',
      lineWidth: '1',
      showTopBottom: false
    },
    sm: {
      outer: 'w-24 h-24 p-1.5 border-[2px]',
      inner: 'border-[1px]',
      fontSize: 'text-[9px] tracking-[0.14em]',
      logoSize: 'w-8 h-6',
      lineWidth: '1',
      showTopBottom: true
    },
    md: {
      outer: 'w-32 h-32 p-2 border-[2.5px]',
      inner: 'border-[1.2px]',
      fontSize: 'text-[11px] tracking-[0.16em]',
      logoSize: 'w-12 h-9',
      lineWidth: '1.5',
      showTopBottom: true
    },
    lg: {
      outer: 'w-44 h-44 p-3 border-[3px]',
      inner: 'border-[1.8px]',
      fontSize: 'text-[14px] tracking-[0.18em]',
      logoSize: 'w-18 h-13',
      lineWidth: '2',
      showTopBottom: true
    }
  }[size];

  // Self-contained simplified LMR Vector logo representation in stamp color with low opacity
  const StampVector = ({ strokeColor, activeStrokeColor }: { strokeColor: string; activeStrokeColor: string }) => {
    return (
      <svg
        viewBox="0 0 140 100"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Draw the outer diamond facets with single-line strokes for an authentic inked stamp feel */}
        <polygon points="70,10 102,24 114,50 102,76 70,90 38,76 26,50 38,24" stroke={strokeColor} strokeWidth="0.75" strokeDasharray="3,2" />
        <polygon points="70,30 90,50 70,70 50,50" stroke={strokeColor} strokeWidth="0.6" />
        {/* Inner star connectors */}
        <line x1="70" y1="10" x2="70" y2="30" stroke={strokeColor} strokeWidth="0.6" />
        <line x1="102" y1="24" x2="90" y2="50" stroke={strokeColor} strokeWidth="0.6" />
        <line x1="114" y1="50" x2="90" y2="50" stroke={strokeColor} strokeWidth="0.6" />
        <line x1="102" y1="76" x2="70" y2="70" stroke={strokeColor} strokeWidth="0.6" />
        <line x1="70" y1="90" x2="70" y2="70" stroke={strokeColor} strokeWidth="0.6" />
        <line x1="38" y1="76" x2="50" y2="50" stroke={strokeColor} strokeWidth="0.6" />
        <line x1="26" y1="50" x2="50" y2="50" stroke={strokeColor} strokeWidth="0.6" />
        <line x1="38" y1="24" x2="50" y2="50" stroke={strokeColor} strokeWidth="0.6" />

        {/* Embedded Architectural Monogram Overlays (the unmistakable Lumora L & M lines) */}
        <polyline points="38,24 50,50 70,70 70,90" stroke={activeStrokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="70,10 70,30 90,50 102,76" stroke={activeStrokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div
      className={`pointer-events-none select-none flex items-center justify-center transition-all duration-300 ${
        tilted ? 'rotate-[-12deg]' : ''
      } ${className}`}
    >
      <div
        className={`rounded-full flex flex-col items-center justify-center border-dashed text-center font-display font-black uppercase ${colorMap.border} ${colorMap.text} ${colorMap.bg} ${sizeMap.outer}`}
        style={{
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.01)',
          textShadow: '0 0 1px rgba(0,0,0,0.05)'
        }}
      >
        <div className={`w-full h-full rounded-full border border-dashed flex flex-col items-center justify-center p-1 ${colorMap.border} ${sizeMap.inner}`}>
          
          {sizeMap.showTopBottom && (
            <div className="text-[6.5px] sm:text-[7px] tracking-[0.18em] opacity-50 uppercase font-mono mb-0.5 whitespace-nowrap">
              ★ LUMORA OFFICIAL ★
            </div>
          )}

          <div className={`${sizeMap.logoSize} flex items-center justify-center my-0.5`}>
            <StampVector strokeColor={colorMap.line} activeStrokeColor={colorMap.darkLine} />
          </div>

          <div className={`font-display font-black leading-none my-0.5 sm:my-1 select-none text-center border-y border-dashed py-0.5 px-2 self-stretch border-current ${sizeMap.fontSize}`}>
            {text}
          </div>

          {sizeMap.showTopBottom && (
            <div className="text-[5.5px] sm:text-[6px] tracking-[0.14em] opacity-50 font-mono mt-0.5 whitespace-nowrap">
              CBE SECURED CONTEXT
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
