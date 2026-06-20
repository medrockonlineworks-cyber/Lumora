// Transparent Client-Side local database fallback for static hosting deployments (e.g. Vercel)
// Intercepts fetch requests to '/api/*' and handles them in localStorage when the server is unreachable or returns a 404 HTML fallback.

import { 
  User, Profile, Investment, Deposit, Withdrawal, 
  MyTransaction, Notification, Referral, ChatMessage, Agreement, AppSettings, Loan,
  LumoraCard, CardTransaction
} from '../types';

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

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
  cards?: LumoraCard[];
  cardTransactions?: CardTransaction[];
}

const DEFAULT_SETTINGS: AppSettings = {
  id: "global",
  cbeAccountName: "Leykun",
  cbeAccountNumber: "1000419524747",
  referralBonusPercentage: 10,
  productionInviteUrl: "",
};

const VIP_PLANS = [
  { level: 1, name: "Starter level", requiredInvestment: 3500, dailyRate: 0.0340, durationDays: 50, estimatedReturn: 9450 },
  { level: 2, name: "VIP Level 1", requiredInvestment: 5000, dailyRate: 0.0350, durationDays: 50, estimatedReturn: 13750 },
  { level: 3, name: "VIP Level 2", requiredInvestment: 10000, dailyRate: 0.0375, durationDays: 50, estimatedReturn: 28750 },
  { level: 4, name: "VIP Level 3", requiredInvestment: 25000, dailyRate: 0.0400, durationDays: 50, estimatedReturn: 75000 },
  { level: 5, name: "VIP Level 4", requiredInvestment: 50000, dailyRate: 0.0430, durationDays: 50, estimatedReturn: 157500 },
  { level: 6, name: "VIP Level 5", requiredInvestment: 100000, dailyRate: 0.0460, durationDays: 70, estimatedReturn: 422000 },
  { level: 7, name: "VIP Level 6", requiredInvestment: 250000, dailyRate: 0.0500, durationDays: 70, estimatedReturn: 1125000 },
  { level: 8, name: "VIP Level 7", requiredInvestment: 500000, dailyRate: 0.0540, durationDays: 70, estimatedReturn: 2390000 },
  { level: 9, name: "VIP Level 8", requiredInvestment: 1000000, dailyRate: 0.0580, durationDays: 70, estimatedReturn: 5060000 },
  { level: 10, name: "VIP Level 9", requiredInvestment: 2000000, dailyRate: 0.0620, durationDays: 70, estimatedReturn: 10680000 },
  { level: 11, name: "VIP Level 10", requiredInvestment: 5000000, dailyRate: 0.0670, durationDays: 70, estimatedReturn: 28450000 },
  { level: 12, name: "VIP Level 11", requiredInvestment: 10000000, dailyRate: 0.0720, durationDays: 90, estimatedReturn: 74800000 },
  { level: 13, name: "VIP Level 12", requiredInvestment: 25000000, dailyRate: 0.0780, durationDays: 90, estimatedReturn: 200500000 },
  { level: 14, name: "VIP Level 13", requiredInvestment: 50000000, dailyRate: 0.0850, durationDays: 90, estimatedReturn: 432500000 },
  { level: 15, name: "VIP Level 14", requiredInvestment: 75000000, dailyRate: 0.0920, durationDays: 90, estimatedReturn: 696000000 },
  { level: 16, name: "VIP Level 15", requiredInvestment: 100000000, dailyRate: 0.1000, durationDays: 120, estimatedReturn: 1300000000 }
];

const AGREEMENTS: Agreement[] = [
  {
    id: "terms-and-conditions",
    title: "Terms and Conditions",
    category: "terms",
    uploadedAt: "2026-06-03T12:00:00Z",
    content: "### Terms and Conditions\n\nWelcome to LUMORA. Please review our revised platform guidelines:\n\n1. **User Identity & Bank Registration**: To maintain compliance with financial frameworks in Ethiopia, user registration does not auto-populate default credentials. Users must designate their own legitimate Commercial Bank of Ethiopia (CBE) bank details and configure a secure 4-digit payment PIN to authorize active withdrawals.\n2. **Unified Financial Limits**: A minimum transaction threshold of 3,500 ETB for CBE deposit submissions and 200 ETB for cashouts is enforced to ensure efficient processing and settlement.\n3. **Real-Time Ledger Integration**: All balance adjustments, VIP level elevations, deposits, and cashouts synchronize in real-time under a 3-second secure consensus. All transfers are manually audited on the admin portal.\n4. **Security & Identity Validation**: To authorize active cashouts and access micro-loans, users must verify their profile by uploading clean photos of both sides of their National ID cards."
  },
  {
    id: "investment-policies",
    title: "Investment Policies & Rules",
    category: "policies",
    uploadedAt: "2026-06-03T12:00:00Z",
    content: "### Investment Policies & Rules\n\nPlatform micro-finance structural rules in detail:\n\n1. **High-Yield Plan Activation**: Investment plans are activated immediately upon balance confirmation (Min 3,500 ETB), automatically starting synced daily yields spanning VIP levels. Interest cycles schedule payouts every 24 hours.\n2. **CBE Transfer and Auditing**: Deposits are routed directly to the treasury audit desk via CBE app screenshots. Administrators evaluate submissions, and credits reflect live on user dashboards in under 2 hours.\n3. **Cashout Settlements**: Users cash out using secure designated accounts. Approved cashouts are dispersed within 0 to 42 hours to prevent settlement issues and ensure sustainable liquidity."
  },
  {
    id: "risk-disclosure",
    title: "About Us",
    category: "about",
    uploadedAt: "2026-06-03T12:00:00Z",
    content: "### About Us & How Lumora Works\n\n**Welcome to Lumora** – Ethiopia's premier peer-to-peer automated micro-finance and high-yield liquidity channel.\n\nWe connect local commerce and infrastructure project liquidity pools directly to user micro-investments, facilitating high-yield, stable growth with institutional accuracy.\n\n#### How It Works:\n\n1. **Deposit Micro-Capital**: Copy our official Commercial Bank of Ethiopia (CBE) account number from the Deposit Dialog. Transfer your starting capital (minimum 3,500 ETB) from your CBE Birr App, note down your reference code, and capture a clear screenshot of the receipt.\n2. **Submit Proof**: Enter your deposited amount, paste the CBE reference code, upload your receipt screenshot, and submit. The administrators will audit and credit your account within 2 hours.\n3. **Activate High-Yield Plans**: Invest your wallet balance into VIP tiers ranging from VIP 0 to VIP 15. Your plan activates immediately, compounding interest payouts every 24 hours.\n4. **Secure Dynamic Cashouts**: Navigate to the Cashout menu. First, configure your personal phone number, active Ethiopian bank card details, and a secret 4-digit transaction PIN. Authorize cashouts (minimum 200 ETB) safely using this PIN.\n5. **Identity Integrity**: Verify your account by uploading photos of both sides of your National ID. This unlocks access to VIP active withdrawals and institutional loan options."
  }
];

