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
  ArrowLeft, 
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
  className = "",
  disabled = false,
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'blue' | 'green' | 'glass' | 'red',
  className?: string,
  disabled?: boolean,
}) => {
  const baseClass = variant === 'blue' ? 'glossy-button-blue' : 
                    variant === 'green' ? 'glossy-button-green' : 
                    variant === 'red' ? 'bg-gradient-to-b from-red-400 to-red-600 border border-red-300/50 rounded-full px-12 py-4 font-bold text-xl text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all active:scale-95 hover:brightness-110' :
                    'glass-button';
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} disabled:pointer-events-none disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
};

const PackageSolidIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    viewBox="216.5 331.7 162.9 177.6"
    width={size}
    height={size}
    aria-hidden="true"
    className={className}
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      fill="currentColor"
      fillOpacity={0.9}
      d="M227.8,471.4l63.5,36c4.5,2.6,8.8,2.6,13.4,0l63.4-36c7.4-4.2,11.3-8.5,11.3-20v-63.9c0-8.4-3.1-13.6-9.8-17.5l-57.1-32.4c-9.8-5.6-19.2-5.6-29,0l-57,32.4c-6.9,3.9-9.9,9.1-9.9,17.5v63.9c0,11.5,4,15.8,11.3,20ZM235.1,460.7c-4.7-2.6-6.3-5.3-6.3-9.8v-60.9l62.9,35.9v67l-56.6-32.2ZM360.9,460.7l-56.6,32.2v-67l62.9-35.9v60.9c0,4.4-1.6,7.2-6.2,9.8ZM298,414.7l-62.3-35.3,24.9-14.3,62.3,35.4-24.9,14.1ZM335.9,393.2l-62.5-35.3,15.5-8.8c6.2-3.6,11.9-3.6,18.2,0l53.2,30.3-24.4,13.8Z"
    />
  </svg>
);

type SensorState = {
  device?: string;
  wifi_mode?: string;
  ssid?: string;
  ip?: string;
  ready?: boolean;
  has_sample?: boolean;
  calibrated?: boolean;
  tare_applied?: boolean;
  calibration_factor?: number;
  raw?: number | null;
  grams?: number | null;
  uptime_ms?: number;
  heap_free?: number;
  wifi_clients?: number;
};

const SensorDebugScreen = ({ onClose }: { onClose: () => void }) => {
  const [knownGrams, setKnownGrams] = useState(100);
  const [lastAction, setLastAction] = useState('Waiting for sensor data...');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const applyPayload = async (path: string, actionName: string) => {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      setConnectionError(null);
      setLastAction(actionName);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      setConnectionError(message);
    }
  };

  const tare = () => void applyPayload('/api/loadcell/tare', 'Tare requested');
  const calibrateWithKnownWeight = () =>
    void applyPayload(`/api/loadcell/calibrate?known_grams=${encodeURIComponent(String(knownGrams))}`, 'Calibrated with known weight');

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/90 text-white backdrop-blur-md">
      <div className="min-h-full px-4 py-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 sm:text-sm">Sensor Debug</p>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl">Weight Integration</h2>
            </div>
            <GlossyButton variant="glass" onClick={onClose} className="w-full sm:w-auto">
              Close
            </GlossyButton>
          </div>

          <GlassCard className="space-y-4 !p-4 sm:space-y-5 sm:!p-8">
            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
              Use tare first on an empty scale, then place a known weight and calibrate.
            </p>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50 sm:text-sm">Known weight for calibration</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="number"
                  value={knownGrams}
                  onChange={(e) => setKnownGrams(Number(e.target.value) || 0)}
                  className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-xl font-black outline-none sm:text-2xl"
                />
                <GlossyButton variant="green" onClick={calibrateWithKnownWeight} className="w-full sm:w-auto">
                  Calibrate
                </GlossyButton>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <GlossyButton variant="blue" onClick={tare} className="w-full sm:w-auto">
                Tare Now
              </GlossyButton>
            </div>

            <p className="min-h-[1.5rem] text-sm text-white/70 sm:text-base">
              {connectionError ? connectionError : lastAction}
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

