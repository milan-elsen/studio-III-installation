/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  QrCode, 
  Star, 
  Package, 
  ArrowLeft, 
  Menu, 
  CheckCircle2,
  Trash2,
  Layers,
  Recycle,
  Droplets,
  RefreshCw,
  XCircle,
  MapPin,
  Send,
  Share2,
  Info
} from 'lucide-react';

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`glass-card p-8 ${className}`}>
    {children}
  </div>
);

const GlossyButton = ({ 
  children, 
  onClick, 
  variant = 'blue',
  className = "" 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'blue' | 'green' | 'glass' | 'red',
  className?: string 
}) => {
  const baseClass = variant === 'blue' ? 'glossy-button-blue' : 
                    variant === 'green' ? 'glossy-button-green' : 
                    variant === 'red' ? 'bg-gradient-to-b from-red-400 to-red-600 border border-red-300/50 rounded-full px-12 py-4 font-bold text-xl text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all active:scale-95 hover:brightness-110' :
                    'glass-button';
  return (
    <button onClick={onClick} className={`${baseClass} ${className}`}>
      {children}
    </button>
  );
};

const Background = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="bokeh w-64 h-64 top-10 left-10 opacity-30" />
    <div className="bokeh w-96 h-96 bottom-20 right-10 opacity-20" />
    <div className="bokeh w-48 h-48 top-1/2 left-1/3 opacity-25" />
    {/* Animated bubbles */}
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white/10 backdrop-blur-sm"
        style={{
          width: Math.random() * 40 + 10,
          height: Math.random() * 40 + 10,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -100, 0],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}
  </div>
);

// --- Screens ---

// 0. START SCREEN
const WelcomeScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-12">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <GlassCard className="max-w-md w-full py-20 px-12">
        <h1 className="text-6xl font-bold mb-6 drop-shadow-lg tracking-tight">Unpack the Excess</h1>
        <p className="text-2xl opacity-90 font-medium">Reveal what you didn't order</p>
      </GlassCard>
    </motion.div>
    <GlossyButton onClick={onStart}>Start</GlossyButton>
  </div>
);

// 1. STEP 1 — MEASURE TOTAL WEIGHT
const WeighStep1Screen = ({ onConfirm }: { onConfirm: (w: number) => void }) => {
  const [weight, setWeight] = useState(850);
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold drop-shadow-md">Step 1 — Measure total weight</h2>
      </div>
      <GlassCard className="w-full max-w-md p-16 flex flex-col items-center relative overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-blue-400/5 pointer-events-none"
        />
        <motion.div 
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
          className="text-8xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] whitespace-nowrap"
        >
          {weight} <span className="text-4xl font-normal opacity-70 ml-2">g</span>
        </motion.div>
      </GlassCard>
      <GlossyButton variant="green" onClick={() => onConfirm(weight)}>Confirm Weight</GlossyButton>
    </div>
  );
};

// 2. STEP 2 — UNPACK GUIDE
const UnpackScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-16">
    <h2 className="text-5xl font-bold drop-shadow-lg">Unpack your package</h2>
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      <div className="w-80 h-80 bg-amber-700/30 rounded-2xl border-4 border-amber-600/40 flex items-center justify-center shadow-2xl relative overflow-hidden">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Package size={160} className="text-amber-200/80" />
        </motion.div>
        {/* Floating items animation */}
        <AnimatePresence>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -150, opacity: [0, 1, 0], x: (i - 2) * 40 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              className="absolute"
            >
              <Layers size={40} className="text-white/40" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 bg-white/10 blur-[100px] -z-10 animate-pulse" />
    </motion.div>
    <p className="text-xl opacity-70 italic">Slowly fade into physical action...</p>
    <GlossyButton onClick={onNext}>Done Unpacking</GlossyButton>
  </div>
);

