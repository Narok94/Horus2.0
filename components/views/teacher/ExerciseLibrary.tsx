import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, X, Sparkles, Command, Dumbbell, Plus } from 'lucide-react';
import { BaseExercise, exerciseDatabase } from '../../../data/exerciseDatabase';

interface ExerciseLibraryProps {
  filteredSuggestions: BaseExercise[];
  searchExerciseQuery: string;
  setSearchExerciseQuery: (query: string) => void;
  selectedMuscleFilter: string;
  setSelectedMuscleFilter: (muscle: string) => void;
  recentAddedId: string | null;
  onAddExercise: (baseEx: BaseExercise) => void;
  onInjectBlock?: (exercisesList: BaseExercise[]) => void;
}

const blockTemplates = [
  {
    id: 'push',
    name: 'Push (Peito, Ombros e Tríceps)',
    desc: 'Básico completo empurrar',
    muscleGroup: 'Peito',
    exercises: ['Supino Reto Barra', 'Supino Inclinado Halter', 'Elevação Lateral Halter', 'Desenvolvimento Halter', 'Tríceps Pulley']
  },
  {
    id: 'pull',
    name: 'Pull (Costas e Bíceps)',
    desc: 'Completo de puxar e trapézio',
    muscleGroup: 'Costas',
    exercises: ['Puxada Alta Pronada', 'Remada Baixa Triângulo', 'Pulldown Polia', 'Rosca Direta Barra W', 'Rosca Martelo']
  },
  {
    id: 'pernas_quad',
    name: 'Quadríceps & Glúteos',
    desc: 'Foco na cadeia anterior e quadril',
    muscleGroup: 'Pernas',
    exercises: ['Agachamento Livre', 'Leg Press 45', 'Cadeira Extensora', 'Cadeira Abdutora']
  },
  {
    id: 'pernas_post',
    name: 'Posterior & Pernas',
    desc: 'Cadeia posterior focada',
    muscleGroup: 'Pernas',
    exercises: ['Mesa Flexora', 'Stiff Barra', 'Agachamento Sumô', 'Elevação Pélvica']
  },
  {
    id: 'ombros',
    name: 'Ombro Completo',
    desc: 'Foco em largura e densidade',
    muscleGroup: 'Ombros',
    exercises: ['Elevação Lateral Halter', 'Desenvolvimento Halter', 'Crucifixo Invertido', 'Encolhimento']
  },
  {
    id: 'bracos',
    name: 'Braços Máximos',
    desc: 'Bíceps e tríceps em sinergia',
    muscleGroup: 'Braços',
    exercises: ['Rosca Direta Barra W', 'Tríceps Pulley', 'Rosca Martelo', 'Tríceps Testa', 'Rosca Alternada']
  }
];

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  filteredSuggestions,
  searchExerciseQuery,
  setSearchExerciseQuery,
  selectedMuscleFilter,
  setSelectedMuscleFilter,
  recentAddedId,
  onAddExercise,
  onInjectBlock,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'movements' | 'templates'>('movements');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).contentEditable === 'true'
      );
      if (isInput) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (activeSubTab === 'movements' && filteredSuggestions.length > 0) {
        onAddExercise(filteredSuggestions[0]);
        setSearchExerciseQuery('');
      }
    }
  };

  const handleSelectTemplate = (exercisesNames: string[]) => {
    if (!onInjectBlock) return;
    const resolvedExercises = exercisesNames.map(name => {
      return exerciseDatabase.find(ex => ex.name.toLowerCase() === name.toLowerCase()) || {
        name,
        muscleGroup: 'Livre',
        defaultSets: 3,
        defaultReps: '10',
        defaultRest: 60
      };
    });
    onInjectBlock(resolvedExercises);
  };

  return (
    <div className="flex flex-col min-h-0 bg-white p-6 h-full w-full border-r border-gray-100">
      
      {/* Search Header and minimal tab switch */}
      <div className="flex flex-col space-y-4 pb-4 border-b border-gray-100 shrink-0">
        
        <div className="flex items-center justify-between">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveSubTab('movements')}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'movements'
                  ? 'bg-white text-gray-900 shadow-sm font-extrabold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Biblioteca
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('templates')}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'templates'
                  ? 'bg-white text-gray-900 shadow-sm font-extrabold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Sparkles size={11} className="text-blue-500" />
              <span>Blocos Prontos</span>
            </button>
          </div>
          
          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 select-none">
            <Command size={10} />
            <span>Atalho 'A'</span>
          </span>
        </div>

        {activeSubTab === 'movements' && (
          <>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </div>
              <input 
                ref={inputRef}
                type="text"
                placeholder="Buscar exercício... [Enter para add]"
                value={searchExerciseQuery}
                onChange={(e) => setSearchExerciseQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full bg-gray-50 border border-gray-200 text-sm py-3 pl-11 pr-4 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Muscle Group horizontal select container */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 select-none">
              {['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços'].map(muscle => {
                const isSelected = selectedMuscleFilter === muscle;
                return (
                  <button
                    key={muscle}
                    type="button"
                    onClick={() => setSelectedMuscleFilter(muscle)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {muscle}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* List Area */}
      <div className="flex-grow overflow-y-auto no-scrollbar mt-4 h-full">
        {activeSubTab === 'movements' ? (
          <div className="space-y-1 pb-4">
            {filteredSuggestions.map((baseEx, bIdx) => {
              const isRecentlyAdded = recentAddedId === baseEx.name;

              return (
                <div
                  key={bIdx}
                  onClick={() => onAddExercise(baseEx)}
                  className="flex items-center justify-between py-3.5 px-3 hover:bg-gray-50 border border-transparent rounded-xl transition-all group cursor-pointer"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-sm font-bold text-gray-900 block truncate group-hover:text-blue-600 transition-colors">
                      {baseEx.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
                      {baseEx.muscleGroup}
                    </span>
                  </div>
                  
                  <div className="shrink-0">
                    {isRecentlyAdded ? (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg">
                        <Check size={12} />
                        <span>Add</span>
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-blue-600 font-bold bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white hover:border-transparent transition-all">
                        + Add
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredSuggestions.length === 0 && (
              <p className="text-gray-400 text-xs text-center py-12">Nenhum exercício encontrado</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-1 select-none pb-4">
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase px-1">
              Inserir blocos estruturados em 1 clique:
            </p>

            <div className="space-y-3">
              {blockTemplates.map((block) => (
                <div 
                  key={block.id}
                  className="border border-gray-100 bg-gray-50 rounded-2xl p-4 hover:border-blue-200 hover:bg-white transition-all flex flex-col justify-between gap-4 group shadow-sm"
                >
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 tracking-tight block">
                      {block.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 lines-clamp-2 leading-relaxed">
                      {block.desc}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {block.exercises.slice(0, 3).map((exName, idx) => (
                        <span key={idx} className="bg-white border border-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-lg font-semibold">
                          {exName.split(' ')[0]}
                        </span>
                      ))}
                      {block.exercises.length > 3 && (
                        <span className="text-[10px] text-gray-400 self-center font-bold pl-1">
                          +{block.exercises.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectTemplate(block.exercises)}
                    className="w-full text-center py-2.5 bg-white border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-transparent text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Carregar Bloco
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
