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
  X
} from 'lucide-react';

const AnilhaIcon: React.FC<{ active: boolean; current: boolean; isFemale: boolean }> = ({ active, current, isFemale }) => {
  const accentColor = isFemale ? '#FF007F' : '#00F0FF';
  const strokeColor = active ? accentColor : (current ? accentColor : '#27272A');
  
  return (
    <div className="relative flex items-center justify-center">
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
          fill={active ? strokeColor : '#09090B'} 
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
    addToast
  } = useStore();

  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const isFemale = user.username.toLowerCase() === 'teste2' || user.username.toLowerCase().includes('jessica') || user.sex === 'feminino';
  const accentColor = isFemale ? '#FF007F' : '#00F0FF';

  const handleVibrate = (duration = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const checkedInToday = user.checkIns?.includes(todayStr) || false;

  const handleCheckInClick = () => {
    handleVibrate(30);
    handleManualCheckIn();
    if (addToast) addToast('Check-in rápido registrado com sucesso! +45 XP obtido', 'success');
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
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    
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

  const workouts = allWorkouts[user.username.toLowerCase() as keyof typeof allWorkouts] || [];
  const nextWorkout = workouts[0] || null;

  const startActiveWorkout = () => {
    handleVibrate(40);
    if (nextWorkout) {
      setSelectedWorkout(nextWorkout);
    } else {
      setActiveTab(AppTab.WORKOUT);
    }
  };

  const viewWorkoutsList = () => {
    handleVibrate(15);
    setActiveTab(AppTab.WORKOUT);
  };



  return (
    <div className="w-full h-full max-h-full flex flex-col justify-between bg-transparent text-white font-sans antialiased overflow-hidden select-none relative pt-16 sm:pt-20 pb-1">
      
      {/* 1. COCKPIT HEADER COMPACTO */}
      <header className="flex justify-between items-center shrink-0 py-1.5 px-4 mb-2 border-b border-white/[0.015]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div 
              style={{ borderColor: accentColor }}
              className="w-8 h-8 rounded-full border border-white/10 p-[1.5px] flex items-center justify-center bg-zinc-950 overflow-hidden"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none">
                  {user.name.substring(0, 2)}
                </span>
              )}
            </div>
            <div 
              style={{ backgroundColor: accentColor }}
              className="absolute w-2 h-2 rounded-full bottom-0 right-0 border border-black shadow-[0_0_8px_var(--accent-color)]"
            />
          </div>
          
          <div className="text-left leading-none space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-tight font-sans">
                {getGreeting()},
              </span>
              <span className="text-[11px] font-[900] text-accent font-sans">
                {user.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-[7.5px] font-black tracking-[0.12em] text-[#5C6479] uppercase font-mono leading-none">
              HORUS TRAINING • SÉRIE ELITE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="bg-[#0D0E12] border border-white/[0.03] px-2 py-0.5 rounded-lg text-left hidden sm:flex flex-col justify-center leading-none">
            <span className="text-[6.5px] font-bold text-zinc-550 uppercase tracking-widest leading-none">NÍVEL</span>
            <span className="text-[9.5px] font-black text-white mt-0.5 leading-none">LVL {currentLevel}</span>
          </div>

          <button 
            onClick={() => {
              handleVibrate(15);
              setShowNotificationDrawer(!showNotificationDrawer);
            }}
            className="relative p-2 bg-[#0D0E12] border border-white/[0.03] text-zinc-450 hover:text-white transition-all rounded-lg cursor-pointer hover:bg-[#161822]"
          >
            <Bell size={13} className={showNotificationDrawer ? "text-accent" : ""} />
            <span 
              style={{ backgroundColor: accentColor }}
              className="absolute w-1.2 h-1.2 rounded-full top-1.5 right-1.5 border border-[#0D0E12] shadow-[0_0_6px_var(--accent-color)]"
            />
          </button>

          <button 
            onClick={() => {
              handleVibrate(15);
              logout();
            }} 
            className="p-2 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 text-rose-450 hover:text-rose-405 transition-all rounded-lg cursor-pointer"
            title="Sair"
          >
            <LogOut size={13} />
          </button>
        </div>
      </header>

      {/* 2. COMPACT COCKPIT GRID (Always visible above-the-fold with NO vertical scrolling) */}
      <main className="flex-1 min-h-0 w-full flex flex-col justify-start gap-3.5 pt-2.5 px-0.5 relative">
        
        {/* PROGRESS METRIC BAR BRIEF */}
        <div className="bg-gradient-to-r from-zinc-950/40 via-zinc-900/10 to-transparent border border-white/[0.015] rounded-xl py-1.5 px-3 flex justify-between items-center shrink-0">
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Evolução do Atleta</span>
          <div className="flex items-center gap-3 w-2/3 max-w-[240px]">
            <div className="h-1 flex-1 bg-zinc-900 rounded-full overflow-hidden p-[0.3px]">
              <div 
                className="h-full rounded-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--accent-color-rgb),0.6)]"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <span className="text-[8px] font-mono font-extrabold text-zinc-450 shrink-0">
              LVL {currentLevel} • <strong className="text-accent">{totalXP} XP</strong>
            </span>
          </div>
        </div>

        {/* [2] CARD PRINCIPAL COMPCT: FREQUÊNCIA SEMANAL */}
        <div className="bg-[#0B0C0E]/90 border border-white/[0.035] rounded-xl p-3 space-y-2.5 shrink-0 shadow-lg relative overflow-hidden">
          {/* Subtle grid elements */}
          <div className="flex justify-between items-center leading-none">
            <div className="text-left space-y-0.5">
              <span className="text-[7px] font-black tracking-widest text-[#5C6479] uppercase font-mono block">Frequência Semanal</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-black text-white leading-none">
                  {currentWeekWorkoutsCount} / 5
                </span>
                <span className="text-[7.5px] font-semibold text-zinc-500 uppercase leading-none">DESSES SETE DIAS</span>
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
                <div key={idx} className="flex flex-col items-center gap-1.5 leading-none">
                  <span className={`text-[8.5px] font-mono font-black ${
                    isCurrent ? 'text-accent font-black' : (treinou ? 'text-zinc-350' : 'text-zinc-600')
                  }`}>
                    {dia}
                  </span>
                  <AnilhaIcon active={treinou} current={isCurrent} isFemale={isFemale} />
                </div>
              );
            })}
          </div>

          {/* Quick Check-in action strip */}
          {!checkedInToday && (
            <div className="flex justify-between items-center border-t border-white/[0.02] pt-2 leading-none">
              <p className="text-[8px] text-zinc-500 font-medium text-left">
                Check-in rápido de presença rápido:
              </p>
              <button
                onClick={handleCheckInClick}
                style={{ borderColor: accentColor }}
                className="bg-accent/5 hover:bg-accent text-accent hover:text-black border border-accent/30 font-black text-[8px] px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 leading-none"
              >
                Sim, marcar presença
              </button>
            </div>
          )}
        </div>

        {/* [3] CARD HERO COMPACT: TREINO DO DIA (Brings up, dominates the visible viewport space) */}
        <div className="flex-1 min-h-[160px] relative overflow-hidden group bg-gradient-to-b from-[#0F1014] to-[#040405] border border-white/[0.035] rounded-xl flex flex-col justify-between p-4.5 shadow-xl transition-all duration-300 hover:border-accent/10">
          
          <div className="absolute inset-0 z-0 bg-radial-gradient pointer-events-none opacity-30"></div>
          
          {/* Subtle glowing center blur */}
          <div style={{ backgroundColor: accentColor }} className="absolute h-56 w-56 -top-28 -right-28 rounded-full blur-[90px] opacity-15 pointer-events-none z-0"></div>

          {/* Upper info section */}
          <div className="relative z-10 text-left w-full space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[7.5px] font-black bg-accent/10 border border-accent/15 text-accent px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Sessão Recomendada Hoje
              </span>
              <span className="text-[7.5px] font-bold text-zinc-550 font-mono">
                SÉRIE {String.fromCharCode(65 + Math.min(2, totalWorkoutsCount % 3))}
              </span>
            </div>

            {nextWorkout ? (
              <div className="space-y-2 flex-1 min-h-0 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg sm:text-2xl font-[1000] italic text-white uppercase tracking-tight leading-none">
                    {nextWorkout.title}
                  </h2>
                  <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 max-w-md leading-normal mt-0.5">
                    {nextWorkout.description || 'Hipertrofia de Fibras Miofibrilares'}
                  </p>
                </div>
                
                {/* Vertical Exercise List (Scrollable to prevent screen overflow) */}
                {nextWorkout.exercises && nextWorkout.exercises.length > 0 && (
                  <div className="flex flex-col gap-2 py-1.5 select-none max-h-[140px] overflow-y-auto no-scrollbar pr-0.5 w-full">
                    {nextWorkout.exercises.map((ex, index) => (
                      <div 
                        key={ex.id || index}
                        className="flex items-stretch gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-white/[0.04] transition-all focus:outline-none w-full"
                      >
                        {/* Accent bar strip (bandeira) */}
                        <div 
                          className="w-[3px] rounded-full shrink-0" 
                          style={{ backgroundColor: accentColor }} 
                        />
                        <div className="flex flex-row items-center justify-between flex-1 min-w-0 pr-1 gap-3">
                          <span className="text-[11px] sm:text-[13px] font-bold uppercase text-white tracking-wide text-wrap leading-snug text-left flex-1">
                            {ex.name}
                          </span>
                          <span className="text-[11px] sm:text-[13px] font-mono text-zinc-300 font-black shrink-0 whitespace-nowrap bg-zinc-900 px-2 py-1 rounded border border-white/5 shadow-inner">
                            {ex.sets}x{ex.reps}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Micro tech specs row */}
                <div className="flex flex-wrap items-center gap-1.5 select-none leading-none">
                  <span className="bg-[#111318]/60 text-zinc-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border border-white/5">
                    {nextWorkout.exercises?.length || 0} Exer.
                  </span>
                  <span className="bg-[#111318]/60 text-zinc-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border border-white/5">
                    Foco: {nextWorkout.exercises?.[0]?.muscleGroup || 'Multijoint'}
                  </span>
                  <span className="bg-[#111318]/60 text-zinc-400 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border border-white/5 font-mono">
                    ~45 MIN
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center">
                <p className="text-zinc-400 text-[11px] font-bold">Nenhum treino disponível hoje</p>
              </div>
            )}
          </div>

          {/* Action trigger row */}
          <div className="relative z-10 flex gap-3 pt-3 shrink-0 select-none">
            <button
              onClick={startActiveWorkout}
              style={{
                boxShadow: `0 2px 12px rgba(var(--accent-color-rgb), 0.15)`
              }}
              className="flex-[1.2] bg-accent hover:brightness-105 active:scale-[0.98] text-[#050505] font-[950] uppercase text-[11px] py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 tracking-widest shadow-lg"
            >
              <Play size={14} className="fill-[#050505] stroke-none" />
              <span>Iniciar Treino</span>
            </button>

            <button
              onClick={viewWorkoutsList}
              className="flex-[0.8] bg-transparent border-2 border-white/10 hover:border-white/30 text-zinc-100 hover:text-white font-[950] uppercase text-[11px] py-3.5 rounded-xl hover:bg-white/[0.03] active:scale-[0.98] transition-all cursor-pointer tracking-widest text-center flex items-center justify-center gap-1.5"
            >
              Fichas
            </button>
          </div>
        </div>



      </main>

      {/* NOTIFICATION DRAWER EXPANSIVE BOARD */}
      {showNotificationDrawer && (
        <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-xs bg-zinc-950 border-l border-white/5 p-4.5 shadow-2xl flex flex-col justify-start gap-3.5 animate-fade animate-duration-150">
          <div className="flex justify-between items-center border-b border-white/[0.03] pb-2.5">
            <div className="flex items-center gap-1.5">
              <Bell size={14} className="text-accent" />
              <h4 className="text-xs font-black text-white uppercase">Notificações</h4>
            </div>
            <button 
              onClick={() => {
                handleVibrate(10);
                setShowNotificationDrawer(false);
              }}
              className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/[0.04]"
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
                    ? 'bg-[#0D0E12] border-accent/15'
                    : 'bg-[#0D0E12]/20 border-white/[0.01]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white uppercase tracking-tight leading-none">{notif.title}</span>
                  <span className="text-[7.5px] font-semibold text-zinc-500 uppercase tracking-widest font-mono shrink-0">{notif.time}</span>
                </div>
                <p className="text-[10px] font-medium text-zinc-400 leading-normal">{notif.body}</p>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setShowNotificationDrawer(false)}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-white font-extrabold text-[10px] uppercase rounded-lg tracking-wider transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}


      
    </div>
  );
};
