import React, { useState, useEffect } from 'react';
import { db, auth, collection, getDocs, query, where, orderBy, handleFirestoreError, OperationType } from '../firebase';
import { Workout, Exercise } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronDown, ChevronUp, History, Search, Dumbbell } from 'lucide-react';

export const WorkoutHistory: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [loading, setLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      try {
        // Fetch exercises for lookup
        const exerciseSnapshot = await getDocs(collection(db, 'exercises'));
        const exerciseData: Record<string, Exercise> = {};
        exerciseSnapshot.docs.forEach(doc => {
          exerciseData[doc.id] = { id: doc.id, ...doc.data() } as Exercise;
        });
        setExercises(exerciseData);

        // Fetch workouts
        const q = query(
          collection(db, 'workouts'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));
        setWorkouts(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'workouts');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="font-mono text-xs uppercase animate-pulse">Retrieving History...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-4xl">Histórico</h2>
        <p className="font-mono text-[10px] uppercase opacity-50">Registro técnico de sessões passadas</p>
      </div>

      <div className="space-y-px bg-line border border-line">
        {workouts.map((workout) => (
          <div key={workout.id} className="bg-bg overflow-hidden">
            <div
              onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-ink hover:text-bg transition-colors group"
            >
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center border-r border-line/20 pr-6">
                  <span className="font-serif italic text-2xl">{format(workout.date.toDate(), 'dd')}</span>
                  <span className="font-mono text-[9px] uppercase opacity-50">{format(workout.date.toDate(), 'MMM', { locale: ptBR })}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl">{workout.name}</h3>
                  <div className="flex items-center gap-4 font-mono text-[10px] uppercase opacity-60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(workout.date.toDate(), "HH:mm 'hs'")}
                    </span>
                    <span>{workout.exercises.length} EXERCÍCIOS</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="font-mono text-[10px] uppercase opacity-40">Volume Total</p>
                  <p className="text-xl font-serif italic">
                    {workout.exercises.reduce((acc, ex) => acc + (ex.sets * ex.reps * ex.weight), 0).toLocaleString()} kg
                  </p>
                </div>
                {expandedWorkout === workout.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {expandedWorkout === workout.id && (
              <div className="p-6 border-t border-line/10 bg-ink/5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workout.exercises.map((ex, idx) => {
                    const exerciseInfo = exercises[ex.exerciseId];
                    return (
                      <div key={idx} className="flex gap-4 p-4 border border-line/10 bg-bg">
                        <div className="w-12 h-12 bg-line/10 overflow-hidden flex-shrink-0 flex items-center justify-center rounded-lg">
                          <Dumbbell className="w-6 h-6 opacity-10" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg leading-tight">{exerciseInfo?.name || 'Exercício Removido'}</h4>
                            <a 
                              href={`https://www.google.com/search?q=gif+execução+exercicio+${encodeURIComponent(exerciseInfo?.name || '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-blue-400/50 hover:text-blue-400 transition-all"
                              title="Ver Execução"
                            >
                              <Search className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="flex gap-4 font-mono text-[10px] uppercase opacity-60">
                            <span>{ex.sets} SETS</span>
                            <span>{ex.reps} REPS</span>
                            <span>{ex.weight} KG</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {workouts.length === 0 && (
          <div className="bg-bg p-24 text-center space-y-4">
            <History className="w-12 h-12 mx-auto opacity-10" />
            <p className="font-mono text-xs uppercase opacity-30">Nenhum treino registrado ainda</p>
          </div>
        )}
      </div>
    </div>
  );
};
