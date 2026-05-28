import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { User, WorkoutRoutine, AppTab, SetPerformance, WorkoutHistoryEntry, Badge } from './types';
import { jessicaWorkouts, henriqueWorkouts, mariaWorkouts, flaviaWorkouts } from './data/workoutData';
import { auth, signOut } from './firebase';

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  activeTab: AppTab;
  selectedWorkout: WorkoutRoutine | null;
  currentSessionProgress: Record<string, SetPerformance[]>;
  currentCardioProgress: { exercise: string; duration: number; completed: boolean } | null;
  isWorkoutActive: boolean;
  workoutStartTime: number | null;
  elapsedTime: number;
  showSummary: boolean;
  lastWorkoutVolume: number;
  workoutDuration: number | null;
  chatMessages: { role: 'user' | 'model'; text: string }[];
  isChatLoading: boolean;
  selectedStudent: string | null;
  allWorkouts: Record<string, WorkoutRoutine[]>;
  theme: 'light' | 'dark';

  // Actions
  setUser: (user: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setActiveTab: (tab: AppTab) => void;
  setSelectedWorkout: (workout: WorkoutRoutine | null) => void;
  setSelectedStudent: (student: string | null) => void;
  setAllWorkouts: (workouts: AppState['allWorkouts']) => void;
  setCurrentSessionProgress: (progress: Record<string, SetPerformance[]>) => void;
  setCurrentCardioProgress: (progress: AppState['currentCardioProgress']) => void;
  setIsWorkoutActive: (isActive: boolean) => void;
  setWorkoutStartTime: (time: number | null) => void;
  setElapsedTime: (time: number) => void;
  setShowSummary: (show: boolean) => void;
  setLastWorkoutVolume: (volume: number) => void;
  setWorkoutDuration: (duration: number | null) => void;
  setChatMessages: (messages: { role: 'user' | 'model', text: string }[]) => void;
  setIsChatLoading: (isLoading: boolean) => void;
  toggleTheme: () => void;
  updateUserProfile: (newData: Partial<User>) => void;
  checkAchievements: () => void;
  handleManualCheckIn: () => void;
  triggerConfetti: () => void;
  addToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  setAddToast: (fn: (message: string, type: 'success' | 'error' | 'info') => void) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set, get) => {
  // Theme is strictly locked to premium dark HUD esthetic for Tatu Gym
  const initialTheme = 'dark';
  
  if (typeof document !== 'undefined') {
    document.body.classList.remove('light');
  }

  return {
  user: null,
  isLoggedIn: false,
  activeTab: AppTab.DASHBOARD,
  selectedWorkout: null,
  currentSessionProgress: {},
  currentCardioProgress: null,
  isWorkoutActive: false,
  workoutStartTime: null,
  elapsedTime: 0,
  showSummary: false,
  lastWorkoutVolume: 0,
  workoutDuration: null,
  chatMessages: [],
  isChatLoading: false,
  selectedStudent: null,
  theme: initialTheme,
  allWorkouts: (() => {
    const saved = localStorage.getItem('tatugym_all_workouts');
    let loadedWorkouts = {
      teste: henriqueWorkouts,
      teste2: jessicaWorkouts,
      teste3: [],
      henrique: henriqueWorkouts,
      jessica: jessicaWorkouts,
      maria: mariaWorkouts,
      flavia: flaviaWorkouts
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        loadedWorkouts = { ...loadedWorkouts, ...parsed };
      } catch (e) {
        console.error('Error loading workouts:', e);
      }
    }
    // Forçar o novo treino do Henrique para atualizar a versão salva em cache do navegador
    loadedWorkouts.henrique = henriqueWorkouts;
    loadedWorkouts.teste = henriqueWorkouts;
    loadedWorkouts.teste2 = jessicaWorkouts;
    loadedWorkouts.teste3 = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tatugym_all_workouts', JSON.stringify(loadedWorkouts));
    }
    return loadedWorkouts;
  })(),
  addToast: undefined,

  setUser: (user) => {
    set({ user });
    if (user) {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('light');
      }
      set({ theme: 'dark' });
    }
  },
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedWorkout: (selectedWorkout) => set({ selectedWorkout }),
  setSelectedStudent: (selectedStudent) => set({ selectedStudent }),
  setAllWorkouts: (allWorkouts) => {
    set({ allWorkouts });
    localStorage.setItem('tatugym_all_workouts', JSON.stringify(allWorkouts));
  },
  setCurrentSessionProgress: (currentSessionProgress) => set({ currentSessionProgress }),
  setCurrentCardioProgress: (currentCardioProgress) => set({ currentCardioProgress }),
  setIsWorkoutActive: (isWorkoutActive) => set({ isWorkoutActive }),
  setWorkoutStartTime: (workoutStartTime) => set({ workoutStartTime }),
  setElapsedTime: (elapsedTime) => set({ elapsedTime }),
  setShowSummary: (showSummary) => set({ showSummary }),
  setLastWorkoutVolume: (lastWorkoutVolume) => set({ lastWorkoutVolume }),
  setWorkoutDuration: (workoutDuration) => set({ workoutDuration }),
  setChatMessages: (chatMessages) => set({ chatMessages }),
  setIsChatLoading: (isChatLoading) => set({ isChatLoading }),
  setAddToast: (fn) => set({ addToast: fn }),

  toggleTheme: () => {
    // Strictly locked to premium dark HUD
    set({ theme: 'dark' });
  },

  logout: async () => {
    const { user } = get();
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error signing out:', e);
    }
    if (user) {
       localStorage.removeItem(`tatugym_active_session_${user.username.toLowerCase()}`);
    }

    set({ 
      user: null, 
      isLoggedIn: false, 
      activeTab: AppTab.DASHBOARD,
      selectedWorkout: null,
      isWorkoutActive: false,
      currentSessionProgress: {},
      workoutStartTime: null
    });
    localStorage.removeItem('tatugym_remembered');
  },

  updateUserProfile: (newData) => {
    const { user } = get();
    if (!user) return;
    const updatedUser = { ...user, ...newData };
    set({ user: updatedUser });
    localStorage.setItem(`tatugym_user_profile_${user.username.toLowerCase()}`, JSON.stringify(updatedUser));
    get().checkAchievements();
  },

  handleManualCheckIn: () => {
    const { user, updateUserProfile, triggerConfetti } = get();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    if (user.checkIns.includes(today)) {
      return;
    }
    const newCheckIns = [...user.checkIns, today];
    updateUserProfile({ 
      checkIns: newCheckIns,
      streak: (user.streak || 0) + 1 
    });
    triggerConfetti();
  },

  triggerConfetti: () => {
    confetti({ 
      particleCount: 150, 
      spread: 80, 
      origin: { y: 0.6 }, 
      colors: ['#10b981', '#6366f1', '#fbbf24'] 
    });
  },

  checkAchievements: () => {
    const { user } = get();
    if (!user) return;

    const newBadges: Badge[] = [...(user.badges || [])];
    const now = new Date().toISOString();

    // 1. First Workout
    if (user.totalWorkouts >= 1 && !newBadges.find(b => b.id === 'first_workout')) {
      newBadges.push({
        id: 'first_workout',
        name: 'Primeiro Passo',
        description: 'Concluiu seu primeiro treino.',
        icon: 'Rocket',
        unlockedAt: now
      });
    }

    // 2. 10 Workouts
    if (user.totalWorkouts >= 10 && !newBadges.find(b => b.id === 'ten_workouts')) {
      newBadges.push({
        id: 'ten_workouts',
        name: 'Constância',
        description: 'Concluiu 10 treinos.',
        icon: 'Trophy',
        unlockedAt: now
      });
    }

    // 3. 7 Day Streak
    if (user.streak >= 7 && !newBadges.find(b => b.id === 'seven_day_streak')) {
      newBadges.push({
        id: 'seven_day_streak',
        name: 'Fogo no Sangue',
        description: 'Manteve uma sequência de 7 dias.',
        icon: 'Flame',
        unlockedAt: now
      });
    }

    if (newBadges.length !== (user.badges || []).length) {
      set({ user: { ...user, badges: newBadges } });
      localStorage.setItem(`tatugym_user_profile_${user.username.toLowerCase()}`, JSON.stringify({ ...user, badges: newBadges }));
    }
  }
};
});
