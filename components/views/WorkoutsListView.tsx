import { createInitialPerformance, interpretPrescription } from '../../src/utils/workoutPrescription';
import React from 'react';
import { Play, Activity, Flame, Zap, Target, Star, CheckCircle2, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import { AppTab, WorkoutRoutine } from '../../types';

const workoutThemes = [
  {
    color: '#EF4444',
    icon: Flame,
    bgClass: 'bg-red-500'
  },
  {
    color: '#10B981',
    icon: Zap,
    bgClass: 'bg-emerald-500'
  },
  {
    color: '#8B5CF6',
    icon: Target,
    bgClass: 'bg-violet-500'
  },
  {
    color: '#F59E0B',
    icon: Star,
    bgClass: 'bg-amber-500'
  },
  {
    color: '#06B6D4',
    icon: Activity,
    bgClass: 'bg-cyan-500'
  },
  {
    color: '#EC4899',
    icon: Flame,
    bgClass: 'bg-pink-500'
  }
];

export const WorkoutsListView: React.FC = () => {
  const { user, allWorkouts, setSelectedWorkout, setActiveTab, isWorkoutActive, selectedWorkout: currentSelected, addToast, registerCompletedWorkout, triggerConfetti } = useStore();

  if (!user) return null;

  const rawWorkouts = allWorkouts[user.username.toLowerCase() as keyof typeof allWorkouts] || [];
  const workouts = rawWorkouts;

  const handleVibrate = (ms = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const startWorkout = (workout: WorkoutRoutine) => {
    handleVibrate(20);
    if (isWorkoutActive && currentSelected && currentSelected.id !== workout.id) {
       if (addToast) addToast('Uma sessão já está em andamento. Finalize ou descarte para iniciar outra.', 'info');
       setActiveTab(AppTab.WORKOUT);
       return;
    }
    setSelectedWorkout(workout);
    setActiveTab(AppTab.WORKOUT);
  };

  const handleQuickCompleteWorkout = (workout: WorkoutRoutine) => {
    handleVibrate(25);
    // A conclusão rápida não deve substituir uma sessão real em andamento.
    if (useStore.getState().isWorkoutActive) {
      addToast?.('Finalize ou descarte a sessão em andamento antes de concluir rapidamente.', 'info');
      return;
    }
    if (workout.exercises.some(ex => ['failure', 'invalid'].includes(interpretPrescription(ex).kind))) {
      addToast?.('Registre as séries na execução para concluir este treino.', 'info');
      return;
    }
    const currentUser = useStore.getState().user;
    if (!currentUser) return;
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const progress = Object.fromEntries(workout.exercises.map(ex => [ex.id,
      createInitialPerformance(ex, currentUser.weights).map(set => ({ ...set, completed: true }))
    ]));
    // Um registro rápido por rotina/dia: chamadas repetidas não inventam outra sessão.
    if (!registerCompletedWorkout(workout, progress, 2700, `quick:${workout.id}:${today}`)) {
      addToast?.('Este treino já foi concluído rapidamente hoje.', 'info');
      return;
    }

    if (triggerConfetti) {
      triggerConfetti();
    }

    if (addToast) {
      addToast(`Treino "${workout.title}" concluído! Todas as séries marcadas! 🎉`, 'success');
    }
  };

  const getWorkoutFocus = (workout: WorkoutRoutine) => {
    if (workout.id === 'h-pump' || workout.title.toLowerCase().includes('pump')) {
      return 'Treino de Pump';
    }
    const groups = Array.from(new Set(workout.exercises.map(ex => ex.muscleGroup)))
      .filter(g => g && g.toLowerCase() !== 'manguito')
      .map(g => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase());

    if (groups.length > 0) {
      if (groups.length > 1) {
        const last = groups[groups.length - 1];
        const rest = groups.slice(0, -1).join(', ');
        return `${rest} e ${last}`;
      }
      return groups[0];
    }
    return workout.title.replace(/Treino\s+[A-Z]\s*-\s*/i, '');
  };

  const getWorkoutCardLabel = (workout: WorkoutRoutine, index: number) => {
    if (workout.id === 'h-pump' || workout.title.toLowerCase().includes('pump') || workout.title.toLowerCase().includes('extra')) {
      return 'Treino Pump';
    }
    const match = workout.title.match(/Treino\s+([A-Z])/i);
    if (match) {
      return `Treino ${match[1].toUpperCase()}`;
    }
    return `Treino ${String.fromCharCode(65 + index)}`;
  };

  return <section className="horus-screen horus-workouts">
    <header className="horus-page-header"><h1>Treinos</h1><p>Escolha sua rotina e comece a evoluir.</p></header>
    <div className="horus-workout-list">{workouts.map((workout, index) => {
      const focus = getWorkoutFocus(workout);
      const label = getWorkoutCardLabel(workout, index);
      const exerciseCount = workout.exercises.length;
      const cleanDesc = workout.description ? workout.description.replace(/^Foco:\s*/i, '') : 'Fisiologia linear de sobrecarga progressiva.';
      const themeInfo = workoutThemes[index % workoutThemes.length];
      const ThemeIcon = themeInfo.icon;
      const continuing = isWorkoutActive && currentSelected?.id === workout.id;
      return <article key={workout.id} className={`horus-workout-card horus-card ${continuing ? 'continuing' : ''}`} style={{ borderLeftColor: themeInfo.color }} onClick={() => startWorkout(workout)}>
        <div className="horus-workout-card-top"><span className="horus-workout-symbol" style={{ color: themeInfo.color, backgroundColor: `${themeInfo.color}15`, borderColor: `${themeInfo.color}35` }}><ThemeIcon size={23} /></span><div className="horus-workout-copy"><div className="horus-workout-labels"><span className="horus-workout-badge" style={{ color: themeInfo.color, backgroundColor: `${themeInfo.color}15` }}>{label}</span><span>{exerciseCount} exercícios</span></div><h2>{focus}</h2><p>{cleanDesc}</p></div><ChevronRight className="horus-workout-chevron" size={18} aria-hidden="true" /></div>
        <div className="horus-workout-actions"><button className="horus-workout-start" onClick={event => { event.stopPropagation(); startWorkout(workout); }}><Play size={14} fill="currentColor" />{continuing ? 'Continuar' : 'Iniciar'}</button><button className="horus-workout-complete" title="Marcar treino como 100% concluído" onClick={event => { event.stopPropagation(); handleQuickCompleteWorkout(workout); }}><CheckCircle2 size={14} />Concluir tudo</button></div>
      </article>;
    })}</div>
    <p className="horus-workouts-footer"><Activity size={13} />Fichas atualizadas pelo Treinador</p>
  </section>;
};
