
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Exercise, SetPerformance } from '../types';
import { 
  ChevronDown, 
  Timer, 
  CheckCircle2, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  Check, 
  Play, 
  RotateCcw,
  X,
  Plus,
  Minus,
  Info,
  Trophy,
  PlayCircle,
  ExternalLink,
  Search
} from 'lucide-react';

interface ExerciseItemProps {
  exercise: Exercise;
  onSaveProgress: (exerciseId: string, performance: SetPerformance[]) => void;
  savedWeight?: number;
  initialPerformance?: SetPerformance[];
  lastPerformance?: SetPerformance[];
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({ 
  exercise, 
  onSaveProgress, 
  savedWeight,
  initialPerformance,
  lastPerformance
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const timerRef = useRef<number | null>(null);

  const [performance, setPerformance] = useState<SetPerformance[]>(() => {
    if (initialPerformance && initialPerformance.length > 0) return initialPerformance;
    
    return new Array(exercise.sets).fill(null).map(() => ({
      weight: savedWeight || 0,
      reps: parseInt(exercise.reps) || 0,
      completed: false
    }));
  });

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
    }
    return url;
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio context not supported", e);
    }
  };

  useEffect(() => {
    if (restTimeLeft !== null && restTimeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setRestTimeLeft(restTimeLeft - 1);
      }, 1000);
    } else if (restTimeLeft === 0) {
      if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
      playBeep();
      setRestTimeLeft(null);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [restTimeLeft]);

  const startRestTimer = (seconds?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRestTimeLeft(seconds || exercise.rest);
  };

  const cancelRestTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRestTimeLeft(null);
  };

  const handleVibrate = (ms = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const updateSet = (index: number, updates: Partial<SetPerformance>) => {
    const newPerf = [...performance];
    newPerf[index] = { ...newPerf[index], ...updates };
    setPerformance(newPerf);
    onSaveProgress(exercise.id, newPerf);
    
    if (updates.completed) {
      handleVibrate(15);
      
      const allDone = newPerf.every(p => p.completed);
      if (allDone) {
        setIsFinishing(true);
        triggerLocalConfetti();
        setTimeout(() => {
          setIsFinishing(false);
          setIsOpen(false);
        }, 1200);
      } else {
        // Auto-Rest Timer: 60 seconds
        startRestTimer(60);
      }
    }
  };

  const triggerLocalConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#10b981', '#34d399', '#ffffff'],
      disableForReducedMotion: true
    });
  };

  const adjustValue = (index: number, key: 'weight' | 'reps', delta: number) => {
    const currentVal = performance[index][key] || 0;
    const newVal = Math.max(0, currentVal + delta);
    updateSet(index, { [key]: newVal });
  };

  const allSetsDone = performance.every(p => p.completed);
  const completedCount = performance.filter(p => p.completed).length;

  const isImageUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith('data:image/') || 
           url.toLowerCase().endsWith('.gif') || 
           url.toLowerCase().endsWith('.jpg') || 
           url.toLowerCase().endsWith('.jpeg') || 
           url.toLowerCase().endsWith('.png') || 
           url.toLowerCase().endsWith('.webp');
  };

  return (
    <div className={`glass-card rounded-2xl transition-all duration-500 overflow-hidden relative ${
      isOpen 
      ? 'shadow-2xl' 
      : 'border-line/50'
    } ${allSetsDone && !isOpen ? 'opacity-40 translate-x-2' : 'opacity-100'}`}>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-black italic tracking-tighter leading-none truncate transition-colors duration-300 ${allSetsDone ? 'text-accent' : 'text-ink'}`}>
              {exercise.name.toUpperCase()}
            </h3>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-[9px] font-black text-secondary uppercase tracking-widest">{exercise.sets} SETS</span>
               <div className="w-1 h-1 rounded-full bg-line"></div>
               <span className="text-[9px] font-black text-secondary uppercase tracking-widest">{exercise.reps} REPS</span>
               {allSetsDone && (
                 <span className="text-[8px] font-black text-accent uppercase tracking-widest ml-auto flex items-center gap-1"><Check size={8} strokeWidth={4}/> CONCLUÍDO</span>
               )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className={`w-7 h-7 rounded-full border border-line flex items-center justify-center transition-all ${isOpen ? 'rotate-180 bg-accent text-white border-accent' : 'text-secondary'}`}>
             <ChevronDown size={14} strokeWidth={3} />
           </div>
        </div>
      </div>
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 border-t border-line' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>
        <div className="px-4 pb-6 pt-5 space-y-6">
          <div className="flex items-center justify-between bg-ink/[0.02] p-3 rounded-xl border border-line">
             <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${restTimeLeft !== null ? 'bg-highlight text-white' : 'bg-ink/[0.03] text-secondary'}`}>
                   <Timer size={18} strokeWidth={2.5} />
                </div>
                <div>
                   <p className="text-[8px] font-black text-secondary uppercase tracking-widest leading-none mb-1">Descanso</p>
                   <p className="text-lg font-black text-ink font-mono leading-none">{restTimeLeft !== null ? `${restTimeLeft}s` : `${exercise.rest}s`}</p>
                </div>
             </div>
             <button onClick={restTimeLeft !== null ? cancelRestTimer : () => startRestTimer()} className={`px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${restTimeLeft !== null ? 'bg-ink/[0.03] text-secondary' : 'bg-highlight text-white shadow-lg'}`}>
                {restTimeLeft !== null ? 'PARAR' : 'INICIAR'}
             </button>
          </div>

          <div className="space-y-2">
            {lastPerformance && lastPerformance.length > 0 && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-3 bg-accent/5 rounded-lg border border-accent/10">
                <span className="text-[8px] font-black text-accent uppercase tracking-widest">Carga Anterior</span>
                <span className="text-[9px] font-mono font-bold text-accent italic">
                  {lastPerformance.map(p => `${p.weight}kg x ${p.reps}`).join(' | ')}
                </span>
              </div>
            )}
            {performance.map((set, idx) => (
              <div key={idx} className={`grid grid-cols-12 items-center gap-2 p-1.5 rounded-xl border transition-all duration-300 ${set.completed ? 'bg-accent/5 border-accent/30' : 'bg-transparent border-line'}`}>
                <div className="col-span-1 flex items-center justify-center font-mono text-[9px] font-black text-secondary">
                  {idx + 1}
                </div>
                
                <div className="col-span-4 h-10 relative">
                   <input 
                      type="number" 
                      inputMode="decimal"
                      value={set.weight === 0 ? '' : set.weight} 
                      disabled={set.completed} 
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateSet(idx, { weight: parseFloat(e.target.value) || 0 })} 
                      className="w-full h-full bg-ink/[0.03] border border-line rounded-lg text-center text-sm font-bold text-ink outline-none focus:border-accent transition-all font-mono"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-secondary pointer-events-none">KG</span>
                </div>

                <div className="col-span-4 h-10 relative">
                    <input 
                      type="number" 
                      inputMode="decimal" 
                      value={set.reps === 0 ? '' : set.reps} 
                      disabled={set.completed} 
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateSet(idx, { reps: parseInt(e.target.value) || 0 })} 
                      className="w-full h-full bg-ink/[0.03] border border-line rounded-lg text-center text-sm font-bold text-ink outline-none focus:border-accent transition-all font-mono"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-secondary pointer-events-none">REPS</span>
                </div>

                <div className="col-span-3 flex items-center justify-end pr-2">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateSet(idx, { completed: !set.completed })} 
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      set.completed 
                      ? 'bg-accent text-white shadow-lg' 
                      : 'bg-ink/[0.03] border border-line text-secondary hover:text-ink'
                    }`}
                  >
                    <Check size={18} strokeWidth={4} />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-2">
             <p className="text-[10px] font-black italic text-secondary leading-relaxed uppercase tracking-widest text-center opacity-60">
                {exercise.notes || 'Mantenha cadência controlada e foco total na contração.'}
             </p>
             <a 
               href={`https://www.google.com/search?q=gif+execução+exercicio+${encodeURIComponent(exercise.name)}`}
               target="_blank"
               rel="noopener noreferrer"
               className="text-[9px] font-black text-accent hover:brightness-110 transition-all uppercase tracking-[0.2em] text-center"
             >
               Ver tutorial técnico
             </a>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowVideo(false)}></div>
          <div className="relative w-full max-w-4xl bg-bg rounded-[2.5rem] border border-line overflow-hidden shadow-2xl animate-slide-up transition-colors duration-400">
            <div className="flex items-center justify-between p-6 border-b border-line">
               <div>
                 <h2 className="text-xl font-black text-ink uppercase tracking-tight">{exercise.name}</h2>
                 <p className="text-[10px] font-black text-accent uppercase tracking-widest">Guia de Execução</p>
               </div>
               <button onClick={() => setShowVideo(false)} className="w-10 h-10 glass-card text-secondary rounded-full flex items-center justify-center hover:text-ink transition-colors">
                 <X size={20} />
               </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {exercise.videoUrl?.includes('embed') || exercise.videoUrl?.includes('youtube') || exercise.videoUrl?.includes('youtu.be') ? (
                <iframe 
                  src={getEmbedUrl(exercise.videoUrl)} 
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-ink/[0.03] p-8 text-center">
                  <Search size={48} className="text-secondary/50" />
                  <div>
                    <p className="text-ink font-black uppercase tracking-widest mb-2">Vídeo não disponível</p>
                    <p className="text-secondary text-xs font-medium max-w-xs mx-auto">
                      Não encontramos um vídeo direto para este exercício, mas você pode buscar no Google.
                    </p>
                  </div>
                  <a 
                    href={`https://www.google.com/search?q=gif+execução+exercicio+${encodeURIComponent(exercise.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent/20"
                  >
                    Buscar no Google
                  </a>
                </div>
              )}
            </div>
            <div className="p-6 bg-white/5">
               <p className="text-secondary text-sm font-medium leading-relaxed italic">
                 {exercise.notes || 'Siga as orientações do vídeo para garantir a melhor técnica e evitar lesões.'}
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
