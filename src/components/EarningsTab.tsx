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
  { id: 'crypto', name: 'Cryptocurrency Market', icon: '🪙', status: 'Active', trend: '+0.8%', isPositive: true, defaultAlloc: 30 },
  { id: 'forex', name: 'Forex Trading', icon: '💱', status: 'Active', trend: '+0.7%', isPositive: true, defaultAlloc: 25 },
  { id: 'stock', name: 'Global Stock Indexes', icon: '📈', status: 'Active', trend: '+0.6%', isPositive: true, defaultAlloc: 20 },
  { id: 'ai_fund', name: 'AI Technology Fund', icon: '🤖', status: 'Monitoring', trend: '+0.4%', isPositive: true, defaultAlloc: 15 },
  { id: 'infra', name: 'Core Infrastructure', icon: '🏗️', status: 'Active', trend: '+0.5%', isPositive: true, defaultAlloc: 10 }
];

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

export default function EarningsTab({ investments, profile, onRefreshDashboard }: EarningsTabProps) {
  const { language, t } = useLanguage();
  
  // Real-time states
  const [payoutCountdown, setPayoutCountdown] = useState<string>('00:00:00');
  const [liveStreamRate, setLiveStreamRate] = useState<number>(0);
  const [activeProjects, setActiveProjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumora_selected_projects');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS.map(p => p.id);
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

  const [isEditingAlloc, setIsEditingAlloc] = useState<boolean>(false);
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [claimStatus, setClaimStatus] = useState<{ text: string; isError: boolean } | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebratedAmount, setCelebratedAmount] = useState<number>(0);

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
  const selectedProjectsData = DEFAULT_PROJECTS.filter(p => activeProjects.includes(p.id));
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
    if (activeProjects.length === 0) return;
    const share = Math.floor(100 / activeProjects.length);
    const updated: Record<string, number> = {};
    
    activeProjects.forEach((id, idx) => {
      if (idx === activeProjects.length - 1) {
        updated[id] = 100 - (share * (activeProjects.length - 1));
      } else {
        updated[id] = share;
      }
    });
    setAllocations(prev => ({ ...prev, ...updated }));
  };

  // Toggle project selected state
  const toggleProject = (projectId: string) => {
    setActiveProjects(prev => {
      let next;
      if (prev.includes(projectId)) {
        if (prev.length <= 1) return prev; // At least one project
        next = prev.filter(id => id !== projectId);
      } else {
        next = [...prev, projectId];
      }
      
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
    const color = isPositive ? '#06b6d4' : '#e11d48';
    const points = isPositive 
      ? "0,35 15,28 30,30 45,15 60,18 75,5" 
      : "0,5 15,18 30,15 45,30 60,25 75,35";
    return (
      <svg className="w-16 h-8 overflow-visible" viewBox="0 0 75 40">
        <defs>
          <linearGradient id="cyan-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d={`M ${points} L 75 40 L 0 40 Z`}
          fill="url(#cyan-glow)"
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]"
        />
        <circle cx="75" cy={isPositive ? "5" : "35"} r="2" fill={color} className="animate-ping" />
      </svg>
    );
  };

  return (
    <div id="lumora-earnings-tab" className="bg-[#050B1A] text-white p-4 rounded-3xl space-y-6 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
      
      {/* Absolute Neon Glow background decorations */}
      <div className="absolute top-0 right-[-10%] w-60 h-60 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* HEADER SECTION */}
      <div className="flex flex-col space-y-2 border-b border-cyan-500/10 pb-3.5 relative">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-cyan-300 to-cyan-500 bg-clip-text text-transparent font-sans">
              Lumora
            </span>
            <span className="text-xs text-cyan-400/90 font-medium tracking-wide">
              Earnings Dashboard
            </span>
          </div>
          
          <div className="flex items-center space-x-2.5">
            {/* Wallet Quick Balance Widget */}
            <div className="flex items-center space-x-1.5 bg-[#09152e]/90 border border-cyan-500/15 rounded-xl py-1.5 px-3 shadow-md hover:border-cyan-500/30 transition-all">
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono font-bold text-slate-100">
                {(profile?.incomeBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 1 })} ETB
              </span>
            </div>

            {/* Notification trigger icon */}
            <div className="w-8 h-8 rounded-xl bg-[#09152e]/90 border border-cyan-500/15 flex items-center justify-center cursor-pointer relative hover:bg-[#0c1e40] transition-colors">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </div>
          </div>
        </div>
        {/* Glowing animated line */}
        <div className="w-full h-[1px] bg-cyan-950 relative overflow-hidden mt-2">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-40"
            animate={{
              x: ['-100%', '300%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>

      {/* COMPREHENSIVE VAULT CARD */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/15 bg-gradient-to-br from-[#0c1933]/90 via-[#071124]/95 to-[#050B1A] p-5 shadow-[0_0_20px_rgba(6,182,212,0.06)] hover:shadow-[0_0_25px_rgba(6,182,212,0.12)] transition-all duration-300">
        
        {/* Matrix scanning effect overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.1)_1px,transparent_1px)] bg-[size:16px_16px] opacity-25 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                <Coins className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-black tracking-widest font-mono text-cyan-400/90 uppercase">
                LUMORA COMPREHENSIVE VAULT
              </span>
            </div>
            
            <span className="px-2.5 py-0.5 text-[8px] font-black font-mono rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center space-x-1 shadow-sm">
              <Cpu className="w-3 h-3 text-cyan-400 animate-spin-slow shrink-0" />
              <span className="uppercase tracking-wide">SECURE VAULT ACTIVE</span>
            </span>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Balance data */}
            <div className="col-span-7 space-y-1">
              <p className="text-[9.5px] text-slate-400 uppercase tracking-wider font-mono font-semibold">
                Total Account Balance
              </p>
              <p className="text-3xl font-extrabold text-white tracking-tight font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {(profile?.walletBalance ?? 0).toLocaleString()}
                <span className="text-xs text-cyan-400 font-bold ml-1.5 uppercase font-mono">ETB</span>
              </p>
              
              <div className="pt-2 flex flex-col space-y-1">
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-300 font-mono">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                  <span>Stream rate: <strong className="text-cyan-300">+{liveStreamRate.toFixed(4)}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-300 font-mono">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Est. Daily Yield: <strong className="text-emerald-400">+{levelIncomeTotal.toLocaleString()} ETB</strong></span>
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
                    stroke="#101e38"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#06b6d4"
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
                  <span className="text-[7.5px] text-cyan-400/80 uppercase font-mono font-semibold tracking-wider mt-0.5">SECURE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-cyan-550/15 flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <div className="flex items-center space-x-1.5 text-cyan-400/90 font-medium">
              <ShieldCheck className="w-4 h-4 text-cyan-400 stroke-[2]" />
              <span>Secure Vault Protected by AI Systems</span>
            </div>
            
            <div className="flex items-center space-x-1 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/15 text-[8px]">
              <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Settlement: <strong className="text-cyan-400">{payoutCountdown}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* DAILY LEVEL INCOME FULFILLMENT ENGINE */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c1a36] to-[#060e1f] border border-cyan-500/15 shadow-md text-left relative overflow-hidden">
        
        <div className="flex justify-between items-center pb-3.5 border-b border-cyan-500/10">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4.5 h-4.5 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-sans">
              Daily Level Income Fulfillment
            </h3>
          </div>
          <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950 border border-cyan-500/25 px-2.5 py-0.5 rounded-full font-mono">
            {getLevelName(userVipLevel)}
          </span>
        </div>

        <div className="py-4 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          <div className="space-y-3.5 flex-1 w-full">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-slate-300 font-mono font-medium">Daily Target Income:</span>
              <span className="text-xl font-mono font-extrabold text-cyan-300">
                {levelIncomeTotal} <span className="text-xs text-white">ETB</span>
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 font-mono">
                <span>Distribution Status:</span>
                <span className={totalAllocationSum === 100 ? "text-cyan-400" : "text-amber-400 animate-pulse"}>
                  {totalAllocationSum}% Allocated
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#09152e] rounded-full overflow-hidden flex border border-cyan-500/10 p-[1px]">
                <div 
                  className={`rounded-full h-full transition-all duration-500 ${totalAllocationSum === 100 ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-amber-500"}`}
                  style={{ width: `${Math.min(100, totalAllocationSum)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1.5">
              <button 
                onClick={handleAutoDistribute}
                className="text-[10px] font-mono font-black uppercase bg-[#09152e] border border-cyan-500/20 px-3 py-1.5 rounded-xl text-cyan-400 hover:bg-cyan-950/50 hover:border-cyan-400 transition-colors"
              >
                Distribute Evenly
              </button>
              {totalAllocationSum !== 100 && (
                <button 
                  onClick={handleRebalance}
                  className="text-[10px] font-mono font-black uppercase bg-cyan-900/35 border border-cyan-400/40 px-3 py-1.5 rounded-xl text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin-slow shrink-0" />
                  <span>Auto Rebalance (100%)</span>
                </button>
              )}
              <button 
                onClick={() => setIsEditingAlloc(!isEditingAlloc)}
                className={`text-[10px] font-mono font-black uppercase px-3 py-1.5 rounded-xl transition-all ${isEditingAlloc ? 'bg-cyan-500 text-[#050B1A] border border-cyan-400' : 'bg-[#09152e] border border-cyan-500/15 text-slate-300 hover:border-cyan-500/35'}`}
              >
                {isEditingAlloc ? 'Lock Allocation' : 'Customize Sliders'}
              </button>
            </div>
          </div>

          {/* Daily Income Fulfillment Ring UI Element */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#09142c]/50 border border-cyan-500/10 min-w-[150px] shrink-0 text-center space-y-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono">Fulfillment Cycle</span>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#0b1730"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke={totalAllocationSum === 100 ? "#06b6d4" : "#f59e0b"}
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 26}
                  initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 26) * (1 - (totalAllocationSum === 100 ? 100 : totalAllocationSum) / 100) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] font-mono font-black text-white">{totalAllocationSum}%</span>
              </div>
            </div>
            <p className="text-[8.5px] font-bold text-cyan-400/90 max-w-[120px] leading-tight mt-1">
              {totalAllocationSum === 100 
                ? "Income fully distributed across selected projects"
                : "Adjust allocations to reach 100% distribution"}
            </p>
          </div>
        </div>

        {/* Interactive Checkbox / Selector list */}
        {isEditingAlloc && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-cyan-500/10 space-y-3"
          >
            <p className="text-[9.5px] text-slate-400 uppercase tracking-wider font-bold font-mono">Select Portfolio Projects & Set Allocation weights:</p>
            <div className="grid grid-cols-1 gap-2.5">
              {DEFAULT_PROJECTS.map(p => {
                const isSelected = activeProjects.includes(p.id);
                return (
                  <div key={p.id} className={`p-3.5 rounded-2xl border transition-all ${isSelected ? 'bg-[#09152e] border-cyan-500/30' : 'bg-slate-950/20 border-slate-900 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => toggleProject(p.id)}>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-500 border-cyan-400 text-[#050B1A]' : 'border-slate-700'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-black">{p.icon} {p.name}</span>
                      </div>
                      
                      {isSelected && (
                        <span className="text-xs font-mono font-black text-cyan-400">{allocations[p.id] || 0}%</span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="mt-3 flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={allocations[p.id] || 0}
                          onChange={(e) => handleAllocationSlider(p.id, Number(e.target.value))}
                          className="w-full accent-cyan-400 bg-cyan-950 h-1 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* ACTIVE INVESTMENT PROJECTS SECTION */}
      <div className="space-y-3.5 text-left">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-1.5 h-3.5 bg-cyan-400 rounded-full inline-block animate-pulse"></span>
            <span>Active Investment Projects</span>
          </h3>
          <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-wide bg-cyan-950/60 border border-cyan-500/15 px-2.5 py-0.5 rounded-full">
            {selectedProjectsData.length} Selected
          </span>
        </div>

        <div className="space-y-3">
          {selectedProjectsData.map((p) => {
            const alloc = allocations[p.id] || 0;
            const contribETB = calculatedContributions[p.id] || 0;
            return (
              <div 
                key={p.id}
                className="p-4 rounded-2xl bg-[#091226]/80 border border-cyan-500/10 pr-4 pl-5 relative overflow-hidden shadow-sm hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all duration-300"
              >
                {/* Visual Glassmorphic accent bar on the left */}
                <div className={`absolute top-0 left-0 w-1 h-full ${p.status === 'Active' ? 'bg-gradient-to-b from-cyan-400 to-blue-500' : 'bg-amber-400'}`}></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-display font-extrabold text-xs text-white tracking-tight">
                          {p.name}
                        </h4>
                        <span className="px-1.5 py-0.5 text-[8px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md">
                          {alloc}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[9px] text-slate-400 font-bold font-mono">Today:</span>
                        <span className="text-[9px] text-cyan-400 font-extrabold font-mono flex items-center">
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
                      <span className="text-xs font-mono font-black text-cyan-300 block">
                        {contribETB.toFixed(2)} <span className="text-[9px] text-white">ETB</span>
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
          })}
        </div>
      </div>

      {/* REAL-TIME MARKET CONDITIONS */}
      <div className="p-4.5 rounded-3xl bg-gradient-to-br from-[#071124] to-[#040a17] border border-cyan-500/10 shadow-sm text-left space-y-3.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-mono">
            REAL-TIME MARKET CONDITIONS
          </span>
          <span className="text-[8px] font-black uppercase tracking-wider font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/20 px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0"></span>
            <span>Last Updated: Live</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-[#091226]/50 border border-cyan-500/10 flex flex-col justify-between items-start select-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Cryptocurrency Market
            </span>
            <span className="text-xs font-semibold text-emerald-400 mt-1 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Stable Growth</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#091226]/50 border border-cyan-500/10 flex flex-col justify-between items-start select-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Forex Market
            </span>
            <span className="text-xs font-semibold text-emerald-400 mt-1 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Positive Trend</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#091226]/50 border border-cyan-500/10 flex flex-col justify-between items-start select-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Stock Market
            </span>
            <span className="text-xs font-semibold text-amber-400 mt-1 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Moderate Volatility</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#091226]/50 border border-cyan-500/10 flex flex-col justify-between items-start select-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              Portfolio Risk Level
            </span>
            <span className="text-xs font-semibold text-emerald-400 mt-1 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Controlled</span>
            </span>
          </div>
        </div>
      </div>

      {/* LUMORA INVESTMENT TEAM ACTIVITY */}
      <div className="relative p-5 rounded-3xl bg-gradient-to-br from-[#0c1a36]/90 via-[#071124]/95 to-[#050B1A] border border-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.05)] text-left overflow-hidden">
        
        {/* Futurist control room style scanning line effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse pointer-events-none"></div>
        <div className="absolute inset-x-0 h-4 bg-gradient-to-b from-cyan-500/5 to-transparent animate-pulse pointer-events-none" style={{ animationDuration: '3.5s' }}></div>

        <div className="flex items-center space-x-2 pb-3 border-b border-cyan-500/10 mb-4">
          <Cpu className="w-4.5 h-4.5 text-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white font-mono">
            LUMORA INVESTMENT TEAM ACTIVITY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-7 space-y-2.5">
            {[
              "Monitoring global markets 24/7",
              "Managing risk exposure",
              "Rebalancing portfolio allocations",
              "Protecting capital during volatility",
              "Optimizing investment performance",
              "Identifying new opportunities"
            ].map((text, i) => (
              <div key={i} className="flex items-center space-x-2 text-[10px] text-slate-300 font-bold font-mono">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="md:col-span-5 p-3.5 rounded-2xl bg-slate-950/50 border border-cyan-500/10 space-y-2.5">
            <span className="text-[8.5px] uppercase font-black tracking-widest text-slate-400 font-mono block">AI Status Panel</span>
            
            <div className="space-y-1.5 font-mono text-[9px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Team Monitoring:</span>
                <span className="text-cyan-400 font-extrabold uppercase tracking-wide">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Risk Management:</span>
                <span className="text-cyan-400 font-extrabold uppercase tracking-wide">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Portfolio Opt.:</span>
                <span className="text-cyan-400 font-extrabold uppercase tracking-wide animate-pulse">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Market Analysis:</span>
                <span className="text-emerald-400 font-extrabold uppercase tracking-wide">Real-Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW DAILY RETURNS ARE MANAGED */}
      <div className="p-4 rounded-3xl bg-[#091226]/50 border border-cyan-500/10 text-left relative overflow-hidden">
        <div className="flex items-start space-x-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
          <div className="space-y-1">
            <span className="text-[9.5px] uppercase font-bold text-cyan-400 tracking-wider font-mono block">How Daily Returns are Managed</span>
            <p className="text-[9.5px] text-slate-400 leading-relaxed font-bold font-sans">
              The Lumora investment management system continuously analyzes market conditions, monitors selected project performance, manages risk, diversifies allocations, and adjusts strategies to maintain stability and long-term growth. Daily income is distributed across selected projects based on allocation weight and finalized at settlement time.
            </p>
          </div>
        </div>
      </div>

      {/* CLAIM CENTER (SETTLEMENT SYSTEM) */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c1c38] to-[#040b17] border border-cyan-500/15 text-left relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.08)]">
        
        <div className="flex items-center space-x-2 pb-3.5 border-b border-cyan-500/10 mb-4">
          <Activity className="w-4.5 h-4.5 text-cyan-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white font-mono">
            CLAIM CENTER (SETTLEMENT SYSTEM)
          </span>
        </div>

        <div className="space-y-3.5">
          <div className="bg-[#050B1A]/80 p-4 rounded-2xl border border-cyan-500/10 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-slate-300 font-mono font-medium">Daily Level Income Total:</span>
              <span className="text-lg font-mono font-black text-cyan-300">
                {levelIncomeTotal} ETB
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-cyan-950">
              <span className="text-[8.5px] uppercase font-black text-slate-400 tracking-wider font-mono block">Project Breakdown:</span>
              <div className="space-y-1 text-[10px] font-mono font-semibold">
                {selectedProjectsData.map(p => (
                  <div key={p.id} className="flex justify-between text-slate-300">
                    <span>{p.icon} {p.name} ({allocations[p.id] || 0}%):</span>
                    <span className="text-cyan-400">{calculatedContributions[p.id] || 0} ETB</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-cyan-950/40 p-3 rounded-2xl border border-cyan-500/10">
            <span className="text-[10px] text-slate-300 font-mono font-medium">Accumulated Profit Status:</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-wide">Ready to Claim</span>
            </div>
          </div>

          {claimStatus && (
            <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed font-semibold flex items-start space-x-2.5 ${claimStatus.isError ? 'bg-amber-500/10 border-amber-500/25 text-amber-200' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'}`}>
              {claimStatus.isError ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />}
              <span>{claimStatus.text}</span>
            </div>
          )}

          <button 
            onClick={handleClaimProfit}
            disabled={claimLoading}
            className={`w-full py-4 px-5 rounded-2xl text-xs font-black uppercase font-mono tracking-widest text-center shadow-lg transition-all duration-300 flex items-center justify-center space-x-2.5 ${claimLoading ? 'bg-cyan-950 text-cyan-400/50 cursor-not-allowed border border-cyan-500/10' : 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#050B1A] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-98 cursor-pointer'}`}
          >
            {claimLoading ? (
              <>
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Processing Settlement...</span>
              </>
            ) : (
              <>
                <Flame className="w-4.5 h-4.5 text-[#050B1A] animate-pulse" />
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
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-[#0c1933] to-[#050B1A] p-6 text-center shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/35 flex items-center justify-center mx-auto mb-4.5 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Award className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>

              <h3 className="font-display font-black text-lg text-white mb-2 tracking-tight">
                Profit Settlement Complete!
              </h3>
              
              <p className="text-xs text-slate-300 leading-relaxed max-w-[280px] mx-auto mb-5 font-bold font-sans">
                Successfully credited your daily level earnings to your <strong className="text-cyan-400">Income Pool Balance</strong>. Your portfolio assets have been successfully settled.
              </p>

              <div className="bg-[#091328] border border-cyan-500/10 p-4 rounded-2xl mb-6 space-y-1.5 font-mono">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Transferred Amount</span>
                <span className="text-2xl font-black text-emerald-400">+{celebratedAmount.toFixed(2)} ETB</span>
              </div>

              <button 
                onClick={() => {
                  setShowCelebration(false);
                  onRefreshDashboard();
                }}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-[#050B1A] text-xs font-black uppercase tracking-wider font-mono rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
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
