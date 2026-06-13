import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  CreditCard,
  ArrowDownRight,
  Coins,
  Settings,
  Clock,
  Bell,
  UserX,
  UserCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Profile, Deposit, Withdrawal, User, Investment, Loan } from "../types";

interface AdminPanelProps {
  onBack: () => void;
  onRefreshDashboard: () => void;
}

interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalInvestments: number;
  activeInvestmentsCount: number;
  totalEarningsPaid: number;
}

interface AdminUserRow extends User {
  profile?: Profile;
  investments?: Investment[];
}

export default function AdminPanel({
  onBack,
  onRefreshDashboard,
}: AdminPanelProps) {
  // Navigation sub-tabs inside back-office
  const [subTab, setSubTab] = useState<
    | "stats"
    | "users"
    | "deposits"
    | "withdrawals"
    | "loans"
    | "broadcast"
    | "settings"
  >("stats");
  const [depositFilter, setDepositFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("all");
  const [withdrawalFilter, setWithdrawalFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("all");
  const [loanFilter, setLoanFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("all");
  const [userFilter, setUserFilter] = useState<"all" | "active_plan">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserIds, setExpandedUserIds] = useState<
    Record<string, boolean>
  >({});
  const [adjustAmount, setAdjustAmount] = useState<Record<string, string>>({});
  const [adjustType, setAdjustType] = useState<
    Record<string, "add" | "subtract">
  >({});
  const [balanceSuccessMsg, setBalanceSuccessMsg] = useState<Record<string, string>>({});
  const [balanceErrorMsg, setBalanceErrorMsg] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<AdminUserRow[]>([]);
  const [depositsList, setDepositsList] = useState<Deposit[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<Withdrawal[]>([]);
  const [loansList, setLoansList] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState("");

  const handleAdjustBalanceSubmit = async (
    userId: string,
    usrName: string,
    selectedType?: "add" | "subtract",
  ) => {
    const amount = adjustAmount[userId] || "";
    const type = selectedType || adjustType[userId] || "add";

    // Clear previous feedback states for this specific user
    setBalanceSuccessMsg((prev) => ({ ...prev, [userId]: "" }));
    setBalanceErrorMsg((prev) => ({ ...prev, [userId]: "" }));

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      const errorText = "Please enter a valid positive adjustment amount.";
      setBalanceErrorMsg((prev) => ({ ...prev, [userId]: errorText }));
      setTimeout(() => {
        setBalanceErrorMsg((prev) => ({ ...prev, [userId]: "" }));
      }, 5000);
      return;
    }

    const typeLabel = type === "add" ? "ADD" : "SUBTRACT";
    const prepWord = type === "add" ? "to" : "from";
    const confirmed = window.confirm(
      `Are you sure you want to ${typeLabel} ${parseFloat(amount).toLocaleString()} ETB ${prepWord} the balance of database user ${usrName}?`,
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/adjust-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: userId,
          amount,
          type,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || "Failed to adjust balance";
        setBalanceErrorMsg((prev) => ({ ...prev, [userId]: errMsg }));
        setTimeout(() => {
          setBalanceErrorMsg((prev) => ({ ...prev, [userId]: "" }));
        }, 5000);
      } else {
        const successMsg = `Successfully adjusted ledger: ${type === "add" ? "Added" : "Subtracted"} ${parseFloat(amount).toLocaleString()} ETB for ${usrName}!`;
        
        setActionMsg(successMsg);
        setTimeout(() => setActionMsg(""), 6000);

        setBalanceSuccessMsg((prev) => ({ ...prev, [userId]: successMsg }));
        setTimeout(() => {
          setBalanceSuccessMsg((prev) => ({ ...prev, [userId]: "" }));
        }, 6000);

        setAdjustAmount((prev) => ({ ...prev, [userId]: "" }));
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      const netError = "Network communication failure; please check connectivity.";
      setBalanceErrorMsg((prev) => ({ ...prev, [userId]: netError }));
      setTimeout(() => {
        setBalanceErrorMsg((prev) => ({ ...prev, [userId]: "" }));
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpanded = (userId: string) => {
    setExpandedUserIds((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Senders for settings/broadcasting
  const [cbeName, setCbeName] = useState("Leykun");
  const [cbeNum, setCbeNum] = useState("1000419524747");
  const [bonusPercent, setBonusPercent] = useState("10");
  const [productionInviteUrl, setProductionInviteUrl] = useState("");
  const [bTitle, setBTitle] = useState("");
  const [bMessage, setBMessage] = useState("");

  // Rejection notes popup helpers
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const runAllFetches = () => {
      fetchStats();
      fetchUsers();
      fetchDeposits();
      fetchWithdrawals();
      fetchLoans();
      fetchSettings();
    };

    runAllFetches();

    // High frequency 3-second synchronization interval for real-time correlation
    const interval = setInterval(runAllFetches, 3000);
    return () => clearInterval(interval);
  }, [subTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsersList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeposits = async () => {
    try {
      const res = await fetch("/api/admin/deposits");
      if (res.ok) setDepositsList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch("/api/admin/withdrawals");
      if (res.ok) setWithdrawalsList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await fetch("/api/admin/loans");
      if (res.ok) setLoansList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setCbeName(data.cbeAccountName);
        setCbeNum(data.cbeAccountNumber);
        setBonusPercent(data.referralBonusPercentage.toString());
        setProductionInviteUrl(data.productionInviteUrl || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Automated 24-hour cycle simulation trigger (Critical feature!)
  const handleSimulateDayTick = async () => {
    setLoading(true);
    setActionMsg("Triggering cycle calculation check...");
    try {
      const res = await fetch("/api/admin/simulate-day", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setActionMsg(
          `Day simulation completed successfully! Intercepted active investments: ${data.triggeredCount}. Total yield payout: ${data.interestPaidTotal} ETB.`,
        );
        fetchStats();
        onRefreshDashboard(); // Sync parent dashboards
      }
    } catch (err) {
      setActionMsg("Failed to process daily simulation.");
    } finally {
      setLoading(false);
      setTimeout(() => setActionMsg(""), 5500);
    }
  };

  // User suspension activation toggle
  const handleUserStatusToggle = async (
    userId: string,
    currentStatus: string,
  ) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, status: nextStatus }),
      });
      if (res.ok) {
        fetchUsers();
        setActionMsg(`User status changed successfully to ${nextStatus}.`);
        setTimeout(() => setActionMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Adjust VIP Level manually
  const handleUserVipUpgrade = async (userId: string, level: number) => {
    try {
      const res = await fetch("/api/admin/users/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, vipLevel: level }),
      });
      if (res.ok) {
        fetchUsers();
        setActionMsg(`Elevated VIP level to Level ${level}.`);
        setTimeout(() => setActionMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel investment plan manually (Admin only)
  const handleCancelInvestment = async (investmentId: string) => {
    try {
      const res = await fetch("/api/admin/investments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investmentId }),
      });
      if (res.ok) {
        fetchUsers();
        fetchStats();
        onRefreshDashboard();
        setActionMsg(
          "Active investment plan successfully cancelled and refunded.",
        );
        setTimeout(() => setActionMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ID card verification actions (Admin decision)
  const handleIdVerificationDecision = async (
    userId: string,
    action: "approve" | "reject",
    rejectionReason?: string,
  ) => {
    try {
      const res = await fetch("/api/admin/users/verify-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, action, rejectionReason }),
      });
      if (res.ok) {
        fetchUsers();
        onRefreshDashboard();
        setActionMsg(
          `Identity verification processed carefully as (${action === "approve" ? "APPROVED" : "REJECTED"}).`,
        );
        setTimeout(() => setActionMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit deposit validation action
  const handleDepositAction = async (
    depositId: string,
    action: "approve" | "reject",
  ) => {
    if (action === "reject" && !rejectReason.trim()) {
      setPendingActionId(depositId);
      return;
    }

    try {
      const res = await fetch("/api/admin/deposits/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositId,
          action,
          rejectionReason: rejectReason,
        }),
      });
      if (res.ok) {
        setPendingActionId(null);
        setRejectReason("");
        setActionMsg(`Receipt deposit successfully ${action}d.`);
        fetchDeposits();
        fetchStats();
        onRefreshDashboard();
        setTimeout(() => setActionMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit withdrawal review checks
  const handleWithdrawAction = async (
    withdrawalId: string,
    action: "approve" | "reject",
  ) => {
    if (action === "reject" && !rejectReason.trim()) {
      setPendingActionId(withdrawalId);
      return;
    }

    try {
      const res = await fetch("/api/admin/withdrawals/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalId,
          action,
          rejectionReason: rejectReason,
        }),
      });
      if (res.ok) {
        setPendingActionId(null);
        setRejectReason("");
        setActionMsg(`Cashout request successfully ${action}d.`);
        fetchWithdrawals();
        fetchStats();
        onRefreshDashboard();
        setTimeout(() => setActionMsg(""), 3050);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoanAction = async (
    loanId: string,
    action: "approve" | "reject",
  ) => {
    if (action === "reject" && !rejectReason.trim()) {
      setPendingActionId(loanId);
      return;
    }

    try {
      const res = await fetch("/api/admin/loans/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId, action, rejectionReason: rejectReason }),
      });
      if (res.ok) {
        setPendingActionId(null);
        setRejectReason("");
        setActionMsg(`Loan request successfully ${action}d.`);
        fetchLoans();
        fetchStats();
        onRefreshDashboard();
        setTimeout(() => setActionMsg(""), 3050);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit core settings
  const handleSettingsSave = async () => {
    try {
      const res = await fetch("/api/admin/settings/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cbeAccountName: cbeName,
          cbeAccountNumber: cbeNum,
          referralBonusPercentage: bonusPercent,
          productionInviteUrl,
        }),
      });
      if (res.ok) {
        setActionMsg("Operational configuration values saved successfully.");
        setTimeout(() => setActionMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSystemResetClick = () => {
    setResetConfirmInput("");
    setShowResetModal(true);
  };

  const executeHardReset = async () => {
    if (resetConfirmInput !== "CONFIRM RESET") return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg("System successfully reset! All non-admin records have been erased.");
        onRefreshDashboard();
        setShowResetModal(false);
        setTimeout(() => setActionMsg(""), 5000);
      } else {
        alert(data.error || "System reset failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred during reset.");
    } finally {
      setLoading(false);
    }
  };

  // Broadcast Notification announcements
  const handleBroadcastSubmit = async () => {
    if (!bTitle.trim() || !bMessage.trim()) return;
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: bTitle, message: bMessage }),
      });
      if (res.ok) {
        const data = await res.json();
        setActionMsg(
          `Broadcast of notice successfully published to ${data.count} active investors.`,
        );
        setBTitle("");
        setBMessage("");
        setTimeout(() => setActionMsg(""), 4500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300 text-slate-900">
      {/* Backoffice Operations Console Header */}
      <div className="bg-gradient-to-r from-blue-50 to-slate-100 border-2 border-slate-300 rounded-2xl p-5 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A3D91]/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={onBack}
              className="p-3 bg-white hover:bg-slate-100 text-[#0A3D91] rounded-xl border-2 border-slate-300 shrink-0 cursor-pointer shadow-3xs transition-transform active:scale-95 duration-100"
              aria-label="Back to main directory"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="font-display font-black text-sm text-[#0A3D91] uppercase tracking-wider flex items-center gap-1.5">
                <span>LUMORA OPERATIONAL GATEWAY</span>
                <span className="px-2 py-0.5 text-[8px] bg-[#0A3D91]/10 text-[#0A3D91] rounded-md font-mono tracking-widest">
                  SECURE PORTAL
                </span>
              </h1>
              <p className="text-[10px] text-slate-800 font-bold mt-0.5">
                Unified Institutional Ledger Reviews, KYC Verification &
                Dividend Schedulers
              </p>
            </div>
          </div>

          {/* Secure 24H Global Simulation Scheduler */}
          <button
            onClick={handleSimulateDayTick}
            disabled={loading}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-display text-[11px] font-black uppercase tracking-wider rounded-xl shadow-sm cursor-pointer flex items-center space-x-2 border-2 border-emerald-500 transition-all shrink-0 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Simulate 24H Dividend Payout</span>
          </button>
        </div>
      </div>

      {/* Real-time status update banner notifications */}
      {actionMsg && (
        <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 text-[11.5px] text-blue-950 leading-relaxed font-mono font-black shadow-3xs animate-in slide-in-from-top-2 duration-150">
          <span className="text-blue-500 mr-2">◈</span>
          {actionMsg}
        </div>
      )}

      {/* Internal Navigation Menu Tabs */}
      <div className="flex overflow-x-auto space-x-2 p-1.5 bg-slate-100 border-2 border-slate-205 rounded-2xl shrink-0 scrollbar-none shadow-3xs mb-4">
        {[
          { id: "stats", label: "Console Overview", icon: ShieldAlert },
          { id: "users", label: "Corporate Accounts", icon: Users },
          { id: "deposits", label: "CBE Queue Receipts", icon: CreditCard },
          {
            id: "withdrawals",
            label: "Sovereign Cashouts",
            icon: ArrowDownRight,
          },
          { id: "loans", label: "Platform Loans", icon: Coins },
          { id: "broadcast", label: "Verified Broadcasts", icon: Bell },
          { id: "settings", label: "System Configurations", icon: Settings },
        ].map((sub) => {
          const isActive = subTab === sub.id;
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setSubTab(sub.id as any);
                setPendingActionId(null);
                setRejectReason("");
              }}
              className={`px-3.5 py-2 rounded-xl font-display text-[10px] font-black uppercase tracking-wider shrink-0 transition-all flex items-center space-x-2 cursor-pointer border-2 ${
                isActive
                  ? "bg-[#0A3D91] border-[#0A3D91] text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-800 hover:text-slate-950 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OPERATIONS DASHBOARD STATS */}
      {subTab === "stats" && stats && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                label: "Active Platform Investors",
                value: stats.totalUsers ?? 0,
                desc: "Profiles saved in local database",
                accent: "border-l-blue-600",
              },
              {
                label: "Verified Deposit Volumes",
                value: `${(stats.totalDeposits ?? 0).toLocaleString()} ETB`,
                desc: "Cleared CBE screenshot receipts",
                accent: "border-l-emerald-600",
              },
              {
                label: "Sovereign Paid Cashouts",
                value: `${(stats.totalWithdrawals ?? 0).toLocaleString()} ETB`,
                desc: "Successfully completed withdrawals",
                accent: "border-l-rose-600",
              },
              {
                label: "Total Asset Allocations",
                value: `${(stats.totalInvestments ?? 0).toLocaleString()} ETB`,
                desc: "Undergoing active maturities",
                accent: "border-l-purple-600",
              },
              {
                label: "Aggregate Yield Accrued",
                value: `${(stats.totalEarningsPaid ?? 0).toLocaleString()} ETB`,
                desc: "Earnings credited via clock trigger",
                accent: "border-l-amber-600",
              },
              {
                label: "Pending Portfolios Earning",
                value: stats.activeInvestmentsCount ?? 0,
                desc: "Earning daily dividends right now",
                accent: "border-l-teal-600",
              },
            ].map((st, idx) => (
              <div
                key={idx}
                className={`p-4.5 bg-white border-2 border-slate-200 border-l-4 ${st.accent} rounded-2xl shadow-3xs`}
              >
                <span className="text-[10px] text-slate-500 uppercase block font-black tracking-wide leading-none">
                  {st.label}
                </span>
                <span className="text-base font-black text-[#0A3D91] mt-2 block tracking-tight font-mono">
                  {st.value}
                </span>
                <span className="text-[9px] text-slate-800 block mt-1.5 font-bold">
                  {st.desc}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 text-[11px] leading-relaxed text-blue-950 font-bold flex items-start space-x-2.5">
            <span className="text-xl">🛠</span>
            <p>
              <strong>Administrative Simulation Notice:</strong> Daily interests
              do not run on real-time slow cron timers. You can simulate full
              24-hour intervals and distribute yield immediately across all
              active VIP portfolios in the system by clicking the{" "}
              <strong>Simulate 24H Dividend Payout</strong> button.
            </p>
          </div>
        </div>
      )}

      {/* 2. CORPORATE ACCOUNTS DIRECTORY */}
      {subTab === "users" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-widest font-sans">
                Investor Directory Registries ({usersList.length})
              </h2>
              <p className="text-[9.5px] text-slate-600 font-medium font-sans">
                Inspect individual user portfolios, suspend entities, or manual
                override VIP levels.
              </p>
            </div>

            <div className="flex space-x-1.5 p-1 bg-slate-100 border-2 border-slate-205 rounded-xl shrink-0">
              <button
                onClick={() => setUserFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                  userFilter === "all"
                    ? "bg-[#0A3D91] text-white shadow-3xs"
                    : "text-slate-850 hover:text-black font-bold"
                }`}
              >
                All Users ({usersList.length})
              </button>
              <button
                onClick={() => setUserFilter("active_plan")}
                className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                  userFilter === "active_plan"
                    ? "bg-[#0A3D91] text-white shadow-3xs"
                    : "text-slate-850 hover:text-black font-bold"
                }`}
              >
                Active Portfolios (
                {
                  usersList.filter((u) =>
                    u.investments?.some((i) => i.status === "active"),
                  ).length
                }
                )
              </button>
            </div>
          </div>

          {/* Real-time search by full name or phone number */}
          <div className="bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by investor name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-xs border-2 border-slate-250 focus:outline-none focus:border-[#0A3D91] focus:ring-1 focus:ring-[#0A3D91] rounded-xl text-slate-900 bg-white font-bold"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650 text-[10px] font-black cursor-pointer uppercase font-sans"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {usersList
              .filter((usr) => {
                if (userFilter === "active_plan") {
                  return usr.investments?.some((i) => i.status === "active");
                }
                return true;
              })
              .filter((usr) => {
                if (searchQuery.trim() !== "") {
                  const q = searchQuery.toLowerCase();
                  const nameMatch = usr.fullName.toLowerCase().includes(q);
                  const phoneMatch = usr.phone.includes(q);
                  return nameMatch || phoneMatch;
                }
                return true;
              }).length === 0 ? (
              <div className="text-center py-12 text-slate-450 bg-white border-2 border-slate-250 rounded-2xl font-bold text-xs uppercase tracking-wider font-mono shadow-3xs">
                No active records matching current search profile filters.
              </div>
            ) : (
              usersList
                .filter((usr) => {
                  if (userFilter === "active_plan") {
                    return usr.investments?.some((i) => i.status === "active");
                  }
                  return true;
                })
                .filter((usr) => {
                  if (searchQuery.trim() !== "") {
                    const q = searchQuery.toLowerCase();
                    const nameMatch = usr.fullName.toLowerCase().includes(q);
                    const phoneMatch = usr.phone.includes(q);
                    return nameMatch || phoneMatch;
                  }
                  return true;
                })
                .map((usr) => {
                  const isExpanded = !!expandedUserIds[usr.id];
                  return (
                    <div
                      key={usr.id}
                      className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-3xl shadow-3xs transition-all duration-200 overflow-hidden"
                    >
                      {/* Clickable Header - Only Name and Phone Number are visible */}
                      <div
                        onClick={() => toggleUserExpanded(usr.id)}
                        className="p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/60 transition-colors rounded-3xl"
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-[#0A3D91] hover:text-blue-900 leading-normal font-sans uppercase">
                            {usr.fullName}
                          </h4>
                          <p className="text-[10px] text-slate-800 font-mono font-bold">
                            Phone:{" "}
                            <span className="text-[#0A3D91] font-black">
                              {usr.phone}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[9px] font-black uppercase font-mono tracking-wider px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-650 border-2 border-slate-200 transition-all hover:bg-slate-200">
                            {isExpanded ? "Hide Details ▲" : "Show Details ▼"}
                          </span>
                        </div>
                      </div>

                      {/* Collapsible Details Panel - Only visible when expanded */}
                      {isExpanded && (
                        <div className="p-5 pt-0 border-t-2 border-slate-100 space-y-4 animate-in fade-in duration-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-b-2 border-slate-100 pb-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-mono font-black text-slate-400 uppercase">
                                  Account Status:
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-[8px] font-black rounded font-mono ${
                                    usr.status === "active"
                                      ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                                      : "bg-rose-100 text-rose-955 border border-rose-300"
                                  }`}
                                >
                                  {usr.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[9.5px] text-slate-800 font-mono mt-1 font-bold">
                                Referral Code:{" "}
                                <span className="text-purple-900 font-black">
                                  {usr.referralCode}
                                </span>{" "}
                                | ID Code: {usr.id.slice(-6).toUpperCase()}
                              </p>
                            </div>

                      {/* Block / Unblock accounts with high visibility */}
                      <button
                        onClick={() =>
                          handleUserStatusToggle(usr.id, usr.status)
                        }
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 border-2 cursor-pointer transition-all active:scale-95 duration-100 ${
                          usr.status === "active"
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300"
                        }`}
                      >
                        {usr.status === "active" ? (
                          <>
                            <UserX className="w-3.5 h-3.5 text-rose-700" />
                            <span>Block User Account</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Unblock Investor</span>
                          </>
                        )}
                      </button>
                    </div>

                    {usr.profile && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[9.5px] text-slate-800 font-mono font-bold">
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[8px] uppercase font-black">
                            Ledger balance
                          </span>
                          <span className="block font-black text-[#0A3D91] mt-0.5 text-[10.5px]">
                            {(usr.profile.walletBalance ?? 0).toLocaleString()} ETB
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[8px] uppercase font-black">
                            Accumulated Deposits
                          </span>
                          <span className="block font-black text-slate-900 mt-0.5 text-[10.5px]">
                            {(usr.profile.totalDeposits ?? 0).toLocaleString()} ETB
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[8px] uppercase font-black">
                            Total Cashouts
                          </span>
                          <span className="block font-black text-slate-900 mt-0.5 text-[10.5px]">
                            {(usr.profile.totalWithdrawals ?? 0).toLocaleString()} ETB
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border-emerald-250 bg-emerald-50/20">
                          <span className="text-slate-400 block text-[8px] uppercase font-black text-amber-800">
                            Current Grade status
                          </span>
                          <span className="block font-black text-amber-700 mt-0.5 text-[10.5px] uppercase font-sans font-black">
                            VIP {usr.profile.vipLevel}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Direct Balance Adjustment Panel */}
                    {usr.profile && (
                      <div className="admin-user-balance-controls pt-3 border-t-2 border-slate-100 space-y-2">
                        <span className="text-[10px] text-slate-900 uppercase font-mono font-black block tracking-wider">
                          ◈ ADJUST ACCOUNT LEDGER BALANCE
                        </span>

                        {balanceSuccessMsg[usr.id] && (
                          <div className="p-3 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-[10.5px] leading-snug font-mono rounded-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150 shadow-3xs">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-sans font-black text-xs shrink-0">
                              ✓
                            </span>
                            <div className="font-bold">{balanceSuccessMsg[usr.id]}</div>
                          </div>
                        )}

                        {balanceErrorMsg[usr.id] && (
                          <div className="p-3 bg-rose-50 border-2 border-rose-300 text-rose-955 text-[10.5px] leading-snug font-mono rounded-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150 shadow-3xs">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-sans font-black text-xs shrink-0">
                              ✗
                            </span>
                            <div className="font-bold">{balanceErrorMsg[usr.id]}</div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#0A3D91]/5 p-3 rounded-2xl border border-[#0A3D91]/10">
                          <div className="flex-1 min-w-0 relative">
                            <input
                              type="number"
                              pattern="[0-9]*"
                              inputMode="numeric"
                              placeholder="Enter adjustment amount (ETB)..."
                              value={adjustAmount[usr.id] || ""}
                              onChange={(e) =>
                                setAdjustAmount((prev) => ({
                                  ...prev,
                                  [usr.id]: e.target.value,
                                }))
                              }
                              className="w-full px-3.5 py-2 pl-9 bg-white border-2 border-slate-250 rounded-xl text-xs font-bold font-mono placeholder-slate-400 focus:outline-none focus:border-[#0A3D91] transition-colors"
                            />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10.5px] font-black text-[#0A3D91]">
                              ETB
                            </span>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() =>
                                handleAdjustBalanceSubmit(usr.id, usr.fullName, "add")
                              }
                              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all shadow-3xs cursor-pointer"
                            >
                              Add Balance
                            </button>
                            <button
                              onClick={() =>
                                handleAdjustBalanceSubmit(usr.id, usr.fullName, "subtract")
                              }
                              className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all shadow-3xs cursor-pointer"
                            >
                              Subtract Balance
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Active Investment Portfolios list panel (Always features Admin termination of plans) */}
                    {usr.investments &&
                      usr.investments.filter((i) => i.status === "active")
                        .length > 0 && (
                        <div className="pt-3 border-t-2 border-slate-100 space-y-2">
                          <span className="text-[10px] text-[#0A3D91] uppercase font-mono font-black block tracking-wider">
                            ◈ ACTIVE VIP HOLDING TIERS (
                            {
                              usr.investments.filter(
                                (i) => i.status === "active",
                              ).length
                            }
                            )
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {usr.investments
                              .filter((i) => i.status === "active")
                              .map((inv) => (
                                <div
                                  key={inv.id}
                                  className="p-3.5 bg-blue-50/50 rounded-2xl flex items-center justify-between text-[10.5px] text-slate-900 border-2 border-blue-200"
                                >
                                  <div>
                                    <span className="font-black text-slate-950 block uppercase tracking-wide">
                                      {inv.planName}
                                    </span>
                                    <span className="text-[8.5px] text-slate-800 font-mono mt-0.5 block font-bold">
                                      Yield: {inv.dailyReturn} ETB/day |
                                      Principal: {inv.amount.toLocaleString()}{" "}
                                      ETB
                                    </span>
                                  </div>

                                  {/* Cancel Plan Admin Override Button */}
                                  <button
                                    onClick={() =>
                                      handleCancelInvestment(inv.id)
                                    }
                                    className="px-2.5 py-1.5 bg-red-650 hover:bg-red-750 text-white font-black text-[8px] rounded-lg uppercase tracking-wider cursor-pointer shadow-3xs active:scale-95 transition-all outline-none border border-red-500 text-center"
                                  >
                                    Cancel & Refund
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Manual Level Grade overrides */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t-2 border-slate-100 bg-slate-50 p-3 rounded-2xl">
                      <span className="text-[9.5px] text-slate-800 uppercase font-mono font-black">
                        Override VIP Authority Rank:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {[1, 2, 5, 10, 15].map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => handleUserVipUpgrade(usr.id, lvl)}
                            className={`w-9 py-1 text-[10px] font-black rounded-lg border-2 shrink-0 cursor-pointer transition-all active:scale-95 duration-100 ${
                              usr.profile?.vipLevel === lvl
                                ? "bg-amber-600 border-amber-500 text-white shadow-xs"
                                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400"
                            }`}
                          >
                            V{lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Identity Verification Sub-Manager */}
                    {usr.profile && (
                      <div className="pt-3 border-t-2 border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-900 uppercase font-mono font-black block tracking-wider">
                            National ID Identification Verify
                          </span>
                          <div className="flex items-center space-x-1.5">
                            {usr.profile.idVerificationStatus === "verified" ? (
                              <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border-2 border-emerald-400 text-[9px] font-black uppercase tracking-wider">
                                Verified Identity
                              </span>
                            ) : usr.profile.idVerificationStatus ===
                              "pending" ? (
                              <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border-2 border-amber-400 text-[9px] font-black uppercase tracking-wider animate-pulse">
                                KYC Review Required
                              </span>
                            ) : usr.profile.idVerificationStatus ===
                              "rejected" ? (
                              <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-900 border-2 border-rose-400 text-[9px] font-black uppercase tracking-wider">
                                Docs Rejected
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border-2 border-slate-300 text-[9px] font-black uppercase tracking-wider">
                                Not Submitted
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Photo elements or credentials review drawers */}
                        {(usr.profile.idCardFront ||
                          usr.profile.idCardBack ||
                          usr.profile.idSelfie ||
                          usr.profile.fanNumber) && (
                          <div className="space-y-3 bg-slate-100 p-4 rounded-2xl border-2 border-slate-200">
                            {usr.profile.fanNumber && (
                              <div className="flex items-center justify-between text-[10px] font-black font-mono pb-2 border-b border-dashed border-slate-300">
                                <span className="text-slate-500 uppercase">
                                  National FAN Reference:
                                </span>
                                <span className="text-[#0A3D91] bg-white border-2 border-[#0A3D91]/30 px-2 py-0.5 rounded-lg text-[10.5px]">
                                  {usr.profile.fanNumber}
                                </span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <span className="text-[8.5px] text-slate-800 font-mono block uppercase font-black">
                                  ID Card FRONT side
                                </span>
                                {usr.profile.idCardFront ? (
                                  <a
                                    href={usr.profile.idCardFront}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block relative group rounded-xl overflow-hidden border-2 border-slate-300 aspect-[16/10] bg-slate-900"
                                  >
                                    <img
                                      src={usr.profile.idCardFront}
                                      alt="ID Front Image"
                                      className="w-full h-full object-cover animate-fade-in"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-center text-[7.5px] text-white font-black uppercase tracking-widest group-hover:bg-black/80 transition-all">
                                      Click for Fullscreen
                                    </div>
                                  </a>
                                ) : (
                                  <div className="h-20 bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[8.5px] text-slate-500 font-black uppercase">
                                    No Front Uploaded
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8.5px] text-slate-805 font-mono block uppercase font-black">
                                  ID Card BACK side
                                </span>
                                {usr.profile.idCardBack ? (
                                  <a
                                    href={usr.profile.idCardBack}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block relative group rounded-xl overflow-hidden border-2 border-slate-300 aspect-[16/10] bg-slate-900"
                                  >
                                    <img
                                      src={usr.profile.idCardBack}
                                      alt="ID Back Image"
                                      className="w-full h-full object-cover animate-fade-in"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-center text-[7.5px] text-white font-black uppercase tracking-widest group-hover:bg-black/80 transition-all">
                                      Click for Fullscreen
                                    </div>
                                  </a>
                                ) : (
                                  <div className="h-20 bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[8.5px] text-slate-500 font-black uppercase">
                                    No Back Uploaded
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8.5px] text-teal-800 font-mono block uppercase font-black">
                                  Face Selfie Biometrics
                                </span>
                                {usr.profile.idSelfie ? (
                                  <a
                                    href={usr.profile.idSelfie}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block relative group rounded-xl overflow-hidden border-2 border-teal-300 aspect-[16/10] bg-slate-900"
                                  >
                                    <img
                                      src={usr.profile.idSelfie}
                                      alt="Face Selfie Image"
                                      className="w-full h-full object-cover animate-fade-in"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-center text-[7.5px] text-white font-black uppercase tracking-widest group-hover:bg-black/80 transition-all">
                                      Click for Fullscreen
                                    </div>
                                  </a>
                                ) : (
                                  <div className="h-20 bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[8.5px] text-slate-500 font-black uppercase">
                                    No Selfie Captured
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Rejection Notes Display */}
                            {usr.profile.idVerificationStatus === "rejected" &&
                              usr.profile.idRejectionReason && (
                                <p className="text-[10px] text-rose-950 bg-rose-50 p-2.5 rounded-xl border-2 border-rose-300 font-bold leading-normal">
                                  ◈{" "}
                                  <strong>
                                    Reason for Document Rejection:
                                  </strong>{" "}
                                  {usr.profile.idRejectionReason}
                                </p>
                              )}
                          </div>
                        )}

                        {/* Action controllers */}
                        <div className="flex flex-wrap gap-2 pt-2 items-center justify-between border-t border-slate-200">
                          <span className="text-[9px] font-mono font-black text-slate-500 uppercase">
                            Verification Controls:
                          </span>
                          <div className="flex gap-2">
                            {usr.profile.idVerificationStatus !== "verified" ? (
                              <button
                                onClick={() =>
                                  handleIdVerificationDecision(
                                    usr.id,
                                    "approve",
                                  )
                                }
                                className="px-3.5 py-1.5 bg-[#0A3D91] hover:bg-[#07214a] text-white text-[9.5px] font-black rounded-lg uppercase tracking-wider cursor-pointer shadow-3xs hover:shadow-xs transition-all active:scale-95 text-center border-2 border-transparent"
                              >
                                Verify Account Status
                              </button>
                            ) : (
                              <span className="text-[9px] text-emerald-950 font-black tracking-wider uppercase bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg">
                                ID Approved Verified ✓
                              </span>
                            )}

                            <button
                              onClick={() => {
                                const note = prompt(
                                  "Enter custom rejection explanation:",
                                );
                                if (note !== null) {
                                  handleIdVerificationDecision(
                                    usr.id,
                                    "reject",
                                    note,
                                  );
                                }
                              }}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 text-[9.5px] font-black rounded-lg uppercase tracking-wider cursor-pointer border-2 border-rose-300 transition-all active:scale-95"
                            >
                              Reject Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* 3. CBE DEPOSIT screenshot reviews queue */}
      {subTab === "deposits" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-display font-black text-xs text-slate-800 uppercase tracking-widest font-sans">
                CBE Receipt Auditing Office ({depositsList.length})
              </h2>
              <p className="text-[9.5px] text-slate-500 font-bold">
                Investigate screenshot uploads from investors validating
                Commercial Bank of Ethiopia deposits.
              </p>
            </div>

            <div className="flex space-x-1 p-1 bg-slate-100 border-2 border-slate-200 rounded-xl shrink-0 overflow-x-auto scrollbar-none">
              {(["all", "pending", "approved", "rejected"] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setDepositFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                      depositFilter === st
                        ? "bg-[#0A3D91] text-white shadow-3xs"
                        : "text-slate-850 hover:text-black font-bold"
                    }`}
                  >
                    {st} (
                    {st === "all"
                      ? depositsList.length
                      : depositsList.filter((d) => d.status === st).length}
                    )
                  </button>
                ),
              )}
            </div>
          </div>

          {depositsList.filter(
            (d) => depositFilter === "all" || d.status === depositFilter,
          ).length === 0 ? (
            <div className="text-center py-12 text-slate-450 bg-white border-2 border-slate-250 rounded-2xl font-bold text-xs uppercase tracking-wider font-mono shadow-3xs">
              No deposit requests registered matching status "
              {depositFilter.toUpperCase()}".
            </div>
          ) : (
            <div className="space-y-4">
              {depositsList
                .filter(
                  (d) => depositFilter === "all" || d.status === depositFilter,
                )
                .map((dep) => {
                  const isPending = dep.status === "pending";
                  return (
                    <div
                      key={dep.id}
                      className="p-5 bg-white border-2 border-slate-200 rounded-3xl space-y-4 shadow-3xs"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-slate-100 pb-3">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase leading-normal">
                            {dep.userName}
                          </h4>
                          <span className="text-[8.5px] text-slate-500 font-mono block mt-1 font-bold">
                            Phone: {dep.userPhone} | Date Uploaded:{" "}
                            {new Date(dep.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <span
                          className={`text-[9.5px] font-black px-3 py-1 rounded-full border-2 uppercase tracking-wider ${
                            dep.status === "approved"
                              ? "bg-emerald-100 text-emerald-950 border-emerald-400"
                              : dep.status === "rejected"
                                ? "bg-rose-100 text-rose-955 border-rose-400"
                                : "bg-amber-100 text-amber-955 border-amber-400"
                          }`}
                        >
                          {dep.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: Metadata details */}
                        <div className="flex flex-col justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-3">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-mono block font-black">
                              Reported Credit Amount
                            </span>
                            <span className="text-lg font-black text-emerald-800 font-mono leading-none block mt-1">
                              {dep.amount.toLocaleString()} ETB
                            </span>
                          </div>

                          {dep.receiptImage &&
                            dep.receiptImage !==
                              "receipt_base64_log_placeholder" && (
                              <button
                                onClick={() => {
                                  const win = window.open();
                                  if (win) {
                                    win.document.write(
                                      `<html><body style="margin:0; background:#070d19; display:flex; align-items:center; justify-content:center;"><img src="${dep.receiptImage}" style="max-width:100%; max-height:100%; object-fit:contain;" /></body></html>`,
                                    );
                                  }
                                }}
                                className="w-full text-center py-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-300 text-[10px] font-black rounded-lg cursor-pointer shadow-3xs uppercase tracking-wider transition-colors"
                              >
                                Maximize Image 🚀
                              </button>
                            )}

                          {dep.rejectionReason && dep.status === "rejected" && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-955 font-bold leading-normal">
                              <strong>Audit Back-Notes:</strong>{" "}
                              {dep.rejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Right: Picture screenshot review */}
                        <div>
                          {dep.receiptImage &&
                          dep.receiptImage !==
                            "receipt_base64_log_placeholder" ? (
                            <div className="border-2 border-slate-300 rounded-2xl overflow-hidden bg-slate-900 flex justify-center p-1.5">
                              {dep.receiptImage.startsWith("data:image") ||
                              dep.receiptImage.startsWith("http") ||
                              dep.receiptImage.startsWith("/") ? (
                                <img
                                  src={dep.receiptImage}
                                  alt="CBE Transfer Audit Receipt"
                                  className="max-h-60 object-contain w-full rounded-lg"
                                />
                              ) : (
                                <div className="py-10 text-center text-[10px] text-slate-400 font-mono">
                                  Hex Code payload:{" "}
                                  <span className="font-bold text-slate-300">
                                    {dep.receiptImage}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-8 text-center text-[10px] font-black text-rose-900 font-mono uppercase bg-rose-100 border-2 border-rose-300 rounded-2xl">
                              ⚠ No receipts screenshot uploaded!
                            </div>
                          )}
                        </div>
                      </div>

                      {isPending && (
                        <div className="space-y-3 pt-3 border-t border-slate-205">
                          {pendingActionId === dep.id ? (
                            <div className="space-y-2.5 animate-in zoom-in-95">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) =>
                                  setRejectReason(e.target.value)
                                }
                                placeholder="Write rejection reason notes explaining error (mandatory)..."
                                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-rose-400 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setPendingActionId(null)}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-900 rounded-lg text-xs cursor-pointer font-black uppercase tracking-wider transition-colors"
                                >
                                  Go Back
                                </button>
                                <button
                                  onClick={() =>
                                    handleDepositAction(dep.id, "reject")
                                  }
                                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black cursor-pointer uppercase tracking-wider transition-all active:scale-95"
                                >
                                  Reject Receipt
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-3">
                              <button
                                onClick={() =>
                                  handleDepositAction(dep.id, "approve")
                                }
                                className="flex-1 py-2.5 bg-[#0A3D91] hover:bg-[#072452] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer transition-all active:scale-95 border-2 border-transparent"
                              >
                                <CheckCircle2 className="w-4.5 h-4.5 text-amber-300 shrink-0" />
                                <span>Authorize Ledger Credit</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectReason("");
                                  setPendingActionId(dep.id);
                                }}
                                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 hover:border-rose-400 text-rose-900 rounded-xl text-xs font-black cursor-pointer uppercase tracking-wider transition-colors"
                              >
                                Deny Credit
                              </button>
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
      )}

      {/* 4. WITHDRAWALS CASHOUTS QUEUE */}
      {subTab === "withdrawals" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-display font-black text-xs text-slate-800 uppercase tracking-widest font-sans">
                Sovereign Capital Cashouts ({withdrawalsList.length})
              </h2>
              <p className="text-[9.5px] text-slate-500 font-bold">
                Audit outbound wire requests. Make sure user balances exceed
                cashout requests beforehand.
              </p>
            </div>

            <div className="flex space-x-1 p-1 bg-slate-100 border-2 border-slate-200 rounded-xl shrink-0 overflow-x-auto scrollbar-none">
              {(["all", "pending", "approved", "rejected"] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setWithdrawalFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                      withdrawalFilter === st
                        ? "bg-[#0A3D91] text-white shadow-3xs"
                        : "text-slate-850 hover:text-black font-bold"
                    }`}
                  >
                    {st} (
                    {st === "all"
                      ? withdrawalsList.length
                      : withdrawalsList.filter((w) => w.status === st).length}
                    )
                  </button>
                ),
              )}
            </div>
          </div>

          {withdrawalsList.filter(
            (w) => withdrawalFilter === "all" || w.status === withdrawalFilter,
          ).length === 0 ? (
            <div className="text-center py-12 text-slate-450 bg-white border-2 border-slate-250 rounded-2xl font-bold text-xs uppercase tracking-wider font-mono shadow-3xs">
              No cashout payouts found matching filter state "
              {withdrawalFilter.toUpperCase()}".
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawalsList
                .filter(
                  (w) =>
                    withdrawalFilter === "all" || w.status === withdrawalFilter,
                )
                .map((wit) => {
                  const isPending = wit.status === "pending";
                  return (
                    <div
                      key={wit.id}
                      className="p-5 bg-white border-2 border-slate-200 rounded-3xl space-y-4 shadow-3xs"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-slate-100 pb-3">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 leading-normal uppercase">
                            {wit.userName}
                          </h4>
                          <span className="text-[8.5px] text-slate-500 font-mono block mt-1 font-bold">
                            Phone: {wit.userPhone} | Date Submitted:{" "}
                            {new Date(wit.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <span
                          className={`text-[9.5px] font-black px-3 py-1 rounded-full border-2 uppercase tracking-wider ${
                            wit.status === "approved"
                              ? "bg-emerald-100 text-emerald-950 border-emerald-400"
                              : wit.status === "rejected"
                                ? "bg-rose-100 text-rose-955 border-rose-400"
                                : "bg-amber-100 text-amber-955 border-amber-400"
                          }`}
                        >
                          {wit.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Side: Cashout specifics */}
                        <div className="p-4 bg-slate-50 border border-slate-205 rounded-2xl flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-mono block font-black">
                              Transfer Amount (Cashout sum)
                            </span>
                            <span className="text-lg font-black text-rose-700 font-mono leading-none block mt-1">
                              {wit.amount.toLocaleString()} ETB
                            </span>
                          </div>
                          <span className="text-[9px] bg-blue-100 text-[#0A3D91] px-2.5 py-1 rounded-lg border-2 border-blue-200 font-mono font-black tracking-widest w-fit uppercase">
                            {wit.bankName ? "LOCAL BANK WIRE" : "CBE DIAL-IN"}
                          </span>
                        </div>

                        {/* Right Side: Account routing matrix */}
                        {wit.bankName ? (
                          <div className="p-4 bg-blue-50/50 border-2 border-blue-200 rounded-2xl text-[10.5px] text-slate-900 font-sans space-y-1.5 shadow-3xs relative overflow-hidden">
                            <div className="text-[8.5px] uppercase tracking-widest text-[#0A3D91] font-black border-b border-blue-200 pb-1.5 mb-1.5 font-sans">
                              RECIPIENT BANK PROTOCOLS
                            </div>
                            <div>
                              <span className="text-slate-500 font-bold">
                                Target Bank Name:
                              </span>{" "}
                              <strong className="text-[#0A3D91] uppercase font-black text-[11px]">
                                {wit.bankName}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-500 font-bold">
                                Holder Name:
                              </span>{" "}
                              <strong className="text-slate-950 uppercase font-black text-[11px]">
                                {wit.accountHolderName}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-500 font-bold">
                                Account Number:
                              </span>{" "}
                              <strong className="text-[#0A3D91] text-[12px] font-black font-mono tracking-wider bg-white border border-blue-100 rounded px-1.5 py-0.5">
                                {wit.accountNumber}
                              </strong>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50/50 border-2 border-amber-200 text-amber-955 rounded-2xl text-[10px] flex items-center justify-center font-bold">
                            <span>
                              Standard Mobile Banking/CBE Direct Ledger
                              Settlement Required
                            </span>
                          </div>
                        )}
                      </div>

                      {isPending && (
                        <div className="space-y-3 pt-3 border-t border-slate-205">
                          {pendingActionId === wit.id ? (
                            <div className="space-y-2.5 animate-in zoom-in-95">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) =>
                                  setRejectReason(e.target.value)
                                }
                                placeholder="Write rejection note explaining the decline reason (mandatory)..."
                                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-rose-455 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setPendingActionId(null)}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-900 rounded-lg text-xs cursor-pointer font-black uppercase tracking-wider"
                                >
                                  Cancel Action
                                </button>
                                <button
                                  onClick={() =>
                                    handleWithdrawAction(wit.id, "reject")
                                  }
                                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black cursor-pointer uppercase tracking-wider"
                                >
                                  Confirm Rejection
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-3">
                              <button
                                onClick={() =>
                                  handleWithdrawAction(wit.id, "approve")
                                }
                                className="flex-1 py-2.5 bg-[#0A3D91] hover:bg-[#072452] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer transition-all active:scale-95 border-2 border-transparent"
                              >
                                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-300" />
                                <span>Authorize Bank Payout</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectReason("");
                                  setPendingActionId(wit.id);
                                }}
                                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 hover:border-rose-400 text-rose-900 rounded-xl text-xs font-black cursor-pointer uppercase tracking-wider transition-colors"
                              >
                                Deny Request
                              </button>
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
      )}

      {/* 4.5 PLATFORM LOANS REVIEWS TAB */}
      {subTab === "loans" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
            <h3 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider flex items-center space-x-2">
              <Coins className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span>Institutional Loans Backoffice Gateway</span>
            </h3>
            <p className="text-[10px] text-slate-805 leading-normal mt-1.5 font-bold">
              Review, approve, and disburse platform backed loyalty microloans.
              Inspecting state registered National IDs is critical to verify
              risk boundaries. Only VIP 2+ active members qualify for disbursal.
            </p>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {(["all", "pending", "approved", "rejected"] as const).map(
                (filter) => {
                  const count =
                    filter === "all"
                      ? loansList.length
                      : loansList.filter((l) => l.status === filter).length;
                  return (
                    <button
                      key={filter}
                      onClick={() => setLoanFilter(filter)}
                      className={`px-3.5 py-1.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer border-2 ${
                        loanFilter === filter
                          ? "bg-[#0A3D91] border-[#0A3D91] text-white shadow-xs"
                          : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {filter} ({count})
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Loans list loop */}
          {loansList.filter(
            (l) => loanFilter === "all" || l.status === loanFilter,
          ).length === 0 ? (
            <div className="p-12 text-center text-slate-455 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider">
                No registered loan actions match status "
                {loanFilter.toUpperCase()}".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loansList
                .filter((l) => loanFilter === "all" || l.status === loanFilter)
                .map((l) => {
                  const isPending = l.status === "pending";
                  return (
                    <div
                      key={l.id}
                      className="p-5 rounded-3xl bg-white border-2 border-slate-200 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-3xs"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                          <div>
                            <h4 className="font-display font-black text-xs text-slate-900 uppercase font-sans">
                              {l.userName}
                            </h4>
                            <p className="text-[8.5px] text-slate-800 uppercase font-black tracking-wider font-mono">
                              Phone: {l.userPhone} | Reference:{" "}
                              {l.id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-black px-2.5 py-1 rounded border-2 uppercase tracking-wide ${
                              l.status === "approved"
                                ? "bg-emerald-100 text-emerald-950 border-emerald-400"
                                : l.status === "rejected"
                                  ? "bg-rose-100 text-rose-955 border-rose-400"
                                  : "bg-amber-100 text-amber-900 border-amber-400"
                            }`}
                          >
                            {l.status}
                          </span>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-[10px] text-slate-900 font-sans">
                          <div className="flex justify-between border-b border-slate-200/50 pb-1">
                            <span className="text-slate-500 font-bold">
                              National ID Submitted:
                            </span>{" "}
                            <strong className="text-[#0A3D91] font-mono text-[11px]">
                              {l.nationalId}
                            </strong>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/50 pb-1">
                            <span className="text-slate-500 font-bold">
                              Verified Grade Level:
                            </span>{" "}
                            <strong className="text-amber-700 font-mono">
                              VIP Tier {l.vipLevel}
                            </strong>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 mt-2 pt-2">
                            <span className="text-slate-550 font-black uppercase font-mono text-[9.5px]">
                              Requested Microloan capital:
                            </span>
                            <strong className="text-emerald-700 font-mono font-black text-sm">
                              {l.amount.toLocaleString()} ETB
                            </strong>
                          </div>
                          <div className="text-[8px] text-slate-500 text-right mt-1.5 block">
                            Submitted:{" "}
                            {new Date(l.submittedAt).toLocaleString()}
                          </div>
                        </div>

                        {l.status === "rejected" && l.rejectionReason && (
                          <p className="text-[10px] text-rose-955 bg-rose-50 p-2.5 rounded-xl border-2 border-rose-300 font-bold leading-normal">
                            <strong>Audit Declining Explanations:</strong>{" "}
                            {l.rejectionReason}
                          </p>
                        )}
                        {l.status === "approved" && l.reviewedAt && (
                          <p className="text-[10px] text-emerald-950 bg-emerald-50 p-2.5 rounded-xl border-2 border-emerald-300 font-bold leading-normal">
                            <strong>Guaranteed Disbursed payout:</strong>{" "}
                            {new Date(l.reviewedAt).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {isPending && (
                        <div className="space-y-3 pt-3 border-t border-slate-205 font-sans">
                          {pendingActionId === l.id ? (
                            <div className="space-y-2 animate-in zoom-in-95">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) =>
                                  setRejectReason(e.target.value)
                                }
                                placeholder="Write rejection reasons explanatory note (mandatory)..."
                                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-rose-450 focus:outline-[#0A3D91] font-bold"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setPendingActionId(null)}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-900 rounded-lg text-xs cursor-pointer font-black uppercase tracking-wider"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handleLoanAction(l.id, "reject")
                                  }
                                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black cursor-pointer uppercase tracking-wider"
                                >
                                  Confirm Decline
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-2.5">
                              <button
                                onClick={() =>
                                  handleLoanAction(l.id, "approve")
                                }
                                className="flex-1 py-2.5 bg-[#0A3D91] hover:bg-[#072452] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer transition-all active:scale-95 border-2 border-transparent"
                              >
                                <CheckCircle2 className="w-4.5 h-4.5 text-amber-305" />
                                <span>Disburse microloan instantly</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectReason("");
                                  setPendingActionId(l.id);
                                }}
                                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 hover:border-rose-400 text-rose-900 rounded-xl text-xs font-black cursor-pointer uppercase tracking-wider"
                              >
                                Reject
                              </button>
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
      )}

      {/* 5. VERIFIED BROADCAST NOTIFICATIONS DISPATCHER */}
      {subTab === "broadcast" && (
        <div className="space-y-4 p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-sm max-w-2xl mx-auto">
          <h3 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>PUSH BROADCAST ANNOUNCEMENTS ANCHOR</span>
          </h3>
          <p className="text-[10px] text-slate-800 leading-normal font-bold">
            Alert all registered corporate platform accounts instantly with an
            administrative headline notice or active event. Dispatching
            broadcasts sends real-time popups to user notification inbox feeds.
          </p>

          <div className="space-y-4 mt-4">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10.5px] font-black text-[#0A3D91] uppercase tracking-wide">
                Headline Title
              </label>
              <input
                type="text"
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                placeholder="e.g. Dynamic 15% VIP Return Multipliers Enabled!"
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/10 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold font-sans"
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10.5px] font-black text-[#0A3D91] uppercase tracking-wide">
                Announcement Notice Message Content
              </label>
              <textarea
                rows={4}
                value={bMessage}
                onChange={(e) => setBMessage(e.target.value)}
                placeholder="Dear Investors, we are co-hosting a celebratory capital growth campaign where referral rewards are upgraded to..."
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/10 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium leading-relaxed font-sans"
              />
            </div>

            <button
              onClick={handleBroadcastSubmit}
              disabled={!bTitle.trim() || !bMessage.trim()}
              className="w-full py-3 bg-[#0A3D91] hover:bg-[#072452] disabled:opacity-40 text-white font-display text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md active:scale-[0.98] border-2 border-transparent"
            >
              Dispatch System Notice Popups
            </button>
          </div>
        </div>
      )}

      {/* 6. SETTINGS CORE CONFIGURATION */}
      {subTab === "settings" && (
        <div className="space-y-4 p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-sm max-w-2xl mx-auto">
          <h3 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider flex items-center space-x-2.5 border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-[#0A3D91]" />
            <span>OPERATIONAL PARAMETERS & SETTINGS CONFIGURATION</span>
          </h3>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-black text-[#0A3D91] uppercase tracking-wider block font-sans">
                Official Deposit Account Owner Name
              </label>
              <input
                type="text"
                value={cbeName}
                onChange={(e) => setCbeName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-[#0A3D91] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-900 font-extrabold font-sans"
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-black text-[#0A3D91] uppercase tracking-wider block font-sans">
                Official Settlement Account Number (CBE)
              </label>
              <input
                type="text"
                value={cbeNum}
                onChange={(e) => setCbeNum(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-[#0A3D91] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-[#0A3D91] font-mono font-black tracking-widest"
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-black text-[#0A3D91] uppercase tracking-wider block font-sans">
                Agent Commission Incentive Level (%)
              </label>
              <input
                type="number"
                value={bonusPercent}
                onChange={(e) => setBonusPercent(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-[#0A3D91] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-900 font-black font-mono"
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-black text-[#0A3D91] uppercase tracking-wider block font-sans focus:outline-none">
                Canonical Production Domain / Invite URL
              </label>
              <input
                type="text"
                placeholder="e.g. https://lumora-eth.vercel.app"
                value={productionInviteUrl}
                onChange={(e) => setProductionInviteUrl(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-[#0A3D91] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-slate-900 font-extrabold font-sans"
              />
              <span className="text-[10px] text-slate-500 font-sans font-semibold">
                Set this domain (e.g. your Vercel hosted link) so invitation links copy exactly the same on both production hosts and inside developer previews.
              </span>
            </div>

            <button
              onClick={handleSettingsSave}
              className="w-full mt-4 py-3 bg-[#0A3D91] hover:bg-[#072452] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 border-[#0A3D91] shadow-xs"
            >
              Commit Dynamic Configuration Parameters
            </button>

            {/* Danger Zone: System Reset */}
            <div className="mt-8 pt-6 border-t-2 border-red-100 space-y-4">
              <h4 className="font-display font-black text-[11px] text-red-600 uppercase tracking-widest flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <span>System Danger Zone</span>
              </h4>
              <p className="text-[10.5px] leading-relaxed text-slate-500 font-sans font-medium">
                This action immediately deletes all non-admin users, active investments, deposits, withdrawals, transactions, notifications, and customer service chats. Admin users and profiles will be preserved. This operation is synchronized in real time with the cloud ledger and is irreversible.
              </p>
              <button
                onClick={handleSystemResetClick}
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 border-red-600 shadow-sm disabled:opacity-50"
              >
                {loading ? "Purging Ledger..." : "Initiate Hard Reset & Purge Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-red-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header banner */}
            <div className="bg-red-50/80 px-6 py-5 border-b border-red-100 flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-xl text-red-600">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans font-black text-xs text-red-700 uppercase tracking-widest leading-none">
                  SENSITIVE SYSTEM RESET
                </h3>
                <span className="text-[9px] text-red-500 font-mono font-bold tracking-wider uppercase block mt-1">
                  DESTRUCTIVE PURGE ENGAGED
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold text-slate-700 leading-relaxed font-sans">
                You are initiating a system-wide database purge. This will <strong className="text-red-600">permanently erase</strong> all records for standard users:
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 font-sans font-medium text-[10.5px] text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>All customer profiles & registered bank details</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>All active investments & earnings logs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>All manual CBE deposits & pending withdrawals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>All customer support thread chats & notifications</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-rose-950 uppercase tracking-widest font-mono block pl-1">
                  Type <span className="text-red-700 underline font-black">CONFIRM RESET</span> to authorizing:
                </label>
                <input
                  type="text"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  placeholder="CONFIRM RESET"
                  className="w-full bg-rose-50/50 border-2 border-red-200 focus:border-red-600 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-red-700 font-extrabold tracking-widest text-center uppercase"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-3 justify-end text-xs">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-lg transition-all cursor-pointer uppercase text-[10px] tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeHardReset}
                disabled={resetConfirmInput !== "CONFIRM RESET" || loading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[10px]"
              >
                {loading ? "Purging Ledger..." : "EXECUTE RESET"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
