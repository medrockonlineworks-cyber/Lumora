import { GoogleGenAI } from "@google/genai";
import express from "express";
import fs from "fs";
import path from "path";
import { 
  User, Profile, Investment, Deposit, Withdrawal, 
  MyTransaction, Notification, Referral, ChatMessage, Agreement, AppSettings, Loan, EligibilityCheck
} from "./src/types";

// Initialize Firebase Admin SDK
import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

let firestoreDb: Firestore | null = null;
let firestoreSyncDisabled = false;

function getFirestoreDb(): Firestore | null {
  if (firestoreSyncDisabled) return null;
  if (firestoreDb) return firestoreDb;
  try {
    let firebaseApp: App;
    const apps = getApps();
    if (apps.length > 0) {
      firebaseApp = apps[0]!;
    } else {
      firebaseApp = initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (err) {
    console.error("Firebase Admin SDK failed to initialize:", err);
  }
  return firestoreDb;
}

async function testFirestoreConnectivity(): Promise<boolean> {
  if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID" || !firebaseConfig.firestoreDatabaseId) {
    console.log("Firestore projectId or DatabaseID is unconfigured in firebase-applet-config.json. Cloud sync is inactive.");
    return false;
  }
  const fDb = getFirestoreDb();
  if (!fDb) return false;
  try {
    // Perform a fast, non-mutating single-document probe read on "settings/global"
    await fDb.collection("settings").doc("global").get();
    return true;
  } catch (err: any) {
    if (err && err.message && err.message.includes("PERMISSION_DENIED")) {
      console.warn("Firestore connectivity check returned PERMISSION_DENIED. This is expected in container sandboxes due to cross-project GCP IAM constraints. Gracefully falling back to local file storage.");
    } else {
      console.warn("Firestore connectivity check failed with error:", err.message);
    }
    return false;
  }
}

// Database storage location
const DB_PATH = path.join(process.cwd(), "lumora_db.json");

// Define custom database interface
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
  eligibilityChecks?: EligibilityCheck[];
}

// Global default settings
const DEFAULT_SETTINGS: AppSettings = {
  id: "global",
  cbeAccountName: "Leykun",
  cbeAccountNumber: "1000419524747",
  referralBonusPercentage: 10,
  productionInviteUrl: "",
};

// Seed 15 VIP investment plans
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

// Helper to load or initialize DB
function loadDB(): LumoraDB {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      const db = JSON.parse(data) as LumoraDB;
      if (!db.loans) {
        db.loans = [];
      }
      if (!db.eligibilityChecks) {
        db.eligibilityChecks = [];
      }
      let dbUpdated = false;
      if (db.users) {
        const alemExists = db.users.some(u => u.phone === "0926193920" || u.id === "user-0kw1ojisk");
        if (!alemExists) {
          db.users.push({
            id: "user-0kw1ojisk",
            fullName: "Alem",
            phone: "0926193920",
            email: "leykunjemaneh3@gmail.com",
            password: "000000",
            isAdmin: true,
            status: "active",
            registrationDate: new Date().toISOString(),
            referralCode: "LUMOTU23"
          });
          dbUpdated = true;
        }

        db.users.forEach(user => {
          if (user.phone === "0926193920") {
            if (!user.isAdmin) {
              user.isAdmin = true;
              dbUpdated = true;
            }
            if (user.password !== "000000" && !user.password) {
              user.password = "000000";
              dbUpdated = true;
            }
          }
          if (!user.password) {
            user.password = "123456";
            dbUpdated = true;
          }
          if (!user.email) {
            user.email = user.phone + "@lumora.net";
            dbUpdated = true;
          }
        });
      }
      if (db.profiles) {
        const alemProfileExists = db.profiles.some(p => p.phone === "0926193920" || p.userId === "user-0kw1ojisk");
        if (!alemProfileExists) {
          db.profiles.push({
            userId: "user-0kw1ojisk",
            fullName: "Alem",
            phone: "0926193920",
            email: "leykunjemaneh3@gmail.com",
            vipLevel: 0,
            walletBalance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalInvestments: 0,
            totalEarnings: 0,
            referralCode: "LUMOTU23",
            teamSize: 0,
            registrationDate: new Date().toISOString(),
            idCardFront: "",
            idCardBack: "",
            idVerificationStatus: "unsubmitted",
            bankName: "Commercial Bank of Ethiopia (CBE)",
            accountNumber: "10006806648721",
            accountHolderName: "Alem",
            transactionPin: "4321",
            idSelfie: ""
          });
          dbUpdated = true;
        }

        db.profiles.forEach(p => {
          if (p.phone === "0926193920") {
            if (p.userId !== "user-0kw1ojisk") {
              p.userId = "user-0kw1ojisk";
              dbUpdated = true;
            }
          }
          if (!p.idVerificationStatus) {
            p.idVerificationStatus = "verified";
            p.idCardFront = "";
            p.idCardBack = "";
            p.idSelfie = "";
            dbUpdated = true;
          }
          if (p.idSelfie === undefined) {
            p.idSelfie = "";
            dbUpdated = true;
          }
          // Only auto-initialize default credentials for the main administrative user, but do NOT auto-fill for others!
          if (p.userId === "user-0kw1ojisk") {
            if (!p.transactionPin) {
              p.transactionPin = "4321";
              dbUpdated = true;
            }
            if (!p.bankName) {
              p.bankName = "Commercial Bank of Ethiopia (CBE)";
              dbUpdated = true;
            }
            if (!p.accountNumber) {
              p.accountNumber = "10006806648721";
              dbUpdated = true;
            }
            if (!p.accountHolderName) {
              p.accountHolderName = "Alem";
              dbUpdated = true;
            }
          } else {
            // Ensure properties are defined but empty if not set, so they can add their own
            if (p.transactionPin === undefined) p.transactionPin = "";
            if (p.bankName === undefined) p.bankName = "";
            if (p.accountNumber === undefined) p.accountNumber = "";
            if (p.accountHolderName === undefined) p.accountHolderName = "";
          }
        });
      }

      // Overwrite agreements to enforce new real-time sync & Security/Protection Act updates live in active database
      db.agreements = [
        {
          id: "terms-and-conditions",
          title: "Terms and Conditions",
          category: "terms",
          uploadedAt: "2026-06-03T12:00:00Z",
          content: `### Terms and Conditions

Welcome to LUMORA. Please review our revised platform guidelines:

1. **User Identity & Bank Registration**: To maintain compliance with financial frameworks in Ethiopia, user registration does not auto-populate default credentials. Users must designate their own legitimate Commercial Bank of Ethiopia (CBE) bank details and configure a secure 4-digit payment PIN to authorize active withdrawals.
2. **Unified Financial Limits**: A minimum transaction threshold of 5,000 ETB for CBE deposit submissions and 600 ETB for cashouts is enforced to ensure efficient processing and settlement.
3. **Real-Time Ledger Integration**: All balance adjustments, VIP level elevations, deposits, and cashouts synchronize in real-time under a 3-second secure consensus. All transfers are manually audited on the admin portal.
4. **Security & Identity Validation**: To authorize active cashouts and access micro-loans, users must verify their profile by uploading clean photos of both sides of their National ID cards.`
        },
        {
          id: "investment-policies",
          title: "Investment Policies & Rules",
          category: "policies",
          uploadedAt: "2026-06-03T12:00:00Z",
          content: `### Investment Policies & Rules

Platform micro-finance structural rules in detail:

1. **High-Yield Plan Activation**: Investment plans are activated immediately upon balance confirmation (Min 5,000 ETB), automatically starting synced daily yields spanning VIP levels. Interest cycles schedule payouts every 24 hours.
2. **CBE Transfer and Auditing**: Deposits are routed directly to the treasury audit desk via CBE app screenshots. Administrators evaluate submissions, and credits reflect live on user dashboards in under 2 hours.
3. **Cashout Settlements**: Users cash out using secure designated accounts. Approved cashouts are dispersed within 2 to 6 hours to prevent settlement issues and ensure sustainable liquidity.`
        },
        {
          id: "risk-disclosure",
          title: "About Us",
          category: "about",
          uploadedAt: "2026-06-03T12:00:00Z",
          content: `### About Us & How Lumora Works

**Welcome to Lumora** – Ethiopia's premier peer-to-peer automated micro-finance and high-yield liquidity channel.

We connect local commerce and infrastructure project liquidity pools directly to user micro-investments, facilitating high-yield, stable growth with institutional accuracy.

#### How It Works:

1. **Deposit Micro-Capital**: Copy our official Commercial Bank of Ethiopia (CBE) account number from the Deposit Dialog. Transfer your starting capital (minimum 5,000 ETB) from your CBE Birr App, note down your reference code, and capture a clear screenshot of the receipt.
2. **Submit Proof**: Enter your deposited amount, paste the CBE reference code, upload your receipt screenshot, and submit. The administrators will audit and credit your account within 2 hours.
3. **Activate High-Yield Plans**: Invest your wallet balance into VIP tiers ranging from VIP 0 to VIP 15. Your plan activates immediately, compounding interest payouts every 24 hours.
4. **Secure Dynamic Cashouts**: Navigate to the Cashout menu. First, configure your personal phone number, active Ethiopian bank card details, and a secret 4-digit transaction PIN. Authorize cashouts (minimum 600 ETB) safely using this PIN.
5. **Identity Integrity**: Verify your account by uploading photos of both sides of your National ID. This unlocks access to VIP active withdrawals and institutional loan options.`
        }
      ];
      dbUpdated = true;

      if (!db.settings) {
        db.settings = { ...DEFAULT_SETTINGS };
        dbUpdated = true;
      } else if (db.settings.cbeAccountNumber === "1000456123985" || db.settings.cbeAccountName === "LUMORA Financial Group") {
        db.settings.cbeAccountNumber = "1000419524747";
        db.settings.cbeAccountName = "Leykun";
        dbUpdated = true;
      }

      if (dbUpdated) {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
      }
      return db;
    } catch (e) {
      console.error("Error reading database. Re-initializing...", e);
      try {
        fs.unlinkSync(DB_PATH);
      } catch {}
    }
  }

  // Initialize DB with beautiful seed values
  const systemUserId = "admin-sys-001";
  const user1Id = "user-demo-001";

  const initialDB: LumoraDB = {
    users: [
      {
        id: systemUserId,
        fullName: "System Admin",
        phone: "0900000000",
        isAdmin: true,
        status: "active",
        registrationDate: new Date().toISOString(),
        referralCode: "LUMADMIN",
      },
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
        userId: systemUserId,
        fullName: "System Admin",
        phone: "0900000000",
        vipLevel: 15,
        walletBalance: 20000000.00,
        totalDeposits: 20000000.00,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalEarnings: 0,
        referralCode: "LUMADMIN",
        teamSize: 1,
        registrationDate: new Date().toISOString(),
        transactionPin: "1234"
      },
      {
        userId: "user-0kw1ojisk",
        fullName: "Alem",
        phone: "0926193920",
        email: "leykunjemaneh3@gmail.com",
        vipLevel: 0,
        walletBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalEarnings: 0,
        referralCode: "LUMOTU23",
        teamSize: 0,
        registrationDate: new Date().toISOString(),
        idCardFront: "",
        idCardBack: "",
        idVerificationStatus: "unsubmitted",
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "10006806648721",
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
    agreements: [
      {
        id: "terms-and-conditions",
        title: "Terms and Conditions",
        category: "terms",
        uploadedAt: "2026-06-03T12:00:00Z",
        content: `### Terms and Conditions

Welcome to LUMORA. Please review our revised platform guidelines:

1. **User Identity & Bank Registration**: To maintain compliance with financial frameworks in Ethiopia, user registration does not auto-populate default credentials. Users must designate their own legitimate Commercial Bank of Ethiopia (CBE) bank details and configure a secure 4-digit payment PIN to authorize active withdrawals.
2. **Unified Financial Limits**: A minimum transaction threshold of 5,000 ETB for CBE deposit submissions and 600 ETB for cashouts is enforced to ensure efficient processing and settlement.
3. **Real-Time Ledger Integration**: All balance adjustments, VIP level elevations, deposits, and cashouts synchronize in real-time under a 3-second secure consensus. All transfers are manually audited on the admin portal.
4. **Security & Identity Validation**: To authorize active cashouts and access micro-loans, users must verify their profile by uploading clean photos of both sides of their National ID cards.`
      },
      {
        id: "investment-policies",
        title: "Investment Policies & Rules",
        category: "policies",
        uploadedAt: "2026-06-03T12:00:00Z",
        content: `### Investment Policies & Rules

Platform micro-finance structural rules in detail:

1. **High-Yield Plan Activation**: Investment plans are activated immediately upon balance confirmation (Min 5,000 ETB), automatically starting synced daily yields spanning VIP levels. Interest cycles schedule payouts every 24 hours.
2. **CBE Transfer and Auditing**: Deposits are routed directly to the treasury audit desk via CBE app screenshots. Administrators evaluate submissions, and credits reflect live on user dashboards in under 2 hours.
3. **Cashout Settlements**: Users cash out using secure designated accounts. Approved cashouts are dispersed within 2 to 6 hours to prevent settlement issues and ensure sustainable liquidity.`
      },
      {
        id: "risk-disclosure",
        title: "About Us",
        category: "about",
        uploadedAt: "2026-06-03T12:00:00Z",
        content: `### About Us & How Lumora Works

**Welcome to Lumora** – Ethiopia's premier peer-to-peer automated micro-finance and high-yield liquidity channel.

We connect local commerce and infrastructure project liquidity pools directly to user micro-investments, facilitating high-yield, stable growth with institutional accuracy.

#### How It Works:

1. **Deposit Micro-Capital**: Copy our official Commercial Bank of Ethiopia (CBE) account number from the Deposit Dialog. Transfer your starting capital (minimum 5,000 ETB) from your CBE Birr App, note down your reference code, and capture a clear screenshot of the receipt.
2. **Submit Proof**: Enter your deposited amount, paste the CBE reference code, upload your receipt screenshot, and submit. The administrators will audit and credit your account within 2 hours.
3. **Activate High-Yield Plans**: Invest your wallet balance into VIP tiers ranging from VIP 0 to VIP 15. Your plan activates immediately, compounding interest payouts every 24 hours.
4. **Secure Dynamic Cashouts**: Navigate to the Cashout menu. First, configure your personal phone number, active Ethiopian bank card details, and a secret 4-digit transaction PIN. Authorize cashouts (minimum 600 ETB) safely using this PIN.
5. **Identity Integrity**: Verify your account by uploading photos of both sides of your National ID. This unlocks access to VIP active withdrawals and institutional loan options.`
      }
    ],
    settings: DEFAULT_SETTINGS,
    loans: [],
    eligibilityChecks: []
  };

  saveDB(initialDB);
  return initialDB;
}

