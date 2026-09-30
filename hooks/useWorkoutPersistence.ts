import { useEffect } from 'react';
import { useStore } from '../store';
import { AppTab, SetPerformance } from '../types';

interface SessionSnapshot {
  version: 1;
  workoutId: string;
  currentSessionProgress: Record<string, SetPerformance[]>;
  workoutStartTime: number;
  lastMarkedTime: number;
  timestamp: number;
}

const MAX_SESSION_AGE = 24 * 60 * 60 * 1000;
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export const isValidSessionSnapshot = (value: unknown, now: number): value is SessionSnapshot => {
  if (!isObject(value) || value.version !== 1 || typeof value.workoutId !== 'string' || !value.workoutId.trim()) return false;
  if (!isNonNegativeNumber(value.workoutStartTime) || value.workoutStartTime === 0 ||
      !isNonNegativeNumber(value.timestamp) || value.timestamp === 0 ||
      value.workoutStartTime > value.timestamp || value.timestamp > now ||
      now - value.timestamp >= MAX_SESSION_AGE) return false;
  if (!isNonNegativeNumber(value.lastMarkedTime) || value.lastMarkedTime < value.workoutStartTime ||
      value.lastMarkedTime > value.timestamp) return false;
  if (!isObject(value.currentSessionProgress)) return false;
  for (const sets of Object.values(value.currentSessionProgress)) {
    if (!Array.isArray(sets) || !sets.every(set =>
      isObject(set) && isNonNegativeNumber(set.weight) &&
      isNonNegativeNumber(set.reps) && Number.isInteger(set.reps) &&
      typeof set.completed === 'boolean' &&
      (set.durationSeconds === undefined || isNonNegativeNumber(set.durationSeconds)) &&
      (set.rpe === undefined || (isNonNegativeNumber(set.rpe) && set.rpe <= 10))
    )) return false;
  }
  return true;
};

export const useWorkoutPersistence = () => {
  const {
    user, isWorkoutActive, selectedWorkout, currentSessionProgress,
    workoutStartTime, lastMarkedTime, allWorkouts
  } = useStore();
  const storageKey = user ? `tatugym_active_session_${user.username.toLowerCase()}` : null;

  useEffect(() => {
    if (!storageKey || useStore.getState().isWorkoutActive) return;
    const discardSnapshot = () => {
      try { localStorage.removeItem(storageKey); }
      catch (error) { console.warn('[Persistence] Não foi possível descartar a sessão:', error); }
    };
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === null) return;
      const session: unknown = JSON.parse(saved);
      const now = Date.now();
      if (!isValidSessionSnapshot(session, now)) {
        discardSnapshot();
        return;
      }
      const workout = allWorkouts[user!.username.toLowerCase()]?.find(w => w.id === session.workoutId);
      if (!workout) {
        discardSnapshot();
        return;
      }
      // Uma atualização evita estados intermediários durante a recuperação.
      useStore.setState({
        selectedWorkout: workout,
        currentSessionProgress: session.currentSessionProgress,
        workoutStartTime: session.workoutStartTime,
        lastMarkedTime: session.lastMarkedTime,
        isWorkoutActive: true,
        elapsedTime: Math.max(0, Math.floor((now - session.workoutStartTime) / 1000)),
        activeTab: AppTab.WORKOUT
      });
    } catch (error) {
      console.warn('[Persistence] Sessão indisponível ou inválida:', error);
      discardSnapshot();
    }
  }, [storageKey, allWorkouts]);

  useEffect(() => {
    if (!storageKey || !isWorkoutActive || !selectedWorkout || workoutStartTime === null) return;
    const saveSession = () => {
      // Lê o estado atual para não recriar snapshots após finalizar/cancelar.
      const state = useStore.getState();
      if (!state.isWorkoutActive || !state.selectedWorkout || state.workoutStartTime === null ||
          !state.user || `tatugym_active_session_${state.user.username.toLowerCase()}` !== storageKey) return;
      const snapshot: SessionSnapshot = {
        version: 1,
        workoutId: state.selectedWorkout.id,
        currentSessionProgress: state.currentSessionProgress,
        workoutStartTime: state.workoutStartTime,
        lastMarkedTime: state.lastMarkedTime ?? state.workoutStartTime,
        timestamp: Date.now()
      };
      try { localStorage.setItem(storageKey, JSON.stringify(snapshot)); }
      catch (error) { console.warn('[Persistence] Não foi possível salvar a sessão:', error); }
    };
    saveSession();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveSession();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [storageKey, isWorkoutActive, selectedWorkout, currentSessionProgress,
      workoutStartTime, lastMarkedTime]);

  return null;
};
