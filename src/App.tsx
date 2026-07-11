import React, { useState, useEffect } from 'react';
import { Language, translations } from './locale';
import { UserProfile, InvestmentPlan, Investment, Transaction, Referral } from './types';
import LoginScreen from './components/LoginScreen';
import HeaderBar from './components/HeaderBar';
import BottomNavBar from './components/BottomNavBar';
import HomeTab from './components/HomeTab';
import InvestmentsTab from './components/InvestmentsTab';
import EarningsTab from './components/EarningsTab';
import CardTab from './components/CardTab';
import ProfileTab from './components/ProfileTab';
import CustomerServiceTab from './components/CustomerServiceTab';
import AdminPanel from './components/AdminPanel';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  const t = translations[language];

  // Official Lumora Investment Plans
  const plans: InvestmentPlan[] = [
    { level: 0, name: 'Starter Level 1', requiredInvestment: 1000, dailyRate: 0.035, durationDays: 50, activationBonus: 50, isVip: false },
    { level: 1, name: 'Starter Level 2', requiredInvestment: 2000, dailyRate: 0.04, durationDays: 60, activationBonus: 100, isVip: false },
    { level: 2, name: 'Starter Level 3', requiredInvestment: 3500, dailyRate: 0.045, durationDays: 70, activationBonus: 150, isVip: false },
    { level: 3, name: 'VIP Level 1', requiredInvestment: 5000, dailyRate: 0.05, durationDays: 90, activationBonus: 250, isVip: true },
    { level: 4, name: 'VIP Level 2', requiredInvestment: 10000, dailyRate: 0.055, durationDays: 120, activationBonus: 500, isVip: true },
    { level: 5, name: 'VIP Level 3', requiredInvestment: 20000, dailyRate: 0.06, durationDays: 150, activationBonus: 1000, isVip: true },
    { level: 6, name: 'VIP Level 4', requiredInvestment: 40000, dailyRate: 0.065, durationDays: 180, activationBonus: 2500, isVip: true },
    { level: 7, name: 'VIP Level 5', requiredInvestment: 80000, dailyRate: 0.07, durationDays: 240, activationBonus: 5500, isVip: true },
  ];

  // Load from LocalStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('lumora_profile');
    const savedInvestments = localStorage.getItem('lumora_investments');
    const savedTransactions = localStorage.getItem('lumora_transactions');
    const savedReferrals = localStorage.getItem('lumora_referrals');

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedReferrals) setReferrals(JSON.parse(savedReferrals));
  }, []);

  // Save to LocalStorage helper
  const saveState = (
    newProfile: UserProfile | null,
    newInvests: Investment[],
    newTxs: Transaction[],
    newRefs: Referral[]
  ) => {
    if (newProfile) {
      localStorage.setItem('lumora_profile', JSON.stringify(newProfile));
      setProfile(newProfile);
    }
    localStorage.setItem('lumora_investments', JSON.stringify(newInvests));
    localStorage.setItem('lumora_transactions', JSON.stringify(newTxs));
    localStorage.setItem('lumora_referrals', JSON.stringify(newRefs));
    
    setInvestments(newInvests);
    setTransactions(newTxs);
    setReferrals(newRefs);
  };

  // Login handler
  const handleLogin = (newProfile: UserProfile) => {
    // Add default initial transactions/referrals if user is new
    const savedProfile = localStorage.getItem('lumora_profile');
    if (!savedProfile) {
      // 100 ETB Starter Signup Bonus!
      const initialBonusTx: Transaction = {
        id: 'bonus_' + Math.random().toString(36).substring(2, 9),
        type: 'bonus',
        amount: 100,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      
      const updatedProfile = {
        ...newProfile,
        walletBalance: 100, // Preloaded with starter bonus
        totalEarned: 100,
      };

      const mockReferralList: Referral[] = [
        { phone: '0911854911', name: 'Almaz Kassa', isVerified: true, referredVipLevel: 1, joinedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
        { phone: '0922831005', name: 'Elias Tekle', isVerified: false, referredVipLevel: 0, joinedAt: new Date(Date.now() - 86400000 * 5).toISOString() }
      ];

      saveState(updatedProfile, [], [initialBonusTx], mockReferralList);
      alert(language === 'am' ? 'ሉሞራን ስለተቀላቀሉ የ 100 ETB የጀማሪ ጉርሻ አግኝተዋል!' : 'Welcome to LUMORA! You have received a 100 ETB Starter Signup Bonus!');
    } else {
      setProfile(JSON.parse(savedProfile));
    }
  };

  // Secure Logout
  const handleLogout = () => {
    localStorage.removeItem('lumora_profile');
    setProfile(null);
    setCurrentTab('home');
  };

  // Submit CBE Deposit Proof
  const handleDepositProof = (amount: number, refCode: string, receiptPhoto: string) => {
    if (!profile) return;
    const newTx: Transaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      type: 'deposit',
      amount,
      status: 'pending',
      referenceCode: refCode,
      receiptPhoto,
      createdAt: new Date().toISOString(),
    };
    const updatedTxs = [newTx, ...transactions];
    saveState(profile, investments, updatedTxs, referrals);
  };

  // Claim Daily Earning Emitter
  const handleClaimDaily = (inv: Investment) => {
    if (!profile) return;
    const dailyReturn = inv.capital * inv.dailyRate;
    
    // Update investment status progress
    const updatedInvests: Investment[] = investments.map(i => {
      if (i.id === inv.id) {
        const nextDays = i.daysElapsed + 1;
        const isFinished = nextDays >= i.durationDays;
        return {
          ...i,
          daysElapsed: nextDays,
          earningsEarned: i.earningsEarned + dailyReturn,
          status: (isFinished ? 'completed' : 'active') as 'completed' | 'active',
        };
      }
      return i;
    });

    const earningTx: Transaction = {
      id: 'claim_' + Math.random().toString(36).substring(2, 9),
      type: 'earning',
      amount: dailyReturn,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    const updatedProfile = {
      ...profile,
      walletBalance: profile.walletBalance + dailyReturn,
      totalEarned: profile.totalEarned + dailyReturn,
    };

    saveState(updatedProfile, updatedInvests, [earningTx, ...transactions], referrals);
    alert(language === 'am' ? `የዕለት ተቀናሽ ትርፍዎ +${dailyReturn.toLocaleString()} ETB ተጨምሯል!` : `Your daily return of +${dailyReturn.toLocaleString()} ETB was claimed successfully!`);
  };

  // Invest in plan handler
  const handleInvest = (plan: InvestmentPlan, duration: number) => {
    if (!profile) return;
    if (profile.walletBalance < plan.requiredInvestment) return;

    // Deduct and create active investment
    const newInvest: Investment = {
      id: 'inv_' + Math.random().toString(36).substring(2, 9),
      planLevel: plan.level,
      planName: plan.name,
      capital: plan.requiredInvestment,
      dailyRate: plan.dailyRate,
      durationDays: duration,
      daysElapsed: 0,
      earningsEarned: 0,
      totalExpectedReturn: plan.requiredInvestment + (plan.requiredInvestment * plan.dailyRate * duration),
      status: 'active',
      createdAt: new Date().toISOString(),
      lastClaimedAt: new Date().toISOString(),
    };

    // Credit activation bonus!
    const bonusTx: Transaction = {
      id: 'bonus_act_' + Math.random().toString(36).substring(2, 9),
      type: 'bonus',
      amount: plan.activationBonus,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    const updatedProfile = {
      ...profile,
      walletBalance: profile.walletBalance - plan.requiredInvestment + plan.activationBonus,
      totalEarned: profile.totalEarned + plan.activationBonus,
      vipLevel: Math.max(profile.vipLevel, plan.level), // Upgrade level on purchase
    };

    const updatedInvests = [newInvest, ...investments];
    const updatedTxs = [bonusTx, ...transactions];

    saveState(updatedProfile, updatedInvests, updatedTxs, referrals);
    alert(
      language === 'am'
        ? `በ${plan.name} በተሳካ ሁኔታ ኢንቨስት አድርገዋል! ተጨማሪ የ +${plan.activationBonus} ETB የአግብሮት ቦነስ አግኝተዋል!`
        : `Successfully activated ${plan.name}! You have received an instant +${plan.activationBonus} ETB activation bonus!`
    );
    setCurrentTab('earnings');
  };

  // Submit KYC handler
  const handleKycSubmit = (idNumber: string, _idPhoto: string) => {
    if (!profile) return;
    const updatedProfile: UserProfile = {
      ...profile,
      idVerificationStatus: 'pending',
      idCardNumber: idNumber,
    };
    saveState(updatedProfile, investments, transactions, referrals);
  };

  // Secure Withdrawal handler
  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amountNum = Number(withdrawAmount);
    if (!withdrawAmount || amountNum < 250) {
      setWithdrawError(language === 'am' ? 'የማውጫው አነስተኛ መጠን 250 ETB ነው' : 'Minimum withdrawal limit is 250 ETB');
      return;
    }

    if (!profile || profile.walletBalance < amountNum) {
      setWithdrawError(language === 'am' ? 'በቂ የኪስ ቦርሳ ቀሪ ሂሳብ የለዎትም' : 'Insufficient wallet balance for this withdrawal');
      return;
    }

    // Create withdrawal transaction
    const newTx: Transaction = {
      id: 'tx_with_' + Math.random().toString(36).substring(2, 9),
      type: 'withdrawal',
      amount: amountNum,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedProfile = {
      ...profile,
      walletBalance: profile.walletBalance - amountNum,
    };

    const updatedTxs = [newTx, ...transactions];
    saveState(updatedProfile, investments, updatedTxs, referrals);
    setWithdrawSuccess(t.withdrawSuccess);
    setWithdrawAmount('');
  };

  // Administrative Controls backend triggers
  const handleApproveDeposit = (txId: string) => {
    if (!profile) return;
    const targetTx = transactions.find(t => t.id === txId);
    if (!targetTx) return;

    const updatedProfile = {
      ...profile,
      walletBalance: profile.walletBalance + targetTx.amount,
      totalDeposited: profile.totalDeposited + targetTx.amount,
    };

    const updatedTxs = transactions.map(t => {
      if (t.id === txId) return { ...t, status: 'completed' as const };
      return t;
    });

    saveState(updatedProfile, investments, updatedTxs, referrals);
  };

  const handleRejectDeposit = (txId: string) => {
    if (!profile) return;
    const updatedTxs = transactions.map(t => {
      if (t.id === txId) return { ...t, status: 'rejected' as const };
      return t;
    });
    saveState(profile, investments, updatedTxs, referrals);
  };

  const handleApproveWithdraw = (txId: string) => {
    if (!profile) return;
    const targetTx = transactions.find(t => t.id === txId);
    if (!targetTx) return;

    const updatedProfile = {
      ...profile,
      totalWithdrawn: profile.totalWithdrawn + targetTx.amount,
    };

    const updatedTxs = transactions.map(t => {
      if (t.id === txId) return { ...t, status: 'completed' as const };
      return t;
    });

    saveState(updatedProfile, investments, updatedTxs, referrals);
  };

  const handleRejectWithdraw = (txId: string) => {
    if (!profile) return;
    const targetTx = transactions.find(t => t.id === txId);
    if (!targetTx) return;

    const updatedProfile = {
      ...profile,
      walletBalance: profile.walletBalance + targetTx.amount, // Refund wallet on reject
    };

    const updatedTxs = transactions.map(t => {
      if (t.id === txId) return { ...t, status: 'rejected' as const };
      return t;
    });

    saveState(updatedProfile, investments, updatedTxs, referrals);
  };

  const handleApproveKyc = () => {
    if (!profile) return;
    const updatedProfile: UserProfile = {
      ...profile,
      idVerificationStatus: 'verified',
    };
    saveState(updatedProfile, investments, transactions, referrals);
  };

  const handleRejectKyc = () => {
    if (!profile) return;
    const updatedProfile: UserProfile = {
      ...profile,
      idVerificationStatus: 'rejected',
    };
    saveState(updatedProfile, investments, transactions, referrals);
  };

  if (!profile) {
    return <LoginScreen onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-[#0A3D91] selection:text-white">
      <HeaderBar 
        profile={profile} 
        language={language} 
        setLanguage={setLanguage} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {currentTab === 'home' && (
          <HomeTab 
            profile={profile} 
            language={language} 
            onOpenDeposit={() => setCurrentTab('card')} 
            onOpenWithdraw={() => setIsWithdrawOpen(true)} 
          />
        )}
        
        {currentTab === 'invest' && (
          <InvestmentsTab 
            profile={profile} 
            language={language} 
            plans={plans} 
            onInvest={handleInvest} 
            onNavigateToKyc={() => setCurrentTab('profile')}
          />
        )}

        {currentTab === 'earnings' && (
          <EarningsTab 
            profile={profile} 
            investments={investments} 
            onClaimDaily={handleClaimDaily}
          />
        )}

        {currentTab === 'card' && (
          <CardTab 
            language={language} 
            onSubmitProof={handleDepositProof} 
          />
        )}

        {currentTab === 'profile' && (
          <ProfileTab 
            profile={profile} 
            language={language} 
            onSubmitKyc={handleKycSubmit} 
            transactions={transactions}
            referrals={referrals}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
          />
        )}

        {currentTab === 'assistant' && (
          <CustomerServiceTab 
            language={language} 
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel 
            profile={profile}
            transactions={transactions}
            onApproveDeposit={handleApproveDeposit}
            onRejectDeposit={handleRejectDeposit}
            onApproveWithdraw={handleApproveWithdraw}
            onRejectWithdraw={handleRejectWithdraw}
            onApproveKyc={handleApproveKyc}
            onRejectKyc={handleRejectKyc}
          />
        )}
      </main>

      {/* Persistent Bottom navigation */}
      <BottomNavBar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        language={language} 
        isAdmin={true} 
      />

      {/* Withdrawal Secure Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <h4 className="text-xs font-black uppercase text-[#0A3D91] tracking-wider">
                {t.withdrawTitle}
              </h4>
              <button 
                onClick={() => {
                  setIsWithdrawOpen(false);
                  setWithdrawError('');
                  setWithdrawSuccess('');
                }}
                className="text-slate-400 hover:text-slate-700 font-extrabold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-wide">
              {t.withdrawLimitMsg}
            </p>

            <form onSubmit={handleWithdrawRequest} className="space-y-4">
              {withdrawError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[10px] font-bold flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[10px] font-bold flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{withdrawSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">
                  {t.withdrawAmount}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value);
                      setWithdrawError('');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm font-bold font-mono text-[#00173D]"
                    placeholder="Min 250"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-black text-slate-400">
                    ETB
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] shadow-md shadow-rose-600/10 cursor-pointer"
              >
                {t.withdrawBtnAction}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
