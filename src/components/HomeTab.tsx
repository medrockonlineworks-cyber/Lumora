import { useState } from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, Landmark, 
  Calculator, Info, Award
} from 'lucide-react';
import { Language, translations } from '../locale';
import { UserProfile } from '../types';

interface HomeTabProps {
  profile: UserProfile;
  language: Language;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export default function HomeTab({ 
  profile, 
  language, 
  onOpenDeposit, 
  onOpenWithdraw,
}: HomeTabProps) {
  const t = translations[language];
  const [showLoanCalc, setShowLoanCalc] = useState(false);
  const [calcAmount, setCalcAmount] = useState('10000');
  const [calcDays, setCalcDays] = useState('90');

  // Calculate dynamic compound growth
  const calculatedGrowth = Number(calcAmount) * 0.05 * Number(calcDays);
  const totalPayout = Number(calcAmount) + calculatedGrowth;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0A3D91] to-blue-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg border border-blue-800">
        <div className="absolute top-[-30%] right-[-10%] w-48 h-48 rounded-full bg-amber-400/15 blur-2xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start z-10 relative">
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-blue-200">
              Welcome back
            </p>
            <h2 className="text-xl font-black mt-1 font-sans">{profile.name}</h2>
            <p className="text-[10px] text-blue-100 font-bold mt-0.5 tracking-wider font-mono">
              CBE Account Synced: {profile.phone}
            </p>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-[9px] font-black uppercase tracking-wider text-emerald-400 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Synced</span>
          </div>
        </div>

        {/* Balance Display */}
        <div className="mt-8 z-10 relative">
          <p className="text-[10px] uppercase font-black tracking-widest text-blue-200 flex items-center space-x-1">
            <Wallet className="w-3 h-3 text-amber-400" />
            <span>{t.walletBalance}</span>
          </p>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="font-display font-black text-4xl text-white tracking-tight font-mono">
              {profile.walletBalance.toLocaleString()}
            </span>
            <span className="text-sm font-black text-amber-300 font-mono">ETB</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-white/10 z-10 relative">
          <button
            onClick={onOpenDeposit}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-amber-400 hover:bg-amber-500 text-[#00173D] rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-500/10"
          >
            <ArrowUpRight className="w-4 h-4 shrink-0" />
            <span>Deposit</span>
          </button>
          
          <button
            onClick={onOpenWithdraw}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 shrink-0" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Financial statistics card grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{t.totalDeposited}</span>
          <div className="mt-1 flex items-baseline space-x-0.5">
            <span className="text-md font-black font-mono text-slate-900">{profile.totalDeposited.toLocaleString()}</span>
            <span className="text-[9px] font-bold text-slate-600 font-mono">ETB</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{t.totalWithdrawn}</span>
          <div className="mt-1 flex items-baseline space-x-0.5">
            <span className="text-md font-black font-mono text-slate-900">{profile.totalWithdrawn.toLocaleString()}</span>
            <span className="text-[9px] font-bold text-slate-600 font-mono">ETB</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between bg-emerald-50/20 border-emerald-100">
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800">{t.totalEarned}</span>
          <div className="mt-1 flex items-baseline space-x-0.5">
            <span className="text-md font-black font-mono text-emerald-700">{profile.totalEarned.toLocaleString()}</span>
            <span className="text-[9px] font-bold text-emerald-800 font-mono">ETB</span>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-[10.5px] font-sans antialiased">
          <p className="font-extrabold uppercase tracking-wide text-emerald-900">
            Sovereign Partner Status Active
          </p>
          <p className="text-slate-700 mt-0.5 font-medium">
            LUMORA funds are backed and guaranteed directly via our Commercial Bank of Ethiopia (CBE) liquidity vaults.
          </p>
        </div>
      </div>

      {/* Quick Services Section */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">
          {t.quickActions}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* About us button */}
          <button
            onClick={() => alert(language === 'am' ? 'ሉሞራ አስተማማኝና ከፍተኛ ወለድ ያላቸውን የኢንቨስትመንት ደረጃዎች በማቅረብ የኢትዮጵያ ንግድ ባንክ ደረሰኞችን በመጠቀም ህጋዊ ኢንቨስትመንት የሚያደርጉበት መድረክ ነው።' : 'LUMORA is Ethiopia\'s premier fixed-income platform. We offer institutional liquidity plans backed by CBE transaction vaults.')}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center space-x-3 text-left cursor-pointer active:scale-98"
          >
            <div className="p-2 rounded-xl bg-blue-50 text-[#0A3D91] border border-blue-100">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 block">About LUMORA</span>
              <span className="text-[9px] text-slate-500 font-bold block">Company details</span>
            </div>
          </button>

          {/* Calculator action */}
          <button
            onClick={() => setShowLoanCalc(!showLoanCalc)}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center space-x-3 text-left cursor-pointer active:scale-98"
          >
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 block">Calculator</span>
              <span className="text-[9px] text-slate-500 font-bold block">Forecast earnings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Dynamic Interactive Calculator Widget */}
      {showLoanCalc && (
        <div className="p-5 rounded-3xl bg-white border-2 border-amber-300 shadow-md space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2 pb-1.5 border-b border-slate-100">
            <Award className="w-5 h-5 text-amber-500 animate-pulse" />
            <h4 className="text-xs font-black uppercase text-[#0A3D91] tracking-wider">
              Secure Growth Calculator
            </h4>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wide block">Investment Capital (ETB)</label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wide block">Tenure Duration (Days)</label>
              <input
                type="number"
                value={calcDays}
                onChange={(e) => setCalcDays(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Results Block */}
          <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-600 font-bold">Estimated Daily Profit (5% APY equivalence)</span>
              <span className="font-mono font-black text-emerald-700">{(Number(calcAmount) * 0.05).toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-600 font-bold">Total Interest Generated</span>
              <span className="font-mono font-black text-emerald-700">+{calculatedGrowth.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200">
              <span className="text-slate-900 font-black uppercase tracking-wider">Total Projected Payout</span>
              <span className="font-mono font-black text-[#0A3D91]">{totalPayout.toLocaleString()} ETB</span>
            </div>
          </div>
        </div>
      )}

      {/* Sovereign stamp indicator */}
      <div className="pt-2 text-center flex flex-col items-center justify-center space-y-1.5">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500/30 flex items-center justify-center p-1">
          <Landmark className="w-5 h-5 text-emerald-600 animate-pulse-subtle" />
        </div>
        <p className="text-[8.5px] font-mono font-black text-slate-600 uppercase tracking-widest">
          Sovereign CBE Secure Clearing Node 0x931
        </p>
      </div>
    </div>
  );
}