// 3. STEP 3 — SORT MATERIALS
const SortMaterialsScreen = ({ onNext }: { onNext: (data: any) => void }) => {
  const [counts, setCounts] = useState({ recyclable: 0, nonRecyclable: 0, reusable: 0, others: 0 });
  const categories = [
    { id: 'recyclable', label: 'Recyclable', icon: <Recycle />, color: 'emerald', glow: 'shadow-[0_0_20px_#10b981]' },
    { id: 'nonRecyclable', label: 'Non-Recyclable', icon: <XCircle />, color: 'red', glow: 'shadow-[0_0_20px_#ef4444]' },
    { id: 'reusable', label: 'Reusable', icon: <RefreshCw />, color: 'cyan', glow: 'shadow-[0_0_20px_#06b6d4]' },
    { id: 'others', label: 'Others', icon: <Package />, color: 'slate', glow: 'shadow-[0_0_20px_#64748b]' },
  ];

  const handleSort = (id: string) => {
    setCounts(prev => ({ ...prev, [id]: prev[id as keyof typeof prev] + 1 }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-10 px-6">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold">Sort removed materials</h2>
        <p className="text-xl opacity-80">Classify based on how they can be handled</p>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
        {categories.map(cat => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSort(cat.id)}
            className={`glass-card p-6 flex flex-col items-center space-y-4 border-2 border-white/10 ${cat.glow} transition-all`}
          >
            <div className={`text-${cat.color}-400`}>{React.cloneElement(cat.icon as React.ReactElement, { size: 48 })}</div>
            <div className="text-xl font-bold">{cat.label}</div>
            <div className="text-3xl font-black opacity-90">{counts[cat.id as keyof typeof counts]}</div>
          </motion.button>
        ))}
      </div>

      <GlossyButton variant="glass" onClick={() => onNext(counts)}>Done Sorting</GlossyButton>
    </div>
  );
};

// 4. STEP 4 — MEASURE AGAIN
const WeighStep2Screen = ({ onConfirm }: { onConfirm: (w: number) => void }) => {
  const [weight, setWeight] = useState(520);
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold drop-shadow-md">Step 2 — Weigh again</h2>
      </div>
      <GlassCard className="w-full max-w-md p-16 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] whitespace-nowrap"
        >
          {weight} <span className="text-4xl font-normal opacity-70 ml-2">g</span>
        </motion.div>
      </GlassCard>
      <GlossyButton variant="blue" onClick={() => onConfirm(weight)}>Compare Result</GlossyButton>
    </div>
  );
};

