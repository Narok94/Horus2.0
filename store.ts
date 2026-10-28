import { withHenriqueABC } from './data/henriqueABC';
import { interpretPrescription } from './src/utils/workoutPrescription';
import { getExerciseWeightKey } from './src/utils/exerciseWeights';
import { normalizeSavedWorkouts, isValidWorkout } from './src/utils/localData';

import { create } from 'zustand';
import { migrateLocalIdentity } from './data/migrateLocalIdentity';
import confetti from 'canvas-confetti';
import { User, WorkoutRoutine, AppTab, SetPerformance, Badge } from './types';
import { defaultWorkouts, jessicaWorkouts } from './data/workoutData';
import { migrateExerciseWeights } from './src/utils/exerciseWeights';

// Datas de calendário local; UTC é usado apenas para avançar dias sem efeito de DST.
export const calculateCheckInStreak = (checkIns: string[], now = new Date()): number => {
  const dates = new Set(checkIns);
  const cursor = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dateKey = () => cursor.toISOString().slice(0, 10);
  if (!dates.has(dateKey())) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (dates.has(dateKey())) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
};

export interface SessionRest {
  exerciseId?: string;
  endsAt: number;
  pausedRemaining: number | null;
  notified: boolean;
}

interface AppState {
  sessionRest: SessionRest | null;
  user: User | null;
  isLoggedIn: boolean;
  activeTab: AppTab;
  selectedWorkout: WorkoutRoutine | null;
  currentSessionProgress: Record<string, SetPerformance[]>;
  isWorkoutActive: boolean;
  workoutStartTime: number | null;
  lastMarkedTime: number | null;
  elapsedTime: number;
  showSummary: boolean;
  lastWorkoutVolume: number;
  workoutDuration: number | null;
  allWorkouts: Record<string, WorkoutRoutine[]>;
  theme: 'light' | 'dark';

