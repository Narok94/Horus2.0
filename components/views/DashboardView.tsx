import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { AppTab } from '../../types';
import {
  Play,
  CheckCircle2,
  Flame,
  LogOut,

  Bell,

  X,
  Clock,
  Calendar,
  Dumbbell,

} from 'lucide-react';

const getInitials = (name: string): string => {
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const DashboardView: React.FC = () => {
  const {
    user,
    allWorkouts,
    setActiveTab,
    setSelectedWorkout,
    logout,

    toggleCheckInDate,
    addToast,

    isWorkoutActive,
    selectedWorkout: currentSelected
  } = useStore();

  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const handleVibrate = (duration = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  const handleToggleDay = (dia: string, dateStr: string, wasChecked: boolean) => {
    handleVibrate(30);
    toggleCheckInDate(dateStr);
    if (addToast) {
      if (wasChecked) {
        addToast(`Presença de ${dia} removida com sucesso.`, 'info');
      } else {
        addToast(`Presença de ${dia} confirmada! +45 XP obtido`, 'success');
      }
    }
  };

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    // Adjust today to prevent timezone shift if running near midnight
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const weekDays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
  const currentWeekWorkoutsCount = weekDates.filter(date => user.checkIns?.includes(date)).length;
  const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const rawWorkouts = allWorkouts[user.username.toLowerCase() as keyof typeof allWorkouts] || [];
  const workouts = rawWorkouts;

  // Find index of the most recently finished workout in the user's history
  const lastCompleted = user.history && user.history.length > 0 ? user.history[0] : null;
  const lastWorkoutIndex = lastCompleted
    ? workouts.findIndex(w => w.id === lastCompleted.workoutId || w.title.toLowerCase() === lastCompleted.workoutTitle.toLowerCase())
    : -1;

  // Check if user set a manual preferred workout in settings
  let nextWorkout: any = null;
  if (user.preferredWorkoutId) {
    const prefId = user.preferredWorkoutId;
    const pref = workouts.find(w => w.id === prefId || w.title.toLowerCase().includes(prefId.toLowerCase()));
    if (pref) {
      nextWorkout = pref;
    }
  }

  // The next recommended workout is the next one in the array sequence. If last was -1, it starts from workouts[0].
  if (!nextWorkout) {
    const nextWorkoutIndex = lastWorkoutIndex > -1 ? (lastWorkoutIndex + 1) % workouts.length : 0;
    nextWorkout = workouts[nextWorkoutIndex] || workouts[0] || null;
  }

  const startActiveWorkout = () => {
    handleVibrate(40);
    if (isWorkoutActive && currentSelected) {
       setActiveTab(AppTab.WORKOUT);
       return;
    }
    if (nextWorkout) {
      setSelectedWorkout(nextWorkout);
      setActiveTab(AppTab.WORKOUT);
    } else {
      setActiveTab(AppTab.WORKOUT);
    }
  };

  const viewWorkoutsList = () => {
    handleVibrate(15);
    setActiveTab(AppTab.WORKOUT);
  };

  return <section className="horus-screen horus-home">
    <header className="horus-home-header">
      <div className="horus-home-identity"><span className="horus-home-avatar">{getInitials(user.name)}</span><div><p>Olá, {user.name.split(' ')[0]} 👋</p><h1>Pronto para evoluir hoje?</h1><small>Disciplina hoje, resultado sempre.</small></div></div>
      <div className="horus-home-tools"><span className="horus-icon-button horus-green" title="Dados salvos neste dispositivo"><CheckCircle2 size={17} /></span><button className="horus-icon-button" aria-label="Notificações" onClick={() => { handleVibrate(15); setShowNotificationDrawer(!showNotificationDrawer); }}><Bell size={18} /></button><button className="horus-icon-button" aria-label="Sair" title="Sair" onClick={() => { handleVibrate(15); logout(); }}><LogOut size={17} /></button></div>
    </header>
    <div className="horus-today-card horus-card">
      <div className="horus-today-eyebrow"><span>Treino de hoje</span><span className="horus-today-symbol"><Dumbbell size={25} strokeWidth={1.5} /></span></div>
      <h2>{nextWorkout ? nextWorkout.title : 'TREINO RESGATADO'}</h2><p>{nextWorkout ? nextWorkout.description : 'Carregando suas séries...'}</p>
      <div className="horus-today-stats"><span><Dumbbell size={17} /><strong>{nextWorkout?.exercises?.length || 0}</strong> exercícios</span><span><Clock size={17} /><strong>45</strong> min estimados</span></div>
      <button className="horus-action horus-today-start" onClick={startActiveWorkout}><Play size={17} fill="currentColor" />{isWorkoutActive ? 'Continuar treino' : 'Iniciar treino'}</button>
      <button className="horus-today-all" onClick={viewWorkoutsList}>Todos os treinos <Dumbbell size={15} /></button>
    </div>
    <div className="horus-week horus-card">
      <div className="horus-week-title"><h2>Frequência semanal</h2><span>{currentWeekWorkoutsCount}<small>/7 dias</small></span></div>
      <div className="horus-week-days">{weekDays.map((dia, idx) => {
        const dateStr = weekDates[idx]; const isToday = currentDayIndex === idx; const treinou = user.checkIns?.includes(dateStr) || false;
        return <button key={idx} className={`${isToday ? 'today' : ''} ${treinou ? 'completed' : ''}`} aria-label={`${dia}${treinou ? ', concluído' : ''}${isToday ? ', hoje' : ''}`} onClick={() => handleToggleDay(dia, dateStr, treinou)}><span>{dia}</span><span className="horus-day-mark">{treinou ? <CheckCircle2 size={19} /> : <span className="horus-day-dot" />}</span></button>;
      })}</div>
    </div>
    <div className="horus-home-metrics">
      <div className="horus-card"><span className="horus-small-icon"><Flame size={19} className="horus-orange" /></span><small>Sequência</small><strong>{user.streak || 0}<span> dias</span></strong><p>Mantenha o ritmo</p></div>
      <div className="horus-card"><span className="horus-small-icon"><Clock size={19} /></span><small>Tempo total</small><strong>{user.totalWorkouts > 0 ? `${Math.max(1, Math.round((user.totalWorkouts * 45) / 60))}h` : '0h'}</strong><p>Estimado</p></div>
      <div className="horus-card"><span className="horus-small-icon"><Calendar size={19} /></span><small>Recomendado</small><strong className="horus-recommendation" title={nextWorkout ? nextWorkout.title : ''}>{nextWorkout ? nextWorkout.title : 'Nenhum'}</strong><p>Sua sequência</p></div>
    </div>
        {showNotificationDrawer && (
          <div className="horus-home-notifications fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white border-l border-zinc-200 shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in">
            <div className="pt-12 pb-4 px-4 sm:p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h4 className="text-xs font-black tracking-widest text-[#2563EB] uppercase flex items-center gap-1.5 leading-none">
                <Bell size={13} />
                CENTRAL DE NOTIFICAÇÕES
              </h4>
              <button
                onClick={() => {
                  handleVibrate(15);
                  setShowNotificationDrawer(false);
                }}
                className="p-1.5 bg-zinc-100 hover:bg-zinc-200 hover:text-black text-zinc-500 rounded-lg cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar text-left">
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-1">
                <span className="text-[8px] font-black tracking-widest text-[#2563EB] uppercase">NOVO TREINO DISPONÍVEL</span>
                <p className="text-[11px] font-extrabold text-zinc-950">Seu Treino A foi atualizado!</p>
                <p className="text-[10px] text-zinc-500 font-medium">Confira suas cargas de agachamento e supino antes de treinar.</p>
                <span className="text-[8.5px] font-bold text-[#2563EB]/80 block pt-1">Há 10 minutos</span>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-1">
                <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">SISTEMA</span>
                <p className="text-[11px] font-extrabold text-zinc-950">Conquista Desbloqueada 🚀</p>
                <p className="text-[10px] text-zinc-500 font-medium">Você completou 12 dias de sequência hoje! Continue focado.</p>
                <span className="text-[8.5px] font-bold text-zinc-400 block pt-1">Há 2 horas</span>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-1">
                <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">SISTEMA</span>
                <p className="text-[11px] font-extrabold text-zinc-950">Check-in Automático</p>
                <p className="text-[10px] text-zinc-500 font-medium">Você marcou presença na academia hoje por geolocalização.</p>
                <span className="text-[8.5px] font-bold text-zinc-400 block pt-1">Ontem</span>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 text-center">
              <button
                onClick={() => {
                  handleVibrate(15);
                  setShowNotificationDrawer(false);
                }}
                className="text-[10px] font-black text-[#2563EB] tracking-wider uppercase hover:underline cursor-pointer"
              >
                FECHAR NOTIFICAÇÕES
              </button>
            </div>
          </div>
        )}

  </section>;
};
