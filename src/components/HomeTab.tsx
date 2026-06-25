import { useState, useEffect } from 'react';
import { Coins, ArrowUpRight, ArrowDownRight, TrendingUp, MessageSquare, Building, ChevronRight, ShieldCheck, ArrowRight, UserCheck, Gift, CreditCard, Lock, Sparkles, Plus } from 'lucide-react';
import { useLanguage } from '../locale';
import { Profile, MyTransaction, Investment } from '../types';
import { motion } from 'motion/react';
import CbeLogo from './CbeLogo';

interface HomeTabProps {
  profile: Profile;
  todayEarnings: number;
  activeInvestmentsValue: number;
  recentTransactions: MyTransaction[];
  setActiveTab: (tab: string) => void;
  onQuickDepositClick: () => void;
  onQuickWithdrawClick: () => void;
  onRefreshDashboard?: () => void;
  investments?: Investment[];
}

export default function HomeTab({
  profile,
  todayEarnings,
  activeInvestmentsValue,
  recentTransactions,
  setActiveTab,
  onQuickDepositClick,
  onQuickWithdrawClick,
  onRefreshDashboard,
  investments
}: HomeTabProps) {
  const { language, t, et } = useLanguage();

  const [userCard, setUserCard] = useState<any | null>(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [showAllTx, setShowAllTx] = useState(false);

  const fetchUserCard = async () => {
    if (!profile?.userId) return;
    try {
      const res = await fetch(`/api/cards?userId=${profile.userId}`);
      const data = await res.json();
      if (res.ok && data.card) {
        setUserCard(data.card);
      } else {
        setUserCard(null);
      }
    } catch (err) {
      // Silent error
    } finally {
      setLoadingCard(false);
    }
  };

  useEffect(() => {
    fetchUserCard();
  }, [profile?.userId]);

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const [isClaimingYield, setIsClaimingYield] = useState(false);
  const [claimMsg, setClaimMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const getEATDateString = (dateInput: Date | string | number): string => {
    const d = new Date(dateInput);
    const eatMs = d.getTime() + (3 * 60 * 60 * 1000);
    const eatDate = new Date(eatMs);
    const year = eatDate.getUTCFullYear();
    const month = String(eatDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(eatDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNextEATMidnight = (nowDate: Date): Date => {
    const eatMs = nowDate.getTime() + (3 * 60 * 60 * 1000);
    const eatDate = new Date(eatMs);
    const year = eatDate.getUTCFullYear();
    const month = String(eatDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(eatDate.getUTCDate()).padStart(2, '0');
    return new Date(`${year}-${month}-${day}T21:00:00Z`);
  };

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hasCheckedInToday = profile.lastCheckInDate
    ? (getEATDateString(profile.lastCheckInDate) === getEATDateString(now))
    : false;

  const nextMidnight = getNextEATMidnight(now);

  const remainingHours = (() => {
    const diffMs = nextMidnight.getTime() - now.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  })();

  const formatCountdown = (ms: number): string => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeList = investments ? investments.filter(inv => inv.status === 'active' && inv.remainingDays > 0) : [];

  const nearestPayoutMs = (() => {
    if (activeList.length === 0) return Infinity;
    const nowTime = now.getTime();
    let minDiff = Infinity;
    activeList.forEach(inv => {
      const lastPayout = new Date(inv.lastPayoutDate || inv.startDate);
      const nextPayout = lastPayout.getTime() + 24 * 60 * 60 * 1000;
      const diff = nextPayout - nowTime;
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
      }
    });
    return minDiff;
  })();

  const handleCheckIn = async () => {
    if (isCheckingIn || hasCheckedInToday) return;
    setIsCheckingIn(true);
    setMsg(null);
    try {
      const response = await fetch('/api/profiles/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.userId })
      });
      const data = await response.json();
      if (response.ok) {
        setMsg({ text: `Success! 5.00 ETB Attendance bonus has been paid into your Income Pool.`, isError: false });
        if (onRefreshDashboard) {
          onRefreshDashboard();
        }
      } else {
        setMsg({ text: data.error || 'Failed to complete check-in.', isError: true });
      }
    } catch (err) {
      setMsg({ text: 'Network connection anomaly. Please try again.', isError: true });
    } finally {
      setIsCheckingIn(false);
      // Auto-dim notification after 6 seconds
      setTimeout(() => {
        setMsg(null);
      }, 6000);
    }
  };

  const handleClaimYield = async (investmentId?: string) => {
    if (isClaimingYield) return;
    setIsClaimingYield(true);
    setClaimMsg(null);
    try {
      const response = await fetch('/api/investments/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: profile.userId,
          investmentId: investmentId 
        })
      });
      const data = await response.json();
      if (response.ok) {
        setClaimMsg({ 
          text: `Success! Accrued dynamic return of ${data.claimedAmount.toFixed(2)} ETB has been credited to your withdrawable Income balance.`, 
          isError: false 
        });
        if (onRefreshDashboard) {
          onRefreshDashboard();
        }
      } else {
        setClaimMsg({ text: data.error || 'Failed to claim investment returns.', isError: true });
      }
    } catch (err) {
      setClaimMsg({ text: 'Network connection anomaly. Please try again.', isError: true });
    } finally {
      setIsClaimingYield(false);
      setTimeout(() => {
        setClaimMsg(null);
      }, 6000);
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Portfolio Card Section with Custom App Asset Background Image */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a3d91] via-[#072558] to-[#0A3D91] border border-blue-200/20 p-6 shadow-xl text-white min-h-[190px]">
        
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/home_card_bg_1780740391815.png"
            alt="Asset Network Growth"
            className="w-full h-full object-cover opacity-25 scale-102 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#072558] via-transparent to-black/15"></div>
        </div>

        {/* Dynamic Card Content Container */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-blue-100 uppercase tracking-widest flex items-center space-x-2 drop-shadow-sm font-mono">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{t.walletBalance || 'Core Portfolio'}</span>
            </span>
            <span className="px-3 py-1 text-[9px] font-black rounded-full bg-gradient-to-r from-amber-400 to-amber-300 text-[#0b3d91] flex items-center space-x-1.5 uppercase shadow-md font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0b3d91] animate-ping"></span>
              <span>
                {language === 'am' ? (profile.vipLevel === 1 ? "ጀማሪ ደረጃ" : `ቪአይፒ ደረጃ ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0}`) :
                 language === 'om' ? (profile.vipLevel === 1 ? "Starter Level" : `Sadarkaa VIP ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0}`) :
                 language === 'ti' ? (profile.vipLevel === 1 ? "ጀማሪ ደረጃ" : `ቪአይፒ ደረጃ ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0}`) :
                 language === 'so' ? (profile.vipLevel === 1 ? "Heerka Starter" : `Darajada VIP ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0}`) :
                 (profile.vipLevel === 1 ? "Starter Level" : `VIP Grade ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0}`)}
              </span>
            </span>
          </div>

          {/* Balance Display */}
          <div className="space-y-1.5 drop-shadow-md">
            <p className="text-[10px] font-bold text-blue-200/80 uppercase tracking-wider font-mono">
              {language === 'am' ? 'የሂሳብ ዋጋ ግምገማ' :
               language === 'om' ? 'Gatama Herregaa' :
               language === 'ti' ? 'ገምጋም ሒሳብ' :
               language === 'so' ? 'Qiimaynta Akoonka' :
               'Ledger Valuation'}
            </p>
            <div className="flex items-baseline space-x-2">
              <span className="font-display font-extrabold text-3.5xl text-white tracking-tight">
                {(profile?.walletBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-black text-amber-300 font-mono tracking-wider">ETB</span>
            </div>
          </div>

          {/* Dual Balance Pools Display */}
          <div className="grid grid-cols-2 gap-3 pb-1 pt-1 border-t border-white/10">
            {/* Deposit Balance */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 flex flex-col justify-between items-start">
              <div className="flex items-center space-x-1.5 text-blue-200/90">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span className="text-[8px] font-extrabold uppercase tracking-widest font-mono">
                  {language === 'am' ? 'የተቀመጠ ሂሳብ (Deposit)' : 'Deposit Pool'}
                </span>
              </div>
              <p className="text-xs font-black font-mono text-white mt-1">
                {(profile?.depositBalance !== undefined ? profile.depositBalance : (profile?.walletBalance ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-[8px] font-bold text-slate-300 ml-1">ETB</span>
              </p>
            </div>

            {/* Income Balance */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 flex flex-col justify-between items-start">
              <div className="flex items-center space-x-1.5 text-[#2ebd85]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2ebd85] animate-pulse"></div>
                <span className="text-[8px] font-extrabold uppercase tracking-widest font-mono">
                  {language === 'am' ? 'የትርፍ ሂሳብ (Income)' : 'Income Pool'}
                </span>
              </div>
              <p className="text-xs font-black font-mono text-[#2ebd85] mt-1">
                {(profile?.incomeBalance !== undefined ? profile.incomeBalance : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-[8px] font-bold text-slate-350 ml-1">ETB</span>
              </p>
            </div>
          </div>

          {/* CBE Guaranteed Growth Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 text-[9px] font-extrabold rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 w-fit backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-450 shrink-0" />
            <span className="uppercase tracking-wider">{et('cbeGuaranteedGrowth') || 'CBE Secure Custody Capital'}</span>
          </div>

          {/* Dashboard Grid mini metrics */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 mt-4 pt-5 border-t border-white/10 text-slate-100">
            <div>
              <p className="text-[9px] font-bold text-blue-200/80 uppercase tracking-widest font-mono">
                {t.activeInvestments || 'Capital Allocation'}
              </p>
              <p className="text-sm font-extrabold text-white mt-1 font-mono">
                {(activeInvestmentsValue ?? 0).toLocaleString()} <span className="text-[9px] text-blue-200 font-medium">ETB</span>
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-blue-200/80 uppercase tracking-widest font-mono">
                {t.todayEarnings || 'Accruing Dividend'}
              </p>
              <p className="text-sm font-extrabold text-[#2ebd85] mt-1 flex items-center space-x-1 font-mono">
                <span>+{(todayEarnings ?? 0).toLocaleString()}</span>
                <span className="text-[8px] text-emerald-200 bg-emerald-500/20 px-1 py-0.2 rounded font-mono font-bold">ETB</span>
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-blue-200/80 uppercase tracking-widest font-mono">
                {t.totalEarnings || 'Yields Disbursed'}
              </p>
              <p className="text-sm font-extrabold text-white mt-1 font-mono">
                {(profile?.totalEarnings || todayEarnings || 0).toLocaleString()} <span className="text-[9px] text-blue-200 font-medium">ETB</span>
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-blue-200/80 uppercase tracking-widest font-mono">
                {t.teamSize || 'Partner Network'}
              </p>
              <p className="text-sm font-extrabold text-white mt-1 font-mono">
                {profile.teamSize || 0} <span className="text-[9px] text-blue-200 font-medium lowercase">
                {language === 'am' ? 'አባላት' :
                 language === 'om' ? 'miseensota' :
                 language === 'ti' ? 'ኣባላት' :
                 language === 'so' ? 'xubnaha' :
                 'peers'}
              </span>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS BANNER - PREMIUM GRID */}
      <div className="grid grid-cols-4 gap-2.5 font-sans">
        {[
          { icon: ArrowUpRight, label: t.deposit || 'Deposit', action: onQuickDepositClick, color: 'bg-emerald-50 text-emerald-600 border-emerald-100/70 hover:bg-emerald-100/20 active:scale-95' },
          { icon: ArrowDownRight, label: t.withdraw || 'Withdraw', action: onQuickWithdrawClick, color: 'bg-rose-50 text-rose-600 border-rose-100/70 hover:bg-rose-100/20 active:scale-95' },
          { icon: TrendingUp, label: t.invest || 'VIP Plans', action: () => setActiveTab('investments'), color: 'bg-blue-50 text-[#0A3D91] border-blue-105 hover:bg-blue-100/20 active:scale-95' },
          { icon: MessageSquare, label: t.aiAssistant || 'Support', action: () => setActiveTab('assistant'), color: 'bg-indigo-50 text-indigo-700 border-indigo-105 hover:bg-indigo-100/20 active:scale-95' },
        ].map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={act.action}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(10,61,145,0.02)] transition-all cursor-pointer ${act.color}`}
            >
              <div className="p-2 rounded-xl bg-white border border-slate-100 mb-2 shadow-3xs">
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[9.5px] font-black text-slate-805 leading-tight tracking-wide uppercase">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* PREMIUM CENTRAL CLAIM CENTER BUTTON/BANNER */}
      {(() => {
        const unclaimedSum = investments ? investments.reduce((sum, inv) => sum + (inv.unclaimedReturns ?? 0), 0) : 0;
        const attendancePending = !hasCheckedInToday;
        const attendanceValue = attendancePending ? 5 : 0;
        const totalPendingInCenter = unclaimedSum + attendanceValue;

        return (
          <>
            <div id="central-claim-center-trigger-card" className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-5 shadow-[0_2px_12_rgba(10,61,145,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5 text-left">
                <div className="p-3 bg-amber-500/10 border border-amber-200 rounded-2xl text-amber-600 shrink-0">
                  <Gift className="w-6 h-6 shrink-0 fill-amber-500/20" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-sm text-[#0A3D91] uppercase tracking-wide flex items-center space-x-2">
                    <span>Lumora Claim Center</span>
                    {totalPendingInCenter > 0 && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-650 font-bold leading-normal">
                    Attendance reward bonus and accumulated dynamic asset portfolio yields ready for manual collection.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                <div className="flex flex-col text-left md:text-right font-sans">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">Claimable Funds</span>
                  <span className="text-sm font-black font-mono text-[#0A3D91] whitespace-nowrap">
                    {totalPendingInCenter.toFixed(2)} <span className="text-[9px] font-bold">ETB</span>
                  </span>
                </div>

                <button
                  id="open-claim-center-btn"
                  onClick={() => setIsClaimModalOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-[#0A3D91] hover:bg-[#072558] text-white hover:shadow-lg shadow-blue-500/10 active:scale-95 font-black text-[10.5px] uppercase tracking-wider transition-all duration-300 flex items-center space-x-2 shrink-0 h-11 cursor-pointer"
                >
                  <Coins className="w-4 h-4 shrink-0" />
                  <span>Open Claim Center</span>
                </button>
              </div>
            </div>

            {/* PREMIUM CENTRAL CLAIM CENTER MODAL/OVERLAY */}
            {isClaimModalOpen && (
              <div id="central-claim-center-modal" className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setIsClaimModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
                />
                
                {/* Modal Card content */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="relative bg-white rounded-3xl w-full max-w-md border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#0a3d91] to-[#072558] p-5 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-left">
                      <div className="p-2 bg-white/10 rounded-xl">
                        <Gift className="w-5 h-5 text-amber-300 fill-amber-300/20" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-sm uppercase tracking-wide">Lumora Claim Center</h3>
                        <p className="text-[9px] text-blue-200 font-bold">Consolidated Attendance & Asset Harvest desk</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsClaimModalOpen(false)}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer text-white flex items-center justify-center w-8 h-8 font-sans"
                      aria-label="Close"
                    >
                      <span className="text-md leading-none font-bold">✕</span>
                    </button>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 space-y-5 overflow-y-auto text-left font-sans">
                    
                    {/* Summary stat box */}
                    <div className="p-4 rounded-2.5xl bg-slate-50 border border-slate-150 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">Consolidated Pending Balance</span>
                        <p className="text-lg font-black text-[#0A3D91] font-mono">
                          {totalPendingInCenter.toFixed(2)} <span className="text-xs font-bold font-sans">ETB</span>
                        </p>
                      </div>
                      <span className={`text-[8px] font-black px-2.5 py-1 rounded-full ${
                        totalPendingInCenter > 0 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' 
                          : 'bg-slate-200 text-slate-600 border border-slate-250'
                      }`}>
                        {totalPendingInCenter > 0 ? 'FUNDS PENDING' : 'ALL CLAIMED'}
                      </span>
                    </div>

                    {/* SECTION A: DAILY ATTENDANCE BENEFIT */}
                    <div className="space-y-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-3.5 bg-amber-500 rounded-full" />
                        <h4 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider">Attendance Register</h4>
                      </div>
                      
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-3 shadow-3xs">
                        <div className="flex items-start justify-between">
                          <p className="text-[10px] text-slate-650 font-bold leading-normal">
                            Claim your free <strong className="text-amber-600">5.00 ETB</strong> loyalty incentive credited once every 24 hours.
                          </p>
                          <span className="text-[10px] font-mono font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg shrink-0">
                            +5.00 ETB
                          </span>
                        </div>

                        {msg && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-2.5 rounded-xl text-[9.5px] leading-relaxed font-bold flex items-start space-x-1.5 border ${
                              msg.isError 
                                ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            }`}
                          >
                            <span>{msg.isError ? '⚠️' : '🎉'}</span>
                            <span>{msg.text}</span>
                          </motion.div>
                        )}

                        <button
                          onClick={handleCheckIn}
                          disabled={isCheckingIn || hasCheckedInToday}
                          className={`w-full py-2.5 rounded-xl font-black text-[10.5px] uppercase tracking-wider transition-all duration-350 flex items-center justify-center space-x-1.5 h-10 ${
                            hasCheckedInToday
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-sans'
                              : 'bg-amber-500 hover:bg-amber-600 text-[#0b3d91] active:scale-98 cursor-pointer shadow-sm border border-amber-400'
                          }`}
                        >
                          <UserCheck className="w-4 h-4 shrink-0" />
                          <span>
                            {isCheckingIn ? 'Allocating Reward...' : 
                             hasCheckedInToday ? `Claimed (Reset in ${formatCountdown(nextMidnight.getTime() - now.getTime())})` : 
                             'Claim Daily Attendance Bonus'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* SECTION B: VIP ASSET DIVIDENDS */}
                    <div className="space-y-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                        <h4 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider">Dynamic Yield Harvest</h4>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-3xs">
                        <p className="text-[10px] text-slate-650 font-bold leading-normal">
                          Manually withdraw accrued hourly or daily profits of your VIP active portfolio into your withdrawable Income Balance.
                        </p>

                        {unclaimedSum > 0 ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-emerald-600 text-base">💰</span>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-emerald-700 tracking-wider">Accrued Return Sum</span>
                                <span className="text-xs font-black text-emerald-850">{unclaimedSum.toFixed(2)} ETB</span>
                              </div>
                            </div>
                            <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold animate-pulse">
                              HARVEST READY
                            </span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-1.5">
                            <span className="text-slate-400 text-xs">🔒</span>
                            <p className="text-[9px] text-slate-550 font-medium leading-tight">
                              No active asset returns are currently pending. Your active VIP plans generate returns automatically every 24 hours.
                            </p>
                          </div>
                        )}

                        {/* NEXT SEQUENCE SUMMARY TICKER */}
                        {nearestPayoutMs !== Infinity && (
                          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-[9px] text-[#0A3D91] font-bold">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs">⏱️</span>
                              <div>
                                <span className="text-[8.5px] font-black uppercase text-blue-700 tracking-wider block">Next Portfolio Payout Sequence</span>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] font-black bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200 text-[#0a3d91] whitespace-nowrap">
                              {formatCountdown(nearestPayoutMs)}
                            </span>
                          </div>
                        )}

                        {/* Individual Plan Listing with live countdowns */}
                        {activeList.length > 0 && (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-slate-400 block font-mono pl-1">Active VIP Portfolios ({activeList.length})</span>
                            {activeList.map(inv => {
                              const unclaimedAmt = inv.unclaimedReturns ?? 0;
                              const lastPayout = new Date(inv.lastPayoutDate || inv.startDate);
                              const nextPayout = lastPayout.getTime() + 24 * 60 * 60 * 1000;
                              const diffMs = nextPayout - now.getTime();
                              
                              return (
                                <div key={inv.id} className="flex flex-col text-[9.5px] bg-slate-50/65 px-3 py-2 rounded-xl border border-slate-150/85 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="font-extrabold text-[#0A3D91] uppercase tracking-wide">{inv.planName}</span>
                                      <span className="text-[8px] text-slate-400 font-mono">Invested: {inv.amount.toFixed(0)} ETB</span>
                                    </div>
                                    <div className="flex items-center space-x-2 font-mono">
                                      {unclaimedAmt > 0 ? (
                                        <>
                                          <span className="font-extrabold text-emerald-600">+{unclaimedAmt.toFixed(2)} ETB</span>
                                          <button
                                            disabled={isClaimingYield}
                                            onClick={() => handleClaimYield(inv.id)}
                                            className="text-[8px] bg-emerald-600 hover:bg-emerald-700 font-black text-white px-2 py-0.5 rounded-lg transition-all cursor-pointer h-5 flex items-center justify-center uppercase active:scale-95 font-sans shadow-3xs"
                                          >
                                            Claim
                                          </button>
                                        </>
                                      ) : (
                                        <span className="text-slate-400 font-semibold text-[8px] bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded uppercase">Accruing</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-[8px] text-slate-500 font-medium font-sans border-t border-slate-100 pt-1">
                                    <span>Remaining Lift: {inv.remainingDays} days</span>
                                    <div className="flex items-center space-x-1">
                                      <span className="text-[7.5px] font-bold text-slate-400">Next yield in:</span>
                                      <span className="font-mono text-slate-700 font-extrabold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/40">
                                        {diffMs <= 0 ? "00:00:00" : formatCountdown(diffMs)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {claimMsg && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-2.5 rounded-xl text-[9.5px] leading-relaxed font-bold flex items-start space-x-1.5 border ${
                              claimMsg.isError 
                                ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            }`}
                          >
                            <span>{claimMsg.isError ? '⚠️' : '🎉'}</span>
                            <span>{claimMsg.text}</span>
                          </motion.div>
                        )}

                        <button
                          onClick={() => handleClaimYield()}
                          disabled={isClaimingYield || unclaimedSum <= 0}
                          className={`w-full py-2.5 rounded-xl font-black text-[10.5px] uppercase tracking-wider transition-all duration-350 flex items-center justify-center space-x-2 h-10 ${
                            unclaimedSum <= 0
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-sans'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 cursor-pointer shadow-sm border border-emerald-500'
                          }`}
                        >
                          <Coins className="w-4 h-4 shrink-0" />
                          <span>
                            {isClaimingYield ? 'Harvesting...' : 'Harvest Complete Portfolio'}
                          </span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end">
                    <button
                      onClick={() => setIsClaimModalOpen(false)}
                      className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all h-9"
                    >
                      Close Portal
                    </button>
                  </div>

                </motion.div>
              </div>
            )}
          </>
        );
      })()}

      {/* LUMORA CARD QUICK-ACCESS FINTECH WIDGET */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-[0_2px_12px_rgba(10,61,145,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-left">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider">
                LUMORA Virtual Mastercard
              </h4>
              <p className="text-[8.5px] text-slate-450 uppercase tracking-widest font-black mt-0.5">
                Separate USD Spending Balance
              </p>
            </div>
          </div>

          {userCard ? (
            <span className={`px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-full shadow-3xs border ${
              userCard.status === 'active' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                : userCard.status === 'frozen'
                ? 'bg-rose-50 text-rose-700 border-rose-150'
                : 'bg-amber-50 text-amber-700 border-amber-150 animate-pulse'
            }`}>
              {userCard.status}
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-[#2563EB]/10 border border-[#2563EB]/25 text-[#2563EB] rounded-full text-[8.5px] font-black uppercase tracking-widest">
              VIP 3+ KYC
            </span>
          )}
        </div>

        {userCard ? (
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
            <div className="text-left font-sans">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Card Balance</span>
              <span className="text-sm font-black text-slate-900 block mt-1">
                ${userCard.balance?.toFixed(2)} <span className="text-[9px] text-[#0A3D91] font-bold">USD</span>
              </span>
            </div>

            <div className="text-right font-sans">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Cardholder</span>
              <span className="text-xs font-black text-slate-700 block mt-1 truncate max-w-[120px] ml-auto uppercase">
                {userCard.cardHolderName}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-slate-650 font-bold leading-relaxed text-left">
            Issue your premium blue-and-white virtual card. Load USD separately from your Income or Deposit wallets to buy subscriptions, pay overseas invoices, or build credit.
          </p>
        )}

        {/* Action Button */}
        <button
          onClick={() => setActiveTab('card')}
          className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-205 rounded-2xl flex items-center justify-between px-4.5 group active:scale-[0.99] transition-all cursor-pointer shadow-3xs"
        >
          <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-700">
            {userCard ? "Manage Card & Transactions" : "Apply For Virtual Card ($3)"}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-450 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* INSTITUTIONAL WARNING COMPLIANCE BAR */}
      <div className="p-4 rounded-3xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-900 leading-relaxed flex items-start space-x-3.5 shadow-3xs">
        <span className="p-1.5 bg-amber-500 text-white font-extrabold rounded-xl shrink-0 text-[8px] uppercase tracking-wider font-mono">Notice</span>
        <div>
          <p className="font-extrabold text-[#0A3D91]">{t.projectedReturnEst || 'Audited Yield Standards'}</p>
          <p className="text-[10px] text-slate-800 mt-1 leading-normal font-bold">{t.disclaimerText || 'Past performance does not guarantee future payout loops. Please verify local guidelines before funding.'}</p>
        </div>
      </div>

      {/* CBE TRANSFER METHOD TIP */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 flex items-center justify-between hover:border-slate-300 shadow-[0_2px_10px_rgba(10,61,145,0.015)] transition-all">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-center text-amber-700 font-extrabold shadow-3xs">
            <Building className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-display font-extrabold text-xs text-[#0A3D91]">
              {t.cbeAccountInfo || 'CBE Wire Desk'}
            </h4>
            <p className="text-[10px] text-slate-800 font-extrabold leading-normal mt-0.5">
              {t.instantVerificationNotice || 'Instant verification of deposits available via CBE online banking uploads.'}
            </p>
          </div>
        </div>
        <button
          onClick={onQuickDepositClick}
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0b3d91] cursor-pointer transition-all active:scale-95"
          aria-label="More details"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* RECENT TRANSACTION ACTIVITIES */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display font-black text-sm text-[#0A3D91] tracking-wide flex items-center space-x-1.5 uppercase">
            <span className="w-1 h-3 bg-[#0A3D91] rounded-full"></span>
            <span>{t.recentTransactions || 'Ledger Log Entries'}</span>
          </h3>
          <button 
            onClick={() => setShowAllTx(!showAllTx)}
            className="text-[10px] font-black text-blue-650 hover:underline tracking-wider uppercase"
          >
            {showAllTx ? (language === 'am' ? 'ያነሰ አሳይ' : 'Show Less') : (t.viewAll || 'View All')}
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-800 font-black shadow-3xs">
            {t.noData || 'No transaction logs registered.'}
          </div>
        ) : (() => {
          const sortedTransactions = [...recentTransactions].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          const visibleTx = showAllTx ? sortedTransactions : sortedTransactions.slice(0, 5);
          const grouped: { dateKey: string; items: typeof recentTransactions }[] = [];
          
          visibleTx.forEach((tx) => {
            const d = new Date(tx.date);
            const dateKey = isNaN(d.getTime()) ? 'Invalid Date' : d.toDateString();
            let grp = grouped.find(g => g.dateKey === dateKey);
            if (!grp) {
              grp = { dateKey, items: [] };
              grouped.push(grp);
            }
            grp.items.push(tx);
          });

          const getFriendlyDateHeader = (dateKey: string) => {
            if (dateKey === 'Invalid Date') {
              return language === 'am' ? 'ያልታወቀ ቀን' : 'Unknown Date';
            }
            const d = new Date(dateKey);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            
            if (d.toDateString() === today.toDateString()) {
              return language === 'am' ? 'ዛሬ' : 
                     language === 'om' ? 'Hardha' :
                     language === 'ti' ? 'ሎሚ' :
                     language === 'so' ? 'Maanta' : 'Today';
            } else if (d.toDateString() === yesterday.toDateString()) {
              return language === 'am' ? 'ትናንት' : 
                     language === 'om' ? 'Kalee' :
                     language === 'ti' ? 'ትማሊ' :
                     language === 'so' ? 'Shalay' : 'Yesterday';
            }
            
            return d.toLocaleDateString(
              language === 'am' ? 'am-ET' : 
              language === 'om' ? 'om-ET' :
              language === 'ti' ? 'ti-ET' :
              language === 'so' ? 'so-SO' : undefined, 
              {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              }
            );
          };

          return (
            <div className="space-y-4">
              {grouped.map((group) => (
                <div key={group.dateKey} className="space-y-2">
                  <div className="flex items-center space-x-1.5 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A3D91]/40"></span>
                    <span className="text-[10px] font-black text-[#0A3D91] opacity-75 uppercase tracking-wider font-sans select-none">
                      {getFriendlyDateHeader(group.dateKey)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((tx) => {
                      const isPositive = tx.amount > 0;
                      return (
                        <div 
                          key={tx.id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-150 shadow-[0_2px_8px_rgba(10,61,145,0.01)] hover:border-slate-350 transition-all"
                        >
                          <div className="flex items-center space-x-3.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              tx.type === 'investment' ? 'bg-blue-50 text-blue-600 border border-blue-105' :
                              tx.type === 'referral_reward' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-purple-50 text-purple-600 border border-purple-100'
                            }`}>
                              {tx.type === 'deposit' ? <ArrowUpRight className="w-4.5 h-4.5 stroke-[2.2]" /> : <ArrowDownRight className="w-4.5 h-4.5 stroke-[2.2]" />}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-[#0A3D91]">
                                {tx.description}
                              </p>
                              <p className="text-[9px] text-slate-805 mt-0.5 font-mono font-black opacity-60">
                                {new Date(tx.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-[12px] font-black font-mono tracking-tight ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isPositive ? '+' : ''}{(tx.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 
                            </span>
                            <span className="text-[8px] text-[#0A3D91] font-black ml-1 uppercase font-mono">ETB</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>



    </div>
  );
}
