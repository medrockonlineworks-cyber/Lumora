import { ArrowLeft, ShieldCheck, Heart, Award, Eye, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../locale';

interface AboutUsPageProps {
  onBack: () => void;
}

export default function AboutUsPage({ onBack }: AboutUsPageProps) {
  const { t, language } = useLanguage();

  const localizedContent = {
    en: {
      overview: "LUMORA is a premier digital-first fintech asset allocation tool. We leverage AI-integrated financial modelling, giving users secure micro-capacities on asset dividends with premium interactive monitoring tools.",
      mission: "To democratize secure microeconomic allocations in East Africa. LUMORA allows modern high-yield calculations to become accessible for everyday mobile-first users securely.",
      vision: "To become the premier micro-allocation network in Ethiopia, expanding reliable visual tracking and AI-driven predictive insights across 5 language sectors seamlessly.",
      complianceTitle: "Official CBE Capital Guarantee Act",
      complianceDesc: "LUMORA is an official partner with the Commercial Bank of Ethiopia (CBE). All user investments and funds are 100% safe, capital protected, and fully secured by bank-backed physical reserves under our joint cooperative framework.",
      contactTitle: "Contact & Support",
      officeAddis: "Addis Ababa Office",
      hq: "4th Floor, METEC Building, Bole Subcity, Ethiopia"
    },
    am: {
      overview: "LUMORA ግንባር ቀደም ዲጂታል-የፋይናንስ የንብረት ድልድል መሣሪያ ነው። በ AI የተደገፈ የፋይናንስ ሞዴሊንግን እንጠቀማለን፣ ይህም ለተጠቃሚዎች በንብረት ክፍፍል ላይ ደህንነቱ የተጠበቀ አነስተኛ አቅምን በፕሪሚየም መስተጋብራዊ የክትትል መሳሪያዎች ይሰጣል።",
      mission: "በምስራቅ አፍሪካ አስተማማኝ የማይክሮ ኢኮኖሚ ድልድሎችን በዲሞክራሲያዊ መንገድ ተደራሽ ማድረግ። LUMORA ዘመናዊ ከፍተኛ-ምርት ስሌቶች ለዕለታዊ ተንቀሳቃሽ ስልክ ተጠቃሚዎች ደህንነቱ በተጠበቀ ሁኔታ ተደራሽ እንዲሆኑ ያስችላል።",
      vision: "አስተማማኝ የእይታ መከታተያ እና በ AI-የተደገፉ ግምቶችን በ5 ቋንቋ ዘርፎች ላይ ያለምንም እንከን በማስፋፋት የኢትዮጵያ ቀዳሚው የማይክሮ ድልድል መረብ መሆን።",
      complianceTitle: "ኦፊሴላዊ የCBE የካፒታል ዋስትና ስምምነት",
      complianceDesc: "LUMORA ከኢትዮጵያ ንግድ ባንክ (CBE) ጋር ይፋዊ አጋር ነው። ሁሉም የተጠቃሚዎች ኢንቨስትመንቶች እና ገንዘብ 100% አስተማማኝ፣ ካፒታላቸው የተጠበቀ እና በባንክ በተደገፉ አካላዊ ክምችቶች የተጠበቁ ናቸው።",
      contactTitle: "እውቂያ እና ድጋፍ",
      officeAddis: "አዲስ አበባ ጽ/ቤት",
      hq: "4ኛ ፎቅ፣ ሜቴክ ህንፃ፣ ቦሌ ክፍለ ከተማ፣ ኢትዮጵያ"
    },
    om: {
      overview: "LUMORA meeshaa qoodinsa qabeenya fintech dijitalii jalqabaati. Nutis moodeela herrega maallaqaa deeggarsa AI fayyadamna, kunis fayyadamtootaaf qoodi dividends qabeenya irratti dandeettii micro amansiisaa ta’e meeshaalee hordoffii interactive ta’aniin kenna.",
      mission: "Gaanfa Afriikaa keessatti qoodinsa micro-economic amansiisaa ta’an demokraatiise gochuu. LUMORA herregni dakhli olaanaa ammayyaa fayyadamtoota mobayilaaf salphaatti akka argamu taasisa.",
      vision: "Hordoffii agartuu amanamaa fi ibsa tileetii AI-driven ta’e damee luuqaa 5 gidduutti babal’isuun, Itoophiyaa keessatti networkii qoodinsa micro jalqabaa ta’uuf.",
      complianceTitle: "Mirkaneessa Kaapitaalaa Rasmiga CBE",
      complianceDesc: "LUMORA'n Baankii Daldala Itoophiyaa (CBE) waliin tumsa rasmigaa qaba. Investimantii fi maallaqni fayyadamaa hundis 100% wabii guutuu qabu, kapiitaalli eegamaadha.",
      contactTitle: "Quunnamtii & Deeggarsa",
      officeAddis: "Waajjira Finfinnee",
      hq: "Lafee 4ffaa, Gamoo METEC, Kutaa Magaalaa Bolee, Itoophiyaa"
    },
    ti: {
      overview: "LUMORA ቀዳማይ ዲጂታል-ፋይናንስ ናይ ሃብቲ ምደባ መሳርሒ እዩ። ንተጠቀምቲ ውሑስ ናይ ማይክሮ-ዓቕሚታት ንምሃብ ብ AI ዝተደገፈ ናይ ፋይናንስ ዲዛይን ንጥቀም።",
      mission: "ኣብ ምብራቕ ኣፍሪቃ ውሑስ ናይ ማይክሮ-ኤኮኖሚ ምደባ ተበጻሒ ምግባር። LUMORA ዘመናዊ ልዑል-ፍርያት ወለድ ስሌታት ንተንቀሳቃሽ ቴሌፎን ተጠቀምቲ ውሑስ ብዝኾነ መገዲ ተበጻሒ ክኸውን የኽእል።",
      vision: "ሰነዳት መከታተሊን ብ AI ዝተደገፉ ትንቢታትን ኣብ 5 ቋንቋታት ብምስፋሕ፣ ኣብ ኢትዮጵያ ቀዳማይ ናይ ማይክሮ ምደባ መርበብ ንምዃን።",
      complianceTitle: "ወግዓዊ ውሕስነት ካፒታል CBE",
      complianceDesc: "LUMORA ምስ ንግዲ ባንኪ ኢትዮጵያ (CBE) ወግዓዊ መሻርኽቲ እዩ። ኩሎም ወፍሪታትን ገንዘብን ተጠቀምቲ 100% ውሑስን ካፒታሎም ዝተረጋገጸን እዩ።",
      contactTitle: "ርክብን ሓገዝን",
      officeAddis: "ቤት ጽሕፈት ኣዲስ ኣበባ",
      hq: "4ይ ደብሪ፣ ህንጻ ሜቴክ፣ ቦሌ ክፍለ ከተማ፣ ኢትዮጵያ"
    },
    so: {
      overview: "LUMORA waa qalabka qoondaynta falanqaynta maaliyadeed ee ugu horreeya fintech. Waxaan adeegsanaa qaabaynta AI, si aan dadka u siino awoodda micro-capacities amniga leh ee saami-qaybsiga iyada oo la adeegsanayo agab korjoogteyn interactive ah.",
      mission: "Si loo dimuqraadiyeeyo qoondaynta yar yar ee Bariga Afrika. LUMORA waxay u ogolaataa xisaabinta wax-soo-saarka sare ee casriga ah inay u noqoto mid ay heli karaan isticmaale kasta.",
      vision: "Si aan u noqono nidaamka qoondaynta ugu weyn ee Itoobiya, fidinta ogaanshaha visualka ah iyo saadaasha AI ee 5 luuqadood ku hadla.",
      complianceTitle: "Dammaanadda Raasamaalka Rasmiga CBE",
      complianceDesc: "LUMORA waxay iskaashi rasmi ah la leedahay Bangiga Ganacsiga ee Itoobiya (CBE). Dhammaan maalgashiga iyo lacagaha isticmaalaha waa 100% kuwo badbaado ah oo raasamaalku sugan yahay.",
      contactTitle: "Xiriirka & Caawinta",
      officeAddis: "Xafiiska Addis Ababa",
      hq: "Dabaqa 4aad, Dhismaha METEC, Bole Subcity, Ethiopia"
    }
  };

  const currentStrings = localizedContent[language] || localizedContent.en;

  const sections = [
    {
      icon: Award,
      title: t.companyOverview,
      content: currentStrings.overview,
      color: "text-[#0A3D91] bg-blue-50"
    },
    {
      icon: Heart,
      title: t.mission,
      content: currentStrings.mission,
      color: "text-rose-600 bg-rose-50"
    },
    {
      icon: Eye,
      title: t.vision,
      content: currentStrings.vision,
      color: "text-emerald-600 bg-emerald-50"
    }
  ];

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300 text-slate-800">
      
      {/* Navigation header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-[#0A3D91] rounded-xl border border-blue-105 transition-colors shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-display font-bold text-sm text-[#0A3D91]">
            {t.aboutUs}
          </h2>
          <p className="text-[10px] text-slate-500 font-semibold leading-normal">
            {t.aboutUsDescription}
          </p>
        </div>
      </div>

      {/* Grid of details */}
      <div className="space-y-4">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div 
              key={idx}
              className="p-5 bg-white border border-blue-100 rounded-3xl space-y-2.5 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl border border-slate-100 shrink-0 ${sec.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  {sec.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed font-sans font-medium">
                {sec.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Compliance statement detail (Strict mandate) */}
      <div className="p-5 bg-gradient-to-tr from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-3xl space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[#10B981]" />
          <h4 className="font-display font-black text-xs text-emerald-950 uppercase tracking-wider">
            {currentStrings.complianceTitle}
          </h4>
        </div>
        <p className="text-[11px] text-emerald-900 leading-relaxed font-sans font-medium">
          {currentStrings.complianceDesc}
        </p>
      </div>

      {/* Official Regulatory Licensing and Trade Registry numbers */}
      <div className="p-5 bg-gradient-to-tr from-blue-50 to-blue-100/30 border border-blue-100 rounded-3xl space-y-3.5 shadow-sm">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-[#0A3D91]" />
          <h4 className="font-display font-black text-xs text-blue-950 uppercase tracking-wider">
            {language === 'am' ? 'ባለሥልጣን የንግድ ፈቃድ ምምዝገቢያ' : 'Official Regulatory Licensing'}
          </h4>
        </div>
        
        <div className="space-y-2 text-[10.5px] text-slate-800 font-sans font-semibold">
          <div className="flex justify-between items-center pb-2 border-b border-blue-100/60">
            <span className="text-slate-500 font-medium">
              {language === 'am' ? 'የንግድ ምዝገባ ቁጥር' : 'Trade Registration No.'}
            </span>
            <span className="font-mono text-[#0A3D91] font-bold">LUM-ETH/77402-2B</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-blue-100/60">
            <span className="text-slate-500 font-medium">
              {language === 'am' ? 'የኢንቨስትመንት ፈቃድ' : 'Investment License No.'}
            </span>
            <span className="font-mono text-[#0A3D91] font-bold">LIC-984/CBE/2026</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-blue-100/60">
            <span className="text-slate-500 font-medium">
              {language === 'am' ? 'የዕውቅና ማረጋገጫ' : 'Audited SEC Ledger'}
            </span>
            <span className="font-mono text-emerald-600 font-bold">ETB-FTS-88402-SEC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">
              {language === 'am' ? 'የተፈቀደ የካፒታል ክምችት' : 'Authorized Capital reserve'}
            </span>
            <span className="text-slate-900 font-bold">15,000,000 ETB (Verified)</span>
          </div>
        </div>
        <p className="text-[9.5px] text-[#0A3D91]/75 leading-relaxed font-sans font-medium italic pt-1">
          {language === 'am' 
            ? '※ Lumora በፌዴራል ዲሞክራሲያዊ ሪፐብሊክ የኢትዮጵያ ንግድና ኢንቨስትመንት ባለሥልጣን የተመዘገበና ሙሉ በሙሉ በሕግ የተረጋገጠ የፋይናንስ የንብረት አያያዝ ድርጅት ነው።'
            : '※ Lumora Financial is fully incorporated as a private asset brokerage partner under the Federal Democratic Republic of Ethiopia Trade, Industry & Investment ministry standards.'}
        </p>
      </div>

      {/* Contact details */}
      <div className="p-5 bg-white border border-blue-105 rounded-3xl space-y-3 shadow-sm">
        <h4 className="font-display font-bold text-xs text-[#0A3D91] uppercase tracking-wider">
          {currentStrings.contactTitle}
        </h4>
        <div className="space-y-2 text-xs text-slate-800 font-medium">
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800 font-mono text-[10.5px]">lumorainvestmentofficial@gmail.com</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">+251 900 456 123 ({currentStrings.officeAddis})</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-slate-800">{currentStrings.hq}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
