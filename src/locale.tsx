import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'am' | 'om' | 'ti' | 'so';

export type ExtraTranslationKey = 
  | 'lumoraVault'
  | 'portfolioGateway'
  | 'lumoraSecuredActive'
  | 'todaysYieldAccrual'
  | 'realTimePoolStream'
  | 'lockedUnderCustody'
  | 'lumoraClusterSpeed'
  | 'nextPayoutIn'
  | 'activeContractPortfolios'
  | 'compoundingProgression'
  | 'maturesInDays'
  | 'allocatedPrinciple'
  | 'dynamicYield'
  | 'accumulated'
  | 'remaining'
  | 'maturingDate'
  | 'closedAndDisbursed'
  | 'disbursed'
  | 'lumoraSecureAudit'
  | 'dailyStructuralValidation'
  | 'compoundingMultiplier'
  | 'highVelocityPayouts'
  | 'interactiveSimulator'
  | 'growthForecast'
  | 'simulateGrowth'
  | 'investmentCapital'
  | 'currentBalance'
  | 'targetDailyYield'
  | 'planDurationDays'
  | 'yieldForecastAnalytics'
  | 'maturesIn'
  | 'profit'
  | 'totalReturnPayout'
  | 'principal'
  | 'interest'
  | 'smartVipRecommendation'
  | 'rechargeRequired'
  | 'sufficientFunds'
  | 'investIn'
  | 'minLabel'
  | 'maxLabel'
  | 'customTenure'
  | 'adjustableParameters'
  | 'phoneSecurityLock'
  | 'securityLockStatus'
  | 'phoneLockActive'
  | 'phoneLockDisabled'
  | 'registerDeviceHeader'
  | 'registerSubTitle'
  | 'verifySupport'
  | 'phoneLockLinked'
  | 'establishCheckpoint'
  | 'verifyingDevice'
  | 'deviceRegistered'
  | 'institutionalLoans'
  | 'requestVerification'
  | 'viewRepayments'
  | 'repaymentMonth'
  | 'standardTerms'
  | 'simulatePayout'
  | 'statusActive'
  | 'statusBlocked'
  | 'payoutAuthorized'
  | 'cbeGuaranteedGrowth'
  | 'officialBankingPartner'
  | 'cbeSecuredPartner'
  | 'officialCbePartner'
  | 'onlineLabel'
  | 'connectNow'
  | 'twentyFourSeven'
  | 'sendMail'
  | 'faqTitle'
  | 'deviceProtected'
  | 'fingerprint'
  | 'enterPin'
  | 'retryBiometrics'
  | 'pinVerifiedSuccess'
  | 'submitAccessApp'
  | 'exitLogout'
  | 'institutionalLoansBackoffice'
  | 'disburseCapitalInstantly'
  | 'broadcastAnnouncements'
  | 'accountVerified'
  | 'verificationPending'
  | 'verificationRejected'
  | 'noticeHeader'
  | 'cbePartnershipDesc'
  | 'matureHistory'
  | 'portfolioVerified'
  | 'securedWithAuditing'
  | 'idVerification'
  | 'idFront'
  | 'idBack'
  | 'selectFront'
  | 'selectBack'
  | 'fanLabel'
  | 'idComplianceDesc'
  | 'sizeLimitError'
  | 'readError'
  | 'requiredPhotoError'
  | 'requiredFanError'
  | 'idGatewaySubTitle'
  | 'idGateGreeting'
  | 'guidingLedgerTour'
  | 'skip'
  | 'enterPlatform'
  | 'nextStep'
  | 'wtStep1Title'
  | 'wtStep1Sub'
  | 'wtStep1Desc'
  | 'wtStep1B1'
  | 'wtStep1B2'
  | 'wtStep1B3'
  | 'wtStep2Title'
  | 'wtStep2Sub'
  | 'wtStep2Desc'
  | 'wtStep2B1'
  | 'wtStep2B2'
  | 'wtStep2B3'
  | 'wtStep3Title'
  | 'wtStep3Sub'
  | 'wtStep3Desc'
  | 'wtStep3B1'
  | 'wtStep3B2'
  | 'wtStep3B3'
  | 'wtStep4Title'
  | 'wtStep4Sub'
  | 'wtStep4Desc'
  | 'wtStep4B1'
  | 'wtStep4B2'
  | 'wtStep4B3';

export interface Translations {
  appName: string;
  tagline: string;
  welcomeBack: string;
  login: string;
  register: string;
  logout: string;
  phone: string;
  password: string;
  fullName: string;
  email: string;
  confirmPassword: string;
  referralCode: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  enterValidPhone: string;
  passwordsDoNotMatch: string;
  allFieldsRequired: string;
  
  // Dashboard
  walletBalance: string;
  activeInvestments: string;
  todayEarnings: string;
  totalEarnings: string;
  vipLevel: string;
  teamEarnings: string;
  recentTransactions: string;
  notifications: string;
  quickActions: string;
  deposit: string;
  invest: string;
  withdraw: string;
  aiAssistant: string;
  transactions: string;
  
  // Navigation
  navHome: string;
  navInvestments: string;
  navEarnings: string;
  navAiAssistant: string;
  navProfile: string;
  navCard?: string;
  
  // VIP System
  vipPlans: string;
  requiredInvestment: string;
  dailyReturnRate: string;
  duration: string;
  estimatedReturn: string;
  status: string;
  buyPlan: string;
  insufficientBalance: string;
  investmentSuccess: string;
  projectedReturnEst: string;
  disclaimerText: string;
  
  // Deposit System
  depositSystem: string;
  enterAmount: string;
  uploadReceipt: string;
  cbeAccountInfo: string;
  cbeAccountName: string;
  cbeAccountNumber: string;
  depositPendingReview: string;
  submitRequest: string;
  submitReceipt: string;
  selectImage: string;
  dragDropImage: string;
  depositSuccessMsg: string;
  
  // Withdrawal System
  withdrawalSystem: string;
  transactionPin: string;
  createPin: string;
  pending: string;
  approved: string;
  rejected: string;
  withdrawalSuccessMsg: string;
  pinRequired: string;
  
  // Referral System
  referralSystem: string;
  yourReferralCode: string;
  teamSize: string;
  totalReferralRewards: string;
  inviteFriends: string;
  directReferrals: string;
  
  // AI Assistant
  aiFinancialAdvisor: string;
  askSomething: string;
  howCanIHelp: string;
  floatingChatText: string;
  voiceInput: string;
  quickQuestions: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;

  // Compliance & About
  aboutUs: string;
  agreements: string;
  companyDocs: string;
  searchDocs: string;
  complianceDisclosure: string;
  viewDetails: string;
  downloadPdf: string;
  companyOverview: string;
  mission: string;
  vision: string;
  complianceNotice: string;
  riskDisclosure: string;
  userProtection: string;
  contactInfo: string;

  // General Status & Alerts
  success: string;
  error: string;
  days: string;
  date: string;
  amount: string;
  type: string;
  description: string;
  statusLabel: string;
  noData: string;
  loading: string;
  viewAll: string;
  gatewayLabel: string;
  secureInstantTransfer: string;
  copyAccountNumber: string;
  copiedToClipboard: string;
  cbeTxRef: string;
  manualCbeReceiptCapture: string;
  fileAttached: string;
  deleteLabel: string;
  tapToSelectReceipt: string;
  fileLimitLabel: string;
  instantVerificationNotice: string;
  payoutAccrual: string;
  remainingDaysLabel: string;
  matureDateLabel: string;
  activeCapital: string;
  matureHistory: string;
  detailsButton: string;
  readAgreements: string;
  exploreMission: string;
  savePin: string;
  defaultLangSelection: string;
  recentCashoutLogs: string;
  unlocked: string;
  checkoutConfirmTitle: string;
  planDescription: string;
  deductionPrice: string;
  expectedReturn: string;
  cancel: string;
  confirm: string;
  cbeLockSecurity: string;
  aboutUsDescription: string;
  suggestedTriggers: string;
  thinking: string;
  streamNotice: string;
  howToWithdrawTitle: string;
  howToWithdrawGuide1: string;
  howToWithdrawGuide2: string;
  howToWithdrawGuide3: string;
  howToWithdrawGuide4: string;
  howToAddAccountTitle: string;
  howToAddAccount1: string;
  howToAddAccount2: string;
  howToAddAccount3: string;
  howToAddAccount4: string;
  selectCashoutAmount: string;
  selectedAmount: string;
  chooseFromChoices: string;
  withdrewLabel: string;
  editWithdrawalAccount: string;
  registerAccountAndPin: string;
  modifyDetailsDesc: string;
  registerDetailsDesc: string;
  confirmOrResetPin: string;
  choosePaymentPin: string;
  saveChanges: string;
  registerAccountButton: string;
  clickedSelectedAccount: string;
  change: string;
  day?: string;
  forgotPassword?: string;
  loginTitle?: string;
  withdrawalSuccess?: string;
  gateway?: string;
  secureTransfer?: string;
  copied?: string;
  copyAccount?: string;
  enterAmt?: string;
  txRefLabel?: string;
  uploadReceiptLabel?: string;
  fileSuccess?: string;
  delete?: string;
  tapToSelect?: string;
  fileLimit?: string;
  availableBal?: string;
  withdrawBank?: string;
  holderName?: string;
  accountNumLabel?: string;
  secureGuaranteeMsg?: string;
}

