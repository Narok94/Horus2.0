import { useEffect } from 'react';
import { useStore } from '../store';
import { AppTab } from '../types';

export const useWorkoutPersistence = () => {
  const { 
    user, 
    isWorkoutActive, 
    selectedWorkout, 
    currentSessionProgress, 
    workoutStartTime,
    setSelectedWorkout,
    setCurrentSessionProgress,
    setWorkoutStartTime,
    setIsWorkoutActive,
    setActiveTab,
    allWorkouts
  } = useStore();

  // Chave única por usuário para evitar conflitos
  const STORAGE_KEY = user ? `tatugym_active_session_${user.username.toLowerCase()}` : null;

  // Carregar sessão salva ao iniciar
  useEffect(() => {
    if (!STORAGE_KEY || isWorkoutActive) return;

    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        
        // Verifica se o treino salvo ainda é válido (ex: menos de 24 horas)
        const isRecent = Date.now() - session.timestamp < 86400000;
        
        if (isRecent) {
          const workout = allWorkouts[user!.username.toLowerCase()]?.find((w: any) => w.id === session.workoutId);
          
          if (workout) {
            setSelectedWorkout(workout);
            setCurrentSessionProgress(session.progress);
            setWorkoutStartTime(session.startTime);
            setIsWorkoutActive(true);
            // Redireciona para a aba de treino
            setActiveTab(AppTab.WORKOUT);
            console.log('[Persistence] Sessão de treino recuperada com sucesso.');
          }
        }
      } catch (e) {
        console.error('[Persistence] Erro ao recuperar sessão salva:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [STORAGE_KEY]);

  // Salvar estado em cada alteração
  useEffect(() => {
    if (!STORAGE_KEY || !isWorkoutActive || !selectedWorkout) return;

    const saveSession = () => {
      const sessionData = {
        workoutId: selectedWorkout.id,
        progress: currentSessionProgress,
        startTime: workoutStartTime,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    };

    saveSession();

    // Resiliência no Mobile: Salvar quando a aba fica invisível
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [STORAGE_KEY, isWorkoutActive, currentSessionProgress, workoutStartTime, selectedWorkout]);

  // Limpeza de cache é lidada pelos métodos de finalizar/cancelar no store/view
  return null;
};
