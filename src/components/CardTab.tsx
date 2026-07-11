import React, { useState } from 'react';
import { 
  CreditCard, Landmark, ShieldCheck, 
  UploadCloud, AlertCircle, Copy, Check 
} from 'lucide-react';
import { Language, translations } from '../locale';

interface CardTabProps {
  language: Language;
  onSubmitProof: (amount: number, refCode: string, receiptPhoto: string) => void;
}

export default function CardTab({ language, onSubmitProof }: CardTabProps) {
  const t = translations[language];

  const [depositAmount, setDepositAmount] = useState('1000');
  const [cbeRef, setCbeRef] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Enforce 1,000 ETB deposit limit
  const MIN_DEPOSIT_LIMIT = 1000;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('1000419524747');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPhoto(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const amountNum = Number(depositAmount);
    if (!depositAmount || amountNum < MIN_DEPOSIT_LIMIT) {
      setError(
        language === 'am' 
          ? `ቢያንስ ${MIN_DEPOSIT_LIMIT} ETB ማስገባት አለብዎት` 
          : `Minimum deposit amount is ${MIN_DEPOSIT_LIMIT.toLocaleString()} ETB.`
      );
      return;
    }

    if (!cbeRef || cbeRef.trim().length < 6) {
      setError(
        language === 'am'
          ? 'እባክዎን ትክክለኛ የንግድ ባንክ ማስተላለፊያ ቁጥር (Reference Code) ያስገቡ'
          : 'Please enter a valid CBE transaction reference code (minimum 6 characters).'
      );
      return;
    }

    if (!receiptPhoto) {
      setError(
        language === 'am'
          ? 'እባክዎን የደረሰኝ ፎቶ (Screenshot) ይጫኑ'
          : 'Please upload a screenshot of your CBE transfer receipt confirmation.'
      );
      return;
    }

    onSubmitProof(amountNum, cbeRef, receiptPhoto);
    setSuccessMsg(t.depositSuccess);
    setCbeRef('');
    setReceiptPhoto('');
    setDepositAmount('1000');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8 animate-in fade-in duration-300">
      {/* Official CBE details cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-3xs p-5 space-y-4">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-[#0A3D91] shrink-0" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0A3D91]">
              {t.officialCbeDetails}
            </h3>
          </div>
          <span className="text-[8px] font-black bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Verified Liquid Vault
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">CBE Account Holder</span>
            <span className="font-extrabold text-[#00173D]">{t.cbeAccountHolder}</span>
          </div>

          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">CBE Account Number</span>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              <span className="font-mono font-black text-[#00173D] tracking-wider text-sm">1000419524747</span>
              <button
                onClick={handleCopyAccount}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer active:scale-95"
                title="Copy Account Number"
              >
                {copiedAccount ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guide steps */}
      <div className="bg-[#00173D] text-white p-5 rounded-3xl border border-blue-900 shadow-lg space-y-3.5 leading-relaxed text-xs">
        <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center space-x-1 border-b border-blue-900 pb-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{t.depositTitle}</span>
        </h4>
        <div className="space-y-3 font-medium text-slate-300 text-[10.5px]">
          <p>{t.depositStep1}</p>
          <p>{t.depositStep2}</p>
          <p>{t.depositStep3}</p>
        </div>
      </div>

      {/* Upload proof Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-3xs space-y-5">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A3D91] border-b border-slate-100 pb-2.5">
          Submit CBE Clearing Receipt
        </h4>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs font-bold flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 animate-bounce" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
              {t.amountToDeposit}
            </label>
            <div className="relative">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => {
                  setDepositAmount(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm font-bold font-mono text-[#00173D]"
                placeholder="e.g. 1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-black text-slate-400">
                ETB
              </span>
            </div>
          </div>

          {/* CBE reference code */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
              {t.cbeRefCode}
            </label>
            <input
              type="text"
              value={cbeRef}
              onChange={(e) => {
                setCbeRef(e.target.value.toUpperCase());
                setError('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black font-mono text-[#00173D] tracking-wider uppercase"
              placeholder="e.g. FT268C3... or Reference Code"
            />
          </div>

          {/* Screenshot receipt image selector */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
              {t.uploadReceipt}
            </label>
            <div className="flex justify-center items-center w-full">
              <label className="flex flex-col justify-center items-center w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 hover:bg-slate-100 transition-all cursor-pointer relative overflow-hidden">
                {receiptPhoto ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                    <img 
                      src={receiptPhoto} 
                      alt="CBE Receipt Proof" 
                      className="max-h-full object-contain"
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-[#00173D]/80 border border-white/20 text-white text-[9px] font-black uppercase tracking-wider">
                      Change Screenshot
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2 animate-pulse-subtle" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Select transfer screenshot
                    </p>
                    <p className="text-[8px] text-slate-400 mt-0.5">PNG, JPG formats accepted</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        </div>

        {/* Submit action */}
        <button
          type="submit"
          className="w-full py-3.5 bg-[#0A3D91] hover:bg-blue-800 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4 shrink-0 text-amber-300" />
          <span>{t.submitProofBtn}</span>
        </button>
      </form>
    </div>
  );
}
