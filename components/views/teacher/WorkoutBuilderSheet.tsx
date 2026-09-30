import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Trash2 } from 'lucide-react';
import { useStore } from '../../../store';
import { WorkoutRoutine, Exercise } from '../../../types';
import { getHorusGifUrl } from '../../../src/utils/exerciseUtils';

// Suggestion list as requested by the prompt
const BASE_EXERCISES_LIST = [
  'Supino Reto', 'Supino Inclinado', 'Supino Declinado', 'Crucifixo', 
  'Cross Cable', 'Desenvolvimento', 'Elevação Lateral', 'Remada Curvada',
  'Puxada Frontal', 'Remada Unilateral', 'Rosca Direta', 'Rosca Martelo',
  'Tríceps Corda', 'Tríceps Testa', 'Agachamento', 'Leg Press', 
  'Cadeira Extensora', 'Cadeira Flexora', 'Stiff', 'Glúteo no Cross', 
  'Hip Thrust', 'Panturrilha', 'Abdômen Crunch', 'Prancha'
];

interface WorkoutBuilderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  studentUsername: string | null;
  studentName: string;
}

interface LocalBlock {
  title: string;
  exercises: Exercise[];
}

export const WorkoutBuilderSheet: React.FC<WorkoutBuilderSheetProps> = ({
  isOpen,
  onClose,
  studentUsername,
  studentName,
}) => {
  const { allWorkouts, setAllWorkouts, addToast } = useStore();
  
  // Steps: 1, 2 or 3
  const [step, setStep] = useState<number>(1);
  
  // Selection: 'AB' | 'ABC' | 'ABCD' | 'ABCDE'
  const [division, setDivision] = useState<'AB' | 'ABC' | 'ABCD' | 'ABCDE'>('ABC');
  
  // Local list of blocks (size 5 representing slots A to E)
  const [blocks, setBlocks] = useState<LocalBlock[]>(() => 
    Array.from({ length: 5 }).map((_, idx) => ({
      title: '',
      exercises: []
    }))
  );
  
  // Active tab index for Step 2
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Search query for Step 2
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // AI Horus Toggle state for Step 3
  const [aiHorusEnabled, setAiHorusEnabled] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Derive number of blocks for standard division
  const getNumBlocks = (): number => {
    switch (division) {
      case 'AB': return 2;
      case 'ABC': return 3;
      case 'ABCD': return 4;
      case 'ABCDE': return 5;
      default: return 3;
    }
  };

  const numBlocks = getNumBlocks();

  // Prepopulate and parse student data from localStorage/store upon open or username change
  useEffect(() => {
    if (!isOpen || !studentUsername) return;

    const lowerStr = studentUsername.toLowerCase();
    const existing = allWorkouts[lowerStr] || [];

    // Auto calculate division representation
    let freq: 'AB' | 'ABC' | 'ABCD' | 'ABCDE' = 'ABC';
    if (existing.length === 2) freq = 'AB';
    else if (existing.length === 3) freq = 'ABC';
    else if (existing.length === 4) freq = 'ABCD';
    else if (existing.length >= 5) freq = 'ABCDE';
    setDivision(freq);

    // Deep clone student routines (or defaults) to avoid mutating the store directly
    const initialBlocks = Array.from({ length: 5 }).map((_, idx) => {
      const matchedRoutine = existing[idx];
      return {
        title: matchedRoutine ? matchedRoutine.title : '',
        exercises: matchedRoutine ? matchedRoutine.exercises.map(ex => ({ ...ex })) : [] as Exercise[]
      };
    });

    setBlocks(initialBlocks);
    setStep(1);
    setActiveTab(0);
    setSearchQuery('');
    setAiHorusEnabled(false);
  }, [isOpen, studentUsername, allWorkouts]);

  // Handle addition of an exercise
  const handleAddNewExercise = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Detect muscle group matching the name cleanly
    let muscleGroup = 'Livre';
    const lowerName = trimmed.toLowerCase();
    if (lowerName.includes('supino') || lowerName.includes('crucifixo') || lowerName.includes('peito') || lowerName.includes('voador') || lowerName.includes('voadora')) {
      muscleGroup = 'Peito';
    } else if (lowerName.includes('remada') || lowerName.includes('puxada') || lowerName.includes('costas') || lowerName.includes('pulley') || lowerName.includes('pulldown') || lowerName.includes('terra') || lowerName.includes('serrote')) {
      muscleGroup = 'Costas';
    } else if (lowerName.includes('rosca') || lowerName.includes('tríceps') || lowerName.includes('triceps') || lowerName.includes('bíceps') || lowerName.includes('biceps') || lowerName.includes('martelo') || lowerName.includes('punho') || lowerName.includes('antebraço')) {
      muscleGroup = 'Braços';
    } else if (lowerName.includes('ombro') || lowerName.includes('lateral') || lowerName.includes('desenvolvimento') || lowerName.includes('elevação lateral') || lowerName.includes('trapezi') || lowerName.includes('trapézi')) {
      muscleGroup = 'Ombros';
    } else if (lowerName.includes('agachamento') || lowerName.includes('leg press') || lowerName.includes('extensora') || lowerName.includes('flexora') || lowerName.includes('stiff') || lowerName.includes('afundo') || lowerName.includes('panturrilha') || lowerName.includes('glúteo') || lowerName.includes('gluteo') || lowerName.includes('coxa') || lowerName.includes('isquiotibiais') || lowerName.includes('quadriceps') || lowerName.includes('quadríceps') || lowerName.includes('thrust')) {
      muscleGroup = 'Pernas';
    } else if (lowerName.includes('abdominal') || lowerName.includes('crunch') || lowerName.includes('prancha') || lowerName.includes('infra') || lowerName.includes('rectus')) {
      muscleGroup = 'Abdômen';
    }

    const newEx: Exercise = {
      id: `ex_${Math.random().toString(36).substring(2, 9)}`,
      name: trimmed,
      muscleGroup,
      sets: 3,
      reps: '12',
      rest: 60,
      notes: '0',
      image: getHorusGifUrl(trimmed)
    };

    setBlocks(prev => {
      const cloned = prev.map((b, bIdx) => {
        if (bIdx === activeTab) {
          return {
            ...b,
            exercises: [...b.exercises, newEx]
          };
        }
        return b;
      });
      return cloned;
    });

    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Remove an exercise from the active block
  const handleRemoveExercise = (id: string) => {
    setBlocks(prev => 
      prev.map((b, bIdx) => {
        if (bIdx === activeTab) {
          return {
            ...b,
            exercises: b.exercises.filter(ex => ex.id !== id)
          };
        }
        return b;
      })
    );
  };

  // Update a single field inside an exercise
  const handleUpdateExerciseValue = (exId: string, field: keyof Exercise, value: any) => {
    setBlocks(prev => 
      prev.map((b, bIdx) => {
        if (bIdx === activeTab) {
          return {
            ...b,
            exercises: b.exercises.map(ex => {
              if (ex.id === exId) {
                return { ...ex, [field]: value };
              }
              return ex;
            })
          };
        }
        return b;
      })
    );
  };

  // Save the workout sheet completely
  const handleSaveWorkout = () => {
    if (!studentUsername) return;

    const routines: WorkoutRoutine[] = blocks.slice(0, numBlocks).map((b, idx) => {
      const char = String.fromCharCode(65 + idx);
      return {
        id: `routine_${char}_${Math.random().toString(36).substring(2, 9)}`,
        title: b.title.trim() || `Treino ${char}`,
        description: b.exercises.map(e => e.muscleGroup).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'Estrutura do Treino',
        exercises: b.exercises,
        color: idx === 0 ? 'emerald' : idx === 1 ? 'blue' : idx === 2 ? 'purple' : idx === 3 ? 'orange' : 'teal'
      };
    });

    const lowerStr = studentUsername.toLowerCase();
    const updatedAllWorkouts = {
      ...allWorkouts,
      [lowerStr]: routines
    };

    // Update Zustands store and localstorage
    setAllWorkouts(updatedAllWorkouts);
    localStorage.setItem('tatugym_all_workouts', JSON.stringify(updatedAllWorkouts));

    // Show toast message & close sheet
    if (addToast) {
      addToast("Ficha salva com sucesso! 💪", "success");
    }

    onClose();
  };

  // Suggestions filter
  const suggestions = searchQuery.trim() === '' 
    ? [] 
    : BASE_EXERCISES_LIST.filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Dynamic conditions for footer buttons disabled states
  const isStep1Disabled = blocks.slice(0, numBlocks).every(b => !b.title.trim());
  const isStep2Disabled = blocks.slice(0, numBlocks).some(b => b.exercises.length === 0);

  // Simulated AI suggestions
  const getAiHorusSuggestion = (): string => {
    const listTitles = blocks.slice(0, numBlocks).map(b => b.title || 'Invisível');
    return `Análise Nutricional e de Volume Hormonal da IA HORUS:
O planejamento estruturado com divisão em ${division} e focado em "${listTitles.join(' / ')}" está excelente! 
Distribuição muscular calculada atinge o balanço ideal semanal de estímulo hipertrófico. O período de descanso em 60 segundos assegura excelente reparação celular. Você está pronto para decolar!`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="workout-builder-sheet-wrapper" className="fixed inset-0 flex items-end justify-center z-50 md:items-center p-0 md:p-4 font-sans select-none pointer-events-none">
          {/* Dark overlay backdrop */}
          <motion.div 
            id="builder-overlay"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.6 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black pointer-events-auto" 
            onClick={onClose} 
          />
          
          {/* Bottom Sheet Slider */}
          <motion.div
            id="builder-sheet-body"
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="relative bg-white w-full rounded-t-3xl md:rounded-3xl shadow-2xl z-50 flex flex-col max-h-[90dvh] overflow-hidden md:max-w-xl md:max-h-[85dvh] pointer-events-auto"
          >
            {/* Top handlebar cinza / drag pill (for aesthetic feel) */}
            <div id="drag-handle-pill" className="w-10 h-1 bg-gray-350 rounded-full mx-auto my-3 shrink-0" style={{ backgroundColor: '#D1D5DB' }} />

            {/* Top Close Button */}
            <button
              id="builder-close-btn"
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Cancelar"
            >
              <X size={18} />
            </button>

            {/* Header / Barra de Progresso Progress bar */}
            <div id="progresso-container" className="flex gap-1.5 px-6 pb-4 pt-1 shrink-0">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  id={`progress-segment-${s}`}
                  className="h-1 flex-1 rounded-full transition-all duration-300" 
                  style={{ backgroundColor: s <= step ? '#1D4ED8' : '#E5E7EB' }}
                />
              ))}
            </div>

            {/* SCROLLABLE CENTRAL CONTAINER */}
            <div id="sheet-scrollable-content" className="flex-grow overflow-y-auto px-6 pb-6 pt-2">
              
              {/* ======================================= */}
              {/* PASSO 1 — ESTRUTURA DO TREINO */}
              {/* ======================================= */}
              {step === 1 && (
                <div id="builder-step-1" className="space-y-6">
                  <div>
                    <h2 id="step-1-title" className="text-xl font-black text-gray-950 tracking-tight flex items-center gap-2">
                      📋 Estrutura do Treino
                    </h2>
                    <p id="step-1-subtitle" className="text-sm text-gray-500 mt-1">
                      Defina a divisão desejada do aluno <span id="student-name-badge" className="text-blue-700 font-bold">{studentName}</span>
                    </p>
                  </div>

                  {/* Division pills */}
                  <div id="division-pills-row" className="flex flex-col space-y-2">
                    <span id="division-label" className="text-xs uppercase font-extrabold tracking-wider text-gray-400">
                      Divisão de Frequência
                    </span>
                    <div id="division-pills-container" className="flex flex-wrap gap-2">
                      {(['AB', 'ABC', 'ABCD', 'ABCDE'] as const).map((freq) => {
                        const isSelected = division === freq;
                        return (
                          <button
                            key={freq}
                            id={`pill-${freq}`}
                            type="button"
                            onClick={() => {
                              setDivision(freq);
                              // Sync activeTab limits if needed
                              const limit = freq.length;
                              if (activeTab >= limit) {
                                setActiveTab(0);
                              }
                            }}
                            className="px-5 py-3 text-xs font-black rounded-full transition-all cursor-pointer shadow-sm"
                            style={{ 
                              backgroundColor: isSelected ? '#1D4ED8' : '#F3F4F6',
                              color: isSelected ? '#FFFFFF' : '#374151',
                            }}
                          >
                            {freq}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Division slots editable focus titles */}
                  <div id="division-slots-container" className="space-y-4">
                    <span id="slots-label" className="text-xs uppercase font-extrabold tracking-wider text-gray-400 block">
                      Foco de cada bloco de treino
                    </span>
                    
                    {Array.from({ length: numBlocks }).map((_, idx) => {
                      const char = String.fromCharCode(65 + idx);
                      
                      // Placesholders according to the Portuguese prompts
                      let placeholder = 'Ex: Peito, Ombro e Tríceps';
                      if (char === 'B') placeholder = 'Ex: Costas e Bíceps';
                      else if (char === 'C') placeholder = 'Ex: Pernas e Glúteos';
                      else if (char === 'D') placeholder = 'Ex: Ombros e Core';
                      else if (char === 'E') placeholder = 'Ex: Cardio e Panturrilhas';

                      return (
                        <div key={idx} id={`slot-group-${idx}`} className="flex flex-col space-y-1.5 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                          <label id={`slot-label-${idx}`} className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                            Treino {char}
                          </label>
                          <input 
                            id={`slot-input-${idx}`}
                            type="text"
                            value={blocks[idx]?.title || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBlocks(prev => prev.map((b, bIdx) => {
                                if (bIdx === idx) {
                                  return { ...b, title: val };
                                }
                                return b;
                              }));
                            }}
                            placeholder={placeholder}
                            className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm font-bold text-gray-900 outline-none p-3.5 transition-all placeholder:text-gray-400 placeholder:font-semibold"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* PASSO 2 — EXERCÍCIOS */}
              {/* ======================================= */}
              {step === 2 && (
                <div id="builder-step-2" className="space-y-5">
                  <div>
                    <h2 id="step-2-title" className="text-xl font-black text-gray-950 tracking-tight flex items-center gap-1">
                      💪 {blocks[activeTab]?.title || `Treino ${String.fromCharCode(65 + activeTab)}`}
                    </h2>
                    <p id="step-2-subtitle" className="text-sm text-gray-500 mt-1">
                      Escolha os exercícios e configure as metas inline
                    </p>
                  </div>

                  {/* Tops Tabs for blocks */}
                  <div id="step-2-block-tabs" className="flex gap-2 border-b border-gray-100 pb-2.5 overflow-x-auto no-scrollbar">
                    {Array.from({ length: numBlocks }).map((_, idx) => {
                      const char = String.fromCharCode(65 + idx);
                      const isActive = idx === activeTab;
                      return (
                        <button
                          key={idx}
                          id={`tab-block-${idx}`}
                          type="button"
                          onClick={() => {
                            setActiveTab(idx);
                            setSearchQuery('');
                          }}
                          className="px-4 py-2.5 text-xs font-black rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer border"
                          style={{
                            backgroundColor: isActive ? '#1D4ED8' : '#F9FAFB',
                            borderColor: isActive ? '#1D4ED8' : '#E5E7EB',
                            color: isActive ? '#FFFFFF' : '#4B5563'
                          }}
                        >
                          {char} - {blocks[idx].title || `Treino ${char}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Bar */}
                  <div id="search-input-group" className="space-y-2">
                    <span id="search-label" className="text-xs uppercase font-extrabold tracking-wider text-gray-400 block">
                      Adicionar Exercício
                    </span>
                    <div id="search-bar" className="relative">
                      <div id="search-icon-container" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-405" style={{ color: '#9CA3AF' }}>
                        <Search size={16} />
                      </div>
                      <input 
                        id="exercise-search-input"
                        ref={searchInputRef}
                        type="text"
                        placeholder="Buscar ou digitar nome do exercício..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchQuery.trim() !== '') {
                            handleAddNewExercise(searchQuery);
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white text-sm py-3.5 pl-11 pr-4 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all font-semibold"
                        style={{ minHeight: '48px' }}
                      />
                    </div>

                    {/* Suggestions matching list */}
                    {searchQuery.trim() !== '' && (
                      <div id="suggestions-box" className="border border-blue-100 bg-blue-50/15 rounded-2xl p-2 max-h-[190px] overflow-y-auto no-scrollbar space-y-1 mt-1 pb-2">
                        {suggestions.map((name, sIdx) => (
                          <button
                            key={sIdx}
                            id={`suggestion-item-${sIdx}`}
                            type="button"
                            onClick={() => handleAddNewExercise(name)}
                            className="w-full text-left bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 hover:border-blue-400 hover:text-blue-700 transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>{name}</span>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                              + INCLUIR
                            </span>
                          </button>
                        ))}

                        {/* Always allow custom added exercise */}
                        <button
                          id="btn-custom-add-suggestion"
                          type="button"
                          onClick={() => handleAddNewExercise(searchQuery)}
                          className="w-full text-left bg-blue-50 border border-dotted border-blue-300 rounded-xl px-4 py-3 text-xs font-black text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer flex items-center justify-between"
                        >
                          <span>Adicionar "{searchQuery}"...</span>
                          <span className="text-[10px] uppercase tracking-widest">
                            + NOVO
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Added Exercises inside active block */}
                  <div id="added-exercises-scroller" className="space-y-3 min-h-[150px]">
                    <span id="added-header" className="text-xs uppercase font-extrabold tracking-wider text-gray-400 block pb-1 border-b border-gray-100">
                      Incluídos neste bloco ({blocks[activeTab]?.exercises.length || 0})
                    </span>

                    {blocks[activeTab]?.exercises.length === 0 ? (
                      <div id="empty-exercises-card" className="border border-dashed border-gray-200 rounded-2xl py-10 px-4 text-center">
                        <p className="text-sm font-bold text-gray-500">Nenhum exercício incluído ainda</p>
                        <p className="text-xs text-gray-400 mt-1">Busque acima e selecione os movimentos da planilha do Treino {String.fromCharCode(65 + activeTab)}.</p>
                      </div>
                    ) : (
                      <div id="added-exercises-wrapper" className="space-y-2.5">
                        {blocks[activeTab]?.exercises.map((ex, exIdx) => (
                          <div 
                            key={ex.id} 
                            id={`added-exercise-row-${ex.id}`}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-150 p-4 rounded-2xl gap-3.5 hover:border-blue-200 transition-all"
                          >
                            <div id={`ex-name-muscle-${ex.id}`} className="min-w-0 flex-grow">
                              <span id={`ex-row-name-${ex.id}`} className="text-sm font-black text-gray-905 block truncate max-w-xs">{ex.name}</span>
                              <span id={`ex-row-muscle-${ex.id}`} className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mt-0.5 block">{ex.muscleGroup}</span>
                            </div>

                            {/* SMALL INLINE CONFIGS WITH BLUE BORDER UPON FOCUS */}
                            <div id={`ex-inputs-trash-${ex.id}`} className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                              <div id={`ex-inline-inputs-${ex.id}`} className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-xl">
                                <div className="flex flex-col items-center">
                                  <input 
                                    id={`ex-sets-input-${ex.id}`}
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={ex.sets}
                                    onChange={(e) => handleUpdateExerciseValue(ex.id, 'sets', Math.max(1, parseInt(e.target.value) || 3))}
                                    className="w-10 h-7 text-center font-bold text-gray-900 border border-gray-250 bg-white rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                  />
                                </div>
                                <span className="text-gray-400 font-bold">x</span>
                                <div className="flex flex-col items-center">
                                  <input 
                                    id={`ex-reps-input-${ex.id}`}
                                    type="text"
                                    value={ex.reps}
                                    onChange={(e) => handleUpdateExerciseValue(ex.id, 'reps', e.target.value)}
                                    className="w-14 h-7 text-center font-bold text-gray-900 border border-gray-250 bg-white rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                                  />
                                </div>
                                <span className="text-gray-400 font-semi">|</span>
                                <div className="flex items-center gap-0.5">
                                  <input 
                                    id={`ex-rest-input-${ex.id}`}
                                    type="number"
                                    min="0"
                                    step="5"
                                    value={ex.rest}
                                    onChange={(e) => handleUpdateExerciseValue(ex.id, 'rest', Math.max(0, parseInt(e.target.value) || 60))}
                                    className="w-12 h-7 text-center font-bold text-gray-900 border border-gray-250 bg-white rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                  />
                                  <span className="text-[10px] text-gray-400 font-extrabold pr-0.5">s</span>
                                </div>
                              </div>

                              <button
                                id={`ex-trash-btn-${ex.id}`}
                                type="button"
                                onClick={() => handleRemoveExercise(ex.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100"
                                title="Remover Exercício"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================= */}
              {/* PASSO 3 — REVISÃO E SALVAR */}
              {/* ======================================= */}
              {step === 3 && (
                <div id="builder-step-3" className="space-y-6">
                  <div>
                    <h2 id="step-3-title" className="text-xl font-black text-gray-950 tracking-tight flex items-center gap-1.5">
                      ✅ Revisão da Ficha
                    </h2>
                    <p id="step-3-subtitle" className="text-sm text-gray-500 mt-1">
                      Revise o plano antes de carregar no perfil de <span id="revision-student-name" className="text-blue-700 font-bold">{studentName}</span>
                    </p>
                  </div>

                  {/* Summary grid */}
                  <div id="summary-cards-container" className="space-y-3">
                    <span id="summary-header" className="text-xs uppercase font-extrabold tracking-wider text-gray-400 block pb-1 border-b border-gray-100">
                      Resumo da Estrutura ({division})
                    </span>

                    {blocks.slice(0, numBlocks).map((b, idx) => {
                      const char = String.fromCharCode(65 + idx);
                      const totalBlockSets = b.exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0);
                      
                      return (
                        <div key={idx} id={`summary-card-${idx}`} className="bg-gray-50 border border-gray-200/60 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                          <div>
                            <span id={`summary-slot-${idx}`} className="text-xs font-black text-blue-600 block uppercase tracking-wider">Treino {char}</span>
                            <span id={`summary-title-${idx}`} className="text-sm font-bold text-gray-900 block mt-0.5">{b.title || `Treino sem título`}</span>
                          </div>
                          <div id={`summary-stats-${idx}`} className="text-right shrink-0">
                            <span id={`summary-ex-count-${idx}`} className="text-xs font-extrabold text-gray-500 block">{b.exercises.length} exercícios</span>
                            <span id={`summary-sets-count-${idx}`} className="text-[10px] font-black text-blue-600 uppercase tracking-widest block bg-blue-50 border border-blue-105 rounded px-1.5 py-0.5 mt-1">{totalBlockSets} séries</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Toggle AI HORUS */}
                  <div id="ai-horus-group" className="bg-blue-50/30 border border-blue-100 p-5 rounded-2xl space-y-4">
                    <div id="ai-horus-toggle-row" className="flex items-center justify-between">
                      <div id="ai-horus-info">
                        <span id="ai-toggle-title" className="text-sm font-black text-gray-950 block">Revisar com IA HORUS</span>
                        <span id="ai-toggle-desc" className="text-[11px] text-gray-400 font-bold block mt-0.5">Analisa e otimiza o equilíbrio com inteligência esportiva</span>
                      </div>
                      
                      {/* Stylized Toggle Switch */}
                      <button
                        id="ai-horus-toggle-switch"
                        type="button"
                        onClick={() => setAiHorusEnabled(!aiHorusEnabled)}
                        className="w-12 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer outline-none shrink-0"
                        style={{ backgroundColor: aiHorusEnabled ? '#1D4ED8' : '#D1D5DB' }}
                      >
                        <div 
                          id="toggle-thumb"
                          className="bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200" 
                          style={{ transform: aiHorusEnabled ? 'translateX(24px)' : 'translateX(0px)' }}
                        />
                      </button>
                    </div>

                    {/* Simulado AI response area */}
                    {aiHorusEnabled && (
                      <motion.div
                        id="ai-response-box"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-blue-200 p-4 rounded-xl text-xs text-blue-800 leading-relaxed shadow-sm space-y-1"
                      >
                        <div id="ai-badge-header" className="font-extrabold flex items-center gap-1.5 text-blue-900 border-b border-blue-50 pb-1.5 mb-1.5">
                          <span id="ai-pulse-dot" className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span>COACH IA HORUS</span>
                        </div>
                        <p id="ai-suggestion-body" className="font-semibold whitespace-pre-line">{getAiHorusSuggestion()}</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* FOOTER BUTTONS STRIP */}
            <div id="sheet-footer-strip" className="border-t border-gray-150 p-5 shrink-0 bg-gray-50 flex items-center gap-3">
              {step > 1 && (
                <button
                  id="btn-voltar"
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="px-5 h-14 bg-gray-200 hover:bg-gray-300 text-gray-700 font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shrink-0"
                >
                  ← VOLTAR
                </button>
              )}

              {step < 3 ? (
                <button
                  id="btn-proximo"
                  type="button"
                  onClick={() => setStep(prev => prev + 1)}
                  disabled={step === 1 ? isStep1Disabled : isStep2Disabled}
                  className="flex-grow h-14 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  style={{ backgroundColor: '#1D4ED8' }}
                >
                  <span>PRÓXIMO</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  id="btn-salvar"
                  type="button"
                  onClick={handleSaveWorkout}
                  className="flex-grow h-14 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  style={{ backgroundColor: '#10B981' }} // Elegant emerald green for save action
                >
                  SALVAR FICHA ✓
                </button>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
