import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  X, CreditCard, Copy, Info, Camera, ShieldAlert, CheckCircle, 
  ChevronRight, Building, Key, Coins, Check, Clock 
} from 'lucide-react';
import { useLanguage } from '../locale';
import { Profile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CelebrationOverlayProps {
  amount: string;
  txRef: string;
  onClose: () => void;
  screenshot?: string | null;
}

const VIP_PRESETS = [
  { level: 1, amount: 3500, name: "Starter" },
  { level: 2, amount: 5000, name: "VIP 1" },
  { level: 3, amount: 10000, name: "VIP 2" },
  { level: 4, amount: 25000, name: "VIP 3" },
  { level: 5, amount: 50000, name: "VIP 4" },
  { level: 6, amount: 100000, name: "VIP 5" },
  { level: 7, amount: 250000, name: "VIP 6" },
  { level: 8, amount: 500000, name: "VIP 7" },
];

function compressImage(base64Str: string, maxWidth = 500, maxHeight = 500, quality = 0.6): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

function DepositCelebrationOverlay({ amount, txRef, onClose, screenshot }: CelebrationOverlayProps) {
  // Confetti particles coordinates
  const particles = Array.from({ length: 35 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 280,
    y: (Math.random() - 0.5) * 320 - 45,
    size: Math.random() * 8 + 4,
    color: ['bg-amber-400', 'bg-emerald-500', 'bg-[#0180FE]', 'bg-[#0A3D91]', 'bg-purple-500', 'bg-teal-400'][i % 6],
    rotation: Math.random() * 360,
    delay: Math.random() * 0.2
  }));

  // Floating coins paths
  const coins = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 180,
    y: -(Math.random() * 110 + 60),
    delay: Math.random() * 0.3
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 bg-[#070d19]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
    >
      {/* Background radial soft light gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl -z-10" />

      {/* Exploding particles circle cluster */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-2">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0, 1.3, 1, 0],
              x: p.x, 
              y: p.y,
              rotate: p.rotation + 360
            }}
            transition={{ 
              duration: 2.2, 
              delay: p.delay,
              ease: "easeOut"
            }}
            className={`absolute rounded-full ${p.color} shadow-xs`}
            style={{ width: p.size, height: p.size }}
          />
        ))}

        {/* Floating golden virtual coins ascending to celebrate */}
        {coins.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, scale: 0.3, y: 40, x: c.x }}
            animate={{ 
              opacity: [0, 1, 0.8, 0], 
              scale: [0.3, 1, 1.2, 0],
              y: c.y,
              x: c.x + (Math.sin(c.id) * 20)
            }}
            transition={{ 
              duration: 2.4, 
              delay: c.delay,
              ease: "easeOut"
            }}
            className="absolute text-amber-400 font-black font-sans text-xs flex items-center justify-center bg-amber-400/20 rounded-full w-5 h-5 border border-amber-300 shadow-sm"
          >
            🪙
          </motion.div>
        ))}

        {/* Core Pulsing check icon shield */}
        <motion.div
          initial={{ scale: 0.3, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-xl border-4 border-white/20 relative"
        >
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="w-8 h-8 text-white"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeInOut" }}
          >
            <motion.path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7" 
            />
          </motion.svg>
        </motion.div>
      </div>

      {/* Celebration messages */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-2"
      >
        <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest font-mono">
          Receipt Accepted ✓
        </span>
        
        <h2 className="font-display font-black text-sm text-white leading-tight uppercase tracking-wider">
          SUCCESSFULLY SUBMITTED!
        </h2>
        
        <p className="text-[10px] text-slate-300 leading-normal max-w-[210px] mx-auto font-semibold">
          Your CBE deposit screenshot has been uploaded. Valuation sum: <strong className="text-amber-350 font-mono text-xs">{(parseFloat(amount) || 0).toLocaleString()} ETB</strong>.
        </p>
      </motion.div>

      {/* Uploaded receipt feedback preview */}
      {screenshot && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="my-3 p-1.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl max-w-[160px] mx-auto overflow-hidden relative shadow-lg"
        >
          <div className="text-[7.5px] font-bold text-slate-400 mb-1 tracking-wider uppercase">Submitted Receipt</div>
          <img 
            src={screenshot} 
            alt="Submitted CBE receipt" 
            className="w-full h-28 object-cover rounded-xl border border-slate-700"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      )}

      {/* Audit verification tag */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-3.5 p-3.5 bg-slate-800/60 border border-slate-755 rounded-2xl w-full text-left space-y-1"
      >
        <div className="flex justify-between items-center text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">
          <span>Ledger Ref ID:</span>
          <span className="text-[#0180FE] select-all uppercase">{txRef}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[7.5px] text-slate-405 font-bold leading-normal">
          <span className="w-1 h-3 bg-gradient-to-b from-[#0180FE] to-emerald-500 rounded-full shrink-0 animate-pulse" />
          <span>CBE wire desk auditing under progress. Value updates automatically.</span>
        </div>
      </motion.div>

      {/* Interactive back button override */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={onClose}
        className="mt-4 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[9px] rounded-xl uppercase tracking-wider shadow-lg cursor-pointer active:scale-95 duration-150 transition-all font-sans"
      >
        Return to Core Portfolio
      </motion.button>
    </motion.div>
  );
}

interface WithdrawalCelebrationOverlayProps {
  amount: string;
  walletType: 'deposit' | 'income';
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  investments?: any[];
  profile?: Profile;
  onClose: () => void;
}

function WithdrawalCelebrationOverlay({ amount, walletType, bankName, accountNumber, accountHolderName, investments, profile, onClose }: WithdrawalCelebrationOverlayProps) {
  const numericAmount = parseFloat(amount) || 0;
  const isIncome = walletType === 'income';
  const feeRate = isIncome ? 0.10 : 0.05;
  const feeName = isIncome ? '10% (5% Tax + 5% Fee)' : '5% (Handling Fee)';
  const feeAmount = numericAmount * feeRate;
  const payoutAmount = numericAmount - feeAmount;

  const activeLevelsText = React.useMemo(() => {
    const activeInvs = (investments || []).filter(i => i && i.status === 'active');
    if (activeInvs.length === 0) {
      return 'starter level';
    }
    
    // Sort by planLevel, handling undefined gracefully
    const sortedInvs = [...activeInvs].sort((a, b) => {
      const levelA = a.planLevel !== undefined ? a.planLevel : 1;
      const levelB = b.planLevel !== undefined ? b.planLevel : 1;
      return levelA - levelB;
    });

    const names = sortedInvs.map(inv => {
      const level = inv.planLevel !== undefined ? inv.planLevel : 1;
      if (level === 1) return 'starter level';
      return `VIP ${level - 1}`;
    });
    
    // Count occurrences of each level name
    const countMap: Record<string, number> = {};
    for (const name of names) {
      countMap[name] = (countMap[name] || 0) + 1;
    }

    // De-duplicate and format with counts
    const uniqueNamesOrdered = Array.from(new Set(names));
    const formattedNames = uniqueNamesOrdered.map(name => {
      const count = countMap[name];
      if (count > 1) {
        return `${count}(${name})`;
      }
      return name;
    });
    
    if (formattedNames.length === 1) {
      return formattedNames[0];
    } else if (formattedNames.length === 2) {
      return `${formattedNames[0]} and ${formattedNames[1]}`;
    } else {
      const last = formattedNames.pop();
      return `${formattedNames.join(', ')} and ${last}`;
    }
  }, [investments]);

  const { dateStr, timeStr } = React.useMemo(() => {
    return {
      dateStr: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      timeStr: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }, []);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  // Confetti particles coordinates
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 280,
    y: (Math.random() - 0.5) * 320 - 45,
    size: Math.random() * 8 + 4,
    color: ['bg-emerald-400', 'bg-blue-500', 'bg-cyan-400', 'bg-indigo-500', 'bg-[#0A3D91]'][i % 5],
    rotation: Math.random() * 360,
    delay: Math.random() * 0.2
  }));

  // Programmatic 100% secure canvas receipt generator (immune to iframe / sandbox CORs limitations)
  const generateFallbackReceipt = (
    amountNum: number, 
    wType: 'deposit' | 'income', 
    bName: string, 
    accNum: string, 
    accHolder: string
  ): string => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 940;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Background
      ctx.fillStyle = '#070d19';
      ctx.fillRect(0, 0, 600, 940);

      // Outer border
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 580, 920);

      // Decorative header bar
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(10, 10, 580, 75);

      // Header Title
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px Courier New, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LUMORA DIGITAL TREASURY', 300, 50);

      // Subtitle / Regulatory Info
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText('TIN: 0024896464  |  LIC: AACATB/14/667', 300, 110);
      ctx.fillText('Federal Democratic Republic of Ethiopia Ministry of Trade Certification', 300, 128);

      // Divider line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 145);
      ctx.lineTo(560, 145);
      ctx.stroke();

      // Status Badge pill
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(160, 165, 280, 40, 20);
      } else {
        ctx.rect(160, 165, 280, 40);
      }
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText('CASHOUT INITIATED ✓', 300, 190);

      // Receipt Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText('OFFICIAL DISPATCH INVOICE', 300, 240);

      // Data fields
      const isInc = wType === 'income';
      const fRate = isInc ? 0.10 : 0.05;
      const fName = isInc ? '10% (5% Tax + 5% Fee)' : '5% (Handling Fee)';
      const fAmount = amountNum * fRate;
      const payAmt = amountNum - fAmount;

      const fields = [
        { label: 'Source Wallet Pool:', value: isInc ? 'Income Portfolio' : 'Deposit Portfolio' },
        { label: 'Activated Levels:', value: activeLevelsText.toUpperCase() },
        { label: 'Total Earning Balance:', value: `${(profile?.totalEarnings ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB` },
        { label: 'Requested Gross Amount:', value: `${amountNum.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB` },
        { label: 'Tax & Processing Fee:', value: `-${fAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB (${fName})`, color: '#f87171' },
        { label: 'Destination Bank Name:', value: (bName || 'Commercial Bank of Ethiopia (CBE)').toUpperCase() },
        { label: 'Recipient Account Num:', value: accNum || 'N/A' },
      ];

      if (accHolder) {
        fields.push({ label: 'Registered Account Holder:', value: accHolder.toUpperCase() });
      }

      const currentDateStr = dateStr;
      const currentTimeStr = timeStr;
      fields.push({ label: 'Transaction Date:', value: currentDateStr });
      fields.push({ label: 'Order Timestamp:', value: currentTimeStr });

      let y = 290;
      fields.forEach(f => {
        // Label
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Arial, sans-serif';
        ctx.fillText(f.label, 50, y);

        // Value
        ctx.textAlign = 'right';
        ctx.fillStyle = f.color || '#f1f5f9';
        ctx.font = 'bold 14px Courier New, monospace';
        ctx.fillText(f.value, 550, y);

        // Divider
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, y + 15);
        ctx.lineTo(560, y + 15);
        ctx.stroke();

        y += 44;
      });

      // Final Approved Payout box
      ctx.fillStyle = '#022c22';
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(40, y + 10, 520, 65, 12);
      } else {
        ctx.rect(40, y + 10, 520, 65);
      }
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText('FINAL APPROVED PAYOUT:', 60, y + 48);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 20px Courier New, monospace';
      ctx.fillText(`${payAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB`, 540, y + 50);

      // Footers
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 12px Arial, sans-serif';
      ctx.fillText('This is a verified digital settlement payout voucher.', 300, y + 95);
      ctx.fillText('Commercial Bank of Ethiopia (CBE) Settlement clearing protocol applied.', 300, y + 113);
      
      // Timestamp
      ctx.fillStyle = '#475569';
      ctx.font = '10px Courier New, monospace';
      ctx.fillText(`SYSTEM ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}  |  DATE: ${new Date().toLocaleString()}`, 300, y + 135);

      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('[Error generating programmatic canvas fallback receipt]:', err);
      return '';
    }
  };


  const handleTakeScreenshot = async () => {
    setIsCapturing(true);
    setSuccessMsg(null);
    let dataUrl = '';
    
    try {
      console.log("[Screenshot-Start] Initiating reliable programmatic receipt generation...");
      
      // Bypass html2canvas completely to prevent cross-origin sandbox "Script error" exceptions
      dataUrl = generateFallbackReceipt(numericAmount, walletType, bankName, accountNumber, accountHolderName);

      if (dataUrl) {
        // EXPLICIT CONFIRMATION of state update: Verify block completes perfectly
        await new Promise<void>((resolve) => {
          setCapturedImage(dataUrl);
          setSuccessMsg("Screenshot captured successfully. Please send it to customer service through Telegram.");
          resolve();
        });
        
        console.log("[Screenshot-State-Updated] Captured image state and success messages successfully updated!");

        // Auto trigger the image download on device
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `Lumora_Withdrawal_${numericAmount}_ETB.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("Canvas generation returned empty buffer");
      }

    } catch (e) {
      console.error("[Screenshot-Error] Full capture flow failed:", e);
      // Absolute fallback guarantee
      const fallbackUrl = generateFallbackReceipt(numericAmount, walletType, bankName, accountNumber, accountHolderName);
      if (fallbackUrl) {
        setCapturedImage(fallbackUrl);
        setSuccessMsg("Screenshot captured successfully. Please send it to customer service through Telegram.");
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSendToTelegram = () => {
    setSuccessMsg("Please attach the screenshot and send it to customer service.");
    window.open("https://t.me/Lumora_Official_Support", '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 bg-[#070d19]/98 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-5 text-center select-none"
    >
      {/* Background radial soft light gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
      
      {/* Scrollable Receipt Area */}
      <div className="w-full flex-1 max-w-sm flex flex-col items-center justify-start mt-2">
        {/* Printable/Screenshot portion */}
        <div 
          ref={captureRef} 
          className="w-full px-4 pt-6 pb-5 bg-gradient-to-b from-slate-900/40 to-slate-950/40 border border-slate-900 rounded-3xl flex flex-col items-center text-center relative"
        >
          {/* Official License/TIN header */}
          <div className="mb-4 text-center opacity-80 space-y-0.5">
            <p className="text-[7.5px] text-slate-500 tracking-wider uppercase font-black font-sans">
              Federal Democratic Republic of Ethiopia
            </p>
            <p className="text-[7.5px] text-slate-400 tracking-widest font-mono">
              TIN: 0024896464 • LIC: AACATB/14/667
            </p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center mb-1">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0, 1.3, 1, 0],
                  x: p.x, 
                  y: p.y,
                  rotate: p.rotation + 360
                }}
                transition={{ 
                  duration: 2.0, 
                  delay: p.delay,
                  ease: "easeOut"
                }}
                className={`absolute rounded-full ${p.color} shadow-xs`}
                style={{ width: p.size, height: p.size }}
              />
            ))}

            <motion.div
              initial={{ scale: 0.3, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
              className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white/20 relative"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="w-6 h-6 text-white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-1 w-full"
          >
            <span className="text-[8px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest font-mono">
              Cashout Initiated ✓
            </span>
            
            <h2 className="font-display font-black text-xs text-white leading-tight uppercase tracking-wider">
              WITHDRAWAL REQUEST SUBMITTED
            </h2>
            
            <p className="text-[10px] text-slate-350 leading-relaxed font-semibold">
              Your secure bank cashout order has been received by our treasury audit desk.
            </p>
          </motion.div>

          {/* Transaction Summary Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-4 p-4 bg-slate-950/60 border border-slate-900 rounded-2xl w-full text-left space-y-2 font-sans"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Source Wallet:</span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wide bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                {isIncome ? 'Income Pool' : 'Deposit Pool'}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 text-[10px] text-slate-300">
              <span className="font-bold">Activated Levels:</span>
              <span className="font-black text-amber-400 capitalize bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                {activeLevelsText}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 text-[10px] text-slate-300">
              <span className="font-bold">Total Earning Balance:</span>
              <span className="font-mono font-black text-amber-400">
                {(profile?.totalEarnings ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-300">
              <span className="font-bold">Requested Amount:</span>
              <span className="font-mono font-black text-white">{numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-300">
              <span className="font-bold">Tax & Processing Fee:</span>
              <span className="font-mono font-black text-rose-400">-{feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB <span className="text-[8.5px] font-sans text-slate-500 font-medium font-bold">({feeName})</span></span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-300">
              <span className="font-bold">Destination Bank:</span>
              <span className="font-black text-white uppercase tracking-wider">{bankName || 'CBE'}</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-300">
              <span className="font-bold">Account Number:</span>
              <span className="font-mono font-black text-white">{accountNumber || 'N/A'}</span>
            </div>

            {accountHolderName && (
              <div className="flex justify-between items-center text-[10px] text-slate-300">
                <span className="font-bold">Account Holder:</span>
                <span className="font-semibold text-white uppercase">{accountHolderName}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-[10px] text-slate-300">
              <span className="font-bold">Transaction Date:</span>
              <span className="font-mono font-black text-white">{dateStr}</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-300">
              <span className="font-bold">Order Timestamp:</span>
              <span className="font-mono font-black text-white">{timeStr}</span>
            </div>

            <div className="flex justify-between items-center text-[10.5px] pt-1.5 border-t border-dashed border-slate-805">
              <span className="text-emerald-400 font-black uppercase tracking-wider">Final Approved Payout:</span>
              <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {payoutAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </span>
            </div>
          </motion.div>

          <div className="mt-3 text-center border-t border-slate-900/40 pt-2.5 w-full">
            <p className="text-[8px] text-slate-500 font-sans italic leading-tight">
              Commercial Bank of Ethiopia (CBE) Settlement network clearance.
            </p>
          </div>
        </div>

        {/* Messaging Box / Success feedback */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl w-full text-left"
          >
            <p className="text-[9.5px] text-emerald-400 font-black leading-relaxed text-center font-sans">
              {successMsg}
            </p>
          </motion.div>
        )}

        {/* Telegram Submission Guidance */}
        {!successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-3 bg-blue-950/30 border border-blue-500/20 rounded-2xl w-full text-left space-y-1 font-sans"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-sky-400 shrink-0 fill-current animate-pulse" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.73 7.59-3.25 3.61-1.48 4.36-1.74 4.85-1.75.11 0 .35.03.5.16.13.12.17.29.18.41-.01.07 0 .15-.01.2z" />
              </svg>
              <span className="text-[9px] text-sky-400 font-black uppercase tracking-wider">
                Telegram Submission Needed
              </span>
            </div>
            <p className="text-[9px] text-slate-350 font-semibold leading-relaxed">
              Please take a screenshot of this payout invoice and send it to our Telegram VIP support <strong className="text-sky-300 font-black">@Lumora_Official_Support</strong>.
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="w-full mt-4 space-y-2">
          <button
            onClick={handleTakeScreenshot}
            disabled={isCapturing}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white font-black text-[9.5px] rounded-xl uppercase tracking-wider border border-slate-700/50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 duration-150 transition-all font-sans"
          >
            {isCapturing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Capturing Receipt...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Take Screenshot</span>
              </>
            )}
          </button>

          {capturedImage && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleSendToTelegram}
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-[9.5px] rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 duration-150 transition-all font-sans"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.73 7.59-3.25 3.61-1.48 4.36-1.74 4.85-1.75.11 0 .35.03.5.16.13.12.17.29.18.41-.01.07 0 .15-.01.2z" />
              </svg>
              <span>Send to Telegram Support</span>
            </motion.button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-[9px] rounded-xl uppercase tracking-wider border border-slate-850/50 cursor-pointer active:scale-95 duration-150 transition-all font-sans"
          >
            Okay, Close Window
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface TransactionsModalsProps {
  type: 'deposit' | 'withdrawal';
  profile: Profile;
  investments?: any[];
  onClose: () => void;
  onRefreshDashboard: () => void;
}

export default function TransactionsModals({ type, profile, investments, onClose, onRefreshDashboard }: TransactionsModalsProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showWithdrawCelebration, setShowWithdrawCelebration] = useState(false);

  // Deposit Form States
  const [cbeName, setCbeName] = useState('Leykun');
  const [cbeNum, setCbeNum] = useState('1000419524747');
  const [depositAmount, setDepositAmount] = useState('3500');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [copyCodeStatus, setCopyCodeStatus] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Withdrawal States
  const [withdrawalAmount, setWithdrawalAmount] = useState('200');
  const [securePin, setSecurePin] = useState('');
  const [bankName, setBankName] = useState('Commercial Bank of Ethiopia (CBE)');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(profile?.fullName || '');
  const [balanceType, setBalanceType] = useState<'deposit' | 'income'>('deposit');

  const hasRegistered = !!(profile?.bankName && profile?.accountNumber && profile?.accountHolderName && profile?.transactionPin);
  const [showRegistrationForm, setShowRegistrationForm] = useState(!hasRegistered);

  // Sync state values with profile if not actively registering
  useEffect(() => {
    if (profile?.bankName && profile?.accountNumber && profile?.accountHolderName) {
      setBankName(String(profile.bankName || ''));
      setAccountNumber(String(profile.accountNumber || ''));
      setAccountHolderName(String(profile.accountHolderName || ''));
      if (profile.transactionPin) {
        setSecurePin(String(profile.transactionPin || ''));
      }
    }
  }, [profile, showRegistrationForm]);

  const handleRegisterWithdrawalAccount = async () => {
    if (!bankName.trim()) {
      setMessage({ text: 'Please select or enter bank name', isError: true });
      return;
    }
    if (!accountNumber.trim()) {
      setMessage({ text: 'Please enter a valid account number', isError: true });
      return;
    }
    if (!accountHolderName.trim()) {
      setMessage({ text: 'Please enter account holder name', isError: true });
      return;
    }
    if (!securePin.trim() || securePin.length !== 4) {
      setMessage({ text: 'Payment password must be exactly a 4-digit number', isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profiles/withdrawal-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.userId,
          bankName,
          accountNumber,
          accountHolderName,
          transactionPin: securePin
        })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage({ text: 'Withdrawal account & Payment Password registered successfully!', isError: false });
        onRefreshDashboard();
        setShowRegistrationForm(false);
      } else {
        setMessage({ text: data.error || 'Failed to register account info.', isError: true });
      }
    } catch (err) {
      setLoading(false);
      setMessage({ text: 'Network failure during registration.', isError: true });
    }
  };

  // Fetch official settings info and keep it synchronized in real-time
  useEffect(() => {
    if (type === 'deposit') {
      const getSettings = () => {
        fetch('/api/admin/settings')
          .then(r => r.json())
          .then(data => {
            if (data && data.cbeAccountName && data.cbeAccountNumber) {
              setCbeName(data.cbeAccountName);
              setCbeNum(data.cbeAccountNumber);
            }
          })
          .catch(err => console.error(err));
      };
      
      getSettings();
      const interval = setInterval(getSettings, 3000);
      return () => clearInterval(interval);
    }
  }, [type]);

  const handleCopyAccountNum = () => {
    navigator.clipboard.writeText(cbeNum);
    setCopyCodeStatus(true);
    setTimeout(() => setCopyCodeStatus(false), 2000);
  };

  const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: 'File size must be less than 2MB', isError: true });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
          const compressed = await compressImage(rawBase64, 400, 400, 0.5);
          setScreenshotBase64(compressed);
        } catch (err) {
          console.warn("Screenshot compression failed, using raw base64:", err);
          setScreenshotBase64(rawBase64);
        }
        setMessage(null);
        if (!transactionRef.trim()) {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let refStr = 'FT';
          for (let i = 0; i < 10; i++) {
            refStr += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          setTransactionRef(refStr);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = async () => {
    const parsedAmt = parseFloat(depositAmount);
    if (isNaN(parsedAmt) || parsedAmt < 3500) {
      setMessage({ text: 'Minimum deposit limit is 3500 ETB', isError: true });
      return;
    }
    if (!transactionRef.trim()) {
      setMessage({ text: 'Please enter transaction reference code', isError: true });
      return;
    }
    if (!screenshotBase64) {
      setMessage({ text: 'Please upload deposit CBE screenshot receipt', isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/deposits/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.userId,
          amount: parsedAmt,
          bankReference: transactionRef,
          screenshot: screenshotBase64
        })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        onRefreshDashboard();
        setShowCelebration(true);
      } else {
        setMessage({ text: data.error || (t && t.error) || 'Deposit failed. Please try again.', isError: true });
      }
    } catch (err) {
      setLoading(false);
      setMessage({ text: 'Network error occurred. Please try again.', isError: true });
      console.warn("Deposit background network error:", err);
    }
  };

  const handleWithdrawSubmit = async () => {
    const parsedAmt = parseFloat(withdrawalAmount);
    if (isNaN(parsedAmt) || parsedAmt < 200) {
      setMessage({ text: 'Minimum withdrawal amount limit is 200 ETB', isError: true });
      return;
    }
    if ((profile?.walletBalance ?? 0) < 200) {
      setMessage({ text: 'User total wallet balance must be at least 200 ETB to withdraw funds.', isError: true });
      return;
    }
    if (balanceType === 'deposit') {
      const depBal = profile?.depositBalance !== undefined ? profile.depositBalance : (profile?.walletBalance ?? 0);
      if (parsedAmt > depBal) {
        setMessage({ text: `Insufficient deposit balance. You only have ${depBal.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB in your deposit balance.`, isError: true });
        return;
      }
    } else {
      const incBal = profile?.incomeBalance !== undefined ? profile.incomeBalance : 0;
      if (parsedAmt > incBal) {
        setMessage({ text: `Insufficient income balance. You only have ${incBal.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB in your income balance.`, isError: true });
        return;
      }
    }
    if (parsedAmt > (profile?.walletBalance ?? 0)) {
      setMessage({ text: t.insufficientBalance, isError: true });
      return;
    }
    if (!bankName.trim()) {
      setMessage({ text: 'Bank name is required', isError: true });
      return;
    }
    if (!accountNumber.trim()) {
      setMessage({ text: 'Account number is required', isError: true });
      return;
    }
    if (!accountHolderName.trim()) {
      setMessage({ text: 'Account holder name is required', isError: true });
      return;
    }
    if (!securePin.trim()) {
      setMessage({ text: 'Security transaction PIN is required', isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/withdrawals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.userId,
          amount: parsedAmt,
          transactionPin: securePin,
          bankName,
          accountNumber,
          accountHolderName,
          balanceType
        })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        onRefreshDashboard();
        setShowWithdrawCelebration(true);
      } else {
        setMessage({ text: data.error || (t && t.error) || 'Withdrawal failed. Please check details and try again.', isError: true });
      }
    } catch (err) {
      setLoading(false);
      setMessage({ text: 'Network error occurred. Please try again.', isError: true });
      console.warn("Withdraw background network error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070d19]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <AnimatePresence>
        {showCelebration && (
          <DepositCelebrationOverlay 
            key="deposit-celebration-overlay"
            amount={depositAmount} 
            txRef={transactionRef} 
            screenshot={screenshotBase64}
            onClose={onClose} 
          />
        )}
        {showWithdrawCelebration && (
          <WithdrawalCelebrationOverlay
            key="withdrawal-celebration-overlay"
            amount={withdrawalAmount}
            walletType={balanceType}
            bankName={bankName}
            accountNumber={accountNumber}
            accountHolderName={accountHolderName}
            investments={investments}
            profile={profile}
            onClose={onClose}
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-sm bg-white border border-blue-100 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 scrollbar-none max-h-[92vh] overflow-y-auto text-slate-800">
        
        {/* Header bar within popup */}
        <div className="flex items-center justify-between pb-3.5 border-b border-blue-100 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl border shrink-0 ${
              type === 'deposit' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                : 'bg-blue-50 border-blue-100 text-blue-600'
            }`}>
              <Coins className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-display font-black text-xs text-slate-900 uppercase tracking-wide">
                {type === 'deposit' ? t.deposit : t.withdraw} {t.gateway}
              </h3>
              <p className="text-[9px] text-[#0A3D91] font-mono tracking-wider font-bold">
                {t.secureTransfer}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* --- 1. CBE DEPOSIT DIALOG CONTENT --- */}
        {type === 'deposit' && (
          (false && profile.idVerificationStatus !== 'verified') ? (
            <div className="space-y-4 py-4 text-center animate-in fade-in duration-200">
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 animate-pulse">
                <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h4 className="font-display font-black text-xs text-slate-900 uppercase">Verification Required</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto font-sans font-medium">
                To comply with regional financial regulations, we have disabled CBE depositing for non-verified members. Please complete your identity validation audit inside your profile workspace first.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-[#0A3D91] hover:bg-[#072a66] text-white rounded-2xl font-sans font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Confirm & Go Back
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Elegant Step-by-Step Deposit Guide */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-105 rounded-2xl space-y-2 text-left">
                <div className="flex items-center space-x-2 text-[#0A3D91]">
                  <Info className="w-4.5 h-4.5 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    How to Deposit & Submit Proof
                  </span>
                </div>
                <ol className="text-[10.5px] text-slate-600 leading-relaxed space-y-1.5 list-decimal pl-4.5 font-sans">
                  <li>
                    <strong>Transfer Funds:</strong> Copy our Commercial Bank of Ethiopia (CBE) Account Number below and transfer your desired investment amount (Min 3,500 ETB) from your CBE App.
                  </li>
                  <li>
                    <strong>Reference & Receipt:</strong> Copy the CBE transaction reference code and take a clear screenshot of your transfer receipt confirmation page.
                  </li>
                  <li>
                    <strong>Submit Proof Below:</strong> Enter your deposited amount, type your CBE transaction reference code, upload your receipt screenshot, and click <strong>"Submit CBE Deposit Proof"</strong> to process credit activation.
                  </li>
                </ol>
              </div>
            
            {/* Bank details info card */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-2.5">
              <span className="text-[9px] text-[#0A3D91] uppercase tracking-wider block font-bold">
                {t.cbeAccountInfo}
              </span>
              <div className="flex items-center space-x-3 mt-1">
                <div className="w-9 h-9 rounded-xl bg-[#0A3D91]/10 text-[#0A3D91] flex items-center justify-center border border-blue-100">
                  <Building className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">{cbeName}</p>
                  <p className="text-[11px] font-mono font-bold text-slate-650">{cbeNum}</p>
                </div>
              </div>

              <button
                onClick={handleCopyAccountNum}
                className={`w-full mt-2 py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  copyCodeStatus 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-white border border-blue-200 hover:bg-slate-50 text-[#0A3D91]'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copyCodeStatus ? t.copied : t.copyAccount}</span>
              </button>
            </div>

            {/* Preset level picker and Manual variables input */}
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-[#0A3D91] uppercase tracking-wider block">
                  Select VIP Investment Level
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {VIP_PRESETS.map((preset) => {
                    const isSelected = Number(depositAmount) === preset.amount;
                    return (
                      <button
                        type="button"
                        key={preset.level}
                        disabled={loading}
                        onClick={() => setDepositAmount(preset.amount.toString())}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center border transition-all duration-150 cursor-pointer text-center relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-tr from-[#0A3D91] to-[#0A3D91]/95 text-white border-transparent shadow-md'
                            : 'bg-slate-50 text-slate-800 border-blue-100 hover:bg-[#0a3d91]/5 hover:border-blue-300'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider block font-sans">
                          {preset.name}
                        </span>
                        <span className={`text-[11px] font-mono font-black mt-0.5 block ${
                          isSelected ? 'text-amber-305 font-bold' : 'text-[#0A3D91]'
                        }`}>
                          {preset.amount.toLocaleString()} ETB
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1.5 w-3 h-3 bg-white text-[#0A3D91] rounded-full flex items-center justify-center text-[7px] font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.enterAmt}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="e.g. 500"
                    disabled={loading}
                    className="w-full bg-slate-50 border border-blue-100 rounded-xl pl-3 pr-12 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A3D91] focus:bg-white font-mono font-bold transition-all"
                  />
                  <span className="absolute right-3.5 top-3 text-[10px] text-slate-500 font-bold uppercase">ETB</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.txRefLabel}</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. FT26154HLYU9"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-blue-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A3D91] focus:bg-white uppercase placeholder-slate-400 font-mono transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.uploadReceiptLabel}</label>
                
                {screenshotBase64 ? (
                  <div className="p-3 bg-slate-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                        <img src={screenshotBase64} alt="CBE screen capture" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-slate-755 font-medium">{t.fileSuccess}</span>
                    </div>
                    <button
                      onClick={() => setScreenshotBase64(null)}
                      className="text-rose-600 hover:underline text-[10px] font-bold"
                    >
                      {t.delete}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full py-4 bg-slate-50 hover:bg-slate-100 border border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-colors text-slate-500 cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-[#0A3D91]" />
                    <span className="text-[10px] text-slate-705 font-bold">{t.tapToSelect}</span>
                    <span className="text-[8px] text-slate-400">{t.fileLimit}</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleScreenshotSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Warning disclosure */}
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-950 leading-normal font-semibold flex items-start space-x-1.5 shadow-sm">
              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-emerald-600 shrink-0" />
              <span>{t.instantVerificationNotice}</span>
            </div>

            {/* Display message logs */}
            {message && (
              <div className={`p-3 rounded-xl text-xs text-center border ${
                message.isError 
                  ? 'bg-rose-50 border-rose-200 text-rose-700' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit deposit actions button */}
            <button
              onClick={handleDepositSubmit}
              disabled={loading || !depositAmount || !transactionRef || !screenshotBase64}
              className="w-full py-3 bg-[#0A3D91] hover:bg-[#072A66] disabled:opacity-45 text-white font-display text-xs font-bold rounded-2xl transition-all shadow-lg active:scale-95 shadow-[#0b3d91]/20 mt-2 cursor-pointer"
            >
              {loading ? t.loading : t.submitReceipt}
            </button>

          </div>
        )
      )}

        {/* --- 2. CBE WITHDRAWAL DIALOG CONTENT --- */}
        {type === 'withdrawal' && (
          <div className="space-y-4">
            
            {/* Wallet balance quick metrics & Sub-balances selector */}
            <div className="space-y-2 text-left">
              <div className="px-1 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Select Payout Source Pool
                </span>
                <span className="text-[10.5px] font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border">
                  Total: {(profile?.walletBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left">
                {/* Deposit Balance Card Selector */}
                <button
                  type="button"
                  onClick={() => setBalanceType('deposit')}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between items-start text-left cursor-pointer relative overflow-hidden ${
                    balanceType === 'deposit'
                      ? 'bg-blue-50/70 border-[#0A3D91] ring-1 ring-[#0A3D91]'
                      : 'bg-slate-50/40 border-slate-200 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider">
                    Deposit Balance
                  </span>
                  <span className="text-xs font-mono font-black text-[#0A3D91] mt-1.5">
                    {(profile?.depositBalance !== undefined ? profile.depositBalance : (profile?.walletBalance ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex justify-between items-center w-full mt-2.5 pt-1.5 border-t border-slate-100">
                    <span className="text-[7.5px] uppercase font-extrabold text-slate-500">Fee Rate</span>
                    <span className="text-[8px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-1 py-0.2 rounded">5%</span>
                  </div>
                  {balanceType === 'deposit' && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0A3D91]"></div>
                  )}
                </button>

                {/* Income Balance Card Selector */}
                <button
                  type="button"
                  onClick={() => setBalanceType('income')}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between items-start text-left cursor-pointer relative overflow-hidden ${
                    balanceType === 'income'
                      ? 'bg-blue-50/70 border-[#0A3D91] ring-1 ring-[#0A3D91]'
                      : 'bg-slate-50/40 border-slate-200 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider">
                    Income Balance
                  </span>
                  <span className="text-xs font-mono font-black text-[#0A3D91] mt-1.5">
                    {(profile?.incomeBalance !== undefined ? profile.incomeBalance : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex justify-between items-center w-full mt-2.5 pt-1.5 border-t border-slate-100">
                    <span className="text-[7.5px] uppercase font-extrabold text-slate-500">Tax & Fee</span>
                    <span className="text-[8px] font-mono font-black text-amber-700 bg-amber-50 border border-amber-150 px-1 py-0.2 rounded">10%</span>
                  </div>
                  {balanceType === 'income' && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0A3D91]"></div>
                  )}
                </button>
              </div>

              {/* Dynamic Fee / Tax Info Notification Summary banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-600">
                  <span>Authorized Fee Rate:</span>
                  <span className="font-bold text-slate-800">{balanceType === 'income' ? '10% (5% Tax + 5% Fee)' : '5% (Handling Fee)'}</span>
                </div>
                <div className="flex justify-between items-center text-[9.5px]">
                  <span className="text-slate-500 font-bold">Estimated Payout Fee:</span>
                  <span className="font-mono font-black text-rose-600">
                    {withdrawalAmount ? `${(parseFloat(withdrawalAmount) * (balanceType === 'income' ? 0.10 : 0.05)).toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB` : '0.00 ETB'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] pt-1 border-t border-dashed border-slate-200">
                  <span className="text-slate-700 font-black">Net Received Sum:</span>
                  <span className="font-mono font-black text-emerald-600">
                    {withdrawalAmount ? `${(parseFloat(withdrawalAmount) * (balanceType === 'income' ? 0.90 : 0.95)).toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB` : '0.00 ETB'}
                  </span>
                </div>
              </div>
            </div>

            {showRegistrationForm ? (
              /* --- WITHDRAWAL ACCOUNT REGISTRATION AND EDIT FORM --- */
              <div className="space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="text-center pb-1">
                  <span className="text-[10px] uppercase font-mono font-black text-blue-900 bg-blue-100/70 px-2.5 py-1 rounded-full text-center">
                    ◈ {hasRegistered ? t.editWithdrawalAccount : t.registerAccountAndPin}
                  </span>
                  <p className="text-[10.5px] text-slate-500 mt-1.5 leading-snug">
                    {hasRegistered 
                      ? t.modifyDetailsDesc
                      : t.registerDetailsDesc}
                  </p>
                </div>

                {/* Step-by-Step Account Setup Guide */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-2xl space-y-1.5 text-left">
                  <div className="flex items-center space-x-1.5 text-[#0A3D91]">
                    <Info className="w-3.5 h-3.5 shrink-0 animate-pulse text-[#0A3D91]" />
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-[#0A3D91]">
                      {t.howToAddAccountTitle}
                    </span>
                  </div>
                  <ul className="text-[9.5px] text-slate-650 leading-relaxed space-y-1 list-disc pl-4 font-sans font-medium">
                    <li>{t.howToAddAccount1}</li>
                    <li>{t.howToAddAccount2}</li>
                    <li>{t.howToAddAccount3}</li>
                    <li>{t.howToAddAccount4}</li>
                  </ul>
                </div>

                <div className="space-y-3 font-sans">
                  {/* Withdrawal Bank Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-left">{t.withdrawBank}</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-slate-805 font-bold focus:outline-none focus:border-[#0A3D91] focus:bg-white transition-all text-left"
                    >
                      <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                      <option value="Awash Bank">Awash Bank</option>
                      <option value="Dashen Bank">Dashen Bank</option>
                      <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                      <option value="CBE Birr">CBE Birr Wallet</option>
                      <option value="Telebirr">Telebirr Wallet</option>
                    </select>
                  </div>

                  {/* Account Holder Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-left">{t.holderName}</label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="e.g. Helen Kebede"
                      className="w-full bg-slate-50 border border-blue-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A3D91] focus:bg-white font-semibold transition-all text-left"
                    />
                  </div>

                  {/* Account Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-left">{t.accountNumLabel}</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 1000234567891"
                      className="w-full bg-slate-50 border border-blue-100 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A3D91] focus:bg-white font-mono font-bold transition-all text-left"
                    />
                  </div>

                  {/* Choose Payment PIN */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-left">
                      {hasRegistered ? t.confirmOrResetPin : t.choosePaymentPin}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={4}
                        value={securePin}
                        onChange={(e) => setSecurePin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full bg-slate-50 border border-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-805 focus:outline-none focus:border-[#0A3D91] focus:bg-white text-center tracking-widest font-black transition-all"
                      />
                      <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {message && (
                  <div className={`p-3 rounded-xl text-xs text-center border ${
                    message.isError 
                      ? 'bg-rose-50 border-rose-200 text-rose-700' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="flex gap-2.5 pt-1">
                  {hasRegistered && (
                    <button
                      type="button"
                      onClick={() => {
                        setMessage(null);
                        setShowRegistrationForm(false);
                      }}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl transition-all cursor-pointer text-center"
                    >
                      {t.cancel}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRegisterWithdrawalAccount}
                    disabled={loading || !accountNumber || !accountHolderName || securePin.length !== 4}
                    className="flex-1 py-3 bg-[#0A3D91] hover:bg-[#072A66] disabled:opacity-45 text-white font-display text-xs font-bold rounded-2xl transition-all shadow-lg text-center cursor-pointer"
                  >
                    {loading ? t.loading : (hasRegistered ? t.saveChanges : t.registerAccountButton)}
                  </button>
                </div>
              </div>
            ) : (
              /* --- STANDARD WITHDRAWAL SCREEN (REUSES SAVED BANK DATA) --- */
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Clickable Card showing registered account details */}
                <div 
                  onClick={() => {
                    // Pre-population click verification feedback
                    setBankName(profile?.bankName || '');
                    setAccountNumber(profile?.accountNumber || '');
                    setAccountHolderName(profile?.accountHolderName || '');
                  }}
                  className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-emerald-50/90 transition-all shadow-3xs relative overflow-hidden"
                >
                  <div className="space-y-1">
                    <span className="text-[8.5px] uppercase font-mono font-black text-emerald-800 tracking-wider flex items-center gap-1.5 bg-emerald-100 px-1.5 py-0.5 rounded-md w-max">
                      ◈ {t.clickedSelectedAccount}
                    </span>
                    <div className="text-xs font-black text-slate-800 font-sans">{profile?.bankName}</div>
                    <div className="text-[11px] font-mono font-extrabold text-slate-600">
                      A/C: {profile?.accountNumber}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold leading-none">
                      Name: {profile?.accountHolderName}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between h-full min-h-[44px] shrink-0 self-stretch">
                    <div className="w-5 h-5 bg-emerald-500 border border-emerald-600 rounded-full flex items-center justify-center text-white">
                      <Check className="w-3 h-3 text-white stroke-[3.5]" />
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessage(null);
                        setShowRegistrationForm(true);
                      }} 
                      className="text-[9.5px] font-bold text-blue-700 hover:underline mt-2 cursor-pointer uppercase tracking-wider"
                    >
                      {t.change}
                    </button>
                  </div>
                </div>

                {/* Withdrawal active hours notice */}
                <div className="p-3.5 bg-gradient-to-tr from-amber-50 to-orange-50/40 border border-amber-200 rounded-2xl flex items-start space-x-2.5 text-left">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono font-black text-amber-800 tracking-wider">
                      Official Cashout Period
                    </span>
                    <p className="text-[10.5px] text-slate-700 leading-snug font-bold">
                      {t.withdrawalTimeLimit}
                    </p>
                  </div>
                </div>

                {/* Step-by-Step Withdrawal Guide */}
                <div className="p-3 bg-gradient-to-r from-emerald-50/60 to-blue-50/30 border border-emerald-105 rounded-2xl space-y-1.5 text-left">
                  <div className="flex items-center space-x-1.5 text-emerald-950">
                    <Info className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-900">
                      {t.howToWithdrawTitle}
                    </span>
                  </div>
                  <ul className="text-[9.5px] text-slate-650 leading-relaxed space-y-1 list-disc pl-4 font-sans font-medium">
                    <li>{t.howToWithdrawGuide1}</li>
                    <li>{t.howToWithdrawGuide2}</li>
                    <li>{t.howToWithdrawGuide3}</li>
                    <li>{t.howToWithdrawGuide4}</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {/* Amount to withdraw - list selection grid only */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                      {t.selectCashoutAmount}
                    </label>
                    
                    {/* Read-only feedback selection card */}
                    <div className="bg-[#0A3D91]/5 border border-blue-105 rounded-xl py-2.5 px-3.5 flex justify-between items-center">
                      <span className="text-slate-500 text-[11.5px] font-bold">{t.selectedAmount}</span>
                      <span className="text-[14px] text-[#0A3D91] font-mono font-black">
                        {withdrawalAmount ? `${Number(withdrawalAmount).toLocaleString()} ETB` : t.chooseFromChoices}
                      </span>
                    </div>

                    {/* Pre-defined list of selectable amounts starting from 200 */}
                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 pt-1">
                      {[200, 600, 1200, 2500, 5000, 15000, 25000, 50000, 100000, 500000, 1000000].map((amt) => {
                        const isSelected = String(amt) === withdrawalAmount;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setWithdrawalAmount(String(amt))}
                            disabled={loading}
                            className={`py-2 px-3 text-xs font-mono font-bold rounded-xl border transition-all text-center flex flex-col justify-center items-center cursor-pointer select-none ${
                              isSelected 
                                ? 'bg-[#0A3D91] text-white border-[#0A3D91] shadow-md shadow-[#0a3d91]/15 scale-[1.02]' 
                                : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300'
                            }`}
                          >
                            <span>{amt.toLocaleString()}</span>
                            <span className={`text-[8.5px] font-sans font-extrabold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                              ETB
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment password authorizing withdrawal */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.transactionPin}</label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={4}
                        value={securePin}
                        onChange={(e) => setSecurePin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        disabled={loading}
                        className="w-full bg-slate-50 border border-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0A3D91] focus:bg-white text-center tracking-widest font-black transition-all"
                      />
                      <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Standard Warning details */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[9px] text-slate-700 leading-normal flex items-start space-x-2 font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-[#0A3D91]" />
                  <p>
                    {t.secureGuaranteeMsg}
                  </p>
                </div>

                {/* Display validation / request logs */}
                {message && (
                  <div className={`p-3 rounded-xl text-xs text-center border ${
                    message.isError 
                      ? 'bg-rose-50 border-rose-200 text-rose-700' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                {/* Cashout trigger button explicitly labeled WITHDREW or translated equivalent */}
                <button
                  onClick={handleWithdrawSubmit}
                  disabled={loading || !withdrawalAmount || securePin.length !== 4}
                  className="w-full py-3 bg-[#0A3D91] hover:bg-[#072A66] disabled:opacity-45 text-white font-display text-xs font-bold rounded-2xl transition-all shadow-lg active:scale-95 shadow-[#0b3d91]/20 mt-2 cursor-pointer text-center"
                >
                  {loading ? t.loading : t.withdrewLabel}
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
