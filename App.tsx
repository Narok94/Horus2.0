import './src/login.css';
import { BrandLogo } from './components/ui/BrandLogo';
import { TodayView } from './components/views/TodayView';
import { AgendaView } from './components/views/AgendaView';
import { DietView } from './components/views/DietView';
import { isPersonalUser } from './src/utils/personalData';
import { HistoryView } from './components/views/HistoryView';
import { validateLocalProfile } from './src/utils/localData';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  Utensils,
  Dumbbell,
  LayoutDashboard,

  User as UserIcon,
  Lock,

  Home,
  BarChart3,

  Eye,
  EyeOff
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

export const HorusLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <BrandLogo className={className} style={{ width:size, height:size }} />
);

const AppContent: React.FC = () => {
  const {
    user,
    isLoggedIn,
    activeTab,
    selectedWorkout,
    showSummary,

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
    const accentColor = '#2563EB';
    const accentRgb = '37, 99, 235';

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
  const loginRef = useRef<HTMLElement>(null);

  // Safari/PWA keyboards resize the visual viewport independently of CSS dvh.
  useEffect(() => {
    if (isLoading || isLoggedIn) return;
    const viewport = window.visualViewport;
    const updateLoginViewport = () => {
      loginRef.current?.style.setProperty('--login-height', `${viewport?.height ?? window.innerHeight}px`);
      loginRef.current?.style.setProperty('--login-top', `${viewport?.offsetTop ?? 0}px`);
    };
    updateLoginViewport();
    viewport?.addEventListener('resize', updateLoginViewport);
    viewport?.addEventListener('scroll', updateLoginViewport);
    window.addEventListener('resize', updateLoginViewport);
    return () => {
      viewport?.removeEventListener('resize', updateLoginViewport);
      viewport?.removeEventListener('scroll', updateLoginViewport);
      window.removeEventListener('resize', updateLoginViewport);
    };
  }, [isLoading, isLoggedIn]);


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
      <main className="horus-login" aria-label="Entrar no Horus Gym" ref={loginRef}>
        <div className="horus-login-art" role="img" aria-label="Academia, garrafa Horus Gym e a frase: Disciplina é o que te leva mais longe." />
        <form onSubmit={handleLogin} className="horus-login-form" aria-label="Login">
          <label className="horus-login-field">
            <UserIcon size={19} aria-hidden="true" />
            <span className="sr-only">Usuário</span>
            <input
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.form?.querySelector<HTMLInputElement>('[name="password"]')?.focus();
                }
              }}
              required
            />
          </label>
          <label className="horus-login-field">
            <Lock size={19} aria-hidden="true" />
            <span className="sr-only">Senha</span>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              enterKeyHint="go"
              required
            />
            <button
              type="button"
              className="horus-login-eye"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </label>
          <button type="submit" className="horus-login-submit">Entrar</button>
        </form>
      </main>
    );
  }

  const personal = isPersonalUser(user?.username);
  const isLightUser = isLoggedIn;
  const isPremiumScreen = activeTab !== AppTab.WORKOUT || !selectedWorkout;

  const renderView = () => {
    if (selectedWorkout && activeTab === AppTab.WORKOUT) return <WorkoutView />;
    switch (activeTab) {
      case AppTab.DASHBOARD: return personal ? <TodayView /> : <DashboardView />;
      case AppTab.AGENDA: return personal ? <AgendaView /> : <DashboardView />;
      case AppTab.DIET: return personal ? <DietView /> : <DashboardView />;
      case AppTab.WORKOUT: return <>{personal && <button className="personal-history-link" onClick={() => setActiveTab(AppTab.HISTORY)}>Ver histórico de treinos →</button>}<WorkoutsListView /></>;
      case AppTab.HISTORY: return <HistoryView />;
      case AppTab.PROFILE: return <ProfileView />;
      default: return <DashboardView />;
    }
  };

  const strokeColor = isLightUser ? "rgba(0, 0, 0, 0.015)" : "rgba(255, 255, 255, 0.02)";
  const circleFill = isLightUser ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.06)";
  const circleFillStrong = isLightUser ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)";

  const navItems = personal ? [
    { id: AppTab.DASHBOARD, icon: Home, label: 'Hoje' },
    { id: AppTab.AGENDA, icon: CalendarDays, label: 'Agenda' },
    { id: AppTab.WORKOUT, icon: Dumbbell, label: 'Treino' },
    { id: AppTab.DIET, icon: Utensils, label: 'Dieta' },
    { id: AppTab.PROFILE, icon: UserIcon, label: 'Perfil' }
  ] : [
    { id: AppTab.DASHBOARD, icon: Home, label: 'Home' },
    { id: AppTab.WORKOUT, icon: Dumbbell, label: 'Treinos' },
    { id: AppTab.HISTORY, icon: BarChart3, label: 'Histórico' },
    { id: AppTab.PROFILE, icon: UserIcon, label: 'Perfil' }
  ];

  return (
    <div className={`horus-app-shell ${isPremiumScreen ? 'horus-background-shell' : ''} ${personal ? 'personal-shell' : ''} ${activeTab === AppTab.WORKOUT && showSummary ? 'completion-light-shell' : ''} ${activeTab === AppTab.HISTORY || activeTab === AppTab.PROFILE ? 'account-light-shell' : ''} ${activeTab === AppTab.DASHBOARD ? 'dashboard-refined-shell' : ''} ${activeTab === AppTab.WORKOUT || activeTab === AppTab.DASHBOARD ? 'performance-shell' : ''} min-h-[100dvh] relative flex flex-col ${
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

      <div className="horus-main-content flex-grow flex-1 min-h-0 w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-1 sm:px-3 md:px-4 lg:px-6 pt-1 relative z-10 flex flex-col justify-start">
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
