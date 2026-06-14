import React, { useState, useRef, useEffect } from 'react';
import { Mail, Send, Copy, HelpCircle, ArrowUpRight, MessageSquare, Shield, Sparkles, Bot, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage, LanguageCode } from '../locale';
import Markdown from 'react-markdown';

const customerServiceTranslations: Record<LanguageCode, {
  title: string;
  desc: string;
  responseTime: string;
  tgTitle: string;
  tgPrimary: string;
  tgDesc: string;
  tgBtn: string;
  copied: string;
  emailTitle: string;
  emailSecure: string;
  emailDesc: string;
  emailBtn: string;
  faqTitle: string;
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;
  faqQ3: string;
  faqA3: string;
  footer: string;
}> = {
  en: {
    title: "LUMORA INSTITUTIONAL HELP & SUPPORT",
    desc: "Our certified representative desk stands active coordinates 24/7. Connect directly to immediately expedite CBE withdrawals or deposit confirmations.",
    responseTime: "AVERAGE RESPONSE TIME: 4 MINUTES",
    tgTitle: "Telegram Official Support",
    tgPrimary: "Primary",
    tgDesc: "Instantaneous live dialog channel with Lumora supervisors. Ideal for immediate deposit confirmations, withdrawal accelerations, or device locks troubleshooting.",
    tgBtn: "Launch Live Telegram Support",
    copied: "COPIED",
    emailTitle: "Email Helpdesk System",
    emailSecure: "Secure Mail",
    emailDesc: "Institutional ledger auditing pipeline. Use to submit official asset documentation queries, partnership agreements with CBE, or formal financial balance complaints.",
    emailBtn: "Transmit Secure Email",
    faqTitle: "Frequently Answered Core Inquiries",
    faqQ1: "How fast are CBE yield payouts settled?",
    faqA1: "All yield balance payouts are processed automatically via Commercial Bank of Ethiopia (CBE) institutional API integration within 0 to 42 hours after withdrawal requests are placed.",
    faqQ2: "What is the minimum deposit and withdraw value?",
    faqA2: "The minimum deposit amount is 5000 ETB. The minimum withdrawal is 600 ETB to guarantee efficient network settlement with CBE without excessive service charges.",
    faqQ3: "How do I secure my VIP Level investment plan?",
    faqA3: "Navigate to the plans tab, select your preferred VIP tier, click Invest, and transfer the exact amount. Remember to upload your CBE payment ref receipt screenshot for swift system validation!",
    footer: "Secured by Lumora Institutional Network Security and CBE Co-Sovereignty"
  },
  am: {
    title: "ሉሞራ ተቋማዊ ድጋፍ እና አገልግሎት",
    desc: "የእኛ የምስክር ወረቀት ያላቸው ወኪሎች በሳምንት 7 ቀናት በቀን 24 ሰዓት ንቁ ናቸው። የኢትዮጵያ ንግድ ባንክ (CBE) ገንዘብ ማውጣትን ወይም የተቀማጭ ሰነዶችን ለማፋጠን በቀጥታ ይገናኙ።",
    responseTime: "አማካይ ምላሽ ሰዓት፡ 4 ደቂቃዎች",
    tgTitle: "ቴሌግራም ኦፊሴላዊ ድጋፍ",
    tgPrimary: "ዋና",
    tgDesc: "ከሉሞራ ተቆጣጣሪዎች ጋር ፈጣን የቀጥታ የውይይት መስመር። ለፈጣን የተቀማጭ ማረጋገጫዎች፣ ክፍያዎችን ለማፋጠን ወይም ለደህንነት መቆለፊያዎች ተስማሚ።",
    tgBtn: "ቀጥታ የቴሌግራም ድጋፍን ይክፈቱ",
    copied: "ተገልብጧል",
    emailTitle: "የኢሜይል ድጋፍ ስርዓት",
    emailSecure: "ደህንነቱ የተጠበቀ ኢሜይል",
    emailDesc: "የተቋማት ኦዲት መከታተያ መስመር። ስለ ንብረት ማረጋገጫ፣ ከብሔራዊ ባንክ/ንግድ ባንክ ጋር ስላለው ስምምነት ወይም አቤቱታ ለመላክ ይጠቀሙበት።",
    emailBtn: "ደህንነቱ የተጠበቀ ኢሜይል ላክ",
    faqTitle: "ብዙ ጊዜ የሚጠየቁ ዋና ጥያቄዎች",
    faqQ1: "የCBE የትርፍ ክፍያዎች ምን ያህል ፈጣን ናቸው?",
    faqA1: "ሁሉም የትርፍ ክፍያዎች በኢትዮጵያ ንግድ ባንክ (CBE) ተቋማዊ ኤፒአይ በኩል ከ0 እስከ 42 ሰዓት ባለው ጊዜ ውስጥ በራስ-ሰር ይከፈላሉ ።",
    faqQ2: "ዝቅተኛው የተቀማጭ እና የገንዘብ ማውጣት መጠን ስንት ነው?",
    faqA2: "ዝቅተኛው የተቀማጭ መጠን 5000 ETB ነው፣ ዝቅተኛው የማውጫ መጠን ደግሞ 600 ETB ነው። ይህ የሆነው ያለ አላስፈላጊ የአገልግሎት ክፍያ ግብይቱን ለማሳለጥ ነው።",
    faqQ3: "የVIP ደረጃ ኢንቨስትመንት ጥቅሌን እንዴት ላረጋግጥ?",
    faqA3: "ወደ ኢንቨስትመንት ገጽ ይሂዱ፣ የእርስዎን VIP ጥቅል ይምረጡ፣ ኢንቨስት የሚለውን ይጫኑና ትክክለኛውን መጠን ይላኩ። ከዚያ የተቀማጭ ደረሰኝ ፎቶዎን ለፈጣን ማረጋገጫ መስቀል አይርሱ!",
    footer: "በሉሞራ ተቋማዊ ኔትወርክ ደህንነት እና በኢትዮጵያ ንግድ ባንክ ጥበቃ የተጠበቀ ነው"
  },
  om: {
    title: "DEGGARSA FI TAJAJILA DHAABBATA LUMORA",
    desc: "Bakka bu'oonni keenya sa'aatii 24/7 qophaayanii jiru. Saffisaan kaffaltii CBE fi galii mirkaneessuuf kallattiin quunnamti godhaa.",
    responseTime: "GATIIN DEEBII: DAQIIQAA 4",
    tgTitle: "Deggarsa Telegram Ofisilaa",
    tgPrimary: "Hangafa",
    tgDesc: "Tajaajila maamiltoota hooggantoota Lumora wajjin kallattiin raawwatu. Galii mirkaneessuuf, siffisaan kaffaltii baasuuf fi rakkoo quunnamtii biroo hiikuuf sirriidha.",
    tgBtn: "Telegram Deggarsa Jalqabi",
    copied: "KOPPIYAMEERA",
    emailTitle: "Sirna Deggarsa Email",
    emailSecure: "Email Badbaadummaa",
    emailDesc: "Sirna oodiitii herregaa dhaabbataa. Gaffiiwwan dhabbaata qabeenyaa, waliigaltee baankii CBE, ykn kaffaltii irratti iyyannoo dhiyyeessuuf gargaara.",
    emailBtn: "Email Badbaadummaa Ergi",
    faqTitle: "Gaffiiwwan Yeroo Hedduu Gaffataman",
    faqQ1: "Kaffaltiin tajaajila CBE hammam saffisa?",
    faqA1: "Kaffaltiin bu'aa hundi Commercial Bank of Ethiopia (CBE) API sirnaan sa'aatii 0 hanga 42 keessatti of-umaan raawwatama.",
    faqQ2: "Baay'inni maallaqa galii fi baasii xiqqaan hammami?",
    faqA2: "Maallaqni galii xiqqaan 5000 ETB dha. Kaffaltiin baasii xiqqaan immoo 600 ETB dha, kunis kaffaltii tajaajila dabalataa malee herrega salphisuufi.",
    faqQ3: "Waliigaltee VIP akkamittin mirkaneessa?",
    faqA3: "Gara invest tab deemi, VIP plane filadhu, invest cuqiisii maallaqa isa sirrii ergi. Sana boodaan tikkeeti kaffaltii CBE upload gochuu hin dagatinaa!",
    footer: "Badbaadummaa network Lumora fi Baankii CBE waliin kan eegame dha"
  },
  ti: {
    title: "ሉሞራ ተቋማዊ ደገፍን ኣገልግሎትን",
    desc: "ናይ ምስክር ወረቐት ዘለዎም ወከልትና 24/7 ድሉዋት እዮም። ናይ ኢትዮጵያ ንግዲ ባንኪ (CBE) ምስሓብ ወይ ተቀማጭ ንምቅልጣፍ ብቐጥታ ይራኸቡ።",
    responseTime: "አማካይ ግዜ መልሲ፡ 4 ደቒቓ",
    tgTitle: "ቴሌግራም ወግዓዊ ደገፍ",
    tgPrimary: "ቀንዲ",
    tgDesc: "ምስ ተቖጻጸርቲ ሉሞራ ብቐጥታ ዝግበር ዝርርብ። ንቅልጡፍ መረጋገጺ ተቀማጭ፣ ምስሓብ ንምቅልጣፍ ወይ ንደህንነት መቆለፊታት ዝበለጸ እዩ።",
    tgBtn: "ቴሌግራም ደገፍ ኣጀሚርካ",
    copied: "ተቐዲሑ",
    emailTitle: "ናይ ኢሜይል ደገፍ ስርዓት",
    emailSecure: "ውሑስ ኢሜይል",
    emailDesc: "ናይ ተቋማት ኦዲት መከታተሊ መስመር። ብዛዕባ ንብረት መረጋገጺ፣ ምስ ንግዲ ባንኪ ዘሎ ስምምዕነት ወይ አቤቱታ ንምልኣኽ ተጠቐሙሉ።",
    emailBtn: "ውሑስ ኢሜይል ስደድ",
    faqTitle: "ብዙሕ ግዜ ዝሕተቱ ሕቶታት",
    faqQ1: "ናይ CBE ናይ ትርፊ ክፍሊት ክሳብ ክንደይ ቅልጡፍ እዩ?",
    faqA1: "ኮሎም ክፍሊታት ብናይ ኢትዮጵያ ንግዲ ባንኪ (CBE) ኤፒአይ ኣቢሎም ካብ 0 ክሳብ 42 ሰዓታት ውሽጢ ብባዕሎም ይፍጸሙ እዮም።",
    faqQ2: "ዝተሓተ መጠን ተቀማጭን ምስሓብን ክንደይ እዩ?",
    faqA2: "ዝተሓተ መጠን ተቀማጭ 5000 ETB ክኸውን ከሎ፣ ዝተሓተ መጠን ምስሓብ ድማ 600 ETB እዩ። እዚ ድማ ክፍሊት ኣገልግሎት ንምንካይ እዩ።",
    faqQ3: "ናይ VIP ኢንቨስትመንት ብኸመይ የረጋግጽ?",
    faqA3: "ናብ ኢንቨስትመንት ገጽ ብምኻድ ናይ VIP ፓኬጅኩም ምረጹ፣ ኢንቨስት ዝብል ጠውቑ እሞ ትክክለኛ መጠን ስደዱ። ደረሰኝኩም ንምጽዳቕ ፎቶ ምስዳድ ኣይትርሰዑ!",
    footer: "ብሉሞራ ተቋማዊ ድሕንነትን ብኢትዮጵያ ንግዲ ባንክ ሓለዋን ዝተሓለወ እዩ"
  },
  so: {
    title: "TAAGEERADA IYO ADEEGGA HELPDESK LUMORA",
    desc: "Wakiilladeena shahaadada haysta waxay heegan yihiin 24/7. Si toos ah ula xiriir si aad u dardargeliso bixinta lacagaha CBE ama xaqiijinta deebaajiga.",
    responseTime: "CELCELIS DEEBII: 4 DAQIIQO",
    tgTitle: "Taageerada Rasmiga ah ee Telegram",
    tgPrimary: "Koowaad",
    tgDesc: "Wadahadal toos ah oo lala yeesho kormeerayaasha Lumora. Ku habboon xaqiijinta deebaajiga degdegga ah, dardargelinta bixinta lacagaha, ama cilad-bixinta.",
    tgBtn: "Fur Adeegga Telegram ee Tooska ah",
    copied: "KOOBIYAY",
    emailTitle: "Nidaamka Taageerada Emailka",
    emailSecure: "Email Amni ah",
    emailDesc: "Hab-raaca hubinta xisaabaadka rasmiga ah. Isticmaal tan si aad u gudbiso su'aalaha hantida, heshiisyada CBE, ama cabashooyinka rasmiga ah.",
    emailBtn: "Gudbi Email Amni ah",
    faqTitle: "Su'aalaha Badanaa La Weydiiyo",
    faqQ1: "Intee in le'eg ayay qaadataa bixinta lacagaha CBE?",
    faqA1: "Dhamaan bixinta faaiidooyinka waxaa si toos ah loo farsameeyaa iyada oo loo marayo Commercial Bank of Ethiopia (CBE) muddo 0 ilaa 42 saacadood gudahood ah.",
    faqQ2: "Waa maxay deebaajiga ugu yar iyo lacag bixinta ugu yar?",
    faqA2: "Deebaajiga ugu yar waa 5000 ETB. Lacag bixinta ugu yar ee la oggol yahayna waa 600 ETB si loo hubiyo degdeg bixinta deebaajiga.",
    faqQ3: "Sideen u xaqiijiyaa xidhmada maalgashiga VIP?",
    faqA3: "Tag qaybta qorshooyinka, dooro heerka VIP ee aad rabto, riix Invest, dabadeedna xawaalad saxda ah dir. Upload-garee risiidhka kashka CBE si degdeg loogu xaqiijiyo!",
    footer: "Waxaa ilaaliya amniga shabakada Lumora iyo dammaanadda Baanka CBE"
  }
};

