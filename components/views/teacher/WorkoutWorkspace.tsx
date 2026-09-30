import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Sliders, Play, Plus, Copy, RefreshCw, X, Check, Eye, ChevronDown, User, AlertCircle, ArrowUp, ArrowDown, Search, Sparkles, Brain, CheckCircle, Wand2
} from 'lucide-react';
import { WorkoutRoutine, Exercise, User as StudentUser } from '../../../types';
import { BaseExercise, exerciseDatabase } from '../../../data/exerciseDatabase';
import { getHorusGifUrl } from '../../../src/utils/exerciseUtils';
import confetti from 'canvas-confetti';

interface WorkoutWorkspaceProps {
  localRoutines: WorkoutRoutine[];
  activeRoutineIdx: number;
  setActiveRoutineIdx: (idx: number) => void;
  expandedExerciseId: string | null;
  setExpandedExerciseId: (id: string | null) => void;
  sheetFrequency: 'AB' | 'ABC' | 'ABCD' | 'ABCDE';
  getFrequencyCount: () => number;
  onUpdateExerciseField: (id: string, field: keyof Exercise, val: any) => void;
  onRemoveExercise: (id: string) => void;
  onAddCustomExercise: () => void;
  onUpdateRoutineTitle: (title: string) => void;
  students?: StudentUser[];
  onCloneRoutine?: (fromIdx: number) => void;
  onCloneFromOtherStudent?: (otherStudentUsername: string) => void;
  onClearWorkoutRoutine?: () => void;
  onInjectBlock?: (exercisesList: BaseExercise[]) => void;
  onReorderExercises?: (exercises: Exercise[]) => void;
  
  // Extra props for unified mobile creation workspace
  filteredSuggestions?: BaseExercise[];
  searchExerciseQuery?: string;
  setSearchExerciseQuery?: (query: string) => void;
  selectedMuscleFilter?: string;
  setSelectedMuscleFilter?: (muscle: string) => void;
  onAddExercise?: (baseEx: BaseExercise) => void;
  
  selectedStudentUsername?: string | null;
  setSheetFrequency?: (frequency: 'AB' | 'ABC' | 'ABCD' | 'ABCDE') => void;
}