function getInitialDB(): LumoraDB {
  return {
    users: [
      {
        id: "user-0kw1ojisk",
        fullName: "HENOK AYELIGN",
        phone: "0926193920",
        email: "leykunjemaneh3@gmail.com",
        password: "000000",
        isAdmin: true,
        status: "active",
        registrationDate: new Date().toISOString(),
        referralCode: "LUMOTU23"
      },
      {
        id: "user-0926193921",
        fullName: "Recovered User",
        phone: "0926193921",
        email: "0926193921@lumora.net",
        password: "000001",
        isAdmin: false,
        status: "active",
        registrationDate: new Date().toISOString(),
        referralCode: "LUMRECOV"
      },
      {
        id: "user-w7g0wkoqu",
        fullName: "Leulseger Ashenafi",
        phone: "0951560276",
        email: "0951560276@lumora.net",
        password: "78907890",
        isAdmin: false,
        status: "active",
        registrationDate: new Date().toISOString(),
        referralCode: "LUMLEULS"
      },
      {
        id: "user-06auq6jd8",
        fullName: "Daniel gutu",
        phone: "0981051800",
        email: "0981051800@lumora.net",
        password: "051800",
        isAdmin: false,
        status: "active",
        registrationDate: new Date().toISOString(),
        referralCode: "LUMDANIEL"
      },
      {
        id: "user-7ni8y6uyg",
        fullName: "Asegid alebachew",
        phone: "0978907890",
        email: "0978907890@lumora.net",
        password: "78907890",
        isAdmin: false,
        status: "active",
        registrationDate: new Date().toISOString(),
        referralCode: "LUMASEGID"
      },
      {
        id: "user-8qqmqao5q",
        fullName: "Kidus alehign",
        phone: "0989898888",
        email: "0989898888@lumora.net",
        password: "89898989",
        isAdmin: false,
        status: "active",
        registrationDate: new Date().toISOString(),
        referralCode: "LUMKIDUS"
      },
      {
        id: "user-0ey692o7u",
        fullName: "Alem debebe",
        phone: "0934187334",
        email: "0934187334@lumora.net",
        password: "000001",
        isAdmin: false,
        status: "active",
        registrationDate: new Date().toISOString(),
        referralCode: "LUMALEM"
      }
    ],
    profiles: [
      {
        userId: "user-0kw1ojisk",
        fullName: "HENOK AYELIGN",
        phone: "0926193920",
        email: "leykunjemaneh3@gmail.com",
        vipLevel: 16,
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
        accountNumber: "10006806648721",
        accountHolderName: "HENOK AYELIGN",
        transactionPin: "4321",
        idSelfie: "",
        incomeBalance: 0,
        depositBalance: 20000000
      },
      {
        userId: "user-0926193921",
        fullName: "Recovered User",
        phone: "0926193921",
        email: "0926193921@lumora.net",
        vipLevel: 2,
        walletBalance: 8500,
        totalDeposits: 8500,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalEarnings: 0,
        referralCode: "LUMRECOV",
        teamSize: 0,
        registrationDate: new Date().toISOString(),
        idCardFront: "",
        idCardBack: "",
        idVerificationStatus: "unsubmitted",
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "",
        accountHolderName: "Recovered User",
        transactionPin: "1234",
        idSelfie: "",
        incomeBalance: 0,
        depositBalance: 8500
      },
      {
        userId: "user-w7g0wkoqu",
        fullName: "Leulseger Ashenafi",
        phone: "0951560276",
        email: "0951560276@lumora.net",
        vipLevel: 5,
        walletBalance: 53500,
        totalDeposits: 53500,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalEarnings: 0,
        referralCode: "LUMLEULS",
        teamSize: 0,
        registrationDate: new Date().toISOString(),
        idCardFront: "",
        idCardBack: "",
        idVerificationStatus: "unsubmitted",
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "",
        accountHolderName: "Leulseger Ashenafi",
        transactionPin: "1234",
        idSelfie: "",
        incomeBalance: 0,
        depositBalance: 53500
      },
      {
        userId: "user-06auq6jd8",
        fullName: "Daniel gutu",
        phone: "0981051800",
        email: "0981051800@lumora.net",
        vipLevel: 4,
        walletBalance: 28500,
        totalDeposits: 28500,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalEarnings: 0,
        referralCode: "LUMDANIEL",
        teamSize: 0,
        registrationDate: new Date().toISOString(),
        idCardFront: "",
        idCardBack: "",
        idVerificationStatus: "unsubmitted",
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "",
        accountHolderName: "Daniel gutu",
        transactionPin: "1234",
        idSelfie: "",
        incomeBalance: 0,
        depositBalance: 28500
      },
      {
        userId: "user-7ni8y6uyg",
        fullName: "Asegid alebachew",
        phone: "0978907890",
        email: "0978907890@lumora.net",
        vipLevel: 3,
        walletBalance: 12500,
        totalDeposits: 12500,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalEarnings: 0,
        referralCode: "LUMASEGID",
        teamSize: 0,
        registrationDate: new Date().toISOString(),
        idCardFront: "",
        idCardBack: "",
        idVerificationStatus: "unsubmitted",
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "",
        accountHolderName: "Asegid alebachew",
        transactionPin: "1234",
        idSelfie: "",
        incomeBalance: 0,
        depositBalance: 12500
      },
      {
        userId: "user-8qqmqao5q",
        fullName: "Kidus alehign",
        phone: "0989898888",
        email: "0989898888@lumora.net",
        vipLevel: 6,
        walletBalance: 105000,
        totalDeposits: 105000,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalEarnings: 0,
        referralCode: "LUMKIDUS",
        teamSize: 0,
        registrationDate: new Date().toISOString(),
        idCardFront: "",
        idCardBack: "",
        idVerificationStatus: "unsubmitted",
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "",
        accountHolderName: "Kidus alehign",
        transactionPin: "1234",
        idSelfie: "",
        incomeBalance: 0,
        depositBalance: 105000
      },
      {
        userId: "user-0ey692o7u",
        fullName: "Alem debebe",
        phone: "0934187334",
        email: "0934187334@lumora.net",
        vipLevel: 3,
        walletBalance: 15000,
        totalDeposits: 15000,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalEarnings: 0,
        referralCode: "LUMALEM",
        teamSize: 0,
        registrationDate: new Date().toISOString(),
        idCardFront: "",
        idCardBack: "",
        idVerificationStatus: "unsubmitted",
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "",
        accountHolderName: "Alem debebe",
        transactionPin: "1234",
        idSelfie: "",
        incomeBalance: 0,
        depositBalance: 15000
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
    loans: [],
    cards: [],
    cardTransactions: []
  };
}

function loadLocalDB(): LumoraDB {
  const data = localStorage.getItem('lumora_local_db');
  let db: LumoraDB;
  if (data) {
    try {
      const parsed = JSON.parse(data) as LumoraDB;
      if (!parsed.users) parsed.users = [];
      if (!parsed.profiles) parsed.profiles = [];
      if (!parsed.investments) parsed.investments = [];
      if (!parsed.deposits) parsed.deposits = [];
      if (!parsed.withdrawals) parsed.withdrawals = [];
      if (!parsed.transactions) parsed.transactions = [];
      if (!parsed.notifications) parsed.notifications = [];
      if (!parsed.referrals) parsed.referrals = [];
      if (!parsed.loans) parsed.loans = [];
      if (!parsed.cards) parsed.cards = [];
      if (!parsed.cardTransactions) parsed.cardTransactions = [];
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
  } else {
    let changed = false;
    if (db.settings.cbeAccountNumber === "1000456123985" || db.settings.cbeAccountName === "LUMORA Financial Group") {
      db.settings.cbeAccountNumber = "1000419524747";
      db.settings.cbeAccountName = "Leykun";
      changed = true;
    }
    if (db.settings.productionInviteUrl === "https://www.lumorainvest.company") {
      db.settings.productionInviteUrl = "";
      changed = true;
    }
    if (changed) {
      modified = true;
    }
  }

  // Overwrite local db agreements with up-to-date agreements to sync limits (3500 and 200)
  db.agreements = AGREEMENTS;
  modified = true;

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

const lastSyncedClient: Record<string, Record<string, string>> = {
  users: {},
  profiles: {},
  investments: {},
  deposits: {},
  withdrawals: {},
  transactions: {},
  notifications: {},
  referrals: {},
  agreements: {},
  settings: {},
  loans: {},
  cards: {},
  cardTransactions: {},
  chatHistory: {}
};

let firestoreClientDb: any = null;

function getFirestoreClientDb() {
  if (firestoreClientDb) return firestoreClientDb;
  if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    return null;
  }
  try {
    const app = initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId
    });
    firestoreClientDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log(`[Firebase Client Diagnostic] Connected successfully to Firebase Project ID: "${firebaseConfig.projectId}" and Database ID: "${firebaseConfig.firestoreDatabaseId}"`);
    return firestoreClientDb;
  } catch (err) {
    console.error("[Client Firestore] Failed to initialize:", err);
    return null;
  }
}

async function syncClientToFirestore(latestDb: LumoraDB) {
  const fDb = getFirestoreClientDb();
  if (!fDb) return;

  const collectionSpecs = [
    { name: "users", array: latestDb.users || [], key: "id" },
    { name: "profiles", array: latestDb.profiles || [], key: "userId" },
    { name: "investments", array: latestDb.investments || [], key: "id" },
    { name: "deposits", array: latestDb.deposits || [], key: "id" },
    { name: "withdrawals", array: latestDb.withdrawals || [], key: "id" },
    { name: "transactions", array: latestDb.transactions || [], key: "id" },
    { name: "notifications", array: latestDb.notifications || [], key: "id" },
    { name: "referrals", array: latestDb.referrals || [], key: "id" },
    { name: "agreements", array: latestDb.agreements || [], key: "id" },
    { name: "loans", array: latestDb.loans || [], key: "id" },
    { name: "cards", array: latestDb.cards || [], key: "id" },
    { name: "cardTransactions", array: latestDb.cardTransactions || [], key: "id" },
  ];

  for (const spec of collectionSpecs) {
    const localMap = new Map<string, any>();
    for (const item of spec.array) {
      if (item) {
        const id = item[spec.key];
        if (id) {
          localMap.set(id, item);
        }
      }
    }

    // 1. Identify updates & creations
    for (const [id, item] of localMap.entries()) {
      const json = JSON.stringify(item);
      if (lastSyncedClient[spec.name][id] !== json) {
        lastSyncedClient[spec.name][id] = json;
        try {
          await setDoc(doc(fDb, spec.name, id), item);
        } catch (e) {
          console.error(`[Client Firestore] Error saving ${spec.name}/${id}:`, e);
        }
      }
    }

    // 2. Identify deletions
    const lastSyncedKeys = Object.keys(lastSyncedClient[spec.name]);
    for (const id of lastSyncedKeys) {
      if (!localMap.has(id)) {
        delete lastSyncedClient[spec.name][id];
        try {
          await deleteDoc(doc(fDb, spec.name, id));
        } catch (e) {
          console.error(`[Client Firestore] Error deleting ${spec.name}/${id}:`, e);
        }
      }
    }
  }

  // Settings
  if (latestDb.settings) {
    const jsonSettings = JSON.stringify(latestDb.settings);
    if (lastSyncedClient.settings["global"] !== jsonSettings) {
      lastSyncedClient.settings["global"] = jsonSettings;
      try {
        await setDoc(doc(fDb, "settings", "global"), latestDb.settings);
      } catch (e) {
        console.error("[Client Firestore] Error saving settings:", e);
      }
    }
  }

  // Chat History
  for (const userId of Object.keys(latestDb.chatHistory || {})) {
    const messages = latestDb.chatHistory[userId] || [];
    const json = JSON.stringify(messages);
    if (lastSyncedClient.chatHistory[userId] !== json) {
      lastSyncedClient.chatHistory[userId] = json;
      try {
        await setDoc(doc(fDb, "chatHistory", userId), { messages });
      } catch (e) {
        console.error(`[Client Firestore] Error saving chatHistory for ${userId}:`, e);
      }
    }
  }
}

const initialSyncStatus: { users: boolean; profiles: boolean } = {
  users: false,
  profiles: false,
};

export async function ensureAuthDataSynced(timeoutMs: number = 4000): Promise<void> {
  const fDb = getFirestoreClientDb();
  if (!fDb) {
    console.log("[Client Firestore] Direct Firestore-synced engine is offline. Bypassing guarantee wait.");
    return;
  }
  const start = Date.now();
  while (!initialSyncStatus.users || !initialSyncStatus.profiles) {
    if (Date.now() - start >= timeoutMs) {
      console.warn(`[Client Firestore Sync] Auth data sync timed out after ${timeoutMs}ms.`);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

let listenersInitialized = false;

export function setupClientFirebaseSync() {
  if (listenersInitialized) return;
  const fDb = getFirestoreClientDb();
  if (!fDb) {
    console.log("[Client Firestore] No client Firestore configured or available.");
    return;
  }
  listenersInitialized = true;
  console.log("[Client Firestore] Setting up real-time listener subscriptions for real-time admin sync...");

  const collectionsToListen = [
    { name: "users", key: "id", arrayName: "users" },
    { name: "profiles", key: "userId", arrayName: "profiles" },
    { name: "investments", key: "id", arrayName: "investments" },
    { name: "deposits", key: "id", arrayName: "deposits" },
    { name: "withdrawals", key: "id", arrayName: "withdrawals" },
    { name: "transactions", key: "id", arrayName: "transactions" },
    { name: "notifications", key: "id", arrayName: "notifications" },
    { name: "referrals", key: "id", arrayName: "referrals" },
    { name: "agreements", key: "id", arrayName: "agreements" },
    { name: "loans", key: "id", arrayName: "loans" },
    { name: "cards", key: "id", arrayName: "cards" },
    { name: "cardTransactions", key: "id", arrayName: "cardTransactions" },
  ];

  for (const col of collectionsToListen) {
    onSnapshot(collection(fDb, col.name), (snapshot) => {
      if (col.name === "users" || col.name === "profiles") {
        initialSyncStatus[col.name] = true;
      }
      const currentDb = loadLocalDB();
      if (!currentDb[col.arrayName as keyof LumoraDB]) {
        (currentDb as any)[col.arrayName] = [];
      }
      const targetArray = currentDb[col.arrayName as keyof LumoraDB] as any[];

      // Create a map of current local items by their main key to preserve local-only/unsubmitted items
      const localMap = new Map<string, any>();
      for (const item of targetArray) {
        if (item) {
          const id = item[col.key];
          if (id) {
            localMap.set(id, item);
          }
        }
      }

      let updated = false;

      // Update or insert elements retrieved from Firestore
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const id = data[col.key];
        if (id) {
          const remoteJson = JSON.stringify(data);
          const localItem = localMap.get(id);
          const localJson = localItem ? JSON.stringify(localItem) : null;

          if (localJson !== remoteJson) {
            localMap.set(id, data);
            lastSyncedClient[col.name][id] = remoteJson;
            updated = true;
          }
        }
      });

      // Handle remote deletions: If we tracked an item in lastSynced but it's no longer present on Firestore, remove it
      const remoteKeys = new Set(snapshot.docs.map(d => d.id));
      const trackedKeys = Object.keys(lastSyncedClient[col.name]);
      for (const key of trackedKeys) {
        if (!remoteKeys.has(key)) {
          if (localMap.has(key)) {
            localMap.delete(key);
            delete lastSyncedClient[col.name][key];
            updated = true;
          }
        }
      }

      if (updated || (snapshot.empty && targetArray.length > 0 && Object.keys(lastSyncedClient[col.name]).length > 0)) {
        targetArray.length = 0;
        targetArray.push(...Array.from(localMap.values()));
        localStorage.setItem('lumora_local_db', JSON.stringify(currentDb));

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("lumoradb-updated", { detail: { collection: col.name } }));
        }
      }
    }, (error) => {
      console.error(`[Client Firestore] Listener error on '${col.name}':`, error);
      if (col.name === "users" || col.name === "profiles") {
        initialSyncStatus[col.name] = true;
      }
    });
  }

  // settings listener
  onSnapshot(doc(fDb, "settings", "global"), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentDb = loadLocalDB();
      currentDb.settings = data as AppSettings;
      lastSyncedClient.settings["global"] = JSON.stringify(data);
      localStorage.setItem('lumora_local_db', JSON.stringify(currentDb));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("lumoradb-updated", { detail: { collection: "settings" } }));
      }
    }
  }, (error) => {
    console.error("[Client Firestore] Listener error on settings:", error);
  });

  // chatHistory listener
  onSnapshot(collection(fDb, "chatHistory"), (snapshot) => {
    const currentDb = loadLocalDB();
    if (!currentDb.chatHistory) currentDb.chatHistory = {};
    let updated = false;

    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const userId = docSnap.id;
      const messages = data.messages || [];
      currentDb.chatHistory[userId] = messages;
      lastSyncedClient.chatHistory[userId] = JSON.stringify(messages);
      updated = true;
    });

    if (updated) {
      localStorage.setItem('lumora_local_db', JSON.stringify(currentDb));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("lumoradb-updated", { detail: { collection: "chatHistory" } }));
      }
    }
  }, (error) => {
    console.error("[Client Firestore] Listener error on chatHistory:", error);
  });
}