// 5. PROCESSING — ANALYZING
const AnalyzingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const statusTexts = [
    "Scanning materials...",
    "Calculating weight difference...",
    "Evaluating packaging level...",
    "Material breakdown analyzed",
    "Non-recyclable materials: 60%"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    const textTimer = setInterval(() => {
      setStatusIdx(prev => (prev + 1) % statusTexts.length);
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12">
      <h2 className="text-4xl font-bold text-center">Analyzing Packaging...</h2>
      
      <div className="relative">
        <div className="glass-orb flex items-center justify-center overflow-hidden">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 via-transparent to-emerald-400/20"
          />
          <motion.div 
            animate={{ y: [-100, 100, -100] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 h-1 bg-white/40 blur-sm"
          />
          <div className="orb-glow" />
          <Package size={80} className="text-white/60 relative z-10" />
        </div>
      </div>

      <div className="w-full max-w-sm space-y-6 text-center">
        <AnimatePresence mode="wait">
          <motion.p 
            key={statusIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl font-medium h-8"
          >
            {statusTexts[statusIdx]}
          </motion.p>
        </AnimatePresence>

        <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/20">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 shadow-[0_0_15px_#10b981]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// 6. RESULT — OVERPACKAGING DETECTED
const ResultsScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-8 px-6">
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-medium opacity-80">Packaging Removed</h2>
      <p className="text-6xl font-black">330 g</p>
    </div>
    
    <GlassCard className="w-full max-w-sm p-10 space-y-8">
      <div className="flex justify-around items-end h-64 pb-8 border-b border-white/10">
        <div className="flex flex-col items-center space-y-3">
          <div className="text-xl font-bold">850 g</div>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            className="w-20 bg-gradient-to-t from-blue-600/60 to-blue-400/80 rounded-t-2xl border border-white/20"
          />
          <div className="text-lg opacity-70">Before</div>
        </div>
        <div className="flex flex-col items-center space-y-3">
          <div className="text-xl font-bold">520 g</div>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: '61%' }}
            className="w-20 bg-gradient-to-t from-emerald-600/60 to-emerald-400/80 rounded-t-2xl border border-white/20"
          />
          <div className="text-lg opacity-70">After</div>
        </div>
      </div>
    </GlassCard>

    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-sm bg-red-600/90 backdrop-blur-xl rounded-[2rem] p-6 text-center border-2 border-red-400/50 shadow-2xl"
    >
      <h3 className="text-2xl font-black uppercase tracking-widest mb-1">Excessive Packaging Detected</h3>
      <p className="text-lg font-medium opacity-90">Majority of removed materials are non-recyclable.</p>
    </motion.div>

    <GlossyButton variant="glass" onClick={onNext}>Continue</GlossyButton>
  </div>
);

// 7. ENVIRONMENTAL IMPACT
const ImpactScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-16 px-6">
    <h2 className="text-3xl font-bold drop-shadow-md">This equals:</h2>
    
    <div className="flex items-center justify-center space-x-8">
      <div className="flex -space-x-12">
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            initial={{ y: 100, opacity: 0, rotate: -30, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
            transition={{ 
              delay: i * 0.3, 
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blue-400/30 blur-3xl -z-10 rounded-full" />
            <Droplets size={140} className="text-blue-200 drop-shadow-[0_0_25px_rgba(147,197,253,0.6)]" />
          </motion.div>
        ))}
      </div>
      <div className="text-7xl font-black text-white/90">=</div>
      <motion.div
        initial={{ scale: 0, rotate: 45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.5, type: "spring", bounce: 0.5 }}
      >
        <Package size={200} className="text-amber-200 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]" />
      </motion.div>
    </div>

    <div className="space-y-4">
      <p className="text-2xl font-bold text-blue-200">Equivalent to 3 Plastic Bottles of Waste</p>
      <button onClick={onNext} className="text-2xl font-bold animate-bounce flex flex-col items-center space-y-2 text-white/80 hover:text-white transition-colors">
        <span>Tap to see details</span>
        <ArrowLeft className="rotate-270" />
      </button>
    </div>
  </div>
);

// 8. JUDGMENT TRANSITION
const JudgmentScreen = ({ onNext }: { onNext: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onNext, 3000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black/40 backdrop-blur-sm transition-all duration-1000">
      <motion.h2 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-5xl font-black text-center px-12 leading-tight"
      >
        How acceptable is this packaging?
      </motion.h2>
    </div>
  );
};

// 9. FEEDBACK & RATING
const RatingScreen = ({ onNext }: { onNext: () => void }) => {
  const [rating, setRating] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const toggleOption = (index: number) => {
    setSelectedOptions(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const options = [
    { icon: <Droplets size={24} />, label: "Too much plastic" },
    { icon: <Layers size={24} />, label: "Too many layers" },
    { icon: <Recycle size={24} />, label: "Hard to recycle" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-10 px-6">
      <GlassCard className="w-full max-w-md p-10 space-y-10 flex flex-col items-center">
        <div className="flex justify-center space-x-3">
          {[1, 2, 3, 4, 5].map(i => (
            <motion.div key={i} whileTap={{ scale: 0.8 }}>
              <Star 
                size={64} 
                className={`${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'} cursor-pointer transition-all hover:scale-110 drop-shadow-lg`}
                onClick={() => setRating(i)}
              />
            </motion.div>
          ))}
        </div>

        <div className="space-y-4 w-full">
          {options.map((opt, i) => {
            const isSelected = selectedOptions.includes(i);
            return (
              <button 
                key={i} 
                onClick={() => toggleOption(i)}
                className={`w-full flex flex-col items-center justify-center space-y-2 border rounded-3xl p-6 transition-all group ${
                  isSelected 
                    ? 'bg-blue-500/40 border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]' 
                    : 'bg-white/10 hover:bg-white/20 border-white/20'
                }`}
              >
                <div className={`${isSelected ? 'text-white' : 'text-white/60'} group-hover:text-white transition-colors`}>
                  {React.cloneElement(opt.icon as React.ReactElement, { size: 32 })}
                </div>
                <span className="text-2xl font-bold">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-center space-y-6">
          <p className="text-3xl font-black">Send feedback to seller?</p>
          <div className="flex space-x-6">
            <GlossyButton variant="green" onClick={onNext} className="flex-1 !px-0">YES</GlossyButton>
            <GlossyButton variant="blue" onClick={onNext} className="flex-1 !px-0">SKIP</GlossyButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

// 10. SENDING FEEDBACK
const SendingFeedbackScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: "50%", y: "50%", opacity: 0 }}
            animate={{ x: "120%", y: "-20%", opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
            className="absolute w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"
          />
        ))}
        {/* Network lines */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="network-line" style={{ top: `${20 + i * 15}%`, transform: `rotate(${i * 10 - 20}deg)` }} />
        ))}
      </div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-center space-y-6 relative z-10"
      >
        <Send size={100} className="mx-auto text-white/80" />
        <h2 className="text-4xl font-bold">Sending your feedback...</h2>
      </motion.div>
    </div>
  );
};

// 11. SENT CONFIRMATION
const ConfirmationScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-12 px-6 text-center">
    <div className="space-y-4">
      <CheckCircle2 size={120} className="mx-auto text-green-300 drop-shadow-[0_0_20px_#86efac]" />
      <h2 className="text-5xl font-black">Feedback Sent</h2>
      <p className="text-2xl opacity-80">Your voice has been added to the signal.</p>
    </div>

    <GlassCard className="w-full max-w-sm p-10 space-y-4 relative overflow-hidden">
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0, 0.2, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-green-300 rounded-full blur-3xl"
      />
      <div className="text-4xl font-black text-green-300">+1 Added</div>
      <div className="text-5xl font-black">12,438</div>
      <p className="text-lg opacity-70">users reported similar issues</p>
    </GlassCard>

    <p className="text-xl font-medium max-w-xs mx-auto">
      "Your feedback contributes to packaging improvement signals."
    </p>

    <GlossyButton onClick={onNext}>Continue</GlossyButton>
  </div>
);

// 12. IMPACT MESSAGE
const ImpactMessageScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-12 px-8 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2 className="text-5xl font-black leading-tight">
        "Change only happens when feedback is visible."
      </h2>
      <p className="text-2xl opacity-80 font-medium">
        This report contributes to improving packaging practices.
      </p>
    </motion.div>
    <GlossyButton variant="glass" onClick={onNext}>View Options</GlossyButton>
  </div>
);

// 13. OUTPUT
const OutputScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-16 px-6">
    <h2 className="text-5xl font-black drop-shadow-lg">Get your report</h2>
    
    <div className="flex space-x-8 w-full max-w-2xl">
      <GlassCard className="flex-1 flex flex-col items-center justify-between p-10 space-y-10 h-96 group hover:bg-white/30 transition-all cursor-pointer">
        <Printer size={120} className="text-white/80 group-hover:scale-110 transition-transform" />
        <div className="text-center w-full">
          <h3 className="text-3xl font-bold mb-6">Print Report</h3>
          <GlossyButton variant="blue" onClick={onNext} className="w-full !px-0">PRINT</GlossyButton>
        </div>
      </GlassCard>

      <GlassCard className="flex-1 flex flex-col items-center justify-between p-10 space-y-10 h-96 group hover:bg-white/30 transition-all cursor-pointer">
        <div className="bg-white p-4 rounded-2xl group-hover:rotate-6 transition-transform">
          <QrCode size={120} className="text-black" />
        </div>
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2">Scan QR</h3>
          <p className="text-lg opacity-70">Scan to view on another device.</p>
        </div>
      </GlassCard>
    </div>
    <GlossyButton variant="glass" onClick={onNext}>View Community Map</GlossyButton>
  </div>
);

// 14. CITY MAP
const CityMapScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-10 px-6 w-full">
    <div className="text-center space-y-2">
      <h2 className="text-4xl font-black">Packaging Reports Across Hong Kong</h2>
      <p className="text-xl opacity-80 font-bold text-green-300">+1 from your location</p>
    </div>

    <GlassCard className="w-full max-w-2xl aspect-video relative overflow-hidden !p-0 border-4 border-white/20">
      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md" />
      {/* Mock Map Grid */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 opacity-20">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="border border-white/20" />
        ))}
      </div>
      {/* Pins */}
      {[
        { top: '30%', left: '40%', color: 'red' },
        { top: '50%', left: '60%', color: 'yellow' },
        { top: '70%', left: '30%', color: 'green' },
        { top: '20%', left: '70%', color: 'red' },
        { top: '45%', left: '45%', color: 'green', pulse: true },
      ].map((pin, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="absolute"
          style={{ top: pin.top, left: pin.left }}
        >
          <MapPin size={32} className={`text-${pin.color}-500 drop-shadow-lg`} />
          {pin.pulse && (
            <motion.div 
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-green-300 rounded-full"
            />
          )}
        </motion.div>
      ))}
    </GlassCard>

    <GlossyButton onClick={onNext}>Finish</GlossyButton>
  </div>
);

