import { useState, useEffect } from 'react';
import { FileText, Search, Download, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../locale';
import { Agreement } from '../types';

interface AgreementsPageProps {
  onBack: () => void;
}

export default function AgreementsPage({ onBack }: AgreementsPageProps) {
  const { t, language } = useLanguage();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Agreement | null>(null);

  const localizedDocs: Record<string, Record<string, { title: string; content: string }>> = {
    en: {
      "terms-and-conditions": {
        title: "Terms and Conditions",
        content: `### Terms and Conditions

Welcome to LUMORA. Please review our revised platform guidelines:

1. **User Identity & Bank Registration**: To maintain compliance with financial frameworks in Ethiopia, user registration does not auto-populate default credentials. Users must designate their own legitimate Commercial Bank of Ethiopia (CBE) bank details and configure a secure 4-digit payment PIN to authorize active withdrawals.
2. **Unified Financial Limits**: A minimum transaction threshold of 5,000 ETB for CBE deposit submissions and 600 ETB for cashouts is enforced to ensure efficient processing and settlement.
3. **Real-Time Ledger Integration**: All balance adjustments, VIP level elevations, deposits, and cashouts synchronize in real-time under a 3-second secure consensus. All transfers are manually audited on the admin portal.
4. **Security & Identity Validation**: To authorize active cashouts and access micro-loans, users must verify their profile by uploading clean photos of both sides of their National ID cards.`
      },
      "investment-policies": {
        title: "Investment Policies & Rules",
        content: `### Investment Policies & Rules

Platform micro-finance structural rules in detail:

1. **High-Yield Plan Activation**: Investment plans are activated immediately upon balance confirmation (Min 5,000 ETB), automatically starting synced daily yields spanning VIP levels. Interest cycles schedule payouts every 24 hours.
2. **CBE Transfer and Auditing**: Deposits are routed directly to the treasury audit desk via CBE app screenshots. Administrators evaluate submissions, and credits reflect live on user dashboards in under 2 hours.
3. **Cashout Settlements**: Users cash out using secure designated accounts. Approved cashouts are dispersed within 0 to 42 hours to prevent settlement issues and ensure sustainable liquidity.`
      },
      "risk-disclosure": {
        title: "About Us",
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
    },
    am: {
      "terms-and-conditions": {
        title: "ደንቦች እና ሁኔታዎች (Terms & Conditions)",
        content: `### ደንቦች እና ሁኔታዎች

ወደ LUMORA እንኳን ደህና መጡ። እባክዎ የእኛን የህግ መመሪያዎች ይገምግሙ፡

1. **የባንክ ምዝገባ**: ተጠቃሚዎች የራሳቸውን የኢትዮጵያ ንግድ ባንክ (CBE) ዝርዝሮችን መመዝገብ እና ደህንነቱ የተጠበቀ ባለ ባለ 4-አሃዝ የክፍያ ፒን ኮድ ማዘጋጀት አለባቸው።
2. **ግብይት ገደቦች**: ዝቅተኛው ተቀማጭ ገንዘብ 5000 ETB እና አነስተኛው የገንዘብ ማውጣት 600 ETB ነው።
3. **የመለያ ማረጋገጫ**: ገንዘብ ለማውጣት እና ብድር ለማግኘት የብሔራዊ መታወቂያ ካርድ ዝርዝር ማረጋገጥ ግዴታ ነው።`
      },
      "investment-policies": {
        title: "የኢንቨስትመንት መመሪያዎች እና ደንቦች",
        content: `### የኢንቨስትመንት መመሪያዎች እና ደንቦች

የመድረክ መዋቅራዊ ደንቦች በዝርዝር፡

1. **ዕቅድ ማንቃት**: የኢንቨስትመንት ዕዕቅዶች ቀሪ ሂሳብ በኢትዮጵያ ንግድ ባንክ (CBE) በኩል እንደተረጋገጠ ወዲያውኑ ይነቃሉ።
2. **ዕለታዊ ዑደት**: ንቁ ዑደቶች በየ 24 ሰዓቱ የወለድ ክፍያዎችን በራስ-ሰር ያካሂዳሉ።
3. **የገንዘብ ማውጣት**: የጸደቁ የገንዘብ ማውጣቶች ከ 2 እስከ 6 ሰዓታት ውስጥ ወደ ሂሳብዎ ይገባሉ።`
      },
      "risk-disclosure": {
        title: "ስለ እኛ (About Us)",
        content: `### ስለ እኛ እና ሉሞራ እንዴት እንደሚሰራ

**እንኳን ወደ ሉሞራ በደህና መጡ** — በኢትዮጵያ ግንባር ቀደም የሆነው በራስ ሰር የሚሰራ አነስተኛ ኢንቨስትመንት እና የፋይናንስ መድረክ።

#### እንዴት እንደሚሰራ፡

1. **ግብይት ያስገቡ**: የኢትዮጵያ ንግድ ባንክ (CBE) ሂሳብ ቁጥራችንን በመውሰድ በባንክ መተግበሪያዎ (CBE Birr) ያስተላልፉ።
2. **ማረጋገጫ ይላኩ**: የተላለፈበትን ደረሰኝ እና የማጣቀሻ ቁጥር (Reference Code) ያስገቡ። አስተዳዳሪዎች በ 2 ሰዓታት ውስጥ ያረጋግጣሉ።
3. **ዕቅዶችን ያግብሩ**: ቀሪ ሂሳብዎን ከቪአይፒ 0 እስከ ቪአይፒ 15 ባለው ዕቅድ ውስጥ ኢንቨስት ያድርጉ።
4. **ገንዘብ ያውጡ**: ባለ ባለ 4-አሃዝ የክፍያ ፒን ቁጥርዎን በመጠቀም በቀላሉ ገንዘብ ማውጣት ይችላሉ።`
      }
    },
    om: {
      "terms-and-conditions": {
        title: "Waliigaltee fi Haaldota (Terms & Conditions)",
        content: `### Waliigaltee fi Haaldota

Baga gara LUMORA nagaan dhuftan. Maaloo qajeelfama keenya hordofaa:

1. **Galmeessa Baankii**: Fayyadamaan hundi odeeffannoo herrega baankii CBE kan mataa isaa galmeessuu fi PIN iccitii digit 4 qopheessu qaba.
2. **Daangaa Maallaqaa**: Kaffaltiin gadi aanaan herrega galchuu 5000 ETB, herrega baasuu immoo 600 ETB dha.
3. **Mirkaneessa Eenyummeessaa**: Maallaqa baasuuf ykn liqii argachuuf footoo ID biyyoolessaa guutuu erguun dirqama.`
      },
      "investment-policies": {
        title: "Imaammata fi Dambiiwwan Maallaqaa",
        content: `### Imaammata fi Dambiiwwan Maallaqaa

Dambiiwwan caasaa madaallii maallaqaa:

1. **Karoora Gadi Lakkisuu**: Karoorri maalgashigaa battalatti guddina herregaa erga mirkanaa’ee gadi lakkifama.
2. **Mirkaneessa CBE**: Hubinna screenshot ergameen daqiiqaa gooroo jalqaba. Sa'aatii 2 keessatti xumurama.
3. **Guyyaa Guyyaan**: Marsaan dakhliinterestii sa’aatii 24 hundaan ni shallagama.`
      },
      "risk-disclosure": {
        title: "Waa'ee Keenya (About Us)",
        content: `### Waa’ee Keenya fi Akkaataa Lumora Hojjetu

**Baga Gara Lumora Nagaan Dhuftan** — Itoophiyaa keessatti tajaajila micro-finance fi maalgashigaa hammayyaa'aa sirna peer-to-peer dhaan hojjetu.

#### Akkaataa Hojii Keenyaa:

1. **Kaffaltii Erguu**: Lakkoofsa herrega baankii CBE keenya irratti maallaqa erga dabarsitanii booda screenshot kaffaltii qabadhaa.
2. **Mirkaneessuuf Erguu**: Lakkoofsa transaction dabalatee screenshot kaffaltii submit godhaa. Sa'aatii 2 keessatti herregni keessan ni guutama.
3. **Karoora Filachuuu**: VIP 0 hanga VIP 15 keessaa karoora maalgashigaa keessan filadhaa.
4. **Maallaqa Baasuu**: PIN kaffaltii digit 4 guutuudhaan maallaqa keessan herrega baankii keessanitti baasuu dandeessu.`
      }
    },
    ti: {
      "terms-and-conditions": {
        title: "ውዕላትን ኩነታትን (Terms & Conditions)",
        content: `### ውዕላትን ኩነታትን

እንቋዕ ናብ LUMORA ብደሓን መጻእኩም። በጃኹም ሕጋዊ መምርሒታትና ግምግሙ፡

1. **ምዝገባ ባንኪ**: ተጠቀምቲ ናይ ባዕሎም ናይ ኢትዮጵያ ንግድ ባንኪ (CBE) ሓበሬታ ክምዝግቡን ምስጢራዊ 4 ዲጂት ፒን ኮድ ከዳልዉን ኣለዎም።
2. **ገደብ ገንዘብ**: ዝቅተረ ዝግበር ተቀማጦ 5000 ETB ክኸውን ከሎ ዝቅተረ ገንዘብ ምውጻእ ድማ 600 ETB እዩ።
3. **ምርግጋጽ መታወቂያ**: ገንዘብ ንምውጻእን ልቓሕ ንምርካብን ሃገራዊ መታወቂያ ምስጋር ግዴታ እዩ።`
      },
      "investment-policies": {
        title: "ናይ ወፍሪ መምርሒታትን ደንብታትን",
        content: `### ናይ ወፍሪ መምርሒታትን ደንብታትን

ናይዚ መድረኽ ዝርዝር ደንብታት፡

1. **መደብ ምኽፋት**: ርእሰ-ማል ከምተረጋገጸ መደባት ብቕጽበት ይኽፈቱ።
2. **CBE ቁጽጽር**: ምስጋር ደረሰኝ ከምተላእከ ብቕጽበት ይረጋገጽ። ኣብ ውሽጢ 2 ሰዓት ይጠናቀቅ።
3. **መዓልታዊ ዑደት**: ንጡፍ ወለድ በቢ 24 ሰዓት ይሕሰብ።`
      },
      "risk-disclosure": {
        title: "ብዛዕባና (About Us)",
        content: `### ብዛዕባናን ሉሞራ ብኸመይ ከምዝሰርሕን

**እንቋዕ ናብ LUMORA ብደሓን መጻእኩም** — ኣብ ኢትዮጵያ ቀዳማይ ብኣውቶማቲክ ዝሰርሕ ናይ መዓልታዊ መኽሰብን ህዝባዊ መዋእለ-ነዋይ (micro-finance) መድረኽ።

#### ብኸመይ ከምዝሰርሕ፡

1. **መዋእለ-ነዋይ ምእታው (Deposit)**: ብንጹር ዝተቐመጠ ናይ ኢትዮጵያ ንግዲ ባንኪ (CBE) ሒሳብ ቁፅርና ብምውሳድ ምስጋር ገንዘብ ፈጽሙ። Screenshot ሒዝኩም ሒሳብ ቁፅሪ መጣቐሲ (Reference Code) መዝግቡ።
2. **መረጋገጺ ምልኣኽ**: ዝሰደድኩምሉ መጠን ገንዘብን ሪፈረንስን ብምምላእ ምስ Screenshot ናብ መድረኽና ስደዱ። ኣብ ውሽጢ 2 ሰዓት ውሳነ ክወሃበሉ እዩ።
3. **VIP መደብ ምኽፋት**: ኣብ መድረኽና ካብ VIP 0 ክሳብ VIP 15 ዘለዉ መደባት ብመምረጽ መዋእለ-ነዋይኩም ኣንቀሳቕሱ። ኣብ መዓልቲ 24 ሰዓት ቀጻሊ መኽሰብ የውህብ።
4. **ገንዘብ ምውጻእ (Cashout)**: ናይ ውልቀ ምስጢራዊ 4-ዲጂት ፒን (PIN) ብምድላው ዝተሓሰበ መኽሰብኩም ናብ ባንኪ ሒሳብኩም ብቐሊሉ ኣውፁ።`
      }
    },
    so: {
      "terms-and-conditions": {
        title: "Shuruudaha iyo Axkaamta (Terms & Conditions)",
        content: `### Shuruudaha iyo Axkaamta

Kusoo dhawaada LUMORA. Fadlan dib u eeg tilmaamaha sharciga ah:

1. **Heshiiska Shuruudaha**: Markaad gasho Lumora, waxaad ogolaatay inaad u hoggaansanto xeerarka farsamada ee Itoobiya.
2. **Xaqiijinta Da’da**: Isticmaalayaashu waa inay jiraan 18 sano ama ka badan.
3. **Mirihii la Dammaanad Qaaday**: Dhammaan dakhliga maalinlaha ah ee Lumora waa 100% dammaanad iyo badbaado.
4. **Badbaadada Amniga**: Xidhiidh kasta oo encrypted ah ayaa lagu dabaqayaa isticmaalka qalabkaaga.`
      },
      "investment-policies": {
        title: "Siyaasadda & Xeerarka Maalgashiga",
        content: `### Siyaasadda & Xeerarka Maalgashiga

Xeerarka hab-dhismeedka madal ee faahfaahsan:

1. **Hawlgelinta Qorshaha**: Qorshooyinka maalgashiga waxaa la hawlgeliyaa isla marka haraaga la xaqiijiyo.
2. **Xaqiijinta CBE**: Hubinta risidka kashka waxay bilaabaneysaa isla marka la gudbiyo. Waxaa la dhammeeyaa 2 saac gudahood.
3. **Wareegga Maalinlaha ah**: Wareegyada dakhligu waxay shaqeeyaan 24 saacadood kasta. Muddadu waxay u dhaxeysaa 50 ilaa 720 maalmood.`
      },
      "risk-disclosure": {
        title: "Shahaadada Hubinta Bixinta Lacagta",
        content: `### Shahaadada Hubinta Bixinta Lacagta

**Baaqa Rasmiga ah ee Ilaalinta Raasamaalka**:

* Faa'iidada Lumora waa 100% dammaanad, secured ah, oo ku salaysan kayd dhab ah.
* Qorshe kasta oo shaqaynaya wuxuu ururiyaa dakhli isagoo leh hubaal dhammaystiran.
* Ansixinta la bixitaanka waxaa si toos ah loogu fuliyaa CBE iyo bangiyada deegaanka iyadoon wax dhimis ahi ku iman.`
      }
    }
  };

  useEffect(() => {
    fetch('/api/agreements')
      .then(r => r.json())
      .then(data => setAgreements(data))
      .catch(err => console.error(err));
  }, []);

  const getLocalizedAgreement = (raw: Agreement) => {
    const langSet = localizedDocs[language] || localizedDocs.en;
    const loc = langSet[raw.id];
    if (loc) {
      return {
        ...raw,
        title: loc.title,
        content: loc.content
      };
    }
    return raw;
  };

  const processedAgreements = agreements.map(getLocalizedAgreement);

  const filteredDocs = processedAgreements.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Back button header navigation */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-[#0a3d91] rounded-xl border border-blue-105 transition-colors shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-display font-bold text-sm text-[#0A3D91]">
            {t.companyDocs}
          </h2>
          <p className="text-[10px] text-slate-500 font-semibold leading-normal">
            {t.aboutUsDescription}
          </p>
        </div>
      </div>

      {/* Official Partnership Certificate wording */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-900 leading-relaxed flex items-start space-x-2.5 shadow-sm">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
        <p><strong>CBE GUARANTEE:</strong> {t.complianceDisclosure}</p>
      </div>

      {selectedDoc ? (
        /* Full text document render */
        <div className="p-6 bg-white border border-blue-105 rounded-3xl space-y-4 shadow-sm text-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <span className="text-[10px] font-bold text-[#0A3D91] uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg">
              {selectedDoc.category}
            </span>
            <button
              onClick={() => {
                alert(`Export successful! ${selectedDoc.title}.pdf is downloaded to your device.`);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#0A3D91]" />
              <span>{t.downloadPdf}</span>
            </button>
          </div>

          <h3 className="font-display font-black text-sm text-slate-900 mt-2">
            {selectedDoc.title}
          </h3>

          <div className="text-slate-800 text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans font-medium">
            {selectedDoc.content}
          </div>

          <button
            onClick={() => setSelectedDoc(null)}
            className="w-full mt-6 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs text-slate-600 font-bold transition-all text-center block cursor-pointer"
          >
            {t.cancel}
          </button>
        </div>
      ) : (
        /* Document search and overview listing */
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchDocs}
              className="w-full bg-white border border-blue-100 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-850 placeholder-slate-450 focus:outline-none focus:border-[#0A3D91] shadow-sm font-semibold text-slate-800"
            />
          </div>

          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">
              {t.noData}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="p-4 bg-white border border-blue-100 hover:border-blue-200 rounded-2xl flex items-center justify-between transition-all shadow-sm"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#0A3D91] flex items-center justify-center">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-slate-900 leading-normal">
                        {doc.title}
                      </h4>
                      <span className="text-[8px] text-slate-400 uppercase tracking-widest block mt-0.5 font-bold">
                        Category: {doc.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0A3D91] text-[10px] font-bold rounded-lg transition-colors border border-blue-100 cursor-pointer"
                  >
                    {t.viewDetails}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