export const languages: { code: LanguageCode; name: string; short: string }[] = [
  { code: 'en', name: 'English', short: 'ENG' },
  { code: 'am', name: 'አማርኛ (Amharic)', short: 'አማርኛ' },
  { code: 'om', name: 'Afaan Oromo', short: 'OROMO' },
  { code: 'ti', name: 'ትግርኛ (Tigrinya)', short: 'ትግርኛ' },
  { code: 'so', name: 'Soomaali (Somali)', short: 'SOMALI' }
];

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appName: 'LUMORA',
    tagline: 'Smart Investing. Secure Growth.',
    welcomeBack: 'Welcome Back',
    login: 'Log In',
    register: 'Sign Up',
    logout: 'Log Out',
    phone: 'Phone Number',
    password: 'Password',
    fullName: 'Full Name',
    email: 'Email Address',
    confirmPassword: 'Confirm Password',
    referralCode: 'Referral Code (Optional)',
    dontHaveAccount: "Don't have an account? Register",
    alreadyHaveAccount: 'Already have an account? Log In',
    enterValidPhone: 'Please enter a valid phone number',
    passwordsDoNotMatch: 'Passwords do not match',
    allFieldsRequired: 'All fields are required',
    
    walletBalance: 'Wallet Balance',
    activeInvestments: 'Active Investments',
    todayEarnings: "Today's Earnings",
    totalEarnings: 'Total Earnings',
    vipLevel: 'VIP Level',
    teamEarnings: 'Team Earnings',
    recentTransactions: 'Recent Transactions',
    notifications: 'Notifications',
    quickActions: 'Quick Actions',
    deposit: 'Deposit',
    invest: 'Invest Plans',
    withdraw: 'Withdraw',
    aiAssistant: 'Support',
    transactions: 'History',
    
    navHome: 'Home',
    navInvestments: 'Plans',
    navEarnings: 'Earnings',
    navAiAssistant: 'Support',
    navProfile: 'Profile',
    
    vipPlans: 'VIP Investment Plans',
    requiredInvestment: 'Min Investment',
    dailyReturnRate: 'Daily Return Rate',
    duration: 'Duration',
    estimatedReturn: 'Est. Total Return',
    status: 'Status',
    buyPlan: 'Purchase Plan',
    insufficientBalance: 'Insufficient Wallet Balance',
    investmentSuccess: 'Investment plan purchased successfully!',
    projectedReturnEst: 'All activated plans accrue daily payouts with absolute structural certainty and full backing.',
    disclaimerText: 'LUMORA is a trusted, secure private investment platform. All user investments and funds are 100% safe, capital guaranteed, and fully secured by physical reserves under Lumora’s independent secure governance.',
    
    depositSystem: 'Deposit Funds',
    enterAmount: 'Amount (ETB)',
    uploadReceipt: 'Upload CBE Bank Receipt Image',
    cbeAccountInfo: 'Official CBE Bank Details',
    cbeAccountName: 'Commercial Bank of Ethiopia (CBE)',
    cbeAccountNumber: 'Account Number: 1000419524747',
    depositPendingReview: 'Please write transaction reference ID. The receipt will be reviewed shortly.',
    submitRequest: 'Submit Deposit Request',
    submitReceipt: 'Submit Receipt',
    selectImage: 'Select Receipt Image',
    dragDropImage: 'Drag & drop bank receipt image here',
    depositSuccessMsg: 'Deposit request submitted successfully! Pending review.',
    
    withdrawalSystem: 'Withdraw Earnings',
    transactionPin: 'Transaction PIN',
    createPin: 'Set 4-Digit PIN (First-time Withdrawal)',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    withdrawalSuccessMsg: 'Withdrawal request submitted successfully!',
    pinRequired: 'Secure 4-Digit PIN is required for withdrawals',
    
    referralSystem: 'Referral Network',
    yourReferralCode: 'Your Invite Code',
    teamSize: 'My Team Size',
    totalReferralRewards: 'Total Referral Bonus',
    inviteFriends: 'Invite friends to earn 10% on direct VIP activation plans!',
    directReferrals: 'Direct Referrals',
    
    aiFinancialAdvisor: 'LUMORA AI Financial Agent',
    askSomething: 'Ask about VIP plans, deposits, or investments...',
    howCanIHelp: 'Hello! I am your AI Investment Companion. I can help explain VIP levels, calculations, CBE deposits, or help you navigate the system.',
    floatingChatText: 'Need Help? Ask AI Agent',
    voiceInput: 'Voice Input',
    quickQuestions: 'Suggested questions:',
    q1: 'How do I active VIP Plan 2?',
    q2: 'Explain daily interest calculation',
    q3: 'Is there a capital guarantee for my investment?',
    q4: 'How does the deposit receipt approval work?',

    aboutUs: 'About LUMORA',
    agreements: 'Company Agreements',
    companyDocs: 'Official Documentation',
    searchDocs: 'Search compliance documents...',
    complianceDisclosure: 'LUMORA is a premier private investment framework. All user investments and funds are 100% safe, capital protected, and fully secured by independent physical reserves under our direct auditing guidelines.',
    viewDetails: 'Read Document',
    downloadPdf: 'Download PDF Copy',
    companyOverview: 'Company Overview',
    mission: 'Our Mission',
    vision: 'Our Vision',
    complianceNotice: 'Official Compliance Guideline',
    riskDisclosure: 'Secure Partnership Investment',
    userProtection: 'Secured Client Protection Act',
    contactInfo: 'Contact & Support Details',

    success: 'Success',
    error: 'Error',
    days: 'days',
    date: 'Date',
    amount: 'Amount',
    type: 'Type',
    description: 'Description',
    statusLabel: 'Status',
    noData: 'No entry found',
    loading: 'Processing...',
    viewAll: 'View All',
    gatewayLabel: 'Gateway',
    secureInstantTransfer: 'SECURE INSTANT TRANSFER',
    copyAccountNumber: 'Copy Account Number',
    copiedToClipboard: 'Copied to Clipboard!',
    cbeTxRef: 'CBE Transaction Reference / ID',
    manualCbeReceiptCapture: 'Manual CBE Receipt Capture',
    fileAttached: 'File attached successfully',
    deleteLabel: 'Delete',
    tapToSelectReceipt: 'Tap to select or capture receipt image',
    fileLimitLabel: 'JPG/PNG limit 2MB',
    instantVerificationNotice: 'Transactions are verified instantly. Manual CBE audits finalize within 2 hours.',
    payoutAccrual: "Today's Accrual",
    remainingDaysLabel: 'Remaining days',
    matureDateLabel: 'Matures date',
    activeCapital: 'Active Capital',
    matureHistory: 'Matured Portfolios',
    detailsButton: 'Read Document',
    readAgreements: 'Read Agreements',
    exploreMission: 'Explore Mission',
    savePin: 'Save Security PIN',
    defaultLangSelection: 'Default language Preference',
    recentCashoutLogs: 'Recent Cashout Logs',
    unlocked: 'Unlocked',
    checkoutConfirmTitle: 'Confirm Purchase',
    planDescription: 'Plan Description',
    deductionPrice: 'Deduction Price',
    expectedReturn: 'Expected Return',
    cancel: 'Cancel',
    confirm: 'Confirm',
    cbeLockSecurity: 'CBE Lock Security Details',
    aboutUsDescription: 'Learn more about clean financial models & compliance safeguards.',
    suggestedTriggers: 'Suggested triggers',
    thinking: 'LUMORA Agent is thinking...',
    streamNotice: 'Listening & transcribing stream... speak clearly in English/Amharic',
    howToWithdrawTitle: 'How to Withdraw Your Earnings',
    howToWithdrawGuide1: 'Verify Registered Account: Make sure your active bank details are selected in the green container. To change them, click the blue "Change ➔" link.',
    howToWithdrawGuide2: 'Enter Cashout Amount: Minimum withdrawal is 600 ETB. Ensure your request does not exceed your available balance.',
    howToWithdrawGuide3: 'Input Security PIN: Type the secret 4-digit Payment PIN code you configured during setup.',
    howToWithdrawGuide4: 'Authorization & Queue: Click "Authorize Secure Withdrawal". Our manual audit desk processes all requests sequentially within 1-2 hours.',
    howToAddAccountTitle: 'How to Add a Withdrawal Account',
    howToAddAccount1: 'Select Your Bank/Wallet: Choose your correct bank (e.g. CBE, Awash, Dashen, Abyssinia) or mobile money wallet (telebirr, CBE Birr) from the list.',
    howToAddAccount2: 'Account Holder Name: Enter your true legal name matching exactly with your official bank registration record to guarantee successful settlement.',
    howToAddAccount3: 'Account Number/Phone: Input your exact bank account number or your registered mobile money payment card coordinates.',
    howToAddAccount4: 'Set Security PIN: Choose a private 4-digit Payment PIN. This code is required to safely validate future cashout requests.',
    selectCashoutAmount: 'Select Cashout Amount Choice',
    selectedAmount: 'Selected Amount:',
    chooseFromChoices: 'Choose from choices below',
    withdrewLabel: 'WITHDREW',
    editWithdrawalAccount: 'Edit / Update Withdrawal Account',
    registerAccountAndPin: 'Register Account & PIN Code',
    modifyDetailsDesc: 'Modify your registered Ethiopian bank details or update your secure 4-digit payment authentication PIN.',
    registerDetailsDesc: 'Register your designated Ethiopian bank details and secure a 4-digit payment PIN code to authorize active withdrawals.',
    confirmOrResetPin: 'Confirm or Reset 4-Digit payment PIN',
    choosePaymentPin: 'Choose 4-Digit Payment PIN',
    saveChanges: 'Save Changes',
    registerAccountButton: 'Register Account',
    clickedSelectedAccount: 'Clicked & Selected Account',
    change: 'Change ➔'
  },
  am: {
    appName: 'LUMORA',
    tagline: 'ብልህ ኢንቨስትመንት። አስተማማኝ እድገት።',
    welcomeBack: 'እንኳን ደህና መጡ',
    login: 'ይግቡ',
    register: 'ይመዝገቡ',
    logout: 'ይውጡ',
    phone: 'ስልክ ቁጥር',
    password: 'የይለፍ ቃል',
    fullName: 'ሙሉ ስም',
    email: 'ኢሜይል አድራሻ',
    confirmPassword: 'የይለፍ ቃል ያረጋግጡ',
    referralCode: 'የሪፈራል ኮድ (ከተፈለገ)',
    dontHaveAccount: 'አካውንት የለዎትም? ይመዝገቡ',
    alreadyHaveAccount: 'አካውንት አለዎት? ይግቡ',
    enterValidPhone: 'ትክክለኛ ስልክ ቁጥር ያስገቡ',
    passwordsDoNotMatch: 'የይለፍ ቃሎች አይዛመዱም',
    allFieldsRequired: 'ሁሉም መስኮች መሞላት አለባቸው',
    
    walletBalance: 'የኪስ ሂሳብ (Wallet)',
    activeInvestments: 'ንቁ ኢንቨስትመንቶች',
    todayEarnings: 'የዛሬው ገቢ',
    totalEarnings: 'አጠቃላይ ገቢ',
    vipLevel: 'የቪአይፒ (VIP) ደረጃ',
    teamEarnings: 'የቡድን ገቢ',
    recentTransactions: 'የቅርብ ጊዜ ዝውውሮች',
    notifications: 'ማሳወቂያዎች',
    quickActions: 'ፈጣን ድርጊቶች',
    deposit: 'ገንዘብ አስገባ',
    invest: 'የቪአይፒ ዕቅዶች',
    withdraw: 'ገንዘብ አውጣ',
    aiAssistant: 'የደንበኞች አገልግሎት',
    transactions: 'ታሪክ',
    
    navHome: 'መነሻ',
    navInvestments: 'ዕቅዶች',
    navEarnings: 'ገቢዎች',
    navAiAssistant: 'ድጋፍ',
    navProfile: 'መገለጫ',
    
    vipPlans: 'የቪአይፒ ኢንቨስትመንት ዕቅዶች',
    requiredInvestment: 'አነስተኛ ኢንቨስትመንት',
    dailyReturnRate: 'ዕለታዊ የትርፍ መጠን',
    duration: 'ቆይታ',
    estimatedReturn: 'የታሰበው ጠቅላላ ገቢ',
    status: 'ሁኔታ',
    buyPlan: 'ዕቅድ ግዛ',
    insufficientBalance: 'በቂ የኪስ ሂሳብ የለዎትም',
    investmentSuccess: 'የኢንቨስትመንት ዕቅዱን በተሳካ ሁኔታ ገዝተዋል!',
    projectedReturnEst: 'ሁሉም የነቁ ዕቅዶች ፍጹም በሆነ መዋቅራዊ እርግጠኝነት እና ሙሉ ድጋፍ ዕለታዊ ክፍያዎችን ያከማቻሉ።',
    disclaimerText: 'LUMORA ከኢትዮጵያ ንግድ ባንክ (CBE) ጋር ይፋዊ አጋር ነው። ሁሉም የተጠቃሚዎች ኢንቨስትመንቶች እና ገንዘብ 100% አስተማማኝ፣ ካፒታላቸው የተጠበቀ እና በባንክ በተደገፉ አካላዊ ክምችቶች የተረጋገጠ ዋስትና አላቸው።',
    
    depositSystem: 'ገንዘብ ማስገቢያ',
    enterAmount: 'የገንዘብ መጠን (ETB)',
    uploadReceipt: 'የኢትዮጵያ ንግድ ባንክ (CBE) ደረሰኝ ፎቶ ያስገቡ',
    cbeAccountInfo: 'ኦፊሴላዊ የCBE ባንክ ዝርዝሮች',
    cbeAccountName: 'የኢትዮጵያ ንግድ ባንክ (CBE)',
    cbeAccountNumber: 'የአካውንት ቁጥር: 1000419524747',
    depositPendingReview: 'እባክዎ የማጣቀሻ ቁጥር (Reference) ይጻፉ። ደረሰኙ በአጭር ጊዜ ውስጥ ይገመገማል።',
    submitRequest: 'የተቀማጭ ጥያቄውን ላክ',
    submitReceipt: 'ደረሰኙን ላክ',
    selectImage: 'ደረሰኝ ምረጥ',
    dragDropImage: 'የባንክ ደረሰኝ ምስል እዚህ ጋር ያስቀምጡ',
    depositSuccessMsg: 'የተቀማጭ ጥያቄው በተሳካ ሁኔታ ተልኳል! በሂደት ላይ ነው።',
    
    withdrawalSystem: 'ገንዘብ ማውጫ',
    transactionPin: 'የዝውውር ፒን (PIN)',
    createPin: 'አዲስ ባለ 4 አሃዝ ፒን ያዘጋጁ (ለመጀመሪያ ጊዜ ማውጫ)',
    pending: 'በመጠባበቅ ላይ',
    approved: 'የጸደቀ',
    rejected: 'የተገፋ',
    withdrawalSuccessMsg: 'የገንዘብ ማውጫው ጥያቄ በተሳካ ሁኔታ ተልኳል!',
    pinRequired: 'ደህንነቱ የተጠበቀ ባለ 4 አሃዝ ፒን ለገንዘብ ማውጣት ያስፈልጋል',
    
    referralSystem: 'የግብዣ መረብ',
    yourReferralCode: 'የእርስዎ የግብዣ ኮድ',
    teamSize: 'የኔ ቡድን አባላት ብዛት',
    totalReferralRewards: 'አጠቃላይ የሪፈራል ጉርሻ',
    inviteFriends: 'ጓደኞችን ይጋብዙ እና ቀጥተኛ የቪአይፒ ዕቅድ ሲያነቁ 10% ያግኙ!',
    directReferrals: 'ቀጥተኛ ግብዣዎች',
    
    aiFinancialAdvisor: 'LUMORA አይ የፋይናንስ ረዳት',
    askSomething: 'ስለ ቪአይፒ ዕቅዶች ፣ ማስቀመጫዎች ወይም ኢንቨስትመንቶች ይጠይቁ...',
    howCanIHelp: 'ሰላም! እኔ የእርስዎ የLUMORA አይ ረዳት ነኝ። ስለ ቪአይፒ ዕቅዶች፣ ወለድ ስሌት፣ ስለ ንግድ ባንክ ደረሰኝ ማስገባት ወይም መተግበሪያውን ስለመጠቀም ላግዝዎት እችላለሁ።',
    floatingChatText: 'እርዳታ ይፈልጋሉ? የአይ ረዳቱን ይጠይቁ',
    voiceInput: 'የድምጽ ግብዓት',
    quickQuestions: 'የተጠቆሙ ጥያቄዎች:',
    q1: 'የቪአይፒ ደረጃ 2ን እንዴት ማንቃት እችላለሁ?',
    q2: 'የዕለታዊ ወለድ ስሌትን አስረዳኝ',
    q3: 'ለእኔ ኢንቬስትመንት የካፒታል ዋስትና አለ?',
    q4: 'የተቀማጭ ደረሰኝ ግምገማ እንዴት ይሰራል?',

    aboutUs: 'ስለ LUMORA',
    agreements: 'የድርጅት ስምምነቶች',
    companyDocs: 'ኦፊሴላዊ ሰነዶች',
    searchDocs: 'ሰነዶችን ይፈልጉ...',
    complianceDisclosure: 'LUMORA ከኢትዮጵያ ንግድ ባንክ (CBE) ጋር ይፋዊ አጋር ነው። ሁሉም የተጠቃሚዎች ኢንቨስትመንቶች እና ገንዘብ 100% አስተማማኝ፣ ካፒታላቸው የተጠበቀ እና በባንክ በተደገፉ አካላዊ ክምችቶች የተጠበቁ ናቸው።',
    viewDetails: 'ሰነዱን ያንብቡ',
    downloadPdf: 'ፒዲኤፍ አውርድ',
    companyOverview: 'ስለ ኩባንያው',
    mission: 'ተልዕኮ',
    vision: 'ራዕይ',
    complianceNotice: 'ኦፊሴላዊ ተገዢነት ደንብ',
    riskDisclosure: 'አስተማማኝ የሽርክና ኢንቨስትመንት',
    userProtection: 'የተጠቃሚዎች ጥበቃ ሕግ',
    contactInfo: 'የእውቂያ እና የድጋፍ መረጃ',

    success: 'ተሳክቷል',
    error: 'ስህተት',
    days: 'ቀኖች',
    date: 'ቀን',
    amount: 'መጠን',
    type: 'ዓይነት',
    description: 'መግለጫ',
    statusLabel: 'ሁኔታ',
    noData: 'ምንም መረጃ የለም',
    loading: 'በመካሄድ ላይ...',
    viewAll: 'ሁሉንም አሳይ',
    gatewayLabel: 'ክፍያ በር',
    secureInstantTransfer: 'ደህንነቱ የተጠበቀ ፈጣን ማስተላለፊያ',
    copyAccountNumber: 'የሂሳብ ቁጥር ቅዳ',
    copiedToClipboard: 'ኮፒ ተደርጓል!',
    cbeTxRef: 'የንግድ ባንክ (CBE) የዝውውር ማጣቀሻ ቁጥር (Reference)',
    manualCbeReceiptCapture: 'የባንክ ደረሰኝ ፎቶ ማስገቢያ',
    fileAttached: 'ደረሰኙ በተሳካ ሁኔታ ተያይዟል',
    deleteLabel: 'ሰርዝ',
    tapToSelectReceipt: 'ደረሰኝ ለመምረጥ እዚህ ይጫኑ',
    fileLimitLabel: 'የምስል መጠን ገደብ 2MB',
    instantVerificationNotice: 'ማስቀመጫዎች በተሳካ ሁኔታ ይረጋገጣሉ። የCBE ማረጋገጫ በ2 ሰዓት ውስጥ ይጠናቀቃል።',
    payoutAccrual: 'የዛሬ የተጠራቀመ ወለድ',
    remainingDaysLabel: 'የቀሩት ቀናት',
    matureDateLabel: 'የማለቂያ ቀን',
    activeCapital: 'ዋና ኢንቨስትመንት (Capital)',
    matureHistory: 'ያለቁ/የማለቁ ፖርትፎሊዮዎች',
    detailsButton: 'ሰነዱን አንብብ',
    readAgreements: 'ስምምነቶችን አንብብ',
    exploreMission: 'ራዕያችንን ተመልከት',
    savePin: 'የደህንነት ፒን አስቀምጥ',
    defaultLangSelection: 'ነባሪ የቋንቋ ምርጫ',
    recentCashoutLogs: 'የቅርብ ጊዜ ገንዘብ ማውጣት ታሪክ',
    unlocked: 'የተከፈተ (Active)',
    checkoutConfirmTitle: 'ግዢውን ያረጋግጡ',
    planDescription: 'የዕቅድ ማብራሪያ',
    deductionPrice: 'የኢንቨስትመንት መጠን',
    expectedReturn: 'የሚጠበቀው ትርፍ',
    cancel: 'ይቅር',
    confirm: 'አረጋግጥ',
    cbeLockSecurity: 'የCBE ደህንነት ቁልፍ ዝርዝሮች',
    aboutUsDescription: 'ስለ ህጋዊ የፋይናንስ ሞዴሎች እና ተገዢነት ደህንነት የበለጠ ይረዱ።',
    suggestedTriggers: 'የተጠቆሙ ጥያቄዎች',
    thinking: 'የLUMORA ረዳት እያሰበ ነው...',
    streamNotice: 'ድምፅዎን እያዳመጥን እና እየጻፍን ነው... በእንግሊዝኛ/በአማርኛ በግልፅ ይናገሩ',
    howToWithdrawTitle: 'ገቢዎን እንዴት እንደሚያወጡ',
    howToWithdrawGuide1: 'የተመዘገበ አካውንት ያረጋግጡ፡ ትክክለኛው የባንክ መረጃ በባንኩ አረንጓዴ ሳጥን ውስጥ መመረጡን ያረጋግጡ። ለመቀየር ሰማያዊውን "ቀይር ➔" ሊንክ ይጫኑ።',
    howToWithdrawGuide2: 'የደህንነት ፒን (PIN) ያስገቡ፡ አካውንትዎን ሲያዘጋጁ የፈጠሩትን ሚስጥራዊ ባለ 4-አሃዝ የክፍያ ፒን ያስገቡ።',
    howToWithdrawGuide3: 'የክፍያ ፒን ያስገቡ፡ አካውንት ሲመዘግቡ የፈጠሩትን ባለ 4-አሃዝ የክፍያ ፒን ኮድዎን ያስገቡ።',
    howToWithdrawGuide4: 'ፈቃድ እና መስመር፡ "ገንዘብ አውጣ" የሚለውን ይጫኑ። የኦዲት ባለሙያዎቻችን በ1-2 ሰዓታት ውስጥ ያረጋግጣሉ።',
    howToAddAccountTitle: 'የገንዘብ ማውጫ አካውንት እንዴት እንደሚጨምሩ',
    howToAddAccount1: 'ባንክ/ዋሌት ይምረጡ፡ ከዝርዝሩ ውስጥ ትክክለኛውን ባንክ (ለምሳሌ የኢትዮጵያ ንግድ ባንክ (CBE)፣ አዋሽ፣ ዳሽን፣ አቢሲኒያ) ወይም የሞባይል ገንዘብ (ቴሌብር፣ CBE Birr) ይምረጡ።',
    howToAddAccount2: 'የአካውንት ባለቤት ስም፡ ክፍያዎ በተሳካ ሁኔታ እንዲከናወን ከእርስዎ እውነተኛ የባንክ ምዝገባ መረጃ ጋር የሚዛመድ ሙሉ ስምዎን ያስገቡ።',
    howToAddAccount3: 'የአካውንት ቁጥር/ስልክ፡ ትክክለኛውን የባንክ አካውንት ቁጥርዎን ወይም የሞባይል ገንዘብ ስልክ ቁጥርዎን ያስገቡ።',
    howToAddAccount4: 'የደህንነት ፒን ይምረጡ፡ ሚስጥራዊ ባለ 4-አሃዝ የክፍያ ፒን ኮድ ይፍጠሩ። ይህ ኮድ ለወደፊቱ ገንዘብ ሲያወጡ ሂሳቡን በደህንነት ለማረጋገጥ ያስፈልጋል።',
    selectCashoutAmount: 'የገንዘብ ማውጫ መጠን ይምረጡ',
    selectedAmount: 'የተመረጠው መጠን:',
    chooseFromChoices: 'ከታች ካሉት አማራጮች ይምረጡ',
    withdrewLabel: 'ገንዘብ አውጣ',
    editWithdrawalAccount: 'የገንዘብ ማውጫ አካውንት ያስተካክሉ',
    registerAccountAndPin: 'አካውንት እና የፒን ኮድ ይመዝግቡ',
    modifyDetailsDesc: 'የተመዘገበውን የባንክ መረጃዎን ያስተካክሉ ወይም ሚስጥራዊ ባለ 4-አሃዝ የክፍያ ፒን ኮድዎን ያሻሽሉ።',
    registerDetailsDesc: 'የኢትዮጵያ ባንክ መረጃዎን ይመዝግቡ እና ገንዘብ ለማውጣት የሚያገለግል ባለ 4-አሃዝ የክፍያ ፒን ኮድ በደህንነት ይፍጠሩ።',
    confirmOrResetPin: 'ባለ 4-አሃዝ የክፍያ ፒን ያረጋግጡ ወይም በድጋሚ ያዘጋጁ',
    choosePaymentPin: 'ባለ 4-አሃዝ የክፍያ ፒን ይምረጡ',
    saveChanges: 'ለውጦችን አስቀምጥ',
    registerAccountButton: 'አካውንት ይመዝግቡ',
    clickedSelectedAccount: 'ተመርጦ የገባ አካውንት',
    change: 'ቀይር ➔'
  },
  om: {
    appName: 'LUMORA',
    tagline: 'Inveestment Bilsha. Guddina Amansiisaa.',
    welcomeBack: 'Baga Nagaan Deebitan',
    login: 'Seeni',
    register: 'Galmaa’i',
    logout: 'Ba’i',
    phone: 'Lakkoofsa Bilbilaa',
    password: 'Jecha Iccitii',
    fullName: 'Maqaa Guutuu',
    email: 'Teessoo Imeelii',
    confirmPassword: 'Jecha Iccitii Mirkaneessi',
    referralCode: 'Koodii Dabarsaa (Filannoo)',
    dontHaveAccount: 'Hojii herregaa hin qabduu? Galmaa’i',
    alreadyHaveAccount: 'Hojii herregaa qabduu? Seeni',
    enterValidPhone: 'Maaloo lakkoofsa bilbilaa sirrii galchaa',
    passwordsDoNotMatch: 'Jechi iccitii wal hin fudhatu',
    allFieldsRequired: 'Iddoowwan hundi guutamuu qabu',
    
    walletBalance: 'Herrega Kiisii',
    activeInvestments: 'Inveestimentii Hojirra Jiru',
    todayEarnings: 'Galii Har’aa',
    totalEarnings: 'Waliigala Galii',
    vipLevel: 'Sadarkaa VIP',
    teamEarnings: 'Galii Garee',
    recentTransactions: 'Daddabarsa Dhiheenyaa',
    notifications: 'Beeksisa',
    quickActions: 'Hojii Saffisaa',
    deposit: 'Galii Gochi',
    invest: 'Karoora VIP',
    withdraw: 'Baasii Gochi',
    aiAssistant: 'Deeggarsa',
    transactions: 'Seenaa',
    
    navHome: 'Mana',
    navInvestments: 'Karoorota',
    navEarnings: 'Galiiwwan',
    navAiAssistant: 'Deeggarsa',
    navProfile: 'Eenyummeessa',
    
    vipPlans: 'Karoorota Inveestimentii VIP',
    requiredInvestment: 'Inveestimentii Xiqqaa',
    dailyReturnRate: 'Diriira Bu’aa Guyyaa',
    duration: 'Turtii',
    estimatedReturn: 'Tilmaama Waliigala Bu’aa',
    status: 'Haala',
    buyPlan: 'Karoora Bitadhu',
    insufficientBalance: 'Herregni kiisii keessan gahaa miti',
    investmentSuccess: 'Karoorri inveestimentii milkiidhaan bitameera!',
    projectedReturnEst: 'Karoorri hojiirra jiru hundi dakhlii guyyaa hundaa amansiisaa ta’een guutumaan guutuutti ni kuusa.',
    disclaimerText: 'LUMORA\'n dhaabbata investimantii dhuunfaa abdiidha. Investimantii fi maallaqni fayyadamaa hundis 100% wabii guutuu qabu, kapiitaalli eegamaadha.',
    
    depositSystem: 'Maallaqa Galchuun',
    enterAmount: 'Hamma Maallaqaa (ETB)',
    uploadReceipt: 'Suuraa Ragaa Baankii CBE Galchi',
    cbeAccountInfo: 'Odeeffannoo Baankii CBE',
    cbeAccountName: 'Commercial Bank of Ethiopia (CBE)',
    cbeAccountNumber: 'Lakkoofsa Herregaa: 1000419524747',
    depositPendingReview: 'Maaloo ragaa daddabarsaa barreessi. Ragaan daqiiqaa muraasa keessatti sakatta’ama.',
    submitRequest: 'Eenyummeessa ergi',
    submitReceipt: 'Risiidii Galchi',
    selectImage: 'Ragaa Filadhu',
    dragDropImage: 'Suuraa ragaa baankii as keessa kaa’i',
    depositSuccessMsg: 'Gaaffiin maallaqa galchuu milkiidhaan dhiyaateera! Sakatta’ama jira.',
    
    withdrawalSystem: 'Maallaqa Baasuu',
    transactionPin: 'PIN Daddabarsa',
    createPin: 'PIN Diijitii 4 Uumi (Yeroo jalqabaaf)',
    pending: 'Eeggannoo',
    approved: 'Mirkanaa’e',
    rejected: 'Didame',
    withdrawalSuccessMsg: 'Gaaffiin maallaqa baasuu milkiidhaan dhiyaateera!',
    pinRequired: 'Baasii gochuuf PIN diijitii 4 eegumsa qabu barbaachisaadha',
    
    referralSystem: 'Siriiba Affeerraa',
    yourReferralCode: 'Koodii Affeerraa Keessan',
    teamSize: 'Baay’ina Garee Koo',
    totalReferralRewards: 'Badhaasa Affeerraa Waliigalaa',
    inviteFriends: 'Hiriyoota affeeraa, yeroo isaan karoora VIP hojiitti hiikan 10% argadhaa!',
    directReferrals: 'Affeerraa Kallattii',
    
    aiFinancialAdvisor: 'LUMORA Gargaaraa Gorsa Maallaqaa AI',
    askSomething: 'Waa’ee karoora VIP, galchuun ykn maallaqaa gaafadhu...',
    howCanIHelp: 'Akkam jirtu! Ani Gargaaraa AI LUMORA ti. Waa’ee sadarkaa VIP, herrega guyyaa, ragaa CBE galchuun ykn sirnichatti fayyadamuu isiniif gargaaruu danda’a.',
    floatingChatText: 'Gargaarsi Barbaachisee? AI gaafadhu',
    voiceInput: 'Giriiba Sagalee',
    quickQuestions: 'Gaaffii dhiyeeffame:',
    q1: 'Karoora VIP 2 akkamitti hojiitti hiika?',
    q2: 'Herrega guyyaa guyyaatti bu’aa ibsi',
    q3: 'investimantiikootiif wabii kapiitaalaa ni jiraa?',
    q4: 'Sakatta’ame ragaa galchuu akkamitti hojjata?',

    aboutUs: 'Waa’ee LUMORA',
    agreements: 'Waliigaltee Kuullee',
    companyDocs: 'Sanadoota Ofisilaa',
    searchDocs: 'Sanadoota barbaadi...',
    complianceDisclosure: 'LUMORA\'n sirna investimantii dhuunfaa adda dureedha. Investimantii fi maallaqni fayyadamaa hundis 100% wabii guutuu qabu, kapiitaalli eegamaadha.',
    viewDetails: 'Sanada Dubbisi',
    downloadPdf: 'PDF Buufadhu',
    companyOverview: 'Maali Dhaabbaticha',
    mission: 'Ergama',
    vision: 'Mul’ata',
    complianceNotice: 'Akeekkachiisa Ofisilaa',
    riskDisclosure: 'Investimantii Wadaalichaa Nageenyaa',
    userProtection: 'Seera Eegumsa Fayyadamtootaa',
    contactInfo: 'Odeeffannoo Quunnamtii fi Deeggarsaa',

    success: 'Milkaa’e',
    error: 'Dogoggora',
    days: 'guyyoota',
    date: 'Guyyaa',
    amount: 'Hamma',
    type: 'Gosa',
    description: 'Ibsa',
    statusLabel: 'Haala',
    noData: 'Odeeffannoon hin argamne',
    loading: 'Hojirra jira...',
    viewAll: 'Hunda Agarsiisi',
    gatewayLabel: 'Kallattii Kaffaltii',
    secureInstantTransfer: 'DARBIIN DAFAKAA AMANAMAADHA',
    copyAccountNumber: 'Lakkoofsa Herregaa Koppisi',
    copiedToClipboard: 'Koppiidhaan fudhatameera!',
    cbeTxRef: 'Lakkoofsa Tixraaca Xawaalaa CBE',
    manualCbeReceiptCapture: 'Koppii Risidii Baankii CBE',
    fileAttached: 'Fayilli milkiidhaan qabsiifameera',
    deleteLabel: 'Haqi',
    tapToSelectReceipt: 'Risidii filachuuf ykn fakkii kaasuuf cuqaasi',
    fileLimitLabel: 'Daangaa JPG/PNG 2MB',
    instantVerificationNotice: 'Kaffaltiin battalatti mirkanaa’a. Kaalculation CBE sa’aatii 2 keessatti xumurama.',
    payoutAccrual: 'Kuufama Har’aa',
    remainingDaysLabel: 'Guyyoota Hafan',
    matureDateLabel: 'Guyyaa Dhumaa',
    activeCapital: 'Kappitaala Hojii',
    matureHistory: 'Poortifoliyoo Bilchaate',
    detailsButton: 'Sanada Dubbisi',
    readAgreements: 'Waliigaltee Dubbisuun',
    exploreMission: 'Ergaa Keenya Ilaalaa',
    savePin: 'PIN Nageenyaa Securiiti Keenyi',
    defaultLangSelection: 'Filannoo Lugha Default',
    recentCashoutLogs: 'Galmee Baasii Dhiyoo',
    unlocked: 'Banaadha',
    checkoutConfirmTitle: 'Bittaa Mirkaneessi',
    planDescription: 'Ibsa Karooraa',
    deductionPrice: 'Gatii Maallaqaa',
    expectedReturn: 'Bu’aa Eegamu',
    cancel: 'Haqi',
    confirm: 'Mirkaneessi',
    cbeLockSecurity: 'Ibsa Nageenya CBE Cufame',
    aboutUsDescription: 'Waa’ee dambiiwwan maallaqaa fi eegumsa seeraa dubbisaa.',
    suggestedTriggers: 'Gaaffiwwan Dhiyatan',
    thinking: 'Kalkaaliyaan LUMORA yaadaa jira...',
    streamNotice: 'Dhaggeeffachaa fi barreessaa jirra... Afaan Ingiliffaa/Amaariffaan qulqulleessee dubbadhu',
    howToWithdrawTitle: 'Akkaataa Dakhlii Keessan Itti Baastan',
    howToWithdrawGuide1: 'Lakk Kofii Mirkaneessi: Odeeffannoon baankii keessan saanduqa margaa keessatti filatamee jiraachuu isaa mirkaneessi. Jijjiiruuf "Jijjiiri ➔" kan jedhu tuqi.',
    howToWithdrawGuide2: 'Hangaa Maallaqaa Galchi: Gadi aanaan maallaqa baasuu 600 ETB dha. Hangii gaafattan dandeettii herrega keessanii ol ta\'uu hin qabu.',
    howToWithdrawGuide3: 'PIN Iddoo Galchi: Lakkoofsa PIN iccitii digitii 4 yeroo konfigur gootan uumtan galchi.',
    howToWithdrawGuide4: 'Hayyamuufi Hiriira: Tabba "Mirkaneessi" jedhu tuqi. Gareen keenya gaaffii hunda tartiiba sa\'aatii 1-2 keessatti qulqulleessa.',
    howToAddAccountTitle: 'Akkaataa Herrega Maallaqa Baasuu Itti Dabalan',
    howToAddAccount1: 'Baankii/Waleetii Keessan Filadhaa: Baankii keessan sirrii (fakkeenyaaf CBE, Awash, Dashen, Abyssinia) ykn moobaayila maallaqaa (telebirr, CBE Birr) tarree keessaa filadhaa.',
    howToAddAccount2: 'Maqaa Abbaa Herregaa: Maqaa keessan seeraa herrega baankii keessanii wajjin tokko ta\'e galchaa.',
    howToAddAccount3: 'Lakkoofsa Herregaa/Bilbilaa: Lakkoofsa herrega baankii keessanii sirrii ykn lakkoofsa bilbilaa kofii galchaa.',
    howToAddAccount4: 'PIN Ammasuuf: Lakkoofsa PIN digitii 4 iccitii uumaa. Kunis gara fuulduraatti maallaqa baasuaf qulqulleessa.',
    selectCashoutAmount: 'Hangaa Maallaqa Baasuu Filadhaa',
    selectedAmount: 'Hangaa Filatame:',
    chooseFromChoices: 'Akaakuu armaan gadii keessaa filadhaa',
    withdrewLabel: 'BAASII GOCHII',
    editWithdrawalAccount: 'Herrega Maallaqa Baasuu Mirkaneessi/Jijjiiri',
    registerAccountAndPin: 'Herregaafi Kofii PIN Galmeessi',
    modifyDetailsDesc: 'Odeeffannoo baankii keessanii sirreessaa ykn lakk kofii PIN digitii 4 haromsaa.',
    registerDetailsDesc: 'Odeeffannoo baankii keessanii galmeessaa fi maallaqa baasuuf lakk kofii PIN digitii 4 ammasaa.',
    confirmOrResetPin: 'Lakk Kofii PIN digitii 4 Mirkaneessi ykn Haromsi',
    choosePaymentPin: 'Lakk Kofii PIN digitii 4 Filadhaa',
    saveChanges: 'Jijjiirama Olkaayi',
    registerAccountButton: 'Herrega Galmeessi',
    clickedSelectedAccount: 'Herrega Filatame',
    change: 'Jijjiiri ➔'
  },
  ti: {
    appName: 'LUMORA',
    tagline: 'ብልህ ኢንቨስትመንት። ውሑስ ዕብየት።',
    welcomeBack: 'እንቋዕ ደሓን መጻእኩም',
    login: 'ይእተዉ',
    register: 'ይመዝገቡ',
    logout: 'ይውጽኡ',
    phone: 'ቁጽሪ ስልኪ',
    password: 'የይለፍ ቃል',
    fullName: 'ምሉእ ስም',
    email: 'አድራሻ ኢሜይል',
    confirmPassword: 'የይለፍ ቃል አረጋግጽ',
    referralCode: 'ናይ ሪፈራል ኮድ (ኣማራጺ)',
    dontHaveAccount: 'ኣካውንት የብልኩምን? ይመዝገቡ',
    alreadyHaveAccount: 'ኣካውንት ኣለኩም? ይእተዉ',
    enterValidPhone: 'ትክክለኛ ቁጽሪ ስልኪ የእትዉ',
    passwordsDoNotMatch: 'የይለፍ ቃላት ኣይሰማምዑን',
    allFieldsRequired: 'ኩሉ መስኮት ክምላእ ኣለዎ',
    
    walletBalance: 'ናይ ኪስ ሒሳብ',
    activeInvestments: 'ንቑሕ ኢንቨስትመንት',
    todayEarnings: 'ናይ ሎሚ እቶት',
    totalEarnings: 'ሓፈሻዊ እቶት',
    vipLevel: 'ደረጃ VIP',
    teamEarnings: 'ናይ ጋንታ እቶት',
    recentTransactions: 'ናይ መወዳእታ ዝውውር',
    notifications: 'መተሓሳሰቢታት',
    quickActions: 'ቅልጡፍ ስራሕ',
    deposit: 'ገንዘብ የእቱ',
    invest: 'ናይ ቪአይፒ መደባት',
    withdraw: 'ገንዘብ ኣውጽእ',
    aiAssistant: 'ደገፍ',
    transactions: 'ታሪክ',
    
    navHome: 'መበገሲ',
    navInvestments: 'መደባት',
    navEarnings: 'እቶት',
    navAiAssistant: 'ረዳኢ',
    navProfile: 'መገለጺ',
    
    vipPlans: 'ናይ VIP ኢንቨስትመንት መደባት',
    requiredInvestment: 'ትሑት ኢንቨስትመንት',
    dailyReturnRate: 'ናይ መዓልታዊ እቶት ረብሓ',
    duration: 'እዋን',
    estimatedReturn: 'ግምታዊ ጠቕላላ እቶት',
    status: 'ኩነታት',
    buyPlan: 'ዕድል ዓድግ',
    insufficientBalance: 'ኣብቲ ኪስ እኹል ሒሳብ የብልኩምን',
    investmentSuccess: 'ናይ ኢንቨስትመንት መደብ ብዓወት ተዓዲጉ ኣሎ!',
    projectedReturnEst: 'ኩሎም ዝተኸፈቱ መደባት መዓልታዊ ክፍሊት ብዘተአማምንን ምሉእ ደገፍን ይእክቡ።',
    disclaimerText: 'LUMORA ውሑስ ናይ ብሕቲ ወፍሪ መድረኽ እዩ። ኩሎም ወፍሪታትን ገንዘብን ተጠቀምቲ 100% ውሑስን ካፒታሎም ዝተረጋገጸን እዩ።',
    
    depositSystem: 'ገንዘብ ምስጋር',
    enterAmount: 'መጠን ገንዘብ (ETB)',
    uploadReceipt: 'ናይ ንግዲ ባንኪ (CBE) ደረሰኝ ፎቶ የእትዉ',
    cbeAccountInfo: 'ወግዓዊ ናይ CBE ባንኪ ዝርዝር',
    cbeAccountName: 'Commercial Bank of Ethiopia (CBE)',
    cbeAccountNumber: 'ቁጽሪ ሒሳብ: 1000419524747',
    depositPendingReview: 'በጃኹም ናይ ዝውውር መጣቐሲ ቁጽሪ ጽሓፉ። እቲ ደረሰኝ ብቕልጡፍ ክግምገም እዩ።',
    submitRequest: 'ናይ ምስጋር ሕቶ የእቱ',
    submitReceipt: 'ደረሰኝ የእቱ',
    selectImage: 'ደረሰኝ ምረጽ',
    dragDropImage: 'ናይ ባንኪ ደረሰኝ ፎቶ ኣብዚ ኣቐምጥ',
    depositSuccessMsg: 'ናይ ምስጋር ሕቶ ብዓወት ተላኢኹ ኣሎ! ኣብ ግምገማ እዩ።',
    
    withdrawalSystem: 'ገንዘብ ምውጻእ',
    transactionPin: 'ናይ ዝውውር ፒን (PIN)',
    createPin: 'ሓድሽ ባለ 4 አሃዝ ፒን ኣዳልዉ (ንመጀመሪያ ግዜ)',
    pending: 'ኣብ ምጽባይ',
    approved: 'ዝጸደቐ',
    rejected: 'ዝተነጸገ',
    withdrawalSuccessMsg: 'ናይ ምውጻእ ሕቶ ብዓወት ተላኢኹ ኣሎ!',
    pinRequired: 'ውሑስ ባለ 4 አሃዝ ፒን ንምውጻእ የድሊ እዩ',
    
    referralSystem: 'ናይ ዕድመ መርበብ',
    yourReferralCode: 'ናይ ዕድመ ኮድኩም',
    teamSize: 'ብዝሒ ጋንታይ',
    totalReferralRewards: 'ሓፈሻዊ ናይ ሪፈራል ጉርሻ',
    inviteFriends: 'ኣዕሩኽቱ ይዓድሙ፣ ንሳቶም ንጡፍ VIP መደብ ከምዝገብሩ 10% ይርከቡ!',
    directReferrals: 'ቀጥታ ዕድመታት',
    
    aiFinancialAdvisor: 'LUMORA AI ናይ ፋይናንስ ረዳኢ',
    askSomething: 'ብዛዕባ ቪአይፒ መደባት፣ ምidኣማት ወይ ኢንቨስትመንት ይሕተቱ...',
    howCanIHelp: 'ሰላም! ኣነ ናይ Lumora AI ረዳኢኹም እየ። ብዛዕባ ቪአይፒ መደባት፣ ናይ ወለድ ስሌት፣ ብባንክ ደረሰኝ ምእታው ወይ መተግበሪያ ምጥቃም ክሕግዘኩም እኽእል እየ።',
    floatingChatText: 'ሓገዝ የድልየኩም? ረዳኢ ይሕተቱ',
    voiceInput: 'ናይ ድምጺ ግብኣት',
    quickQuestions: 'ዝተጠቖሙ ሕቶታት:',
    q1: 'ደረጃ 2 ቪአይፒ ክመዝገብ ብኸመይ ይኽእል?',
    q2: 'መዓልታዊ ወለድ ስሌት ኣብርሃለይ',
    q3: 'ንናይ ወፍረይ ውሕስነት ካፒታል ኣሎዶ?',
    q4: 'ደረሰኝ ምስጋር ገምጋም ብኸመይ ይሰርሕ?',

    aboutUs: 'ብዛዕባ LUMORA',
    agreements: 'ናይ ኩባንያ ስምምዓት',
    companyDocs: 'ወግዓውያን ሰነዳት',
    searchDocs: 'ሰነዳት ይድለዩ...',
    complianceDisclosure: 'LUMORA ፍሉይ ናይ ብሕቲ ወፍሪ መድረኽ እዩ። ኩሎም ወፍሪታትን ገንዘብን ተጠቀምቲ 100% ውሑስን ካፒታሎም ዝተረጋገጸን እዩ።',
    viewDetails: 'ሰነድ ኣንብብ',
    downloadPdf: 'ፒዲኤፍ ኣውርድ',
    companyOverview: 'ኩነታት ኩባንያ',
    mission: 'ዕላማ',
    vision: 'ራእይ',
    complianceNotice: 'ወግዓዊ ተገዛእነት ሕጊ',
    riskDisclosure: 'እሙን ናይ መሻርኽቲ ወፍሪ',
    userProtection: 'ናይ ተጠቀምቲ ምክልኻል ሕጊ',
    contactInfo: 'ናይ ርክብን ሓገዝን ሓበሬታ',

    success: 'ብዓወት ተሳሊጡ',
    error: 'ጌጋ',
    days: 'መዓልታት',
    date: 'ዕለት',
    amount: 'መጠን',
    type: 'ዓይነት',
    description: 'መግለጺ',
    statusLabel: 'ኩነታት',
    noData: 'ምንም ሓበሬታ የለን',
    loading: 'ኣብ ስራሕ ኣሎ...',
    viewAll: 'ኩሉ አርኢ',
    gatewayLabel: 'መእተዊ ክፍሊ ክፍያ',
    secureInstantTransfer: 'ውሑስን ቅጽበታውን ምስግጋር',
    copyAccountNumber: 'ቁጽሪ ሕሳብ ቅዳሕ',
    copiedToClipboard: 'ተቐዲሑ ኣሎ!',
    cbeTxRef: 'ናይ ባንኪ ዝውውር መወከሲ ቁጽሪ (Reference)',
    manualCbeReceiptCapture: 'ናይ CBE ደረሰኝ ፎቶ ምእታው',
    fileAttached: 'ሰነድ ብዓወት ተተሓሒዙ ኣሎ',
    deleteLabel: 'ሰርዝ',
    tapToSelectReceipt: 'ደረሰኝ ንምምራጽ ኣብዚ ይጽቀጡ',
    fileLimitLabel: 'JPG/PNG መጠን 2MB',
    instantVerificationNotice: 'ምስጋር ብቕጽበት ይረጋገጽ እዩ። ማንዋላዊ ናይ CBE ግምገማ ከኣ ኣብ ውሽጢ 2 ሰዓት ይዛዘም።',
    payoutAccrual: 'ዕለታዊ እቶት ክምችት',
    remainingDaysLabel: 'ዝተረፉ መዓልታት',
    matureDateLabel: 'ዝውድኣሉ መዓልቲ',
    activeCapital: 'ንጡፍ ካፒታል',
    matureHistory: 'ፖርትፎሊዮታት ታሪክ',
    detailsButton: 'ሰነድ ኣንብብ',
    readAgreements: 'ውዕላት ኩባንያ',
    exploreMission: 'ዕላማና ይርኣዩ',
    savePin: 'ፒን ኣቀምጥ',
    defaultLangSelection: 'ዝተመርጸ ቋንቋ',
    recentCashoutLogs: 'ውጽኢታት ታሪክ',
    unlocked: 'ዝተፈትሐ',
    checkoutConfirmTitle: 'ዕድጊት ኣረጋግጽ',
    planDescription: 'መግለጺ መደብ',
    deductionPrice: 'ዋጋ ዕድጊት',
    expectedReturn: 'ግምታዊ እቶት',
    cancel: 'ሰርዝ',
    confirm: 'ኣረጋግጽ',
    cbeLockSecurity: 'መቆልፊ ድሕንነት',
    aboutUsDescription: 'ብዛዕባ ሉሞራ ፋይናንሳዊ ሞዴላት ዝያዳ ይመሃሩ።',
    suggestedTriggers: 'ዝተጠቆሙ ሕቶታት',
    thinking: 'LUMORA ረዳኢ ይሓስብ ኣሎ...',
    streamNotice: 'ድምጺ ንምስማዕ ምቹው ሃዋሁ ይፍጠሩ...',
    howToWithdrawTitle: 'ገንዘብኩም ብኸመይ ከምእተውጽኡ',
    howToWithdrawGuide1: 'ዝተመዝገበ ኣካውንት ኣረጋግጽ፡ ትኽክለኛ ናይ ባንኪ ሓበሬታ ኣብቲ ቀጠልያ ሳጹን ውሽጢ ምምራጹ ኣረጋግጽ። ንምቕያር ሰማያዊ "ቀይር ➔" ሊንክ ጠውቕ።',
    howToWithdrawGuide2: 'ዝውጽእ መጠን ገንዘብ ምረጽ፡ ዝተሓተ መጠን ገንዘብ ምውጻእ 600 ETB እዩ። መጠን ዝሓተትክምዎ ካብ ዘለኩም ዝርዝር ክበልጽ የብሉን።',
    howToWithdrawGuide3: 'ናይ ደሕንነት ፒን (PIN) የእትዉ፡ ኣካውንትኩም ክትሰርሑ ከለኹም ዝፈጠርክምዎ ምስጢራዊ ባለ 4-ኣሃዝ ናይ ክፍሊት ፒን የእትዉ።',
    howToWithdrawGuide4: 'ምርግጋጽን ተራን፡ "ውሑስ ምውጻእ ፍቐድ" ጠውቑ። ናይ ቁጽጽር ክፍሊና ንኹሎም ሕቶታት በብተራኦም ኣብ ውሽጢ 1-2 ሰዓት ከጻርዮም እዩ።',
    howToAddAccountTitle: 'ናይ ምውጻእ ኣካውንት ብኸመይ ከምእትውስኹ',
    howToAddAccount1: 'ባንክኹም/ዋሌትኩም ምረጹ፡ ትኽክለኛ ባንክኹም (ንኣብነት CBE፣ Awash, Dashen, Abyssinia) ወይ ድማ ሞባይል ገንዘብኩም (telebirr, CBE Birr) ካብቲ ዝርዝር ምረጹ።',
    howToAddAccount2: 'ስም ዋና ኣካውንት፡ ክፍሊትኩም ንኽሳለጥ ምስቲ ኣብ ባንኪ ዝተመዝገበ ትኽክለኛ ሕጋዊ ስምኩም ዝሰማማዕ ስም የእትዉ።',
    howToAddAccount3: 'ቁጽሪ ኣካውንት/ስልኪ፡ ትኽክለኛ ቁጽሪ ባንኪ ኣካውንትኩም ወይ ዝተመዝገበ ቁጽሪ ሞባይል የእትዉ።',
    howToAddAccount4: 'ናይ ደሕንነት ፒን የእትዉ፡ ምስጢራዊ ባለ 4-ኣሃዝ ናይ ክፍሊት ፒን ኮድ ይምረጡ። ይህ ኮድ ንወደፊቱ ገንዘብ ክተውጽኡ ከለኹም የድልየኩም እዩ።',
    selectCashoutAmount: 'ዝውጽእ መጠን ገንዘብ ምረጹ',
    selectedAmount: 'ዝተመርጸ መጠን:',
    chooseFromChoices: 'ካብቶም ታሕቲ ዘለዉ አማራጺታት ምረጹ',
    withdrewLabel: 'ገንዘብ ኣውጽእ',
    editWithdrawalAccount: 'ናይ ምውጻእ ኣካውንት ኣስተኻኽሉ',
    registerAccountAndPin: 'ኣካውንትን ፒን ኮድን መዝግቡ',
    modifyDetailsDesc: 'ዝተመዝገበ ናይ ኢትዮጵያ ባንኪ ሓበሬታኹም ኣስተኻኽሉ ወይ ድማ ምስጢራዊ ባለ 4-ኣሃዝ ናይ ክፍሊት ፒን ኮድኩም ኣሐድሱ።',
    registerDetailsDesc: 'ዝተመርጸ ናይ ኢትዮጵያ ባንኪ ሓበሬታኹም መዝግቡን ገንዘብ ንምውጻእ ዘገልግል ባለ 4-ኣሃዝ ናይ ክፍሊት ፒን ኮድ ብደሕንነት ፍጠሩን።',
    confirmOrResetPin: 'ባለ 4-ኣሃዝ ክፍሊት ፒን ኣረጋግጹ ወይ ድማ ዳግማይ ፍጠሩ',
    choosePaymentPin: 'ባለ 4-ኣሃዝ ክፍሊት ፒን ምረጹ',
    saveChanges: 'ለውጥታት ኣቀምጡ',
    registerAccountButton: 'ኣካውንት መዝግቡ',
    clickedSelectedAccount: 'ተመሪጹ ዝኣተወ ኣካውንት',
    change: 'ቀይር ➔'
  },
  so: {
    appName: 'LUMORA',
    tagline: 'Maalgashica Casriga ah. Amni leh.',
    welcomeBack: 'Ksoo dhowow',
    login: 'Gasho herregga',
    register: 'Diiwaangali',
    logout: 'Kabax',
    phone: 'Lanbarka taleefanka',
    password: 'Koodhka sirta',
    fullName: 'Magaca weyn',
    email: 'Cinwaanka Emailka',
    confirmPassword: 'Hubi koodhka sirta',
    referralCode: 'Koodhka saaxiibka (Optional)',
    dontHaveAccount: 'Miyaanad koonto lahayn? Is-diiwaangeli',
    alreadyHaveAccount: 'Ma leedahay koonto? Gasho',
    enterValidPhone: 'Fadlan geli lambar telefoon oo sax ah',
    passwordsDoNotMatch: 'Koodhadhka sirta ah isma laha',
    allFieldsRequired: 'Dhamaan fariimuhu waa muhiim',
    
    walletBalance: 'Haraaga Wallet-ka',
    activeInvestments: 'Maalgashiga Firfircoon',
    todayEarnings: 'Dakhliga Maanta',
    totalEarnings: 'Dakhliga Guud',
    vipLevel: 'Heerka VIP',
    teamEarnings: 'Dakhliga Kooxda',
    recentTransactions: 'Dhaqdhaqaaqyadii Ugu Dambeeyay',
    notifications: 'Ogeysiisyada',
    quickActions: 'Tallowyo Degdeg ah',
    deposit: 'Geli hanti',
    invest: 'Qorshoyaal',
    withdraw: 'La bax lacag',
    aiAssistant: 'Taageerada',
    transactions: 'Taariikhda',
    
    navHome: 'Hoyga',
    navInvestments: 'Qorshoyaal',
    navEarnings: 'Dakhliga',
    navAiAssistant: 'Taageerada',
    navProfile: 'Profile',
    
    vipPlans: 'Qorhooyaasha Maalgashiga VIP-da',
    requiredInvestment: 'Ugu Yaraan Maalgashi',
    dailyReturnRate: 'Heerka Bu’ada Maalinlaha ah',
    duration: 'Muddada',
    estimatedReturn: 'Saadaasha Dakhliga Guud',
    status: 'Xaaladda',
    buyPlan: 'Iibso Qorshe',
    insufficientBalance: 'Haraagu kuguma filna',
    investmentSuccess: 'Qorshaha maalgashiga si guul leh ayaa loo iibsaday!',
    projectedReturnEst: 'Dhammaan qorshooyinka hawlgeliyeen waxay maalin walba yeeshaan faa’iido la hubo.',
    disclaimerText: 'LUMORA waa madal maalgashi oo gaar ah oo la aamini karo oo ammaan ah. Dhammaan hantida iyo lacagaha isticmaalayaasha 100% waa ammaan, raasamaalkuna waa dammaanad.',
    
    depositSystem: 'Shubista Lacagta',
    enterAmount: 'Cadadka (ETB)',
    uploadReceipt: 'Geli Sawirka Risiidhka CBE',
    cbeAccountInfo: 'Faahfaahinta Koontada Rasmiga ah ee CBE',
    cbeAccountName: 'Commercial Bank of Ethiopia (CBE)',
    cbeAccountNumber: 'Koontada: 1000419524747',
    depositPendingReview: 'Fadlan ku qor aqoonsiga xawaalada tixraaca. Dib u eegis baa lagu samayn doonaa.',
    submitRequest: 'Gudbi Codsiga',
    submitReceipt: 'Gudbi Risiidhka',
    selectImage: 'Dooro Sawirada',
    dragDropImage: 'Halkan ku soo tuur ama dhig sawirka risiidhka CBE',
    depositSuccessMsg: 'Codsiga shubista si guul leh ayaa loo gudbiyay!',
    withdrawalSystem: 'Kala Bax Dakhliga',
    transactionPin: 'Transaction PIN',
    createPin: 'Samee PIN 4-god ah (Marka u horreysa)',
    pending: 'Sugaya',
    approved: 'La ogolaaday',
    rejected: 'La diiday',
    withdrawalSuccessMsg: 'Codsiga kala-bax dakhli si guul leh ayaa loo gudbiyay!',
    pinRequired: 'PIN 4-god ah oo ammaan ah waa muhiim',
    referralSystem: 'Shabakada Casuumaada',
    yourReferralCode: 'Koodhkaaga martiqaadka',
    teamSize: 'Tirada Kooxda',
    totalReferralRewards: 'Gunnooyinka Casuumaada Guud',
    inviteFriends: 'Casuun saaxiibo si aad u hesho 10% dakhliga!',
    directReferrals: 'Casuumaadaha Tooska ah',
    aiFinancialAdvisor: 'LUMORA AI Financial Agent',
    askSomething: 'Weydii wax ku saabsan qorshooyinka, shubista, ama maalgashiga...',
    howCanIHelp: 'Hello! Waxaan ahay Caawiyahaaga AI. Sideen kuu caawin karaa?',
    floatingChatText: 'Caawimo ma u baahan tahay? Weydii AI',
    voiceInput: 'Geli Cod',
    quickQuestions: 'Su’aalaha soo jeedinta ah:',
    q1: 'Sideen u hawlgeliyaa VIP Plan 2?',
    q2: 'Ii sharax xisaabinta faa’iidada maalinlaha ah',
    q3: 'Miyaa la dammaanad qaaday dakhliga maalgashigeyga?',
    q4: 'Sidee u shaqeeyaa nidaamka ogolaanshaha risiidhka shubista?',
    aboutUs: 'Ku saabsan LUMORA',
    agreements: 'Heshiisyada Shirkadda',
    companyDocs: 'Dukumentiyada Rasmiga ah',
    searchDocs: 'Raadi dukumentiyada...',
    complianceDisclosure: 'LUMORA waa madal maalgashi oo gaar ah oo la aamini karo oo ammaan ah. Dhammaan hantida iyo lacagaha isticmaalayaasha 100% waa ammaan.',
    viewDetails: 'Akhri Dukumentiga',
    downloadPdf: 'Soo dejiso nuqul PDF ah',
    companyOverview: 'Guudmarka Shirkadda',
    mission: 'Hadafkayaga',
    vision: 'Hiigsigayaga',
    complianceNotice: 'Xeerka Compliance',
    riskDisclosure: 'Wada-shaqaynta Maalgashiga Amniga',
    userProtection: 'Xeerka Badbaadada Macmiilka',
    contactInfo: 'Macluumaadka Xiriirka & Taageerada',
    success: 'Guul',
    error: 'Khalad',
    days: 'maalmood',
    date: 'Taariikh',
    amount: 'Cadadka',
    type: 'Nooca',
    description: 'Faahfaahin',
    statusLabel: 'Xaaladda',
    noData: 'Ma jiro wax xog ah',
    loading: 'Wuu shaqaynayaa...',
    viewAll: 'Arag Dhamaantiis',
    gatewayLabel: 'Gateway',
    secureInstantTransfer: 'XARIIRKA AMMAAN AH',
    copyAccountNumber: 'Koobi garee nambarka',
    copiedToClipboard: 'Nuqul waa la koobiyey!',
    cbeTxRef: 'ID-ga Tixraaca CBE',
    manualCbeReceiptCapture: 'Ku Geli Risiidhka CBE Gacanta',
    fileAttached: 'Faylka waa la lifaaqay',
    deleteLabel: 'Tirtir',
    tapToSelectReceipt: 'Taabo si aad u doorato sawirka risiidhka',
    fileLimitLabel: 'JPG/PNG ugu badnaan 2MB',
    instantVerificationNotice: 'Xaqiijinta CBE waxay ku dhamaataa 2 saacadood.',
    payoutAccrual: 'Dakhliga Maanta',
    remainingDaysLabel: 'Maalmaha haray',
    matureDateLabel: 'Taariikhda dhamaadka',
    activeCapital: 'Raasamaalka Firfircoon',
    matureHistory: 'Maalgashiyada Dhamaaday',
    detailsButton: 'Akhri Dukumentiga',
    readAgreements: 'Heshiisyada Akhri',
    exploreMission: 'Eeg Hadafka',
    savePin: 'Kaydi PIN-ka Ammaanka',
    defaultLangSelection: 'Xulashada Luuqadda caadiga ah',
    recentCashoutLogs: 'Diiwaanka Cashout-kii',
    unlocked: 'La furay',
    checkoutConfirmTitle: 'Xaqiiji Iibsashada',
    planDescription: 'Faahfaahinta Qorshaha',
    deductionPrice: 'Qiimaha laga jari doono',
    expectedReturn: 'Faa’iidada la filayo',
    cancel: 'Jooji',
    confirm: 'Xaqiiji',
    cbeLockSecurity: 'Macluumaadka CBE Lock Security',
    aboutUsDescription: 'Nidaamka maaliyadeed ee nadiifka ah.',
    suggestedTriggers: 'Su’aalo soo jeedin ah',
    thinking: 'AI Agent ayaa fekeraya...',
    streamNotice: 'Dhegeysanaya...',
    howToWithdrawTitle: 'Sida Loo Kala Baxo Dakhligaaga',
    howToWithdrawGuide1: 'Xaqiiji Koontada Diiwansan: Hubi in faahfaahinta koontadaada bangiga ee saxda ah lagu muujiyay sanduuqa cagaaran. Haddii aad rabto inaad beddesho, taabo xiriiriyaha buluugga ah ee "Beddel ➔".',
    howToWithdrawGuide2: 'Geli Cadadka Lacagta: Cadadka ugu yar ee la kala baxo waa 600 ETB. Hubi in codsigaagu uusan ka badnayn hantida koontadaada ku jirta.',
    howToWithdrawGuide3: 'Geli PIN-ka Amniga: Ku qor code-ka sirta ah ee 4-digit ah ee Payment PIN-ka ee aad u habaysay intii dhismaha lagu jiray.',
    howToWithdrawGuide4: 'Oggolaanshaha & Safarka: Guji "Oggolow Kala-Bixitaan Ammaan Ah". Miiska xisaabaadka gacanta ayaa u baara dhammaan codsiyada si isdaba-joog ah 1-2 saacadood gudahood.',
    howToAddAccountTitle: 'Sida Loo Diiwangeliyo Koontada Lagu Kala Baxo',
    howToAddAccount1: 'Dooro Bangigaaga/Boorsadaada: Dooro bangigaaga saxda ah (tusaale CBE, Awash, Dashen, Abyssinia) ama boorsada lacagta moobiilka (telebirr, CBE Birr) ee liiska ku jira.',
    howToAddAccount2: 'Maqaa Mulkiilaha Koontada: Geli magacaaga rasmiga ah ee sharciga ah ee dhabta ah ee u qoran bangigaaga si loo hubiyo helidda lacagta oo guulaysata.',
    howToAddAccount3: 'Nambarka Koontada/Telefoonka: Geli nambarkaaga saxda ah ee koontada bangiga ama telefoonka boorsadaada moobiilka ee diiwangashan.',
    howToAddAccount4: 'Samee PIN Amni ah: Dooro PIN gaar ah oo 4-digit ah oo lacag-bixinta. Code-kan waxaa loo baahan doonaa si ammaan ah loogu xaqiijiyo codsiyadaada Mustaqbalka.',
    selectCashoutAmount: 'Dooro Cadadka Lacagta Aad La Baxayso',
    selectedAmount: 'Cadadka Aad Dooratay:',
    chooseFromChoices: 'Ka dooro dooqyada hoose',
    withdrewLabel: 'LA BAX',
    editWithdrawalAccount: 'Wax ka beddel Koontada Lagu Kala Baxo',
    registerAccountAndPin: 'Diiwangeli Koontada & PIN Code-ka',
    modifyDetailsDesc: 'Wax ka beddel faahfaahinta bangigaaga Itoobiya ee diiwangashan ama cusboonaysii PIN-kaaga 4-digit ah ee lacag-bixinta.',
    registerDetailsDesc: 'Diiwangeli faahfaahinta bangigaaga Itoobiya oo ku bixi PIN-kaaga 4-digit ah ee lacag-bixinta si aad u hawlgaliso kala-bixitaanka rasmiga ah.',
    confirmOrResetPin: 'Xaqiiji ama Dib u dhis PIN-ka 4-digit ah ee lacag-bixinta',
    choosePaymentPin: 'Dooro PIN lacag-bixineed oo 4-digit ah',
    saveChanges: 'Keydi Isbeddellada',
    registerAccountButton: 'Diiwangeli Koontada',
    clickedSelectedAccount: 'Koontada La Doortay',
    change: 'Beddel ➔'
  }
};

