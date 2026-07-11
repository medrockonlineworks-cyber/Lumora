import { Home, TrendingUp, DollarSign, CreditCard, User, MessageSquareCode, ShieldCheck } from 'lucide-react';
import { Language, translations } from '../locale';

interface BottomNavBarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  isAdmin: boolean;
}

export default function BottomNavBar({ currentTab, setCurrentTab, language, isAdmin }: BottomNavBarProps) {
  const t = translations[language];

  const navItems = [
    { id: 'home', label: t.homeTab, icon: Home },
    { id: 'invest', label: t.investmentsTab, icon: TrendingUp },
    { id: 'earnings', label: t.earningsTab, icon: DollarSign },
    { id: 'card', label: t.cardTab, icon: CreditCard },
    { id: 'profile', label: t.profileTab, icon: User },
    { id: 'assistant', label: t.customerServiceTab, icon: MessageSquareCode },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: language === 'am' ? 'አድሚን' : 'Admin', icon: ShieldCheck });
  }

  return (
    <nav className="sticky bottom-0 bg-white border-t border-slate-200 px-2 py-1.5 shadow-2xl z-30 flex justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[55px] ${
              isActive
                ? 'bg-[#0A3D91]/10 text-[#0A3D91] scale-105 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            <span className="text-[9px] mt-1 font-bold uppercase tracking-wider text-center block">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
