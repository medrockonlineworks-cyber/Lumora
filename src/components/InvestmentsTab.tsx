import { useState, useMemo, useEffect } from 'react';
import { Rocket, ShieldCheck, Calculator, TrendingUp, Sparkles, AlertCircle, CheckCircle, BadgeInfo, X, Check, Shield } from 'lucide-react';
import { useLanguage, LanguageCode } from '../locale';
import { InvestmentPlan, Profile } from '../types';

const availableProjects = [
  { id: 'crypto', name: 'Cryptocurrency Trading', icon: '🪙' },
  { id: 'forex', name: 'Forex Trading', icon: '💱' },
  { id: 'stocks', name: 'Stock Investing', icon: '📈' },
  { id: 'gold', name: 'Gold & Precious Metals Investment', icon: '🏆' },
  { id: 'realestate', name: 'Real Estate Investment', icon: '🏢' },
  { id: 'agriculture', name: 'Agriculture Investment', icon: '🌾' },
  { id: 'p2p', name: 'Peer-to-Peer Lending', icon: '🤝' },
  { id: 'indexfunds', name: 'Index Fund Investment', icon: '📊' },
  { id: 'renewable', name: 'Renewable Energy Projects', icon: '⚡' },
  { id: 'startup', name: 'Startup Crowdfunding', icon: '🚀' },
  { id: 'bonds', name: 'Bond Investments', icon: '📄' },
  { id: 'commodity', name: 'Commodity Trading', icon: '📦' }
];

const projectTranslations: Record<LanguageCode, Record<string, string>> = {
  en: {
    'Cryptocurrency Trading': 'Cryptocurrency Trading',
    'Forex Trading': 'Forex Trading',
    'Stock Investing': 'Stock Investing',
    'Gold & Precious Metals Investment': 'Gold & Precious Metals Investment',
    'Real Estate Investment': 'Real Estate Investment',
    'Agriculture Investment': 'Agriculture Investment',
    'Peer-to-Peer Lending': 'Peer-to-Peer Lending',
    'Index Fund Investment': 'Index Fund Investment',
    'Renewable Energy Projects': 'Renewable Energy Projects',
    'Startup Crowdfunding': 'Startup Crowdfunding',
    'Bond Investments': 'Bond Investments',
    'Commodity Trading': 'Commodity Trading'
  },
  am: {
    'Cryptocurrency Trading': 'የክሪፕቶከረንሲ ግብይት',
    'Forex Trading': 'የውጭ ምንዛሬ ግብይት',
    'Stock Investing': 'የአክሲዮን ኢንቨስትመንት',
    'Gold & Precious Metals Investment': 'የወርቅ እና ውድ ማዕድናት ኢንቨስትመንት',
    'Real Estate Investment': 'የሪል እስቴት ኢንቨስትመንት',
    'Agriculture Investment': 'የግብርና ኢንቨስትመንት',
    'Peer-to-Peer Lending': 'እርስ በርስ የብድር አገልግሎት',
    'Index Fund Investment': 'የኢንዴክስ ፈንድ ኢንቨስትመንት',
    'Renewable Energy Projects': 'የታዳሽ ኃይል ፕሮጀክቶች',
    'Startup Crowdfunding': 'የጀማሪ ቢዝነሶች የኅብረት የገንዘብ ማሰባሰብ',
    'Bond Investments': 'የቦንድ ኢንቨስትመንት',
    'Commodity Trading': 'የሸቀጦች ግብይት'
  },
  om: {
    'Cryptocurrency Trading': 'Bittaa fi Gurgurtaa Kriptoo',
    'Forex Trading': 'Bittaa fi Gurgurtaa Diqiise Alaa',
    'Stock Investing': 'Maalgashii Istookii',
    'Gold & Precious Metals Investment': 'Maalgashii Warqii fi Sibiloota Kabajamo',
    'Real Estate Investment': 'Maalgashii Riil Isteetii',
    'Agriculture Investment': 'Maalgashii Qonnaa',
    'Peer-to-Peer Lending': 'Liqii Waloo (P2P)',
    'Index Fund Investment': 'Maalgashii Inidaksii Faandii',
    'Renewable Energy Projects': 'Pirojektoota Annisaa Haaromfamuu',
    'Startup Crowdfunding': 'Walgargaarsa Hojii Haaraa',
    'Bond Investments': 'Maalgashii Boondii',
    'Commodity Trading': 'Bittaa fi Gurgurtaa Omishata'
  },
  ti: {
    'Cryptocurrency Trading': 'ግብይት ክሪፕቶከረንሲ',
    'Forex Trading': 'ግብይት ናይ ወጻኢ ጤረፍ',
    'Stock Investing': 'ኢንቨስትመንት ስቶክ',
    'Gold & Precious Metals Investment': 'ኢንቨስትመንት ወርቅን ክቡራት ማዕድናትን',
    'Real Estate Investment': 'ኢንቨስትመንት ሪል እስቴት',
    'Agriculture Investment': 'ኢንቨስትመንት ሕርሻ',
    'Peer-to-Peer Lending': 'ናይ ባዕልኻ ምልቓሕ',
    'Index Fund Investment': 'ኢንቨስትመንት ኢንዴክስ ፈንድ',
    'Renewable Energy Projects': 'ናይ ተሃዳሲ ሓይሊ ፕሮጀክትታት',
    'Startup Crowdfunding': 'ሓገዝ ጀመርቲ ስራሕቲ',
    'Bond Investments': 'ኢንቨስትመንት ቦንድ',
    'Commodity Trading': 'ግብይት ሸቐጣት'
  },
  so: {
    'Cryptocurrency Trading': 'Ganacsiga Cryptocurrency',
    'Forex Trading': 'Ganacsiga Forex',
    'Stock Investing': 'Maalgashiga Saamiyada',
    'Gold & Precious Metals Investment': 'Maalgashiga Dahabka & Birta Qaaliga ah',
    'Real Estate Investment': 'Maalgashiga Maaddada Guryaha',
    'Agriculture Investment': 'Maalgashiga Beeraha',
    'Peer-to-Peer Lending': 'Amaahda Peer-to-Peer',
    'Index Fund Investment': 'Maalgashiga Sanduuqa Tusaha-Index Fund',
    'Renewable Energy Projects': 'Mashaariicda Tamarta Cusboonaysiinta ah',
    'Startup Crowdfunding': 'Maalgashiga Shirkadaha Cusub',
    'Bond Investments': 'Maalgashiga Boondhiga',
    'Commodity Trading': 'Ganacsiga Badeecadaha'
  }
};

const getProjName = (name: string, lang: LanguageCode) => projectTranslations[lang]?.[name] || name;

