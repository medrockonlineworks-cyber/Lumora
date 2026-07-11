export interface UserProfile {
  phone: string;
  name: string;
  vipLevel: number; // 0 = Starter Level 1, 1 = Starter Level 2, 2 = Starter Level 3, 3 = VIP 1, 4 = VIP 2, etc.
  walletBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarned: number;
  idVerificationStatus: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
  idCardNumber?: string;
  registrationDate: string;
  referralCode: string;
  referredBy?: string;
}

export interface InvestmentPlan {
  level: number;
  name: string;
  requiredInvestment: number;
  dailyRate: number; // e.g. 0.05 for 5%
  durationDays: number;
  activationBonus: number; // Level 1 is 50, Level 2 is 100, Level 3 is 150, etc.
  isVip: boolean;
}

export interface Investment {
  id: string;
  planLevel: number;
  planName: string;
  capital: number;
  dailyRate: number;
  durationDays: number;
  daysElapsed: number;
  earningsEarned: number;
  totalExpectedReturn: number;
  status: 'active' | 'completed';
  createdAt: string;
  lastClaimedAt: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bonus' | 'earning' | 'investment';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  referenceCode?: string;
  receiptPhoto?: string;
  createdAt: string;
}

export interface Referral {
  phone: string;
  name: string;
  isVerified: boolean;
  referredVipLevel: number;
  joinedAt: string;
}
