import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  Play, 
  LayoutDashboard, 
  Quote, 
  Camera, 
  Download, 
  Trash2, 
  Dumbbell, 
  Timer, 
  Wind, 
  X, 
  Shield, 
  Plus, 
  Minus, 
  Check, 
  Flame, 
  Pause, 
  SkipForward 
} from 'lucide-react';
import { SetPerformance, WorkoutHistoryEntry, AppTab, Exercise } from '../../types';
import confetti from 'canvas-confetti';

export const WorkoutView: React.FC = () => {
  const { 
    selectedWorkout, 
    user, 
    showSummary, 
    isWorkoutActive, 
    elapsedTime, 
    currentSessionProgress,
    currentCardioProgress,
    workoutDuration,
    setIsWorkoutActive,
    setWorkoutStartTime,
    setElapsedTime,
    setCurrentSessionProgress,
    setCurrentCardioProgress,
    setShowSummary,
    setLastWorkoutVolume,
    setWorkoutDuration,
    updateUserProfile,
    triggerConfetti,
    setActiveTab,
    setSelectedWorkout,
    workoutStartTime
  } = useStore();

  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  
  // Cardio and Modal States
  const [showCardioModal, setShowCardioModal] = React.useState(false);
  const [cardioInput, setCardioInput] = React.useState({ exercise: 'Esteira', duration: 15 });
  const [activeModalExercise, setActiveModalExercise] = React.useState<Exercise | null>(null);
  
  // Modal Rest Timer states
  const [modalRestTimeLeft, setModalRestTimeLeft] = React.useState<number | null>(null);
  const [isModalRestPaused, setIsModalRestPaused] = React.useState<boolean>(false);
  
  // Success animation state
  const [exerciseCompletedSuccess, setExerciseCompletedSuccess] = React.useState<boolean>(false);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.message?.includes('permissions policy')) {
          console.warn('[WakeLock] Screen Wake Lock is disallowed by permissions policy (normal inside sandbox iframes). Running without wake lock.');
        } else {
          console.warn('[WakeLock] Could not acquire Screen Wake Lock:', err.message);
        }
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err: any) {
        console.warn('[WakeLock] Could not release Screen Wake Lock:', err.message);
      }
    }
  };

  useEffect(() => {
    if (isWorkoutActive && workoutStartTime) {
      requestWakeLock();
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
      }, 1000);
    } else {
      releaseWakeLock();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      releaseWakeLock();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isWorkoutActive, workoutStartTime, setElapsedTime]);

  // Modal Rest Timer Countdown
  useEffect(() => {
    if (modalRestTimeLeft !== null && modalRestTimeLeft > 0 && !isModalRestPaused) {
      const countdown = setTimeout(() => {
        setModalRestTimeLeft(modalRestTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    } else if (modalRestTimeLeft === 0) {
      handleVibrate(250);
      playBeep();
      setModalRestTimeLeft(null);
    }
  }, [modalRestTimeLeft, isModalRestPaused]);

  if (!selectedWorkout || !user) return null;

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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  const handleVibrate = (ms = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const startWorkout = () => {
    handleVibrate(20);
    setIsWorkoutActive(true);
    setWorkoutStartTime(Date.now());
    setElapsedTime(0);
  };

  const calculateVolume = () => {
    let total = 0;
    (Object.values(currentSessionProgress) as SetPerformance[][]).forEach((perf) => {
      if (perf) {
        perf.filter(p => p.completed).forEach(p => {
          total += (p.weight * p.reps);
        });
      }
    });
    return total;
  };

  const handleFinishWorkout = () => {
    if (!selectedWorkout || !user || !workoutStartTime) return;
    const today = new Date().toISOString().split('T')[0];
    const volume = calculateVolume();
    setLastWorkoutVolume(volume);
    
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    setWorkoutDuration(duration);
    setIsWorkoutActive(false);

    const historyEntry: WorkoutHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      workoutId: selectedWorkout.id,
      workoutTitle: selectedWorkout.title,
      duration: duration,
      exercises: selectedWorkout.exercises.map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        performance: currentSessionProgress[ex.id] || []
      })),
      cardio: currentCardioProgress ? { ...currentCardioProgress } : undefined
    };

    const newWeights: Record<string, number> = { ...(user.weights || {}) };
    
    Object.entries(currentSessionProgress).forEach(([id, perf]) => {
      const p = perf as SetPerformance[];
      const lastWeight = p.filter(item => item.completed).reverse()[0]?.weight;
      if (lastWeight) newWeights[id] = lastWeight;
    });

    const newCheckIns = user.checkIns.includes(today) ? user.checkIns : [...user.checkIns, today];
    
    updateUserProfile({ 
      history: [historyEntry, ...user.history],
      totalWorkouts: (user.totalWorkouts || 0) + 1,
      weights: newWeights,
      checkIns: newCheckIns,
      streak: (user.streak || 0) + 1
    });

    triggerConfetti();
    localStorage.removeItem(`tatugym_active_session_${user.username.toLowerCase()}`);
    setShowSummary(true);
  };

  const closeSummary = () => {
    setCapturedImage(null);
    setShowSummary(false);
    setSelectedWorkout(null);
    setCurrentSessionProgress({});
    setCurrentCardioProgress(null);
    setWorkoutStartTime(null);
    setWorkoutDuration(null);
    setElapsedTime(0);
    setIsWorkoutActive(false);
    setActiveTab(AppTab.DASHBOARD);
  };

  const exitWorkout = () => {
      setSelectedWorkout(null);
      setShowSummary(false);
      setActiveTab(AppTab.DASHBOARD);
  };

  const cancelWorkout = () => {
    if(confirm('Tem certeza que deseja descartar este treino? Todo o progresso desta sessão será perdido.')) { 
      if (user) {
        localStorage.removeItem(`tatugym_active_session_${user.username.toLowerCase()}`);
      }
      setSelectedWorkout(null);
      setCurrentSessionProgress({});
      setCurrentCardioProgress(null);
      setWorkoutStartTime(null);
      setElapsedTime(0);
      setIsWorkoutActive(false);
      setActiveTab(AppTab.DASHBOARD);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadSummaryImage = () => {
    if (!canvasRef.current || !capturedImage) return;
    setIsGeneratingImage(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = capturedImage;

    img.onload = () => {
      // Set canvas size to match image or a standard social media size
      const targetWidth = 1080;
      const targetHeight = 1350; // 4:5 aspect ratio
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw background image (proportional crop)
      const imgAspect = img.width / img.height;
      const targetAspect = targetWidth / targetHeight;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > targetAspect) {
        drawH = targetHeight;
        drawW = targetHeight * imgAspect;
        drawX = (targetWidth - drawW) / 2;
        drawY = 0;
      } else {
        drawW = targetWidth;
        drawH = targetWidth / imgAspect;
        drawX = 0;
        drawY = (targetHeight - drawH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Dark Overlay at bottom for better readability
      const gradient = ctx.createLinearGradient(0, targetHeight * 0.4, 0, targetHeight);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.7, 'rgba(0,0,0,0.6)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, targetHeight * 0.4, targetWidth, targetHeight * 0.6);

      // Add "HORUS TRAINING" Branding (TOP LEFT)
      ctx.font = '900 40px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText('HORUS TRAINING', 60, 100);
      
      // Accent Line
      // Use global accent color instead of hardcoded neon
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(60, 115, 60, 8);

      // Infer Focus
      const focusText = selectedWorkout.title.toLowerCase().includes('superior') ? 'SUPERIORES' :
                        selectedWorkout.title.toLowerCase().includes('inferior') || selectedWorkout.title.toLowerCase().includes('perna') ? 'INFERIORES' :
                        selectedWorkout.title.toLowerCase().includes('cardio') || selectedWorkout.title.toLowerCase().includes('aeró') ? 'AERÓBICO' :
                        selectedWorkout.title.toLowerCase().includes('abd') ? 'ABDÔMEN' : 'COMPLETO';

      // Focus Tag (BOTTOM)
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = '#EC4899';
      ctx.fillText(focusText, 60, targetHeight - 480);

      // Add Workout Title
      ctx.font = 'italic 900 90px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(selectedWorkout.title.toUpperCase(), 60, targetHeight - 380);

      // Stats Label
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('DURAÇÃO TOTAL', 60, targetHeight - 270);

      // Elapsed Time
      ctx.font = '900 120px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(workoutDuration ? formatTime(workoutDuration) : '00:00', 60, targetHeight - 150);

      // PRO PERFORMANCE branding (BOTTOM RIGHT)
      ctx.save();
      ctx.translate(targetWidth - 60, targetHeight - 150);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '900 20px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.textAlign = 'right';
      ctx.fillText('PRO PERFORMANCE', 0, 0);
      ctx.restore();

      // Trigger download
      const link = document.createElement('a');
      link.download = `horus-fit-victory-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsGeneratingImage(false);
      handleVibrate(30);
    };
  };

  // Helper config mapping from title
  const getWorkoutFocus = (workout: any) => {
    const groups = Array.from(new Set(workout.exercises.map((ex: any) => ex.muscleGroup)))
      .filter(g => g && (g as string).toLowerCase() !== 'manguito')
      .map(g => (g as string).toUpperCase());
    
    if (groups.length > 0) {
      return groups.join(', ');
    }
    return workout.title.replace(/Treino\s+[A-Z]\s*-\s*/i, '').toUpperCase();
  };

  // Safe fetch of exercise performances in this session
  const getExercisePerformance = (ex: Exercise): SetPerformance[] => {
    if (currentSessionProgress[ex.id] && currentSessionProgress[ex.id].length > 0) {
      return currentSessionProgress[ex.id];
    }
    return new Array(ex.sets).fill(null).map(() => ({
      weight: user.weights?.[ex.id] || 0,
      reps: parseInt(ex.reps) || 10,
      completed: false
    }));
  };

  // Update set value and handle complete toggling transitions
  const handleUpdateModalSet = (exerciseId: string, setIndex: number, updates: Partial<SetPerformance>) => {
    const currentEx = selectedWorkout.exercises.find(e => e.id === exerciseId);
    if (!currentEx) return;

    const currentSets = getExercisePerformance(currentEx);
    const updatedSets = [...currentSets];
    
    // Copy weight and reps from the first set to subsequent uncompleted sets automatically
    if (setIndex === 0) {
      const cascadeUpdates: Partial<SetPerformance> = {};
      if (updates.weight !== undefined) cascadeUpdates.weight = updates.weight;
      if (updates.reps !== undefined) cascadeUpdates.reps = updates.reps;
      
      for (let i = 1; i < updatedSets.length; i++) {
        if (!updatedSets[i].completed) {
          updatedSets[i] = { ...updatedSets[i], ...cascadeUpdates };
        }
      }
    }

    updatedSets[setIndex] = { ...updatedSets[setIndex], ...updates };

    // Emit live to store progress (autosaves natively)
    setCurrentSessionProgress({
      ...currentSessionProgress,
      [exerciseId]: updatedSets
    });

    if (updates.completed) {
      handleVibrate(20);
      const allDone = updatedSets.every(s => s.completed);
      if (allDone) {
        triggerLocalConfetti();
        setExerciseCompletedSuccess(true);
        setModalRestTimeLeft(null);
        setTimeout(() => {
          setExerciseCompletedSuccess(false);
          setActiveModalExercise(null);
        }, 1500);
      } else {
        // Automate rest timer with exercise rest or fallback 60s
        setModalRestTimeLeft(currentEx.rest || 60);
        setIsModalRestPaused(false);
      }
    } else if (updates.completed === false) {
      // Clear rest countdown
      setModalRestTimeLeft(null);
    }
  };

  // Steppers functions
  const handleModifyWeight = (exerciseId: string, setIndex: number, delta: number) => {
    const currentEx = selectedWorkout.exercises.find(e => e.id === exerciseId);
    if (!currentEx) return;
    const sets = getExercisePerformance(currentEx);
    const updated = Math.max(0, sets[setIndex].weight + delta);
    handleUpdateModalSet(exerciseId, setIndex, { weight: updated });
  };

  const handleModifyReps = (exerciseId: string, setIndex: number, delta: number) => {
    const currentEx = selectedWorkout.exercises.find(e => e.id === exerciseId);
    if (!currentEx) return;
    const sets = getExercisePerformance(currentEx);
    const updated = Math.max(0, sets[setIndex].reps + delta);
    handleUpdateModalSet(exerciseId, setIndex, { reps: updated });
  };

  // Local confetti exploder
  const triggerLocalConfetti = () => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: [getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#00D2FF', '#00FF95', '#ffffff'],
      disableForReducedMotion: true
    });
  };

  const getNextSetLabelForTimer = (ex: Exercise) => {
    const sets = currentSessionProgress[ex.id] || [];
    const nextSetIdx = sets.findIndex(s => !s.completed);
    if (nextSetIdx !== -1) {
      return `SÉRIE ${nextSetIdx + 1}`;
    }
    return `SÉRIE FINAL`;
  };

  const openExerciseModal = (ex: Exercise) => {
    setActiveModalExercise(ex);
  };

  const trackingTextPlaceholder = (ex: Exercise) => {
    const name = ex.name.toLowerCase();
    if (name.includes('manguito')) {
      return "Excelente para estabilização articular antes das cargas pesadas.";
    } else if (name.includes('supino')) {
      return "Foco no alongamento completo na descida para maximizar fibras musculares.";
    } else if (name.includes('elevação') || name.includes('lateral')) {
      return "Mantenha o vetor de força lateralizado sem balançar o tronco superior.";
    }
    return "Mantenha a cadência de contração ativa de forma linear e controlada.";
  };

  const coachingInstructions = (ex: Exercise) => {
    const name = ex.name.toLowerCase();
    if (name.includes('manguito')) {
      return "Mantenha o cotovelo colado ao tronco e faça o arco de rotação bem controlado.";
    } else if (name.includes('supino')) {
      return "Mantenha as escápulas retraídas e empurre os cotovelos para dentro na subida.";
    } else if (name.includes('tríceps') || name.includes('triceps')) {
      return "Mantenha os ombros travados para trás e use o cotovelo unicamente como pivô natural.";
    }
    return "Contraia o abdômen para estabilizar a postura de coluna durante toda a série.";
  };

  if (showSummary) {
    return (
      <div className="h-full max-h-full overflow-hidden flex flex-col justify-between py-2 px-1 text-center bg-transparent text-white font-sans antialiased selection:bg-accent/30 select-none w-full max-w-sm md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto space-y-2">
          
          {/* HEADER COMPACTO */}
          <div className="flex items-center gap-3 bg-[#0c0c0c]/90 border border-white/5 p-3 rounded-xl shrink-0 shadow-sm">
            <div className="w-9 h-9 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent shrink-0">
              <CheckCircle2 size={18} className="text-accent" strokeWidth={3} />
            </div>
            <div className="text-left leading-none">
              <h1 className="text-base font-[950] text-white uppercase tracking-tight italic">Missão <span className="text-accent">Cumprida!</span></h1>
              <p className="text-white/40 text-[8px] mt-1 uppercase tracking-widest font-mono font-black">REGISTRO SALVO COM SUCESSO</p>
            </div>
          </div>

          {" "}
          {/* FOTO DE VITÓRIA EXTRA COMPACTA */}
          <div className="bg-[#0c0c0c]/90 border border-white/5 p-2 rounded-xl space-y-2 shrink-0 shadow-sm">
            <div className="flex items-center justify-between px-1.5">
               <span className="text-[8px] font-black text-white/45 uppercase tracking-widest font-mono">Foto de Vitória</span>
               {capturedImage && (
                 <button onClick={() => setCapturedImage(null)} className="text-white/40 hover:text-red-500 transition-colors">
                    <Trash2 size={12} />
                 </button>
               )}
            </div>
            
            {!capturedImage ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border border-dashed border-white/10 hover:border-accent/30 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all bg-white/[0.01] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
                  <Camera size={14} className="text-accent" />
                </div>
                <p className="text-[8px] font-black text-accent/90 uppercase tracking-widest">Registrar Vitória</p>
              </button>
            ) : (
              <div className="space-y-1.5">
                <div className="relative group rounded-xl overflow-hidden border border-white/10 h-28">
                  <img src={capturedImage} alt="Victory" className="w-full h-full object-cover" />
                  
                  <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
                    <div className="text-left font-black leading-none">
                      <p className="text-white font-[950] text-xs tracking-tighter uppercase">HORUS TRAINING</p>
                      <div className="w-6 h-0.5 bg-accent mt-1"></div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <div>
                        <p className="text-accent font-[900] text-[7px] uppercase tracking-widest leading-none">
                          {selectedWorkout.title.toLowerCase().includes('superior') ? 'SUPERIORES' :
                           selectedWorkout.title.toLowerCase().includes('inferior') || selectedWorkout.title.toLowerCase().includes('perna') ? 'INFERIORES' :
                           selectedWorkout.title.toLowerCase().includes('cardio') || selectedWorkout.title.toLowerCase().includes('aeró') ? 'AERÓBICO' :
                           selectedWorkout.title.toLowerCase().includes('abd') ? 'ABDÔMEN' : 'COMPLETO'}
                        </p>
                        <h2 className="text-white font-black text-xs tracking-tight uppercase italic leading-none mt-0.5 truncate">{selectedWorkout.title}</h2>
                      </div>

                      <div className="flex items-end justify-between leading-none">
                        <div className="text-left">
                          <p className="text-white/40 text-[6.5px] font-black uppercase tracking-widest">DURAÇÃO TOTAL</p>
                          <p className="text-sm font-black text-white font-mono mt-0.5">
                            {workoutDuration ? formatTime(workoutDuration) : '00:00'}
                          </p>
                        </div>
                        <div className="text-white/20 text-[6px] font-mono font-black uppercase tracking-widest whitespace-nowrap">
                          PRO PERFORMANCE
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"></div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                     <button 
                       onClick={downloadSummaryImage}
                       disabled={isGeneratingImage}
                       className="w-9 h-9 rounded-full bg-accent text-black flex items-center justify-center shadow-lg active:scale-95 transition-all"
                     >
                       {isGeneratingImage ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <Download size={16} />}
                     </button>
                  </div>
                </div>

                <motion.button 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={downloadSummaryImage}
                  disabled={isGeneratingImage}
                  className="w-full py-1.5 bg-accent/10 border border-accent/20 text-accent font-black text-[8px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
                >
                  {isGeneratingImage ? (
                    <>GERANDO... <div className="w-2.5 h-2.5 border border-accent/30 border-t-accent rounded-full animate-spin"></div></>
                  ) : (
                    <>SALVAR NA GALERIA <Download size={10} /></>
                  )}
                </motion.button>
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageCapture} 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* METRICAS DE PERFORMANCE EXTRA COMPACTAS */}
          <div className="grid grid-cols-2 gap-2 mt-1 shrink-0">
             <div className="bg-[#0c0c0c]/80 border border-white/5 p-2 rounded-xl flex items-center justify-between gap-1 shadow-sm font-sans text-left">
                <div className="leading-none min-w-0">
                   <p className="text-[7.5px] font-black text-white/40 uppercase tracking-widest font-mono truncate">DURAÇÃO</p>
                   <span className="text-xs font-black text-white font-mono mt-0.5 block italic">{workoutDuration ? formatTime(workoutDuration) : '00:00'}</span>
                </div>
                <Clock size={14} className="text-accent shrink-0" />
             </div>
             
             {currentCardioProgress ? (
                <div className="bg-[#0c0c0c]/80 border border-white/5 p-2 rounded-xl flex items-center justify-between gap-1 shadow-sm font-sans text-left">
                   <div className="leading-none min-w-0">
                      <p className="text-[7.5px] font-black text-white/40 uppercase tracking-widest font-mono truncate">AERÓBICO</p>
                      <span className="text-xs font-black text-white font-mono mt-0.5 block italic truncate">{currentCardioProgress.duration}m ({currentCardioProgress.exercise})</span>
                   </div>
                   <Wind size={14} className="text-accent shrink-0" />
                </div>
             ) : (
                <div className="bg-[#0c0c0c]/80 border border-white/5 p-2 rounded-xl flex items-center justify-between gap-1 shadow-sm font-sans text-left">
                   <div className="leading-none min-w-0">
                      <p className="text-[7.5px] font-black text-white/40 uppercase tracking-widest font-mono truncate">CARGATONELADA (VOL)</p>
                      <span className="text-xs font-black text-white font-mono mt-0.5 block italic">{calculateVolume()} kg</span>
                   </div>
                   <Dumbbell size={14} className="text-accent shrink-0" />
                </div>
             )}
          </div>

          {/* MOTIVAÇÃO EXTRA SLIM */}
          <div className="bg-[#0c0c0c]/90 border border-white/5 py-1.5 px-3 rounded-lg shrink-0">
             <p className="text-accent font-bold italic text-[8.5px] uppercase tracking-wider">
               "A constância é a mãe da evolução. Parabéns por hoje!"
             </p>
          </div>

          {/* BOTÃO VOLTAR PARA O DASHBOARD */}
          <div className="shrink-0 pt-1">
            <button 
              onClick={closeSummary} 
              className="w-full bg-accent hover:bg-accent/90 text-[#050505] font-[950] py-3.5 rounded-xl shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.25)] text-center active:scale-95 text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 font-sans shrink-0"
            >
              <LayoutDashboard size={14} /> VOLTAR PARA O DASHBOARD
            </button>
          </div>
      </div>
    );
  }

  // Calculate global statistics
  const totalSets = selectedWorkout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = selectedWorkout.exercises.reduce((acc, ex) => {
    const perf = currentSessionProgress[ex.id] || [];
    return acc + perf.filter(p => p.completed).length;
  }, 0);

  return (
    <div className="h-full max-h-full overflow-hidden flex flex-col justify-between pb-1.5 w-full max-w-sm md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-1 bg-transparent select-none">
      {/* Upper Navigation Header */}
      <header className="flex items-center justify-between py-1.5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={exitWorkout} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-all bg-[#0c0c0c]/80 border border-white/5 rounded-xl active:scale-95">
            <ChevronLeft size={16}/>
          </button>
          <div className="min-w-0">
            <h1 className="text-xs font-black text-white italic truncate leading-none uppercase tracking-tight">{selectedWorkout.title}</h1>
            {isWorkoutActive && (
              <span className="text-[7.5px] font-black text-white/40 mt-0.5 block tracking-wider uppercase leading-none">SESSÃO EM ANDAMENTO ⏱️</span>
            )}
          </div>
        </div>

        {isWorkoutActive && (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="px-2 py-1 bg-[#0c0c0c]/80 border border-white/5 rounded-lg font-mono text-xs font-black tracking-tight text-white leading-none">
              {formatTime(elapsedTime)}
            </div>
            <button 
              onClick={handleFinishWorkout}
              className="px-2.5 py-1.5 bg-accent text-black font-black text-[8px] tracking-wider uppercase rounded-lg hover:brightness-110 active:scale-95 transition-all font-sans leading-none"
            >
              SALVAR
            </button>
          </div>
        )}
      </header>

      {/* Selected Workout Upper Banner matching attachment 1 */}
      <div className="relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-zinc-950/90 to-zinc-900/50 p-3 text-center space-y-2 shadow-lg shrink-0 mt-1.5 ">
        {/* Play Icon centering frame */}
        <div className="mx-auto w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <Play size={14} className="fill-accent ml-0.5" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xs font-black italic tracking-tight text-white/60 uppercase leading-none">
            TREINO SELECIONADO: <span className="text-white font-[950] italic">{getWorkoutFocus(selectedWorkout)}</span>
          </h2>
        </div>

        {/* Action Button inside banner */}
        <div className="flex justify-center pt-0.5">
          {isWorkoutActive ? (
            <div className="flex gap-2 w-full max-w-xs justify-center">
              <div className="flex-1 py-1 px-2 rounded-lg bg-zinc-950/60 border border-white/5 text-center flex flex-col justify-center leading-none">
                <span className="text-[6.5px] font-black text-white/40 uppercase tracking-[0.1em] font-sans">TEMPO ATIVO DE SESSÃO</span>
                <span className="text-sm font-black text-white font-mono leading-none tracking-tight animate-pulse">{formatTime(elapsedTime)}</span>
              </div>
              <button 
                onClick={handleFinishWorkout}
                className="flex-1 py-2 bg-accent hover:brightness-110 text-black font-black text-[9px] uppercase tracking-wider rounded-lg active:scale-95 transition-all shadow-md leading-none"
              >
                FINALIZAR SESSÃO 🏆
              </button>
            </div>
          ) : (
            <button 
              onClick={startWorkout}
              className="w-full max-w-xs py-3 bg-accent hover:brightness-110 text-[#050505] font-black text-[10px] uppercase tracking-[0.15em] rounded-xl active:scale-95 transition-all shadow-xl flex items-center justify-center gap-1.5 font-sans"
            >
              <Play size={10} className="fill-[#050505]" /> INICIAR TREINO 🔥
            </button>
          )}
        </div>
      </div>

      {/* Filter Header separator matching attachment 1 */}
      <div className="flex-1 min-h-0 flex flex-col pt-1.5 overflow-hidden">
        <h3 className="text-[8px] font-black text-white/45 uppercase tracking-[0.2em] px-1 shrink-0 mb-1">
          LISTA DE EXERCÍCIOS PARA FILTRAR
        </h3>

        {/* Exercises list - Inner scroll viewport ensures zero parent scrolling */}
        <div className="flex-grow overflow-y-auto no-scrollbar space-y-1.5 py-0.5">
          {selectedWorkout.exercises.map((ex, idx) => {
            const perf = getExercisePerformance(ex);
            const completedCount = perf.filter(p => p.completed).length;
            const sizeSets = ex.sets;
            const isAllCompleted = sizeSets > 0 && completedCount === sizeSets;

            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => openExerciseModal(ex)}
                className={`group relative overflow-hidden rounded-xl border border-white/5 bg-[#0b0b0d]/70 p-2 hover:border-accent/40 active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-between gap-2.5 shadow-sm ${
                  isAllCompleted ? 'opacity-40' : 'opacity-100'
                }`}
              >
                {/* Body Card */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="bg-zinc-800 text-zinc-300 text-[6.5px] font-black px-1 py-0.5 rounded font-mono">
                      #{idx + 1}
                    </span>
                    <span className="text-accent text-[8px] font-black uppercase tracking-wider">
                      {ex.muscleGroup.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white uppercase leading-snug text-wrap whitespace-normal">
                    {ex.name}
                  </h3>

                  {/* Sets horizontal indicators Pills */}
                  <div className="flex flex-wrap gap-0.5">
                    {perf.map((s, sIdx) => (
                      <span 
                        key={sIdx} 
                        className={`text-[6.5px] font-black px-1.5 py-0.5 rounded border tracking-tight transition-all leading-none ${
                          s.completed 
                            ? 'bg-accent/15 border-accent text-accent' 
                            : 'bg-zinc-950/20 border-zinc-800/60 text-zinc-500'
                        }`}
                      >
                        S{sIdx + 1}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Side: Progress column and open button */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right flex flex-col justify-center items-end min-w-[40px] leading-none">
                    <span className="text-[6.5px] font-black text-white/40 uppercase tracking-widest block mb-0.5">
                      PROGRESSO
                    </span>
                    <span className="text-sm font-black text-white font-mono block">
                      {completedCount}/{sizeSets}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openExerciseModal(ex);
                    }}
                    className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent hover:border-accent hover:text-black text-accent flex items-center justify-center active:scale-90 transition-all font-sans"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cardio Aerobics control section */}
      {isWorkoutActive && (
        <div className="pt-1.5 shrink-0">
          {currentCardioProgress ? (
             <div className="bg-[#0c0c0c]/85 border border-accent/20 p-2 rounded-xl flex items-center justify-between group transition-all">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-accent/15 rounded-lg flex items-center justify-center text-accent shrink-0">
                      <Wind size={15} className="animate-pulse" />
                   </div>
                   <div className="leading-none">
                      <p className="text-[6.5px] font-black text-accent uppercase tracking-widest mb-0.5">AERÓBICO CONCLUÍDO</p>
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">{currentCardioProgress.exercise}</h4>
                      <p className="text-[8px] font-bold text-white/45 uppercase tracking-wider mt-0.5">{currentCardioProgress.duration} MINUTOS</p>
                   </div>
                </div>
                <button 
                   onClick={() => {
                     handleVibrate(15);
                     setCurrentCardioProgress(null);
                   }}
                   className="w-7 h-7 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all shrink-0"
                >
                   <Trash2 size={13} />
                </button>
             </div>
          ) : (
            <button 
               onClick={() => {
                 handleVibrate(15);
                 setShowCardioModal(true);
               }}
               className="w-full bg-[#0b0b0d]/50 border border-dashed border-white/5 p-2 rounded-xl flex items-center justify-center gap-1.5 group hover:border-accent/40 transition-all shrink-0 py-2.5"
            >
               <Wind size={13} className="text-zinc-500 group-hover:text-accent" />
               <p className="text-[8.5px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white">Adicionar Aeróbico</p>
            </button>
          )}
        </div>
      )}

      {/* Discard section actions if training is running */}
      {isWorkoutActive && (
        <div className="pt-1.5 flex flex-col gap-1 shrink-0">
          <button 
            onClick={() => {
              handleVibrate(30);
              handleFinishWorkout();
            }}
            disabled={completedSets === 0}
            className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              completedSets > 0 
              ? 'bg-accent text-black shadow-lg hover:brightness-110 active:scale-98' 
              : 'bg-zinc-900/40 border border-white/5 text-zinc-500 cursor-not-allowed'
            }`}
          >
            FINALIZAR SESSÃO
          </button>
          
          <button 
            onClick={() => {
              handleVibrate(10);
              cancelWorkout();
            }}
            className="w-full py-1 text-[8px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
          >
            DESCARTAR ESTE TREINO
          </button>
        </div>
      )}

      {/* Floating Single Exercise Detailed Modal Window exactly matching attachment 2 & 3 */}
      <AnimatePresence>
        {activeModalExercise && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop translucent black filter */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalExercise(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body Card */}
            <motion.div 
              initial={{ scale: 0.92, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-zinc-950 p-3.5 rounded-xl shadow-2xl border border-white/10 overflow-hidden space-y-3 max-h-[95vh] overflow-y-auto no-scrollbar"
            >
              {/* Header Container */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="bg-accent text-black text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded font-mono">
                    SÉRIE ATIVA
                  </span>
                  <span className="text-zinc-400 text-[10px] font-black uppercase font-mono">
                    {activeModalExercise.muscleGroup.toUpperCase()}
                  </span>
                </div>

                {/* Close Button X */}
                <button 
                  onClick={() => setActiveModalExercise(null)} 
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white active:scale-90 transition-all"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>

              {/* Title Section */}
              <div className="space-y-1">
                <h2 className="text-base font-black italic text-white tracking-tight uppercase leading-none">
                  {activeModalExercise.name}
                </h2>
                <div className="w-8 h-0.5 bg-accent rounded"></div>
              </div>

              {/* Active Rest Countdown Timer Panel (Depicted in image 3) */}
              <AnimatePresence>
                {modalRestTimeLeft !== null && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, y: -10 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -10 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-950 border border-accent/20 text-center space-y-2">
                       <div className="space-y-0.5 leading-none">
                        <span className="text-[6.5px] font-black text-zinc-400 uppercase tracking-widest block">
                          INTERVALO ATIVO DE REPOUSO
                        </span>
                        <h3 className="text-2xl font-black text-accent font-mono leading-none tracking-tight animate-pulse pt-0.5">
                          {modalRestTimeLeft}s
                        </h3>
                      </div>

                      {/* Display set descriptor text natively */}
                      <p className="text-[7.5px] font-black text-zinc-400 uppercase tracking-wider leading-relaxed px-1">
                        PRÓXIMA: <span className="text-white font-semibold">{getNextSetLabelForTimer(activeModalExercise)}</span> DE <span className="text-white font-semibold">{activeModalExercise.name.toUpperCase()}</span>
                      </p>

                      {/* Control Panel centered rows */}
                      <div className="flex items-center justify-center gap-2 pt-0.5">
                        {/* Subtract 10s */}
                        <button 
                          onClick={() => setModalRestTimeLeft(prev => prev !== null ? Math.max(0, prev - 10) : 0)}
                          className="w-7 h-7 rounded-full border border-white/5 bg-zinc-950 text-[9px] font-bold text-zinc-300 hover:text-white flex items-center justify-center active:scale-90 transition-all font-mono"
                        >
                          -10
                        </button>

                        {/* Play / Pause Toggle button */}
                        <button 
                          onClick={() => setIsModalRestPaused(p => !p)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all text-[#050505] ${
                            isModalRestPaused ? 'bg-emerald-600' : 'bg-accent'
                          }`}
                        >
                          {isModalRestPaused ? (
                            <Play size={11} className="fill-white ml-0.5 text-white" />
                          ) : (
                            <Pause size={11} className="fill-[#050505] text-[#050505]" />
                          )}
                        </button>

                        {/* Add 10s */}
                        <button 
                          onClick={() => setModalRestTimeLeft(prev => prev !== null ? prev + 10 : 10)}
                          className="w-7 h-7 rounded-full border border-white/5 bg-zinc-950 text-[9px] font-bold text-zinc-300 hover:text-white flex items-center justify-center active:scale-90 transition-all font-mono"
                        >
                          +10
                        </button>

                        {/* Skip rest completely */}
                        <button 
                          onClick={() => setModalRestTimeLeft(null)}
                          className="w-7 h-7 rounded-full border border-white/5 bg-zinc-950 text-zinc-300 hover:text-white flex items-center justify-center active:scale-90 transition-all"
                        >
                          <SkipForward size={11} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Victory Success Flash Transition Cover */}
              <AnimatePresence>
                {exerciseCompletedSuccess && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-b from-[#00DDA2]/10 to-[#00DDA2]/20 border border-[#00DDA2]/30 text-center space-y-2 relative z-30"
                  >
                    <div className="mx-auto w-10 h-10 rounded-full bg-[#00DDA2] flex items-center justify-center text-[#050505]">
                      <Check size={20} strokeWidth={4} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black italic tracking-tighter text-white uppercase leading-none">
                        EXERCÍCIO CONCLUÍDO! 🔥
                      </h3>
                      <p className="text-[7.5px] font-black text-[#00DDA2] uppercase tracking-[0.2em] mt-1.5">
                        MINIMIZANDO JANELA...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Coaching advise layout blocks */}
              {!exerciseCompletedSuccess && (
                <div className="space-y-2 pb-1">
                  {/* Coaching Motivational Line */}
                  <p className="text-[10px] font-medium text-white/50 leading-relaxed italic px-0.5">
                    "{trackingTextPlaceholder(activeModalExercise)}"
                  </p>

                  {/* Highlights cue container */}
                  <div className="border border-accent/15 bg-accent/5 rounded-lg p-2.5 flex gap-2.5 items-start">
                    <div className="w-6 h-6 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 mt-0.5">
                      <Shield size={12} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-[7.5px] font-black tracking-wider text-accent uppercase">
                        {activeModalExercise.muscleGroup.toUpperCase()} & PROTEÇÃO:
                      </h4>
                      <p className="text-[9.5px] font-bold text-orange-200/90 leading-normal italic truncate whitespace-normal">
                        {coachingInstructions(activeModalExercise)}
                      </p>
                    </div>
                  </div>

                  {/* Interactive steppers controller section */}
                  <div className="space-y-1.5 pt-1.5">
                    <div className="flex items-center justify-between text-[8px] font-black text-white/40 uppercase tracking-widest px-0.5 leading-none">
                      <span>SÉRIES E CARGAS ESTÉTICAS</span>
                      <span className="font-mono">CARGA (KG) - REPS</span>
                    </div>

                    <div className="space-y-1">
                      {getExercisePerformance(activeModalExercise).map((set, setIdx) => {
                        const isSetCompleted = set.completed;
                        return (
                          <div 
                            key={setIdx} 
                            className={`grid grid-cols-12 items-center gap-1.5 p-1 px-1.5 rounded-lg border transition-all duration-300 ${
                              isSetCompleted 
                                ? 'bg-[#00DDA2]/5 border-[#00DDA2]/20' 
                                : 'bg-zinc-900/50 border-white/5'
                            }`}
                          >
                            {/* Column 1: Row Title */}
                            <div className="col-span-2 text-left shrink-0 leading-none">
                              <span className="text-sm font-black text-white font-mono block">
                                S{setIdx + 1}
                              </span>
                              {setIdx === 0 && (
                                <span className="text-[6.5px] font-black text-accent uppercase tracking-wider -mt-0.5 block italic leading-none font-mono">
                                  REP
                                </span>
                              )}
                            </div>

                            {/* Column 2: Weight Stepper */}
                            <div className="col-span-4 select-none">
                              <div className="flex items-center justify-between bg-zinc-950/80 border border-white/5 rounded-lg px-0.5 h-8">
                                <button 
                                  onClick={() => handleModifyWeight(activeModalExercise.id, setIdx, -1)}
                                  disabled={isSetCompleted}
                                  className="text-zinc-400 hover:text-white px-1.5 h-full flex items-center justify-center font-bold text-xs active:scale-90 transition-all font-mono disabled:opacity-40"
                                >
                                  -
                                </button>
                                <input 
                                  type="number"
                                  inputMode="decimal"
                                  value={set.weight === 0 ? '' : set.weight}
                                  disabled={isSetCompleted}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => handleUpdateModalSet(activeModalExercise.id, setIdx, { weight: parseFloat(e.target.value) || 0 })}
                                  className="w-9 bg-transparent text-center text-white font-bold font-mono text-xs focus:outline-none placeholder:text-zinc-700 disabled:opacity-80"
                                  placeholder="0"
                                />
                                <button 
                                  onClick={() => handleModifyWeight(activeModalExercise.id, setIdx, 1)}
                                  disabled={isSetCompleted}
                                  className="text-zinc-400 hover:text-white px-1.5 h-full flex items-center justify-center font-bold text-xs active:scale-90 transition-all font-mono disabled:opacity-40"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Column 3: Reps Stepper */}
                            <div className="col-span-4 select-none">
                              <div className="flex items-center justify-between bg-zinc-950/80 border border-white/5 rounded-lg px-0.5 h-8">
                                <button 
                                  onClick={() => handleModifyReps(activeModalExercise.id, setIdx, -1)}
                                  disabled={isSetCompleted}
                                  className="text-zinc-400 hover:text-white px-1.5 h-full flex items-center justify-center font-bold text-xs active:scale-90 transition-all font-mono disabled:opacity-40"
                                >
                                  -
                                </button>
                                <input 
                                  type="number"
                                  inputMode="decimal"
                                  value={set.reps === 0 ? '' : set.reps}
                                  disabled={isSetCompleted}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => handleUpdateModalSet(activeModalExercise.id, setIdx, { reps: parseInt(e.target.value) || 0 })}
                                  className="w-9 bg-transparent text-center text-white font-bold font-mono text-xs focus:outline-none placeholder:text-zinc-700 disabled:opacity-80"
                                  placeholder="0"
                                />
                                <button 
                                  onClick={() => handleModifyReps(activeModalExercise.id, setIdx, 1)}
                                  disabled={isSetCompleted}
                                  className="text-zinc-400 hover:text-white px-1.5 h-full flex items-center justify-center font-bold text-xs active:scale-90 transition-all font-mono disabled:opacity-40"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Column 4: Glow Vibe Check Checkbox */}
                            <div className="col-span-2 flex items-center justify-end pr-0.5">
                              <button 
                                onClick={() => handleUpdateModalSet(activeModalExercise.id, setIdx, { completed: !isSetCompleted })}
                                className={`w-7 h-7 rounded-lg border flex items-center justify-center active:scale-90 transition-all ${
                                  isSetCompleted 
                                    ? 'bg-[#00DDA2] border-[#00DDA2] text-[#050505] shadow-[0_0_8px_rgba(0,221,162,0.25)]' 
                                    : 'bg-zinc-950 border-white/5 text-zinc-600 hover:text-zinc-400'
                                }`}
                              >
                                <Check size={14} strokeWidth={4} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual video/tutorial linkage at bottom of popup */}
                  <div className="pt-1.5 text-center leading-none">
                    <a 
                      href={`https://www.google.com/search?q=gif+execução+exercicio+${encodeURIComponent(activeModalExercise.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[8px] font-black text-accent hover:brightness-110 transition-all uppercase tracking-[0.15em] font-mono"
                    >
                      VER GUIA TÉCNICO INTERATIVO
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auxiliary Cardio Selector Modal */}
      <AnimatePresence>
        {showCardioModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCardioModal(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className="relative w-full max-w-sm glass-card bg-bg p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t border-line"
             >
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                         <Wind size={20} />
                      </div>
                      <h2 className="text-xl font-black text-ink uppercase italic tracking-tighter">Aeróbico</h2>
                   </div>
                   <button onClick={() => setShowCardioModal(false)} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-secondary">
                      <X size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 block">Exercício</label>
                      <div className="grid grid-cols-2 gap-2">
                         {['Esteira', 'Bike', 'Elíptico', 'Escada'].map(ex => (
                            <button 
                               key={ex}
                               onClick={() => {
                                  handleVibrate(5);
                                  setCardioInput({ ...cardioInput, exercise: ex });
                                }}
                               className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                                  cardioInput.exercise === ex 
                                  ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' 
                                  : 'bg-ink/[0.03] border-line text-secondary'
                               }`}
                            >
                               {ex}
                            </button>
                         ))}
                      </div>
                      <input 
                         type="text" 
                         value={cardioInput.exercise}
                         onChange={(e) => setCardioInput({ ...cardioInput, exercise: e.target.value })}
                         className="w-full mt-3 bg-ink/[0.03] border border-line p-4 rounded-xl text-ink font-bold placeholder:text-secondary/50 focus:border-accent transition-all"
                         placeholder="Outro..."
                      />
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 block">Tempo (Minutos)</label>
                      <div className="flex items-center gap-4">
                         <input 
                            type="range" 
                            min="5" 
                            max="60" 
                            step="5"
                            value={cardioInput.duration}
                            onChange={(e) => setCardioInput({ ...cardioInput, duration: parseInt(e.target.value) })}
                            className="flex-grow accent-accent"
                         />
                         <div className="w-20 bg-ink/[0.03] border border-line p-3 rounded-xl text-center">
                            <span className="text-xl font-black text-ink font-mono">{cardioInput.duration}</span>
                            <span className="text-[8px] font-black text-secondary block -mt-1 ml-1">MIN</span>
                         </div>
                      </div>
                   </div>

                   <button 
                      onClick={() => {
                         handleVibrate(30);
                         setCurrentCardioProgress({ ...cardioInput, completed: true });
                         setShowCardioModal(false);
                      }}
                      className="w-full bg-accent text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 font-black"
                   >
                      CONCLUIR CARDIO <CheckCircle2 size={18} />
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// getNextSetLabelForTimer is implemented dynamically inside the component
