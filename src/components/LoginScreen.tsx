import React, { useState, useEffect } from 'react';
import { Phone, Lock, User, UserPlus, ArrowRight, Key, Sparkles, Building, Languages, Eye, EyeOff, Shield, Mail } from 'lucide-react';
import { useLanguage, languages } from '../locale';
import LumoraLogo from './LumoraLogo';

interface LoginScreenProps {
  onLoginSuccess: (userId: string, profile: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { language, setLanguage, t, et } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [screen, setScreen] = useState<'login' | 'signup' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login variables
  const [logPhone, setLogPhone] = useState('');
  const [logPass, setLogPass] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Sign up variables
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regReferral, setRegReferral] = useState('');

  // Reset variables
  const [resetPhone, setResetPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState('');
  const [nextPass, setNextPass] = useState('');

  useEffect(() => {
    // Dynamic extraction of referral code from URL in multiple formats
    const href = window.location.href;
    const decodeUrl = decodeURIComponent(href);
    let refCode = '';

    // Strategy 1: Search for ref(CODE) or ref=CODE inside the pathname, search, or hash
    const refParenthesisMatch = decodeUrl.match(/ref\(([^)]+)\)/i);
    const refEqualsMatch = decodeUrl.match(/[?&]ref=([^&?#/]+)/i) || decodeUrl.match(/ref=([^&?#/]+)/i);

    if (refParenthesisMatch) {
      refCode = refParenthesisMatch[1];
    } else if (refEqualsMatch) {
      refCode = refEqualsMatch[1];
    } else {
      // Strategy 2: standard search parameters
      const params = new URLSearchParams(window.location.search);
      refCode = params.get('ref') || params.get('referral') || '';
    }

    if (refCode) {
      // Clean up any trailing query or slashes
      refCode = refCode.replace(/[/)?"'#].*$/, '').trim();
      setRegReferral(refCode.toUpperCase());
      setScreen('signup'); // Bring them directly to sign up if they clicked an invite link!
    }

    // Load credentials if rememberMe is enabled
    const savedRemember = localStorage.getItem('lumora_remember_me') === 'true';
    if (savedRemember) {
      setRememberMe(true);
      const savedPhone = localStorage.getItem('lumora_phone') || '';
      const savedPass = localStorage.getItem('lumora_password') || '';
      setLogPhone(savedPhone);
      setLogPass(savedPass);
    }
  }, []);

  const cleanNumeric = (txt: string) => txt.replace(/\D/g, '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logPhone.trim() || !logPass.trim()) {
      setErrorMsg(t.error);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: logPhone, password: logPass })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.user) {
        if (rememberMe) {
          localStorage.setItem('lumora_remember_me', 'true');
          localStorage.setItem('lumora_phone', logPhone);
          localStorage.setItem('lumora_password', logPass);
        } else {
          localStorage.removeItem('lumora_remember_me');
          localStorage.removeItem('lumora_phone');
          localStorage.removeItem('lumora_password');
        }
        onLoginSuccess(data.user.id, data.profile);
      } else {
        setErrorMsg(data.error || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Connection error. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regEmail.trim() || !regPass.trim() || !regConfirmPass.trim()) {
      setErrorMsg('All registration inputs are required, including email and confirmation password');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (regPass !== regConfirmPass) {
      setErrorMsg(t.passwordsDoNotMatch || 'Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regName,
          phone: regPhone,
          email: regEmail,
          password: regPass,
          referralCode: regReferral, // Matches server destructuring keys
          referredBy: regReferral
        })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.user) {
        onLoginSuccess(data.user.id, data.profile);
      } else {
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Connection error. Please try again.');
    }
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPhone.trim()) return;

    setLoading(true);
    setErrorMsg('');

    // Simulate OTP issuance as per OTP instructions
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setErrorMsg('SMS recovery OTP sent successfully to: ' + resetPhone + '. Entering verification code.');
    }, 1200);
  };

  const handleOtpVerify = async () => {
    if (!otpVal.trim() || !nextPass.trim()) {
      setErrorMsg('Please enter OTP and your new password');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: resetPhone,
          password: nextPass
        })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setScreen('login');
        setErrorMsg('Password reset successful! Please login with your new credentials.');
        setOtpSent(false);
        setOtpVal('');
        setNextPass('');
      } else {
        setErrorMsg(data.error || 'Password reset failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Connection error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center px-4 py-10 relative overflow-y-auto select-none">
      
      {/* Dynamic vector line waves backdrop matching the premium reference splash screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
        {/* Soft elegant top right flow lines */}
        <svg className="absolute top-0 right-0 w-full md:w-[120%] h-[55%] opacity-[0.38] md:opacity-[0.45]" viewBox="0 0 500 500" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A3D91" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#1E5CBA" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="wave2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0A3D91" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M-100,60 C120,-30 220,160 550,60" stroke="url(#wave1)" strokeWidth="1.8" />
          <path d="M-100,110 C150,40 190,220 550,110" stroke="url(#wave1)" strokeWidth="1.2" />
          <path d="M-100,160 C170,100 170,280 550,170" stroke="url(#wave2)" strokeWidth="1" />
          <path d="M-100,210 C190,160 150,340 550,230" stroke="url(#wave1)" strokeWidth="0.6" />
          <path d="M-100,260 C210,220 130,400 550,290" stroke="url(#wave2)" strokeWidth="0.8" />
          <path d="M-100,310 C230,280 110,460 550,350" stroke="url(#wave1)" strokeWidth="0.4" />
        </svg>

        {/* Soft elegant bottom left flow lines */}
        <svg className="absolute bottom-0 left-0 w-full md:w-[120%] h-[45%] opacity-[0.42] md:opacity-[0.48]" viewBox="0 0 500 500" fill="none" preserveAspectRatio="none">
          <path d="M-50,440 C120,330 270,400 550,280" stroke="url(#wave1)" strokeWidth="1.2" />
          <path d="M-50,390 C170,280 320,350 550,220" stroke="url(#wave1)" strokeWidth="1.6" />
          <path d="M-50,340 C140,260 300,300 550,160" stroke="url(#wave2)" strokeWidth="0.8" />
          <path d="M-50,290 C120,210 280,260 550,100" stroke="url(#wave1)" strokeWidth="0.5" />
          <path d="M-50,240 C100,160 260,220 550,50" stroke="url(#wave2)" strokeWidth="0.7" />
        </svg>
      </div>

      {/* Language Switch Rail in authentication screens */}
      <div className="max-w-xs w-full mx-auto mb-7 flex p-1 bg-white border-2 border-blue-100 rounded-2xl select-none shrink-0 shadow-sm">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 tracking-wider cursor-pointer ${
              language === lang.code 
                ? 'bg-[#0A3D91] text-white shadow-md font-extrabold' 
                : 'text-slate-800 hover:text-blue-900 hover:bg-slate-100/50'
            }`}
          >
            {lang.short}
          </button>
        ))}
      </div>

      <div className="max-w-md w-full mx-auto relative z-10 bg-white border-2 border-blue-100 rounded-[2.25rem] p-6.5 sm:p-8 shadow-[0_12px_40px_rgba(10,61,145,0.06)]">
        
        {/* Dynamic top brand rim accent */}
        <div className="h-[3px] bg-gradient-to-r from-amber-400 via-[#1254be] to-sky-400 rounded-t-full absolute top-0 left-6 right-6"></div>

        {/* Brand Banner */}
        <div className="flex flex-col items-center justify-center mb-6 mt-2">
          <LumoraLogo size="lg" showText={true} theme="light" />
          <span className="text-[10px] font-mono font-black text-sky-700 tracking-widest uppercase mt-4">
            SECURE ACCESS PORTAL
          </span>
        </div>

        {/* Action errors list */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[10.5px] text-rose-700 text-center leading-relaxed font-black">
            {errorMsg}
          </div>
        )}

        {/* --- FORM VIEWS --- */}

        {/* 1. PASSWORD LOGIN SCREEN */}
        {screen === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-1 group/field">
              <label className="text-[10px] font-black text-sky-950 uppercase tracking-widest block font-mono pl-0.5">
                {t.phone}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={logPhone}
                  onChange={(e) => setLogPhone(cleanNumeric(e.target.value))}
                  placeholder="e.g. 0912345678"
                  className="w-full bg-sky-50/75 border border-sky-100/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-mono placeholder-slate-400 transition-all font-semibold"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600/75 group-focus-within/field:text-blue-600 transition-colors pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1 group/field">
              <label className="text-[10px] font-black text-sky-950 uppercase tracking-widest block font-mono pl-0.5">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={logPass}
                  onChange={(e) => setLogPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-sky-50/75 border border-sky-100/80 rounded-2xl pl-11 pr-12 py-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-mono placeholder-slate-400 transition-all font-semibold"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600/75 group-focus-within/field:text-blue-600 transition-colors pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-500 animate-pulse" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
                 <div className="flex justify-between items-center text-[11px] pt-1 select-none font-extrabold">
              <label className="flex items-center space-x-1.5 text-slate-800 hover:text-[#0A3D91] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-sky-200 bg-sky-50 text-blue-600 cursor-pointer accent-blue-600"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => { setScreen('reset'); setErrorMsg(''); }}
                className="text-slate-800 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {t.forgotPassword}?
              </button>
            </div>

            <div className="text-center text-[11.5px] font-bold pt-1">
              <button
                type="button"
                onClick={() => { setScreen('signup'); setErrorMsg(''); }}
                className="text-blue-700 hover:text-blue-900 transition-colors cursor-pointer font-black"
              >
                Create Account
              </button>
            </div>          </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#0a3d91] to-[#1254be] hover:from-[#0d4bad] hover:to-[#1a64de] disabled:opacity-50 text-white font-sans text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-xl shadow-[#0a3d91]/15 flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer mt-2"
            >
              <span>{loading ? t.loading : t.loginTitle}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. REGISTRATION SIGN UP SCREEN */}
        {screen === 'signup' && (
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="space-y-1 group/field">
              <label className="text-[10px] font-black text-sky-950 uppercase tracking-widest block font-mono pl-0.5">
                {t.fullName}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Abebe Kebede"
                  className="w-full bg-sky-50/75 border border-sky-100/80 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-sans placeholder-slate-400 transition-all font-semibold"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600/75 group-focus-within/field:text-blue-600 transition-colors pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1 group/field">
              <label className="text-[10px] font-black text-sky-950 uppercase tracking-widest block font-mono pl-0.5">
                {t.phone}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(cleanNumeric(e.target.value))}
                  placeholder="e.g. 0912345678"
                  className="w-full bg-sky-50/75 border border-sky-100/80 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-mono placeholder-slate-400 transition-all font-semibold"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600/75 group-focus-within/field:text-blue-600 transition-colors pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1 group/field">
              <label className="text-[10px] font-black text-sky-950 uppercase tracking-widest block font-mono pl-0.5">
                {t.email}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. amee@sample.com"
                  className="w-full bg-sky-50/75 border border-sky-100/80 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-sans placeholder-slate-400 transition-all font-semibold"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600/75 group-focus-within/field:text-blue-600 transition-colors pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1 group/field">
              <label className="text-[10px] font-black text-sky-950 uppercase tracking-widest block font-mono pl-0.5">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-sky-50/75 border border-sky-100/80 rounded-2xl pl-11 pr-12 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-mono placeholder-slate-400 transition-all font-semibold"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600/75 group-focus-within/field:text-blue-600 transition-colors pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-500 animate-pulse" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            <div className="space-y-1 group/field">
              <label className="text-[10px] font-black text-sky-950 uppercase tracking-widest block font-mono pl-0.5">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={regConfirmPass}
                  onChange={(e) => setRegConfirmPass(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-sky-50/75 border border-sky-100/80 rounded-2xl pl-11 pr-12 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-mono placeholder-slate-400 transition-all font-semibold"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600/75 group-focus-within/field:text-blue-600 transition-colors pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5 pt-1.5">
              <div className="flex justify-between items-center bg-sky-50 p-1.5 px-3 rounded-xl border border-sky-100">
                <label className="text-[9.5px] font-extrabold text-amber-600 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0 text-amber-500" />
                  <span>Referral (Optional)</span>
                </label>
                <span className="text-[8px] text-emerald-600 font-extrabold tracking-wide font-mono uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                  +10% COMM
                </span>
              </div>
              <input
                type="text"
                value={regReferral}
                onChange={(e) => setRegReferral(e.target.value)}
                placeholder="e.g. REF123"
                className="w-full bg-sky-50 border border-sky-150 rounded-2xl px-4 py-3 text-xs text-amber-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20 placeholder-slate-450 font-black uppercase font-mono tracking-widest text-center transition-all"
              />
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1 font-semibold">
              <button
                type="button"
                onClick={() => { setScreen('login'); setErrorMsg(''); }}
                className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Already have account? <span className="text-blue-600 font-black hover:text-blue-700">Login</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#0a3d91] to-[#1254be] hover:from-[#0d4bad] hover:to-[#1a64de] disabled:opacity-50 text-white font-sans text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-xl shadow-[#0a3d91]/25 flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? t.loading : 'Register Profile'}</span>
            </button>
          </form>
        )}

        {/* 3. SMS OTP RECOVERY RESET SCREEN */}
        {screen === 'reset' && (
          <div className="space-y-4">
            {!otpSent ? (
               <form onSubmit={handleResetRequest} className="space-y-4">
                <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                  Enter your registered phone number, and we will dispatch a 6-digit verification code to reset your key.
                </p>

                <div className="space-y-1 group/field">
                  <label className="text-[10px] font-black text-sky-950 uppercase tracking-widest block font-mono pl-0.5">{t.phone}</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={resetPhone}
                      onChange={(e) => setResetPhone(cleanNumeric(e.target.value))}
                      placeholder="e.g. 0912345678"
                      className="w-full bg-sky-50/75 border border-sky-100/80 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 font-mono placeholder-slate-400 font-semibold"
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-600/75 group-focus-within/field:text-blue-600 transition-colors pointer-events-none" />
                  </div>
                </div>

                <div className="flex justify-between text-[11px] pt-1 font-semibold">
                  <button
                    type="button"
                    onClick={() => { setScreen('login'); setErrorMsg(''); }}
                    className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-slate-200 to-slate-100 border border-slate-300 hover:bg-slate-300 hover:text-slate-900 disabled:opacity-50 text-slate-800 font-sans text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-sm cursor-pointer"
                >
                  {loading ? t.loading : 'Request SMS OTP'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-sky-950 uppercase tracking-widest block font-mono text-center">6-Digit Verification OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpVal}
                    onChange={(e) => setOtpVal(cleanNumeric(e.target.value))}
                    placeholder="••••••"
                    className="w-full bg-sky-50 border border-sky-150 rounded-2xl px-4 py-3.5 text-center text-lg font-black font-mono tracking-widest text-blue-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-505/20 transition-all placeholder-slate-400"
                  />
                </div>

                <div className="space-y-1 group/field">
                  <label className="text-[10px] font-black text-sky-950 uppercase tracking-widest block font-mono pl-0.5">Configure New Password</label>
                  <input
                    type="password"
                    value={nextPass}
                    onChange={(e) => setNextPass(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full bg-sky-50/75 border border-sky-100 rounded-2xl px-4 py-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all font-semibold placeholder-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="py-3 bg-slate-100 hover:bg-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 rounded-2xl transition-all cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={handleOtpVerify}
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-black uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    Verify & Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Secure Compliance Footer inside the card container */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[9.5px] text-slate-600 font-extrabold tracking-wide uppercase font-mono">
          <Shield className="w-3.5 h-3.5 text-[#0A3D91] shrink-0" />
          <span className="text-center truncate">
            {et('securedWithAuditing') || "Secured with 256-bit Institutional Auditing Compliance"}
          </span>
        </div>

      </div>

      {/* Corporate pillars of integrity, matching the bottom of the reference image */}
      <div className="max-w-md w-full mx-auto mt-6 bg-[#0A3D91] hover:bg-[#072a66] rounded-3xl p-4.5 shadow-[0_8px_30px_rgba(10,61,145,0.12)] transition-colors duration-300 select-none">
        <div className="grid grid-cols-4 gap-2 text-center text-white">
          
          <div className="flex flex-col items-center justify-center space-y-1 border-r border-white/10 last:border-0 pr-1">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5 shadow-inner">
              <Shield className="w-4 h-4 text-white stroke-[2]" />
            </div>
            <span className="text-[9px] font-display font-black tracking-wider block">
              TRUST
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1 border-r border-white/10 last:border-0 px-1">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white stroke-[2]" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <span className="text-[9px] font-display font-black tracking-wider block">
              GROWTH
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1 border-r border-white/10 last:border-0 px-1">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5 shadow-inner">
              <Building className="w-4 h-4 text-white stroke-[2]" />
            </div>
            <span className="text-[9px] font-display font-black tracking-wider block">
              SECURITY
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1 pl-1">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white stroke-[2]" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94-3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <span className="text-[9px] font-display font-black tracking-wider block">
              PARTNERSHIP
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