const getLiveSensorApiBase = () =>
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://192.168.4.1'
    : window.location.origin;

const useLiveSensorState = () => {
  const [sensorState, setSensorState] = useState<SensorState | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [apiBase] = useState(getLiveSensorApiBase);
  const normalizedApiBase = apiBase.replace(/\/$/, '');

  useEffect(() => {
    let alive = true;

    const syncState = async () => {
      try {
        const response = await fetch(`${normalizedApiBase}/api/loadcell/state`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as SensorState;
        if (!alive) return;
        setSensorState(data);
        setConnectionError(null);
      } catch (error) {
        if (!alive) return;
        const message = error instanceof Error ? error.message : 'Failed to reach ESP32';
        setConnectionError(message);
      }
    };

    void syncState();
    const timer = window.setInterval(syncState, 1000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [normalizedApiBase]);

  return { sensorState, connectionError };
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
  <div className="flex flex-col items-center justify-center min-h-full text-center space-y-12">
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
const WeighStep1Screen = ({
  liveWeight,
  calibrated,
  onConfirm,
}: {
  liveWeight: number | null;
  calibrated: boolean;
  onConfirm: (w: number) => void;
}) => {
  const displayWeight = calibrated && liveWeight !== null ? Math.round(liveWeight) : null;
  return (
    <div className="flex flex-col items-center justify-center min-h-full space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold drop-shadow-md">Step 1 — Measure total weight</h2>
        {!calibrated ? (
          <p className="text-lg font-medium text-yellow-200">Calibrate the load cell first to use live weight.</p>
        ) : displayWeight === null ? (
          <p className="text-lg font-medium text-white/70">Waiting for live sensor data...</p>
        ) : (
          <p className="text-lg font-medium text-white/70">Live reading from the ESP32</p>
        )}
      </div>
      <GlassCard className="w-full max-w-md p-16 flex flex-col items-center relative overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-blue-400/5 pointer-events-none"
        />
        {displayWeight !== null ? (
          <motion.div 
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
            className="text-8xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] whitespace-nowrap"
          >
            {displayWeight} <span className="text-4xl font-normal opacity-70 ml-2">g</span>
          </motion.div>
        ) : (
          <div className="text-7xl font-black text-white/40 whitespace-nowrap">— g</div>
        )}
      </GlassCard>
      <GlossyButton
        variant="green"
        onClick={() => {
          if (displayWeight !== null) onConfirm(displayWeight);
        }}
        disabled={displayWeight === null}
      >
        Confirm Weight
      </GlossyButton>
    </div>
  );
};

// 2. STEP 2 — UNPACK GUIDE
const UnpackScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-full text-center space-y-16">
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
          <PackageSolidIcon size={160} className="text-amber-200/80" />
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
    { id: 'others', label: 'Others', icon: <PackageSolidIcon />, color: 'slate', glow: 'shadow-[0_0_20px_#64748b]' },
  ];

  const handleSort = (id: string) => {
    setCounts(prev => ({ ...prev, [id]: prev[id as keyof typeof prev] + 1 }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full space-y-10 px-6">
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
const WeighStep2Screen = ({
  liveWeight,
  calibrated,
  onConfirm,
}: {
  liveWeight: number | null;
  calibrated: boolean;
  onConfirm: (w: number) => void;
}) => {
  const displayWeight = calibrated && liveWeight !== null ? Math.round(liveWeight) : null;
  return (
    <div className="flex flex-col items-center justify-center min-h-full space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold drop-shadow-md">Step 2 — Weigh again</h2>
        {!calibrated ? (
          <p className="text-lg font-medium text-yellow-200">Calibrate the load cell first to use live weight.</p>
        ) : displayWeight === null ? (
          <p className="text-lg font-medium text-white/70">Waiting for live sensor data...</p>
        ) : (
          <p className="text-lg font-medium text-white/70">Live reading from the ESP32</p>
        )}
      </div>
      <GlassCard className="w-full max-w-md p-16 flex flex-col items-center">
        {displayWeight !== null ? (
          <motion.div 
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] whitespace-nowrap"
          >
            {displayWeight} <span className="text-4xl font-normal opacity-70 ml-2">g</span>
          </motion.div>
        ) : (
          <div className="text-7xl font-black text-white/40 whitespace-nowrap">— g</div>
        )}
      </GlassCard>
      <GlossyButton
        variant="blue"
        onClick={() => {
          if (displayWeight !== null) onConfirm(displayWeight);
        }}
        disabled={displayWeight === null}
      >
        Compare Result
      </GlossyButton>
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
    <div className="flex flex-col items-center justify-center min-h-full space-y-12">
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
          <PackageSolidIcon size={80} className="text-white/60 relative z-10" />
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
const ResultsScreen = ({ before, after, onNext }: { before: number | null; after: number | null; onNext: () => void }) => {
  const removed = before !== null && after !== null ? Math.max(before - after, 0) : null;
  const maxWeight = Math.max(before ?? 0, after ?? 0, 1);
  const beforeHeight = before !== null ? `${Math.max(10, (before / maxWeight) * 100)}%` : '10%';
  const afterHeight = after !== null ? `${Math.max(10, (after / maxWeight) * 100)}%` : '10%';

  return (
  <div className="flex flex-col items-center justify-center min-h-full space-y-8 px-6">
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-medium opacity-80">Packaging Removed</h2>
      <p className="text-6xl font-black">{removed === null ? '—' : `${removed} g`}</p>
    </div>
    
    <GlassCard className="w-full max-w-sm p-10 space-y-8">
      <div className="flex justify-around items-end h-64 pb-8 border-b border-white/10">
        <div className="flex flex-col items-center space-y-3">
          <div className="text-xl font-bold">{before === null ? '—' : `${before} g`}</div>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: beforeHeight }}
            className="w-20 bg-gradient-to-t from-blue-600/60 to-blue-400/80 rounded-t-2xl border border-white/20"
          />
          <div className="text-lg opacity-70">Before</div>
        </div>
        <div className="flex flex-col items-center space-y-3">
          <div className="text-xl font-bold">{after === null ? '—' : `${after} g`}</div>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: afterHeight }}
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
};

// 7. ENVIRONMENTAL IMPACT
const ImpactScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-full text-center space-y-16 px-6">
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
        <PackageSolidIcon size={200} className="text-amber-200 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]" />
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-1000">
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
const RatingScreen = ({ onSend, onSkip }: { onSend: () => void; onSkip: () => void }) => {
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
    <div className="flex flex-col items-center justify-center min-h-full space-y-10 px-6">
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
            <GlossyButton variant="green" onClick={onSend} className="flex-1 !px-0">YES</GlossyButton>
            <GlossyButton variant="blue" onClick={onSkip} className="flex-1 !px-0">SKIP</GlossyButton>
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
  <div className="flex flex-col items-center justify-center min-h-full relative overflow-hidden px-6 py-12">
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
        className="text-center space-y-6 relative z-10 max-w-xl"
      >
        <Send size={100} className="mx-auto text-white/80" />
        <h2 className="text-4xl font-bold leading-tight">Sending your feedback...</h2>
      </motion.div>
    </div>
  );
};

// 11. SENT CONFIRMATION
const ConfirmationScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-full space-y-12 px-6 text-center">
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
  <div className="flex flex-col items-center justify-center min-h-full space-y-12 px-8 text-center">
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
  <div className="flex flex-col items-center justify-center min-h-full space-y-16 px-6">
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
  <div className="flex flex-col items-center justify-center min-h-full space-y-10 px-6 w-full">
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
const FinalScreen = ({ onRestart }: { onRestart: () => void }) => {
  const [showRestart, setShowRestart] = useState(false);

  return (
  <div className="flex flex-col items-center justify-center min-h-full text-center space-y-12 px-8">
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
        onAnimationComplete={() => setShowRestart(true)}
        className="text-8xl font-black drop-shadow-2xl leading-tight tracking-tighter"
      >
        Now you can't unsee it.
      </motion.h1>
    </div>

    {showRestart && <GlossyButton onClick={onRestart}>Back to Start</GlossyButton>}
    
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
};

// --- Main App ---

export default function App() {
  const normalizePath = (pathname: string) => (pathname.replace(/\/+$/, '') === '/debug' ? '/debug' : '/');
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));
  const [step, setStep] = useState(0);
  const [weights, setWeights] = useState<{ before: number | null; after: number | null }>({ before: null, after: null });
  const [sortData, setSortData] = useState(null);
  const { sensorState } = useLiveSensorState();

  useEffect(() => {
    const handlePopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (nextPath: '/' | '/debug') => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setPathname(nextPath);
  };

  const closeDebug = () => navigateTo('/');
  const isDebugRoute = pathname === '/debug';
  const hasHeader = step > 0 && step < 15;
  const calibrated = sensorState?.calibrated ?? false;
  const liveWeight = sensorState?.grams ?? null;

  const nextStep = () => setStep(s => s + 1);

  const renderStep = () => {
    switch (step) {
      case 0: return <WelcomeScreen onStart={nextStep} />;
      case 1: return (
        <WeighStep1Screen
          liveWeight={liveWeight}
          calibrated={calibrated}
          onConfirm={(w) => { setWeights(p => ({ ...p, before: w })); nextStep(); }}
        />
      );
      case 2: return <UnpackScreen onNext={nextStep} />;
      case 3: return <SortMaterialsScreen onNext={(data) => { setSortData(data); nextStep(); }} />;
      case 4: return (
        <WeighStep2Screen
          liveWeight={liveWeight}
          calibrated={calibrated}
          onConfirm={(w) => { setWeights(p => ({ ...p, after: w })); nextStep(); }}
        />
      );
      case 5: return <AnalyzingScreen onComplete={nextStep} />;
      case 6: return <ResultsScreen before={weights.before} after={weights.after} onNext={nextStep} />;
      case 7: return <ImpactScreen onNext={nextStep} />;
      case 8: return <JudgmentScreen onNext={nextStep} />;
      case 9: return <RatingScreen onSend={nextStep} onSkip={() => setStep(12)} />;
      case 10: return <SendingFeedbackScreen onComplete={nextStep} />;
      case 11: return <ConfirmationScreen onNext={nextStep} />;
      case 12: return <ImpactMessageScreen onNext={nextStep} />;
      case 13: return <OutputScreen onNext={nextStep} />;
      case 14: return <CityMapScreen onNext={nextStep} />;
      case 15: return <FinalScreen onRestart={() => setStep(0)} />;
      default: return null;
    }
  };

  if (isDebugRoute) {
    return <SensorDebugScreen onClose={closeDebug} />;
  }

  return (
    <div className="relative isolate flex flex-col w-screen min-h-[100dvh] overflow-hidden">
      <Background />
      
      {/* Header (only for some screens) */}
      {hasHeader && (
        <header className="relative z-50 flex-none pt-[env(safe-area-inset-top)] px-4 sm:px-8 py-4 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} className="p-3 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={32} />
          </button>
          <div className="text-center text-lg font-bold opacity-80 tracking-wide sm:text-xl">Unpack Package Guide</div>
          <div className="w-14" aria-hidden="true" />
        </header>
      )}

      <main
        className={`relative z-10 flex-1 min-h-0 pb-[env(safe-area-inset-bottom)] ${
          hasHeader ? 'pt-0' : 'pt-[env(safe-area-inset-top)]'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "anticipate" }}
            className="absolute inset-0 w-full h-full px-6 sm:px-8 flex items-center justify-center"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
