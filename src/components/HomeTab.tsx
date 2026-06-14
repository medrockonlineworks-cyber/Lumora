import { useState } from 'react';
import { Coins, ArrowUpRight, ArrowDownRight, TrendingUp, MessageSquare, Building, ChevronRight, ShieldCheck, ArrowRight, UserCheck, Gift } from 'lucide-react';
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

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const [isClaimingYield, setIsClaimingYield] = useState(false);
  const [claimMsg, setClaimMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const lastCheckInTime = profile.lastCheckInDate ? new Date(profile.lastCheckInDate).getTime() : 0;
  const nowTime = new Date().getTime();
  const diffTime = nowTime - lastCheckInTime;
  const targetDiff = 24 * 60 * 60 * 1000;
  const hasCheckedInToday = profile.lastCheckInDate ? (diffTime < targetDiff) : false;
  const remainingHours = Math.ceil((targetDiff - diffTime) / (1000 * 60 * 60));

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
                {language === 'am' ? `ቪአይፒ ደረጃ ${profile.vipLevel || 0}` :
                 language === 'om' ? `Sadarkaa VIP ${profile.vipLevel || 0}` :
                 language === 'ti' ? `ቪአይፒ ደረጃ ${profile.vipLevel || 0}` :
                 language === 'so' ? `Darajada VIP ${profile.vipLevel || 0}` :
                 `VIP Grade ${profile.vipLevel || 0}`}
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

      {/* DAILY REWARDS & IMMERSIVE INCOME MANIFESTATION ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* DAILY CHECK-IN REWARD MODULE */}
        <div id="daily-checkin-module" className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-5 shadow-[0_2px_12px_rgba(10,61,145,0.02)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wide flex items-center space-x-1.5">
                {!hasCheckedInToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>}
                <span>Daily Attendance Check-In Portal</span>
              </h4>
              <p className="text-[10px] text-slate-755 font-bold leading-normal">
                Earn FREE <strong className="text-amber-600">5.00 ETB</strong> daily. Check in once every 24 hours under our automated CBE loyalty framework.
              </p>
            </div>
            <div className="p-2 rounded-2xl bg-amber-50 border border-amber-200">
              <Gift className="w-5 h-5 text-amber-500 fill-amber-200" />
            </div>
          </div>

          {/* Status Msg */}
          {msg && (
            <motion.div 
              id="checkin-status"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-3 rounded-2xl text-[10.5px] leading-relaxed font-bold flex items-start space-x-2 border ${
                msg.isError 
                  ? 'bg-rose-50 text-rose-700 border-rose-100' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-100'
              }`}
            >
              <span>{msg.isError ? '⚠️' : '🎉'}</span>
              <span>{msg.text}</span>
            </motion.div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">Reward Tier</span>
              <span className="text-sm font-black font-mono text-[#0A3D91]">
                +5.00 <span className="text-[9px] font-bold">ETB</span>
              </span>
            </div>

            <button
              id="claim-checkin-btn"
              onClick={handleCheckIn}
              disabled={isCheckingIn || hasCheckedInToday}
              className={`px-5 py-2.5 rounded-2xl font-black text-[10.5px] uppercase tracking-wider transition-all duration-300 transform active:scale-95 flex items-center space-x-2 shrink-0 h-11 ${
                hasCheckedInToday
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400 text-[#0b3d91] hover:shadow-lg shadow-amber-500/20 active:translate-y-0.5 cursor-pointer border border-amber-300'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>
                {isCheckingIn ? 'Allocating...' : 
                 hasCheckedInToday ? `Claimed (Reset in ${remainingHours}h)` : 
                 'Claim Daily Reward'}
              </span>
            </button>
          </div>
        </div>

        {/* DAILY INVESTMENT YIELD MANUAL CLAIM MODULE */}
        <div id="yield-claim-module" className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-5 shadow-[0_2px_12px_rgba(10,61,145,0.02)] flex flex-col justify-between">
          {/* Unclaimed Returns Sum Calculation */}
          {(() => {
            const unclaimedSum = investments ? investments.reduce((sum, inv) => sum + (inv.unclaimedReturns ?? 0), 0) : 0;
            return (
              <>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wide flex items-center space-x-1.5">
                      {unclaimedSum > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>}
                      <span>VIP Asset Return Claims</span>
                    </h4>
                    <p className="text-[10px] text-slate-755 font-bold leading-normal">
                      Manual claim required. Claim accrued profits to credit them directly into your Income Pool balance.
                    </p>
                  </div>
                  <div className="p-2 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <Coins className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>

                {/* Return Status visual / notification alert as requested */}
                {unclaimedSum > 0 ? (
                  <div className="mt-3 p-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-600 text-sm">💰</span>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase text-emerald-700 tracking-wider">Unclaimed Pending Yield</span>
                        <span className="text-xs font-black text-emerald-800">{unclaimedSum.toFixed(2)} ETB</span>
                      </div>
                    </div>
                    <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold animate-pulse">
                      PENDING CLAIM
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-1.5">
                    <span className="text-slate-400 text-xs">🔒</span>
                    <p className="text-[9px] text-slate-500 font-medium leading-tight">
                      No active yields are pending. Wait 24 hours or try simulating a day cycle inside the control center.
                    </p>
                  </div>
                )}

                {/* Sub-breakdown of returns if there are unclaimed values */}
                {investments && investments.some(inv => (inv.unclaimedReturns ?? 0) > 0) && (
                  <div className="mt-3 space-y-1 max-h-24 overflow-y-auto pr-1">
                    {investments.map(inv => {
                      const unclaimedAmt = inv.unclaimedReturns ?? 0;
                      if (unclaimedAmt <= 0) return null;
                      return (
                        <div key={inv.id} className="flex items-center justify-between text-[9px] bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-600">{inv.planName}</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold font-mono text-[#0A3D91]">{unclaimedAmt.toFixed(2)} ETB</span>
                            <button
                              disabled={isClaimingYield}
                              onClick={() => handleClaimYield(inv.id)}
                              className="text-[7.5px] bg-emerald-600 hover:bg-emerald-700 font-black text-white px-1.5 py-0.5 rounded transition-all cursor-pointer"
                            >
                              Claim
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Status message */}
                {claimMsg && (
                  <motion.div 
                    id="claim-yield-status"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-3 p-2 rounded-xl text-[9.5px] leading-relaxed font-bold flex items-start space-x-2 border ${
                      claimMsg.isError 
                        ? 'bg-rose-50 text-rose-700 border-rose-100' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                    }`}
                  >
                    <span>{claimMsg.isError ? '⚠️' : '🎉'}</span>
                    <span>{claimMsg.text}</span>
                  </motion.div>
                )}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#0A3D91] font-mono">Harvest Pool</span>
                    <span className="text-sm font-black font-mono text-[#0A3D91]">
                      {unclaimedSum.toFixed(2)} <span className="text-[9px] font-bold">ETB</span>
                    </span>
                  </div>

                  <button
                    id="harvest-yield-btn"
                    onClick={() => handleClaimYield()}
                    disabled={isClaimingYield || unclaimedSum <= 0}
                    className={`px-5 py-2.5 rounded-2xl font-black text-[10.5px] uppercase tracking-wider transition-all duration-300 transform active:scale-95 flex items-center space-x-2 shrink-0 h-11 ${
                      unclaimedSum <= 0
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg shadow-emerald-500/20 active:translate-y-0.5 cursor-pointer border border-emerald-500'
                    }`}
                  >
                    <Coins className="w-4 h-4 shrink-0" />
                    <span>
                      {isClaimingYield ? 'Claiming...' : 'Claim Daily Income'}
                    </span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>

      </div>

      {/* QUICK ACTIONS BANNER - PREMIUM GRID */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { icon: ArrowUpRight, label: t.deposit || 'Deposit', action: onQuickDepositClick, color: 'bg-emerald-50 text-emerald-600 border-emerald-100/70 hover:bg-emerald-100/20 active:scale-95' },
          { icon: ArrowDownRight, label: t.withdraw || 'Withdraw', action: onQuickWithdrawClick, color: 'bg-rose-50 text-rose-600 border-rose-100/70 hover:bg-rose-100/20 active:scale-95' },
          { icon: TrendingUp, label: t.invest || 'VIP Plans', action: () => setActiveTab('investments'), color: 'bg-blue-50 text-blue-700 border-blue-100/70 hover:bg-blue-100/20 active:scale-95' },
          { icon: MessageSquare, label: t.aiAssistant || 'Support', action: () => setActiveTab('assistant'), color: 'bg-indigo-50 text-indigo-700 border-indigo-100/70 hover:bg-indigo-100/20 active:scale-95' },
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
            onClick={() => setActiveTab('profile')}
            className="text-[10px] font-black text-blue-650 hover:underline tracking-wider uppercase"
          >
            {t.viewAll || 'See Ledger'}
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-800 font-black shadow-3xs">
            {t.noData || 'No transaction logs registered.'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentTransactions.slice(0, 5).map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-150 shadow-[0_2px_8px_rgba(10,61,145,0.01)] hover:border-slate-300 transition-all"
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
                      <p className="text-[9px] text-slate-805 mt-0.5 font-mono font-black">
                        {new Date(tx.date).toLocaleDateString()}
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
        )}
      </div>



    </div>
  );
}
