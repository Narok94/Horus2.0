import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  LayoutDashboard, 
  History as HistoryIcon, 
  User as UserIcon,
  Lock,
  Check,
  ArrowRight,
  Users,
  Plus
} from 'lucide-react';
import { useStore } from './store';
import { useWorkoutPersistence } from './hooks/useWorkoutPersistence';
import { AppTab, User } from './types';
import { ToastProvider, useToast } from './components/ui/Toast';
import { DashboardSkeleton } from './components/ui/Skeleton';
import { db, auth, collection, getDocs, doc, setDoc, getDoc, onSnapshot, signInAnonymously } from './firebase';

// Atualização de sincronização do GitHub. Assets restaurados.
// Views
import { DashboardView } from './components/views/DashboardView';
import { WorkoutView } from './components/views/WorkoutView';
import { HistoryView } from './components/views/HistoryView';
import { ProfileView } from './components/views/ProfileView';
import { TeacherView } from './components/views/TeacherView';
import { WorkoutsListView } from './components/views/WorkoutsListView';

export const HorusLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Asas Geométricas Esquerda */}
      <path 
        d="M 22,28 L 3,42 L 23,52 L 13,62 L 33,57 Z" 
        fill="currentColor" 
        opacity="0.85" 
      />
      {/* Asas Geométricas Direita */}
      <path 
        d="M 78,28 L 97,42 L 77,52 L 87,62 L 67,57 Z" 
        fill="currentColor" 
        opacity="0.85" 
      />
      {/* Halter Vertical */}
      {/* Barra central */}
      <rect x="47" y="15" width="6" height="70" rx="3" fill="currentColor" />
      {/* Peso superior */}
      <rect x="36" y="10" width="28" height="8" rx="2" fill="currentColor" />
      <rect x="40" y="5" width="20" height="5" rx="1.5" fill="currentColor" />
      {/* Peso inferior */}
      <rect x="36" y="82" width="28" height="8" rx="2" fill="currentColor" />
      <rect x="40" y="90" width="20" height="5" rx="1.5" fill="currentColor" />
      
      {/* Olho de Hórus centralizado */}
      <g>
        {/* Contorno do Olho com máscara/fundo escuro */}
        <path 
          d="M 32,50 C 40,38 60,38 68,50 C 60,62 40,62 32,50 Z" 
          stroke="#050505" 
          strokeWidth="4" 
          fill="#050505" 
        />
        <path 
          d="M 32,50 C 40,38 60,38 68,50 C 60,62 40,62 32,50 Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none" 
        />
        {/* Íris do olho */}
        <circle cx="50" cy="50" r="6" fill="#050505" />
        <circle cx="50" cy="50" r="4.5" fill="currentColor" />
        <circle cx="51.5" cy="48.5" r="1.5" fill="#050505" />
        
        {/* Lágrima/Sinal do Olho de Hórus (detalhe inferior) */}
        <path 
          d="M 44,55 L 40,70" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        {/* Linha espiral/curva inferior direita */}
        <path 
          d="M 54,54 Q 57,69 63,65 C 65,63 64,59 60,58" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          fill="none" 
          strokeLinecap="round" 
        />
        {/* Traço superior da sobrancelha de Hórus */}
        <path 
          d="M 31,39 Q 50,29 69,39" 
          stroke="currentColor" 
          strokeWidth="3.2" 
          fill="none" 
          strokeLinecap="round" 
        />
      </g>
    </svg>
  );
};

