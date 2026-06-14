import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  BadgeInfo, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  Lock
} from 'lucide-react';
import { useLanguage } from '../locale';
import { Investment, Profile } from '../types';
import { motion } from 'motion/react';

interface EarningsTabProps {
  investments: Investment[];
  profile: Profile;
}

export default function EarningsTab({ investments, profile }: EarningsTabProps) {
  const { language, t, et } = useLanguage();
  const [liveCompoundingTicker, setLiveCompoundingTicker] = useState<number>(0);
  const [payoutCountdown, setPayoutCountdown] = useState<string>('00:00:00');

  const activeInvestments = investments.filter(i => i.status === 'active');
  const maturedInvestments = investments.filter(i => i.status === 'matured');

  // Sum total daily return across all active items
  const dailyYieldSum = activeInvestments.reduce((sum, curr) => sum + curr.dailyReturn, 0);

  // Live countdown to next payout (simulated next midnight tick or 24h refresh cycle)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      const diffMs = nextMidnight.getTime() - now.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      const format = (n: number) => n.toString().padStart(2, '0');
      setPayoutCountdown(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Micro yield ticker simulation to show the dynamic background computing engine ("LUMORA core")
  useEffect(() => {
    if (activeInvestments.length === 0) return;
    const interval = setInterval(() => {
      // Simulate micro fractional yields accumulating in real-time
      setLiveCompoundingTicker(prev => {
        const increase = (dailyYieldSum / 86400) * 1.5; // Yield calculated per second with a little animation speed factor
        return Number((prev + increase).toFixed(7));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [dailyYieldSum, activeInvestments.length]);

  return (
    <div id="lumora-earnings-tab" className="space-y-6 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Earnings Overview Card with LUMORA Background Image & Glassmorphism */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-900/50 bg-[#0B1528] min-h-[220px]">
        
        {/* Background Image with optimized filter and gradient mask */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/lumora_earnova_dashboard_banner_1780735125620.png"
            alt="LUMORA Compounding Network"
            className="w-full h-full object-cover opacity-30 scale-102 transition-transform duration-[20s]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#091122]/85 to-transparent"></div>
        </div>

        {/* Content Overlay - Glassmorphic Card body */}
        <div className="relative z-10 p-5.5 flex flex-col justify-between h-full space-y-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Coins className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase font-mono text-emerald-450">
                  {et('lumoraVault') || 'LUMORA YIELD ARCH'}
                </h3>
                <span className="text-[8px] font-bold text-slate-400 block tracking-widest font-mono uppercase mt-0.5">
                  {et('portfolioGateway') || 'Decentralized Funding System'}
                </span>
              </div>
            </div>
            
            <span className="px-2.5 py-1 text-[8.5px] font-black font-mono rounded-full bg-gradient-to-r from-emerald-500/15 to-[#0180FE]/15 border border-emerald-500/30 text-emerald-400 flex items-center space-x-1.5 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-[#0180FE] animate-spin-slow shrink-0" />
              <span className="uppercase tracking-wider">{et('lumoraSecuredActive') || 'Core Active'}</span>
            </span>
          </div>

          {/* Primary Yield figures */}
          <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-white/5">
            <div>
              <p className="text-[9.5px] text-slate-405 uppercase tracking-widest font-mono font-bold">
                {et('todaysYieldAccrual') || 'Estimated Daily Yield'}
              </p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono tracking-tight flex items-baseline">
                +{(dailyYieldSum ?? 0).toLocaleString()}
                <span className="text-[9.5px] text-slate-350 font-black ml-1 uppercase">ETB</span>
              </p>
              
              {/* Ticking yield counter */}
              {activeInvestments.length > 0 && (
                <div className="mt-1.5 flex items-center space-x-1 text-[8px] text-slate-400 font-mono tracking-wide">
                  <Activity className="w-3 h-3 text-emerald-500 animate-pulse shrink-0" />
                  <span>Pool Stream: <strong className="text-emerald-350 font-extrabold">+{liveCompoundingTicker.toFixed(5)}</strong></span>
                </div>
              )}
            </div>

            <div>
              <p className="text-[9.5px] text-slate-405 uppercase tracking-widest font-mono font-bold">
                {t.totalEarnings || 'Yield Secured'}
              </p>
              <p className="text-2xl font-extrabold text-white mt-1 font-mono tracking-tight">
                {(profile?.totalEarnings || dailyYieldSum || 0).toLocaleString()}
                <span className="text-[9.5px] text-blue-300 font-black ml-1 uppercase">ETB</span>
              </p>
              <div className="mt-1.5 text-[8px] text-slate-400 font-mono flex items-center space-x-1">
                <Lock className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="uppercase tracking-wider">{et('lockedUnderCustody') || 'Secured Escrow'}</span>
              </div>
            </div>
          </div>

          {/* Real-time processing indicators */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8px] text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-555 animate-ping"></span>
              <span className="uppercase tracking-wider">{et('lumoraClusterSpeed') || 'Secure RPC-Node'}</span>
            </div>
            
            <div className="flex items-center space-x-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <Clock className="w-3.5 h-3.5 text-[#0180FE] shrink-0" />
              <span className="uppercase">{et('nextPayoutIn') || 'Settlement'}: <strong className="text-emerald-400">{payoutCountdown}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Authorized Balance Pools */}
      <div id="authorized-balance-pools-card" className="p-4.5 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-3xs space-y-3 text-left">
        <div className="flex justify-between items-center px-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0A3D91] font-mono">
            {language === 'am' ? 'የተፈቀዱ የሂሳብ ገንዳዎች' : 'AUTHORIZED BALANCE POOLS'}
          </span>
          <span className="text-[8px] font-black uppercase tracking-wider font-mono text-[#0180FE] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            CBE Certified
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between items-start select-none shadow-3xs">
            <span className="text-[8.5px] uppercase font-extrabold text-slate-400 tracking-wider font-mono">
              {language === 'am' ? 'የተቀመጠ ሂሳብ (Deposit)' : 'Deposit Pool Balance'}
            </span>
            <span className="text-base font-mono font-black text-slate-900 mt-2">
              {(profile?.depositBalance !== undefined ? profile.depositBalance : (profile?.walletBalance ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-[9px] text-[#0A3D91] font-bold ml-1 uppercase">ETB</span>
            </span>
            <div className="flex items-center space-x-1.5 mt-2.5 pt-1.5 border-t border-slate-100 w-full text-[7.5px] font-extrabold text-[#0D3B66] uppercase font-sans">
              <span>Handling Fee: 5%</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between items-start select-none shadow-3xs animate-pulse">
            <span className="text-[8.5px] uppercase font-extrabold text-slate-400 tracking-wider font-mono">
              {language === 'am' ? 'የትርፍ ሂሳብ (Income)' : 'Income Pool Balance'}
            </span>
            <span className="text-base font-mono font-black text-emerald-600 mt-2">
              {(profile?.incomeBalance !== undefined ? profile.incomeBalance : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-[9px] text-emerald-700 font-bold ml-1 uppercase">ETB</span>
            </span>
            <div className="flex items-center space-x-1.5 mt-2.5 pt-1.5 border-t border-slate-100 w-full text-[7.5px] font-extrabold text-emerald-705 uppercase font-sans">
              <span>Tax & Fee: 10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* LUMORA Core Platform Security Bento Features */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start space-x-3.5 shadow-3xs hover:border-slate-350 transition-all">
          <div className="w-8.5 h-8.5 rounded-xl bg-blue-50 text-[#0A3D91] flex items-center justify-center shrink-0 border border-blue-100">
            <ShieldCheck className="w-4.5 h-4.5 text-[#0180FE] stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wide">{et('lumoraSecureAudit') || 'Audit Secure'}</h4>
            <p className="text-[9px] text-slate-500 leading-normal mt-0.5 font-bold">
              {et('dailyStructuralValidation') || 'Daily structural checks verify capital holdings.'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start space-x-3.5 shadow-3xs hover:border-slate-350 transition-all">
          <div className="w-8.5 h-8.5 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
            <TrendingUp className="w-4.5 h-4.5 text-orange-550 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wide">{et('compoundingMultiplier') || 'Yield Boost'}</h4>
            <p className="text-[9px] text-slate-500 leading-normal mt-0.5 font-bold">
              {et('highVelocityPayouts') || 'Continuous compound logic maximizes daily returns.'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Disclaimer Alert banner */}
      <div className="p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-950 leading-relaxed flex items-start space-x-3 shadow-3xs">
        <BadgeInfo className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-700" />
        <p className="font-semibold text-slate-800">
          <strong>{t.projectedReturnEst || 'Yield Inception Warning:'}</strong> {t.disclaimerText || 'Past performance does not guarantee future payout loops. Please verify local guidelines before funding.'}
        </p>
      </div>

      {/* Active Plans Ledger */}
      <div className="space-y-4 text-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider flex items-center space-x-1.5 px-0.5">
            <span className="w-1.5 h-3.5 bg-[#0180FE] rounded-full inline-block"></span>
            <span>{et('activeContractPortfolios') || 'Active Portfolio Plans'} ({activeInvestments.length})</span>
          </h3>
          <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wide">
            {et('portfolioVerified') || 'Escrow Settled ✓'}
          </span>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-450 font-bold uppercase tracking-wide shadow-3xs">
            <Coins className="w-9 h-9 text-slate-350 mx-auto mb-3" />
            No active investments registered. Head over to <strong>VIP plans</strong> to activate a plan and start earning yields.
          </div>
        ) : (
          <div className="space-y-4">
            {activeInvestments.map((inv) => {
              // Standard total period simulation is 30 days or extracted from title
              const totalDays = Number(inv.planName.match(/\d+/)?.[0]) || 30;
              const elapsedDays = Math.max(0, totalDays - inv.remainingDays);
              const progressPercentage = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

              return (
                <div 
                  key={inv.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 pr-5 pl-7 relative overflow-hidden shadow-3xs hover:shadow-sm transition-all"
                >
                  {/* Glow accent bar on the left */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#0180FE] to-emerald-500"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-display font-extrabold text-sm text-slate-850 tracking-tight">
                          {inv.planName}
                        </h4>
                        <span className="px-1.5 py-0.5 text-[8px] font-black bg-[#0180FE]/10 text-[#0181fe] border border-[#0180FE]/20 rounded-md tracking-wider uppercase font-mono">
                          Secure Active
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 text-mono font-bold">
                        Staking Inception: {new Date(inv.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-[8.5px] font-black bg-emerald-50 text-emerald-600 rounded-full border border-emerald-250 uppercase tracking-wider font-mono">
                      {inv.status}
                    </span>
                  </div>

                  {/* Visual Contract Progress Bar towards Maturity */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-wider font-mono">
                      <span className="flex items-center space-x-1.5">
                        <RefreshCw className="w-3 h-3 text-[#0180FE] animate-spin-slow shrink-0" />
                        <span>Progression Cycle ({progressPercentage}%)</span>
                      </span>
                      <span>{et('maturesInDays').replace('{days}', inv.remainingDays.toString()) || `${inv.remainingDays} Days remaining`}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-100 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-[#0180FE] to-emerald-500 rounded-full h-full transition-all duration-550" 
                        style={{ width: `${Math.max(8, progressPercentage)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-150">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-extrabold tracking-wider font-mono">{et('allocatedPrinciple') || 'Principal'}</span>
                      <span className="text-[11.5px] font-black text-slate-805 font-mono">
                        {(inv.amount ?? 0).toLocaleString()} <span className="text-[8px] font-bold text-slate-550">ETB</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-extrabold tracking-wider font-mono">{et('dynamicYield') || 'Daily Yield'}</span>
                      <span className="text-[11.5px] font-black text-emerald-600 font-mono flex items-center">
                        +{(inv.dailyReturn ?? 0).toLocaleString()} <span className="text-[8px] font-bold text-slate-400 ml-0.5">/Day</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-extrabold tracking-wider font-mono">{et('accumulated') || 'Yield Accrued'}</span>
                      <span className="text-[11.5px] font-black text-sky-650 font-mono">
                        {(inv.totalEarned ?? 0).toLocaleString()} <span className="text-[8px] font-bold text-slate-550">ETB</span>
                      </span>
                    </div>
                  </div>

                  {/* Security stamp footer detail */}
                  <div className="mt-4 pt-3.5 border-t border-slate-150 grid grid-cols-2 gap-2 text-[9.5px]">
                    <div className="flex items-center text-slate-550 space-x-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#0A3D91]" />
                      <span>Remaining Cycle: <strong className="text-slate-805 font-black">{inv.remainingDays} Days</strong></span>
                    </div>
                    <div className="flex items-center justify-end text-slate-550 space-x-1.5 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-slate-405" />
                      <span>Maturity Lock: <strong className="text-slate-805 font-black">{new Date(inv.maturityDate).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Matured History ledger */}
      {maturedInvestments.length > 0 && (
        <div className="space-y-3 px-0.5">
          <h3 className="font-display font-black text-xs text-slate-400 tracking-wider uppercase">
            {et('matureHistory') || 'Matured Historic Ledger'} ({maturedInvestments.length})
          </h3>
          <div className="space-y-2">
            {maturedInvestments.map((inv) => (
              <div 
                key={inv.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 transition-all hover:bg-slate-100"
              >
                <div>
                  <h4 className="text-xs font-black text-slate-700 leading-tight uppercase">{inv.planName}</h4>
                  <p className="text-[8.5px] text-slate-450 font-semibold">{et('closedAndDisbursed') || 'Closed and Settled on'}: {new Date(inv.maturityDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex items-center">
                  <span className="text-xs font-black text-slate-750 font-mono mr-2.5">
                    {(inv.totalEarned ?? 0).toLocaleString()} ETB
                  </span>
                  <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-2.5 py-0.5 rounded-full font-black uppercase text-center font-mono">
                    {et('disbursed') || 'Disbursed ✓'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
