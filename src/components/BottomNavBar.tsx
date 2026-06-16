import { Home, Rocket, Coins, CreditCard, User } from 'lucide-react';
import { useLanguage } from '../locale';
import { motion } from 'motion/react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setShowAdmin: (show: boolean) => void;
  isWide?: boolean;
}

export default function BottomNavBar({ activeTab, setActiveTab, isAdmin, setShowAdmin, isWide }: BottomNavBarProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'home', label: t.navHome || 'Home', icon: Home },
    { id: 'investments', label: t.navInvestments || 'Invest', icon: Rocket },
    { id: 'earnings', label: t.navEarnings || 'Yield', icon: Coins },
    { id: 'card', label: t.navCard || 'Card', icon: CreditCard },
    { id: 'profile', label: t.navProfile || 'Profile', icon: User },
  ];

  return (
    <nav className={`fixed bottom-3 left-4 right-4 z-40 bg-white/95 border border-slate-200/80 backdrop-blur-md py-1 px-2.5 rounded-2xl shadow-[0_8px_30px_rgba(10,61,145,0.08)] mx-auto text-slate-600 transition-all duration-300 ${isWide ? 'max-w-5xl' : 'max-w-md'}`}>
      <div className="flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowAdmin(false); // return to normal views
              }}
              className="flex flex-col items-center justify-center flex-1 py-1.5 relative transition-all duration-150 cursor-pointer select-none"
            >
              {/* Tap Indicator background glow */}
              <div 
                className={`p-1.5 px-3 rounded-xl transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-[#0A3D91] text-white shadow-sm shadow-[#0A3D91]/20 scale-105' 
                    : 'text-slate-400 hover:text-slate-600 active:scale-95'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {isActive && (
                  <motion.span 
                    layoutId="activeTabBadge"
                    className="absolute inset-0 rounded-xl bg-[#0A3D91]/10 -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[8px] font-bold tracking-wider mt-1 uppercase ${isActive ? 'text-[#0A3D91] font-black' : 'text-slate-405'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