const AppContent: React.FC = () => {
  const { 
    user, 
    isLoggedIn, 
    activeTab, 
    selectedWorkout, 
    isWorkoutActive, 
    currentSessionProgress,
    workoutStartTime,
    allWorkouts,
    theme,
    setUser, 
    setIsLoggedIn, 
    setActiveTab, 
    setSelectedWorkout,
    setCurrentSessionProgress,
    setIsWorkoutActive,
    setWorkoutStartTime,
    addToast,
    setAddToast
  } = useStore();

  useWorkoutPersistence();

  const { addToast: toastFn } = useToast();

  useEffect(() => {
    setAddToast(toastFn);
  }, [toastFn, setAddToast]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Sync Dynamic User Accent Color with global CSS variables based on target layouts
  useEffect(() => {
    let accentColor = '#D4AF37'; // Global Gold Theme
    let accentRgb = '212, 175, 55';
    
    if (user) {
      const uName = user.username.toLowerCase();
      const isFemale = uName === 'teste2' || uName.includes('jessica') || uName.includes('jéssica') || user.sex === 'feminino';
      const isTeacher = uName === 'teste3' || uName.includes('flavia') || uName.includes('flávia');
      
      // Removed dynamic colors so everything respects the golden visual identity as requested:
      // Golden theme overrides all user roles
      accentColor = '#D4AF37'; 
      accentRgb = '212, 175, 55';
    }
    
    const root = document.documentElement;
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--accent-color-rgb', accentRgb);
    root.style.setProperty('--highlight-color', accentColor);
    root.style.setProperty('--glow-color', `rgba(${accentRgb}, 0.15)`);
  }, [user]);

  // Safety sync for already logged-in users to ensure security rules work
  // Save user profile locally whenever it changes
  useEffect(() => {
    if (isLoggedIn && user) {
      localStorage.setItem(`tatugym_user_profile_${user.username.toLowerCase()}`, JSON.stringify(user));
    }
  }, [isLoggedIn, user]);

  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem('tatugym_remember_me_checked');
    if (saved !== null) return saved === 'true';
    return localStorage.getItem('tatugym_remembered') !== null;
  });

  // Sync rememberMe state with localStorage on change
  useEffect(() => {
    // Left empty for consistency
  }, [rememberMe]);

  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        console.log('[App] Verificando auto-login...');
        const remembered = localStorage.getItem('tatugym_remembered');
        if (remembered) {
          const userData = JSON.parse(remembered);
          const allowedUsers = ['teste', 'teste2', 'teste3'];
          if (allowedUsers.includes(userData.username.toLowerCase())) {
            const profile = localStorage.getItem(`tatugym_user_profile_${userData.username.toLowerCase()}`);
            const finalUser = profile ? JSON.parse(profile) : userData;
            setUser(finalUser);
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem('tatugym_remembered');
          }
        }
      } catch (error) {
        console.error('[App] Erro ao carregar usuário lembrado:', error);
        localStorage.removeItem('tatugym_remembered');
      } finally {
        setIsLoading(false);
      }
    };

    checkAutoLogin();
  }, [setUser, setIsLoggedIn]);

  const handleVibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleQuickLogin = (uname: string) => {
    handleVibrate();
    const lowerUser = uname.toLowerCase();
    let userData: User | null = null;
    const profile = localStorage.getItem(`tatugym_user_profile_${lowerUser}`);
    if (profile) {
      try {
        userData = JSON.parse(profile);
      } catch (e) {
        console.error('[Login] Erro ao ler perfil salvo:', e);
      }
    }

    if (!userData) {
      if (lowerUser === 'teste') {
        userData = {
          username: 'teste',
          name: 'Teste Masculino',
          age: 25,
          goal: 'Hipertrofia & Força',
          totalWorkouts: 0,
          history: [],
          weights: {},
          checkIns: [],
          streak: 0,
          badges: [],
          isProfileComplete: true,
          role: 'student'
        };
      } else if (lowerUser === 'teste2') {
        userData = {
          username: 'teste2',
          name: 'Teste Feminino',
          age: 23,
          goal: 'Tônus muscular & Cardio',
          totalWorkouts: 0,
          history: [],
          weights: {},
          checkIns: [],
          streak: 0,
          badges: [],
          isProfileComplete: true,
          role: 'student'
        };
      } else {
        userData = {
          username: 'teste3',
          name: 'Professor Teste',
          age: 35,
          goal: 'Orientar alunos',
          totalWorkouts: 0,
          history: [],
          weights: {},
          checkIns: [],
          streak: 0,
          badges: [],
          isProfileComplete: true,
          role: 'teacher'
        };
      }
    }

    setUser(userData);
    setIsLoggedIn(true);
    
    if (userData.role === 'teacher') {
      setActiveTab(AppTab.TEACHER);
    } else {
      setActiveTab(AppTab.DASHBOARD);
    }
    
    // Auto sync username state so form inputs reflect current identity if logged out
    setUsername(lowerUser);
    setPassword('12345');
    
    localStorage.setItem('tatugym_remember_me_checked', rememberMe.toString());
    if (rememberMe) {
      localStorage.setItem('tatugym_remembered', JSON.stringify(userData));
    } else {
      localStorage.removeItem('tatugym_remembered');
    }
    
    if (addToast) addToast(`Bem-vindo de volta, ${userData.name}!`, 'success');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    handleVibrate();
    const lowerUser = username.trim().toLowerCase();
    
    const isValidUser = 
      ['teste', 'teste2', 'teste3'].includes(lowerUser) && password === '12345';

    if (isValidUser) {
      let userData: User | null = null;
      const profile = localStorage.getItem(`tatugym_user_profile_${lowerUser}`);
      if (profile) {
        try {
          userData = JSON.parse(profile);
        } catch (e) {
          console.error('[Login] Erro ao ler perfil salvo:', e);
        }
      }

      if (!userData) {
        if (lowerUser === 'teste') {
          userData = {
            username: 'teste',
            name: 'Teste Masculino',
            age: 25,
            goal: 'Hipertrofia & Força',
            totalWorkouts: 0,
            history: [],
            weights: {},
            checkIns: [],
            streak: 0,
            badges: [],
            isProfileComplete: true,
            role: 'student'
          };
        } else if (lowerUser === 'teste2') {
          userData = {
            username: 'teste2',
            name: 'Teste Feminino',
            age: 23,
            goal: 'Tônus muscular & Cardio',
            totalWorkouts: 0,
            history: [],
            weights: {},
            checkIns: [],
            streak: 0,
            badges: [],
            isProfileComplete: true,
            role: 'student'
          };
        } else {
          userData = {
            username: 'teste3',
            name: 'Professor Teste',
            age: 35,
            goal: 'Orientar alunos',
            totalWorkouts: 0,
            history: [],
            weights: {},
            checkIns: [],
            streak: 0,
            badges: [],
            isProfileComplete: true,
            role: 'teacher'
          };
        }
      }

      setUser(userData);
      setIsLoggedIn(true);
      
      if (userData.role === 'teacher') {
        setActiveTab(AppTab.TEACHER);
      } else {
        setActiveTab(AppTab.DASHBOARD);
      }
      
      localStorage.setItem('tatugym_remember_me_checked', rememberMe.toString());
      if (rememberMe) {
        localStorage.setItem('tatugym_remembered', JSON.stringify(userData));
      } else {
        localStorage.removeItem('tatugym_remembered');
      }
      
      if (addToast) addToast(`Bem-vindo de volta, ${userData.name}!`, 'success');
    } else {
      if (addToast) addToast('Usuário ou senha incorreta.', 'error');
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  if (!isLoggedIn) {
    return (
      <div className="h-screen overflow-hidden bg-[#050505] relative flex flex-col justify-center items-center p-6 font-sans selection:bg-accent/30 select-none">
        
        {/* Fundo Tecnológico (Efeito de Linhas Conexas) */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(var(--accent-color-rgb), 0.03)" strokeWidth="0.5" />
              <circle cx="40" cy="0" r="1.5" fill="rgba(var(--accent-color-rgb), 0.08)" />
              <circle cx="0" cy="40" r="1.5" fill="rgba(var(--accent-color-rgb), 0.08)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="rgba(var(--accent-color-rgb), 0.03)" strokeWidth="0.5" />
          <line x1="30%" y1="40%" x2="25%" y2="70%" stroke="rgba(var(--accent-color-rgb), 0.03)" strokeWidth="0.5" />
          <line x1="25%" y1="70%" x2="60%" y2="85%" stroke="rgba(var(--accent-color-rgb), 0.03)" strokeWidth="0.5" />
          <line x1="60%" y1="85%" x2="80%" y2="45%" stroke="rgba(var(--accent-color-rgb), 0.03)" strokeWidth="0.5" />
          <line x1="80%" y1="45%" x2="55%" y2="25%" stroke="rgba(var(--accent-color-rgb), 0.03)" strokeWidth="0.5" />
          <line x1="55%" y1="25%" x2="10%" y2="20%" stroke="rgba(var(--accent-color-rgb), 0.03)" strokeWidth="0.5" />
          <line x1="30%" y1="40%" x2="55%" y2="25%" stroke="rgba(var(--accent-color-rgb), 0.03)" strokeWidth="0.5" />
          <line x1="25%" y1="70%" x2="55%" y2="25%" stroke="rgba(var(--accent-color-rgb), 0.03)" strokeWidth="0.5" />
          <line x1="60%" y1="85%" x2="55%" y2="25%" stroke="rgba(var(--accent-color-rgb), 0.03)" strokeWidth="0.5" />
          
          <circle cx="10%" cy="20%" r="2" fill="rgba(var(--accent-color-rgb), 0.15)" />
          <circle cx="30%" cy="40%" r="2.5" fill="rgba(var(--accent-color-rgb), 0.2)" />
          <circle cx="25%" cy="70%" r="2" fill="rgba(var(--accent-color-rgb), 0.15)" />
          <circle cx="60%" cy="85%" r="3" fill="rgba(var(--accent-color-rgb), 0.2)" />
          <circle cx="80%" cy="45%" r="2" fill="rgba(var(--accent-color-rgb), 0.15)" />
          <circle cx="55%" cy="25%" r="2.5" fill="rgba(var(--accent-color-rgb), 0.2)" />
        </svg>

        {/* Efeito de iluminação sutil no topo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-accent/5 blur-[100px] rounded-full pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm space-y-10 relative z-10"
        >
          {/* Bloco do Logotipo (Brand Header) */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-auto max-w-[140px] drop-shadow-[0_0_20px_rgba(var(--accent-color-rgb),0.55)]">
              <img 
                src="/logo/logo.png" 
                alt="Horus Training Logo" 
                onError={(e) => {
                   // Fallback visual
                   const target = e.target as HTMLImageElement;
                   target.onerror = null; 
                   target.style.display = 'none';
                   const fallback = document.getElementById('logo-fallback');
                   if(fallback) fallback.style.display = 'block';
                 }}
                 className="w-full h-auto object-contain"
               />
               <div id="logo-fallback" className="hidden text-accent text-6xl font-black">H</div>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-[950] italic uppercase tracking-wider text-white">
                HORUS <span className="text-accent">TRAINING</span>
              </h1>
              <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] font-mono mt-1">
                ELITE PERFORMANCE SYSTEM
              </p>
            </div>
          </div>

          {" "}
          {/* Formulário com Inputs Otimizados */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              {/* Input Usuário */}
              <div className="space-y-1.5">
                <label className="text-white/50 text-[11px] uppercase tracking-wider font-bold mb-1.5 px-1 block">
                  USUÁRIO
                </label>
                <div className="bg-[#0c0c0c] border border-white/5 focus-within:border-accent/40 rounded-2xl p-4 transition-all flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <UserIcon className="text-accent shrink-0" size={18} />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-transparent text-white font-bold outline-none text-sm placeholder:text-white/20"
                      placeholder="Seu usuário"
                      required
                    />
                  </div>
                  <Plus className="text-white/20 shrink-0" size={16} />
                </div>
              </div>
              
              {" "}
              {/* Input Senha */}
              <div className="space-y-1.5">
                <label className="text-white/50 text-[11px] uppercase tracking-wider font-bold mb-1.5 px-1 block">
                  SENHA
                </label>
                <div className="bg-[#0c0c0c] border border-white/5 focus-within:border-accent/40 rounded-2xl p-4 transition-all flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Lock className="text-accent shrink-0" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-white font-bold outline-none text-sm placeholder:text-white/20"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Plus className="text-white/20 shrink-0" size={16} />
                </div>
              </div>
            </div>

            {" "}
            {/* Opção Unica de Lembrar Acesso */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    rememberMe ? 'bg-accent border-accent' : 'border-white/10 bg-[#0c0c0c]'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleVibrate();
                    setRememberMe(!rememberMe);
                  }}
                >
                  {rememberMe && <Check size={11} className="text-black" strokeWidth={4.5} />}
                </div>
                <span className="text-[11px] font-black text-white/50 uppercase tracking-widest">
                  Lembrar acesso
                </span>
              </label>
            </div>

            {" "}
            {/* Botão de Entrada Massivo (CTA) */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full mt-6 bg-accent hover:opacity-90 text-[#050505] font-black italic uppercase py-4 rounded-3xl text-[15px] tracking-widest shadow-[0_0_25px_rgba(var(--accent-color-rgb),0.35)] active:scale-[0.98] transition-all flex justify-center items-center gap-2 font-sans cursor-pointer border-0"
            >
              ENTRAR <ArrowRight size={18} strokeWidth={3} />
            </motion.button>
          </form>

          {/* Quick Login Section */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-mono text-center block">
              Acesso Rápido de Teste
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('teste')}
                className="bg-[#0c0c0c] hover:bg-[#121212] border border-white/5 hover:border-[#00F0FF]/40 rounded-2xl py-2.5 px-1 text-center transition-all cursor-pointer"
                id="quick-login-teste"
              >
                <span className="text-white text-[11px] font-black uppercase tracking-tight block">TESTE</span>
                <span className="text-[#00F0FF] text-[8px] font-mono uppercase tracking-widest mt-0.5 block font-bold">MASC</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('teste2')}
                className="bg-[#0c0c0c] hover:bg-[#121212] border border-white/5 hover:border-[#FF007F]/40 rounded-2xl py-2.5 px-1 text-center transition-all cursor-pointer"
                id="quick-login-teste2"
              >
                <span className="text-white text-[11px] font-black uppercase tracking-tight block">TESTE 2</span>
                <span className="text-[#FF007F] text-[8px] font-mono uppercase tracking-widest mt-0.5 block font-bold">FEM</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('teste3')}
                className="bg-[#0c0c0c] hover:bg-[#121212] border border-white/5 hover:border-white/40 rounded-2xl py-2.5 px-1 text-center transition-all cursor-pointer"
                id="quick-login-teste3"
              >
                <span className="text-white text-[11px] font-black uppercase tracking-tight block">TESTE 3</span>
                <span className="text-white/60 text-[8px] font-mono uppercase tracking-widest mt-0.5 block font-bold">DOCENTE</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    );
  }

  // ISOLAMENTO CRUCIAL: Se for professor, renderize diretamente o workspace sem abas do aluno ou barra fixada
  if (isLoggedIn && (user?.username.toLowerCase() === 'teste3' || user?.role === 'teacher')) {
    return (
      <div className="h-[100dvh] max-h-[100dvh] overflow-hidden relative flex flex-col bg-[#050505] text-white select-none font-sans">
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="teacher-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#teacher-grid-pattern)" />
        </svg>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-white/[0.01] blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex-grow flex-1 min-h-0 w-full h-full relative z-10 flex flex-col justify-between overflow-hidden">
          <TeacherView />
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (selectedWorkout) return <WorkoutView />;
    
    switch (activeTab) {
      case AppTab.DASHBOARD: return <DashboardView />;
      case AppTab.WORKOUT: return <WorkoutsListView />;
      case AppTab.HISTORY: return <HistoryView />;
      case AppTab.PROFILE: return <ProfileView />;
      case AppTab.TEACHER: return <TeacherView />;
      default: return <DashboardView />;
    }
  };

  const isDashboard = isLoggedIn && activeTab === AppTab.DASHBOARD && !selectedWorkout;

  return (
    <div className={`h-[100dvh] max-h-[100dvh] overflow-hidden relative flex flex-col bg-[#050505] text-white transition-colors duration-400 select-none font-sans`}>
      {/* Plexus Connection Grid Background available across all screens - extremely subtle and highly refined */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="global-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
            <circle cx="40" cy="0" r="1.0" fill="rgba(255, 255, 255, 0.05)" />
            <circle cx="0" cy="40" r="1.0" fill="rgba(255, 255, 255, 0.05)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#global-grid-pattern)" />
        
        <line x1="15%" y1="15%" x2="40%" y2="28%" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
        <line x1="40%" y1="28%" x2="25%" y2="65%" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
        <line x1="25%" y1="65%" x2="65%" y2="80%" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
        <line x1="65%" y1="80%" x2="80%" y2="40%" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
        <line x1="80%" y1="40%" x2="55%" y2="20%" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
        <line x1="55%" y1="20%" x2="15%" y2="15%" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
        <line x1="40%" y1="28%" x2="55%" y2="20%" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
        
        <circle cx="15%" cy="15%" r="1.2" fill="rgba(255, 255, 255, 0.06)" />
        <circle cx="40%" cy="28%" r="1.5" fill="rgba(255, 255, 255, 0.08)" />
        <circle cx="25%" cy="65%" r="1.2" fill="rgba(255, 255, 255, 0.06)" />
        <circle cx="65%" cy="80%" r="2.0" fill="rgba(255, 255, 255, 0.08)" />
        <circle cx="80%" cy="40%" r="1.2" fill="rgba(255, 255, 255, 0.06)" />
        <circle cx="55%" cy="20%" r="1.5" fill="rgba(255, 255, 255, 0.08)" />
      </svg>

      {/* Sutil lighting on top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-accent/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Main viewport-bounded view container */}
      <div className="flex-grow flex-1 min-h-0 w-full max-w-sm md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-2.5 md:px-4 lg:px-6 pt-1 pb-[74px] relative z-10 flex flex-col justify-between overflow-hidden">
        {renderView()}
      </div>

      {/* Navigation Bar */}
      {!selectedWorkout && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/85 backdrop-blur-md border-t border-white/[0.04] shadow-2xl select-none">
          <div className="w-full max-w-sm md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto h-[74px] px-6 flex items-center justify-around">
            {[
              ...(user?.role === 'teacher' ? [{ id: AppTab.TEACHER, icon: Users, label: 'Alunos' }] : []),
              { id: AppTab.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
              { id: AppTab.WORKOUT, icon: Dumbbell, label: 'Treinos' },
              { id: AppTab.HISTORY, icon: HistoryIcon, label: 'Histórico' },
              { id: AppTab.PROFILE, icon: UserIcon, label: 'Perfil' }
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleVibrate();
                    setActiveTab(item.id);
                  }}
                  className="relative flex flex-col items-center justify-center flex-1 h-full py-1 hover:scale-105 active:scale-95 transition-all duration-150 focus:outline-none group cursor-pointer"
                >
                  {/* Dynamic Neon Active Bar on Top */}
                  {isActive && (
                    <div 
                      className="absolute top-0 h-[3px] w-8 rounded-b-md bg-accent animate-fade"
                      style={{ 
                        boxShadow: `0 1px 12px var(--accent-color), 0 0 6px var(--accent-color)` 
                      }}
                    />
                  )}

                  <item.icon 
                    size={19} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-accent scale-110' 
                        : 'text-zinc-500 group-hover:text-zinc-350'
                    }`} 
                    style={{
                      filter: isActive ? `drop-shadow(0 0 8px rgba(var(--accent-color-rgb), 0.55))` : undefined
                    }}
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  <span className={`text-[8.5px] font-[900] uppercase tracking-[0.14em] mt-1.5 transition-all duration-300 ${
                    isActive 
                      ? 'text-accent font-black' 
                      : 'text-zinc-500 group-hover:text-zinc-350'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
