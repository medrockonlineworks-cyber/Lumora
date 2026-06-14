import { Coins, ArrowUpRight, ArrowDownRight, TrendingUp, MessageSquare, Building, ChevronRight, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { useLanguage } from '../locale';
import { Profile, MyTransaction } from '../types';
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
}

export default function HomeTab({
  profile,
  todayEarnings,
  activeInvestmentsValue,
  recentTransactions,
  setActiveTab,
  onQuickDepositClick,
  onQuickWithdrawClick
}: HomeTabProps) {
  const { language, t, et } = useLanguage();

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
