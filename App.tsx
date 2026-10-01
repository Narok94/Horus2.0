import { HistoryView } from './components/views/HistoryView';
import { validateLocalProfile } from './src/utils/localData';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Dumbbell,
  LayoutDashboard,

  User as UserIcon,
  Lock,

  Home,
  BarChart3,

  Eye,
  EyeOff,
  Play
} from 'lucide-react';
import { useStore } from './store';
import { useWorkoutPersistence } from './hooks/useWorkoutPersistence';
import { AppTab, User } from './types';
import { ToastProvider, useToast } from './components/ui/Toast';
import { DashboardSkeleton } from './components/ui/Skeleton';
import { getUserByUsername, validateCredentials } from './data/users';

// Views
import { DashboardView } from './components/views/DashboardView';
import { WorkoutView } from './components/views/WorkoutView';
import { ProfileView } from './components/views/ProfileView';
import { WorkoutsListView } from './components/views/WorkoutsListView';

export const HorusLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = "" }) => {
  return (
    <img
      src="/horus-icon.svg"
      alt="Horus Training Logo"
      style={{ width: size, height: size }}
      className={`${className} object-contain`}
      referrerPolicy="no-referrer"
    />
  );
};

const AppContent: React.FC = () => {
  const {
    user,
    isLoggedIn,
    activeTab,
    selectedWorkout,

    theme,
    setUser,
    setIsLoggedIn,
    setActiveTab,

    addToast,
    setAddToast
  } = useStore();

  useWorkoutPersistence();

  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);

  const { addToast: toastFn } = useToast();

  useEffect(() => {
    setAddToast(toastFn);
  }, [toastFn, setAddToast]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Cor de destaque da aplicação.
  useEffect(() => {
    const accentColor = '#0875F5';
    const accentRgb = '8, 117, 245';

    const root = document.documentElement;
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--accent-color-rgb', accentRgb);
    root.style.setProperty('--highlight-color', accentColor);
    root.style.setProperty('--glow-color', `rgba(${accentRgb}, 0.08)`);
  }, [user]);

  // Salva perfil localmente sempre que mudar
  useEffect(() => {
    if (isLoggedIn && user) {
      localStorage.setItem(`tatugym_user_profile_${user.username.toLowerCase()}`, JSON.stringify(user));
    }
  }, [isLoggedIn, user]);

  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const remembered = localStorage.getItem('tatugym_remembered');
        if (remembered) {
          const userData = JSON.parse(remembered);
          const finalUser = resolveUser(userData.username);
          if (finalUser) {
            setUser(finalUser);
            setIsLoggedIn(true);
            setActiveTab(AppTab.DASHBOARD);
            localStorage.setItem('tatugym_remembered', JSON.stringify(finalUser));
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
  }, [setUser, setIsLoggedIn, setActiveTab]);

  const handleVibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Aceita somente a identidade local e restaura apenas dados de treino.
  const resolveUser = (uname: string): User | null => {
    const defaultUser = getUserByUsername(uname);
    if (!defaultUser) return null;
    const profile = localStorage.getItem(`tatugym_user_profile_${defaultUser.username}`);
    if (profile) {
      try {
        const saved = JSON.parse(profile);
        const validated = validateLocalProfile(saved, defaultUser);
        if (JSON.stringify(saved) !== JSON.stringify(validated)) {
          try {
            const backupKey = `tatugym_user_profile_${defaultUser.username}_validation_backup`;
            if (localStorage.getItem(backupKey) === null) localStorage.setItem(backupKey, profile);
          } catch (error) { console.warn('[Profile] Backup indisponível:', error); }
        }
        return validated;
      } catch (e) {
        try {
          const backupKey = `tatugym_user_profile_${defaultUser.username}_validation_backup`;
          if (localStorage.getItem(backupKey) === null) localStorage.setItem(backupKey, profile);
        } catch (error) { console.warn('[Profile] Backup indisponível:', error); }
        console.error('[resolveUser] Erro ao ler perfil salvo:', e);
      }
    }
    return defaultUser;
  };

  const finishLogin = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    setActiveTab(AppTab.DASHBOARD);
    localStorage.setItem('tatugym_remembered', JSON.stringify(userData));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleVibrate();
    const lowerUser = username.trim().toLowerCase();
    if (validateCredentials(lowerUser, password)) {
      const userData = resolveUser(lowerUser);
      if (userData) finishLogin(userData);
    } else {
      if (addToast) addToast('Usuário ou senha incorreta.', 'error');
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  if (!isLoggedIn) {
    return (
      <div className="horus-login h-[100dvh] max-h-[100dvh] overflow-y-auto w-full flex flex-col font-sans select-none relative bg-[#020412]">

        {/* TOP HALF: Background Image with Overlay */}
        <div className="absolute top-0 left-0 w-full h-[55%] sm:h-[60%] z-0">
          <img
            src="login.png"
            alt="Background"
            onError={(e) => {
              e.currentTarget.src = "https://raw.githubusercontent.com/Narok94/Horus2.0/main/public/logo/login.png";
            }}
            className="w-full h-full object-cover object-top opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020412]/60 via-[#112EA7]/40 to-[#020412]"></div>
          <div className="absolute inset-0 bg-[#0A1C5A]/40 mix-blend-multiply"></div>
        </div>

        {/* TOP SECTION (Logo & Slogan) */}
        <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center pt-8 pb-4 min-h-[45vh]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="relative flex flex-col items-center"
          >
            <img
              src="/horus-icon.svg"
              alt="Horus Training Logo"
              className="w-[180px] sm:w-[200px] h-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] mb-4"
              onError={(e) => {
                e.currentTarget.src = "/horus-icon-512.png";
              }}
              referrerPolicy="no-referrer"
            />
            <div className="space-y-0.5 tracking-wider text-center">
              <p className="text-white text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.24em] leading-tight">
                DISCIPLINA HOJE,
              </p>
              <p className="text-[#38BDF8] text-[11px] sm:text-[12px] font-black uppercase tracking-[0.24em] leading-tight">
                RESULTADO SEMPRE.
              </p>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM SECTION: White Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 bg-white w-full rounded-t-[32px] pt-8 px-6 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col mt-auto shrink-0"
        >
          <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto w-full">
            <div className="space-y-4">

              {/* USERNAME FIELD */}
              <div className="relative text-left w-full mt-2">
                <div className="absolute -top-[9px] left-4 px-1.5 bg-white flex items-center gap-1.5 z-10 select-none">
                  <UserIcon size={12} className="text-[#1D4ED8]" strokeWidth={2.5} />
                  <span className="text-[10px] font-black text-[#1D4ED8] tracking-widest uppercase">Usuário</span>
                </div>
                <div className="relative flex items-center bg-white border border-gray-200 focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/10 rounded-2xl h-[52px] transition-all duration-300">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-full bg-transparent px-4 text-gray-800 font-semibold outline-none text-sm tracking-wide placeholder:text-gray-300"
                    placeholder="Digite seu usuário"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div className="relative text-left w-full mt-2">
                <div className="absolute -top-[9px] left-4 px-1.5 bg-white flex items-center gap-1.5 z-10 select-none">
                  <Lock size={12} className="text-[#1D4ED8]" strokeWidth={2.5} />
                  <span className="text-[10px] font-black text-[#1D4ED8] tracking-widest uppercase">Senha</span>
                </div>
                <div className="relative flex items-center bg-white border border-gray-200 focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/10 rounded-2xl h-[52px] pl-4 pr-12 transition-all duration-300">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-full bg-transparent text-gray-800 font-semibold outline-none text-sm tracking-wide placeholder:text-gray-300"
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-zinc-400 hover:text-[#1D4ED8] focus:outline-none transition-colors cursor-pointer text-center bg-transparent border-0"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* ENTRAR BUTTON */}
            <motion.button
              whileHover={{ scale: 1.01, boxShadow: '0 6px 20px rgba(29, 78, 216, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#1D4ED8] text-white font-black text-xs uppercase tracking-[0.2em] h-[52px] rounded-2xl transition-all flex justify-center items-center gap-2 cursor-pointer border-0 mt-2 shadow-[0_4px_12px_rgba(29,78,216,0.15)]"
            >
              <Play size={12} className="fill-white text-white ml-0.5" /> ENTRAR
            </motion.button>

          </form>
        </motion.div>
      </div>
    );
  }

  const isLightUser = isLoggedIn;
  const isPremiumScreen = activeTab !== AppTab.WORKOUT || !selectedWorkout;

  const renderView = () => {
    if (selectedWorkout && activeTab === AppTab.WORKOUT) return <WorkoutView />;
    switch (activeTab) {
      case AppTab.DASHBOARD: return <DashboardView />;
      case AppTab.WORKOUT: return <WorkoutsListView />;
      case AppTab.HISTORY: return <HistoryView />;
      case AppTab.PROFILE: return <ProfileView />;
      default: return <DashboardView />;
    }
  };

  const strokeColor = isLightUser ? "rgba(0, 0, 0, 0.015)" : "rgba(255, 255, 255, 0.02)";
  const circleFill = isLightUser ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.06)";
  const circleFillStrong = isLightUser ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)";

  const navItems = [
    { id: AppTab.DASHBOARD, icon: Home, label: 'Home' },
    { id: AppTab.WORKOUT, icon: Dumbbell, label: 'Treinos' },
    { id: AppTab.HISTORY, icon: BarChart3, label: 'Histórico' },
    { id: AppTab.PROFILE, icon: UserIcon, label: 'Perfil' }
  ];

  return (
    <div className={`min-h-[100dvh] relative flex flex-col ${
      isPremiumScreen ? "bg-[#F5F7FA] text-slate-900" : isLightUser
        ? "bg-[#F5F7FA] text-gray-900 border-zinc-200"
        : "bg-[#050505] text-white"
    } transition-colors duration-400 select-none font-sans overflow-x-hidden`}>
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="global-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isLightUser ? "rgba(0, 0, 0, 0.025)" : "rgba(255, 255, 255, 0.02)"} strokeWidth="0.5" />
            <circle cx="40" cy="0" r="1.0" fill={isLightUser ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.05)"} />
            <circle cx="0" cy="40" r="1.0" fill={isLightUser ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.05)"} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#global-grid-pattern)" />

        <line x1="15%" y1="15%" x2="40%" y2="28%" stroke={strokeColor} strokeWidth="0.5" />
        <line x1="40%" y1="28%" x2="25%" y2="65%" stroke={strokeColor} strokeWidth="0.5" />
        <line x1="25%" y1="65%" x2="65%" y2="80%" stroke={strokeColor} strokeWidth="0.5" />
        <line x1="65%" y1="80%" x2="80%" y2="40%" stroke={strokeColor} strokeWidth="0.5" />
        <line x1="80%" y1="40%" x2="55%" y2="20%" stroke={strokeColor} strokeWidth="0.5" />
        <line x1="55%" y1="20%" x2="15%" y2="15%" stroke={strokeColor} strokeWidth="0.5" />
        <line x1="40%" y1="28%" x2="55%" y2="20%" stroke={strokeColor} strokeWidth="0.5" />
        <circle cx="15%" cy="15%" r="1.2" fill={circleFill} />
        <circle cx="40%" cy="28%" r="1.5" fill={circleFillStrong} />
        <circle cx="25%" cy="65%" r="1.2" fill={circleFill} />
        <circle cx="65%" cy="80%" r="2.0" fill={circleFillStrong} />
        <circle cx="80%" cy="40%" r="1.2" fill={circleFill} />
        <circle cx="55%" cy="20%" r="1.5" fill={circleFillStrong} />
      </svg>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-accent/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex-grow flex-1 min-h-0 w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-1 sm:px-3 md:px-4 lg:px-6 pt-1 relative z-10 flex flex-col justify-start">
        {renderView()}
      </div>

        <nav className={`horus-bottom-nav fixed bottom-0 left-0 right-0 z-50 ${
          isLightUser
            ? "bg-white/80 border-t border-gray-250/50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
            : "bg-[#050505]/85 border-t border-white/[0.04] shadow-2xl"
        } backdrop-blur-md select-none`}>
          <div className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto h-[74px] px-2 sm:px-6 flex items-center justify-around">
            {navItems.map((item) => {
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
                  {isActive && (
                    <div
                      className="absolute top-0 h-[3px] w-8 rounded-b-md bg-accent animate-fade"
                      style={{ boxShadow: `0 1px 12px var(--accent-color), 0 0 6px var(--accent-color)` }}
                    />
                  )}
                  <item.icon
                    size={19}
                    className={`transition-all duration-300 ${
                      isActive
                        ? 'text-accent scale-110'
                        : (isLightUser ? 'text-gray-400 group-hover:text-gray-600' : 'text-zinc-500 group-hover:text-zinc-350')
                    }`}
                    style={{ filter: isActive ? `drop-shadow(0 0 8px rgba(var(--accent-color-rgb), 0.55))` : undefined }}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-[8.5px] font-[900] uppercase tracking-[0.14em] mt-1.5 transition-all duration-300 ${
                    isActive
                      ? 'text-accent font-black'
                      : (isLightUser ? 'text-gray-400 group-hover:text-gray-600' : 'text-zinc-500 group-hover:text-zinc-350')
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
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
