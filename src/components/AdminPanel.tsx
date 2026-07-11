import { 
  CheckCircle2, XCircle 
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';

interface AdminPanelProps {
  profile: UserProfile;
  transactions: Transaction[];
  onApproveDeposit: (txId: string) => void;
  onRejectDeposit: (txId: string) => void;
  onApproveWithdraw: (txId: string) => void;
  onRejectWithdraw: (txId: string) => void;
  onApproveKyc: () => void;
  onRejectKyc: () => void;
}

export default function AdminPanel({
  profile,
  transactions,
  onApproveDeposit,
  onRejectDeposit,
  onApproveWithdraw,
  onRejectWithdraw,
  onApproveKyc,
  onRejectKyc
}: AdminPanelProps) {
  const transactionsSafe = transactions || [];
  const pendingDeposits = transactionsSafe.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactionsSafe.filter(t => t.type === 'withdrawal' && t.status === 'pending');

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8 animate-in fade-in duration-300">
      {/* Admin Title */}
      <div className="bg-[#0A3D91] text-white p-5 rounded-3xl border border-blue-800 shadow-md">
        <h3 className="text-sm font-black uppercase text-amber-400 tracking-widest flex items-center space-x-1">
          <span>Sovereign Clearing Node & Backoffice Control</span>
        </h3>
        <p className="text-[10px] text-slate-200 mt-1 font-semibold leading-relaxed">
          Instantly audit and approve CBE deposit proof slips, withdrawal payouts, and National ID verification documents.
        </p>
      </div>

      {/* KYC Document Verification */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h4 className="text-[10px] font-black uppercase text-[#0A3D91] tracking-widest">
            Pending National ID Submissions (KYC)
          </h4>
          <span className="text-[8px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            Identity Gate
          </span>
        </div>

        {profile.idVerificationStatus === 'pending' ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider">Applicant Name:</span>
              <span className="font-extrabold text-slate-800">{profile.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider">National ID Number:</span>
              <span className="font-mono font-black text-[#0A3D91]">{profile.idCardNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-bold uppercase tracking-wider">Status:</span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-black uppercase">Pending Review</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={onApproveKyc}
                className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve ID</span>
              </button>
              <button
                onClick={onRejectKyc}
                className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1 shadow-xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject ID</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
            No Pending KYC Documentations
          </div>
        )}
      </div>

      {/* CBE Deposit Receipts Pending Approval */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h4 className="text-[10px] font-black uppercase text-[#0A3D91] tracking-widest">
            Pending CBE Deposits Proof ({pendingDeposits.length})
          </h4>
          <span className="text-[8px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
            Liquidity Ledger
          </span>
        </div>

        {pendingDeposits.length === 0 ? (
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
            No Deposits Awaiting Review
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDeposits.map((tx) => (
              <div key={tx.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">CBE Ref Code:</span>
                  <span className="font-mono font-black text-[#0A3D91] tracking-wider text-sm">{tx.referenceCode}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Declared Amount:</span>
                  <span className="font-mono font-black text-emerald-700">{tx.amount.toLocaleString()} ETB</span>
                </div>

                {tx.receiptPhoto && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-32 bg-slate-100 flex items-center justify-center p-1">
                    <img src={tx.receiptPhoto} alt="Proof screenshot" className="max-h-full object-contain" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => onApproveDeposit(tx.id)}
                    className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Credit</span>
                  </button>
                  <button
                    onClick={() => onRejectDeposit(tx.id)}
                    className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1 shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CBE Withdrawal Receipts Pending Approval */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h4 className="text-[10px] font-black uppercase text-[#0A3D91] tracking-widest">
            Pending CBE Withdrawals ({pendingWithdrawals.length})
          </h4>
          <span className="text-[8px] font-black uppercase text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
            Cash Outflow
          </span>
        </div>

        {pendingWithdrawals.length === 0 ? (
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
            No Pending Withdrawals
          </div>
        ) : (
          <div className="space-y-3">
            {pendingWithdrawals.map((tx) => (
              <div key={tx.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">CBE Phone target:</span>
                  <span className="font-mono font-black text-slate-800">{profile.phone}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Requested Cashout:</span>
                  <span className="font-mono font-black text-rose-700">{tx.amount.toLocaleString()} ETB</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => onApproveWithdraw(tx.id)}
                    className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Payout</span>
                  </button>
                  <button
                    onClick={() => onRejectWithdraw(tx.id)}
                    className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all flex items-center justify-center space-x-1 shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