const localInvestmentsTranslations: Record<LanguageCode, {
  headerSub: string;
  institutionalBannerTail: string;
  cbeGuaranteeLabel: string;
  coManagedDesc: string;
  interactiveSimulator: string;
  calcDesc: string;
  interactiveTool: string;
  desiredCapital: string;
  walletBalanceLabel: string;
  minLabel: string;
  maxLabel: string;
  targetDailyYield: string;
  daysDurationLabel: string;
  calendarDaysLabel: string;
  holdingCycle: string;
  forecastMetricsTitle: string;
  dailyReturn: string;
  estClearValue: string;
  monthlyReturn: string;
  estAccumulating: string;
  yieldOverDays: string;
  clearYield: string;
  totalPayoutLabel: string;
  principal: string;
  interest: string;
  smartAdvisorTitle: string;
  sufficientLedger: string;
  insufficientLedger: string;
  requiredCapitalCore: string;
  sovereignCbeSecureBadge: string;
  investInPlan: string;
  secureInvestHeader: string;
  cbeSettlementSub: string;
  assetAllocationTier: string;
  deductionFromWallet: string;
  guaranteedDailyRate: string;
  maturityLedgerReturn: string;
  goBack: string;
  confirmInvestment: string;
  capitalProtectionGuarantee: string;
  cyberSecurityCompliance: string;
  cycleLabel: string;
  moveSlider: string;
  unlockedActive: string;
  allocationModelCode: string;
  selectedPortfolioTitle: string;
  selectedPortfolioDesc: string;
  addProjectBtn: string;
  noActiveProjects: string;
  clickToChooseProjects: string;
  activeBadge: string;
  portfoliosSelectedLabel: string;
  availableProjTitle: string;
  projModalDesc1: string;
  projModalDesc2: string;
  projModalFooterText: string;
  limitReachedError: string;
  projectSectionLabel: string;
}> = {
  en: {
    headerSub: "(Stewardship Growth Assets)",
    institutionalBannerTail: "Select your customized capital tier to start earning compounding daily yield dividends managed by Lumora.",
    cbeGuaranteeLabel: "✦ Lumora Capital Guarantee & ",
    coManagedDesc: "All investments are managed under rigorous liquidity protocols to safeguard capital integrity. ",
    interactiveSimulator: "VIP INVESTMENT YIELD SIMULATOR",
    calcDesc: "Calculate potential compound growth metrics and daily pay rates beforehand",
    interactiveTool: "Interactive Tool",
    desiredCapital: "Desired Capital Allocation (ETB)",
    walletBalanceLabel: "Wallet Acc. Balance:",
    minLabel: "Min",
    maxLabel: "Max",
    targetDailyYield: "Target Daily Dividend Multiplier (%)",
    daysDurationLabel: "Maturity Asset Tier Tenure (Days)",
    calendarDaysLabel: "Calendar Days",
    holdingCycle: "Holding duration cycle",
    forecastMetricsTitle: "REAL-TIME CAPITAL FORECAST METRICS",
    dailyReturn: "Daily Return",
    estClearValue: "EST. Clear Value",
    monthlyReturn: "Monthly Return",
    estAccumulating: "Accumulating 30d",
    yieldOverDays: "Yield Over {days} Days Tenure",
    clearYield: "Clear Yield",
    totalPayoutLabel: "Total Lumora Package Payout",
    principal: "Principal",
    interest: "Earnings",
    smartAdvisorTitle: "Active VIP Tier Dynamic Advisor",
    sufficientLedger: "SUFFICIENT WALLET LEDGER",
    insufficientLedger: "LEDGER FUND RECHARGE NEEDED",
    requiredCapitalCore: "Required Capital Core Allocation",
    sovereignCbeSecureBadge: "Secured Lumora Portfolio Asset",
    investInPlan: "Invest in {name}",
    secureInvestHeader: "Secure Lumora Investment",
    cbeSettlementSub: "Lumora Account Ledger Settlement",
    assetAllocationTier: "Asset Allocation Tier",
    deductionFromWallet: "Deduction from Wallet",
    guaranteedDailyRate: "Guaranteed Daily Rate",
    maturityLedgerReturn: "Maturity Ledger Return",
    goBack: "Go Back",
    confirmInvestment: "Confirm Investment",
    capitalProtectionGuarantee: "100% Capital protection fully guaranteed by Lumora",
    cyberSecurityCompliance: "Secured with 256-bit Institutional Auditing Compliance",
    cycleLabel: "cycle",
    moveSlider: "Move slider to test custom yield parameters",
    unlockedActive: "Unlocked & Active",
    projectSectionLabel: "✦ Investment Projects",
    allocationModelCode: "◈ LUMORA ALLOCATION MODEL ◈",
    selectedPortfolioTitle: "SELECTED INVESTMENT PROJECTS PORTFOLIO",
    selectedPortfolioDesc: "Select and allocate your active capital plan funds into specific growth sectors. (Choose up to 5)",
    addProjectBtn: "Add Investment Project",
    noActiveProjects: "No active investment projects configured yet.",
    clickToChooseProjects: "Click the button above to choose up to 5 projects for capital allocation.",
    activeBadge: "ACTIVE",
    portfoliosSelectedLabel: "Portfolios Selected:",
    availableProjTitle: "Available Investment Projects (Select up to 5 Options):",
    projModalDesc1: "Users can choose up to 5 investment projects from the available options. The funds they invest will be allocated only to the projects they select. Lumora manages and monitors these investments to help achieve sustainable growth and returns.",
    projModalDesc2: "To reduce risk, investments may be diversified across multiple sectors and opportunities. Returns depend on the performance of the selected projects and market conditions.",
    projModalFooterText: "Users are free to select the projects that best match their investment goals and preferences.",
    limitReachedError: "Limit reached! You can select a maximum of 5 projects."
  },
  am: {
    headerSub: "(የካፒታል ዕድገት ንብረቶች)",
    institutionalBannerTail: "ዕለታዊ የLumora የትርፍ ክፍያዎችን ለማግኘት የእርስዎን ተስማሚ የኢንቨስትመንት ጥቅል ይምረጡ።",
    cbeGuaranteeLabel: "✦ የLumora የካፒታል ዋስትና እና ",
    coManagedDesc: "ካፒታልዎን ከጉዳት ለመጠበቅ ሁሉም ኢንቨስትመንቶች በከፍተኛ ጥንቃቄ በLumora የሚተዳደሩ ናቸው። ",
    interactiveSimulator: "የእድገት መቆጣጠሪያ ሲሙሌተር",
    calcDesc: "ሊኖር የሚችለውን ዕለታዊ እና ወርሃዊ ትርፍ በቀላሉ ያሰሉ",
    interactiveTool: "የማስሊያ መሣሪያ",
    desiredCapital: "የኢንቨስትመንት ካፒታል መጠን (ETB)",
    walletBalanceLabel: "የኪስ ቦርሳ ቀሪ ሂሳብ:",
    minLabel: "ዝቅተኛ",
    maxLabel: "ከፍተኛ",
    targetDailyYield: "የታለመው ዕለታዊ ትርፍ መቶኛ (%)",
    daysDurationLabel: "የኢንቨስትመንት ጥቅል ቆይታ (ቀናት)",
    calendarDaysLabel: "የቀን መቁጠሪያ ቀናት",
    holdingCycle: "የመቆያ ዑደት",
    forecastMetricsTitle: "ዕለታዊ እና ወርሃዊ የትርፍ ትንበያ ትንተና",
    dailyReturn: "ዕለታዊ ትርፍ",
    estClearValue: "የተገመተ የተጣራ ዋጋ",
    monthlyReturn: "ወርሃዊ ትርፍ",
    estAccumulating: "ለ30 ቀናት የሚጠራቀም",
    yieldOverDays: "በ{days} ቀናት ቆይታ ውስጥ የሚገኝ ትርፍ",
    clearYield: "የተጣራ ትርፍ",
    totalPayoutLabel: "ጠቅላላ ተመላሽ ክፍያ (ካፒታል + ትርፍ)",
    principal: "ዋናው ካፒታል",
    interest: "ትርፍ",
    smartAdvisorTitle: "የቪአይፒ ደረጃ የማሳደጊያ ብልህ አማካሪ",
    sufficientLedger: "በቂ የኪስ ቦርሳ ቀሪ ሂሳብ አለዎት",
    insufficientLedger: "ሂሳብዎን መሙላት ያስፈልጋል",
    requiredCapitalCore: "አስፈላጊው መነሻ ኢንቨስትመንት",
    sovereignCbeSecureBadge: "የተረጋገጠ የLumora የደህንነት ንብረት",
    investInPlan: "በ{name} ውስጥ ኢንቨስት ያድርጉ",
    secureInvestHeader: "ደህንነቱ የተጠበቀ የLumora ኢንቨስትመንት",
    cbeSettlementSub: "የLumora የሒሳብ መዝገብ ማረጋገጫ",
    assetAllocationTier: "የኢንቨስትመንት ፓኬጅ ደረጃ",
    deductionFromWallet: "ከኪስ ቦርሳ የሚቀነስ መጠን",
    guaranteedDailyRate: "የተረጋገጠ ዕለታዊ የትርፍ መጠን",
    maturityLedgerReturn: "ሲጠናቀቅ የሚገኝ ጠቅላላ ተመላሽ",
    goBack: "ተመለስ",
    confirmInvestment: "ኢንቨስትመንቱን አረጋግጥ",
    capitalProtectionGuarantee: "100% የካፒታል ደህንነት ዋስትና በLumora ተሰጥቶታል",
    cyberSecurityCompliance: "በ256-ቢት ከፍተኛ ማረጋገጫ የተጠበቀ",
    cycleLabel: "ቀናት ቆይታ",
    moveSlider: "የተለያዩ መጠንና ትርፍን ለማስላት አመልካቹን ያንቀሳቅሱ",
    unlockedActive: "ተከፍቷል እና ንቁ ነው",
    projectSectionLabel: "✦ የኢንቨስትመንት ፕሮጀክቶች",
    allocationModelCode: "◈ የLUMORA ድልድል ሞዴል ◈",
    selectedPortfolioTitle: "የተመረጡ የኢንቨስትመንት ፕሮጀክቶች ፖርትፎሊዮ",
    selectedPortfolioDesc: "ንቁ የካፒታል ፈንድዎን በተፈለገው ዘርፍ ላይ ይመድቡ። (እስከ 5 ይምረጡ)",
    addProjectBtn: "የኢንቨስትመንት ፕሮጀክት ያክሉ",
    noActiveProjects: "እስካሁን ምንም ንቁ የኢንቨስትመንት ፕሮጀክት አልተመረጠም።",
    clickToChooseProjects: "የካፒታል ድልድል ለማድረግ እስከ 5 ፕሮጀክቶችን ለመምረጥ ከላይ ያለውን ቁልፍ ይጫኑ።",
    activeBadge: "ንቁ",
    portfoliosSelectedLabel: "የተመረጡ ፖርትፎሊዮዎች፡",
    availableProjTitle: "የሚገኙ የኢንቨስትመንት ፕሮጀክቶች (እስከ 5 አማራጮችን ይምረጡ)፡",
    projModalDesc1: "ተጠቃሚዎች ከሚገኙት አማራጮች ውስጥ እስከ 5 የሚደርሱ የኢንቨስትመንት ፕሮጀክቶችን መምረጥ ይችላሉ። ኢንቨስት የሚያደርጉት ገንዘብ በተመረጡት ፕሮጀክቶች ላይ ብቻ ይመደባል። ቀጣይነት ያለው እድገትና ትርፍ ለማምጣት Lumora እነዚህን ኢንቨስትመንቶች ያስተዳድራል እንዲሁም ይከታተላል።",
    projModalDesc2: "አደጋን ለመቀነስ ኢንቨስትመንቶች በተለያዩ ዘርፎችና እድሎች ላይ እንዲከፋፈሉ ሊደረግ ይችላል። ትርፉ በተመረጡት ፕሮጀክቶች አፈጻጸም እና በገበያው ሁኔታ ላይ ይወሰናል።",
    projModalFooterText: "ተጠቃሚዎች ከኢንቨስትመንት ግባቸውና ምርጫቸው ጋር የሚስማማቸውን ፕሮጀክቶች የመምረጥ ሙሉ ነፃነት አላቸው።",
    limitReachedError: "ገደቡ ላይ ደርሰዋል! እባክዎ ከ 5 በላይ ፕሮጀክቶችን መምረጥ አይችሉም።"
  },
  om: {
    headerSub: "(Qabeenya Guddina Lumora)",
    institutionalBannerTail: "Kaffaltii dhaala guuyyaa Lumora argachuuf toora VIP filadhu.",
    cbeGuaranteeLabel: "✦ Wabii Kaapitaalaa Lumora & ",
    coManagedDesc: "Qabeenya Kaapitaalaa eeguuf maalgashii hundi of-eeggannoo guddaadhaan bi Lumora filatama. ",
    interactiveSimulator: "SIMULEETARII DOOFA DHUUNFAA",
    calcDesc: "Dhaala guuyyaa fi ji'aa salphaatti herregadhu",
    interactiveTool: "Aalad Simulator",
    desiredCapital: "Qabeenya Maalgashii (ETB)",
    walletBalanceLabel: "Hamma Wallet Keessaa:",
    minLabel: "Xiqqaa",
    maxLabel: "Guddaa",
    targetDailyYield: "Hamma Dhaala Guuyyaa (%)",
    daysDurationLabel: "Plan Duration",
    calendarDaysLabel: "Guyyoota Kalendaraa",
    holdingCycle: "Cikilii yeroo holding",
    forecastMetricsTitle: "HERREGA TILMAAMA QABEENYAA REAL-TIME",
    dailyReturn: "Dhaala Guuyyaa",
    estClearValue: "EST. Gatii Qulqulluu",
    monthlyReturn: "Dhaala Ji'aa",
    estAccumulating: "Walitti qabaa Guyyaa 30",
    yieldOverDays: "Dhaala Guuyyaa {days} keessatti",
    clearYield: "Yield Qulqulluu",
    totalPayoutLabel: "Kaffaltii Waliigalaa Kilaayinti",
    principal: "Principal",
    interest: "Earnings",
    smartAdvisorTitle: "Gorsa Toora VIP Dinamiikii Active",
    sufficientLedger: "HERREGA WALLET GA'AA",
    insufficientLedger: "HERREGA GUUTUU BARBAACHISA",
    requiredCapitalCore: "Maallaqa Kapitaalaa Barbaachisu",
    sovereignCbeSecureBadge: "Qabeenya Wabii Baankii Lumora Tiynfame",
    investInPlan: "Kallattiin {name} irratti invest godhi",
    secureInvestHeader: "Maalgashiga Lumora Mirkanaa'e",
    cbeSettlementSub: "Kaffaltii Herrega Lumora",
    assetAllocationTier: "Heera Sadarkaa VIP",
    deductionFromWallet: "Kaffaltii Herrega Keessaa Hir'ifamu",
    guaranteedDailyRate: "Dhaala Guuyyaa Mirkanaa'e",
    maturityLedgerReturn: "Kaffaltii Waliigalaa Maturity",
    goBack: "Deebi'i",
    confirmInvestment: "Maalgashi Mirkaneessi",
    capitalProtectionGuarantee: "Wabii Qabeenya Kaapitaalaa 100% Lumora",
    cyberSecurityCompliance: "Eegumsa herregaa 256-bit",
    cycleLabel: "cycle",
    moveSlider: "Move slider to test custom yield parameters",
    unlockedActive: "Hojirra Jira",
    projectSectionLabel: "✦ Pirojektoota Maalgashii",
    allocationModelCode: "◈ AGARSIFTUU MAALGASHII LUMORA ◈",
    selectedPortfolioTitle: "TOORA MAALGASHIGA FILATAMAN",
    selectedPortfolioDesc: "Hamma kaapitaala keessan gara damee guddina adda addaatti daddabarsaa. (Hanga 5 filadhaa)",
    addProjectBtn: "Pirojektii Maalgashii Dabalii",
    noActiveProjects: "Hanga ammaatti pirojektiin hojirra jiru hin jiru.",
    clickToChooseProjects: "Pirojektoota hanga 5 filachuuf button armaan olii cuqaasaa.",
    activeBadge: "HOJIRRA JIRA",
    portfoliosSelectedLabel: "Portifoliyoo Filataman:",
    availableProjTitle: "Pirojektoota can filatamuu danda'an (Hanga 5 filadhaa):",
    projModalDesc1: "Maamiloonni pirojektoota maalgashii can danda'anii keessaa hanga 5 filachuu danda'u. Maallaqni invests ta'us pirojektoota filataman qofaaf daddabarfama. Lumora guddina abdachiisaa fi bu'aa argamsiisuuf maalgashii kanneen ni hordofa.",
    projModalDesc2: "Miidhaa hir'isuuf, maalgashii dameewwan adda addaa keessatti babal'isuun ni danda'ama. Bu'aan argamu pirojektoota filatamanii fi haala gabaa irratti hundaa'a.",
    projModalFooterText: "Maamiloonni pirojektii fedhii fi kaayyoo maalgashii isaanii waliin deemu filachuuf walaba.",
    limitReachedError: "Daangaan ga'eera! Pirojektoota 5 qofa filachuu dandeessu."
  },
  ti: {
    headerSub: "(ናይ ካፒታል ዕድገት ንብረታት)",
    institutionalBannerTail: "ዕለታዊ ናይ Lumora ኽፍሊት ንምርካብ ናይ ኢንቨስትመንት ፓኬጅኩም ምረጹ።",
    cbeGuaranteeLabel: "✦ ናይ Lumora የካፒታል ዋስትናን ",
    coManagedDesc: "ኩሎም ኢንቨስትመንታት ንደህንነት ካፒታልኩም ብላዕለዋይ ክንክን ብLumora ዝመሓደሩ እዮም። ",
    interactiveSimulator: "የእድገት መቆጣጠሪያ ሲሙሌተር",
    calcDesc: "ዕለታዊን ወርሓዊን ትርፊ ብቐሊሉ ይጸባጽቡ",
    interactiveTool: "መሳሪያ ማስሊያ",
    desiredCapital: "ክፍሊት ኢንቨስትመንት መነገሲ (ETB)",
    walletBalanceLabel: "ናይ ቦርሳ ባላንስ:",
    minLabel: "ዝተሓተ",
    maxLabel: "ዝለዓለ",
    targetDailyYield: "የታለመው ዕለታዊ ትርፊ ሚዛን (%)",
    daysDurationLabel: "ናይ ኢንቨስትመንት ጥቅል ቆይታ (ቀናት)",
    calendarDaysLabel: "ናይ ኣቆጻጽራ መዓልታት",
    holdingCycle: "ናይ መጽንሒ እብረ",
    forecastMetricsTitle: "ናይ ዕለትን ወርሕን ናይ ትርፊ ትንበያ መለኪታት",
    dailyReturn: "ዕለታዊ ዝርካብ",
    estClearValue: "ብጽሒት ዝተገመተ ዋጋ",
    monthlyReturn: "ወርሃዊ ዝርካብ",
    estAccumulating: "ን30 መዓልታት ዝእከብ",
    yieldOverDays: "ኣብ {days} መዓልታት ዝርከብ ትርፊ",
    clearYield: "ዝተጻረየ ትርፊ",
    totalPayoutLabel: "ጠቕላላ ተመላሲ ክፍሊት",
    principal: "ዋና ካፒታል",
    interest: "ትርፊ",
    smartAdvisorTitle: "ናይ ቪአይፒ ደረጃ የማሳደጊያ ብልህ አማኻሪ",
    sufficientLedger: "እኹል ባላንስ ኣለኩም",
    insufficientLedger: "ሒሳብኹም ምምላእ የድሊ",
    requiredCapitalCore: "ዝድለ መበገሲ ኢንቨስትመንት",
    sovereignCbeSecureBadge: "ብLumora ዝተረጋገጸ የደህንነት ንብረት",
    investInPlan: "ኣብ {name} ኢንቨስት ግበሩ",
    secureInvestHeader: "ውሑስ የLumora ኢንቨስትመንት",
    cbeSettlementSub: "ናይ Lumora ክፍሊት መረጋገጺ",
    assetAllocationTier: "ናይ ኢንቨስትመንት ፓኬጅ ደረጃ",
    deductionFromWallet: "ካብ ቦርሳ ዝቕነስ መጠን",
    guaranteedDailyRate: "ዝተረጋገጸ ዕለታዊ ዝርካብ መጠን",
    maturityLedgerReturn: "ምስ ተወድአ ዝርከብ ጠቕላላ ተመላሲ",
    goBack: "ተመለስ",
    confirmInvestment: "ኢንቨስትመንት አረጋግጽ",
    capitalProtectionGuarantee: "100% ናይ ካፒታል ደህንነት ዋስትና በLumora ተዋሂቡዎ እዩ",
    cyberSecurityCompliance: "ብ256-ቢት ላዕለዋይ መረጋገጺ ዝተሓለወ",
    cycleLabel: "እብረ ሰዓት",
    moveSlider: "ትርፊ ንምጽብጻብ እቲ መቆጻጸሪ የንቀሳቕሱ",
    unlockedActive: "ተኸፊቱ አሎ",
    projectSectionLabel: "✦ ናይ ኢንቨስትመንት ፕሮጀክትታት",
    allocationModelCode: "◈ ናይ LUMORA ምምጣን ሞዴል ◈",
    selectedPortfolioTitle: "ዝተመርጹ ናይ ኢንቨስትመንት ፕሮጀክትታት",
    selectedPortfolioDesc: "ንቁ ባላንስ ፈንድኹም ኣብ ዝደለኹምዎ ዘፈር መደበሩ። (ክሳብ 5 ይምረጡ)",
    addProjectBtn: "ናይ ኢንቨስትመንት ፕሮጀክት ወስኽ",
    noActiveProjects: "ክሳብ ሕጂ ንቁ ናይ ኢንቨስትመንት ፕሮጀክት ኣይተመርጸን።",
    clickToChooseProjects: "ካፒታል ንምምጣን ክሳብ 5 ፕሮጀክትታት ንምምራጽ ላዕለዋይ ቁልፊ ጠውቑ።",
    activeBadge: "ንቁ",
    portfoliosSelectedLabel: "ዝተመርጹ ፖርትፎሊዮታት፡",
    availableProjTitle: "ዘለዉ ናይ ኢንቨስትመንት ፕሮጀክትታት (ክሳብ 5 አማራጺታት ይምረጡ)፡",
    projModalDesc1: "ተጠቀምቲ ካብቶም ዘለዉ አማራጺታት ክሳብ 5 ናይ ኢንቨስትመንት ፕሮጀክትታት ክመርጹ ይኽእሉ እዮም። ኢንቨስት ዝገበርዎ ገንዘብ ኣብቶም ዝተመርጹ ፕሮጀክትታት ጥራሕ ይምደብ። ቀጻሊ ዕብየትን ረብሓን ን ምርካብ Lumora ነዞም ኢንቨስትመንታት የመሓድርን ይከታተልን እዩ።",
    projModalDesc2: "ሓደጋ ንምንካይ ኢንቨስትመንታት ኣብ ዝተፈላለዩ ዘፈራትን ዕድላትን ክመቓቐሉ ይኽእሉ እዮም። ውጽኢቱ ከከም አፈጻጸማ ዝተመርጹ ፕሮጀክትታትን ኩነታት ዕዳጋን ይውስን።",
    projModalFooterText: "ተጠቀምቲ ምስ ናይ ኢንቨስትመንት ዕላማኦምን ምርጭኦምን ዝሰማምዑ ፕሮጀክትታት ናይ ምምራጽ ምሉእ ናጽነት ኣለዎም።",
    limitReachedError: "ገደብ በጺሑ እዩ! ክሳብ 5 ፕሮጀክትታት ጥራሕ ክትመርጹ ትኽእሉ እዮም።"
  },
  so: {
    headerSub: "(Hantida Koritaanka Lumora)",
    institutionalBannerTail: "Dooro xidhmada VIP-ka si aad u hesho dakhli maalinle ah oo Lumora ah.",
    cbeGuaranteeLabel: "✦ Dammaanadda Kaapitaalka Lumora & ",
    coManagedDesc: "Dhammaan maalgashiyada waxaa loo maamulaa si heer sare ah si loo ilaaliyo nabadgelyada maalkaaga bi Lumora. ",
    interactiveSimulator: "VIP INVESTMENT YIELD SIMULATOR",
    calcDesc: "Calculate potential compound growth metrics and daily pay rates beforehand",
    interactiveTool: "Aalad Interactive Ah",
    desiredCapital: "Desired Capital Allocation (ETB)",
    walletBalanceLabel: "Wallet Acc. Balance:",
    minLabel: "Yar",
    maxLabel: "Badan",
    targetDailyYield: "Heerka Dakhliga Maalin kasta (%)",
    daysDurationLabel: "Maturity Muddo Xidhmada (Maalmood)",
    calendarDaysLabel: "Maalmood Kalandarka",
    holdingCycle: "Wareegga muddada haya",
    forecastMetricsTitle: "FOST-METRICSKA MAALKA EE RUNTA AH",
    dailyReturn: "Dakhliga Maalin kasta",
    estClearValue: "Qiyaasta Saafi Qiimaha",
    monthlyReturn: "Dakhliga Bisha",
    estAccumulating: "Isku ururinta 30 Maalmood",
    yieldOverDays: "Dakhliga {days} Maalmood wareega",
    clearYield: "Saafi Dakhli",
    totalPayoutLabel: "Guud ahaan Lacag Bixinta Xidhmada",
    principal: "Principal",
    interest: "Earnings",
    smartAdvisorTitle: "La-taliyaha Firfircoon ee Heerka VIP",
    sufficientLedger: "KASHKA WALLET-KA WAA GUUROY",
    insufficientLedger: "UBAAHAN IN KASH LABO LABO",
    requiredCapitalCore: "Ugu Yaraan Maalgashiga Loo Baahan Yen",
    sovereignCbeSecureBadge: "Hantida Iskaashiga Sugan ee Lumora",
    investInPlan: "Ku Maalgasho {name}",
    secureInvestHeader: "Maalgashiga Amniga ee Lumora",
    cbeSettlementSub: "Xawaaladda Herrega Lumora",
    assetAllocationTier: "Heerka VIP-ka Xidhmada",
    deductionFromWallet: "Ka Jarista Lacagta Wallet-ka",
    guaranteedDailyRate: "Guaranteed Daily Rate",
    maturityLedgerReturn: "Maturity Ledger Return",
    goBack: "Noqo",
    confirmInvestment: "Xaqiiji Maalgashiga",
    capitalProtectionGuarantee: "100% Dammaanad Ilaalinta Maalka by Lumora",
    cyberSecurityCompliance: "Amniga Hab-raaca Xisaabinta 256-bit",
    cycleLabel: "wareeg",
    moveSlider: "Dhaqaaji si aad u tijaabiso faahfaahinta dakhliga",
    unlockedActive: "Waa Firfircoon",
    projectSectionLabel: "✦ Mashaariicda Maalgashiga",
    allocationModelCode: "◈ QAABKA QOONDADA LUMORA ◈",
    selectedPortfolioTitle: "LIISKA MASHAARIICDA MAALGASHIGA EE LA XUSHAY",
    selectedPortfolioDesc: "Dooro oo u qoondee lacagaha qorshahaaga hantida qaybaha koritaanka gaarka ah. (Dooro ilaa 5)",
    addProjectBtn: "Kudar Mashruuc Maalgashi",
    noActiveProjects: "Ilaa hadda ma jiraan mashaariic maalgashi oo firfircoan oo la habeeyay.",
    clickToChooseProjects: "Guji badhanka sare si aad u doorato ilaa 5 mashaariicood oo loogu talagalay qoondada caasimada.",
    activeBadge: "FIRFIRCOON",
    portfoliosSelectedLabel: "Mashaariicda la Dooray:",
    availableProjTitle: "Mashaariicda Maalgashiga ee Jira (Dooro ilaa 5):",
    projModalDesc1: "Isticmaalayaashu waxay dooran karaan ilaa 5 mashruuc maalgashi oo ka mid ah xulashooyinka jira. Lacagta ay maalgashadaan waxaa loo qoondayn doonaa oo keliya mashaariicda ay doorteen. Lumora waxay maamushaa oo kormeertaa mashaariicdan si loo gaaro koritaan iyo dakhli joogto ah.",
    projModalDesc2: "Si loo yareeyo khatarta, maalgashiga waxaa loo kala qaybin karaa waaxyo iyo fursado dhowr ah. Dakhliga wuxuu ku xiran yahay waxqabadka mashaariicda la doortay iyo xaaladaha suuqa.",
    projModalFooterText: "Isticmaalayaashu waxay xor u yihiiniin inay doortaan mashaariicda sida ugu fiican ula jaanqaadi kara yoolalkooda maalgashi iyo dooqyadooda.",
    limitReachedError: "Xadka waa la gaaray! Waxaad dooran kartaa ugu badnaan 5 mashruuc."
  }
};

