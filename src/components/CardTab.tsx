import { useState, useEffect } from 'react';
import { 
  CreditCard, Info, ArrowUpRight, ShieldCheck, 
  Lock, RefreshCw, Layers, History, HelpCircle, 
  MapPin, CheckCircle2, AlertCircle, Coins, Wallet, 
  Copy, Check, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../locale';
import { Profile, LumoraCard, CardTransaction } from '../types';

interface CardTabProps {
  profile: Profile;
  onRefreshProfile: () => void;
}

export default function CardTab({ profile, onRefreshProfile }: CardTabProps) {
  const { language } = useLanguage();
  const [card, setCard] = useState<LumoraCard | null>(null);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Application state
  const [applyWallet, setApplyWallet] = useState<'deposit' | 'income'>('deposit');
  
  // Funding state
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeAmt, setRechargeAmt] = useState('10');
  const [rechargeWallet, setRechargeWallet] = useState<'deposit' | 'income'>('deposit');

  // Security checks state
  const [otpOpen, setOtpOpen] = useState(false);
  const [passwordVal, setPasswordVal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'apply' | 'recharge' | 'freeze'>('apply');

  // View card number reveal status
  const [revealCard, setRevealCard] = useState(false);

  // Copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const [usdToEtb, setUsdToEtb] = useState(170);
  const isVipEligible = (profile?.vipLevel ?? 0) >= 4;
  const isKycEligible = profile?.idVerificationStatus === 'verified';
  const workingDays = profile?.registrationDate 
    ? Math.floor(Math.abs(new Date().getTime() - new Date(profile.registrationDate).getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  const isTenureEligible = workingDays >= 50;
  const hasMinFunds = ((profile?.depositBalance ?? 0) >= (13 * usdToEtb)) || ((profile?.incomeBalance ?? 0) >= (13 * usdToEtb));
  const isFullyEligible = isVipEligible && isKycEligible && isTenureEligible;

  // Load user card and transactions
  const loadCardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/cards?userId=${profile.userId}`);
      const data = await res.json();
      if (res.ok) {
        setCard(data.card);
        setTransactions(data.transactions || []);
      } else {
        setError(data.error || "Failed to load card data");
      }
    } catch (err) {
      setError("Network error loading card data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCard = () => {
    if (!card) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1018;
    canvas.height = 644;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background linear gradient
    const gradient = ctx.createLinearGradient(0, 0, 1018, 644);
    gradient.addColorStop(0, '#1E3A8A');
    gradient.addColorStop(0.5, '#10B981');
    gradient.addColorStop(1, '#3B82F6');
    ctx.fillStyle = gradient;
    
    // Draw rounded rect card frame
    ctx.beginPath();
    const radius = 48;
    ctx.roundRect(0, 0, 1018, 644, radius);
    ctx.fill();

    // Subtle ambient glow layers
    const glow1 = ctx.createRadialGradient(1018, 0, 10, 1018, 0, 400);
    glow1.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    glow1.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow1;
    ctx.beginPath();
    ctx.roundRect(0, 0, 1018, 644, radius);
    ctx.fill();

    const glow2 = ctx.createRadialGradient(0, 644, 20, 0, 644, 300);
    glow2.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    glow2.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.roundRect(0, 0, 1018, 644, radius);
    ctx.fill();

    // LUMORA LOGO TEXT
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px sans-serif';
    ctx.fillText('LUMORA', 64, 96);

    // VIRTUAL BADGE BOX
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(240, 60, 140, 44, 8);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#E0F2FE';
    ctx.font = '800 18px sans-serif';
    ctx.fillText('VIRTUAL', 260, 88);

    // Subtitle below logo
    ctx.fillStyle = 'rgba(219, 234, 254, 0.8)';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('USD PLATFORM SETTLEMENTS', 64, 136);

    // Active Card Status Badge
    const statusText = (card.status || 'ACTIVE').toUpperCase();
    const isFrozen = card.status === 'frozen';
    ctx.fillStyle = isFrozen ? '#EF4444' : '#10B981';
    ctx.beginPath();
    ctx.roundRect(830, 56, 124, 44, 22);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 16px sans-serif';
    const sWidth = ctx.measureText(statusText).width;
    ctx.fillText(statusText, 830 + (124 - sWidth) / 2, 84);

    // Card Number Text
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '900 42px monospace';
    const cNum = card.cardNumber || "5545 4296 0000 0000";
    const numWidth = ctx.measureText(cNum).width;
    ctx.fillText(cNum, (1018 - numWidth) / 2, 330);

    // Cardholder labels and text
    ctx.fillStyle = 'rgba(219, 234, 254, 0.9)';
    ctx.font = '700 14px sans-serif';
    ctx.fillText('CARDHOLDER', 64, 480);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 24px sans-serif';
    ctx.fillText((card.cardHolderName || profile.fullName || 'HENOK AYELIGN').toUpperCase(), 64, 526);

    // CVV
    ctx.fillStyle = 'rgba(219, 234, 254, 0.9)';
    ctx.font = '700 14px sans-serif';
    ctx.fillText('CVV', 520, 480);

    ctx.fillStyle = '#F1F5F9';
    ctx.font = '900 22px monospace';
    ctx.fillText(card.cvv || '101', 520, 526);

    // EXPIRY DATE
    ctx.fillStyle = 'rgba(219, 234, 254, 0.9)';
    ctx.font = '700 14px sans-serif';
    ctx.fillText('EXPIRY', 680, 480);

    ctx.fillStyle = '#F1F5F9';
    ctx.font = '900 22px monospace';
    ctx.fillText(card.expiryDate || '12/29', 680, 526);

    // Overlapping red / amber circles for Mastercard layout
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(860, 506, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.90;
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(904, 506, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Trigger local client browser download
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `lumora_mastercard_${card.cardHolderName.toLowerCase().replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate download url", err);
    }
  };

  useEffect(() => {
    setUsdToEtb(170); // Fixed exchange rate of 1 USD = 170 ETB as requested
  }, []);

  useEffect(() => {
    if (profile?.userId) {
      loadCardData();
    }
  }, [profile?.userId]);

  // Request application
  const handleApply = async () => {
    if (!isFullyEligible) return;
    setOtpPurpose('apply');
    setPasswordVal('');
    setOtpOpen(true);
  };

  const confirmApply = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      const res = await fetch('/api/cards/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.userId, walletType: applyWallet, password: passwordVal })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(language === 'am' ? "የሉሞራ ቅድመ-ክፍያ ማስተርካርድ ማመልከቻ በተሳካ ሁኔታ ተልኳል!" : "LUMORA Card application requested successfully!");
        setCard(data.card);
        onRefreshProfile();
        loadCardData();
        setOtpOpen(false);
      } else {
        setError(data.error || "Application failed");
      }
    } catch (err) {
      setError("Network error submitting application");
    } finally {
      setSubmitting(false);
    }
  };

  // Recharge card
  const handleRecharge = async () => {
    const amt = Number(rechargeAmt);
    if (!amt || amt < 10) {
      setError(language === 'am' ? "ለመሙላት ቢያንስ $10 ዶላር ያስፈልጋል" : "Minimum funding amount is $10 USD");
      return;
    }
    setOtpPurpose('recharge');
    setPasswordVal('');
    setOtpOpen(true);
  };

  const confirmRecharge = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      const res = await fetch('/api/cards/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: profile.userId, 
          amount: rechargeAmt, 
          walletType: rechargeWallet,
          password: passwordVal
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(language === 'am' ? "ካርዱ በተሳካ ሁኔታ ተሞልቷል!" : "LUMORA Card recharged successfully!");
        setCard(data.card);
        setRechargeOpen(false);
        onRefreshProfile();
        loadCardData();
        setOtpOpen(false);
      } else {
        setError(data.error || "Funding failed");
      }
    } catch (err) {
      setError("Network error recharging card");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle freeze/unfreeze
  const handleToggleFreeze = async () => {
    if (!card) return;
    const action = card.status === 'frozen' ? 'unfreeze' : 'freeze';
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/cards/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.userId, action })
      });
      const data = await res.json();
      if (res.ok) {
        setCard(data.card);
        setSuccessMsg(action === 'freeze' ? "Card frozen successfully" : "Card activated successfully");
        loadCardData();
      } else {
        setError(data.error || "Operation failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-mono">LOADING YOUR CARD SECURELY...</p>
      </div>
    );
  }

  const activeWalletBalance = rechargeWallet === 'income' 
    ? (profile.incomeBalance ?? 0) 
    : (profile.depositBalance ?? 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'frozen':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Header Banner */}
      <div className="p-6 rounded-[2.2rem] bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white relative overflow-hidden shadow-[0_12px_24px_rgba(37,99,235,0.18)]">
        <div className="absolute right-[-10%] bottom-[-20%] w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-[-5%] top-[-10%] w-32 h-32 bg-blue-300/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <CreditCard className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-100">Lumora Sovereign Ecosystem</span>
              <h2 className="text-xl font-display font-black leading-tight mt-0.5">LUMORA CARD</h2>
            </div>
          </div>
          
          <p className="text-[11px] text-blue-50 mt-3 leading-relaxed max-w-[320px]">
            Unlock international digital settlements. Spend your platform earnings securely on Amazon, Google, ChatGPT Plus, and standard global gateways.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white rounded-[2.2rem] border border-slate-100">
          <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Synchronizing secure card ledger...</p>
        </div>
      ) : (
        <>
          {/* Notifications and messages banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-2.5 text-left text-xs font-medium text-rose-600">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start space-x-2.5 text-left text-xs font-medium text-emerald-600">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MAIN PAGE FLOW DESIGN */}
          {!card ? (
            /* APPLICATION AND REQUIREMENT PAGE */
            <div className="bg-white border border-slate-100 p-6 rounded-[2.2rem] shadow-sm space-y-6">
              <div className="text-center space-y-1">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {profile.vipLevel === 1 ? "Starter Level Verified" : profile.vipLevel > 1 ? `VIP LEVEL ${profile.vipLevel - 1} Verified` : "No VIP"}
                </span>
                <h3 className="text-lg font-black text-slate-900 pt-1.5 uppercase tracking-tight">CARD ELIGIBILITY DISCLOSURE</h3>
                <p className="text-xs text-slate-455 font-bold">Please complete requirements below to issue your Virtual Mastercard.</p>
              </div>

              {/* Requirement Cards Lists */}
              <div className="space-y-3.5 pt-2">
                
                {/* 1. VIP Level */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isVipEligible ? 'bg-emerald-50/20 border-emerald-100' : 'bg-slate-50 border-slate-150'}`}>
                  <div className="flex items-center space-x-3.5 text-left">
                    <div className={`p-2 rounded-xl text-xs font-black ${isVipEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      VIP 3+
                    </div>
                    <div>
                      <h4 className="text-[12px] font-black text-slate-900 uppercase">VIP Level Level 3 Required</h4>
                      <p className="text-[10px] text-slate-450 font-bold mt-0.5">Your status: {profile.vipLevel === 1 ? "Starter Level" : profile.vipLevel > 1 ? `VIP Level ${profile.vipLevel - 1}` : "No VIP"}</p>
                    </div>
                  </div>
                  {isVipEligible ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <span className="text-[10px] bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded-full font-black uppercase">Pending buy</span>
                  )}
                </div>

                {/* 2. KYC Approval status */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isKycEligible ? 'bg-emerald-50/20 border-emerald-100' : 'bg-slate-50 border-slate-150'}`}>
                  <div className="flex items-center space-x-3.5 text-left">
                    <div className={`p-2 rounded-xl text-xs font-black ${isKycEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      KYC
                    </div>
                    <div>
                      <h4 className="text-[12px] font-black text-slate-900 uppercase font-sans">National ID Verification Required</h4>
                      <p className="text-[10px] text-slate-450 font-bold mt-0.5">
                        Your Status: {profile.idVerificationStatus?.toUpperCase() || 'UNSUBMITTED'}
                      </p>
                    </div>
                  </div>
                  {isKycEligible ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <span className="text-[10px] bg-red-500/10 text-red-650 border border-red-500/20 px-2 py-0.5 rounded-full font-black uppercase">Required</span>
                  )}
                </div>

                {/* 3. Company Tenure */}
                <div className={`p-4 rounded-2xl border flex flex-col space-y-3 ${isTenureEligible ? 'bg-emerald-50/20 border-emerald-100' : 'bg-slate-50 border-slate-150'}`}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3.5 text-left">
                      <div className={`p-2 rounded-xl text-xs font-black ${isTenureEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        TENURE
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-slate-900 uppercase">50 Days Working in Company</h4>
                        <p className="text-[10px] text-slate-450 font-bold mt-0.5">Your status: {workingDays} / 50 Days</p>
                      </div>
                    </div>
                    {isTenureEligible ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 font-black shrink-0" />
                    ) : (
                      <span className="text-[10px] bg-red-500/10 text-red-650 border border-red-500/20 px-2 py-0.5 rounded-full font-black uppercase shrink-0">Required</span>
                    )}
                  </div>
                  {/* Visual Progress Bar Tracker */}
                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden border border-slate-250/20">
                    <div 
                      className={`h-full transition-all duration-700 rounded-full ${isTenureEligible ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(100, (workingDays / 50) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 4. One-Time Issuance fee */}
                <div className="p-4 rounded-2xl border bg-slate-50/50 border-slate-150 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5 text-left">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-700 text-xs font-black">
                      $3
                    </div>
                    <div>
                      <h4 className="text-[12px] font-black text-slate-900 uppercase">Card Issue Fee $3</h4>
                      <p className="text-[10px] text-slate-450 font-bold mt-0.5">Equivalent: {(3 * usdToEtb).toLocaleString()} ETB (Non-Refundable)</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-450 font-black">ONE-TIME</span>
                </div>

                {/* 5. Minimum Funding amount */}
                <div className="p-4 rounded-2xl border bg-slate-50/50 border-slate-150 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5 text-left">
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-700 text-xs font-black">
                      $10
                    </div>
                    <div>
                      <h4 className="text-[12px] font-black text-slate-900 uppercase">Minimum Funding $10</h4>
                      <p className="text-[10px] text-slate-450 font-bold mt-0.5">Loads directly into your separate card balance: {(10 * usdToEtb).toLocaleString()} ETB</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-450 font-black uppercase">Initial</span>
                </div>
              </div>

              {/* ACCOUNT FUND CHOICE AND ACTION FORM */}
              {isFullyEligible ? (
                <div className="bg-slate-50 p-4 border border-slate-150 rounded-3xl space-y-3">
                  <p className="text-[10.5px] font-black text-slate-950 uppercase tracking-wide text-left">
                    Select Pool for Card Setup ($13 = {(13 * usdToEtb).toLocaleString()} ETB):
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={() => setApplyWallet('deposit')}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                        applyWallet === 'deposit' 
                          ? 'border-[#2563EB] bg-blue-50/20 ring-2 ring-blue-100' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Deposit Pool</span>
                      <span className="text-xs font-black text-[#0A3D91] pt-1">
                        {(profile.depositBalance ?? 0).toLocaleString()} ETB
                      </span>
                    </button>

                    <button
                      onClick={() => setApplyWallet('income')}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                        applyWallet === 'income' 
                          ? 'border-[#2563EB] bg-blue-50/20 ring-2 ring-blue-100' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Income Pool</span>
                      <span className="text-xs font-black text-emerald-600 pt-1">
                        {(profile.incomeBalance ?? 0).toLocaleString()} ETB
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={handleApply}
                    disabled={submitting}
                    className="w-full mt-2 inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#2563EB] to-indigo-650 text-white rounded-[1.8rem] py-3.5 font-sans font-black uppercase tracking-wider text-xs shadow-md shadow-blue-500/10 hover:brightness-105 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                  >
                    <ShieldCheck className="w-4.5 h-4.5" />
                    <span>Apply For LUMORA CARD</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/55 rounded-3xl border border-amber-150/40 text-left">
                  <div className="flex space-x-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 font-bold leading-normal">
                      Your profile currently does not meet the necessary requirements. Please trade/invest to reach **VIP Level 3**, complete your national ID photo upload (KYC), and satisfy the **50 days working in company** requirement to unlock full access.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : card.status === 'pending' ? (
            /* CARDS PENDING MESSAGE SCREEN */
            <div className="bg-white border border-slate-100 p-6 rounded-[2.2rem] shadow-sm space-y-6">
              
              {/* Cool MasterCard Hologram visual mockup with pending badge */}
              <div className="w-full max-w-[340px] aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-[#0c2e6b] to-[#121c2c] p-5 shadow-lg border border-slate-800/80 mx-auto flex flex-col justify-between overflow-hidden relative opacity-75">
                <div className="absolute top-[-40%] right-[-10%] w-32 h-32 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-display font-black text-[11px] text-white tracking-widest flex items-center space-x-1.5 opacity-60">
                      <span>LUMORA</span>
                      <span className="text-[#3b82f6] text-[8px]">VIRTUAL</span>
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-yellow-450/10 border border-yellow-400/30 text-yellow-500 rounded-full text-[8.5px] font-black uppercase tracking-wide">
                    {language === 'am' ? 'በማረጋገጥ ላይ' : 'PENDING'}
                  </span>
                </div>

                <div className="font-mono text-center text-slate-100 font-bold tracking-[0.25em] text-sm py-1.5 opacity-40">
                  •••• •••• •••• ••••
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-2 select-none opacity-50">
                  <span className="text-[9px] uppercase tracking-wider text-slate-450 font-black truncate max-w-[150px]">
                    {card.cardHolderName}
                  </span>
                  <div className="flex -space-x-2">
                    <div className="w-5 h-5 rounded-full bg-red-600 opacity-80"></div>
                    <div className="w-5 h-5 rounded-full bg-amber-500 opacity-80"></div>
                  </div>
                </div>
              </div>

              {/* Pending Information panel */}
              <div className="text-center space-y-3 font-sans">
                <span className="inline-flex py-1.5 px-3.5 bg-amber-50 text-amber-700 rounded-full font-black uppercase tracking-wider text-[10px] border border-amber-100 font-mono">
                  Pending Verification
                </span>
                
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider pt-1.5">
                  Application Under Review
                </h4>
                
                <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
                  Your $3 card setup fee has been cleared, and your $10 initial balance has been securely reserved. The platform compliance engine is verifying your VIP level and National ID. Your Virtual Mastercard will be activated in under 2 hours.
                </p>

                <div className="p-3 bg-blue-50/25 border border-blue-100 text-left rounded-2xl flex items-center space-x-2.5 max-w-sm mx-auto mt-2">
                  <ShieldCheck className="w-4 text-blue-600 shrink-0" />
                  <p className="text-[10px] text-slate-550 leading-snug font-semibold text-blue-800">
                    Your reserved initial funding balance is completely safe and fully refundable if compliance declines activation.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            /* CARD WORKS DIRECTLY - ACTIVE CARD VIEWS */
            <div className="space-y-6">
              
              {/* CARD PREVIEW RENDERER */}
              <div className="bg-white border border-slate-100 p-6 rounded-[2.2rem] shadow-sm space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Premium Sovereign Virtual Mastercard
                </p>

                {/* Virtual Card Frame */}
                <div 
                  onClick={() => setRevealCard(!revealCard)}
                  className="w-full max-w-[340px] aspect-[1.586/1] bg-gradient-to-br from-[#1E3A8A] via-[#10B981] to-[#3B82F6] text-white rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between mx-auto border border-white/10 cursor-pointer select-none group focus:outline-none"
                >
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-[#10B981]/15 rounded-full blur-xl pointer-events-none" />

                  {/* Top area */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-display font-black text-xs text-white tracking-widest flex items-center space-x-1">
                        <span>LUMORA</span>
                        <span className="text-[8px] bg-white/20 text-blue-50 px-1 border border-white/10 rounded-sm">VIRTUAL</span>
                      </span>
                      <p className="text-[7.5px] text-blue-100/80 drop-shadow-xs uppercase mt-0.5 tracking-wider">USD PLATFORM SETTLEMENTS</p>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-full shadow-xs ${getStatusStyle(card.status)}`}>
                      {card.status}
                    </span>
                  </div>

                  {/* Middle area: Card Number */}
                  <div className="text-center py-2 relative">
                    <span className="font-mono text-[17px] font-extrabold tracking-[0.25em] text-[#F8FAFC] drop-shadow-md">
                      {revealCard ? card.cardNumber : "5545 4296 •••• ••••"}
                    </span>
                    {!revealCard && (
                      <p className="text-[7.5px] font-bold text-emerald-100 mt-1 uppercase tracking-widest">Click to reveal details</p>
                    )}
                  </div>

                  {/* Card bottom details */}
                  <div className="flex justify-between items-end border-t border-white/15 pt-2.5 leading-none">
                    <div className="text-left">
                      <span className="text-[6.5px] text-blue-100 uppercase block tracking-wider font-bold mb-1">CARDHOLDER</span>
                      <span className="text-[10px] font-heavy text-white uppercase tracking-widest truncate max-w-[150px] block">
                        {card.cardHolderName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3.5">
                      <div className="text-center">
                        <span className="text-[6.5px] text-blue-105 uppercase block tracking-wider font-bold mb-1">CVV</span>
                        <span className="text-[9.5px] font-black text-slate-100 font-mono">
                          {revealCard ? card.cvv : "•••"}
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-[6.5px] text-blue-105 uppercase block tracking-wider font-bold mb-1">EXPIRY</span>
                        <span className="text-[9.5px] font-heavy text-[#F1F5F9] font-mono whitespace-nowrap">
                          {card.expiryDate}
                        </span>
                      </div>

                      {/* Overlapping Circles for Mastercard */}
                      <div className="flex -space-x-2 relative shadow-xs">
                        <div className="w-6.5 h-6.5 rounded-full bg-red-650 opacity-95"></div>
                        <div className="w-6.5 h-6.5 rounded-full bg-amber-450 opacity-90"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Helper action links below card frame */}
                <div className="flex justify-between items-center max-w-[340px] mx-auto w-full px-1 pt-1.5 pb-2">
                  <button 
                    onClick={() => setRevealCard(!revealCard)} 
                    className="text-[10.5px] text-[#0A3D91] font-extrabold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#0A3D91]" />
                    <span>{revealCard ? 'Hide details' : 'Reveal details'}</span>
                  </button>

                  <button 
                    onClick={handleDownloadCard} 
                    className="text-[10.5px] text-[#059669] font-extrabold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Save to Gallery</span>
                  </button>
                </div>

                {/* Balance Details Display */}
                <div className="grid grid-cols-2 gap-3.5 p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <div className="text-left leading-tight">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Card Currency</span>
                    <p className="text-xs font-black text-[#0A3D91] pt-1">US Dollar ($ USD)</p>
                  </div>
                  
                  <div className="text-right leading-tight">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Card Balance</span>
                    <p className="text-base font-black text-emerald-600 pt-0.5">
                      ${card.balance.toFixed(2)} USD
                    </p>
                  </div>
                </div>

                {/* Operations Actions Buttons */}
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <button
                    onClick={() => setRechargeOpen(true)}
                    disabled={card.status !== 'active'}
                    className="flex items-center justify-center space-x-1.5 py-3.5 bg-[#2563EB] text-white rounded-2xl font-sans font-black text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 duration-100 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ArrowUpRight className="w-4 h-4 text-white" />
                    <span>Recharge Card</span>
                  </button>

                  <button
                    onClick={handleToggleFreeze}
                    disabled={submitting}
                    className={`flex items-center justify-center space-x-1.5 py-3.5 rounded-2xl font-sans font-black text-xs uppercase tracking-wider active:scale-95 duration-100 transition-all cursor-pointer shadow-xs border ${
                      card.status === 'frozen'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100/50'
                        : 'bg-rose-50 text-rose-700 border-rose-250 hover:bg-rose-100/50'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-slate-650" />
                    <span>{card.status === 'frozen' ? 'Unfreeze Card' : 'Freeze Card'}</span>
                  </button>
                </div>

              </div>

              {/* BILLING AND INFO DETAILS SECTION */}
              <div className="bg-white border border-slate-100 p-6 rounded-[2.2rem] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                  <div className="flex items-center space-x-2 text-left">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-[#0A3D91] uppercase tracking-wider font-sans">Sovereign Billing Address</h4>
                      <p className="text-[8.5px] text-slate-450 uppercase tracking-widest font-bold mt-0.5 font-sans">Required for online merchant checks</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const fullAddress = `Street Address: 16192 Coastal Highway\nCity: Lewes\nState: Delaware (DE)\nZip Code: 19958\nCountry: United States\nRegistered Phone: ${profile.phone}`;
                      handleCopy(fullAddress, 'full_address');
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[8.5px] font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1 transition-all active:scale-95 cursor-pointer font-sans"
                  >
                    {copiedField === 'full_address' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 animate-pulse" />
                        <span className="text-emerald-600">Copied Email block!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy Block</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Billing fields table */}
                <div className="grid grid-cols-2 gap-3 text-left font-sans text-xs">
                  {[
                    { key: 'street_address', label: 'Street Address', value: '16192 Coastal Highway' },
                    { key: 'city', label: 'City', value: 'Lewes' },
                    { key: 'state', label: 'State', value: 'Delaware (DE)' },
                    { key: 'zip_code', label: 'Zip Code', value: '19958' },
                    { key: 'country', label: 'Country', value: 'United States' },
                    { key: 'registered_phone', label: 'Registered Phone', value: profile.phone || 'N/A' },
                  ].map((field) => (
                    <div 
                      key={field.key}
                      onClick={() => handleCopy(field.value, field.key)}
                      className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100/70 hover:border-slate-200 rounded-xl relative group cursor-pointer transition-all flex items-center justify-between"
                      title="Click to copy field"
                    >
                      <div className="truncate pr-4">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">{field.label}</span>
                        <span className="font-heavy text-slate-800 block truncate">{field.value}</span>
                      </div>
                      
                      <div className="shrink-0 p-1 bg-white border border-slate-150 rounded-lg group-hover:scale-105 transition-transform flex items-center justify-center">
                        {copiedField === field.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIRTUAL MASTERCARD DETAILS SECTION */}
              <div className="bg-white border border-slate-100 p-6 rounded-[2.2rem] shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-50 pb-2.5 text-left font-sans">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">Virtual Card Specifications</h4>
                    <p className="text-[8.5px] text-slate-450 uppercase tracking-widest font-bold mt-0.5">Compliant international merchant rules</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left font-sans text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100/50">
                    <span className="text-[8px] text-slate-401 font-extrabold uppercase tracking-wider block text-slate-450">Card Association</span>
                    <span className="font-heavy text-slate-800 block mt-0.5">Mastercard International</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100/50">
                    <span className="text-[8px] text-slate-401 font-extrabold uppercase tracking-wider block text-slate-450">Gateway Protocol</span>
                    <span className="font-heavy text-slate-800 block mt-0.5">3D Secure v2 Identity Check</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100/50">
                    <span className="text-[8px] text-slate-401 font-extrabold uppercase tracking-wider block text-slate-450">Foreign Exchange Markup</span>
                    <span className="font-heavy text-[#10B981] block mt-0.5">0.00% Sovereign Benefit</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-105/50">
                    <span className="text-[8px] text-slate-401 font-extrabold uppercase tracking-wider block text-slate-450">Single Transaction Limit</span>
                    <span className="font-heavy text-slate-800 block mt-0.5">$2,500.00 USD</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-105/50 col-span-2">
                    <span className="text-[8px] text-slate-401 font-extrabold uppercase tracking-wider block text-slate-450">Officially Authorized Merchants</span>
                    <span className="font-heavy text-slate-605 block text-[9.5px] mt-0.5">Amazon, ChatGPT Plus, Netflix, AliExpress, Google Play Store & major global portals</span>
                  </div>
                </div>
              </div>

              {/* CARD TRANSACTION HISTORY */}
              <div className="bg-white border border-slate-100 p-6 rounded-[2.2rem] shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <History className="w-4.5 h-4.5 text-[#0A3D91]" />
                    <h4 className="text-[11px] font-black text-[#0A3D91] uppercase tracking-wider">
                      Card Transaction History
                    </h4>
                  </div>
                  <span className="text-[8.5px] bg-[#0A3D91]/10 text-[#0A3D91] border border-[#0A3D91]/20 px-2 rounded-full font-black font-mono">
                    {transactions.length} LOGS
                  </span>
                </div>

                {transactions.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-[10.5px] font-bold uppercase tracking-wider">
                    No transactions captured yet
                  </div>
                ) : (
                  <div className="space-y-3 font-sans max-h-48 overflow-y-auto pr-1">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <div className="leading-tight">
                          <span className="text-[8px] font-mono text-slate-400 tracking-wider block uppercase">ID: {tx.id}</span>
                          <span className="text-[10.5px] font-black text-slate-900 block truncate max-w-[200px] mt-0.5">{tx.description}</span>
                          <span className="text-[8px] text-slate-400 font-bold block pt-0.5">
                            {new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <span className={`text-[12px] font-black ${tx.amount < 0 || tx.type === 'card_issued' ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {tx.amount < 0 || tx.type === 'card_issued' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)} USD
                          </span>
                          <span className="text-[6.5px] font-mono text-slate-455 block font-bold mt-0.5">
                            {tx.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </>
      )}

      {/* RECHARGE CARD MODAL/DIALOG */}
      <AnimatePresence>
        {rechargeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.2rem] shadow-xl border border-slate-100 p-6 text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-xs font-black text-[#0A3D91] uppercase tracking-wider">Fund Card Balance</span>
                <button 
                  onClick={() => setRechargeOpen(false)} 
                  className="p-1 px-2.5 rounded-full bg-slate-100 font-black text-slate-500 text-xs hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Fund info checks */}
              <div className="space-y-3.5">
                
                {/* 1. Value inputs */}
                <div>
                  <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block mb-1">Enter Recharge Amount ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-4.5 top-1/2 -translate-y-1/2 font-black text-[#0A3D91] text-base">$</span>
                    <input 
                      type="number" 
                      min="10"
                      value={rechargeAmt}
                      onChange={(e) => setRechargeAmt(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-3.5 pl-8 pr-12 text-sm font-black text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                      placeholder="10"
                    />
                    <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-[9.5px] font-black text-slate-450 uppercase">USD</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl space-y-1.5 mt-2 text-[10px] shadow-3xs">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Recharge Amount:</span>
                      <span className="font-extrabold text-slate-800">${Number(rechargeAmt || 0).toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium pb-1.5 border-b border-dashed border-slate-200">
                      <span>Transaction Fee:</span>
                      <span className="font-extrabold text-indigo-700">$1.00 USD</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium pt-1">
                      <span>Real-time Rate:</span>
                      <span className="font-bold text-slate-700">1 USD = {usdToEtb.toFixed(2)} ETB</span>
                    </div>
                    <div className="flex justify-between text-[#0A3D91] font-black pt-0.5 text-[11px]">
                      <span>Total Debit Cost:</span>
                      <span>{(((Number(rechargeAmt || 0) + 1) * usdToEtb) || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB</span>
                    </div>
                  </div>
                </div>

                {/* 2. Wallet choice */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">Fund from Wallet Option</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRechargeWallet('deposit')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        rechargeWallet === 'deposit' 
                          ? 'border-[#2563EB] bg-blue-50/20' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-[8px] font-bold text-slate-450 uppercase">Deposit Pool</span>
                      <span className="text-[11px] font-black text-[#0A3D91] pt-0.5 whitespace-nowrap">
                        {(profile.depositBalance ?? 0).toLocaleString()} ETB
                      </span>
                    </button>

                    <button
                      onClick={() => setRechargeWallet('income')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        rechargeWallet === 'income' 
                          ? 'border-[#2563EB] bg-blue-50/20' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-[8px] font-bold text-slate-450 uppercase">Income Pool</span>
                      <span className="text-[11px] font-black text-emerald-600 pt-0.5 whitespace-nowrap">
                        {(profile.incomeBalance ?? 0).toLocaleString()} ETB
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRecharge}
                disabled={submitting || !rechargeAmt || Number(rechargeAmt) < 10}
                className="w-full inline-flex items-center justify-center space-x-1.5 bg-[#2563EB] text-white rounded-[1.8rem] py-3.5 font-sans font-black uppercase tracking-wider text-xs shadow-md shadow-blue-500/10 hover:brightness-105 active:scale-95 transition-all duration-100 cursor-pointer disabled:opacity-40"
              >
                <ArrowUpRight className="w-4 h-4 text-white" />
                <span>Confirm Recharge</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECURITY PASSWORD POPUP */}
      <AnimatePresence>
        {otpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.2rem] shadow-xl border border-slate-100 p-6 text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-xs font-black text-[#0A3D91] uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>Security Password Verification</span>
                </span>
                <button 
                  onClick={() => setOtpOpen(false)} 
                  className="p-1 px-2.5 rounded-full bg-slate-100 font-black text-slate-500 text-xs hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 font-sans">
                <p className="text-[11px] text-slate-500 font-medium">
                  To protect your funds, Lumora has bound this action under password authorization rules. Please enter your Lumora login password to verify your identity.
                </p>

                <div>
                  <label className="text-[8.5px] font-black text-slate-450 uppercase tracking-widest block mb-1">Lumora Login Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={passwordVal}
                      onChange={(e) => setPasswordVal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-3 px-4 text-left text-sm font-medium focus:outline-none focus:border-[#2563EB]"
                      placeholder="Enter your account password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase cursor-pointer"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (otpPurpose === 'apply') {
                    confirmApply();
                  } else if (otpPurpose === 'recharge') {
                    confirmRecharge();
                  }
                }}
                disabled={!passwordVal.trim() || submitting}
                className="w-full inline-flex items-center justify-center space-x-1.5 bg-[#2563EB] text-white rounded-[1.8rem] py-3.5 font-sans font-black uppercase tracking-wider text-xs shadow-md shadow-blue-500/10 hover:brightness-105 active:scale-95 transition-all duration-100 cursor-pointer disabled:opacity-50"
              >
                <span>Authorize & Pay</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
