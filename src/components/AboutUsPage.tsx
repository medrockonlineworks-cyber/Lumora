import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Heart, Award, Eye, Mail, Phone, MapPin, Briefcase, FileText, ChevronRight } from 'lucide-react';
import { useLanguage } from '../locale';
import LumoraStamp from './LumoraStamp';

interface AboutUsPageProps {
  onBack: () => void;
}

export default function AboutUsPage({ onBack }: AboutUsPageProps) {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading institutional settings:", err);
        setLoading(false);
      });
  }, []);

  const localizedContent = {
    en: {
      overview: "LUMORA is a premier digital-first fintech asset allocation tool. We leverage AI-integrated financial modelling, giving users secure micro-capacities on asset dividends with premium interactive monitoring tools. We offer a virtual debit Mastercard exchange rate of 1 USD = 170 ETB, managed using your secure login password.",
      mission: "To democratize secure microeconomic allocations in East Africa. LUMORA allows modern high-yield calculations to become accessible for everyday mobile-first users securely. (National ID card validation is optional for starting deposits).",
      vision: "To become the premier micro-allocation network in Ethiopia, expanding reliable visual tracking and AI-driven predictive insights across 5 language sectors seamlessly.",
      complianceTitle: "Official CBE Capital Guarantee Act",
      complianceDesc: "LUMORA is an official partner with the Commercial Bank of Ethiopia (CBE). All user investments and funds are 100% safe, capital protected, and fully secured by bank-backed physical reserves under our joint cooperative framework.",
      operatesTitle: "How Lumora Operates",
      operatesSubtitle: "Structured Investment & Asset Management Process",
      operatesP1: "Lumora provides users with access to carefully selected investment opportunities through a structured investment management process.",
      operatesP2: "Our dedicated analysis team continuously evaluates market conditions, investment opportunities, and potential project partnerships to identify opportunities that meet our selection standards. Based on this research and evaluation process, qualified investment projects are made available on the platform for users to review.",
      operatesP3: "Users can explore available projects, compare investment options, and choose the opportunities that best match their investment goals, preferred duration, and budget.",
      operatesP4: "Once an investment is selected, Lumora facilitates the allocation and management of funds through its operational framework. The platform coordinates investment activities, monitors project progress, and works with relevant partners or market participants where applicable. Lumora's professional management team coordinates these allocations on behalf of users, handling all direct execution and administrative oversight.",
      operatesP5: "Throughout the investment period, users can track their investments and view relevant updates through their Lumora dashboard. At the conclusion of the investment term, investment outcomes are processed and reflected in the user's account according to the performance of the selected opportunity.",
      contactTitle: "Contact & Support",
      officeAddis: "Addis Ababa Office",
      hq: "4th Floor, METEC Building, Bole Subcity, Ethiopia"
    },
    am: {
      overview: "LUMORA ግንባር ቀደም ዲጂታል-የፋይናንስ የንብረት ድልድል መሣሪያ ነው። በ AI የተደገፈ የፋይናንስ ሞዴሊንግን እንጠቀማለን፣ ይህም ለተጠቃሚዎች በንብረት ክፍፍል ላይ ደህንነቱ የተጠበቀ አነስተኛ አቅምን በፕሪሚየም መስተጋብራዊ የክትትል መሳሪያዎች ይሰጣል። ቨርቹዋል ማስተር ካርድ የውጭ ምንዛሬ ተመን 1 ዶላር = 170 የኢትዮጵያ ብር (ETB) ያቀርባል።",
      mission: "በምስራቅ አፍሪካ አስተማማኝ የማይክሮ ኢኮኖሚ ድልድሎችን በዲሞክራሲያዊ መንገድ ተደራሽ ማድረግ። LUMORA ዘመናዊ ከፍተኛ-ምርት ስሌቶች ለዕለታዊ ተንቀሳቃሽ ስልክ ተጠቃሚዎች ደህንነቱ በተጠበቀ ሁኔታ ተደራሽ እንዲሆኑ ያስችላል። (አስቀድሞ ብሔራዊ መታወቂያ መመዝገብ ለተቀማጭ ሂሳብ አማራጭ ነው)።",
      vision: "አስተማማኝ የእይታ መከታተያ እና በ AI-የተደገፉ ግምቶችን በ5 ቋንቋ ዘርፎች ላይ ያለምንም እንከን በማስፋፋት የኢትዮጵያ ቀዳሚው የማይክሮ ድልድል መረብ መሆን።",
      complianceTitle: "ኦፊሴላዊ የCBE የካፒታል ዋስትና ስምምነት",
      complianceDesc: "LUMORA ከኢትዮጵያ ንግድ ባንክ (CBE) ጋር ይፋዊ አጋር ነው። ሁሉም የተጠቃሚዎች ኢንቨስትመንቶች እና ገንዘብ 100% አስተማማኝ፣ ካፒታላቸው የተጠበቀ እና በባንክ በተደገፉ አካላዊ ክምችቶች የተጠበቁ ናቸው።",
      operatesTitle: "Lumora እንዴት እንደሚሰራ",
      operatesSubtitle: "የተዋቀረ የኢንቨስትመንት እና የንብረት አያያዝ ሂደት",
      operatesP1: "Lumora በጥንቃቄ የተመረጡ የኢንቨስትመንት ዕድሎችን በተዋቀረ የኢንቨስትመንት አስተዳደር ሂደት ለተጠቃሚዎች ያቀርባል።",
      operatesP2: "የእኛ የትንታኔ ቡድን የገበያ ሁኔታዎችን፣ የኢንቨስትመንት ዕድሎችን እና ሊሆኑ የሚችሉ የፕሮጀክት ሽርክናዎችን በቀጣይነት በመገምገም መስፈርቶቻችንን የሚያሟሉ ዕድሎችን ይለያል። በዚህ ምርምር እና ግምገማ ሂደት ላይ በመመስረት፣ ብቁ የኢንቨስትመንት ፕሮጀክቶች ለተጠቃሚዎች እንዲገመግሙ በፕላትፎርሙ ላይ ይቀርባሉ።",
      operatesP3: "ተጠቃሚዎች ያሉትን ፕሮጀክቶች ማሰስ፣ የኢንቨስትመንት አማራጮችን ማወዳደር እና ከኢንቨስትመንት ግባቸው፣ ከሚመርጡት ጊዜ ቆይታ እና በጀታቸው ጋር ምርጥ የሚዛመዱትን ዕድሎች መምረጥ ይችላሉ።",
      operatesP4: "አንዴ ኢንቨስትመንት ከተመረጠ፣ Lumora ገንዘብን በመመደብ እና በማስተዳደር በሥራ ማዕቀፉ በኩል ያመቻቻል። ፕላትፎርሙ የኢንቨስትመንት ሥራዎችን ያስተካክላል፣ የፕሮጀክቱን ሂደት ይከታተላል፣ እና በሚቻልበት ጊዜ ሁሉ ከሚመለከታቸው አጋሮች ወይም የገበያ ተሳታፊዎች ጋር አብሮ ይሠራል። የሉሞራ የባለሙያዎች ቡድን እነዚህን ምደባዎች በተጠቃሚዎች ስም ያስተባብራል፣ ሁሉንም አፈፃፀምና አስተዳደራዊ ቁጥጥሮች ይመራል።",
      operatesP5: "በኢንቨስትመንት ጊዜ ውስጥ ተጠቃሚዎች ኢንቨስትመንቶቻቸውን መከታተል እና በLumora ዳሽቦርዳቸው በኩል ጠቃሚ ዝመናዎችን ማየት ይችላሉ። በኢንቨስትመንት ጊዜ ማጠናቀቂያ ላይ፣ የኢንቨስትመንት ንብረቶች ውጤቶች ተሰልተው በተመረጠው ዕድል አፈጻጸም መሠረት በተጠቃሚው አካውንት ላይ ይንጸባረቃሉ።",
      contactTitle: "እውቂያ እና ድጋፍ",
      officeAddis: "አዲስ አበባ ጽ/ቤት",
      hq: "4ኛ ፎቅ፣ ሜቴክ ህንፃ፣ ቦሌ ክፍለ ከተማ፣ አዲስ አበባ፣ ኢትዮጵያ"
    },
    om: {
      overview: "LUMORA meeshaa qoodinsa qabeenya fintech dijitalii jalqabaati. Nutis moodeela herrega maallaqaa deeggarsa AI fayyadamna, kunis fayyadamtootaaf qoodi dividends qabeenya irratti dandeettii micro amansiisaa ta’e meeshaalee hordoffii interactive ta’aniin kenna.",
      mission: "Gaanfa Afriikaa keessatti qoodinsa micro-economic amansiisaa ta’an demokraatiise gochuu. LUMORA herregni dakhli olaanaa ammayyaa fayyadamtoota mobayilaaf salphaatti akka argamu taasisa.",
      vision: "Hordoffii agartuu amanamaa fi ibsa tileetii AI-driven ta’e damee luuqaa 5 gidduutti babal’isuun, Itoophiyaa keessatti networkii qoodinsa micro jalqabaa ta’uuf.",
      complianceTitle: "Mirkaneessa Kaapitaalaa Rasmiga CBE",
      complianceDesc: "LUMORA'n Baankii Daldala Itoophiyaa (CBE) waliin tumsa rasmigaa qaba. Investimantii fi maallaqni fayyadamaa hundis 100% wabii guutuu qabu, kapiitaalli eegamaadha.",
      operatesTitle: "Akkaataa Lumor Itti Hojjetu",
      operatesSubtitle: "Adeemsa Gurmaa'aa Maallaqa Fi Qabeenya Bulchuu",
      operatesP1: "Lumor fayyadamtootaaf adeemsa bulchiinsa maallaqa gurmaa'een carraa investimentii filatamee dhiyaatu akka argatan taasisa.",
      operatesP2: "Gareen keenya falanqii haala gabaa, carraalee investimentii fi walitthufeenya pirojektii adda addaa gamaaggamuun ulaagaalee keenya guutan adda baasa. Qorannoo fi gamaaggama kanaan booda, pirojektonni darban fayyadamtoonni madaaluun akka filatan taasifamu.",
      operatesP3: "Fayyadamtoonni pirojektoota jiran keessaa filachuu, walbira qabanii madaaluu fi carraawwan karoora, yeroo fi bajata isaaniin deeman filachuu danda'u.",
      operatesP4: "Yeroo investimentiin tokko filatamu, Lumor adeemsa hojii isaatiin qoodinsa maallaqaa mijeessa. Gareen keenya maqaa fayyadamtootaan raawwii kallattii fi bulchiinsa isaa hundaa ni hordofa.",
      operatesP5: "Yeroo investimentii keessatti fayyadamtoonni hordoffii gochuu fi odeeffannoo haaraa argachuu danda'u dacha dakhlii isaaniitis argatu.",
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
      operatesTitle: "Lumora ብከመይ ይሰርሕ",
      operatesSubtitle: "ዝተወደበ ናይ ወፍሪን ሃብቲ ምሕደራን መስርሕ",
      operatesP1: "Lumora ንተጠቀምቲ ብጥንቃቄ ዝተመርጹ ናይ ወፍሪ ዕድላት ብዝተወደበ ናይ ወፍሪ ምሕደራ ኣቢሉ የቕርብ።",
      operatesP2: "ናይ ትንተና ጋንታና ኩነታት ዕዳጋን ናይ ወፍሪ ዕድላትን ብምግምጋም መስፈርታትና ዘማልኡ ዕድላት ይፍለ። በዚ መገዲ ብቑዓት ፕሮጀክታት ኣብቲ ፕላትፎርም ይቐርቡ።",
      operatesP3: "ተጠቀምቲ ዘለዉ ፕሮጀክትታት ክምርምሩ፣ ወፍሪታት ከወዳድሩን ምስ ናይ ዕላምኦምን በጀቶምን ዝሰማማዕ ክመርጹ ይኽእሉ።",
      operatesP4: "ሓንሳብ ወፍሪ ምስ ተመርጸ፣ Lumora ነቲ ምደባ የሳልጦ። ናይ ሉሞራ ሞያውያን ነዚ ምደባታት ብስም ተጠቀምቲ የሳልጡን ይቆጻጸሩን።",
      operatesP5: "ኣብ እዋን ወፍሪ ተጠቀምቲ ወፍሪታቶም ክከታተሉን ዝተረኽበ ውጽኢት ድማ ኣብ አካውንቶም ዝተመዝገበ ይረኽቡ።",
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
      operatesTitle: "Sida Maalgashiga Lumora u Shaqeeyo",
      operatesSubtitle: "Nidaamka Habaysan ee Maareynta Maalgashiga",
      operatesP1: "Lumora waxay siisaa dadka isticmaala fursad ay ku helaan fursado maalgashi oo si taxaddar leh loo doonayo.",
      operatesP2: "Kooxdayada takhasuska leh waxay had iyo jeer qiimeeyaan xaaladaha suuqa si ay ogaadaan fursadaha buuxiya dabeecadaheena maalgashi.",
      operatesP3: "Isticmaalayaashu waxay baran karaan mashruucyada jira, compares samayn karaan, doonana karaan tan ku haboon miisaaniyada.",
      operatesP4: "Marka maalgashi la doorto, Lumora waxay dammaanad qaadaysaa qoondaynta dhaqaalaha. Kooxda Lumora ayaa kormeera hawlaha maalgashi iyagoo matalaya macaamiisha.",
      operatesP5: "Muddada maalgashiga macaamiishu waxay hordoffi ku samayn karaan dashboard-ka.",
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
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300 text-slate-800" id="about-us-page-container">
      
      {/* Navigation header */}
      <div className="flex items-center space-x-3" id="about-us-header-section">
        <button
          id="about-us-back-button"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-[#0A3D91] rounded-xl border border-blue-100 transition-colors shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-display font-bold text-sm text-[#0A3D91]" id="about-us-page-title">
            {t.aboutUs}
          </h2>
          <p className="text-[10px] text-slate-500 font-semibold leading-normal" id="about-us-page-subtitle">
            {t.aboutUsDescription}
          </p>
        </div>
      </div>

      {/* Grid of details */}
      <div className="space-y-4" id="about-us-sections-grid">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div 
              key={idx}
              id={`about-us-section-card-${idx}`}
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

      {/* Operational & Balance Pool Rules */}
      <div className="p-5 bg-white border border-blue-100 rounded-3xl space-y-4 shadow-sm text-left" id="about-us-financial-rules-block">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl border border-blue-100 shrink-0 text-[#0A3D91] bg-blue-50/70">
            <ShieldCheck className="w-4 h-4 text-[#0A3D91]" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              {language === 'am' ? 'የገንዘብ ዝውውርና የሂሳብ አሠራር መመሪያ' : 'Capital Pools & Transaction Limits'}
            </h3>
            <p className="text-[9px] text-[#0A3D91] font-black uppercase tracking-widest mt-0.5 animate-pulse">
              {language === 'am' ? 'ኦፊሴላዊ የCBE የሂሳብ ገንዳዎች ሕጎች' : 'CBE Authorized Payout Framework'}
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-[10.5px] leading-relaxed font-sans font-medium">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 shadow-3xs">
            <h4 className="font-extrabold text-[#0D3B66] text-[11px] uppercase tracking-wide flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A3D91]"></span>
              <span>1. {language === 'am' ? 'የተቀመጠ ሂሳብ (Deposit Pool)' : 'Deposit Pool Balance'}</span>
            </h4>
            <p className="text-slate-600 text-[10px] leading-relaxed">
              {language === 'am' 
                ? 'በቀጥታ ወደ መድረኩ ያስገቡትን ገንዘብ ይቆጣጠራል። ይህ ሂሳብ በዋናነት ቪአይፒ ዕቅዶችን (VIP plans) ለመግዛትና ለማስጀመር ያገለግላል። ከዚህ ሂሳብ ላይ ገንዘብ ሲያወጡ የ 5% የአገልግሎት ማስተላለፊያ ክፍያ (5% Handling Fee) ይቆረጣል።'
                : 'Tracks initial fundings routed to your portfolio. These funds are primarily allocated for purchasing and upgrading high-yield VIP tiers. Direct cashouts from this pool carry a 5% handling service fee.'}
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-150 space-y-1.5 shadow-3xs">
            <h4 className="font-extrabold text-emerald-800 text-[11px] uppercase tracking-wide flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>2. {language === 'am' ? 'የትርፍ ሂሳብ (Income Pool)' : 'Income Pool Balance'}</span>
            </h4>
            <p className="text-emerald-950 text-[10px] leading-relaxed">
              {language === 'am' 
                ? 'የቪአይፒ ዕቅዶች ዕለታዊ ትርፍ ወለዶችን፣ የትርፍ ድምር ውጤቶችን እና የሪፈራል (referral) ጉርሻዎችን ይመዘግባል። ከዚህ የትርፍ ሂሳብ ላይ ገንዘብ ሲያወጡ 10% ጠቅላላ ክፍያ (5% የመንግስት ታክስ + 5% አስተዳዳሪ አገልግሎት ክፍያ) ይቆረጣል።'
                : 'Aggregates all passive daily interest returns, compounding yields, and partner team invitations. Cashouts from this pool reflect a 10% fee (5% Government/CBE Audited Tax + 5% Liquidity execution cost).'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5 shadow-3xs">
              <span className="text-[7.5px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">{language === 'am' ? 'ዝቅተኛ ማስቀመጫ' : 'Min Deposit'}</span>
              <span className="font-mono text-[11px] font-black text-slate-900">3,500.00 ETB</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5 shadow-3xs">
              <span className="text-[7.5px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">{language === 'am' ? 'ዝቅተኛ ወጪ ማውጫ' : 'Min Withdrawal'}</span>
              <span className="font-mono text-[11px] font-black text-slate-900">200.00 ETB</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5 shadow-3xs">
              <span className="text-[7.5px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">{language === 'am' ? 'የክፍያ ፍጥነት' : 'Settlement Speed'}</span>
              <span className="font-mono text-[11px] font-black text-[#0A3D91]">0 to 42 Hours</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5 shadow-3xs">
              <span className="text-[7.5px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">{language === 'am' ? 'የሪፈራል ኮሚሽን' : 'Referral Reward'}</span>
              <span className="font-mono text-[11px] font-black text-emerald-600">10% Dynamic</span>
            </div>
          </div>
        </div>
      </div>

      {/* How Lumora Operates detailed block as explicitly requested */}
      <div className="p-5 bg-white border border-blue-100 rounded-3xl space-y-4.5 shadow-sm" id="about-us-operation-process-block">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl border border-blue-100 shrink-0 text-[#0A3D91] bg-blue-50/70">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              {currentStrings.operatesTitle}
            </h3>
            <p className="text-[9px] text-[#0A3D91] font-black uppercase tracking-widest mt-0.5">
              {currentStrings.operatesSubtitle}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-[10.5px] text-slate-700 leading-relaxed font-sans font-medium">
          <p className="font-bold text-slate-900">{currentStrings.operatesP1}</p>
          <p>{currentStrings.operatesP2}</p>
          <p>{currentStrings.operatesP3}</p>
          <p className="bg-blue-50/40 p-3 rounded-2xl border border-blue-100/40 font-semibold text-slate-800">
            {currentStrings.operatesP4}
          </p>
          <p>{currentStrings.operatesP5}</p>
        </div>
      </div>

      {/* Compliance statement detail (Strict mandate) */}
      <div className="p-5 bg-gradient-to-tr from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-3xl space-y-3" id="about-us-compliance-block">
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



      {/* Dynamic Company License Viewer */}
      {settings?.companyLicenseUrl && (
        <div className="p-5 bg-white border border-blue-100 rounded-3xl space-y-3.5 shadow-sm text-left" id="user-license-viewer-block">
          <div className="flex items-center space-x-2.5 text-slate-800">
            <div className="p-2 bg-[#0A3D91]/10 text-[#0A3D91] rounded-xl shrink-0">
              <FileText className="w-4.5 h-4.5 text-[#0A3D91]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black uppercase text-slate-900 select-none">
                {language === 'am' ? 'ባለሥልጣን የንግድ ፈቃድ ሰነድ' : 'Official Trade License'}
              </h4>
              <p className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider mt-0.5">
                {language === 'am' ? 'የተረጋገጠ የሉሞራ የፈቃድ አባሪ ሰነድ' : 'Verified regulatory registration'}
              </p>
            </div>
          </div>

          <div className="mt-2 border border-slate-250/20 rounded-2xl overflow-hidden bg-slate-50 relative">
            {settings.companyLicenseUrl.startsWith('data:application/pdf') ? (
              <div className="p-6 text-center space-y-3">
                <p className="text-xs font-semibold text-slate-600">
                  {language === 'am' ? 'የተረጋገጠ ፒዲኤፍ የፈቃድ አባሪ' : 'Official PDF Document Attachment'}
                </p>
                <a 
                  href={settings.companyLicenseUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-[#0A3D91] text-white hover:bg-[#072f70] transition-colors text-[10.5px] font-extrabold uppercase tracking-wider cursor-pointer shadow-3xs"
                >
                  <span>{language === 'am' ? 'ፒዲኤፍ ፋይሉን በትልቅ ገጽ ክፈት' : 'Open PDF file'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center relative w-full overflow-hidden">
                <img 
                  src={settings.companyLicenseUrl} 
                  alt="Official Company License Attachment" 
                  className="object-contain w-full max-h-72 align-middle z-0"
                  referrerPolicy="no-referrer"
                />
                
                {/* High Contrast Lumora Stamp Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                  <LumoraStamp text="VERIFIED" variant="blue" size="md" tilted={true} highContrast={true} className="opacity-[0.32] mix-blend-multiply transform scale-125 hover:scale-130 transition-transform duration-300" />
                </div>

                <div className="w-full bg-slate-100/80 hover:bg-slate-200/80 border-t border-slate-200 text-center py-2 transition-colors relative z-10">
                  <a 
                    href={settings.companyLicenseUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] uppercase font-mono font-black text-[#0A3D91] hover:underline"
                  >
                    {language === 'am' ? 'ሙሉ ምስሉን በትልቅ ገጽ እይ' : 'View Full Image'}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Footnote / Launch Date Badge */}
      <div className="text-center py-6 text-[10px] text-slate-500 font-sans font-medium space-y-1" id="about-us-footer-section">
        <p className="font-extrabold text-[#0A3D91] uppercase tracking-wider">
          {language === 'am' ? 'ሉሞራ ይፋዊ ምረቃ ቀን፦ ሰኔ ፮ ቀን ፪፲፲፰ ዓ.ም (June 13, 2026)' : 'Lumora Platform Launched Year: June 13, 2026'}
        </p>
        <p className="text-[9px] text-slate-400 font-mono">
          © {new Date().getFullYear()} Lumora Financial Group. All investment activities are audited.
        </p>
      </div>

    </div>
  );
}
