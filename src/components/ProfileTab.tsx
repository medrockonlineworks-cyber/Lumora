import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Shield, Coins, Heart, LogOut, ArrowUpRight, 
  ArrowDownRight, Users, Copy, Key, Camera, FileText, Check,
  X, Sparkles, Upload, ChevronRight, ChevronDown, Globe, Info, CreditCard,
  Smartphone, Download, ExternalLink, QrCode, Monitor, Share2, Trophy,
  Eye, EyeOff, Lock, ShieldAlert, RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage, LanguageCode, languages } from '../locale';
import { Profile, Withdrawal, Loan, Referral, Investment, Deposit } from '../types';
import LoanCalculator from './LoanCalculator';
import LumoraLogo from './LumoraLogo';
import LumoraStamp from './LumoraStamp';

import avatarMaleInvestor from '../assets/images/avatar_male_investor_1780743569199.png';
import avatarFemaleExecutive from '../assets/images/avatar_female_executive_1780743584261.png';
import avatarTechAnalyst from '../assets/images/avatar_tech_analyst_1780743599314.png';
import avatarSeniorAdvisor from '../assets/images/avatar_senior_advisor_1780743613602.png';

interface ProfileTabProps {
  profile: Profile;
  todayEarnings?: number;
  withdrawals: Withdrawal[];
  deposits: Deposit[];
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
  investments?: Investment[];
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

const getVipBadgeDetails = (level: number) => {
  if (level === 0) {
    return {
      text: 'Basic',
      bgColor: 'bg-slate-100 border-slate-200 text-slate-600',
      iconEmoji: '✨',
      glowClass: ''
    };
  }
  
  const colors: Record<number, { text: string; bgColor: string; iconEmoji: string; glowClass: string }> = {
    1: { text: 'VIP 1 Copper', bgColor: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white border-amber-300', iconEmoji: '🥉', glowClass: 'shadow-amber-500/25' },
    2: { text: 'VIP 2 Bronze', bgColor: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-500', iconEmoji: '🥈', glowClass: 'shadow-amber-600/30' },
    3: { text: 'VIP 3 Silver', bgColor: 'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 text-white border-slate-250', iconEmoji: '🥇', glowClass: 'shadow-slate-400/25' },
    4: { text: 'VIP 4 Gold', bgColor: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-650 text-slate-950 border-yellow-300', iconEmoji: '🔑', glowClass: 'shadow-yellow-550/30' },
    5: { text: 'VIP 5 Sapphire', bgColor: 'bg-gradient-to-r from-teal-400 to-emerald-600 text-white border-teal-300', iconEmoji: '💼', glowClass: 'shadow-teal-500/25' },
    6: { text: 'VIP 6 Cobalt', bgColor: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-600 text-white border-blue-300', iconEmoji: '🔹', glowClass: 'shadow-blue-500/30' },
    7: { text: 'VIP 7 Ruby', bgColor: 'bg-gradient-to-r from-rose-500 via-pink-600 to-red-650 text-white border-rose-300', iconEmoji: '🎈', glowClass: 'shadow-rose-500/30' },
    8: { text: 'VIP 8 Emerald', bgColor: 'bg-gradient-to-r from-emerald-500 via-green-600 to-teal-750 text-white border-emerald-300', iconEmoji: '🟢', glowClass: 'shadow-emerald-500/30' },
    9: { text: 'VIP 9 Amethyst', bgColor: 'bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-850 text-white border-purple-300', iconEmoji: '🔮', glowClass: 'shadow-purple-500/30' },
    10: { text: 'VIP 10 Diamond', bgColor: 'bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 text-white border-cyan-200', iconEmoji: '💎', glowClass: 'shadow-cyan-400/40' },
    11: { text: 'VIP 11 Platinum', bgColor: 'bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500 text-slate-900 border-white', iconEmoji: '💍', glowClass: 'shadow-slate-300/40' },
    12: { text: 'VIP 12 Crown', bgColor: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-650 text-white border-yellow-200', iconEmoji: '👑', glowClass: 'shadow-orange-500/40' },
    13: { text: 'VIP 13 Imperial', bgColor: 'bg-gradient-to-r from-red-500 via-purple-600 to-indigo-900 text-white border-red-300', iconEmoji: '🏛️', glowClass: 'shadow-purple-600/50' },
    14: { text: 'VIP 14 Royal Sovereign', bgColor: 'bg-gradient-to-r from-amber-400 via-rose-500 to-violet-750 text-white border-amber-200', iconEmoji: '⚜️', glowClass: 'shadow-rose-500/60' },
    15: { text: 'VIP 15 Ultimate Sovereign', bgColor: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600 text-slate-950 border-amber-200', iconEmoji: '🪐', glowClass: 'shadow-amber-400/70' }
  };
  
  return colors[level] || {
    text: `VIP ${level}`,
    bgColor: 'bg-gradient-to-r from-slate-800 to-slate-950 text-white border-slate-700',
    iconEmoji: '🛡️',
    glowClass: 'shadow-black/20'
  };
};

export default function ProfileTab({ 
  profile, 
  todayEarnings,
  withdrawals, 
  deposits = [],
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
  showAdmin,
  investments = []
}: ProfileTabProps) {
  const { language, setLanguage, t, et } = useLanguage();
  const isQuotaExceeded = typeof window !== "undefined" && localStorage.getItem("lumora_firestore_client_disabled") === "true";

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleAppReset = async () => {
    setResetting(true);
    setResetError('');
    try {
      if (isAdmin) {
        await fetch('/api/admin/reset-system', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        await fetch('/api/admin/reset-firestore-quota', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        const response = await fetch('/api/user/reset-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: profile.userId })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to reset account.");
        }
      }
      localStorage.clear();
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("System reset failed:", err);
      setResetError(err instanceof Error ? err.message : 'System reset failed');
      setResetting(false);
    }
  };

  const activeInvestments = (investments || []).filter(i => i.status === 'active');
  const highestActiveLevel = activeInvestments.length > 0
    ? Math.max(...activeInvestments.map(i => i.planLevel))
    : 0;
  const vipBadge = getVipBadgeDetails(highestActiveLevel);

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

  const prepaidCardTrans = {
    en: {
      title: "LUMORA Prepaid Mastercard",
      subtitle: "Global Financial Freedom",
      comingSoon: "Coming Soon • Q3 2026",
      featuresTitle: "Card Privileges & Perks",
      feature1: "CBE Direct Funding",
      feature1Desc: "Instantly load your prepaid card from your deposit or income pool with zero delay.",
      feature2: "Zero Markups on FX",
      feature2Desc: "VIP tier members pay 0% foreign exchange transaction markups globally.",
      feature3: "International Outlet Access",
      feature3Desc: "Universally accepted on Amazon, ChatGPT Plus, Netflix, Google Ads, and Apple Store.",
      betaRegistry: "Sovereign Beta Access Program",
      queuePos: "You are registered in the priority waitlist.",
      queueBadge: "Priority Slot #184",
      virtualCard: "Premium Virtual & Physical Metal Options",
    },
    am: {
      title: "LUMORA የቅድመ-ክፍያ ማስተርካርድ",
      subtitle: "ዓለም አቀፍ የፋይናንስ ነፃነት",
      comingSoon: "በቅርቡ ይጠብቁ • Q3 2026",
      featuresTitle: "የካርድ ልዩ ጥቅማጥቅሞች",
      feature1: "ከCBE ቀጥታ የገንዘብ ማስተላለፍ",
      feature1Desc: "በPlatform የሰበሰቡትን የETB ትርፍ በቀጥታ ወደ ካርድዎ ያለ ምንም መዘግየት ያስተላልፉ።",
      feature2: "የውጭ ምንዛሪ ክፍያ 0%",
      feature2Desc: "የቪአይፒ አባላት የውጭ ምንዛሪ ክፍያዎችን ያለ ምንም ተጨማሪ ተመን መፈፀም ይችላሉ።",
      feature3: "ዓለም አቀፍ የክፍያ ተቀባይነት",
      feature3Desc: "በአማዞን፣ ChatGPT፣ Netflix፣ የማስታወቂያ መድረኮች እና ሌሎች ላይ በሰፊው የሚሰራ።",
      betaRegistry: "የሉሞራ ቅድመ-ይሁንታ ፕሮግራም",
      queuePos: "በቅድሚያ ተጠባባቂ ዝርዝር ውስጥ በተሳካ ሁኔታ ተመዝግበዋል።።",
      queueBadge: "የማዕረግ ቦታ #184",
      virtualCard: "ምናባዊ እና እውነተኛ የብረት ካርዶች",
    },
    ti: {
      title: "LUMORA ቅድመ-ኽፍሊት ማስተርካርድ",
      subtitle: "ዓለማዊ ናይ ፋይናንስ ናጽነት",
      comingSoon: "ብቕልጡፍ ክመጽእ እዩ • Q3 2026",
      featuresTitle: "ናይዚ ካርድ ፍሉይ ረብሓታት",
      feature1: "ምስ CBE ቀጥታ ምስግጋር",
      feature1Desc: "ናይ ETB እቶትካ ብቐጥታ ናብ ካርድካ ብዘይካ ዝኾነ ምድንጓይ ኣእቱ።",
      feature2: "ናይ ሸረፍ ኮሚሽን 0%",
      feature2Desc: "ኣባላት ቪአይፒ ብዘይካ ዝኾነ ተወሳኺ ክፍሊት ኣህጉራዊ ክፍሊታት ይፍጽሙ።",
      feature3: "ኣህጉራዊ ናይ ክፍሊት ተቐባልነት",
      feature3Desc: "ኣብ Amazon, ChatGPT, Netflix, መወዓውዒታትን ካልኦትን ብቐሊሉ ዝሰርሕ።",
      betaRegistry: "ናይ ሉሞራ ቅድመ-ይሁንታ መደብ",
      queuePos: "ኣብ መሪሕነት ተጸባዩ መዝገብ ብዓወት ተመዝጊብካ ኣለኻ።",
      queueBadge: "ናይ ቅድም ቦታ #184",
      virtualCard: "ቪርችዋልን ናይ ሓቀኛ ብረትን ምርጫታት",
    },
    om: {
      title: "LUMORA Prepaid Mastercard",
      subtitle: "Bilisummaa Finansii Addunyaa",
      comingSoon: "Dhiyeenyatti • Q3 2026",
      featuresTitle: "Faayidaalee fi Mirga Kaardichaa",
      feature1: "CBE irraa Kallattiin Guutuu",
      feature1Desc: "Bilbaloota dakhlii keessan kan ETB kallattiin gara valyutoota addunyaatti jijjiiraa.",
      feature2: "Kaffaltii FX 0% VIP",
      feature2Desc: "Miseensonni VIP kaffaltii jijjiirraa maallaqa alaa irratti dabalata 0% kaffalu.",
      feature3: "Fasiliitii Kaffaltii Addunyaa",
      feature3Desc: "Amazon, ChatGPT, Netflix, seektaroota beeksisaa fi kkf irratti fudhatama kan qabu.",
      betaRegistry: "Sagantaa Beta Access Lumora",
      queuePos: "Tarree eeggannoo dursa qabu irratti milkiidhaan galmaa'aniittu.",
      queueBadge: "Sloota Dursa #184",
      virtualCard: "Filannoo Kaardii Virtuwalii fi Metalii Qubannaa",
    },
    so: {
      title: "LUMORA Prepaid Mastercard",
      subtitle: "Xorriyadda Maaliyadeed ee Caalamiga ah",
      comingSoon: "Dhowan • Q3 2026",
      featuresTitle: "Mudnaanta & Faa'iidooyinka Kaarka",
      feature1: "Ku Shubashada Tooska ah ee CBE",
      feature1Desc: "Si degdeg ah ugu beddel dakhligaaga ETB ee Lumora dheelitirka caalamiga ah.",
      feature2: "Heerka 0% ee Beddelka Lacagta",
      feature2Desc: "Xubnaha VIP-da ma bixiyaan kharash dheeri ah marka ay adeegsanayaan lacagaha qalaad.",
      feature3: "Ganacsiyada Caalamiga ah",
      feature3Desc: "Si weyn looga aqbalay Amazon, ChatGPT, Netflix, baraha xayeysiiska iyo kuwo kale.",
      betaRegistry: "Barnaamijka Helitaanka Gaarka ah ee Lumora",
      queuePos: "Waxaad si guul leh ugu diiwaangashan tahay liiska sugitaanka mudnaanta.",
      queueBadge: "Priority Slot #184",
      virtualCard: "Ikhtiyaarada Kaarka Virtual-ka iyo Birta Adag",
    }
  };

  const activeInfoTrans = infoSectionTrans[language as LanguageCode] || infoSectionTrans.en;
  const cardTrans = prepaidCardTrans[language as LanguageCode] || prepaidCardTrans.en;

  const [pinValue, setPinValue] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);
  const [linkCopyStatus, setLinkCopyStatus] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [isPrepaidCardFlipped, setIsPrepaidCardFlipped] = useState(false);
  const [showReferralList, setShowReferralList] = useState(true);
  const [showLoanSimulator, setShowLoanSimulator] = useState(true);

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
  const [activeLedgerTab, setActiveLedgerTab] = useState<'deposits' | 'cashouts'>('deposits');
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

  // User Password Change States
  const [showInvitationNetwork, setShowInvitationNetwork] = useState(false);
  const [showLiquidityLoan, setShowLiquidityLoan] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showFinancialRecords, setShowFinancialRecords] = useState(false);
  const [selectedLedgerType, setSelectedLedgerType] = useState<'deposits' | 'withdrawals'>('deposits');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(
        language === 'am' ? 'እባክዎ ሁሉንም መስኮች ይሙሉ' :
        language === 'om' ? 'Maaloo goonlee hunda guuti' :
        language === 'ti' ? 'በጃኹም ኩሎም ቦታታት መልኡ' :
        language === 'so' ? 'Fadlan buuxi dhammaan meelaha' :
        'All password fields are required.'
      );
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 32) {
      setPasswordError(
        language === 'am' ? 'አዲሱ ይለፍ ቃል ከ6 እስከ 32 ቁምፊዎች መሆን አለበት' :
        language === 'om' ? 'Iccitiin haaraa 6 hanga 32 ta\'uu qaba' :
        language === 'ti' ? 'ሓዱሽ ይለፍ ቃል ካብ 6 ክሳብ 32 ፊደላት ክኸውን ኣለዎ' :
        language === 'so' ? 'Koodhka cusub waa inuu u dhexeeyaa 6 ilaa 32 xaraf' :
        'New password must be between 6 and 32 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        language === 'am' ? 'አዲሱ ይለፍ ቃል ከተረጋገጠው ጋር አይዛመድም' :
        language === 'om' ? 'Jechi iccitii wal hin fudhatu' :
        language === 'ti' ? 'ተደራቢ ይለፍ ቃል ኣይተሰማምዐን' :
        language === 'so' ? 'Koodhadhka sirta ah isma laha' :
        'New passwords do not match.'
      );
      return;
    }

    setSubmittingPassword(true);
    try {
      const response = await fetch('/api/profiles/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.userId,
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setPasswordError(
          data.error || 
          (language === 'am' ? 'ይለፍ ቃል መቀየር አልተሳካም። እባክዎ የአሁኑን ይለፍ ቃል ያረጋግጡ።' : 'Failed to update password. Please check your current password.')
        );
      } else {
        setPasswordSuccess(
          language === 'am' ? 'ይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል!' :
          language === 'om' ? 'Iccitiin keessan milkiin geeddaramaniiru!' :
          language === 'ti' ? 'ይለፍ ቃልኩም ብዓወት ተቐይሩ ኣሎ!' :
          language === 'so' ? 'Koodhkaaga sirta ah si guul leh ayaa loo beddelay!' :
          'Your password has been changed successfully!'
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setPasswordError(
        language === 'am' ? 'የኔትወርክ ስህተት አጋጥሟል። እባክዎ እንደገና ይሞክሩ።' : 'Network error changing login credentials.'
      );
    } finally {
      setSubmittingPassword(false);
    }
  };

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
      path: avatarMaleInvestor,
      badge: 'PRO'
    },
    {
      id: 'avatar_female_executive',
      name: 'Sovereign Portfolio Partner',
      path: avatarFemaleExecutive,
      badge: 'PRESTIGE'
    },
    {
      id: 'avatar_tech_analyst',
      name: 'Quantum Systems Analyst',
      path: avatarTechAnalyst,
      badge: 'FINTECH'
    },
    {
      id: 'avatar_senior_advisor',
      name: 'Senior Board Advisor',
      path: avatarSeniorAdvisor,
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
    
    if (profile.vipLevel < 4) {
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

    const cleanNationalId = nationalId.trim().replace(/[-\s]/g, '');
    const isSixteenDigits = /^\d{16}$/.test(cleanNationalId);
    if (!isSixteenDigits) {
      setLoanError('The National ID / FAN registration number must be exactly 16 digits (e.g. 8989898911899987). It cannot be less than or more than 16 digits.');
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

  const compressImageBase64 = (base64Str: string, maxWidth = 256, maxHeight = 256): Promise<string> => {
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
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
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
          const compressed = await compressImageBase64(base64);
          const result = await onUploadAvatar(compressed);
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
      
      {/* Dynamic Firestore Quota Warning & Recovery Console for Users */}
      {isQuotaExceeded && (
        <div className="p-4 rounded-[1.8rem] bg-amber-50/70 border border-amber-200 flex items-start space-x-3 font-sans shadow-xs animate-fade-in" id="user-quota-warning-banner">
          <div className="p-2 bg-amber-100/80 text-amber-800 rounded-xl mt-0.5 shrink-0 animate-pulse animate-duration-2000">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
              Network Resiliency Model Enabled
            </h4>
            <p className="text-[10px] text-amber-800/95 font-medium leading-relaxed">
              We are currently optimizing cloud data servers. Lumora is running smoothly in **High-Speed local sandbox mode**. 
              Your active investments, loans, and wallet actions remain completely functional, secure, and saved. 
              Normal sync will resume shortly.
            </p>
          </div>
        </div>
      )}

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
          <div className="relative">
            <div 
              onClick={() => setShowAvatarModal(true)}
              className="relative w-24 h-24 rounded-[1.8rem] border-4 border-white bg-slate-50 overflow-hidden flex items-center justify-center shadow-xl group cursor-pointer active:scale-95 transition-transform"
            >
              {profile.profilePicture || profile.idSelfie ? (
                <img 
                   src={profile.profilePicture || profile.idSelfie} 
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

            {/* Premium Dynamic VIP Level Badge based on highest active investment */}
            <div 
              className={`absolute -bottom-1 -right-2 z-20 flex items-center space-x-1.5 px-3 py-1 text-[9.5px] font-black rounded-2xl border shadow-lg ${vipBadge.bgColor} ${vipBadge.glowClass} leading-none transform hover:scale-105 transition-all duration-200 cursor-default select-none`}
              title={`${vipBadge.text} - Highest Active Investment`}
            >
              <span className="text-xs">{vipBadge.iconEmoji}</span>
              <span className="uppercase tracking-widest font-sans">VIP {highestActiveLevel}</span>
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
            ) : profile.idVerificationStatus === 'skipped' ? (
              <div className="inline-flex flex-col items-center space-y-2 max-w-[280px] p-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-350 text-[9px] font-extrabold uppercase tracking-widest font-sans">
                  <span>ID Verification Skipped</span>
                </div>
                <p className="text-[9px] text-amber-900 leading-normal font-sans font-bold text-center">
                  You requested to skip ID upload during onboarding. Under compliance rules, you can enjoy Starter Level benefits. Submitting a National ID is required when you want to upgrade plans or apply for loans.
                </p>
                <button
                  onClick={handleReSubmitId}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-transform active:scale-95 text-center mt-1"
                >
                  Verify ID &amp; Unlock Upgrades
                </button>
              </div>
            ) : null}
          </div>

          {/* Member Level Badge details */}
          <div className="pt-3">
            <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-2xl bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest font-sans">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>
                {language === 'am' ? (profile.vipLevel === 1 ? "ዕጩ ጀማሪ አባል" : `ከፍተኛ ደረጃ ቪአይፒ ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0} አባል`) :
                 language === 'om' ? (profile.vipLevel === 1 ? "STARTER MEMBER" : `SADARKAA OLAANAA VIP ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0} SECTOR`) :
                 language === 'ti' ? (profile.vipLevel === 1 ? "ጀማሪ ኣባል" : `ላዕለዋይ ሰንሰለት ቪአይፒ ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0} ኣባል`) :
                 language === 'so' ? (profile.vipLevel === 1 ? "XUBINTA BILOWGA AH" : `VIP-KA HEERKA SARE ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0} XUBIN`) :
                 (profile.vipLevel === 1 ? "STARTER LEVEL MEMBER" : `PEAK LEVEL VIP ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0} MEMBER`)}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ADMIN CONSOLE ENTRY BANNER */}
      {isAdmin && (
        <div className="px-1" id="premium-admin-shuttle-link">
          <button
            onClick={onAdminClick}
            className="w-full bg-gradient-to-r from-[#0A3D91] via-[#1E40AF] to-[#1D4ED8] hover:from-blue-800 hover:to-blue-700 active:scale-98 text-white p-5 rounded-[2rem] border border-blue-500/35 shadow-lg relative overflow-hidden transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            {/* Ambient Background Glow Particles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-6 group-hover:scale-110 transition-transform"></div>
            
            <div className="flex items-center space-x-3.5 relative z-10">
              <div className="p-3 rounded-2xl bg-white/12 border border-white/20 text-yellow-300">
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="p-0.5 px-2 bg-yellow-400 text-slate-900 rounded-full text-[8px] font-mono font-black uppercase tracking-wider">SYSTEM ADMIN</span>
                  <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest font-mono">ROOT PRIVILEGES</span>
                </div>
                <h4 className="font-display font-black text-sm uppercase tracking-wide text-white mt-1">TREASURY AUDITING CONSOLE</h4>
                <p className="text-[10px] text-blue-150 leading-none mt-0.5 font-medium">Verify submissions, clearing ledger, verify custom bank rails.</p>
              </div>
            </div>

            <div className="bg-white/10 p-2 rounded-xl border border-white/20 text-white relative z-10 group-hover:bg-[#0A3D91] transition-colors">
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </button>
        </div>
      )}

      {/* Collapsible panel for Invitation Network relocated to resource list */}

      {/* Collapsible panel for Liquidity Loans relocated to resource list */}
      {false && (
        <>
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
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[8.5px] inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-800 font-black px-2.5 py-1 rounded-xl uppercase tracking-wider hidden sm:inline-flex">
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

            <button
              type="button"
              onClick={() => setShowLoanSimulator(!showLoanSimulator)}
              className="p-1.5 px-2.5 hover:bg-slate-55 border border-slate-205 text-slate-700 hover:text-slate-900 rounded-xl transition-all text-[9.5px] font-black uppercase tracking-wider cursor-pointer flex items-center space-x-1 shrink-0 select-none"
            >
              <span>
                {showLoanSimulator 
                  ? (language === 'am' ? 'ደብቅ' : language === 'om' ? 'Dhoksi' : language === 'ti' ? 'ሕባእ' : language === 'so' ? 'Qari' : 'Hide')
                  : (language === 'am' ? 'አሳይ' : language === 'om' ? 'Agarsiisi' : language === 'ti' ? 'ኣርኢ' : language === 'so' ? 'Tus' : 'Show')}
              </span>
              {showLoanSimulator ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {showLoanSimulator && (
          <>
 
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
            isEligible={profile.vipLevel >= 4 && profile.idVerificationStatus === 'verified'}
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
            {/* Condition 1: VIP 4+ (VIP 3+) */}
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              profile.vipLevel >= 4 
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50/60 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-base font-black ${profile.vipLevel >= 4 ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`}>
                  {profile.vipLevel >= 4 ? "✓" : "✗"}
                </span>
                <span className="text-[10.5px] font-bold">
                  {language === 'am' ? 'ቪአይፒ ደረጃ 3 ወይም ከዚያ በላይ መሆን' : 'Active Plan Level: VIP Level 3+'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-white border">
                {profile.vipLevel === 1 ? "Starter" : `VIP ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0}`} / 3
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
              profile.vipLevel >= 4 && profile.idVerificationStatus === 'verified'
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                : 'bg-amber-100 border-amber-200 text-amber-800'
            }`}>
              {profile.vipLevel >= 4 && profile.idVerificationStatus === 'verified' 
                ? (language === 'am' ? '✓ ብቁ ነዎት' : '✓ Fully Eligible') 
                : (language === 'am' ? '✗ የታገደ' : '✗ Authorization Pending')
              }
            </span>
          </div>
        </div>

        {profile.vipLevel < 4 ? (
          <div className="p-5 bg-amber-50/75 rounded-[1.80rem] border border-amber-200 text-center space-y-3 font-sans">
            <span className="text-[9px] bg-amber-200/70 text-[#925c0e] font-extrabold uppercase py-1 px-4 rounded-xl border border-amber-300">
              Loan Feature Locked
            </span>
            <p className="text-[11px] text-amber-900 leading-relaxed font-bold max-w-sm mx-auto">
              Sovereign loan request portal is closed. Loan services are available only for members who have reached VIP Level 3 or higher. Current level: <strong>{profile.vipLevel === 1 ? "Starter Level" : `VIP ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0}`}</strong>.
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
          </>
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
        </>
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

        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 text-xs text-slate-900 font-black border-t border-slate-100 transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-blue-100 text-[#0A3D91] rounded-xl group-hover:bg-blue-200 transition-all">
              <Lock className="w-4.5 h-4.5 text-blue-800" />
            </div>
            <div className="text-left">
              <span className="block text-slate-950 text-[11.5px] font-black leading-none">
                {language === 'am' ? 'የይለፍ ቃል ቅንብር' :
                 language === 'om' ? 'Qindaa’ina Iccitii' :
                 language === 'ti' ? 'ንደሕንነት የሕድስዎ' :
                 language === 'so' ? 'Nidaamka koodhka' :
                 'Password Settings'}
              </span>
              <span className="text-[8.5px] text-blue-800 block tracking-widest uppercase font-mono mt-1 font-extrabold">
                {language === 'am' ? 'ይለፍ ቃልዎን እዚህ ይቀይሩ' :
                 language === 'om' ? 'Iccitii keessan asitti jijjiiraa' :
                 language === 'ti' ? 'ይለፍ ቃልኩም ኣብዚ ቀይሩ' :
                 language === 'so' ? 'Beddel koodhkaaga sirta ah' :
                 'Update secure password'}
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-700 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
        </button>

        {showPasswordForm && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-2 space-y-4 font-sans text-left">
            <h4 className="font-display font-black text-[11px] text-[#0A3D91] uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-[#0A3D91]" />
              <span>
                {language === 'am' ? 'የይለፍ ቃልዎን ይቀይሩ' : 'Modify Account Password'}
              </span>
            </h4>

            <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(e); }} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-[10px] font-black text-rose-800 leading-normal flex items-start space-x-2 animate-pulse">
                  <span className="shrink-0">⚠</span>
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-[10px] font-black text-emerald-800 leading-normal flex items-start space-x-2">
                  <span className="shrink-0">✓</span>
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-[8.5px] text-[#0A3D91] block uppercase font-sans font-black tracking-widest pl-1">
                  {language === 'am' ? 'የአሁኑ ይለፍ ቃል' : 'Current Password'}
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type={showPwdCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={language === 'am' ? 'የአሁኑን ይለፍ ቃል ያስገቡ' : 'Enter current password'}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdCurrent(!showPwdCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer p-0.5"
                  >
                    {showPwdCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[8.5px] text-[#0A3D91] block uppercase font-sans font-black tracking-widest pl-1">
                  {language === 'am' ? 'አዲስ ይለፍ ቃል' : 'New Password (min 6 chars)'}
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type={showPwdNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={language === 'am' ? 'አዲስ ጠንካራ ይለፍ ቃል ያስገቡ' : 'Enter new password'}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdNew(!showPwdNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer p-0.5"
                  >
                    {showPwdNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[8.5px] text-[#0A3D91] block uppercase font-sans font-black tracking-widest pl-1">
                  {language === 'am' ? 'አዲሱን ይለፍ ቃል ያረጋግጡ' : 'Confirm New Password'}
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type={showPwdConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={language === 'am' ? 'አዲሱን ይለፍ ቃል ደግመው ያስገቡ' : 'Re-type new password'}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer p-0.5"
                  >
                    {showPwdConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPassword}
                className="w-full py-3 bg-gradient-to-r from-[#0A3D91] to-[#1D4ED8] hover:from-blue-800 hover:to-blue-700 disabled:opacity-50 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl shadow-xs cursor-pointer transition-all active:scale-98 text-center flex items-center justify-center space-x-1.5"
              >
                {submittingPassword ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Key className="w-3 h-3" />
                    <span>
                      {language === 'am' ? 'ይለፍ ቃል ቀይር' : 'Change Password'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setShowFinancialRecords(!showFinancialRecords)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 text-xs text-slate-900 font-black border-t border-slate-100 transition-all cursor-pointer group animate-fade-in"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-amber-200 transition-all">
              <Coins className="w-4.5 h-4.5 text-amber-700" />
            </div>
            <div className="text-left">
              <span className="block text-slate-950 text-[11.5px] font-black leading-none">
                {language === 'am' ? 'የፋይናንስ መዝገቦች' :
                 language === 'om' ? 'Galmeewwan Faayinaansii' :
                 language === 'ti' ? 'ፋይናንሳዊ መዛግብቲ' :
                 language === 'so' ? 'Diiwaanada Maaliyadda' :
                 'Financial Records'}
              </span>
              <span className="text-[8.5px] text-amber-800 block tracking-widest uppercase font-mono mt-1 font-extrabold">
                {language === 'am' ? 'ገቢዎችና ወጪዎች' :
                 language === 'om' ? 'Galii fi Baasii' :
                 language === 'ti' ? 'እቶትን ወጻእን' :
                 language === 'so' ? 'Dhigashada & Qaadashada' :
                 'Deposits & Withdrawals'}
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-700 transition-transform duration-200 ${showFinancialRecords ? 'rotate-90' : ''}`} />
        </button>

        {showFinancialRecords && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-2 space-y-4 font-sans text-left animate-in fade-in duration-200">
            <h4 className="font-display font-black text-[11px] text-[#0A3D91] uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Coins className="w-3.5 h-3.5 text-[#0A3D91]" />
                <span>
                  {language === 'am' ? 'የገንዘብ እንቅስቃሴ ታሪክ' : 'Transaction Ledgers'}
                </span>
              </div>
            </h4>

            {/* Sub-tabs: Deposits and Withdrawals */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedLedgerType('deposits')}
                className={`py-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center ${
                  selectedLedgerType === 'deposits'
                    ? 'bg-[#0A3D91] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 bg-transparent'
                }`}
              >
                {language === 'am' ? 'የተቀማጭ መዝገብ' : 'Deposit Records'} ({deposits.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedLedgerType('withdrawals')}
                className={`py-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center ${
                  selectedLedgerType === 'withdrawals'
                    ? 'bg-[#0A3D91] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 bg-transparent'
                }`}
              >
                {language === 'am' ? 'የወጪ መዝገብ' : 'Withdrawal Records'} ({withdrawals.length})
              </button>
            </div>

            {/* Filter Row: All, Pending, Approved, Rejected */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {['all', 'pending', 'approved', 'rejected'].map((status) => {
                const isActive = ledgerStatusFilter === status;
                let count = 0;
                if (selectedLedgerType === 'deposits') {
                  count = status === 'all' ? deposits.length : deposits.filter(d => d.status === status).length;
                } else {
                  count = status === 'all' ? withdrawals.length : withdrawals.filter(w => w.status === status).length;
                }

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setLedgerStatusFilter(status as any)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isActive
                        ? status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-3xs'
                        : status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-3xs'
                        : status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-3xs'
                        : 'bg-slate-800 text-white border-slate-800 shadow-3xs'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span>{status}</span>
                    <span className="bg-slate-950/5 px-1 py-0.5 rounded text-[8px] font-black">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Render items based on chosen subtab and filter status */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
              {selectedLedgerType === 'deposits' ? (
                (() => {
                  const items = deposits.filter((d) => ledgerStatusFilter === 'all' || d.status === ledgerStatusFilter);
                  if (items.length === 0) {
                    return (
                      <div className="p-6 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center text-center">
                        <Coins className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
                        <p className="text-[10px] text-slate-700 uppercase font-bold tracking-wider">No matching deposits found</p>
                      </div>
                    );
                  }
                  return items.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex justify-between items-center shadow-3xs relative overflow-hidden"
                    >
                      {d.status === 'approved' && (
                        <div className="absolute right-[24%] top-[-4px] opacity-100 pointer-events-none z-0 transform scale-75 origin-top-right select-none">
                          <LumoraStamp text="APPROVED" variant="green" size="xs" tilted={true} highContrast={true} />
                        </div>
                      )}
                      {d.status === 'rejected' && (
                        <div className="absolute right-[24%] top-[-4px] opacity-100 pointer-events-none z-0 transform scale-75 origin-top-right select-none">
                          <LumoraStamp text="REJECTED" variant="rose" size="xs" tilted={true} highContrast={true} />
                        </div>
                      )}

                      <div className="relative z-10 text-left">
                        <h5 className="text-[11px] font-display font-black text-slate-950">
                          {(d.amount ?? 0).toLocaleString()} ETB
                        </h5>
                        <p className="text-[8px] text-slate-700 uppercase font-mono font-black mt-0.5">
                          Time: {new Date(d.submittedAt).toLocaleDateString()}
                        </p>
                        {d.bankReference && (
                          <p className="text-[7.5px] text-[#0180FE] font-mono font-black mt-1 select-all">
                            Ref: {d.bankReference}
                          </p>
                        )}
                      </div>
                      <div className="text-right relative z-10 font-sans">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          d.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          d.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                        }`}>
                          {d.status}
                        </span>
                        {d.status === 'rejected' && d.rejectionReason && (
                          <p className="text-[7.5px] text-rose-800 mt-1 max-w-[120px] truncate font-black font-sans">
                            Notes: {d.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  ));
                })()
              ) : (
                (() => {
                  const items = withdrawals.filter((w) => ledgerStatusFilter === 'all' || w.status === ledgerStatusFilter);
                  if (items.length === 0) {
                    return (
                      <div className="p-6 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center text-center">
                        <ArrowUpRight className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
                        <p className="text-[10px] text-slate-700 uppercase font-bold tracking-wider">No matching withdrawals found</p>
                      </div>
                    );
                  }
                  return items.map((w) => (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex justify-between items-center shadow-3xs relative overflow-hidden"
                    >
                      {w.status === 'approved' && (
                        <div className="absolute right-[24%] top-[-4px] opacity-100 pointer-events-none z-0 transform scale-75 origin-top-right select-none">
                          <LumoraStamp text="APPROVED" variant="green" size="xs" tilted={true} highContrast={true} />
                        </div>
                      )}
                      {w.status === 'rejected' && (
                        <div className="absolute right-[24%] top-[-4px] opacity-100 pointer-events-none z-0 transform scale-75 origin-top-right select-none">
                          <LumoraStamp text="REJECTED" variant="rose" size="xs" tilted={true} highContrast={true} />
                        </div>
                      )}

                      <div className="relative z-10 text-left">
                        <h5 className="text-[11px] font-display font-black text-slate-950">
                          {(w.amount ?? 0).toLocaleString()} ETB
                        </h5>
                        <p className="text-[8px] text-slate-700 uppercase font-mono font-black mt-0.5">
                          Time: {new Date(w.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right relative z-10 font-sans">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          w.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          w.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                        }`}>
                          {w.status}
                        </span>
                        {w.status === 'rejected' && w.rejectionReason && (
                          <p className="text-[7.5px] text-rose-800 mt-1 max-w-[120px] truncate font-black font-sans">
                            Notes: {w.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowInvitationNetwork(!showInvitationNetwork)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 text-xs text-slate-900 font-black border-t border-slate-100 transition-all cursor-pointer group animate-fade-in"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-[#0A3D91]/15 text-[#0A3D91] rounded-xl group-hover:bg-[#0A3D91]/25 transition-all">
              <Users className="w-4.5 h-4.5 text-[#0A3D91]" />
            </div>
            <div className="text-left">
              <span className="block text-slate-950 text-[11.5px] font-black leading-none">
                {language === 'am' ? 'የግብዣ አውታረ መረብ' :
                 language === 'om' ? 'Koodii Affeerraa' :
                 language === 'ti' ? 'ናይ መጋበዚ መርበብ' :
                 language === 'so' ? 'Macaamiisha Casuumada' :
                 'Invitation Network'}
              </span>
              <span className="text-[8.5px] text-[#0A3D91] block tracking-widest uppercase font-mono mt-1 font-extrabold text-blue-800">
                {language === 'am' ? 'ኮሚሽኖች እና አውታረ መረብ' : 'Commissions & Network'}
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-700 transition-transform duration-200 ${showInvitationNetwork ? 'rotate-90' : ''}`} />
        </button>

        {showInvitationNetwork && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-2 space-y-4 font-sans text-left animate-in fade-in duration-200">
            {/* Bento Stats row */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-3xs">
                <span className="text-slate-500 text-[8.5px] uppercase tracking-wider font-extrabold block">
                  {t.teamSize}
                </span>
                <span className="font-display font-black text-sm text-[#0A3D91] mt-0.5 block">
                  {profile.teamSize || 0}
                  {language === 'am' ? ' አጋሮች' : ' Partners'}
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50/40 border border-emerald-150 rounded-2xl shadow-3xs">
                <span className="text-emerald-800 text-[8.5px] uppercase tracking-wider font-extrabold block">
                  {t.totalReferralRewards}
                </span>
                <span className="font-display font-black text-sm text-emerald-700 mt-0.5 block font-mono">
                  {referrals.reduce((sum, r) => sum + (r.rewardEarned || 0), 0).toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Premium Invitation Code Box */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0A3D91] via-[#124ca6] to-[#06245c] rounded-2xl p-4 border border-amber-400 shadow-sm text-center font-sans">
              <span className="text-[8.5px] text-white/70 block uppercase font-mono font-black tracking-widest mb-1">
                {language === 'am' ? 'የግብዣ መለያ ቁጥርዎ' : 'Your Invitation ID'}
              </span>
              <h2 className="text-xl font-black italic tracking-widest text-white uppercase font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                {profile.referralCode}
              </h2>
            </div>

            {/* Invite URL */}
            <div className="space-y-1.5">
              <span className="text-[8px] text-[#0A3D91] block uppercase font-sans font-black tracking-widest text-left pl-1">
                {language === 'am' ? 'ጓደኞችን ለመጋበዝ ሊንክ' : 'Invite Friends Link'}
              </span>
              <div className="p-1 bg-white border border-slate-200 rounded-xl flex items-center justify-between font-sans shadow-3xs">
                <div className="pl-2 min-w-0 flex-1 mr-2 text-left">
                  <span className="text-[9.5px] font-extrabold text-slate-700 block truncate font-mono">
                    {getReferralOrigin()}/?ref={profile.referralCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`p-2 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0 border ${
                    linkCopyStatus 
                      ? 'bg-emerald-500 text-white border-emerald-500' 
                      : 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Share & QR Code Actions */}
            <div className="grid grid-cols-2 gap-3 font-sans">
              <button
                type="button"
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
                className="px-3 py-2 bg-[#0c1829] hover:bg-[#16273e] text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center space-x-1.5 border border-slate-800 transition-all cursor-pointer shadow-3xs active:scale-95 text-center"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'am' ? 'አጋራ' : 'Share'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrCode(true)}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center space-x-1.5 border border-amber-200 transition-all cursor-pointer shadow-3xs active:scale-95 text-center"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>{language === 'am' ? 'ኪውአር' : 'QR Code'}</span>
              </button>
            </div>

            {/* Referral list */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div 
                onClick={() => setShowReferralList(!showReferralList)}
                className="flex items-center justify-between cursor-pointer select-none hover:bg-slate-200/50 p-1.5 rounded-lg transition-all"
              >
                <span className="text-[9.5px] font-sans font-black uppercase tracking-wider text-sky-700">
                  {language === 'am' ? 'የተጋበዙ አጋሮች መከታተያ' : 'Referrals & Bonus Tracking'}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-[8.5px] font-sans font-black bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-md">
                    {referrals.length}
                  </span>
                  {showReferralList ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                </div>
              </div>

              {showReferralList && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {referrals.length === 0 ? (
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wide text-center py-2">
                      {language === 'am' ? 'እስካሁን የተቀላቀለ አጋር የለም' : 'No active team members detected'}
                    </p>
                  ) : (
                    referrals.map((ref) => (
                      <div key={ref.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between font-sans shadow-3xs">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <p className="text-[10px] font-black text-slate-900 uppercase">{ref.referredName}</p>
                            <span className="text-[7px] font-mono font-black px-1.5 bg-amber-500/10 text-amber-700 border border-amber-500/15 rounded">
                              VIP {ref.referredVipLevel || 1}
                            </span>
                          </div>
                          <p className="text-[8.5px] font-semibold text-slate-500 font-mono mt-0.5">{ref.referredPhone}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10.5px] font-black text-emerald-600 font-mono">+{ref.rewardEarned?.toLocaleString() || 0} ETB</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowLiquidityLoan(!showLiquidityLoan)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 text-xs text-slate-900 font-black border-t border-slate-100 transition-all cursor-pointer group animate-fade-in"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-emerald-100 text-emerald-705 rounded-xl group-hover:bg-emerald-200 transition-all animate-none">
              <Coins className="w-4.5 h-4.5 text-emerald-700 animate-none" />
            </div>
            <div className="text-left">
              <span className="block text-slate-950 text-[11.5px] font-black leading-none">
                {language === 'am' ? 'የሊኩይዲቲ ብድሮች' :
                 language === 'om' ? 'Liqii Maallaqaa' :
                 language === 'ti' ? 'ናይ እቶት ልቓሕ' :
                 language === 'so' ? 'Macaamiisha Amaahda' :
                 'Liquidity Loans'}
              </span>
              <span className="text-[8.5px] text-emerald-800 block tracking-widest uppercase font-mono mt-1 font-extrabold text-emerald-800">
                {language === 'am' ? 'የአጭር ጊዜ ብድሮች' : 'Sovereign credit line'}
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-700 transition-transform duration-200 ${showLiquidityLoan ? 'rotate-90' : ''}`} />
        </button>

        {showLiquidityLoan && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-2 space-y-4 font-sans text-left animate-in fade-in duration-200">
            <h4 className="font-display font-black text-[11px] text-[#0A3D91] uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Coins className="w-3.5 h-3.5 text-[#0A3D91]" />
                <span>
                  {language === 'am' ? 'የሊኩይዲቲ ብድር ማስጫወቻ' : 'Liquidity Loan Simulator'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowLoanInfo(true)}
                className="p-1 px-2 border border-blue-200 hover:bg-white rounded-lg cursor-pointer transition-all text-[8px] font-black uppercase text-blue-700"
              >
                Info
              </button>
            </h4>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-slate-800">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-500">Interest Rating:</span>
                <span className="font-black text-indigo-700">1.5% Flat</span>
              </div>
              <p className="text-[10px] text-slate-600 font-medium leading-relaxed font-bold">
                {language === 'am' ? 'በLUMORA ሊኩይዲቲ አካውንቶች የተደገፈ ተቋማዊ ካፒታል። ክፍያዎች በ24 ሰዓታት ውስጥ በቀጥታ ወደ CBE አካውንትዎ ይላካሉ።' :
                 'Institutional capital backed by LUMORA liquidity. Disbursements wired directly within 24 hours to your verified CBE account.'}
              </p>
            </div>

            <div className="space-y-3 font-sans">
              <div className="flex justify-between items-center bg-slate-200/50 p-1.5 rounded-lg select-none">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-1">Loan Calculator</span>
                <button
                  type="button"
                  onClick={() => setShowLoanSimulator(!showLoanSimulator)}
                  className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[8px] font-black uppercase"
                >
                  {showLoanSimulator ? 'Close' : 'Show'}
                </button>
              </div>

              {showLoanSimulator && (
                <div className="p-3 bg-white border border-slate-250 rounded-xl space-y-3">
                  <LoanCalculator
                    isEligible={profile.vipLevel >= 4 && profile.idVerificationStatus === 'verified'}
                    onApplySettings={(amount, tenure) => {
                      setLoanAmount(amount.toString());
                      setLoanTenure(tenure); // ensure standard integer bounds
                    }}
                  />
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-[9px] font-black text-slate-500 block uppercase tracking-wider pl-0.5">
                {language === 'am' ? 'የብድር አገልግሎት ማግኛ ደረጃ' : 'Sovereign Loan Unlock Tracker'}
              </span>

              {profile.vipLevel < 4 || profile.idVerificationStatus !== 'verified' ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-1">
                  <span className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-800 font-mono font-black px-2 py-0.5 rounded text-[7.5px] uppercase tracking-wider border border-amber-200">
                    🔒 Request Locked
                  </span>
                  <p className="text-[9px] text-amber-800 font-bold leading-relaxed">
                    Loan services are available only for VIP 3+ members who are fully ID Verified. Current VIP Level: <strong>{profile.vipLevel === 1 ? "Starter" : `VIP ${profile.vipLevel > 1 ? profile.vipLevel - 1 : 0}`}</strong>, status: <strong>{profile.idVerificationStatus || 'Unsubmitted'}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLoanRequest} className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="text-[8.5px] text-slate-500 block uppercase font-sans font-black tracking-widest pl-1">
                      Loan Principal Sum (ETB)
                    </label>
                    <div className="relative rounded-xl">
                      <select
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500"
                        required
                      >
                        <option value="">-- Select Loan Amount --</option>
                        {[30000, 50000, 100000, 150000, 200000, 250000, 500000, 1000000].map((amt) => (
                          <option key={amt} value={amt}>
                            {amt.toLocaleString()} ETB
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[30000, 50000, 100000, 150000, 200000, 250000, 500000, 1000000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setLoanAmount(amt.toString())}
                          className={`px-2 py-1 rounded bg-slate-100 border text-[8px] font-black ${
                            loanAmount === amt.toString() ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {amt.toLocaleString()} ETB
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] text-slate-500 block uppercase font-sans font-black tracking-widest pl-1">
                      Repayment Tenure
                    </label>
                    <div className="flex gap-2">
                      {[3, 6, 12].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setLoanTenure(m)}
                          className={`flex-1 py-1.5 rounded-lg border text-[9px] font-black transition-all ${
                            loanTenure === m
                              ? 'bg-[#0A3D91] text-white border-[#0A3D91]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-55'
                          }`}
                        >
                          {m} Months
                        </button>
                      ))}
                    </div>
                  </div>

                  {loanError && (
                    <p className="text-[8px] font-bold text-rose-600 font-mono">⚠ {loanError}</p>
                  )}
                  {loanSuccess && (
                    <p className="text-[8px] font-bold text-emerald-600 font-sans">✓ {loanSuccess}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-2 bg-[#0A3D91] hover:bg-[#072A66] text-white transition-all active:scale-98 font-black text-[9px] rounded-lg tracking-wider uppercase text-center cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>Request Verification & Disburse Loan</span>
                  </button>
                </form>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 block uppercase tracking-wider pl-0.5">
                  {language === 'am' ? 'የብድር ታሪክ መዝገብ' : 'Loan History Ledger'}
                </span>
                <span className="text-[8.5px] font-mono font-black bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md">
                  {loans ? loans.length : 0}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {!loans || loans.length === 0 ? (
                  <p className="text-[9px] text-slate-400 font-bold text-center py-2">
                    {language === 'am' ? 'ምንም የብድር ታሪክ የለም' : 'No Loan History Found'}
                  </p>
                ) : (
                  loans.map((l) => {
                    const tenure = l.tenureMonths || 6;
                    const flatMonthlyRate = 0.015;
                    const totalRepayable = l.amount + (l.amount * flatMonthlyRate * tenure);
                    let remainingRepaymentBalance = 0;

                    if (l.status === 'approved') {
                      const startDate = new Date(l.reviewedAt || l.submittedAt);
                      const now = new Date();
                      const diffTime = Math.abs(now.getTime() - startDate.getTime());
                      const monthsElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.4375));
                      const monthlyInstallment = totalRepayable / tenure;
                      remainingRepaymentBalance = monthsElapsed >= tenure ? 0 : (totalRepayable - (monthsElapsed * monthlyInstallment));
                    } else if (l.status === 'pending') {
                      remainingRepaymentBalance = totalRepayable;
                    }

                    return (
                      <div key={l.id} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-2 font-sans shadow-3xs relative overflow-hidden text-left leading-normal">
                        {l.status === 'approved' && (
                          <div className="absolute right-2 top-0 pointer-events-none transform scale-50">
                            <LumoraStamp text="APPROVED" variant="green" size="xs" tilted={true} highContrast={true} />
                          </div>
                        )}
                        {l.status === 'rejected' && (
                          <div className="absolute right-2 top-0 pointer-events-none transform scale-50">
                            <LumoraStamp text="REJECTED" variant="rose" size="xs" tilted={true} highContrast={true} />
                          </div>
                        )}

                        <div className="flex justify-between items-center text-[10px]">
                          <div>
                            <span className="font-extrabold text-slate-900">{(l.amount ?? 0).toLocaleString()} ETB</span>
                            <span className="text-[8px] text-slate-400 block font-mono">Date: {new Date(l.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`text-[8px] font-black p-1 px-2 rounded-full border uppercase ${
                            l.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            l.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {l.status}
                          </span>
                        </div>

                        {l.status === 'approved' && (
                          <div className="text-[9.5px]">
                            <span className="text-slate-500 font-bold block">Remaining Repayment Balance:</span>
                            <span className="font-black font-mono text-emerald-800">{Math.round(remainingRepaymentBalance).toLocaleString()} ETB</span>
                          </div>
                        )}

                        {l.status === 'rejected' && l.rejectionReason && (
                          <p className="text-[8px] text-rose-800 font-sans leading-relaxed bg-rose-50 p-1.5 rounded border border-rose-100">
                            Notes: {l.rejectionReason}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        <button
          onClick={() => setShowPWADetails(!showPWADetails)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-100 text-xs text-slate-900 font-black border-t border-slate-100 transition-all cursor-pointer group animate-fade-in"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-[#0A3D91]/15 text-[#0A3D91] rounded-xl group-hover:bg-[#0A3D91]/25 transition-all">
              <Smartphone className="w-4.5 h-4.5 text-[#0A3D91]" />
            </div>
            <div className="text-left">
              <span className="block text-slate-950 text-[11.5px] font-black leading-none">
                {language === 'am' ? 'አፕሊኬሽን' :
                 language === 'om' ? 'Aappilikeeshinii' :
                 language === 'ti' ? 'ኣፕሊኬሽን' :
                 language === 'so' ? 'App-ka' :
                 'Application'}
              </span>
              <span className="text-[8.5px] text-[#0A3D91] block tracking-widest uppercase font-mono mt-1 font-extrabold text-blue-800">
                App
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-700 transition-transform duration-200 ${showPWADetails ? 'rotate-90' : ''}`} />
        </button>

        {showPWADetails && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-2 space-y-4 font-sans text-left animate-in fade-in duration-200">
            {/* Dynamic PWA Installation Action Trigger Button */}
            <div className="space-y-3">
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
                  <Download className="w-4 h-4 text-white animate-bounce" />
                  <span>Install Lumora Mobile App (PWA)</span>
                </button>
              )}
            </div>

            {/* Unified Instructions - Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chrome / Android Guide */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-left text-slate-800 font-sans text-xs">
                <p className="font-bold text-[10px] text-[#0A3D91] uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
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
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
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



      {/* CARD 7: Sign Out and Reset Triggers (Secondary Elegant Frame) */}
      <div className="pt-2 px-1 grid grid-cols-2 gap-3.5">
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-2xl border border-rose-200/60 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-300 text-rose-600 text-xs font-black transition-all tracking-wider flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
        >
          <LogOut className="w-4 h-4 stroke-[2.5]" />
          <span>{t.logout}</span>
        </button>

        {isAdmin ? (
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full py-4 rounded-2xl border border-amber-200/60 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 text-amber-700 text-xs font-black transition-all tracking-wider flex items-center justify-center space-x-2 cursor-pointer active:scale-98 animate-pulse"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>
              {language === 'am' ? 'ሙሉ መተግበሪያን አድስ' :
               language === 'om' ? 'App Reset Lamata' :
               language === 'ti' ? 'ሙሉ መተግበሪያን አድስ' :
               language === 'so' ? 'Dib u deji App' :
               'Reset Application'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full py-4 rounded-2xl border border-amber-200/60 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 text-amber-700 text-xs font-black transition-all tracking-wider flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>
              {language === 'am' ? 'አካውንቴን አድስ' :
               language === 'om' ? 'Akauntii hara’umsi' :
               language === 'ti' ? 'አካውንተይ ሓድሽ' :
               language === 'so' ? 'Dib u deji Akoonkayga' :
               'Reset My Account'}
            </span>
          </button>
        )}
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

      {/* Absolute Application Reset Confirmation Dialog Sheet */}
      {showResetModal && (
        <div className="fixed inset-0 bg-[#070d19]/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] text-slate-800 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 space-y-5 shadow-2xl relative border border-slate-100 text-center animate-in scale-in duration-200">
            <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center animate-bounce">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-display font-black text-sm text-slate-900 uppercase tracking-wider leading-none">
                {isAdmin ? (
                  language === 'am' ? 'ሙሉ መተግበሪያን ዳግም ያስጀምሩ?' : 'Reset Entire System?'
                ) : (
                  language === 'am' ? 'አካውንትዎን እንደገና ያስጀምሩ?' : 'Reset Your Account?'
                )}
              </h3>
              <p className="text-[10px] text-rose-500 uppercase tracking-widest font-mono font-bold">
                {language === 'am' ? 'ይህ እርምጃ ሊቀለበስ አይችልም' : 'This action is irreversible'}
              </p>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              {isAdmin ? (
                language === 'am' ? 'ይህ መላውን የመተግበሪያ መሸጎጫ ያጸዳል፣ የስርዓት ቅንብሮችን ዳግም ያስጀምራል፣ ከአካውንትዎ ያስወጣዎታል እንዲሁም ሰርቨሩን ወደ መጀመሪያው ሁኔታ ይመልሳል።' :
                language === 'om' ? 'Kun hojii uumame hunda ni haqa. Gara jalqabaatti deebisa.' :
                'This operation will wipe your local database cache, clear settings, sign you out, and request a system-wide reset of the remote database engine.'
              ) : (
                language === 'am' ? 'ይህ የእርስዎን የግል ኢንቨስትመንት፣ የተቀማጭ ገንዘብ እና የወጪ ታሪክ ሙሉ በሙሉ ለመሰረዝ እና መለያዎ እንዲወገድ ያደርጋል። ይህን ለማድረግ እርግጠኛ ነዎት?' :
                'This will permanently erase all your personal investments, active plans, deposit and withdrawal history, transaction records, and completely delete your account from our system database. You must register a new account to play again.'
              )}
            </p>

            {resetError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-xl border border-rose-150">
                {resetError}
              </div>
            )}

            {!resetSuccess ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={resetting}
                  onClick={() => setShowResetModal(false)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {language === 'am' ? 'አቋርጥ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={resetting}
                  onClick={handleAppReset}
                  className="py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
                >
                  {resetting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>
                      {language === 'am' ? 'አረጋግጥ' : 'Confirm'}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-150 text-center space-y-2 animate-in fade-in">
                <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-xl text-[9px] uppercase tracking-wider border border-emerald-300">
                  <Check className="w-3 h-3 text-emerald-600 mr-0.5 animate-pulse" />
                  <span>Success</span>
                </span>
                <p className="text-[10px] font-bold">
                  {isAdmin ? (
                    language === 'am' ? 'መተግበሪያው በተሳካ ሁኔታ ዳግም ተጀምሯል! አሁን ዳግም እየተጫነ ነው...' : 'System has been successfully reset! Reloading application...'
                  ) : (
                    language === 'am' ? 'መለያዎ በተሳካ ሁኔታ ተሰርዟል! አሁን ዳግም እየተጫነ ነው...' : 'Your account and history were successfully erased! Reloading...'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
