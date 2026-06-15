import React, { useState, useEffect } from 'react';
import { 
  Users, Coins, CheckCircle, XCircle, Search, ShieldAlert, ShieldCheck, 
  UserPlus, Award, Landmark, RefreshCw, ChevronRight, Ban, Eye, Key,
  Sparkles, Save, FileText, ChevronDown, Check, Sliders, Settings, CreditCard 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Profile, Deposit, Withdrawal, Loan, AppSettings, User } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'deposits' | 'withdrawals' | 'id-verify' | 'users' | 'loans' | 'settings'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtering selections
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loanFilter, setLoanFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [idFilter, setIdFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  
  // Lightbox and action modal states
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{
    type: 'deposit' | 'withdrawal' | 'loan' | 'id-verify';
    id: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // User edit modal states
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustVipLevel, setAdjustVipLevel] = useState<number>(0);
  
  // System Settings state inputs
  const [cbeAccountName, setCbeAccountName] = useState('');
  const [cbeAccountNumber, setCbeAccountNumber] = useState('');
  const [referralBonusPercentage, setReferralBonusPercentage] = useState(10);
  const [productionInviteUrl, setProductionInviteUrl] = useState('');

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
  }, [activeSubTab]);

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
        setRejectionReason('');
        fetchAllAdminData();
      } else {
        alert("Failed to submit withdrawal audit action.");
      }
    } catch (err) {
      console.error(err);
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
      alert("Please provide a valid ledger adjustment amount.");
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
          type: adjustType 
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
            walletBalance: updatedUserRaw.profile.walletBalance
          }
        } : null);
        fetchAllAdminData();
      } else {
        alert("Failed to adjust account balance.");
      }
    } catch (err) {
      console.error(err);
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
        fetchAllAdminData();
      } else {
        alert("Failed to set user VIP level.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
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
          productionInviteUrl
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
      return profStatus !== 'unsubmitted';
    }
    return profStatus === idFilter;
  });

  const filteredUserList = users.filter(u => {
    return (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
           u.phone?.includes(searchTerm) || 
           u.id?.includes(searchTerm) ||
           (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (u.profile?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
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
      {['deposits', 'withdrawals', 'id-verify', 'users', 'loans'].includes(activeSubTab) && (
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
                  <table className="w-full text-left border-collapse">
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
                          <td className="p-3">
                            <span className={`p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest ${
                              dep.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              dep.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {dep.status}
                            </span>
                            {dep.status === 'rejected' && dep.rejectionReason && (
                              <p className="text-[10px] text-rose-650 font-semibold mt-1 bg-rose-50 p-1.5 rounded-lg max-w-[200px] border border-rose-100">{dep.rejectionReason}</p>
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
                  <table className="w-full text-left border-collapse">
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
                              <p className="font-mono text-[9px] text-[#0A3D91] font-black mt-1 uppercase tracking-widest">{wit.accountNumber}</p>
                              <p className="text-[9.5px] text-slate-400 font-semibold uppercase mt-0.5">{wit.accountHolderName || wit.userName}</p>
                            </div>
                          </td>
                          <td className="p-3 text-[10px] text-slate-500 font-mono">
                            {new Date(wit.submittedAt).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className={`p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest ${
                              wit.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              wit.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {wit.status}
                            </span>
                            {wit.status === 'rejected' && wit.rejectionReason && (
                              <p className="text-[10px] text-rose-650 font-semibold mt-1 bg-rose-50 p-1.5 rounded-lg border border-rose-100">{wit.rejectionReason}</p>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {wit.status === 'pending' ? (
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => handleWithdrawalAction(wit.id, 'approve')}
                                  disabled={actionLoading !== null}
                                  className="p-1.5 rounded-lg bg-emerald-555 text-white hover:bg-emerald-600 transition-all cursor-pointer shadow-3xs"
                                  title="Disburse / Approve"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <button
                                  onClick={() => setRejectionModal({ type: 'withdrawal', id: wit.id })}
                                  disabled={actionLoading !== null}
                                  className="p-1.5 rounded-lg bg-rose-555 text-white hover:bg-rose-600 transition-all cursor-pointer shadow-3xs"
                                  title="Reject cashout"
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

          {/* TAB 4: ID VERIFICATION MANAGER */}
          {activeSubTab === 'id-verify' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200/60 pb-3">
                {(['pending', 'verified', 'rejected', 'all'] as const).map((fil) => (
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
                      return fil === 'all' ? verSt !== 'unsubmitted' : verSt === fil;
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
                          
                          <div className="flex flex-wrap items-center gap-1">
                            <span className={`p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider ${
                              prof.idVerificationStatus === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              prof.idVerificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700 border border-emerald-250' : 'bg-rose-100 text-rose-700'
                            }`}>
                              REVIEWS STATUS: {prof.idVerificationStatus || 'unsubmitted'}
                            </span>
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
                                className="px-3.5 py-2.5 rounded-xl bg-emerald-555 hover:bg-emerald-600 font-extrabold active:scale-98 text-white text-[10.5px] uppercase tracking-wider transition-all flex items-center space-x-1 cursor-pointer shadow-3xs"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Verify Clearing</span>
                              </button>
                              <button
                                onClick={() => setRejectionModal({ type: 'id-verify', id: usr.id })}
                                disabled={actionLoading !== null}
                                className="px-3.5 py-2.5 rounded-xl bg-rose-555 hover:bg-rose-600 font-extrabold active:scale-98 text-white text-[10.5px] uppercase tracking-wider transition-all flex items-center space-x-1 cursor-pointer shadow-3xs"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject ID</span>
                              </button>
                            </>
                          ) : (
                            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest italic font-bold">
                              {prof.idVerificationStatus === 'verified' ? 'Identity Cleared' : 'Identity Denied'}
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
              <div className="overflow-x-auto rounded-2xl border border-slate-200/50 bg-white shadow-3xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Candidate Profile</th>
                      <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Wallet Balance</th>
                      <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">VIP Level</th>
                      <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">LUMORA Referrer</th>
                      <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">Identification Status</th>
                      <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider">System Restriction</th>
                      <th className="p-3 text-[9px] font-black uppercase text-slate-500 tracking-wider text-right">Auditor Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredUserList.map((usr) => {
                      const prof = usr.profile || {};
                      return (
                        <tr key={usr.id} className="hover:bg-slate-50/40">
                          <td className="p-3">
                            <p className="font-bold text-slate-700">{usr.fullName || "Unregistered Member"}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{usr.phone}</p>
                          </td>
                          <td className="p-3 font-mono font-black text-[#0A3D91]">
                            {(prof.walletBalance || 0).toLocaleString()} ETB
                          </td>
                          <td className="p-3">
                            <span className="p-1 px-2 text-[9.5px] font-mono font-black bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
                              VIP {prof.vipLevel || 0}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-slate-500">
                            {usr.referredBy ? `by #${usr.referredBy}` : "Direct visitor"}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col space-y-1">
                              <span className={`p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest w-fit ${
                                prof.idVerificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                prof.idVerificationStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {prof.idVerificationStatus || 'unsubmitted'}
                              </span>
                              
                              {prof.idVerificationStatus === 'pending' && (
                                <div className="mt-2 bg-slate-50 border border-slate-200/60 p-2 rounded-xl max-w-[170px] space-y-2 shadow-4xs">
                                  <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">UPLOADED ID PHOTO FILES</p>
                                  <div className="flex items-center space-x-1.5">
                                    {['idCardFront', 'idCardBack', 'idSelfie'].map((key) => {
                                      const val = prof[key];
                                      if (!val) return null;
                                      const labels = { idCardFront: 'Front', idCardBack: 'Back', idSelfie: 'Selfie' };
                                      return (
                                        <button
                                          key={key}
                                          onClick={() => setViewerImage(val)}
                                          className="w-8 h-8 rounded-lg border border-slate-250 bg-white overflow-hidden hover:scale-105 transition-all shadow-4xs cursor-zoom-in relative group shrink-0"
                                          title={`${labels[key as keyof typeof labels]} ID Photo (Click to zoom)`}
                                        >
                                          <img src={val} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                  
                                  {/* Direct Actions inline */}
                                  <div className="flex items-center space-x-1 pt-1.5 border-t border-slate-200/50">
                                    <button
                                      onClick={() => handleIdVerifyAction(usr.id, 'approve')}
                                      disabled={actionLoading !== null}
                                      className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-[9.5px] font-black text-white rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-all"
                                      title="Approve / Verify User ID"
                                    >
                                      <Check className="w-3 h-3 stroke-[2.5]" />
                                      <span>Verify</span>
                                    </button>
                                    <button
                                      onClick={() => setRejectionModal({ type: 'id-verify', id: usr.id })}
                                      disabled={actionLoading !== null}
                                      className="p-1 bg-rose-50 hover:bg-rose-150 text-rose-600 border border-rose-200 rounded-lg cursor-pointer transition-all"
                                      title="Reject ID Document"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`p-1 px-2.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest ${
                              usr.status === 'suspended' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {usr.status || 'active'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => setSelectedUserForEdit(usr)}
                                className="px-2.5 py-1.5 border border-[#0A3D91]/20 rounded-xl bg-[#0A3D91]/5 font-black uppercase hover:bg-[#0A3D91]/10 text-xs text-[#0A3D91] cursor-pointer transition-all shadow-3xs"
                              >
                                Edit Account
                              </button>
                              <button
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
                  <table className="w-full text-left border-collapse">
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
                    const { type, id } = rejectionModal;
                    if (type === 'deposit') handleDepositAction(id, 'reject', rejectionReason);
                    if (type === 'withdrawal') handleWithdrawalAction(id, 'reject', rejectionReason);
                    if (type === 'loan') handleLoanAction(id, 'reject', rejectionReason);
                    if (type === 'id-verify') handleIdVerifyAction(id, 'reject', rejectionReason);
                  }}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 py-2.5 bg-rose-555 hover:bg-rose-600 font-extrabold text-[10.5px] text-white uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setRejectionModal(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 font-extrabold text-[10.5px] text-slate-700 uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
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
              <div className="flex items-start space-x-3 border-b border-slate-100 pb-3">
                <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  {selectedUserForEdit.profile?.idSelfie || selectedUserForEdit.profile?.profilePicture ? (
                    <img src={selectedUserForEdit.profile.idSelfie || selectedUserForEdit.profile.profilePicture} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Users className="w-5 h-5 text-[#0A3D91]" />
                  )}
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-[#0A3D91] uppercase tracking-tight">{selectedUserForEdit.fullName}</h4>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">PHONE CONTACT: {selectedUserForEdit.phone} • REGISTRATION ID: #{selectedUserForEdit.id}</p>
                </div>
              </div>

              {/* Balances list */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Wallet Balance</p>
                  <p className="text-xs font-black text-[#0A3D91] mt-0.5 font-mono">{(selectedUserForEdit.profile?.walletBalance || 0).toLocaleString()} ETB</p>
                </div>
                <div className="text-center border-x border-slate-150">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Deposits Accrued</p>
                  <p className="text-xs font-black text-emerald-600 mt-0.5 font-mono">{(selectedUserForEdit.profile?.totalDeposits || 0).toLocaleString()} ETB</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Cleared Cashout</p>
                  <p className="text-xs font-black text-rose-500 mt-0.5 font-mono">{(selectedUserForEdit.profile?.totalWithdrawals || 0).toLocaleString()} ETB</p>
                </div>
              </div>

              {/* Adjustment panel ledger */}
              <div className="space-y-3 p-3 bg-[#0A3D91]/5 rounded-2xl border border-[#0A3D91]/10">
                <p className="text-[10px] font-black text-[#0A3D91] uppercase tracking-widest">Adjust Wallet Balance Ledger</p>
                
                <div className="flex space-x-2">
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-extrabold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="add">Add Credit (+)</option>
                    <option value="subtract">Subtract Debit (-)</option>
                  </select>
                  
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      placeholder="Amount in ETB"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-black placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-[#0A3D91]"
                    />
                    <span className="absolute right-3.5 top-2.5 text-[10px] uppercase font-black text-slate-400">ETB</span>
                  </div>

                  <button
                    onClick={handleAdjustBalance}
                    disabled={actionLoading === 'adjust-balance'}
                    className="px-4 py-2 bg-[#0A3D91] hover:bg-[#072f70] text-white text-[10.5px] uppercase font-black tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 shadow-3xs"
                  >
                    Authorize
                  </button>
                </div>
              </div>

              {/* VIP promotion desk */}
              <div className="space-y-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">VIP Level Alignment Desk</p>
                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1 scrollbar-none">
                  {Array.from({ length: 16 }).map((_, level) => {
                    const isSelected = (selectedUserForEdit.profile?.vipLevel || 0) === level;
                    return (
                      <button
                        key={level}
                        disabled={actionLoading === 'update-vip'}
                        onClick={() => handleUpdateVip(level)}
                        className={`px-3 py-1.5 rounded-lg font-mono font-black text-[10px] border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#0A3D91] text-white border-transparent shadow-3xs scale-102'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        VIP {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account properties summary */}
              <div className="grid grid-cols-2 gap-3 text-[10px] font-semibold text-slate-500 bg-slate-50/50 p-2 text-center rounded-xl">
                <div>Invite Code: <span className="font-bold text-slate-700 font-mono tracking-widest uppercase">{selectedUserForEdit.referralCode}</span></div>
                <div>ID Verification: <span className="text-slate-700 font-bold uppercase">{selectedUserForEdit.profile?.idVerificationStatus || 'unsubmitted'}</span></div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleToggleUserStatus(selectedUserForEdit)}
                  className={`flex-1 py-3 border font-black uppercase text-xs tracking-wider rounded-xl text-center active:scale-98 transition-all cursor-pointer shadow-3xs ${
                    selectedUserForEdit.status === 'suspended'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-rose-50 border-rose-250 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  {selectedUserForEdit.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                </button>
                <button
                  onClick={() => setSelectedUserForEdit(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Close Auditing Panel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
