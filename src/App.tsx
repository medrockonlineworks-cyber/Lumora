import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert } from 'lucide-react';
import { LanguageProvider, useLanguage } from './locale';
import HeaderBar from './components/HeaderBar';
import BottomNavBar from './components/BottomNavBar';
import HomeTab from './components/HomeTab';
import InvestmentsTab from './components/InvestmentsTab';
import EarningsTab from './components/EarningsTab';
import CustomerServiceTab from './components/CustomerServiceTab';
import ProfileTab from './components/ProfileTab';
import LoginScreen from './components/LoginScreen';
import AgreementsPage from './components/AgreementsPage';
import AboutUsPage from './components/AboutUsPage';
import TransactionsModals from './components/TransactionsModals';
import IdUploadGate from './components/IdUploadGate';
import WalkthroughModal from './components/WalkthroughModal';
import LumoraLogo from './components/LumoraLogo';
import AdminPanel from './components/AdminPanel';
import { Profile, Investment, MyTransaction, Notification, InvestmentPlan, Withdrawal, Loan, Deposit } from './types';

const offlineTranslations: Record<string, string> = {
  en: "Offline Mode — Showing last synced profile & portfolio",
  am: "ከመስመር ውጭ ሁኔታ — ለመጨረሻ ጊዜ የተመሳሰለ መገለጫ እና ፖርትፎሊዮ እያሳየ ነው",
  om: "Haala Sarara Alaa — Profila fi portfolio dhumarratti dhiyaate argisiisaa jira",
  ti: "ካብ መስመር ወጻኢ — ናይ መወዳእታ ግዘ ዝተሰማምዐ ፕሮፋይልን ፖርትፎሊዮን የርኢ ኣሎ",
  so: "Habka Khadka Ka Baxsan — Wuxuu muujinayaa profile-kii iyo portfolio-gii ugu dambeeyay"
};

