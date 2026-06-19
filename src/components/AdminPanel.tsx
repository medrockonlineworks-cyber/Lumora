import React, { useState, useEffect } from 'react';
import { 
  Users, Coins, CheckCircle, XCircle, Search, ShieldAlert, ShieldCheck, 
  UserPlus, Award, Landmark, RefreshCw, ChevronRight, Ban, Eye, Key,
  Sparkles, Save, FileText, ChevronDown, Check, Sliders, Settings, CreditCard, Copy,
  Upload, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Profile, Deposit, Withdrawal, Loan, AppSettings, User } from '../types';
import LumoraStamp from './LumoraStamp';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'deposits' | 'withdrawals' | 'id-verify' | 'users' | 'loans' | 'settings' | 'cards'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  // Card admin states
  const [allCards, setAllCards] = useState<any[]>([]);
  const [allCardTransactions, setAllCardTransactions] = useState<any[]>([]);
  const [cardFilter, setCardFilter] = useState<'pending' | 'active' | 'frozen' | 'all'>('pending');

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtering selections
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loanFilter, setLoanFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [idFilter, setIdFilter] = useState<'all' | 'pending' | 'verified' | 'rejected' | 'unsubmitted'>('pending');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  
  // Custom Toast notification states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(curr => curr?.message === message ? null : curr);
    }, 2500);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied successfully!`);
  };
  
  // Lightbox and action modal states
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{
    type: 'deposit' | 'withdrawal' | 'loan' | 'id-verify';
    id: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Confirmation modal states
  const [withdrawalActionConfirm, setWithdrawalActionConfirm] = useState<{
    id: string;
    userName: string;
    amount: number;
    action: 'approve' | 'reject';
  } | null>(null);
  
  // User edit modal states
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustTargetWallet, setAdjustTargetWallet] = useState<'deposit' | 'income'>('deposit');
  const [adjustVipLevel, setAdjustVipLevel] = useState<number>(0);
  const [showBalanceConfirm, setShowBalanceConfirm] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // System Settings state inputs
  const [cbeAccountName, setCbeAccountName] = useState('');
  const [cbeAccountNumber, setCbeAccountNumber] = useState('');
  const [referralBonusPercentage, setReferralBonusPercentage] = useState(10);
  const [productionInviteUrl, setProductionInviteUrl] = useState('');
  const [companyLicenseUrl, setCompanyLicenseUrl] = useState('');

  // Fetch all admin data
  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [resStats, resUsers, resDeposits, resWithdrawals, resLoans, resSettings] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/deposits'),
        fetch('/api/admin/withdrawals'),
        fetch('/api/admin/loans'),
        fetch('/api/admin/settings')
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resDeposits.ok) {
        const deps = await resDeposits.json();
        // Sort newest first
        deps.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setDeposits(deps);
      }
      if (resWithdrawals.ok) {
        const wits = await resWithdrawals.json();
        wits.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setWithdrawals(wits);
      }
      if (resLoans.ok) {
        const lns = await resLoans.json();
        lns.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setLoans(lns);
      }
      if (resSettings.ok) {
        const sett = await resSettings.json();
        setSettings(sett);
        setCbeAccountName(sett.cbeAccountName || '');
        setCbeAccountNumber(sett.cbeAccountNumber || '');
        setReferralBonusPercentage(sett.referralBonusPercentage || 10);
        setProductionInviteUrl(sett.productionInviteUrl || '');
        setCompanyLicenseUrl(sett.companyLicenseUrl || '');
      }

      // Fetch cards
      const resCards = await fetch('/api/admin/cards');
      if (resCards.ok) {
        const cData = await resCards.json();
        setAllCards(cData.cards || []);
        // Sort newest first
        const sortedTrans = (cData.transactions || []).sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAllCardTransactions(sortedTrans);
      }

      setLastSynced(new Date());
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();

    // Listen for local/remote database updates to update the admin dashboard immediately
    const handleUpdate = () => {
      fetchAllAdminData();
    };
    window.addEventListener("lumoradb-updated", handleUpdate);

    // Dynamic background poll interval for fallback sync consistency
    const handle = setInterval(() => {
      fetchAllAdminData();
    }, 4000);

    return () => {
      window.removeEventListener("lumoradb-updated", handleUpdate);
      clearInterval(handle);
    };
  }, [activeSubTab]);

  useEffect(() => {
    if (selectedUserForEdit) {
      setAdjustVipLevel(selectedUserForEdit.profile?.vipLevel || 0);
    } else {
      setAdjustVipLevel(0);
    }
  }, [selectedUserForEdit]);

  // Handle deposit action (approve/reject)
  const handleDepositAction = async (depositId: string, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(`deposit-${depositId}`);
    try {
      const res = await fetch('/api/admin/deposits/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId, action, rejectionReason: reason })
      });
      if (res.ok) {
        setRejectionModal(null);
        setRejectionReason('');
        fetchAllAdminData();
      } else {
        alert("Failed to submit deposit audit action.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle withdrawal action
  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(`withdrawal-${withdrawalId}`);
    try {
      const res = await fetch('/api/admin/withdrawals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action, rejectionReason: reason })
      });
      if (res.ok) {
        setRejectionModal(null);
        setWithdrawalActionConfirm(null);
        setRejectionReason('');
        showToast(action === 'approve' ? "Withdrawal approved successfully" : "Withdrawal rejected successfully", "success");
        fetchAllAdminData();
      } else {
        showToast("Failed to submit withdrawal audit action", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error submitting audit action", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle loan action
  const handleLoanAction = async (loanId: string, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(`loan-${loanId}`);
    try {
      const res = await fetch('/api/admin/loans/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId, action, rejectionReason: reason })
      });
      if (res.ok) {
        setRejectionModal(null);
        setRejectionReason('');
        fetchAllAdminData();
      } else {
        alert("Failed to submit loan audit action.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle ID verify action
  const handleIdVerifyAction = async (userId: string, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(`id-${userId}`);
    try {
      const res = await fetch('/api/admin/users/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, rejectionReason: reason })
      });
      if (res.ok) {
        setRejectionModal(null);
        setRejectionReason('');
        fetchAllAdminData();
      } else {
        alert("Failed to review ID verification submission.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle adjust balance
  const handleAdjustBalance = async () => {
    if (!selectedUserForEdit) return;
    const amount = Number(adjustAmount);
    if (!amount || amount <= 0) {
      showToast("Please provide a valid ledger adjustment amount.", "error");
      return;
    }
    setActionLoading('adjust-balance');
    try {
      const res = await fetch('/api/admin/users/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetUserId: selectedUserForEdit.id, 
          amount, 
          type: adjustType,
          targetWallet: adjustTargetWallet
        })
      });
      if (res.ok) {
        setAdjustAmount('');
        const updatedUserRaw = await res.json();
        // Update user reference
        setSelectedUserForEdit(prev => prev ? {
          ...prev,
          profile: {
            ...prev.profile,
            walletBalance: updatedUserRaw.profile.walletBalance,
            depositBalance: updatedUserRaw.profile.depositBalance,
            incomeBalance: updatedUserRaw.profile.incomeBalance,
            totalDeposits: updatedUserRaw.profile.totalDeposits,
            totalEarnings: updatedUserRaw.profile.totalEarnings
          }
        } : null);
        showToast(`Balance adjusted successfully by ${amount} ETB in ${adjustTargetWallet === 'income' ? 'Income Pool' : 'Deposit Pool'}`, "success");
        fetchAllAdminData();
      } else {
        showToast("Failed to adjust account balance.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error adjusting balance.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle VIP modification
  const handleUpdateVip = async (vipLvl: number) => {
    if (!selectedUserForEdit) return;
    setActionLoading('update-vip');
    try {
      const res = await fetch('/api/admin/users/vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetUserId: selectedUserForEdit.id, 
          vipLevel: vipLvl 
        })
      });
      if (res.ok) {
        setAdjustVipLevel(vipLvl);
        setSelectedUserForEdit(prev => prev ? {
          ...prev,
          profile: {
            ...prev.profile,
            vipLevel: vipLvl
          }
        } : null);
        showToast(`VIP Tier shifted to VIP ${vipLvl} authorized!`, "success");
        fetchAllAdminData();
      } else {
        showToast("Failed to set user VIP level.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating VIP tier.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle changed login password (Admin option)
  const handleChangeUserPassword = async () => {
    if (!selectedUserForEdit) return;
    if (!newPasswordValue.trim()) {
      showToast("Password cannot be empty.", "error");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/admin/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUserForEdit.id,
          newPassword: newPasswordValue.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUserForEdit(prev => prev ? {
          ...prev,
          password: data.password
        } : null);
        setNewPasswordValue('');
        showToast("User login password updated successfully!", "success");
        fetchAllAdminData();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Failed to edit user password.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error changing user password.", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Toggle suspend / active user status
  const handleToggleUserStatus = async (targetUser: any) => {
    const nextStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    setActionLoading(`status-${targetUser.id}`);
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetUserId: targetUser.id, 
          status: nextStatus 
        })
      });
      if (res.ok) {
        if (selectedUserForEdit && selectedUserForEdit.id === targetUser.id) {
          setSelectedUserForEdit(prev => prev ? { ...prev, status: nextStatus } : null);
        }
        fetchAllAdminData();
      } else {
        alert("Failed to change user system restriction status.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle save global system settings
  const handleSaveSettings = async () => {
    setActionLoading('save-settings');
    try {
      const res = await fetch('/api/admin/settings/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cbeAccountName,
          cbeAccountNumber,
          referralBonusPercentage,
          productionInviteUrl,
          companyLicenseUrl
        })
      });
      if (res.ok) {
        alert("Institutional settings saved successfully.");
        fetchAllAdminData();
      } else {
        alert("Failed to configure settings.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDeposits = deposits.filter(d => {
    const correspondingUser = users.find(u => u.id === d.userId);
    const matchesSearch = d.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.userPhone?.includes(searchTerm) || 
                          d.id?.includes(searchTerm) ||
                          (correspondingUser?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (correspondingUser?.profile?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (depositFilter === 'all') return true;
    return d.status === depositFilter;
  });

  const filteredWithdrawals = withdrawals.filter(w => {
    const correspondingUser = users.find(u => u.id === w.userId);
    const matchesSearch = w.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.userPhone?.includes(searchTerm) || 
                          w.id?.includes(searchTerm) ||
                          (correspondingUser?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (correspondingUser?.profile?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (withdrawalFilter === 'all') return true;
    return w.status === withdrawalFilter;
  });

  const filteredLoans = loans.filter(l => {
    const correspondingUser = users.find(u => u.id === l.userId);
    const matchesSearch = l.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.userPhone?.includes(searchTerm) || 
                          l.id?.includes(searchTerm) ||
                          (correspondingUser?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (correspondingUser?.profile?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (loanFilter === 'all') return true;
    return l.status === loanFilter;
  });

  const filteredIdUsers = users.filter(u => {
    const profStatus = u.profile?.idVerificationStatus || 'unsubmitted';
    const matchesSearch = (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.phone?.includes(searchTerm) ||
                          u.id?.includes(searchTerm) ||
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.profile?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (idFilter === 'all') {
      return true;
    }
    return profStatus === idFilter;
  });

  const filteredUserList = users.filter(u => {
    const matchesSearch = (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.phone?.includes(searchTerm) || 
                          u.id?.includes(searchTerm) ||
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.profile?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (userStatusFilter === 'all') return true;
    return u.status === userStatusFilter;
  });

  return (
    <div className="bg-slate-50 min-h-[85vh] rounded-3xl p-4 sm:p-6 border border-slate-200/60 shadow-lg relative text-slate-800" id="admin-management-panel">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 mb-5">
        <div>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex items-center space-x-2">
              <span className="p-1 px-2.5 rounded-full bg-[#0A3D91] text-white text-[10px] font-mono uppercase font-black tracking-widest animate-pulse">SYSTEM ROOT</span>
              <h2 className="font-display font-black text-lg text-[#0A3D91] uppercase tracking-wide">TREASURY AUDITING CONSOLE</h2>
            </div>
            {lastSynced && (
              <div className="inline-flex items-center space-x-1 text-[9px] font-mono uppercase font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full w-fit">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>SYNCED: {lastSynced.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">Verify submissions, audit ledger limits, clearing transactions, and check PII documents.</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button 
            onClick={fetchAllAdminData}
            disabled={loading}
            className="p-2 border border-slate-200 text-slate-600 rounded-xl bg-white hover:bg-slate-100 transition-all cursor-pointer shadow-3xs"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0A3D91]' : ''}`} />
          </button>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-350 active:scale-98 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-3xs"
          >
            Exit Audit
          </button>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/60 pb-3.5 mb-5 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: Landmark },
          { id: 'deposits', label: 'Deposits', icon: Coins, count: deposits.filter(d => d.status === 'pending').length },
          { id: 'withdrawals', label: 'Withdrawals', icon: CreditCard, count: withdrawals.filter(w => w.status === 'pending').length },
          { id: 'id-verify', label: 'ID Verify', icon: ShieldAlert, count: users.filter(u => u.profile?.idVerificationStatus === 'pending').length },
          { id: 'users', label: 'Users Manager', icon: Users },
          { id: 'cards', label: 'LUMORA Cards', icon: CreditCard, count: allCards.filter(c => c.status === 'pending').length },
          { id: 'loans', label: 'Loans Board', icon: FileText, count: loans.filter(l => l.status === 'pending').length },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSearchTerm('');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-[#0A3D91] text-white shadow-sm scale-102' 
                  : 'text-slate-600 hover:bg-slate-150 hover:text-slate-900 bg-white border border-slate-200/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {!!tab.count && (
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-black ${isActive ? 'bg-white text-[#0A3D91]' : 'bg-rose-500 text-white'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar for data lists */}
      {['deposits', 'withdrawals', 'id-verify', 'users', 'loans', 'cards'].includes(activeSubTab) && (
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search accounts by name, phone, email, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0A3D91] placeholder-slate-400"
          />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/50 shadow-3xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A3D91] mb-3"></div>
          <p className="text-xs font-mono font-black tracking-widest text-[#0A3D91] uppercase">Securing live ledger state...</p>
        </div>
      ) : (
        <div id="admin-subcontent-render">
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Registrations", value: stats.totalUsers, desc: "Active system addresses" },
                  { label: "Treasury Deposits", value: `${(stats.totalDeposited || 0).toLocaleString()} ETB`, desc: "Cleared capital inflow" },
                  { label: "Withdrawn Disbursed", value: `${(stats.totalWithdrawn || 0).toLocaleString()} ETB`, desc: "Settled liquidity cashout" },
                  { label: "Combined Balance Liabilities", value: `${(stats.totalBalance || 0).toLocaleString()} ETB`, desc: "User wallets sum" }
                ].map((c, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-3xs flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{c.label}</p>
                      <p className="text-lg font-black text-[#0A3D91] mt-1 tracking-tight">{c.value}</p>
                    </div>
                    <p className="text-[9px] font-medium text-slate-500 mt-2.5">{c.desc}</p>
                  </div>
                ))}
              </div>

              {/* Pending Action Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-3xs">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-display font-black text-[11px] text-slate-700 uppercase tracking-widest">🚨 Pending audit alerts</h3>
                    <span className="p-1 px-2.5 bg-rose-50 text-rose-600 rounded-full text-[9px] font-mono font-black">ACTION REQUIRED</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 bg-red-50/40 rounded-xl border border-red-100">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Deposits awaiting validation</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">CBE Mobile Banking Transfers waiting for review</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-rose-600">{stats.pendingDepositsCount || 0}</p>
                        <p className="text-[9px] font-mono text-slate-400">{stats.pendingDepositsAmount?.toLocaleString() || 0} ETB</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50/40 rounded-xl border border-amber-100">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Withdrawals waiting disbursement</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">User cashout withdrawals verifying bank rails</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-amber-600">{stats.pendingWithdrawalsCount || 0}</p>
                        <p className="text-[9px] font-mono text-slate-400">{stats.pendingWithdrawalsAmount?.toLocaleString() || 0} ETB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Desk operations instructions */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-black text-[11px] text-slate-700 uppercase tracking-widest">📋 Auditor Clearing Instructions</h3>
                    <ul className="text-[10.5px] leading-relaxed text-slate-500 space-y-1.5 mt-3 font-semibold">
                      <li className="flex items-start space-x-1.5">
                        <span className="text-[#0A3D91] font-black text-[12px] leading-none shrink-0">•</span>
                        <span>Confirm CBE app notification reference matches the submitted deposit referential code exactly.</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <span className="text-[#0A3D91] font-black text-[12px] leading-none shrink-0">•</span>
                        <span>Open National ID captures in the verify tab. Match selfie biometrics with document photo cards perfectly before verification clearing.</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <span className="text-[#0A3D91] font-black text-[12px] leading-none shrink-0">•</span>
                        <span>Ensure user verification releases registration welcome bonus (175 ETB) in single batches.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold text-slate-400">STATE: SYNCHRONIZED</span>
                    <button 
                      onClick={() => setActiveSubTab('deposits')}
                      className="text-[10px] font-black text-[#0A3D91] hover:underline flex items-center space-x-0.5 uppercase tracking-wider"
                    >
                      <span>Clearing desk</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEPOSITS MANAGER */}
          {activeSubTab === 'deposits' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex items-center space-x-2 border-b border-slate-200/60 pb-3">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((fil) => (
                  <button
                    key={fil}
                    onClick={() => setDepositFilter(fil)}
                    className={`px-3 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      depositFilter === fil 
                        ? 'bg-slate-200 text-slate-800' 
                        : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-200/60'
                    }`}
                  >
                    {fil} ({deposits.filter(d => fil === 'all' ? true : d.status === fil).length})
                  </button>
                ))}
              </div>

              {filteredDeposits.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-slate-200/50 text-center text-slate-400 font-semibold text-xs uppercase tracking-wide">
                  No deposits found aligning with filters.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/50 bg-white shadow-3xs">
                  <table className="w-full min-w-[850px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Depositor</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Amount/Source</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Reference Code</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Receipt App Screenshot</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Timeline</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Status</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredDeposits.map((dep) => (
                        <tr key={dep.id} className="hover:bg-slate-50/40">
                          <td className="p-3">
                            <p className="font-bold text-slate-700">{dep.userName || "Unknown client"}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{dep.userPhone}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-mono font-black text-[#0A3D91]">{dep.amount?.toLocaleString()} ETB</p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{dep.bankAccount || "CBE BANK"}</p>
                          </td>
                          <td className="p-3">
                            <span className="p-1 px-2 font-mono text-[10px] bg-blue-50 text-slate-700 rounded-lg border border-blue-100 font-bold block w-fit">
                              {dep.bankReference || dep.id}
                            </span>
                          </td>
                          <td className="p-3">
                            {dep.receiptImage ? (
                              <button 
                                onClick={() => setViewerImage(dep.receiptImage)}
                                className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden hover:scale-105 transition-all shadow-3xs cursor-zoom-in relative group"
                              >
                                <img src={dep.receiptImage} alt="Receipt" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </div>
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-mono italic">No receipt file uploaded</span>
                            )}
                          </td>
                          <td className="p-3 text-[10px] text-slate-500 font-mono">
                            {new Date(dep.submittedAt).toLocaleString()}
                          </td>
                          <td className="p-3 relative overflow-visible">
                            <span className={`p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest relative z-10 ${
                              dep.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              dep.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {dep.status}
                            </span>
                            {dep.status === 'approved' && (
                              <div className="absolute left-[35px] top-[-10px] opacity-100 pointer-events-none z-0 transform scale-[0.72] select-none origin-center">
                                <LumoraStamp text="APPROVED" variant="green" size="xs" tilted={true} highContrast={true} />
                              </div>
                            )}
                            {dep.status === 'rejected' && (
                              <div className="absolute left-[35px] top-[-10px] opacity-100 pointer-events-none z-0 transform scale-[0.72] select-none origin-center">
                                <LumoraStamp text="REJECTED" variant="rose" size="xs" tilted={true} highContrast={true} />
                              </div>
                            )}
                            {dep.status === 'rejected' && dep.rejectionReason && (
                              <p className="text-[10px] text-rose-650 font-semibold mt-1 bg-rose-50 p-1.5 rounded-lg max-w-[200px] border border-rose-100 relative z-10">{dep.rejectionReason}</p>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {dep.status === 'pending' ? (
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => handleDepositAction(dep.id, 'approve')}
                                  disabled={actionLoading !== null}
                                  className="p-1.5 rounded-lg bg-emerald-555 text-white hover:bg-emerald-600 transition-all cursor-pointer shadow-3xs"
                                  title="Approve / Credit User"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <button
                                  onClick={() => setRejectionModal({ type: 'deposit', id: dep.id })}
                                  disabled={actionLoading !== null}
                                  className="p-1.5 rounded-lg bg-rose-555 text-white hover:bg-rose-600 transition-all cursor-pointer shadow-3xs"
                                  title="Reject Submission"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WITHDRAWALS MANAGER */}
          {activeSubTab === 'withdrawals' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex items-center space-x-2 border-b border-slate-200/60 pb-3">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((fil) => (
                  <button
                    key={fil}
                    onClick={() => setWithdrawalFilter(fil)}
                    className={`px-3 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      withdrawalFilter === fil 
                        ? 'bg-slate-200 text-slate-800' 
                        : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-200/60'
                    }`}
                  >
                    {fil} ({withdrawals.filter(w => fil === 'all' ? true : w.status === fil).length})
                  </button>
                ))}
              </div>

              {filteredWithdrawals.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-slate-200/50 text-center text-slate-400 font-semibold text-xs uppercase tracking-wide">
                  No withdrawals found aligning with criteria.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/50 bg-white shadow-3xs">
                  <table className="w-full min-w-[950px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Candidate Name</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Amount (Fees)</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Pool Target</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Destination Bank Rails</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono">Submitted</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Status</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredWithdrawals.map((wit) => (
                        <tr key={wit.id} className="hover:bg-slate-50/40">
                          <td className="p-3">
                            <p className="font-bold text-slate-700">{wit.userName || "LUMORA Member"}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{wit.userPhone}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-mono font-black text-[#0A3D91]">{wit.amount?.toLocaleString()} ETB</p>
                            {wit.fee !== undefined && (
                              <p className="text-[9.5px] text-rose-500 font-mono font-bold mt-0.5">Net: {wit.netAmount?.toLocaleString() || wit.amount} ETB (Fee: {wit.fee} ETB)</p>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`p-1 px-2.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider block w-fit ${
                              wit.balanceType === 'income' ? 'bg-[#0A3D91]/15 text-[#0A3D91]' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {wit.balanceType === 'income' ? 'YIELD EARNINGS' : 'WALLET DEPOSIT'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="bg-slate-50 border border-slate-150 p-2 rounded-xl text-[10px] max-w-[210px]">
                              <p className="font-bold text-slate-700">{wit.bankName || "Commercial Bank of Ethiopia (CBE)"}</p>
                              <div className="flex items-center space-x-1.5 mt-1">
                                <span className="font-mono text-[9px] text-[#0A3D91] font-black tracking-widest">{wit.accountNumber}</span>
                                {wit.accountNumber && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(wit.accountNumber || '', 'Account Number')}
                                    className="p-0.5 rounded text-slate-405 hover:text-[#0A3D91] hover:bg-slate-200/50 transition active:scale-90 cursor-pointer shrink-0"
                                    title="Copy Account Number"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-[9.5px] text-slate-400 font-semibold uppercase mt-0.5">{wit.accountHolderName || wit.userName}</p>
                            </div>
                          </td>
                          <td className="p-3 text-[10px] text-slate-500 font-mono">
                            {new Date(wit.submittedAt).toLocaleString()}
                          </td>
                          <td className="p-3 relative overflow-visible">
                            <span className={`p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest relative z-10 ${
                              wit.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              wit.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {wit.status}
                            </span>
                            {wit.status === 'approved' && (
                              <div className="absolute left-[35px] top-[-10px] opacity-100 pointer-events-none z-0 transform scale-[0.72] select-none origin-center">
                                <LumoraStamp text="APPROVED" variant="green" size="xs" tilted={true} highContrast={true} />
                              </div>
                            )}
                            {wit.status === 'rejected' && (
                              <div className="absolute left-[35px] top-[-10px] opacity-100 pointer-events-none z-0 transform scale-[0.72] select-none origin-center">
                                <LumoraStamp text="REJECTED" variant="rose" size="xs" tilted={true} highContrast={true} />
                              </div>
                            )}
                            {wit.status === 'rejected' && wit.rejectionReason && (
                              <p className="text-[10px] text-rose-650 font-semibold mt-1 bg-rose-50 p-1.5 rounded-lg border border-rose-100 relative z-10">{wit.rejectionReason}</p>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {wit.status === 'pending' ? (
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => setWithdrawalActionConfirm({ id: wit.id, userName: wit.userName || "LUMORA Member", amount: wit.amount, action: 'approve' })}
                                  disabled={actionLoading !== null}
                                  className="py-1.5 px-3 rounded-lg bg-emerald-600 font-extrabold text-[10px] text-white uppercase tracking-wider hover:bg-emerald-700 hover:scale-102 active:scale-98 flex items-center space-x-1 cursor-pointer transition-all shadow-3xs"
                                  title="Approve / Disburse cashout"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => setWithdrawalActionConfirm({ id: wit.id, userName: wit.userName || "LUMORA Member", amount: wit.amount, action: 'reject' })}
                                  disabled={actionLoading !== null}
                                  className="py-1.5 px-3 rounded-lg bg-rose-600 font-extrabold text-[10px] text-white uppercase tracking-wider hover:bg-rose-700 hover:scale-102 active:scale-98 flex items-center space-x-1 cursor-pointer transition-all shadow-3xs"
                                  title="Reject cashout"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ID VERIFICATION MANAGER */}
          {activeSubTab === 'id-verify' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/60 pb-3">
                {(['unsubmitted', 'pending', 'verified', 'rejected', 'all'] as const).map((fil) => (
                  <button
                    key={fil}
                    onClick={() => setIdFilter(fil)}
                    className={`px-3 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      idFilter === fil 
                        ? 'bg-slate-200 text-slate-800' 
                        : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-200/60'
                    }`}
                  >
                    {fil} ({users.filter(u => {
                      const verSt = u.profile?.idVerificationStatus || 'unsubmitted';
                      return fil === 'all' ? true : verSt === fil;
                    }).length})
                  </button>
                ))}
              </div>

              {filteredIdUsers.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-slate-200/50 text-center text-slate-400 font-semibold text-xs uppercase tracking-wide">
                  No applicant biometrics found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIdUsers.map((usr) => {
                    const prof = usr.profile || {};
                    return (
                      <div key={usr.id} className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-3xs flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2.5">
                          <div>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{prof.fullName || usr.fullName || "Unregistered candidate"}</p>
                            <p className="text-[10.5px] text-slate-500 font-mono mt-0.5">{usr.phone} • REGISTRATION DATE: {new Date(usr.registrationDate).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider ${
                              prof.idVerificationStatus === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              prof.idVerificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700 border border-emerald-250' : 'bg-rose-100 text-rose-700'
                            }`}>
                              REVIEWS STATUS: {prof.idVerificationStatus || 'unsubmitted'}
                            </span>
                            {prof.fanNumber && (
                              <span className="p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                                National ID (FAN): {prof.fanNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ID Photos panel */}
                        <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-150">
                          {['idCardFront', 'idCardBack', 'idSelfie'].map((key) => {
                            const val = prof[key];
                            const labels = { idCardFront: 'ID Front', idCardBack: 'ID Back', idSelfie: 'Biometric Selfie' };
                            return (
                              <div key={key} className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{labels[key as keyof typeof labels]}</span>
                                {val ? (
                                  <button 
                                    onClick={() => setViewerImage(val)}
                                    className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden hover:scale-102 transition-all shadow-3xs cursor-zoom-in relative group"
                                  >
                                    <img src={val} alt={key} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Eye className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  </button>
                                ) : (
                                  <div className="w-14 h-14 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-[9px] text-slate-300 italic font-mono uppercase bg-white">
                                    Empty
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* ID Action buttons */}
                        <div className="flex items-center md:self-center gap-2">
                          {prof.idVerificationStatus === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleIdVerifyAction(usr.id, 'approve')}
                                disabled={actionLoading !== null}
                                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-extrabold active:scale-98 text-white text-[10.5px] uppercase tracking-wider transition-all flex items-center space-x-1 cursor-pointer shadow-3xs"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Verify Clearing</span>
                              </button>
                              <button
                                onClick={() => setRejectionModal({ type: 'id-verify', id: usr.id })}
                                disabled={actionLoading !== null}
                                className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-extrabold active:scale-98 text-white text-[10.5px] uppercase tracking-wider transition-all flex items-center space-x-1 cursor-pointer shadow-3xs"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject ID</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest italic font-extrabold select-none bg-slate-100 px-2 py-1 rounded-lg">
                                {prof.idVerificationStatus === 'verified' ? 'Identity Cleared' : prof.idVerificationStatus === 'rejected' ? 'Identity Denied' : 'Not Uploaded'}
                              </span>
                              
                              <div className="flex items-center space-x-1">
                                {prof.idVerificationStatus !== 'verified' && (
                                  <button
                                    onClick={() => handleIdVerifyAction(usr.id, 'approve')}
                                    disabled={actionLoading !== null}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[9.5px] font-black uppercase tracking-wider transition-all flex items-center space-x-1 cursor-pointer animate-pulse"
                                  >
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                    <span>Verify</span>
                                  </button>
                                )}
                                {prof.idVerificationStatus !== 'rejected' && (
                                  <button
                                    onClick={() => setRejectionModal({ type: 'id-verify', id: usr.id })}
                                    disabled={actionLoading !== null}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[9.5px] font-black uppercase tracking-wider transition-all flex items-center space-x-1 cursor-pointer"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    <span>Reject</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: USERS MANAGER */}
          {activeSubTab === 'users' && (
            <div className="space-y-4">
              {/* Status filter controls for Users */}
              <div className="flex items-center space-x-2 border-b border-slate-200/60 pb-3">
                {(['all', 'active', 'suspended'] as const).map((fil) => (
                  <button
                    key={fil}
                    onClick={() => setUserStatusFilter(fil)}
                    className={`px-3.5 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      userStatusFilter === fil 
                        ? 'bg-[#0A3D91] text-white' 
                        : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-200/60'
                    }`}
                  >
                    {fil === 'all' ? 'All Accounts' : fil === 'active' ? 'Active' : 'Suspended'} ({users.filter(u => fil === 'all' ? true : u.status === fil).length})
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/50 bg-white shadow-3xs">
                <table className="w-full min-w-[1350px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[9.5px] text-slate-500 font-black uppercase tracking-wider">
                      <th className="p-3 w-[220px]">User Identity</th>
                      <th className="p-3 w-[200px]">System Passwords</th>
                      <th className="p-3 w-[260px]">Withdrawal Bank Account</th>
                      <th className="p-3 w-[180px]">Ledgers & VIP</th>
                      <th className="p-3 w-[280px]">Verification & Restrictions</th>
                      <th className="p-3 text-right">Auditor Console</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredUserList.map((usr) => {
                      const prof = usr.profile || {};
                      return (
                        <tr key={usr.id} className="hover:bg-slate-50/40">
                          {/* Col 1: Name, Phone, ID, Registration Date */}
                          <td className="p-3">
                            <p className="font-bold text-slate-800 text-[12px]">{usr.fullName || "Unregistered Member"}</p>
                            <div className="space-y-1 mt-1 font-mono text-[10px]">
                              <p className="text-slate-500 flex items-center space-x-1">
                                <span className="bg-slate-100 px-1 rounded text-slate-400 font-sans text-[8px] font-bold uppercase tracking-wide">ID</span>
                                <span className="text-[#0A3D91] font-bold">{usr.id}</span>
                                <Copy 
                                  className="w-3.5 h-3.5 text-slate-300 hover:text-[#0A3D91] transition cursor-pointer active:scale-90" 
                                  onClick={() => copyToClipboard(usr.id, 'User ID')}
                                />
                              </p>
                              <p className="text-slate-500 flex items-center space-x-1">
                                <span className="bg-slate-100 px-1 rounded text-slate-400 font-sans text-[8px] font-bold uppercase tracking-wide">PH</span>
                                <span className="text-slate-700 font-bold">{usr.phone}</span>
                                <Copy 
                                  className="w-3.5 h-3.5 text-slate-300 hover:text-[#0A3D91] transition cursor-pointer active:scale-90" 
                                  onClick={() => copyToClipboard(usr.phone, 'Phone Number')}
                                />
                              </p>
                            </div>
                            <p className="text-[9.5px] text-slate-400 font-semibold mt-1.5 font-sans">
                              Registered: {usr.registrationDate ? new Date(usr.registrationDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </td>

                          {/* Col 2: Login Password & Transaction PIP */}
                          <td className="p-3">
                            <div className="space-y-2">
                              <div>
                                <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Login Password</span>
                                <div className="flex items-center space-x-1.5 font-mono text-[10.5px] text-slate-800 bg-slate-50 border border-slate-150 p-1 px-2 rounded-lg mt-0.5 w-fit">
                                  <span>{usr.password || "N/A"}</span>
                                  {usr.password && (
                                    <Copy 
                                      className="w-3.5 h-3.5 text-slate-400 hover:text-[#0A3D91] transition cursor-pointer active:scale-90" 
                                      onClick={() => copyToClipboard(usr.password || '', 'Login Password')}
                                    />
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Payment Password (PIN)</span>
                                <div className="flex items-center space-x-1.5 font-mono text-[10.5px] text-emerald-700 bg-emerald-50/40 border border-emerald-150 p-1 px-2 rounded-lg mt-0.5 w-fit font-bold">
                                  <span>{prof.transactionPin || "Not Loaded"}</span>
                                  {prof.transactionPin && (
                                    <Copy 
                                      className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-700 transition cursor-pointer active:scale-90" 
                                      onClick={() => copyToClipboard(prof.transactionPin || '', 'Payment Password')}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 3: bank account, account name, account number */}
                          <td className="p-3">
                            <div className="space-y-1.5 text-[10px] text-slate-600">
                              <div>
                                <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Bank / Wallet Destination</span>
                                <span className="font-bold text-slate-800 block text-[11px] mt-0.5">{prof.bankName || "Commercial Bank of Ethiopia (CBE)"}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="bg-slate-100 px-1 rounded text-slate-400 font-sans text-[8px] font-bold uppercase tracking-wide">NAME</span>
                                <span className="font-semibold text-slate-700 max-w-[130px] truncate">{prof.accountHolderName || "N/A"}</span>
                                {prof.accountHolderName && (
                                  <Copy 
                                    className="w-3.5 h-3.5 text-slate-300 hover:text-[#0A3D91] transition cursor-pointer active:scale-90 shrink-0" 
                                    onClick={() => copyToClipboard(prof.accountHolderName || '', 'Account Name')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-1 font-mono">
                                <span className="bg-slate-100 px-1 rounded text-slate-400 font-sans text-[8px] font-bold uppercase tracking-wide">ACCT</span>
                                <span className="font-black text-[#0A3D91]">{prof.accountNumber || "N/A"}</span>
                                {prof.accountNumber && (
                                  <Copy 
                                    className="w-3.5 h-3.5 text-slate-300 hover:text-[#0A3D91] transition cursor-pointer active:scale-90 shrink-0" 
                                    onClick={() => copyToClipboard(prof.accountNumber || '', 'Account Number')}
                                  />
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Col 4: wallet balances and VIP */}
                          <td className="p-3">
                            <div className="space-y-1.5">
                              <div>
                                <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Available Balance</span>
                                <span className="font-mono font-black text-[#0A3D91] text-[12.5px]">{(prof.walletBalance || 0).toLocaleString()} <span className="text-[9px] font-bold font-sans">ETB</span></span>
                              </div>
                              <div className="flex gap-1.5 items-center">
                                <span className="p-0.5 px-2 text-[9px] font-mono font-black bg-[#0A3D91]/10 text-[#0A3D91] border border-slate-205 rounded-md uppercase tracking-wider">
                                  VIP {prof.vipLevel || 0}
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-450 font-medium">
                                {usr.referredBy ? `Referred: #${usr.referredBy}` : "Direct Arrival"}
                              </p>
                            </div>
                          </td>

                          {/* Col 5: Verification & system status restriction details */}
                          <td className="p-3">
                            <div className="space-y-2">
                              {/* Status Badges line */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest w-fit ${
                                  prof.idVerificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                  prof.idVerificationStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  ID: {prof.idVerificationStatus || 'unsubmitted'}
                                </span>
                                
                                <span className={`p-1 px-2 rounded-full text-[9px] font-mono font-black uppercase tracking-widest ${
                                  usr.status === 'suspended' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}>
                                  LIMITS: {usr.status || 'active'}
                                </span>

                                {prof.fanNumber && (
                                  <span className="p-1 px-2 rounded-full text-[9px] font-mono font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    FAN: {prof.fanNumber}
                                  </span>
                                )}
                              </div>

                              {prof.idVerificationStatus === 'pending' ? (
                                <div className="bg-slate-50 border border-slate-200/60 p-2 rounded-xl space-y-2 shadow-4xs max-w-[240px]">
                                  <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">SUBMITTED IDENTIFICATION IMAGE</p>
                                  <div className="flex items-center space-x-1.5">
                                    {['idCardFront', 'idCardBack', 'idSelfie'].map((key) => {
                                      const val = prof[key];
                                      if (!val) return null;
                                      const labels = { idCardFront: 'Front', idCardBack: 'Back', idSelfie: 'Selfie' };
                                      return (
                                        <button
                                          key={key}
                                          type="button"
                                          onClick={() => setViewerImage(val)}
                                          className="w-8 h-8 rounded-lg border border-slate-250 bg-white overflow-hidden hover:scale-105 transition-all shadow-4xs cursor-zoom-in relative group shrink-0"
                                          title={`${labels[key as keyof typeof labels]} ID Photo (Click to zoom)`}
                                        >
                                          <img src={val} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                  
                                  {/* Direct review inline */}
                                  <div className="flex items-center space-x-1.5 pt-1.5 border-t border-slate-200/50">
                                    <button
                                      type="button"
                                      onClick={() => handleIdVerifyAction(usr.id, 'approve')}
                                      disabled={actionLoading !== null}
                                      className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-[9.5px] font-black text-white rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-all animate-pulse"
                                      title="Approve / Verify User ID"
                                    >
                                      <Check className="w-3 h-3 stroke-[2.5]" />
                                      <span>Verify</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRejectionModal({ type: 'id-verify', id: usr.id })}
                                      disabled={actionLoading !== null}
                                      className="p-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[9.5px] font-bold cursor-pointer transition-all"
                                      title="Reject ID Document"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1.5">
                                  {prof.idVerificationStatus !== 'verified' && (
                                    <button
                                      type="button"
                                      onClick={() => handleIdVerifyAction(usr.id, 'approve')}
                                      disabled={actionLoading !== null}
                                      className="py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-750 border border-emerald-200 rounded-lg text-[9px] font-black uppercase flex items-center space-x-1 cursor-pointer transition-all"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                                      <span>Verify ID</span>
                                    </button>
                                  )}
                                  
                                  {prof.idVerificationStatus !== 'rejected' && prof.idVerificationStatus !== 'unsubmitted' ? (
                                    <button
                                      type="button"
                                      onClick={() => setRejectionModal({ type: 'id-verify', id: usr.id })}
                                      disabled={actionLoading !== null}
                                      className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-750 border border-rose-200 rounded-lg text-[9px] font-black uppercase flex items-center space-x-1 cursor-pointer transition-all"
                                    >
                                      <XCircle className="w-2.5 h-2.5" />
                                      <span>Revoke</span>
                                    </button>
                                  ) : prof.idVerificationStatus === 'unsubmitted' ? (
                                    <button
                                      type="button"
                                      onClick={() => setRejectionModal({ type: 'id-verify', id: usr.id })}
                                      disabled={actionLoading !== null}
                                      className="py-1 px-2 bg-rose-55 hover:bg-rose-100 text-rose-750 border border-rose-200 rounded-lg text-[9px] font-black uppercase flex items-center space-x-1 cursor-pointer transition-all"
                                    >
                                      <XCircle className="w-2.5 h-2.5" />
                                      <span>Decline</span>
                                    </button>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Col 6: Edit, Suspend/Unsuspend auditor panel actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setSelectedUserForEdit(usr)}
                                className="px-3 py-1.5 border border-[#0A3D91]/20 rounded-xl bg-[#0A3D91]/5 font-black uppercase hover:bg-[#0A3D91]/10 text-[10px] text-[#0A3D91] cursor-pointer transition-all shadow-3xs"
                              >
                                Edit / Audit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(usr)}
                                disabled={actionLoading !== null}
                                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                  usr.status === 'suspended'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-600 border-rose-250 hover:bg-rose-100'
                                }`}
                                title={usr.status === 'suspended' ? "Unsuspend account" : "Suspend account"}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: LOANS BOARD */}
          {activeSubTab === 'loans' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200/60 pb-3">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((fil) => (
                  <button
                    key={fil}
                    onClick={() => setLoanFilter(fil)}
                    className={`px-3 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      loanFilter === fil 
                        ? 'bg-slate-200 text-slate-800' 
                        : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-200/60'
                    }`}
                  >
                    {fil} ({loans.filter(l => fil === 'all' ? true : l.status === fil).length})
                  </button>
                ))}
              </div>

              {filteredLoans.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-slate-200/50 text-center text-slate-400 font-semibold text-xs uppercase tracking-wide">
                  No institutional loan applications found.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/50 bg-white shadow-3xs">
                  <table className="w-full min-w-[850px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Candidate</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Requested Sum</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Tenure Months</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">National ID Card Ref</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono">Date</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Status</th>
                        <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredLoans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-slate-50/40">
                          <td className="p-3">
                            <p className="font-bold text-slate-700">{loan.userName || "LUMORA client"}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{loan.userPhone}</p>
                          </td>
                          <td className="p-3 font-mono font-black text-[#0A3D91]">
                            {loan.amount?.toLocaleString()} ETB
                          </td>
                          <td className="p-3 font-medium text-slate-650">
                            {loan.tenureMonths || 6} Months
                          </td>
                          <td className="p-3 font-mono text-[10px] text-[#0A3D91]">
                            {loan.nationalId}
                          </td>
                          <td className="p-3 text-[10px] text-slate-500 font-mono">
                            {new Date(loan.submittedAt).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className={`p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest ${
                              loan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              loan.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {loan.status === 'pending' ? (
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => handleLoanAction(loan.id, 'approve')}
                                  disabled={actionLoading !== null}
                                  className="p-1.5 rounded-lg bg-emerald-555 text-white hover:bg-emerald-600 transition-all cursor-pointer shadow-3xs"
                                  title="Approve loan"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <button
                                  onClick={() => setRejectionModal({ type: 'loan', id: loan.id })}
                                  disabled={actionLoading !== null}
                                  className="p-1.5 rounded-lg bg-rose-555 text-white hover:bg-rose-600 transition-all cursor-pointer shadow-3xs"
                                  title="Reject loan"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: INSTITUTIONAL SETTINGS */}
          {activeSubTab === 'settings' && (
            <div className="max-w-xl bg-white p-6 rounded-3xl border border-slate-200/50 shadow-3xs space-y-4">
              <h3 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-widest border-b border-slate-100 pb-2.5">Global System Coefficients</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1.5">Official CBE Treasury Account Name</label>
                  <input
                    type="text"
                    value={cbeAccountName}
                    onChange={(e) => setCbeAccountName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0A3D91]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1.5">Official CBE Treasury Account Number</label>
                  <input
                    type="text"
                    value={cbeAccountNumber}
                    onChange={(e) => setCbeAccountNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-[#0A3D91]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1.5">Affiliate Referral Bonus Commission %</label>
                <input
                  type="number"
                  value={referralBonusPercentage}
                  onChange={(e) => setReferralBonusPercentage(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0A3D91]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1.5">Production App URL Override</label>
                <input
                  type="text"
                  placeholder="e.g. https://lumorabanking.com"
                  value={productionInviteUrl}
                  onChange={(e) => setProductionInviteUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0A3D91]"
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Used as the base URL generated in user invitation links. If blank, redirects dynamically to client origin.</p>
              </div>

              {/* Company license file-upload capability */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500">Official Company Regulatory License (Image/PDF)</label>
                
                {companyLicenseUrl ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col space-y-2" id="company-license-preview-container">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#0A3D91]/10 text-[#0A3D91] rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">Official_Company_License</p>
                          <p className="text-[10px] text-slate-400">
                            {companyLicenseUrl.startsWith('data:application/pdf') ? 'PDF Document' : 'Image Asset (Base64)'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        id="remove-license-btn"
                        onClick={() => {
                          if (confirm("Are you sure you want to remove the current license file?")) {
                            setCompanyLicenseUrl('');
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                        title="Remove License"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Preview conditional helper */}
                    <div className="mt-2 border border-slate-200/60 rounded-xl overflow-hidden max-h-48 bg-white flex items-center justify-center">
                      {companyLicenseUrl.startsWith('data:application/pdf') ? (
                        <div className="p-4 text-center">
                          <p className="text-xs font-semibold text-slate-600 mb-2">PDF Document Attached</p>
                          <a 
                            href={companyLicenseUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] uppercase tracking-wider font-extrabold text-[#0A3D91] hover:underline"
                          >
                            Open PDF in New Tab
                          </a>
                        </div>
                      ) : (
                        <img 
                          src={companyLicenseUrl} 
                          alt="Company License Preview" 
                          className="object-contain w-full h-full max-h-40" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    id="company-license-drag-drop-zone"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-[#0A3D91]', 'bg-[#0A3D91]/5');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-[#0A3D91]', 'bg-[#0A3D91]/5');
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-[#0A3D91]', 'bg-[#0A3D91]/5');
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setCompanyLicenseUrl(event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*,application/pdf';
                      input.onchange = (event: any) => {
                        const file = event.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            if (e.target?.result) {
                              setCompanyLicenseUrl(e.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-[#0A3D91] hover:bg-slate-50/50 cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
                  >
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#0A3D91] transition-colors" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Drag & drop license file here, or <span className="text-[#0A3D91] underline font-extrabold">browse</span></p>
                      <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, JPEG, and PDF documents up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={actionLoading === 'save-settings'}
                  className="px-5 py-3 bg-[#0A3D91] text-white hover:bg-[#072f70] active:scale-98 font-extrabold uppercase tracking-widest text-[10px] rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm shadow-[#0A3D91]/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{actionLoading === 'save-settings' ? 'Saving configurations...' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: LUMORA CARD MANAGEMENT DESK */}
          {activeSubTab === 'cards' && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="flex items-center space-x-2 border-b border-slate-200/60 pb-3">
                {(['pending', 'active', 'frozen', 'all'] as const).map((fil) => (
                  <button
                    key={fil}
                    onClick={() => setCardFilter(fil)}
                    className={`px-3 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      cardFilter === fil 
                        ? 'bg-[#0A3D91] text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {fil} ({
                      fil === 'all' 
                        ? allCards.length 
                        : allCards.filter(c => c.status === fil).length
                    })
                  </button>
                ))}
              </div>

              {/* Card audit list table */}
              {(() => {
                const filtered = allCards.filter((card) => {
                  const matchesFilter = cardFilter === 'all' || card.status === cardFilter;
                  const uName = card.user?.fullName || '';
                  const uPhone = card.user?.phone || '';
                  const uId = card.userId || '';
                  const cNo = card.cardNumber || '';
                  const matchesSearch = 
                    searchTerm === '' ||
                    uName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    uPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    uId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cNo.replace(/\s/g, '').includes(searchTerm.replace(/\s/g, ''));
                  return matchesFilter && matchesSearch;
                });

                const handleCardAction = async (cardId: string, action: 'approve' | 'reject' | 'freeze' | 'unfreeze') => {
                  setActionLoading(`card-${cardId}-${action}`);
                  try {
                    const res = await fetch('/api/admin/cards/action', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ cardId, action })
                    });
                    if (res.ok) {
                      showToast(`Card action [${action.toUpperCase()}] applied successfully!`);
                      fetchAllAdminData();
                    } else {
                      const data = await res.json();
                      showToast(data.error || "Failed to trigger card status update.", 'error');
                    }
                  } catch (err) {
                    showToast("Network exception authorized.", 'error');
                  } finally {
                    setActionLoading(null);
                  }
                };

                return (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-3xs">
                      {filtered.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-black text-xs uppercase tracking-widest">
                          No virtual cards found under selection parameters
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-250 select-none text-[9px] font-black uppercase text-slate-450 tracking-wider">
                                <th className="p-3.5">User / Holder</th>
                                <th className="p-3.5">VIP / KYC Status</th>
                                <th className="p-3.5">Card Information</th>
                                <th className="p-3.5">Funding Balance</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 text-right">Administrative Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.map((card) => (
                                <tr key={card.id} className="border-b border-slate-150/80 hover:bg-slate-50/50 transition duration-150">
                                  <td className="p-3.5">
                                    <div className="leading-tight font-sans">
                                      <p className="font-extrabold text-slate-900 uppercase">{card.user?.fullName || 'UNKNOWN USER'}</p>
                                      <p className="font-semibold text-slate-500 font-mono text-[10px] mt-0.5">{card.user?.phone}</p>
                                      <p className="text-[8px] font-mono font-bold text-slate-400 mt-0.5 uppercase">ID: {card.userId}</p>
                                    </div>
                                  </td>

                                  <td className="p-3.5 font-sans">
                                    <div className="leading-snug">
                                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-black border border-blue-100 text-[8.5px]">
                                        VIP {card.profile?.vipLevel || 0}
                                      </span>
                                      <span className="ml-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8.5px] uppercase font-black">
                                        {card.profile?.idVerificationStatus || 'UNVERIFIED'}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="p-3.5 font-sans">
                                    <div className="leading-tight">
                                      <p className="font-bold text-slate-800 font-mono tracking-wider">{card.cardNumber}</p>
                                      <p className="text-[9px] text-[#0A3D91] font-bold mt-1">CVV: <span className="font-mono font-black">{card.cvv}</span> | EXP: <span className="font-mono font-black">{card.expiryDate}</span></p>
                                    </div>
                                  </td>

                                  <td className="p-3.5 leading-snug">
                                    <p className="font-black text-emerald-600 font-mono text-[13px]">${card.balance?.toFixed(2)} USD</p>
                                    <p className="text-[8.5px] font-semibold text-slate-400 font-mono uppercase">Applied: {new Date(card.applicationDate).toLocaleDateString()}</p>
                                  </td>

                                  <td className="p-3.5">
                                    <span className={`px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-full border ${
                                      card.status === 'active' 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                        : card.status === 'frozen'
                                        ? 'bg-rose-50 text-rose-700 border-rose-150'
                                        : 'bg-amber-50 text-amber-700 border-amber-150 animate-pulse'
                                    }`}>
                                      {card.status}
                                    </span>
                                  </td>

                                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                                    {card.status === 'pending' ? (
                                      <>
                                        <button
                                          disabled={!!actionLoading}
                                          onClick={() => handleCardAction(card.id, 'approve')}
                                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 font-black text-[9px] text-white uppercase rounded-md shadow-3xs cursor-pointer active:scale-95 transition"
                                        >
                                          {actionLoading === `card-${card.id}-approve` ? 'Approve...' : 'APPROVE'}
                                        </button>
                                        <button
                                          disabled={!!actionLoading}
                                          onClick={() => handleCardAction(card.id, 'reject')}
                                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 font-black text-[9px] text-white uppercase rounded-md shadow-3xs cursor-pointer active:scale-95 transition"
                                        >
                                          {actionLoading === `card-${card.id}-reject` ? 'Reject...' : 'REJECT & REFUND'}
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        {card.status === 'frozen' ? (
                                          <button
                                            disabled={!!actionLoading}
                                            onClick={() => handleCardAction(card.id, 'unfreeze')}
                                            className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-emerald-250 font-black text-[9px] text-emerald-850 uppercase rounded-md cursor-pointer active:scale-95 transition"
                                          >
                                            UNFREEZE
                                          </button>
                                        ) : (
                                          <button
                                            disabled={!!actionLoading}
                                            onClick={() => handleCardAction(card.id, 'freeze')}
                                            className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 border border-rose-250 font-black text-[9px] text-rose-850 uppercase rounded-md cursor-pointer active:scale-95 transition"
                                          >
                                            FREEZE
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Virtual Card Transaction History Grid */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-3xs">
                      <div className="flex items-center space-x-2 border-b border-slate-50 pb-2">
                        <CreditCard className="w-4 h-4 text-[#0A3D91]" />
                        <h4 className="text-[10px] font-black uppercase text-[#0A3D91] tracking-wider">
                          Consolidated Card Ledger Logs
                        </h4>
                      </div>

                      {allCardTransactions.length === 0 ? (
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest text-center py-4">No cards ledger history logged yet</p>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                          {allCardTransactions.map((tx) => (
                            <div key={tx.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between font-sans">
                              <div className="text-left font-sans text-xs">
                                <span className="text-[8px] font-mono text-slate-400 block">ID: {tx.id}</span>
                                <span className="font-extrabold text-slate-900 block mt-0.5">{tx.description}</span>
                                <span className="text-[8.5px] font-semibold text-slate-400 block pt-0.5 font-mono">
                                  {new Date(tx.date).toLocaleString()}
                                </span>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`text-[12px] font-black ${tx.amount < 0 || tx.type === 'card_issued' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {tx.amount < 0 || tx.type === 'card_issued' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)} USD
                                </span>
                                <span className="block text-[8px] font-mono text-slate-400 font-extrabold uppercase mt-0.5">{tx.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* LIGHTBOX FOR SCREENSHOT VIEWS */}
      <AnimatePresence>
        {viewerImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewerImage(null)}
            className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-1.5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setViewerImage(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition shadow-md"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <img src={viewerImage} alt="Fullscreen Receipt Screenshot Preview" className="max-w-full max-h-[85vh] rounded-xl object-contain" referrerPolicy="no-referrer" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REJECTION REASON MODAL */}
      <AnimatePresence>
        {rejectionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-sm w-full p-5 border border-slate-200/80 shadow-2xl space-y-4"
            >
              <div>
                <h4 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wider">Provide rejection audit comments</h4>
                <p className="text-slate-500 text-[10.5px] mt-0.5 font-medium">State why this submission failed biological/fiduciary checklist protocols. The client will be notified.</p>
              </div>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Unclear screenshot, Reference number typo, CBE biometric mismatch. Please upload standard bank receipts."
                className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0A3D91]"
              />

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setRejectionModal(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 font-extrabold text-[10.5px] text-slate-700 uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const { type, id } = rejectionModal;
                    if (type === 'deposit') handleDepositAction(id, 'reject', rejectionReason);
                    if (type === 'withdrawal') handleWithdrawalAction(id, 'reject', rejectionReason);
                    if (type === 'loan') handleLoanAction(id, 'reject', rejectionReason);
                    if (type === 'id-verify') handleIdVerifyAction(id, 'reject', rejectionReason);
                  }}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-extrabold text-[10.5px] text-white uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Send the Reason
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED USER EDIT MODAL PANEL */}
      <AnimatePresence>
        {selectedUserForEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>

              {/* User Bio Header */}
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  {selectedUserForEdit.profile?.profilePicture || selectedUserForEdit.profile?.idSelfie ? (
                    <img src={selectedUserForEdit.profile.profilePicture || selectedUserForEdit.profile.idSelfie} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Users className="w-5 h-5 text-[#0A3D91]" />
                  )}
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-[#0A3D91] uppercase tracking-tight">{selectedUserForEdit.fullName}</h4>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">AUDITING CLIENT CONSOLE PANEL</p>
                </div>
              </div>

              {/* Scrollable multi-sectioned content container */}
              <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1 text-xs">
                
                {/* SECTION 1: Account Information */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-2.5">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center space-x-1">
                    <Users className="w-3 h-3 text-[#0A3D91]" />
                    <span>Account Information</span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Full Name</span>
                      <span className="font-bold text-slate-800">{selectedUserForEdit.fullName || "Unregistered"}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">User ID</span>
                      <div className="flex items-center space-x-1 text-slate-700 font-mono mt-0.5 animate-pulse-once">
                        <span className="font-black text-[#0A3D91]">{selectedUserForEdit.id}</span>
                        <Copy 
                          className="w-3.5 h-3.5 text-slate-300 hover:text-[#0A3D91] transition cursor-pointer active:scale-90" 
                          onClick={() => copyToClipboard(selectedUserForEdit.id, 'User ID')}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Phone Number</span>
                      <div className="flex items-center space-x-1 text-slate-700 font-mono mt-0.5">
                        <span className="font-bold">{selectedUserForEdit.phone}</span>
                        <Copy 
                          className="w-3.5 h-3.5 text-slate-300 hover:text-[#0A3D91] transition cursor-pointer active:scale-95" 
                          onClick={() => copyToClipboard(selectedUserForEdit.phone, 'Phone Number')}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Invitation Code</span>
                      <div className="flex items-center space-x-1 text-slate-700 font-mono mt-0.5">
                        <span className="text-emerald-700 font-black uppercase tracking-widest">{selectedUserForEdit.referralCode || "NONE"}</span>
                        {selectedUserForEdit.referralCode && (
                          <Copy 
                            className="w-3.5 h-3.5 text-slate-300 hover:text-emerald-700 transition cursor-pointer active:scale-95" 
                            onClick={() => copyToClipboard(selectedUserForEdit.referralCode, 'Invitation Code')}
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Registration Timestamp</span>
                      <span className="text-slate-650 font-medium font-mono">
                        {selectedUserForEdit.registrationDate ? new Date(selectedUserForEdit.registrationDate).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Security Credentials */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-2.5">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center space-x-1">
                    <Key className="w-3 h-3 text-rose-600" />
                    <span>Security Information</span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Login Password</span>
                      <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-800 bg-white border border-slate-150 p-1 px-2 rounded-lg mt-0.5 w-fit">
                        <span>{selectedUserForEdit.password || "N/A"}</span>
                        {selectedUserForEdit.password && (
                          <Copy 
                            className="w-3.5 h-3.5 text-slate-400 hover:text-[#0A3D91] transition cursor-pointer active:scale-90" 
                            onClick={() => copyToClipboard(selectedUserForEdit.password || '', 'Login Password')}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Payment Password (PIN)</span>
                      <div className="flex items-center space-x-1.5 font-mono text-[11px] text-emerald-700 bg-white border border-emerald-150 p-1 px-2 rounded-lg mt-0.5 w-fit font-bold font-mono">
                        <span>{selectedUserForEdit.profile?.transactionPin || "Not Loaded"}</span>
                        {selectedUserForEdit.profile?.transactionPin && (
                          <Copy 
                            className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-700 transition cursor-pointer active:scale-90" 
                            onClick={() => copyToClipboard(selectedUserForEdit.profile?.transactionPin || '', 'Payment PIN')}
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block font-sans">KYC ID Verification State</span>
                      <span className={`inline-block mt-1 p-0.5 px-3 rounded-full text-[9px] font-mono font-black uppercase tracking-widest ${
                        selectedUserForEdit.profile?.idVerificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                        selectedUserForEdit.profile?.idVerificationStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {selectedUserForEdit.profile?.idVerificationStatus || 'unsubmitted'}
                      </span>
                    </div>

                    {/* Administrative Password Override */}
                    <div className="col-span-2 pt-2.5 border-t border-slate-200/60 mt-1.5">
                      <span className="text-[8.5px] text-rose-600 uppercase font-bold tracking-widest block mb-1.5">Administrative Password Override</span>
                      <div className="flex items-center space-x-2" id="admin-password-override-group">
                        <input
                          type="text"
                          placeholder="Type new secure user password"
                          value={newPasswordValue}
                          onChange={(e) => setNewPasswordValue(e.target.value)}
                          className="flex-1 text-[11px] font-mono p-1.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-450 focus:ring-1 focus:ring-rose-200"
                        />
                        <button
                          type="button"
                          id="submit-new-password-btn"
                          onClick={handleChangeUserPassword}
                          disabled={isUpdatingPassword || !newPasswordValue.trim()}
                          className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-3xs shrink-0"
                        >
                          {isUpdatingPassword ? 'Saving...' : 'Change'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Withdrawal Account */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-2.5">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center space-x-1">
                    <Landmark className="w-3 h-3 text-amber-600" />
                    <span>Withdrawal Account Information</span>
                  </p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Bank / Mobile Wallet Name</span>
                      <div className="flex items-center space-x-1 text-slate-800 font-semibold mt-0.5">
                        <span>{selectedUserForEdit.profile?.bankName || "Commercial Bank of Ethiopia (CBE)"}</span>
                        <Copy 
                          className="w-3.5 h-3.5 text-slate-300 hover:text-[#0A3D91] transition cursor-pointer active:scale-90" 
                          onClick={() => copyToClipboard(selectedUserForEdit.profile?.bankName || 'Commercial Bank of Ethiopia (CBE)', 'Bank Name')}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Account Holder Name</span>
                        <div className="flex items-center space-x-1 text-slate-700 mt-0.5">
                          <span className="font-bold">{selectedUserForEdit.profile?.accountHolderName || "N/A"}</span>
                          {selectedUserForEdit.profile?.accountHolderName && (
                            <Copy 
                              className="w-3.5 h-3.5 text-slate-300 hover:text-[#0A3D91] transition cursor-pointer active:scale-95" 
                              onClick={() => copyToClipboard(selectedUserForEdit.profile?.accountHolderName || '', 'Account Holder Name')}
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-widest block">Account / Wallet Number</span>
                        <div className="flex items-center space-x-1 text-slate-700 font-mono mt-0.5">
                          <span className="font-black text-[#0A3D91]">{selectedUserForEdit.profile?.accountNumber || "N/A"}</span>
                          {selectedUserForEdit.profile?.accountNumber && (
                            <Copy 
                              className="w-3.5 h-3.5 text-slate-300 hover:text-[#0A3D91] transition cursor-pointer active:scale-95" 
                              onClick={() => copyToClipboard(selectedUserForEdit.profile?.accountNumber || '', 'Account Number')}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Financial Ledger & VIP Realignment */}
                <div className="space-y-4">
                  {/* Ledger stats */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-150">
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Deposit Pool</p>
                      <p className="text-xs font-black text-[#0A3D91] mt-0.5 font-mono">{(selectedUserForEdit.profile?.depositBalance || 0).toLocaleString()} ETB</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-150">
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Income Pool</p>
                      <p className="text-xs font-black text-amber-600 mt-0.5 font-mono">{(selectedUserForEdit.profile?.incomeBalance || 0).toLocaleString()} ETB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-150 text-center">
                    <div>
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Total Wallet</p>
                      <p className="text-xs font-black text-[#0A3D91] mt-0.5 font-mono">{(selectedUserForEdit.profile?.walletBalance || 0).toLocaleString()} ETB</p>
                    </div>
                    <div className="border-x border-slate-150">
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Total Deposits</p>
                      <p className="text-xs font-black text-emerald-600 mt-0.5 font-mono">{(selectedUserForEdit.profile?.totalDeposits || 0).toLocaleString()} ETB</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Cleared Cashouts</p>
                      <p className="text-xs font-black text-rose-500 mt-0.5 font-mono">{(selectedUserForEdit.profile?.totalWithdrawals || 0).toLocaleString()} ETB</p>
                    </div>
                  </div>

                  {/* Adjust wallet input */}
                  <div className="space-y-3 p-3 bg-[#0A3D91]/5 rounded-2xl border border-[#0A3D91]/10">
                    <p className="text-[10px] font-black text-[#0A3D91] uppercase tracking-widest">Adjust Wallet Balance Ledger</p>
                    
                    <div className="flex flex-col gap-2.5">
                      <div className="flex space-x-2">
                        <select
                          value={adjustType}
                          onChange={(e) => setAdjustType(e.target.value as any)}
                          className="bg-white border border-slate-200 text-slate-900 rounded-xl px-2.5 py-2 text-xs font-extrabold focus:outline-none cursor-pointer"
                        >
                          <option value="add">Add Credit (+)</option>
                          <option value="subtract">Subtract Debit (-)</option>
                        </select>

                        <select
                          value={adjustTargetWallet}
                          onChange={(e) => setAdjustTargetWallet(e.target.value as any)}
                          className="bg-white border border-slate-200 text-[#0A3D91] rounded-xl px-2.5 py-2 text-xs font-extrabold focus:outline-none cursor-pointer flex-1"
                        >
                          <option value="deposit">To Deposit Pool</option>
                          <option value="income">To Income Pool</option>
                        </select>
                      </div>
                      
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            placeholder="Amount in ETB"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs font-mono font-black placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-[#0A3D91]"
                          />
                          <span className="absolute right-3.5 top-2.5 text-[10px] uppercase font-black text-slate-450 select-none">ETB</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleAdjustBalance}
                          disabled={actionLoading === 'adjust-balance' || !adjustAmount || isNaN(Number(adjustAmount)) || Number(adjustAmount) <= 0}
                          className="px-5 py-2 bg-[#0A3D91] hover:bg-[#072f70] text-white text-[10.5px] uppercase font-black tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-3xs"
                        >
                          Authorize
                        </button>
                      </div>
                    </div>

                    {/* REAL-TIME PREVIEW */}
                    {adjustAmount && !isNaN(Number(adjustAmount)) && Number(adjustAmount) > 0 && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#071630] border border-[#0A3D91]/30 text-white font-mono space-y-1.5 shadow-md animate-in slide-in-from-top-1 duration-150 text-[10px]">
                        <div className="flex justify-between items-center text-slate-400 text-[9px] font-sans uppercase font-black tracking-wider">
                          <span>AUDIT RECORD PREVIEW</span>
                          <span className={adjustType === 'add' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {adjustType === 'add' ? '● CREDIT ADJUSTMENT' : '● DEBIT DEDUCTION'}
                          </span>
                        </div>
                        
                        <div className="text-xs font-black text-center py-1 flex items-center justify-center space-x-2 bg-black/20 rounded-lg">
                          <span className={adjustType === 'add' ? 'text-emerald-400 font-extrabold' : 'text-rose-400 font-extrabold'}>
                            {adjustType === 'add' ? '+' : '-'} {Number(adjustAmount).toLocaleString()} ETB ({adjustTargetWallet === 'income' ? 'Income Pool' : 'Deposit Pool'})
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-white/5 pt-1.5 font-sans">
                          <div>
                            <span className="text-slate-400 block pb-0.5 font-sans">CURRENT WALLET</span>
                            <span className="font-mono font-bold text-slate-300">{(selectedUserForEdit.profile?.walletBalance || 0).toLocaleString()} ETB</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block pb-0.5 font-sans">POST-AUDIT WALLET</span>
                            <span className={`font-mono font-black ${adjustType === 'add' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {Math.max(0, adjustType === 'add' 
                                ? (selectedUserForEdit.profile?.walletBalance || 0) + Number(adjustAmount) 
                                : (selectedUserForEdit.profile?.walletBalance || 0) - Number(adjustAmount)
                              ).toLocaleString()} ETB
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-white/5 pt-1.5 font-sans">
                          <div>
                            <span className="text-slate-400 block pb-0.5 font-sans">
                              CURRENT {adjustTargetWallet === 'income' ? 'INCOME POOL' : 'DEPOSIT POOL'}
                            </span>
                            <span className="font-mono font-bold text-slate-300">
                              {(adjustTargetWallet === 'income' 
                                ? selectedUserForEdit.profile?.incomeBalance || 0 
                                : selectedUserForEdit.profile?.depositBalance || 0
                              ).toLocaleString()} ETB
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block pb-0.5 font-sans">
                              POST-AUDIT {adjustTargetWallet === 'income' ? 'INCOME POOL' : 'DEPOSIT POOL'}
                            </span>
                            <span className={`font-mono font-black ${adjustType === 'add' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {Math.max(0, adjustType === 'add' 
                                ? (adjustTargetWallet === 'income' ? selectedUserForEdit.profile?.incomeBalance || 0 : selectedUserForEdit.profile?.depositBalance || 0) + Number(adjustAmount) 
                                : (adjustTargetWallet === 'income' ? selectedUserForEdit.profile?.incomeBalance || 0 : selectedUserForEdit.profile?.depositBalance || 0) - Number(adjustAmount)
                              ).toLocaleString()} ETB
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VIP re-alignment desk */}
                  <div className="space-y-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">VIP Level Alignment Desk</p>
                    
                    <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1 scrollbar-none">
                      {Array.from({ length: 17 }).map((_, level) => {
                        const isProposed = adjustVipLevel === level;
                        const isCurrent = (selectedUserForEdit.profile?.vipLevel || 0) === level;
                        const label = level === 0 ? "No VIP" : level === 1 ? "Starter" : `VIP ${level - 1}`;
                        
                        return (
                          <button
                            key={level}
                            type="button"
                            disabled={actionLoading === 'update-vip'}
                            onClick={() => setAdjustVipLevel(level)}
                            className={`px-3 py-1.5 rounded-lg font-mono font-black text-[10px] border cursor-pointer transition-all relative ${
                              isProposed
                                ? 'bg-[#0A3D91] text-white border-transparent shadow-xs scale-102 z-10'
                                : isCurrent
                                  ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {label}
                            {isCurrent && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-550 border border-white text-[6px] text-white flex items-center justify-center font-sans font-extrabold" title="Current Level">C</span>
                            )}
                            {isProposed && !isCurrent && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-450 border border-white text-[6px] text-slate-955 flex items-center justify-center font-sans font-extrabold" title="Proposed Level">P</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* VIP Confirmation Gate inline */}
                    {adjustVipLevel !== (selectedUserForEdit.profile?.vipLevel || 0) && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-250 mt-1.5 space-y-2.5 animate-in slide-in-from-top-1 duration-150">
                        <div className="flex items-start space-x-2">
                          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                            <Award className="w-4 h-4 animate-bounce" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">CONFIRM VIP REALIGNMENT</p>
                            <p className="text-[10px] text-amber-700 font-semibold leading-relaxed">
                              Altering VIP status from <strong className="font-extrabold font-mono">VIP {selectedUserForEdit.profile?.vipLevel || 0}</strong> to <strong className="font-extrabold font-mono">VIP {adjustVipLevel}</strong>. This aligns deposit benefits and commission privileges.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 pt-1 border-t border-amber-200">
                          <button
                            type="button"
                            onClick={() => handleUpdateVip(adjustVipLevel)}
                            disabled={actionLoading === 'update-vip'}
                            className="flex-1 py-1 px-3 bg-[#0A3D91] hover:bg-[#072f70] text-[10px] font-black text-white uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-all active:scale-98"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Confirm VIP Change</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdjustVipLevel(selectedUserForEdit.profile?.vipLevel || 0)}
                            className="py-1 px-3 bg-white hover:bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200 rounded-lg cursor-pointer transition-all"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Account properties summary footer */}
              <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold text-slate-500 bg-slate-50/55 p-2.5 text-center rounded-xl">
                <div>Invite Code: <span className="font-bold text-slate-700 font-mono tracking-widest uppercase">{selectedUserForEdit.referralCode}</span></div>
                <div>ID Verification: <span className="text-slate-705 font-black uppercase tracking-wide">{selectedUserForEdit.profile?.idVerificationStatus || 'unsubmitted'}</span></div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleToggleUserStatus(selectedUserForEdit)}
                  className={`flex-1 py-3 border font-black uppercase text-xs tracking-wider rounded-xl text-center active:scale-98 transition-all cursor-pointer shadow-3xs ${
                    selectedUserForEdit.status === 'suspended'
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-rose-50 border-rose-250 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  {selectedUserForEdit.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[1100] max-w-sm w-full px-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className={`p-3.5 rounded-2xl border shadow-xl flex items-center space-x-3 backdrop-blur-md ${
              toast.type === 'error' 
                ? 'bg-rose-50/95 border-rose-200 text-rose-800' 
                : toast.type === 'info'
                  ? 'bg-blue-50/95 border-blue-200 text-blue-800'
                  : 'bg-emerald-50/95 border-emerald-250 text-emerald-800'
            }`}>
              <div className={`p-1.5 rounded-xl shrink-0 ${
                toast.type === 'error' ? 'bg-rose-100 text-rose-600' :
                toast.type === 'info' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </div>
              <p className="text-xs font-black uppercase tracking-wide flex-1 leading-snug">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* withdrawalActionConfirm MODAL */}
      <AnimatePresence>
        {withdrawalActionConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 border border-slate-200 shadow-2xl relative space-y-4"
            >
              <div className="flex items-center space-x-3 text-amber-600">
                <div className={`p-2 rounded-xl ${
                  withdrawalActionConfirm.action === 'approve' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="font-display font-black text-sm uppercase tracking-wider text-slate-900">
                  Confirm Withdrawal Decision
                </h4>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <p className="leading-relaxed font-semibold">
                  You are about to <strong className={withdrawalActionConfirm.action === 'approve' ? 'text-emerald-600 font-extrabold uppercase' : 'text-rose-600 font-extrabold uppercase'}>{withdrawalActionConfirm.action}</strong> the following withdrawal petition:
                </p>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans uppercase text-[10px] tracking-tight">PETITIONER:</span>
                    <span className="font-bold text-slate-800">{withdrawalActionConfirm.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans uppercase text-[10px] tracking-tight">ORDER ID:</span>
                    <span className="font-bold text-slate-800 text-right">#{withdrawalActionConfirm.id}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-slate-400 font-sans uppercase text-[10px] tracking-tight">CASH QUANTITY:</span>
                    <span className="font-black text-[#0A3D91] text-[13px]">{withdrawalActionConfirm.amount.toLocaleString()} ETB</span>
                  </div>
                </div>

                {withdrawalActionConfirm.action === 'approve' ? (
                  <p className="text-[10.5px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-medium leading-relaxed">
                    ● Approving this order will officially update status to <strong>APPROVED</strong>. (Note: The requested balance was already withheld upon client petition creation).
                  </p>
                ) : (
                  <p className="text-[10.5px] text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-220 font-medium leading-relaxed">
                    ● Rejecting this request will automatically refund <strong>{withdrawalActionConfirm.amount.toLocaleString()} ETB</strong> back into the user's primary wallet balance immediately.
                  </p>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    const { id, action } = withdrawalActionConfirm;
                    setWithdrawalActionConfirm(null);
                    await handleWithdrawalAction(id, action);
                  }}
                  className={`flex-1 py-2.5 px-4 text-white text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 text-center shrink-0 ${
                    withdrawalActionConfirm.action === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Authorize Execution
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalActionConfirm(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all text-center"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