// Save database
function saveDB(latestDb: LumoraDB) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(latestDb, null, 2), "utf-8");
  } catch (err) {
    console.error("Local DB backup failed:", err);
  }

  // Push async writes to Firestore in the background
  syncToFirestore(latestDb).catch(err => {
    console.error("Background sync to Firestore failed:", err);
  });
}

// Map for change tracking to optimize writes
const lastSynced: Record<string, Record<string, string>> = {
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
  eligibilityChecks: {},
  chatHistory: {}
};

async function syncToFirestore(latestDb: LumoraDB) {
  if (firestoreSyncDisabled) return;
  const fDb = getFirestoreDb();
  if (!fDb || firestoreSyncDisabled) {
    return;
  }

  const collectionSpecs = [
    { name: "users", array: latestDb.users, key: "id" },
    { name: "profiles", array: latestDb.profiles, key: "userId" },
    { name: "investments", array: latestDb.investments, key: "id" },
    { name: "deposits", array: latestDb.deposits, key: "id" },
    { name: "withdrawals", array: latestDb.withdrawals, key: "id" },
    { name: "transactions", array: latestDb.transactions, key: "id" },
    { name: "notifications", array: latestDb.notifications, key: "id" },
    { name: "referrals", array: latestDb.referrals, key: "id" },
    { name: "agreements", array: latestDb.agreements, key: "id" },
    { name: "loans", array: latestDb.loans, key: "id" },
    { name: "eligibilityChecks", array: latestDb.eligibilityChecks, key: "id" },
  ];

  for (const spec of collectionSpecs) {
    if (firestoreSyncDisabled) return;

    const localMap = new Map<string, any>();
    for (const item of (spec.array || [])) {
      if (item) {
        const id = item[spec.key];
        if (id) {
          localMap.set(id, item);
        }
      }
    }

    // 1. Identify updates & creations
    for (const [id, item] of localMap.entries()) {
      if (firestoreSyncDisabled) return;
      const json = JSON.stringify(item);
      const isDifferent = lastSynced[spec.name][id] !== json;
      if (isDifferent) {
        lastSynced[spec.name][id] = json;
        try {
          await fDb.collection(spec.name).doc(id).set(item);
        } catch (e: any) {
          if (e && e.message && e.message.includes("PERMISSION_DENIED")) {
            console.warn(`Disabling Firestore sync due to PERMISSION_DENIED on ${spec.name}/${id}.`);
            firestoreSyncDisabled = true;
            return;
          }
          console.error(`Error saving ${spec.name}/${id} to Firestore:`, e);
        }
      }
    }

    // 2. Identify deletions
    const lastSyncedKeys = Object.keys(lastSynced[spec.name]);
    for (const id of lastSyncedKeys) {
      if (firestoreSyncDisabled) return;
      if (!localMap.has(id)) {
        delete lastSynced[spec.name][id];
        try {
          await fDb.collection(spec.name).doc(id).delete();
        } catch (e: any) {
          if (e && e.message && e.message.includes("PERMISSION_DENIED")) {
            console.warn(`Disabling Firestore sync due to PERMISSION_DENIED on deletion in ${spec.name}/${id}.`);
            firestoreSyncDisabled = true;
            return;
          }
          console.error(`Error deleting ${spec.name}/${id} from Firestore:`, e);
        }
      }
    }
  }

  // Sync settings
  if (latestDb.settings && !firestoreSyncDisabled) {
    const jsonSettings = JSON.stringify(latestDb.settings);
    if (lastSynced.settings["global"] !== jsonSettings) {
      lastSynced.settings["global"] = jsonSettings;
      try {
        await fDb.collection("settings").doc("global").set(latestDb.settings);
      } catch (e: any) {
        if (e && e.message && e.message.includes("PERMISSION_DENIED")) {
          console.warn("Disabling Firestore sync due to PERMISSION_DENIED on settings.");
          firestoreSyncDisabled = true;
          return;
        }
        console.error("Error saving settings to Firestore:", e);
      }
    }
  }

  // Sync chatHistory
  if (!firestoreSyncDisabled) {
    const activeChatUsers = new Set<string>();
    for (const userId of Object.keys(latestDb.chatHistory || {})) {
      if (firestoreSyncDisabled) return;
      activeChatUsers.add(userId);
      const messages = latestDb.chatHistory[userId] || [];
      const json = JSON.stringify(messages);
      if (lastSynced.chatHistory[userId] !== json) {
        lastSynced.chatHistory[userId] = json;
        try {
          await fDb.collection("chatHistory").doc(userId).set({ messages });
        } catch (e: any) {
          if (e && e.message && e.message.includes("PERMISSION_DENIED")) {
            console.warn(`Disabling Firestore sync due to PERMISSION_DENIED on chatHistory for ${userId}.`);
            firestoreSyncDisabled = true;
            return;
          }
          console.error(`Error saving chatHistory for ${userId} to Firestore:`, e);
        }
      }
    }

    const lastSyncedChatUsers = Object.keys(lastSynced.chatHistory);
    for (const userId of lastSyncedChatUsers) {
      if (firestoreSyncDisabled) return;
      if (!activeChatUsers.has(userId)) {
        delete lastSynced.chatHistory[userId];
        try {
          await fDb.collection("chatHistory").doc(userId).delete();
        } catch (e: any) {
          if (e && e.message && e.message.includes("PERMISSION_DENIED")) {
            console.warn("Disabling Firestore sync due to PERMISSION_DENIED error on chatHistory deletion.");
            firestoreSyncDisabled = true;
            return;
          }
          console.error(`Error deleting chatHistory for ${userId} from Firestore:`, e);
        }
      }
    }
  }
}

// Module-scoped db object container
const db: LumoraDB = {
  users: [],
  profiles: [],
  investments: [],
  deposits: [],
  withdrawals: [],
  transactions: [],
  notifications: [],
  referrals: [],
  chatHistory: {},
  agreements: [],
  settings: {
    id: "global",
    cbeAccountName: "Leykun",
    cbeAccountNumber: "1000419524747",
    referralBonusPercentage: 10,
  },
  loans: [],
  eligibilityChecks: [],
};