// 15. END SCREEN
const FinalScreen = () => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-12 px-8">
    <div className="space-y-8">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-2xl font-medium"
      >
        Thank you for participating.
      </motion.p>
      
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
        className="text-8xl font-black drop-shadow-2xl leading-tight tracking-tighter"
      >
        Now you can't unsee it.
      </motion.h1>
    </div>
    
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-400/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [step, setStep] = useState(0);
  const [weights, setWeights] = useState({ before: 0, after: 0 });
  const [sortData, setSortData] = useState(null);

  const nextStep = () => setStep(s => s + 1);

  const renderStep = () => {
    switch (step) {
      case 0: return <WelcomeScreen onStart={nextStep} />;
      case 1: return <WeighStep1Screen onConfirm={(w) => { setWeights(p => ({ ...p, before: w })); nextStep(); }} />;
      case 2: return <UnpackScreen onNext={nextStep} />;
      case 3: return <SortMaterialsScreen onNext={(data) => { setSortData(data); nextStep(); }} />;
      case 4: return <WeighStep2Screen onConfirm={(w) => { setWeights(p => ({ ...p, after: w })); nextStep(); }} />;
      case 5: return <AnalyzingScreen onComplete={nextStep} />;
      case 6: return <ResultsScreen onNext={nextStep} />;
      case 7: return <ImpactScreen onNext={nextStep} />;
      case 8: return <JudgmentScreen onNext={nextStep} />;
      case 9: return <RatingScreen onNext={nextStep} />;
      case 10: return <SendingFeedbackScreen onComplete={nextStep} />;
      case 11: return <ConfirmationScreen onNext={nextStep} />;
      case 12: return <ImpactMessageScreen onNext={nextStep} />;
      case 13: return <OutputScreen onNext={nextStep} />;
      case 14: return <CityMapScreen onNext={nextStep} />;
      case 15: return <FinalScreen />;
      default: return null;
    }
  };

  return (
    <div className="relative w-full h-screen max-w-4xl mx-auto overflow-hidden shadow-2xl border-x border-white/10">
      <Background />
      
      {/* Header (only for some screens) */}
      {step > 0 && step < 15 && (
        <header className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-50">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} className="p-3 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={32} />
          </button>
          <div className="text-xl font-bold opacity-80 tracking-wide">Unpack Package Guide</div>
          <button className="p-3 hover:bg-white/10 rounded-full transition-colors">
            <Menu size={32} />
          </button>
        </header>
      )}

      <main className="h-full pt-20 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "anticipate" }}
            className="h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Status Bar Mockup */}
      <div className="absolute top-0 left-0 right-0 h-8 flex justify-between px-10 items-center text-xs font-bold opacity-60 z-[60]">
        <div className="flex items-center space-x-4">
          <span>9:41 PM Wed Jan 21</span>
          <Info size={14} />
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-1 h-3 bg-white rounded-full" />
            <div className="w-1 h-3 bg-white rounded-full" />
            <div className="w-1 h-3 bg-white rounded-full" />
            <div className="w-1 h-3 bg-white/30 rounded-full" />
          </div>
          <div className="w-6 h-3 border border-white/50 rounded-sm relative">
            <div className="absolute inset-y-0 left-0 bg-white w-[90%]" />
          </div>
          <span>99%</span>
        </div>
      </div>
    </div>
  );
}