function MainAppContent() {
  const { t, language } = useLanguage();
  
  // Splash screen state (shows for exactly 5 seconds when app starts)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // App state variables
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('lumora_user_id'));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restoringSession, setRestoringSession] = useState<boolean>(() => !!localStorage.getItem('lumora_user_id'));
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<MyTransaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Offline state indicator
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);

  // Rehydrate initial state from localStorage cache for instant offline or reload display
  useEffect(() => {
    if (userId) {
      try {
        const cachedDash = localStorage.getItem(`lumora_cached_dashboard_${userId}`);
        if (cachedDash) {
          const data = JSON.parse(cachedDash);
          if (data.profile) setProfile(data.profile);
          if (data.investments) setInvestments(data.investments);
          if (data.recentTransactions) setRecentTransactions(data.recentTransactions);
          if (data.notifications) setNotifications(data.notifications);
          if (data.isAdmin !== undefined) setIsAdmin(data.isAdmin);
          if (data.loans) setLoans(data.loans);
        }
        
        const cachedPlans = localStorage.getItem(`lumora_cached_plans`);
        if (cachedPlans) {
          setPlans(JSON.parse(cachedPlans));
        }

        const cachedWithdrawals = localStorage.getItem(`lumora_cached_withdrawals_${userId}`);
        if (cachedWithdrawals) {
          setWithdrawals(JSON.parse(cachedWithdrawals));
        }

        const cachedDeposits = localStorage.getItem(`lumora_cached_deposits_${userId}`);
        if (cachedDeposits) {
          setDeposits(JSON.parse(cachedDeposits));
        }
      } catch (err) {
        console.error("Failed to restore dashboard cache:", err);
      }
    }
  }, [userId]);

  // Handle active online/offline browser state changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchDashboardData();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  // Layout states
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [showAgreements, setShowAgreements] = useState<boolean>(false);
  const [showAboutUs, setShowAboutUs] = useState<boolean>(false);
  
  // Transaction gates popups
  const [transactionGate, setTransactionGate] = useState<'deposit' | 'withdrawal' | null>(null);

  // Walkthrough onboarding state
  const [showWalkthrough, setShowWalkthrough] = useState<boolean>(false);

  useEffect(() => {
    if (userId && profile && (profile.idVerificationStatus !== 'unsubmitted' || isAdmin)) {
      const completed = localStorage.getItem(`lumora_walkthrough_new_${userId}`);
      if (completed !== 'completed') {
        setShowWalkthrough(true);
      }
    } else {
      setShowWalkthrough(false);
    }
  }, [userId, profile, isAdmin]);

  // Fetch dashboard data
  useEffect(() => {
    if (userId) {
      fetchDashboardData();

      // Listen for local/remote database updates to synchronize client states immediately
      const handleUpdate = () => {
        fetchDashboardData();
      };
      window.addEventListener("lumoradb-updated", handleUpdate);

      // Setup periodic dashboard poll every 3 seconds for secondary real-time synchronization fallback
      const handle = setInterval(() => {
        fetchDashboardData();
      }, 3000);

      return () => {
        window.removeEventListener("lumoradb-updated", handleUpdate);
        clearInterval(handle);
      };
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    if (!userId) {
      setRestoringSession(false);
      return;
    }
    try {
      // 1. Fetch dashboard stats
      const resDash = await fetch(`/api/dashboard/${userId}`);
      if (resDash.ok) {
        setIsOffline(false);
        const data = await resDash.json();
        setProfile(data.profile);
        setInvestments(data.investments);
        setRecentTransactions(data.recentTransactions);
        setNotifications(data.notifications);
        setIsAdmin(data.isAdmin);
        setLoans(data.loans || []);

        // Cache successful dashboard payload
        localStorage.setItem(`lumora_cached_dashboard_${userId}`, JSON.stringify(data));
      } else {
        // ONLY log out if backend explicitly reports unauthorized session (e.g., status 401/403)
        // Otherwise, flag as offline and preserve current local state to prevent wiping user data!
        if (resDash.status === 401 || resDash.status === 403) {
          handleLogout();
        } else {
          setIsOffline(true);
        }
      }

      // 2. Fetch investment plans
      const resPlans = await fetch('/api/plans');
      if (resPlans.ok) {
        const data = await resPlans.json();
        setPlans(data);
        localStorage.setItem('lumora_cached_plans', JSON.stringify(data));
      }

      // 3. Fetch user withdrawal cashout history
      const resWithdrawals = await fetch(`/api/withdrawals/user/${userId}`);
      if (resWithdrawals.ok) {
        const data = await resWithdrawals.json();
        setWithdrawals(data);
        localStorage.setItem(`lumora_cached_withdrawals_${userId}`, JSON.stringify(data));
      }

      // 3b. Fetch user deposit history
      const resDeposits = await fetch(`/api/deposits/user/${userId}`);
      if (resDeposits.ok) {
        try {
          const data = await resDeposits.json();
          setDeposits(data);
          localStorage.setItem(`lumora_cached_deposits_${userId}`, JSON.stringify(data));
        } catch (e) {
          console.error("Error reading deposits:", e);
        }
      }

    } catch (err) {
      console.error("Error retrieving dashboard logs:", err);
      setIsOffline(true); // Treat fetch exceptions (e.g. DNS failure / offline) as offline rather than logging out
    } finally {
      setRestoringSession(false);
    }
  };

  const handleLoginSuccess = (cid: string, prof: Profile) => {
    localStorage.setItem('lumora_user_id', cid);
    setUserId(cid);
    setProfile(prof);
    setActiveTab('home');
    setShowAdmin(false);
  };

  const handleLogout = () => {
    if (userId) {
      localStorage.removeItem(`lumora_cached_dashboard_${userId}`);
      localStorage.removeItem(`lumora_cached_withdrawals_${userId}`);
      localStorage.removeItem(`lumora_cached_deposits_${userId}`);
    }
    localStorage.removeItem('lumora_user_id');
    setUserId(null);
    setProfile(null);
    setInvestments([]);
    setRecentTransactions([]);
    setNotifications([]);
    setWithdrawals([]);
    setDeposits([]);
    setIsAdmin(false);
    setActiveTab('home');
    setShowAdmin(false);
  };

  const handleBuyPlan = async (level: number, durationDays?: number) => {
    if (!userId) return { success: false, error: 'User session expired' };
    try {
      const res = await fetch('/api/investments/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vipLevel: level, durationDays })
      });
      const data = await res.json();
      if (res.ok) {
        fetchDashboardData();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Network failure' };
    }
  };

  const handleSetPin = async (pin: string) => {
    if (!userId) return { success: false, error: 'User session expired' };
    try {
      const res = await fetch('/api/profiles/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, transactionPin: pin })
      });
      if (res.ok) {
        fetchDashboardData();
        return { success: true };
      }
      return { success: false, error: 'Failed to configure security PIN' };
    } catch (err) {
      return { success: false, error: 'Network failure' };
    }
  };

  const handleUploadAvatar = async (base64: string) => {
    if (!userId) return { success: false, error: 'User session expired' };
    try {
      const res = await fetch('/api/profiles/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, avatarBase64: base64 })
      });
      if (res.ok) {
        fetchDashboardData();
        return { success: true };
      }
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'Failed to update avatar image' };
    } catch (err) {
      return { success: false, error: 'Network failure' };
    }
  };

  const handleSubmitLoan = async (amount: number, nationalId: string, tenureMonths: number) => {
    if (!userId) return { success: false, error: 'User session expired' };
    try {
      const res = await fetch('/api/loans/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, nationalId, tenureMonths })
      });
      const data = await res.json();
      if (res.ok) {
        fetchDashboardData();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to submit loan request' };
    } catch (err) {
      return { success: false, error: 'Network failure' };
    }
  };

  const handleNotificationsRead = async () => {
    if (!userId) return;
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      fetchDashboardData();
    } catch (err) { console.error(err); }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#020617] z-[99999] flex flex-col items-center justify-center">
        <LumoraLogo type="splash" size="full" className="!rounded-none !border-none !shadow-none !h-full !max-w-md" />
      </div>
    );
  }

  if (restoringSession) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#0A3D91] p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A3D91] mb-2"></div>
        <p className="text-xs font-mono font-black tracking-wide">Restoring LUMORA session...</p>
      </div>
    );
  }

  // Safe checks for un-authenticated views
  if (!userId || !profile) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Force registered user to submit both sides of the National ID before they can enter the application
  // ONLY if they have activated or are trying to use VIP levels (level >= 2)
  // if (profile.vipLevel >= 2 && profile.idVerificationStatus === 'unsubmitted' && !isAdmin) {
  //   return (
  //     <IdUploadGate 
  //       userId={userId}
  //       profile={profile}
  //       onUploadSuccess={fetchDashboardData}
  //       onLogout={handleLogout}
  //     />
  //   );
  // }

  // Calculate sum of active yielding capitals
  const activeYCapSum = investments
    .filter(i => i.status === 'active')
    .reduce((sum, curr) => sum + curr.amount, 0);

  // Sum of today's payout accruals
  const todayEarningsVal = investments
    .filter(i => i.status === 'active')
    .reduce((sum, curr) => sum + curr.dailyReturn, 0);

  // Dynamic calculation for overall combined earnings (investment yields + referral bonuses/rewards)
  const totalInvestmentEarningsVal = investments.reduce((sum, curr) => sum + (curr.totalEarned ?? 0), 0);
  const totalReferralRewardsVal = recentTransactions
    .filter(t => t.type === 'referral_reward' || t.type === 'bonus')
    .reduce((sum, curr) => sum + curr.amount, 0);

  // Combine the dynamic sources and ensure it doesn't drop below backend profile records
  const calculatedTotalEarnings = Math.max(
    profile?.totalEarnings ?? 0,
    totalInvestmentEarningsVal + totalReferralRewardsVal
  );

  const rawIncomeBalance = profile?.incomeBalance !== undefined ? profile.incomeBalance : 0;
  const rawDepositBalance = profile?.depositBalance !== undefined ? profile.depositBalance : (profile?.walletBalance ?? 0);

  let healedIncomeBalance = rawIncomeBalance;
  let healedDepositBalance = rawDepositBalance;

  if (calculatedTotalEarnings > 0) {
    const maxPossibleIncome = Math.max(0, Math.min(profile?.walletBalance ?? 0, calculatedTotalEarnings - (profile?.totalWithdrawals ?? 0)));
    if (healedIncomeBalance < maxPossibleIncome) {
      healedIncomeBalance = maxPossibleIncome;
      healedDepositBalance = Math.max(0, (profile?.walletBalance ?? 0) - healedIncomeBalance);
    }
  }

  const totalInPools = healedDepositBalance + healedIncomeBalance;
  if (profile && totalInPools !== profile.walletBalance) {
    healedDepositBalance = profile.walletBalance - healedIncomeBalance;
    if (healedDepositBalance < 0) {
      healedDepositBalance = 0;
      healedIncomeBalance = profile.walletBalance;
    }
  }

  const enrichedProfile = profile ? {
    ...profile,
    totalEarnings: calculatedTotalEarnings,
    incomeBalance: healedIncomeBalance,
    depositBalance: healedDepositBalance
  } : null;

  const isWide = (activeTab === 'assistant' || showAdmin) && !showAgreements && !showAboutUs;

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans select-none">
      
      {/* Visual Ambient Blur Accent glow lines */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0A3D91]/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

      {/* Header bar view */}
      <HeaderBar 
        profile={enrichedProfile}
        notifications={notifications}
        onNotificationsRead={handleNotificationsRead}
        isAdmin={isAdmin}
        showAdmin={showAdmin}
        onAdminClick={() => {
          setShowAdmin(!showAdmin);
          setShowAgreements(false);
          setShowAboutUs(false);
        }}
        isWide={isWide}
      />

      {/* Offline Status Warning Banner */}
      {isOffline && (
        <div className="bg-amber-550 border-b border-amber-600/10 text-white text-[10px] sm:text-xs py-2.5 px-4 flex items-center justify-center font-mono font-black tracking-widest uppercase space-x-2.5 shrink-0 shadow-xs" id="offline-status-banner">
          <span className="w-2 h-2 rounded-full bg-white shrink-0 animate-ping"></span>
          <span>{offlineTranslations[language] || offlineTranslations['en']}</span>
        </div>
      )}

      {/* Master Smartphone mock boundary and responsive container flow */}
      <main className={`flex-1 w-full mx-auto px-4.5 pt-5 pb-32 relative transition-all duration-300 ${isWide ? 'max-w-5xl' : 'max-w-md'}`}>
        <AnimatePresence mode="wait">
          {showAgreements ? (
            <motion.div
              key="agreements"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <AgreementsPage onBack={() => setShowAgreements(false)} />
            </motion.div>
          ) : showAboutUs ? (
            <motion.div
              key="about_us"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <AboutUsPage onBack={() => setShowAboutUs(false)} />
            </motion.div>
          ) : showAdmin ? (
            <motion.div
              key="admin_panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPanel onBack={() => setShowAdmin(false)} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'home' && (
                <HomeTab 
                  profile={enrichedProfile}
                  todayEarnings={todayEarningsVal}
                  activeInvestmentsValue={activeYCapSum}
                  recentTransactions={recentTransactions}
                  setActiveTab={setActiveTab}
                  onQuickDepositClick={() => setTransactionGate('deposit')}
                  onQuickWithdrawClick={() => setTransactionGate('withdrawal')}
                  onRefreshDashboard={fetchDashboardData}
                  investments={investments}
                />
              )}

              {activeTab === 'investments' && (
                <InvestmentsTab 
                  plans={plans}
                  profile={enrichedProfile}
                  onBuyPlan={handleBuyPlan}
                />
              )}

              {activeTab === 'earnings' && (
                <EarningsTab 
                  investments={investments}
                  profile={enrichedProfile!}
                  onRefreshDashboard={fetchDashboardData}
                />
              )}

              {activeTab === 'assistant' && (
                <CustomerServiceTab />
              )}

              {activeTab === 'profile' && (
                <ProfileTab 
                  profile={enrichedProfile}
                  todayEarnings={todayEarningsVal}
                  withdrawals={withdrawals}
                  deposits={deposits}
                  loans={loans}
                  onSubmitLoan={handleSubmitLoan}
                  onLogout={handleLogout}
                  onSetPin={handleSetPin}
                  onUploadAvatar={handleUploadAvatar}
                  onViewAgreements={() => setShowAgreements(true)}
                  onViewAboutUs={() => setShowAboutUs(true)}
                  onRefresh={fetchDashboardData}
                  onRelaunchWalkthrough={() => setShowWalkthrough(true)}
                  isAdmin={isAdmin}
                  showAdmin={showAdmin}
                  onAdminClick={() => {
                    setShowAdmin(!showAdmin);
                    setShowAgreements(false);
                    setShowAboutUs(false);
                  }}
                  investments={investments}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Fixed Navigator Menu */}
      <BottomNavBar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setShowAdmin={setShowAdmin}
        isWide={isWide}
      />

      {/* Dynamic Popups Gate overlay */}
      {transactionGate && enrichedProfile && (
        <TransactionsModals
          type={transactionGate}
          profile={enrichedProfile}
          investments={investments}
          onClose={() => setTransactionGate(null)}
          onRefreshDashboard={fetchDashboardData}
        />
      )}

      {/* Lightweight Walkthrough Modal Onboarding */}
      <AnimatePresence>
        {showWalkthrough && (
          <WalkthroughModal 
            userId={userId} 
            onClose={() => setShowWalkthrough(false)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainAppContent />
    </LanguageProvider>
  );
}
