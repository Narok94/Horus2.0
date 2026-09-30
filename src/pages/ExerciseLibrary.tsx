import React, { useState, useEffect } from 'react';
import { db, auth, collection, getDocs, addDoc, query, orderBy, handleFirestoreError, OperationType } from '../firebase';
import { Exercise, MUSCLE_GROUPS } from '../types';
import { Search, Filter, ChevronRight, Database, Dumbbell } from 'lucide-react';

const INITIAL_EXERCISES: Omit<Exercise, 'id'>[] = [
  { name: 'Supino Reto', category: 'Força', muscleGroup: 'Peito', description: 'Exercício básico para peitoral.' },
  { name: 'Agachamento Livre', category: 'Força', muscleGroup: 'Pernas', description: 'Rei dos exercícios de perna.' },
  { name: 'Levantamento Terra', category: 'Força', muscleGroup: 'Costas', description: 'Exercício composto para cadeia posterior.' },
  { name: 'Desenvolvimento Militar', category: 'Força', muscleGroup: 'Ombros', description: 'Foco em deltoides.' },
  { name: 'Rosca Direta', category: 'Hipertrofia', muscleGroup: 'Bíceps', description: 'Isolador de bíceps.' },
  { name: 'Tríceps Pulley', category: 'Hipertrofia', muscleGroup: 'Tríceps', description: 'Isolador de tríceps.' },
  { name: 'Puxada Frontal', category: 'Força', muscleGroup: 'Costas', description: 'Foco em latíssimo do dorso.' },
  { name: 'Leg Press 45', category: 'Hipertrofia', muscleGroup: 'Pernas', description: 'Foco em quadríceps.' },
  { name: 'Elevação Lateral', category: 'Hipertrofia', muscleGroup: 'Ombros', description: 'Isolador de deltoide lateral.' },
  { name: 'Abdominal Supra', category: 'Resistência', muscleGroup: 'Abdômen', description: 'Foco em reto abdominal.' },
];

export const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const isAdmin = auth.currentUser?.email === 'hollyood.caribe@gmail.com';

  const fetchExercises = async () => {
    try {
      const q = query(collection(db, 'exercises'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
      setExercises(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'exercises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      for (const ex of INITIAL_EXERCISES) {
        await addDoc(collection(db, 'exercises'), ex);
      }
      await fetchExercises();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'exercises');
    } finally {
      setSeeding(false);
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !selectedMuscle || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="font-mono text-xs uppercase animate-pulse">Loading Library...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl">Biblioteca</h2>
          <p className="font-mono text-[10px] uppercase opacity-50">Explorar exercícios técnicos</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {isAdmin && exercises.length === 0 && (
            <button
              onClick={seedDatabase}
              disabled={seeding}
              className="btn-secondary flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              {seeding ? 'SEEDING...' : 'SEED DATABASE'}
            </button>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input
              type="text"
              placeholder="BUSCAR EXERCÍCIO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full md:w-64"
            />
          </div>
          
          <select
            value={selectedMuscle || ''}
            onChange={(e) => setSelectedMuscle(e.target.value || null)}
            className="input-field w-full md:w-48 appearance-none"
          >
            <option value="">TODOS OS GRUPOS</option>
            {MUSCLE_GROUPS.map(mg => (
              <option key={mg} value={mg}>{mg.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
        {filteredExercises.map(exercise => (
          <div 
            key={exercise.id} 
            onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
            className="bg-bg p-6 space-y-4 group hover:bg-ink hover:text-bg transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="font-serif italic text-xs opacity-50">{exercise.category}</span>
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedExercise === exercise.id ? 'rotate-90' : ''}`} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl">{exercise.name}</h3>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">{exercise.muscleGroup}</p>
            </div>

            {expandedExercise === exercise.id && (
              <div className="pt-4 border-t border-line/10 animate-slide-up space-y-4">
                <p className="text-xs leading-relaxed opacity-70">
                  {exercise.description || 'Nenhuma descrição técnica disponível para este exercício.'}
                </p>
                <div className="aspect-video bg-line/5 overflow-hidden flex items-center justify-center rounded-xl">
                  <div className="flex flex-col items-center gap-2">
                    <Dumbbell className="w-8 h-8 opacity-10" />
                    <a 
                      href={`https://www.google.com/search?q=gif+execução+exercicio+${encodeURIComponent(exercise.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                    >
                      <Search className="w-3 h-3" />
                      Ver execução no Google
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-24 border border-dashed border-line/30">
          <p className="font-mono text-xs uppercase opacity-30">Nenhum exercício encontrado</p>
        </div>
      )}
    </div>
  );
};
