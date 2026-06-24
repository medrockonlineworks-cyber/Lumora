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
  Lock,
  Wallet,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Globe,
  Sliders,
  Check,
  Award,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { useLanguage } from '../locale';
import { Investment, Profile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface EarningsTabProps {
  investments: Investment[];
  profile: Profile;
  onRefreshDashboard: () => void;
}

interface Project {
  id: string;
  name: string;
  icon: string;
  status: 'Active' | 'Monitoring';
  trend: string;
  isPositive: boolean;
  defaultAlloc: number;
}

const DEFAULT_PROJECTS: Project[] = [
  { id: 'crypto', name: 'Cryptocurrency Trading', icon: '🪙', status: 'Active', trend: '+1.2%', isPositive: true, defaultAlloc: 20 },
  { id: 'forex', name: 'Forex Trading', icon: '💱', status: 'Active', trend: '+0.5%', isPositive: true, defaultAlloc: 20 },
  { id: 'stocks', name: 'Stock Investing', icon: '📈', status: 'Active', trend: '+0.8%', isPositive: true, defaultAlloc: 20 },
  { id: 'gold', name: 'Gold & Precious Metals Investment', icon: '🏆', status: 'Active', trend: '+0.3%', isPositive: true, defaultAlloc: 10 },
  { id: 'realestate', name: 'Real Estate Investment', icon: '🏢', status: 'Active', trend: '+0.4%', isPositive: true, defaultAlloc: 10 },
  { id: 'agriculture', name: 'Agriculture Investment', icon: '🌾', status: 'Active', trend: '+0.9%', isPositive: true, defaultAlloc: 5 },
  { id: 'p2p', name: 'Peer-to-Peer Lending', icon: '🤝', status: 'Active', trend: '+0.7%', isPositive: true, defaultAlloc: 5 },
  { id: 'indexfunds', name: 'Index Fund Investment', icon: '📊', status: 'Active', trend: '+0.6%', isPositive: true, defaultAlloc: 5 },
  { id: 'renewable', name: 'Renewable Energy Projects', icon: '⚡', status: 'Active', trend: '+1.1%', isPositive: true, defaultAlloc: 5 },
  { id: 'startup', name: 'Startup Crowdfunding', icon: '🚀', status: 'Active', trend: '+1.5%', isPositive: true, defaultAlloc: 5 },
  { id: 'bonds', name: 'Bond Investments', icon: '📄', status: 'Active', trend: '+0.2%', isPositive: true, defaultAlloc: 5 },
  { id: 'commodity', name: 'Commodity Trading', icon: '📦', status: 'Active', trend: '+0.4%', isPositive: true, defaultAlloc: 5 }
];

const PROJECT_NAME_TO_ID: Record<string, string> = {
  'Cryptocurrency Trading': 'crypto',
  'Forex Trading': 'forex',
  'Stock Investing': 'stocks',
  'Gold & Precious Metals Investment': 'gold',
  'Real Estate Investment': 'realestate',
  'Agriculture Investment': 'agriculture',
  'Peer-to-Peer Lending': 'p2p',
  'Index Fund Investment': 'indexfunds',
  'Renewable Energy Projects': 'renewable',
  'Startup Crowdfunding': 'startup',
  'Bond Investments': 'bonds',
  'Commodity Trading': 'commodity'
};

const PROJECT_ID_TO_NAME: Record<string, string> = {
  'crypto': 'Cryptocurrency Trading',
  'forex': 'Forex Trading',
  'stocks': 'Stock Investing',
  'gold': 'Gold & Precious Metals Investment',
  'realestate': 'Real Estate Investment',
  'agriculture': 'Agriculture Investment',
  'p2p': 'Peer-to-Peer Lending',
  'indexfunds': 'Index Fund Investment',
  'renewable': 'Renewable Energy Projects',
  'startup': 'Startup Crowdfunding',
  'bonds': 'Bond Investments',
  'commodity': 'Commodity Trading'
};

const getDailyLevelIncome = (vipLevel: number) => {
  switch (vipLevel) {
    case 1: return 119;      // Starter level
    case 2: return 175;      // VIP 1
    case 3: return 375;      // VIP 2
    case 4: return 1000;     // VIP 3
    case 5: return 2150;     // VIP 4
    case 6: return 4600;     // VIP 5
    case 7: return 12500;    // VIP 6
    case 8: return 27000;    // VIP 7
    case 9: return 58000;    // VIP 8
    case 10: return 124000;  // VIP 9
    case 11: return 335000;  // VIP 10
    case 12: return 720000;  // VIP 11
    case 13: return 1950000; // VIP 12
    case 14: return 4250000; // VIP 13
    case 15: return 6900000; // VIP 14
    case 16: return 10000000;// VIP 15
    default: return 119;      // Default/Starter
  }
};

const getLevelName = (vipLevel: number) => {
  if (vipLevel <= 1) return 'Starter Level';
  return `VIP Level ${vipLevel - 1}`;
};

interface MarketSentiment {
  id: string;
  ticker: string;
  name: string;
  sentiment: 'Bullish' | 'Bearish';
  score: number;
  change: string;
  reason: string;
  influence: string;
}

const MARKET_SENTIMENTS: MarketSentiment[] = [
  { 
    id: 'crypto',
    ticker: 'BTC/USD', 
    name: 'Cryptocurrency Trading', 
    sentiment: 'Bullish', 
    score: 87, 
    change: '+2.41%', 
    reason: 'Strong institutional inflows, rising spot ETF demand, and constructive macroeconomic indicators are driving robust crypto asset price momentum.',
    influence: 'Directly powers high yield returns on your Cryptocurrency allocations.'
  },
  { 
    id: 'forex',
    ticker: 'EUR/USD', 
    name: 'Forex Trading', 
    sentiment: 'Bearish', 
    score: 35, 
    change: '-0.34%', 
    reason: 'Dovish statements from global central bank officials are putting minor downward pressure on major currency pairs, raising volatility.',
    influence: 'Triggers minor hedging adjustments on your Forex Trading allocations.'
  },
  { 
    id: 'stocks',
    ticker: 'SPX 500', 
    name: 'Stock Investing', 
    sentiment: 'Bullish', 
    score: 79, 
    change: '+1.18%', 
    reason: 'Corporate earnings reports are beating expectations across multiple sectors, reinforcing optimistic investor risk appetites.',
    influence: 'Fuels stable compounding growth on your Global Stock Indexes.'
  },
  { 
    id: 'gold',
    ticker: 'XAU/USD', 
    name: 'Gold & Precious Metals Investment', 
    sentiment: 'Bullish', 
    score: 82, 
    change: '+0.85%', 
    reason: 'Rising global geopolitical tensions and sovereign central bank gold purchasing trends are accelerating safety demand for precious metals.',
    influence: 'Acts as a strong hedge and secure store of value for your gold holdings.'
  },
  { 
    id: 'realestate',
    ticker: 'REIT/US', 
    name: 'Real Estate Investment', 
    sentiment: 'Bullish', 
    score: 71, 
    change: '+0.45%', 
    reason: 'Robust demand for multi-family residential complexes and urban warehouse logistics space keeps rental yields extremely solid.',
    influence: 'Generates consistent passive rental cashflows on your Real Estate allocations.'
  },
  { 
    id: 'agriculture',
    ticker: 'AGRI/GL', 
    name: 'Agriculture Investment', 
    sentiment: 'Bullish', 
    score: 76, 
    change: '+1.62%', 
    reason: 'Global demand for organic grains and sustainable farming methods is raising agricultural product futures contracts and harvest values.',
    influence: 'Supplements defensive growth and essential food system yields on your Agriculture investments.'
  },
  { 
    id: 'p2p',
    ticker: 'P2P/YLD', 
    name: 'Peer-to-Peer Lending', 
    sentiment: 'Bearish', 
    score: 44, 
    change: '-0.08%', 
    reason: 'Slight rising credit spread risk across retail borrower pools is driving platform models to raise credit standards, narrowing margins.',
    influence: 'Stabilizes platform interest cashflows with highly curated premium credit screening.'
  },
  { 
    id: 'indexfunds',
    ticker: 'MSCI/WD', 
    name: 'Index Fund Investment', 
    sentiment: 'Bullish', 
    score: 80, 
    change: '+1.25%', 
    reason: 'Global broad-market indexes are exhibiting positive technical breakouts as inflation metrics continue to normalize near target ranges.',
    influence: 'Maintains highly diversified compound growth on your Global Index Fund allocations.'
  },
  { 
    id: 'renewable',
    ticker: 'CLEAN/EN', 
    name: 'Renewable Energy Projects', 
    sentiment: 'Bullish', 
    score: 91, 
    change: '+3.72%', 
    reason: 'Massive public subsidies and commercial contracts for wind, solar, and grid storage are driving unparalleled sector expansion.',
    influence: 'Powers high-growth green technology dividends on your Renewable Energy allocations.'
  },
  { 
    id: 'startup',
    ticker: 'VC/SEED', 
    name: 'Startup Crowdfunding', 
    sentiment: 'Bullish', 
    score: 85, 
    change: '+4.12%', 
    reason: 'High-quality pre-seed and seed rounds are experiencing active term sheets as early-stage tech valuations stabilize at attractive multiples.',
    influence: 'Generates high-alpha asymmetrical returns on your Startup allocations.'
  },
  { 
    id: 'bonds',
    ticker: 'US10Y', 
    name: 'Bond Investments', 
    sentiment: 'Bearish', 
    score: 48, 
    change: '-0.15%', 
    reason: 'Bond yields are consolidating in tight ranges as the market digests potential future rate path signals from the Federal Reserve.',
    influence: 'Secures ultra-low risk fixed-income distributions on your Bond allocations.'
  },
  { 
    id: 'commodity',
    ticker: 'OIL/WTI', 
    name: 'Commodity Trading', 
    sentiment: 'Bullish', 
    score: 68, 
    change: '+0.95%', 
    reason: 'Tight supply-side OPEC discipline and rising global industrial activity keep energy and metal commodity prices firmly supported.',
    influence: 'Triggers inflationary hedge returns on your Commodity Trading allocations.'
  }
];

export default function EarningsTab({ investments, profile, onRefreshDashboard }: EarningsTabProps) {
  const { language, t } = useLanguage();
  
  const [payoutCountdown, setPayoutCountdown] = useState<string>('00:00:00');
  const [settlementProgress, setSettlementProgress] = useState<number>(0);
  const [liveStreamRate, setLiveStreamRate] = useState<number>(0);

  const hasActivePurchasedPlan = React.useMemo(() => {
    return investments && investments.some(i => i.status === 'active');
  }, [investments]);

  const portfolioLockInfo = React.useMemo(() => {
    if (!profile?.userId) return { isLocked: false, remainingDays: 0, lockUntilStr: '' };
    const savedTime = localStorage.getItem(`lumora_projects_selection_time_${profile.userId}`);
    if (!savedTime) return { isLocked: false, remainingDays: 0, lockUntilStr: '' };
    
    const lockDurationMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const unlockTime = Number(savedTime) + lockDurationMs;
    const isLocked = Date.now() < unlockTime;
    const remainingMs = unlockTime - Date.now();
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    
    const lockUntilDate = new Date(unlockTime);
    const lockUntilStr = lockUntilDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    
    return { isLocked, remainingDays, lockUntilStr };
  }, [profile?.userId]);

  // Get project IDs selected on the plans page
  const plansPageProjectIds = React.useMemo(() => {
    try {
      const savedNames = localStorage.getItem(`lumora_selected_projects_${profile?.userId}`);
      if (savedNames) {
        const names = JSON.parse(savedNames) as string[];
        const ids = names.map(name => PROJECT_NAME_TO_ID[name]).filter(Boolean) as string[];
        if (ids.length > 0) return ids;
      }
    } catch (e) {
      console.error("Error reading plans page projects:", e);
    }
    return ['stocks', 'realestate', 'gold']; // Default fallback matching InvestmentsTab
  }, [profile?.userId]);

  const [activeProjects, setActiveProjects] = useState<string[]>(() => {
    try {
      const savedNames = localStorage.getItem(`lumora_selected_projects_${profile?.userId}`);
      if (savedNames) {
        const names = JSON.parse(savedNames) as string[];
        const ids = names.map(name => PROJECT_NAME_TO_ID[name]).filter(Boolean) as string[];
        if (ids.length > 0) return ids;
      }
    } catch (e) {
      console.error(e);
    }
    const saved = localStorage.getItem('lumora_selected_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return ['stocks', 'realestate', 'gold'];
  });
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('lumora_project_allocations');
    if (saved) return JSON.parse(saved);
    const initial: Record<string, number> = {};
    DEFAULT_PROJECTS.forEach(p => {
      initial[p.id] = p.defaultAlloc;
    });
    return initial;
  });

  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [claimStatus, setClaimStatus] = useState<{ text: string; isError: boolean } | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebratedAmount, setCelebratedAmount] = useState<number>(0);
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<'all' | 'bullish' | 'bearish'>('all');
  const [expandedSentimentId, setExpandedSentimentId] = useState<string | null>(null);

  // Sync active projects with selections in plans page under Lumora Allocation Model
  useEffect(() => {
    if (profile?.userId && plansPageProjectIds.length > 0) {
      setActiveProjects(plansPageProjectIds);
      
      const updated: Record<string, number> = {};
      const share = Math.floor(100 / plansPageProjectIds.length);
      plansPageProjectIds.forEach((id, idx) => {
        if (idx === plansPageProjectIds.length - 1) {
          updated[id] = 100 - (share * (plansPageProjectIds.length - 1));
        } else {
          updated[id] = share;
        }
      });
      setAllocations(updated);
    } else {
      setActiveProjects([]);
      setAllocations({});
    }
  }, [profile?.userId, plansPageProjectIds]);

  // Active investments & incomes
  const activeInvestments = investments.filter(i => i.status === 'active');
  const userVipLevel = profile?.vipLevel || 1;
  const levelIncomeTotal = getDailyLevelIncome(userVipLevel);

  // Ticking Countdown to local midnight
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

      // Calculate progress of current 24 hour cycle
      const totalMsInDay = 24 * 60 * 60 * 1000;
      const elapsedMs = totalMsInDay - Math.max(0, Math.min(totalMsInDay, diffMs));
      const progress = (elapsedMs / totalMsInDay) * 100;
      setSettlementProgress(progress);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulating small micro fractional yield stream
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStreamRate(prev => {
        const tick = (levelIncomeTotal / 86400) * (1 + Math.random() * 0.1);
        return Number((prev + tick).toFixed(6));
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [levelIncomeTotal]);

  // Persist selections
  useEffect(() => {
    localStorage.setItem('lumora_selected_projects', JSON.stringify(activeProjects));
  }, [activeProjects]);

  useEffect(() => {
    localStorage.setItem('lumora_project_allocations', JSON.stringify(allocations));
  }, [allocations]);

  // Project data helper
  const selectedProjectsData = React.useMemo(() => {
    if (!hasActivePurchasedPlan) return [];
    return DEFAULT_PROJECTS
      .filter(p => plansPageProjectIds.includes(p.id));
  }, [hasActivePurchasedPlan, plansPageProjectIds]);

  const totalAllocationSum = selectedProjectsData.reduce((sum, p) => sum + (allocations[p.id] || 0), 0);

  // Calculate project contributions
  const calculatedContributions = React.useMemo(() => {
    if (selectedProjectsData.length === 0) return {};
    const result: Record<string, number> = {};
    let sum = 0;
    
    selectedProjectsData.forEach((p, idx) => {
      const alloc = allocations[p.id] || 0;
      // Normalize percentage relative to total allocation sum to ensure mathematical fulfillment
      const sharePercentage = totalAllocationSum > 0 ? (alloc / totalAllocationSum) : (1 / selectedProjectsData.length);
      
      if (idx === selectedProjectsData.length - 1) {
        // Last project takes exact remaining fraction to hit target exactly
        result[p.id] = Number((levelIncomeTotal - sum).toFixed(2));
      } else {
        const val = Number((sharePercentage * levelIncomeTotal).toFixed(2));
        result[p.id] = val;
        sum += val;
      }
    });
    return result;
  }, [levelIncomeTotal, selectedProjectsData, allocations, totalAllocationSum]);

  // Auto distribute equally helper
  const handleAutoDistribute = () => {
    const allowedActive = activeProjects.filter(id => plansPageProjectIds.includes(id));
    if (allowedActive.length === 0) return;
    const share = Math.floor(100 / allowedActive.length);
    const updated: Record<string, number> = {};
    
    allowedActive.forEach((id, idx) => {
      if (idx === allowedActive.length - 1) {
        updated[id] = 100 - (share * (allowedActive.length - 1));
      } else {
        updated[id] = share;
      }
    });
    setAllocations(prev => ({ ...prev, ...updated }));
  };

  // Toggle project selected state
  const toggleProject = (projectId: string) => {
    if (portfolioLockInfo.isLocked) {
      setClaimStatus({
        text: `Portfolio selection is locked for 30 days under Lumora stability standards. Locked until ${portfolioLockInfo.lockUntilStr}.`,
        isError: true
      });
      return;
    }
    setActiveProjects(prev => {
      let next;
      if (prev.includes(projectId)) {
        if (prev.length <= 1) return prev; // At least one project
        next = prev.filter(id => id !== projectId);
      } else {
        next = [...prev, projectId];
      }
      
      // Filter next to only projects that are actually allowed (selected in plans page)
      next = next.filter(id => plansPageProjectIds.includes(id));
      if (next.length === 0) return prev;
      
      // Auto rebalance when toggled
      const share = Math.floor(100 / next.length);
      const updated: Record<string, number> = {};
      next.forEach((id, idx) => {
        if (idx === next.length - 1) {
          updated[id] = 100 - (share * (next.length - 1));
        } else {
          updated[id] = share;
        }
      });
      setAllocations(prevAll => ({ ...prevAll, ...updated }));
      return next;
    });
  };

  // Adjust allocation for a project
  const handleAllocationSlider = (projectId: string, value: number) => {
    setAllocations(prev => {
      const updated = { ...prev, [projectId]: value };
      return updated;
    });
  };

  // Normalize allocations to sum to exactly 100%
  const handleRebalance = () => {
    const currentSum = selectedProjectsData.reduce((sum, p) => sum + (allocations[p.id] || 0), 0);
    if (currentSum === 0) {
      handleAutoDistribute();
      return;
    }
    const updated: Record<string, number> = {};
    let runningSum = 0;
    
    selectedProjectsData.forEach((p, idx) => {
      if (idx === selectedProjectsData.length - 1) {
        updated[p.id] = 100 - runningSum;
      } else {
        const val = Math.round(((allocations[p.id] || 0) / currentSum) * 100);
        updated[p.id] = val;
        runningSum += val;
      }
    });
    setAllocations(prev => ({ ...prev, ...updated }));
  };

  // Handle claiming profit
  const handleClaimProfit = async () => {
    setClaimLoading(true);
    setClaimStatus(null);
    try {
      const res = await fetch('/api/investments/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.userId })
      });
      const data = await res.json();
      setClaimLoading(false);

      if (res.ok) {
        setCelebratedAmount(data.claimedAmount || levelIncomeTotal);
        setShowCelebration(true);
        onRefreshDashboard();
      } else {
        // Fallback for demonstration or if no active investments exists
        // Let's offer a simulated claim so they can experience the settlement system
        setClaimStatus({ 
          text: data.error || "You have no unclaimed returns to collect at this moment. Let's start by activating an investment plan in the PLANS tab!",
          isError: true 
        });
      }
    } catch (err) {
      setClaimLoading(false);
      setClaimStatus({ text: "Network connection error.", isError: true });
    }
  };

  // Get total unclaimed returns across active investments
  const totalUnclaimedReturns = activeInvestments.reduce((sum, i) => sum + (i.unclaimedReturns || 0), 0);

  // Sparkline generator helper
  const renderSparkline = (isPositive: boolean) => {
    const color = isPositive ? '#10b981' : '#f43f5e';
    const points = isPositive 
      ? "0,35 15,28 30,30 45,15 60,18 75,5" 
      : "0,5 15,18 30,15 45,30 60,25 75,35";
    return (
      <svg className="w-16 h-8 overflow-visible" viewBox="0 0 75 40">
        <defs>
          <linearGradient id={`sparkline-glow-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d={`M ${points} L 75 40 L 0 40 Z`}
          fill={`url(#sparkline-glow-${isPositive})`}
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle cx="75" cy={isPositive ? "5" : "35"} r="2" fill={color} className="animate-ping" />
      </svg>
    );
  };

  return (
    <div id="lumora-earnings-tab" className="space-y-6 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-300 relative text-slate-800">
      
      {/* Absolute Amber & Blue Glow background decorations */}
      <div className="absolute top-0 right-[-10%] w-60 h-60 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-72 h-72 bg-[#0A3D91]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* COMPREHENSIVE VAULT CARD */}
      <div className="relative rounded-[20px] overflow-hidden border border-white/10 bg-gradient-to-br from-[#0a3d91]/80 via-[#072558]/85 to-[#0a3d91]/80 backdrop-blur-[12px] p-5 shadow-lg text-white transition-all duration-300">
        
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center">
                <Coins className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <span className="text-[10px] font-black tracking-widest font-mono text-amber-300 uppercase">
                LUMORA COMPREHENSIVE VAULT
              </span>
            </div>
            
            <span className="px-2.5 py-0.5 text-[8px] font-black font-mono rounded-full bg-[#072558]/80 border border-blue-400/20 text-blue-200 flex items-center space-x-1 shadow-sm">
              <Cpu className="w-3 h-3 text-blue-200 animate-spin-slow shrink-0" />
              <span className="uppercase tracking-wide">SECURE VAULT ACTIVE</span>
            </span>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Balance data */}
            <div className="col-span-7 space-y-3">
              <div>
                <p className="text-[9.5px] text-blue-200 uppercase tracking-wider font-mono font-bold">
                  Total Account Balance
                </p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <p className="text-3xl font-extrabold text-white tracking-tight font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {(profile?.walletBalance ?? 0).toLocaleString()}
                    <span className="text-xs text-amber-300 font-bold ml-1.5 uppercase font-mono">ETB</span>
                  </p>
                  <Wallet className="w-5 h-5 text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] shrink-0" />
                </div>
              </div>

              <div className="border-t border-blue-200/10 pt-2.5">
                <p className="text-[9.5px] text-blue-200 uppercase tracking-wider font-mono font-bold">
                  Income Balance
                </p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <p className="text-3xl font-extrabold text-white tracking-tight font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {(profile?.incomeBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    <span className="text-xs text-amber-300 font-bold ml-1.5 uppercase font-mono">ETB</span>
                  </p>
                  <Coins className="w-5 h-5 text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] shrink-0" />
                </div>
              </div>
              
              <div className="pt-1.5 flex flex-col space-y-1">
                <div className="flex items-center space-x-1.5 text-[9.5px] text-blue-100 font-mono">
                  <Activity className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                  <span>Stream rate: <strong className="text-amber-200">+{liveStreamRate.toFixed(4)}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-[9.5px] text-blue-100 font-mono">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Est. Daily Yield: <strong className="text-emerald-300">+{levelIncomeTotal.toLocaleString()} ETB</strong></span>
                </div>
              </div>
            </div>

            {/* Circular Progress Display */}
            <div className="col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="rgba(30,58,138,0.4)"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#fbbf24"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 32}
                    initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 32) * (1 - 100 / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-mono font-bold text-white leading-none">100%</span>
                  <span className="text-[7.5px] text-amber-300 uppercase font-mono font-semibold tracking-wider mt-0.5">SECURE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-blue-200/10 flex items-center justify-between text-[9px] text-blue-200 font-mono">
            <div className="flex items-center space-x-1.5 text-blue-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-200 stroke-[2]" />
              <span>Secure Vault Protected by AI Systems</span>
            </div>
            
            <div className="flex items-center space-x-1 bg-[#072558]/80 px-2 py-0.5 rounded border border-blue-400/20 text-[8px]">
              <Clock className="w-3 h-3 text-blue-250 shrink-0" />
              <span>Settlement: <strong className="text-amber-300">{payoutCountdown}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* DAILY LEVEL INCOME FULFILLMENT ENGINE */}
      <div className="p-5 rounded-[20px] bg-white/70 backdrop-blur-[12px] border border-white/10 shadow-sm text-left relative overflow-hidden">
        
        <div className="flex justify-between items-center pb-3.5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4.5 h-4.5 text-[#0A3D91]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
              Daily Level Income Fulfillment
            </h3>
          </div>
          <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-mono">
            {getLevelName(userVipLevel)}
          </span>
        </div>

        <div className="py-4 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          <div className="space-y-3.5 flex-1 w-full">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-slate-500 font-mono font-medium">Daily Target Income:</span>
              <span className="text-xl font-mono font-extrabold text-[#0A3D91]">
                {levelIncomeTotal} <span className="text-xs text-slate-500">ETB</span>
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-semibold text-slate-500 font-mono">
                <span>Distribution Status:</span>
                <span className={totalAllocationSum === 100 ? "text-[#0A3D91] font-bold" : "text-amber-500 animate-pulse font-bold"}>
                  {totalAllocationSum}% Allocated
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden flex border border-slate-200/60 p-[1px]">
                <div 
                  className={`rounded-full h-full transition-all duration-500 ${totalAllocationSum === 100 ? "bg-gradient-to-r from-[#0A3D91] to-blue-500" : "bg-amber-500"}`}
                  style={{ width: `${Math.min(100, totalAllocationSum)}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 text-slate-500 font-medium leading-relaxed bg-slate-50 border border-slate-150 p-3.5 rounded-[16px] text-[10.5px] space-y-1.5">
              <span className="font-extrabold text-[#0A3D91] uppercase tracking-wide block mb-1">⚙️ AUTOMATIC PORTFOLIO SYSTEM ACTIVATED</span>
              <p>Your active projects automatically generate and accumulate returns throughout the day under the Lumora Asset Allocation model.</p>
              <p>The system continuously allocates project performance and combines earnings from all active projects to fulfill 100% of your daily level return target.</p>
              <p>Once the daily target is reached, the accumulated profit is credited and becomes available for collection in the Claim Center.</p>
            </div>
          </div>

          {/* Daily Income Fulfillment Ring UI Element */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-150 min-w-[150px] shrink-0 text-center space-y-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono">Fulfillment Cycle</span>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#e2e8f0"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#0A3D91"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 26}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] font-mono font-black text-slate-800">100%</span>
              </div>
            </div>
            <p className="text-[8.5px] font-bold text-[#0A3D91] max-w-[120px] leading-tight mt-1">
              Income fully distributed across selected projects
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE INVESTMENT PROJECTS SECTION */}
      <div className="space-y-3.5 text-left">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-1.5 h-3.5 bg-[#0A3D91] rounded-full inline-block animate-pulse"></span>
            <span>Active Investment Projects</span>
          </h3>
          <span className="text-[9px] font-mono font-black text-[#0A3D91] uppercase tracking-wide bg-slate-50 border border-slate-150 px-2.5 py-0.5 rounded-full">
            {selectedProjectsData.length} Selected
          </span>
        </div>

        {portfolioLockInfo.isLocked && (
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-150 flex items-start space-x-3.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#0A3D91]/5 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#0A3D91] animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-slate-800 font-sans uppercase tracking-wider">30-Day Portfolio Lock Period Active</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                Under Lumora asset-stability regulations, your active project selection is locked for a 30-day period. Locked until <strong className="text-slate-800 font-extrabold">{portfolioLockInfo.lockUntilStr}</strong> ({portfolioLockInfo.remainingDays} days remaining). The system automatically manages your distributions evenly across your active selections.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {selectedProjectsData.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
              <Lock className="w-8 h-8 text-[#0A3D91]/60 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-[#0A3D91] uppercase tracking-wider">No Active Investment Projects</p>
              <p className="text-[10px] text-slate-800 font-extrabold max-w-sm mx-auto leading-relaxed">
                You do not have any active investment plan. Please visit the <strong className="text-[#0A3D91]">Plans</strong> page and purchase a VIP plan to enable automated project allocations.
              </p>
            </div>
          ) : (
            selectedProjectsData.map((p) => {
              const alloc = allocations[p.id] || 0;
              const contribETB = calculatedContributions[p.id] || 0;
              return (
                <div 
                  key={p.id}
                  className="p-4 rounded-[20px] bg-white/70 backdrop-blur-[12px] border border-white/10 pr-4 pl-5 relative overflow-hidden shadow-2xs hover:border-[#0A3D91]/30 hover:shadow-xs transition-all duration-300"
                >
                  {/* Visual Accent bar on the left */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${p.status === 'Active' ? 'bg-[#0A3D91]' : 'bg-amber-400'}`}></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{p.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-display font-extrabold text-xs text-slate-800 tracking-tight">
                            {p.name}
                          </h4>
                          <span className="px-1.5 py-0.5 text-[8px] font-bold bg-[#0A3D91]/10 text-[#0A3D91] border border-[#0A3D91]/20 rounded-md">
                            {alloc}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[9px] text-slate-400 font-bold font-mono">Today:</span>
                          <span className="text-[9px] text-[#0A3D91] font-extrabold font-mono flex items-center">
                            {p.trend}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3.5">
                      {/* Glowing Micro Trend Chart */}
                      <div className="shrink-0">
                        {renderSparkline(p.isPositive)}
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-[#0A3D91] block">
                          {contribETB.toFixed(2)} <span className="text-[9px] text-slate-500">ETB</span>
                        </span>
                        <span className="inline-flex items-center space-x-1 mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`}></span>
                          <span className="text-[8px] font-bold text-slate-400 font-mono uppercase">
                            {p.status}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* REAL-TIME MARKET CONDITIONS */}
      <div className="p-4.5 rounded-[20px] bg-white/70 backdrop-blur-[12px] border border-white/10 shadow-sm text-left space-y-4">
        
        {/* Header bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-3.5 bg-[#0A3D91] rounded-full inline-block animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0A3D91] font-mono">
              REAL-TIME MARKET CONDITIONS
            </span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-wider font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0"></span>
            <span>Last Updated: Live</span>
          </span>
        </div>

        {/* Live Infinite Scrolling Sentiment Ticker */}
        <div className="relative w-full overflow-hidden bg-slate-50 py-2.5 border-y border-slate-200 rounded-xl select-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
          
          {(() => {
            const activeSentiments = MARKET_SENTIMENTS.filter(item => activeProjects.includes(item.id));
            if (activeSentiments.length === 0) {
              return (
                <div className="w-full text-center text-slate-400 font-mono text-[9.5px] font-black uppercase py-0.5 tracking-wider">
                  No active portfolio items to track • purchase plans to begin
                </div>
              );
            }
            // Repeat active items to ensure smooth scrolling loop
            const repeated = [];
            const multiplier = activeSentiments.length < 3 ? 12 : 6;
            for (let i = 0; i < multiplier; i++) {
              repeated.push(...activeSentiments);
            }
            return (
              <motion.div 
                className="flex space-x-12 whitespace-nowrap animate-scroll"
                animate={{ x: [0, -600] }}
                transition={{
                  ease: "linear",
                  duration: 20,
                  repeat: Infinity,
                }}
                style={{ display: 'inline-flex' }}
              >
                {repeated.map((item, idx) => {
                  const matchedProj = DEFAULT_PROJECTS.find(p => p.id === item.id);
                  return (
                    <div key={`${item.id}-ticker-${idx}`} className="inline-flex items-center space-x-2.5 text-[10px] font-mono">
                      <span className="text-sm shrink-0">
                        {matchedProj?.icon || '⚙️'}
                      </span>
                      <span className="font-black text-slate-700 tracking-tight">{item.ticker}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center space-x-0.5 ${item.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                        <span>{item.sentiment === 'Bullish' ? '▲' : '▼'}</span>
                        <span>{item.sentiment.toUpperCase()}</span>
                        <span className="ml-0.5">{item.change}</span>
                      </span>
                      <span className="text-[8px] font-bold text-[#0A3D91] font-mono bg-[#0A3D91]/10 px-1.5 py-0.5 rounded border border-[#0A3D91]/15">
                        ACTIVE PORTFOLIO ({allocations[item.id] || 0}%)
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            );
          })()}
        </div>

        {/* Traditional Market Grid Widgets */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 flex flex-col justify-between items-start select-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Cryptocurrency Market
            </span>
            <span className="text-xs font-semibold text-emerald-600 mt-1 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Bullish • Stable Growth</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 flex flex-col justify-between items-start select-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Forex Market
            </span>
            <span className="text-xs font-semibold text-emerald-600 mt-1 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Bullish • Positive Trend</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 flex flex-col justify-between items-start select-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Stock Market
            </span>
            <span className="text-xs font-semibold text-amber-600 mt-1 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Bearish • Moderate Volatility</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-150 flex flex-col justify-between items-start select-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Portfolio Risk Level
            </span>
            <span className="text-xs font-semibold text-emerald-600 mt-1 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Controlled</span>
            </span>
          </div>
        </div>

        {/* Sentiment Analysis Breakdown List */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-400 font-mono">
              Market Sentiment & Influence Indicators
            </span>
            {/* Filter buttons */}
            <div className="flex space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {(['all', 'bullish', 'bearish'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedSentimentFilter(filter)}
                  className={`px-2 py-0.5 text-[8.5px] font-mono font-bold rounded uppercase transition-colors cursor-pointer ${selectedSentimentFilter === filter ? 'bg-[#0A3D91] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {(() => {
              const activeSentimentList = MARKET_SENTIMENTS.filter(item => {
                const isSelected = activeProjects.includes(item.id);
                if (!isSelected) return false;
                if (selectedSentimentFilter === 'all') return true;
                return item.sentiment.toLowerCase() === selectedSentimentFilter;
              });

              if (activeSentimentList.length === 0) {
                return (
                  <div className="text-center py-8 px-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-[20px] text-slate-400 font-mono text-[9.5px] font-black uppercase tracking-wider">
                    {activeProjects.length === 0 
                      ? 'No active investment projects found' 
                      : `No active ${selectedSentimentFilter} indicators match your portfolio`
                    }
                  </div>
                );
              }

              return activeSentimentList.map((item) => {
                const isSelected = activeProjects.includes(item.id);
                const alloc = allocations[item.id] || 0;
                const contribution = calculatedContributions[item.id] || 0;
                const isExpanded = expandedSentimentId === item.id;

                return (
                  <div 
                    key={item.id} 
                    className={`rounded-2xl border transition-all duration-200 ${isExpanded ? 'bg-slate-50 border-[#0A3D91]/30 shadow-xs' : 'bg-slate-50/40 border-slate-150 hover:border-slate-250'}`}
                  >
                    <div 
                      onClick={() => setExpandedSentimentId(isExpanded ? null : item.id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {DEFAULT_PROJECTS.find(p => p.id === item.id)?.icon || '⚙️'}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-extrabold text-slate-800">{item.name}</span>
                            <span className="text-[9px] font-mono font-bold text-[#0A3D91]">{item.ticker}</span>
                          </div>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5 font-semibold">
                            Sentiment score: <strong className={item.sentiment === 'Bullish' ? 'text-emerald-600' : 'text-rose-600'}>{item.score}%</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${item.sentiment === 'Bullish' ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-600 border border-rose-500/20'}`}>
                          {item.sentiment}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#0A3D91]' : ''}`} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3.5 pb-3.5 pt-0.5 border-t border-slate-100 space-y-3.5 text-[10px]">
                            {/* Reason */}
                            <div className="space-y-1">
                              <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider font-mono block">Market Catalyst Analysis:</span>
                              <p className="text-slate-600 font-medium font-sans leading-relaxed">
                                {item.reason}
                              </p>
                            </div>

                            {/* Live connection/Portfolio influence box */}
                            <div className={`p-3 rounded-xl border flex items-start space-x-2.5 bg-amber-500/5 border-amber-300/30 text-slate-750`}>
                              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                              <div className="space-y-1">
                                <span className="text-[8.5px] font-black uppercase tracking-wider font-mono block">
                                  ACTIVE PORTFOLIO IMPACT
                                </span>
                                <p className="font-medium font-sans leading-relaxed">
                                  This {item.sentiment.toLowerCase()} market signal directly influences your <strong className="text-slate-800">{alloc}% active allocation</strong>. 
                                  Your portfolio is capturing <strong className="text-[#0A3D91]">{contribution.toFixed(2)} ETB</strong> daily from this project based on system calculations. {item.influence}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              });
            })()}
          </div>
        </div>

      </div>

      {/* LUMORA INVESTMENT TEAM ACTIVITY */}
      <div className="relative p-5 rounded-[20px] bg-white/70 backdrop-blur-[12px] border border-white/10 shadow-sm text-left overflow-hidden">
        
        {/* Subtle geometric overlay */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none"></div>

        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
          <Cpu className="w-4.5 h-4.5 text-[#0A3D91]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 font-mono">
            LUMORA INVESTMENT TEAM ACTIVITY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-7 space-y-2.5">
            {[
              "Monitoring global markets 24/7",
              "Managing risk exposure",
              "Automating portfolio allocations",
              "Protecting capital during volatility",
              "Optimizing investment performance",
              "Identifying new opportunities"
            ].map((text, i) => (
              <div key={i} className="flex items-center space-x-2 text-[10px] text-slate-600 font-bold font-mono">
                <Check className="w-3.5 h-3.5 text-[#0A3D91] shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="md:col-span-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-150 space-y-2.5">
            <span className="text-[8.5px] uppercase font-black tracking-widest text-slate-400 font-mono block">AI Status Panel</span>
            
            <div className="space-y-1.5 font-mono text-[9px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Team Monitoring:</span>
                <span className="text-[#0A3D91] font-extrabold uppercase tracking-wide">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Risk Management:</span>
                <span className="text-[#0A3D91] font-extrabold uppercase tracking-wide">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Portfolio Opt.:</span>
                <span className="text-[#0A3D91] font-extrabold uppercase tracking-wide animate-pulse">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Market Analysis:</span>
                <span className="text-emerald-600 font-extrabold uppercase tracking-wide">Real-Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW DAILY RETURNS ARE MANAGED */}
      <div className="p-4 rounded-[20px] bg-blue-50/40 backdrop-blur-[12px] border border-white/10 text-left relative overflow-hidden">
        <div className="flex items-start space-x-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0A3D91]" />
          <div className="space-y-1">
            <span className="text-[9.5px] uppercase font-bold text-[#0A3D91] tracking-wider font-mono block">How Daily Returns are Managed</span>
            <p className="text-[9.5px] text-slate-600 leading-relaxed font-semibold font-sans">
              The Lumora investment management system continuously analyzes market conditions, monitors selected project performance, manages risk, diversifies allocations, and adjusts strategies to maintain stability and long-term growth. Daily income is automatically distributed evenly across your active projects and finalized at settlement time.
            </p>
          </div>
        </div>
      </div>

      {/* CLAIM CENTER (SETTLEMENT SYSTEM) */}
      <div className="p-5 rounded-[20px] bg-white/70 backdrop-blur-[12px] border border-white/10 text-left relative overflow-hidden shadow-sm">
        
        <div className="flex items-center space-x-2 pb-3.5 border-b border-slate-100 mb-4">
          <Activity className="w-4.5 h-4.5 text-[#0A3D91]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 font-mono">
            CLAIM CENTER (SETTLEMENT SYSTEM)
          </span>
        </div>

        <div className="space-y-3.5">
          {/* VISUAL SETTLEMENT COUNTDOWN */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-500 animate-pulse" />
                <span className="text-[11px] text-slate-500 font-mono font-bold uppercase tracking-wider">Next Settlement Cycle</span>
              </div>
              <span className="text-xs font-mono font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md shadow-3xs border border-cyan-100 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-1"></span>
                <span>{payoutCountdown}</span>
              </span>
            </div>
            
            {/* Soft-glowing cyan progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
                <span>Cycle Progress</span>
                <span>{settlementProgress.toFixed(1)}%</span>
              </div>
              <div className="relative w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden p-[1px] shadow-inner">
                {/* Glow layer */}
                <motion.div 
                  className="absolute top-0 bottom-0 left-0 bg-cyan-400 rounded-full blur-[1px]"
                  style={{ width: `${settlementProgress}%` }}
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Solid bar */}
                <div 
                  className="relative h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all duration-1000 ease-out"
                  style={{ width: `${settlementProgress}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400 font-sans leading-relaxed">
                Automated smart settlement occurs daily at midnight. Earnings are compiled automatically based on your active projects.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-slate-500 font-mono font-medium">Daily Level Income Total:</span>
              <span className="text-lg font-mono font-black text-[#0A3D91]">
                {levelIncomeTotal} ETB
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-150">
              <span className="text-[8.5px] uppercase font-black text-[#0A3D91] tracking-wider font-mono block">Project Breakdown:</span>
              <div className="space-y-1 text-[10px] font-mono font-semibold">
                {selectedProjectsData.map(p => (
                  <div key={p.id} className="flex justify-between text-slate-600">
                    <span>{p.icon} {p.name} ({allocations[p.id] || 0}%):</span>
                    <span className="text-[#0A3D91]">{calculatedContributions[p.id] || 0} ETB</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[10px] text-slate-600 font-mono font-medium">Accumulated Profit Status:</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-mono font-black text-emerald-600 uppercase tracking-wide">Ready to Claim</span>
            </div>
          </div>

          {claimStatus && (
            <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed font-semibold flex items-start space-x-2.5 ${claimStatus.isError ? 'bg-amber-500/10 border-amber-500/25 text-amber-850' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-850'}`}>
              {claimStatus.isError ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />}
              <span>{claimStatus.text}</span>
            </div>
          )}

          <button 
            onClick={handleClaimProfit}
            disabled={claimLoading}
            className={`w-full py-4 px-5 rounded-2xl text-xs font-black uppercase font-mono tracking-widest text-center shadow-md transition-all duration-300 flex items-center justify-center space-x-2.5 cursor-pointer ${claimLoading ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-gradient-to-r from-[#0A3D91] via-blue-700 to-[#0A3D91] hover:from-[#072452] hover:to-[#0A3D91] text-white shadow-sm hover:shadow-md active:scale-98'}`}
          >
            {claimLoading ? (
              <>
                <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
                <span>Processing Settlement...</span>
              </>
            ) : (
              <>
                <Flame className="w-4.5 h-4.5 text-white animate-pulse" />
                <span>Claim Profit ({levelIncomeTotal} ETB)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CELEBRATION SUCCESS MODAL */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl text-slate-800"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4.5 shadow-sm">
                <Award className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>

              <h3 className="font-display font-black text-lg text-slate-900 mb-2 tracking-tight">
                Profit Settlement Complete!
              </h3>
              
              <p className="text-xs text-slate-600 leading-relaxed max-w-[280px] mx-auto mb-5 font-bold font-sans">
                Successfully credited your daily level earnings to your <strong className="text-[#0A3D91]">Income Pool Balance</strong>. Your portfolio assets have been successfully settled.
              </p>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl mb-6 space-y-1.5 font-mono">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Transferred Amount</span>
                <span className="text-2xl font-black text-emerald-600">+{celebratedAmount.toFixed(2)} ETB</span>
              </div>

              <button 
                onClick={() => {
                  setShowCelebration(false);
                  onRefreshDashboard();
                }}
                className="w-full py-3 bg-[#0A3D91] hover:bg-[#072452] active:scale-98 text-white text-xs font-black uppercase tracking-wider font-mono rounded-xl shadow-lg shadow-[#0A3D91]/20 transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
