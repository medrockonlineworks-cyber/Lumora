import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, TrendingUp, Wallet, Sparkles, Building, ChevronRight, ChevronLeft, Coins, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../locale';

interface WalkthroughModalProps {
  userId: string;
  onClose: () => void;
}

export default function WalkthroughModal({ userId, onClose }: WalkthroughModalProps) {
  const { et } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'verification',
      title: 'ACCOUNT SECURED',
      subtitle: 'ID Submitted & Pending Audit',
      icon: CheckCircle2,
      color: 'from-sky-400 to-sky-600',
      textColor: 'text-sky-600',
      bgGlow: 'bg-sky-400/20',
      description: 'Congratulations! Your secure National ID has been successfully submitted to our database. Our security division is currently checking your documents for verification.',
      bullets: [
        'ID inspection generally finishes within 1-2 hours.',
        'Feel free to explore all features while verification is in progress.',
        'Your direct cashouts will be unlocked instantly upon audit approval.'
      ]
    },
    {
      id: 'explore',
      title: 'EXPLORE PLANS',
      subtitle: 'Study Diverse Project Types',
      icon: TrendingUp,
      color: 'from-sky-400 to-sky-600',
      textColor: 'text-sky-600',
      bgGlow: 'bg-sky-400/20',
      description: 'Lumora hosts energy, technology, and commercial development liquidity pools managed by our specialist team. The Lumora team operates the entire investment lifecycle on behalf of the user—you only need to invest, and Lumora does the work.',
      bullets: [
        'Professional hands-free asset operation on your behalf.',
        'No technical configuration: you invest, our team does the work.',
        'Rest assured knowing your seed funds are secured by physical reserves.'
      ]
    },
    {
      id: 'levels',
      title: 'VIP LEVEL BRACKETS',
      subtitle: 'Maximize Daily Dividends',
      icon: Sparkles,
      color: 'from-sky-400 to-sky-600',
      textColor: 'text-sky-600',
      bgGlow: 'bg-sky-400/20',
      description: 'Your regular earning potential is determined by your VIP level tier. As your total active portfolio grows, you climb to higher VIP levels with larger interest returns.',
      bullets: [
        '15 individual VIP tiers with scaling yield parameters.',
        'Earn up to a substantial 11.5% daily compounding profit.',
        'Upgrade tracks are unlocked automatically upon funding milestones.'
      ]
    },
    {
      id: 'deposit',
      title: 'EASY DEPOSITS',
      subtitle: 'How to Fund Your Account Wallet',
      icon: Wallet,
      color: 'from-sky-400 to-sky-600',
      textColor: 'text-sky-600',
      bgGlow: 'bg-sky-400/20',
      description: 'Adding secure capital balance to your wallet takes just a minute. Navigate to the Deposit menu, choose an amount, and execute a bank transfer.',
      bullets: [
        'The absolute minimum deposit threshold is 5,000 ETB.',
        'Transfer funds to our verified Commercial Bank of Ethiopia (CBE) list.',
        'Take a clean screenshot of the transfer slip and upload it for immediate credit.'
      ]
    },
    {
      id: 'withdraw',
      title: 'FAST WITHDRAWERS',
      subtitle: 'How to Cash Out Your Returns',
      icon: Coins,
      color: 'from-sky-400 to-sky-600',
      textColor: 'text-sky-600',
      bgGlow: 'bg-sky-400/20',
      description: 'Withdrawal of earnings was built for record clearing times. Open the Withdraw panel, select your payout, and verify using your safety credentials.',
      bullets: [
        'The minimum withdrawal threshold is exceptionally low at 600 ETB.',
        'Enter your custom 4-digit security PIN to authorize the transaction.',
        'Profits are settled directly to your Commercial Bank of Ethiopia (CBE) account.'
      ]
    },
    {
      id: 'loans',
      title: 'MICRO-LOAN PROGRAM',
      subtitle: 'How to Apply for Liquidity Help',
      icon: Building,
      color: 'from-sky-400 to-sky-600',
      textColor: 'text-sky-600',
      bgGlow: 'bg-sky-400/20',
      description: 'Need fast financial leverage? Our verified partners have immediate eligibility to apply for customizable micro-credits backed by active assets.',
      bullets: [
        'Calculate transparent terms and interest options right inside the loan menu.',
        'Collateral validations are calculated instantly in real-time.',
        'Once submitted, administrative clearance pays out directly into your CBE bank.'
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`lumora_walkthrough_new_${userId}`, 'completed');
    onClose();
  };

  const activeStepInfo = steps[currentStep];
  const StepIcon = activeStepInfo.icon;

  return (
    <div id="walkthrough-portal" className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-sky-950/45 backdrop-blur-md">
      {/* Dynamic skyblue spotlight glow effect */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full ${activeStepInfo.bgGlow} blur-[120px] transition-all duration-700 pointer-events-none -z-10`} />

      {/* Modern Skyblue & White Sleek Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-sm bg-white border border-sky-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative text-slate-800 border-t-white"
      >
        
        {/* Skyblue top loading progress bar */}
        <div className="h-1 w-full bg-sky-100 flex">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-full flex-1 transition-all duration-500 ${
                idx <= currentStep 
                  ? 'bg-sky-500' 
                  : 'bg-transparent'
              }`} 
            />
          ))}
        </div>

        {/* Header Ribbon Row */}
        <div className="p-5 pb-0 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-sky-50 py-1 px-3 rounded-full border border-sky-100">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
            <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-sky-600">
              {et('guidingLedgerTour') || 'Lumora Platform Tour'}
            </span>
          </div>

          <button
            onClick={handleComplete}
            className="p-1 px-3 rounded-xl text-sky-600 hover:text-sky-700 hover:bg-sky-50 transition-all font-sans text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            {et('skip') || 'Skip'}
          </button>
        </div>

        {/* Card Body Slide Window */}
        <div className="px-6 pt-5 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-4"
            >
              
              {/* Floating Shielded Circle Icon in clean skyblue */}
              <div className="flex justify-center mb-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-sky-500 flex items-center justify-center shadow-lg relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full opacity-100" />
                  <StepIcon className="w-8 h-8 text-white stroke-[2.2]" />
                </div>
              </div>

              {/* Step Title Header Block */}
              <div className="text-center space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest font-mono text-sky-500">
                  {activeStepInfo.title}
                </span>
                <h3 className="font-display font-black text-base text-slate-800 leading-tight block uppercase tracking-wide">
                  {activeStepInfo.subtitle}
                </h3>
              </div>

              {/* Informative description text */}
              <p className="text-[11.5px] text-slate-500 leading-relaxed text-center font-bold font-sans">
                {activeStepInfo.description}
              </p>

              {/* Detailed Bullet Highlights box */}
              <div className="pt-2.5 space-y-2 bg-sky-50/50 p-4 rounded-2xl border border-sky-100 max-w-[290px] mx-auto text-left">
                {activeStepInfo.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-sky-500" />
                    <span className="text-[10px] text-slate-700 leading-normal font-medium">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Panel */}
        <div className="p-6 bg-slate-50 border-t border-sky-100/60 flex items-center justify-between">
          
          {/* Flat Skyblue dots */}
          <div className="flex space-x-1.5 items-center">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentStep === idx 
                    ? 'w-5 bg-sky-500' 
                    : 'w-1.5 bg-sky-200 hover:bg-sky-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl border border-sky-200 text-sky-600 hover:text-sky-700 hover:bg-sky-50 active:scale-95 transition-all cursor-pointer"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-[10.5px] rounded-xl flex items-center space-x-1.5 uppercase tracking-wide cursor-pointer shadow-md shadow-sky-500/10 active:scale-95 transition-all duration-150 font-sans"
            >
              <span>{currentStep === steps.length - 1 ? (et('enterPlatform') || 'Enter Platform') : (et('nextStep') || 'Next Step')}</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
