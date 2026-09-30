import React, { useState } from 'react';
import { useStore } from '../../store';
import { 
  Trophy, 
  Award, 
  Rocket, 
  Flame, 
  Edit2, 
  X, 
  Scale, 
  Ruler, 
  Check,
  Zap,
  History,
  Calendar,
  Clock,
  Wind,
  RotateCcw,
  Trash2,
  Dumbbell,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getInitials = (name: string): string => {
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const ProfileView: React.FC = () => {
  const { user, theme, updateUserProfile, addToast, allWorkouts } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  // Workout adjustment helpers
  const rawWorkouts = user ? (allWorkouts[user.username.toLowerCase() as keyof typeof allWorkouts] || allWorkouts['teste1'] || allWorkouts['henrique'] || []) : [];
  const userWorkouts = rawWorkouts.filter(w => w.id !== 'h-f');

  const lastCompleted = user?.history && user.history.length > 0 ? user.history[0] : null;
  const lastWorkoutIndex = lastCompleted 
    ? userWorkouts.findIndex(w => w.id === lastCompleted.workoutId || w.title.toLowerCase() === lastCompleted.workoutTitle.toLowerCase()) 
    : -1;

  let currentActiveDashboardWorkoutId = user?.preferredWorkoutId;
  if (!currentActiveDashboardWorkoutId) {
    const nextWorkoutIndex = lastWorkoutIndex > -1 ? (lastWorkoutIndex + 1) % userWorkouts.length : 0;
    currentActiveDashboardWorkoutId = userWorkouts[nextWorkoutIndex]?.id || userWorkouts[0]?.id;
  }

  const handleUndoLastWorkout = () => {
    if (!user || !user.history || user.history.length === 0) return;
    handleVibrate(30);

    const lastWorkout = user.history[0];
    const newHistory = user.history.slice(1);
    const newTotal = Math.max(0, (user.totalWorkouts || 1) - 1);

    updateUserProfile({
      history: newHistory,
      totalWorkouts: newTotal,
      preferredWorkoutId: undefined
    });

    if (addToast) {
      addToast(`Último treino ("${lastWorkout.workoutTitle}") desfeito! O Dashboard foi atualizado.`, 'success');
    }
  };

  const handleSelectNextWorkout = (workoutId: string, workoutTitle: string) => {
    if (!user) return;
    handleVibrate(20);

    updateUserProfile({
      preferredWorkoutId: workoutId
    });

    if (addToast) {
      addToast(`Treino "${workoutTitle}" definido como ativo no Dashboard!`, 'success');
    }
  };

  const handleResetPreferredWorkout = () => {
    if (!user) return;
    handleVibrate(15);

    updateUserProfile({
      preferredWorkoutId: undefined
    });

    if (addToast) {
      addToast('Sequência do Dashboard restaurada para rotação automática.', 'info');
    }
  };

  const handleRemoveHistoryEntry = (entryId: string, title: string) => {
    if (!user) return;
    handleVibrate(20);

    const newHistory = user.history.filter(h => h.id !== entryId);
    const newTotal = Math.max(0, (user.totalWorkouts || 1) - 1);

    updateUserProfile({
      history: newHistory,
      totalWorkouts: newTotal
    });

    if (addToast) {
      addToast(`Registro de "${title}" removido do histórico.`, 'info');
    }
  };

  // Form states
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editLevel, setEditLevel] = useState('');

  // PWA States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as any).standalone === true;
      setIsInstalled(!!isStandalone);

      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent) || (navigator.maxTouchPoints > 0 && /macintosh/.test(userAgent));
      setIsIOS(isApple);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    handleVibrate(15);
    if (isIOS) {
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.error('Error with prompt:', err);
      }
      setDeferredPrompt(null);
    } else {
      setShowIOSModal(true); // Fallback showing gorgeous general/iOS install modal instructions
    }
  };

  if (!user) return null;

  const handleVibrate = (ms = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const getBiometrics = () => {
    const usernameLower = user.username.toLowerCase();
    
    // Default values if not specified in user profile
    let defaultWeight = 75.0;
    let defaultHeight = 1.75;
    let defaultLevel = 'Atleta';
    
    if (usernameLower === 'henrique') {
      defaultWeight = 68.0;
      defaultHeight = 1.68;
      defaultLevel = 'Atleta Avançado';
    } else if (usernameLower === 'flavia' || usernameLower === 'flávia') {
      defaultWeight = 62.0;
      defaultHeight = 1.65;
      defaultLevel = 'Atleta Intermediário';
    } else if (usernameLower === 'jessica' || usernameLower === 'jéssica') {
      defaultWeight = 60.0;
      defaultHeight = 1.68;
      defaultLevel = 'Atleta Avançado';
    }

    return {
      weight: user.weight !== undefined && user.weight !== null ? user.weight : defaultWeight,
      height: user.height !== undefined && user.height !== null ? user.height : defaultHeight,
      level: user.goal || defaultLevel,
      initial: getInitials(user.name)
    };
  };

  const bio = getBiometrics();

  const handleOpenEdit = () => {
    handleVibrate(15);
    setEditName(user.name);
    setEditWeight(bio.weight.toString());
    setEditHeight(bio.height.toString());
    setEditLevel(bio.level);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    handleVibrate(25);

    const weightNum = parseFloat(editWeight) || bio.weight;
    const heightNum = parseFloat(editHeight) || bio.height;

    updateUserProfile({
      name: editName.trim() || user.name,
      weight: weightNum,
      height: heightNum,
      goal: editLevel || bio.level
    });

    setIsEditing(false);
  };

  const badgeIcons: Record<string, any> = {
    Rocket: <Rocket size={14} className="text-accent" />,
    Trophy: <Trophy size={14} className="text-accent" />,
    Flame: <Flame size={14} className="text-accent" />,
    Award: <Award size={14} className="text-accent" />
  };

  const isTeste1 = user?.username.toLowerCase() === 'henrique' || theme === 'light';
  const accentColor = '#2563EB';

  const totalWorkoutsCount = user.totalWorkouts || 0;
  const checkInsCount = user.checkIns?.length || 0;

  const achievements = [
    {
      id: 'first_workout',
      title: 'Primeiro Passo',
      description: 'Sua jornada iniciou oficialmente! Desbloqueado ao concluir o primeiro treino.',
      icon: Award,
      unlocked: totalWorkoutsCount >= 1,
      reward: '125 XP'
    },
    {
      id: 'frequencia_ferro',
      title: 'Consistência de Ferro',
      description: 'Você está no ritmo certo! Desbloqueado ao atingir 3 ou mais check-ins rápidos.',
      icon: Zap,
      unlocked: checkInsCount >= 3,
      reward: '200 XP'
    },
    {
      id: 'disciplina_inabalavel',
      title: 'Hábito Ativo',
      description: 'Determinação lendária! Desbloqueado ao completar 5 ou mais sessões inteiras.',
      icon: Trophy,
      unlocked: totalWorkoutsCount >= 5,
      reward: '500 XP'
    },
    {
      id: 'streak_flame',
      title: 'Fogo Sagrado',
      description: 'A chama do treino está acesa! Desbloqueado ao obter uma sequência de 2+ dias.',
      icon: Flame,
      unlocked: user.streak >= 2,
      reward: '150 XP'
    }
  ];

  return (
    <div className={`w-full min-h-screen flex flex-col justify-start pt-12 sm:pt-6 px-3 pb-32 bg-transparent font-sans antialiased select-none relative ${isTeste1 ? 'text-zinc-950 font-black' : 'text-white'}`}>
      
      {/* HEADER: Minimalist header matching Dashboard and Workouts */}
      <div className="space-y-1 px-1 shrink-0 mb-4 text-left">
        <span className={`text-[9px] font-black uppercase tracking-[0.3em] font-mono ${isTeste1 ? 'text-[#2563EB]' : 'text-accent'}`}>Configurações</span>
        <h1 className={`text-xl font-extrabold tracking-tight leading-none mt-1 ${isTeste1 ? 'text-zinc-950 font-[900]' : 'text-white'}`}>
          Meu Perfil
        </h1>
        <p className={`text-xs leading-normal ${isTeste1 ? 'text-zinc-500 font-semibold' : 'text-zinc-500'}`}>
          Monitore sua evolução e dados de atleta.
        </p>
      </div>

      {/* BODY CONFIGURATOR AREA */}
      <div className="w-full space-y-6 px-1">
        
        {/* ATHLETE IDENTIFIER CARD */}
        <div className={`rounded-2xl p-4 flex items-center justify-between gap-4 border transition-all duration-200 shadow-md ${
          isTeste1 
            ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10 text-white shadow-lg' 
            : 'bg-[#080808] border-white/5 text-white'
        }`}>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black shrink-0 select-none border ${
              isTeste1 
                ? 'bg-white/15 border-white/10 text-white' 
                : 'bg-zinc-900 border-white/5 text-accent'
            }`}>
              {bio.initial}
            </div>
            <div className="min-w-0 text-left">
              <span className={`text-[7.5px] font-mono font-extrabold uppercase tracking-widest block mb-1 ${isTeste1 ? 'text-white/60' : 'text-zinc-500'}`}>Membro Confirmado Pro</span>
              <h2 className="text-[15px] font-black text-white uppercase tracking-tight leading-none truncate mb-1.5">{user.name}</h2>
              <p className={`text-[9px] font-mono font-bold leading-none uppercase ${isTeste1 ? 'text-white/80' : 'text-zinc-400'}`}>{bio.level}</p>
            </div>
          </div>
          
          <button 
            onClick={handleOpenEdit}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 border ${
              isTeste1 
                ? 'bg-white/15 hover:bg-white/25 border-white/10 text-white' 
                : 'bg-zinc-900 hover:bg-zinc-850 border-white/5 text-zinc-400 hover:text-accent'
            }`}
            title="Editar Perfil"
          >
            <Edit2 size={11} />
          </button>
        </div>

        {/* BIOMETRICS & METRICS ROW */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Biometrics widget */}
          <div className={`p-4 rounded-2xl space-y-3.5 border transition-all duration-200 shadow-md ${
            isTeste1 
              ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10 text-white shadow-lg' 
              : 'bg-[#080808] border-white/5'
          }`}>
            <span className={`text-[7.5px] font-extrabold tracking-[0.2em] uppercase font-mono block ${isTeste1 ? 'text-white/60' : 'text-zinc-500'}`}>Biometria</span>
            <div className="space-y-2.5">
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className={`uppercase text-[8px] tracking-wider font-semibold ${isTeste1 ? 'text-white/70' : 'text-zinc-550'}`}>PESO</span>
                <span className={`font-extrabold ${isTeste1 ? 'text-white' : 'text-zinc-200'}`}>{bio.weight} kg</span>
              </div>
              <div className={`h-px ${isTeste1 ? 'bg-white/10' : 'bg-white/[0.03]'}`} />
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className={`uppercase text-[8px] tracking-wider font-semibold ${isTeste1 ? 'text-white/70' : 'text-zinc-550'}`}>ALTURA</span>
                <span className={`font-extrabold ${isTeste1 ? 'text-white' : 'text-zinc-200'}`}>{bio.height} m</span>
              </div>
            </div>
          </div>

          {/* Activity counts widget */}
          <div className={`p-4 rounded-2xl space-y-3.5 border transition-all duration-200 shadow-md ${
            isTeste1 
              ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10 text-white shadow-lg' 
              : 'bg-[#080808] border-white/5'
          }`}>
            <span className={`text-[7.5px] font-extrabold tracking-[0.2em] uppercase font-mono block ${isTeste1 ? 'text-white/60' : 'text-zinc-500'}`}>Consistência</span>
            <div className="space-y-2.5">
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className={`uppercase text-[8px] tracking-wider font-semibold ${isTeste1 ? 'text-white/70' : 'text-zinc-550'}`}>TOTAL</span>
                <span className={`font-extrabold ${isTeste1 ? 'text-white' : 'text-zinc-200'}`}>{user.totalWorkouts || 0} treinos</span>
              </div>
              <div className={`h-px ${isTeste1 ? 'bg-white/10' : 'bg-white/[0.03]'}`} />
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className={`uppercase text-[8px] tracking-wider font-semibold ${isTeste1 ? 'text-white/70' : 'text-zinc-550'}`}>STREAK</span>
                <span className={`font-extrabold flex items-center gap-0.5 ${isTeste1 ? 'text-amber-300' : 'text-amber-500'}`}>
                  <Flame size={10} className={isTeste1 ? 'fill-amber-300/10 text-amber-300' : 'fill-amber-500/10 text-amber-500'} />
                  {user.streak || 0} dias
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PWA INSTALL BANNER SECTION */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-lg space-y-3 text-left motion-preset-fade">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <Check size={18} strokeWidth={3} />
              </div>
              <div className="min-w-0">
                <span className="text-[7.5px] font-mono font-extrabold uppercase tracking-widest text-emerald-500 block mb-0.5">Aplicativo Configurado</span>
                <h3 className="text-sm font-black uppercase text-white tracking-tight leading-none">Horus PWA Ativo</h3>
                <p className="text-[10px] text-zinc-400 mt-1 font-semibold leading-relaxed">
                  Você já ativou a versão móvel de alto desempenho do Horus Training em sua tela de início.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                handleVibrate(15);
                setShowIOSModal(true);
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 border border-zinc-750 text-zinc-300 font-extrabold uppercase py-2.5 rounded-xl text-[10px] tracking-wider transition-all duration-200 flex justify-center items-center gap-1.5 cursor-pointer shadow-md"
            >
              Ver Tutorial de Instalação (iOS/Safari)
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-lg space-y-3.5 text-left motion-preset-fade">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-500 shrink-0">
                <Rocket size={18} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="text-[7.5px] font-mono font-extrabold uppercase tracking-widest text-blue-500 block mb-0.5">Acesso Exclusivo</span>
                <h3 className="text-sm font-black uppercase text-white tracking-tight leading-none">Instalar Aplicativo</h3>
                <p className="text-[10px] text-zinc-400 mt-1 font-semibold leading-relaxed">
                  Adicione o Horus Training à sua tela de início para desfrutar de telas cheias e desempenho acelerado.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold uppercase py-3 rounded-xl text-xs transition-all duration-200 flex justify-center items-center gap-1.5 cursor-pointer shadow-lg active:scale-[0.98]"
              >
                <Check size={13} strokeWidth={3} /> Instalar Horus Pro
              </button>
              <button
                onClick={() => {
                  handleVibrate(15);
                  setShowIOSModal(true);
                }}
                className="px-4 bg-zinc-805 hover:bg-zinc-705 border border-zinc-750 text-zinc-300 font-extrabold uppercase py-3 rounded-xl text-[10px] tracking-wide transition-all duration-200 flex justify-center items-center gap-1.5 cursor-pointer shadow-md"
              >
                Como Instalar
              </button>
            </div>
          </div>
        )}

        {/* GALLERIA: Conquistas do Atleta row */}
        <div className="space-y-3 text-left">
          <span className={`text-[7.5px] font-extrabold tracking-[0.2em] uppercase font-mono block px-0.5 ${isTeste1 ? 'text-zinc-500 font-bold' : 'text-zinc-500'}`}>
            Galeria de Conquistas (Achievements)
          </span>
          
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              return (
                <button
                  key={ach.id}
                  onClick={() => {
                    handleVibrate(15);
                    setSelectedAchievement(ach);
                  }}
                  className={`flex flex-col items-center justify-center text-center py-2.5 px-1 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isTeste1
                      ? (ach.unlocked 
                          ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-transparent text-white shadow-md hover:scale-[1.02]' 
                          : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-155')
                      : (ach.unlocked 
                          ? 'bg-[#0E0F13]/60 border-accent/15 hover:border-accent text-white' 
                          : 'bg-[#0F1014]/40 border-white/[0.04] hover:bg-[#0F1014]/65 hover:border-white/10 text-[#a3a3a3]')
                  }`}
                >
                  <div className={`p-1.5 rounded-xl border ${
                    isTeste1
                      ? (ach.unlocked 
                          ? 'bg-white/15 border-white/10 text-white' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-400')
                      : (ach.unlocked 
                          ? 'bg-zinc-900 border-white/5 text-accent border-accent/15' 
                          : 'bg-zinc-900 border-white/5 text-zinc-400')
                  }`}>
                    <Icon size={14} strokeWidth={ach.unlocked ? 2.5 : 2} />
                  </div>
                  
                  <p className={`text-[8.5px] font-black uppercase tracking-tight mt-1.5 truncate max-w-full ${
                    isTeste1
                      ? (ach.unlocked ? 'text-white font-[900]' : 'text-zinc-500')
                      : (ach.unlocked ? 'text-white' : 'text-zinc-350')
                  }`}>
                    {ach.title.split(' ')[0]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* AJUSTAR TREINO NO DASHBOARD / VOLTAR TREINO */}
        <div className={`p-4 rounded-2xl border space-y-3.5 shadow-md text-left ${
          isTeste1 
            ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10 text-white shadow-lg' 
            : 'bg-[#080808] border-white/5 text-white'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`p-2 rounded-xl border shrink-0 ${isTeste1 ? 'bg-white/15 border-white/10 text-white' : 'bg-zinc-900 border-white/5 text-accent'}`}>
                <RotateCcw size={15} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black uppercase text-white tracking-tight leading-none">
                  Ajustar Treino no Dashboard
                </h3>
                <p className={`text-[8.5px] font-mono mt-0.5 truncate ${isTeste1 ? 'text-white/70' : 'text-zinc-400'}`}>
                  Finalizou sem querer ou deseja voltar o treino?
                </p>
              </div>
            </div>

            {user.preferredWorkoutId && (
              <button
                onClick={handleResetPreferredWorkout}
                className="text-[8px] font-mono font-bold uppercase px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0 cursor-pointer"
                title="Voltar para rotação automática"
              >
                <RefreshCw size={9} /> Rotação Auto
              </button>
            )}
          </div>

          {/* Quick Undo Last Workout */}
          {user.history && user.history.length > 0 && (
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
              isTeste1 ? 'bg-white/10 border-white/10' : 'bg-zinc-900/80 border-white/5'
            }`}>
              <div className="min-w-0">
                <span className="text-[7.5px] font-mono uppercase tracking-wider text-amber-400 font-extrabold block">
                  Último Treino Registrado
                </span>
                <p className="text-[11px] font-extrabold uppercase text-white truncate mt-0.5">
                  {user.history[0].workoutTitle}
                </p>
                <span className={`text-[8px] font-mono block ${isTeste1 ? 'text-white/70' : 'text-zinc-400'}`}>
                  Concluído em {new Date(user.history[0].date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <button
                onClick={handleUndoLastWorkout}
                className="w-full sm:w-auto px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500/40 border border-amber-500/40 text-amber-300 hover:text-amber-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RotateCcw size={12} /> Desfazer Este Treino
              </button>
            </div>
          )}

          {/* Select Specific Active Workout */}
          <div className="space-y-1.5 pt-1">
            <span className={`text-[7.5px] font-mono font-extrabold uppercase tracking-widest block ${isTeste1 ? 'text-white/70' : 'text-zinc-400'}`}>
              Definir qual treino deve aparecer agora no Dashboard:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {userWorkouts.map((w) => {
                const isActive = currentActiveDashboardWorkoutId === w.id || (user.preferredWorkoutId === w.id);

                return (
                  <button
                    key={w.id}
                    onClick={() => handleSelectNextWorkout(w.id, w.title)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between min-h-[58px] cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/50'
                        : (isTeste1 ? 'bg-white/10 hover:bg-white/15 border-white/10 text-white/90' : 'bg-zinc-900/60 hover:bg-zinc-900 border-white/5 text-zinc-300')
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 w-full">
                      <span className="text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-2">
                        {w.title}
                      </span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 mt-0.5" />
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between w-full">
                      <span className={`text-[7.5px] font-mono uppercase tracking-wider ${
                        isActive ? 'text-emerald-300 font-extrabold' : (isTeste1 ? 'text-white/60' : 'text-zinc-500')
                      }`}>
                        {isActive ? 'Ativo no Dashboard' : 'Definir Ativo'}
                      </span>
                      <Dumbbell size={10} className={isActive ? 'text-emerald-300' : 'opacity-40'} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MEUS TREINOS (History View Ported) */}
        <div className="space-y-3 mt-4 text-left">
          <span className={`text-[7.5px] font-extrabold tracking-[0.2em] uppercase font-mono block px-0.5 ${isTeste1 ? 'text-zinc-500 font-bold' : 'text-zinc-500'}`}>
            Histórico de Treinos
          </span>
          
          {user?.history.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center border rounded-2xl border-dashed border-zinc-200 dark:border-white/5">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-500 mb-2">
                <History size={16} />
              </div>
              <p className="text-zinc-500 text-[8.5px] font-black uppercase tracking-[0.15em]">Sua história começa agora.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {user?.history.map((entry) => {
                const accentColor = '#2563EB';
                return (
                  <div 
                    key={entry.id} 
                    className={`rounded-2xl p-4.5 space-y-3.5 shadow-md border transition-all duration-200 ${
                      isTeste1 
                        ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10 text-white shadow-lg' 
                        : 'bg-zinc-900/40 border-zinc-850/80 text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className={`w-[3px] h-5.5 rounded-full shrink-0 ${isTeste1 ? 'bg-white/80' : ''}`}
                          style={isTeste1 ? undefined : { backgroundColor: accentColor }} 
                        />
                        <div className="min-w-0">
                          <h3 className="text-[13px] font-black text-white uppercase tracking-tight italic leading-tight truncate">
                            {entry.workoutTitle}
                          </h3>
                          <div className={`flex items-center gap-1.5 mt-1 leading-none ${isTeste1 ? 'text-white/60' : 'text-zinc-500'}`}>
                            <Calendar size={9} />
                            <span className="text-[8px] font-mono font-bold uppercase tracking-wider">
                              {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end gap-1 shrink-0 text-right leading-none">
                          <span 
                            className={`border px-2 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider font-mono leading-none ${isTeste1 ? 'bg-white/15 border-white/10 text-white' : ''}`}
                            style={isTeste1 ? undefined : { 
                              color: accentColor, 
                              borderColor: `${accentColor}25`, 
                              backgroundColor: `${accentColor}08` 
                            }}
                          >
                            CONCLUÍDO
                          </span>
                          {entry.duration && (
                            <div className={`flex items-center gap-0.5 text-[8px] font-mono font-extrabold uppercase leading-none mt-1 ${isTeste1 ? 'text-white/90' : 'text-zinc-400'}`}>
                              <Clock size={8.5} className={isTeste1 ? 'text-white/60' : 'text-zinc-500'} />
                              <span>{formatTime(entry.duration)}</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveHistoryEntry(entry.id, entry.workoutTitle)}
                          className={`p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer ml-1`}
                          title="Excluir este registro do histórico"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Exercises Done */}
                    <div className={`pt-2.5 border-t space-y-2 ${isTeste1 ? 'border-white/10' : 'border-white/[0.03]'}`}>
                      <span className={`text-[7.5px] font-black uppercase tracking-widest font-mono block ${isTeste1 ? 'text-white/60' : 'text-zinc-500'}`}>
                        Cargas e Exercícios Registrados:
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {entry.exercises.map((ex, idx) => (
                          <div 
                            key={idx} 
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 p-2 rounded-xl border ${
                              isTeste1 
                                ? 'bg-white/10 border-white/5' 
                                : 'bg-zinc-950/20 border-white/[0.015]'
                            }`}
                          >
                            <span className={`text-[10px] font-bold uppercase tracking-tight leading-tight ${isTeste1 ? 'text-white' : 'text-zinc-200'}`}>
                              {ex.name}
                            </span>
                            <div className="flex flex-wrap gap-1 shrink-0 font-sans">
                              {ex.performance && ex.performance.filter(p => p.completed).map((s, si) => (
                                <div key={si} className={`text-[7.5px] font-mono font-extrabold px-1.5 py-0.5 rounded border leading-none ${
                                  isTeste1 
                                    ? 'bg-white/15 text-white border-white/5' 
                                    : 'bg-[#111318]/60 text-zinc-300 border-white/5'
                                }`}>
                                  S{si + 1}: {s.weight}kg × {s.reps}
                                </div>
                              ))}
                              {(!ex.performance || ex.performance.filter(p => p.completed).length === 0) && ex.performance && ex.performance.map((s, si) => (
                                <div key={si} className={`text-[7.5px] font-mono font-extrabold px-1.5 py-0.5 rounded border leading-none ${
                                  isTeste1 
                                    ? 'bg-white/5 text-white/40 border-white/5' 
                                    : 'bg-[#111318]/40 text-zinc-500 border-white/[0.03]'
                                }`}>
                                  S{si + 1}: {s.weight}kg × {s.reps}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {entry.cardio && (
                          <div className={`flex items-center justify-between gap-1.5 p-2 rounded-xl border ${
                            isTeste1 
                              ? 'bg-white/10 border-white/5' 
                              : 'bg-zinc-950/20 border-white/[0.015]'
                          }`}>
                            <div className="flex items-center gap-1.5 leading-none">
                              <Wind size={10} className={isTeste1 ? 'text-white' : ''} style={isTeste1 ? undefined : { color: accentColor }} />
                              <span className={`text-[10px] font-bold uppercase tracking-tight leading-none ${isTeste1 ? 'text-white' : 'text-zinc-200'}`}>
                                Aeróbico Intercalar ({entry.cardio.exercise})
                              </span>
                            </div>
                            <span className={`text-[7.5px] font-mono font-extrabold px-1.5 py-0.5 rounded border leading-none ${
                              isTeste1 
                                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/10' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                            }`}>
                              {entry.cardio.duration} MINUTOS
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* PRESERVING USER FOOTER ALIGNMENTS */}
      <div className="px-1 shrink-0 pt-3 text-center">
        <span className={`text-[7.5px] font-mono font-bold tracking-widest uppercase ${isTeste1 ? 'text-zinc-400' : 'text-zinc-650'}`}>
          Horus Training Elite Active Account
        </span>
      </div>

      {/* PREMIUM ATHLETE EDIT MODAL / ACHIEVEMENT DETAIL MODAL */}
      <AnimatePresence>
        {isEditing && (
          <div className="absolute inset-x-0 bottom-0 top-0 bg-black/90 backdrop-blur-md z-40 flex items-center justify-center p-3">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-sm bg-[#080808] border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90%] overflow-y-auto text-left"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Editar Atleta</h3>
                  <p className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-wider">Mantenha seus dados reais em dia.</p>
                </div>
                <button 
                  onClick={() => {
                    handleVibrate(5);
                    setIsEditing(false);
                  }}
                  className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSave} className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[7.5px] font-mono font-black text-zinc-500 uppercase tracking-widest">Nome do Atleta</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 text-white placeholder-zinc-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent transition-colors font-bold uppercase tracking-wide"
                    required
                    maxLength={24}
                  />
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[7.5px] font-mono font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                      <Scale size={9} className="text-zinc-650" /> PESO (KG)
                    </label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/5 text-white placeholder-zinc-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent transition-colors font-mono font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7.5px] font-mono font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                      <Ruler size={9} className="text-zinc-650" /> ALTURA (M)
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editHeight}
                      onChange={(e) => setEditHeight(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/5 text-white placeholder-zinc-750 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent transition-colors font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Level Choice Options */}
                <div className="space-y-1.5">
                  <label className="text-[7.5px] font-mono font-black text-zinc-500 uppercase tracking-widest">Nível Atual</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      'Atleta Iniciante',
                      'Atleta Intermediário',
                      'Atleta Avançado',
                      'Atleta Elite'
                    ].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          handleVibrate(5);
                          setEditLevel(lvl);
                        }}
                        className={`py-2 px-2.5 text-[8.5px] font-black uppercase tracking-wide rounded-lg border text-center transition-all ${
                          editLevel === lvl
                            ? 'bg-accent/10 border-accent/40 text-white shadow-[0_0_8px_rgba(var(--accent-color-rgb),0.1)]'
                            : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white hover:border-white/10'
                        }`}
                      >
                        {lvl.replace('Atleta ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/95 text-black font-extrabold uppercase py-3 rounded-xl text-xs transition-colors flex justify-center items-center gap-1.5 cursor-pointer shadow-md duration-200"
                  >
                    <Check size={11} strokeWidth={3} /> Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {selectedAchievement && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xs bg-zinc-950 border border-white/10 p-5 rounded-2xl flex flex-col items-center text-center gap-4 shadow-2xl leading-none text-left"
            >
              <div 
                onClick={() => setSelectedAchievement(null)} 
                className="absolute inset-0 bg-transparent"
              />
              <div className="relative z-10 flex flex-col items-center gap-4 w-full">
                <div className={`p-4 rounded-full border ${
                  selectedAchievement.unlocked 
                    ? 'bg-accent/10 border-accent/25 text-accent shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.3)]' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-650'
                }`}>
                  {React.createElement(selectedAchievement.icon, { size: 28, strokeWidth: 2.2 })}
                </div>

                <div className="space-y-1 text-center leading-normal">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">{selectedAchievement.title}</h4>
                  <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">{selectedAchievement.description}</p>
                </div>

                {selectedAchievement.unlocked && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 py-1.5 px-3.5 rounded-xl leading-none">
                    <span className="text-[9px] font-mono text-emerald-400 font-black uppercase tracking-wider">
                      BÔNUS LIBERADO: {selectedAchievement.reward}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedAchievement(null)}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-white font-extrabold text-[10px] uppercase rounded-xl tracking-wider transition-all cursor-pointer text-center"
                >
                  Fechar Conquista
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showIOSModal && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-40 flex items-center justify-center p-3">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-sm bg-[#080808] border border-slate-850 rounded-2xl p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[92%] text-left"
            >
              <div className="flex justify-between items-center pb-1 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Instalar Horus Training</h3>
                  <p className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Dispositivo iOS / Safari necessário</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleVibrate(5);
                    setShowIOSModal(false);
                  }}
                  className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </div>

              <div className="space-y-3.5 py-1">
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-500 shrink-0 mt-0.5 text-[9px] font-black font-mono">1</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white">Abra a Barra de Navegação</p>
                    <p className="text-[10px] text-zinc-500 leading-normal font-medium">No navegador Safari, localize a barra inferior de ferramentas.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-500 shrink-0 mt-0.5 text-[9px] font-black font-mono">2</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white">Toque no botão "Compartilhar"</p>
                    <p className="text-[10px] text-zinc-500 leading-normal font-medium">É o ícone representado por um quadrado com uma seta apontando para cima.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-500 shrink-0 mt-0.5 text-[9px] font-black font-mono">3</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white">Selecione "Adicionar à Tela de Início"</p>
                    <p className="text-[10px] text-zinc-500 leading-normal font-medium">Role o menu de compartilhamento para baixo até encontrar esta opção.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-500 shrink-0 mt-0.5 text-[9px] font-black font-mono">4</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white">Toque em "Adicionar"</p>
                    <p className="text-[10px] text-zinc-500 leading-normal font-medium">Confirme o nome do aplicativo e conclua a instalação com o botão no canto superior direito.</p>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleVibrate(5);
                    setShowIOSModal(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold uppercase py-2.5 rounded-xl text-[10px] tracking-wider transition-colors text-center"
                >
                  Entendido, vou adicionar!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};