function setupFirebaseSync() {
  const fDb = getFirestoreDb();
  if (!fDb) {
    console.warn("Firestore database not available. Skipping real-time synchronization setup.");
    return;
  }

  const collectionsToListen = [
    { name: "users", array: db.users, key: "id" },
    { name: "profiles", array: db.profiles, key: "userId" },
    { name: "investments", array: db.investments, key: "id" },
    { name: "deposits", array: db.deposits, key: "id" },
    { name: "withdrawals", array: db.withdrawals, key: "id" },
    { name: "transactions", array: db.transactions, key: "id" },
    { name: "notifications", array: db.notifications, key: "id" },
    { name: "referrals", array: db.referrals, key: "id" },
    { name: "agreements", array: db.agreements, key: "id" },
    { name: "loans", array: db.loans, key: "id" },
    { name: "eligibilityChecks", array: db.eligibilityChecks, key: "id" },
  ];

  for (const col of collectionsToListen) {
    const unsubscribe = fDb.collection(col.name).onSnapshot((snapshot) => {
      // If Firestore is completely empty but we have local memory data (e.g. Alem user or settings loaded on boot),
      // we must NOT wipe it out! Instead, we upload our loaded boot-state data to Firestore.
      if (snapshot.empty && col.array.length > 0) {
        console.log(`[Firestore Seeding] Collection '${col.name}' is empty. Uploading ${col.array.length} boot elements to Firestore...`);
        for (const item of col.array) {
          const id = item[col.key];
          if (id) {
            fDb.collection(col.name).doc(id).set(item).catch(err => {
              console.error(`Error uploading seed ${col.name}/${id}:`, err);
            });
          }
        }
        return;
      }

      const items: any[] = [];
      snapshot.docs.forEach(docSnap => {
        const item = docSnap.data();
        items.push(item);
        lastSynced[col.name][docSnap.id] = JSON.stringify(item);
      });

      // Avoid wiping out items in col.array if snapshot has zero elements but we have local unsaved records!
      if (items.length === 0 && col.array.length > 0) {
        console.log(`[Sync Gate] Ignoring empty snapshot from cloud to preserve ${col.array.length} local items in '${col.name}'.`);
        return;
      }

      col.array.length = 0;
      col.array.push(...items);

      // Force save the synchronized updates directly down to local JSON backup file 'lumora_db.json'
      try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
      } catch (err) {
        console.error(`Failed to backup Firestore collection '${col.name}' to disk:`, err);
      }
    }, (error: any) => {
      console.error(`Firestore sync error on collection '${col.name}':`, error);
      if (error && error.message && error.message.includes("PERMISSION_DENIED")) {
        console.warn(`Unsubscribing and disabling Firestore sync due to PERMISSION_DENIED on '${col.name}'.`);
        firestoreSyncDisabled = true;
        try {
          unsubscribe();
        } catch (e) {
          console.error("Error unsubscribing:", e);
        }
      }
    });
  }

  // Listen to settings
  const unsubscribeSettings = fDb.collection("settings").onSnapshot((snapshot) => {
    const globalDoc = snapshot.docs.find(d => d.id === "global");
    if (globalDoc) {
      const data = globalDoc.data() as AppSettings;
      // Self-correct / upgrade stale properties in Firestore settings document
      if (data.cbeAccountName === "LUMORA Financial Group" || data.cbeAccountNumber === "1000456123985") {
        console.log("[Firestore Self-Correction] Upgrading stale settings document standard values to Leykun.");
        data.cbeAccountName = "Leykun";
        data.cbeAccountNumber = "1000419524747";
        fDb.collection("settings").doc("global").set(data).catch(err => {
          console.error("Failed to self-correct stale settings in Firestore:", err);
        });
      }
      db.settings.cbeAccountName = data.cbeAccountName;
      db.settings.cbeAccountNumber = data.cbeAccountNumber;
      db.settings.referralBonusPercentage = data.referralBonusPercentage;
      lastSynced.settings["global"] = JSON.stringify(data);
    }
  }, (error: any) => {
    console.error("Firestore sync error on collection 'settings':", error);
    if (error && error.message && error.message.includes("PERMISSION_DENIED")) {
      console.warn("Unsubscribing and disabling settings sync due to PERMISSION_DENIED.");
      firestoreSyncDisabled = true;
      try {
        unsubscribeSettings();
      } catch (e) {
        console.error("Error unsubscribing settings:", e);
      }
    }
  });

  // Listen to chatHistory
  const unsubscribeChat = fDb.collection("chatHistory").onSnapshot((snapshot) => {
    snapshot.docs.forEach(docSnap => {
      const id = docSnap.id;
      const data = docSnap.data();
      const messages = (data ? data.messages : []) as ChatMessage[];
      db.chatHistory[id] = messages;
      lastSynced.chatHistory[id] = JSON.stringify(messages);
    });
    // Remove deleted chats
    const snapshotIds = new Set(snapshot.docs.map(d => d.id));
    for (const id of Object.keys(db.chatHistory)) {
      if (!snapshotIds.has(id)) {
        delete db.chatHistory[id];
        delete lastSynced.chatHistory[id];
      }
    }
  }, (error: any) => {
    console.error("Firestore sync error on collection 'chatHistory':", error);
    if (error && error.message && error.message.includes("PERMISSION_DENIED")) {
      console.warn("Unsubscribing and disabling chatHistory sync due to PERMISSION_DENIED.");
      firestoreSyncDisabled = true;
      try {
        unsubscribeChat();
      } catch (e) {
        console.error("Error unsubscribing chat:", e);
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Simple, high-performance in-memory rate limiter to secure critical endpoints
  const rateLimitStore: Record<string, { count: number; resetAt: number }> = {};
  function rateLimiter(limit: number, windowMs: number) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "anonymous";
      const key = `${req.path}:${ip}`;
      const now = Date.now();

      if (!rateLimitStore[key] || rateLimitStore[key].resetAt < now) {
        rateLimitStore[key] = {
          count: 1,
          resetAt: now + windowMs,
        };
        return next();
      }

      rateLimitStore[key].count++;
      if (rateLimitStore[key].count > limit) {
        const retryAfterSeconds = Math.ceil((rateLimitStore[key].resetAt - now) / 1000);
        res.setHeader("Retry-After", String(retryAfterSeconds));
        return res.status(429).json({
          error: `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
        });
      }
      next();
    };
  }

  const authLimiter = rateLimiter(5, 60000); // 5 auth actions per minute
  const transactionLimiter = rateLimiter(3, 60000); // 3 deposits/withdrawals per minute

  // High-performance response logging & metrics tracking middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.path} - Status: ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // Security Headers Middleware (Vercel & Helmet compliance)
  app.use((req, res, next) => {
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Download-Options", "noopen");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
    next();
  });

  // Express JSON parser middleware (with protection against large payloads)
  app.use(express.json({ limit: "15mb" }));

  // Load custom seed database fallback / legacy data
  const initialData = loadDB();
  db.users.push(...initialData.users);
  db.profiles.push(...initialData.profiles);
  db.investments.push(...initialData.investments);
  db.deposits.push(...initialData.deposits);
  db.withdrawals.push(...initialData.withdrawals);
  db.transactions.push(...initialData.transactions);
  db.notifications.push(...initialData.notifications);
  db.referrals.push(...initialData.referrals);
  db.agreements.push(...initialData.agreements);
  db.loans.push(...initialData.loans);
  if (initialData.eligibilityChecks) {
    db.eligibilityChecks.push(...initialData.eligibilityChecks);
  }
  db.settings = initialData.settings;
  db.chatHistory = initialData.chatHistory;

  // Process-level emergency crash handling & persistent backup listeners
  process.on("unhandledRejection", (reason, promise) => {
    console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
      console.log("Emergency database backup completed successfully.");
    } catch (err) {
      console.error("Emergency database backup failed:", err);
    }
  });

  process.on("uncaughtException", (error) => {
    console.error("CRITICAL: Uncaught Exception thrown:", error);
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
      console.log("Emergency database backup completed successfully.");
    } catch (err) {
      console.error("Emergency database backup failed:", err);
    }
    process.exit(1);
  });

  // Graceful shutdown hooks
  function gracefulShutdown(signal: string) {
    console.log(`Received ${signal}. Starting graceful shutdown procedure...`);
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
      console.log("Database state fully synchronized to disk. Exiting smoothly.");
    } catch (err) {
      console.error("Error during database shutdown backup:", err);
    }
    process.exit(0);
  }
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Set up the listener to real-time sync with Firebase!
  // Pre-check connectivity to disable cleanly if we don't have IAM access
  const hasAccess = await testFirestoreConnectivity();
  if (hasAccess) {
    setupFirebaseSync();

    // Perform initial Firestore bootstrap/verify after virtual mount
    setTimeout(async () => {
      try {
        console.log("Verifying Firestore seeding...");
        await syncToFirestore(db);
        console.log("Seeding to cloud Firestore complete.");
      } catch (e) {
        console.error("Initial Firestore seeding failed:", e);
      }
    }, 3000);
  } else {
    firestoreSyncDisabled = true;
    console.log("Firestore cloud sync is disabled. Fallback to local high-performance file-based storage 'lumora_db.json' which is fully active and persistent.");
  }

  // Automatic Daily Earnings Allocation Engine
  function autoAllocateDailyEarnings() {
    let dbUpdated = false;
    const now = new Date();

    db.investments.forEach(inv => {
      if (inv.status === "active" && inv.remainingDays > 0) {
        const baseDateStr = inv.lastPayoutDate || inv.startDate;
        const lastPayout = new Date(baseDateStr);
        const diffMs = now.getTime() - lastPayout.getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        const periods = Math.floor(diffMs / oneDayMs);
        if (periods > 0) {
          const actualPeriodsToPay = Math.min(periods, inv.remainingDays);
          if (actualPeriodsToPay > 0) {
            for (let i = 0; i < actualPeriodsToPay; i++) {
              inv.remainingDays -= 1;
              inv.totalEarned += inv.dailyReturn;

              const p = db.profiles.find(profile => profile.userId === inv.userId);
              if (p) {
                p.walletBalance += inv.dailyReturn;
                p.totalEarnings += inv.dailyReturn;

                // Create transaction
                db.transactions.push({
                  id: "tx-" + Math.random().toString(36).substr(2, 9),
                  userId: inv.userId,
                  type: "daily_earnings",
                  amount: inv.dailyReturn,
                  description: `Accrued guaranteed daily interest on VIP level ${inv.planLevel} active asset portfolio`,
                  date: new Date().toISOString()
                });

                // Create notification
                db.notifications.push({
                  id: "not-" + Math.random().toString(36).substr(2, 9),
                  userId: inv.userId,
                  title: "Daily Return Credited",
                  message: `Congratulations! ${inv.dailyReturn} ETB was credited to your wallet from plan "${inv.planName}". Remaining: ${inv.remainingDays} days.`,
                  read: false,
                  date: new Date().toISOString()
                });
              }

              if (inv.remainingDays <= 0) {
                inv.status = "matured";
                break;
              }
            }
            inv.lastPayoutDate = new Date(lastPayout.getTime() + actualPeriodsToPay * oneDayMs).toISOString();
            dbUpdated = true;
          }
        }
      }
    });

    if (dbUpdated) {
      console.log(`[Automatic Yield Tracker] Credited scheduled daily payouts for database accounts.`);
      saveDB(db);
    }
  }

  // Initial check on boot
  try {
    autoAllocateDailyEarnings();
  } catch (error) {
    console.error("Initial daily earnings check failed:", error);
  }

  // Trigger auto-credits periodically every 60 seconds
  setInterval(() => {
    try {
      autoAllocateDailyEarnings();
    } catch (e) {
      console.error("[Automatic Yield Tracker Check Failed]:", e);
    }
  }, 60000);

  // Trigger on every API request to guarantee immediate credit upon user loading or performing any operations
  app.use((req, res, next) => {
    try {
      autoAllocateDailyEarnings();
    } catch (e) {
      console.error("[Automatic Yield Tracker Middleware Check Failed]:", e);
    }
    next();
  });

  // Lazy initialize Gemini AI with process.env.GEMINI_API_KEY
  let ai: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY environment variable is not defined");
      }
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  }

  // API ROUTES First

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User Auth - Session / Persistent check
  app.post("/api/auth/session", (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Session authentication failed" });
    }
    const user = db.users.find(u => u.id === userId);
    const profile = db.profiles.find(p => p.userId === userId);
    if (!user || !profile) {
      return res.status(404).json({ error: "Active user profile not found" });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ error: "Your account is suspended. Contact LUMORA Support." });
    }
    res.json({ user, profile });
  });

  // Register with Phone Number inside country scope
  app.post("/api/auth/register", authLimiter, (req, res) => {
    const { fullName, phone, email, password, referralCode } = req.body;

    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({ error: "All fields including email are required" });
    }

    // Advanced Input Validation (Vercel compliance / prevents SQL/NoSQL Injection style payload spam)
    const cleanName = fullName.toString().trim();
    if (cleanName.length < 2 || cleanName.length > 64) {
      return res.status(400).json({ error: "Full name must be between 2 and 64 characters" });
    }

    const cleanPhone = phone.toString().trim();
    const phoneRegex = /^(09|07|\+251)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ error: "Invalid phone number formatting. Must start with 09, 07, or +251, containing exactly 9 or 10 digits." });
    }

    const cleanEmail = email.toString().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Invalid email address formatting." });
    }

    const cleanPass = password.toString();
    if (cleanPass.length < 6 || cleanPass.length > 32) {
      return res.status(400).json({ error: "Password must be between 6 and 32 characters in length." });
    }

    // Direct check if user exists
    const userExists = db.users.some(u => u.phone === cleanPhone);
    if (userExists) {
      return res.status(409).json({ error: "This phone number is already registered" });
    }

    const userId = "user-" + Math.random().toString(36).substr(2, 9);
    const systemReferral = "LUM" + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Check if referralCode matches any user
    let referrer: User | undefined = undefined;
    if (referralCode) {
      referrer = db.users.find(u => u.referralCode === referralCode);
    }

    const newUser: User = {
      id: userId,
      fullName,
      phone,
      email,
      password, // Save registration password
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
      walletBalance: 0, // initial
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
      transactionPin: "" // No initial PIN
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);

    // If referred, update team stats!
    if (referrer) {
      const referrerProfile = db.profiles.find(p => p.userId === (referrer as User).id);
      if (referrerProfile) {
        referrerProfile.teamSize += 1;
      }
      
      const newReferralRelation: Referral = {
        id: "ref-" + Math.random().toString(36).substr(2, 9),
        referrerId: referrer.id,
        referredId: userId,
        referredName: fullName,
        referredPhone: phone,
        referredVipLevel: 0,
        registrationDate: new Date().toISOString(),
        rewardEarned: 0
      };
      db.referrals.push(newReferralRelation);
    }

    // Add welcome notification
    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "Welcome to LUMORA!",
      message: "Congratulations! Your account has been created. Connect with us via official CBE deposit to choose a VIP Investment plan.",
      read: false,
      date: new Date().toISOString()
    });

    saveDB(db);
    res.json({ user: newUser, profile: newProfile });
  });

  // Submit Identity Verification (Photo of ID in both sides + Selfie)
  app.post("/api/auth/submit-id", (req, res) => {
    const { userId, idCardFront, idCardBack, idSelfie, fanNumber } = req.body;
    if (!userId || !idCardFront || !idCardBack || !idSelfie || !fanNumber) {
      return res.status(400).json({ error: "User ID, both sides of the ID, selfie photograph, and National ID FAN number are required" });
    }

    const trimmedFan = fanNumber.trim();
    if (trimmedFan) {
      const duplicateFan = db.profiles.find(profile => profile.userId !== userId && profile.fanNumber && profile.fanNumber.trim() === trimmedFan);
      if (duplicateFan) {
        return res.status(400).json({ error: "This National ID / FAN number is already associated with an existing account. Double registration is prohibited to protect security and compliance." });
      }
    }

    const p = db.profiles.find(profile => profile.userId === userId);
    if (!p) {
      return res.status(404).json({ error: "Profile not found" });
    }

    p.idCardFront = idCardFront;
    p.idCardBack = idCardBack;
    p.idSelfie = idSelfie;
    p.fanNumber = fanNumber.trim();
    p.idVerificationStatus = "pending";
    p.idRejectionReason = undefined;

    // Notify the user of submission
    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "ID Verification Submitted",
      message: "We have received both sides of your National ID. Our compliance team is auditing the details. This active verification typically takes up to 24 hours.",
      read: false,
      date: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true, profile: p });
  });

  // Reset Identity Verification to unsubmitted (e.g. for re-submission in case of rejection)
  app.post("/api/profiles/reset-verification", (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const p = db.profiles.find(profile => profile.userId === userId);
    if (!p) {
      return res.status(404).json({ error: "Profile not found" });
    }

    p.idVerificationStatus = "unsubmitted";
    p.idCardFront = "";
    p.idCardBack = "";
    p.idSelfie = "";
    p.idRejectionReason = undefined;

    saveDB(db);
    res.json({ success: true, profile: p });
  });

  // Login
  app.post("/api/auth/login", authLimiter, (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: "Phone number and password are required" });
    }

    const cleanPhone = phone.toString().trim();
    const user = db.users.find(u => u.phone === cleanPhone);
    const profile = user ? db.profiles.find(p => p.userId === user.id || p.phone === phone) : undefined;

    if (!user || user.password !== password || !profile) {
      return res.status(401).json({ error: "Invalid phone number or password" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "This profile has been suspended. Please contact customer care code CBE." });
    }

    // Simulate OTP / Login
    // For demo/production ease, we skip actual bcrypt but save state
    res.json({ user, profile });
  });

  // Reset password
  app.post("/api/auth/reset-password", (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: "Phone number and password are required" });
    }

    const user = db.users.find(u => u.phone === phone);
    if (!user) {
      return res.status(404).json({ error: "No profile found with this phone number" });
    }

    user.password = password;
    saveDB(db);
    res.json({ success: true });
  });

  // Get investment plans
  app.get("/api/plans", (req, res) => {
    res.json(VIP_PLANS);
  });

  // Submit manual receipt deposit
  app.post("/api/deposits/submit", transactionLimiter, (req, res) => {
    const { userId, amount, receiptImage, screenshot, bankReference } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "User ID and amount are required" });
    }

    const trimmedRef = (bankReference || "").trim();
    if (trimmedRef) {
      const duplicateRef = db.deposits.find(d => d.bankReference && d.bankReference.trim() === trimmedRef);
      if (duplicateRef) {
        return res.status(400).json({ error: "This CBE transaction reference code has already been registered or used. Each unique reference number can only be submitted once." });
      }
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value < 5000) {
      return res.status(400).json({ error: "Minimum deposit limit is 5000 ETB" });
    }

    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const newDeposit: Deposit = {
      id: "dep-" + Math.random().toString(36).substr(2, 9),
      userId,
      userName: profile.fullName,
      userPhone: profile.phone,
      amount: value,
      bankAccount: "Commercial Bank of Ethiopia (CBE)",
      receiptImage: receiptImage || screenshot || "receipt_base64_log_placeholder",
      bankReference: trimmedRef || undefined,
      submittedAt: new Date().toISOString(),
      status: "pending"
    };

    db.deposits.push(newDeposit);
    
    // Add transaction audit trail (as pending or wait for approval? The prompt says quick actions and transactions tracking)
    // We only create active transaction in full list upon approval, or flag as pending. Let's list it inside deposits array.
    saveDB(db);

    res.json({ message: "Deposit request received successfully", deposit: newDeposit });
  });

  // Submit withdrawal request
  app.post("/api/withdrawals/submit", transactionLimiter, (req, res) => {
    const { userId, amount, transactionPin, bankName, accountNumber, accountHolderName } = req.body;

    if (!userId || !amount || !transactionPin || !bankName || !accountNumber || !accountHolderName) {
      return res.status(400).json({ error: "All fields are required including bank details" });
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value < 600) {
      return res.status(400).json({ error: "Minimum withdrawal limit is 600 ETB" });
    }

    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    if (profile.walletBalance < value) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    // Set PIN if first time, else verify!
    if (!profile.transactionPin) {
      profile.transactionPin = transactionPin;
    } else if (profile.transactionPin !== transactionPin) {
      return res.status(400).json({ error: "Incorrect Secure Transaction PIN" });
    }

    // Deduct balance instantly to reserve the fund
    profile.walletBalance -= value;

    const newWithdrawal: Withdrawal = {
      id: "wit-" + Math.random().toString(36).substr(2, 9),
      userId,
      userName: profile.fullName,
      userPhone: profile.phone,
      amount: value,
      status: "pending",
      submittedAt: new Date().toISOString(),
      bankName,
      accountNumber,
      accountHolderName
    };

    db.withdrawals.push(newWithdrawal);
    saveDB(db);

    res.json({ message: "Withdrawal submitted. Under verification.", walletBalance: profile.walletBalance });
  });

  // Get user withdrawals list
  app.get("/api/withdrawals/user/:userId", (req, res) => {
    const { userId } = req.params;
    const list = db.withdrawals.filter(w => w.userId === userId);
    res.json(list.sort((a,b) => b.submittedAt.localeCompare(a.submittedAt)));
  });

  // Purchase digital plan
  app.post("/api/investments/buy", (req, res) => {
    const { userId, planLevel, vipLevel, durationDays } = req.body;
    const finalLevel = planLevel !== undefined ? planLevel : vipLevel;

    if (!userId || finalLevel === undefined) {
      return res.status(400).json({ error: "User ID and plan level are required" });
    }

    const plan = VIP_PLANS.find(p => p.level === parseInt(finalLevel.toString()));
    if (!plan) {
      return res.status(404).json({ error: "Selected plan not found" });
    }

    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    if (profile.walletBalance < plan.requiredInvestment) {
      return res.status(400).json({ error: "Insufficient wallet balance. Please deposit funds first." });
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
        return res.status(400).json({ error: reqText });
      }
    }

    const finalDurationDays = durationDays ? parseInt(durationDays.toString()) : plan.durationDays;

    // Process Purchase
    profile.walletBalance -= plan.requiredInvestment;
    profile.totalInvestments += plan.requiredInvestment;

    // Elevate user's peak VIP level if higher than previous level
    if (plan.level > profile.vipLevel) {
      profile.vipLevel = plan.level;
    }

    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setDate(startDate.getDate() + finalDurationDays);

    const investmentId = "inv-" + Math.random().toString(36).substr(2, 9);
    const newInvestment: Investment = {
      id: investmentId,
      userId,
      planId: `vip-${plan.level}`,
      planName: plan.name,
      planLevel: plan.level,
      amount: plan.requiredInvestment,
      dailyRate: plan.dailyRate,
      dailyReturn: Math.round(plan.requiredInvestment * plan.dailyRate),
      startDate: startDate.toISOString(),
      maturityDate: maturityDate.toISOString(),
      remainingDays: finalDurationDays,
      status: "active",
      totalEarned: 0,
      lastPayoutDate: startDate.toISOString()
    };

    db.investments.push(newInvestment);

    // Create Transaction history entry
    db.transactions.push({
      id: "tx-" + Math.random().toString(36).substr(2, 9),
      userId,
      type: "investment",
      amount: -plan.requiredInvestment,
      description: `Invested in ${plan.name} Plan (${finalDurationDays} Days)`,
      date: new Date().toISOString()
    });

    // Notify user
    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "Plan Purchased Successfully!",
      message: `You successfully activated ${plan.name} for ${finalDurationDays} days with ${plan.requiredInvestment} ETB. You will earn ${Math.round(plan.requiredInvestment * plan.dailyRate)} ETB every 24 hours.`,
      read: false,
      date: new Date().toISOString()
    });

    // Check if there's a referrer to award direct referral bonus on their FIRST investment!
    const user = db.users.find(u => u.id === userId);
    if (user && user.referredBy) {
      const isFirstInvestment = db.investments.filter(inv => inv.userId === userId).length === 1;
      if (isFirstInvestment) {
        const referrerUser = db.users.find(u => u.referralCode === user.referredBy);
        if (referrerUser) {
          const referrerProfile = db.profiles.find(p => p.userId === referrerUser.id);
          if (referrerProfile) {
            const bonusPercentage = db.settings.referralBonusPercentage || 10;
            const bonusAmount = Math.round((plan.requiredInvestment * bonusPercentage) / 100);
            
            referrerProfile.walletBalance += bonusAmount;
            referrerProfile.totalEarnings += bonusAmount;

            // Track referral transaction
            db.transactions.push({
              id: "tx-" + Math.random().toString(36).substr(2, 9),
              userId: referrerUser.id,
              type: "referral_reward",
              amount: bonusAmount,
              description: `Referral First Investment Bonus (${bonusPercentage}%) from ${profile.fullName}'s activation of ${plan.name}`,
              date: new Date().toISOString()
            });

            // Notify referrer
            db.notifications.push({
              id: "not-" + Math.random().toString(36).substr(2, 9),
              userId: referrerUser.id,
              title: "Referral Bonus on First Investment!",
              message: `You received a direct first-investment bonus of ${bonusAmount} ETB (${bonusPercentage}%) from the launch of ${plan.name} by your invitee ${profile.fullName}.`,
              read: false,
              date: new Date().toISOString()
            });

            // Update referrals table relation
            const referralRelation = db.referrals.find(r => r.referredId === userId);
            if (referralRelation) {
              referralRelation.rewardEarned += bonusAmount;
              referralRelation.referredVipLevel = profile.vipLevel;
            }
          }
        }
      }
    }

    saveDB(db);

    res.json({ 
      message: "Purchase success", 
      investment: newInvestment,
      profile
    });
  });

  // Get notifications
  app.get("/api/notifications/:userId", (req, res) => {
    const { userId } = req.params;
    const list = db.notifications.filter(n => n.userId === userId).sort((a,b) => b.date.localeCompare(a.date));
    res.json(list);
  });

  // Mark all notifications read
  app.post(["/api/notifications/read", "/api/notifications/read-all"], (req, res) => {
    const { userId } = req.body;
    db.notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    saveDB(db);
    res.json({ success: true });
  });

  // Get user statistics bundle
  app.get("/api/dashboard/:userId", (req, res) => {
    const { userId } = req.params;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const userObj = db.users.find(u => u.id === userId);
    const isAdmin = userObj ? userObj.isAdmin : false;

    const activeList = db.investments.filter(i => i.userId === userId && i.status === "active");
    const transList = db.transactions.filter(t => t.userId === userId).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 10);
    const notificationsList = db.notifications.filter(n => n.userId === userId).sort((a,b) => b.date.localeCompare(a.date));
    const investmentsList = db.investments.filter(i => i.userId === userId).sort((a,b) => b.startDate.localeCompare(a.startDate));

    // Calculate today's earnings simulated
    const todaySim = activeList.reduce((acc, current) => acc + current.dailyReturn, 0);

    res.json({
      profile,
      isAdmin,
      activeInvestmentsCount: activeList.length,
      activeInvestmentsValue: activeList.reduce((acc, curr) => acc + curr.amount, 0),
      todayEarnings: todaySim,
      recentTransactions: transList,
      recentNotifications: notificationsList.slice(0, 5),
      notifications: notificationsList,
      investments: investmentsList,
      loans: db.loans ? db.loans.filter(l => l.userId === userId) : []
    });
  });

  // Full transactions endpoint with filters
  app.get("/api/transactions/:userId", (req, res) => {
    const { userId } = req.params;
    const { filter } = req.query; // 'today', 'weekly', 'monthly', 'all'
    
    let list = db.transactions.filter(t => t.userId === userId);

    if (filter === "today") {
      const todayStr = new Date().toISOString().split('T')[0];
      list = list.filter(t => t.date.startsWith(todayStr));
    } else if (filter === "weekly") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      list = list.filter(t => new Date(t.date) >= sevenDaysAgo);
    } else if (filter === "monthly") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      list = list.filter(t => new Date(t.date) >= thirtyDaysAgo);
    }

    res.json(list.sort((a,b) => b.date.localeCompare(a.date)));
  });

  // Get user profile details
  app.get("/api/profile/:userId", (req, res) => {
    const { userId } = req.params;
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });

  // Set profile security PIN
  app.post("/api/profiles/pin", (req, res) => {
    const { userId, transactionPin } = req.body;
    if (!userId || !transactionPin) {
      return res.status(400).json({ error: "Missing arguments" });
    }
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    profile.transactionPin = transactionPin;
    saveDB(db);
    res.json({ success: true, profile });
  });

  // Setup/Register withdrawal bank details and pin
  app.post("/api/profiles/withdrawal-setup", (req, res) => {
    const { userId, bankName, accountNumber, accountHolderName, transactionPin } = req.body;
    if (!userId || !bankName || !accountNumber || !accountHolderName || !transactionPin) {
      return res.status(400).json({ error: "All registration fields are required" });
    }
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    profile.bankName = bankName;
    profile.accountNumber = accountNumber;
    profile.accountHolderName = accountHolderName;
    profile.transactionPin = transactionPin;
    saveDB(db);
    res.json({ success: true, profile });
  });

  // Upload user profile picture as Base64 asset
  app.post("/api/profile/upload-avatar", (req, res) => {
    const { userId, base64Image, avatarBase64 } = req.body;
    const finalImage = base64Image || avatarBase64;
    if (!userId || !finalImage) {
      return res.status(400).json({ error: "Missing arguments" });
    }
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    
    profile.profilePicture = finalImage;
    saveDB(db);
    res.json({ success: true, profilePicture: finalImage });
  });

  // Alias or direct support for App.tsx avatar endpoint
  app.post("/api/profiles/avatar", (req, res) => {
    const { userId, base64Image, avatarBase64 } = req.body;
    const finalImage = base64Image || avatarBase64;
    if (!userId || !finalImage) {
      return res.status(400).json({ error: "Missing arguments" });
    }
    const profile = db.profiles.find(p => p.userId === userId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    
    profile.profilePicture = finalImage;
    saveDB(db);
    res.json({ success: true, profilePicture: finalImage });
  });

  // Get user referrals
  app.get("/api/referrals/:userId", (req, res) => {
    const { userId } = req.params;
    const team = db.referrals.filter(r => r.referrerId === userId);
    const mappedTeam = team.map(ref => {
      const rp = db.profiles.find(p => p.userId === ref.referredId);
      return {
        ...ref,
        isVerified: rp ? (rp.idVerificationStatus === 'verified') : false
      };
    });
    res.json(mappedTeam);
  });

  // Get User Investments
  app.get("/api/investments/:userId", (req, res) => {
    const { userId } = req.params;
    const list = db.investments.filter(i => i.userId === userId);
    res.json(list.sort((a,b) => b.startDate.localeCompare(a.startDate)));
  });

  // Get Agreements
  app.get("/api/agreements", (req, res) => {
    res.json(db.agreements);
  });

  // Admin Configuration Settings
  app.get("/api/admin/settings", (req, res) => {
    res.json(db.settings);
  });

  app.post("/api/admin/settings/edit", (req, res) => {
    const { cbeAccountName, cbeAccountNumber, referralBonusPercentage, productionInviteUrl } = req.body;
    if (cbeAccountName) db.settings.cbeAccountName = cbeAccountName;
    if (cbeAccountNumber) db.settings.cbeAccountNumber = cbeAccountNumber;
    if (referralBonusPercentage) db.settings.referralBonusPercentage = parseFloat(referralBonusPercentage);
    if (productionInviteUrl !== undefined) db.settings.productionInviteUrl = productionInviteUrl;
    
    saveDB(db);
    res.json(db.settings);
  });

  // **Gemini AI Financial Assistant Endpoint**
  app.post("/api/assistant/chat", async (req, res) => {
    const { userId, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message context is empty" });
    }

    try {
      const client = getGeminiClient();
      
      const systemInstruction = `You are a highly capable and professional AI financial advisor for LUMORA, the premium peer-to-peer automated micro-finance and high-yield liquidity channel in Ethiopia.

=== 1. MISSION, VISION & "ABOUT US" ===
- Welcome to Lumora: Ethiopia's premier peer-to-peer automated micro-finance and high-yield liquidity channel. We connect local commerce and infrastructure project liquidity pools directly to user micro-investments, facilitating high-yield, stable growth with institutional accuracy.
- How It Works Core Steps:
  1. Deposit Micro-Capital: Copy official Commercial Bank of Ethiopia (CBE) account number from the Deposit Dialog. Transfer starting capital (minimum 5,000 ETB) from CBE Birr App, note down your transaction reference code, and capture a clear screenshot of the receipt.
  2. Submit Proof: Enter your deposited amount, paste the CBE reference code (FT number), upload your receipt screenshot, and submit. The administrators will audit and credit your account within 2 hours.
  3. Activate High-Yield Plans: Invest your wallet balance into VIP tiers ranging from VIP 0 to VIP 15. Your plan activates immediately, compounding interest payouts every 24 hours.
  4. Secure Dynamic Cashouts: Navigate to the Cashout menu. First, configure your personal phone number, active Ethiopian bank card details, and a secret 4-digit transaction PIN. Authorize cashouts (minimum 600 ETB) safely using this PIN.
  5. Identity Integrity: Verify your account by uploading photos of both sides of your National ID. This unlocks access to VIP active withdrawals and institutional loan options.

=== 2. PLATFORM AGREEMENTS, POLICIES & TERMS ===
- User Identity & Bank Registration: Users must manually designate their own legitimate Commercial Bank of Ethiopia (CBE) bank details and configure a secure 4-digit payment PIN to authorize active withdrawals.
- Unified Financial Limits: A minimum transaction threshold of 5,000 ETB for CBE deposit submissions and 600 ETB for cashouts is strictly enforced.
- Real-Time Ledger Integration: All balance adjustments, VIP level elevations, deposits, and cashouts synchronize in real-time under a 3-second secure consensus. All transfers are manually audited on the admin portal.
- Security & Identity Validation: To authorize active cashouts and access micro-loans, users must verify their profile by uploading clean photos of both sides of their National ID cards.
- High-Yield Plan Activation: Plans are activated immediately upon balance confirmation (Min 5,000 ETB), automatically starting synced daily yields spanning VIP levels. Interest cycles schedule payouts every 24 hours.
- CBE Transfer and Auditing: Deposits are routed directly to the treasury audit desk via CBE app screenshots. Administrators evaluate submissions, and credits reflect live on user dashboards in under 2 hours.
- Cashout Settlements: Users cash out using secure designated accounts. Approved cashouts are dispersed within 2 to 6 hours.

=== 3. INSTITUTIONAL LOANS SYSTEM ===
- Pre-approved loan framework: Available exclusively for verified National ID profiles who have activated a VIP Level 2 Investment Plan or higher.
- Allowed, fixed loan tiers: 30,000 ETB, 50,000 ETB, 100,000 ETB, 150,000 ETB, 200,000 ETB, 250,000 ETB, 500,000 ETB, and 1,000,000 ETB.
- Tenure: Adjustable tenure durations from 3, 6, 12, to 24 months, with customizable payment calculators.
- Verification Requirement: Users must enter their matching verified FAN registration number from their National ID to apply. Submitted requests are reviewed by administrators in the Admin Panel. Once approved, the funds are instantly credited to the user's active wallet balance.

=== 4. APPLICATION PAGES, COMPONENTS & LAYOUT ELEMENTS ===
Instruct the user precisely on which page, component, or element to use to accomplish any goal:
- HeaderBar: Top panel displaying the elegant Lumora branding, dynamic language switcher selector (supporting English, Amharic/አማርኛ, Afaan Oromo, Tigrinya/ትግርኛ, and Somali), a real-time system clock, and the Quick Walkthrough guide link.
- BottomNavBar: Sticky bottom navigation bar supporting quick switching between core tabs: Home, Investments, Earnings, Customer Service, and Profile.
- HomeTab (Dashboard): Displays active wallet balance, interactive quick-action buttons for 'Deposit' and 'Cashout' transactions, user's current active VIP level card with a progress bar, system banners, and recent activity metrics.
- InvestmentsTab (VIP Catalog): Showcases the complete listing of 15 high-yielding VIP levels with entry minimums (starting at 5,000 ETB up to 100,000,000 ETB), daily interest rates, and active compounding periods. Includes an interactive Profit Projection Calculator.
- EarningsTab (Financial Logs): Visualizes total accumulated earnings, compounding history entries, active VIP logs, referral commission rewards, and a high-fidelity earnings projection chart showing future wealth growth curves.
- CustomerServiceTab (Support Center): Contains buttons initiating live support chats via official Telegram links, a comprehensive FAQ scroll area, and this interactive live Gemini AI Assistant interface.
- ProfileTab (Account Settings Panel): Main administration pane for managing specific account parameters, including Card/Bank withdrawal setup (designating recipient bank details), configuring an encrypted 4-digit payment security PIN, reviewing personal Deposit/Withdrawal history logs, ID Verification upload status, the Loan Portal, reading company agreements, and logging out safely.
- IdUploadGate (National ID upload screen): Built-in compliance portal allowing uploads of National ID Card Front, Back, and Selfie captures with a status tracker (pending, approved, or rejected).
- LoanCalculator: Fully interactive tool integrated into the loan section of the Profile page for configuring and calculating payment metrics before submitting loan requests.
- TransactionsModals (Deposit & Cashout dialogs): Popups triggered directly from the homepage. "Deposit Capital" reveals the official CBE account info (Account Number: 1000456123985), allows copying details, pasting CBE transaction reference numbers (FT codes), and uploading receipt images. "Cashout Balance" asks for withdrawal amount (Min 600 ETB) and the 4-digit transaction security PIN.
- WalkthroughModal: Visual overlay presenting step-by-step onboarding sequences for new users.

=== 5. COMPLIANCE & SAFETY POLICIES ===
- Each National ID FAN number is strictly linked to a single verified account to avoid double registration and multi-accounting (this is checked and blocked server-side). It is implemented for the protection of user assets and corporate compliance.
- CBE transaction codes/references (FT codes) can only be uploaded once. Reusing reference codes for multiple deposits is strictly banned, automatically triggers security audits, and results in account suspension.
- Disclaimer text mandate: Whenever asked to project or calculate interest earnings, you MUST append the compliance disclaimer: "Projected returns are estimates only. Actual investment performance may vary and involves risk."
- Direct CBG/CBE integration is NOT active. CBE is only the manual funds transfer recipient target.
- Supported Languages: Provide friendly, precise, and highly scannable bullet points. Support Amharic, Afaan Oromo, Somali, and Tigrinya. Speak in English unless the inquiry is in another regional language, in which case reply in that language.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I am currently syncing. Please try again shortly.";

      // Log/Save chat history
      if (userId) {
        if (!db.chatHistory[userId]) {
          db.chatHistory[userId] = [];
        }
        db.chatHistory[userId].push({
          id: "m-" + Math.random().toString(36).substr(2, 9),
          sender: "user",
          text: message,
          date: new Date().toISOString()
        });
        db.chatHistory[userId].push({
          id: "m-" + Math.random().toString(36).substr(2, 9),
          sender: "assistant",
          text: replyText,
          date: new Date().toISOString()
        });
        saveDB(db);
      }

      res.json({ reply: replyText });
    } catch (err: any) {
      console.error("Gemini assistant crash:", err);
      res.status(500).json({ error: "Failed to connect to AI Assistant. Check your API token secrets." });
    }
  });

  // Retrieve chat logs
  app.get("/api/assistant/chat/:userId", (req, res) => {
    const { userId } = req.params;
    const list = db.chatHistory[userId] || [];
    res.json(list);
  });

  // Clear chat log
  app.post("/api/assistant/chat/clear", (req, res) => {
    const { userId } = req.body;
    if (userId) {
      db.chatHistory[userId] = [];
      saveDB(db);
    }
    res.json({ success: true });
  });

  // ADMIN ACTION: Simulating a 24-Hour Cycle Tick (Awesome dev feature!)
  app.post("/api/admin/simulate-day", (req, res) => {
    let triggeredCount = 0;
    let interestPaid = 0;

    db.investments.forEach(inv => {
      if (inv.status === "active" && inv.remainingDays > 0) {
        inv.remainingDays -= 1;
        inv.totalEarned += inv.dailyReturn;

        if (inv.remainingDays <= 0) {
          inv.status = "matured";
        }

        // Find user profile to deposit funds
        const p = db.profiles.find(profile => profile.userId === inv.userId);
        if (p) {
          p.walletBalance += inv.dailyReturn;
          p.totalEarnings += inv.dailyReturn;

          // Push record into transactions
          db.transactions.push({
            id: "tx-" + Math.random().toString(36).substr(2, 9),
            userId: inv.userId,
            type: "daily_earnings",
            amount: inv.dailyReturn,
            description: `Daily interest check credited for plan "${inv.planName}"`,
            date: new Date().toISOString()
          });

          // Send notification
          db.notifications.push({
            id: "not-" + Math.random().toString(36).substr(2, 9),
            userId: inv.userId,
            title: "Daily Return Credited",
            message: `Congratulations! ${inv.dailyReturn} ETB was credited to your wallet from play ${inv.planName}. Remaining: ${inv.remainingDays} days.`,
            read: false,
            date: new Date().toISOString()
          });

          triggeredCount++;
          interestPaid += inv.dailyReturn;
        }
      }
    });

    saveDB(db);
    res.json({ success: true, triggeredCount, interestPaidTotal: interestPaid });
  });

  // ADMIN PANEL - REST ENDPOINTS
  app.get("/api/admin/stats", (req, res) => {
    const totalUsers = db.users.filter(u => !u.isAdmin).length;
    const activeInvestmentsList = db.investments.filter(i => i.status === "active");
    const activeInvestQuantity = activeInvestmentsList.length;
    const totalInvestedAmount = activeInvestmentsList.reduce((sum, current) => sum + current.amount, 0);

    const approvedDeposits = db.deposits.filter(d => d.status === "approved");
    const totalDepositsSum = approvedDeposits.reduce((s, c) => s + c.amount, 0);

    const approvedWithdrawals = db.withdrawals.filter(w => w.status === "approved");
    const totalWithdrawSum = approvedWithdrawals.reduce((s, c) => s + c.amount, 0);

    const totalPaidEarnings = db.transactions
      .filter(t => t.type === "daily_earnings")
      .reduce((sum, curr) => sum + curr.amount, 0);

    res.json({
      totalUsers,
      totalDeposits: totalDepositsSum,
      totalWithdrawals: totalWithdrawSum,
      totalInvestments: totalInvestedAmount,
      activeInvestmentsCount: activeInvestQuantity,
      totalEarningsPaid: totalPaidEarnings,
    });
  });

  // Users list
  app.get("/api/admin/users", (req, res) => {
    // Join users + profiles + investments for details
    const list = db.users.map(u => {
      const p = db.profiles.find(profile => profile.userId === u.id);
      const userInvestments = db.investments.filter(i => i.userId === u.id);
      return {
        ...u,
        profile: p,
        investments: userInvestments
      };
    });
    res.json(list);
  });

  // Suspend or Activate user
  app.post("/api/admin/users/status", (req, res) => {
    const { targetUserId, status } = req.body; // 'active' | 'suspended'
    const target = db.users.find(u => u.id === targetUserId);
    if (!target) return res.status(404).json({ error: "Target search failed" });

    target.status = status;
    saveDB(db);
    res.json({ success: true, user: target });
  });

  // Upgrade VIP Plan level manually
  app.post("/api/admin/users/vip", (req, res) => {
    const { targetUserId, vipLevel } = req.body;
    const p = db.profiles.find(profile => profile.userId === targetUserId);
    if (!p) return res.status(404).json({ error: "Profile not found" });

    p.vipLevel = parseInt(vipLevel);
    saveDB(db);
    res.json({ success: true, profile: p });
  });

  // Adjust user balance manually (Admin ONLY)
  app.post("/api/admin/users/adjust-balance", (req, res) => {
    const { targetUserId, amount, type } = req.body; // type: 'add' | 'subtract'
    const amtNum = parseFloat(amount);
    if (!targetUserId || isNaN(amtNum) || amtNum <= 0) {
      return res.status(400).json({ error: "Invalid adjustment parameters" });
    }

    const p = db.profiles.find(profile => profile.userId === targetUserId);
    if (!p) return res.status(404).json({ error: "Profile not found" });

    if (type === "subtract" && p.walletBalance < amtNum) {
      return res.status(400).json({ error: "Insufficient user wallet balance to subtract" });
    }

    const diff = type === "add" ? amtNum : -amtNum;
    p.walletBalance += diff;

    // Mutate accumulated totals for accuracy
    if (type === "add") {
      p.totalDeposits += amtNum;
    } else {
      p.totalWithdrawals += amtNum;
    }

    // Add receipt to transaction list
    db.transactions.push({
      id: "txn-" + Math.random().toString(36).substr(2, 9),
      userId: targetUserId,
      type: type === "add" ? "deposit" : "withdrawal",
      amount: diff,
      description: `Administrative Balance Adjustment (${type === 'add' ? 'Credit' : 'Debit'})`,
      date: new Date().toISOString()
    });

    // Notify the user in real-time
    db.notifications.push({
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId: targetUserId,
      title: type === "add" ? "Wallet Credited ✓" : "Wallet Debited ⚠",
      message: `Your balance was updated by Administration. Amount adjusted: ${type === 'add' ? '+' : '-'}${amtNum.toLocaleString()} ETB. New Balance: ${p.walletBalance.toLocaleString()} ETB.`,
      read: false,
      date: new Date().toISOString()
    });

    saveDB(db);
    res.json({ success: true, profile: p });
  });

  // Verify or Reject user ID (Admin only)
  app.post("/api/admin/users/verify-id", (req, res) => {
    const { targetUserId, action, rejectionReason } = req.body; // action: 'approve' | 'reject'
    const p = db.profiles.find(profile => profile.userId === targetUserId);
    const u = db.users.find(user => user.id === targetUserId);
    if (!p) return res.status(404).json({ error: "Profile not found" });

    if (action === "approve") {
      const wasVerified = p.idVerificationStatus === "verified";
      p.idVerificationStatus = "verified";
      p.idRejectionReason = undefined;

      let bonusGranted = false;
      if (!wasVerified && !p.verificationBonusClaimed) {
        p.verificationBonusClaimed = true;
        p.walletBalance = (p.walletBalance || 0) + 175;
        bonusGranted = true;

        // Record bonus transaction
        db.transactions.push({
          id: "tx-" + Math.random().toString(36).substr(2, 9),
          userId: targetUserId,
          type: "bonus",
          amount: 175,
          description: "ID Verification Reward Bonus",
          date: new Date().toISOString()
        });
      }

      // Notify user
      db.notifications.push({
        id: "not-" + Math.random().toString(36).substr(2, 9),
        userId: targetUserId,
        title: bonusGranted ? "National ID Verified! +175 ETB" : "National ID Verified!",
        message: bonusGranted 
          ? "Congratulations! Your National ID has been successfully verified. An offical signup verification bonus of 175 ETB has been credited to your wallet! You are now a fully verified member."
          : "Congratulations! Your National ID card has been successfully verified. You are now a fully verified member and eligible to apply for institutional capital loans.",
        read: false,
        date: new Date().toISOString()
      });
    } else {
      p.idVerificationStatus = "rejected";
      p.idRejectionReason = rejectionReason || "The uploaded ID photos were blurry or did not match the profile details.";

      // Notify user
      db.notifications.push({
        id: "not-" + Math.random().toString(36).substr(2, 9),
        userId: targetUserId,
        title: "National ID Rejected",
        message: `Your National ID verification request was rejected. Reason: ${p.idRejectionReason}. Please re-submit clear photos of both sides in your profile tab.`,
        read: false,
        date: new Date().toISOString()
      });
    }

    saveDB(db);
    res.json({ success: true, profile: p });
  });

  // Cancel/Refund an active investment plan (Admin Only)
  app.post("/api/admin/investments/cancel", (req, res) => {
    const { investmentId } = req.body;
    const inv = db.investments.find(i => i.id === investmentId);
    if (!inv) return res.status(404).json({ error: "Investment plan not found" });

    inv.status = "cancelled";

    // Refund capital to user profile
    const p = db.profiles.find(profile => profile.userId === inv.userId);
    if (p) {
      p.walletBalance += inv.amount;
      
      // Log transaction
      db.transactions.push({
        id: "tx-" + Math.random().toString(36).substr(2, 9),
        userId: inv.userId,
        type: "payout",
        amount: inv.amount,
        description: `Refunded capital of canceled/deactivated ${inv.planName} by Lumora Operations.`,
        date: new Date().toISOString()
      });

      // Add notification
      db.notifications.push({
        id: "not-" + Math.random().toString(36).substr(2, 9),
        userId: inv.userId,
        title: "Investment Plan Deactivated",
        message: `Your active plan ${inv.planName} was cancelled by administrative action. Capital of ${inv.amount} ETB has been refunded directly to your wallet.`,
        read: false,
        date: new Date().toISOString()
      });
    }

    saveDB(db);
    res.json({ success: true, investment: inv });
  });

  // View Deposits list (pending/approved/rejected)
  app.get("/api/admin/deposits", (req, res) => {
    res.json(db.deposits.sort((a,b) => b.submittedAt.localeCompare(a.submittedAt)));
  });

  // Approve/Reject deposit
  app.post("/api/admin/deposits/action", (req, res) => {
    const { depositId, action, rejectionReason } = req.body; // 'approve' | 'reject'
    const depositIndex = db.deposits.findIndex(d => d.id === depositId);
    if (depositIndex === -1) {
      return res.status(404).json({ error: "Deposit transaction not found" });
    }

    const dep = db.deposits[depositIndex];
    if (dep.status !== "pending") {
      return res.status(400).json({ error: "Deposit has already been processed" });
    }

    if (action === "approve") {
      dep.status = "approved";
      dep.reviewedAt = new Date().toISOString();

      // Find user profile to increase wallet balance!
      const p = db.profiles.find(profile => profile.userId === dep.userId);
      if (p) {
        p.walletBalance += dep.amount;
        p.totalDeposits += dep.amount;

        // Create transaction entry
        db.transactions.push({
          id: "tx-" + Math.random().toString(36).substr(2, 9),
          userId: dep.userId,
          type: "deposit",
          amount: dep.amount,
          description: "Received deposit request verified manually via CBE receipt screenshot.",
          date: new Date().toISOString()
        });

        // Add deposit approval notifications
        db.notifications.push({
          id: "not-" + Math.random().toString(36).substr(2, 9),
          userId: dep.userId,
          title: "Deposit Request Approved!",
          message: `Your manual deposit of ${dep.amount} ETB has been confirmed. funds are now active in your main balance. Ready to buy investment plans.`,
          read: false,
          date: new Date().toISOString()
        });
      }
    } else {
      dep.status = "rejected";
      dep.reviewedAt = new Date().toISOString();
      dep.rejectionReason = rejectionReason || "Invalid CBE receipt or incorrect reference metadata.";

      // Notify user
      db.notifications.push({
        id: "not-" + Math.random().toString(36).substr(2, 9),
        userId: dep.userId,
        title: "Deposit Rejected",
        message: `Your deposit of ${dep.amount} ETB was rejected. Reason: ${dep.rejectionReason}. Please contact help desk.`,
        read: false,
        date: new Date().toISOString()
      });
    }

    saveDB(db);
    res.json({ success: true, deposit: dep });
  });

  // View Withdrawals list
  app.get("/api/admin/withdrawals", (req, res) => {
    res.json(db.withdrawals.sort((a,b) => b.submittedAt.localeCompare(a.submittedAt)));
  });

  // Approve/Reject Withdrawal
  app.post("/api/admin/withdrawals/action", (req, res) => {
    const { withdrawalId, action, rejectionReason } = req.body; // 'approve' | 'reject'
    const index = db.withdrawals.findIndex(w => w.id === withdrawalId);
    if (index === -1) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    const wit = db.withdrawals[index];
    if (wit.status !== "pending") {
      return res.status(400).json({ error: "Withdrawal has already been processed" });
    }

    const p = db.profiles.find(profile => profile.userId === wit.userId);

    if (action === "approve") {
      wit.status = "approved";
      wit.reviewedAt = new Date().toISOString();

      if (p) {
        p.totalWithdrawals += wit.amount;

        // Push transaction entry (already deducted on submission)
        db.transactions.push({
          id: "tx-" + Math.random().toString(36).substr(2, 9),
          userId: wit.userId,
          type: "withdrawal",
          amount: -wit.amount,
          description: `Withdrawal of ${wit.amount} ETB successfully processed.`,
          date: new Date().toISOString()
        });

        // Notify user about approval
        db.notifications.push({
          id: "not-" + Math.random().toString(36).substr(2, 9),
          userId: wit.userId,
          title: "Withdrawal Successful!",
          message: `Your withdrawal of ${wit.amount} ETB was approved. funds are transfers to your CBE account.`,
          read: false,
          date: new Date().toISOString()
        });
      }
    } else {
      wit.status = "rejected";
      wit.reviewedAt = new Date().toISOString();
      wit.rejectionReason = rejectionReason || "Withdrawal details or secure PIN compliance rejected.";

      // Refund user wallet instantly as it was deducted on submission!
      if (p) {
        p.walletBalance += wit.amount;

        // Notify user
        db.notifications.push({
          id: "not-" + Math.random().toString(36).substr(2, 9),
          userId: wit.userId,
          title: "Withdrawal Rejected",
          message: `Your withdrawal request of ${wit.amount} ETB was rejected. Refunded: ${wit.amount} ETB. Reason: ${wit.rejectionReason}`,
          read: false,
          date: new Date().toISOString()
        });
      }
    }

    saveDB(db);
    res.json({ success: true, withdrawal: wit });
  });

  // Submit loan request (Requires VIP Level 3+)
  app.post("/api/loans/submit", (req, res) => {
    const { userId, amount, nationalId, tenureMonths } = req.body;
    if (!userId || !amount || !nationalId) {
      return res.status(400).json({ error: "Required fields: userId, amount, and nationalId" });
    }
    const p = db.profiles.find(profile => profile.userId === userId);
    if (!p) {
      return res.status(404).json({ error: "Profile not found" });
    }
    if (p.idVerificationStatus !== "verified") {
      return res.status(400).json({ error: "Your National ID has not been verified yet. Only fully verified accounts can request institutional loans." });
    }

    const userFan = p.fanNumber || "";
    if (nationalId.trim().toLowerCase() !== userFan.trim().toLowerCase()) {
      return res.status(400).json({ error: "The provided FAN number does not match your verified National ID registration details. Please enter the same FAN number associated with your verified National ID." });
    }

    // Dynamic calculations for audit log entry
    const regDate = p.registrationDate ? new Date(p.registrationDate) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - regDate.getTime());
    const membershipDurationMonths = diffTime / (1000 * 60 * 60 * 24 * 30.4375);

    const userReferrals = db.referrals.filter(r => r.referrerId === userId);
    const verifiedReferrals = userReferrals.filter(ref => {
      const rp = db.profiles.find(prof => prof.userId === ref.referredId);
      return rp && rp.idVerificationStatus === 'verified';
    });
    const verifiedReferralCount = verifiedReferrals.length;

    const belongsToEligibilityTiers = p.vipLevel >= 3;

    // Build the eligibility log document
    const checkId = "check-" + Math.random().toString(36).substr(2, 9);
    const checkLog = {
      id: checkId,
      userId,
      userName: p.fullName,
      userPhone: p.phone,
      vipLevel: p.vipLevel,
      timestamp: new Date().toISOString(),
      passed: belongsToEligibilityTiers,
      remarks: belongsToEligibilityTiers 
        ? "Passed: Member VIP Level is " + p.vipLevel
        : "Failed: Loan services are available only for members who have reached Level 3 or higher. Current level: " + p.vipLevel,
      membershipDurationMonths: Math.round(membershipDurationMonths * 10) / 10,
      verifiedReferralCount
    };

    if (!db.eligibilityChecks) {
      db.eligibilityChecks = [];
    }
    db.eligibilityChecks.push(checkLog);

    if (p.vipLevel < 3) {
      saveDB(db);
      return res.status(400).json({ error: "Loan services are available only for members who have reached Level 3 or higher." });
    }
    
    const allowedAmounts = [30000, 50000, 100000, 150000, 200000, 250000, 500000, 1000000];
    const amtNum = Number(amount);
    if (!allowedAmounts.includes(amtNum)) {
      return res.status(400).json({ error: "Invalid loan amount. Allowed amounts are: " + allowedAmounts.map(a => a.toLocaleString()).join(", ") + " ETB." });
    }

    const m = tenureMonths ? Number(tenureMonths) : 6;

    const loan: Loan = {
      id: "loan-" + Math.random().toString(36).substr(2, 9),
      userId,
      userName: p.fullName,
      userPhone: p.phone,
      vipLevel: p.vipLevel,
      amount: amtNum,
      nationalId: nationalId.trim(),
      status: "pending",
      submittedAt: new Date().toISOString(),
      tenureMonths: m
    };

    db.loans.push(loan);
    saveDB(db);

    res.json({ success: true, loan });
  });

  // Get all loans (Admin Queue)
  app.get("/api/admin/loans", (req, res) => {
    res.json(db.loans || []);
  });

  // Action on loan request (Approve/Reject)
  app.post("/api/admin/loans/action", (req, res) => {
    const { loanId, action, rejectionReason } = req.body;
    const index = db.loans.findIndex(l => l.id === loanId);
    if (index === -1) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const loan = db.loans[index];
    if (loan.status !== "pending") {
      return res.status(400).json({ error: "Loan has already been processed" });
    }

    const p = db.profiles.find(profile => profile.userId === loan.userId);

    if (action === "approve") {
      loan.status = "approved";
      loan.reviewedAt = new Date().toISOString();

      if (p) {
        p.walletBalance += loan.amount;

        // Push transaction entry
        db.transactions.push({
          id: "tx-" + Math.random().toString(36).substr(2, 9),
          userId: loan.userId,
          type: "deposit",
          amount: loan.amount,
          description: `Verified Institutional Loan of ${loan.amount} ETB successfully processed & disbursed.`,
          date: new Date().toISOString()
        });

        // Notify user about approval
        db.notifications.push({
          id: "not-" + Math.random().toString(36).substr(2, 9),
          userId: loan.userId,
          title: "Institutional Loan Approved!",
          message: `Congratulations! Your loan request of ${loan.amount} ETB has been approved and instantly credited to your wallet balance.`,
          read: false,
          date: new Date().toISOString()
        });
      }
    } else {
      loan.status = "rejected";
      loan.reviewedAt = new Date().toISOString();
      loan.rejectionReason = rejectionReason || "National ID verification did not pass the compliance audit framework.";

      // Notify user about rejection
      db.notifications.push({
        id: "not-" + Math.random().toString(36).substr(2, 9),
        userId: loan.userId,
        title: "Loan Request Rejected",
        message: `Your requested loan of ${loan.amount} ETB was rejected. Reason: ${loan.rejectionReason}`,
        read: false,
        date: new Date().toISOString()
      });
    }

    saveDB(db);
    res.json({ success: true, loan });
  });

  // Broadcaster notifications
  app.post("/api/admin/broadcast", (req, res) => {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    // Push notifications for all non-admin users
    const targetUsers = db.users.filter(u => !u.isAdmin);
    targetUsers.forEach(u => {
      db.notifications.push({
        id: "not-" + Math.random().toString(36).substr(2, 9),
        userId: u.id,
        title,
        message,
        read: false,
        date: new Date().toISOString()
      });
    });

    saveDB(db);
    res.json({ success: true, count: targetUsers.length });
  });

  // ADMIN ACTION: Reset entire system data except admin users/profiles
  app.post("/api/admin/reset-system", (req, res) => {
    try {
      const admins = db.users.filter(u => u.isAdmin);
      db.users = admins;

      const adminUserIds = new Set(admins.map(u => u.id));
      db.profiles = db.profiles.filter(p => adminUserIds.has(p.userId));

      db.investments = [];
      db.deposits = [];
      db.withdrawals = [];
      db.transactions = [];
      db.notifications = [];
      db.referrals = [];
      db.chatHistory = {};
      db.loans = [];

      saveDB(db);
      res.json({ success: true, message: "System successfully reset. All non-admin records have been erased." });
    } catch (error) {
      console.error("System reset failed:", error);
      res.status(500).json({ error: "System reset failed: " + (error instanceof Error ? error.message : String(error)) });
    }
  });

  // Support AI Assistant using @google/genai and gemini-3.5-flash
  app.post("/api/support/ai", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const client = getGeminiClient();
      if (!client) {
        return res.status(500).json({ error: "AI Support Service is not active. Please reach out to Telegram or Email Support." });
      }

      const systemInstruction = `You are the official Lumora AI Assistant.

Your purpose is to help users only with information related to the Lumora platform.

You may answer questions about:
• Investment projects
• Investment plans and returns
• Project categories and opportunities
• Deposits and withdrawals
• Account settings
• Verification requirements
• Referral and rewards programs
• Security features
• Platform rules and policies
• Terms and conditions
• Risk disclosures
• Fees and charges
• App navigation and features
• User guides and FAQs

Official Lumora Knowledge Base details:
1. VIP Investment Plans & Durations:
- **MANDATORY INVESTMENT DURATION RULE**: Users can customize the duration for each VIP level, but the investment duration **MUST ONLY** be chosen from the following explicit options: **50, 70, 90, 120, 180, 240, 360, or 720 days**. No other durations are allowed.
- VIP Level 1: Invest 5,000 ETB, earn 3.50% daily return, default runs for 50 days. Estimated total return is 13,750 ETB.
- VIP Level 2: Invest 10,000 ETB, earn 3.75% daily return, runs for 50 days. Estimated total return is 28,750 ETB.
- VIP Level 3: Invest 25,000 ETB, earn 4.00% daily return, runs for 50 days. Estimated total return is 75,000 ETB.
- VIP Level 4: Invest 50,000 ETB, earn 4.30% daily return, runs for 50 days. Estimated total return is 157,500 ETB.
- VIP Level 5: Invest 100,000 ETB, earn 4.60% daily return, runs for 70 days. Estimated total return is 422,000 ETB.
- VIP Level 6: Invest 250,000 ETB, earn 5.00% daily return, runs for 70 days. Estimated total return is 1,125,000 ETB.
- VIP Level 7: Invest 500,000 ETB, earn 5.40% daily return, runs for 70 days. Estimated total return is 2,390,000 ETB.
- VIP Level 8: Invest 1,000,000 ETB, earn 5.80% daily return, runs for 70 days. Estimated total return is 5,060,000 ETB.
- VIP Level 9: Invest 2,000,000 ETB, earn 6.20% daily return, runs for 70 days. Estimated total return is 10,680,000 ETB.
- VIP Level 10: Invest 5,000,000 ETB, earn 6.70% daily return, runs for 70 days. Estimated total return is 28,450,000 ETB.
- VIP Level 11: Invest 10,000,000 ETB, earn 7.20% daily return, runs for 90 days. Estimated total return is 74,800,000 ETB.
- VIP Level 12: Invest 25,000,000 ETB, earn 7.80% daily return, runs for 90 days. Estimated total return is 200,500,000 ETB.
- VIP Level 13: Invest 50,000,000 ETB, earn 8.50% daily return, runs for 90 days. Estimated total return is 432,500,000 ETB.
- VIP Level 14: Invest 75,000,000 ETB, earn 9.20% daily return, runs for 90 days. Estimated total return is 696,000,000 ETB.
- VIP Level 15: Invest 100,000,000 ETB, earn 10.00% daily return, runs for 120 days. Estimated total return is 1,300,000,000 ETB.

2. Lumora Investment Model & Projects:
- The funds users invest are strictly allocated to the projects they choose.
- Available projects under the dynamic Lumora model:
  • Cryptocurrency Trading
  • Forex Trading
  • Stock Investing
  • Gold & Precious Metals Investment
  • Real Estate Investment
  • Agriculture Investment
  • Peer-to-Peer Lending
  • Index Fund Investment
  • Renewable Energy Projects
  • Startup Crowdfunding
  • Bond Investments
  • Commodity Trading
- **MANDATORY PROJECT SELECTION RULE**: When activating any VIP plan, users **MUST choose at least 1 and at most 5 projects** to invest in. Capital allocation is restricted to a maximum of 5 projects for any given plan. Capital cannot be deployed unless at least 1 project is selected, with a hard cap of 5 projects.

3. Transactions:
- Primary Bank partner is Commercial Bank of Ethiopia (CBE)
- Minimum Deposit: 5,000 ETB
- Minimum Withdrawal: 600 ETB
- Payout / Yield speed: 2 to 6 hours.
- Bank account info is available in settings/profiles: Lumora CBE configuration Account Name "Leykun" and Account Number "1000419524747".

4. Account Verification:
- Verifying the user requires uploading National ID Card (Front, Back) and a selfie holding the ID card. This allows full platform compliance and unlocks high limits.

5. Referral Commission:
- 10% direct VIP level incentive on invites, set dynamically by Lumora platform authorities.

6. Official Regulatory Licensing and Trade Registry details:
- Trade Registration No.: LUM-ETH/77402-2B
- Investment License No.: LIC-984/CBE/2026
- Audited SEC Ledger: ETB-FTS-88402-SEC
- Authorized Capital Reserve: 15,000,000 ETB (Verified)
- Incorporation & Regulation: Registered and fully certified as a private asset brokerage partner under the Federal Democratic Republic of Ethiopia Trade, Industry & Investment ministry standards.

Rules:
1. Answer only using information available in Lumora's official knowledge base.
2. Never guess or invent information.
3. If information is unavailable, tell the user to contact support.
4. Do not answer questions unrelated to Lumora.
5. Do not provide financial, legal, medical, political, or general-purpose advice outside Lumora's services.
6. Keep responses professional, clear, and concise.
7. Always follow Lumora's official rules, policies, and investment guidelines.

If a question is unrelated to Lumora, reply EXACTLY with:

"I'm designed to assist only with Lumora-related questions, investment projects, platform rules, and account services.

For further assistance, please contact our support team:

📧 Email: lumorainvestmentofficial@gmail.com
📱 Telegram: @Lumora_Official_Support

How can I help you with Lumora today?"

If the requested information is not found in the Lumora knowledge base, reply EXACTLY with:

"I couldn't find that information in Lumora's official knowledge base.

Please contact our support team:

📧 Email: lumorainvestmentofficial@gmail.com
📱 Telegram: @Lumora_Official_Support"`;

      const contentsList: any[] = [];
      if (Array.isArray(history)) {
        history.forEach((h: any) => {
          contentsList.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.text }]
          });
        });
      }
      contentsList.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1
        }
      });

      res.json({ text: response.text || "" });
    } catch (error) {
      console.error("AI support assistant failed:", error);
      res.status(500).json({ error: "AI support failed: " + (error instanceof Error ? error.message : String(error)) });
    }
  });

  // End of Express API endpoints

  // Vite Integration for HMR & Production Serving as standard guidelines
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve hashed assets recursively with high-value immutable cache control (Vercel optimization)
    app.use("/assets", express.static(path.join(distPath, "assets"), {
      immutable: true,
      maxAge: "31536000000", // 1 year cache
    }));

    // Serve other generic public static files
    app.use(express.static(distPath, {
      maxAge: "0", // revalidate other public files
    }));

    // SPA fallback: Send Index.html without caching to ensure instant client hot updates!
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Central Express Error Handler Middleware (secures the server from unhandled promise rejections on routes)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Express Boundary Error] Exception encountered on ${req.method} ${req.path}:`, err);
    res.status(err.status || 500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? "An unexpected error occurred. Please contact customer support." : (err.message || String(err)),
    });
  });

  // Bind exclusively to 3000 to comply with network constraints
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LUMORA Express server running on port ${PORT}`);
  });
}

startServer();
