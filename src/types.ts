/**
 * LUMORA Types Definition
 */

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  isAdmin: boolean;
  status: 'active' | 'suspended';
  registrationDate: string;
  referralCode: string;
  referredBy?: string;
  password?: string;
  registeredByAdmin?: boolean;
  fullOwner?: boolean;
}

export interface Profile {
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  profilePicture?: string;
  vipLevel: number; // 0 (User), 1 - 15 (VIP Level)
  walletBalance: number;
  depositBalance?: number;
  incomeBalance?: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalInvestments: number;
  totalEarnings: number;
  referralCode: string;
  teamSize: number;
  registrationDate: string;
  transactionPin?: string;
  idCardFront?: string; 
  idCardBack?: string;  
  idSelfie?: string;
  fanNumber?: string;
  idVerificationStatus?: 'unsubmitted' | 'pending' | 'verified' | 'rejected' | 'skipped';
  idSubmittedAt?: string;
  idRejectionReason?: string;
  verificationBonusClaimed?: boolean;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  lastCheckInDate?: string;
  registeredByAdmin?: boolean;
  fullOwner?: boolean;
  claimedLevelBonuses?: number[];
}

export interface InvestmentPlan {
  id: string;
  level: number;
  name: string;
  requiredInvestment: number;
  dailyRate: number; // e.g. 0.012 for 1.2%
  durationDays: number;
  estimatedReturn: number;
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planLevel: number;
  amount: number;
  dailyRate: number;
  dailyReturn: number;
  startDate: string;
  maturityDate: string;
  remainingDays: number;
  status: 'active' | 'matured' | 'cancelled';
  totalEarned: number;
  lastPayoutDate?: string;
  unclaimedReturns?: number;
}

export interface DailyEarning {
  id: string;
  userId: string;
  investmentId: string;
  planName: string;
  amount: number;
  date: string;
}

export interface Deposit {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  bankAccount: string; // "Commercial Bank of Ethiopia (CBE)"
  receiptImage: string; // Base64 or placeholder URL
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string;
  bankReference?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  fee?: number;
  netAmount?: number;
  balanceType?: 'deposit' | 'income';
}

export interface MyTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'daily_earnings' | 'referral_reward' | 'payout' | 'bonus';
  amount: number;
  description: string;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredName: string;
  referredPhone: string;
  referredVipLevel: number;
  registrationDate: string;
  rewardEarned: number;
  isVerified?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  date: string;
}

export interface Agreement {
  id: string;
  title: string;
  category: 'terms' | 'policies' | 'agreements' | 'compliance' | 'about';
  uploadedAt: string;
  content: string; // text/markdown representation
}

export interface AppSettings {
  id: string;
  cbeAccountName: string;
  cbeAccountNumber: string;
  qbirrAccountName?: string;
  qbirrAccountNumber?: string;
  qbirrPaymentUrl?: string;
  referralBonusPercentage: number; // e.g., 5 for 5%
  productionInviteUrl?: string;
  companyLicenseUrl?: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  details: string;
  date: string;
}

export interface LoginHistory {
  id: string;
  userId: string;
  phone: string;
  device: string;
  ip: string;
  date: string;
}

export interface Loan {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  vipLevel: number;
  amount: number;
  nationalId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  tenureMonths?: number;
}

export interface EligibilityCheck {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  vipLevel: number;
  timestamp: string;
  passed: boolean;
  remarks: string;
  membershipDurationMonths: number;
  verifiedReferralCount: number;
}

export interface LumoraCard {
  id: string;
  userId: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  cardHolderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  balance: number; // in USD
  status: 'active' | 'frozen' | 'expired' | 'pending';
  lastRechargeDate?: string;
  applicationDate?: string;
  rechargeCount?: number;
}

export interface CardTransaction {
  id: string;
  userId: string;
  cardId: string;
  type: 'card_issued' | 'card_recharge' | 'online_purchase' | 'refund' | 'card_freeze' | 'card_unfreeze';
  amount: number; // in USD
  amountEtb?: number;
  date: string;
  description: string;
  status: 'completed' | 'failed' | 'pending';
}


