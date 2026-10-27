import { BrandLogo } from '../ui/BrandLogo';
import { createWorkoutShareImage } from '../../src/utils/workoutShareImage';
import { getDivisionThumbnail, getExerciseThumbnail, getThumbnailPlan, retryThumbnail, retryExerciseDetail } from '../../src/utils/workoutThumbnails';
import { interpretPrescription, createInitialPerformance, getRestSeconds } from '../../src/utils/workoutPrescription';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Play,
  LayoutDashboard,

  Camera,
  Download,
  Trash2,
  Dumbbell,

  X,

  Plus,

  Check,

  Pause,
  SkipForward,
  HelpCircle
} from 'lucide-react';
import { SetPerformance, AppTab, Exercise } from '../../types';
import { getExerciseDetails } from '../../src/utils/exerciseUtils';
import confetti from 'canvas-confetti';


const formatWeight = (value: number) => value.toLocaleString('pt-BR', { useGrouping: false, maximumFractionDigits: 20 });

const WeightInput: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
  const [draft, setDraft] = React.useState<string | null>(null);
  return <input id="active-set-weight" type="text" inputMode="decimal" aria-label="Carga em quilogramas" value={draft ?? formatWeight(value)}
    onFocus={event => { setDraft(formatWeight(value)); event.currentTarget.select(); }}
    onChange={event => {
      const raw = event.target.value;
      if (!/^\d*(?:[.,]\d*)?$/.test(raw)) return;
      const parsed = Number(raw.replace(',', '.'));
      if (!Number.isFinite(parsed)) return;
      setDraft(raw);
      onChange(parsed);
    }}
    onBlur={() => setDraft(null)} />;
};