  registerCompletedWorkout: (workout: WorkoutRoutine, progress: Record<string, SetPerformance[]>, duration: number, completionId: string) => boolean;
  // Actions
  setUser: (user: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setActiveTab: (tab: AppTab) => void;
  setSelectedWorkout: (workout: WorkoutRoutine | null) => void;
  setAllWorkouts: (workouts: AppState['allWorkouts']) => void;
  setCurrentSessionProgress: (progress: Record<string, SetPerformance[]>) => void;
  setIsWorkoutActive: (isActive: boolean) => void;
  setWorkoutStartTime: (time: number | null) => void;
  setLastMarkedTime: (time: number | null) => void;
  setElapsedTime: (time: number) => void;
  setShowSummary: (show: boolean) => void;
  setLastWorkoutVolume: (volume: number) => void;
  setWorkoutDuration: (duration: number | null) => void;
  toggleTheme: () => void;
  updateUserProfile: (newData: Partial<User>) => void;
  checkAchievements: () => void;
  handleManualCheckIn: () => void;
  toggleCheckInDate: (dateStr: string) => void;
  triggerConfetti: () => void;
  addToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  setAddToast: (fn: (message: string, type: 'success' | 'error' | 'info') => void) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set, get) => {
  if (typeof localStorage !== 'undefined') migrateLocalIdentity(localStorage);
  const initialTheme = typeof localStorage !== 'undefined' && localStorage.getItem('tatugym_theme') === 'dark' ? 'dark' : 'light';

  if (typeof document !== 'undefined') {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(initialTheme);
  }

  return {
  sessionRest: null,
  user: null,
  isLoggedIn: false,
  activeTab: AppTab.WORKOUT,
  selectedWorkout: null,
  currentSessionProgress: {},
  isWorkoutActive: false,
  workoutStartTime: null,
  lastMarkedTime: null,
  elapsedTime: 0,
  showSummary: false,
  lastWorkoutVolume: 0,
  workoutDuration: null,
  theme: initialTheme,
  allWorkouts: (() => {
    const defaults = { henrique: withHenriqueABC(defaultWorkouts), jessica: jessicaWorkouts };
    if (typeof localStorage === 'undefined') return defaults;
    const saved = localStorage.getItem('tatugym_all_workouts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const result: Record<string, WorkoutRoutine[]> = { ...parsed, ...defaults };
        for (const username of ['henrique', 'jessica'] as const) {
          if (Array.isArray(parsed[username])) {
            const normalized = normalizeSavedWorkouts(parsed[username]).filter(isValidWorkout);
            result[username] = username === 'henrique' ? withHenriqueABC(normalized) : normalized;
          }
        }
        if (Array.isArray(parsed.henrique) && parsed.henrique.every(isValidWorkout) && JSON.stringify(parsed.henrique) !== JSON.stringify(result.henrique)) {
          try { localStorage.setItem('tatugym_all_workouts', JSON.stringify({ ...parsed, henrique: result.henrique })); }
          catch (error) { console.warn('[Workouts] Não foi possível persistir o arquivamento:', error); }
        }
        return result;
      } catch (e) {
        console.error('Error loading workouts:', e);
      }
    }
    return defaults;
  })(),
  addToast: undefined,

  setUser: (user) => {
    const migratedUser = user ? migrateExerciseWeights(user, [
      ...defaultWorkouts, ...jessicaWorkouts,
      ...(get().allWorkouts[user.username.toLowerCase()] || [])
    ]) : null;
    if (migratedUser && migratedUser !== user) {
      try {
        localStorage.setItem(`tatugym_user_profile_${migratedUser.username.toLowerCase()}`, JSON.stringify(migratedUser));
      } catch (error) { console.warn('[Weights] Não foi possível persistir a migração:', error); }
    }
    const username = migratedUser?.username.toLowerCase();
    const storedTheme = username ? localStorage.getItem(`tatugym_theme_${username}`) : null;
    const theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme :
      username === 'henrique' && localStorage.getItem('tatugym_theme') === 'dark' ? 'dark' : 'light';
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    set({ user: migratedUser, theme, activeTab: AppTab.WORKOUT,
      selectedWorkout: null, sessionRest: null, currentSessionProgress: {}, isWorkoutActive: false,
      workoutStartTime: null, lastMarkedTime: null, elapsedTime: 0, showSummary: false,
      lastWorkoutVolume: 0, workoutDuration: null });
  },
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedWorkout: (selectedWorkout) => {
    if (selectedWorkout && get().allWorkouts[get().user?.username.toLowerCase() || '']?.find(w => w.id === selectedWorkout.id)?.archived) return;
    set({ selectedWorkout });
  },
  setAllWorkouts: (allWorkouts) => {
    const filtered = { ...get().allWorkouts, ...allWorkouts, henrique: withHenriqueABC(allWorkouts.henrique || get().allWorkouts.henrique || []) };
    set({ allWorkouts: filtered });
    localStorage.setItem('tatugym_all_workouts', JSON.stringify(filtered));
  },
  setCurrentSessionProgress: (currentSessionProgress) => set({ currentSessionProgress }),
  setIsWorkoutActive: (isWorkoutActive) => set(isWorkoutActive ? { isWorkoutActive } : { isWorkoutActive, sessionRest: null }),
  setWorkoutStartTime: (workoutStartTime) => set({ workoutStartTime }),
  setLastMarkedTime: (lastMarkedTime) => set({ lastMarkedTime }),
  setElapsedTime: (elapsedTime) => set({ elapsedTime }),
  setShowSummary: (showSummary) => set({ showSummary }),
  setLastWorkoutVolume: (lastWorkoutVolume) => set({ lastWorkoutVolume }),
  setWorkoutDuration: (workoutDuration) => set({ workoutDuration }),
  setAddToast: (fn) => set({ addToast: fn }),

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: nextTheme });
    if (typeof localStorage !== 'undefined') {
      const username = get().user?.username.toLowerCase();
      if (username) localStorage.setItem(`tatugym_theme_${username}`, nextTheme);
    }
    if (typeof document !== 'undefined') {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(nextTheme);
    }
  },

  logout: () => {
    set({ 
      sessionRest: null,
      user: null, 
      isLoggedIn: false, 
      activeTab: AppTab.DASHBOARD,
      selectedWorkout: null,
      isWorkoutActive: false,
      currentSessionProgress: {},
      workoutStartTime: null,
      lastMarkedTime: null,
      elapsedTime: 0,
      showSummary: false,
      lastWorkoutVolume: 0,
      workoutDuration: null
    });
    localStorage.removeItem('tatugym_remembered');
  },

  registerCompletedWorkout: (workout, progress, duration, completionId) => {
    const user = get().user;
    if (!user || get().allWorkouts[user.username.toLowerCase()]?.find(w => w.id === workout.id)?.archived || user.history.some(entry => entry.id === completionId) ||
        !workout.exercises.some(ex => (progress[ex.id] || []).some(set => set.completed))) return false;
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const weights = { ...user.weights };
    for (const ex of workout.exercises) {
      const drop = interpretPrescription(ex).drop;
      const main = (progress[ex.id] || []).filter((set, index) => set.completed && (!drop || index % 2 === 0));
      const lastWeight = main[main.length - 1]?.weight;
      if (lastWeight !== undefined) weights[getExerciseWeightKey(ex)] = lastWeight;
    }
    get().updateUserProfile({
      history: [{ id: completionId, date: now.toISOString(), workoutId: workout.id,
        workoutTitle: workout.title, duration,
        exercises: workout.exercises.map(ex => ({ exerciseId: ex.id, name: ex.name, performance: progress[ex.id] || [] }))
      }, ...user.history],
      weights, checkIns: [...new Set([...user.checkIns, localDate])],
      totalWorkouts: user.totalWorkouts + 1, preferredWorkoutId: undefined
    });
    return true;
  },

  updateUserProfile: (newData) => {
    const { user } = get();
    if (!user) return;
    const updatedUser = { ...user, ...newData };
    if (newData.checkIns !== undefined) {
      updatedUser.checkIns = [...new Set(newData.checkIns)];
      updatedUser.streak = calculateCheckInStreak(updatedUser.checkIns);
    }
    set({ user: updatedUser });
    localStorage.setItem(`tatugym_user_profile_${user.username.toLowerCase()}`, JSON.stringify(updatedUser));
    
    get().checkAchievements();
  },

  handleManualCheckIn: () => {
    const { user, updateUserProfile, triggerConfetti } = get();
    if (!user) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const today = now.toISOString().split('T')[0];
    
    if (user.checkIns?.includes(today)) {
      return;
    }
    const newCheckIns = [...(user.checkIns || []), today];
    updateUserProfile({ 
      checkIns: newCheckIns
    });
    triggerConfetti();
  },

  toggleCheckInDate: (dateStr: string) => {
    const { user, updateUserProfile, triggerConfetti } = get();
    if (!user) return;
    const currentCheckIns = user.checkIns ? [...user.checkIns] : [];
    const index = currentCheckIns.indexOf(dateStr);
    let isAdding = false;
    
    if (index > -1) {
      currentCheckIns.splice(index, 1);
    } else {
      currentCheckIns.push(dateStr);
      isAdding = true;
    }

    if (isAdding) triggerConfetti();

    updateUserProfile({
      checkIns: currentCheckIns
    });
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
      const updatedUser = { ...user, badges: newBadges };
      set({ user: updatedUser });
      localStorage.setItem(`tatugym_user_profile_${user.username.toLowerCase()}`, JSON.stringify(updatedUser));
      

    }
  }
};
});
