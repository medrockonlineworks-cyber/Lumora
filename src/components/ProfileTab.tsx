import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Shield, Coins, Heart, LogOut, ArrowUpRight, 
  ArrowDownRight, Users, Copy, Key, Camera, FileText, Check,
  X, Sparkles, Upload, ChevronRight, ChevronDown, Globe, Info, CreditCard,
  Smartphone, Download, ExternalLink, QrCode, Monitor, Share2, Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage, LanguageCode, languages } from '../locale';
import { Profile, Withdrawal, Loan, Referral } from '../types';
import LoanCalculator from './LoanCalculator';
import LumoraLogo from './LumoraLogo';

interface ProfileTabProps {
  profile: Profile;
  withdrawals: Withdrawal[];
  loans: Loan[];
  onSubmitLoan: (amount: number, nationalId: string, tenureMonths: number) => Promise<{ success: boolean; error?: string }>;
  onLogout: () => void;
  onSetPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  onUploadAvatar: (base64: string) => Promise<{ success: boolean; error?: string }>;
  onViewAgreements: () => void;
  onViewAboutUs: () => void;
  onRefresh: () => void;
  onRelaunchWalkthrough: () => void;
  isAdmin?: boolean;
  onAdminClick?: () => void;
  showAdmin?: boolean;
}

const getRepaymentSchedule = (amount: number, tenureMonths: number = 6, startDateStr: string) => {
  const result = [];
  const baseDate = new Date(startDateStr);
  const flatMonthlyRate = 0.015; // 1.5% flat interest per month
  
  const monthlyPrincipal = amount / tenureMonths;
  const monthlyInterest = amount * flatMonthlyRate;
  const installmentAmount = monthlyPrincipal + monthlyInterest;
  
  let remainingBalance = amount + (amount * flatMonthlyRate * tenureMonths);

  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(baseDate.getMonth() + i);
    
    remainingBalance -= installmentAmount;
    if (remainingBalance < 0 || i === tenureMonths) remainingBalance = 0;

    result.push({
      installmentNumber: i,
      dueDate: dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
      principal: monthlyPrincipal,
      interest: monthlyInterest,
      installment: installmentAmount,
      remainingBalance: remainingBalance,
      status: i === 1 ? 'Pending' : 'Upcoming'
    });
  }
  return result;
};

