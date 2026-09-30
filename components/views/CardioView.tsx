import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, Flame, Timer, Activity, CheckCircle2, ChevronRight, Droplets, Footprints } from 'lucide-react';
import { useStore } from '../../store';
import { WorkoutHistoryEntry } from '../../types';

const CARDIO_TYPES = [
  { id: 'esteira', name: 'Esteira', icon: '🏃', calsPerMin: 8, stepsPerMin: 140 },
  { id: 'bicicleta', name: 'Bicicleta', icon: '🚲', calsPerMin: 7, stepsPerMin: 0 },
  { id: 'eliptico', name: 'Elíptico', icon: '⛷️', calsPerMin: 9, stepsPerMin: 130 },
  { id: 'escada', name: 'Escada', icon: '🪜', calsPerMin: 11, stepsPerMin: 80 },
  { id: 'corrida_rua', name: 'Corrida na Rua', icon: '🛣️', calsPerMin: 10, stepsPerMin: 160 },
  { id: 'pular_corda', name: 'Pular Corda', icon: '➰', calsPerMin: 12, stepsPerMin: 150 },
];

export const CardioView: React.FC = () => {
  const { user, theme, updateUserProfile, triggerConfetti } = useStore();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const isTeste1 = user?.username.toLowerCase() === 'henrique' || theme === 'light';

  // Wake lock ref to keep screen on during cardio
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {}
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      if (interval) clearInterval(interval);
      releaseWakeLock();
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    if (!selectedType) return;
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedCardioData = selectedType ? CARDIO_TYPES.find(c => c.id === selectedType) : null;
  const estimatedCalories = selectedCardioData ? Math.floor((secondsElapsed / 60) * selectedCardioData.calsPerMin) : 0;
  const estimatedSteps = selectedCardioData ? Math.floor((secondsElapsed / 60) * selectedCardioData.stepsPerMin) : 0;

  const handleFinish = () => {
    if (!user || !selectedCardioData) return;

    const historyEntry: WorkoutHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      workoutId: 'cardio_only',
      workoutTitle: `Cardio: ${selectedCardioData.name}`,
      duration: secondsElapsed,
      exercises: [],
      cardio: {
        exercise: selectedCardioData.name,
        duration: Math.ceil(secondsElapsed / 60),
        completed: true
      }
    };

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const dateStr = now.toISOString().split('T')[0];
    const hasCheckedInToday = user.checkIns?.includes(dateStr);
    const newCheckIns = hasCheckedInToday ? user.checkIns : [...(user.checkIns || []), dateStr];

    updateUserProfile({
      history: [historyEntry, ...user.history],
      totalWorkouts: (user.totalWorkouts || 0) + 1,
      checkIns: newCheckIns,
      streak: hasCheckedInToday ? user.streak : (user.streak || 0) + 1
    });

    setIsActive(false);
    triggerConfetti();
    setShowSummary(true);
  };

  const resetCardio = () => {
    setSelectedType(null);
    setIsActive(false);
    setIsPaused(false);
    setSecondsElapsed(0);
    setShowSummary(false);
  };

  if (!user) return null;

  if (showSummary) {
    return (
      <div className={`w-full min-h-screen pt-12 sm:pt-6 flex flex-col justify-start pb-32 max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-1 bg-transparent select-none duration-300 ${isTeste1 ? 'text-zinc-950 font-black' : 'text-white'} p-4 text-center items-center gap-6`}>
        <div className={`p-6 rounded-[2rem] border shadow-2xl w-full max-w-sm flex flex-col items-center gap-4 ${isTeste1 ? 'bg-white border-zinc-200' : 'bg-[#0A1128] border-[#2563EB]/30'}`}>
          <div className="w-16 h-16 bg-green-500/10 text-green-500 flex items-center justify-center rounded-full mb-2">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Cardio Realizado!</h2>
          
          <div className="flex gap-4 w-full mt-4">
            <div className={`flex-1 rounded-2xl p-4 flex flex-col items-center border ${isTeste1 ? 'bg-zinc-50 border-zinc-100' : 'bg-black/20 border-white/5'}`}>
              <Timer size={20} className="text-blue-500 mb-2" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Tempo</span>
              <span className="text-lg font-mono font-black mt-1">{Math.ceil(secondsElapsed / 60)} min</span>
            </div>
            <div className={`flex-1 rounded-2xl p-4 flex flex-col items-center border ${isTeste1 ? 'bg-zinc-50 border-zinc-100' : 'bg-black/20 border-white/5'}`}>
              <Flame size={20} className="text-orange-500 mb-2" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Kcal</span>
              <span className="text-lg font-mono font-black mt-1">{estimatedCalories}</span>
            </div>
          </div>
          {estimatedSteps > 0 && (
            <div className={`w-full rounded-2xl p-4 flex justify-between items-center border -mt-2 ${isTeste1 ? 'bg-zinc-50 border-zinc-100' : 'bg-black/20 border-white/5'}`}>
              <div className="flex items-center gap-3">
                <Footprints size={20} className="text-emerald-500" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Passos</span>
              </div>
              <span className="text-lg font-mono font-black">{estimatedSteps}</span>
            </div>
          )}

          <button
            onClick={resetCardio}
            className={`mt-6 w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 ${
              isTeste1 ? 'bg-zinc-950 text-white' : 'bg-[#2563EB] text-white hover:brightness-110'
            }`}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen flex flex-col justify-start pt-12 sm:pt-6 px-3 pb-32 bg-transparent select-none font-sans ${isTeste1 ? 'text-zinc-950 font-black' : 'text-white'}`}>
      
      {/* HEADER */}
      <div className="space-y-1 px-1 shrink-0 mb-6 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTeste1 ? 'bg-blue-600/10 text-blue-600' : 'bg-accent/10 text-accent'} shrink-0`}>
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className={`text-xl font-black tracking-tighter uppercase leading-none ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-white'}`}>Central <span className={isTeste1 ? 'text-[#2563EB]' : 'text-accent'}>Cardio</span></h1>
          <p className={`${isTeste1 ? 'text-zinc-500 font-bold' : 'text-white/40'} text-[8px] mt-1 font-mono uppercase tracking-widest font-black`}>Supere Seus Limites</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 w-full space-y-6 px-1 flex flex-col"
          >
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3 ml-1">Modalidade</h3>
              <div className="grid grid-cols-2 gap-3">
                {CARDIO_TYPES.map((type) => {
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all active:scale-95 duration-200 ${
                        isSelected 
                          ? (isTeste1 ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md' : 'bg-accent text-[#050505] border-accent shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.3)]')
                          : (isTeste1 ? 'bg-white border-zinc-200 text-zinc-950 hover:bg-zinc-50' : 'bg-[#0c0c0e]/80 border-white/5 text-white/70 hover:border-white/10 hover:bg-[#121217]')
                      }`}
                    >
                      <span className="text-3xl filter drop-shadow-sm">{type.icon}</span>
                      <span className="text-xs font-bold leading-none tracking-tight">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto pt-6 flex-1 flex flex-col justify-end">
              <button
                onClick={handleStart}
                disabled={!selectedType}
                className={`w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 ${
                  isTeste1 ? 'bg-zinc-950 text-white active:scale-[0.98]' : 'bg-accent text-[#050505] active:scale-[0.98] hover:brightness-110'
                }`}
              >
                <Play size={16} className="fill-current" />
                Iniciar Sessão
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex-1 w-full flex flex-col items-center justify-center gap-10 rounded-[2.5rem] border p-8 relative overflow-hidden shadow-2xl ${
              isTeste1 ? 'bg-white border-zinc-200' : 'bg-gradient-to-br from-[#0c0c0e] to-[#050505] border-white/10'
            }`}
          >
            {/* Animated Background Pulse */}
            {!isPaused && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute w-64 h-64 rounded-full blur-3xl pointer-events-none ${isTeste1 ? 'bg-blue-400/20' : 'bg-accent/20'}`}
              />
            )}

            <div className="flex flex-col items-center gap-2 z-10">
              <span className="text-5xl drop-shadow-md">{selectedCardioData!.icon}</span>
              <h2 className={`text-lg font-black uppercase tracking-tight ${isTeste1 ? 'text-zinc-500' : 'text-white/60'}`}>
                {selectedCardioData!.name}
              </h2>
            </div>
            
            <div className={`text-7xl font-mono font-black tabular-nums tracking-tighter drop-shadow-lg z-10 ${isPaused ? 'opacity-50' : ''}`}>
              {formatTime(secondsElapsed)}
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-[240px] z-10">
              <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${isTeste1 ? 'bg-zinc-50 border-zinc-100' : 'bg-white/5 border-white/5'}`}>
                <Flame size={18} className="text-orange-500 mb-1" />
                <span className="text-xl font-black font-mono leading-none">{estimatedCalories}</span>
                <span className={`text-[8px] uppercase tracking-widest font-bold mt-1 ${isTeste1 ? 'text-zinc-400' : 'text-white/40'}`}>Kcal</span>
              </div>
              {selectedCardioData?.stepsPerMin && selectedCardioData.stepsPerMin > 0 ? (
                <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${isTeste1 ? 'bg-zinc-50 border-zinc-100' : 'bg-white/5 border-white/5'}`}>
                  <Footprints size={18} className="text-emerald-500 mb-1" />
                  <span className="text-xl font-black font-mono leading-none">{estimatedSteps}</span>
                  <span className={`text-[8px] uppercase tracking-widest font-bold mt-1 ${isTeste1 ? 'text-zinc-400' : 'text-white/40'}`}>Passos</span>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${isTeste1 ? 'bg-zinc-50 border-zinc-100' : 'bg-white/5 border-white/5'}`}>
                  <Timer size={18} className="text-blue-500 mb-1" />
                  <span className="text-xl font-black font-mono leading-none">{Math.ceil(secondsElapsed / 60)}</span>
                  <span className={`text-[8px] uppercase tracking-widest font-bold mt-1 ${isTeste1 ? 'text-zinc-400' : 'text-white/40'}`}>Min</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 z-10">
              <button
                onClick={handlePauseToggle}
                className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-lg transition-all active:scale-95 ${
                  isTeste1 
                    ? 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50' 
                    : 'bg-[#121217] border-white/10 text-white hover:bg-white/5'
                }`}
              >
                {isPaused ? <Play size={24} className="fill-current ml-1" /> : <Pause size={24} className="fill-current" />}
              </button>

              <button
                onClick={handleFinish}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                  isTeste1 
                    ? 'bg-zinc-950 text-white shadow-zinc-900/20' 
                    : 'bg-accent text-[#050505] shadow-accent/20'
                }`}
              >
                <Square size={20} className="fill-current" />
              </button>
            </div>
            
            {isPaused && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-orange-500/20 text-orange-500 border border-orange-500/30 px-3 py-1.5 rounded-full z-20">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest font-mono">Pausado</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