const getAdvisorText = (
  lang: LanguageCode, 
  amount: number, 
  currentName: string, 
  nextName: string | null, 
  nextDiff: number, 
  nextRate: string, 
  currentRate: string
) => {
  const diffStr = (nextDiff ?? 0).toLocaleString();
  const amtStr = (amount ?? 0).toLocaleString();
  
  const translations: Record<LanguageCode, string> = {
    en: nextName 
      ? `Your simulated ${amtStr} ETB principal corresponds to ${currentName}. Add just ${diffStr} ETB to satisfy ${nextName}, boosting your daily dividend multiplier to ${nextRate}% Daily!`
      : `Excellent! Your custom investment sum matches our top tier ${currentName}. This guarantees a premier daily dividend rate of ${currentRate}% Daily payout!`,
    am: nextName
      ? `ያስገቡት ${amtStr} ETB መነሻ ካፒታል ከ${currentName} ጋር ይዛመዳል። ተጨማሪ ${diffStr} ETB በማስገባት ${nextName}ን ማግኘት ይቻላል፣ በዚህም ዕለታዊ የትርፍ መጠንዎን ወደ ${nextRate}% Daily ማሳደግ ይችላሉ!`
      : `በጣም ጥሩ! የእርስዎ የኢንቨስትመንት መጠን ከከፍተኛው ደረጃ ${currentName} ጋር ይዛመዳል። ይህ ደግሞ ታላቅ ዕለታዊ የ${currentRate}% Daily የትርፍ ክፍያ ዋስትና ይሰጥዎታል!`,
    om: nextName
      ? `Herregni kee ${amtStr} ETB kan simatame ${currentName} wajjini. Maallaqa ${diffStr} ETB dabalataan erguun gara ${nextName} ol-guddisuun, dhaala guuyyaa kee gara ${nextRate}% Daily ol-guddisi!`
      : `Baay'ee gaariidha! Qabeenyi kee sadarkaa ol-aanaa ${currentName} wajjin wol-fakkaata. Kunis kaffaltii dhaala guuyyaa ${currentRate}% Daily siif mirkaneessa!`,
    ti: nextName
      ? `ዘእተውዎ ${amtStr} ETB ምስ ${currentName} ይሳነ እዩ። ተወሳኺ ${diffStr} ETB ብምእታው ናብ ${nextName} ክትሰግሩ ትኽእሉ ኢኹም፣ በዚ ድማ ዕለታዊ ዝርካብኩም ናብ ${nextRate}% Daily ክተዕብይዎ ትኽእሉ!`
      : `በጣዕሚ ጽቡቕ! ኢንቨስትመንትኩም ምስቲ ዝለዓለ ደረጃ ${currentName} ዝሰማማዕ እዩ። እዚ ድማ ብሉጽ ዕለታዊ ${currentRate}% Daily ናይ ትርፊ ክፍሊት ዋስትና ይህበኩም!`,
    so: nextName
      ? `Lacagtaada qiyaasta ah ee ${amtStr} ETB waxay u dhigantaa ${currentName}. Ku dar oo kaliya ${diffStr} ETB si aad u gaarto ${nextName}, adoo kor u qaadaya dakhligaaga maalin kasta ilaa ${nextRate}% Daily!`
      : `Aad u fiican! Maalgashigaaga rasmiga ah wuxuu u dhigmaa heerkayaga ugu sarreeya ee ${currentName}. Tani waxay dammaanad qaadaysaa dakhli maalinle ah oo ah ${currentRate}% Daily!`
  };
  return translations[lang] || translations['en'];
};