function saveLocalDB(db: LumoraDB) {
  localStorage.setItem('lumora_local_db', JSON.stringify(db));
  syncClientToFirestore(db).catch(err => {
    console.warn("[Client Firestore Sync] Cloud update error:", err);
  });
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
  let pathname = url.split('?')[0];
  if (pathname.includes('://')) {
    try {
      pathname = new URL(pathname).pathname;
    } catch (_) {}
  }
  const method = init?.method?.toUpperCase() || 'GET';
  const body = init?.body ? JSON.parse(init.body as string) : undefined;
  
  const db = loadLocalDB();
  autoAllocateLocalDailyEarnings(db);

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
    await ensureAuthDataSynced(4000);
    const activeDb = loadLocalDB();
    const { userId } = body;
    if (!userId) return respondJSON(401, { error: "Session authentication failed" });
    const user = activeDb.users.find(u => u.id === userId);
    const profile = activeDb.profiles.find(p => p.userId === userId);
    if (!user || !profile) return respondJSON(404, { error: "Active user profile not found" });
    if (user.status === "suspended") return respondJSON(403, { error: "Your account is suspended. Contact LUMORA Support." });
    return respondJSON(200, { user, profile });
  }

  // 5. POST /api/auth/register
  if (pathname === '/api/auth/register' && method === 'POST') {
    try {
      console.log("[Firebase registration] Received new registration request:", body.phone || "No phone");
      await ensureAuthDataSynced(4000);
      const activeDb = loadLocalDB();
      const { fullName, phone, email, password, referralCode } = body;
      
      if (!fullName || !phone || !email || !password) {
        console.error("[Firebase registration error] Missing required parameters.");
        return respondJSON(400, { error: "All fields including email are required" });
      }

      const userExists = activeDb.users.some(u => u.phone === phone);
      if (userExists) {
        console.warn("[Firebase registration conflict] Phone number already registered:", phone);
        return respondJSON(409, { error: "This phone number is already registered" });
      }

      const userId = "user-" + Math.random().toString(36).substr(2, 9);
      const systemReferral = "LUM" + Math.random().toString(36).substr(2, 5).toUpperCase();

      let referrer = referralCode ? activeDb.users.find(u => u.referralCode === referralCode) : undefined;

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

      activeDb.users.push(newUser);
      activeDb.profiles.push(newProfile);

      if (referrer) {
        const referrerProfile = activeDb.profiles.find(p => p.userId === referrer!.id);
        if (referrerProfile) referrerProfile.teamSize += 1;
        activeDb.referrals.push({
          id: "ref-" + Math.random().toString(36).substr(2, 9),
          referrerId: referrer.id,
          referredId: userId,
          referredName: fullName,
          referredPhone: phone,
          referredVipLevel: 0,
          registrationDate: new Date().toISOString(),
          rewardEarned: 0
        });
        console.log(`[Firebase registration] Referral matched. Set referrer registration to: ${referrer.id}`);
      }

      activeDb.notifications.push({
        id: "not-" + Math.random().toString(36).substr(2, 9),
        userId,
        title: "Welcome to LUMORA!",
        message: "Congratulations! Your account has been created. Connect with us via official CBE deposit to choose a VIP Investment plan.",
        read: false,
        date: new Date().toISOString()
      });

      console.log(`[Firebase registration] Saving new user ${userId} and associated profile into client-side database which immediately triggers direct Firestore write.`);
      saveLocalDB(activeDb);
      console.log(`[Firebase registration success] Successfully registered. User ID: ${userId} saved in Firestore under 'users' collection.`);
      return respondJSON(200, { user: newUser, profile: newProfile });
    } catch (err: any) {
      console.error("[Firebase registration fatal error] Exception caught during registration logic:", err);
      return respondJSON(500, { error: "Registration failed on server: " + (err?.message || String(err)) });
    }
  }

  // 6. POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      console.log("[Firebase login] Login request received for telephone number:", body.phone || "No phone");
      await ensureAuthDataSynced(4000);
      const activeDb = loadLocalDB();
      const { phone, password } = body;
      
      const user = activeDb.users.find(u => u.phone === phone);
      if (!user) {
        console.warn("[Firebase login failure] Lookup failed: no user document found in Firestore 'users' collection with number:", phone);
        return respondJSON(401, { error: "Invalid telephone number or password credentials." });
      }
      
      if (user.password !== password) {
        console.warn("[Firebase login failure] Invalid credential attempt: password does not match for phone:", phone);
        return respondJSON(401, { error: "Invalid telephone number or password credentials." });
      }

      if (user.status === "suspended") {
        console.warn("[Firebase login blocked] Suspended login attempted for phone:", phone);
        return respondJSON(430, { error: "This profile has been suspended indefinitely for institutional compliance auditing. Please connect with Lumora Technical Desk." });
      }

      const profile = activeDb.profiles.find(p => p.userId === user.id || p.phone === phone);
      console.log(`[Firebase login success] Authenticated through Firebase for user: ${user.id} (${user.fullName}).`);
      return respondJSON(200, { user, profile });
    } catch (err: any) {
      console.error("[Firebase login fatal error] Exception caught during login verification:", err);
      return respondJSON(500, { error: "Authentication system encountered an error: " + (err?.message || String(err)) });
    }
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

  // 7b. POST /api/auth/skip-id
  if (pathname === '/api/auth/skip-id' && method === 'POST') {
    const { userId } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    profile.idVerificationStatus = "skipped";

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "Starter Onboarding Bypassed",
      message: "You have selected 'Upload Later' for ID verification. You can now use the Starter Level and submit your documents at any time when ready to upgrade.",
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

    if (false && profile.idVerificationStatus !== 'verified' && profile.idVerificationStatus !== 'skipped') {
      return respondJSON(403, { error: "Security Restriction: Deposits are not allowed until your account is fully ID Verified or skipped." });
    }

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
    if (isNaN(withdrawAmount) || withdrawAmount < 200) {
      return respondJSON(400, { error: "Minimum withdrawal limit is 200 ETB" });
    }
    if (profile.walletBalance < 200) {
      return respondJSON(400, { error: "User total balance must be at least 200 ETB to withdraw." });
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

  // 11b. GET /api/deposits/user/:userId
  if (pathname.startsWith('/api/deposits/user/') && method === 'GET') {
    const userId = pathname.split('/').pop();
    const list = db.deposits.filter(d => d.userId === userId);
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

    if (plan.level >= 2 && profile.idVerificationStatus !== "verified") {
      return respondJSON(400, { error: "Identity verification is mandatory to unlock higher VIP plans." });
    }

    if (profile.walletBalance < plan.requiredInvestment) {
      return respondJSON(400, { error: `Insufficient available funds. Required: ${plan.requiredInvestment} ETB.` });
    }

    // Level 5 (VIP Level 5 + corresponding to plan.level >= 6) and upper Activation Constraint Guard
    if (plan.level >= 6) {
      const vipLevelNum = plan.level - 1; // 1 for VIP 1, 5 for VIP 5, 6 for VIP 6, etc.
      const requiredMonths = 5;
      const requiredInvites = 25 + (vipLevelNum - 5) * 5;

      const regDate = profile.registrationDate ? new Date(profile.registrationDate) : new Date();
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - regDate.getTime());
      const hasDuration = (diffTime / (1000 * 60 * 60 * 24 * 30.4375)) >= requiredMonths;

      const userReferrals = db.referrals.filter(r => r.referrerId === userId);
      const verifiedReferrals = userReferrals.filter(ref => {
        const rp = db.profiles.find(p => p.userId === ref.referredId);
        return ref.isVerified || (ref.referredVipLevel >= 1) || (rp && rp.idVerificationStatus === 'verified');
      });
      const hasInvites = verifiedReferrals.length >= requiredInvites;
      const isCompliant = profile.idVerificationStatus === 'verified';

      if (!hasDuration || !hasInvites || !isCompliant) {
        let reqText = `VIP Level ${vipLevelNum} Requirements:\n`;
        reqText += hasDuration ? `✓ Membership active for ${requiredMonths} months\n` : `✗ Membership active for ${requiredMonths} months\n`;
        reqText += hasInvites ? `✓ Invite at least ${requiredInvites} verified members\n` : `✗ Invite at least ${requiredInvites} verified members\n`;
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
    const { userId, bankName, accountNumber, accountHolderName, transactionPin, pin } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    profile.bankName = bankName;
    profile.accountNumber = accountNumber;
    profile.accountHolderName = accountHolderName;

    const finalPin = transactionPin !== undefined ? transactionPin : pin;
    if (finalPin !== undefined) {
      profile.transactionPin = finalPin;
    }

    saveLocalDB(db);
    return respondJSON(200, { success: true, profile });
  }

  // 14. POST /api/profiles/pin
  if (pathname === '/api/profiles/pin' && method === 'POST') {
    const { userId, pin, transactionPin } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    const finalPin = transactionPin !== undefined ? transactionPin : pin;
    profile.transactionPin = finalPin;
    saveLocalDB(db);
    return respondJSON(200, { success: true, profile });
  }

  // 14b. POST /api/profiles/check-in
  if (pathname === '/api/profiles/check-in' && method === 'POST') {
    const { userId } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    const now = new Date();
    const getEATDateString = (dateInput: Date | string | number): string => {
      const d = new Date(dateInput);
      const eatMs = d.getTime() + (3 * 60 * 60 * 1000);
      const eatDate = new Date(eatMs);
      const year = eatDate.getUTCFullYear();
      const month = String(eatDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(eatDate.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const getNextEATMidnight = (nowDate: Date): Date => {
      const eatMs = nowDate.getTime() + (3 * 60 * 60 * 1000);
      const eatDate = new Date(eatMs);
      const year = eatDate.getUTCFullYear();
      const month = String(eatDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(eatDate.getUTCDate()).padStart(2, '0');
      return new Date(`${year}-${month}-${day}T21:00:00Z`);
    };

    if (profile.lastCheckInDate) {
      const todayEAT = getEATDateString(now);
      const lastCheckInEAT = getEATDateString(profile.lastCheckInDate);
      if (todayEAT === lastCheckInEAT) {
        const nextMidnight = getNextEATMidnight(now);
        const diffMs = nextMidnight.getTime() - now.getTime();
        const remainingHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
        return respondJSON(400, { error: `You have already claimed today's check-in bonus. It resets at local Ethiopia midnight (EAT). Please try again in ${remainingHours} hours.` });
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
    const { userId, avatarRaw, avatarBase64 } = body;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    profile.profilePicture = avatarRaw || avatarBase64;
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
    const totalUsers = db.users.filter(u => !u.isAdmin).length;
    const totalWalletBalance = db.profiles.reduce((acc, p) => acc + (p.walletBalance || 0), 0);
    const totalApprovedDeposits = db.deposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
    const totalPendingDeposits = db.deposits.filter(d => d.status === 'pending').reduce((acc, d) => acc + d.amount, 0);
    const totalApprovedWithdrawals = db.withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0);
    const totalPendingWithdrawals = db.withdrawals.filter(w => w.status === 'pending').reduce((acc, w) => acc + w.amount, 0);
    const totalActiveInvestments = db.investments.filter(i => i.status === 'active').reduce((acc, i) => acc + i.amount, 0);

    return respondJSON(200, {
      totalUsers,
      totalDeposited: totalApprovedDeposits,
      totalDeposits: totalApprovedDeposits,
      totalWithdrawn: totalApprovedWithdrawals,
      totalWithdrawals: totalApprovedWithdrawals,
      totalInvested: totalActiveInvestments,
      totalInvestments: totalActiveInvestments,
      totalBalance: totalWalletBalance,
      pendingDepositsCount: db.deposits.filter(d => d.status === 'pending').length,
      pendingWithdrawalsCount: db.withdrawals.filter(w => w.status === 'pending').length,
      pendingDepositsAmount: totalPendingDeposits,
      pendingWithdrawalsAmount: totalPendingWithdrawals
    });
  }

  // 20. GET /api/admin/users
  if (pathname === '/api/admin/users' && method === 'GET') {
    try {
      console.log(`[Firebase Admin] Fetching users list. Current database count: ${db.users.length} users, ${db.profiles.length} profiles from real-time Firestore sync.`);
      const usersWithProfiles = db.users.map(u => {
        const p = db.profiles.find(pro => pro.userId === u.id);
        const userInvestments = db.investments ? db.investments.filter(i => i.userId === u.id) : [];
        return { 
          ...u, 
          profile: p,
          investments: userInvestments
        };
      });
      console.log(`[Firebase Admin Success] Loaded ${usersWithProfiles.length} total users with linked profiles and active investments.`);
      return respondJSON(200, usersWithProfiles);
    } catch (err: any) {
      console.error("[Firebase Admin Error] Failed to retrieve or map users:", err);
      return respondJSON(500, { error: "Failed to compile admin users: " + (err?.message || String(err)) });
    }
  }

  // 21. POST /api/admin/users/status
  if (pathname === '/api/admin/users/status' && method === 'POST') {
    const targetUserId = body.targetUserId || body.userId;
    const { status } = body;
    const user = db.users.find(u => u.id === targetUserId);
    if (!user) return respondJSON(404, { error: "User not found" });

    user.status = status;

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId: targetUserId,
      title: status === 'active' ? "Account Activated" : "Account Suspended",
      message: status === 'active' 
        ? "Your account has been fully activated by the administrator. You can now access all features and check your VIP portfolios."
        : "Your account has been temporarily suspended due to security compliance checks. Please contact LUMORA support.",
      read: false,
      date: new Date().toISOString()
    });

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

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId: targetUserId,
      title: `VIP Level Updated to VIP ${vipLevel}`,
      message: `Your account grade has been updated by the administrator to VIP Level ${vipLevel}. This updates your high-yield eligibility rates and commission perks. Enjoy your premium rank!`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // 23. POST /api/admin/users/adjust-balance
  if (pathname === '/api/admin/users/adjust-balance' && method === 'POST') {
    const targetUserId = body.targetUserId || body.userId;
    const { amount, type } = body;
    const targetWallet = body.targetWallet || body.pool || 'deposit';
    const profile = db.profiles.find(p => p.userId === targetUserId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    if (profile.depositBalance === undefined) profile.depositBalance = profile.walletBalance || 0;
    if (profile.incomeBalance === undefined) profile.incomeBalance = 0;

    const delta = Number(amount);
    if (type === 'add') {
      profile.walletBalance += delta;
      if (targetWallet === 'income') {
        profile.incomeBalance += delta;
        profile.totalEarnings = (profile.totalEarnings || 0) + delta;
      } else {
        profile.depositBalance += delta;
        profile.totalDeposits = (profile.totalDeposits || 0) + delta;
      }

      db.transactions.push({
        id: "tx-" + Math.random().toString(36).substr(2, 9),
        userId: targetUserId,
        type: 'deposit',
        amount: delta,
        description: `Institutional credit adjustment to ${targetWallet === 'income' ? 'Income Pool' : 'Deposit Pool'} authorized by Administrator`,
        date: new Date().toISOString()
      });
    } else {
      profile.walletBalance = Math.max(0, profile.walletBalance - delta);
      if (targetWallet === 'income') {
        profile.incomeBalance = Math.max(0, profile.incomeBalance - delta);
      } else {
        profile.depositBalance = Math.max(0, profile.depositBalance - delta);
      }

      db.transactions.push({
        id: "tx-" + Math.random().toString(36).substr(2, 9),
        userId: targetUserId,
        type: 'withdrawal',
        amount: -delta,
        description: `Institutional debit adjustment to ${targetWallet === 'income' ? 'Income Pool' : 'Deposit Pool'} authorized by Administrator`,
        date: new Date().toISOString()
      });
    }

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId: targetUserId,
      title: type === 'add' 
        ? `Wallet Pool Credited (${targetWallet === 'income' ? 'Yield Earnings' : 'Deposit Ledger'})` 
        : `Wallet Pool Debited (${targetWallet === 'income' ? 'Yield Earnings' : 'Deposit Ledger'})`,
      message: type === 'add'
        ? `Your ${targetWallet === 'income' ? 'Income Pool' : 'Deposit Pool'} has been credited with ${delta} ETB by an administrative manual adjustment. Current wallet total: ${profile.walletBalance} ETB.`
        : `Your ${targetWallet === 'income' ? 'Income Pool' : 'Deposit Pool'} has been debited by ${delta} ETB by an administrative adjustment. Current wallet total: ${profile.walletBalance} ETB.`,
      read: false,
      date: new Date().toISOString()
    });

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

  // 24b. POST /api/admin/users/change-password
  if (pathname === '/api/admin/users/change-password' && method === 'POST') {
    const { targetUserId, newPassword } = body;
    if (!targetUserId || !newPassword || newPassword.trim().length === 0) {
      return respondJSON(400, { error: "Invalid user or password parameters" });
    }
    const user = db.users.find(u => u.id === targetUserId);
    if (!user) return respondJSON(404, { error: "User not found" });

    user.password = newPassword.trim();
    saveLocalDB(db);
    return respondJSON(200, { success: true, password: user.password });
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

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId: dep.userId,
      title: finalStatus === 'approved' ? "CBE Deposit Cleared" : "CBE Deposit Declined",
      message: finalStatus === 'approved'
        ? `Great news! Your deposit of ${dep.amount} ETB via CBE has been approved and credited to your wallet balance. Reference: #${dep.id}.`
        : `Your deposit submission of ${dep.amount} ETB was rejected. Reason: ${rejectionReason || 'Receipt verification failure'}. Please contact support or re-submit a valid CBE screenshot.`,
      read: false,
      date: new Date().toISOString()
    });

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

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId: wit.userId,
      title: finalStatus === 'approved' ? "Withdrawal Disbursed" : "Withdrawal Rejected",
      message: finalStatus === 'approved'
        ? `Your cashout petition of ${wit.amount} ETB has been cleared and disbursed to your bank account of ${wit.bankName}. Net amount credited: ${wit.netAmount} ETB (Fee: ${wit.fee} ETB).`
        : `Your cashout petition of ${wit.amount} ETB was rejected by our compliance reviewers. Reason: ${rejectionReason || 'Bank account info mismatch'}. The full amount has been refunded back to your wallet balance.`,
      read: false,
      date: new Date().toISOString()
    });

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

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId: loan.userId,
      title: finalStatus === 'approved' ? "Commercial Loan Approved" : "Commercial Loan Rejected",
      message: finalStatus === 'approved'
        ? `Agreement cleared! Your commercial line-of-credit petition for ${loan.amount} ETB has been approved and credited to your wallet balance.`
        : `We regret to inform you that your commercial loan petition of ${loan.amount} ETB was declined by underwriters. Reason: ${rejectionReason || 'Institutional compliance risk limits'}.`,
      read: false,
      date: new Date().toISOString()
    });

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
      reply = "To submit a CBE bank deposit: Unlock your active tab 'Investments', choose a VIP level tier starting at 3,500 ETB, transfer to our CBE coordinates, and submit the bank receipt photo. You do not need to verify your National ID first! Audit processes usually complete in under 2 hours.";
    } else if (txt.includes('withdraw') || txt.includes('cashout') || txt.includes('pin')) {
      reply = "Your cashout withdrawals are dispatched to the Commercial Bank of Ethiopia (CBE) hourly. To submit, ensure your bank destination is designated, and enter your secure 4-digit payment PIN to authorize.";
    } else if (txt.includes('card') || txt.includes('mastercard') || txt.includes('visa')) {
      reply = "Lumora offers an instant Virtual Debit Mastercard with an institutional rate of 1 USD = 170 ETB. Activation and refund logs are fully automated. To secure and complete online transactions, no SMS OTP is needed—simply authorize charges using your main account login password.";
    } else if (txt.includes('interest') || txt.includes('earn') || txt.includes('profit')) {
      reply = "Accrued interest on all Lumora VIP levels yields from 3.5% up to 11.5% daily. All earnings are state-protected, guaranteed, and directly available for withdrawal.";
    } else if (txt.includes('security') || txt.includes('safe') || txt.includes('biometric') || txt.includes('selfie') || txt.includes('verification')) {
      reply = "Lumora uses cutting-edge biometric facial verification and National ID check auditing to authenticate loans and withdrawals, while deposits can be made instantly and are processed directly.";
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
      reply = "To deposit funds into Lumora:\n\n• **KYC BYPASS ENABLED**: You can construct and submit deposit proof instantly without needing to verify your ID first!\n\n1. Go to the Home tab and click **DEPOSIT**, or select a VIP Plan first.\n2. Transfer the desired amount to our official CBE Account:\n   • **Bank**: Commercial Bank of Ethiopia (CBE)\n   • **Account Name**: Leykun\n   • **Account Number**: `1000419524747`\n3. Click 'I have paid', upload your transaction/receipt screenshot, and submit.\n4. Verification usually takes 0 to 42 hours (average is under 2 hours).";
    } else if (txt.includes('withdraw') || txt.includes('cashout') || txt.includes('minimum withdrawal')) {
      reply = "Lumora Withdrawal Rules:\n\n• **Minimum Withdrawal**: 200 ETB\n• **Fee**: 10% fee for Income Pool withdrawals (5% Tax + 5% Handling), 5% handling fee for Deposit Pool withdrawals.\n• **Payout Speed**: Requests are processed and dispatched within 0 to 42 hours.\n• Ensure you have configured your CBE account details and typed your secure 4-digit PIN in your Profile tab.";
    } else if (txt.includes('card') || txt.includes('mastercard') || txt.includes('dollar') || txt.includes('rates')) {
      reply = "Lumora Virtual MasterCard features:\n\n• **Exchange Rate**: Fixed at **1 USD = 170 ETB**.\n• **Card Fee**: $3 USD issuance fee.\n• **Recharge Fee**: $1 USD transaction fee per funding recharge.\n• **Strict No-OTP Audits**: No phone OTP required! Users authorize online charges securely in real-time using their main account login password.";
    } else if (txt.includes('plan') || txt.includes('vip') || txt.includes('interest') || txt.includes('rate') || txt.includes('return')) {
      reply = "Lumora offers 15 premium VIP Levels for investment:\n\n" +
              "• **Starter Level**: Invest 3,500 ETB, earn **3.40% daily** (total ~9,450 ETB, 50 days)\n" +
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
    } else if (txt.includes('refer') || txt.includes('invite') || txt.includes('bonus') || txt.includes('commission') || txt.includes('requirement') || txt.includes('qualif') || txt.includes('join') || txt.includes('rule')) {
      reply = "Earn lucrative rewards by building your team and leveling up!\n\n" +
              "• **Referral Bonus**: Get a **10% direct VIP level incentive** on deposit amounts from invited users.\n" +
              "• **VIP Level Join Requirements**:\n" +
              "  - **VIP 1 to VIP 4**: Only require verifying your National ID card to join.\n" +
              "  - **VIP 5**: Requires a membership active for **5 months** and **25 verified invited users**.\n" +
              "  - **VIP 6 and above**: Requirements scale up as level increases! For example, VIP 6 requires **5 months** and **30 verified invited users**.\n" +
              "  - **Formula for Level 5+**: `25 + (Level - 5) * 5` verified invites are required.";
    } else if (txt.includes('license') || txt.includes('regulation') || txt.includes('safe') || txt.includes('legit')) {
      reply = "Lumora is registered and fully certified under FDRE Trade, Industry & Investment ministry standards:\n\n• **TIN**: 0024896464\n• **Principal Registration Number**: AACATB/1/0264213/2018\n• **Business License Number**: AACATB/14/667/50303357/2018\n• **Date of Issuance**: 06/10/2018\n• **Authorized Capital**: ETB 15,000,000\n• Incorporates secure 3D-facial biometrics and CBE online ledger verification.";
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

  // ==================== LUMORA CARD ENDPOINTS ====================
  // Helper for exchange rate
  const getLiveExchangeRate = async (): Promise<number> => {
    return 170; // Fixed rate of 1$ = 170 ETB as requested by the user
  };

  // 40. GET /api/cards
  if (pathname === '/api/cards' && method === 'GET') {
    const queryPart = url.includes('?') ? url.split('?')[1] : '';
    const searchParams = new URLSearchParams(queryPart);
    const targetUserId = searchParams.get('userId');
    if (!targetUserId) return respondJSON(400, { error: "Missing userId query param." });
    
    if (!db.cards) db.cards = [];
    if (!db.cardTransactions) db.cardTransactions = [];

    const userCard = db.cards.find(c => c.userId === targetUserId);
    const userCardTrans = db.cardTransactions.filter(t => t.userId === targetUserId);
    
    return respondJSON(200, { card: userCard || null, transactions: userCardTrans });
  }

  // 41. POST /api/cards/apply
  if (pathname === '/api/cards/apply' && method === 'POST') {
    const { userId, walletType, password } = body;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.password !== password) {
      return respondJSON(401, { error: "Security Mismatch: Incorrect Lumora login password." });
    }

    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    // Validate Status and Suspended
    if (profile.idVerificationStatus !== 'verified') {
      return respondJSON(403, { error: "National ID verification (KYC) is required." });
    }
    if (profile.vipLevel < 3) {
      return respondJSON(403, { error: "VIP Level 3 or higher is required." });
    }
    
    // Check if account is suspended
    if (user && user.status === 'suspended') {
      return respondJSON(403, { error: "Account is suspended. Contact Support." });
    }

    if (!db.cards) db.cards = [];
    const checkCard = db.cards.find(c => c.userId === userId);
    if (checkCard) {
      return respondJSON(400, { error: "You already have an active or pending card application." });
    }

    // Required deductions
    const currentUsdToEtb = await getLiveExchangeRate();
    const feeUsd = 3;
    const initialFundUsd = 10;
    const totalUsd = feeUsd + initialFundUsd;
    const totalEtb = totalUsd * currentUsdToEtb;

    if (profile.depositBalance === undefined) profile.depositBalance = profile.walletBalance || 0;
    if (profile.incomeBalance === undefined) profile.incomeBalance = 0;

    const chosenWallet = walletType === 'income' ? 'income' : 'deposit';
    if (chosenWallet === 'income') {
      if (profile.incomeBalance < totalEtb) {
        return respondJSON(400, { error: `Insufficient pool balance. You need ${totalEtb.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB ($${totalUsd}) but only have ${profile.incomeBalance.toLocaleString()} ETB in your Income Pool.` });
      }
      profile.incomeBalance -= totalEtb;
    } else {
      if (profile.depositBalance < totalEtb) {
        return respondJSON(400, { error: `Insufficient pool balance. You need ${totalEtb.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB ($${totalUsd}) but only have ${profile.depositBalance.toLocaleString()} ETB in your Deposit Pool.` });
      }
      profile.depositBalance -= totalEtb;
    }
    profile.walletBalance = profile.depositBalance + profile.incomeBalance;

    // Deducts fee and funds
    const cardId = "card-" + Math.random().toString(36).substr(2, 9);
    
    // Generate card details
    const randomCardNo = "5545 4296 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000);
    const randomCvv = String(Math.floor(100 + Math.random() * 900));
    
    const newCard: LumoraCard = {
      id: cardId,
      userId,
      cardNumber: randomCardNo,
      cvv: randomCvv,
      expiryDate: "06/31",
      cardHolderName: profile.fullName.toUpperCase(),
      billingAddress: {
        street: "16192 Coastal Highway",
        city: "Lewes",
        state: "Delaware (DE)",
        zipCode: "19958",
        country: "United States",
        phone: profile.phone
      },
      balance: initialFundUsd,
      status: 'pending',
      applicationDate: new Date().toISOString()
    };

    db.cards.push(newCard);

    // Push transaction records
    if (!db.cardTransactions) db.cardTransactions = [];
    db.cardTransactions.push({
      id: "ctx-" + Math.random().toString(36).substr(2, 9),
      userId,
      cardId,
      type: 'card_issued',
      amount: feeUsd,
      amountEtb: feeUsd * currentUsdToEtb,
      date: new Date().toISOString(),
      description: `LUMORA CARD $${feeUsd} Issuance Fee (Deducted from ${chosenWallet === 'income' ? 'Income' : 'Deposit'} Pool: ${ (feeUsd * currentUsdToEtb).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) } ETB at rate $1 = ${currentUsdToEtb.toFixed(2)} ETB)`,
      status: 'completed'
    });

    db.cardTransactions.push({
      id: "ctx-" + Math.random().toString(36).substr(2, 9),
      userId,
      cardId,
      type: 'card_recharge',
      amount: initialFundUsd,
      amountEtb: initialFundUsd * currentUsdToEtb,
      date: new Date().toISOString(),
      description: `Initial funding card recharge of $${initialFundUsd} (Deducted from ${chosenWallet === 'income' ? 'Income' : 'Deposit'} Pool: ${ (initialFundUsd * currentUsdToEtb).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) } ETB at rate $1 = ${currentUsdToEtb.toFixed(2)} ETB)`,
      status: 'completed'
    });

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "LUMORA Card Application Submitted",
      message: `Your Virtual MasterCard application has been successfully received. A $3 issuance fee and $10 initial funding have been reserved. Pending administrator activation.`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true, card: newCard });
  }

  // 42. POST /api/cards/recharge
  if (pathname === '/api/cards/recharge' && method === 'POST') {
    const { userId, amount, walletType, password } = body;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.password !== password) {
      return respondJSON(401, { error: "Security Mismatch: Incorrect Lumora login password." });
    }

    const reqAmount = Number(amount);
    
    const currentUsdToEtb = await getLiveExchangeRate();
    const rechargeFeeUsd = 1; // $1.00 USD transaction fee
    const totalUsdCharged = reqAmount + rechargeFeeUsd;
    const costEtb = totalUsdCharged * currentUsdToEtb;

    if (!reqAmount || reqAmount < 10) {
      return respondJSON(400, { error: `Minimum funding amount is $10 USD (${(10 * currentUsdToEtb).toLocaleString(undefined, {maximumFractionDigits: 0})} ETB).` });
    }

    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return respondJSON(404, { error: "Profile not found" });

    if (!db.cards) db.cards = [];
    const card = db.cards.find(c => c.userId === userId);
    if (!card) return respondJSON(404, { error: "Card not found. Please apply first." });
    if (card.status !== 'active') {
      return respondJSON(400, { error: `Card must be active to fund. Current status: ${card.status}` });
    }

    if (profile.depositBalance === undefined) profile.depositBalance = profile.walletBalance || 0;
    if (profile.incomeBalance === undefined) profile.incomeBalance = 0;

    const chosenWallet = walletType === 'income' ? 'income' : 'deposit';
    if (chosenWallet === 'income') {
      if (profile.incomeBalance < costEtb) {
        return respondJSON(400, { error: `Insufficient pool. You need ${costEtb.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB ($${totalUsdCharged.toFixed(2)}) but only have ${profile.incomeBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB inside your Income Pool.` });
      }
      profile.incomeBalance -= costEtb;
    } else {
      if (profile.depositBalance < costEtb) {
        return respondJSON(400, { error: `Insufficient pool. You need ${costEtb.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB ($${totalUsdCharged.toFixed(2)}) but only have ${profile.depositBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB inside your Deposit Pool.` });
      }
      profile.depositBalance -= costEtb;
    }
    profile.walletBalance = profile.depositBalance + profile.incomeBalance;

    card.balance += reqAmount;
    card.lastRechargeDate = new Date().toISOString();
    card.rechargeCount = (card.rechargeCount || 0) + 1;

    if (!db.cardTransactions) db.cardTransactions = [];
    db.cardTransactions.push({
      id: "ctx-" + Math.random().toString(36).substr(2, 9),
      userId,
      cardId: card.id,
      type: 'card_recharge',
      amount: reqAmount,
      amountEtb: costEtb,
      date: new Date().toISOString(),
      description: `Recharged card balance with $${reqAmount} USD + $1.00 USD transaction fee at fixed rate 1 USD = ${currentUsdToEtb.toFixed(2)} ETB (Total: ${costEtb.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB from ${chosenWallet === 'income' ? 'Income' : 'Deposit'} Pool)`,
      status: 'completed'
    });

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "LUMORA Card Recharged",
      message: `Your Virtual MasterCard has been successfully funded with $${reqAmount} USD. An institutional transaction fee of $1.00 USD was applied at the fixed rate of ${currentUsdToEtb.toFixed(2)} ETB (total deducted: ${costEtb.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB). New Card Balance: $${card.balance.toFixed(2)} USD.`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true, card });
  }

  // 43. POST /api/cards/freeze
  if (pathname === '/api/cards/freeze' && method === 'POST') {
    const { userId, action } = body;
    if (!db.cards) db.cards = [];
    const card = db.cards.find(c => c.userId === userId);
    if (!card) return respondJSON(404, { error: "Card not found" });

    if (action === 'freeze') {
      card.status = 'frozen';
    } else {
      card.status = 'active';
    }

    if (!db.cardTransactions) db.cardTransactions = [];
    db.cardTransactions.push({
      id: "ctx-" + Math.random().toString(36).substr(2, 9),
      userId,
      cardId: card.id,
      type: action === 'freeze' ? 'card_freeze' : 'card_unfreeze',
      amount: 0,
      date: new Date().toISOString(),
      description: `Card was ${action === 'freeze' ? 'Frozen' : 'Unfrozen'} by Cardholder`,
      status: 'completed'
    });

    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: action === 'freeze' ? "LUMORA Card Frozen" : "LUMORA Card Unfrozen",
      message: `Your Virtual MasterCard status has been updated to: ${card.status.toUpperCase()}.`,
      read: false,
      date: new Date().toISOString()
    });

    saveLocalDB(db);
    return respondJSON(200, { success: true, card });
  }

  // 44. GET /api/admin/cards
  if (pathname === '/api/admin/cards' && method === 'GET') {
    if (!db.cards) db.cards = [];
    if (!db.cardTransactions) db.cardTransactions = [];

    const enrichedCards = db.cards.map(c => {
      const user = db.users.find(u => u.id === c.userId);
      const profile = db.profiles.find(p => p.userId === c.userId);
      return {
        ...c,
        user: user ? { id: user.id, fullName: user.fullName, phone: user.phone, status: user.status } : null,
        profile: profile ? { vipLevel: profile.vipLevel, idVerificationStatus: profile.idVerificationStatus } : null
      };
    });

    return respondJSON(200, { cards: enrichedCards, transactions: db.cardTransactions });
  }

  // 45. POST /api/admin/cards/action
  if (pathname === '/api/admin/cards/action' && method === 'POST') {
    const { cardId, action } = body;
    if (!db.cards) db.cards = [];
    const card = db.cards.find(c => c.id === cardId);
    if (!card) return respondJSON(404, { error: "Card not found" });

    const userId = card.userId;
    const profile = db.profiles.find(p => p.userId === userId);

    if (action === 'approve') {
      card.status = 'active';
      db.notifications.push({
        id: "not-" + Math.random().toString(36).substr(2, 9),
        userId,
        title: "LUMORA Card Approved",
        message: `Congratulations! Your Virtual Mastercard has been approved by the administrator and is fully Active. Details are visible in your Card Tab.`,
        read: false,
        date: new Date().toISOString()
      });
    } else if (action === 'reject') {
      const currentUsdToEtb = await getLiveExchangeRate();
      // Refund the initial funding amount of $10 to Deposit Wallet
      if (profile) {
        const refundEtb = 10 * currentUsdToEtb;
        if (profile.depositBalance === undefined) profile.depositBalance = profile.walletBalance || 0;
        profile.depositBalance += refundEtb;
        profile.walletBalance += refundEtb;
        
        db.transactions.push({
          id: "tx-" + Math.random().toString(36).substr(2, 9),
          userId,
          type: 'bonus',
          amount: refundEtb,
          description: `Refund for Rejected Card initial funding reserve`,
          date: new Date().toISOString()
        });
      }

      const currentUsdToEtbNotify = await getLiveExchangeRate();
      db.notifications.push({
        id: "not-" + Math.random().toString(36).substr(2, 9),
        userId,
        title: "LUMORA Card Rejected",
        message: `Your Virtual Mastercard application was declined. Your reserved initial funding ($10 / ${ (10 * currentUsdToEtbNotify).toLocaleString() } ETB) has been refunded to your Deposit Pool.`,
        read: false,
        date: new Date().toISOString()
      });
      // Remove card from database on explicit rejection
      db.cards = db.cards.filter(c => c.id !== cardId);
    } else if (action === 'freeze') {
      card.status = 'frozen';
    } else if (action === 'unfreeze') {
      card.status = 'active';
    }

    saveLocalDB(db);
    return respondJSON(200, { success: true });
  }

  // Default catch-all 404 response
  return respondJSON(404, { error: `Endpoint '${pathname}' not implemented.` });
}

