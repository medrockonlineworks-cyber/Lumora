import React from 'react';

interface LumoraStampProps {
  text?: string;
  variant?: 'green' | 'blue' | 'gold' | 'rose';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  tilted?: boolean;
  className?: string;
  highContrast?: boolean;
}

export default function LumoraStamp({
  text = 'APPROVED',
  variant = 'green',
  size = 'md',
  tilted = true,
  className = '',
  highContrast = false
}: LumoraStampProps) {
  // Generate a safe unique ID for the SVG filter to avoid collisions
  const rawId = React.useId();
  const filterId = `ink-bleed-${rawId.replace(/:/g, '')}`;

  // Styles based on variant with transparent colored inks
  const colorMap = highContrast ? {
    green: {
      border: 'border-emerald-600',
      text: 'text-emerald-700 font-extrabold',
      bg: 'bg-emerald-50/95',
      line: 'rgba(5, 150, 105, 0.90)',
      darkLine: 'rgba(4, 120, 87, 1.0)'
    },
    blue: {
      border: 'border-[#0a3d91]',
      text: 'text-blue-900 font-extrabold',
      bg: 'bg-blue-50/95',
      line: 'rgba(10, 61, 145, 0.90)',
      darkLine: 'rgba(7, 47, 112, 1.0)'
    },
    gold: {
      border: 'border-amber-600',
      text: 'text-amber-800 font-extrabold',
      bg: 'bg-amber-50/95',
      line: 'rgba(217, 119, 6, 0.90)',
      darkLine: 'rgba(180, 83, 9, 1.0)'
    },
    rose: {
      border: 'border-rose-600',
      text: 'text-rose-800 font-extrabold',
      bg: 'bg-rose-50/95',
      line: 'rgba(225, 29, 72, 0.90)',
      darkLine: 'rgba(190, 24, 74, 1.0)'
    }
  }[variant] : {
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
      bg: 'bg-rose-50/[0.02]',
      line: 'rgba(244, 63, 94, 0.35)',
      darkLine: 'rgba(244, 63, 94, 0.45)'
    }
  }[variant];

  const sizeMap = {
    xs: {
      outer: 'w-11 h-11 sm:w-16 sm:h-16 p-0.5 sm:p-1 border-[1.5px] sm:border-[2px]',
      inner: 'border-[0.5px] sm:border-[0.75px]',
      fontSize: highContrast 
        ? 'text-[5px] sm:text-[7.5px] font-extrabold tracking-[0.08em] sm:tracking-[0.1em]' 
        : 'text-[4.5px] sm:text-[6.5px] tracking-[0.08em] sm:tracking-[0.1em]',
      logoSize: 'w-4 sm:w-6 h-3 sm:h-5',
      lineWidth: '1',
      showTopBottom: false
    },
    sm: {
      outer: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 p-1 sm:p-1.2 md:p-1.5 border-[1.5px] sm:border-[2px] md:border-[2.5px]',
      inner: 'border-[0.8px] sm:border-[1px] md:border-[1.2px]',
      fontSize: highContrast 
        ? 'text-[6.5px] sm:text-[8px] md:text-[10px] font-extrabold tracking-[0.1em] md:tracking-[0.14em]' 
        : 'text-[5.5px] sm:text-[7px] md:text-[9px] tracking-[0.1em] md:tracking-[0.14em]',
      logoSize: 'w-5 sm:w-7 md:w-8 h-4 sm:h-5 md:h-6',
      lineWidth: '1.2',
      showTopBottom: true
    },
    md: {
      outer: 'w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 p-1 sm:p-1.8 md:p-2 border-[2px] sm:border-[2.8px] md:border-[3.2px]',
      inner: 'border-[1px] sm:border-[1.2px] md:border-[1.5px]',
      fontSize: highContrast 
        ? 'text-[8px] sm:text-[10.5px] md:text-[12px] font-extrabold tracking-[0.12em] md:tracking-[0.16em]' 
        : 'text-[7px] sm:text-[9.5px] md:text-[11px] tracking-[0.12em] md:tracking-[0.16em]',
      logoSize: 'w-7 sm:w-10 md:w-12 h-5.5 sm:h-7.5 md:h-9',
      lineWidth: '1.8',
      showTopBottom: true
    },
    lg: {
      outer: 'w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 p-1.5 sm:p-2.5 md:p-3 border-[2.2px] sm:border-[3.2px] md:border-[4px]',
      inner: 'border-[1.2px] sm:border-[1.8px] md:border-[2.2px]',
      fontSize: highContrast 
        ? 'text-[9px] sm:text-[12.5px] md:text-[15px] font-extrabold tracking-[0.14em] md:tracking-[0.18em]' 
        : 'text-[8px] sm:text-[11.5px] md:text-[14px] tracking-[0.14em] md:tracking-[0.18em]',
      logoSize: 'w-10 sm:w-15 md:w-18 h-7.5 sm:h-11 md:h-13',
      lineWidth: '2.5',
      showTopBottom: true
    }
  }[size];

  // Self-contained simplified LMR Vector logo representation in stamp color with low opacity
  const StampVector = ({ strokeColor, activeStrokeColor }: { strokeColor: string; activeStrokeColor: string }) => {
    const strokeWMultiplier = highContrast ? 1.5 : 1.0;
    return (
      <svg
        viewBox="0 0 140 100"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Draw the outer diamond facets with single-line strokes for an authentic inked stamp feel */}
        <polygon points="70,10 102,24 114,50 102,76 70,90 38,76 26,50 38,24" stroke={strokeColor} strokeWidth={0.75 * strokeWMultiplier} strokeDasharray="3,2" />
        <polygon points="70,30 90,50 70,70 50,50" stroke={strokeColor} strokeWidth={0.6 * strokeWMultiplier} />
        {/* Inner star connectors */}
        <line x1="70" y1="10" x2="70" y2="30" stroke={strokeColor} strokeWidth={0.6 * strokeWMultiplier} />
        <line x1="102" y1="24" x2="90" y2="50" stroke={strokeColor} strokeWidth={0.6 * strokeWMultiplier} />
        <line x1="114" y1="50" x2="90" y2="50" stroke={strokeColor} strokeWidth={0.6 * strokeWMultiplier} />
        <line x1="102" y1="76" x2="70" y2="70" stroke={strokeColor} strokeWidth={0.6 * strokeWMultiplier} />
        <line x1="70" y1="90" x2="70" y2="70" stroke={strokeColor} strokeWidth={0.6 * strokeWMultiplier} />
        <line x1="38" y1="76" x2="50" y2="50" stroke={strokeColor} strokeWidth={0.6 * strokeWMultiplier} />
        <line x1="26" y1="50" x2="50" y2="50" stroke={strokeColor} strokeWidth={0.6 * strokeWMultiplier} />
        <line x1="38" y1="24" x2="50" y2="50" stroke={strokeColor} strokeWidth={0.6 * strokeWMultiplier} />

        {/* Embedded Architectural Monogram Overlays (the unmistakable Lumora L & M lines) */}
        <polyline points="38,24 50,50 70,70 70,90" stroke={activeStrokeColor} strokeWidth={2.5 * strokeWMultiplier} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="70,10 70,30 90,50 102,76" stroke={activeStrokeColor} strokeWidth={2.5 * strokeWMultiplier} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const InkFilter = () => (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
      <defs>
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          {/* Fractal turbulence generates high-frequency organic pattern noise */}
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.16" 
            numOctaves="4" 
            result="noise" 
          />
          
          {/* Displace the graphics dynamically around edge vectors using the green/red noise channel values */}
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="noise" 
            scale={highContrast ? "2.6" : "1.8"} 
            xChannelSelector="R" 
            yChannelSelector="G" 
            result="displaced" 
          />
          
          {/* Render fine ink dropouts & paper grain voids using color matrices to filter alpha density */}
          <feColorMatrix 
            type="matrix" 
            values="1 0 0 0 0  
                    0 1 0 0 0  
                    0 0 1 0 0  
                    0 0 0 2.4 -0.45" 
            in="noise" 
            result="grittyGrain" 
          />
          <feComposite 
            operator="in" 
            in="displaced" 
            in2="grittyGrain" 
            result="roughStampPrint" 
          />
          
          {/* Create organic ink bleed bleed-ring halos around high density stamps */}
          <feGaussianBlur 
            in="roughStampPrint" 
            stdDeviation={highContrast ? "0.45" : "0.3"} 
            result="bleedBlur" 
          />
          
          {/* Overlay print and ink absorption vectors */}
          <feMerge>
            <feMergeNode in="bleedBlur" />
            <feMergeNode in="roughStampPrint" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );

  return (
    <div
      className={`pointer-events-none select-none flex items-center justify-center transition-all duration-300 ${
        tilted ? 'rotate-[-12deg]' : ''
      } ${className}`}
    >
      <InkFilter />
      <div
        className={`rounded-full flex flex-col items-center justify-center border-dashed text-center font-display font-black uppercase ${colorMap.border} ${colorMap.text} ${colorMap.bg} ${sizeMap.outer}`}
        style={{
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.01)',
          textShadow: '0 0 1px rgba(0,0,0,0.05)',
          filter: `url(#${filterId})`
        }}
      >
        <div className={`w-full h-full rounded-full border border-dashed flex flex-col items-center justify-center p-1 ${colorMap.border} ${sizeMap.inner}`}>
          
          {sizeMap.showTopBottom && (
            <div className="hidden sm:block text-[6.5px] sm:text-[7px] tracking-[0.18em] opacity-50 uppercase font-mono mb-0.5 whitespace-nowrap">
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
            <div className="hidden sm:block text-[5.5px] sm:text-[6px] tracking-[0.14em] opacity-50 font-mono mt-0.5 whitespace-nowrap">
              CBE SECURED CONTEXT
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
