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
  SkipForward,
  HelpCircle
} from 'lucide-react';
import { SetPerformance, WorkoutHistoryEntry, AppTab, Exercise } from '../../types';
import { getExerciseDetails, getHorusGifUrl } from '../../src/utils/exerciseUtils';
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
    theme,
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
    workoutStartTime,
    lastMarkedTime,
    setLastMarkedTime,
    handleManualCheckIn,
    addToast
  } = useStore();

  const isTeste1 = user?.username.toLowerCase() === 'henrique' || theme === 'light';
  const isTeacher = user?.username.toLowerCase() === 'teste3' || user?.username.toLowerCase().includes('flavia');
  const accentColor = '#2563EB';

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
  const [showExerciseInfo, setShowExerciseInfo] = React.useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = React.useState<string | null>(null);
  
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

  const handleFinishWorkoutRef = useRef<(isAutoFinish?: boolean) => void>(() => {});
  const lastMarkedTimeRef = useRef<number | null>(lastMarkedTime);

  useEffect(() => {
    lastMarkedTimeRef.current = lastMarkedTime || workoutStartTime;
  }, [lastMarkedTime, workoutStartTime]);

  useEffect(() => {
    if (isWorkoutActive && workoutStartTime) {
      requestWakeLock();

      const checkInactivityAndTick = () => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - workoutStartTime) / 1000));

        // Check for 40 minutes (2,400,000 ms) without marking anything
        const lastMark = lastMarkedTimeRef.current || workoutStartTime;
        if (lastMark && (now - lastMark >= 40 * 60 * 1000)) {
          console.log('[Inactivity] Finalizando treino automaticamente após 40 minutos sem marcações.');
          handleFinishWorkoutRef.current(true);
        }
      };

      checkInactivityAndTick();
      timerIntervalRef.current = window.setInterval(checkInactivityAndTick, 1000);

      const handleFocus = () => {
        checkInactivityAndTick();
      };
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleFocus);

      return () => {
        releaseWakeLock();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
      };
    } else {
      releaseWakeLock();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
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
    const now = Date.now();
    setIsWorkoutActive(true);
    setWorkoutStartTime(now);
    setLastMarkedTime(now);
    setElapsedTime(0);
    handleManualCheckIn();
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

  const handleFinishWorkout = (isAutoFinish = false) => {
    if (!selectedWorkout || !user || !workoutStartTime) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const today = now.toISOString().split('T')[0];
    const volume = calculateVolume();
    setLastWorkoutVolume(volume);
    
    // Duration up to last mark if auto-finish, or now
    const effectiveLastMark = lastMarkedTimeRef.current || lastMarkedTime || workoutStartTime;
    const effectiveEndTime = (isAutoFinish && effectiveLastMark) ? effectiveLastMark : Date.now();
    const duration = Math.max(1, Math.floor((effectiveEndTime - workoutStartTime) / 1000));
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
      streak: (user.streak || 0) + 1,
      preferredWorkoutId: undefined
    });

    if (!isAutoFinish) {
      triggerConfetti();
    }
    localStorage.removeItem(`tatugym_active_session_${user.username.toLowerCase()}`);
    setLastMarkedTime(null);
    setShowSummary(true);

    if (isAutoFinish && addToast) {
      addToast('Treino finalizado automaticamente após 40 minutos sem marcações.', 'info');
    }
  };

  handleFinishWorkoutRef.current = handleFinishWorkout;

  const closeSummary = () => {
    setCapturedImage(null);
    setShowSummary(false);
    setSelectedWorkout(null);
    setCurrentSessionProgress({});
    setCurrentCardioProgress(null);
    setWorkoutStartTime(null);
    setLastMarkedTime(null);
    setWorkoutDuration(null);
    setElapsedTime(0);
    setIsWorkoutActive(false);
    setActiveTab(AppTab.WORKOUT);
  };

  const exitWorkout = () => {
      setSelectedWorkout(null);
      setShowSummary(false);
      setActiveTab(AppTab.WORKOUT);
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
      setLastMarkedTime(null);
      setElapsedTime(0);
      setIsWorkoutActive(false);
      setActiveTab(AppTab.WORKOUT);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            setCapturedImage(reader.result as string);
          } catch (err) {
            console.error("Erro ao carregar imagem capturada:", err);
            if (addToast) addToast("Permissão de câmera negada", "error");
          }
        };
        reader.onerror = () => {
          if (addToast) addToast("Permissão de câmera negada", "error");
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Erro no fluxo de captura de imagem:", err);
      if (addToast) addToast("Permissão de câmera negada", "error");
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
      ctx.fillStyle = accentColor;
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
    
    // Check if it has '+' for drop sets
    if (ex.reps.includes('+')) {
      const parts = ex.reps.split('+').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
      if (parts.length === 2) {
        const performance: SetPerformance[] = [];
        const mainReps = parts[0];
        const dropReps = parts[1];
        const baseWeight = user.weights?.[ex.id] || 0;
        const dropWeight = baseWeight > 0 ? Math.round(baseWeight * 0.7) : 0;
        
        for (let i = 0; i < ex.sets; i++) {
          performance.push({
            weight: baseWeight,
            reps: mainReps,
            completed: false
          });
          performance.push({
            weight: dropWeight,
            reps: dropReps,
            completed: false
          });
        }
        return performance;
      }
    }

    // Parse reps string to see if it's a pyramid or list (e.g. "12-10-8-6" or "12-10-8-8")
    // Only parse if it has hyphens or slashes and doesn't contain time markers like "seg" or "min"
    const isTimeBased = ex.reps.toLowerCase().includes('seg') || ex.reps.toLowerCase().includes('min');
    const repParts = !isTimeBased 
      ? ex.reps.split(/[-/]/).map(r => parseInt(r.trim())).filter(r => !isNaN(r))
      : [];

    return new Array(ex.sets).fill(null).map((_, idx) => {
      let repsVal = parseInt(ex.reps) || 10;
      if (repParts.length > 1) {
        if (idx < repParts.length) {
          repsVal = repParts[idx];
        } else {
          repsVal = repParts[repParts.length - 1];
        }
      }
      return {
        weight: user.weights?.[ex.id] || 0,
        reps: repsVal,
        completed: false
      };
    });
  };

  // Update set value and handle complete toggling transitions
  const handleUpdateModalSet = (exerciseId: string, setIndex: number, updates: Partial<SetPerformance>) => {
    const currentEx = selectedWorkout.exercises.find(e => e.id === exerciseId);
    if (!currentEx) return;

    const currentSets = getExercisePerformance(currentEx);
    const updatedSets = [...currentSets];
    
    // Copy weight and reps from the first set to subsequent uncompleted sets automatically
    if (currentEx.reps.includes('+')) {
      if (setIndex === 0) {
        // Cascade main sets weight/reps and drop sets weight
        const mainWeight = updates.weight !== undefined ? updates.weight : updatedSets[0].weight;
        const mainReps = updates.reps !== undefined ? updates.reps : updatedSets[0].reps;
        const dropWeight = updates.weight !== undefined ? Math.round(updates.weight * 0.7) : updatedSets[1].weight;
        
        for (let i = 1; i < updatedSets.length; i++) {
          if (!updatedSets[i].completed) {
            if (i % 2 === 0) {
              // Main set
              updatedSets[i] = {
                ...updatedSets[i],
                weight: mainWeight,
                reps: mainReps
              };
            } else {
              // Drop set
              updatedSets[i] = {
                ...updatedSets[i],
                weight: dropWeight
              };
            }
          }
        }
      } else if (setIndex === 1) {
        // Cascade drop sets weight/reps
        const dropWeight = updates.weight !== undefined ? updates.weight : updatedSets[1].weight;
        const dropReps = updates.reps !== undefined ? updates.reps : updatedSets[1].reps;
        
        for (let i = 3; i < updatedSets.length; i += 2) {
          if (!updatedSets[i].completed) {
            updatedSets[i] = {
              ...updatedSets[i],
              weight: dropWeight,
              reps: dropReps
            };
          }
        }
      }
    } else if (setIndex === 0) {
      const cascadeUpdates: Partial<SetPerformance> = {};
      if (updates.weight !== undefined) cascadeUpdates.weight = updates.weight;
      
      const isTimeBased = currentEx.reps.toLowerCase().includes('seg') || currentEx.reps.toLowerCase().includes('min');
      const repParts = !isTimeBased 
        ? currentEx.reps.split(/[-/]/).map(r => parseInt(r.trim())).filter(r => !isNaN(r))
        : [];
      const isPyramid = repParts.length > 1;

      if (updates.reps !== undefined && !isPyramid) {
        cascadeUpdates.reps = updates.reps;
      }
      
      for (let i = 1; i < updatedSets.length; i++) {
        if (!updatedSets[i].completed) {
          updatedSets[i] = { ...updatedSets[i], ...cascadeUpdates };
        }
      }
    }

    updatedSets[setIndex] = { ...updatedSets[setIndex], ...updates };

    const nowMark = Date.now();
    setLastMarkedTime(nowMark);

    // Emit live to store progress (autosaves natively)
    setCurrentSessionProgress({
      ...currentSessionProgress,
      [exerciseId]: updatedSets
    });

    if (updates.completed) {
      if (!isWorkoutActive) {
        setIsWorkoutActive(true);
        setWorkoutStartTime(nowMark);
        setElapsedTime(0);
        handleManualCheckIn();
      }
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

  const handleCompleteExerciseSets = (ex: Exercise) => {
    handleVibrate(20);
    if (!isWorkoutActive) {
      startWorkout();
    }
    const perf = getExercisePerformance(ex);
    const allCompletedPerf = perf.map(p => ({ ...p, completed: true }));

    setCurrentSessionProgress({
      ...currentSessionProgress,
      [ex.id]: allCompletedPerf
    });

    triggerLocalConfetti();

    if (activeModalExercise && activeModalExercise.id === ex.id) {
      setExerciseCompletedSuccess(true);
      setModalRestTimeLeft(null);
      setTimeout(() => {
        setExerciseCompletedSuccess(false);
        setActiveModalExercise(null);
      }, 1500);
    }

    if (addToast) {
      addToast(`Exercício concluído! Todas as séries de "${ex.name}" marcadas! 🚀`, "success");
    }
  };

  const openExerciseModal = (ex: Exercise) => {
    setActiveModalExercise(ex);
    setShowExerciseInfo(false);
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
      <div className={`h-full max-h-full overflow-y-auto flex flex-col justify-center py-4 px-1 text-center bg-transparent font-sans antialiased selection:bg-accent/30 select-none w-full max-w-sm md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto space-y-4 my-auto ${isTeste1 ? 'text-zinc-950 font-black' : 'text-white'}`}>
          
          {/* HEADER COMPACTO */}
          <div className={`flex items-center gap-3 ${isTeste1 ? 'bg-white border-zinc-200' : 'bg-[#0c0c0c]/90 border-white/5'} border p-3 rounded-xl shrink-0 shadow-sm`}>
            <div className="w-9 h-9 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent shrink-0">
               <CheckCircle2 size={18} className="text-accent" strokeWidth={3} />
            </div>
            <div className="text-left leading-none">
              <h1 className={`text-base font-[950] ${isTeste1 ? 'text-zinc-950' : 'text-white'} uppercase tracking-tight italic`}>Missão <span className="text-accent">Cumprida!</span></h1>
              <p className={`${isTeste1 ? 'text-zinc-500 font-bold' : 'text-white/40'} text-[8px] mt-1 uppercase tracking-widest font-mono font-black`}>REGISTRO SALVO COM SUCESSO</p>
            </div>
          </div>

          {" "}
          {/* FOTO DE VITÓRIA EXTRA COMPACTA */}
          <div className={`${isTeste1 ? 'bg-white border-zinc-200' : 'bg-[#0c0c0c]/90 border-white/5'} border p-2 rounded-xl space-y-2 shrink-0 shadow-sm`}>
            <div className="flex items-center justify-between px-1.5">
               <span className={`text-[8px] font-black ${isTeste1 ? 'text-zinc-500' : 'text-white/45'} uppercase tracking-widest font-mono`}>Foto de Vitória</span>
               {capturedImage && (
                 <button onClick={() => setCapturedImage(null)} className={`transition-colors ${isTeste1 ? 'text-zinc-400 hover:text-red-650' : 'text-white/40 hover:text-red-500'}`}>
                    <Trash2 size={12} />
                 </button>
               )}
            </div>
            
            {!capturedImage ? (
              <button 
                onClick={() => {
                  try {
                    fileInputRef.current?.click();
                  } catch (err) {
                    console.error("Erro abrir câmera:", err);
                    if (addToast) addToast("Permissão de câmera negada", "error");
                  }
                }}
                className={`w-full h-24 border border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${isTeste1 ? 'border-zinc-300 hover:border-accent bg-zinc-50' : 'border-white/10 hover:border-accent/30 bg-white/[0.01]'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isTeste1 ? 'bg-zinc-100 border-zinc-200' : 'bg-white/[0.02] border-white/5'}`}>
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
             <div className={`${isTeste1 ? 'bg-white border-zinc-200' : 'bg-[#0c0c0c]/80 border-white/5'} border p-2 rounded-xl flex items-center justify-between gap-1 shadow-sm font-sans text-left`}>
                <div className="leading-none min-w-0">
                   <p className={`text-[7.5px] font-black ${isTeste1 ? 'text-zinc-500' : 'text-white/40'} uppercase tracking-widest font-mono truncate`}>DURAÇÃO</p>
                   <span className={`text-xs font-black ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-white'} font-mono mt-0.5 block italic`}>{workoutDuration ? formatTime(workoutDuration) : '00:00'}</span>
                </div>
                <Clock size={14} className="text-accent shrink-0" />
             </div>
             
             {currentCardioProgress ? (
                <div className={`${isTeste1 ? 'bg-white border-zinc-200' : 'bg-[#0c0c0c]/80 border-white/5'} border p-2 rounded-xl flex items-center justify-between gap-1 shadow-sm font-sans text-left`}>
                   <div className="leading-none min-w-0">
                      <p className={`text-[7.5px] font-black ${isTeste1 ? 'text-zinc-500' : 'text-white/40'} uppercase tracking-widest font-mono truncate`}>AERÓBICO</p>
                      <span className={`text-xs font-black ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-white'} font-mono mt-0.5 block italic truncate`}>{currentCardioProgress.duration}m ({currentCardioProgress.exercise})</span>
                   </div>
                   <Wind size={14} className="text-accent shrink-0" />
                </div>
             ) : (
                <div className={`${isTeste1 ? 'bg-white border-zinc-200' : 'bg-[#0c0c0c]/80 border-white/5'} border p-2 rounded-xl flex items-center justify-between gap-1 shadow-sm font-sans text-left`}>
                   <div className="leading-none min-w-0">
                      <p className={`text-[7.5px] font-black ${isTeste1 ? 'text-zinc-500' : 'text-white/40'} uppercase tracking-widest font-mono truncate`}>CARGATONELADA (VOL)</p>
                      <span className={`text-xs font-black ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-white'} font-mono mt-0.5 block italic`}>{calculateVolume()} kg</span>
                   </div>
                   <Dumbbell size={14} className="text-accent shrink-0" />
                </div>
             )}
          </div>

          {" "}
          {/* MOTIVAÇÃO EXTRA SLIM */}
          <div className={`${isTeste1 ? 'bg-white border-zinc-200' : 'bg-[#0c0c0c]/90 border-white/5'} border py-1.5 px-3 rounded-lg shrink-0`}>
             <p className="text-accent font-bold italic text-[8.5px] uppercase tracking-wider">
               "A constância é a mãe da evolução. Parabéns por hoje!"
             </p>
          </div>

          {/* BOTÃO VOLTAR PARA O DASHBOARD */}
          <div className="shrink-0 pt-1">
            <button 
              onClick={closeSummary} 
              className={`w-full bg-accent hover:bg-accent/90 ${isTeste1 ? 'text-white' : 'text-[#050505]'} font-[950] py-3.5 rounded-xl shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.25)] text-center active:scale-95 text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 font-sans shrink-0`}
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
    <div className={`w-full min-h-screen pt-12 sm:pt-6 flex flex-col justify-start pb-32 max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-1 bg-transparent select-none ${isTeste1 ? 'text-zinc-950 font-black' : 'text-white'}`}>
      {/* Upper Navigation Header */}
      <header className={`flex items-center justify-between py-1.5 border-b ${isTeste1 ? 'border-zinc-200' : 'border-white/5'} shrink-0`}>
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={exitWorkout} className={`w-8 h-8 flex items-center justify-center transition-all rounded-xl active:scale-95 ${
            isTeste1 ? 'text-zinc-950 bg-white border-zinc-250 hover:bg-zinc-100' : 'text-zinc-400 hover:text-white bg-[#0c0c0c]/80 border border-white/5'
          }`}>
            <ChevronLeft size={16}/>
          </button>
          <div className="min-w-0">
            <h1 className={`text-xs font-black italic truncate leading-none uppercase tracking-tight ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-white'}`}>{selectedWorkout.title}</h1>
            {isWorkoutActive && (
              <span className={`text-[7.5px] font-black mt-0.5 block tracking-wider uppercase leading-none ${isTeste1 ? 'text-zinc-500 font-bold' : 'text-white/40'}`}>SESSÃO EM ANDAMENTO ⏱️</span>
            )}
          </div>
        </div>

        {isWorkoutActive && (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`px-2 py-1 rounded-lg font-mono text-xs font-black tracking-tight leading-none ${
              isTeste1 ? 'bg-white border border-zinc-250 text-zinc-950' : 'bg-[#0c0c0c]/80 border-white/5 text-white'
            }`}>
              {formatTime(elapsedTime)}
            </div>
            <button 
              onClick={() => handleFinishWorkout()}
              className={`px-2.5 py-1.5 bg-accent ${isTeste1 ? 'text-white' : 'text-black'} font-black text-[8px] tracking-wider uppercase rounded-lg hover:brightness-110 active:scale-95 transition-all font-sans leading-none`}
            >
              SALVAR
            </button>
          </div>
        )}
      </header>

      {/* Selected Workout Upper Banner matching attachment 1 */}
      <div className={`relative overflow-hidden rounded-xl border p-3 text-center space-y-2 shadow-lg shrink-0 mt-1.5 ${
        isTeste1 
          ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10' 
          : 'border-white/5 bg-gradient-to-br from-zinc-950/90 to-zinc-900/50'
      }`}>
        {/* Play Icon centering frame */}
        <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center text-accent ${
          isTeste1 ? 'bg-white/15 border border-white/10 text-white' : 'bg-accent/10 border border-accent/20'
        }`}>
          <Play size={14} className={isTeste1 ? 'fill-white text-white ml-0.5' : 'fill-accent ml-0.5'} />
        </div>

        <div className="space-y-1">
          <h2 className={`text-xs font-black italic tracking-tight uppercase leading-none ${isTeste1 ? 'text-white/80' : 'text-white/60'}`}>
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
                onClick={() => handleFinishWorkout()}
                className="flex-1 py-2 bg-accent hover:brightness-110 text-black font-black text-[9px] uppercase tracking-wider rounded-lg active:scale-95 transition-all shadow-md leading-none"
              >
                FINALIZAR SESSÃO 🏆
              </button>
            </div>
          ) : (
            <button 
              onClick={startWorkout}
              className={`w-full max-w-xs py-3 font-black text-[10px] uppercase tracking-[0.15em] rounded-xl active:scale-95 transition-all shadow-xl flex items-center justify-center gap-1.5 font-sans border-0 ${
                isTeste1 
                  ? 'bg-white text-[#2563EB] hover:bg-zinc-100' 
                  : 'bg-accent hover:brightness-110 text-[#050505]'
              }`}
            >
              <Play size={10} className={isTeste1 ? 'fill-[#2563EB] text-[#2563EB]' : 'fill-[#050505]'} /> INICIAR TREINO 🔥
            </button>
          )}
        </div>
      </div>

      {/* Filter Header separator matching attachment 1 */}
      <div className="flex-1 mt-4">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] ${isTeste1 ? 'text-zinc-500' : 'text-white/50'}`}>
            EXERCÍCIOS DO TREINO
          </h3>
        </div>

        {/* Exercises list - Renders continuously with page scroll */}
        <div className="space-y-3.5 py-1">
          {selectedWorkout.exercises.map((ex, idx) => {
            const perf = getExercisePerformance(ex);
            const completedCount = perf.filter(p => p.completed).length;
            const sizeSets = ex.reps.includes('+') ? ex.sets * 2 : ex.sets;
            const isAllCompleted = sizeSets > 0 && completedCount === sizeSets;
            
            const isExpanded = expandedExerciseId === ex.id;
            const details = getExerciseDetails(ex.name, ex.muscleGroup);

            const handleCardClick = () => {
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
              if (isMobile) {
                openExerciseModal(ex);
              } else {
                setExpandedExerciseId(prev => prev === ex.id ? null : ex.id);
              }
            };

            return (
              <div key={ex.id} className="space-y-2">
                <div
                  onClick={handleCardClick}
                  className={`group relative overflow-hidden rounded-xl border p-3 active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 shadow-md ${
                    isTeste1 
                      ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10 text-white shadow-lg' 
                      : 'bg-[#0e0e12]/70 border-white/5 hover:border-accent/40 hover:bg-[#121217]/90'
                  } ${
                    isAllCompleted ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    {/* Elegant big index number */}
                    <span className={`text-3xl font-light font-sans tracking-tight mr-4 shrink-0 font-mono group-hover:text-white/30 transition-colors ${
                      isTeste1 ? 'text-white/20' : 'text-white/10'
                    }`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Compact Details Column */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 leading-none">
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                          isTeste1 ? 'bg-white/15 border border-white/10 text-white' : 'bg-[#1b1b22] text-[#e3e3e8]'
                        }`}>
                          {ex.muscleGroup}
                        </span>
                        {ex.dropSet && (
                          <span className="bg-orange-500/20 text-orange-400 text-[6.5px] font-black px-1 rounded-sm uppercase tracking-wider font-mono">
                            Drop Set
                          </span>
                        )}
                        {ex.restPause && (
                          <span className="bg-red-500/20 text-red-400 text-[6.5px] font-black px-1 rounded-sm uppercase tracking-wider font-mono">
                            Rest-Pause
                          </span>
                        )}
                      </div>

                      <h3 className={`text-xs sm:text-sm font-bold uppercase leading-snug text-wrap whitespace-normal group-hover:text-[#93C5FD] transition-colors ${
                        isTeste1 ? 'text-white' : 'text-white'
                      }`}>
                        {ex.name}
                      </h3>

                      {/* Technical specifications row */}
                      <p className={`text-[10px] font-mono flex items-center gap-1.5 flex-wrap ${
                        isTeste1 ? 'text-white/75' : 'text-zinc-400'
                      }`}>
                        <span className={`${isTeste1 ? 'text-white font-bold' : 'text-white'} font-semibold`}>{ex.sets}x{ex.reps}</span>
                        <span className={`${isTeste1 ? 'text-white/40' : 'text-zinc-650'}`}>•</span>
                        <span>{ex.rest}s descanso</span>
                        {ex.notes && (
                          <>
                            <span className={`${isTeste1 ? 'text-white/40' : 'text-zinc-650'}`}>•</span>
                            <span className="text-amber-400 font-bold truncate max-w-[150px] italic">{ex.notes}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Sets Quick Progression Indicators */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right flex flex-col justify-center items-end min-w-[45px] leading-none">
                      <span className={`text-[6.5px] font-black uppercase tracking-widest block mb-1 ${isTeste1 ? 'text-white/50' : 'text-white/40'}`}>
                        SÉRIES
                      </span>
                      <span className={`text-xs font-black font-mono block ${isTeste1 ? 'text-white' : 'text-white'}`}>
                        {completedCount}/{sizeSets}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openExerciseModal(ex);
                      }}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center active:scale-95 transition-all font-sans shrink-0 ${
                        isTeste1 
                          ? 'bg-white border-transparent text-[#2563EB] hover:scale-105 shadow-md hover:text-blue-700' 
                          : 'bg-accent/5 border border-accent/20 hover:bg-accent hover:border-accent hover:text-black text-accent'
                      }`}
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {/* Inline Expanded View Drawer for Desktop */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className={`overflow-hidden border rounded-xl px-4 py-4 ${
                        isTeste1 ? 'bg-zinc-50 border-zinc-250 shadow-inner' : 'bg-[#0c0c0e]/90 border-white/5'
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 leading-normal">
                        {/* Animated Video/GIF */}
                        <div className="md:col-span-4 flex flex-col justify-start items-center">
                          <div className={`relative rounded-xl overflow-hidden border w-full max-w-[200px] h-40 flex items-center justify-center ${
                            isTeste1 ? 'bg-white border-zinc-250' : 'bg-zinc-950 border-white/5'
                          }`}>
                            <img 
                              src={details.gif} 
                              alt={ex.name} 
                              className="max-h-[150px] w-auto max-w-[180px] rounded-lg object-contain"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className={`text-[7px] uppercase tracking-widest font-mono font-black mt-2 ${isTeste1 ? 'text-zinc-500' : 'text-zinc-500'}`}>GIF Demonstrativo Oficial</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteExerciseSets(ex);
                            }}
                            className={`mt-3 w-full max-w-[200px] py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                              isTeste1
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            }`}
                          >
                            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                            <span>Concluir Tudo</span>
                          </button>
                        </div>

                        {/* Educational Information Checklist */}
                        <div className="md:col-span-8 space-y-4 text-left">
                          <div className="space-y-2">
                            <div>
                              <span className={`text-[8px] font-black uppercase font-mono tracking-widest ${isTeste1 ? 'text-zinc-650' : 'text-zinc-400'}`}>Instruções de Movimento</span>
                              <p className={`text-xs mt-0.5 leading-relaxed ${isTeste1 ? 'text-zinc-900 font-bold' : 'text-white/70'}`}>{details.instructions}</p>
                            </div>

                            <div>
                              <span className={`text-[8px] font-black uppercase font-mono tracking-widest ${isTeste1 ? 'text-zinc-650' : 'text-zinc-400'}`}>Execução Perfeita</span>
                              <p className={`text-xs mt-0.5 leading-relaxed ${isTeste1 ? 'text-zinc-900 font-bold' : 'text-white/70'}`}>{details.correctExecution}</p>
                            </div>

                            <div>
                              <span className={`text-[8px] font-black uppercase font-mono tracking-widest ${isTeste1 ? 'text-zinc-650' : 'text-zinc-400'}`}>Observação de Coach</span>
                              <p className="text-xs text-amber-500/90 mt-0.5 font-bold italic leading-relaxed">
                                "{details.technique}"
                              </p>
                            </div>

                            <div>
                              <span className={`text-[8px] font-black uppercase font-mono tracking-widest ${isTeste1 ? 'text-zinc-650' : 'text-zinc-400'}`}>Dicas Práticas Extra</span>
                              <ul className={`list-disc list-inside mt-1 text-xs space-y-0.5 ${isTeste1 ? 'text-zinc-800' : 'text-white/70'}`}>
                                {details.tips.map((tip, tIdx) => (
                                  <li key={tIdx} className="leading-relaxed">{tip}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cardio Aerobics control section */}
      {isWorkoutActive && (
        <div className="pt-1.5 shrink-0">
          {currentCardioProgress ? (
             <div className={`${isTeste1 ? 'bg-white border-accent' : 'bg-[#0c0c0c]/85 border-accent/20'} border p-2 rounded-xl flex items-center justify-between group transition-all`}>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-accent/15 rounded-lg flex items-center justify-center text-accent shrink-0">
                      <Wind size={15} className="animate-pulse" />
                   </div>
                   <div className="leading-none">
                      <p className="text-[6.5px] font-black text-accent uppercase tracking-widest mb-0.5">AERÓBICO CONCLUÍDO</p>
                      <h4 className={`text-xs font-black uppercase tracking-tight ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-white'}`}>{currentCardioProgress.exercise}</h4>
                      <p className={`text-[8px] font-bold uppercase tracking-wider mt-0.5 ${isTeste1 ? 'text-zinc-550 font-bold' : 'text-white/45'}`}>{currentCardioProgress.duration} MINUTOS</p>
                   </div>
                </div>
                <button 
                   onClick={() => {
                     handleVibrate(15);
                     setCurrentCardioProgress(null);
                   }}
                   className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 border ${
                     isTeste1 ? 'bg-zinc-100 border-zinc-250 text-zinc-650 hover:text-red-650' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-red-500'
                   }`}
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
               className={`w-full p-2 rounded-xl flex items-center justify-center gap-1.5 group transition-all shrink-0 py-2.5 border border-dashed ${
                 isTeste1 
                   ? 'bg-white border-zinc-300 hover:border-accent hover:bg-zinc-50' 
                   : 'bg-[#0b0b0d]/50 border-white/5 hover:border-accent/40'
               }`}
            >
               <Wind size={13} className="text-zinc-500 group-hover:text-accent" />
               <p className={`text-[8.5px] font-black uppercase tracking-widest ${isTeste1 ? 'text-zinc-500 group-hover:text-zinc-950 font-black' : 'text-zinc-400 group-hover:text-white'}`}>Adicionar Aeróbico</p>
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
              ? `bg-accent ${isTeste1 ? 'text-white' : 'text-black'} shadow-lg hover:brightness-110 active:scale-98` 
              : (isTeste1 
                  ? 'bg-zinc-200 border border-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-zinc-900/40 border border-white/5 text-zinc-500 cursor-not-allowed')
            }`}
          >
            FINALIZAR SESSÃO
          </button>
          
          <button 
            onClick={() => {
              handleVibrate(10);
              cancelWorkout();
            }}
            className={`w-full py-1 text-[8px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1 ${
              isTeste1 ? 'text-zinc-400 hover:text-zinc-950 font-black' : 'text-zinc-650 hover:text-white'
            }`}
          >
            DESCARTAR ESTE TREINO
          </button>
        </div>
      )}
      {/* Floating Single Exercise Detailed Modal Window / Premium Bottom Sheet */}
      <AnimatePresence>
        {activeModalExercise && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
            {/* Backdrop translucent black filter */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setActiveModalExercise(null)}
               className="absolute inset-0 bg-transparent"
            />

            {/* Modal Body Card / Bottom Sheet panel */}
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className={`relative w-full sm:max-w-md p-5 rounded-2xl shadow-2xl overflow-hidden space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar pb-6 z-10 border ${
                isTeste1 ? 'bg-white border-zinc-200 text-zinc-950 font-black' : 'bg-[#0c0c0f] border-white/10 text-white'
              }`}
            >
              {/* Header Container */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                    isTeste1 ? 'bg-zinc-100 text-zinc-950 font-black' : 'bg-accent text-[#050505]'
                  }`}>
                    SÉRIE ATIVA
                  </span>
                  <span className={`text-[10px] font-black uppercase font-mono tracking-wider ${
                    isTeste1 ? 'text-zinc-500 font-bold' : 'text-zinc-400'
                  }`}>
                    {activeModalExercise.muscleGroup.toUpperCase()}
                  </span>
                </div>

                {/* Close Button X */}
                <button 
                  onClick={() => setActiveModalExercise(null)} 
                  className={`w-7 h-7 rounded-sm flex items-center justify-center active:scale-90 transition-all border ${
                    isTeste1 ? 'bg-zinc-100 border-zinc-250 text-zinc-650 hover:bg-zinc-250' : 'bg-[#1b1b22] border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>

              {/* Title Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className={`text-base font-black italic tracking-tight uppercase leading-none ${
                    isTeste1 ? 'text-zinc-950 font-[950]' : 'text-white'
                  }`}>
                    {activeModalExercise.name}
                  </h2>
                  <button 
                    onClick={() => setShowExerciseInfo(!showExerciseInfo)}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                      showExerciseInfo 
                        ? 'bg-accent/20 text-accent' 
                        : (isTeste1 
                            ? 'bg-zinc-100 border border-zinc-250 text-zinc-500 hover:text-zinc-950' 
                            : 'bg-zinc-900 border border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800')
                    }`}
                  >
                    <HelpCircle size={14} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="w-12 h-0.5 bg-accent rounded"></div>
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
                    <div className={`p-3 rounded-lg border text-center space-y-2 ${
                      isTeste1 ? 'bg-zinc-50 border-accent/40' : 'bg-gradient-to-br from-zinc-900 to-zinc-950 border-accent/20'
                    }`}>
                       <div className="space-y-0.5 leading-none">
                        <span className={`text-[6.5px] font-black uppercase tracking-widest block ${
                          isTeste1 ? 'text-zinc-500 font-bold' : 'text-zinc-400'
                        }`}>
                          INTERVALO ATIVO DE REPOUSO
                        </span>
                        <h3 className="text-2xl font-black text-accent font-mono leading-none tracking-tight animate-pulse pt-0.5">
                          {modalRestTimeLeft}s
                        </h3>
                      </div>

                      {/* Display set descriptor text natively */}
                      <p className={`text-[7.5px] font-black uppercase tracking-wider leading-relaxed px-1 ${
                        isTeste1 ? 'text-zinc-650' : 'text-zinc-400'
                      }`}>
                        PRÓXIMA: <span className={`${isTeste1 ? 'text-zinc-950 font-bold' : 'text-white'} font-semibold`}>{getNextSetLabelForTimer(activeModalExercise)}</span> DE <span className={`${isTeste1 ? 'text-zinc-950 font-bold' : 'text-white'} font-semibold`}>{activeModalExercise.name.toUpperCase()}</span>
                      </p>

                      {/* Control Panel centered rows */}
                      <div className="flex items-center justify-center gap-2 pt-0.5">
                        {/* Subtract 10s */}
                        <button 
                          onClick={() => setModalRestTimeLeft(prev => prev !== null ? Math.max(0, prev - 10) : 0)}
                          className={`w-7 h-7 rounded-full border text-[9px] font-bold flex items-center justify-center active:scale-90 transition-all font-mono ${
                            isTeste1 ? 'bg-white border-zinc-250 text-zinc-950 font-black' : 'bg-zinc-950 border-white/5 text-zinc-300 hover:text-white'
                          }`}
                        >
                          -10
                        </button>

                        {/* Play / Pause Toggle button */}
                        <button 
                          onClick={() => setIsModalRestPaused(p => !p)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all text-white ${
                            isModalRestPaused ? 'bg-emerald-600' : 'bg-accent text-white'
                          }`}
                        >
                          {isModalRestPaused ? (
                            <Play size={11} className="fill-white ml-0.5 text-white" />
                          ) : (
                            <Pause size={11} className="fill-white text-white" />
                          )}
                        </button>

                        {/* Add 10s */}
                        <button 
                          onClick={() => setModalRestTimeLeft(prev => prev !== null ? prev + 10 : 10)}
                          className={`w-7 h-7 rounded-full border text-[9px] font-bold flex items-center justify-center active:scale-90 transition-all font-mono ${
                            isTeste1 ? 'bg-white border-zinc-250 text-zinc-950 font-black' : 'bg-zinc-950 border-white/5 text-zinc-300 hover:text-white'
                          }`}
                        >
                          +10
                        </button>

                        {/* Skip rest completely */}
                        <button 
                          onClick={() => setModalRestTimeLeft(null)}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center active:scale-90 transition-all ${
                            isTeste1 ? 'bg-white border-zinc-250 text-zinc-950 font-black' : 'bg-zinc-950 border-white/5 text-zinc-300 hover:text-white'
                          }`}
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

              {/* Educational info checklist with GIF - ONLY if not completed success */}
              {!exerciseCompletedSuccess && (
                <div className="space-y-4 pb-2">
                  {/* Custom exercise video/GIF of high-tech Horus */}
                  <div className={`relative rounded-xl overflow-hidden h-44 w-full flex flex-col items-center justify-center p-1.5 shadow-inner border animate-fade-in ${
                    isTeste1 ? 'bg-white border-zinc-250' : 'bg-zinc-950 border-white/5'
                  }`}>
                    <img 
                      src={getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).gif} 
                      alt={activeModalExercise.name} 
                      className="max-h-[150px] w-auto max-w-[200px] rounded-lg object-contain"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/5 font-mono text-[6px] font-bold text-zinc-400 uppercase tracking-widest leading-none">DEMONSTRAÇÃO DE EXECUÇÃO</span>
                  </div>

                  {/* Quick complete button for all sets of this exercise */}
                  <button
                    type="button"
                    onClick={() => handleCompleteExerciseSets(activeModalExercise)}
                    className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                      isTeste1
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    }`}
                  >
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Concluir Todas as Séries Deste Exercício</span>
                  </button>

                  {/* Standard Coaching Directives */}
                  <AnimatePresence>
                    {showExerciseInfo && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`border rounded-xl p-3 space-y-2.5 text-left leading-relaxed mt-4 ${
                          isTeste1 ? 'border-zinc-250 bg-zinc-50' : 'border-white/5 bg-[#121216]/50'
                        }`}>
                          <div>
                            <span className={`text-[7px] font-black uppercase tracking-widest block leading-none font-mono ${
                              isTeste1 ? 'text-zinc-650' : 'text-zinc-400'
                            }`}>Instruções de Movimento</span>
                            <p className={`text-[10.5px] font-normal mt-0.5 leading-snug ${
                              isTeste1 ? 'text-zinc-950 font-bold' : 'text-white/75'
                            }`}>{getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).instructions}</p>
                          </div>
                          <div>
                            <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest block leading-none font-mono">Execução Perfeita</span>
                            <p className={`text-[10.5px] font-medium mt-0.5 leading-snug ${
                              isTeste1 ? 'text-emerald-950 font-bold' : 'text-emerald-200/95'
                            }`}>{getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).correctExecution}</p>
                          </div>
                          <div>
                            <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest block leading-none font-mono">Observações de Coach</span>
                            <p className={`text-[10.5px] font-medium mt-0.5 leading-snug italic font-bold ${
                              isTeste1 ? 'text-amber-650' : 'text-amber-200/90'
                            }`}>"{getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).technique}"</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Interactive steppers controller section */}
                  <div className="space-y-1.5 pt-1">
                    <div className={`flex items-center justify-between text-[7px] font-black uppercase tracking-widest px-0.5 leading-none ${
                        isTeste1 ? 'text-zinc-550 font-bold' : 'text-white/40'
                    }`}>
                      <span>SÉRIES E REGISTRO DE CARGA</span>
                      <span className="font-mono">PESO (KG) — REPS</span>
                    </div>

                    <div className="space-y-1 max-h-[170px] overflow-y-auto no-scrollbar animate-fade-in">
                      {getExercisePerformance(activeModalExercise).map((set, setIdx) => {
                        const isSetCompleted = set.completed;
                        return (
                          <div 
                            key={setIdx} 
                            className={`grid grid-cols-12 items-center gap-1.5 p-1 px-1.5 rounded-lg border transition-all duration-300 ${
                              isSetCompleted 
                                ? 'bg-[#00DDA2]/5 border-[#00DDA2]/25' 
                                : (isTeste1 ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900/50 border-white/5')
                            }`}
                          >
                            {/* Column 1: Row Title */}
                            <div className="col-span-2 text-left shrink-0 leading-none">
                              <span className={`text-sm font-black font-mono block ${isTeste1 ? 'text-zinc-950' : 'text-white'}`}>
                                {activeModalExercise.reps.includes('+')
                                  ? `S${Math.floor(setIdx / 2) + 1}${setIdx % 2 === 0 ? '' : '+'}`
                                  : `S${setIdx + 1}`
                                }
                              </span>
                              {activeModalExercise.reps.includes('+') && setIdx % 2 !== 0 ? (
                                <span className="text-[6px] font-black text-orange-500 uppercase tracking-widest mt-0.5 block italic leading-none font-mono font-bold">
                                  DROP
                                </span>
                              ) : setIdx === 0 ? (
                                <span className="text-[6px] font-black text-accent uppercase tracking-widest mt-0.5 block italic leading-none font-mono font-bold">
                                  REP
                                </span>
                              ) : null}
                            </div>

                            {/* Column 2: Weight Stepper */}
                            <div className="col-span-4 select-none">
                              <div className={`flex items-center justify-between border rounded-lg px-0.5 h-8 ${
                                isTeste1 ? 'bg-white border-zinc-300' : 'bg-zinc-950/80 border-white/5'
                              }`}>
                                <button 
                                  onClick={() => handleModifyWeight(activeModalExercise.id, setIdx, -1)}
                                  disabled={isSetCompleted}
                                  className={`px-1.5 h-full flex items-center justify-center font-bold text-xs active:scale-95 transition-all font-mono disabled:opacity-45 ${
                                    isTeste1 ? 'text-zinc-650 hover:text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                                  }`}
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
                                  className={`w-9 bg-transparent text-center font-bold font-mono text-xs focus:outline-none placeholder:text-zinc-700 disabled:opacity-80 ${
                                    isTeste1 ? 'text-zinc-950 font-black' : 'text-white'
                                  }`}
                                  placeholder="0"
                                />
                                <button 
                                  onClick={() => handleModifyWeight(activeModalExercise.id, setIdx, 1)}
                                  disabled={isSetCompleted}
                                  className={`px-1.5 h-full flex items-center justify-center font-bold text-xs active:scale-95 transition-all font-mono disabled:opacity-45 ${
                                    isTeste1 ? 'text-zinc-650 hover:text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Column 3: Reps Stepper */}
                            <div className="col-span-4 select-none">
                              <div className={`flex items-center justify-between border rounded-lg px-0.5 h-8 ${
                                isTeste1 ? 'bg-white border-zinc-300' : 'bg-zinc-950/80 border-white/5'
                              }`}>
                                <button 
                                  onClick={() => handleModifyReps(activeModalExercise.id, setIdx, -1)}
                                  disabled={isSetCompleted}
                                  className={`px-1.5 h-full flex items-center justify-center font-bold text-xs active:scale-95 transition-all font-mono disabled:opacity-45 ${
                                    isTeste1 ? 'text-zinc-650 hover:text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                                  }`}
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
                                  className={`w-9 bg-transparent text-center font-bold font-mono text-xs focus:outline-none placeholder:text-zinc-700 disabled:opacity-80 ${
                                    isTeste1 ? 'text-zinc-950 font-black' : 'text-white'
                                  }`}
                                  placeholder="0"
                                />
                                <button 
                                  onClick={() => handleModifyReps(activeModalExercise.id, setIdx, 1)}
                                  disabled={isSetCompleted}
                                  className={`px-1.5 h-full flex items-center justify-center font-bold text-xs active:scale-95 transition-all font-mono disabled:opacity-45 ${
                                    isTeste1 ? 'text-zinc-650 hover:text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Column 4: Glowing check indicator */}
                            <div className="col-span-2 flex items-center justify-end pr-0.5">
                              <button 
                                onClick={() => handleUpdateModalSet(activeModalExercise.id, setIdx, { completed: !isSetCompleted })}
                                className={`w-7 h-7 rounded-sm border flex items-center justify-center active:scale-95 transition-all ${
                                  isSetCompleted 
                                    ? 'bg-[#00DDA2] border-[#00DDA2] text-white shadow-[0_0_8px_rgba(0,221,162,0.25)]' 
                                    : (isTeste1 ? 'bg-zinc-100 border-zinc-200 text-zinc-400 hover:text-zinc-950' : 'bg-zinc-950 border-white/5 text-zinc-600 hover:text-zinc-400')
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

                  {/* Manual video/tutorial guide link */}
                  <div className="pt-2 text-center leading-none">
                    <a 
                      href={`https://www.google.com/search?q=gif+execução+exercicio+${encodeURIComponent(activeModalExercise.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[8.5px] font-black text-accent hover:brightness-110 transition-all uppercase tracking-[0.15em] font-mono block"
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
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCardioModal(false)}
               className="absolute inset-0 bg-transparent"
             />
             <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className={`relative w-full max-w-sm p-8 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl border-t ${
                 isTeste1 ? 'bg-white border-zinc-200 text-zinc-950' : 'bg-[#0c0c0f] border-white/10 text-white'
               }`}
             >
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                         <Wind size={20} />
                      </div>
                      <h2 className={`text-xl font-black uppercase italic tracking-tighter ${
                        isTeste1 ? 'text-zinc-950 font-[950]' : 'text-white'
                      }`}>Aeróbico</h2>
                   </div>
                   <button 
                     onClick={() => setShowCardioModal(false)} 
                     className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                       isTeste1 ? 'bg-zinc-100 border-zinc-250 text-zinc-500 hover:text-zinc-950' : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-white'
                     }`}
                   >
                      <X size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                   <div>
                      <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${
                        isTeste1 ? 'text-zinc-550 font-bold' : 'text-white/40'
                      }`}>Exercício</label>
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
                                  ? 'bg-accent border-accent text-white shadow-lg' 
                                  : (isTeste1 
                                      ? 'bg-zinc-100 border-zinc-200 text-zinc-750 hover:bg-zinc-200' 
                                      : 'bg-[#0e0e12]/70 border-white/5 text-zinc-500 hover:text-white')
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
                         className={`w-full mt-3 border p-4 rounded-xl font-bold placeholder:text-zinc-500 transition-all ${
                           isTeste1 ? 'bg-zinc-50 border-zinc-250 text-zinc-950' : 'bg-black/30 border-white/5 text-white'
                         }`}
                         placeholder="Outro..."
                      />
                   </div>

                   <div>
                      <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${
                        isTeste1 ? 'text-zinc-550 font-bold' : 'text-white/45'
                      }`}>Tempo (Minutos)</label>
                      <div className="flex items-center gap-4">
                         <input 
                            type="range" 
                            min="5" 
                            max="60" 
                            type-step="5"
                            value={cardioInput.duration}
                            onChange={(e) => setCardioInput({ ...cardioInput, duration: parseInt(e.target.value) })}
                            className="flex-grow accent-accent"
                         />
                         <div className={`w-20 border p-3 rounded-xl text-center ${
                           isTeste1 ? 'bg-zinc-50 border-zinc-250' : 'bg-[#0f0f12] border-white/5'
                         }`}>
                            <span className={`text-xl font-black font-mono ${isTeste1 ? 'text-zinc-950' : 'text-white'}`}>{cardioInput.duration}</span>
                            <span className={`text-[8px] font-black block -mt-1 ml-1 ${isTeste1 ? 'text-zinc-500 font-bold' : 'text-white/40'}`}>MIN</span>
                         </div>
                      </div>
                   </div>

                   <button 
                      onClick={() => {
                         handleVibrate(30);
                         setCurrentCardioProgress({ ...cardioInput, completed: true });
                         setLastMarkedTime(Date.now());
                         setShowCardioModal(false);
                      }}
                      className={`w-full bg-accent ${isTeste1 ? 'text-white font-black' : 'text-[#050505]'} py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3`}
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
