import { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, Award, Trophy
} from 'lucide-react';
import { Language, translations } from '../locale';
import { UserProfile, InvestmentPlan } from '../types';

interface InvestmentsTabProps {
  profile: UserProfile;
  language: Language;
  plans: InvestmentPlan[];
  onInvest: (plan: InvestmentPlan, duration: number) => void;
  onNavigateToKyc: () => void;
}

export default function InvestmentsTab({ 
  profile, 
  language, 
  plans, 
  onInvest,
  onNavigateToKyc
}: InvestmentsTabProps) {
  const [selectedPlanLevel, setSelectedPlanLevel] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(90);
  
  const t = translations[language];

  // Duration Options
  const durationOptions = [50, 70, 90, 120, 180, 240, 360, 720];

  const plansSafe = plans || [];
  const currentPlan = plansSafe.find(p => p.level === selectedPlanLevel) || plansSafe[0] || {
    level: 0,
    name: 'Starter Level 1',
    requiredInvestment: 1000,
    dailyRate: 0.035,
    durationDays: 50,
    activationBonus: 50,
    isVip: false
  };

  // Filter Starter vs VIP
  const starterPlans = plansSafe.filter(p => !p.isVip);
  const vipPlans = plansSafe.filter(p => p.isVip);

  // Calculate Dynamic Yield Forecast
  // Return = Capital + (Capital * DailyRate * Duration)
  const earningsForecast = currentPlan.requiredInvestment * currentPlan.dailyRate * selectedDuration;
  const totalPayoutForecast = currentPlan.requiredInvestment + earningsForecast;

  // Handle Purchase activation
  const handlePurchase = () => {
    // If VIP and KYC is not verified, block
    if (currentPlan.isVip && profile.idVerificationStatus !== 'verified') {
      alert(
        language === 'am' 
          ? 'የቪአይፒ ደረጃዎችን ለማንቃት መጀመሪያ ማንነትዎ መረጋገጥ አለበት። እባክዎን መገለጫዎ ላይ መታወቂያዎን ያስገቡ።' 
          : 'Account verification (KYC) is required before activating VIP levels. Please complete your identity verification under the Profile tab.'
      );
      onNavigateToKyc();
      return;
    }

    if (profile.walletBalance < currentPlan.requiredInvestment) {
      alert(
        language === 'am'
          ? 'በኢንቨስት ለማድረግ በቂ የኪስ ቦርሳ ቀሪ ሂሳብ የለዎትም። እባክዎን መጀመሪያ ተቀማጭ ያድርጉ።'
          : 'Insufficient wallet balance to invest in this plan. Please make a CBE deposit proof submission.'
      );
      return;
    }

    onInvest(currentPlan, selectedDuration);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8 animate-in fade-in duration-300">
      {/* Visual Level Selection */}
      <div className="space-y-3">
        <div className="flex items-center space-x-1 px-1">
          <Award className="w-4 h-4 text-amber-500 shrink-0" />
          <h2 className="text-[11px] font-black uppercase text-[#0A3D91] tracking-widest">
            {t.starterTiers}
          </h2>
        </div>
        <p className="text-[10px] text-slate-500 px-1 font-bold -mt-1.5 uppercase tracking-wide">
          {t.starterSub}
        </p>
        
        {/* Starter Plan Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {starterPlans.map((p) => {
            const isSelected = selectedPlanLevel === p.level;
            return (
              <button
                key={p.level}
                onClick={() => setSelectedPlanLevel(p.level)}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between items-center text-center cursor-pointer min-h-[95px] ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 shadow-md shadow-amber-500/5'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider block ${isSelected ? 'text-amber-800' : 'text-[#0a3d91]'}`}>
                  {p.name}
                </span>
                <span className="text-sm font-black text-slate-900 block mt-1.5 font-mono">
                  {p.requiredInvestment.toLocaleString()}
                </span>
                <span className="text-[8px] text-slate-500 font-bold block mt-1 uppercase tracking-widest">
                  Bonus: +{p.activationBonus} ETB
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIP Premium Tiers selection */}
      <div className="space-y-3">
        <div className="flex items-center space-x-1 px-1">
          <Trophy className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
          <h2 className="text-[11px] font-black uppercase text-[#0A3D91] tracking-widest">
            {t.vipTiers}
          </h2>
        </div>
        <p className="text-[10px] text-slate-500 px-1 font-bold -mt-1.5 uppercase tracking-wide">
          {t.vipSub}
        </p>

        {/* Scrollable / Grid VIP levels */}
        <div className="grid grid-cols-2 gap-2.5">
          {vipPlans.map((p) => {
            const isSelected = selectedPlanLevel === p.level;
            const isKycLocked = profile.idVerificationStatus !== 'verified';
            return (
              <button
                key={p.level}
                onClick={() => setSelectedPlanLevel(p.level)}
                className={`p-3.5 rounded-2xl border-2 transition-all text-left flex flex-col justify-between cursor-pointer min-h-[100px] relative overflow-hidden ${
                  isSelected
                    ? 'border-[#0a3d91] bg-blue-50/20 shadow-md'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                {/* KYC Lock overlay or ribbon */}
                {isKycLocked && (
                  <div className="absolute top-1.5 right-1.5 flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[8px] font-black uppercase">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    <span>Locked</span>
                  </div>
                )}

                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${isSelected ? 'text-[#0a3d91]' : 'text-slate-700'}`}>
                    {p.name}
                  </span>
                  <div className="mt-1 flex items-baseline space-x-0.5">
                    <span className="text-md font-black font-mono text-slate-900">{p.requiredInvestment.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-slate-500 font-mono">ETB</span>
                  </div>
                </div>

                <div className="mt-2.5 flex justify-between items-center w-full border-t border-slate-100 pt-1.5">
                  <span className="text-[8px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    +{p.activationBonus} ETB Bonus
                  </span>
                  <span className="text-[9px] font-black font-mono text-[#0a3d91]">{(p.dailyRate * 100).toFixed(1)}%/Day</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flexible Tenure Duration Selection */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-4">
        <h3 className="text-[11px] font-black uppercase text-[#0A3D91] tracking-widest">
          {t.duration}
        </h3>
        
        <div className="grid grid-cols-4 gap-1.5">
          {durationOptions.map((opt) => {
            const isActive = selectedDuration === opt;
            return (
              <button
                key={opt}
                onClick={() => setSelectedDuration(opt)}
                className={`py-2 px-1 rounded-xl border font-mono font-black text-xs text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0A3D91] border-[#0A3D91] text-white'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {opt} D
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Forecast Projection Cards */}
      <div className="p-5 rounded-3xl bg-[#00173D] text-white border border-blue-900 shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-blue-900 pb-3">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Active Selection
            </span>
            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">
              {currentPlan.name} ({selectedDuration} Days Cycle)
            </h4>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg block">
              +{(currentPlan.dailyRate * 100).toFixed(1)}% Daily Profit
            </span>
          </div>
        </div>

        <div className="space-y-2 text-[11px] font-sans">
          <div className="flex justify-between items-center text-slate-300">
            <span>Required Working Capital</span>
            <span className="font-mono font-black text-white">{currentPlan.requiredInvestment.toLocaleString()} ETB</span>
          </div>
          
          {/* ACTIVATION BONUS INDICATOR */}
          <div className="flex justify-between items-center text-slate-300">
            <span>Instant Activation Bonus</span>
            <span className="font-mono font-black text-amber-400">+{currentPlan.activationBonus} ETB</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span>Accumulated Cycle Profits ({selectedDuration} Days)</span>
            <span className="font-mono font-black text-emerald-400">+{earningsForecast.toLocaleString()} ETB</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-blue-900 text-sm">
            <span className="font-black uppercase tracking-wider text-white">Total Expected Payout</span>
            <span className="font-mono font-black text-amber-400">{(totalPayoutForecast + currentPlan.activationBonus).toLocaleString()} ETB</span>
          </div>
        </div>

        {/* KYC notice if active plan is VIP */}
        {currentPlan.isVip && profile.idVerificationStatus !== 'verified' && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-semibold leading-normal flex items-start space-x-2 animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <p>{t.kycRequiredMsg}</p>
          </div>
        )}

        {/* Action activation button */}
        <button
          onClick={handlePurchase}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#00173D] font-black text-xs uppercase tracking-widest transition-all active:scale-98 shadow-md hover:shadow-lg cursor-pointer"
        >
          {profile.walletBalance >= currentPlan.requiredInvestment 
            ? `Buy/Activate: ${currentPlan.name}` 
            : 'INSUFFICIENT BALANCE - PROCEED TO DEPOSIT'}
        </button>
      </div>
    </div>
  );
}
