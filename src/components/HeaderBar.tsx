import { useState } from 'react';
import { Bell, Globe, ShieldAlert, Check, Sparkles, AlertCircle, Gift, Info } from 'lucide-react';
import { useLanguage, languages, LanguageCode } from '../locale';
import { Notification, Profile } from '../types';
import LumoraLogo from './LumoraLogo';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderBarProps {
  profile: Profile | null;
  notifications: Notification[];
  onNotificationsRead: () => void;
  isAdmin: boolean;
  onAdminClick: () => void;
  showAdmin: boolean;
  isWide?: boolean;
}

export default function HeaderBar({ 
  profile, 
  notifications, 
  onNotificationsRead, 
  isAdmin, 
  onAdminClick,
  showAdmin,
  isWide
}: HeaderBarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageList, setShowLanguageList] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'important' | 'promotions' | 'system'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationCategory = (notif: Notification): 'important' | 'promotions' | 'system' => {
    if ((notif as any).category) {
      return (notif as any).category as any;
    }
    const title = notif.title.toLowerCase();
    const text = notif.message.toLowerCase();

    // Promotions category keywords
    if (
      title.includes('referral') || text.includes('referral') ||
      title.includes('bonus') || text.includes('bonus') ||
      title.includes('reward') || text.includes('reward') ||
      title.includes('vip') || text.includes('vip') ||
      title.includes('promotion') || text.includes('promotion') ||
      title.includes('invite') || text.includes('invite') ||
      title.includes('commission') || text.includes('commission')
    ) {
      return 'promotions';
    }

    // Important category keywords
    if (
      title.includes('approve') || text.includes('approve') ||
      title.includes('deposit') || text.includes('deposit') ||
      title.includes('withdraw') || text.includes('withdraw') ||
      title.includes('reject') || text.includes('reject') ||
      title.includes('alert') || text.includes('alert') ||
      title.includes('warn') || text.includes('warn') ||
      title.includes('id card') || text.includes('id card') ||
      title.includes('verify') || text.includes('verify') ||
      title.includes('pin') || text.includes('pin') ||
      title.includes('lock') || text.includes('lock') ||
      title.includes('suspend') || text.includes('suspend') ||
      title.includes('success') || text.includes('success')
    ) {
      return 'important';
    }

    return 'system';
  };

  const getCatCount = (catId: 'all' | 'important' | 'promotions' | 'system') => {
    if (catId === 'all') return notifications.length;
    return notifications.filter(n => getNotificationCategory(n) === catId).length;
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'all') return true;
    return getNotificationCategory(n) === activeCategory;
  }).sort((a, b) => {
    // 1. Unread notifications first, read notifications second
    if (!a.read && b.read) return -1;
    if (a.read && !b.read) return 1;
    
    // 2. Newest date first within groups
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleLangSelect = (code: LanguageCode) => {
    setLanguage(code);
    setShowLanguageList(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-2.5 px-4 shadow-[0_2px_15px_rgba(10,61,145,0.03)] transition-all">
      <div className={`mx-auto flex items-center justify-between relative transition-all duration-300 ${isWide ? 'max-w-5xl' : 'max-w-md'}`}>
        
        {/* Brand / Logo Title */}
        <div className="flex items-center space-x-2">
          <LumoraLogo size="xs" showText={true} theme="light" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Lang Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLanguageList(!showLanguageList);
                setShowNotificationList(false);
              }}
              className={`p-2 rounded-xl transition-all duration-200 relative cursor-pointer ${
                showLanguageList
                  ? 'bg-[#0A3D91]/10 text-[#0A3D91] border border-[#0A3D91]/20'
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
              }`}
              aria-label="Language selector"
            >
              <Globe className="w-4 h-4 text-slate-650" />
            </button>

            <AnimatePresence>
              {showLanguageList && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 overflow-hidden"
                >
                  <p className="text-[9px] font-extrabold text-slate-400 px-2.5 py-1 uppercase tracking-widest border-b border-slate-100 mb-1">
                    Select Language
                  </p>
                  <div className="space-y-0.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangSelect(lang.code)}
                        className={`w-full flex items-center justify-between text-left px-2.5 py-2 text-[11px] rounded-xl transition-all cursor-pointer ${
                          language === lang.code 
                            ? 'bg-[#0A3D91]/10 text-[#0A3D91] font-bold' 
                            : 'text-slate-605 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="font-medium">{lang.name}</span>
                        {language === lang.code && <Check className="w-3.5 h-3.5 text-[#0A3D91] stroke-[2.5]" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationList(!showNotificationList);
                setShowLanguageList(false);
              }}
              className={`p-2 rounded-xl transition-all duration-200 relative cursor-pointer ${
                showNotificationList
                  ? 'bg-[#0A3D91]/10 text-[#0A3D91] border border-[#0A3D91]/20'
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-650" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-600 text-white font-sans text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User profile avatar / dynamic greeting block */}
          <div className="flex items-center space-x-2">
            <div className="hidden xs:flex flex-col text-right">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">VIP Investor</span>
              <span className="text-[10.5px] font-black text-[#0A3D91] leading-normal font-sans mt-0.5 max-w-[80px] truncate">
                {profile?.fullName?.split(' ')[0] || "Client"}
              </span>
            </div>
            
            <div className="relative shrink-0">
               <div className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shadow-2xs hover:scale-105 transition-all">
                {profile?.profilePicture || profile?.idSelfie ? (
                  <img 
                    src={profile.profilePicture || profile.idSelfie} 
                    alt="Profile avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-display font-extrabold text-[11px] text-[#0A3D91] uppercase">
                    {profile?.fullName?.substring(0, 2) || "LU"}
                  </span>
                )}
              </div>
              {profile?.idVerificationStatus === 'verified' && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-3xs" title="Verified Account">
                  <Check className="w-2 h-2 text-white stroke-[4.5]" />
                </span>
              )}
            </div>
          </div>

        </div>

        {/* 
          Notification dropdown aligned to the outer flex container (max-w-md content box).
          This ensures perfect 16px gutter spacing on mobile devices and 100% responsiveness without any text cuts!
        */}
        <AnimatePresence>
          {showNotificationList && (
            <motion.div 
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-90 max-w-[370px] bg-white border border-slate-200/90 rounded-3xl shadow-[0_12px_40px_rgba(10,61,145,0.12)] z-55 p-3.5 overflow-hidden"
            >
              {(() => {
                const activeT = headerTranslations[language] || headerTranslations['en'];
                return (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                      <h3 className="font-display font-black text-[11px] text-[#0A3D91] uppercase tracking-wider">
                        {activeT.systemLogs}
                      </h3>
                      
                      {unreadCount > 0 ? (
                        <button
                          onClick={onNotificationsRead}
                          className="text-[8.5px] font-black text-[#0A3D91] hover:bg-[#0A3D91]/15 bg-[#0A3D91]/5 border border-[#0A3D91]/10 px-2.5 py-1 rounded-xl transition-all flex items-center space-x-1 cursor-pointer font-sans"
                        >
                          <Check className="w-3 h-3 text-[#0A3D91] stroke-[3]" />
                          <span>{activeT.markAllRead}</span>
                        </button>
                      ) : (
                        <span className="text-[8px] font-black text-slate-400 bg-slate-50 border border-slate-150/60 rounded-xl px-2 py-0.5 flex items-center space-x-1">
                          <Check className="w-2.5 h-2.5 text-slate-400 stroke-[3]" />
                          <span>{activeT.allRead}</span>
                        </span>
                      )}
                    </div>

                    {/* Segmented Category Tab Control */}
                    <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-2 scrollbar-none border-b border-slate-100">
                      {(['all', 'important', 'promotions', 'system'] as const).map((catId) => {
                        const count = getCatCount(catId);
                        const isActive = activeCategory === catId;
                        
                        const catLabels = {
                          all: activeT.catAll,
                          important: activeT.catImportant,
                          promotions: activeT.catPromos,
                          system: activeT.catSystem
                        };

                        const catColors = {
                          all: 'text-[#0A3D91] bg-blue-50 border-blue-105',
                          important: 'text-rose-600 bg-rose-50 border-rose-105',
                          promotions: 'text-amber-600 bg-amber-50 border-amber-105',
                          system: 'text-sky-600 bg-sky-50 border-sky-105'
                        };

                        return (
                          <button
                            key={catId}
                            onClick={() => setActiveCategory(catId)}
                            className={`px-2.5 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all duration-150 flex items-center space-x-1 shrink-0 cursor-pointer ${
                              isActive
                                ? `font-black border-transparent shadow-xs ${catColors[catId]}`
                                : 'text-slate-405 bg-slate-50 border-slate-200/60 hover:text-slate-605 hover:bg-slate-100'
                            }`}
                          >
                            <span>{catLabels[catId]}</span>
                            <span className={`text-[8px] px-1 rounded-md font-bold ${
                              isActive ? 'bg-white/50' : 'bg-slate-200/70 text-slate-505'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-10 text-slate-405 text-[10.5px] font-semibold uppercase tracking-wider">
                        {activeT.noNotifications}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-none divide-y divide-slate-100/40">
                        {filteredNotifications.map((notif) => {
                          const isUnread = !notif.read;
                          const cat = getNotificationCategory(notif);
                          const { title: transTitle, message: transMsg } = translateNotification(notif.title, notif.message, language);

                          // Icon and BG Selection based on Category type
                          let iconEl = <Info className="w-3.5 h-3.5" />;
                          let badgeBg = 'bg-sky-50 text-sky-600 border border-sky-100';

                          if (cat === 'important') {
                            iconEl = <AlertCircle className="w-3.5 h-3.5" />;
                            badgeBg = 'bg-rose-50 text-rose-600 border border-rose-100';
                          } else if (cat === 'promotions') {
                            iconEl = <Gift className="w-3.5 h-3.5" />;
                            badgeBg = 'bg-amber-50 text-amber-600 border border-amber-100';
                          }

                          return (
                            <div 
                              key={notif.id} 
                              className={`pt-2.5 first:pt-0 pb-1 px-1 transition-all flex items-start space-x-2.5 rounded-xl ${
                                isUnread ? 'bg-blue-50/20' : 'hover:bg-slate-50/50'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${badgeBg}`}>
                                {iconEl}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <p className={`text-[10px] font-extrabold leading-tight ${isUnread ? 'text-[#0A3D91] font-black' : 'text-slate-805'}`}>
                                    {transTitle}
                                  </p>
                                  <span className="text-[7.5px] text-slate-400 font-mono shrink-0 ml-1.5">
                                    {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-500 mt-1 leading-normal font-semibold">
                                  {transMsg}
                                </p>
                              </div>

                              {isUnread && (
                                <span className="w-1.5 h-1.5 bg-[#0A3D91] rounded-full shrink-0 mt-1.5 animate-pulse" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
}

// Translation dictionaries for the notification center UI
const headerTranslations: Record<LanguageCode, {
  markAllRead: string;
  allRead: string;
  noNotifications: string;
  catAll: string;
  catImportant: string;
  catPromos: string;
  catSystem: string;
  systemLogs: string;
}> = {
  en: {
    markAllRead: "Mark all read",
    allRead: "All read",
    noNotifications: "No notifications",
    catAll: "All",
    catImportant: "Important",
    catPromos: "Promos",
    catSystem: "System",
    systemLogs: "System Logs"
  },
  am: {
    markAllRead: "ሁሉንም አንብብ",
    allRead: "ሁሉም ተነቧል",
    noNotifications: "ምንም ማሳወቂያ የለም",
    catAll: "ሁሉም",
    catImportant: "አስፈላጊ",
    catPromos: "ማስተዋወቂያ",
    catSystem: "ስርዓት",
    systemLogs: "የስርዓት መልዕክቶች"
  },
  om: {
    markAllRead: "Hunda dubbifame taasisi",
    allRead: "Dhumateera",
    noNotifications: "Beeksisi hin jiru",
    catAll: "Hunda",
    catImportant: "Murteessoo",
    catPromos: "Beeksisa",
    catSystem: "Sirna",
    systemLogs: "Gabaasa Sirnaa"
  },
  ti: {
    markAllRead: "ኩሎም ከም እተነበቡ ግበር",
    allRead: "ኩሎም ተነቢቦም",
    noNotifications: "ምንም መፍለጢ የለን",
    catAll: "ኩሎም",
    catImportant: "አገዳሲ",
    catPromos: "መዋውሒ",
    catSystem: "ስርዓት",
    systemLogs: "ናይ ስርዓት መዝገብ"
  },
  so: {
    markAllRead: "U calamee dhammaan",
    allRead: "Dhamaan waa la akhriyey",
    noNotifications: "Ma jiraan ogeysiisyo",
    catAll: "Dhammaan",
    catImportant: "Muhiim",
    catPromos: "Xayeysiis",
    catSystem: "Nidaamka",
    systemLogs: "Diiwaanka Nidaamka"
  }
};

const translateNotification = (title: string, message: string, lang: LanguageCode) => {
  const titleLower = title.toLowerCase().trim();
  const msgLower = message.toLowerCase().trim();

  // Translations dictionary for titles
  const titleDict: Record<string, Record<LanguageCode, string>> = {
    'welcome to lumora!': {
      en: 'Welcome to LUMORA!',
      am: 'እንኳን ወደ LUMORA በሰላም መጡ!',
      om: 'Baga gara LUMORA nagaan dhuftan!',
      ti: 'እንቋዕ ናብ LUMORA ብሰላም መጻእኹም!',
      so: 'Ku soo dhowow LUMORA!'
    },
    'deposit request approved!': {
      en: 'Deposit Approved!',
      am: 'የማስቀመጫ ጥያቄዎ ጸድቋል!',
      om: 'Kaffaltiin Mirkanaa\'eera!',
      ti: 'ተቀማጭ ገንዘብ ጸዲቑ!',
      so: 'Dhigaalka Waa La Anba-qaaday!'
    },
    'deposit approved': {
      en: 'Deposit Approved',
      am: 'ተቀማጭ ገንዘብ ጸድቋል',
      om: 'Kaffaltiin Mirkanaa\'eera',
      ti: 'ተቀማጭ ገንዘብ ጸዲቑ',
      so: 'Dhigaalka Waa La Anba-qaaday'
    },
    'deposit rejected': {
      en: 'Deposit Rejected',
      am: 'ተቀማጭ ገንዘብ ውድቅ ተደርጓል',
      om: 'Kaffaltiin Kufaa Ta\'eera',
      ti: 'ተቀማጭ ገንዘብ ውድቅ ኰይኑ',
      so: 'Dhigaalka Waa La Diiday'
    },
    'withdrawal successful!': {
      en: 'Withdrawal Successful!',
      am: 'የገንዘብ ወጪ ተሳክቷል!',
      om: 'Baasii Milkaa\'eera!',
      ti: 'ገንዘብ ምውጻእ ተሳሊጡ!',
      so: 'Sariifka Waa La Anba-qaaday!'
    },
    'withdrawal approved': {
      en: 'Withdrawal Approved',
      am: 'የገንዘብ ወጪ ተፈቅዷል',
      om: 'Baasii Mirkanaa\'eera',
      ti: 'ገንዘብ ምውጻእ ጸዲቑ',
      so: 'Sariifka Waa La Anba-qaaday'
    },
    'withdrawal rejected': {
      en: 'Withdrawal Rejected',
      am: 'የገንዘብ ወጪ ውድቅ ተደርጓል',
      om: 'Baasii Kufaa Ta\'eera',
      ti: 'ገንዘብ ምውጻእ ውድቅ ኰይኑ',
      so: 'Sariifka Waa La Diiday'
    },
    'plan purchased successfully!': {
      en: 'Plan Active!',
      am: 'የቪአይፒ ዕቅድ ገዝተዋል!',
      om: 'Karoorri Inveestimentii Bitameera!',
      ti: 'መደብ ብዓወት ተዓዲጉ!',
      so: 'Qorshaha Waa Firfircoon!'
    },
    'daily return credited': {
      en: 'Daily Return Credited',
      am: 'ዕለታዊ ወለድ ገቢ ሆኗል',
      om: 'Galii Guyyaa Guyyaa Dabalameera',
      ti: 'ዕለታዊ ኣታዊ ተወሲኹ',
      so: 'Soo Celinta Maalin la kordhiyey'
    },
    'id verification submitted': {
      en: 'Verification Under Review',
      am: 'ማንነት ማረጋገጫ በግምገማ ላይ',
      om: 'Mirkaneessi Eenyummeessaa Hojirra Jira',
      ti: 'መረጋገጺ መንነት ኣብ ግምገማ እዩ',
      so: 'Xaqiijinta Aqoonsiga Waa La Gilaa'
    },
    'national id verified!': {
      en: 'ID Verification Approved!',
      am: 'የማንነት ማረጋገጫ ጸድቋል!',
      om: 'Mirkaneessi Eenyummeessaa Ragga\'eera!',
      ti: 'መረጋገጺ መንነት ጸዲቑ!',
      so: 'Xaqiijinta Aqoonsiga Waa La Anba-qaaday!'
    },
    'id verification approved': {
      en: 'ID Verification Approved',
      am: 'የማንነት ማረጋገጫ ተቀባይነት አግኝቷል',
      om: 'Mirkaneessi Eenyummeessaa Ragga\'eera',
      ti: 'መረጋገጺ መንነት ጸዲቑ',
      so: 'Xaqiijinta Aqoonsiga Waa La Anba-qaaday'
    },
    'national id rejected': {
      en: 'ID Verification Rejected',
      am: 'የማንነት ማረጋገጫ ውድቅ ተደርጓል',
      om: 'Mirkaneessi Eenyummeessaa Kufaa Ta\'eera',
      ti: 'መረጋገጺ መንነት ውድቅ ኰይኑ',
      so: 'Xaqiijinta Aqoonsiga Waa La Diiday'
    },
    'id verification rejected': {
      en: 'ID Verification Rejected',
      am: 'የማንነት ማረጋገጫ ውድቅ ተደርጓል',
      om: 'Mirkaneessi Eenyummeessaa Kufaa Ta\'eera',
      ti: 'መረጋገጺ መንነት ውድቅ ኰይኑ',
      so: 'Xaqiijinta Aqoonsiga Waa La Diiday'
    },
    'referral bonus on first investment!': {
      en: 'Referral Reward!',
      am: 'የሪፈራል ጉርሻ!',
      om: 'Badhaasa Referral!',
      ti: 'ናይ ሪፈራል መባእ!',
      so: 'Abaalmarinta Referral!'
    },
    'referral reward': {
      en: 'Referral Reward',
      am: 'የሪፈራል ጉርሻ',
      om: 'Badhaasa Referral',
      ti: 'ናይ ሪፈራል መባእ',
      so: 'Abaalmarinta Referral'
    },
    'referral reward!': {
      en: 'Referral Reward!',
      am: 'የሪፈራል ጉርሻ!',
      om: 'Badhaasa Referral!',
      ti: 'ናይ ሪፈራል መባእ!',
      so: 'Abaalmarinta Referral!'
    },
    'institutional loan approved!': {
      en: 'Institutional Loan Approved!',
      am: 'የድርጅት ብድር ጸድቋል!',
      om: 'Liqiin Mirkanaa\'eera!',
      ti: 'ልቃሕ ጸዲቑ!',
      so: 'Amaahda Waa La Anba-qaaday!'
    },
    'loan approved': {
      en: 'Loan Approved',
      am: 'ብድር ተፈቅዷል',
      om: 'Liqiin Mirkanaa\'eera',
      ti: 'ልቃሕ ጸዲቑ',
      so: 'Amaahda Waa La Anba-qaaday'
    },
    'loan request rejected': {
      en: 'Loan Request Rejected',
      am: 'የብድር ጥያቄ ውድቅ ተደርጓል',
      om: 'Gaaffiin Liqii Kufaa Ta\'eera',
      ti: 'ናይ ልቃሕ ሕቶ ውድቅ ኰይኑ',
      so: 'Codsiga Amaahda Waa La Diiday'
    },
    'investment plan deactivated': {
      en: 'Plan Matured',
      am: 'ዕቅዱ ጊዜው አልፏል',
      om: 'Karoorri Bilchaateera',
      ti: 'መደብ ጊዜኡ ኣብሪሁ',
      so: 'Qorshihii Waa Mature'
    }
  };

  let matchedTitle = title;
  for (const k of Object.keys(titleDict)) {
    if (titleLower.includes(k) || k.includes(titleLower)) {
      matchedTitle = titleDict[k][lang] || title;
      break;
    }
  }

  let translatedMessage = message;
  if (lang !== 'en') {
    // 1. Account Created
    if (msgLower.includes('congratulations! your account has been created') || msgLower.includes('you have successfully registered')) {
      const msgs: Record<LanguageCode, string> = {
        en: "Congratulations! Your account has been created. Connect with us via official CBE deposit to choose a VIP Investment plan.",
        am: "እንኳን ደስ አለዎት! መለያዎ በተሳካ ሁኔታ ተፈጥሯል። የVIP ኢንቨስትመንት ጥቅል ለመምረጥ በCBE ባንክ በኩል ተቀማጭ ያድርጉ።",
        om: "Bagayyuu gammaddan! Akaayintiin keessan uumameera. Toora maalgashii VIP filachuuf kaffaltii galii CBE raawwadhaa.",
        ti: "እንቋዕ ደስ በለኩም! አካውንትኩም ብዓወት ተፈጢሩ እዩ። ናይ VIP ኢንቨስትመንት ንምምራፅ ብንግዲ ባንኪ (CBE) ኣቢልኩም ተቀማጭ ግበሩ።",
        so: "Hambalyo! Koontadaada waa la sameeyay. Nagala xiriir dhigaalka rasmiga ah ee CBE si aad u doorato qorshaha Maalgashiga VIP."
      };
      translatedMessage = msgs[lang] || message;
    }
    // 2. ID Verification Submitted
    else if (msgLower.includes('your id verification is under review') || msgLower.includes('verification is under review')) {
      const msgs: Record<LanguageCode, string> = {
        en: "Your ID verification is under review. This usually takes up to 24 hours.",
        am: "የማንነት ማረጋገጫ ሰነዶችዎ በሂደት ላይ ናቸው። ይህ ብዙውን ጊዜ እስከ 24 ሰዓታት ይወስዳል።",
        om: "Mirkaneessi eenyummeessaa keessanii sakatta'ama jira. Kun yeroo baay'ee sa'aatii 24 fudhata.",
        ti: "መረጋገጺ መንነትኩም ኣብ ትሕቲ ገምጋም እዩ ዘሎ። እዚ መብዛሕትኡ ግዜ ክሳብ 24 ሰዓታት ይወስድ።",
        so: "Xaqiijinta aqoonsigaaga waa la eegayaa. Tani waxay badanaa qaadataa ilaa 24 saacodood."
      };
      translatedMessage = msgs[lang] || message;
    }
    // 3. Plan Purchased Successfully! (e.g., "You successfully activated VIP 1 with 1000 ETB. You will earn 50 ETB every 24 hours.")
    else if (msgLower.includes('successfully activated') && msgLower.includes('etb')) {
      const vipMatch = message.match(/VIP\s*\d+/i) || message.match(/VIP Level\s*\d+/i);
      const vipName = vipMatch ? vipMatch[0] : 'VIP';
      const numbers = message.replace(/,/g, '').match(/\d+/g) || [];
      const cost = numbers[0] || '';
      const yieldAmt = numbers[1] || '';
      
      const msgs: Record<LanguageCode, string> = {
        en: `You successfully activated ${vipName} with ${cost} ETB. You will earn ${yieldAmt} ETB every 24 hours.`,
        am: `የ ${vipName} የብልጽግና ዕቅድን በ ${cost} ብር በተሳካ ሁኔታ አግብተዋል። በየ24 ሰዓቱ ${yieldAmt} ብር ያገኛሉ።`,
        om: `Karoora ${vipName} hamma ${cost} ETB bitattanii jirtu. Sa'aatii 24 gidduutti ${yieldAmt} ETB ni argattu.`,
        ti: `ናይ ${vipName} መደብ ብ ${cost} ETB ብዓወት ኣንቂሕኩም ኣለኹም። ኣብ ነፍሲ ወከፍ 24 ሰዓታት ${yieldAmt} ETB ክትረኽቡ ኢኹም።`,
        so: `Waxaad si guul leh u hawlgelisay ${vipName} oo hamma ${cost} ETB ah. Waxaad heli doontaa ${yieldAmt} ETB 24 saac walba.`
      };
      translatedMessage = msgs[lang] || message;
    }
    // 4. Activating / Earning general plan triggers (e.g. "Congratulations! Your 10,000 ETB entry plan is now earning 1.4% daily interest.")
    else if (msgLower.includes('activated') || msgLower.includes('earning') || msgLower.includes('plan is now active')) {
      const numbers = message.match(/\d[\d,.]*/g) || [];
      const amt1 = numbers[0] || '10,000';
      const amt2 = numbers[1] || '1.4';
      const vipMatch = message.match(/VIP\s*\d+/i) || message.match(/VIP Level\s*\d+/i) || message.match(/entry plan/i);
      const vipName = vipMatch ? vipMatch[0] : 'VIP';
      
      const msgs: Record<LanguageCode, string> = {
        en: message,
        am: `የእርስዎ ኢንቨስትመንት ${vipName} በ ${amt1} ብር በተሳካ ሁኔታ ተጀምሯል። በየቀኑ ${amt2} ያገኛሉ።`,
        om: `Inveestimentiin keessan ${vipName} hamma ${amt1} ETB milkiidhaan eegaleera. Guyya guyyaan ${amt2} ni argattu.`,
        ti: `ናይ ${vipName} ኢንቨስትመንትኩም ብ ${amt1} ETB ብዓወት ተጀሚሩ ኣሎ። ኣብ ነፍሲ ወከፍ መዓልቲ ${amt2} ክትረኽቡ ኢኹም።`,
        so: `Maalgashigaaga ee ${vipName} oo hamma ${amt1} ETB ah waa uu bilowday. Maalin kasta waxaad heli doontaa ${amt2}.`
      };
      translatedMessage = msgs[lang] || message;
    }
    // 5. Referral Bonus on First Investment / Direct First Investment
    else if (msgLower.includes('direct first-investment bonus') || msgLower.includes('referral bonus') || msgLower.includes('referral commission')) {
      const numbers = message.replace(/,/g, '').match(/\d+/g) || [];
      const bonus = numbers[0] || '';
      const pct = numbers[1] || '10';
      
      const msgs: Record<LanguageCode, string> = {
        en: `You received a direct first-investment bonus of ${bonus} ETB (${pct}%).`,
        am: `ከጋበዙት አባል የቪአይፒ ዕቅድ ግዢ የ ${bonus} ብር (${pct}%) ቀጥተኛ የሪፈራል ጉርሻ ገቢ ተደርጎልዎታል።`,
        om: `Maalgashiga jalqabaa invitee keessan irraa badhaasa ${bonus} ETB (${pct}%) argattanii jirtu.`,
        ti: `ካብቲ ዝዓደምኩምዎ ሰብ ናይ ፈለማ ወፍሪ ${bonus} ETB (${pct}%) ናይ ሪፈራል ጉርሻ ረኺብኩም ኣለኹም ።`,
        so: `Waxaad heshay gunno toos ah oo dhan ${bonus} ETB (${pct}%) oo ka yimid qorshaha qofka aad casuuntay.`
      };
      translatedMessage = msgs[lang] || message;
    }
    // 6. Daily Return Credited
    else if (msgLower.includes('credited to your wallet from play') || msgLower.includes('was credited to your wallet')) {
      const numbers = message.replace(/,/g, '').match(/\d+/g) || [];
      const returnAmt = numbers[0] || '';
      const remainingDays = numbers[1] || '';
      const vipMatch = message.match(/VIP\s*\d+/i) || message.match(/VIP Level\s*\d+/i);
      const vipName = vipMatch ? vipMatch[0] : 'VIP';
      
      const msgs: Record<LanguageCode, string> = {
        en: `Congratulations! ${returnAmt} ETB was credited to your wallet from play ${vipName}. Remaining: ${remainingDays} days.`,
        am: `እንኳን ደስ አለዎት! ${returnAmt} ብር ከ ${vipName} ዕቅድ ወደ ኪስ ሂሳብዎ ገቢ ሆኗል። የቀሩት ቀናት፡ ${remainingDays} ቀናት።`,
        om: `Bagayyuu gammaddan! ${returnAmt} ETB herrega keessan toora ${vipName} irraa dabalameera. Guyyoota hafan: ${remainingDays}.`,
        ti: `እንቋዕ ደስ በለኩም! ${returnAmt} ETB ካብ ${vipName} መደብኩም ናብ ሒሳብኩም ተወሲኹ ኣሎ። ዝተረፉ መዓልታት: ${remainingDays}።`,
        so: `Hambalyo! ${returnAmt} ETB ayaa lagu shubay walletkaaga oo ka yimid ${vipName}. Maalmo u haray: ${remainingDays}.`
      };
      translatedMessage = msgs[lang] || message;
    }
    // 7. National ID Verified / ID Verification Approved
    else if (msgLower.includes('national id card has been successfully verified') || msgLower.includes('fully verified member') || msgLower.includes('id card has been approved')) {
      const msgs: Record<LanguageCode, string> = {
        en: "Your identity verification documents have been fully approved. Welcome verified investor!",
        am: "የማንነት ማረጋገጫ ሰነዶችዎ ሙሉ በሙሉ ጸድቀዋል። እንኳን ደስ አለዎት!",
        om: "Mirkaneessi eenyummeessaa keessanii guutumaan guutuutti ragga'eera. Bagga gammaddan!",
        ti: "መረጋገጺ መንነት ምንጻርኩም ብምሉእ ጸዲቑ ኣሎ። እንቋዕ ብደሓን መጻእኹም!",
        so: "Dukumentiyada xaqiijinta aqoonsigaaga waa la ansixiyay. Hambalyo!"
      };
      translatedMessage = msgs[lang] || message;
    }
    // 8. National ID Rejected
    else if (msgLower.includes('id verification has been rejected') || msgLower.includes('documents were rejected') || msgLower.includes('national id verification has been rejected')) {
      const msgs: Record<LanguageCode, string> = {
        en: "Your identity verification documents were rejected. Please capture high contrast clear photos.",
        am: "የማንነት ማረጋገጫ ሰነዶችዎ ውድቅ ተደርገዋል። እባክዎን ጥራት ያላቸው ፎቶዎችን ይስቀሉ።",
        om: "Mirkaneessi eenyummeessaa keessanii kufaa ta'eera. Maaloo suuraa ifa ta'e ergaa.",
        ti: "መረጋገጺ መንነት ሰነዳትኩም ውድቅ ኰይኑ። በጃኹም ንጹር ፎቶታት ሰንድኡ።",
        so: "Dukumentiyada xaqiijinta aqoonsigaaga waa la diiday. Fadlan sawiro cad soo geli."
      };
      translatedMessage = msgs[lang] || message;
    }
    // 11. Deposit Rejected
    else if (msgLower.includes('deposit') && msgLower.includes('rejected')) {
      const numbers = message.replace(/,/g, '').match(/\d+/g) || [];
      const amt = numbers[0] || '';
      const msgs: Record<LanguageCode, string> = {
        en: `Your deposit of ${amt} ETB was rejected. Please upload standard bank receipts.`,
        am: `የ ${amt} ETB ማስቀመጫ ጥያቄዎ ውድቅ ተደርጓል። እባክዎን ትክክለኛ የባንክ ደረሰኝ ያያይዙ።`,
        om: `Kaffaltiin galii keessan ${amt} ETB kufaa ta'eera. Maaloo ragaa srii ergaa.`,
        ti: `ናይ ${amt} ETB ተቀማጭ ጥያቄኹም ውድቅ ኰይኑ። በጃኹም ክታም ዘለዎ ደረሰኝ የእትዉ።`,
        so: `Dhigaalkaaga oo ahaa ${amt} ETB waa la rejected gareeyay. Fadlan risid sax ah soo geli.`
      };
      translatedMessage = msgs[lang] || message;
    }
    // 12. Withdrawal Successful
    else if (msgLower.includes('withdrawal') && (msgLower.includes('approved') || msgLower.includes('successful'))) {
      const numbers = message.replace(/,/g, '').match(/\d+/g) || [];
      const amt = numbers[0] || '';
      const msgs: Record<LanguageCode, string> = {
        en: `Your withdrawal request of ${amt} ETB has been approved.`,
        am: `የ ${amt} ETB የገንዘብ ወጪ ጥያቄዎ በተሳካ ሁኔታ ጸድቋል። ገንዘቡ በባንክ ተልኮልዎታል።`,
        om: `Gaaffiin baasii keessan ${amt} ETB mirkanaa'eera.`,
        ti: `ናይ ${amt} ETB ገንዘብ ወጻኢ ጥያቄኹም ጸዲቑ ኣሎ።`,
        so: `Codsigaaga la bixitinka ee ${amt} ETB waa la approved gareeyay.`
      };
      translatedMessage = msgs[lang] || message;
    }
    // 13. Withdrawal Rejected
    else if (msgLower.includes('withdrawal') && msgLower.includes('rejected')) {
      const numbers = message.replace(/,/g, '').match(/\d+/g) || [];
      const amt = numbers[0] || '';
      const msgs: Record<LanguageCode, string> = {
        en: `Your withdrawal request of ${amt} ETB was rejected.`,
        am: `የ ${amt} ETB የገንዘብ ወጪ ጥያቄዎ ውድቅ ተደርጓል። ወደ ኪስዎ ተመልሷል።`,
        om: `Gaaffiin baasii keessan ${amt} ETB kufaa ta'eera.`,
        ti: `ናይ ${amt} ETB ገንዘብ ወጻኢ ጥያቄኹም ውድቅ ኰይኑ ኣሎ።`,
        so: `Codsigaga la bixitinka ee ${amt} ETB waa la rejected gareeyay.`
      };
      translatedMessage = msgs[lang] || message;
    }
    // 14. Institutional Loan Approved!
    else if (msgLower.includes('loan request') && (msgLower.includes('approved') || msgLower.includes('credited'))) {
      const numbers = message.replace(/,/g, '').match(/\d+/g) || [];
      const amt = numbers[0] || '';
      const msgs: Record<LanguageCode, string> = {
        en: `Your loan request of ${amt} ETB was approved and credited.`,
        am: `የ ${amt} ETB የድርጅት ብድር ጥያቄዎ ጸድቆ ወደ ሒሳብዎ ገቢ ሆኗል።`,
        om: `Gaaffiin liqii keessan ${amt} ETB mirkanaa'ee dabalameera.`,
        ti: `ናይ ${amt} ETB ልቃሕ ሕቶኹም ጸዲቑ ናብ ሒሳብኩም ተወሲኹ ኣሎ።`,
        so: `Codsigaaga amaahda ee ${amt} ETB waa la ansixiyey.`
      };
      translatedMessage = msgs[lang] || message;
    }
    // 15. Loan Request Rejected
    else if (msgLower.includes('loan request') && msgLower.includes('rejected')) {
      const msgs: Record<LanguageCode, string> = {
        en: "Your loan request was rejected due to credit compliance review.",
        am: "የብድር ጥያቄዎ በብድር ተገዢነት ግምገማ ምክንያት ውድቅ ተደርጓል።",
        om: "Gaaffiin liqii keessan kufaa ta'eera.",
        ti: "ናይ ልቃሕ ሕቶኹም ውድቅ ኰይኑ ኣሎ።",
        so: "Codsigaaga amaahda dhowr sababood awgood waa la rejected gareeyay."
      };
      translatedMessage = msgs[lang] || message;
    }
    // 16. ID Verified
    else if (msgLower.includes('national id card has been successfully verified') || msgLower.includes('fully verified member') || msgLower.includes('id card has been approved') || msgLower.includes('national id verified')) {
      const msgs: Record<LanguageCode, string> = {
        en: "Your identity verification documents have been fully approved. Welcome verified investor!",
        am: "የማንነት ማረጋገጫ ሰነዶችዎ ሙሉ በሙሉ ጸድቀዋል። እንኳን ደስ አለዎት!",
        om: "Mirkaneessi eenyummeessaa keessanii guutumaan guutuutti ragga'eera. Bagga gammaddan!",
        ti: "መረጋገጺ መንነት ምንጻርኩም ብምሉእ ጸዲቑ ኣሎ። እንቋዕ ብደሓን መጻእኹም!",
        so: "Dukumentiyada xaqiijinta aqoonsigaaga waa la ansixiyay. Hambalyo!"
      };
      translatedMessage = msgs[lang] || message;
    }
    // 17. ID Rejected
    else if (msgLower.includes('id verification has been rejected') || msgLower.includes('documents were rejected') || msgLower.includes('national id verification has been rejected') || msgLower.includes('national id rejected')) {
      const msgs: Record<LanguageCode, string> = {
        en: "Your identity verification documents were rejected. Please capture high contrast clear photos.",
        am: "የማንነት ማረጋገጫ ሰነዶችዎ ውድቅ ተደርገዋል። እባክዎን ጥራት ያላቸው ፎቶዎችን ይስቀሉ።",
        om: "Mirkaneessi eenyummeessaa keessanii kufaa ta'eera. Maaloo suuraa ifa ta'e ergaa.",
        ti: "መረጋገጺ መንነት ሰነዳትኩም ውድቅ ኰይኑ። በጃኹም ንጹር ፎቶታት ሰንድኡ።",
        so: "Dukumentiyada xaqiijinta aqoonsigaaga waa la diiday. Fadlan sawiro cad soo geli."
      };
      translatedMessage = msgs[lang] || message;
    }
  }

  return { title: matchedTitle, message: translatedMessage };
};