export default function CustomerServiceTab() {
  const { language } = useLanguage();
  const [copiedText, setCopiedText] = useState<'email' | 'telegram' | null>(null);
  const [supportTab, setSupportTab] = useState<'ai' | 'gateways'>('ai');
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'assistant'; text: string; date: string }[]>([
    {
      sender: 'assistant',
      text: "Welcome! I am the official Lumora AI Assistant. \n\nI can assist you with information regarding investment plans, VIP reward milestones, bank deposits, withdrawals, verification details, and rules.\n\nHow may I help you with Lumora today?",
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const supportEmail = 'lumorainvestmentofficial@gmail.com';
  const supportTelegram = '@Lumora_Official_Support';
  const supportTelegramLink = 'https://t.me/Lumora_Official_Support';

  const copyToClipboard = (text: string, type: 'email' | 'telegram') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const activeTrans = customerServiceTranslations[language] || customerServiceTranslations['en'];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, aiLoading]);

  const handleSendAiMessage = async (customText?: string) => {
    const textMsg = customText || userInput;
    if (!textMsg.trim() || aiLoading) return;

    const userMessageObj = {
      sender: 'user' as const,
      text: textMsg,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessageObj]);
    if (!customText) {
      setUserInput('');
    }
    setAiLoading(true);

    try {
      const history = chatMessages.slice(1).map(m => ({
        role: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/support/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textMsg, history })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setChatMessages(prev => [...prev, {
          sender: 'assistant',
          text: data.text,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          sender: 'assistant',
          text: data.error || "I could not fetch that information. Please connect with our direct Telegram representative instead.",
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (error) {
      console.error("AI chat error:", error);
      setChatMessages(prev => [...prev, {
        sender: 'assistant',
        text: "I couldn't find that information in Lumora's official knowledge base.\n\nPlease contact our support team:\n\n📧 Email: lumorainvestmentofficial@gmail.com\n📱 Telegram: @Lumora_Official_Support",
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const quickPrompts = [
    { label: "VIP Plans & Interest Rates", query: "What are the VIP Levels, min investments, durations and expected returns?" },
    { label: "Minimum Withdrawal limit", query: "What is the minimum withdrawal value and processing time?" },
    { label: "ID Verification Process", query: "How to complete my ID verification?" },
    { label: "Contact Live Customer Care", query: "I want to speak with support representatives" }
  ];

  const supportFAQs = [
    {
      q: activeTrans.faqQ1,
      a: activeTrans.faqA1
    },
    {
      q: activeTrans.faqQ2,
      a: activeTrans.faqA2
    },
    {
      q: activeTrans.faqQ3,
      a: activeTrans.faqA3
    }
  ];

  const aiTitle = language === 'am' ? "ፈጣን የሉሞራ AI ረዳት" :
                   language === 'om' ? "Gargaarsa AI Lumora Saffisaa" :
                   language === 'ti' ? "ቅልጡፍ ናይ ሉሞራ ኤአይ ረዳኢ" :
                   language === 'so' ? "Kaaliyaha Lumora AI ee Degdegga ah" :
                   "Instant Lumora AI Assistant";

  const manualTitle = language === 'am' ? "ባለሙያዎችን ያነጋግሩ" :
                      language === 'om' ? "Deggarsa Maamiltootaa & FAQ" :
                      language === 'ti' ? "ወኪላት ድጋፍን ሕቶታትን" :
                      language === 'so' ? "Khadka Tooska ah & FAQs" :
                      "Direct Contact & FAQs";

  return (
    <div className="flex flex-col bg-white border-2 border-slate-200/90 p-3.5 sm:p-5 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.06)] min-h-[78vh] max-h-[82vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 w-full h-full">
      
      {/* High-Contrast Interactive Header Info */}
      <div className="text-center p-3 sm:p-4 bg-gradient-to-b from-blue-50/75 to-slate-50/50 border-2 border-blue-200 rounded-2xl relative overflow-hidden shadow-2xs mb-4">
        <div className="absolute top-0 inset-x-0 h-[4px] bg-gradient-to-r from-amber-500 via-[#0A3D91] to-[#1254be]"></div>
        <h2 className="font-display font-black text-xs sm:text-sm text-[#0A3D91] uppercase tracking-wide leading-none">
          {activeTrans.title}
        </h2>
        <div className="mt-1.5 inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-[9px] font-black border border-emerald-300/80 shadow-3xs uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{activeTrans.responseTime}</span>
        </div>
      </div>

      {/* Structured Category Tab Navs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 mb-4 shrink-0">
        <button
          onClick={() => setSupportTab('ai')}
          className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            supportTab === 'ai' 
              ? 'bg-gradient-to-r from-[#0c2452] to-[#0A3D91] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{aiTitle}</span>
        </button>
        <button
          onClick={() => setSupportTab('gateways')}
          className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            supportTab === 'gateways' 
              ? 'bg-gradient-to-r from-[#0c2452] to-[#0A3D91] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>{manualTitle}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {supportTab === 'ai' ? (
          <div className="flex flex-col h-[56vh] sm:h-[64vh] min-h-[380px]">
            {/* Messages Stream viewport */}
            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50/50 p-4 space-y-4 shadow-inner mb-3">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start space-x-2.5 max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border shadow-xs ${
                    msg.sender === 'user' 
                      ? 'bg-blue-100 border-blue-200 text-[#0A3D91]' 
                      : 'bg-[#0A3D91] border-[#0c2452] text-white'
                  }`}>
                    {msg.sender === 'user' ? <HelpCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-2xl p-3.5 shadow-3xs border text-xs min-w-[60px] ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-[#0c2452] to-[#0A3D91] text-white border-[#0A3D91] rounded-tr-xs' 
                      : 'bg-white text-slate-800 border-slate-150 rounded-tl-xs'
                  }`}>
                    <div className="space-y-1">
                      {msg.sender === 'user' 
                        ? <p className="font-semibold leading-relaxed font-sans">{msg.text}</p>
                        : (
                          <div className="markdown-body text-xs text-slate-800 leading-relaxed font-sans font-medium">
                            <Markdown>{msg.text}</Markdown>
                          </div>
                        )
                      }
                    </div>
                    <span className={`text-[8px] font-bold font-mono tracking-wider block mt-1.5 text-right ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      {msg.date}
                    </span>
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex items-start space-x-2.5 max-w-[85%]">
                  <div className="w-7 h-7 rounded-lg bg-[#0A3D91] text-white border border-[#0c2452] flex items-center justify-center shrink-0 shadow-xs animate-spin">
                    <Loader2 className="w-4 h-4" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-white border border-slate-150 rounded-tl-xs flex items-center space-x-1.5 shadow-3xs">
                    <span className="w-2 h-2 rounded-full bg-[#0A3D91] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#0A3D91] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#0A3D91] animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 shrink-0 scrollbar-none">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAiMessage(p.query)}
                  disabled={aiLoading}
                  className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] sm:text-xs font-semibold text-slate-700 hover:text-[#0A3D91] hover:border-[#01224f] hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Typing Form field */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendAiMessage(); }}
              className="flex items-center space-x-2 border-2 border-slate-200 rounded-2xl p-1.5 focus-within:border-[#0A3D91] transition-all bg-white shrink-0 mt-1"
            >
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask Lumora AI assistant..."
                className="flex-1 bg-transparent px-3 text-xs outline-none py-1.5 font-sans"
                disabled={aiLoading}
              />
              <button
                type="submit"
                disabled={!userInput.trim() || aiLoading}
                className="p-2.5 bg-gradient-to-r from-[#0c2452] to-[#0A3D91] hover:from-[#0A3D91] hover:to-[#1254be] text-white rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Human Gateways Grid */}
            <div className="grid grid-cols-1 gap-4">
              
              {/* Telegram Direct Portal */}
              <div className="flex flex-col p-4 sm:p-5 rounded-2xl bg-[#24A1DE]/8 border-2 border-[#24A1DE] relative overflow-hidden transition-all shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#24A1DE] text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
                      <Send className="w-5.5 h-5.5 -translate-x-0.5 translate-y-0.5 rotate-[-44deg]" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-xs text-slate-900 uppercase tracking-tight">
                        {activeTrans.tgTitle}
                      </h3>
                      <p className="text-[10px] font-black font-mono text-[#0A3D91] mt-0.5">
                        {supportTelegram}
                      </p>
                    </div>
                  </div>
                  
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[9px] font-black uppercase tracking-wider font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>{activeTrans.tgPrimary}</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-900 mt-3 font-semibold leading-relaxed">
                  {activeTrans.tgDesc}
                </p>

                <div className="flex space-x-2.5 mt-4">
                  <a 
                    href={supportTelegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#24A1DE] hover:bg-[#1a85b9] text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-98 tracking-wide cursor-pointer uppercase"
                  >
                    <span>{activeTrans.tgBtn}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  
                  <button
                    onClick={() => copyToClipboard(supportTelegram, 'telegram')}
                    className="px-3.5 bg-white hover:bg-slate-50 border-2 border-[#24A1DE] text-slate-900 font-extrabold rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95 group"
                    title="Copy handle"
                  >
                    {copiedText === 'telegram' ? (
                      <span className="text-emerald-700 font-black text-[10px]">{activeTrans.copied}</span>
                    ) : (
                      <Copy className="w-4 h-4 text-slate-800 transition-transform group-hover:scale-110" />
                    )}
                  </button>
                </div>
              </div>

              {/* Email Institutional Card */}
              <div className="flex flex-col p-4 sm:p-5 rounded-2xl bg-blue-50 border-2 border-slate-300 relative overflow-hidden transition-all shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0A3D91] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-900/20">
                      <Mail className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-xs text-slate-900 uppercase tracking-tight">
                        {activeTrans.emailTitle}
                      </h3>
                      <p className="text-[10px] font-black font-mono text-slate-800 mt-0.5 break-all">
                        {supportEmail}
                      </p>
                    </div>
                  </div>
                  
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-900 text-[9px] font-black uppercase tracking-wider font-mono">
                    <span>{activeTrans.emailSecure}</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-900 mt-3 font-semibold leading-relaxed">
                  {activeTrans.emailDesc}
                </p>

                <div className="flex space-x-2.5 mt-4">
                  <a 
                    href={`mailto:${supportEmail}`}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#0A3D91] hover:bg-[#072a66] text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-98 tracking-wide cursor-pointer uppercase"
                  >
                    <span>{activeTrans.emailBtn}</span>
                    <Mail className="w-4 h-4" />
                  </a>
                  
                  <button
                    onClick={() => copyToClipboard(supportEmail, 'email')}
                    className="px-3.5 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-900 font-extrabold rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95 group"
                    title="Copy email"
                  >
                    {copiedText === 'email' ? (
                      <span className="text-emerald-700 font-black text-[10px]">{activeTrans.copied}</span>
                    ) : (
                      <Copy className="w-4 h-4 text-slate-800 transition-transform group-hover:scale-110" />
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* High-Contrast FAQs */}
            <div className="space-y-3 pt-2">
              <h4 className="font-display font-black text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>{activeTrans.faqTitle}</span>
              </h4>
              
              <div className="space-y-3">
                {supportFAQs.map((faq, idx) => (
                  <div key={idx} className="p-3.5 border-2 border-slate-150 rounded-2xl bg-slate-50/60 space-y-2 hover:bg-slate-100/50 transition-colors">
                    <h5 className="font-black text-[11px] text-[#0A3D91] flex items-start space-x-2 leading-snug">
                      <span className="text-amber-500 font-black font-mono shrink-0">Q:</span>
                      <span>{faq.q}</span>
                    </h5>
                    <p className="text-[10px] text-slate-800 leading-relaxed font-bold border-l-2 border-slate-300 pl-3.5 italic font-sans text-justify">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Securitized Footer Compliance Badge */}
      <div className="pt-2.5 border-t border-slate-200 mt-3 flex items-center justify-center space-x-2 text-[9px] sm:text-[10px] text-slate-900 font-black uppercase tracking-wider font-mono shrink-0">
        <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="truncate">{activeTrans.footer}</span>
      </div>

    </div>
  );
}