export const WorkoutView: React.FC = () => {
  const {
    selectedWorkout,
    user,
    showSummary,
    isWorkoutActive,
    elapsedTime,
    currentSessionProgress,
    workoutDuration,
    theme,
    setIsWorkoutActive,
    setWorkoutStartTime,
    setElapsedTime,
    setCurrentSessionProgress,
    setShowSummary,
    setLastWorkoutVolume,
    setWorkoutDuration,
    triggerConfetti,
    setActiveTab,
    setSelectedWorkout,
    workoutStartTime,
    lastMarkedTime,
    setLastMarkedTime,
    addToast
  } = useStore();

  const isLightTheme = true;


  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [shareImage, setShareImage] = React.useState<string | null>(null);
  const [showPhotoPreview, setShowPhotoPreview] = React.useState(false);

  useEffect(() => {
    let cancelled = false;
    setShareImage(null);
    if (!capturedImage || !showSummary || !selectedWorkout) { setIsGeneratingImage(false); return; }
    setIsGeneratingImage(true);
    createWorkoutShareImage(capturedImage, selectedWorkout.title, workoutDuration || 0)
      .then(image => { if (!cancelled) setShareImage(image); })
      .catch(() => { if (!cancelled) addToast?.('Não foi possível gerar a imagem. Tente outra foto.', 'error'); })
      .finally(() => { if (!cancelled) setIsGeneratingImage(false); });
    return () => { cancelled = true; };
  }, [capturedImage, showSummary, selectedWorkout?.title, workoutDuration, addToast]);

  useEffect(() => {
    if (!showPhotoPreview) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowPhotoPreview(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [showPhotoPreview]);
  const timerIntervalRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Modal States
  const [activeModalExercise, setActiveModalExercise] = React.useState<Exercise | null>(null);
  const [showExerciseInfo, setShowExerciseInfo] = React.useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = React.useState<string | null>(null);

  const sessionRest = useStore(state => state.sessionRest);
  const [restNow, setRestNow] = React.useState(Date.now);
  const remainingRest = (rest: NonNullable<typeof sessionRest>) => rest.pausedRemaining ?? Math.max(0, Math.ceil((rest.endsAt - Date.now()) / 1000));
  const modalRestTimeLeft = sessionRest === null ? null : sessionRest.pausedRemaining ?? Math.max(0, Math.ceil((sessionRest.endsAt - restNow) / 1000));
  const isModalRestPaused = sessionRest?.pausedRemaining !== null && sessionRest !== null;
  const setModalRestTimeLeft = (update: number | null | ((previous: number | null) => number | null)) => {
    const previous = useStore.getState().sessionRest;
    const seconds = typeof update === 'function' ? update(previous ? remainingRest(previous) : null) : update;
    useStore.setState({ sessionRest: seconds === null ? null : {
      endsAt: Date.now() + seconds * 1000,
      pausedRemaining: typeof update === 'function' && previous?.pausedRemaining != null ? seconds : null,
      notified: false
    } });
    setRestNow(Date.now());
  };
  const setIsModalRestPaused = (update: boolean | ((previous: boolean) => boolean)) => {
    const rest = useStore.getState().sessionRest;
    if (!rest) return;
    const paused = typeof update === 'function' ? update(rest.pausedRemaining !== null) : update;
    if (paused === (rest.pausedRemaining !== null)) return;
    const seconds = remainingRest(rest);
    useStore.setState({ sessionRest: { ...rest, endsAt: Date.now() + seconds * 1000, pausedRemaining: paused ? seconds : null } });
    setRestNow(Date.now());
  };

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

  // The interval refreshes the display; the persisted deadline is the clock.
  useEffect(() => {
    if (!sessionRest || !isWorkoutActive || !selectedWorkout || !user) return;
    const refresh = () => {
      setRestNow(Date.now());
      const rest = useStore.getState().sessionRest;
      if (rest && rest.pausedRemaining === null && rest.endsAt <= Date.now() && !rest.notified) {
        useStore.setState({ sessionRest: { ...rest, notified: true } });
        handleVibrate(250);
        playBeep();
      }
    };
    refresh();
    const interval = sessionRest.pausedRemaining === null && sessionRest.endsAt > Date.now() ? window.setInterval(refresh, 1000) : null;
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      if (interval !== null) window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [sessionRest, isWorkoutActive, selectedWorkout, user]);

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
    const liveSession = useStore.getState();
    if (!selectedWorkout || !liveSession.user || !workoutStartTime ||
        !liveSession.isWorkoutActive || liveSession.selectedWorkout?.id !== selectedWorkout.id ||
        liveSession.workoutStartTime !== workoutStartTime) return;
    const hasCompletedSet = selectedWorkout.exercises.some(ex =>
      (currentSessionProgress[ex.id] || []).some(set => set.completed)
    );
    if (!hasCompletedSet) {
      if (!isAutoFinish) addToast?.('Conclua pelo menos uma série antes de finalizar.', 'info');
      return;
    }
    const volume = calculateVolume();
    setLastWorkoutVolume(volume);

    // Duration up to last mark if auto-finish, or now
    const effectiveLastMark = lastMarkedTimeRef.current || lastMarkedTime || workoutStartTime;
    const effectiveEndTime = (isAutoFinish && effectiveLastMark) ? effectiveLastMark : Date.now();
    const duration = Math.max(1, Math.floor((effectiveEndTime - workoutStartTime) / 1000));
    setWorkoutDuration(duration);
    if (!useStore.getState().registerCompletedWorkout(
      selectedWorkout, currentSessionProgress, duration,
      `session:${selectedWorkout.id}:${workoutStartTime}`
    )) return;
    setIsWorkoutActive(false);

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
    if (!shareImage) return;
    const link = document.createElement('a');
    link.download = `horus-gym-${Date.now()}.png`;
    link.href = shareImage;
    link.click();
    handleVibrate(30);
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

    return createInitialPerformance(ex, user.weights);
  };

  // Update set value and handle complete toggling transitions
  const handleUpdateModalSet = (exerciseId: string, setIndex: number, updates: Partial<SetPerformance>) => {
    const currentEx = selectedWorkout.exercises.find(e => e.id === exerciseId);
    if (!currentEx) return;

    if (updates.reps !== undefined) {
      updates = { ...updates, reps: Number.isFinite(updates.reps)
        ? Math.min(1000, Math.max(0, Math.trunc(updates.reps))) : 0 };
    }
    if (updates.durationSeconds !== undefined) {
      updates = { ...updates, durationSeconds: Number.isFinite(updates.durationSeconds)
        ? Math.min(3600, Math.max(0, Math.round(updates.durationSeconds))) : 0 };
    }
    const currentSets = getExercisePerformance(currentEx);
    const updatedSets = [...currentSets];

    // Copy weight and reps from the first set to subsequent uncompleted sets automatically
    const prescription = interpretPrescription(currentEx);
    if (prescription.drop) {
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

      const isPyramid = prescription.kind === 'sequence';
      if (updates.durationSeconds !== undefined) cascadeUpdates.durationSeconds = updates.durationSeconds;

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
          }
      handleVibrate(20);
      const allDone = updatedSets.every(s => s.completed);
      if (allDone) {
        triggerLocalConfetti();
        setExerciseCompletedSuccess(true);
        setModalRestTimeLeft(null);

      } else {
        // Automate rest timer with exercise rest or fallback 60s
        setModalRestTimeLeft(getRestSeconds(currentEx.rest));
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
    const isTime = interpretPrescription(currentEx).kind === 'time';
    const value = isTime ? (sets[setIndex].durationSeconds || 0) : sets[setIndex].reps;
    const updated = Math.max(0, value + delta);
    handleUpdateModalSet(exerciseId, setIndex, isTime ? { durationSeconds: updated } : { reps: updated });
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

    }

    if (addToast) {
      addToast(`Exercício concluído! Todas as séries de "${ex.name}" marcadas! 🚀`, "success");
    }
  };

  const openExerciseModal = (ex: Exercise) => {
    setActiveModalExercise(ex);
    setShowExerciseInfo(false);
  };

  if (showSummary) {
    return <section className="horus-workout-summary horus-completion">
      <header className="horus-completion-heading">
        <BrandLogo className="horus-completion-logo" />
        <div><h1>Treino concluído!</h1><p>Seu treino foi salvo no histórico.</p></div>
      </header>
      <div className="horus-completion-info horus-blue-card"><h2>{selectedWorkout.title}</h2><p><Clock size={16} />{formatTime(workoutDuration || 0)} de treino</p><div className="horus-completion-details"><span>{calculateVolume()} kg de volume</span><span>{selectedWorkout.exercises.filter(ex => getExercisePerformance(ex).every(set => set.completed)).length}/{selectedWorkout.exercises.length} exercícios concluídos</span></div></div>
      <section className="horus-completion-photo horus-blue-card">
        <div className="horus-completion-photo-heading"><h3>Foto do treino</h3>{capturedImage && <button aria-label="Remover foto" onClick={() => { setCapturedImage(null); setShowPhotoPreview(false); }}><Trash2 size={18} /></button>}</div>
        {!capturedImage ? <button className="horus-capture-photo" onClick={() => fileInputRef.current?.click()}><Camera size={26} /><span>Tirar ou escolher foto</span><small>Crie sua imagem com a marca HÓRUS GYM</small></button> : shareImage ? <>
          <button className="horus-share-thumbnail" aria-label="Ampliar imagem do treino" onClick={() => setShowPhotoPreview(true)}><img src={shareImage} alt="Foto do treino com divisão, duração e marca HÓRUS GYM" /></button>
          <p className="horus-photo-hint">Toque na imagem para ampliar e conferir.</p>
        </> : <p role="status">{isGeneratingImage ? 'Preparando sua imagem…' : 'Escolha outra foto para tentar novamente.'}</p>}
        {capturedImage && <button className="horus-save-photo" onClick={downloadSummaryImage} disabled={!shareImage || isGeneratingImage}><Download size={18} />Salvar imagem</button>}
        <input type="file" ref={fileInputRef} onChange={handleImageCapture} accept="image/*" capture="environment" className="hidden" />
      </section>
      <button className="horus-completion-home" onClick={closeSummary}><LayoutDashboard size={18} />Voltar para o início</button>
      {showPhotoPreview && shareImage && createPortal(<div className="horus-photo-preview" role="dialog" aria-modal="true" aria-label="Pré-visualização da imagem do treino" onClick={() => setShowPhotoPreview(false)}>
        <div className="horus-photo-preview-panel" onClick={event => event.stopPropagation()}>
          <header><h2>Sua imagem</h2><button autoFocus aria-label="Fechar preview da foto" onClick={() => setShowPhotoPreview(false)}><X size={22} /></button></header>
          <img src={shareImage} alt="Imagem final que será salva: divisão, duração e HÓRUS GYM" />
          <button className="horus-save-photo" onClick={downloadSummaryImage}><Download size={18} />Salvar imagem</button>
        </div>
      </div>, document.body)}
    </section>;
  }

  const divisionThumbnail = getDivisionThumbnail(selectedWorkout, getThumbnailPlan(user?.username, selectedWorkout));

  // Calculate global statistics

  const completedSets = selectedWorkout.exercises.reduce((acc, ex) => {
    const perf = currentSessionProgress[ex.id] || [];
    return acc + perf.filter(p => p.completed).length;
  }, 0);

  return (
    <div className={`horus-execution w-full min-h-screen pt-12 sm:pt-6 flex flex-col justify-start pb-32 max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-1 bg-transparent select-none ${isLightTheme ? 'text-zinc-950 font-black' : 'text-white'}`}>
      {!activeModalExercise && <> {modalRestTimeLeft !== null && <div className="active-set-rest" role="status"><div><span>{modalRestTimeLeft === 0 ? 'Descanso concluído' : isModalRestPaused ? 'Descanso pausado' : 'Recupere o fôlego'}</span><strong>{Math.floor(modalRestTimeLeft / 60).toString().padStart(2, '0')}:{(modalRestTimeLeft % 60).toString().padStart(2, '0')}</strong></div><button aria-label="Reduzir descanso em 10 segundos" onClick={() => setModalRestTimeLeft(prev => prev !== null ? Math.max(0, prev - 10) : 0)}>−10s</button><button aria-label={isModalRestPaused ? 'Retomar descanso' : 'Pausar descanso'} onClick={() => setIsModalRestPaused(p => !p)}>{isModalRestPaused ? <Play size={16} /> : <Pause size={16} />}</button><button aria-label="Aumentar descanso em 10 segundos" onClick={() => setModalRestTimeLeft(prev => prev !== null ? prev + 10 : 10)}>+10s</button><button onClick={() => setModalRestTimeLeft(null)}>Pular descanso</button></div>} </>}
      {/* Upper Navigation Header */}
      <header className={`flex items-center justify-between py-1.5 border-b ${isLightTheme ? 'border-zinc-200' : 'border-white/5'} shrink-0`}>
        <div className="flex items-center gap-2 min-w-0">
          <button aria-label="Voltar aos treinos" onClick={exitWorkout} className={`w-8 h-8 flex items-center justify-center transition-all rounded-xl active:scale-95 ${
            isLightTheme ? 'text-zinc-950 bg-white border-zinc-250 hover:bg-zinc-100' : 'text-zinc-400 hover:text-white bg-[#0c0c0c]/80 border border-white/5'
          }`}>
            <ChevronLeft size={16}/>
          </button>
          <div className="min-w-0">
            <h1 className={`text-xs font-black italic truncate leading-none uppercase tracking-tight ${isLightTheme ? 'text-zinc-950 font-[900]' : 'text-white'}`}>{selectedWorkout.title}</h1>
                {isWorkoutActive && <span className="text-xs text-text-secondary">Sessão em andamento</span>}
          </div>
        </div>
      </header>

      {/* Selected Workout Upper Banner matching attachment 1 */}
      <div className={`horus-selected-workout horus-blue-card ${isWorkoutActive ? 'horus-session-active' : ''} relative overflow-hidden rounded-xl border p-3 text-center space-y-2 shadow-lg shrink-0 mt-1.5 ${
        isLightTheme
          ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10'
          : 'border-white/5 bg-gradient-to-br from-zinc-950/90 to-zinc-900/50'
      }`}>
        {divisionThumbnail && <div className="performance-anatomy performance-selected-art" data-plan={getThumbnailPlan(user?.username, selectedWorkout)} aria-hidden="true"><img src={divisionThumbnail} alt="" onError={event => { event.currentTarget.hidden = true; }} /></div>}
        {/* Play Icon centering frame */}
        <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center text-accent ${
          isLightTheme ? 'bg-white/15 border border-white/10 text-white' : 'bg-accent/10 border border-accent/20'
        }`}>
          <Play size={14} className={isLightTheme ? 'fill-white text-white ml-0.5' : 'fill-accent ml-0.5'} />
        </div>

        <div className="space-y-1">
          <h2 className={`text-xs font-black italic tracking-tight uppercase leading-none ${isLightTheme ? 'text-white/80' : 'text-white/60'}`}>
            TREINO SELECIONADO <span className="text-white font-[950] italic">{getWorkoutFocus(selectedWorkout)}</span><small className="performance-selected-count">{selectedWorkout.exercises.length} exercícios</small>
          </h2>
        </div>

        {/* Action Button inside banner */}
        <div className="flex justify-center pt-0.5">
          {isWorkoutActive ? (
            <div className="horus-session-controls">
              <div className="horus-session-clock">
                <span className="horus-session-clock-label"><Clock size={14} />Tempo de treino</span>
                <span className="text-sm font-black text-white font-mono leading-none tracking-tight">{formatTime(elapsedTime)}</span>
              </div>
              <button
                onClick={() => handleFinishWorkout()}
                className="horus-session-finish"
              >
                Finalizar sessão
              </button>
            </div>
          ) : (
            <button
              onClick={startWorkout}
              className={`w-full max-w-xs py-3 font-black text-[10px] uppercase tracking-[0.15em] rounded-xl active:scale-95 transition-all shadow-xl flex items-center justify-center gap-1.5 font-sans border-0 ${
                isLightTheme
                  ? 'bg-white text-[#2563EB] hover:bg-zinc-100'
                  : 'bg-accent hover:brightness-110 text-[#050505]'
              }`}
            >
              <Play size={10} className={isLightTheme ? 'fill-[#2563EB] text-[#2563EB]' : 'fill-[#050505]'} /> INICIAR TREINO 🔥
            </button>
          )}
        </div>
      </div>

      {/* Filter Header separator matching attachment 1 */}
      <div className="flex-1 mt-4">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] ${isLightTheme ? 'text-zinc-500' : 'text-white/50'}`}>
            EXERCÍCIOS DO TREINO
          </h3>
        </div>

        {/* Exercises list - Renders continuously with page scroll */}
        <div className="space-y-3.5 py-1">
          {selectedWorkout.exercises.map((ex) => {
            const perf = getExercisePerformance(ex);
            const completedCount = perf.filter(p => p.completed).length;
            const sizeSets = interpretPrescription(ex).drop ? ex.sets * 2 : ex.sets;
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
                  className={`horus-execution-exercise horus-blue-card group relative overflow-hidden rounded-xl border p-3 active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 shadow-md ${
                    isLightTheme
                      ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10 text-white shadow-lg'
                      : 'bg-[#0e0e12]/70 border-white/5 hover:border-accent/40 hover:bg-[#121217]/90'
                  } ${
                    isAllCompleted ? 'horus-exercise-completed' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <span className="horus-workout-thumbnail">
                      <img src={getExerciseThumbnail(ex, getThumbnailPlan(user?.username, selectedWorkout || undefined)) || details.gif} alt={ex.name} loading="lazy" referrerPolicy="no-referrer"
                        onError={event => { if (!retryThumbnail(event.currentTarget, details.gif)) event.currentTarget.dataset.unavailable = 'true'; }} />
                      <Dumbbell className="horus-workout-thumbnail-fallback" size={23} strokeWidth={1.5} aria-hidden="true" />
                    </span>

                    {/* Compact Details Column */}
                    <div className="horus-exercise-copy min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 leading-none">
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                          isLightTheme ? 'bg-white/15 border border-white/10 text-white' : 'bg-[#1b1b22] text-[#e3e3e8]'
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
                        isLightTheme ? 'text-white' : 'text-white'
                      }`}>
                        {ex.name}
                      </h3>

                      {/* Technical specifications row */}
                      <p className={`text-[10px] font-mono flex items-center gap-1.5 flex-wrap ${
                        isLightTheme ? 'text-white/75' : 'text-zinc-400'
                      }`}>
                        <span className={`${isLightTheme ? 'text-white font-bold' : 'text-white'} font-semibold`}>{ex.sets} séries • {ex.reps}{interpretPrescription(ex).kind === 'reps' ? ' reps' : ''}</span>
                        <span className={`${isLightTheme ? 'text-white/40' : 'text-zinc-650'}`}>•</span>
                        <span>{ex.rest}s descanso</span>
                        {ex.notes && (
                          <>
                            <span className={`${isLightTheme ? 'text-white/40' : 'text-zinc-650'}`}>•</span>
                            <span className="text-amber-400 font-bold truncate max-w-[150px] italic">{ex.notes}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Sets Quick Progression Indicators */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right flex flex-col justify-center items-end min-w-[45px] leading-none">
                      <span className={`text-[6.5px] font-black uppercase tracking-widest block mb-1 ${isLightTheme ? 'text-white/50' : 'text-white/40'}`}>
                        SÉRIES
                      </span>
                      <span className={`text-xs font-black font-mono block ${isLightTheme ? 'text-white' : 'text-white'}`}>
                        {completedCount}/{sizeSets}
                      </span>
                    </div>

                    <button
                      aria-label={`Abrir ${ex.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openExerciseModal(ex);
                      }}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center active:scale-95 transition-all font-sans shrink-0 ${
                        isLightTheme
                          ? 'bg-white border-transparent text-[#2563EB] hover:scale-105 shadow-md hover:text-blue-700'
                          : 'bg-accent/5 border border-accent/20 hover:bg-accent hover:border-accent hover:text-black text-accent'
                      }`}
                    >
                      <ChevronRight size={18} strokeWidth={2} />
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
                      className={`horus-blue-card overflow-hidden border rounded-xl px-4 py-4 ${
                        isLightTheme ? 'bg-zinc-50 border-zinc-250 shadow-inner' : 'bg-[#0c0c0e]/90 border-white/5'
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 leading-normal">
                        {/* Animated Video/GIF */}
                        <div className="md:col-span-4 flex flex-col justify-start items-center">
                          <div className={`horus-exercise-media relative rounded-xl overflow-hidden border w-full max-w-[200px] h-40 flex items-center justify-center ${
                            isLightTheme ? 'bg-white border-zinc-250' : 'bg-zinc-950 border-white/5'
                          }`}>
                            <img
                              src={details.gif}
                              onError={event => retryExerciseDetail(event.currentTarget, getExerciseThumbnail(ex, getThumbnailPlan(user?.username, selectedWorkout)))}
                              alt={ex.name}
                              className="max-h-[150px] w-auto max-w-[180px] rounded-lg object-contain"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            /><div className="horus-gif-fallback"><Dumbbell size={30} /><span>Demonstração indisponível</span></div>
                          </div>
                          <span className={`text-[7px] uppercase tracking-widest font-mono font-black mt-2 ${isLightTheme ? 'text-zinc-500' : 'text-zinc-500'}`}>GIF Demonstrativo Oficial</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteExerciseSets(ex);
                            }}
                            className={`mt-3 w-full max-w-[200px] py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                              isLightTheme
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
                              <span className={`text-[8px] font-black uppercase font-mono tracking-widest ${isLightTheme ? 'text-zinc-650' : 'text-zinc-400'}`}>Instruções de Movimento</span>
                              <p className={`text-xs mt-0.5 leading-relaxed ${isLightTheme ? 'text-zinc-900 font-bold' : 'text-white/70'}`}>{details.instructions}</p>
                            </div>

                            <div>
                              <span className={`text-[8px] font-black uppercase font-mono tracking-widest ${isLightTheme ? 'text-zinc-650' : 'text-zinc-400'}`}>Execução Perfeita</span>
                              <p className={`text-xs mt-0.5 leading-relaxed ${isLightTheme ? 'text-zinc-900 font-bold' : 'text-white/70'}`}>{details.correctExecution}</p>
                            </div>

                            <div>
                              <span className={`text-[8px] font-black uppercase font-mono tracking-widest ${isLightTheme ? 'text-zinc-650' : 'text-zinc-400'}`}>Observação de Coach</span>
                              <p className="text-xs text-amber-500/90 mt-0.5 font-bold italic leading-relaxed">
                                "{details.technique}"
                              </p>
                            </div>

                            <div>
                              <span className={`text-[8px] font-black uppercase font-mono tracking-widest ${isLightTheme ? 'text-zinc-650' : 'text-zinc-400'}`}>Dicas Práticas Extra</span>
                              <ul className={`list-disc list-inside mt-1 text-xs space-y-0.5 ${isLightTheme ? 'text-zinc-800' : 'text-white/70'}`}>
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
              ? `bg-accent ${isLightTheme ? 'text-white' : 'text-black'} shadow-lg hover:brightness-110 active:scale-98`
              : (isLightTheme
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
              isLightTheme ? 'text-zinc-400 hover:text-zinc-950 font-black' : 'text-zinc-650 hover:text-white'
            }`}
          >
            DESCARTAR ESTE TREINO
          </button>
        </div>
      )}
      {/* Floating Single Exercise Detailed Modal Window / Premium Bottom Sheet */}
      <AnimatePresence>
        {activeModalExercise && (
          <div className="horus-exercise-overlay fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
            {/* Dismiss the exercise sheet by tapping outside it. */}
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
              role="dialog" aria-modal="true" aria-label={activeModalExercise.name}
              className={`horus-exercise-modal ${!showExerciseInfo && !getExercisePerformance(activeModalExercise).every(set => set.completed) ? 'horus-active-session' : ''} ${showExerciseInfo ? 'horus-exercise-detail' : 'horus-exercise-compact'} relative w-full sm:max-w-md p-5 rounded-2xl shadow-2xl overflow-hidden space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar pb-6 z-10 border ${
                isLightTheme ? 'bg-white border-zinc-200 text-zinc-950 font-black' : 'bg-[#0c0c0f] border-white/10 text-white'
              }`}
            >
              {/* Header Container */}
              <div className="horus-modal-topbar flex items-center justify-between">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                    isLightTheme ? 'bg-zinc-100 text-zinc-950 font-black' : 'bg-accent text-[#050505]'
                  }`}>
                    {getExercisePerformance(activeModalExercise).every(set => set.completed) ? 'Concluído' : 'Série ativa'}
                  </span>
                  <span className={`text-[10px] font-black uppercase font-mono tracking-wider ${
                    isLightTheme ? 'text-zinc-500 font-bold' : 'text-zinc-400'
                  }`}>
                    {activeModalExercise.muscleGroup}
                  </span>
                </div>

                {/* Close Button X */}
                <button
                  aria-label="Fechar exercício"
                  onClick={() => setActiveModalExercise(null)}
                  className={`w-7 h-7 rounded-sm flex items-center justify-center active:scale-90 transition-all border ${
                    isLightTheme ? 'bg-zinc-100 border-zinc-250 text-zinc-650 hover:bg-zinc-250' : 'bg-[#1b1b22] border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>

              {getExercisePerformance(activeModalExercise).every(set => set.completed) && (() => {
                const sets = getExercisePerformance(activeModalExercise);
                const timed = interpretPrescription(activeModalExercise).kind === 'time';
                const averageWeight = sets.reduce((total, set) => total + set.weight, 0) / sets.length;
                const totalReps = sets.reduce((total, set) => total + set.reps, 0);
                const totalSeconds = sets.reduce((total, set) => total + (set.durationSeconds || 0), 0);
                return <section className="horus-exercise-success" aria-live="polite">
                  <CheckCircle2 className="horus-success-check" size={60} strokeWidth={1.6} />
                  <h2>Exercício concluído!</h2>
                  <h3>{activeModalExercise.name}</h3>
                  <p>{activeModalExercise.muscleGroup}</p>
                  <h4>Resumo do exercício</h4>
                  <dl className="horus-success-summary">
                    <div><dt>Séries realizadas</dt><dd>{sets.length} de {sets.length}</dd></div>
                    <div><dt>Carga média</dt><dd>{formatWeight(Number(averageWeight.toFixed(1)))} kg</dd></div>
                    <div><dt>{timed ? 'Tempo executado' : 'Total de repetições'}</dt><dd>{timed ? totalSeconds + ' s' : totalReps + ' reps'}</dd></div>
                  </dl>
                  <div className="horus-set-history">{sets.map((set, index) => <button key={index} className="completed" aria-label={`Série ${index + 1}, concluída; toque para desmarcar`} onClick={() => handleUpdateModalSet(activeModalExercise.id, index, { completed: false })}><Check size={16} /><span>Série {index + 1}</span><strong>{formatWeight(set.weight)} kg · {timed ? (set.durationSeconds || 0) + ' s' : set.reps + ' reps'}</strong></button>)}</div>
                </section>;
              })()}
              {getExercisePerformance(activeModalExercise).every(set => set.completed) && <button className="horus-action" onClick={() => {
                const next = selectedWorkout.exercises[selectedWorkout.exercises.findIndex(ex => ex.id === activeModalExercise.id) + 1];
                setModalRestTimeLeft(null);
                if (next) openExerciseModal(next);
                else { setActiveModalExercise(null); setExerciseCompletedSuccess(false); }
              }}>{selectedWorkout.exercises.findIndex(ex => ex.id === activeModalExercise.id) < selectedWorkout.exercises.length - 1 ? 'Próximo exercício' : 'Voltar para finalizar treino'}<ChevronRight size={18} /></button>}
              {/* Active registration is a new composition; session handlers stay unchanged. */}
              {!showExerciseInfo && !getExercisePerformance(activeModalExercise).every(set => set.completed) && (() => {
                const sets = getExercisePerformance(activeModalExercise);
                const setIdx = sets.findIndex(set => !set.completed);
                const set = sets[setIdx];
                const completed = sets.filter(item => item.completed).length;
                const timed = interpretPrescription(activeModalExercise).kind === 'time';
                return <div className="active-set-layout">
                  <div className="active-set-heading"><div><p>Exercício {selectedWorkout.exercises.findIndex(ex => ex.id === activeModalExercise.id) + 1} de {selectedWorkout.exercises.length}</p><h2>{activeModalExercise.name}</h2></div><button type="button" className="active-set-help" aria-label="Abrir informações do exercício" onClick={() => setShowExerciseInfo(true)}><HelpCircle size={21} /></button></div>
                  <button type="button" className="active-set-demo" aria-label="Abrir detalhe completo do exercício" onClick={() => setShowExerciseInfo(true)}>
                    <span className="active-set-demo-art"><img src={getExerciseThumbnail(activeModalExercise, getThumbnailPlan(user?.username, selectedWorkout)) || getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).gif} alt="" onError={event => { if (!retryThumbnail(event.currentTarget, getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).gif)) event.currentTarget.dataset.unavailable = 'true'; }} /><Dumbbell size={28} /></span>
                    <span className="active-set-demo-copy"><strong>{activeModalExercise.sets} séries · {activeModalExercise.reps}{timed ? '' : ' reps'}</strong><span><Clock size={13} /> {activeModalExercise.rest}s de descanso</span><small>Ver execução <ChevronRight size={12} /></small></span>
                  </button>
                  <section className="active-set-progress" aria-label="Progresso das séries"><div className="active-set-section-label"><h3>Suas séries</h3><span aria-live="polite">{completed} de {sets.length} concluídas</span></div>
                    <div className="active-set-track">{sets.map((item, index) => <button type="button" key={index} className={item.completed ? 'is-completed' : index === setIdx ? 'is-current' : 'is-pending'} aria-label={`Série ${index + 1}, ${item.completed ? 'concluída; toque para desmarcar' : index === setIdx ? 'atual' : 'pendente'}`} aria-current={index === setIdx ? 'step' : undefined} disabled={!item.completed} onClick={() => handleUpdateModalSet(activeModalExercise.id, index, { completed: false })}><span className="active-set-marker">{item.completed ? <Check size={17} /> : String(index + 1).padStart(2, '0')}</span><span>{item.completed ? `${formatWeight(item.weight)} kg · ${timed ? (item.durationSeconds || 0) + 's' : item.reps + ' reps'}` : index === setIdx ? 'Agora' : 'A seguir'}</span></button>)}</div>
                  </section>
                  {set && <>
                    {modalRestTimeLeft !== null && <div className="active-set-rest" role="status"><div><span>{modalRestTimeLeft === 0 ? 'Descanso concluído' : isModalRestPaused ? 'Descanso pausado' : 'Recupere o fôlego'}</span><strong>{Math.floor(modalRestTimeLeft / 60).toString().padStart(2, '0')}:{(modalRestTimeLeft % 60).toString().padStart(2, '0')}</strong></div><button aria-label="Reduzir descanso em 10 segundos" onClick={() => setModalRestTimeLeft(prev => prev !== null ? Math.max(0, prev - 10) : 0)}>−10s</button><button aria-label={isModalRestPaused ? 'Retomar descanso' : 'Pausar descanso'} onClick={() => setIsModalRestPaused(p => !p)}>{isModalRestPaused ? <Play size={16} /> : <Pause size={16} />}</button><button aria-label="Aumentar descanso em 10 segundos" onClick={() => setModalRestTimeLeft(prev => prev !== null ? prev + 10 : 10)}>+10s</button><button onClick={() => setModalRestTimeLeft(null)}>Pular descanso</button></div>}
                    <section className="active-set-console horus-blue-card" aria-label="Registrar série"><div className="active-set-console-heading"><h3>Série {String(setIdx + 1).padStart(2, '0')}</h3><span><i />{interpretPrescription(activeModalExercise).drop && setIdx % 2 !== 0 ? 'Drop set' : 'Em execução'}</span></div>
                      <div className="active-set-inputs">
                        <div className="active-set-value"><label htmlFor="active-set-weight">Carga</label><div className="active-set-number"><WeightInput key={`${activeModalExercise.id}-${setIdx}`} value={set.weight} onChange={weight => handleUpdateModalSet(activeModalExercise.id, setIdx, { weight })} /><span>kg</span></div><div className="active-set-adjust"><button type="button" aria-label="Diminuir carga" onClick={() => handleModifyWeight(activeModalExercise.id, setIdx, -0.5)}>−</button><button type="button" aria-label="Aumentar carga" onClick={() => handleModifyWeight(activeModalExercise.id, setIdx, 0.5)}>+</button></div></div>
                        <div className="active-set-value"><label htmlFor="active-set-reps">{timed ? 'Tempo' : 'Repetições'}</label><div className="active-set-number"><input id="active-set-reps" onFocus={event => event.currentTarget.select()} type="number" min="0" inputMode="numeric" value={timed ? (set.durationSeconds ?? 0) : set.reps} onChange={event => handleUpdateModalSet(activeModalExercise.id, setIdx, timed ? { durationSeconds: Math.max(0, Number(event.target.value)) } : { reps: Math.max(0, Number(event.target.value)) })} /><span>{timed ? 'seg' : 'reps'}</span></div><div className="active-set-adjust"><button type="button" aria-label="Diminuir repetições ou tempo" onClick={() => handleModifyReps(activeModalExercise.id, setIdx, -1)}>−</button><button type="button" aria-label="Aumentar repetições ou tempo" onClick={() => handleModifyReps(activeModalExercise.id, setIdx, 1)}>+</button></div></div>
                      </div>
                    </section>
                    <button type="button" className="active-set-confirm" onClick={() => handleUpdateModalSet(activeModalExercise.id, setIdx, { completed: true })}><Check size={20} /><span>Confirmar série {setIdx + 1}</span><ChevronRight size={18} /></button>
                  </>}
                  <button type="button" className="active-set-guide" onClick={() => setShowExerciseInfo(true)}>Guia técnico do exercício <ChevronRight size={14} /></button>
                </div>;
              })()}
              {/* Exercise details and per-set controls use the existing session handlers. */}
              {showExerciseInfo && !getExercisePerformance(activeModalExercise).every(set => set.completed) && (
                <div className="horus-exercise-content space-y-4 pb-2">
                  <p className="horus-current-label">Exercício {selectedWorkout.exercises.findIndex(ex => ex.id === activeModalExercise.id) + 1} de {selectedWorkout.exercises.length} · {activeModalExercise.muscleGroup}</p>
                  <button type="button" aria-label="Abrir detalhe completo do exercício" onClick={() => setShowExerciseInfo(true)} className={`horus-exercise-media relative rounded-xl overflow-hidden h-44 w-full flex flex-col items-center justify-center p-1.5 shadow-inner border animate-fade-in ${
                    isLightTheme ? 'bg-white border-zinc-250' : 'bg-zinc-950 border-white/5'
                  }`}>
                    <img
                      key={`${activeModalExercise.id}-${showExerciseInfo}`}
                      src={(!showExerciseInfo && getExerciseThumbnail(activeModalExercise, getThumbnailPlan(user?.username, selectedWorkout || undefined))) || getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).gif}
                      alt={activeModalExercise.name}
                      className="max-h-[150px] w-auto max-w-[200px] rounded-lg object-contain"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={event => { if (showExerciseInfo) retryExerciseDetail(event.currentTarget, getExerciseThumbnail(activeModalExercise, getThumbnailPlan(user?.username, selectedWorkout || undefined))); else if (!retryThumbnail(event.currentTarget, getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).gif)) event.currentTarget.dataset.unavailable = 'true'; }}
                    />
                    <div className="horus-gif-fallback"><Dumbbell size={30} strokeWidth={1.5} /><span>Demonstração indisponível</span><small>Consulte o guia técnico abaixo</small></div>
                    <span className="absolute bottom-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/5 font-mono text-[6px] font-bold text-zinc-400 uppercase tracking-widest leading-none">DEMONSTRAÇÃO DE EXECUÇÃO</span>
                  </button>

              {/* Title Section */}
              <div className="horus-exercise-title space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className={`text-base font-black italic tracking-tight uppercase leading-none ${
                    isLightTheme ? 'text-zinc-950 font-[950]' : 'text-white'
                  }`}>
                    <button className="horus-exercise-name" onClick={() => setShowExerciseInfo(true)}>{activeModalExercise.name}</button>
                  </h2>
                  <button
                    aria-label={showExerciseInfo ? "Voltar à execução" : "Abrir informações do exercício"}
                    onClick={() => setShowExerciseInfo(!showExerciseInfo)}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                      showExerciseInfo
                        ? 'bg-accent/20 text-accent'
                        : (isLightTheme
                            ? 'bg-zinc-100 border border-zinc-250 text-zinc-500 hover:text-zinc-950'
                            : 'bg-zinc-900 border border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800')
                    }`}
                  >
                    <HelpCircle size={14} strokeWidth={2.5} />
                  </button>
                </div>
                <p className="horus-compact-meta">{activeModalExercise.sets} séries • {activeModalExercise.reps}{interpretPrescription(activeModalExercise).kind === 'time' ? '' : ' reps'}</p>
              </div>

                  <div className="horus-prescription horus-blue-card"><div><strong>{activeModalExercise.sets}</strong><span>Séries</span></div><div><strong>{activeModalExercise.reps}</strong><span>{interpretPrescription(activeModalExercise).kind === 'time' ? 'Tempo' : 'Repetições'}</span></div><div><strong>{activeModalExercise.rest}s</strong><span>Descanso</span></div></div>
                  {/* Standard Coaching Directives */}
                  <AnimatePresence>
                    {showExerciseInfo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`horus-technical-info horus-blue-card border rounded-xl p-3 space-y-2.5 text-left leading-relaxed mt-4 ${
                          isLightTheme ? 'border-zinc-250 bg-zinc-50' : 'border-white/5 bg-[#121216]/50'
                        }`}>
                          <div>
                            <span className={`text-[7px] font-black uppercase tracking-widest block leading-none font-mono ${
                              isLightTheme ? 'text-zinc-650' : 'text-zinc-400'
                            }`}>Instruções de Movimento</span>
                            <p className={`text-[10.5px] font-normal mt-0.5 leading-snug ${
                              isLightTheme ? 'text-zinc-950 font-bold' : 'text-white/75'
                            }`}>{getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).instructions}</p>
                          </div>
                          <div>
                            <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest block leading-none font-mono">Execução Perfeita</span>
                            <p className={`text-[10.5px] font-medium mt-0.5 leading-snug ${
                              isLightTheme ? 'text-emerald-950 font-bold' : 'text-emerald-200/95'
                            }`}>{getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).correctExecution}</p>
                          </div>
                          <div>
                            <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest block leading-none font-mono">Observações de Coach</span>
                            <p className={`text-[10.5px] font-medium mt-0.5 leading-snug italic font-bold ${
                              isLightTheme ? 'text-amber-650' : 'text-amber-200/90'
                            }`}>"{getExerciseDetails(activeModalExercise.name, activeModalExercise.muscleGroup).technique}"</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {showExerciseInfo && <button className="horus-action" onClick={() => setShowExerciseInfo(false)}>Voltar para registrar série</button>}
                  {modalRestTimeLeft !== null && <div className="active-set-rest" role="status">
                    <div><span>{modalRestTimeLeft === 0 ? 'Descanso concluído' : isModalRestPaused ? 'Descanso pausado' : 'Descanso'}</span><strong>{Math.floor(modalRestTimeLeft / 60).toString().padStart(2, '0')}:{(modalRestTimeLeft % 60).toString().padStart(2, '0')}</strong></div>
                    <button aria-label="Reduzir descanso em 10 segundos" onClick={() => setModalRestTimeLeft(prev => prev !== null ? Math.max(0, prev - 10) : 0)}>−10s</button>
                    <button aria-label={isModalRestPaused ? 'Retomar descanso' : 'Pausar descanso'} onClick={() => setIsModalRestPaused(p => !p)}>{isModalRestPaused ? <Play size={16} /> : <Pause size={16} />}</button>
                    <button aria-label="Aumentar descanso em 10 segundos" onClick={() => setModalRestTimeLeft(prev => prev !== null ? prev + 10 : 10)}>+10s</button>
                    <button onClick={() => setModalRestTimeLeft(null)}>Pular descanso</button>
                  </div>}
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

    </div>
  );
};

// getNextSetLabelForTimer is implemented dynamically inside the component