export const WorkoutWorkspace: React.FC<WorkoutWorkspaceProps> = ({
  localRoutines,
  activeRoutineIdx,
  setActiveRoutineIdx,
  expandedExerciseId,
  setExpandedExerciseId,
  sheetFrequency,
  getFrequencyCount,
  onUpdateExerciseField,
  onRemoveExercise,
  onAddCustomExercise,
  onUpdateRoutineTitle,
  students = [],
  onCloneRoutine,
  onCloneFromOtherStudent,
  onClearWorkoutRoutine,
  onInjectBlock,
  onReorderExercises,
  
  filteredSuggestions = [],
  searchExerciseQuery = '',
  setSearchExerciseQuery = () => {},
  selectedMuscleFilter = 'Todos',
  setSelectedMuscleFilter = () => {},
  onAddExercise = () => {},
  
  selectedStudentUsername,
  setSheetFrequency,
}) => {
  const activeRoutine = localRoutines[activeRoutineIdx];
  const exercises = activeRoutine?.exercises || [];
  
  const [showDuplicateMenu, setShowDuplicateMenu] = useState(false);
  const [showStudentMenu, setShowStudentMenu] = useState(false);

  const activeExercise = exercises.find(ex => ex.id === expandedExerciseId);

  const intensityTags = [
    { label: 'Drop Set', field: 'dropSet' as keyof Exercise },
    { label: "Rest 'n' Pause", field: 'restPause' as keyof Exercise },
    { label: 'Bi-set', field: 'biSet' as keyof Exercise },
    { label: 'Cluster', field: 'cluster' as keyof Exercise },
    { label: 'Isometria', field: 'isometria' as keyof Exercise },
    { label: 'Falha', field: 'falha' as keyof Exercise }
  ];

  const totalSets = exercises.reduce((acc, curr) => acc + (curr.sets || 0), 0);
  const totalVolumeEst = exercises.reduce((acc, curr) => {
    const weight = parseFloat(String(curr.notes || '0').replace(/[^0-9.]/g, '')) || 0;
    const reps = parseInt(String(curr.reps || '10').replace(/[^0-9]/g, '')) || 10;
    return acc + (curr.sets || 0) * reps * (weight || 1);
  }, 0);

  // Manual sorting handlers
  const handleMove = (idx: number, direction: 'up' | 'down') => {
    if (!onReorderExercises) return;
    const list = [...exercises];
    if (direction === 'up' && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    }
    onReorderExercises(list);
  };

  // NEW POPUPS AND STATES FOR MOBILE VIEW ONLY
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [showBlocoModal, setShowBlocoModal] = useState(false);
  const [showClonarModal, setShowClonarModal] = useState(false);
  const [showIaHorusModal, setShowIaHorusModal] = useState(false);
  
  // Local Search & Categories parameters inside modal
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localMuscleFilter, setLocalMuscleFilter] = useState('Todos');

  // IA HORUS form configs
  const [iaObjetivo, setIaObjetivo] = useState<'hipertrofia' | 'definicao' | 'condicionamento' | 'forca'>('hipertrofia');
  const [iaSexo, setIaSexo] = useState<'masculino' | 'feminino'>('masculino');
  const [iaNivel, setIaNivel] = useState<'iniciante' | 'intermediario' | 'avancado'>('intermediario');
  const [iaDias, setIaDias] = useState<number>(3);
  const [iaRestricao, setIaRestricao] = useState<'nenhuma' | 'joelho' | 'lombar' | 'ombro'>('nenhuma');
  const [iaEquipamento, setIaEquipamento] = useState<'completo' | 'halteres' | 'cabos' | 'peso_corporal'>('completo');

  // Generation Loading Step states
  const [iaGenerating, setIaGenerating] = useState(false);
  const [iaStep, setIaStep] = useState(0);
  const iaStepsText = [
    'Analisando biotipo e nível do aluno...',
    'Excluindo exercícios estressantes para restrições...',
    'Selecionando movimentos com melhores matches da base...',
    'Distribuindo volume de empurre/puxa nos dias...',
    'Configurando repetições, tempos de descanso e técnicas avançadas...',
    'Sincronizando ficha eletrônica Horus com servidores...'
  ];

  // Helper matching categorizer for AI procedural generation
  const matchCategory = (exName: string, exMuscle: string, cat: string): boolean => {
    const name = exName.toLowerCase();
    const muscle = exMuscle.toLowerCase();
    
    if (cat === 'Peito') {
      return name.includes('supino') || name.includes('peck') || name.includes('crucifixo') || name.includes('crossover') || name.includes('flexao') || name.includes('flexão') || muscle.includes('peito') || muscle.includes('peitoral');
    }
    if (cat === 'Costas') {
      return name.includes('puxada') || name.includes('remada') || name.includes('pulldown') || name.includes('pull down') || name.includes('barra fixa') || name.includes('terra') || name.includes('serrote') || muscle.includes('costas') || muscle.includes('dorsal');
    }
    if (cat === 'Pernas') {
      return name.includes('agachamento') || name.includes('leg press') || name.includes('extensora') || name.includes('flexora') || name.includes('afundo') || name.includes('bulgaro') || name.includes('búlgaro') || name.includes('sumo') || name.includes('sumô') || name.includes('hack') || name.includes('panturrilha') || name.includes('stiff') || name.includes('gluteo') || name.includes('glúteo') || name.includes('abdutora') || name.includes('adutora') || name.includes('pelvica') || name.includes('pélvica') || muscle.includes('perna') || muscle.includes('coxa') || muscle.includes('quadriceps') || muscle.includes('quadríceps') || muscle.includes('glúteos') || muscle.includes('isquiotibiais');
    }
    if (cat === 'Ombros') {
      return name.includes('ombro') || name.includes('desenvolvimento') || name.includes('lateral') || name.includes('frontal') || name.includes('crucifixo inverso') || name.includes('remada alta') || name.includes('encolhimento') || muscle.includes('ombro') || muscle.includes('deltoide') || muscle.includes('deltoíde') || muscle.includes('trapézio');
    }
    if (cat === 'Braços') {
      return name.includes('rosca') || name.includes('triceps') || name.includes('tríceps') || name.includes('biceps') || name.includes('bíceps') || name.includes('martelo') || name.includes('scott') || name.includes('coice') || name.includes('frances') || name.includes('francês') || name.includes('pulley') || name.includes('dips') || name.includes('paralelas') || muscle.includes('braço') || muscle.includes('bíceps') || muscle.includes('tríceps');
    }
    if (cat === 'Abdômen') {
      return name.includes('abdominal') || name.includes('infra') || name.includes('supra') || name.includes('bicicleta') || name.includes('prancha') || name.includes('pingus') || muscle.includes('abdômen') || muscle.includes('abdomen') || muscle.includes('core');
    }
    return false;
  };

  // AI fitness procedural generation algorhythm
  const executeIaGeneration = () => {
    setIaGenerating(true);
    setIaStep(0);

    const runStep = (currStep: number) => {
      if (currStep < iaStepsText.length) {
        setIaStep(currStep);
        setTimeout(() => runStep(currStep + 1), 600);
      } else {
        // Build Workout Plans procedurally
        const freqMap: Record<number, 'AB' | 'ABC' | 'ABCD' | 'ABCDE'> = {
          2: 'AB',
          3: 'ABC',
          4: 'ABCD',
          5: 'ABCDE'
        };
        if (setSheetFrequency && freqMap[iaDias]) {
          setSheetFrequency(freqMap[iaDias]);
        }

        const selectedPlans: WorkoutRoutine[] = Array.from({ length: 5 }).map((_, rIdx) => {
          const char = String.fromCharCode(65 + rIdx);
          let targetCats: string[] = [];
          let focusTitle = `Treino ${char}`;
          
          if (iaDias === 2) {
            if (rIdx === 0) {
              targetCats = ['Peito', 'Ombros', 'Braços', 'Abdômen'];
              focusTitle = 'Membros Superiores & Core';
            } else if (rIdx === 1) {
              targetCats = ['Costas', 'Pernas', 'Braços'];
              focusTitle = 'Membros Inferiores & Dorsais';
            }
          } else if (iaDias === 3) {
            if (rIdx === 0) {
              targetCats = ['Peito', 'Ombros', 'Braços'];
              focusTitle = 'Peitorais, Ombros & Tríceps';
            } else if (rIdx === 1) {
              targetCats = ['Costas', 'Braços', 'Abdômen'];
              focusTitle = 'Dorsais, Bíceps & Abdômen';
            } else if (rIdx === 2) {
              targetCats = ['Pernas'];
              focusTitle = 'Membros Inferiores Completos';
            }
          } else if (iaDias === 4) {
            if (rIdx === 0) {
              targetCats = ['Peito', 'Braços'];
              focusTitle = 'Peito & Tríceps';
            } else if (rIdx === 1) {
              targetCats = ['Costas', 'Braços'];
              focusTitle = 'Costas & Bíceps';
            } else if (rIdx === 2) {
              targetCats = ['Ombros', 'Abdômen'];
              focusTitle = 'Ombros & Core';
            } else if (rIdx === 3) {
              targetCats = ['Pernas'];
              focusTitle = 'Membros Inferiores Secos';
            }
          } else {
            if (rIdx === 0) {
              targetCats = ['Peito'];
              focusTitle = 'Peitoral Estético';
            } else if (rIdx === 1) {
              targetCats = ['Costas', 'Abdômen'];
              focusTitle = 'Dorsais & Core';
            } else if (rIdx === 2) {
              targetCats = ['Pernas'];
              focusTitle = 'Coxas Completas';
            } else if (rIdx === 3) {
              targetCats = ['Ombros'];
              focusTitle = 'Ombros Gigantes';
            } else if (rIdx === 4) {
              targetCats = ['Braços'];
              focusTitle = 'Bíceps & Tríceps Extremos';
            }
          }

          const finalExs: Exercise[] = [];
          const usedNames = new Set<string>();

          targetCats.forEach(cat => {
            const pool = exerciseDatabase.filter(baseEx => {
              if (!matchCategory(baseEx.name, baseEx.muscleGroup, cat)) return false;
              
              if (iaRestricao === 'joelho' && (baseEx.name.toLowerCase().includes('leg press') || baseEx.name.toLowerCase().includes('extensora') || baseEx.name.toLowerCase().includes('afundo') || baseEx.name.toLowerCase().includes('búlgaro') || baseEx.name.toLowerCase().includes('bulgaro') || baseEx.name.toLowerCase().includes('hack'))) return false;
              if (iaRestricao === 'lombar' && (baseEx.name.toLowerCase().includes('levantamento terra') || baseEx.name.toLowerCase().includes('terra') || baseEx.name.toLowerCase().includes('remada curvada') || baseEx.name.toLowerCase().includes('agachamento livre com barra') || baseEx.name.toLowerCase().includes('stiff'))) return false;
              if (iaRestricao === 'ombro' && (baseEx.name.toLowerCase().includes('desenvolvimento') || baseEx.name.toLowerCase().includes('dips') || baseEx.name.toLowerCase().includes('paralelas') || baseEx.name.toLowerCase().includes('supino inclinado'))) return false;

              if (iaEquipamento === 'halteres') {
                const nLower = baseEx.name.toLowerCase();
                return nLower.includes('halter') || nLower.includes('halteres') || nLower.includes('livre') || (!nLower.includes('barra') && !nLower.includes('smith') && !nLower.includes('maquina') && !nLower.includes('máquina') && !nLower.includes('polia') && !nLower.includes('cabo') && !nLower.includes('pulley') && !nLower.includes('cross'));
              } else if (iaEquipamento === 'cabos') {
                const nLower = baseEx.name.toLowerCase();
                return nLower.includes('cabo') || nLower.includes('polia') || nLower.includes('pulley') || nLower.includes('cross') || nLower.includes('crossover');
              } else if (iaEquipamento === 'peso_corporal') {
                const nLower = baseEx.name.toLowerCase();
                return nLower.includes('flexão') || nLower.includes('flexao') || nLower.includes('barra fixa') || nLower.includes('prancha') || nLower.includes('abdominal') || nLower.includes('alongamento') || nLower.includes('sissy') || nLower.includes('livre');
              }
              
              return true;
            });

            let count = 0;
            for (const ex of pool) {
              if (count >= 2) break;
              if (!usedNames.has(ex.name)) {
                usedNames.add(ex.name);
                
                let setsCount = 3;
                let repsStr = '10-12';
                let restSecs = 60;
                
                if (iaNivel === 'iniciante') {
                  setsCount = 3;
                  repsStr = iaObjetivo === 'forca' ? '8' : (iaObjetivo === 'condicionamento' ? '15' : '10-12');
                  restSecs = 60;
                } else if (iaNivel === 'intermediario') {
                  setsCount = 4;
                  repsStr = iaObjetivo === 'forca' ? '6' : (iaObjetivo === 'condicionamento' ? '12-15' : '10');
                  restSecs = iaObjetivo === 'forca' ? 90 : 60;
                } else {
                  setsCount = iaObjetivo === 'forca' ? 5 : 4;
                  repsStr = iaObjetivo === 'forca' ? '4-6' : (iaObjetivo === 'condicionamento' ? '15-20' : '8-10');
                  restSecs = iaObjetivo === 'forca' ? 120 : 45;
                }

                const isLast = count === pool.length - 1;
                const hasDrop = (iaNivel === 'avancado' && isLast && iaObjetivo === 'hipertrofia');
                const hasRestPause = (iaNivel === 'avancado' && finalExs.length === 0 && iaObjetivo === 'forca');
                const hasBiSet = (iaNivel === 'avancado' && finalExs.length > 0 && Math.random() > 0.6 && iaObjetivo === 'definicao');
                const hasFalha = (iaNivel === 'avancado' && isLast);

                finalExs.push({
                  id: `ex_${Math.random().toString(36).substring(2, 9)}`,
                  name: ex.name,
                  muscleGroup: ex.muscleGroup,
                  sets: setsCount,
                  reps: repsStr,
                  rest: restSecs,
                  notes: iaObjetivo === 'forca' ? '20' : '0',
                  dropSet: hasDrop,
                  restPause: hasRestPause,
                  biSet: hasBiSet,
                  cluster: false,
                  isometria: false,
                  falha: hasFalha
                });
                count++;
              }
            }
          });

          return {
            id: `routine_${char}_${Math.random().toString(36).substring(2, 9)}`,
            title: focusTitle,
            description: targetCats.join(' • '),
            exercises: finalExs.slice(0, 7),
            color: 'blue'
          };
        });

        // Inject reference details to keep reactive hooks update properly
        selectedPlans.forEach((plan, idx) => {
          if (localRoutines[idx]) {
            localRoutines[idx].exercises = plan.exercises;
            localRoutines[idx].title = plan.title;
            localRoutines[idx].description = plan.description;
          }
        });

        setActiveRoutineIdx(0);
        onUpdateRoutineTitle(selectedPlans[0].title);

        setIaGenerating(false);
        setShowIaHorusModal(false);

        // Visual trigger confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.8 }
        });
      }
    };

    runStep(0);
  };

  // Preset blocks database
  const blockPresets = [
    {
      name: 'Peitoral Completo',
      description: 'Preservação de alta tensão para musculaturas superior e inferior com volume ideal.',
      count: 4,
      exercises: ['Supino Reto Barra', 'Supino Inclinado Halter', 'Peck Deck (Voador)', 'Crossover Polia Alta']
    },
    {
      name: 'Costas Completa',
      description: 'Criação de largura e espessura do dorsal através de tiradas verticais e horizontais.',
      count: 4,
      exercises: ['Puxada Frente Aberta', 'Remada Baixa', 'Remada Unilateral', 'Pulldown Corda']
    },
    {
      name: 'Braços Máximos',
      description: 'Foco total no ganho de braço com super-sets dinâmicos para Bíceps & Tríceps.',
      count: 4,
      exercises: ['Rosca Direta Barra', 'Tríceps Pulley (Corda)', 'Rosca Martelo', 'Tríceps Testa']
    },
    {
      name: 'Glúteo Premium',
      description: 'Esmagamento e volume focado nas porções glúteas de alto impacto metabólico.',
      count: 4,
      exercises: ['Elevação Pélvica', 'Abdução de Quadril com Cabo', 'Cadeira Abdutora', 'Agachamento Sumô']
    },
    {
      name: 'Quadríceps Dominante',
      description: 'Estresse mecânico ideal com movimentos multiarticulares poderosos.',
      count: 4,
      exercises: ['Agachamento Livre', 'Leg Press 45', 'Extensora', 'Agachamento Búlgaro']
    },
    {
      name: 'Hipertrofia Feminina',
      description: 'Combinação estética perfeita entre membros inferiores e glúteos desenhados.',
      count: 5,
      exercises: ['Elevação Pélvica', 'Agachamento Sumô', 'Agachamento Búlgaro', 'Abdução de Quadril com Ponte', 'Extensora']
    }
  ];

  // Function to load block template preset
  const handleLoadBloco = (preset: typeof blockPresets[0]) => {
    // Collect related BaseExercise items from local database
    const selectedExs: BaseExercise[] = [];
    preset.exercises.forEach(pName => {
      const dbMatch = exerciseDatabase.find(x => x.name.toLowerCase() === pName.toLowerCase());
      if (dbMatch) {
        selectedExs.push(dbMatch);
      }
    });

    if (selectedExs.length > 0 && onInjectBlock) {
      onInjectBlock(selectedExs);
      setShowBlocoModal(false);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.9 }
      });
    }
  };

  // Interactive filtering inside Add Exercise Modal
  const modalFilteredSuggestions = exerciseDatabase.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(localSearchQuery.toLowerCase()) || 
                          item.muscleGroup.toLowerCase().includes(localSearchQuery.toLowerCase());
    
    if (localMuscleFilter === 'Todos') return matchesSearch;
    
    if (localMuscleFilter === 'Braços') {
      return matchesSearch && ['Bíceps', 'Tríceps', 'Antebraço'].includes(item.muscleGroup);
    }
    if (localMuscleFilter === 'Pernas') {
      return matchesSearch && ['Quadríceps', 'Isquiotibiais', 'Panturrilha', 'Perna', 'Coxa', 'Glúteos'].includes(item.muscleGroup);
    }
    
    return matchesSearch && item.muscleGroup.toLowerCase().includes(localMuscleFilter.toLowerCase().slice(0, 4));
  });

  // Client human-readable Active Student Profile Name
  const getActiveStudentDisplay = () => {
    if (selectedStudentUsername) {
      const match = students.find(s => s.username === selectedStudentUsername);
      return match ? match.name : selectedStudentUsername;
    }
    return 'Henrique Costa';
  };

  return (
    <>
      {/* ================================================================= */}
      {/* DESKTOP WORKSPACE VIEW (100% STRICTLY UNTOUCHED FOR LARGER SCREENPORTS) */}
      {/* ================================================================= */}
      <div className="hidden lg:flex flex-col min-h-0 bg-[#F5F7FA] p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar h-full w-full">
        
        {/* 1. SIMPLE & CLEAN HEADER (CABEÇALHO) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">
                Slot {String.fromCharCode(65 + activeRoutineIdx)}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-105">
                  {exercises.length} Movimentos
                </span>
                <span className="bg-gray-100 text-gray-700 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-gray-200">
                  {totalSets} Séries
                </span>
                {totalVolumeEst > 0 && (
                  <span className="bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-green-105">
                    Vol. Est: {totalVolumeEst} kg
                  </span>
                )}
              </div>
            </div>

            {/* Large touch targets Slot Navigation */}
            <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-xl select-none shrink-0 self-start sm:self-center">
              {Array.from({ length: getFrequencyCount() }).map((_, idx) => {
                const char = String.fromCharCode(65 + idx);
                const isSelected = activeRoutineIdx === idx;
                return (
                  <button
                    key={char}
                    type="button"
                    onClick={() => {
                      setActiveRoutineIdx(idx);
                      setExpandedExerciseId(null);
                      setShowDuplicateMenu(false);
                      setShowStudentMenu(false);
                    }}
                    className={`py-2 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                    style={{ minWidth: '44px', minHeight: '40px' }}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Training Sheet Title / Focus Field */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 select-none">
              Foco de Treinamento / Grupamento Muscular
            </label>
            <input 
              type="text"
              value={activeRoutine?.title || ''}
              onChange={(e) => onUpdateRoutineTitle(e.target.value)}
              placeholder="Ex: Peito e Tríceps (Foco Peitoral Superior)"
              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white py-3 px-4 rounded-xl text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Toolbar of Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 relative select-none">
            {/* Duplicate Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateMenu(!showDuplicateMenu);
                  setShowStudentMenu(false);
                }}
                className="py-2.5 px-4 text-xs text-gray-600 font-extrabold hover:text-gray-900 bg-gray-50 border border-gray-200 hover:bg-white rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                style={{ minHeight: '44px' }}
              >
                <Copy size={13} className="text-gray-400" />
                <span>Clonar Treino</span>
                <ChevronDown size={11} className="text-gray-400" />
              </button>
   
              {showDuplicateMenu && (
                <div className="absolute left-0 top-12 w-[210px] bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-50 animate-fade">
                  <p className="text-[9px] text-gray-400 font-bold tracking-wider p-2.5 uppercase select-none">Clonar de outro Slot:</p>
                  {Array.from({ length: getFrequencyCount() }).map((_, idx) => {
                    if (idx === activeRoutineIdx) return null;
                    const char = String.fromCharCode(65 + idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (onCloneRoutine) onCloneRoutine(idx);
                          setShowDuplicateMenu(false);
                        }}
                        className="w-full text-left text-xs px-3 py-2.5 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors cursor-pointer text-gray-700 flex items-center gap-2 font-bold"
                      >
                        <Copy size={11} className="text-gray-400" />
                        <span>Clonar do Treino {char}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
   
            {/* Import Student Workout Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowStudentMenu(!showStudentMenu);
                  setShowDuplicateMenu(false);
                }}
                className="py-2.5 px-4 text-xs text-gray-600 font-extrabold hover:text-gray-900 bg-gray-50 border border-gray-200 hover:bg-white rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                style={{ minHeight: '44px' }}
              >
                <User size={13} className="text-gray-400" />
                <span>Importar de Aluno...</span>
                <ChevronDown size={11} className="text-gray-400" />
              </button>
   
              {showStudentMenu && (
                <div className="absolute left-0 top-12 w-[240px] bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-50 max-h-[220px] overflow-y-auto no-scrollbar animate-fade">
                  <p className="text-[9px] text-gray-400 font-bold tracking-wider p-2.5 uppercase select-none">Importar estrutura de:</p>
                  {students.map((st) => (
                    <button
                      key={st.username}
                      type="button"
                      onClick={() => {
                        if (onCloneFromOtherStudent) onCloneFromOtherStudent(st.username);
                        setShowStudentMenu(false);
                      }}
                      className="w-full text-left text-xs px-3 py-2.5 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors cursor-pointer text-gray-700 flex items-center gap-2 truncate font-bold"
                    >
                      <User size={11} className="text-gray-400" />
                      <span>{st.name}</span>
                    </button>
                  ))}
                  {students.length === 0 && (
                    <p className="text-xs text-gray-400 p-3 text-center">Nenhum aluno cadastrado</p>
                  )}
                </div>
              )}
            </div>
   
            {/* Clear sheet trigger */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Deseja realmente esvaziar todos os exercícios deste treino?") && onClearWorkoutRoutine) {
                  onClearWorkoutRoutine();
                }
              }}
              className="py-2.5 px-4 text-xs text-red-600 hover:text-white hover:bg-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ml-auto font-black uppercase tracking-wider"
              style={{ minHeight: '44px' }}
            >
              <Trash2 size={12} />
              <span>Limpar Treino</span>
            </button>
          </div>
        </div>

        {/* 2. PROTAGONIST SEARCH IN WORKSPACE ON MOBILE (Disabled/unrendered inside desktop shell layout) */}
        <div className="block lg:hidden bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm space-y-4">
          <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 select-none">
            🔍 Adicionar exercício rapidamente
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder="Buscar exercício na biblioteca..."
              value={searchExerciseQuery}
              onChange={(e) => setSearchExerciseQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-sm py-4 pl-11 pr-4 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold shadow-inner"
              style={{ minHeight: '52px' }}
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 select-none">
            {['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços'].map(muscle => {
              const isSelected = selectedMuscleFilter === muscle;
              return (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => setSelectedMuscleFilter(muscle)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-sm font-extrabold' 
                      : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ minHeight: '38px' }}
                >
                  {muscle}
                </button>
              );
            })}
          </div>

          {searchExerciseQuery.trim() !== '' && (
            <div className="border border-blue-100 bg-blue-50/20 rounded-xl p-2.5 space-y-1 max-h-[220px] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center px-1 mb-1 border-b border-blue-50 pb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500">Resultados da Busca</span>
                <button 
                  type="button" 
                  onClick={() => setSearchExerciseQuery('')} 
                  className="text-[9px] font-bold text-gray-400 hover:text-gray-600"
                >
                  Limpar
                </button>
              </div>
              {filteredSuggestions.map((baseEx, bIdx) => (
                <div
                  key={bIdx}
                  onClick={() => {
                    onAddExercise(baseEx);
                    setSearchExerciseQuery('');
                  }}
                  className="flex items-center justify-between p-2.5 bg-white border border-gray-150 rounded-lg hover:border-blue-300 transition-all cursor-pointer shadow-sm active:scale-98"
                  style={{ minHeight: '44px' }}
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{baseEx.name}</span>
                    <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wide mt-0.5 block">{baseEx.muscleGroup}</span>
                  </div>
                  <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    + Add
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. CURRENT EXERCISES LIST DESIGN (Treino Sendo Montado) */}
        <div className="flex-grow space-y-4">
          <h3 className="text-xs uppercase font-black tracking-widest text-gray-400 select-none px-1">
            Exercícios na Ficha ({exercises.length})
          </h3>
          
          <div className="space-y-3 pb-8">
            {exercises.map((ex, idx) => {
              const indexStr = String(idx + 1).padStart(2, '0');
              const hasIntensity = ex.dropSet || ex.restPause || ex.biSet || ex.cluster || ex.isometria || ex.falha;

              return (
                <div 
                  key={ex.id}
                  onClick={() => setExpandedExerciseId(ex.id)}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-blue-300 rounded-2xl cursor-pointer transition-all duration-150 shadow-sm active:bg-gray-50"
                >
                  <div className="flex items-center gap-4 min-w-0 pr-2">
                    <span className="text-sm font-mono text-gray-400 font-black w-6 text-center shrink-0 block select-none">
                      {indexStr}
                    </span>

                    <div className="min-w-0">
                      <span className="text-base font-black text-gray-900 leading-tight block truncate">
                        {ex.name}
                      </span>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs font-bold text-gray-500 tracking-wide">
                        <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md">
                          {ex.sets}x{ex.reps}
                        </span>
                        <span className="text-gray-300 font-normal shrink-0 select-none">•</span>
                        <span>
                          {ex.rest}s descanso
                        </span>
                        {parseFloat(ex.notes || '') > 0 && (
                          <>
                            <span className="text-gray-300 font-normal shrink-0 select-none">•</span>
                            <span className="text-gray-700 font-mono font-black bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
                              {ex.notes} kg
                            </span>
                          </>
                        )}
                        
                        {hasIntensity && (
                          <>
                            <span className="text-gray-300 font-normal shrink-0 select-none">•</span>
                            <span className="text-[10px] font-black tracking-wider text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md uppercase">
                              {[
                                ex.dropSet && 'Drop',
                                ex.restPause && 'Pause',
                                ex.biSet && 'Bi-set',
                                ex.cluster && 'Cluster',
                                ex.isometria && 'Isom',
                                ex.falha && 'Falha'
                              ].filter(Boolean).join(' • ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {onReorderExercises && (
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-25 transition-all cursor-pointer"
                          style={{ minWidth: '32px', minHeight: '32px' }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          disabled={idx === exercises.length - 1}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-25 transition-all cursor-pointer"
                          style={{ minWidth: '32px', minHeight: '32px' }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedExerciseId(ex.id)}
                      className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                      <Sliders size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveExercise(ex.id)}
                      className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {exercises.length === 0 && (
            <div className="py-16 text-center flex flex-col items-center justify-center bg-white border border-gray-200 border-dashed rounded-2xl px-6">
              <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-3">
                <AlertCircle size={22} />
              </div>
              <p className="text-gray-800 font-bold text-sm">Este treino está esvaziado</p>
              <p className="text-gray-400 text-xs mt-1 max-w-sm leading-relaxed">
                Use a barra de pesquisa ou a biblioteca para buscar de forma rápida e incluir novos movimentos na ficha!
              </p>
            </div>
          )}
        </div>

        {/* 4. INSERT CUSTOM MOVEMENT COMPACT TRIGGER */}
        <div className="pt-4 pb-2 shrink-0">
          <button
            type="button"
            onClick={onAddCustomExercise}
            className="w-full py-4 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 hover:border-blue-300 rounded-xl text-xs font-black tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-2 outline-none shadow-sm"
            style={{ minHeight: '52px' }}
          >
            <Plus size={14} className="text-blue-500" />
            <span>Movimento Personalizado</span>
          </button>
        </div>

        {/* FLOATING NATIVE-FEEL BOTTOM SHEET DRAWER (Sliding Panel for editing) */}
        <AnimatePresence>
          {expandedExerciseId && activeExercise && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setExpandedExerciseId(null)}
                className="fixed inset-0 bg-black/50 z-[110] backdrop-blur-[1px]"
              />

              <motion.div
                initial={{ x: '100%', y: 0 }}
                animate={{ x: 0, y: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                className="fixed top-0 right-0 h-full w-full lg:w-[420px] bg-white border-l border-gray-200 z-[120] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto no-scrollbar"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">
                        Ajuste de Cargas & Séries
                      </span>
                      <h3 className="text-base font-black text-gray-900 tracking-tight leading-snug mt-1">
                        {activeExercise.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedExerciseId(null)}
                      className="p-1 px-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 mt-5">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Séries</label>
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                        <input 
                          type="number"
                          min="1"
                          value={activeExercise.sets}
                          onChange={(e) => onUpdateExerciseField(activeExercise.id, 'sets', parseInt(e.target.value) || 1)}
                          className="w-full bg-transparent text-gray-905 text-sm font-bold focus:outline-none p-3 text-center"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Repetições</label>
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                        <input 
                          type="text"
                          value={activeExercise.reps}
                          onChange={(e) => onUpdateExerciseField(activeExercise.id, 'reps', e.target.value)}
                          className="w-full bg-transparent text-gray-905 text-sm font-bold focus:outline-none p-3 text-center"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Descanso (s)</label>
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                        <input 
                          type="number"
                          step="5"
                          min="0"
                          value={activeExercise.rest}
                          onChange={(e) => onUpdateExerciseField(activeExercise.id, 'rest', parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent text-gray-905 text-sm font-bold focus:outline-none p-3 text-center"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Carga (kg)</label>
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                        <input 
                          type="text"
                          value={activeExercise.notes || '0'}
                          onChange={(e) => onUpdateExerciseField(activeExercise.id, 'notes', e.target.value)}
                          className="w-full bg-transparent text-gray-950 text-sm font-bold focus:outline-none p-3 text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-3">
                      Metodologias de Intensidade
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {intensityTags.map((tag) => {
                        const isActive = !!(activeExercise[tag.field]);
                        return (
                          <button
                            key={tag.field}
                            type="button"
                            onClick={() => onUpdateExerciseField(activeExercise.id, tag.field, !isActive)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between text-left ${
                              isActive
                                ? 'bg-blue-55 border-blue-500 text-blue-700'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-500'
                            }`}
                            style={{ minHeight: '44px' }}
                          >
                            <span>{tag.label}</span>
                            {isActive && <Check size={11} className="text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveExercise(activeExercise.id);
                      setExpandedExerciseId(null);
                    }}
                    className="w-full py-3 hover:bg-red-50 text-red-600 border border-dashed border-red-200 transition-colors text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{ minHeight: '44px' }}
                  >
                    <Trash2 size={13} />
                    <span>Excluir do Treino</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedExerciseId(null)}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-blue-105"
                  >
                    Pronto
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>

      {/* ================================================================= */}
      {/* NEW PREMIUM MOBILE WORKSPACE STATION (Linear / Spotify-like style) */}
      {/* ================================================================= */}
      <div className="flex lg:hidden flex-col h-full w-full bg-white text-gray-950 font-sans min-h-0 overflow-y-auto no-scrollbar p-5 pb-24 relative select-none">
        
        {/* 1. SECTOR: ACTIVE STUDENT CARD & IA HORUS CALL */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-150 rounded-2xl p-4.5 mb-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600/10 border border-blue-150 rounded-full flex items-center justify-center text-blue-600 font-black text-sm uppercase">
              {getActiveStudentDisplay().slice(0, 2)}
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Atleta Ativo</span>
              <h2 className="text-sm font-black text-gray-900 truncate max-w-[170px] mt-0.5 leading-tight">
                {getActiveStudentDisplay()}
              </h2>
            </div>
          </div>
          
          {/* AI HORUS PREMIUM GENERATE TRIGGER BUTTON */}
          <button
            type="button"
            onClick={() => setShowIaHorusModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-[11px] font-black uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-md border border-violet-500/30 transition-all active:scale-95 cursor-pointer select-none"
            style={{ minHeight: '38px' }}
          >
            <Sparkles size={11} className="animate-pulse" />
            <span>⚡ IA HORUS</span>
          </button>
        </div>

        {/* 2. SECTOR: ACTIVE FREQUENCY PICKER CAPSULES */}
        <div className="mb-4">
          <label className="text-[9px] uppercase font-black tracking-widest text-gray-400 select-none ml-1">
            Frequência Semanal (Esquema de Divisões)
          </label>
          <div className="grid grid-cols-5 gap-1.5 mt-2 bg-gray-100 p-1 rounded-xl">
            {(['AB', 'ABC', 'ABCD', 'ABCDE'] as const).map(freq => {
              const isSelected = sheetFrequency === freq;
              return (
                <button
                  key={freq}
                  type="button"
                  onClick={() => {
                    if (setSheetFrequency) setSheetFrequency(freq);
                  }}
                  className={`py-2 px-1 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ minHeight: '36px' }}
                >
                  {freq}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. SECTOR: HORIZONTAL SLIDING TRAINING GROUPS TAB BUTTONS [A] [B] [C] [D] [E] */}
        <div className="mb-5 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {Array.from({ length: getFrequencyCount() }).map((_, idx) => {
              const char = String.fromCharCode(65 + idx);
              const isSelected = activeRoutineIdx === idx;
              return (
                <button
                  key={char}
                  type="button"
                  onClick={() => {
                    setActiveRoutineIdx(idx);
                    setExpandedExerciseId(null);
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 border-transparent text-white shadow-lg shadow-blue-100 font-extrabold scale-102'
                      : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800'
                  }`}
                  style={{ minWidth: '56px', minHeight: '52px' }}
                >
                  <span className="text-xs uppercase font-extrabold text-[10px]">Treino</span>
                  <span className="text-lg font-black tracking-tighter mt-0.5 select-none">{char}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. SECTOR: ACTIVE ROUTINE HEADER SUMMARY & FOCUS CONFIG */}
        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 mb-5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider bg-blue-50 border border-blue-105 px-2.5 py-1 rounded-lg">
              Treino {String.fromCharCode(65 + activeRoutineIdx)}
            </span>
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
              {exercises.length} Movimento{exercises.length !== 1 ? 's' : ''} • {totalSets} Séries
            </span>
          </div>
          
          <input 
            type="text"
            value={activeRoutine?.title || ''}
            onChange={(e) => onUpdateRoutineTitle(e.target.value)}
            placeholder="Focus: Peito, Ombros e Tríceps..."
            className="w-full bg-white border border-gray-200 focus:border-blue-500 py-3 px-3 rounded-xl text-xs font-black text-gray-900 outline-none transition-all placeholder:text-gray-400 shadow-sm"
          />
        </div>

        {/* 5. SECTOR: HYPER-CLEAN COMPACT EXERCISES LIST */}
        <div className="mt-2 space-y-2">
          {exercises.map((ex, idx) => {
            const indexStr = String(idx + 1).padStart(2, '0');
            const hasIntensity = ex.dropSet || ex.restPause || ex.biSet || ex.cluster || ex.isometria || ex.falha;

            return (
              <div 
                key={ex.id}
                onClick={() => setExpandedExerciseId(ex.id)}
                className="flex items-center justify-between p-3.5 bg-white border border-gray-200 hover:border-blue-300 rounded-xl cursor-pointer transition-all shadow-sm active:bg-gray-50 text-left"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <span className="text-sm font-mono text-gray-400 font-extrabold shrink-0 w-5 text-center">
                    {indexStr}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-black text-gray-950 block truncate leading-tight">
                      {ex.name}
                    </span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] font-bold text-gray-500 tracking-wide">
                      <span className="text-blue-600 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded-md">
                        {ex.sets}x{ex.reps}
                      </span>
                      <span>•</span>
                      <span>{ex.rest}s Rec.</span>
                      {parseFloat(ex.notes || '') > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-gray-800 bg-gray-100 px-1.5 rounded-md border border-gray-200 font-black">
                            {ex.notes}kg
                          </span>
                        </>
                      )}
                      
                      {hasIntensity && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider shrink-0 font-sans">
                            {[
                              ex.dropSet && 'Drop',
                              ex.restPause && 'Pause',
                              ex.biSet && 'Bi-set',
                              ex.cluster && 'Cluster',
                              ex.isometria && 'Isom',
                              ex.falha && 'Falha'
                            ].filter(Boolean).slice(0, 2).join('•')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compact Delete trigger on line item directly to speed up edits */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveExercise(ex.id);
                    }}
                    className="p-2.5 text-gray-400 hover:text-red-500 active:bg-red-50 rounded-lg transition-all"
                    style={{ minWidth: '40px', minHeight: '40px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {exercises.length === 0 && (
            <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center bg-gray-50/50">
              <Sparkles size={20} className="text-blue-500 mb-2" />
              <p className="text-xs font-black text-gray-700">Comece a preencher o Treino {String.fromCharCode(65 + activeRoutineIdx)}</p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-xs leading-relaxed">
                Adicione exercícios manualmente, configure blocos de metodologias prontas ou clique em ⚡ IA HORUS para criar uma planilha completa de A a E.
              </p>
            </div>
          )}
        </div>

        {/* 6. FIXED BOTTOM SHE ACTION RODAPÉ BAR (ASSET NOTION-LIKE FOOTER STRIP) */}
        <div className="fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-md bg-white/90 border-t border-gray-200/90 py-3.5 px-5 flex items-center justify-between gap-1.5 select-none shadow-xl safe-bottom">
          <button
            type="button"
            onClick={() => {
              setLocalSearchQuery('');
              setLocalMuscleFilter('Todos');
              setShowAddExModal(true);
            }}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest rounded-xl text-center active:scale-95 transition-all shadow-md shadow-blue-105 cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            + Exercício
          </button>
          
          <button
            type="button"
            onClick={() => setShowBlocoModal(true)}
            className="flex-1 py-3 bg-gray-950 hover:bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl text-center active:scale-95 transition-all cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            + Bloco
          </button>

          <button
            type="button"
            onClick={() => setShowClonarModal(true)}
            className="flex-1 py-3 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 text-[11px] font-black uppercase tracking-widest rounded-xl text-center active:scale-95 transition-all cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Clonar
          </button>

          <button
            type="button"
            onClick={() => {
              confetti({
                particleCount: 80,
                spread: 50,
                origin: { y: 0.95 }
              });
            }}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white text-[11px] font-black uppercase tracking-widest rounded-xl text-center active:scale-95 transition-all cursor-pointer shadow-md shadow-green-105"
            style={{ minHeight: '44px' }}
          >
            Salvar
          </button>
        </div>

        {/* ================================================================= */}
        {/* MOBILE DIALOG MODAL: NATIVE-FEEL ADD EXERCISE FULLSCREEN MODAL */}
        {/* ================================================================= */}
        <AnimatePresence>
          {showAddExModal && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-0 bg-white z-[200] flex flex-col p-5 overflow-hidden font-sans select-none"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
                <div>
                  <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider">Adicionar à Ficha</span>
                  <h3 className="text-base font-black text-gray-950 leading-tight">Biblioteca de Exercícios</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddExModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Large Search bar */}
              <div className="relative mt-4 shrink-0">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar exercício pelo nome..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 py-3.5 pl-10 pr-4 rounded-xl text-sm font-bold text-gray-950 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                  style={{ minHeight: '48px' }}
                />
              </div>

              {/* Muscle Filters slide buttons */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-3 select-none shrink-0">
                {['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços'].map(muscle => {
                  const isSelected = localMuscleFilter === muscle;
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => setLocalMuscleFilter(muscle)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 ${
                        isSelected 
                          ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-105' 
                          : 'bg-gray-100 text-gray-400 hover:text-gray-700'
                      }`}
                      style={{ minHeight: '38px' }}
                    >
                      {muscle}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic scrollable Results List */}
              <div className="flex-grow overflow-y-auto no-scrollbar py-2 space-y-2 pb-12">
                {modalFilteredSuggestions.map((baseEx, bIdx) => {
                  const gifUrl = getHorusGifUrl(baseEx.name);
                  return (
                    <div
                      key={bIdx}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        {/* Smooth loading high-contrast Horus animated GIF thumbnail */}
                        <div className="w-14 h-14 bg-gray-50 border border-gray-150 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={gifUrl}
                            alt={baseEx.name}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If broken image, fall back to safe clean template placeholder
                              e.currentTarget.src = 'https://picsum.photos/seed/gym/100/100';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-black text-gray-950 block truncate leading-tight">
                            {baseEx.name}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">
                            {baseEx.muscleGroup}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onAddExercise(baseEx);
                          // Mini celebration Confetti pop!
                          confetti({
                            particleCount: 15,
                            spread: 30,
                            origin: { x: 0.8, y: 0.6 }
                          });
                        }}
                        className="py-2 px-3.5 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-transparent text-blue-600 text-xs font-black uppercase rounded-lg active:scale-95 transition-all shrink-0 cursor-pointer"
                        style={{ minHeight: '34px' }}
                      >
                        + Adicionar
                      </button>
                    </div>
                  );
                })}

                {modalFilteredSuggestions.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-12">Nenhum exercício encontrado</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* MOBILE DIALOG MODAL: BLOCOS PRONTOS IMPORT DIALOG */}
        {/* ================================================================= */}
        <AnimatePresence>
          {showBlocoModal && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-5 font-sans"
            >
              <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col p-5 shadow-2xl relative">
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 shrink-0">
                  <h3 className="text-base font-black text-gray-950">Blocos de Metodologia Prontos</h3>
                  <button
                    type="button"
                    onClick={() => setShowBlocoModal(false)}
                    className="p-1 px-1.5 text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto no-scrollbar py-3.5 space-y-3">
                  {blockPresets.map(preset => (
                    <div
                      key={preset.name}
                      className="border border-gray-200 hover:border-blue-400 rounded-xl p-3.5 bg-white shadow-sm flex flex-col justify-between gap-3 text-left transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-gray-900 leading-tight">{preset.name}</span>
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {preset.count} ex
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed mt-1.5">{preset.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLoadBloco(preset)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        Carregar Bloco
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* MOBILE DIALOG MODAL: CLONE OPTIONS POPUP */}
        {/* ================================================================= */}
        <AnimatePresence>
          {showClonarModal && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-5 font-sans"
            >
              <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden p-5 shadow-2xl relative text-left">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-base font-black text-gray-950">Estações de Clonagem</h3>
                  <button
                    type="button"
                    onClick={() => setShowClonarModal(false)}
                    className="p-1 px-1.5 text-gray-400 bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="py-4 space-y-2.5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block pl-1">Mesmo Aluno (Diferentes Slots)</p>
                  <div className="grid grid-cols-2 gap-2 pb-2">
                    {Array.from({ length: getFrequencyCount() }).map((_, idx) => {
                      if (idx === activeRoutineIdx) return null;
                      const char = String.fromCharCode(65 + idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (onCloneRoutine) onCloneRoutine(idx);
                            setShowClonarModal(false);
                          }}
                          className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-400 text-xs font-bold text-gray-700 text-center transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Copy size={11} className="text-gray-400" />
                          <span>Slot {char}</span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block pl-1">Outro Aluno do Banco</p>
                  <div className="max-h-[140px] overflow-y-auto no-scrollbar space-y-1.5">
                    {students.map((st) => (
                      <button
                        key={st.username}
                        type="button"
                        onClick={() => {
                          if (onCloneFromOtherStudent) onCloneFromOtherStudent(st.username);
                          setShowClonarModal(false);
                        }}
                        className="w-full text-left text-xs px-3.5 py-3 rounded-xl bg-gray-50 border border-gray-150 hover:bg-blue-50/20 hover:border-blue-300 transition-colors cursor-pointer text-gray-700 flex items-center gap-2 font-bold"
                      >
                        <User size={11} className="text-gray-400" />
                        <span>{st.name}</span>
                      </button>
                    ))}
                    {students.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">Nenhum aluno cadastrado</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* MOBILE DIALOG MODAL: PREMIUM AI GENERATOR - IA HORUS */}
        {/* ================================================================= */}
        <AnimatePresence>
          {showIaHorusModal && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 210 }}
              className="fixed inset-0 bg-gray-950 text-white z-[300] flex flex-col p-6 overflow-hidden select-none font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-violet-600/30 border border-violet-500/20 text-violet-400 rounded-lg">
                    <Brain size={18} className="animate-pulse" />
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-black text-violet-400 tracking-widest block">HORUS 2.0 Premium AI</span>
                    <h3 className="text-base font-black text-white tracking-tight leading-none mt-1">Concepção com Inteligência Artificial</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIaHorusModal(false)}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main IA Configured Questionnaire Screen */}
              {!iaGenerating ? (
                <div className="flex-grow overflow-y-auto no-scrollbar space-y-5 py-5 pb-8">
                  
                  {/* Objetivo picker */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Qual o objetivo do treino?</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'hipertrofia', label: 'Hipertrofia' },
                        { id: 'definicao', label: 'Definição/Estética' },
                        { id: 'condicionamento', label: 'Condicionamento' },
                        { id: 'forca', label: 'Força Máxima' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIaObjetivo(opt.id as any)}
                          className={`py-3 px-3.5 text-xs font-bold border rounded-xl text-center cursor-pointer transition-all ${
                            iaObjetivo === opt.id
                              ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-800/30 font-black'
                              : 'bg-white/5 border-white/10 text-gray-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sexo picker */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Gênero / Sexo do Atleta</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'masculino', label: 'Masculino' },
                        { id: 'feminino', label: 'Feminino' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIaSexo(opt.id as any)}
                          className={`py-2.5 px-3.5 text-xs font-bold border rounded-xl text-center cursor-pointer transition-all ${
                            iaSexo === opt.id
                              ? 'bg-violet-600 border-violet-500 text-white font-black'
                              : 'bg-white/5 border-white/10 text-gray-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nivel picker */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Nível de Treinamento</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'iniciante', label: 'Iniciante' },
                        { id: 'intermediario', label: 'Intermediário' },
                        { id: 'avancado', label: 'Avançado' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIaNivel(opt.id as any)}
                          className={`py-2.5 px-1.5 text-[11px] font-bold border rounded-xl text-center cursor-pointer transition-all ${
                            iaNivel === opt.id
                              ? 'bg-violet-600 border-violet-500 text-white font-black'
                              : 'bg-white/5 border-white/10 text-gray-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dias por Semana Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Quantos dias na semana?</span>
                      <span className="text-medium text-xs font-bold text-violet-400 bg-violet-600/15 border border-violet-550/20 px-2 py-0.5 rounded-lg">
                        {iaDias === 2 ? '2 Dias (AB)' : (iaDias === 3 ? '3 Dias (ABC)' : (iaDias === 4 ? '4 Dias (ABCD)' : '5 Dias (ABCDE)'))}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                      {[2, 3, 4, 5].map(day => {
                        const isSelected = iaDias === day;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setIaDias(day)}
                            className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-violet-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {day}X
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Restrições Médicas */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Alguma restrição ou patologia?</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'nenhuma', label: 'Nenhuma' },
                        { id: 'joelho', label: 'Evitar Joelhos (Condromalácia)' },
                        { id: 'lombar', label: 'Evitar Lombar (Protusão/Hérnia)' },
                        { id: 'ombro', label: 'Evitar Ombros (Impacto/Ruptura)' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIaRestricao(opt.id as any)}
                          className={`py-3 px-3.5 text-[11px] font-bold border rounded-xl text-center cursor-pointer transition-all ${
                            iaRestricao === opt.id
                              ? 'bg-violet-600 border-violet-500 text-white font-black'
                              : 'bg-white/5 border-white/10 text-gray-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipamentos disponíveis */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Equipamentos Disponíveis</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'completo', label: 'Academia Completa' },
                        { id: 'halteres', label: 'Apenas Halteres' },
                        { id: 'cabos', label: 'Apenas Cabos' },
                        { id: 'peso_corporal', label: 'Peso Corporal / Calistenia' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIaEquipamento(opt.id as any)}
                          className={`py-3 px-3.5 text-[11px] font-bold border rounded-xl text-center cursor-pointer transition-all ${
                            iaEquipamento === opt.id
                              ? 'bg-violet-600 border-violet-500 text-white font-black'
                              : 'bg-white/5 border-white/10 text-gray-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trigger Action */}
                  <div className="pt-4 shrink-0">
                    <button
                      type="button"
                      onClick={executeIaGeneration}
                      className="w-full py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white text-xs font-black tracking-widest uppercase rounded-2xl active:scale-95 transition-all shadow-xl shadow-violet-900/30 cursor-pointer flex items-center justify-center gap-2"
                      style={{ minHeight: '52px' }}
                    >
                      <Wand2 size={14} className="animate-spin" />
                      <span>Gerar Treino Completo</span>
                    </button>
                  </div>

                </div>
              ) : (
                /* Generating loading screen showing high-tech scans */
                <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-violet-600 border-t-white/10 animate-spin flex items-center justify-center" />
                    <div className="absolute inset-0 flex items-center justify-center text-violet-400">
                      <Sparkles size={24} className="animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-xs select-none">
                    <h4 className="text-sm font-black text-white tracking-widest uppercase animate-pulse">Sincronizando Inteligência...</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-semibold transition-all">
                      {iaStepsText[iaStep]}
                    </p>
                  </div>
                  
                  {/* Small incremental terminal logs for high-fidelity look */}
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-mono text-[9px] text-gray-500 text-left space-y-1 select-none">
                    <div>$ horus-ai-compiler --student={selectedStudentUsername || 'teste1'}</div>
                    {iaStep >= 1 && <div className="text-violet-400">[SUCCESS] Restrições clínicas injetadas: {iaRestricao.toUpperCase()}</div>}
                    {iaStep >= 3 && <div className="text-indigo-400">[COMPILED] Slots {iaDias} divisões criadas com sucesso</div>}
                    {iaStep >= 4 && <div className="text-green-400">[LOADED] Acionados tempos de repouso & {iaNivel} intensity_tags</div>}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* MOBILE BOTTOM DRAWER: FLOATING EDIT EXERCISE DETAIL PANEL */}
        {/* ================================================================= */}
        <AnimatePresence>
          {expandedExerciseId && activeExercise && (
            <>
              {/* Backing Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setExpandedExerciseId(null)}
                className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-[2px]"
              />

              {/* Native iOS-like sliding exercise configuration sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-3xl border-t border-gray-150 z-[210] p-6 flex flex-col justify-between overflow-y-auto no-scrollbar font-sans select-none text-left"
              >
                <div>
                  {/* Drag indicators */}
                  <div className="w-12 h-1 bg-gray-250 rounded-full mx-auto mb-4 shrink-0" />

                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 block">Especificações Ativas</span>
                      <h3 className="text-base font-black text-gray-900 leading-tight mt-0.5">{activeExercise.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedExerciseId(null)}
                      className="p-1 px-1.5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-xl transition-all"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Large high-performance Horus Gym Workout GIF display */}
                  <div className="w-full h-44 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden mt-4 shrink-0 relative">
                    <img
                      src={getHorusGifUrl(activeExercise.name)}
                      alt={activeExercise.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://picsum.photos/seed/gym/400/300';
                      }}
                    />
                  </div>

                  {/* Sets, Reps, Rest, Carga inputs Grid */}
                  <div className="grid grid-cols-2 gap-3.5 mt-5">
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider pl-0.5">Séries</span>
                      <input
                        type="number"
                        min="1"
                        value={activeExercise.sets}
                        onChange={(e) => onUpdateExerciseField(activeExercise.id, 'sets', parseInt(e.target.value) || 1)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl p-3.5 text-center text-sm font-black text-gray-900 shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider pl-0.5">Repetições</span>
                      <input
                        type="text"
                        value={activeExercise.reps}
                        onChange={(e) => onUpdateExerciseField(activeExercise.id, 'reps', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl p-3.5 text-center text-sm font-black text-gray-900 shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider pl-0.5">Descanso (s)</span>
                      <input
                        type="number"
                        step="5"
                        min="0"
                        value={activeExercise.rest}
                        onChange={(e) => onUpdateExerciseField(activeExercise.id, 'rest', parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl p-3.5 text-center text-sm font-black text-gray-900 shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider pl-0.5">Carga (kg)</span>
                      <input
                        type="text"
                        value={activeExercise.notes || '0'}
                        onChange={(e) => onUpdateExerciseField(activeExercise.id, 'notes', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl p-3.5 text-center text-sm font-bold text-gray-900 shadow-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Advanced methodologies switches */}
                  <div className="mt-5">
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-2.5">Metodologias de Força</span>
                    <div className="grid grid-cols-2 gap-2">
                      {intensityTags.map(tag => {
                        const isActive = !!(activeExercise[tag.field]);
                        return (
                          <button
                            key={tag.field}
                            type="button"
                            onClick={() => onUpdateExerciseField(activeExercise.id, tag.field, !isActive)}
                            className={`py-3 px-3.5 rounded-xl border transition-all text-xs font-black flex items-center justify-between text-left cursor-pointer ${
                              isActive
                                ? 'bg-blue-50 border-blue-600 text-blue-700'
                                : 'bg-gray-50 border-gray-200 text-gray-400'
                            }`}
                          >
                            <span>{tag.label}</span>
                            {isActive && <Check size={12} className="text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Footer Action buttons */}
                <div className="pt-6 border-t border-gray-100 space-y-2.5 mt-6 shrink-0 select-none">
                  <div className="flex gap-2">
                    {/* Delete action */}
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveExercise(activeExercise.id);
                        setExpandedExerciseId(null);
                      }}
                      className="flex-1 py-3 hover:bg-red-50 text-red-650 border border-dashed border-red-200 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      style={{ minHeight: '44px' }}
                    >
                      <Trash2 size={13} />
                      <span>Excluir</span>
                    </button>

                    {/* Duplicate exercise action */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...localRoutines];
                        const routine = { ...updated[activeRoutineIdx] };
                        if (routine) {
                          const duplicateEx: Exercise = {
                            ...activeExercise,
                            id: `ex_${Math.random().toString(36).substring(2, 9)}`
                          };
                          routine.exercises = [...(routine.exercises || []), duplicateEx];
                          updated[activeRoutineIdx] = routine;
                          if (onReorderExercises) {
                            onReorderExercises(routine.exercises);
                          }
                          setExpandedExerciseId(null);
                          confetti({
                            particleCount: 15,
                            spread: 20,
                            origin: { y: 0.9 }
                          });
                        }
                      }}
                      className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      style={{ minHeight: '44px' }}
                    >
                      <Copy size={13} />
                      <span>Duplicar</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedExerciseId(null)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-blue-105"
                  >
                    Confirmar Alterações
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};