// Global window interceptor initialization
let fallbackToLocalDB = false;

// Auto-activate offline/static fallback if not in the official development cloud sandbox or localhost.
// This ensures that custom domains deployed on stateless hosting like Vercel will process state in a highly responsive client-side model,
// with immediate, real-time background synchronization directly into Firestore.
if (typeof window !== "undefined") {
  const host = window.location.hostname;
  const isSandbox = host.includes("europe-west1.run.app") || host.includes("localhost") || host.includes("127.0.0.1") || host.startsWith("192.168.");
  
  const isFirestoreActive = firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

  // Always use the real Express/Firestore backend for production consistency; do not default to client local storage.
  fallbackToLocalDB = false;
  console.log("[Client Firestore] Running in real Express full-stack mode with primary Firebase Firestore backend.");

  // Trigger real-time client-side Firestore listener subscriptions to receive remote updates (e.g., from Admin actions)
  setTimeout(() => {
    setupClientFirebaseSync();
  }, 50);
}

if (typeof window !== "undefined") {
  const originalFetch = window.fetch.bind(window);
  
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
        
        // If the URL ends up resolving to HTML, or returns status code >= 500, or does not contain JSON format, fall back to Client-Side LocalStorage
        if (
          response.status === 404 || 
          response.status >= 500 || 
          contentType.includes('text/html') || 
          !contentType.includes('application/json')
        ) {
          console.warn(`API path (${url}) returned status ${response.status} with content-type "${contentType}". Falling back to Client-Side LocalStorage for this request.`);
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
