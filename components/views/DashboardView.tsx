import { getDivisionThumbnail, getThumbnailPlan } from '../../src/utils/workoutThumbnails';
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { AppTab } from '../../types';
import {
  Play,
  CheckCircle2,
  Flame,
  LogOut,


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

  const [unavailableDivision, setUnavailableDivision] = useState<string | null>(null);
  const [unavailableAvatar, setUnavailableAvatar] = useState<string | null>(null);
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

  const heroWorkout = isWorkoutActive && currentSelected ? currentSelected : nextWorkout;
  const heroThumbnail = heroWorkout ? getDivisionThumbnail(heroWorkout, getThumbnailPlan(user?.username, heroWorkout)) : undefined;
  const showHeroThumbnail = !!heroThumbnail && unavailableDivision !== heroThumbnail;

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

  return (
      <div className="horus-original-dashboard w-full min-h-screen flex flex-col justify-start gap-3 bg-transparent text-zinc-950 font-sans antialiased select-none relative pt-12 sm:pt-6 pb-40 px-1">

        {/* 1. HEADER COUPE - EXTREME CLEAN */}
        <header className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Round bold initial avatar */}
            <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-black text-xs tracking-tight shadow-md shrink-0">
              {user.avatar && unavailableAvatar !== user.avatar ? <img className="w-full h-full object-cover rounded-full" src={user.avatar} alt="Foto de perfil" onError={() => setUnavailableAvatar(user.avatar || null)} /> : getInitials(user.name)}
            </div>
            <div className="text-left leading-none">
              <span className="text-zinc-500 text-[10px] font-extrabold flex items-center gap-1 leading-none uppercase tracking-wider">
                Olá, {user.name.split(' ')[0]} 👋
              </span>
              <h1 className="text-[17px] font-[900] text-zinc-950 tracking-tighter leading-none mt-1 font-sans">
                Pronto para evoluir hoje?
              </h1>
              <p className="text-zinc-400 text-[9px] font-medium leading-none mt-0.5">
                Disciplina hoje, resultado sempre.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                handleVibrate(15);
                logout();
              }}
              className="p-2 bg-white border border-zinc-200/60 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={12} />
            </button>
          </div>
        </header>

        {/* 2. CARD HERO PRINCIPAL - TREINO DE HOJE (Slimmer and more compact) */}
        <div className="performance-today w-full bg-gradient-to-br from-[#2563EB] to-[#0A192F] rounded-[22px] p-4.5 md:py-4 text-white relative shadow-lg shadow-blue-900/10 overflow-hidden flex flex-col justify-between min-h-[195px] md:min-h-0 shrink-0">
          {/* Subtle flare behind dumbbell */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-start w-full relative z-10">
            {/* Info Text Stack - Compact block spacing */}
            <div className="space-y-2.5 text-left relative z-20 max-w-[75%]">
              <span className="inline-block bg-white/10 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border border-white/10 shrink-0 select-none backdrop-blur-sm">
                TREINO DE HOJE
              </span>

              <div className="space-y-1">
                <h2 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight uppercase leading-tight m-0 p-0 text-white drop-shadow-sm pr-2">
                  {nextWorkout ? nextWorkout.title : 'TREINO RESGATADO'}
                </h2>
                <p className="text-white/85 text-[12px] font-medium tracking-wide leading-snug line-clamp-2 pr-2">
                  {nextWorkout ? nextWorkout.description : 'Carregando suas séries...'}
                </p>
              </div>

              {/* Dynamic stats row */}
              <div className="flex items-center gap-3.5 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white shrink-0">
                    <Clock size={11} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col text-left leading-none justify-center">
                    <span className="text-[11px] font-black text-white">45</span>
                    <span className="text-[7.5px] text-white/50 font-black uppercase tracking-wider mt-0.5">minutos</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white shrink-0">
                    <Dumbbell size={11} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col text-left leading-none justify-center">
                    <span className="text-[11px] font-black text-white">{nextWorkout?.exercises?.length || 0}</span>
                    <span className="text-[7.5px] text-white/50 font-black uppercase tracking-wider mt-0.5">exercícios</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium 3D Isometric Dumbbell SVG Graphic - Repositioned and resized for compactness */}
            <div data-plan={getThumbnailPlan(user.username, heroWorkout || undefined)} className={`performance-hero-art absolute right-[-15px] top-[-15px] w-28 h-28 pointer-events-none select-none z-0 ${showHeroThumbnail ? 'opacity-100' : 'opacity-40'}`}>
              {showHeroThumbnail ? <img src={heroThumbnail} alt="" className="w-full h-full object-contain" onError={() => setUnavailableDivision(heroThumbnail!)} /> : (<svg viewBox="0 0 200 200" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="barGradientPremium" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#CBD5E1" />
                    <stop offset="50%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                  <linearGradient id="plateGradientPremium" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="60%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                  <linearGradient id="blueGlowPremium" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                  <filter id="paintsShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="4" dy="8" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
                  </filter>
                </defs>
                <ellipse cx="100" cy="158" rx="45" ry="8" fill="#000000" opacity="0.25" filter="blur(5px)" />
                <g transform="rotate(-26 100 100)" filter="url(#paintsShadow)">
                  <ellipse cx="50" cy="100" rx="14" ry="32" fill="url(#plateGradientPremium)" />
                  <ellipse cx="43" cy="100" rx="14" ry="34" fill="url(#plateGradientPremium)" />
                  <ellipse cx="35" cy="100" rx="14" ry="36" fill="url(#plateGradientPremium)" />
                  <rect x="42" y="94" width="116" height="12" rx="2.5" fill="url(#barGradientPremium)" />
                  <line x1="70" y1="94" x2="70" y2="106" stroke="#334155" strokeWidth="0.8" />
                  <line x1="80" y1="94" x2="80" y2="106" stroke="#334155" strokeWidth="0.8" />
                  <line x1="90" y1="94" x2="90" y2="106" stroke="#334155" strokeWidth="0.8" />
                  <line x1="100" y1="94" x2="100" y2="106" stroke="#334155" strokeWidth="0.8" />
                  <line x1="110" y1="94" x2="110" y2="106" stroke="#334155" strokeWidth="0.8" />
                  <line x1="120" y1="94" x2="120" y2="106" stroke="#334155" strokeWidth="0.8" />
                  <line x1="130" y1="94" x2="130" y2="106" stroke="#334155" strokeWidth="0.8" />
                  <ellipse cx="150" cy="100" rx="14" ry="32" fill="url(#plateGradientPremium)" />
                  <ellipse cx="158" cy="100" rx="14" ry="34" fill="url(#blueGlowPremium)" />
                  <ellipse cx="166" cy="100" rx="14" ry="36" fill="url(#plateGradientPremium)" />
                  <ellipse cx="165" cy="100" rx="8" ry="18" fill="#2563EB" stroke="#60A5FA" strokeWidth="1" />
                  <text x="165" y="104.5" fill="#FFFFFF" fontSize="12" fontWeight="950" fontFamily="sans-serif" textAnchor="middle" transform="rotate(26 165 100)">H</text>
                </g>
              </svg>)}
            </div>
          </div>

          {/* Compact CTA Trigger padding */}
          <div className="flex flex-col gap-2 mt-3.5 relative z-10 w-full">
            <button
              onClick={startActiveWorkout}
              className="w-full bg-white hover:bg-zinc-150 active:scale-[0.98] text-[#2563EB] font-black uppercase text-[10px] py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 tracking-wider shadow-md border-0"
            >
              <Play size={11} className="fill-[#2563EB] stroke-none" />
              <span>{isWorkoutActive ? 'CONTINUAR TREINO' : 'INICIAR TREINO'}</span>
            </button>

            <button
              onClick={viewWorkoutsList}
              className="w-full bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white border border-white/20 font-black uppercase text-[10px] py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 tracking-wider backdrop-blur-sm"
            >
              <Dumbbell size={11} className="text-white" />
              <span>TODOS OS TREINOS</span>
            </button>
          </div>
        </div>

        {/* Wrapper for side-by-side md: Grid */}
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 w-full">
          {/* 3. WEEK FREQUENCY DISPLAY (Premium Blue Background and White Text) */}
          <div className="dashboard-frequency bg-gradient-to-br from-[#2563EB] to-[#122C60] border border-white/10 rounded-[20px] p-4 space-y-3.5 text-left shadow-lg shadow-blue-900/5 shrink-0">
            <div className="flex justify-between items-center h-4 leading-none">
              <h3 className="text-[9px] font-black tracking-widest uppercase text-white font-sans">
                FREQUÊNCIA SEMANAL
              </h3>
              <span className="bg-white/10 border border-white/10 text-white px-2.5 py-1 rounded-full text-[9px] font-black tracking-tight leading-none">
                {currentWeekWorkoutsCount}/7 dias
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 pt-0.5">
              {weekDays.map((dia, idx) => {
                const dateStr = weekDates[idx];
                const isToday = currentDayIndex === idx;
                const treinou = user.checkIns?.includes(dateStr) || false;

                return (
                  <button
                    key={idx}
                    aria-label={`${dia}${treinou ? ", concluído" : ""}${isToday ? ", hoje" : ""}`}
                    onClick={() => handleToggleDay(dia, dateStr, treinou)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer bg-transparent border-0 outline-none p-0 focus:outline-none"
                  >
                    <span className={`text-[9px] font-extrabold tracking-wider ${
                      isToday ? 'text-white font-black scale-105' : 'text-white/60'
                    }`}>
                      {dia}
                    </span>
                    <div className="relative">
                      {treinou ? (
                        <div className="w-7 h-7 rounded-full bg-white text-[#2563EB] flex items-center justify-center shadow shadow-black/15">
                          <CheckCircle2 size={12} className="text-[#2563EB] fill-[#2563EB]/15 animate-fade" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border border-white/20 bg-white/5 flex hover:bg-white/10 transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. SUMMARY METRIC TRIPLE CARDS (Premium Blue Background and White Text) */}
          <div className="dashboard-metrics grid grid-cols-3 gap-2 w-full shrink-0 md:flex md:flex-row md:gap-3">
            {/* Card 1: Sequência */}
            <div className="bg-gradient-to-br from-[#2563EB] to-[#122C60] border border-white/10 rounded-xl p-3 space-y-1.5 flex flex-col justify-between text-left shadow-lg min-h-[96px] min-w-0 md:flex-1">
              <div className="w-6.5 h-6.5 rounded-full bg-white/15 flex items-center justify-center text-orange-400 shrink-0">
                <Flame size={12} className="fill-orange-400/20" />
              </div>

              <div className="leading-none space-y-0.5">
                <span className="text-[7px] font-black uppercase tracking-wider text-white/50">
                  SEQUÊNCIA
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-extrabold text-white leading-none">{user.streak || 0}</span>
                  <span className="text-[9px] font-bold text-white/70 leading-none">dias</span>
                </div>
              </div>

              <p className="text-[8px] text-white/80 font-medium leading-none">
                Mantenha o ritmo!
              </p>
            </div>

            {/* Card 2: Tempo Total */}
            <div className="bg-gradient-to-br from-[#2563EB] to-[#122C60] border border-white/10 rounded-xl p-3 space-y-1.5 flex flex-col justify-between text-left shadow-lg min-h-[96px] md:flex-1">
              <div className="w-6.5 h-6.5 rounded-full bg-white/15 flex items-center justify-center text-blue-200 shrink-0">
                <Clock size={12} />
              </div>

              <div className="leading-none space-y-0.5">
                <span className="text-[7px] font-black uppercase tracking-wider text-white/50">
                  TEMPO TOTAL
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-extrabold text-white leading-none">
                    {user.totalWorkouts > 0 ? `${Math.max(1, Math.round((user.totalWorkouts * 45) / 60))}h` : '0h'}
                  </span>
                  <span className="text-[9px] font-bold text-white/70 leading-none flex items-center">dedicado</span>
                </div>
              </div>

              <p className="text-[8px] text-white/80 font-medium leading-none">
                Treino consistente
              </p>
            </div>

            {/* Card 3: Próximo Treino */}
            <div className="bg-gradient-to-br from-[#2563EB] to-[#122C60] border border-white/10 rounded-xl p-3 space-y-1.5 flex flex-col justify-between text-left shadow-lg min-h-[96px] md:flex-1">
              <div className="w-6.5 h-6.5 rounded-full bg-white/15 flex items-center justify-center text-indigo-300 shrink-0">
                <Calendar size={12} />
              </div>

              <div className="leading-none space-y-0.5">
                <span className="text-[7px] font-black uppercase tracking-wider text-white/50">
                  RECOMENDADO
                </span>
                <div className="space-y-0.5">
                  <span className="text-[12px] font-black text-white block leading-none truncate">{nextWorkout ? nextWorkout.title : 'Nenhum'}</span>
                  <span className="text-[8px] font-bold text-white/60 block leading-none">Sua sequência</span>
                </div>
              </div>

              <p className="text-[8px] text-white/80 font-bold leading-none truncate" title={nextWorkout ? nextWorkout.description : ''}>
                {nextWorkout ? nextWorkout.description : 'Treinos em dia.'}
              </p>
            </div>
          </div>
        </div>

      </div>
  );
};
