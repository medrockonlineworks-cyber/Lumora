import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { Language, translations } from '../locale';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface CustomerServiceTabProps {
  language: Language;
}

export default function CustomerServiceTab({ language }: CustomerServiceTabProps) {
  const t = translations[language];

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: language === 'am'
        ? 'እንኳን ወደ ሉሞራ ፋይናንስ ረዳት በሰላም መጡ! ስለ ንግድ ባንክ ደረሰኞች፣ የኢንቨስትመንት ዑደቶች ወይም የሪፈራል ጉርሻዎች ምን ማወቅ ይፈልጋሉ?'
        : 'Welcome to LUMORA Financial Intelligence! How can I assist you today with CBE transfers, activation cycles, or referral bonuses?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Local knowledge-base stubs for immediate offline resilience
  const getOfflineResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('cbe') || q.includes('bank') || q.includes('ንግድ ባንክ') || q.includes('አካውንት') || q.includes('account')) {
      return language === 'am'
        ? 'የሉሞራ ይፋዊ የኢትዮጵያ ንግድ ባንክ (CBE) አካውንት ለይኩን (Leykun) በስም ሲሆን አካውንት ቁጥሩ 1000419524747 ነው። ቢያንስ 1,000 ETB ያስተላልፉና ደረሰኙን በ "ደረሰኝ" ታብ ውስጥ ያስገቡ።'
        : 'LUMORA official Commercial Bank of Ethiopia (CBE) Account is under the name "Leykun" with Account Number: 1000419524747. Min deposit is 1,000 ETB. Submit proof on the "CBE Receipt" tab.';
    }
    
    if (q.includes('bonus') || q.includes('ጉርሻ') || q.includes('activation') || q.includes('starter') || q.includes('level')) {
      return language === 'am'
        ? 'አዎ! ለጀማሪ ደረጃ 1 (Starter Level 1) ኢንቨስትመንት ሲያደርጉ የ 50 ETB ተጨማሪ ጉርሻ ያገኛሉ። ለጀማሪ ደረጃ 2 (Starter Level 2) ደግሞ የ 100 ETB ቦነስ ያገኛሉ። የቪአይፒ ደረጃዎችም ከፍተኛ ጉርሻ አላቸው።'
        : 'Yes! Activating Starter Level 1 yields an instant activation bonus of 50 ETB. Activating Starter Level 2 yields 100 ETB bonus, and all other plans continue to scale higher!';
    }

    if (q.includes('withdraw') || q.includes('ማውጣት') || q.includes('ገንዘብ')) {
      return language === 'am'
        ? 'ገንዘብ ለማውጣት ቢያንስ 250 ETB በኪስ ቦርሳዎ መኖር አለበት። ጥያቄዎ በተሳካ ሁኔታ ከቀረበ በኋላ ከ 2-4 ሰአታት ውስጥ ወደ ንግድ ባንክዎ ገቢ ይደረጋል።'
        : 'Secure withdrawals start from 250 ETB. Processing takes between 2-4 hours directly into your registered CBE mobile phone or wallet.';
    }

    return language === 'am'
      ? 'የሉሞራ ኢንቨስትመንት ሲስተም ሙሉ በሙሉ በንግድ ባንክ ግልጽ ደረሰኞች ላይ የተመሰረተ ሲሆን፣ ማንነትዎን በማረጋገጥ የቪአይፒ ደረጃዎችን መክፈትና ዕለታዊ ትርፍ ማግኘት ይችላሉ።'
      : 'LUMORA is Ethiopia\'s fixed-income system synced with CBE ledger proofs. Verify your identity (KYC) on the Profile tab to unlock Premium VIP levels.';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText;
    setInputText('');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { sender: 'user', text: userMsgText, timestamp }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsgText, language }),
      });

      if (!res.ok) throw new Error('API unconfigured or failed');

      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply, timestamp }]);
    } catch {
      // Fallback to local rule-based response instantly
      const localResponse = getOfflineResponse(userMsgText);
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'ai', text: localResponse, timestamp }]);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-lg mx-auto bg-slate-50 relative overflow-hidden rounded-3xl border border-slate-200 shadow-3xs animate-in fade-in duration-300">
      {/* Mini header */}
      <div className="bg-[#0A3D91] text-white p-4 flex items-center space-x-3 shadow-sm shrink-0">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center border border-amber-400/20 text-[#0a3d91]">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1">
            <span>{t.aiTitle}</span>
            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
          </h3>
          <p className="text-[10px] text-slate-200 mt-0.5 leading-none">
            {t.aiSub}
          </p>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={i}
              className={`flex items-start space-x-2 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-[#0a3d91] text-xs shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}
              
              <div className="space-y-1 max-w-[80%]">
                <div className={`p-3.5 rounded-2xl text-[11px] leading-relaxed font-medium shadow-3xs border ${
                  isAi 
                    ? 'bg-white border-slate-200 text-slate-800 rounded-tl-none' 
                    : 'bg-[#0A3D91] border-[#0A3D91] text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[8px] font-bold text-slate-400 block px-1.5 uppercase tracking-wide">
                  {msg.timestamp}
                </span>
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-lg bg-[#0a3d91] flex items-center justify-center text-white text-xs shrink-0 mt-0.5 font-black">
                  U
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-start space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-[#0a3d91] text-xs shrink-0 mt-0.5">
              <Bot className="w-4.5 h-4.5 animate-bounce" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs font-semibold rounded-tl-none animate-pulse">
              Analyzing ledger streams...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white shrink-0 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.aiPlaceholder}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white transition-all font-medium"
        />
        <button
          type="submit"
          className="p-2.5 bg-[#0A3D91] hover:bg-blue-800 text-white rounded-xl transition-all cursor-pointer active:scale-95 shrink-0 shadow-sm shadow-blue-500/10 flex items-center justify-center"
        >
          <Send className="w-4.5 h-4.5 text-amber-300" />
        </button>
      </form>
    </div>
  );
}
