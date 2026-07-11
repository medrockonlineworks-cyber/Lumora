export type Language = 'en' | 'am';

export const translations = {
  en: {
    appName: "LUMORA",
    appSlogan: "Smart Investing. Secure Growth.",
    starterTiers: "Starter Investment Levels",
    starterSub: "Identity verification is not required for any Starter Level.",
    vipTiers: "VIP Premium Investment Levels",
    vipSub: "Account verification (KYC) is required only for VIP levels.",
    unlockedActive: "Active & Unlocked",
    requiredCapitalCore: "Core Required Capital",
    sovereignCbeSecureBadge: "CBE Partner Secure Guarantee",
    dailyReturnRate: "Daily Return Rate",
    duration: "Tenure Duration",
    days: "Days",
    estimatedReturn: "Estimated Return",
    insufficientBalance: "Insufficient Balance",
    investInPlan: "Invest in {name}",
    cycleLabel: "Cycle",
    
    // Auth & Navigation
    loginTitle: "Welcome to LUMORA",
    loginSub: "Access Ethiopia's Premier Fixed-Income Growth Platform",
    phonePlaceholder: "Enter CBE-Registered Phone (e.g. 0912345678)",
    namePlaceholder: "Enter Full Name (as on National ID)",
    loginBtn: "Access Safe Capital",
    registerBtn: "Register New Account",
    logout: "Secure Logout",
    
    // Bottom Nav Tabs
    homeTab: "Home",
    investmentsTab: "Invest",
    earningsTab: "Earnings",
    cardTab: "CBE Receipt",
    profileTab: "Profile",
    customerServiceTab: "AI Assistant",
    
    // Home Summary
    walletBalance: "Wallet Balance",
    totalDeposited: "Total Deposited",
    totalWithdrawn: "Total Withdrawn",
    totalEarned: "Total Earned",
    depositBtn: "CBE Deposit Proof",
    withdrawBtn: "Request Withdrawal",
    quickActions: "Quick Services",
    aboutUs: "About LUMORA",
    agreements: "Legal Agreements",
    loanCalc: "Loan/Growth Calculator",
    
    // CBE Deposit Proof
    depositTitle: "HOW TO DEPOSIT & SUBMIT PROOF",
    depositStep1: "1. Transfer Funds: Copy our Commercial Bank of Ethiopia (CBE) Account Number below and transfer your desired investment amount (Min 1,000 ETB) from your CBE App.",
    depositStep2: "2. Reference & Receipt: Copy the CBE transaction reference code and take a clear screenshot of your transfer receipt confirmation page.",
    depositStep3: "3. Submit Proof Below: Enter your deposited amount, type your CBE transaction reference code, upload your receipt screenshot, and click \"Submit CBE Deposit Proof\" to process credit activation.",
    officialCbeDetails: "OFFICIAL CBE BANK DETAILS",
    cbeAccountHolder: "Leykun",
    cbeAccountNumber: "1000419524747",
    selectVipLevel: "SELECT VIP INVESTMENT LEVEL",
    amountToDeposit: "Amount to Deposit (ETB)",
    cbeRefCode: "CBE Transaction Reference Code (e.g. FT26...)",
    uploadReceipt: "Upload Receipt Screenshot (PNG/JPG)",
    submitProofBtn: "Submit CBE Deposit Proof",
    minDepositError: "Minimum deposit is 1,000 ETB",
    refCodeError: "Please enter a valid CBE reference code",
    receiptError: "Please upload your transfer receipt image",
    depositSuccess: "Deposit proof submitted successfully! Verification takes 15-30 minutes.",
    
    // Withdraw Modal
    withdrawTitle: "REQUEST SECURE WITHDRAWAL",
    withdrawLimitMsg: "Withdrawals are processed directly to your registered CBE Phone or Wallet. Min 250 ETB.",
    withdrawAmount: "Amount to Withdraw (ETB)",
    withdrawBtnAction: "Confirm SECURE CBE Withdrawal",
    withdrawSuccess: "Withdrawal request submitted! Processing time: 2-4 hours to your CBE account.",
    
    // Verification Upload Gate
    kycTitle: "NATIONAL IDENTITY VERIFICATION (KYC)",
    kycSub: "To access VIP levels (VIP 1 and above) and request premium withdrawals, submit your National ID for verification.",
    idNumberLabel: "National ID Card Number",
    idPhotoLabel: "Front of National ID Card Photo",
    submitKycBtn: "Submit ID for SECURE Verification",
    kycPending: "Verification Pending (Takes 10-20 minutes)",
    kycVerified: "Identity Verified ✓ (Premium Enabled)",
    kycRequiredMsg: "Account verification is required before activating VIP levels. Please complete your identity verification to continue.",
    
    // AI Assistant
    aiTitle: "LUMORA Financial Intelligence",
    aiSub: "Ask about CBE bank transfers, investment cycles, interest rates, or referral bonuses.",
    aiPlaceholder: "How can I check my CBE deposit status?..."
  },
  am: {
    appName: "ሉሞራ (LUMORA)",
    appSlogan: "ብልህ ኢንቨስትመንት። አስተማማኝ እድገት።",
    starterTiers: "ጀማሪ የኢንቨስትመንት ደረጃዎች (Starter Tiers)",
    starterSub: "ምንም የማንነት ማረጋገጫ (KYC) ሳያስፈልግዎት አሁኑኑ ኢንቨስት ያድርጉ።",
    vipTiers: "ቪአይፒ ከፍተኛ የኢንቨስትመንት ደረጃዎች (VIP Levels)",
    vipSub: "የቪአይፒ ደረጃዎችን ለማንቃት የብሔራዊ መታወቂያ (KYC) መረጋገጥ አለበት።",
    unlockedActive: "ገባሪ እና የተከፈተ",
    requiredCapitalCore: "ዋናው አስፈላጊ ካፒታል",
    sovereignCbeSecureBadge: "በኢትዮጵያ ንግድ ባንክ (CBE) አጋርነት የተጠበቀ",
    dailyReturnRate: "ዕለታዊ የትርፍ መጠን",
    duration: "የኢንቨስትመንት ቆይታ",
    days: "ቀናት",
    estimatedReturn: "የተገመተው አጠቃላይ ትርፍ",
    insufficientBalance: "በቂ ሂሳብ የለም",
    investInPlan: "በ{name} ኢንቨስት ያድርጉ",
    cycleLabel: "ዙር",
    
    // Auth & Navigation
    loginTitle: "እንኳን ወደ ሉሞራ በሰላም መጡ",
    loginSub: "የኢትዮጵያ ቀዳሚውን አስተማማኝ የቋሚ ገቢ ኢንቨስትመንት ፕላትፎርም ይቀላቀሉ",
    phonePlaceholder: "በንግድ ባንክ የተመዘገበ ስልክ ቁጥር ያስገቡ (ለምሳሌ 0912345678)",
    namePlaceholder: "ሙሉ ስምዎን ያስገቡ (በመታወቂያ ላይ እንዳለው)",
    loginBtn: "ወደ መለያ ይግቡ",
    registerBtn: "አዲስ መለያ ፍጠር",
    logout: "በሰላም ውጡ",
    
    // Bottom Nav Tabs
    homeTab: "መነሻ",
    investmentsTab: "ኢንቨስት",
    earningsTab: "ገቢዎች",
    cardTab: "ንግድ ባንክ ደረሰኝ",
    profileTab: "መገለጫ",
    customerServiceTab: "የአይአይ ረዳት",
    
    // Home Summary
    walletBalance: "የኪስ ቦርሳ ቀሪ ሂሳብ",
    totalDeposited: "አጠቃላይ የተቀመጠ",
    totalWithdrawn: "አጠቃላይ የወጣ",
    totalEarned: "አጠቃላይ የተገኘ ትርፍ",
    depositBtn: "የንግድ ባንክ ደረሰኝ ማስገቢያ",
    withdrawBtn: "ገንዘብ ማውጫ ጥያቄ",
    quickActions: "ፈጣን አገልግሎቶች",
    aboutUs: "ስለ ሉሞራ",
    agreements: "ህጋዊ ስምምነቶች",
    loanCalc: "የእድገት ማስያ (Calculator)",
    
    // CBE Deposit Proof
    depositTitle: "እንዴት ተቀማጭ ማድረግና ማረጋገጫ ማቅረብ እንደሚቻል",
    depositStep1: "1. ገንዘብ ያስተላልፉ፡ ከታች ያለውን የሉሞራ የኢትዮጵያ ንግድ ባንክ (CBE) የሂሳብ ቁጥር በመገልበጥ የሚፈልጉትን የኢንቨስትመንት መጠን (ቢያንስ 1,000 ETB) በንግድ ባንክ መተግበሪያዎ (CBE App) ያስተላልፉ።",
    depositStep2: "2. ማረጋገጫ እና ደረሰኝ፡ የንግድ ባንክ ማስተላለፊያ ቁጥር (Reference Code) ይቅዱ እንዲሁም የደረሰኙን ግልጽ ፎቶ (Screenshot) ያንሱ።",
    depositStep3: "3. ደረሰኝ ከታች ያስገቡ፡ ያስተላለፉትን የገንዘብ መጠንና የማስተላለፊያ ቁጥሩን በማስገባት፣ የደረሰኙን ፎቶ በመጫን \"የንግድ ባንክ ማረጋገጫ ላክ\" የሚለውን ይጫኑ።",
    officialCbeDetails: "ይፋዊ የሉሞራ ንግድ ባንክ አካውንት",
    cbeAccountHolder: "ለይኩን (Leykun)",
    cbeAccountNumber: "1000419524747",
    selectVipLevel: "የቪአይፒ የኢንቨስትመንት ደረጃ ይምረጡ",
    amountToDeposit: "የተቀማጭ ገንዘብ መጠን (ETB)",
    cbeRefCode: "የንግድ ባንክ ማስተላለፊያ ቁጥር (ለምሳሌ FT26...)",
    uploadReceipt: "የደረሰኝ ፎቶ ስክሪንሹት (PNG/JPG)",
    submitProofBtn: "የንግድ ባንክ ማረጋገጫ ላክ",
    minDepositError: "ቢያንስ 1,000 ETB ማስገባት አለብዎት",
    refCodeError: "እባክዎን ትክክለኛ የንግድ ባንክ ማስተላለፊያ ቁጥር ያስገቡ",
    receiptError: "እባክዎን የደረሰኝ ፎቶ ይጫኑ",
    depositSuccess: "የደረሰኝ ማረጋገጫዎ በተሳካ ሁኔታ ገብቷል! ማረጋገጫው ከ15-30 ደቂቃ ይወስዳል።",
    
    // Withdraw Modal
    withdrawTitle: "አስተማማኝ የገንዘብ ማውጫ ጥያቄ",
    withdrawLimitMsg: "የሚወጣው ገንዘብ በቀጥታ ወደተመዘገበው የንግድ ባንክ ቁጥርዎ ወይም አካውንትዎ ይላካል። ቢያንስ 250 ETB።",
    withdrawAmount: "የሚወጣው የገንዘብ መጠን (ETB)",
    withdrawBtnAction: "የንግድ ባንክ ማውጣቱን አረጋግጥ",
    withdrawSuccess: "የገንዘብ ማውጫ ጥያቄዎ ገብቷል! ከ2-4 ሰአታት ውስጥ ወደ ንግድ ባንክ አካውንትዎ ገቢ ይደረጋል።",
    
    // Verification Upload Gate
    kycTitle: "የብሔራዊ መታወቂያ ማረጋገጫ (KYC)",
    kycSub: "የቪአይፒ ደረጃዎችን (ከቪአይፒ 1 ጀምሮ) ለመክፈትና ከፍተኛ ገንዘቦችን ለማውጣት ብሔራዊ መታወቂያዎን በማስገባት ያረጋግጡ።",
    idNumberLabel: "የብሔራዊ መታወቂያ ቁጥር",
    idPhotoLabel: "የብሔራዊ መታወቂያ የፊት ገጽ ፎቶ",
    submitKycBtn: "መታወቂያውን ደህንነቱ በተጠበቀ ሁኔታ ላክ",
    kycPending: "ማረጋገጫ በመጠባበቅ ላይ (ከ10-20 ደቂቃ ይወስዳል)",
    kycVerified: "ማንነትዎ ተረጋግጧል ✓ (ከፍተኛ ደረጃዎች ተከፍተዋል)",
    kycRequiredMsg: "የቪአይፒ ደረጃዎችን ለማግበር መጀመሪያ ማንነትዎ መረጋገጥ አለበት። እባክዎን መታወቂያዎን ያስገቡ።",
    
    // AI Assistant
    aiTitle: "የሉሞራ ፋይናንስ ረዳት (AI)",
    aiSub: "ስለ ንግድ ባንክ ማስተላለፊያዎች፣ የኢንቨስትመንት ዑደቶች፣ የትርፍ መጠኖች ወይም የሪፈራል ጉርሻዎች ይጠይቁ።",
    aiPlaceholder: "የንግድ ባንክ ተቀማጭ ሁኔታዬን እንዴት ማረጋገጥ እችላለሁ?..."
  }
};
