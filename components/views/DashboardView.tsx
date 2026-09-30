import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { AppTab } from '../../types';
import { 
  Play, 
  CheckCircle2, 
  Flame, 
  LogOut, 
  Trophy, 
  Zap, 
  Sparkles, 
  Bell,
  Award,
  X,
  Clock,
  Calendar,
  Dumbbell,
  Utensils,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { henriqueDiet, jessicaDiet } from '../../src/data/dietPlans';

const getInitials = (name: string): string => {
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getJulyPoints = (u: any) => {
  if (!u) return { total: 0, workoutsCount: 0, cardioCount: 0, mealsCount: 0, workoutPoints: 0, cardioPoints: 0, mealPoints: 0 };
  
  let workoutsCount = 0;
  let cardioCount = 0;
  
  // 1. Workouts and Cardio in July 2026
  if (u.history) {
    u.history.forEach((entry: any) => {
      if (entry.date && entry.date.includes('-07-')) {
        workoutsCount++;
        if (entry.cardio?.completed) {
          cardioCount++;
        }
      }
    });
  }
  
  const workoutPoints = workoutsCount * 100;
  const cardioPoints = cardioCount * 50;
  const mealPoints = 0;
  const total = workoutPoints + cardioPoints;
  
  return {
    total,
    workoutsCount,
    cardioCount,
    mealsCount: 0,
    workoutPoints,
    cardioPoints,
    mealPoints
  };
};

const getStudentJulyPoints = (username: string, currentLoggedUser: any) => {
  if (currentLoggedUser && currentLoggedUser.username.toLowerCase() === username.toLowerCase()) {
    return getJulyPoints(currentLoggedUser);
  }
  try {
    const saved = localStorage.getItem(`tatugym_user_profile_${username.toLowerCase()}`);
    if (saved) {
      const parsedUser = JSON.parse(saved);
      return getJulyPoints(parsedUser);
    }
  } catch (e) {
    console.error('Error loading other user points:', e);
  }
  // Fallbacks - Zeroed out as requested
  return { total: 0, workoutsCount: 0, cardioCount: 0, mealsCount: 0, workoutPoints: 0, cardioPoints: 0, mealPoints: 0 };
};

const AnilhaIcon: React.FC<{ active: boolean; current: boolean; accentColor?: string; isLight?: boolean }> = ({ active, current, accentColor: propAccentColor, isLight }) => {
  const accentColor = propAccentColor || '#2563EB';
  const strokeColor = active ? accentColor : (current ? accentColor : (isLight ? '#CBD5E1' : '#27272A'));
  const innerFill = active ? strokeColor : (isLight ? '#F1F5F9' : '#09090B');
  
  return (
    <div className="relative flex items-center justify-center pointer-events-none">
      <svg 
        viewBox="0 0 100 100" 
        className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
          active ? 'scale-110 drop-shadow-[0_0_8px_rgba(var(--accent-color-rgb),0.5)]' : ''
        } ${current && !active ? 'animate-pulse' : ''}`} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer bumper plate rim */}
        <circle 
          cx="50" 
          cy="50" 
          r="42" 
          stroke={strokeColor} 
          strokeWidth="11" 
          className="transition-colors duration-300"
        />
        
        {/* Inner track ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="25" 
          stroke={strokeColor} 
          strokeWidth="3.5" 
          strokeDasharray={active ? "none" : "4 4"}
          className="transition-all duration-300"
          opacity={active ? 0.9 : 0.4}
        />
        
        {/* Central center hole insert */}
        <circle 
          cx="50" 
          cy="50" 
          r="11" 
          fill={innerFill} 
          stroke={strokeColor} 
          strokeWidth="3" 
          className="transition-all duration-300"
        />
        
        {/* Technical structural spokes */}
        <path d="M 50 14 L 50 20" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" opacity={active ? 0.85 : 0.25} />
        <path d="M 50 80 L 50 86" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" opacity={active ? 0.85 : 0.25} />
        <path d="M 14 50 L 20 50" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" opacity={active ? 0.85 : 0.25} />
        <path d="M 80 50 L 86 50" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" opacity={active ? 0.85 : 0.25} />
      </svg>
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const { 
    user, 
    allWorkouts, 
    setActiveTab, 
    setSelectedWorkout, 
    logout, 
    handleManualCheckIn,
    toggleCheckInDate,
    addToast,
    updateUserProfile,
    triggerConfetti,
    isWorkoutActive,
    selectedWorkout: currentSelected,
    syncStatus,
    syncUserProfile
  } = useStore();

  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const isTeste1 = true;
  const isTeacher = user.username.toLowerCase() === 'teste3' || user.username.toLowerCase().includes('flavia');
  const accentColor = '#2563EB';

  const handleVibrate = (duration = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const todayStr = now.toISOString().split('T')[0];
  const checkedInToday = user.checkIns?.includes(todayStr) || false;

  const handleCheckInClick = () => {
    handleVibrate(30);
    handleManualCheckIn();
    if (addToast) addToast('Check-in rápido registrado com sucesso! +45 XP obtido', 'success');
  };

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

  const totalWorkoutsCount = user.totalWorkouts || 0;
  const checkInsCount = user.checkIns?.length || 0;
  const totalXP = (totalWorkoutsCount * 125) + (checkInsCount * 45);
  const xpPerLevel = 500;
  const currentLevel = Math.floor(totalXP / xpPerLevel) + 1;
  const xpInCurrentLevel = totalXP % xpPerLevel;
  const xpPercentage = Math.min(100, Math.max(8, (xpInCurrentLevel / xpPerLevel) * 100));

  const getGreeting = () => {
    const hr = currentTime.getHours();
    if (hr >= 5 && hr < 12) return 'Bom dia';
    if (hr >= 12 && hr < 18) return 'Boa tarde';
    return 'Boa noite';
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

  const usernameLower = user.username.toLowerCase();
  const isHenrique = usernameLower === 'teste1' || usernameLower.includes('henrique');
  const isJessica = usernameLower === 'jessica' || usernameLower.includes('jessica');
  
  // Get active user's diet meals for logging
  let userMeals: string[] = [];
  if (isHenrique) {
    userMeals = henriqueDiet.meals.map(m => m.name);
  } else if (isJessica) {
    userMeals = jessicaDiet.meals.map(m => m.name);
  }

  const toggleMealCompletion = (mealName: string) => {
    handleVibrate(30);
    const completedMeals = user.completedMeals ? { ...user.completedMeals } : {};
    const todayCompletedList = completedMeals[todayStr] ? [...completedMeals[todayStr]] : [];
    
    const index = todayCompletedList.indexOf(mealName);
    let isAdding = false;
    if (index > -1) {
      todayCompletedList.splice(index, 1);
    } else {
      todayCompletedList.push(mealName);
      isAdding = true;
    }
    
    completedMeals[todayStr] = todayCompletedList;
    updateUserProfile({ completedMeals });
    
    if (isAdding) {
      triggerConfetti();
      if (addToast) addToast(`Refeição "${mealName}" registrada! +30 Pontos no Projeto Julho`, 'success');
    } else {
      if (addToast) addToast(`Refeição "${mealName}" removida.`, 'info');
    }
  };

  // Get current scores for Henrique and Jessica
  const henriquePointsData = getStudentJulyPoints('teste1', user);
  const jessicaPointsData = getStudentJulyPoints('jessica', user);

  const rawWorkouts = allWorkouts[user.username.toLowerCase() as keyof typeof allWorkouts] || allWorkouts['teste1'] || allWorkouts['henrique'] || [];
  const workouts = rawWorkouts.filter(w => w.id !== 'h-f');
  
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


  // Upcoming Meals Logic
  const dietPlan = user.dietPlan;
  let upcomingMeals: any[] = [];
  if (dietPlan && dietPlan.meals && dietPlan.meals.length > 0) {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const now = new Date(Date.now() - tzOffset);
    const today = now.toISOString().split('T')[0];
    const currentHours = now.getUTCHours();
    const currentMinutes = now.getUTCMinutes();
    const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    
    const todayCompletedMeals = user.completedMeals && user.completedMeals[today] ? user.completedMeals[today] : [];

    const upcomingToday = dietPlan.meals.filter(m => m.time >= currentTimeStr);
    
    if (upcomingToday.length > 0) {
      upcomingMeals = upcomingToday.slice(0, 3).map(m => ({ ...m, isTomorrow: false, isCompleted: todayCompletedMeals.includes(m.id) }));
    } else {
      const tomorrowStr = new Date(Date.now() - tzOffset + 86400000).toISOString().split('T')[0];
      const tomorrowCompletedMeals = user.completedMeals && user.completedMeals[tomorrowStr] ? user.completedMeals[tomorrowStr] : [];
      upcomingMeals = [ { ...dietPlan.meals[0], isTomorrow: true, isCompleted: tomorrowCompletedMeals.includes(dietPlan.meals[0].id) } ];
    }
  }

  if (isTeste1) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-start gap-3 bg-transparent text-zinc-950 font-sans antialiased select-none relative pt-12 sm:pt-6 pb-40 px-1">
        
        {/* 1. HEADER COUPE - EXTREME CLEAN */}
        <header className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Round bold initial avatar */}
            <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-black text-xs tracking-tight shadow-md shrink-0">
              {getInitials(user.name)}
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
            {/* REAL-TIME NEON DB CLOUD SYNC BUTTON */}
            <button
              onClick={() => {
                handleVibrate(30);
                syncUserProfile(user.username);
              }}
              title="Sincronizar"
              className={`p-2 border transition-all rounded-xl cursor-pointer flex items-center justify-center relative shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${
                syncStatus === 'syncing' 
                  ? 'bg-blue-50 border-blue-200 text-blue-500 hover:bg-blue-100' 
                  : syncStatus === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                  : syncStatus === 'offline'
                  ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100'
                  : 'bg-white border-zinc-200/60 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw size={12} className="animate-spin text-blue-500" />
              ) : syncStatus === 'error' ? (
                <CloudOff size={12} className="text-rose-500" />
              ) : syncStatus === 'offline' ? (
                <CloudOff size={12} className="text-amber-500" />
              ) : (
                <Cloud size={12} className="text-emerald-500" />
              )}
            </button>

            <button 
              onClick={() => {
                handleVibrate(15);
                setShowNotificationDrawer(!showNotificationDrawer);
              }}
              className="p-2 bg-white border border-zinc-200/60 text-zinc-700 hover:text-zinc-950 transition-all rounded-xl cursor-pointer hover:bg-zinc-50 relative shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
            >
              <Bell size={12} className={showNotificationDrawer ? "text-[#2563EB]" : ""} />
              <span className="absolute w-1.5 h-1.5 rounded-full top-1.5 right-1.5 bg-[#2563EB]" />
            </button>

            <button 
              onClick={() => {
                handleVibrate(15);
                logout();
              }} 
              className="p-2 bg-white border border-zinc-200/60 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
              title="Sair"
            >
              <LogOut size={12} />
            </button>
          </div>
        </header>

        {/* 2. CARD HERO PRINCIPAL - TREINO DE HOJE (Slimmer and more compact) */}
        <div className="w-full bg-gradient-to-br from-[#2563EB] to-[#0A192F] rounded-[22px] p-4.5 md:py-4 text-white relative shadow-lg shadow-blue-900/10 overflow-hidden flex flex-col justify-between min-h-[195px] md:min-h-0 shrink-0">
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
            <div className="absolute right-[-15px] top-[-15px] w-28 h-28 pointer-events-none select-none opacity-40 z-0">
              <svg viewBox="0 0 200 200" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              </svg>
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
          <div className="bg-gradient-to-br from-[#2563EB] to-[#122C60] border border-white/10 rounded-[20px] p-4 space-y-3.5 text-left shadow-lg shadow-blue-900/5 shrink-0">
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
          <div className="grid grid-cols-3 gap-2 w-full shrink-0 md:flex md:flex-row md:gap-3">
            {/* Card 1: Sequência */}
            <div className="bg-gradient-to-br from-[#2563EB] to-[#122C60] border border-white/10 rounded-xl p-3 space-y-1.5 flex flex-col justify-between text-left shadow-lg min-h-[96px] md:flex-1">
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

        {/* 5. PRÓXIMAS REFEIÇÕES */}
        {upcomingMeals && upcomingMeals.length > 0 && (
          <div className="bg-gradient-to-br from-[#2563EB] to-[#122C60] border border-white/10 rounded-[20px] p-4 text-left shadow-lg shadow-blue-900/5 shrink-0 space-y-3">
            <h3 className="text-[9px] font-black tracking-widest uppercase text-white font-sans">
              PRÓXIMAS REFEIÇÕES
            </h3>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {upcomingMeals.map((m, idx) => (
                <div 
                  key={idx}
                  onClick={() => { handleVibrate(15); setActiveTab(AppTab.DIET); }}
                  className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 transition-all text-white shrink-0 select-none animate-fade cursor-pointer"
                >
                  <div className={`w-2.5 h-2.5 rounded-full border border-white/50 flex-shrink-0 ${m.isCompleted ? 'bg-white border-white' : ''}`} />
                  <span className="text-[9px] font-black tracking-wider uppercase font-mono">{m.time} &middot; {m.name}{m.isTomorrow ? ' (Amanhã)' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATION DRAWER FOR LIGHT MODE PORTAL */}
        {showNotificationDrawer && (
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white border-l border-zinc-200 shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in">
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
                <p className="text-[10px] text-zinc-500 font-medium">O professor Henrique revisou as cargas do seu agachamento e supino.</p>
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

      </div>
    );
  }


  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-transparent text-ink font-sans antialiased select-none relative pt-12 sm:pt-14 pb-32">
      
      {/* 1. COCKPIT HEADER COMPACTO */}
      <header className="flex justify-between items-center shrink-0 py-1.5 px-1 border-b border-zinc-200/20 dark:border-white/[0.015]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div 
              style={{ borderColor: accentColor }}
              className="w-8 h-8 rounded-full border border-neutral-300 dark:border-white/10 p-[1.5px] flex items-center justify-center bg-neutral-100 dark:bg-zinc-950 overflow-hidden"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-[10px] font-[900] tracking-tighter uppercase text-ink leading-none font-nike italic">
                  {getInitials(user.name)}
                </span>
              )}
            </div>
            <div 
              style={{ backgroundColor: accentColor }}
              className="absolute w-2 h-2 rounded-full bottom-0 right-0 border border-white dark:border-black shadow-[0_0_8px_var(--accent-color)]"
            />
          </div>
          
          <div className="text-left leading-none space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-black text-zinc-950 dark:text-zinc-400 uppercase tracking-tight font-nike italic">
                {getGreeting()},
              </span>
              <span className="text-[12px] font-[900] text-accent font-nike uppercase italic">
                {user.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-[7.5px] font-[900] tracking-[0.14em] text-zinc-950 dark:text-[#5C6479] uppercase font-nike italic leading-none">
              HORUS TRAINING • SÉRIE ELITE
            </p>
          </div>
        </div>
  

        <div className="flex items-center gap-1.5">
          <div className="bg-zinc-100 dark:bg-[#0D0E12] border border-zinc-250/50 dark:border-white/[0.03] px-2 py-0.5 rounded-lg text-left hidden sm:flex flex-col justify-center leading-none">
            <span className="text-[6.5px] font-bold text-zinc-950 dark:text-zinc-550 uppercase tracking-widest leading-none font-nike italic">NÍVEL</span>
            <span className="text-[9.5px] font-black text-ink mt-0.5 leading-none font-nike italic">LVL {currentLevel}</span>
          </div>

          <button 
            onClick={() => {
              handleVibrate(15);
              setShowNotificationDrawer(!showNotificationDrawer);
            }}
            className="relative p-2 bg-zinc-100 dark:bg-[#0D0E12] border border-zinc-250/50 dark:border-white/[0.03] text-zinc-950 dark:text-zinc-450 hover:text-ink transition-all rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-[#161822]"
          >
            <Bell size={13} className={showNotificationDrawer ? "text-accent" : ""} />
            <span 
              style={{ backgroundColor: accentColor }}
              className="absolute w-1.2 h-1.2 rounded-full top-1.5 right-1.5 border border-white dark:border-[#0D0E12] shadow-[0_0_6px_var(--accent-color)]"
            />
          </button>

          <button 
            onClick={() => {
              handleVibrate(15);
              logout();
            }} 
            className="p-2 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 text-rose-500 hover:text-rose-600 transition-all rounded-lg cursor-pointer"
            title="Sair"
          >
            <LogOut size={13} />
          </button>
        </div>
      </header>

      {/* 2. COMPACT COCKPIT GRID (Always visible above-the-fold with NO vertical scrolling) */}
      <main className="flex-1 min-h-0 w-full flex flex-col justify-start gap-3.5 pt-2.5 px-0.5 relative">
        
        {/* PROGRESS METRIC BAR BRIEF */}
        <div className={`rounded-xl py-1.5 px-3 flex justify-between items-center shrink-0 ${
          isTeste1 
            ? 'bg-white border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.015)] text-zinc-950 font-black' 
            : 'bg-gradient-to-r from-zinc-950/40 via-zinc-900/10 to-transparent border border-white/[0.015]'
        }`}>
          <span className={`text-[8px] font-black uppercase tracking-wider font-mono ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-zinc-500'}`}>Evolução do Atleta</span>
          <div className="flex items-center gap-3 w-2/3 max-w-[240px]">
            <div className={`h-1 flex-1 ${isTeste1 ? 'bg-zinc-200' : 'bg-zinc-900'} rounded-full overflow-hidden p-[0.3px]`}>
              <div 
                className="h-full rounded-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--accent-color-rgb),0.6)]"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <span className={`text-[8px] font-mono font-black shrink-0 ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-zinc-450'}`}>
              LVL {currentLevel} • <strong className="text-accent">{totalXP} XP</strong>
            </span>
          </div>
        </div>

        {/* [2] CARD PRINCIPAL COMPCT: FREQUÊNCIA SEMANAL */}
        <div className="glass-card p-3 space-y-2.5 shrink-0 relative overflow-hidden">
          {/* Subtle grid elements */}
          <div className="flex justify-between items-center leading-none">
            <div className="text-left space-y-0.5">
              <span className={`text-[7px] font-[900] tracking-widest uppercase font-nike italic block ${isTeste1 ? 'text-zinc-950 font-black' : 'text-zinc-400 dark:text-[#5C6479]'}`}>Frequência Semanal</span>
              <div className="flex items-center gap-1">
                <span className="text-[12px] font-black text-ink font-nike italic leading-none">
                  {currentWeekWorkoutsCount} / 5
                </span>
                <span className={`text-[7.5px] font-black uppercase leading-none font-nike italic ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-zinc-400'}`}>DESSES SETE DIAS</span>
              </div>
            </div>

            {/* Streak Indicator Module right */}
            <div className="bg-accent/5 border border-accent/15 px-2 py-0.5 rounded-lg flex items-center gap-1 select-none leading-none shrink-0">
              <Flame size={10} className="text-accent fill-accent/5 animate-pulse" />
              <span className="text-[8.5px] font-black font-mono text-accent uppercase leading-none">
                {user.streak || 0} dias ativos
              </span>
            </div>
          </div>

          {/* COMPACT DETAILED DAYS LIST */}
          <div className="grid grid-cols-7 gap-1 px-0.5 leading-none">
            {weekDays.map((dia, idx) => {
              const dateStr = weekDates[idx];
              const treinou = user.checkIns?.includes(dateStr) || false;
              const isCurrent = currentDayIndex === idx;
              
              return (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => handleToggleDay(dia, dateStr, treinou)}
                  className="flex flex-col items-center justify-center gap-1.5 leading-none bg-transparent border-0 cursor-pointer py-2 px-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center focus:outline-none select-none relative z-10 w-full"
                >
                  <span className={`text-[8.5px] font-mono font-black ${
                    isCurrent 
                      ? 'text-accent font-black' 
                      : (treinou 
                          ? (isTeste1 ? 'text-zinc-950 font-[900]' : 'text-zinc-750 dark:text-zinc-300') 
                          : (isTeste1 ? 'text-zinc-400 font-[900]' : 'text-zinc-500 dark:text-zinc-600')
                        )
                  }`}>
                    {dia}
                  </span>
                  <AnilhaIcon active={treinou} current={isCurrent} accentColor={accentColor} isLight={isTeste1} />
                </button>
              );
            })}
          </div>

          {/* Quick Check-in action strip */}
          {!checkedInToday && (
            <div className="flex justify-between items-center border-t border-zinc-150 dark:border-white/[0.02] pt-2 leading-none">
              <p className={`text-[8.5px] font-nike italic uppercase font-[900] text-left ${isTeste1 ? 'text-zinc-950 font-black' : 'text-zinc-550 dark:text-zinc-500'}`}>
                Presença rápida do dia:
              </p>
              <button
                onClick={handleCheckInClick}
                style={{ borderColor: accentColor }}
                className="bg-accent/5 hover:bg-accent text-accent hover:text-white dark:hover:text-[#050505] border border-accent/30 font-black text-[8.5px] px-3 py-1.5 rounded-lg uppercase tracking-wider font-nike italic transition-all duration-200 cursor-pointer active:scale-95 leading-none border-solid"
              >
                Marcar presença
              </button>
            </div>
          )}
        </div>

        {/* [3] CARD HERO COMPACT: TREINO DO DIA (Brings up, dominates the visible viewport space) */}
        <div className="flex-1 min-h-[160px] relative overflow-hidden group glass-card flex flex-col justify-between p-4.5 transition-all duration-300 hover:border-accent/30">
          
          <div className="absolute inset-0 z-0 bg-radial-gradient pointer-events-none opacity-10"></div>
          
          {/* Subtle glowing center blur */}
          <div style={{ backgroundColor: accentColor }} className="absolute h-56 w-56 -top-28 -right-28 rounded-full blur-[90px] opacity-5 pointer-events-none z-0"></div>

          {/* Upper info section */}
          <div className="relative z-10 text-left w-full space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[7.5px] font-black bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded-full uppercase tracking-wider font-nike italic">
                Sessão Recomendada Hoje
              </span>
              <span className={`text-[8px] font-black ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-zinc-400 dark:text-zinc-550'} font-nike italic`}>
                SÉRIE {String.fromCharCode(65 + Math.min(2, totalWorkoutsCount % 3))}
              </span>
            </div>

            {nextWorkout ? (
              <div className="space-y-2 flex-1 min-h-0 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-[900] italic text-ink uppercase tracking-tighter leading-none font-nike">
                    {nextWorkout.title}
                  </h2>
                  <p className={`text-[10px] sm:text-xs font-semibold ${isTeste1 ? 'text-zinc-950 font-bold' : 'text-zinc-400'} max-w-md leading-normal mt-0.5`}>
                    {nextWorkout.description || 'Hipertrofia de Fibras Miofibrilares'}
                  </p>
                </div>
                
                 {/* Vertical Exercise List (Scrollable to prevent screen overflow) */}
                {nextWorkout.exercises && nextWorkout.exercises.length > 0 && (
                  <div className="flex flex-col gap-1.5 py-1.5 select-none leading-none max-h-[140px] overflow-y-auto no-scrollbar pr-0.5 w-full">
                    {nextWorkout.exercises.map((ex: any, index: number) => (
                      <div 
                        key={ex.id || index}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg ${
                          isTeste1 
                            ? 'bg-zinc-150/70 border border-zinc-250 hover:bg-zinc-200' 
                            : 'bg-zinc-150/50 dark:bg-white/[0.015] border border-zinc-250/50 dark:border-white/[0.04] hover:bg-zinc-200/50 dark:hover:bg-white/[0.03]'
                        } transition-all focus:outline-none w-full`}
                      >
                        {/* Accent bar strip (bandeira) */}
                        <div 
                          className="w-[3px] h-4.5 rounded-full shrink-0" 
                          style={{ backgroundColor: accentColor }} 
                        />
                        <div className="flex flex-row items-center justify-between flex-1 min-w-0 pr-1">
                          <span className={`text-[10px] sm:text-xs font-black uppercase ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-zinc-900 dark:text-zinc-100'} font-nike italic leading-tight text-left`}>
                            {ex.name}
                          </span>
                          <span className={`text-[9.5px] sm:text-xs font-nike italic ${isTeste1 ? 'text-zinc-950 font-black' : 'text-zinc-700 dark:text-zinc-200'} font-extrabold shrink-0 pl-2`}>
                            {ex.sets}x{ex.reps}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Micro tech specs row */}
                <div className="flex flex-wrap items-center gap-1.5 select-none leading-none">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isTeste1 
                      ? 'bg-zinc-200 border-zinc-300 text-zinc-950 font-black' 
                      : 'bg-zinc-100 dark:bg-[#111318]/60 text-zinc-500 dark:text-zinc-450 border-zinc-250/20 dark:border-white/5'
                  }`}>
                    {nextWorkout.exercises?.length || 0} Exer.
                  </span>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isTeste1 
                      ? 'bg-zinc-200 border-zinc-300 text-zinc-950 font-black' 
                      : 'bg-zinc-100 dark:bg-[#111318]/60 text-zinc-500 dark:text-zinc-450 border-zinc-250/20 dark:border-white/5'
                  }`}>
                    Foco: {nextWorkout.exercises?.[0]?.muscleGroup || 'Multijoint'}
                  </span>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isTeste1 
                      ? 'bg-zinc-200 border-zinc-300 text-zinc-950 font-black font-mono' 
                      : 'bg-zinc-100 dark:bg-[#111318]/60 text-zinc-500 dark:text-zinc-450 border-zinc-250/20 dark:border-white/5 font-mono'
                  }`}>
                    ~45 MIN
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center">
                <p className={`text-[11px] font-black ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-zinc-400'}`}>Nenhum treino disponível hoje</p>
              </div>
            )}
          </div>

          {/* Action trigger row */}
          <div className="relative z-10 flex gap-2.5 pt-2 shrink-0 select-none">
            <button
              onClick={startActiveWorkout}
              style={{
                boxShadow: `0 2px 12px rgba(var(--accent-color-rgb), 0.15)`
              }}
              className="flex-1 bg-accent hover:brightness-105 active:scale-[0.98] text-[#050505] font-[950] uppercase text-[10.5px] py-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 tracking-wider"
            >
              <Play size={11} className="fill-[#050505] stroke-none" />
              <span>{isWorkoutActive ? 'Continuar Treino' : 'Iniciar Treino'}</span>
            </button>

            <button
              onClick={viewWorkoutsList}
              className="flex-1 bg-transparent border border-zinc-200 dark:border-white/10 hover:border-zinc-350 dark:hover:border-white/25 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white font-nike italic font-[900] uppercase text-[11px] py-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.015] active:scale-[0.98] transition-all cursor-pointer tracking-wider text-center flex items-center justify-center gap-1.5"
            >
              Todos os Treinos
            </button>
          </div>
        </div>

      </main>

      {/* NOTIFICATION DRAWER EXPANSIVE BOARD */}
      {showNotificationDrawer && (
        <div className={`fixed inset-y-0 right-0 z-[100] w-full max-w-xs ${
          isTeste1 
            ? 'bg-white border-l border-zinc-300 shadow-[0_0_30px_rgba(0,0,0,0.15)] text-zinc-950' 
            : 'bg-zinc-950 border-l border-white/5 text-white'
        } p-4.5 shadow-2xl flex flex-col justify-start gap-3.5 animate-fade animate-duration-150`}>
          <div className={`flex justify-between items-center border-b ${isTeste1 ? 'border-zinc-200' : 'border-white/[0.03]'} pb-2.5`}>
            <div className="flex items-center gap-1.5">
              <Bell size={14} className="text-accent" />
              <h4 className={`text-xs font-black uppercase ${isTeste1 ? 'text-zinc-950' : 'text-white'}`}>Notificações</h4>
            </div>
            <button 
              onClick={() => {
                handleVibrate(10);
                setShowNotificationDrawer(false);
              }}
              className={`p-1 rounded-lg transition-all ${isTeste1 ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100' : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'}`}
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar pr-0.5">
            {[
              {
                id: 1,
                title: "Novo Protocolo Adicionado",
                body: "Seu professor atualizou sua ficha de exercícios ontem.",
                time: "Ontem",
                unread: true
              },
              {
                id: 2,
                title: "Consistência Premiada",
                body: "Você ganhou +150 XP de atividade nesta semana devido a sua constância.",
                time: "Há 2d",
                unread: false
              }
            ].map((notif) => (
              <div 
                key={notif.id}
                className={`p-3 rounded-lg border text-left space-y-0.5 transition-all ${
                  notif.unread
                    ? (isTeste1 ? 'bg-zinc-100 border-accent/35' : 'bg-[#0D0E12] border-accent/15')
                    : (isTeste1 ? 'bg-zinc-50 border-zinc-200' : 'bg-[#0D0E12]/20 border-white/[0.01]')
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-black uppercase tracking-tight leading-none ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-white'}`}>{notif.title}</span>
                  <span className={`text-[7.5px] font-semibold uppercase tracking-widest font-mono shrink-0 ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-zinc-500'}`}>{notif.time}</span>
                </div>
                <p className={`text-[10px] font-medium leading-normal ${isTeste1 ? 'text-zinc-950 font-bold' : 'text-zinc-400'}`}>{notif.body}</p>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setShowNotificationDrawer(false)}
            className={`w-full py-2 ${
              isTeste1 
                ? 'bg-zinc-950 text-white hover:bg-zinc-900 border border-zinc-950' 
                : 'bg-zinc-900 hover:bg-zinc-850 text-white'
            } font-extrabold text-[10px] uppercase rounded-lg tracking-wider transition-all cursor-pointer`}
          >
            Fechar
          </button>
        </div>
      )}


      
    </div>
  );
};
