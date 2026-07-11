import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Sparkles } from 'lucide-react';

interface LumoraLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showText?: boolean;
  theme?: 'dark' | 'light' | 'white-on-blue' | 'gold' | 'custom';
  type?: 'logo' | 'icon' | 'splash';
  className?: string;
}

export default function LumoraLogo({
  size = 'md',
  showText = true,
  theme = 'light',
  type = 'logo',
  className = ''
}: LumoraLogoProps) {

  const [progress, setProgress] = useState(0);
  const [welcomeIdx, setWelcomeIdx] = useState(0);

  const welcomes = [
    "Welcome to Lumora",
    "እንኳን ወደ ሉሞራ በደህና መጡ",
    "Baga Gara Lumora Dhuftan",
    "እንቋዕ ብደሓር መጻእኩም",
    "Ku soo dhawaada Lumora"
  ];

  useEffect(() => {
    if (type !== 'splash') return;
    
    const duration = 1800;
    const intervalTime = 20;
    const steps = duration / intervalTime;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
      }
      setProgress(Math.min(100, Math.floor(currentProgress)));
    }, intervalTime);

    const rotTimer = setInterval(() => {
      setWelcomeIdx(prev => (prev + 1) % welcomes.length);
    }, 450);

    return () => {
      clearInterval(timer);
      clearInterval(rotTimer);
    };
  }, [type]);

  // Premium 3D Faceted Diamond Shield / Compass Star representing "LUMORA" (Light, Growth, and Absolute Trust)
  const LMR_Vector = ({ isWhite = false, strokeScale = 1 }) => {
    // Elegant color selection based on theme context (light-source mock-up)
    const gr1 = isWhite ? 'url(#whiteFacet1)' : 'url(#goldFacet1)';
    const gr2 = isWhite ? 'url(#whiteFacet2)' : 'url(#goldFacet2)';
    const gr3 = isWhite ? 'url(#whiteFacet3)' : 'url(#goldFacet3)';
    const gr4 = isWhite ? 'url(#whiteFacet4)' : 'url(#goldFacet4)';
    const strokeCol = isWhite ? 'rgba(255,255,255,0.4)' : 'rgba(30,92,186,0.2)';

    return (
      <svg
        viewBox="0 0 140 100"
        className="w-full h-full overflow-visible transition-all duration-300 drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Royal Blue Gradients (representing maximum financial security, light and prosperity) */}
          <linearGradient id="goldFacet1" x1="38" y1="10" x2="70" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#1E60D2" />
          </linearGradient>
          <linearGradient id="goldFacet2" x1="70" y1="10" x2="102" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E5CBA" />
            <stop offset="100%" stopColor="#1254BE" />
          </linearGradient>
          <linearGradient id="goldFacet3" x1="70" y1="30" x2="90" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1254BE" />
            <stop offset="100%" stopColor="#0A3D91" />
          </linearGradient>
          <linearGradient id="goldFacet4" x1="50" y1="50" x2="70" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A3D91" />
            <stop offset="100%" stopColor="#041E4E" />
          </linearGradient>

          {/* Platinum / White Gradients (for dark background brand icons and high elegance) */}
          <linearGradient id="whiteFacet1" x1="38" y1="10" x2="70" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="whiteFacet2" x1="70" y1="10" x2="102" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id="whiteFacet3" x1="70" y1="30" x2="90" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="whiteFacet4" x1="50" y1="50" x2="70" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Core drop shadow filter representing 3D ribbon overlay depth */}
          <filter id="ribbonShadow" x="-15%" y="-15%" width="140%" height="140%">
            <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#06122d" floodOpacity="0.28" />
          </filter>
        </defs>

        <g filter="url(#ribbonShadow)">
          {/* Symmetrical High-Trust Faceted Diamond Shield of Lumora (100% architectural straight lines) */}
          
          {/* Top-Left Outer Facet */}
          <polygon points="70,10 70,30 38,24" fill={gr1} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />
          {/* Top-Right Outer Facet */}
          <polygon points="70,10 70,30 102,24" fill={gr2} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />
          
          {/* Inside Top-Left Facet */}
          <polygon points="70,30 70,50 50,50" fill={gr1} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />
          {/* Inside Top-Right Facet */}
          <polygon points="70,30 70,50 90,50" fill={gr2} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />

          {/* Right-Top Outer Facet */}
          <polygon points="102,24 90,50 114,50" fill={gr2} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />
          {/* Right-Bottom Outer Facet */}
          <polygon points="114,50 90,50 102,76" fill={gr3} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />

          {/* Bottom-Right Outer Facet */}
          <polygon points="102,76 70,70 70,90" fill={gr3} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />
          {/* Bottom-Left Outer Facet */}
          <polygon points="38,76 70,70 70,90" fill={gr4} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />

          {/* Inside Bottom-Right Facet */}
          <polygon points="90,50 70,50 70,70" fill={gr3} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />
          {/* Inside Bottom-Left Facet */}
          <polygon points="50,50 70,50 70,70" fill={gr4} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />

          {/* Left-Bottom Outer Facet */}
          <polygon points="38,76 50,50 26,50" fill={gr4} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />
          {/* Left-Top Outer Facet */}
          <polygon points="26,50 50,50 38,24" fill={gr1} stroke={strokeCol} strokeWidth={0.25 * strokeScale} />

          {/* Embedded Architectural Monogram Overlays (gorgeous, fine contrasting high-gloss lines representing stability) */}
          {/* Letter L Lineage embedded inside left structural facets */}
          <polyline points="38,24 50,50 70,70 70,90" stroke={isWhite ? '#FFFFFF' : '#00E5FF'} strokeWidth={1.5 * strokeScale} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} style={{ mixBlendMode: 'overlay' }} />
          
          {/* Letter M Lineage embedded inside center/right structural facets */}
          <polyline points="70,10 70,30 90,50 102,76" stroke={isWhite ? '#FFFFFF' : '#00E5FF'} strokeWidth={1.5 * strokeScale} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} style={{ mixBlendMode: 'overlay' }} />
        </g>
      </svg>
    );
  };

  if (size === 'xs' && type === 'logo') {
    return (
      <div className={`flex items-center space-x-2 select-none ${className}`}>
        <div className="w-7 h-5 flex items-center justify-center relative overflow-visible">
          <LMR_Vector isWhite={theme === 'white-on-blue'} />
        </div>
        <div className="flex flex-col text-left">
          <span className={`font-display font-black text-[13.5px] sm:text-[14.5px] tracking-[0.18em] ${theme === 'white-on-blue' ? 'text-white' : 'text-[#0A3D91]'} select-none uppercase leading-none mr-[-0.18em]`}>
            LUMORA
          </span>
          {showText && (
            <span className={`font-display font-bold text-[6.5px] tracking-[0.14em] ${theme === 'white-on-blue' ? 'text-white/70' : 'text-[#0A3D91]/70'} leading-none mt-1 select-none block uppercase mr-[-0.14em]`}>
              INVEST • GROW • PROSPER
            </span>
          )}
        </div>
      </div>
    );
  }

  // Dimensions of the logo container based on size parameter for layout sizing consistency
  const containerSize = {
    xs: 'w-10 h-8',
    sm: 'w-16 h-14',
    md: 'w-24 h-20',
    lg: 'w-32 h-28',
    xl: 'w-44 h-36',
    '2xl': 'w-56 h-48',
    full: 'w-full h-full'
  }[size] || 'w-24 h-20';

  // Text sizes corresponding to size
  const titleTextSize = {
    xs: 'text-[12px] font-black tracking-[0.16em]',
    sm: 'text-[17px] font-black tracking-[0.2em]',
    md: 'text-[21px] sm:text-[23px] font-black tracking-[0.24em]',
    lg: 'text-[26px] sm:text-[30px] font-black tracking-[0.28em]',
    xl: 'text-[36px] sm:text-[40px] font-black tracking-[0.32em]',
    '2xl': 'text-[46px] sm:text-[50px] font-black tracking-[0.35em]',
    full: 'text-2xl font-black tracking-[0.2em]'
  }[size] || 'text-xl font-black';

  const subtitleTextSize = {
    xs: 'text-[6px] tracking-[0.15em] mt-0.5',
    sm: 'text-[7.5px] tracking-[0.18em] mt-0.8',
    md: 'text-[9.5px] tracking-[0.2em] mt-1',
    lg: 'text-[11px] tracking-[0.24em] mt-1.5',
    xl: 'text-[13px] tracking-[0.26em] mt-2',
    '2xl': 'text-[15px] tracking-[0.28em] mt-2.5',
    full: 'text-xs'
  }[size] || 'text-[8.5px]';

  const textCol = theme === 'white-on-blue' || theme === 'dark' ? 'text-white' : 'text-[#0A3D91]';
  const subtitleWeight = 'font-bold uppercase select-none opacity-90';

  // RENDER INTERPLAY TYPES (ICON OR FULL SPLASH)
  
  if (type === 'icon') {
    // Beautiful LMR intertwined ribbon app icon
    const iconDim = {
      xs: 'w-8 h-8 rounded-lg',
      sm: 'w-12 h-12 rounded-xl border border-blue-500/20',
      md: 'w-16 h-16 rounded-2xl border-2 border-blue-400/20 shadow-md',
      lg: 'w-24 h-24 rounded-3xl border-3 border-blue-400/20 shadow-lg',
      xl: 'w-36 h-36 rounded-[2.2rem] border-4 border-blue-400/10 shadow-xl',
      '2xl': 'w-48 h-48 rounded-[2.8rem] border-[5px] border-blue-400/10 shadow-2xl',
      full: 'w-full h-full aspect-square rounded-[2rem]'
    }[size] || 'w-16 h-16 rounded-2xl';

    const labelSize = {
      xs: 'hidden',
      sm: 'hidden',
      md: 'text-[7px] tracking-[0.12em] mt-0.5',
      lg: 'text-[9px] tracking-[0.14em] mt-1',
      xl: 'text-[11px] tracking-[0.16em] mt-1.5',
      '2xl': 'text-[13px] tracking-[0.18em] mt-2',
      full: 'text-[11px] tracking-[0.16em] mt-1.5'
    }[size] || 'hidden';

    // Premium dual-state styling to support the brand-new white faceted diamond icon (V8 Vercel parity) in light mode
    const isDarkAppIcon = theme === 'dark' || theme === 'white-on-blue';
    const bgClass = isDarkAppIcon 
      ? 'bg-gradient-to-br from-[#1E5CBA] via-[#0A3D91] to-[#041E4E] shadow-lg' 
      : 'bg-gradient-to-b from-white to-[#F6F8FC] border border-slate-205 shadow-xs';
    const labelColor = isDarkAppIcon ? 'text-white' : 'text-[#0A3D91]';
    const vectorIsWhite = isDarkAppIcon;

    return (
      <div className={`relative flex flex-col items-center justify-center shrink-0 ${iconDim} ${bgClass} overflow-hidden select-none ${className}`}>
        {/* Abstract luxury vector wave background layer inside icon */}
        <div className={`absolute inset-0 pointer-events-none ${isDarkAppIcon ? 'opacity-20' : 'opacity-[0.06]'}`}>
          <svg className="w-full h-full fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,80 C30,60 70,90 100,50 L100,100 L0,100 Z" fill={isDarkAppIcon ? "#00D2FF" : "#0A3D91"} />
            <path d="M0,90 C40,50 60,80 100,20 L100,100 L0,100 Z" fill={isDarkAppIcon ? "#FFFFFF" : "#00D2FF"} />
          </svg>
        </div>
        
        {/* Crisp LMR Ribbon Monogram - blue facets if light-mode, white if dark-mode */}
        <div className="w-[72%] h-[72%] flex items-center justify-center">
          <LMR_Vector isWhite={vectorIsWhite} strokeScale={1.15} />
        </div>
        {labelSize !== 'hidden' && (
          <span className={`font-display font-bold ${labelSize} ${labelColor} uppercase select-none opacity-80 scale-90 -mt-1`}>
            LUMORA
          </span>
        )}
      </div>
    );
  }

  if (type === 'splash') {
    return (
      <div className={`w-full max-w-md bg-gradient-to-b from-[#081229] via-[#030919] to-[#01040a] rounded-[2.5rem] border border-slate-900/40 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between py-12 px-6 aspect-[9/16] ${className}`}>
        
        {/* Futuristic glowing ambient background lights */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#00E5FF]/8 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-[#1E5CBA]/10 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:1s]"></div>

        {/* Dynamic high-contrast geometric lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 700" fill="none">
          <g stroke="#00E5FF" strokeWidth="0.5" opacity="0.3">
            <line x1="0" y1="100" x2="400" y2="100" />
            <line x1="0" y1="300" x2="400" y2="300" />
            <line x1="0" y1="500" x2="400" y2="500" />
            <line x1="100" y1="0" x2="100" y2="700" />
            <line x1="300" y1="0" x2="300" y2="700" />
          </g>
          <circle cx="200" cy="350" r="180" stroke="#1E5CBA" strokeWidth="0.8" opacity="0.2" strokeDasharray="5,5" />
          <circle cx="200" cy="350" r="120" stroke="#00E3FF" strokeWidth="0.5" opacity="0.15" />
        </svg>



        {/* Center: Brand Identity Showcase */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
          {/* Large Animated Halo container */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#00E5FF]/20 rounded-full blur-2xl scale-125 animate-pulse [animation-duration:3s]"></div>
            <motion.div 
              className="w-36 h-30 flex items-center justify-center relative"
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ 
                scale: [0.94, 1.03, 0.94],
                opacity: 1
              }}
              transition={{ 
                scale: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                opacity: { duration: 0.8, ease: "easeOut" }
              }}
            >
              {/* Golden Theme Vector Icon */}
              <LMR_Vector isWhite={true} strokeScale={1.3} />
            </motion.div>
          </div>

          {/* Letter spacing expansion for brand name and glow */}
          <motion.h2 
            className="font-display font-black text-3.5xl tracking-[0.28em] text-white uppercase select-none mr-[-0.28em] text-center filter drop-shadow-[0_2px_10px_rgba(0,229,255,0.2)]"
            initial={{ letterSpacing: "0.15em", opacity: 0 }}
            animate={{ letterSpacing: "0.28em", opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            LUMORA
          </motion.h2>

          {/* Division Line */}
          <div className="flex items-center justify-center space-x-2 my-3.5 w-40 opacity-80">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#00E5FF]/40"></div>
            <div className="w-1.5 h-1.5 bg-[#00E5FF] rotate-45 animate-pulse"></div>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#00E5FF]/40"></div>
          </div>

          <motion.p 
            className="font-display font-black text-[11px] sm:text-[12px] tracking-[0.24em] text-cyan-400 uppercase mr-[-0.24em] select-none text-center"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            INVEST. GROW. PROSPER.
          </motion.p>

          {/* Multilingual welcome message stream */}
          <div className="h-6 mt-8 flex items-center justify-center overflow-hidden">
            <motion.p 
              key={welcomeIdx}
              className="text-xs text-slate-350 font-sans font-extrabold tracking-wide text-center"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {welcomes[welcomeIdx]}
            </motion.p>
          </div>
        </div>

        {/* Bottom Loading Progress Bar and Compliance details */}
        <div className="w-full flex flex-col items-center select-none z-10 space-y-4">
          
          {/* Futuristic glowing progress track */}
          <div className="w-full max-w-[240px] space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-mono font-black tracking-wider text-slate-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                <span>SYSTEM LOADING</span>
              </span>
              <span className="text-cyan-400">{progress}%</span>
            </div>
            
            {/* Real loading indicator bar */}
            <div className="h-1.5 w-full bg-slate-900/60 rounded-full border border-slate-800/80 p-0.5 overflow-hidden shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#1E5CBA] via-[#00E5FF] to-amber-400 transition-all duration-75 relative shadow-[0_0_8px_#00E5FF]"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-y-0 right-0 w-2 bg-white/70 blur-xs animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center space-x-4 opacity-80 text-[9px] text-slate-300 font-mono font-bold tracking-wider">
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>SECURED</span>
            </span>
            <span>•</span>
            <span>CBE COMMERCE</span>
            <span>•</span>
            <span>SSL TRADING</span>
          </div>

          <div className="text-[9px] text-slate-500 font-mono flex items-center space-x-1">
            <Lock className="w-2.5 h-2.5" />
            <span>LUMORA VERIFIED CRYPTO SHIELD v5.2</span>
          </div>

        </div>

      </div>
    );
  }

  // DEFAULT LOGO WORKMARK MODE (No vector emblem icon above name)
  return (
    <div className={`flex flex-col items-center justify-center select-none animate-in fade-in zoom-in-95 duration-500 text-center ${className}`}>
      {/* Intertwined LMR vector logo symbol */}
      <div className={`${containerSize} flex items-center justify-center relative overflow-visible mb-2.5`}>
        <LMR_Vector isWhite={theme === 'white-on-blue'} />
      </div>

      <h1 className={`font-display font-black ${titleTextSize} ${textCol} uppercase mr-[-0.18em] select-none`}>
        LUMORA
      </h1>

      {showText && (
        <div className="text-center w-full animate-in fade-in duration-500 flex flex-col items-center">
          {/* Custom elegant diamond divider */}
          <div className="flex items-center justify-center space-x-2 my-2 w-28 mx-auto opacity-75">
            <div className={`h-[1px] flex-1 bg-gradient-to-r from-transparent to-${theme === 'white-on-blue' ? 'white' : '[#0A3D91]'}/40`}></div>
            <div className={`w-1 h-1 rotate-45 rounded-[0.5px] ${theme === 'white-on-blue' ? 'bg-white' : 'bg-[#0A3D91]'}`}></div>
            <div className={`h-[1px] flex-1 bg-gradient-to-l from-transparent to-${theme === 'white-on-blue' ? 'white' : '[#0A3D91]'}/40`}></div>
          </div>

          <p className={`font-display ${subtitleWeight} ${subtitleTextSize} ${theme === 'white-on-blue' ? 'text-white/80' : 'text-[#0A3D91]/75'} mr-[-0.18em]`}>
            INVEST. GROW. PROSPER.
          </p>
        </div>
      )}
    </div>
  );
}
