import React, { useState } from 'react';
import { Shield, Sparkles, Smartphone, User, Landmark, Globe } from 'lucide-react';
import { Language, translations } from '../locale';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function LoginScreen({ onLogin, language, setLanguage }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError(language === 'am' ? 'እባክዎን ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid phone number');
      return;
    }
    if (isRegistering && !name) {
      setError(language === 'am' ? 'እባክዎን ሙሉ ስምዎን ያስገቡ' : 'Please enter your full name');
      return;
    }

    // Simulate login/registration
    const mockProfile: UserProfile = {
      phone,
      name: isRegistering ? name : 'Loykun Jemaneh',
      vipLevel: 0, // Starts at Starter Level 1
      walletBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEarned: 0,
      idVerificationStatus: 'unsubmitted',
      registrationDate: new Date().toISOString(),
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      referredBy: referralCode || undefined,
    };

    onLogin(mockProfile);
  };

  return (
    <div className="min-h-screen bg-[#00173D] text-white flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Abstract light orbs for premium branding */}
      <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-emerald-600/5 blur-[100px] pointer-events-none"></div>

      {/* Header with Language selector */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md">
            <span className="text-[#00173D] font-black text-sm">L</span>
          </div>
          <span className="font-mono tracking-widest font-black text-sm text-amber-400">LUMORA</span>
        </div>
        
        <button
          onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-black tracking-wider transition-all border border-white/20 active:scale-95 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'en' ? 'አማርኛ' : 'English'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-12 z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-3xl bg-amber-500/10 border border-amber-400/20 text-amber-400 mb-2 animate-pulse-subtle">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            {t.loginTitle}
          </h1>
          <p className="text-xs text-slate-400 font-medium px-4">
            {t.loginSub}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold text-center">
              ⚠ {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black tracking-wider uppercase text-slate-400 flex items-center space-x-1">
                <Smartphone className="w-3 h-3 text-amber-400" />
                <span>CBE-Registered Phone Number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                placeholder={t.phonePlaceholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-all font-mono"
              />
            </div>

            {/* Name Input (Register Only) */}
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-wider uppercase text-slate-400 flex items-center space-x-1">
                  <User className="w-3 h-3 text-amber-400" />
                  <span>Full Name (as on National ID)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder={t.namePlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-all"
                />
              </div>
            )}

            {/* Referral Code (Register Only, Optional) */}
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-wider uppercase text-slate-400 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Referral Code (Optional)</span>
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AB12CD"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-all font-mono"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#00173D] font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Landmark className="w-4 h-4" />
            <span>{isRegistering ? t.registerBtn : t.loginBtn}</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold tracking-wider cursor-pointer transition-all"
            >
              {isRegistering
                ? (language === 'am' ? 'አስቀድመው አካውንት አላቸው? ይግቡ' : 'Already have an account? Login')
                : (language === 'am' ? 'አዲስ ተጠቃሚ ነዎት? አሁኑኑ ይመዝገቡ' : 'New here? Register a safe account')}
            </button>
          </div>
        </form>
      </div>

      {/* Footer CBE Partnerships indicator */}
      <div className="z-10 text-center pb-2 max-w-md mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wider uppercase">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
          <span>Sovereign Security Guarantee - CBE Partner</span>
        </div>
        <p className="text-[9px] text-slate-500 font-bold tracking-wide uppercase">
          LUMORA is fully synced with Commercial Bank of Ethiopia (CBE) transaction ledgers.
        </p>
      </div>
    </div>
  );
}