export const extraTranslations: Record<LanguageCode, Record<ExtraTranslationKey, string>> = {
  en: {
    lumoraVault: "LUMORA COMPREHENSIVE VAULT",
    portfolioGateway: "PORTFOLIO MANAGEMENT GATEWAY",
    lumoraSecuredActive: "LUMORA SECURED ACTIVE",
    todaysYieldAccrual: "Today's Yield Accrual",
    realTimePoolStream: "Real-time pool stream",
    lockedUnderCustody: "Locked under security custody",
    lumoraClusterSpeed: "LUMORA cluster speed: 1x Compound Accrual Enabled",
    nextPayoutIn: "Next payout in",
    activeContractPortfolios: "Active Contract Portfolios",
    compoundingProgression: "Compounding Progression",
    maturesInDays: "Matures in {days} Days",
    allocatedPrinciple: "Allocated Principle",
    dynamicYield: "Dynamic Yield",
    accumulated: "Accumulated",
    remaining: "Remaining",
    maturingDate: "Maturing Date",
    closedAndDisbursed: "Closed & Disbursed",
    disbursed: "Disbursed",
    lumoraSecureAudit: "LUMORA Secure Audit",
    dailyStructuralValidation: "Daily structural validation protects your investment capital from liquidity shifts.",
    compoundingMultiplier: "Compounding Multiplier",
    highVelocityPayouts: "High-velocity payouts computed and credited directly to client balances.",
    interactiveSimulator: "Interactive Yield Simulator",
    growthForecast: "Investments Yield Forecast Tool",
    simulateGrowth: "Simulate potential growth and daily pay rates dynamically",
    investmentCapital: "Investment Capital",
    currentBalance: "Current Balance",
    targetDailyYield: "Target Daily Yield Rate",
    planDurationDays: "Plan Duration",
    yieldForecastAnalytics: "Yield Forecast Analytics",
    maturesIn: "Matures in",
    profit: "Profit",
    totalReturnPayout: "Total Return Payout",
    principal: "Principal",
    interest: "Interest",
    smartVipRecommendation: "Smart VIP Tier Allocation Recommendation",
    rechargeRequired: "Recharge Required",
    sufficientFunds: "Sufficient Wallet Funds",
    investIn: "Invest in",
    minLabel: "Min",
    maxLabel: "Max",
    customTenure: "Custom tenure",
    adjustableParameters: "Adjustable parameters",
    phoneSecurityLock: "Phone Security Lock",
    securityLockStatus: "Security status",
    phoneLockActive: "Active (Locked with Phone PIN or Fingerprint)",
    phoneLockDisabled: "Disabled",
    registerDeviceHeader: "Configure Phone Lock",
    registerSubTitle: "PIN & Fingerprint Auth",
    verifySupport: "Verifying credential support...",
    phoneLockLinked: "Phone lock has been linked!",
    establishCheckpoint: "Establish a phone lock check point using your device PIN or Fingerprint sensor.",
    verifyingDevice: "Verifying device credentials...",
    deviceRegistered: "Device credential registered!",
    institutionalLoans: "Institutional Liquidity Loans",
    requestVerification: "Request Verification & Disburse Loan",
    viewRepayments: "View Structured Monthly Repayments",
    repaymentMonth: "Month / Due Date",
    standardTerms: "Standard Institutional Terms",
    simulatePayout: "Simulate 24h Payout",
    statusActive: "Active",
    statusBlocked: "Blocked",
    payoutAuthorized: "Authorize Bank Payout",
    cbeGuaranteedGrowth: "Lumora Guaranteed Growth",
    officialBankingPartner: "Trusted Private Investment Stewardship",
    cbeSecuredPartner: "LUMORA CAPITAL SECURED",
    officialCbePartner: "Official Lumora Secured Portfolio",
    onlineLabel: "ONLINE",
    connectNow: "Connect Now",
    twentyFourSeven: "24/7 SUPPORT AVAILABLE",
    sendMail: "Send Mail",
    faqTitle: "Frequently Answered Inquiries",
    deviceProtected: "DEVICE PROTECTED BY SECURITY GATEWAY",
    fingerprint: "Fingerprint Recognition",
    enterPin: "Enter 4-Digit Security PIN",
    retryBiometrics: "Retry Biometrics",
    pinVerifiedSuccess: "PIN code verified!",
    submitAccessApp: "Submit & Access App",
    exitLogout: "Exit / Log Out",
    institutionalLoansBackoffice: "Institutional Loans Backoffice",
    disburseCapitalInstantly: "Disburse Capital Instantly",
    broadcastAnnouncements: "Broadcast Announcements Group Message",
    accountVerified: "Account Verified",
    verificationPending: "Verification Pending Review",
    verificationRejected: "Verification Rejected",
    noticeHeader: "NOTICE",
    cbePartnershipDesc: "Officially clearing and securing all user yield payouts and liquidity assets with 100% capital protection.",
    matureHistory: "Matured Portfolios",
    portfolioVerified: "Platform Verified",
    securedWithAuditing: "Secured with 256-bit Institutional Auditing Compliance",
    idVerification: "Identity Verification",
    idFront: "ID Front Side",
    idBack: "ID Back Side",
    selectFront: "Select Front Photo",
    selectBack: "Select Back Photo",
    fanLabel: "National ID FAN / Reg Number",
    idComplianceDesc: "Ensure this matches the number printed on your physical ID card exactly. Your future loan applications will require entering this matching identification number.",
    sizeLimitError: "Each photograph must be smaller than 5MB.",
    readError: "Failed to read the selected file.",
    requiredPhotoError: "Both Front and Back photos of your National ID are required.",
    requiredFanError: "Your National ID FAN / Registration number is required.",
    idGatewaySubTitle: "Smart Investment Gateway",
    idGateGreeting: "Welcome, {name}. To comply with Ethiopian financial regulations and unlock platform features (like active VIP withdrawals and institutional loans), please submit a photo of both sides of your National ID cards.",
    guidingLedgerTour: "Guiding Ledger Tour",
    skip: "Skip",
    enterPlatform: "Enter Platform",
    nextStep: "Next Step",
    wtStep1Title: "Lumora Trust",
    wtStep1Sub: "Welcome to Lumora Financial",
    wtStep1Desc: "Step into Ethiopia’s premium digital custody platform. We deliver top-tier liquidity channels and secure asset allocation.",
    wtStep1B1: "Secure escrow audited accounts.",
    wtStep1B2: "Guaranteed capital protection protocols.",
    wtStep1B3: "Direct alignment with Ethiopian financial frameworks.",
    wtStep2Title: "Real-Time Ledger",
    wtStep2Sub: "Core Portfolio Valuations",
    wtStep2Desc: "Your dashboard processes values and returns dynamically. Track instant updates across active investments, daily yields, and referral bonuses.",
    wtStep2B1: "Compound dividends accrued every second.",
    wtStep2B2: "Clear ledger history with transparent audit records.",
    wtStep2B3: "Direct overview of team multiplier bonuses.",
    wtStep3Title: "VIP Staking Tiers",
    wtStep3Sub: "High-Yield Allocation",
    wtStep3Desc: "Purchase elite VIP Plans designed to yield compounding passive returns. Upgrade tiers dynamically as your capital balances increase.",
    wtStep3B1: "Curated tiers from VIP 1 up to Elite levels.",
    wtStep3B2: "Higher allocations unlock greater daily yields.",
    wtStep3B3: "Automated payout structures with instant lock releases.",
    wtStep4Title: "Quick Deposits",
    wtStep4Sub: "Seamless Deposit Desk",
    wtStep4Desc: "Instantly fund your wallet or request yield payouts. Submit slips directly through the digital portal for swift auditing by our treasury desk.",
    wtStep4B1: "Convenient CBE wire transactions.",
    wtStep4B2: "State-of-the-art receipt scanner verification.",
    wtStep4B3: "Direct local withdrawals processed directly to your account."
  },
  am: {
    lumoraVault: "የLUMORA አጠቃላይ ካዝና",
    portfolioGateway: "የፖርትፎሊዮ አስተዳደር መግቢያ",
    lumoraSecuredActive: "LUMORA ደህንነቱ የተጠበቀ",
    todaysYieldAccrual: "የዛሬው የታሰበው የትርፍ ክምችት",
    realTimePoolStream: "የቀጥታ ገቢ ፍሰት",
    lockedUnderCustody: "በባንክ ጥበቃ ስር የተቆለፈ",
    lumoraClusterSpeed: "የLUMORA ፍጥነት: 1x አውቶማቲክ ክምችት ነቅቷል",
    nextPayoutIn: "ቀጣይ ክፍያ በቀሪ ጊዜ",
    activeContractPortfolios: "ንቁ የኮንትራት ኢንቨስትመንቶች",
    compoundingProgression: "የዕድገት ሂደት",
    maturesInDays: "በ {days} ቀናት ውስጥ ይጠናቀቃል",
    allocatedPrinciple: "የተመደበው መነሻ ካፒታል",
    dynamicYield: "ዕለታዊ ትርፍ",
    accumulated: "የተጠራቀመ",
    remaining: "ቀሪ ጊዜ",
    maturingDate: "የማብቂያ ቀን",
    closedAndDisbursed: "የተዘጋ እና የተከፈለ",
    disbursed: "የተከፈለ",
    lumoraSecureAudit: "የLUMORA የደህንነት ኦዲት",
    dailyStructuralValidation: "ዕለታዊ የደህንነት ማረጋገጫ ካፒታልዎን ከገበያ መዋዠቅ ይጠብቃል።",
    compoundingMultiplier: "የገቢ ማባዣ",
    highVelocityPayouts: "ፈጣን እና አስተማማኝ ክፍያዎች በቀጥታ ወደ አካውንትዎ ገቢ ይደረጋሉ።",
    interactiveSimulator: "የእድገት መቆጣጠሪያ ሲሙሌተር",
    growthForecast: "የኢንቨስትመንት ትርፍ መተንበያ",
    simulateGrowth: "ሊኖር የሚችለውን ዕለታዊ እና ወርሃዊ ትርፍ በቀላሉ ያሰሉ",
    investmentCapital: "የኢንቨስትመንት ካፒታል",
    currentBalance: "የአሁኑ ቀሪ ሂሳብ",
    targetDailyYield: "የታለመው ዕለታዊ ትርፍ መጠን",
    planDurationDays: "የዕቅዱ ቆይታ ቀናት",
    yieldForecastAnalytics: "የትርፍ ትንበያ ትንተና",
    maturesIn: "የሚቆይበት ጊዜ",
    profit: "ትርፍ",
    totalReturnPayout: "ጠቅላላ ተመላሽ ክፍያ",
    principal: "ዋናው ካፒታል",
    interest: "ወለድ/ትርፍ",
    smartVipRecommendation: "ቪአይፒ ደረጃ የማሳደጊያ ብልህ ምክረ-ሃሳብ",
    rechargeRequired: "ተጨማሪ ተቀማጭ ያስፈልጋል",
    sufficientFunds: "በቂ ሂሳብ አለዎት",
    investIn: "እዚህ ኢንቨስት ያድርጉ",
    minLabel: "ዝቅተኛ",
    maxLabel: "ከፍተኛ",
    customTenure: "ብጁ የቆይታ ጊዜ",
    adjustableParameters: "የሚስተካከሉ መስፈርቶች",
    phoneSecurityLock: "የስልክ ደህንነት መቆለፊያ",
    securityLockStatus: "የደህንነት ሁኔታ",
    phoneLockActive: "ነቁ (በስልክ ፒን ወይም አሻራ የተቆለፈ)",
    phoneLockDisabled: "አልነቃም",
    registerDeviceHeader: "የስልክ መቆለፊያ ያዘጋጁ",
    registerSubTitle: "ፒን እና የጣት አሻራ ማረጋገጫ",
    verifySupport: "የመሳሪያውን ተኳኋኝነት በማረጋገጥ ላይ...",
    phoneLockLinked: "የስልክ መቆለፊያው በተሳካ ሁኔታ ተያይዟል!",
    establishCheckpoint: "በስልክዎ የፒን ቁጥር ወይም አሻራ በመጠቀም የደህንነት መቆለፊያ ያግብሩ።",
    verifyingDevice: "የደህንነት ማረጋገጫ በመፈጸም ላይ...",
    deviceRegistered: "የደህንነት ማረጋገጫ ተመዝግቧል!",
    institutionalLoans: "የአጋር የብድር ማዕከል",
    requestVerification: "ማረጋገጫ ይጠይቁ እና ብድር ይቀበሉ",
    viewRepayments: "ወርሃዊ የክፍያ መርሃ-ግብር ይመልከቱ",
    repaymentMonth: "ወር / የመክፈያ ቀን",
    standardTerms: "መደበኛ የብድር ደንቦች",
    simulatePayout: "የ24 ሰዓት ክፍያ አስጀምር",
    statusActive: "ንቁ",
    statusBlocked: "የታገደ",
    payoutAuthorized: "የባንክ ክፍያ ፍቀድ",
    cbeGuaranteedGrowth: "Lumora-CBE ዋስትና ያለው እድገት",
    officialBankingPartner: "ይፋዊ የባንክ አጋር",
    cbeSecuredPartner: "የCBE ዋስትና ያለው አጋር",
    officialCbePartner: "ይፋዊ የCBE ዋስትና ያለው አጋር",
    onlineLabel: "በመስመር ላይ",
    connectNow: "አሁን ይገናኙ",
    twentyFourSeven: "24/7 የደንበኞች ድጋፍ አለ",
    sendMail: "ኢሜይል ላክ",
    faqTitle: "በተደጋጋሚ የሚጠየቁ ጥያቄዎች",
    deviceProtected: "ይህ መሳሪያ በደህንነት ጌትዌይ የተጠበቀ ነው",
    fingerprint: "የጣት አሻራ ዕውቅና",
    enterPin: "ባለ 4-አሃዝ የደህንነት ፒን ያስገቡ",
    retryBiometrics: "የደህንነት ሙከራውን ደግመህ ሞክር",
    pinVerifiedSuccess: "የፒን ቁጥሩ በተሳካ ሁኔታ ተረጋግጧል!",
    submitAccessApp: "አረጋግጥና ወደ መተግበሪያው ግባ",
    exitLogout: "ውጣ / አካውንቱን ዝጋ",
    institutionalLoansBackoffice: "የአጋር ብድሮች ማስተዳደሪያ",
    disburseCapitalInstantly: "ብድሩን ወዲያውኑ ይልቀቁ",
    broadcastAnnouncements: "ለተጠቃሚዎች የቡድን መልዕክት አስተላልፍ",
    accountVerified: "መለያ ተረጋግጧል",
    verificationPending: "ማረጋገጫ በመጠባበቅ ላይ ነው",
    verificationRejected: "ማረጋገጫው ውድቅ ተደርጓል",
    noticeHeader: "ማሳሰቢያ",
    cbePartnershipDesc: "ሁሉንም ዕለታዊ ክፍያዎች እና ካፒታሎች በ100% የመንግስት ዋስትና ሙሉ በሙሉ ዋስትና ይሰጣል።",
    matureHistory: "የማብቂያ ቀን ያለፉ ኢንቨስትመንቶች",
    portfolioVerified: "በሲስተሙ የተረጋገጠ",
    securedWithAuditing: "በ256-ቢት ተቋማዊ የኦዲት ተገዢነት የተጠበቀ ነው",
    idVerification: "ማንነት ማረጋገጫ",
    idFront: "የመታወቂያ ፊት ለፊት ገጽ",
    idBack: "የመታወቂያ የጀርባ ገጽ",
    selectFront: "የፊት ፎቶ ይምረጡ",
    selectBack: "የጀርባ ፎቶ ይምረጡ",
    fanLabel: "የብሔራዊ መታወቂያ FAN / ምዝገባ ቁጥር",
    idComplianceDesc: "ይህ በአካል መታወቂያ ካርድዎ ላይ ከተጻፈው ቁጥር ጋር በትክክል መመሳሰሉን ያረጋግጡ። የወደፊት የብድር ማመልከቻዎችዎ ይህንን የሚዛመድ መለያ ቁጥር ማስገባት ይፈልጋሉ።",
    sizeLimitError: "እያንዳንዱ ፎቶግራፍ ከ 5 ሜባ ያነሰ መሆን አለበት።",
    readError: "የተመረጠውን ፋይል ማንበብ አልተቻለም።",
    requiredPhotoError: "የመታወቂያዎ የፊት እና የጀርባ ፎቶዎች ያስፈልጋሉ።",
    requiredFanError: "የብሔራዊ መታወቂያዎ FAN / ምዝገባ ቁጥር ያስፈልጋል።",
    idGatewaySubTitle: "የብልህ ኢንቨስትመንት መግቢያ",
    idGateGreeting: "እንኳን ደህና መጡ፣ {name}። የኢትዮጵያን የፋይናንስ ደንቦች ለማክበር እና የመሣሪያ ስርዓት ባህሪያትን (እንደ ንቁ የቪአይፒ ገንዘብ ማውጣት እና የተቋማት ብድር) ለመክፈት እባክዎ የመታወቂያዎን የሁለቱም ወገን ፎቶ ያቅርቡ።",
    guidingLedgerTour: "የመረጃ መመሪያ ጉብኝት",
    skip: "ዝለል",
    enterPlatform: "ወደ መድረክ ይግቡ",
    nextStep: "ቀጣይ ደረጃ",
    wtStep1Title: "ተቋማዊ እምነት",
    wtStep1Sub: "ወደ ሉሞራ ፋይናንሻል እንኳን ደህና መጡ",
    wtStep1Desc: "የኢትዮጵያ ታዋቂ ዲጂታል ጥበቃ አገልግሎት ውስጥ ይግቡ። ከፍተኛ ጥራት ያለው የትርፍ አገልግሎት ለመስጠት ከአገር ውስጥ አጋሮች ጋር እንሰራለን።",
    wtStep1B1: "ኦዲት የተደረገባቸው ደህንነቱ የተጠበቀ ሂሳቦች።",
    wtStep1B2: "ዋስትና ያለው የካፒታል ጥበቃ ፕሮቶኮሎች።",
    wtStep1B3: "ከኢትዮጵያ የፋይናንስ መዋቅሮች ጋር ቀጥተኛ የተጣጣመ።",
    wtStep2Title: "የቀጥታ መዝገብ",
    wtStep2Sub: "ዋና የኢንቨስትመንት እሴቶች",
    wtStep2Desc: "የእርስዎ መቆጣጠሪያ ፓነል እሴቶችን እና ገቢዎችን በቀጥታ ያሰላል። ንቁ ኢንቨስትመንቶችን ፣ ዕለታዊ ገቢዎችን እና የሪፈራል ጉርሻዎችን በቀላሉ ይከታተሉ።",
    wtStep2B1: "በየሰከንዱ የሚጠራቀም የትርፍ ድርሻ።",
    wtStep2B2: "ግልጽ እና ኦዲት የሚደረግ የትርፍ ታሪክ።",
    wtStep2B3: "የቡድን ማባዣ ጉርሻዎች ቀጥተኛ እይታ።",
    wtStep3Title: "የቪአይፒ ኢንቨስትመንት ደረጃዎች",
    wtStep3Sub: "ከፍተኛ ትርፍ መመደቢያ",
    wtStep3Desc: "የዕለት ተዕለት ተገቢ ገቢዎችን ለማግኘት የተነደፉ የቪአይፒ ፓኬጆችን ይግዙ። የካፒታል መጠንዎ ሲጨምር ደረጃዎን ያሳድጉ።",
    wtStep3B1: "ከቪአይፒ 1 ጀምሮ እስከ ከፍተኛ ደረጃ የተዘጋጁ ጥቅሎች።",
    wtStep3B2: "ከፍተኛ መጠን ያለው ኢንቨስትመንት የላቀ ትርፍ ያስገኛል።",
    wtStep3B3: "በራስ-ሰር የሚከፈል ክፍያ ከፈጣን መቆለፊያ መልቀቂያ ጋር።",
    wtStep4Title: "ፈጣን የኢትዮጵያ ንግድ ባንክ (CBE) ዝውውር",
    wtStep4Sub: "ቀላል የተቀማጭ ማዕከል",
    wtStep4Desc: "ወዲያውኑ ወደ የኪስ ቦርሳዎ ያስገቡ ወይም የትርፍ ክፍያ ይጠይቁ። በፋይናንስ ክፍላችን በፍጥነት እንዲፈቀድ ደረሰኝዎን በቀጥታ ያስገቡ።",
    wtStep4B1: "የኢትዮጵያ ንግድ ባንክ (CBE) ቀጥታ ዝውውር።",
    wtStep4B2: "የዘመነ የተቀማጭ ደረሰኝ ማረጋገጫ ሲስተም።",
    wtStep4B3: "ክፍያዎች በቀጥታ ወደ ባንክ ሂሳብዎ ይደረጋሉ።"
  },
  om: {
    lumoraVault: "KHASNADA COMPREHENSIVE VAULT LUMORA",
    portfolioGateway: "KARRA PORTFOLIO GESTIONE",
    lumoraSecuredActive: "LUMORA SECURED ACTIVE",
    todaysYieldAccrual: "Bu'aa Har'aa Argamu",
    realTimePoolStream: "Koodii Yaasa Callaa",
    lockedUnderCustody: "Eegumsa Baankii jala Kan jiru",
    lumoraClusterSpeed: "Saffisa LUMORA: 1x Bu’aa Maallaqaa Saffisaa",
    nextPayoutIn: "Kaffaltii itti aanu",
    activeContractPortfolios: "Koota Maallaqa Hojjechaa Jiru",
    compoundingProgression: "Adeemsa Guddinaa",
    maturesInDays: "Guyyoota {days} keessatti kan bilchaatu",
    allocatedPrinciple: "Maallaqa Jalqabaa",
    dynamicYield: "Bu’aa Guyyaa",
    accumulated: "Kan Walitti Qabame",
    remaining: "Guyyoota hafan",
    maturingDate: "Guyyaa Xumuraa",
    closedAndDisbursed: "Kan Xumuramee Kaffalame",
    disbursed: "Kaffalameera",
    lumoraSecureAudit: "Oodiitii Ammaayyaa LUMORA",
    dailyStructuralValidation: "Eegumsi guyyaa maallaqa keessan qabeenya gabaa irraa eega.",
    compoundingMultiplier: "Baay’istuu Bu’aa",
    highVelocityPayouts: "Kaffaltii saffisaa fi bifa sirraawaan kallattiin herrega keessanitti kaffalama.",
    interactiveSimulator: "Simulaatara Guddinaa",
    growthForecast: "Tilmaama Bu’aa Maalgashigaa",
    simulateGrowth: "Bu’aa guyyaa fi ji’aa tilmaamuun shallagi",
    investmentCapital: "Maallaqa Maalgashigaa",
    currentBalance: "Haftee Herrega Ammaa",
    targetDailyYield: "Heerka Bu’aa Guyyaa",
    planDurationDays: "Guyyoota Qorshaha",
    yieldForecastAnalytics: "Shallaggii Tilmaama Bu'aa",
    maturesIn: "Kan bilchaatu",
    profit: "Bu’aa",
    totalReturnPayout: "Kaffaltii Waligalaa",
    principal: "Maallaqa Jalqabaa",
    interest: "Dhala/Bu’aa",
    smartVipRecommendation: "Gorsa VIP Guddisuuf gargaaru",
    rechargeRequired: "Herrega Guutuun Barbaachisaadha",
    sufficientFunds: "Maallaqa gahaa qabdu",
    investIn: "Asitti Maalgashadhu",
    minLabel: "Gad-aanaa",
    maxLabel: "Ol-aanaa",
    customTenure: "Yeroo addaa filachuuf",
    adjustableParameters: "Ulaagaalee sirreeffaman",
    phoneSecurityLock: "Sloofii Cufiinsa Bilbilaa",
    securityLockStatus: "Haala Nageenyaa",
    phoneLockActive: "Hojirra jira (Koodi bilbilaan cufame)",
    phoneLockDisabled: "Hojirra hin jiru",
    registerDeviceHeader: "Cufiinsa Bilbilaa Tolchi",
    registerSubTitle: "PIN & Fingerprint Auth",
    verifySupport: "Nageenya bilbilaa mirkaneessaa jira...",
    phoneLockLinked: "Cufiinsi bilbilaa walitti hidhameera!",
    establishCheckpoint: "Koodii PIN bilbila keessanii ykn quba keessaniin cufaa nageenyaa tolchaa.",
    verifyingDevice: "Nageenya mirkaneessaa jira...",
    deviceRegistered: "Nageenyi mirkanaa'eera!",
    institutionalLoans: "Liqii Addaa Dhaabbata Hirree",
    requestVerification: "Mirkaneessa gaafadhuu liqii fudhadhu",
    viewRepayments: "Targata kaffaltii ji’aa ilaali",
    repaymentMonth: "Ji'a / Guyyaa Kaffaltii",
    standardTerms: "Seera Kaffaltii Liqii",
    simulatePayout: "Kaffaltii sa'aatii 24 eegali",
    statusActive: "Hojirra jira",
    statusBlocked: "Cufameera",
    payoutAuthorized: "Kaffaltii Baankii Hayyami",
    cbeGuaranteedGrowth: "Guddina Mirkanaa'aa Lumora-CBE",
    officialBankingPartner: "Dhaabbata Baankii Hirree",
    cbeSecuredPartner: "PARTNERI SIKUR CBE",
    officialCbePartner: "Mirkaneessa Baankii CBE",
    onlineLabel: "TOOSAA",
    connectNow: "Amma Dubbisi",
    twentyFourSeven: "GARGAARSA 24/7",
    sendMail: "Imeeli barreessi",
    faqTitle: "Gaaffii fi Deebii",
    deviceProtected: "KILIYAN BILBILA NAGUMMAA SIKUR GATWAY",
    fingerprint: "Beekamtii Quba",
    enterPin: "Koodii PIN Nageenyaa 4-Digit Gali",
    retryBiometrics: "Biometrics irra deebi'i",
    pinVerifiedSuccess: "Koodiin PIN mirkanaa'eera!",
    submitAccessApp: "Galchii & App Banaa",
    exitLogout: "Ba'i / Herrega Cufi",
    institutionalLoansBackoffice: "Liqiiwwan Dhaabbataa",
    disburseCapitalInstantly: "Liqiin yeroma sana gaddifama",
    broadcastAnnouncements: "Ergaa Garee Darbsi",
    accountVerified: "Mirkaneessi Herregaa",
    verificationPending: "Eegamaa jira",
    verificationRejected: "Gannameera",
    noticeHeader: "Hubachiisa",
    cbePartnershipDesc: "Kaffaltiiwwan bu'aa fi qabeenya maallaqaa hunda eegumsa mootummaa 100%tiin mirkaneessa.",
    matureHistory: "Koota Maallaqa Bilchaatani",
    portfolioVerified: "Mirkaneessa Platform",
    securedWithAuditing: "Eegumsa 256-bit Dhaabbataatiin kan mirkanaa'e",
    idVerification: "Mirkaneessa Eenyummaa",
    idFront: "Gara Duraa Waraqaa Eenyummaa",
    idBack: "Gara Duubaa Waraqaa Eenyummaa",
    selectFront: "Fotoo Gara Duraa Filadhu",
    selectBack: "Fotoo Gara Duubaa Filadhu",
    fanLabel: "Lakkoofsa FAN / Galmee Eenyummaa",
    idComplianceDesc: "Kun lakkoofsa waraqaa eenyummaa keessan irratti barreeffame wajjin tokko ta'uu isaa mirkaneessaa. Liqiin gara fuulduraa lakkoofsa kana ni barbaada.",
    sizeLimitError: "Fotoon kamiyyuu 5MB gadi ta'uu qaba.",
    readError: "Fayilii filatame dubbisuun hin danda'amne.",
    requiredPhotoError: "Fotoo gara duraa fi duubaa lachuu ni barbaachisa.",
    requiredFanError: "Lakkoofsi FAN / Mirkaneessaa eenyummaa keessan ni barbaachisa.",
    idGatewaySubTitle: "Karaa Maalgashiga Ammayyaa",
    idGateGreeting: "Baga nagaan dhuftan, {name}. Seera maallaqaa Itoophiyaa kabajuufii tajaajila addaa banuuf (kan akka kaffaltii VIP fi liqii dhaabbataa), fotoo waraqaa eenyummaa keessanii bifa lachuu kaasaa galchaa.",
    guidingLedgerTour: "Daawwannaa Qajeelfamaa",
    skip: "Irra Darbi",
    enterPlatform: "Gara Appii Seeni",
    nextStep: "Tarkaanfii Itti Aanu",
    wtStep1Title: "Amanamtummaa Dhaabbataa",
    wtStep1Sub: "Baga Gara Lumora Financial Nagaan Dhuftan",
    wtStep1Desc: "Gara sirna maalgashiga qabeenya Itoophiyaa isa dhabataatti ce'aa. Kaffaltii gaarii kennuuf hiroota biyya keessaa wajjin hojjenna.",
    wtStep1B1: "Herrega badbaadummaan isaa mirkanaa'e.",
    wtStep1B2: "Sirna eegumsa maallaqa jalqabaa mirkanaa'aa.",
    wtStep1B3: "Qajeelfama maallaqa Itoophiyaa wajjin kan deemu.",
    wtStep2Title: "Herrega Guyyaa",
    wtStep2Sub: "Gatii Maalgashiga Jalqabaa",
    wtStep2Desc: "Dashboardiin keessan bu'aafii gatii maallaqaa yeroma sana shallaga. Herrega hojjechaa jiru, bu'aa guyyaafii boonasii affeerrii salphatti hordofi.",
    wtStep2B1: "Dhaalli herregaa sekondii kessatti walitti qabamu.",
    wtStep2B2: "Seenaa kaffaltii ifa ta'eefi oodiitii qabu.",
    wtStep2B3: "Boonasii affeerrii garee kallattiin ilaaluu.",
    wtStep3Title: "VIP Maalgashiga",
    wtStep3Sub: "Ramaddii Bu’aa Ol-aanaa",
    wtStep3Desc: "Qorshoota VIP passive dakhli kennan bitadhaa. Galiin keessan yoo dabalu dalgashiga keessan guddisaa.",
    wtStep3B1: "Tiers VIP 1 irraa kaasee hanga Sadarkaa Elite qophaaye.",
    wtStep3B2: "Maallaqa guddaan bu'aa ol-aanaa argamsiisa.",
    wtStep3B3: "Kaffaltii of-umaan raawwatuufi yeroma sana gad-lakkifamu.",
    wtStep4Title: "Kaffaltii Saffisa CBE",
    wtStep4Sub: "Karra Galii Salphaa",
    wtStep4Desc: "Saffisaan herrega guutadhu ykn kaffaltii gaafadhu. Nagahee kaffaltii galchaa, yeroma sana herrega keessanitti kaffalama.",
    wtStep4B1: "Baankii daldala Itoophiyaa (CBE) irraa kaffaltii callaa.",
    wtStep4B2: "Mirkaneessaa nagahee kaffaltii ammayyaa.",
    wtStep4B3: "Kaffaltiin kallattiin gara account baankii keessaniitti ni ergama."
  },
  ti: {
    lumoraVault: "ናይ LUMORA ሓፈሻዊ ካዝና",
    portfolioGateway: "ምሕደራ ፖርትፎሊዮ",
    lumoraSecuredActive: "LUMORA ውሑስ ንጡፍ",
    todaysYieldAccrual: "ናይ ሎሚ ዝተዋህለለ እቶት",
    realTimePoolStream: "ቀጥታ ፍሰት እቶት",
    lockedUnderCustody: "ኣብ ትሕቲ ውሕስነት ባንኪ ዝተዓሸገ",
    lumoraClusterSpeed: "ፍጥነት LUMORA: 1x ኣውቶማቲክ እኩብ ተነቃቕሑ",
    nextPayoutIn: "ቀጻሊ ክፍያ በቀሪ ግዜ",
    activeContractPortfolios: "ንጡፋት ውዕላት ኢንቨስትመንት",
    compoundingProgression: "መስርሕ ዕብየት",
    maturesInDays: "ኣብ ውሽጢ {days} መዓልታት ዝውዳእ",
    allocatedPrinciple: "ዝተመደበ መበገሲ ካፒታል",
    dynamicYield: "ዕለታዊ እቶት",
    accumulated: "ዝተዋህለለ",
    remaining: "ዝተረፈ ግዜ",
    maturingDate: "ዝውድኣሉ መዓልቲ",
    closedAndDisbursed: "ዝተዓጸወን ዝተኸፈለን",
    disbursed: "ዝተኸፈለ",
    lumoraSecureAudit: "ግምገማ ውሕስነት LUMORA",
    dailyStructuralValidation: "ዕለታዊ ውሕስነት ንካፒታልኩም ካብ ምንዋጽ ይከላኸል እዩ።",
    compoundingMultiplier: "መባዝሒ እቶት",
    highVelocityPayouts: "ቅልጡፋት ክፍሊታት ብቐጥታ ናብ አካውንትኩም ይኣትዉ።",
    interactiveSimulator: "ሲሙሌተር ዕብየት እቶት",
    growthForecast: "ትነበያ እቶት ኢንቨስትመንት",
    simulateGrowth: "ዕለታውን ወርሃውን እቶት ብቐሊሉ ኣስልዩ",
    investmentCapital: "ካፒታል ኢንቨስትመንት",
    currentBalance: "ናይ ሕጂ ዝተረፈ ባላንስ",
    targetDailyYield: "ዝተደለየ ዕለታዊ መጠን እቶት",
    planDurationDays: "መዓልታት ቆይታ ውዕል",
    yieldForecastAnalytics: "ትንተና ትነበያ እቶት",
    maturesIn: "ዝውድኣሉ",
    profit: "ትርፊ",
    totalReturnPayout: "ጠቕላላ ተመላሲ ክፍሊት",
    principal: "ዋና ካፒታል",
    interest: "ወለድ/ትርፊ",
    smartVipRecommendation: "ምኽሪ ብልሒ ምዕባይ ቪአይፒ",
    rechargeRequired: "ተወሳኺ ገንዘብ የድሊ",
    sufficientFunds: "እኹል ባላንስ ኣለኩም",
    investIn: "ኣብዚ ኢንቨስት ግበሩ",
    minLabel: "ትሑት",
    maxLabel: "ልዑል",
    customTenure: "ናይ ቆይታ ግዜ",
    adjustableParameters: "ዝስተኻኸሉ መለክዒታት",
    phoneSecurityLock: "መቆልፊ ድሕንነት ስልኪ",
    securityLockStatus: "ኩነታት ድሕንነት",
    phoneLockActive: "ነቒሑ (ብፒን ወይ ኣሰር ዝተቆለፈ)",
    phoneLockDisabled: "ኣይነቐሐን",
    registerDeviceHeader: "መቆልፊ ስልኪ ኣዳልዉ",
    registerSubTitle: "ፒንን ኣሰር ኢድን",
    verifySupport: "ምስ ስልኪ ተኳሃሊ ምዃኑ ይረጋገጽ ኣሎ...",
    phoneLockLinked: "መቆልፊ ስልኪ ብዓወት ተተሓሒዙ ኣሎ!",
    establishCheckpoint: "ብፒን ቁጽሪ ወይ ኣሰር ኢድኩም ድሕንነት ስልኪ ኣነቓቕሑ።",
    verifyingDevice: "መድሕን ስልኪ ይረጋገጽ ኣሎ...",
    deviceRegistered: "መድሕን ስልኪ ተመዝጊቡ ኣሎ!",
    institutionalLoans: "ልቓሕ መሻርኽቲ ትካላት",
    requestVerification: "ሓተት ምርግጋጽን ልቓሕን",
    viewRepayments: "ወርሃዊ መደብ ክፍሊት ርኣዩ",
    repaymentMonth: "ወርሒ / መዓልቲ ክፍሊት",
    standardTerms: "ደንብታት ልቓሕ",
    simulatePayout: "ናይ 24 ሰዓት ክፍሊት ኣጀሙር",
    statusActive: "ንጡፍ",
    statusBlocked: "ዝተዓገተ",
    payoutAuthorized: "ክፍሊት ባንኪ ፍቐድ",
    cbeGuaranteedGrowth: "ውሑስ ዕብየት Lumora-CBE",
    officialBankingPartner: "ይፋዊ መሻርኽቲ ባንኪ",
    cbeSecuredPartner: "መሻርኽቲ ባንኪ CBE",
    officialCbePartner: "ይፋዊ መሻርኽቲ CBE",
    onlineLabel: "ኣብ መስመር",
    connectNow: "ሕጂ ተራኸብ",
    twentyFourSeven: "24/7 ሰዓት ሓገዝ ኣሎ",
    sendMail: "ኢሜይል ሰድድ",
    faqTitle: "ብተደጋጋሚ ዝሕተቱ ሕቶታት",
    deviceProtected: "እዚ መሳርሒ ብደሕንነት ጌትዌይ ዝተሓለወ እዩ",
    fingerprint: "ናይ ኣሰር ኢድ",
    enterPin: "ባለ 4-አሃዝ ፒን የእትዉ",
    retryBiometrics: "ድሕንነት መሊስካ ፈትን",
    pinVerifiedSuccess: "ፒን ብዓወት ተረጋጊጹ!",
    submitAccessApp: "ኣረጋግጽን እቶን",
    exitLogout: "ውጻእ / ዓጽው",
    institutionalLoansBackoffice: "ምሕደራ ልቓሕ ትካላት",
    disburseCapitalInstantly: "ልቓሕ ወዲያው ፍቐድ",
    broadcastAnnouncements: "መልእኽቲ ንኩሎም ኣመሓላልፍ",
    accountVerified: "መለያ ተረጋጊጹ",
    verificationPending: "ኣብ ከይዲ ኣሎ",
    verificationRejected: "ተነጺጉ",
    noticeHeader: "መጠንቀቕታ",
    cbePartnershipDesc: "ንኹሎም ዕለታዊ ክፍሊታትን ካፒታላትን ብ100% ዋስትና መንግስቲ ምሉእ ብምሉእ ውሑስ ይገብር።",
    matureHistory: "ዝውድኡ ኢንቨስትመንታት",
    portfolioVerified: "ብሲስተም ዝተረጋገጸ",
    securedWithAuditing: "ብ256-ቢት ተቋማዊ ኦዲት ዝተሓለወ እዩ",
    idVerification: "መረጋገጺ ማንነት",
    idFront: "ቅድሚት ገጽ መታወቂያ",
    idBack: "ሕዝባዊ ገጽ መታወቂያ",
    selectFront: "ናይ ቅድሚት ፎቶ ምረጽ",
    selectBack: "ናይ ድሕሪት ፎቶ ምረጽ",
    fanLabel: "ብሄራዊ መታወቂያ FAN / መዝገብ ቁጽሪ",
    idComplianceDesc: "እዚ ኣብ መታወቂያኹም ዘሎ ቁጽሪ ምስቲ ትክክለኛ ቁጽሪ ምመሳሰሉ ኣረጋግጹ። ናይ መጻኢ ልቓሕ ሕቶታት እዚ ቁጽሪ የድልዮም እዩ።",
    sizeLimitError: "ነፍሲ ወከፍ ፎቶ ካብ 5MB ክነኪ ኣለዎ።",
    readError: "ነቲ ዝተመርጸ ፋይል ከንብቦ ኣይከኣለን።",
    requiredPhotoError: "ክልቲኡ ናይ ቅድሚትን ንድሕሪትን ፎቶታት የድልዩ እዮም።",
    requiredFanError: "ናይ ብሄራዊ መታወቂያኹም FAN ቁጽሪ የድሊ እዩ።",
    idGatewaySubTitle: "መእተዊ ብልሒ ኢንቨስትመንት",
    idGateGreeting: "እንቋዕ ደሓን መጻእኩም፣ {name}። ናይ ኢትዮጵያ ገንዘባዊ ሕግታት ንምክባርን ቪአይፒ ምስሓብን ልቓሕን ንምኽፋት ክልቲኡ ገጽ መታወቂያኹም ሰዱ።",
    guidingLedgerTour: "ናይ መምርሒ ዑደት",
    skip: "ዝለል",
    enterPlatform: "ናብ መድረኽ እቶ",
    nextStep: "ቀጻሊ ደረጃ",
    wtStep1Title: "ተቋማዊ እምነት",
    wtStep1Sub: "እንቋዕ ናብ ሉሞራ ፋይናንሻል ብደሓን መጻእኩም",
    wtStep1Desc: "ናብቲ ውሑስ ናይ ኢትዮጵያ ዲጂታል ሓለዋ መድረኽ እተዉ። ብሉጽ ኣገልግሎት ንምሃብ ምስ ውሽጢ ዓዲ መሻርኽቲ ንሰርሕ።",
    wtStep1B1: "ኦዲት ዝተገብረሎም ውሑሳት ሒሳባት።",
    wtStep1B2: "ውሑስ ናይ ካፒታል ዕቅባ ፕሮቶኮላት።",
    wtStep1B3: "ምስ ናይ ኢትዮጵያ ፋይናንስ ሕግታት ቀጥታ ዝተሰማምዐ።",
    wtStep2Title: "ናይ ቀጥታ መዝገብ",
    wtStep2Sub: "ናይ ኢንቨስትመንት እሴታት",
    wtStep2Desc: "ናይ ቁጽጽር ሰሌዳኹም እሴታትን እቶታትን ብቐጥታ የሰላስል። ንጡፍ ኢንቨስትመንታት፣ ዕለታዊ እቶትን ናይ ሪፈራል ጉርሻታትን ብቐሊሉ ተዓዘቡ።",
    wtStep2B1: "ኣብ ነፍሲ ወከፍ ካልኢት ዝእከብ ናይ ትርፊ እቶት።",
    wtStep2B2: "ንጹርን ውሑስን ናይ ትርፊ ታሪኽ።",
    wtStep2B3: "ናይ ጉጅለ ቦነስ ቀጥታ ክርአ ዝኽእል።",
    wtStep3Title: "ናይ VIP ኢንቨስትመንታት",
    wtStep3Sub: "ልዑል ትርፊ ምምዳብ",
    wtStep3Desc: "ዕለታዊ እቶት ዝህቡ ናይ ቪአይፒ ፓኬጃት ዓድጉ። ናይ ሒሳብкуም መጠን ክውስኽ ከሎ ደረጃኹም ኣዕብዩ።",
    wtStep3B1: "ካብ ቪአይፒ 1 ጀሚሩ ክሳብ ልዑል ደረጃ ዝተዳለዉ ፓኬጃት።",
    wtStep3B2: "ልዑል ኢንቨስትመንት ዝበለጸ ትርፊ የምጽእ።",
    wtStep3B3: "ብባዕሉ ዝኽፈል ክፍሊትን ቅልጡፍ መቆልፊ ምፍታሕን።",
    wtStep4Title: "ቅልጡፍ ናይ ኢትዮጵያ ንግድ ባንክ (CBE) ዝውውር",
    wtStep4Sub: "ቀሊል መቐመጢ ማእከል",
    wtStep4Desc: "ብቕልጣፈ ናብ ቦርሳኹም ኣእትዉ ወይ ናይ ክፍሊት ሕቶ ስደዱ። ብቐጥታ ስደዱ ደረሰኝኩም ንምጽዳቕ።",
    wtStep4B1: "ቀጥታ ናይ ኢትዮጵያ ንግድ ባንክ (CBE) ዝውውር።",
    wtStep4B2: "ናይ ደረሰኝ መረጋገጺ ዘመናዊ ሲስተም።",
    wtStep4B3: "ክፍሊታት ብቐጥታ ናብ አካውንት ባንኪኹም ይለኣኹ።"
  },
  so: {
    lumoraVault: "KHASNADA DHAMMAYS-TIRAN EE LUMORA",
    portfolioGateway: "MAAMULKA PORTFOLIO",
    lumoraSecuredActive: "LUMORA SECURED ACTIVE",
    todaysYieldAccrual: "Kororka Dakhliga Maanta",
    realTimePoolStream: "Dakhliga tooska ah ee xilligan",
    lockedUnderCustody: "Ku xiran badbaadada baanka",
    lumoraClusterSpeed: "Saffiska LUMORA: 1x Dakhli Ururin Degdeg ah",
    nextPayoutIn: "Kashada xigta ee dakhliga",
    activeContractPortfolios: "Qorshooyinka Dakhliga ee Shaqaynaya",
    compoundingProgression: "Geedi-socodka Kororka",
    maturesInDays: "Wuxuu ku dhamaanayaa {days} Maalmood",
    allocatedPrinciple: "Aasaaska Raasamaalka",
    dynamicYield: "Faaiidada Maalin kasta",
    accumulated: "Wixii Walitti Qabmay",
    remaining: "Maalmood ee haray",
    maturingDate: "Taariikhda Dhamaadka",
    closedAndDisbursed: "Waa la xiray waana la bixiyay",
    disbursed: "Waa la bixiyay",
    lumoraSecureAudit: "Tixraaca Amniga ee LUMORA",
    dailyStructuralValidation: "Xaqiijinta maalinlaha ahi waxay raasamaalkaaga ka ilaalisaa suuqa isbedbedela.",
    compoundingMultiplier: "Dakhli Badiye",
    highVelocityPayouts: "Bixinta lacagaha ee degdegga ah waxaa si toos ah loogu shubayaa koontadaada.",
    interactiveSimulator: "Simulator-ka Maalgashiga",
    growthForecast: "Saadaasha Dakhliga Maalgashiga",
    simulateGrowth: "U xisaabi si fudud dakhligaaga maalin kasta iyo bil kasta",
    investmentCapital: "Raasamaalka Maalgashiga",
    currentBalance: "Haraaga Koontada Amma",
    targetDailyYield: "Heerka Dakhliga Maalinlaha ah",
    planDurationDays: "Muddada Qorshaha",
    yieldForecastAnalytics: "Xisaabinta Saadaasha Dakhliga",
    maturesIn: "Wuxuu idlaanayaa",
    profit: "Faa’iido",
    totalReturnPayout: "Bixinta Guud ee Dakhliga",
    principal: "Raasamaalka",
    interest: "Dakhli dheeraad ah",
    smartVipRecommendation: "Talo ku saabsan horumarinta VIP-da",
    rechargeRequired: "Dhaqdhaqaaq Dhaqaale baa loo baahan yahay",
    sufficientFunds: "Haraagu waa kugu filan yahay",
    investIn: "Halkan ku Maalgeli",
    minLabel: "Ugu yar",
    maxLabel: "Ugu badan",
    customTenure: "Xulashada muddada",
    adjustableParameters: "Ulaqaqyada la bedeli karo",
    phoneSecurityLock: "Qufulka Amniga ee Bilbila",
    securityLockStatus: "Xaaladda Amniga",
    phoneLockActive: "Waa shaqaynaysaa (Quful xagga koodhka ah)",
    phoneLockDisabled: "Ma shaqaynayso",
    registerDeviceHeader: "Samee Qufulka Bilbila",
    registerSubTitle: "PIN & Fingerprint Auth",
    verifySupport: "Dib u eegidda nabadgelyada bilbila...",
    phoneLockLinked: "Qufulka bilbila waa lagu guuleystay!",
    establishCheckpoint: "Ku tol koodhka PIN-ka bilbilaaga amaba farahaaga amni gaar ah.",
    verifyingDevice: "Hubinta nabadgelyada...",
    deviceRegistered: "Amniga bilbila waa la xaqiijiyay!",
    institutionalLoans: "Amaahda Gaarka ah ee Iskaashiga",
    requestVerification: "Gudbi codsi oo hel amaahda",
    viewRepayments: "Eeg jadwalka bixinta bil kasta",
    repaymentMonth: "Bisha / Maalinta Bixinta",
    standardTerms: "Xeerarka bixinta amaahda",
    simulatePayout: "Biloow bixinta 24-saac gudahood",
    statusActive: "Waa shaqaynaysaa",
    statusBlocked: "Waa la xiray",
    payoutAuthorized: "Oggolow bixinta Baanka",
    cbeGuaranteedGrowth: "Guddiga Mirkanaan ee Lumora-CBE",
    officialBankingPartner: "Iskaashiga rasmiga ah ee Baanka",
    cbeSecuredPartner: "WEY LA COPE CBE",
    officialCbePartner: "Baanka CBE Shuraako rami",
    onlineLabel: "ONLINE",
    connectNow: "La Xiriir Hadda",
    twentyFourSeven: "TAAGEERO 24/7 AH",
    sendMail: "Diri Imeel",
    faqTitle: "Su’aalaha Badanaa La Is Waydiiyo",
    deviceProtected: "QALABKA WUXUU KU JIRAA AMNIGA GATWAY",
    fingerprint: "Aqoonsiga Faraha",
    enterPin: "Geli PIN-ka Amniga ee 4-Digit",
    retryBiometrics: "Isku day mar kale",
    pinVerifiedSuccess: "Koodhka PIN-ka waa la xaqiijiyay!",
    submitAccessApp: "Gudbi oo Fur Appka",
    exitLogout: "Kabax / Xir herregga",
    institutionalLoansBackoffice: "Maamulka Amaahda Iskaashiga",
    disburseCapitalInstantly: "Bixi amaahda hadda",
    broadcastAnnouncements: "U gudbi fariinta kooxda",
    accountVerified: "Koontada waa la xaqiijiyay",
    verificationPending: "Xaqiijintu waa sugaysaa",
    verificationRejected: "Waa la diiday",
    noticeHeader: "Ogeysiis",
    cbePartnershipDesc: "Dhamaan bixinta faaiidooyinka iyo hantida waxaa si buuxda loogu xaqiijiyay 100% dammaanad dowladeed.",
    matureHistory: "Portfolios-ka Dhamaaday",
    portfolioVerified: "Xaqiijinta Platform-ka",
    securedWithAuditing: "Ku xaqiijisan 256-bit amniga xisaab-xirka",
    idVerification: "Xaqiijinta Aqoonsiga",
    idFront: "Dhinaca Hore ee Aqoonsiga",
    idBack: "Dhinaca Gadaal ee Aqoonsiga",
    selectFront: "Dooro Sawirka Hore",
    selectBack: "Dooro Sawirka Gadaal",
    fanLabel: "Nambarka FAN / Diiwaangelinta Aqoonsiga",
    idComplianceDesc: "Hubi in tani ay si sax ah ugu habboon tahay nambarka ku qoran aqoonsigaaga jirka. Codsiyadaada amaahda ee mustaqbalka waxay u baahan doonaan gelinta nambarkan.",
    sizeLimitError: "Sawir kasta waa inuu ka yaraadaa 5MB.",
    readError: "Gudbinta faylka la doortay waa uu fashilmay.",
    requiredPhotoError: "Labada sawir ee hore iyo gadaal ee Aqoonsiga waa lagama maarmaan.",
    requiredFanError: "Nambarka FAN/Diiwaangelinta Aqoonsigaaga Qaranka waa loo baahan yahay.",
    idGatewaySubTitle: "Albaabka Maalgashiga Casriga ah",
    idGateGreeting: "Ku soo dhowaad, {name}. Si loo raaco xeerarka maaliyadeed ee Itoobiya loona furo adeegyada (sida bixinta lacagaha VIP iyo amaahda iskaashiga), fadlan gudbi sawirka labada dhinac ee waraaqahaaga aqoonsiga.",
    guidingLedgerTour: "Hagaha Safarka Ledger-ka",
    skip: "Irra Darbi",
    enterPlatform: "Gasho Appka",
    nextStep: "Tallaabada Xigta",
    wtStep1Title: "Kallsoonida Iskaashiga",
    wtStep1Sub: "Ku soo dhowaad Lumora Financial",
    wtStep1Desc: "Gali masraxa maalgashiga rasmiga ah ee Itoobiya. Waxaan la shaqaynaa la-hawlgalayaal maxalli ah si aan u bixino dakhli heer sare ah.",
    wtStep1B1: "Xisaabaadka la hubiyay ee aaminka ah.",
    wtStep1B2: "Hab-maamuuska badbaadada dakhliga aasaasiga ah.",
    wtStep1B3: "La jaanqaadka xeerarka maaliyadeed ee Itoobiya.",
    wtStep2Title: "Xisaab-xirka Tooska ah",
    wtStep2Sub: "Qiimaha Maalgashiga Koowaad",
    wtStep2Desc: "Dashboard-kaaga ayaa xisaabinaya dakhligaaga maalin kasta si toos ah. Lasoco dakhliga maalinlaha ah, maalgashiga, iyo dakhliga saaxiibada.",
    wtStep2B1: "Dakhli kordha ilbiriqsi kasta.",
    wtStep2B2: "Taariikhda dakhli bixinta oo cad oo la hubiyay.",
    wtStep2B3: "Dakhliga dheeraadka ah ee kooxda.",
    wtStep3Title: "VIP Maalgashiga",
    wtStep3Sub: "Nidaamka Dakhliga Sare",
    wtStep3Desc: "Iibso xirmooyinka VIP si aad u hesho dakhli maalinle ah. Kordhi heerkaaga marka hantidaada ay kororto.",
    wtStep3B1: "Xirmooyin loogu talagalay laga bilaabo VIP 1 ilaa Elite.",
    wtStep3B2: "Maalgashi weyn wuxuu keenaa dakhli aad u sarreeya.",
    wtStep3B3: "Bixinta faaiidada si toos ah iyo furitaan degdeg ah.",
    wtStep4Title: "Kash Saffis ah oo CBE",
    wtStep4Sub: "Karra Galii Salphaa",
    wtStep4Desc: "Si degdeg ah ugu shubo koontadaada ama u codso bixinta dakhliga. Gudbi risiidhka si degdeg loogu hubiyo.",
    wtStep4B1: "Xawaaladaha tooska ah ee Baanka Ganacsiga Itoobiya (CBE).",
    wtStep4B2: "Nidaamka casriga ah ee hubinta risiidhada.",
    wtStep4B3: "Lacag-bixinta toos loogu xawilayo koontadaada baanka."
  }
};

const LanguageContext = createContext<{
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  et: (key: ExtraTranslationKey) => string;
} | undefined>(undefined);


export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('lumora_lang') as LanguageCode;
    if (saved && ['en', 'am', 'om', 'ti', 'so'].includes(saved)) {
      return saved;
    }
    // Attempt auto-detection
    const browserLang = navigator.language?.substring(0, 2);
    if (browserLang === 'am') return 'am';
    if (browserLang === 'om') return 'om';
    if (browserLang === 'ti') return 'ti';
    if (browserLang === 'so') return 'so';
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('lumora_lang', lang);
  };

  const t = translations[language];

  const et = (key: ExtraTranslationKey): string => {
    const dictionary = extraTranslations[language] || extraTranslations['en'];
    return dictionary[key] || extraTranslations['en'][key] || "";
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, et }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
