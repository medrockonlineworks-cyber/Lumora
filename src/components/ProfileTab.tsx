import React, { useState } from 'react';
import { 
  User, ShieldCheck, Share2, Clipboard, Check, Trophy, 
  Clock, ArrowUpRight, ArrowDownLeft, UploadCloud, AlertCircle
} from 'lucide-react';
import { Language, translations } from '../locale';
import { UserProfile, Transaction, Referral } from '../types';

interface ProfileTabProps {
  profile: UserProfile;
  language: Language;
  onSubmitKyc: (idNumber: string, idPhoto: string) => void;
  transactions: Transaction[];
  referrals: Referral[];
  onOpenWithdraw: () => void;
}

export default function ProfileTab({ 
  profile, 
  language, 
  onSubmitKyc, 
  transactions = [], 
  referrals = [],
  onOpenWithdraw
}: ProfileTabProps) {
  const t = translations[language];

  const [idNum, setIdNum] = useState('');
  const [idPhoto, setIdPhoto] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState('');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/register?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(link);
    alert(language === 'am' ? 'የሪፈራል ሊንክዎ ተቀድቷል!' : 'Referral link copied successfully!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPhoto(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNum || idNum.trim().length < 5) {
      setError(language === 'am' ? 'እባክዎን ትክክለኛ የመታወቂያ ቁጥር ያስገቡ' : 'Please enter a valid National ID Number.');
      return;
    }
    if (!idPhoto) {
      setError(language === 'am' ? 'እባክዎን የመታወቂያዎን የፊት ገጽ ፎቶ ይጫኑ' : 'Please upload your National ID photo.');
      return;
    }

    onSubmitKyc(idNum, idPhoto);
    setIdNum('');
    setIdPhoto('');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8 animate-in fade-in duration-300">
      {/* Profile summary banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-3xs p-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0A3D91] to-blue-600 flex items-center justify-center text-white text-xl font-black">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-md font-black text-slate-900">{profile.name}</h3>
            <p className="text-xs text-slate-500 font-mono font-bold mt-0.5">{profile.phone}</p>
            <div className="mt-1 flex items-center space-x-1.5">
              {profile.idVerificationStatus === 'verified' ? (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[9px] font-black uppercase text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified KYC</span>
                </span>
              ) : profile.idVerificationStatus === 'pending' ? (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-[9px] font-black uppercase text-amber-700 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>KYC Pending Approval</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[9px] font-black uppercase text-slate-500">
                  <span>Unverified</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={onOpenWithdraw}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-md shadow-slate-950/5 flex items-center space-x-1"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Withdraw</span>
        </button>
      </div>

      {/* Referral Commissions & Network */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-3xs p-5 space-y-4">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4.5 h-4.5 text-amber-500 shrink-0" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A3D91]">
              Referral Commissions (Avenue Group)
            </h4>
          </div>
          <span className="text-[8px] font-black text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase">
            Double commissions enabled
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Total Referrals</span>
            <span className="text-lg font-black font-mono text-slate-900 block mt-1">{referrals.length} Partners</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Commissions Won</span>
            <span className="text-lg font-black font-mono text-emerald-700 block mt-1">+{(referrals.length * 150).toLocaleString()} ETB</span>
          </div>
        </div>

        {/* Action to share referral link */}
        <div className="space-y-2 pt-1 border-t border-slate-50">
          <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Your Invitation Credentials</label>
          <div className="flex space-x-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
              <span className="text-xs font-mono font-black text-[#00173D] tracking-widest">{profile.referralCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer active:scale-95 transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Clipboard className="w-4 h-4 shrink-0" />}
              </button>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 bg-[#0A3D91] hover:bg-blue-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 shadow-sm"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* KYC Upload ID Gate */}
      {profile.idVerificationStatus === 'unsubmitted' && (
        <form onSubmit={handleKycSubmit} className="bg-white p-5 rounded-3xl border-2 border-amber-300 shadow-md space-y-4">
          <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-100">
            <User className="w-4.5 h-4.5 text-amber-500 shrink-0" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A3D91]">
              {t.kycTitle}
            </h4>
          </div>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            {t.kycSub}
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-[10px] font-bold flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            {/* ID Number */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wide block">{t.idNumberLabel}</label>
              <input
                type="text"
                value={idNum}
                onChange={(e) => {
                  setIdNum(e.target.value.toUpperCase());
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black font-mono"
                placeholder="e.g. ID932185"
              />
            </div>

            {/* ID Photo */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wide block">{t.idPhotoLabel}</label>
              <label className="flex flex-col justify-center items-center w-full h-28 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:bg-slate-100 transition-all cursor-pointer relative overflow-hidden">
                {idPhoto ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                    <img src={idPhoto} alt="National ID card" className="max-h-full object-contain" />
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-950/80 border border-white/20 text-white text-[8px] font-black uppercase">Change Photo</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-3 pb-4">
                    <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Select Front ID Photo</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#0A3D91] hover:bg-blue-800 text-white font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {t.submitKycBtn}
          </button>
        </form>
      )}

      {/* Recent Transactions List */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">
          Recent Transaction Audit Ledger
        </h4>

        {transactions.length === 0 ? (
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            No Transactions Found
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-3xs overflow-hidden divide-y divide-slate-100">
            {transactions.slice(0, 8).map((tx) => {
              const isPositive = tx.type === 'deposit' || tx.type === 'earning' || tx.type === 'bonus';
              return (
                <div key={tx.id} className="p-4 flex justify-between items-center text-[11px] leading-normal">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isPositive 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 uppercase block">
                        {tx.type} {tx.referenceCode ? `(${tx.referenceCode})` : ''}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium font-mono block mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-black block ${isPositive ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {isPositive ? '+' : '-'}{tx.amount.toLocaleString()} ETB
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-wider block mt-0.5 ${
                      tx.status === 'approved' || tx.status === 'completed'
                        ? 'text-emerald-600'
                        : tx.status === 'pending'
                        ? 'text-amber-600 animate-pulse'
                        : 'text-rose-600'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