export default function ProfileTab({ 
  profile, 
  withdrawals, 
  loans,
  onSubmitLoan,
  onLogout, 
  onSetPin, 
  onUploadAvatar,
  onViewAgreements,
  onViewAboutUs,
  onRefresh,
  onRelaunchWalkthrough,
  isAdmin,
  onAdminClick,
  showAdmin
}: ProfileTabProps) {
  const { language, setLanguage, t, et } = useLanguage();

  const infoSectionTrans = {
    en: {
      agreements: "Company Agreements",
      agreementsRules: "Institutional Rules",
      aboutUs: "About Us",
      aboutUsDesc: "How Lumora Works",
      platformTour: "Platform Tour",
      platformTourDesc: "Live walkthrough"
    },
    am: {
      agreements: "የድርጅት ስምምነቶች",
      agreementsRules: "ተቋማዊ ደንቦች",
      aboutUs: "ስለ እኛ",
      aboutUsDesc: "Lumora እንዴት እንደሚሰራ",
      platformTour: "የመድረክ ጉብኝት",
      platformTourDesc: "የቀጥታ መመሪያ"
    },
    om: {
      agreements: "Waliigaltee Kubbayyaa",
      agreementsRules: "Seera Dhaabbataa",
      aboutUs: "Waa'ee Keenya",
      aboutUsDesc: "Akka Lumorati Hojjetu",
      platformTour: "Daawwannaa Platform",
      platformTourDesc: "Mirkaneessa kallattiitiin"
    },
    ti: {
      agreements: "ውዕላት ትካል",
      agreementsRules: "መምርሒታት ትካል",
      aboutUs: "ብዛዕባና",
      aboutUsDesc: "Lumora ከመይ ከምዝሰርሕ",
      platformTour: "ዕብረት መድረኽ",
      platformTourDesc: "ናይ ቀጥታ መብርሂ"
    },
    so: {
      agreements: "Heshiisyada Shirkadda",
      agreementsRules: "Shuruucda Hay'adda",
      aboutUs: "Nagu Saabsan",
      aboutUsDesc: "Sida Lumora u Shaqeyso",
      platformTour: "Kormeerka Platform-ka",
      platformTourDesc: "Hagis Toos ah"
    }
  };

  const activeInfoTrans = infoSectionTrans[language as LanguageCode] || infoSectionTrans.en;

  const [pinValue, setPinValue] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);
  const [linkCopyStatus, setLinkCopyStatus] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchReferrals = async () => {
      if (!profile?.userId) return;
      setLoadingReferrals(true);
      try {
        const response = await fetch(`/api/referrals/${profile.userId}`);
        if (response.ok && active) {
          const data = await response.json();
          setReferrals(data);
        }
      } catch (err) {
        console.error('Error fetching referrals:', err);
      } finally {
        if (active) {
          setLoadingReferrals(false);
        }
      }
    };
    fetchReferrals();
    return () => {
      active = false;
    };
  }, [profile?.userId, profile?.teamSize, profile?.totalEarnings]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productionInviteUrl, setProductionInviteUrl] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.productionInviteUrl) {
            setProductionInviteUrl(data.productionInviteUrl);
          }
        }
      } catch (err) {
        console.error('Error loading settings in ProfileTab:', err);
      }
    };
    fetchSettings();
  }, []);

  const getReferralOrigin = () => {
    if (productionInviteUrl) {
      return productionInviteUrl.replace(/\/+$/, "");
    }
    let origin = window.location.origin;
    if (origin.includes("ais-dev-")) {
      origin = origin.replace("ais-dev-", "ais-pre-");
    }
    return origin;
  };

  // Avatar Selection and self upload states
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // PWA & Interactive App download states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => (window as any).deferredPWAInstallPrompt);
  const [isAppInstalled, setIsAppInstalled] = useState(() => {
    try {
      return localStorage.getItem('lumora_pwa_installed') === 'true' ||
             window.matchMedia('(display-mode: standalone)').matches ||
             !!(window.navigator as any).standalone;
    } catch {
      return false;
    }
  });
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'error'>('idle');
  const [downloadingSimulator, setDownloadingSimulator] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'web'>('android');
  const [showQrCode, setShowQrCode] = useState(false);
  const [showPWADetails, setShowPWADetails] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleGlobalPromptAvailable = () => {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      try {
        localStorage.setItem('lumora_pwa_installed', 'true');
      } catch (err) {
        console.error('Failed to store installation status', err);
      }
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handleGlobalPromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsAppInstalled(true);
      try {
        localStorage.setItem('lumora_pwa_installed', 'true');
      } catch (err) {}
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handleGlobalPromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handlePWAInstall = async () => {
    if (!deferredPrompt) {
      // Simulate fallback installation for dev environment
      setInstallStatus('installing');
      setTimeout(() => {
        setIsAppInstalled(true);
        try {
          localStorage.setItem('lumora_pwa_installed', 'true');
        } catch (err) {}
        setInstallStatus('success');
      }, 1500);
      return;
    }
    try {
      setInstallStatus('installing');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
        try {
          localStorage.setItem('lumora_pwa_installed', 'true');
        } catch (err) {}
        setInstallStatus('success');
        setDeferredPrompt(null);
      } else {
        setInstallStatus('error');
      }
    } catch (err) {
      setInstallStatus('error');
    }
  };

  const galleryOptions = [
    {
      id: 'avatar_male_investor',
      name: 'Executive Wealth Director',
      path: '/src/assets/images/avatar_male_investor_1780743569199.png',
      badge: 'PRO'
    },
    {
      id: 'avatar_female_executive',
      name: 'Sovereign Portfolio Partner',
      path: '/src/assets/images/avatar_female_executive_1780743584261.png',
      badge: 'PRESTIGE'
    },
    {
      id: 'avatar_tech_analyst',
      name: 'Quantum Systems Analyst',
      path: '/src/assets/images/avatar_tech_analyst_1780743599314.png',
      badge: 'FINTECH'
    },
    {
      id: 'avatar_senior_advisor',
      name: 'Senior Board Advisor',
      path: '/src/assets/images/avatar_senior_advisor_1780743613602.png',
      badge: 'ELITE'
    },
    {
      id: 'badge_blue_diamond',
      name: 'Blue Diamond Sovereign',
      path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230A3D91"/><stop offset="100%" stop-color="%230072FF"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><text x="50" y="58" font-size="34" text-anchor="middle">💎</text></svg>',
      badge: 'VIP'
    },
    {
      id: 'badge_gold_crown',
      name: 'Golden Solar Sovereign',
      path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23F59E0B"/><stop offset="100%" stop-color="%23D97706"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><text x="50" y="58" font-size="34" text-anchor="middle">👑</text></svg>',
      badge: 'VIP'
    },
    {
      id: 'badge_emerald_growth',
      name: 'Emerald Capital Growth',
      path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310B981"/><stop offset="100%" stop-color="%23047857"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><text x="50" y="58" font-size="34" text-anchor="middle">📈</text></svg>',
      badge: 'VIP'
    },
    {
      id: 'badge_royal_shield',
      name: 'Titan Corporate Shield',
      path: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231E293B"/><stop offset="100%" stop-color="%230F172A"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><text x="50" y="58" font-size="34" text-anchor="middle">🛡️</text></svg>',
      badge: 'VIP'
    }
  ];

  const handleSelectGalleryAvatar = async (path: string) => {
    setUploadingAvatar(true);
    setAvatarError('');
    try {
      const result = await onUploadAvatar(path);
      if (result.success) {
        setShowAvatarModal(false);
      } else {
        setAvatarError(result.error || 'Failed to update avatar profile');
      }
    } catch (err) {
      setAvatarError('Network error updating avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };


  // Loans form states
  const [loanAmount, setLoanAmount] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [loanTenure, setLoanTenure] = useState(6);
  const [loanError, setLoanError] = useState('');
  const [loanSuccess, setLoanSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);
  const [showLoanInfo, setShowLoanInfo] = useState(false);

  const handleLoanRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoanError('');
    setLoanSuccess('');
    
    if (profile.vipLevel < 3) {
      setLoanError('Loan services are available only for members who have reached Level 3 or higher.');
      return;
    }
    
    const allowedAmounts = [30000, 50000, 100000, 150000, 200000, 250000, 500000, 1000000];
    const amt = parseFloat(loanAmount);
    if (!loanAmount || isNaN(amt) || !allowedAmounts.includes(amt)) {
      setLoanError('Loan amount must be one of the allowed options: ' + allowedAmounts.map(a => a.toLocaleString()).join(', ') + ' ETB.');
      return;
    }

    if (!nationalId.trim()) {
      setLoanError('Please provide your National ID details.');
      return;
    }

    setSubmitLoading(true);
    try {
      const result = await onSubmitLoan(amt, nationalId, loanTenure);
      if (result.success) {
        setLoanSuccess(`Your loan request of ${amt.toLocaleString()} ETB for ${loanTenure} Months has been submitted successfully for verification!`);
        setLoanAmount('');
        setNationalId('');
        onRefresh();
      } else {
        setLoanError(result.error || 'Failed to submit loan request.');
      }
    } catch (err) {
      setLoanError('Network failure. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.referralCode);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleCopyLink = () => {
    const referralLink = getReferralOrigin() + "/?ref=" + profile.referralCode;
    navigator.clipboard.writeText(referralLink);
    setLinkCopyStatus(true);
    setTimeout(() => setLinkCopyStatus(false), 2000);
  };

  const handlePinSubmit = async () => {
    if (!pinValue.match(/^\d{4}$/)) {
      setPinMessage('PIN must be exactly 4 digits');
      return;
    }
    const result = await onSetPin(pinValue);
    if (result.success) {
      setPinMessage('PIN configured successfully!');
      setPinValue('');
    } else {
      setPinMessage(result.error || 'Failed to update PIN');
    }
    setTimeout(() => setPinMessage(''), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingAvatar(true);
      setAvatarError('');
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const result = await onUploadAvatar(base64);
          if (result.success) {
            setShowAvatarModal(false);
          } else {
            setAvatarError(result.error || 'Failed to update custom photo');
          }
        } catch (err) {
          setAvatarError('Network error uploading image');
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReSubmitId = async () => {
    try {
      const res = await fetch('/api/profiles/reset-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.userId })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* CARD 1: Dual-State Dynamic Sovereign Header Card */}
      <div className="rounded-[2.2rem] bg-white border border-slate-100 text-center relative overflow-hidden shadow-sm pb-6">
        
        {/* Premium Banner */}
        <div className="relative h-32 overflow-hidden bg-gradient-to-r from-slate-900 to-[#0A3D91]">
          <img 
            src="/src/assets/images/lumora_profile_banner_1780734746960.png"
            alt="LUMORA Financial Capital"
            className="w-full h-full object-cover opacity-80 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
        </div>
        
        {/* Centered Avatar Display */}
        <div className="flex items-center justify-center -mt-12 relative z-10 select-none pb-2">
          <div 
            onClick={() => setShowAvatarModal(true)}
            className="relative w-24 h-24 rounded-[1.8rem] border-4 border-white bg-slate-50 overflow-hidden flex items-center justify-center shadow-xl group cursor-pointer active:scale-95 transition-transform"
          >
            {profile.idSelfie || profile.profilePicture ? (
              <img 
                 src={profile.idSelfie || profile.profilePicture} 
                 alt="User profile avatar" 
                 className="w-full h-full object-cover" 
              />
            ) : (
              <span className="font-display font-black text-3xl text-[#0A3D91] uppercase">
                {profile.fullName.substring(0, 2)}
              </span>
            )}

            <div
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
            >
              <Camera className="w-5 h-5 text-gray-200" />
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* User Identity Info */}
        <div className="px-6 space-y-1">
          <h3 className="font-display font-black text-lg text-slate-950 mt-2 tracking-tight flex items-center justify-center space-x-1.5 animate-pulse">
            <span>{profile.fullName}</span>
            {profile.idVerificationStatus === 'verified' && (
              <span className="inline-flex items-center text-emerald-600 bg-emerald-50 rounded-full border border-emerald-200 p-0.5" title="Verified Account">
                <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[3]" />
              </span>
            )}
          </h3>

          <div className="flex items-center justify-center space-x-2 mt-1">
            <span className="text-[10.5px] text-slate-850 font-extrabold font-mono tracking-wide bg-slate-100 border border-slate-200 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-[#0180FE]" />
              <span>{profile.phone}</span>
            </span>
          </div>

          {/* Dynamic ID Certification Banner */}
          <div className="pt-3 flex flex-col items-center">
            {profile.idVerificationStatus === 'verified' ? (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-150 text-[9px] font-extrabold uppercase tracking-widest font-sans">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span>
                  {language === 'am' ? 'መለያ ተረጋግጧል' :
                   language === 'om' ? 'Mirkanaa\'e Mirkaneeffame' :
                   language === 'ti' ? 'ኣካውንት ተረጋጊጹ' :
                   language === 'so' ? 'Akoonada La Xaqiijiyay' :
                   'Account Verified'} ✓
                </span>
              </div>
            ) : profile.idVerificationStatus === 'pending' ? (
              <div className="inline-flex flex-col items-center space-y-2 max-w-[280px]">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-150 text-[9px] font-extrabold uppercase tracking-widest font-sans animate-pulse">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  <span>
                    {language === 'am' ? 'ማረጋገጫ በመጠባበቅ ላይ' :
                     language === 'om' ? 'Eeyyama Eeggachaa' :
                     language === 'ti' ? 'ምጽራይ ይግበረሉ ኣሎ' :
                     language === 'so' ? 'Hubinta u Hoggaansanaanta' :
                     'Compliance Auditing'}
                  </span>
                </div>
                <p className="text-[9px] text-amber-900 leading-normal font-sans font-bold text-center">
                  {language === 'am' ? 'የኢትዮጵያ ንግድ ባንክ ተገዢነት ግምገማ በመካሄድ ላይ ነው። ሲፈቀድ ተጨማሪ ባህሪያት በራሳቸው ይከፈታሉ።' :
                   language === 'om' ? 'Mirkaneessi CBE adeemsa irra jira. Eeyyamni dabalataa odoo hin dhibin banama.' :
                   language === 'ti' ? 'ናይ ኢትዮጵያ ንግድ ባንክ ገምጋም ኣብ መስርሕ ይርከብ። ምስ ተፈቐደ ተወሳኺ ክፋላት ባዕሎም ክኽፈቱ እዮም።' :
                   language === 'so' ? 'Hubinta u hoggaansanaanta CBE ayaa socota. Tilmaamaha mudnaanta labaad ayaa si otomaatig ah u furmaya marka la ansixiyo.' :
                   'CBE compliant review under progress. Secondary privilege features unlock automatically upon approval.'}
                </p>
              </div>
            ) : profile.idVerificationStatus === 'rejected' ? (
              <div className="inline-flex flex-col items-center space-y-2 max-w-[280px] p-1">
                <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[9px] font-extrabold uppercase tracking-widest font-sans animate-bounce">
                  <span>
                    {language === 'am' ? 'ማረጋገጫው ውድቅ ተደርጓል' :
                     language === 'om' ? 'Auditingi Didame' :
                     language === 'ti' ? 'ኣካውንት ውድቅ ተገይሩ' :
                     language === 'so' ? 'Hubinta Layiray' :
                     'Auditing Denied'} ⚠
                  </span>
                </div>
                {profile.idRejectionReason && (
                  <p className="text-[9px] text-rose-950 font-black bg-rose-50 border border-rose-200 p-2.5 rounded-xl leading-relaxed text-center">
                    {language === 'am' ? 'የአስተዳዳሪ ማሳሰቢያ' :
                     language === 'om' ? 'Yaada Auditor' :
                     language === 'ti' ? 'መዘክረ ኦዲተር' :
                     language === 'so' ? 'Xusuusta Hubiyaha' :
                     'Auditor notes'}: {profile.idRejectionReason}
                  </p>
                )}
                <button
                  onClick={handleReSubmitId}
                  className="px-3.5 py-1.5 bg-[#0180FE] hover:bg-[#0070df] text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-transform active:scale-95 text-center mt-1"
                >
                  {language === 'am' ? 'ብሔራዊ መታወቂያ ደግመህ አስገባ' :
                   language === 'om' ? 'Eenyummaa Irra Deebi\'i Galchi' :
                   language === 'ti' ? 'መታወቂያ መሊስካ ስደድ' :
                   language === 'so' ? 'Markale Gudbi Aqoonsiga Qaranka' :
                   'Re-submit National ID'}
                </button>
              </div>
            ) : null}
          </div>

          {/* Member Level Badge details */}
          <div className="pt-3">
            <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-2xl bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest font-sans">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>
                {language === 'am' ? `ከፍተኛ ደረጃ ቪአይፒ ${profile.vipLevel || 0} አባል` :
                 language === 'om' ? `SADARKAA OLAANAA VIP ${profile.vipLevel || 0} SECTOR` :
                 language === 'ti' ? `ላዕለዋይ ሰንሰለት ቪአይፒ ${profile.vipLevel || 0} ኣባል` :
                 language === 'so' ? `VIP-KA HEERKA SARE ${profile.vipLevel || 0} XUBIN` :
                 `PEAK LEVEL VIP ${profile.vipLevel || 0} MEMBER`}
              </span>
            </div>
          </div>

        </div>

      </div>



      {/* CARD 2: Referrals Invite System Panel (Bento Layout) */}
      <div className="p-6 rounded-[2.2rem] bg-white border border-slate-100 shadow-sm space-y-5">
        
        {/* Redesigned Profile Card Header */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-blue-50 text-[#0A3D91] rounded-2xl">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider leading-none">
                {t.referralSystem}
              </h4>
              <p className="text-[8.5px] text-slate-700 font-black uppercase tracking-widest mt-1">
                {language === 'am' ? 'የትርፍ ማባዣ መድረክ' :
                 language === 'om' ? "Madal Dhaala Baay'isu" :
                 language === 'ti' ? 'መድረኽ ምምጣን እቶት' :
                 language === 'so' ? 'Madasha badbada dakhliga' :
                 'Yield multiplier platform'}
              </p>
            </div>
          </div>
          <span className="text-[8.5px] bg-[#0A3D91]/10 text-[#0A3D91] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider">
            {language === 'am' ? '+18% ኮሚሽን' :
             language === 'om' ? '+18% Komishinii' :
             language === 'ti' ? '+18% ኮሚሽን' :
             language === 'so' ? '+18% Komishinka' :
             '+18% Commission'}
          </span>
        </div>

        <p className="text-[11.5px] text-slate-900 leading-relaxed font-bold">
          {t.inviteFriends}{' '}
          {language === 'am' ? 'ከCBE ሊኩይዲቲ ዝውውሮች ጋር በቀጥታ የተጣጣሙ ተጨማሪ የጉርሻ ክፍያዎችን ለማግኘት የግብዣ መረብዎን ያሳድጉ።' :
           language === 'om' ? ' Kaffaltii dabalataa dakhlii herrega CBE waliin raawwatamu argachuuf sirna keessan babal\'isaa.' :
           language === 'ti' ? ' ምስ ናይ CBE ምስግጋር እቶት ብቐጥታ ዝተኣሳሰረ ተወሳኺ ናይ ጉርሻ ክፍሊት ንምርካብ ናይ ምውሳኽ መስርሕኩም ኣስፍሕዎ።' :
           language === 'so' ? ' Kor dhiiri nidaamkaaga si aad u furto qoondooyin gunno oo dheeri ah oo si toos ah ula jaanqaada xawaaladaha CBE.' :
           ' Grow your custodial system to unlock extra bonus allocations directly synchronized with CBE liquidity transfers.'}
        </p>

        {/* Bento Stats row */}
        <div className="grid grid-cols-2 gap-3.5 pt-1 text-center font-sans">
          <div className="p-3.5 bg-slate-50/80 border border-slate-100/60 rounded-2xl">
            <span className="text-slate-700 text-[8.5px] uppercase tracking-wider font-extrabold block">
              {t.teamSize}
            </span>
            <span className="font-display font-black text-lg text-[#0A3D91] mt-0.5 block">
              {profile.teamSize || 0}
              {language === 'am' ? ' አጋሮች' :
               language === 'om' ? ' Hiriyoota' :
               language === 'ti' ? ' መሻርኽቲ' :
               language === 'so' ? ' Shuraako' :
               ' Partners'}
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50/20 border border-emerald-150/60 rounded-2xl">
            <span className="text-emerald-800 text-[8.5px] uppercase tracking-wider font-extrabold block">
              {t.totalReferralRewards}
            </span>
            <span className="font-display font-black text-lg text-emerald-700 mt-0.5 block font-mono">
              {(profile?.totalEarnings ?? 0).toLocaleString()} ETB
            </span>
          </div>
        </div>

        {/* Ultra-Premium Official Partner & Referral Section */}
        <div className="space-y-4 pt-2">
          {/* Box 1: Premium Official Partner Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0A3D91] via-[#124ca6] to-[#06245c] rounded-3xl p-5 border-2 border-amber-400/80 shadow-lg text-center font-sans select-none">
            {/* Glossy background pattern */}
            <div className="absolute right-0 top-0 -mt-8 -mr-8 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute left-0 bottom-0 -mb-8 -ml-8 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Official Partner Badge */}
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-amber-400/90 text-slate-900 border border-amber-350 shadow-sm mx-auto mb-3 animate-pulse">
              <span className="text-[9.5px] font-black uppercase tracking-wider block leading-none">
                {language === 'am' ? 'ይፋዊ አጋር' :
                 language === 'om' ? 'QAAMA HUNDEEFFAME' :
                 language === 'ti' ? 'ዕውጅ መሻርኽቲ' :
                 language === 'so' ? 'WADAAG RASHMI AH' :
                 'Official Partner'}
              </span>
            </div>

            {/* Invitation Code Label */}
            <span className="text-[9px] text-white/70 block uppercase font-mono font-black tracking-widest mb-1">
              {language === 'am' ? 'የግብዣ መለያ ቁጥርዎ' :
               language === 'om' ? 'Koodii Affeerraa Keessan' :
               language === 'ti' ? 'ነጻ መለለዪ ቁጽርኻ' :
               language === 'so' ? 'HAY' :
               'Your Invitation ID'}
            </span>

            {/* Invitation Code Styled Type */}
            <h2 className="text-3xl font-black italic tracking-widest text-white uppercase font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] my-1">
              {profile.referralCode}
            </h2>
          </div>

          {/* Invitation URL Box */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-[#0A3D91] block uppercase font-sans font-black tracking-widest text-left pl-1">
              {language === 'am' ? 'ጓደኞችን ለመጋበዝ ሊንክ' :
               language === 'om' ? 'Liinkii Affeerraa Hiriyootaa' :
               language === 'ti' ? 'ዕድመ ንምልኣኽ ሊንክ' :
               language === 'so' ? 'Casuumaada Linkii' :
               'Invite Friends Link'}
            </span>
            
            <div className="p-1 bg-slate-50 border-2 border-slate-200/80 rounded-2xl flex items-center justify-between font-sans">
              <div className="pl-3.5 py-2.5 min-w-0 flex-1 mr-2 text-left">
                <span className="text-[10px] font-extrabold text-slate-700 block truncate font-mono">
                  {getReferralOrigin()}/?ref={profile.referralCode}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className={`p-2.5 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0 border shadow-xs ${
                  linkCopyStatus 
                    ? 'bg-emerald-500 text-white border-emerald-500' 
                    : 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600 hover:shadow-md'
                }`}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Share & QR Code Actions side-by-side */}
          <div className="grid grid-cols-2 gap-3 font-sans">
            <button
              onClick={() => {
                const referralLink = getReferralOrigin() + "/?ref=" + profile.referralCode;
                if (navigator.share) {
                  navigator.share({
                    title: 'LUMORA - Invest & Grow',
                    text: `Join my team on LUMORA and start earning CBE-synchronized bonuses! Use Referral Code: ${profile.referralCode}`,
                    url: referralLink,
                  }).catch(() => {
                    handleCopyLink();
                  });
                } else {
                  handleCopyLink();
                }
              }}
              className="px-4 py-3 bg-[#0c1829] hover:bg-[#16273e] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 border border-slate-800 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>
                {language === 'am' ? 'አጋራ' :
                 language === 'om' ? 'QOODDI' :
                 language === 'ti' ? 'ሓጋዚ' :
                 language === 'so' ? 'LA WADAAG' :
                 'Share'}
              </span>
            </button>

            <button
              onClick={() => setShowQrCode(true)}
              className="px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 border border-amber-200 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <QrCode className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>
                {language === 'am' ? 'ኪውአር ኮድ' :
                 language === 'om' ? 'Koodii QR' :
                 language === 'ti' ? 'QR ኮድ' :
                 language === 'so' ? 'QR CODE' :
                 'QR Code'}
              </span>
            </button>
          </div>


        </div>

        {/* Floating QR Code Modal Overlay */}
        {showQrCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-2 border-[#0A3D91]/20 shadow-2xl relative">
              <button
                onClick={() => setShowQrCode(false)}
                className="absolute top-4 right-4 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-full cursor-pointer transition-all active:scale-95 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0A3D91] flex items-center justify-center mx-auto border-2 border-blue-100">
                  <QrCode className="w-6 h-6 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    {language === 'am' ? 'የመመለሻ QR ኮድ' : 'Scan to Join My Team'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-extrabold font-sans leading-relaxed uppercase">
                    Code: {profile.referralCode}
                  </p>
                </div>

                {/* Secure QR Code Image generated from trusted API */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-250 inline-block mx-auto relative group">
                  <img
                    referrerPolicy="no-referrer"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=0a3d91&data=${encodeURIComponent(getReferralOrigin() + '/?ref=' + profile.referralCode)}`}
                    alt="LUMORA QR Code"
                    className="w-48 h-48 rounded-xl bg-white select-none pointer-events-none"
                    onLoad={() => console.log('QR Code image retrieved successfully')}
                  />
                </div>

                <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 text-left">
                  <p className="text-[10.5px] font-black text-slate-700 leading-normal max-w-xs mx-auto text-center">
                    {language === 'am' ? 'ይህን ኮድ ለጓደኞችዎ ያሳዩ። ካሜራቸውን ተጠቅመው መመዝገብና ቡድንዎን መቀላቀል ይችላሉ።' :
                     language === 'om' ? 'Koodii kana hiriyaa keessaniif agarsiisaa. Kaameraa isaanitti hirmaachuun galmeeffamuu danda\'u.' :
                     language === 'ti' ? 'እዚ QR ኮድ ምስ ፈተውትኻ ኣካፍል። ካሜራ ብምጥቃም ተመዝጊቦም ናይ ቡድንኻ ክወሃሃዱ ይኽእሉ።' :
                     language === 'so' ? 'Tusi koodkaan asxaabtaada si ay ugu biiraan kooxdaada.' :
                     'Point your phone camera at this code to load the registration page and join my partner network instantly.'}
                  </p>
                </div>

                <button
                  onClick={() => setShowQrCode(false)}
                  className="w-full py-3 bg-[#0A3D91] hover:bg-[#06245c] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border-2 border-[#0A3D91]"
                >
                  {language === 'am' ? 'ዝጋ' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
          
          {/* Dynamic Referral Tracking Section (Skyblue & White styling with localized metadata) */}
          <div className="pt-4 border-t border-slate-150/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-sky-600">
                <Users className="w-4 h-4 text-sky-500 animate-pulse" />
                <span className="text-[10px] font-sans font-black uppercase tracking-wider text-sky-600">
                  {language === 'am' ? 'የተጋበዙ አጋሮች መከታተያ' :
                   language === 'om' ? 'Hordoffii Hiriyoota Affeeraman' :
                   language === 'ti' ? 'ተጠቃሚ ዝርዝር መከታተሊ' :
                   language === 'so' ? 'Hordonka Casuumayasha' :
                   'Referrals & Bonus Tracking'}
                </span>
                {loadingReferrals && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                )}
              </div>
              <span className="text-[9.5px] font-sans font-black bg-sky-50 text-sky-600 px-2 py-0.5 rounded-lg border border-sky-100">
                {referrals.length} {language === 'am' ? 'አባላት' : 'partners'}
              </span>
            </div>

            {referrals.length === 0 ? (
              <div className="p-4.5 text-center bg-sky-50/30 rounded-2xl border border-sky-100/65 space-y-1">
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">
                  {language === 'am' ? 'እስካሁን የተቀላቀለ አጋር የለም' :
                   language === 'om' ? 'Kallattiratti hin argamne' :
                   language === 'ti' ? 'እስካ ሕዚ ዝተመዝገበ የለን' :
                   language === 'so' ? 'Weli wax shuraako ah ma jiraan' :
                   'No active team members detected'}
                </p>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed max-w-[280px] mx-auto">
                  {language === 'am' ? 'የግብዣ ኮድዎን ወይም አገናኝዎን ለጓደኞችዎ በማካፈል 10% ፈጣን ኮሚሽን መከታተል ይጀምሩ።' :
                   language === 'om' ? 'Koodii ykn link keessan hiriyootaaf hirmaachisuun komishinii 10% sassaabaa.' :
                   language === 'ti' ? 'ናይ መወዳእታ ኮድኩም ምስ ፈተውትኹም ብምክፋል 10% ተጠቃሚ ኩኑ።' :
                   language === 'so' ? 'U la wadaag code-kaaga asxaabta si aad u kasbato 10% gunno toos ah.' :
                   'Share your unique link or code to track and instantly earn 10% on their approved deposits.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {referrals.map((ref) => {
                  const maskedPhone = ref.referredPhone 
                    ? ref.referredPhone.replace(/(\d{3})\d+(\d{3})/, "$1****$2") 
                    : "099****123";
                  const formattedDate = ref.registrationDate 
                    ? new Date(ref.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                    : 'June 2026';
                  
                  return (
                    <div 
                      key={ref.id} 
                      className="p-3 bg-gradient-to-r from-sky-50/20 to-sky-50/40 border border-sky-100/60 rounded-2xl flex items-center justify-between"
                    >
                      <div className="space-y-1 min-w-0 flex-1 mr-3 text-left">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-display font-black text-[11px] text-slate-800 truncate">
                            {ref.referredName}
                          </span>
                          <span className="text-[8px] bg-sky-50 text-sky-600 border border-sky-150/50 font-black px-1.5 py-0.5 rounded-lg uppercase tracking-wider scale-90 origin-left">
                            VIP {ref.referredVipLevel}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[9px] text-slate-500 font-bold font-mono">
                          <span>{maskedPhone}</span>
                          <span className="text-slate-300">•</span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[8.5px] text-slate-500 font-black block uppercase tracking-wide">
                          {language === 'am' ? 'ጉርሻ' : 'Bonus'}
                        </span>
                        <span className="font-display font-extrabold text-xs text-emerald-600 font-mono">
                          +{Number(ref.rewardEarned || 0).toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

      </div>

      {/* CARD 4: Institutional Liquidity Loans Simulator Block */}
      <div className="p-6 rounded-[2.2rem] bg-white border border-slate-100 shadow-sm space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-blue-50 text-[#0A3D91] rounded-2xl">
              <Coins className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider leading-none border-0 p-0 shadow-none">
                  {language === 'am' ? 'የሊኩይዲቲ ብድሮች' :
                   language === 'om' ? 'Liqii Maallaqaa' :
                   language === 'ti' ? 'ናይ እቶት ልቓሕ' :
                   language === 'so' ? "Amaahda Faa'idada" :
                   'Liquidity Loans'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowLoanInfo(true)}
                  className="p-1 text-[#0A3D91] hover:bg-slate-100 rounded-full cursor-pointer transition-all active:scale-90 inline-flex items-center justify-center border-0"
                  title="Loan Requirements Info"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[8.5px] text-slate-700 font-black uppercase tracking-widest mt-1">
                {language === 'am' ? 'የኢትዮጵያ ንግድ ባንክ ቀጥተኛ የብድር አገልግሎት' :
                 language === 'om' ? 'Kireeditii Baankii CBE kallatti' :
                 language === 'ti' ? 'ናይ ኢትዮጵያ ንግድ ባንክ ቀጥታዊ ልቓሕ' :
                 language === 'so' ? 'Dhibcaha khasunka tooska ah ee CBE' :
                 'CBE direct-wire treasury credit'}
              </p>
            </div>
          </div>
          <span className="text-[8.5px] inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-800 font-black px-2.5 py-1 rounded-xl uppercase tracking-wider">
            <span>
              {language === 'am' ? 'ወለድ፡' :
               language === 'om' ? 'Dhaala:' :
               language === 'ti' ? 'ወለድ፡' :
               language === 'so' ? 'Ribada:' :
               'Interest:'}
            </span>
            <strong>
              1.5%{' '}
              {language === 'am' ? 'ቋሚ' :
               language === 'om' ? 'Flat' :
               language === 'ti' ? 'ቀዋሚ' :
               language === 'so' ? 'Siman' :
               'Flat'}
            </strong>
          </span>
        </div>
 
        <p className="text-[11.5px] text-slate-900 leading-relaxed font-bold">
          {language === 'am' ? 'በLUMORA ሊኩይዲቲ አካውንቶች የተደገፈ ተቋማዊ ካፒታልን ይክፈቱ። ክፍያዎች በ24 ሰዓታት ውስጥ በቀጥታ ወደተረጋገጠው የCBE አካውንትዎ ይላካሉ። ብቁ ደረጃ፡ ቪአይፒ 3።' :
           language === 'om' ? 'Wabii herrega Lumoratiin kaffaltii liqii baankii argadhaa. Sa\'aa 24 keessatti herrega CBE keessanitti ergama. Sadarkaa dandeettii: VIP 3.' :
           language === 'ti' ? 'ብLUMORA ናይ እቶት ሒሳብ ዝተደገፈ ተቋማዊ ርእሰ-ማል ይኽፈቱ። ክፍሊታት ኣብ ውሽጢ 24 ሰዓታት ቀጥታ ናብ ዝተረጋገጸ ናይ CBE ኣካውንትኩም ይለኣኽ። ብቑዕ ደረጃ፡ ቪአይፒ 3።' :
           language === 'so' ? 'Furi hantida hay\'adaha ee ay taageerayaan xisaabaadka dareeraha ah ee LUMORA. Bixinta waxaa si toos ah loogu dhigaa akoonkaaga CBE ee la xaqiijiyay 24 saacodood gudahood. Heerka u qalmida: VIP 3.' :
           'Unlock institutional capital backed by LUMORA’s liquidity accounts. Disbursements are swept directly to your verified CBE account within 24 hours. Eligible tier: VIP 3.'}
        </p>

        {/* Verification / Level Locks Checking */}
        {/* Calculation details simulator is open to EVERYONE, as requested */}
        <div className="bg-slate-50/55 p-4 rounded-2xl border border-slate-100 font-sans">
          <LoanCalculator
            isEligible={profile.vipLevel >= 3 && profile.idVerificationStatus === 'verified'}
            onApplySettings={(amount, tenure) => {
              setLoanAmount(amount.toString());
              setLoanTenure(tenure);
            }}
          />
        </div>

        {/* Loan Unlock Tracker Track */}
        <div className="p-4.5 rounded-2xl bg-blue-50/30 border-2 border-dashed border-[#0A3D91]/20 font-sans space-y-3">
          <div className="flex items-center space-x-2 pb-1.5 border-b border-[#0A3D91]/10">
            <Shield className="w-4 h-4 text-[#0A3D91]" />
            <h4 className="text-[11px] font-black text-[#0A3D91] uppercase tracking-wider">
              {language === 'am' ? 'የብድር አገልግሎት ማግኛ ደረጃ' : 'Sovereign Loan Unlock Tracker'}
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Condition 1: VIP 3+ */}
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              profile.vipLevel >= 3 
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50/60 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-base font-black ${profile.vipLevel >= 3 ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`}>
                  {profile.vipLevel >= 3 ? "✓" : "✗"}
                </span>
                <span className="text-[10.5px] font-bold">
                  {language === 'am' ? 'ቪአይፒ ደረጃ 3 ወይም ከዚያ በላይ መሆን' : 'Active Plan Level: VIP Level 3+'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-white border">
                VIP {profile.vipLevel || 0} / 3
              </span>
            </div>

            {/* Condition 2: ID Verified */}
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              profile.idVerificationStatus === 'verified' 
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                : 'bg-rose-50/60 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-base font-black ${profile.idVerificationStatus === 'verified' ? 'text-emerald-600' : 'text-rose-500 animate-pulse'}`}>
                  {profile.idVerificationStatus === 'verified' ? "✓" : "✗"}
                </span>
                <span className="text-[10.5px] font-bold">
                  {language === 'am' ? 'የብሔራዊ መታወቂያ መረጋገጥ (ID Verified)' : 'National ID Auditing & Compliance'}
                </span>
              </div>
              <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                profile.idVerificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {profile.idVerificationStatus || 'Unsubmitted'}
              </span>
            </div>
          </div>

          {/* Overall status badge */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wide">
              {language === 'am' ? 'አጠቃላይ የብቁነት ሁኔታ፡' : 'Access Authorization:'}
            </span>
            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
              profile.vipLevel >= 3 && profile.idVerificationStatus === 'verified'
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                : 'bg-amber-100 border-amber-200 text-amber-800'
            }`}>
              {profile.vipLevel >= 3 && profile.idVerificationStatus === 'verified' 
                ? (language === 'am' ? '✓ ብቁ ነዎት' : '✓ Fully Eligible') 
                : (language === 'am' ? '✗ የታገደ' : '✗ Authorization Pending')
              }
            </span>
          </div>
        </div>

        {profile.vipLevel < 3 ? (
          <div className="p-5 bg-amber-50/75 rounded-[1.80rem] border border-amber-200 text-center space-y-3 font-sans">
            <span className="text-[9px] bg-amber-200/70 text-[#925c0e] font-extrabold uppercase py-1 px-4 rounded-xl border border-amber-300">
              Loan Feature Locked
            </span>
            <p className="text-[11px] text-amber-900 leading-relaxed font-bold max-w-sm mx-auto">
              Sovereign loan request portal is closed. Loan services are available only for members who have reached VIP Level 3 or higher. Current level: <strong>VIP {profile.vipLevel || 0}</strong>.
            </p>
            <p className="text-[10px] text-slate-600 leading-normal max-w-xs mx-auto">
              Please visit the <strong>Investments Screen</strong> to upgrade your plan to VIP Level 3 or higher to acquire full eligibility.
            </p>
          </div>
        ) : profile.idVerificationStatus !== 'verified' ? (
          <div className="p-4 bg-rose-50 rounded-[1.50rem] border border-rose-200 text-center space-y-2">
            <span className="text-[8.5px] bg-rose-700 text-white font-black uppercase py-1 px-3 rounded-xl shadow-xs">
              Compliance Lock
            </span>
            <p className="text-[10.5px] text-slate-950 leading-normal font-bold max-w-xs mx-auto">
              ID auditing is currently <strong className="text-rose-800">{profile.idVerificationStatus || 'Unsubmitted'}</strong>. Re-submit details and secure compliance clearance inside the profile.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLoanRequest} className="space-y-4 pt-1 font-sans">
            <div>
              <label className="text-[8.5px] text-[#0A3D91] block uppercase font-mono font-black tracking-widest mb-1.5">
                Loan Principal Sum (ETB)
              </label>
              <select
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-3 text-xs text-[#0A3D91] focus:outline-none focus:border-[#0A3D91] focus:bg-white font-mono font-bold transition-colors cursor-pointer"
                required
              >
                <option value="">-- Select Loan Amount --</option>
                {[30000, 50000, 100000, 150000, 200000, 250000, 500000, 1000000].map((amt) => (
                  <option key={amt} value={amt.toString()}>
                    {amt.toLocaleString()} ETB
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[30000, 50000, 100000, 150000, 200000, 250000, 500000, 1000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLoanAmount(amt.toString())}
                    className="px-2.5 py-1 text-[9px] font-extrabold rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 text-[#0A3D91] cursor-pointer active:scale-95 transition-transform"
                  >
                    {amt.toLocaleString()} ETB
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[8.5px] text-[#0A3D91] block uppercase font-mono font-black tracking-widest mb-1.5">
                Principal Repayment Interval (Tenure)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setLoanTenure(m)}
                    className={`py-2 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                      loanTenure === m
                        ? "bg-[#0A3D91] text-white border-transparent"
                        : "bg-slate-50 text-slate-950 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {m} Mos
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[8.5px] text-[#0A3D91] block uppercase font-mono font-black tracking-widest mb-1.5">
                Verified National ID FAN Number
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="e.g. FAN-84950392"
                className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-3 text-xs text-slate-805 focus:outline-none focus:border-[#0A3D91] focus:bg-white font-mono font-black uppercase transition-colors"
                required
              />
            </div>

            {loanError && (
              <p className="text-[9.5px] font-bold text-rose-600 font-mono animate-pulse">⚠ {loanError}</p>
            )}
            {loanSuccess && (
              <p className="text-[9.5px] font-bold text-emerald-600 font-mono leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                ✓ {loanSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-3 bg-[#0A3D91] hover:bg-[#072A66] disabled:bg-slate-200 text-white transition-transform active:scale-98 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center space-x-2"
            >
              {submitLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>Request Verification & Disburse Loan</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>

      {/* CARD 4b: Loan History Section */}
      <div className="p-6 rounded-[2.2rem] bg-white border border-slate-100 shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-100 text-[#0A3D91] rounded-2xl">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-slate-900 uppercase tracking-wider leading-none">
                {language === 'am' ? 'የብድር ታሪክ መዝገብ' : 'Loan History Ledger'}
              </h4>
              <p className="text-[8.5px] text-slate-500 font-black uppercase tracking-widest mt-1">
                {language === 'am' ? 'የእርስዎ ያለፉ እና በመጠባበቅ ላይ ያሉ የብድር ጥያቄዎች ዝርዝር' : 'Track and audit your sovereign credit records'}
              </p>
            </div>
          </div>
          <span className="text-[9.5px] font-mono font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded-xl border border-slate-150">
            {loans ? loans.length : 0} {language === 'am' ? 'ጥያቄዎች' : 'records'}
          </span>
        </div>

        {!loans || loans.length === 0 ? (
          <div className="p-6 text-center bg-slate-50/55 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
              {language === 'am' ? 'ምንም የብድር ታሪክ የለም' : 'No Loan History Found'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold leading-normal max-w-[280px] mx-auto">
              {language === 'am' ? 'እስካሁን ምንም የብድር ጥያቄ አላስገቡም። ብቁ ሲሆኑ የመጀመሪያውን ጥያቄ ከላይ ማቅረብ ይችላሉ።' :
               'You have not submitted any loan applications yet. All future status-tracked requests and repayment logs will be documented here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {loans.map((l) => {
              // Calculate dynamic remaining repayment balance
              let remainingRepaymentBalance = 0;
              const tenure = l.tenureMonths || 6;
              const flatMonthlyRate = 0.015;
              const totalRepayable = l.amount + (l.amount * flatMonthlyRate * tenure);

              if (l.status === 'approved') {
                const startDate = new Date(l.reviewedAt || l.submittedAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - startDate.getTime());
                const monthsElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.4375));
                const monthlyInstallment = totalRepayable / tenure;
                remainingRepaymentBalance = monthsElapsed >= tenure ? 0 : (totalRepayable - (monthsElapsed * monthlyInstallment));
              } else if (l.status === 'pending') {
                // For pending loans, the remaining repayment is the expected total repayment upon approval
                remainingRepaymentBalance = totalRepayable;
              } else {
                // Rejected loans have 0 remaining balance
                remainingRepaymentBalance = 0;
              }

              return (
                <div key={l.id} className="p-4 bg-gradient-to-b from-slate-50 to-white border border-slate-150 rounded-2xl flex flex-col space-y-3 font-sans transition-all hover:border-slate-305">
                  
                  {/* Row 1: Amount & Status Badge */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-display font-black text-sm text-[#0D2B60] font-mono">
                        {(l.amount ?? 0).toLocaleString()} <span className="text-[10px]">ETB</span>
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono font-bold block mt-0.5">
                        ID: {l.id} | {tenure} Months Tenure
                      </span>
                    </div>
                    <span className={`text-[8.5px] font-black px-2.5 py-1 rounded-xl border uppercase tracking-wider font-sans ${
                      l.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' :
                      l.status === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-250' :
                      'bg-amber-50 text-amber-800 border-amber-250 animate-pulse'
                    }`}>
                      {l.status === 'approved' ? '✓ Approved' : l.status === 'rejected' ? '✗ Rejected' : '⟳ Pending'}
                    </span>
                  </div>

                  {/* Row 2: Status-Tracked Detailed Information Cards */}
                  <div className="bg-slate-55/70 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-[10px] leading-normal">
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">Application Date:</span>
                      <strong className="text-slate-900 font-mono font-bold">
                        {new Date(l.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">National ID Check:</span>
                      <strong className="text-slate-900 font-mono font-bold truncate block">{l.nationalId}</strong>
                    </div>
                  </div>

                  {/* Row 3: Remaining Repayment Balance Display */}
                  <div className={`p-3 rounded-xl border flex justify-between items-center ${
                    l.status === 'approved' ? 'bg-emerald-500/5 border-emerald-300/30' :
                    l.status === 'rejected' ? 'bg-slate-105 border-slate-205' :
                    'bg-amber-505 border-amber-305'
                  }`}>
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wide block">
                        Remaining Repayment Balance:
                      </span>
                      <span className={`text-xs font-mono font-black ${
                        l.status === 'approved' ? 'text-emerald-700' :
                        l.status === 'rejected' ? 'text-slate-500' :
                        'text-amber-700'
                      }`}>
                        {Math.round(remainingRepaymentBalance).toLocaleString()} ETB
                      </span>
                    </div>
                    <span className="text-[8.5px] font-black text-slate-400 font-mono">
                      {l.status === 'approved' ? 'Interest Included' : l.status === 'rejected' ? 'No Balance' : 'Est. Upon Approval'}
                    </span>
                  </div>

                  {/* Rejection / Approval Audit Note */}
                  {l.status === 'rejected' && l.rejectionReason && (
                    <div className="text-[10px] text-rose-800 font-sans leading-relaxed font-bold bg-rose-50/40 p-2.5 rounded-xl border border-rose-100">
                      Audit Notes: {l.rejectionReason}
                    </div>
                  )}

                  {/* Collapsible structured schedule for approved loans */}
                  {l.status === 'approved' && (
                    <div className="pt-1.5 flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={() => setExpandedScheduleId(expandedScheduleId === l.id ? null : l.id)}
                        className="text-[#0A3D91] hover:text-[#072A66] text-[9.5px] font-black uppercase tracking-wider font-mono flex items-center space-x-1 hover:underline cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{expandedScheduleId === l.id ? "Hide Repayments Schedule" : "Show Repayments Schedule ↗"}</span>
                      </button>

                      {expandedScheduleId === l.id && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1 space-y-2 animate-in slide-in-from-top-1">
                          <div className="flex justify-between items-center text-[8px] font-black text-slate-450 font-mono pb-1 border-b border-slate-200 uppercase tracking-widest">
                            <span>Installment / Due-Date</span>
                            <span className="text-right">Structured Instalment</span>
                          </div>
                          
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-none pr-0.5">
                            {getRepaymentSchedule(l.amount ?? 0, l.tenureMonths || 6, l.reviewedAt || l.submittedAt).map((inst) => (
                              <div key={inst.installmentNumber} className="flex justify-between items-center text-[9.5px] leading-normal font-sans p-2 bg-white rounded-lg border border-slate-150">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-[#0D2B60]">Installment {inst.installmentNumber}</span>
                                  <span className="text-[8px] text-slate-400 font-mono font-bold uppercase">{inst.dueDate}</span>
                                </div>
                                <div className="text-right flex flex-col">
                                  <span className="font-black text-[#0A3D91] font-mono">{Math.round(inst.installment).toLocaleString()} ETB</span>
                                  <span className="text-[7.5px] text-slate-450 font-mono font-medium">
                                    P: {Math.round(inst.principal).toLocaleString()} | I: {Math.round(inst.interest).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Admin Gateway Access Card */}
      {isAdmin && onAdminClick && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/20 rounded-[2rem] shadow-2xs space-y-1">
          <button
            onClick={onAdminClick}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-xs text-slate-900 font-black transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
                <Shield className="w-4.5 h-4.5 text-amber-600 fill-amber-100" />
              </div>
              <div className="text-left">
                <span className="block text-slate-950 text-[11.5px] font-black leading-none uppercase tracking-wide">Admin Control Gateway</span>
                <span className="text-[8px] text-amber-700 block tracking-widest uppercase font-mono mt-1 font-bold">Authorized portal access</span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[9.5px] font-black uppercase px-2.5 py-1.5 rounded-xl cursor-pointer shadow-xs font-semibold">
              <span>Enter Portal</span>
              <ChevronRight className="w-3 h-3 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* CARD 5: Platform Regulatory Vault Resources */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-[2rem] space-y-1 shadow-sm">
        <button
          onClick={onViewAgreements}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 text-xs text-slate-900 font-black transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-blue-100 text-[#0A3D91] rounded-xl group-hover:bg-blue-200 transition-all">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div className="text-left">
              <span className="block text-slate-950 text-[11.5px] font-black leading-none">{activeInfoTrans.agreements}</span>
              <span className="text-[8.5px] text-slate-700 block tracking-widest uppercase font-mono mt-1 font-extrabold">{activeInfoTrans.agreementsRules}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-700" />
        </button>
 
        <button
          onClick={onViewAboutUs}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 text-xs text-slate-900 font-black border-t border-slate-100 transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl group-hover:bg-rose-200 transition-all">
              <Heart className="w-4.5 h-4.5" />
            </div>
            <div className="text-left">
              <span className="block text-slate-950 text-[11.5px] font-black leading-none">{activeInfoTrans.aboutUs}</span>
              <span className="text-[8.5px] text-rose-800 block tracking-widest uppercase font-mono mt-1 font-extrabold">{activeInfoTrans.aboutUsDesc}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-700" />
        </button>
 
        <button
          onClick={onRelaunchWalkthrough}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 text-xs text-slate-900 font-black border-t border-slate-100 transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl group-hover:bg-emerald-200 transition-all">
              <Sparkles className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-slate-950 text-[11.5px] font-black leading-none">{activeInfoTrans.platformTour}</span>
              <span className="text-[8.5px] text-emerald-800 block tracking-widest uppercase font-mono mt-1 font-extrabold">{activeInfoTrans.platformTourDesc}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-700" />
        </button>
      </div>

      {/* CARD 5b: Lumora Mobile Application Portal */}
      <div className="rounded-[2.2rem] bg-white border border-slate-100 shadow-sm overflow-hidden text-left">
        {/* Toggle header button */}
        <button
          type="button"
          onClick={() => setShowPWADetails(!showPWADetails)}
          className="w-full p-6 pb-4 flex items-center justify-between hover:bg-slate-50/50 active:bg-slate-50 transition-colors text-left focus:outline-none"
        >
          <div className="flex items-center space-x-2.5 justify-start">
            <div className="p-2.5 bg-[#0A3D91]/10 text-[#0A3D91] rounded-2xl">
              <Smartphone className="w-4.5 h-4.5 text-[#0A3D91] animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-black text-sm text-[#0A3D91] uppercase tracking-wider leading-none">
                PWA Mobile Application
              </h4>
              <p className="text-[9.5px] text-slate-500 font-medium mt-1">
                {showPWADetails ? 'Click to hide details' : 'Click to view installation details'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <LumoraLogo size="xs" type="icon" />
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${showPWADetails ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showPWADetails && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-50/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Dynamic PWA Installation Action Trigger Button */}
            <div className="space-y-3 pt-1">
              {isAppInstalled ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-150 text-center space-y-1.5 animate-in fade-in">
                  <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-xl text-[9px] uppercase tracking-wider border border-emerald-300">
                    <Check className="w-3 h-3 text-emerald-600 mr-0.5" />
                    <span>✓ App Configured Successfully</span>
                  </span>
                  <p className="text-[10px] text-emerald-800 font-bold">
                    Lumora is fully set up as a standalone secure application with the custom LM Monogram icon.
                  </p>
                </div>
              ) : installStatus === 'installing' ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-center flex flex-col items-center justify-center space-y-2">
                  <span className="w-5 h-5 border-2 border-[#0A3D91] border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-[10px] font-black text-[#0A3D91] uppercase tracking-widest animate-pulse">Installing secure portal...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePWAInstall}
                  className="w-full py-3 bg-[#0A3D91] hover:bg-[#072A66] text-white transition-all active:scale-98 font-black text-[11px] rounded-xl shadow cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Install Lumora Mobile App (PWA)</span>
                </button>
              )}
            </div>

            {/* Unified Instructions - Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Chrome / Android Guide */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-left text-slate-800 font-sans text-xs">
                <p className="font-bold text-[10px] text-[#0A3D91] uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                  Chrome & Android Instructions
                </p>
                <div className="flex items-start space-x-1.5">
                  <span className="font-bold text-amber-600 shrink-0 bg-amber-50 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] border border-amber-100">1</span>
                  <span className="font-semibold leading-tight text-[10.5px]">Open inside <strong>Chrome Browser</strong> on Android or Desktop.</span>
                </div>
                <div className="flex items-start space-x-1.5">
                  <span className="font-bold text-amber-600 shrink-0 bg-amber-50 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] border border-amber-100">2</span>
                  <span className="font-semibold leading-tight text-[10.5px]">Click the <strong>"Install Lumora"</strong> button above, or Chrome's menu ⋮ symbol.</span>
                </div>
                <div className="flex items-start space-x-1.5">
                  <span className="font-bold text-amber-600 shrink-0 bg-amber-50 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] border border-amber-100">3</span>
                  <span className="font-semibold leading-tight text-[10.5px]">Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> to register the launcher icon.</span>
                </div>
              </div>

              {/* Safari / iOS Guide */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-left text-slate-800 font-sans text-xs">
                <p className="font-bold text-[10px] text-[#0A3D91] uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                  Safari & iPhone Instructions
                </p>
                <div className="flex items-start space-x-1.5">
                  <span className="font-bold text-[#0A3D91] shrink-0 bg-blue-50 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] border border-blue-100">1</span>
                  <span className="font-semibold leading-tight text-[10.5px]">Open this portal inside <strong>Safari Browser</strong> on your iPhone.</span>
                </div>
                <div className="flex items-start space-x-1.5">
                  <span className="font-bold text-[#0A3D91] shrink-0 bg-blue-50 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] border border-[#dbeafe]">2</span>
                  <span className="font-semibold leading-tight text-[10.5px]">Tap the browser's <strong>Share tool</strong> <span className="px-1 bg-slate-200 rounded text-[9px] font-bold">↑</span> on the Safari toolbar.</span>
                </div>
                <div className="flex items-start space-x-1.5">
                  <span className="font-bold text-[#0A3D91] shrink-0 bg-blue-50 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] border border-blue-100">3</span>
                  <span className="font-semibold leading-tight text-[10.5px]">Scroll down and choose <strong>"Add to Home Screen"</strong> from the list.</span>
                </div>
              </div>
            </div>

            {/* Security / Icon Fix Advice */}
            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start space-x-2 text-[#0A3D91] text-[10.5px]">
              <Info className="w-4 h-4 shrink-0 text-[#0180FE] mt-0.5" />
              <span className="font-bold leading-normal text-[#0A3D91]">
                Our live web platform supports direct secure installation. This adds the native <strong>LM branding icon</strong> straight to your home screen, skipping third-party app store latency.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CARD 6: Interactive Cashout Logger Receipts list */}
      {withdrawals.length > 0 && (
        <div className="space-y-3 px-1">
          <h4 className="font-display font-black text-xs text-slate-700 tracking-wider uppercase">
            Recent Cashout Logs ({withdrawals.length})
          </h4>
          <div className="space-y-2.5">
            {withdrawals.map((w) => (
              <div 
                key={w.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex justify-between items-center shadow-xs"
              >
                <div>
                  <h5 className="text-[12.5px] font-display font-black text-slate-950">
                    {(w.amount ?? 0).toLocaleString()} ETB
                  </h5>
                  <p className="text-[8.5px] text-slate-700 uppercase font-mono font-black mt-0.5">
                    Wire Time: {new Date(w.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-[8.5px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${
                    w.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    w.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                  }`}>
                    {w.status}
                  </span>
                  {w.status === 'rejected' && w.rejectionReason && (
                    <p className="text-[8px] text-rose-800 mt-1 max-w-[150px] truncate font-black font-sans">
                      Notes: {w.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CARD 7: Sign Out Triggers (Secondary Elegant Frame) */}
      <div className="pt-2 px-1">
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-2xl border border-rose-200/60 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-300 text-rose-600 text-xs font-black transition-all tracking-wider flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
        >
          <LogOut className="w-4 h-4 stroke-[2.5]" />
          <span>{t.logout}</span>
        </button>
      </div>

      {/* Premium Avatar Collection & Self-Photo Upload Portals Modal overlay */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-[#070d19]/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] select-none text-slate-800 animate-in fade-in duration-205">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-xl text-[#0A3D91]">
                  <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider">
                    Select Profile Photo
                  </h4>
                  <p className="text-[9px] text-slate-700 uppercase font-black tracking-widest mt-1">
                    Gallery Avatar or Custom upload
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAvatarModal(false);
                  setAvatarError('');
                }}
                className="p-1 px-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer font-black text-xs"
              >
                ✕
              </button>
            </div>

            {avatarError && (
              <p className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl font-bold font-mono">
                ⚠ {avatarError}
              </p>
            )}

            {/* Gallery Options Grid */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-[#0A3D91] uppercase tracking-widest font-mono block">
                ✦ Premium Member Avatars
              </span>
              <div className="grid grid-cols-4 gap-3">
                {galleryOptions.slice(0, 4).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectGalleryAvatar(opt.path)}
                    disabled={uploadingAvatar}
                    className="group relative flex flex-col items-center bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-2xl p-2 transition-all cursor-pointer active:scale-95 duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border-2 border-transparent group-hover:border-[#0180FE] transition-all flex items-center justify-center shrink-0">
                      <img 
                        src={opt.path} 
                        alt={opt.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[7.5px] font-bold text-slate-500 text-center truncate w-full mt-1.5 leading-none">
                      {opt.name.split(' ')[0]}
                    </span>
                    <span className="text-[7px] font-mono bg-blue-100 text-[#0A3D91] font-black px-1.5 py-0.5 rounded-full scale-90 mt-1 uppercase tracking-wide">
                      {opt.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Symbolic badging */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-black text-[#0A3D91] uppercase tracking-widest font-mono block">
                ✦ Elegant VIP Graphic Crests
              </span>
              <div className="grid grid-cols-4 gap-3">
                {galleryOptions.slice(4).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectGalleryAvatar(opt.path)}
                    disabled={uploadingAvatar}
                    className="group relative flex flex-col items-center bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-2xl p-2 transition-all cursor-pointer active:scale-95 duration-200"
                  >
                    <div className="w-13 h-13 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-transparent group-hover:border-[#0180FE] transition-all flex items-center justify-center shrink-0">
                      <img 
                        src={opt.path} 
                        alt={opt.name} 
                        className="w-full h-full object-cover scale-110" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[7.5px] font-bold text-slate-500 text-center truncate w-full mt-1.5 leading-none">
                      {opt.name.split(' ')[0]}
                    </span>
                    <span className="text-[7px] font-mono bg-amber-100 text-amber-700 font-extrabold px-1.5 py-0.5 rounded-full scale-90 mt-1 uppercase tracking-wide">
                      {opt.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Self-Photo Upload Field */}
            <div className="pt-2 border-t border-slate-100 font-sans">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest font-mono block mb-2.5">
                ✦ Upload Physical Self Photo
              </span>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4.5 bg-slate-50 hover:bg-blue-50/40 border-2 border-dashed border-slate-300 hover:border-blue-550 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition-all text-slate-900 hover:text-[#0A3D91] cursor-pointer group active:scale-98 font-bold"
              >
                <div className="p-2 bg-blue-105 group-hover:bg-blue-200 rounded-2xl transition-colors">
                  <Upload className="w-4.5 h-4.5 text-[#0A3D91]" />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-slate-900">
                    Choose Self Photo from Gallery
                  </span>
                  <span className="text-[8px] text-slate-700 font-black font-sans">
                    Supports PNG, JPG, GIF up to 5MB
                  </span>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="flex items-center space-x-1.5 justify-center text-[8.5px] text-slate-700 font-mono font-black uppercase pt-2 tracking-wider border-t border-slate-100">
              <Shield className="w-3 h-3 text-[#0180FE]" />
              <span>Identity Profile protected by sovereign secure encryptions</span>
            </div>

            {/* Spinner Loading Overlay */}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center rounded-[2.5rem] space-y-2 z-50">
                <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-[10.5px] text-slate-700 uppercase font-mono font-bold tracking-wider">
                  Syncing User Profile...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Loan Information Modal Overlay */}
      {showLoanInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-[#0A3D91]/20 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowLoanInfo(false)}
              className="absolute top-4 right-4 p-2.5 bg-slate-100 hover:bg-slate-205 text-slate-500 hover:text-slate-900 rounded-full cursor-pointer transition-all active:scale-95 border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-3 pt-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0A3D91] flex items-center justify-center mx-auto border-2 border-blue-100">
                <Info className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                  {language === 'am' ? 'የብድር መስፈርቶች መረጃ' :
                   language === 'om' ? 'Odeeffannoo Liqii' :
                   language === 'ti' ? 'ሓበሬታ ልቓሕ' :
                   language === 'so' ? 'Macluumaadka Amaahda' :
                   'Loan Authorization Guide'}
                </h3>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">
                  {language === 'am' ? 'የLUMORA የብድር ማረጋገጫ መስፈርቶች' : 'LUMORA Institutional Credit Terms'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                {language === 'am' ? 'የLUMORA የብድር አገልግሎቶች ለሁሉም ተጠቃሚዎች የብድር ማስያዣ ሳይጠይቁ በኩባንያው ፈሰስ የሚሰጡ የፋይናንስ ድጋፎች ናቸው። እነዚህን ድጋፎች በተገቢው ሁኔታ ለማቅረብና ለማስተዳደር የሚከተሉት ዋና ዋና መሥፈርቶች በጥብቅ ተፈጻሚ ይሆናሉ፡' :
                 language === 'om' ? 'Kaffaltiin liqii Lumora wabii malee dhihaata. Maamiltoonni hundi liqii herrega kana irraa argachuuf ulaagaalee armaan gadii guutuu qabu:' :
                 'LUMORA credit resources are backed by corporate liquidity reserve funds and deployed without requiring physical collateral. To safeguard secondary vaults and sustain micro-lending capabilities, the following parameters are strictly enforced:'}
              </p>

              {/* Requirement 1 */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl shrink-0 mt-0.5 font-bold text-xs uppercase font-mono">
                  VIP 3
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-wide leading-snug">
                    {language === 'am' ? 'የቪአይፒ ደረጃ 3 ወይም ከዚያ በላይ' : 'VIP Level 3 Upgrade'}
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-normal font-medium">
                    {language === 'am' ? 'ብድር ለመጠየቅ የቪአይፒ 3 ወይም ከዚያ በላይ ዕቅድ ሊኖርዎት ይገባል። ይህም ለትርፍ ማከፋፈያና ብድር አሰጣጥ ፈሰስ የሚሆን የገንዘብ መጠን ለመመደብ ይረዳል።' :
                     language === 'om' ? 'Sadarkaa VIP Level 3 ykn isaa ol qabaachuu qabdu.' :
                     'Applicants must hold an active VIP Level 3 or higher subscription plan. Upgrading to this plan allocates sufficient dynamic treasury collateral required to back the direct-wire disbursement.'}
                  </p>
                </div>
              </div>

              {/* Requirement 2 */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-wide leading-snug">
                    {language === 'am' ? 'የማንነት ማረጋገጫ (ID Verified)' : 'National ID Auditing & KYC'}
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-normal font-medium">
                    {language === 'am' ? 'የእርስዎ ብሔራዊ መታወቂያ መረጃ ደህንነት ኦዲት ተደርጎ "የተረጋገጠ" (Verified) መሆን አለበት። ይህም የፋይናንስ ተገዢነት ደንቦችን ለማሟላት ወሳኝ ነው።' :
                     language === 'om' ? 'Waraqaan eenyummaa keessan mirkanaa\'uu qaba.' :
                     'Your profile status must carry the verified ID badge. Security agents and automated ledger audits check valid National ID indices to ensure strict regulatory compliance before release.'}
                  </p>
                </div>
              </div>

              {/* Status Display Info */}
              <div className="p-3 bg-blue-50/40 rounded-2xl border border-blue-105 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-550 font-extrabold uppercase tracking-wide block">
                    {language === 'am' ? 'የእርስዎ አሁን ያለው ሁኔታ ፡' : 'Your Eligibility Status:'}
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-[10.5px] font-bold text-slate-900 font-mono">
                      VIP {profile.vipLevel}
                    </span>
                    <span className="text-[10px] text-slate-350">•</span>
                    <span className={`text-[10px] font-extrabold uppercase font-mono ${
                      profile.idVerificationStatus === 'verified' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {profile.idVerificationStatus || 'Unsubmitted'}
                    </span>
                  </div>
                </div>

                <div className={`px-2.5 py-1.5 rounded-xl border text-[9.5px] font-black uppercase tracking-wider ${
                  profile.vipLevel >= 3 && profile.idVerificationStatus === 'verified' 
                    ? 'bg-emerald-100 border-emerald-200 text-emerald-800' 
                    : 'bg-amber-100 border-amber-200 text-amber-800'
                }`}>
                  {profile.vipLevel >= 3 && profile.idVerificationStatus === 'verified' ? '✓ Eligible' : '✗ Locked'}
                </div>
              </div>

            </div>

            <button
              onClick={() => setShowLoanInfo(false)}
              className="w-full py-3 bg-[#0A3D91] hover:bg-[#06245c] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border-2 border-[#0A3D91]"
            >
              {language === 'am' ? 'እሺ ገብቶኛል' : 'Acknowledge Guide'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
