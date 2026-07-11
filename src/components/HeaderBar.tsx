import { LogOut, Globe, Shield, Landmark } from 'lucide-react';
import { Language, translations } from '../locale';
import { UserProfile } from '../types';

interface HeaderBarProps {
  profile: UserProfile;
  language: Language;
  setLanguage: (lang: Language) => void;
  onLogout: () => void;
}

export default function HeaderBar({ profile, language, setLanguage, onLogout }: HeaderBarProps) {
  const t = translations[language];

  // Helper to resolve level name
  const getLevelName = (level: number) => {
    if (level === 0) return 'Starter L1';
    if (level === 1) return 'Starter L2';
    if (level === 2) return 'Starter L3';
    return `VIP ${level - 2}`;
  };

  return (
    <header className="sticky top-0 bg-[#0A3D91] text-white px-4 py-3 shadow-md z-30 flex items-center justify-between border-b border-blue-800">
      {/* Brand logo */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md animate-pulse-subtle">
          <span className="text-[#0A3D91] font-black text-sm">L</span>
        </div>
        <div>
          <span className="font-mono tracking-widest font-black text-xs text-amber-400 block -mb-0.5">LUMORA</span>
          <span className="text-[8px] text-slate-300 font-bold block uppercase tracking-wider">{t.appSlogan}</span>
        </div>
      </div>

      {/* Center security seal */}
      <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-700/50 text-[9px] font-black uppercase tracking-wider text-emerald-400">
        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>CBE SECURE GUARANTEE</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {/* VIP Level Badge */}
        <span className="px-2.5 py-1 text-[9px] font-black rounded-lg bg-amber-500 text-[#0a3d91] uppercase tracking-wider shadow-inner flex items-center space-x-1">
          <Landmark className="w-3 h-3 text-[#0a3d91] shrink-0" />
          <span>{getLevelName(profile.vipLevel)}</span>
        </span>

        {/* Language selector */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
          className="p-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 border border-blue-700 text-slate-200 transition-all cursor-pointer"
          title="Toggle Language"
        >
          <Globe className="w-4 h-4 text-amber-300" />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/40 border border-red-900 text-red-300 transition-all cursor-pointer"
          title={t.logout}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
