import React, { useState, useEffect } from 'react';
import { db, auth, collection, getDocs, addDoc, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import { Exercise, WorkoutExercise, Workout } from '../types';
import { Plus, Trash2, Play, Save, X, Search, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WorkoutLogger: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessionExercises, setSessionExercises] = useState<WorkoutExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('TREINO ' + new Date().toLocaleDateString('pt-BR'));
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'exercises'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
        setExercises(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'exercises');
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const addExerciseToSession = (exercise: Exercise) => {
    setSessionExercises([...sessionExercises, {
      exerciseId: exercise.id,
      name: exercise.name,
      sets: 1,
      reps: 10,
      weight: 0
    }]);
    setIsAdding(false);
  };

  const removeExerciseFromSession = (index: number) => {
    setSessionExercises(sessionExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: number) => {
    const updated = [...sessionExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSessionExercises(updated);
  };

  const saveWorkout = async () => {
    if (!auth.currentUser || sessionExercises.length === 0) return;

    try {
      const workout: Omit<Workout, 'id'> = {
        userId: auth.currentUser.uid,
        name: workoutName,
        date: Timestamp.now(),
        exercises: sessionExercises.map(({ exerciseId, sets, reps, weight }) => ({
          exerciseId,
          sets,
          reps,
          weight
        }))
      };

      await addDoc(collection(db, 'workouts'), workout);
      navigate('/history');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'workouts');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="font-mono text-xs uppercase animate-pulse">Initializing Session...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl">Novo Treino</h2>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="input-field text-2xl font-serif italic"
          />
        </div>
        
        <button
          onClick={saveWorkout}
          disabled={sessionExercises.length === 0}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Finalizar Sessão
        </button>
      </div>

      <div className="space-y-px bg-line border border-line">
        {sessionExercises.map((ex, idx) => (
          <div key={idx} className="bg-bg overflow-hidden">
            <div 
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className="p-6 flex flex-col md:flex-row gap-6 items-center group cursor-pointer hover:bg-ink hover:text-bg transition-colors"
            >
              <div className="w-12 h-12 bg-line/10 overflow-hidden flex-shrink-0 flex items-center justify-center rounded-xl">
                <Dumbbell className="w-6 h-6 opacity-20" />
              </div>
              
              <div className="flex-1 space-y-1">
                <h4 className="text-xl">{ex.name}</h4>
                <p className="font-mono text-[10px] uppercase opacity-50">Série {idx + 1}</p>
              </div>

              <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-[9px] uppercase opacity-40">Sets</span>
                  <input
                    type="number"
                    value={ex.sets}
                    onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                    className="w-12 bg-transparent border-b border-line text-center font-mono text-sm p-1"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-[9px] uppercase opacity-40">Reps</span>
                  <input
                    type="number"
                    value={ex.reps}
                    onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                    className="w-12 bg-transparent border-b border-line text-center font-mono text-sm p-1"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-[9px] uppercase opacity-40">Peso (kg)</span>
                  <input
                    type="number"
                    value={ex.weight}
                    onChange={(e) => updateExercise(idx, 'weight', parseFloat(e.target.value) || 0)}
                    className="w-16 bg-transparent border-b border-line text-center font-mono text-sm p-1"
                  />
                </div>
                <button
                  onClick={() => removeExerciseFromSession(idx)}
                  className="p-2 opacity-30 hover:opacity-100 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {expandedIndex === idx && (
              <div className="px-6 pb-6 pt-2 border-t border-line/10 animate-slide-up">
                <a 
                  href={`https://www.google.com/search?q=gif+execução+exercicio+${encodeURIComponent(ex.name || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                  title="Ver Execução"
                >
                  <Search className="w-3 h-3" />
                  Ver execução no Google
                </a>
              </div>
            )}
          </div>
        ))}

        {sessionExercises.length === 0 && (
          <div className="bg-bg p-12 text-center">
            <p className="font-mono text-xs uppercase opacity-30">Nenhum exercício adicionado</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsAdding(true)}
        className="w-full p-6 border border-dashed border-line hover:bg-ink hover:text-bg transition-all group"
      >
        <div className="flex items-center justify-center gap-2">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-mono text-xs uppercase tracking-widest">Adicionar Exercício</span>
        </div>
      </button>

      {/* Modal de Seleção de Exercício */}
      {isAdding && (
        <div className="fixed inset-0 bg-bg/95 backdrop-blur-sm z-[100] p-4 flex items-center justify-center">
          <div className="max-w-2xl w-full bg-bg border border-line flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-line flex items-center justify-between">
              <h3 className="text-3xl">Selecionar Exercício</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-ink hover:text-bg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 border-b border-line">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                <input
                  type="text"
                  placeholder="BUSCAR EXERCÍCIO..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10 w-full"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {exercises
                .filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()))
                .map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => addExerciseToSession(ex)}
                    className="data-row"
                  >
                    <span className="font-serif italic text-xs opacity-50 self-center">01</span>
                    <div className="flex flex-col justify-center">
                      <span className="text-lg">{ex.name}</span>
                      <span className="font-mono text-[9px] uppercase opacity-50">{ex.muscleGroup}</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase self-center opacity-50">{ex.category}</span>
                    <div className="flex justify-end items-center">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
