import React, { useState } from 'react';
import { 
  Copy, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  ChevronRight, 
  Layers,
  Sparkles
} from 'lucide-react';
import { WorkoutRoutine, Exercise } from '../../types';
import { ExerciseCard } from './ExerciseCard';
import { ExercisePickerModal, PickerItem } from './ExercisePickerModal';
import { getHorusGifUrl } from '../../src/utils/exerciseUtils';
import { useStore } from '../../store';

interface KanbanBoardProps {
  studentName: string;
  studentUsername: string;
  division: 'AB' | 'ABC' | 'ABCD' | 'ABCDE';
  setDivision: (div: 'AB' | 'ABC' | 'ABCD' | 'ABCDE') => void;
  routines: WorkoutRoutine[];
  onUpdateRoutines: (updatedRoutines: WorkoutRoutine[]) => void;
  onSave: () => void;
  isUnsaved: boolean;
  onGoBack: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  studentName,
  studentUsername,
  division,
  setDivision,
  routines,
  onUpdateRoutines,
  isUnsaved,
  onSave,
  onGoBack
}) => {
  const { addToast } = useStore();

  // Handle active exercise picker target column
  const [pickerColumn, setPickerColumn] = useState<{ id: string; title: string } | null>(null);

  // Toggle state to edit division
  const [showDivisionMenu, setShowDivisionMenu] = useState(false);

  // Duplicate target selection state
  const [duplicateSourceId, setDuplicateSourceId] = useState<string | null>(null);

  // Active limit count based on active division selection
  const getDivisionLimit = (): number => {
    switch (division) {
      case 'AB': return 2;
      case 'ABC': return 3;
      case 'ABCD': return 4;
      case 'ABCDE': return 5;
      default: return 3;
    }
  };

  const limitCount = getDivisionLimit();
  const activeRoutines = routines.slice(0, limitCount);

  // Move exercise up or down in routine array logic
  const moveExercise = (routineId: string, exId: string, direction: 'up' | 'down') => {
    const updated = routines.map((r) => {
      if (r.id === routineId) {
        const idx = r.exercises.findIndex(e => e.id === exId);
        if (idx === -1) return r;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= r.exercises.length) return r;
        
        const newExercises = [...r.exercises];
        const [moved] = newExercises.splice(idx, 1);
        newExercises.splice(targetIdx, 0, moved);
        return {
          ...r,
          exercises: newExercises
        };
      }
      return r;
    });
    onUpdateRoutines(updated);
  };

  // Modify focus description input
  const handleUpdateFocus = (routineId: string, newTitle: string) => {
    const updated = routines.map((r) => {
      if (r.id === routineId) {
        return { ...r, title: newTitle };
      }
      return r;
    });
    onUpdateRoutines(updated);
  };

  // Modify specific exercise configs
  const handleUpdateExercise = (routineId: string, exId: string, updates: Partial<Exercise>) => {
    const updated = routines.map((r) => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: r.exercises.map(ex => ex.id === exId ? { ...ex, ...updates } : ex)
        };
      }
      return r;
    });
    onUpdateRoutines(updated);
  };

  // Remove exercise from column
  const handleRemoveExercise = (routineId: string, exId: string) => {
    const updated = routines.map((r) => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: r.exercises.filter(ex => ex.id !== exId)
        };
      }
      return r;
    });
    onUpdateRoutines(updated);
  };

  // Clear all exercises on specific column channel
  const handleClearColumn = (routineId: string, routineTitle: string) => {
    if (!window.confirm(`Tem certeza que deseja limpar todos os exercícios do ${routineTitle}?`)) return;
    
    const updated = routines.map((r) => {
      if (r.id === routineId) {
        return {
          ...r,
          exercises: []
        };
      }
      return r;
    });
    onUpdateRoutines(updated);
    if (addToast) addToast(`Exercícios do ${routineTitle} removidos.`, 'success');
  };

  // Duplicate Source Routine exercises into target destination routine
  const handleCopyColumn = (sourceId: string, targetId: string) => {
    const sourceRoutine = routines.find(r => r.id === sourceId);
    if (!sourceRoutine) return;

    const sourceLabel = sourceRoutine.title || 'Treino Original';
    const targetRoutine = routines.find(r => r.id === targetId);
    const targetLabel = targetRoutine?.title || 'Treino Destino';

    if (!window.confirm(`Deseja clonar os exercícios de "${sourceLabel}" substituindo totalmente o conteúdo de "${targetLabel}"?`)) return;

    const clonedExercises = sourceRoutine.exercises.map(ex => ({
      ...ex,
      id: `ex_${Math.random().toString(36).substring(2, 9)}` // generate brand new IDs
    }));

    const updated = routines.map((r) => {
      if (r.id === targetId) {
        return {
          ...r,
          exercises: clonedExercises
        };
      }
      return r;
    });

    onUpdateRoutines(updated);
    setDuplicateSourceId(null);
    if (addToast) addToast(`Treino clonado com sucesso para ${targetLabel}! 💪`, 'success');
  };

  // Confirm Adding from Multi-Selector Modal
  const handleConfirmPicker = (selectedPickerItems: PickerItem[]) => {
    if (!pickerColumn) return;

    const newExs = selectedPickerItems.map(item => ({
      id: `ex_${Math.random().toString(36).substring(2, 9)}`,
      name: item.name,
      muscleGroup: item.muscle,
      sets: 3,
      reps: '12',
      rest: 60,
      notes: '',
      image: getHorusGifUrl(item.name)
    }));

    const updated = routines.map((r) => {
      if (r.id === pickerColumn.id) {
        return {
          ...r,
          exercises: [...(r.exercises || []), ...newExs]
        };
      }
      return r;
    });

    onUpdateRoutines(updated);
    const colName = pickerColumn.title;
    setPickerColumn(null);

    if (addToast) {
      addToast(`${newExs.length} exercícios adicionados ao ${colName} 💪`, 'success');
    }
  };

  // Flow creation of a brand new Workout Routine column (adds division slot)
  const handleAddNewColumnSlot = () => {
    let nextDiv: 'AB' | 'ABC' | 'ABCD' | 'ABCDE' | null = null;
    if (division === 'AB') nextDiv = 'ABC';
    else if (division === 'ABC') nextDiv = 'ABCD';
    else if (division === 'ABCD') nextDiv = 'ABCDE';

    if (nextDiv) {
      setDivision(nextDiv);
      if (addToast) addToast(`Nova coluna criada! Estrutura alterada para ${nextDiv}.`, 'success');
    } else {
      if (addToast) addToast('O limite máximo é de 5 divisões (De A a E).', 'error');
    }
  };

  return (
    <div id="desktop-kanban-dashboard" className="flex flex-col flex-grow h-full bg-[#F1F5F9] min-h-0 select-none">
      
      {/* 2.1 FIXED TOP NAVIGATION BAR FOR PAINEL ACTIONS */}
      <header className="bg-white px-6 py-4 border-b border-gray-150 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onGoBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all border border-gray-150"
          >
            <ArrowLeft size={13} />
            <span>Voltar Alunos</span>
          </button>

          <div className="flex items-center gap-1.5 bg-blue-50/50 text-blue-700 px-3.5 py-1.5 rounded-full border border-blue-100/50">
            <span className="text-[10px] font-black tracking-widest uppercase">Aluno Ativo</span>
            <span className="text-xs font-extrabold">{studentName}</span>
          </div>

          {/* Division drop triggers */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDivisionMenu(!showDivisionMenu)}
              className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 font-black uppercase bg-gray-100/60 hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-200 transition-colors"
            >
              <Layers size={12} />
              <span>Divisões: {division}</span>
              <span className="text-[9px] text-blue-600 font-extrabold bg-blue-50/80 px-1.5 py-0.5 rounded">
                Alterar
              </span>
            </button>

            {showDivisionMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDivisionMenu(false)} />
                <div className="absolute top-full mt-1.5 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-1 min-w-[130px]">
                  {(['AB', 'ABC', 'ABCD', 'ABCDE'] as const).map((div) => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => {
                        setDivision(div);
                        setShowDivisionMenu(false);
                      }}
                      className={`text-left px-3 py-2 text-xs font-black rounded-lg transition-colors ${
                        division === div 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Esquema {div}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Saved status and global saving action trigger button */}
        <div className="flex items-center gap-4 select-none">
          {isUnsaved ? (
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>● ALTERAÇÕES PENDENTES</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>● SALVO NA NUVEM</span>
            </span>
          )}

          <button
            type="button"
            onClick={onSave}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isUnsaved 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 hover:scale-[1.02] cursor-pointer' 
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
          >
            Salvar Ficha ✓
          </button>
        </div>
      </header>

      {/* 2.2 HORIZONTAL COLUMNS GRID WRAPPER */}
      <div 
        id="kanban-scrollable-area" 
        className="flex-grow overflow-x-auto overflow-y-hidden p-6 flex items-start gap-4 h-full scrollbar-thin select-none"
      >
        {activeRoutines.map((routine, posIdx) => {
          const exercisesCount = routine.exercises?.length || 0;
          const totalSets = routine.exercises?.reduce((sum, ex) => sum + (ex.sets || 3), 0) || 0;
          const colLetter = String.fromCharCode(65 + posIdx);

          // Build duplicates lists
          const availableDuplicates = activeRoutines.filter(r => r.id !== routine.id);

          return (
            <div 
              key={routine.id}
              className="w-72 max-h-[75dvh] bg-white rounded-2xl border border-gray-150 shadow-sm shrink-0 flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow relative"
            >
              {/* Header column container */}
              <div className="p-4 pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">
                      TREINO {colLetter}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 select-none">
                      <span className="bg-gray-100 text-gray-500 font-extrabold text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded">
                        {exercisesCount} movs
                      </span>
                      <span className="bg-blue-50 text-blue-600 font-extrabold text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded">
                        {totalSets} séries
                      </span>
                    </div>
                  </div>

                  {/* Actions copy / duplicate */}
                  <div className="flex items-center gap-1 select-none">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDuplicateSourceId(duplicateSourceId === routine.id ? null : routine.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Duplicar treino"
                      >
                        <Copy size={13} />
                      </button>

                      {duplicateSourceId === routine.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setDuplicateSourceId(null)} />
                          <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 flex flex-col gap-1 min-w-[155px]">
                            <span className="text-[8px] font-black uppercase text-gray-400 p-1 tracking-wider block">
                              Clonar para qual?
                            </span>
                            {availableDuplicates.map(r => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => handleCopyColumn(routine.id, r.id)}
                                className="text-left px-2.5 py-1.5 text-[10px] grid grid-cols-5 font-bold hover:bg-gray-50 rounded-lg text-gray-700"
                              >
                                <span className="col-span-4 truncate">{r.title || 'Treino s/ Nome'}</span>
                                <span className="col-span-1 text-right text-blue-600 font-black">→</span>
                              </button>
                            ))}
                            {availableDuplicates.length === 0 && (
                              <span className="text-[10px] text-gray-400 italic p-1">Nenhum outro treino</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClearColumn(routine.id, `Treino ${colLetter}`)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Limpar coluna"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Editable focus text input */}
                <div className="mt-2.5 select-none text-[10px]">
                  <input
                    type="text"
                    placeholder={`Foco: Peito, Ombro e Tríceps...`}
                    value={routine.title || ''}
                    onChange={(e) => handleUpdateFocus(routine.id, e.target.value)}
                    className="w-full bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 focus:border-blue-400 focus:bg-white text-[11px] font-bold text-gray-800 px-2.5 py-1.5 rounded-lg outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Scrollable exercise items vertical list */}
              <div className="flex-grow overflow-y-auto p-3.5 space-y-2 bg-gray-50/30 scrollbar-thin">
                {routine.exercises?.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    onUpdate={(exId, updates) => handleUpdateExercise(routine.id, exId, updates)}
                    onRemove={(exId) => handleRemoveExercise(routine.id, exId)}
                    onMoveUp={index > 0 ? () => moveExercise(routine.id, exercise.id, 'up') : undefined}
                    onMoveDown={index < exercisesCount - 1 ? () => moveExercise(routine.id, exercise.id, 'down') : undefined}
                  />
                ))}

                {exercisesCount === 0 && (
                  <div className="py-14 px-4 text-center border border-dashed border-gray-200 rounded-xl bg-white select-none">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                      Sem Movimentos
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickerColumn({ id: routine.id, title: `Treino ${colLetter}` })}
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black tracking-widest uppercase"
                    >
                      + Escolher
                    </button>
                  </div>
                )}
              </div>

              {/* Add exercise trigger footer button inside column baseline */}
              <div className="p-3 border-t border-gray-100 bg-white sticky bottom-0 z-10 shrink-0">
                <button
                  type="button"
                  onClick={() => setPickerColumn({ id: routine.id, title: `Treino ${colLetter}` })}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Plus size={12} />
                  <span>Incluir Exercícios</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Lime green create extra column trigger floting item */}
        {limitCount < 5 && (
          <button
            type="button"
            onClick={handleAddNewColumnSlot}
            className="w-64 h-[220px] bg-white border-2 border-dashed border-lime-300 hover:border-lime-500 hover:bg-lime-50/10 rounded-2xl shrink-0 flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="w-12 h-12 bg-lime-50 text-[#84CC16] rounded-full flex items-center justify-center mb-3 border border-lime-150">
              <Plus size={20} />
            </div>
            <span className="text-[#84CC16] font-black uppercase text-xs tracking-wider block">
              + Criar Treino
            </span>
            <span className="text-gray-400 text-[10px] font-semibold mt-1 block">
              Adiciona Coluna {String.fromCharCode(65 + limitCount)} ao Kanban
            </span>
          </button>
        )}
      </div>

      {/* Multi selection modal picker portal */}
      <ExercisePickerModal
        isOpen={!!pickerColumn}
        onClose={() => setPickerColumn(null)}
        columnTitle={pickerColumn?.title || ''}
        onConfirm={handleConfirmPicker}
      />
    </div>
  );
};