interface InvestmentsTabProps {
  plans: InvestmentPlan[];
  profile: Profile;
  onBuyPlan: (level: number, durationDays?: number) => Promise<{ success: boolean; error?: string }>;
}

export default function InvestmentsTab({ plans, profile, onBuyPlan }: InvestmentsTabProps) {
  const { t, language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [referrals, setReferrals] = useState<any[]>([]);
  const [hiddenTrackers, setHiddenTrackers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let active = true;
    const fetchReferrals = async () => {
      try {
        const response = await fetch(`/api/referrals/${profile.userId}`);
        if (response.ok && active) {
          const data = await response.json();
          setReferrals(data);
        }
      } catch (err) {
        console.error("Error fetching referrals in InvestmentsTab:", err);
      }
    };
    if (profile?.userId) {
      fetchReferrals();
    }
    return () => {
      active = false;
    };
  }, [profile?.userId]);

  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(() => {
    try {
      const persisted = localStorage.getItem(`lumora_selected_projects_${profile.userId}`);
      return persisted ? JSON.parse(persisted) : [
        'Stock Investing', 'Real Estate Investment', 'Gold & Precious Metals Investment'
      ];
    } catch {
      return ['Stock Investing', 'Real Estate Investment', 'Gold & Precious Metals Investment'];
    }
  });
  const [tempSelectedProjects, setTempSelectedProjects] = useState<string[]>([]);
  const [projectError, setProjectError] = useState<string>('');

  // Choose custom durations mapped per plan level
  const [chosenDurations, setChosenDurations] = useState<Record<number, number>>({});

  // Calculator states starting from 5000 (VIP level 1)
  const [calcAmount, setCalcAmount] = useState<number>(5000);
  const [calcDuration, setCalcDuration] = useState<number>(50); // Customize duration days

  const activeTrans = localInvestmentsTranslations[language] || localInvestmentsTranslations['en'];

  // Resolve active calculator rate dynamically from the selected plan's metrics
  const currentCalcPlan = useMemo(() => {
    return plans.find(p => p.requiredInvestment === calcAmount) || plans[0] || { requiredInvestment: 5000, dailyRate: 0.0350, name: "VIP Level 1" };
  }, [calcAmount, plans]);

  const calcRate = useMemo(() => {
    return currentCalcPlan.dailyRate * 100;
  }, [currentCalcPlan]);

  // Determine closest active plan badge mapping
  const recommendation = useMemo(() => {
    const matchingPlan = [...plans]
      .filter(p => calcAmount >= p.requiredInvestment)
      .sort((a, b) => b.requiredInvestment - a.requiredInvestment)[0];
    
    const nextBetterPlan = [...plans]
      .filter(p => p.requiredInvestment > calcAmount)
      .sort((a, b) => a.requiredInvestment - b.requiredInvestment)[0];

    return {
      current: matchingPlan ? matchingPlan : plans[0],
      next: nextBetterPlan || null
    };
  }, [calcAmount, plans]);

  // Derived calculations
  const dailyReturn = useMemo(() => calcAmount * (calcRate / 100), [calcAmount, calcRate]);
  const monthlyReturn = useMemo(() => dailyReturn * 30, [dailyReturn]);
  const durationReturn = useMemo(() => dailyReturn * calcDuration, [dailyReturn, calcDuration]);
  const totalPayout = useMemo(() => calcAmount + durationReturn, [calcAmount, durationReturn]);
  const isAffordable = (profile?.walletBalance ?? 0) >= calcAmount;

  // Helper getters for plan listing
  const getPlanDuration = (level: number) => {
    return chosenDurations[level] || 50;
  };

  const getDynamicReturn = (p: InvestmentPlan) => {
    const days = getPlanDuration(p.level);
    return p.requiredInvestment + Math.round(p.requiredInvestment * p.dailyRate * days);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    setMessage(null);

    const result = await onBuyPlan(selectedPlan.level, selectedPlan.durationDays);
    setLoading(false);

    if (result.success) {
      setMessage({ text: t.investmentSuccess, isError: false });
      setTimeout(() => {
        setSelectedPlan(null);
        setMessage(null);
      }, 3000);
    } else {
      setMessage({ text: result.error || t.error, isError: true });
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* High-Contrast Professional Tab Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-slate-100 border-2 border-slate-300 rounded-2xl p-4.5 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#0A3D91]/10 rounded-full blur-2xl"></div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A3D91] text-white flex items-center justify-center border-2 border-white shrink-0 shadow-md">
            <Rocket className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-display font-black text-sm text-[#0A3D91] uppercase tracking-wider">
              {t.vipPlans} {activeTrans.headerSub}
            </h2>
            <p className="text-[10px] text-slate-850 mt-0.5 font-bold leading-normal">
              {activeTrans.institutionalBannerTail}
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Notice Card - Strongly Legible */}
      <div className="p-4 rounded-2xl bg-emerald-100/90 border-2 border-emerald-400 text-[11px] text-emerald-950 leading-relaxed flex items-start space-x-2.5 shadow-sm">
        <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-800" />
        <div>
          <span className="font-black text-emerald-950 block text-xs uppercase tracking-wide mb-0.5">
            {activeTrans.cbeGuaranteeLabel}{t.riskDisclosure}
          </span>
          <p className="font-bold">
            {t.disclaimerText} {activeTrans.coManagedDesc}{t.projectedReturnEst}
          </p>
        </div>
      </div>

      {/* Lumora Investment Projects Management Panel */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-mono font-black text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200 w-max block">
              {activeTrans.allocationModelCode}
            </span>
            <h3 className="font-display font-black text-xs text-slate-900 uppercase tracking-wide">
              {activeTrans.selectedPortfolioTitle}
            </h3>
            <p className="text-[10px] text-slate-800 font-bold leading-normal">
              {activeTrans.selectedPortfolioDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setTempSelectedProjects(selectedProjects);
              setProjectError('');
              setShowProjectsModal(true);
            }}
            className="px-4 py-2.5 bg-[#0A3D91] hover:bg-[#072452] text-white font-black text-[11px] rounded-xl transition-all shadow-md shrink-0 uppercase tracking-widest flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeTrans.addProjectBtn}</span>
          </button>
        </div>

        {selectedProjects.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-[11px] text-[#0A3D91] font-extrabold">{activeTrans.noActiveProjects}</p>
            <p className="text-[10px] text-slate-800 font-extrabold mt-1">{activeTrans.clickToChooseProjects}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {selectedProjects.map((proj) => {
              const matched = availableProjects.find(ap => ap.name === proj);
              return (
                <div key={proj} className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center space-x-2 shadow-2xs">
                  <span className="text-base shrink-0">{matched?.icon || '⚙'}</span>
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-black text-slate-950 truncate leading-tight">{getProjName(proj, language)}</p>
                    <span className="text-[7.5px] font-mono font-black text-emerald-800 bg-emerald-100/70 border border-emerald-250 px-1.5 py-0.2 rounded-md block mt-1 w-max font-bold uppercase tracking-wider">{activeTrans.activeBadge}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Yield Calculator Tool with High Contrast Styling */}
      <div id="yield-calculator-tool" className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0A3D91] text-white flex items-center justify-center shadow-sm">
              <Calculator className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-display font-black text-xs text-[#0A3D91] uppercase tracking-wide">
                {activeTrans.interactiveSimulator}
              </h3>
              <p className="text-[10px] text-slate-800 font-bold">
                {activeTrans.calcDesc}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 text-[9px] font-black text-blue-900 bg-blue-100 border-2 border-blue-300 rounded-lg font-mono flex items-center space-x-1 uppercase shadow-2xs">
            <Sparkles className="w-3 h-3 animate-pulse text-amber-500" />
            <span>{activeTrans.interactiveTool}</span>
          </span>
        </div>

        {/* Double Column interactive controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls Panel */}
          <div className="space-y-4">
            {/* Custom Amount Entry */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10.5px] font-black text-slate-900 uppercase tracking-wide font-sans">
                  Select Investment Level
                </label>
                <div className="flex items-center space-x-1 text-slate-900">
                  <span className="text-[10px] font-bold">{activeTrans.walletBalanceLabel}</span>
                  <span className="text-[10.5px] font-black font-mono text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                    {(profile?.walletBalance ?? 0).toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {/* Grid of Predefined VIP level Amounts */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {plans.map((p) => {
                  const isSelected = calcAmount === p.requiredInvestment;
                  return (
                    <button
                      key={p.level}
                      type="button"
                      onClick={() => setCalcAmount(p.requiredInvestment)}
                      className={`py-2 px-1 text-[10px] font-black rounded-lg border-2 transition-all text-center flex flex-col justify-center items-center cursor-pointer active:scale-95 ${
                        isSelected 
                          ? 'bg-[#0A3D91] border-[#0A3D91] text-white shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100/80 hover:border-slate-350'
                      }`}
                    >
                      <span className="font-sans text-[8px] opacity-75">{p.name}</span>
                      <span className="font-mono text-xs font-black">
                        {p.requiredInvestment >= 1000000 
                          ? `${p.requiredInvestment / 1000000}M` 
                          : p.requiredInvestment >= 1000 
                            ? `${p.requiredInvestment / 1000}k` 
                            : p.requiredInvestment
                        }
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select tenure days duration dynamically */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-[10.5px] font-black text-slate-900 uppercase tracking-wide font-sans block font-sans">
                  Select Investment Duration Tenure
                </label>
                <span className="text-xs font-black font-mono text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                  {calcRate.toFixed(1)}% {activeTrans.dailyReturn}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[50, 70, 90, 120, 180, 240, 360, 720].map((dt) => {
                  const isSelected = calcDuration === dt;
                  return (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => setCalcDuration(dt)}
                      className={`py-2 text-[11px] font-black font-mono rounded-lg border-2 transition-all text-center cursor-pointer active:scale-95 ${
                        isSelected 
                          ? 'bg-[#0A3D91] border-[#0A3D91] text-white shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100/80 hover:border-slate-350'
                      }`}
                    >
                      {dt} Days
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Summary Forecast Dashboard - Multi-Column Visual Card */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4.5 flex flex-col justify-between space-y-4 shadow-3xs">
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider font-mono flex items-center space-x-2">
                <TrendingUp className="w-4.5 h-4.5 text-[#0A3D91]" />
                <span>{activeTrans.forecastMetricsTitle}</span>
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Daily Dividends */}
                <div className="p-3 rounded-xl bg-white border-2 border-slate-205 shadow-3xs">
                  <span className="text-[9.5px] font-black text-slate-800 block uppercase tracking-wide">{activeTrans.dailyReturn}</span>
                  <span className="font-display font-black text-sm text-emerald-700 tracking-tight block mt-1 font-mono">
                    {dailyReturn.toLocaleString(undefined, { maximumFractionDigits: 1 })} ETB
                  </span>
                  <span className="text-[8px] font-extrabold text-slate-800 uppercase tracking-widest block mt-0.5">{activeTrans.estClearValue}</span>
                </div>

                {/* Monthly Dividends */}
                <div className="p-3 rounded-xl bg-white border-2 border-slate-205 shadow-3xs">
                  <span className="text-[9.5px] font-black text-slate-800 block uppercase tracking-wide">{activeTrans.monthlyReturn}</span>
                  <span className="font-display font-black text-sm text-[#0A3D91] tracking-tight block mt-1 font-mono">
                    {monthlyReturn.toLocaleString(undefined, { maximumFractionDigits: 1 })} ETB
                  </span>
                  <span className="text-[8px] font-extrabold text-slate-800 uppercase tracking-widest block mt-0.5">{activeTrans.estAccumulating}</span>
                </div>

                {/* Return Over Duration */}
                <div className="p-3 rounded-xl bg-white border-2 border-slate-205 shadow-3xs col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-black text-slate-800 uppercase tracking-wide">
                      {activeTrans.yieldOverDays.replace('{days}', String(calcDuration))}
                    </span>
                    <span className="text-[9px] font-black bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 uppercase tracking-wider font-mono">
                      +{((durationReturn / calcAmount) * 100).toFixed(0)}% {activeTrans.clearYield}
                    </span>
                  </div>
                  <span className="font-display font-black text-base text-emerald-700 block mt-1 font-mono">
                    {durationReturn.toLocaleString(undefined, { maximumFractionDigits: 1 })} ETB
                  </span>
                </div>
              </div>

              {/* Total Payout (Capital + Yield) */}
              <div className="bg-blue-50/80 rounded-xl p-3 border-2 border-blue-200 flex items-center justify-between shadow-3xs">
                <div>
                  <span className="text-[9px] text-blue-950 font-black block uppercase tracking-wide">{activeTrans.totalPayoutLabel}</span>
                  <span className="text-[13px] font-black text-[#0A3D91] font-mono block mt-0.5">
                    {totalPayout.toLocaleString(undefined, { maximumFractionDigits: 1 })} ETB
                  </span>
                </div>
                <div className="text-right text-[8.5px] font-black font-mono text-slate-800 space-y-0.5 uppercase tracking-wider">
                  <div>{activeTrans.principal}: {calcAmount.toLocaleString()} ETB</div>
                  <div className="text-emerald-700">{activeTrans.interest}: {durationReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })} ETB</div>
                </div>
              </div>
            </div>

            {/* Intelligent Recommendation Alert callout based on plan matches */}
            <div className="bg-[#0A3D91]/6 border-2 border-[#0A3D91]/20 rounded-xl p-3.5 space-y-2 text-slate-900">
              <div className="flex items-center space-x-1.5 text-[10px] font-black text-[#0A3D91] font-sans uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-[#0A3D91] shrink-0 animate-bounce" />
                <span>{activeTrans.smartAdvisorTitle}</span>
              </div>
              
              <div className="text-[10px] text-slate-900 leading-relaxed font-bold">
                {getAdvisorText(
                  language, 
                  calcAmount, 
                  recommendation.current?.name || 'VIP 1', 
                  recommendation.next?.name || null, 
                  recommendation.next ? (recommendation.next.requiredInvestment - calcAmount) : 0, 
                  recommendation.next ? (recommendation.next.dailyRate * 100).toFixed(1) : '0', 
                  recommendation.current ? (recommendation.current.dailyRate * 100).toFixed(1) : '0'
                )}
              </div>
              
              {/* Context Wallet Purchase quick button feedback */}
              <div className="pt-2.5 border-t border-slate-300/60 flex justify-between items-center font-bold">
                <span className="text-[9px] font-black uppercase text-slate-900 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${isAffordable ? 'bg-emerald-500 border border-emerald-300' : 'bg-red-500 animate-pulse border border-red-300'}`}></span>
                  <span>{isAffordable ? activeTrans.sufficientLedger : activeTrans.insufficientLedger}</span>
                </span>
                
                {recommendation.current && (
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(recommendation.current)}
                    className="text-[9px] font-black uppercase text-white bg-[#0A3D91] hover:bg-[#072a66] border-2 border-transparent px-3 py-1.5 rounded-lg shadow-sm cursor-pointer active:scale-95 transition-all font-mono tracking-wider"
                  >
                    {activeTrans.investInPlan.replace('{name}', recommendation.current.name)} →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 15 VIP Plans Grid listing - Highly Professional & Durable Design Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => {
          const isElevated = p.requiredInvestment > (profile?.walletBalance ?? 0);
          const currentPlanActive = (profile?.vipLevel ?? 0) >= p.level;

          return (
            <div 
              key={p.level}
              className="p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-[#0A3D91]/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  {/* VIP Badge - Dominant High Contrast */}
                  <span className="px-3 py-1 text-[10px] font-black rounded-lg bg-[#0A3D91] text-white uppercase tracking-wider shadow-2xs font-mono">
                    {p.name}
                  </span>
                  
                  {currentPlanActive ? (
                    <span className="text-[9px] font-black text-emerald-900 flex items-center space-x-1.5 uppercase tracking-wider bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700 animate-pulse animate-duration-1000" />
                      <span>{activeTrans.unlockedActive}</span>
                    </span>
                  ) : (
                    <span className="text-[8px] font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-300 uppercase tracking-widest">
                      Tier {p.level}
                    </span>
                  )}
                </div>

                {/* Investment Capital Readout */}
                <div className="mt-3.5 flex items-baseline space-x-2">
                  <span className="font-display font-black text-2xl text-slate-950 tracking-tight font-mono">
                    {p.requiredInvestment.toLocaleString()}
                  </span>
                  <span className="text-sm font-black text-slate-800 font-mono">ETB</span>
                </div>
                <p className="text-[9.5px] text-slate-800 mt-1 uppercase tracking-wider font-extrabold flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5"></span>
                  {activeTrans.requiredCapitalCore}
                </p>

                {/* Secure Partnership Badge */}
                <div className="mt-2.5 flex items-center space-x-1.5 px-2.5 py-1 text-[9px] font-black rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-350 w-fit uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{activeTrans.sovereignCbeSecureBadge}</span>
                </div>

                {/* Return Rate indicators with full-contrast weights */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t-2 border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-800 block font-black uppercase tracking-wide">{t.dailyReturnRate}</span>
                    <span className="text-xs font-black text-emerald-700 font-mono block mt-0.5">
                      {(p.dailyRate * 100).toFixed(1)}% / {t.day || 'day'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-800 block font-black uppercase tracking-wide">{t.duration} {activeTrans.cycleLabel}</span>
                    <span className="text-xs font-black text-slate-900 font-mono block mt-0.5">
                      {getPlanDuration(p.level)} {t.days}
                    </span>
                  </div>
                </div>

                {/* Duration Tenure Picker inside card */}
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#0A3D91] block font-sans">
                    Choose Investment Tenure
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[50, 70, 90, 120, 180, 240, 360, 720].map((dt) => {
                      const isActive = getPlanDuration(p.level) === dt;
                      return (
                        <button
                          key={dt}
                          type="button"
                          onClick={() => setChosenDurations(prev => ({ ...prev, [p.level]: dt }))}
                          className={`py-1 text-[9.5px] font-black font-mono rounded-lg border transition-all text-center cursor-pointer ${
                            isActive
                              ? 'bg-[#0A3D91] border-[#0A3D91] text-white shadow-2xs'
                              : 'bg-slate-55 border-slate-200 text-slate-705 hover:bg-slate-100'
                          }`}
                        >
                          {dt}d
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Total return highlight box */}
                <div className="mt-3.5 bg-blue-50/50 rounded-xl p-2.5 px-3 flex justify-between items-center text-[11px] border-2 border-blue-150 animate-in fade-in duration-100" key={getPlanDuration(p.level)}>
                  <span className="text-[9.5px] text-[#0A3D91] font-black uppercase tracking-wider">{t.estimatedReturn}</span>
                  <span className="font-black text-[#0A3D91] text-xs font-mono">
                    {getDynamicReturn(p).toLocaleString()} ETB
                  </span>
                </div>

                {/* VIP 5+ Milestone Tracker with Hide/Show mechanisms, as requested */}
                {p.level >= 5 && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-[#0A3D91] uppercase tracking-wide flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span>VIP {p.level} Milestone Requirements</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setHiddenTrackers(prev => ({ ...prev, [p.level]: !prev[p.level] }))}
                        className="text-[9px] font-black uppercase text-[#0A3D91] hover:text-[#062452] bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded transition-colors border border-slate-200 cursor-pointer active:scale-95"
                        title={hiddenTrackers[p.level] ? "Show tracker details" : "Hide tracker details"}
                      >
                        {hiddenTrackers[p.level] ? "✦ Show" : "✕ Hide"}
                      </button>
                    </div>

                    {!hiddenTrackers[p.level] && (
                      <div className="space-y-2 p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-[10.5px]">
                        {/* Milestone 1: Duration >= 5 months */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            {(() => {
                              const regDate = profile.registrationDate ? new Date(profile.registrationDate) : new Date();
                              const now = new Date();
                              const diffTime = Math.abs(now.getTime() - regDate.getTime());
                              const durationMonths = diffTime / (1000 * 60 * 60 * 24 * 30.4375);
                              return durationMonths >= 5 ? (
                                <span className="text-emerald-750 font-black text-xs">✓</span>
                              ) : (
                                <span className="text-rose-650 font-black text-xs">✗</span>
                              );
                            })()}
                            <span className="text-[9.5px] font-bold text-slate-800">Membership at least 5 Months</span>
                          </div>
                          <span className="font-mono text-[9px] font-bold text-slate-755 bg-white border px-1.5 py-0.5 rounded">
                            {(() => {
                              const regDate = profile.registrationDate ? new Date(profile.registrationDate) : new Date();
                              const now = new Date();
                              const diffTime = Math.abs(now.getTime() - regDate.getTime());
                              const durationMonths = diffTime / (1000 * 60 * 60 * 24 * 30.4375);
                              return (Math.round(durationMonths * 10) / 10).toFixed(1);
                            })()} / 5.0m
                          </span>
                        </div>

                        {/* Milestone 2: 25+ verified direct invites */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            {referrals.filter(r => r.isVerified || r.referredVipLevel >= 1).length >= 25 ? (
                              <span className="text-emerald-755 font-black text-xs">✓</span>
                            ) : (
                              <span className="text-rose-655 font-black text-xs">✗</span>
                            )}
                            <span className="text-[9.5px] font-bold text-slate-800">25+ Verified Direct Invites</span>
                          </div>
                          <span className="font-mono text-[9px] font-bold text-slate-755 bg-white border px-1.5 py-0.5 rounded">
                            {referrals.filter(r => r.isVerified || r.referredVipLevel >= 1).length} / 25
                          </span>
                        </div>

                        {/* Milestone 3: ID compliant */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            {profile.idVerificationStatus === 'verified' ? (
                              <span className="text-emerald-755 font-black text-xs">✓</span>
                            ) : (
                              <span className="text-rose-655 font-black text-xs">✗</span>
                            )}
                            <span className="text-[9.5px] font-bold text-slate-800">Verified National ID status</span>
                          </div>
                          <span className={`text-[8.5px] font-mono font-black px-1.5 py-0.5 rounded uppercase ${
                            profile.idVerificationStatus === 'verified' ? 'bg-emerald-50/70 text-emerald-700 border border-emerald-200' : 'bg-amber-50/70 text-amber-705 border border-amber-200'
                          }`}>
                            {profile.idVerificationStatus || 'Unsubmitted'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Purchase Trigger Button - High Contrast Action Call */}
              <button
                onClick={() => setSelectedPlan({
                  ...p,
                  durationDays: getPlanDuration(p.level),
                  estimatedReturn: getDynamicReturn(p)
                })}
                className={`w-full py-2.5 rounded-xl font-display text-[11px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer ${
                  isElevated 
                    ? 'bg-slate-100 text-slate-500 border-2 border-slate-300 font-bold' 
                    : 'bg-[#0a3d91] hover:bg-[#072452] hover:border-[#0A3D91] text-white border-2 border-[#0a3d91] shadow-sm font-black'
                }`}
              >
                {isElevated ? `⚠ ${t.insufficientBalance}` : activeTrans.investInPlan.replace('{name}', p.name)}
              </button>

            </div>
          );
        })}
      </div>

      {/* Checkout Modal confirmation - Premium Secure Overlay */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[99999] bg-[#070d19]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900">
            
            {/* Safe Header */}
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <div className="p-1.5 bg-blue-50 rounded-lg text-[#0A3D91]">
                <ShieldCheck className="w-5 h-5 text-[#0a3d91]" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-[#0A3D91] uppercase tracking-wider">
                  {activeTrans.secureInvestHeader}
                </h3>
                <p className="text-[9px] text-[#0A3D91] uppercase tracking-widest font-black mt-0.5">
                  {activeTrans.cbeSettlementSub}
                </p>
              </div>
            </div>
            
            {/* Detail Grid */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-white border-2 border-[#0A3D91]/10">
              <div className="flex justify-between text-[11px] border-b border-slate-200/60 pb-2">
                <span className="text-slate-800 font-black uppercase tracking-wider">{activeTrans.assetAllocationTier}</span>
                <span className="font-black text-[#0A3D91] uppercase tracking-wide">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-[11px] border-b border-slate-200/60 pb-2">
                <span className="text-slate-800 font-black uppercase tracking-wider">{activeTrans.deductionFromWallet}</span>
                <span className="font-black text-slate-950 font-mono text-[11.5px]">{selectedPlan.requiredInvestment.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-[11px] border-b border-slate-200/60 pb-2">
                <span className="text-slate-800 font-black uppercase tracking-wider">{activeTrans.guaranteedDailyRate}</span>
                <span className="font-black text-emerald-700 font-mono">{(selectedPlan.dailyRate * 100).toFixed(1)}% Daily Payout</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-800 font-black uppercase tracking-wider">{activeTrans.maturityLedgerReturn}</span>
                <span className="font-black text-blue-900 font-mono">{selectedPlan.estimatedReturn.toLocaleString()} ETB Total</span>
              </div>
            </div>

            {/* Display message logs */}
            {message && (
              <div className={`mt-4 p-3 rounded-xl text-xs text-center font-bold border-2 ${
                message.isError 
                  ? 'bg-rose-50 border-rose-400 text-rose-950 font-mono whitespace-pre-line text-left pl-6' 
                  : 'bg-emerald-50 border-emerald-400 text-emerald-950'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit and Cancel triggers - High Contrast */}
            <div className="grid grid-cols-2 gap-3 mt-5 font-bold">
              <button
                onClick={() => setSelectedPlan(null)}
                disabled={loading}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border-2 border-slate-300"
              >
                {activeTrans.goBack}
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading || selectedPlan.requiredInvestment > (profile?.walletBalance ?? 0)}
                className="py-2.5 bg-[#0a3d91] hover:bg-[#072452] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer text-center"
              >
                {loading ? t.loading : activeTrans.confirmInvestment}
              </button>
            </div>

            {/* Secure Partnership Guarantee */}
            <div className="mt-4 flex items-center justify-center space-x-1 py-1 bg-emerald-50 border border-emerald-250 rounded-lg">
              <BadgeInfo className="w-4 h-4 text-emerald-650 shrink-0" />
              <p className="text-[9.5px] text-emerald-950 leading-none font-bold uppercase tracking-wide">
                {activeTrans.capitalProtectionGuarantee}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Lumora Investment Model Projects Selector Modal */}
      {showProjectsModal && (
        <div className="fixed inset-0 z-[99999] bg-[#070d19]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-[#0f172a] max-h-[92vh] flex flex-col justify-between">
            <button 
              onClick={() => setShowProjectsModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-150 hover:bg-slate-205 text-slate-800 rounded-full cursor-pointer transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="overflow-y-auto space-y-4 pr-1 mb-4">
              <div>
                <span className="text-[9px] uppercase font-mono font-black text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {language === 'am' ? '◈ የድልድል መቆጣጠሪያ ◈' : language === 'om' ? '◈ Agarsiiftuu Maalgashii ◈' : language === 'ti' ? '◈ ናይ ምምጣን ሰሌዳ ◈' : language === 'so' ? '◈ Shaxda Qoondada ◈' : '◈ Allocation Dashboard ◈'}
                </span>
                <h3 className="font-display font-black text-sm text-[#0A3D91] uppercase tracking-wider mt-1.5">
                  {language === 'am' ? 'የLumora ኢንቨስትመንት ሞዴል' : language === 'om' ? 'Moodeela Maalgashii Lumora' : language === 'ti' ? 'ናይ Lumora ኢንቨስትመንት ሞዴል' : language === 'so' ? 'Qaabka Maalgashiga Lumora' : 'Lumora Investment Model'}
                </h3>
              </div>

              {/* Informational description verbatim as requested */}
              <div className="space-y-2.5 text-[11px] text-slate-800 leading-relaxed bg-slate-55 border border-slate-200 p-4 rounded-2xl font-bold">
                <p>
                  {activeTrans.projModalDesc1}
                </p>
                <p>
                  {activeTrans.projModalDesc2}
                </p>
                <p className="text-[#0A3D91] font-black uppercase text-[10px] tracking-wider border-t border-slate-200/80 pt-2.5 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  {activeTrans.availableProjTitle}
                </p>
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableProjects.map((p) => {
                  const isChecked = tempSelectedProjects.includes(p.name);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setProjectError('');
                        if (isChecked) {
                          setTempSelectedProjects(tempSelectedProjects.filter(name => name !== p.name));
                        } else {
                          if (tempSelectedProjects.length >= 5) {
                            setProjectError(activeTrans.limitReachedError);
                            return;
                          }
                          setTempSelectedProjects([...tempSelectedProjects, p.name]);
                        }
                      }}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                        isChecked 
                          ? 'bg-blue-50/80 border-[#0A3D91] text-[#0A3D91] ring-1 ring-[#0A3D91]'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-base shrink-0">{p.icon}</span>
                        <span className="text-[11.5px] font-bold text-slate-805 truncate">{getProjName(p.name, language)}</span>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked 
                          ? 'bg-[#0A3D91] border-[#0A3D91] text-white' 
                          : 'border-slate-350 bg-slate-50'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {projectError && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 font-bold rounded-xl text-xs text-center">
                  ⚠ {projectError}
                </div>
              )}

              <p className="text-[10px] text-slate-850 font-black italic text-center border-t border-slate-150 pt-2.5">
                {activeTrans.projModalFooterText}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-3 font-bold shrink-0">
              <span className="text-[11px] text-slate-850 font-mono font-extrabold">
                {activeTrans.portfoliosSelectedLabel} <strong className="text-[#0A3D91] font-black">{tempSelectedProjects.length} / 5</strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProjectsModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-all cursor-pointer border border-slate-300"
                >
                  {language === 'am' ? 'ሰርዝ' : language === 'om' ? 'Haqi' : language === 'ti' ? 'ሰርዝ' : language === 'so' ? 'Ilaabi' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tempSelectedProjects.length === 0) {
                      setProjectError(
                        language === 'am' ? 'እባክዎ ቢያንስ አንድ ንቁ ፕሮጀክት ይምረጡ።' : 
                        language === 'om' ? 'Maaloo yoo xiqqaate pirojektii tokko filadhaa.' : 
                        language === 'ti' ? 'እባክኹም ቢያንስ ሓደ ንቁ ፕሮጀክት ምረጹ።' : 
                        language === 'so' ? 'Fadlan dooro ugu yaraan hal mashruuc oo firfircoon.' : 
                        'Please select at least one active project.'
                      );
                      return;
                    }
                    setSelectedProjects(tempSelectedProjects);
                    try {
                      localStorage.setItem(`lumora_selected_projects_${profile.userId}`, JSON.stringify(tempSelectedProjects));
                    } catch (e) {
                      console.error(e);
                    }
                    setProjectError('');
                    setShowProjectsModal(false);
                  }}
                  className="px-5 py-2 bg-[#0A3D91] hover:bg-[#072452] text-white rounded-xl text-xs transition-all shadow-md cursor-pointer uppercase tracking-wider font-extrabold"
                >
                  {language === 'am' ? 'ፖርትፎሊዮ አስቀምጥ' : language === 'om' ? 'Kura Gara Maalgashii' : language === 'ti' ? 'ፖርትፎሊዮ ኣስቅጥ' : language === 'so' ? 'Kaydi Galka' : 'Save Portfolio'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
