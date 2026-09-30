import React, { useState } from 'react';
import { 
  Trash2, Sliders, ArrowUp, ArrowDown, Sparkles, Copy, 
  Trash, ChevronDown, Check, Edit2, AlertCircle, Plus 
} from 'lucide-react';
import { WorkoutRoutine, Exercise, User as StudentUser } from '../../types';
import { getHorusGifUrl } from '../../src/utils/exerciseUtils';

interface WorkoutSlotPanelProps {
  studentName: string;
  studentUsername: string;
  division: 'AB' | 'ABC' | 'ABCD' | 'ABCDE';
  setDivision: (div: 'AB' | 'ABC' | 'ABCD' | 'ABCDE') => void;
  routines: WorkoutRoutine[];
  onUpdateRoutines: (updated: WorkoutRoutine[]) => void;
  onGoBack: () => void;
  students: StudentUser[];
  onSave: () => void;
  isUnsaved: boolean;
  activeIdx: number;
  setActiveIdx: (idx: number) => void;
}

export const WorkoutSlotPanel: React.FC<WorkoutSlotPanelProps> = ({
  studentName,
  studentUsername,
  division,
  setDivision,
  routines,
  onUpdateRoutines,
  onGoBack,
  students,
  onSave,
  isUnsaved,
  activeIdx,
  setActiveIdx
}) => {
  // Changing division selection state
  const [isEditingDivision, setIsEditingDivision] = useState(false);
  
  // Track which exercise is active for sliders config inline popover
  const [configuredExId, setConfiguredExId] = useState<string | null>(null);

  // Quick Action menu flags
  const [showCloneMenu, setShowCloneMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);

  // Derive active routine and active exercises list safely
  const limitCount = (): number => {
    switch (division) {
      case 'AB': return 2;
      case 'ABC': return 3;
      case 'ABCD': return 4;
      case 'ABCDE': return 5;
      default: return 3;
    }
  };

  const slotsCount = limitCount();
  const currentSlotRoutine = routines[activeIdx] || {
    id: `routine_${activeIdx}`,
    title: `Treino ${String.fromCharCode(65 + activeIdx)}`,
    description: '',
    exercises: [],
    color: 'blue'
  };

  const exercisesList = currentSlotRoutine.exercises || [];

  // Estimated stats
  const totalSets = exercisesList.reduce((acc, curr) => acc + (curr.sets || 0), 0);
  
  const estimatedVolume = exercisesList.reduce((acc, curr) => {
    const weightMatch = String(curr.notes || '0').match(/\d+/);
    const weight = weightMatch ? parseFloat(weightMatch[0]) : 0;
    const repsMatch = String(curr.reps || '12').match(/\d+/);
    const reps = repsMatch ? parseInt(repsMatch[0]) : 12;
    return acc + (curr.sets || 0) * reps * (weight || 1);
  }, 0);

  // Modify exercise fields in current routine slot inline
  const updateExercise = (exId: string, updates: Partial<Exercise>) => {
    const updatedRoutines = routines.map((r, rIdx) => {
      if (rIdx === activeIdx) {
        return {
          ...r,
          exercises: r.exercises.map((ex) => {
            if (ex.id === exId) {
              return { ...ex, ...updates };
            }
            return ex;
          })
        };
      }
      return r;
    });
    onUpdateRoutines(updatedRoutines);
  };

  // Delete exercise from slot
  const removeExercise = (exId: string) => {
    const updatedRoutines = routines.map((r, rIdx) => {
      if (rIdx === activeIdx) {
        return {
          ...r,
          exercises: r.exercises.filter((ex) => ex.id !== exId)
        };
      }
      return r;
    });
    onUpdateRoutines(updatedRoutines);
  };

  // Reorder index up/down inside active slot exercises
  const moveExercise = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === exercisesList.length - 1) return;

    const list = [...exercisesList];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    const updatedRoutines = routines.map((r, rIdx) => {
      if (rIdx === activeIdx) {
        return { ...r, exercises: list };
      }
      return r;
    });
    onUpdateRoutines(updatedRoutines);
  };

  // Update Foco / Title of current slot
  const handleFocoChange = (val: string) => {
    const updatedRoutines = routines.map((r, rIdx) => {
      if (rIdx === activeIdx) {
        return { ...r, title: val };
      }
      return r;
    });
    onUpdateRoutines(updatedRoutines);
  };

  // Wipe current routine/slot clean
  const clearCurrentSlot = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os exercícios deste slot?')) {
      const updatedRoutines = routines.map((r, rIdx) => {
        if (rIdx === activeIdx) {
          return { ...r, exercises: [] };
        }
        return r;
      });
      onUpdateRoutines(updatedRoutines);
    }
  };

  // Clone structures from another slot to this slot (A to B, etc)
  const cloneFromSlot = (fromIdx: number) => {
    const sourceRoutine = routines[fromIdx];
    if (!sourceRoutine) return;

    const copiedExercises: Exercise[] = (sourceRoutine.exercises || []).map((ex) => ({
      ...ex,
      id: `ex_${Math.random().toString(36).substring(2, 9)}`
    }));

    const updatedRoutines = routines.map((r, rIdx) => {
      if (rIdx === activeIdx) {
        return {
          ...r,
          exercises: copiedExercises,
          title: sourceRoutine.title || r.title
        };
      }
      return r;
    });

    onUpdateRoutines(updatedRoutines);
    setShowCloneMenu(false);
  };

  // Import entire workouts from another student
  const importFromStudent = (sourceUsername: string) => {
    const cachedWorkoutsStr = localStorage.getItem('tatugym_all_workouts');
    if (!cachedWorkoutsStr) return;

    try {
      const all = JSON.parse(cachedWorkoutsStr);
      const studentWorkouts: WorkoutRoutine[] = all[sourceUsername.toLowerCase()] || [];
      if (studentWorkouts.length === 0) {
        alert('Este aluno ainda não possui treinos cadastrados para importação!');
        return;
      }

      const parsedRoutines: WorkoutRoutine[] = Array.from({ length: 5 }).map((_, idx) => {
        const char = String.fromCharCode(65 + idx);
        const sourceRoutine = studentWorkouts[idx];
        return sourceRoutine ? {
          ...sourceRoutine,
          id: `routine_${char}_${Math.random().toString(36).substring(2, 9)}`,
          exercises: (sourceRoutine.exercises || []).map(ex => ({
            ...ex,
            id: `ex_${Math.random().toString(36).substring(2, 9)}`
          }))
        } : {
          id: `routine_${idx}`,
          title: `Treino ${char}`,
          description: '',
          exercises: [],
          color: 'blue'
        };
      });

      onUpdateRoutines(parsedRoutines);
      setShowImportMenu(false);
    } catch (e) {
      // Ignore
    }
  };

  // Preset blocks injector helper
  const injectPresetBlock = (type: 'peito' | 'costas' | 'ombro' | 'quadriceps') => {
    // Standard setups
    let pList: { name: string; mGroup: string }[] = [];
    if (type === 'peito') {
      pList = [
        { name: 'Supino Reto', mGroup: 'Peito' },
        { name: 'Supino Inclinado', mGroup: 'Peito' },
        { name: 'Crucifixo', mGroup: 'Peito' },
        { name: 'Cross Cable', mGroup: 'Peito' }
      ];
    } else if (type === 'costas') {
      pList = [
        { name: 'Puxada Frontal', mGroup: 'Costas' },
        { name: 'Remada Curvada', mGroup: 'Costas' },
        { name: 'Remada Unilateral', mGroup: 'Costas' }
      ];
    } else if (type === 'ombro') {
      pList = [
        { name: 'Desenvolvimento', mGroup: 'Ombros' },
        { name: 'Elevação Lateral', mGroup: 'Ombros' }
      ];
    } else if (type === 'quadriceps') {
      pList = [
        { name: 'Agachamento', mGroup: 'Pernas' },
        { name: 'Leg Press', mGroup: 'Pernas' },
        { name: 'Cadeira Extensora', mGroup: 'Pernas' }
      ];
    }

    const addedExercises: Exercise[] = pList.map((p) => ({
      id: `ex_${Math.random().toString(36).substring(2, 9)}`,
      name: p.name,
      muscleGroup: p.mGroup,
      sets: 3,
      reps: '12',
      rest: 60,
      notes: '15', // 15kg load preset
      image: getHorusGifUrl(p.name)
    }));

    const updatedRoutines = routines.map((r, rIdx) => {
      if (rIdx === activeIdx) {
        return {
          ...r,
          exercises: [...(r.exercises || []), ...addedExercises]
        };
      }
      return r;
    });

    onUpdateRoutines(updatedRoutines);
  };

  // Custom single exercise item adder
  const addCustomExercise = () => {
    const newEx: Exercise = {
      id: `ex_${Math.random().toString(36).substring(2, 9)}`,
      name: 'Exercício Livre',
      muscleGroup: 'Opção do Aluno',
      sets: 3,
      reps: '12',
      rest: 60,
      notes: '10',
      image: getHorusGifUrl('Exercício')
    };

    const updatedRoutines = routines.map((r, rIdx) => {
      if (rIdx === activeIdx) {
        return {
          ...r,
          exercises: [...(r.exercises || []), newEx]
        };
      }
      return r;
    });

    onUpdateRoutines(updatedRoutines);
  };

  return (
    <div id="workout-slot-panel-container" className="flex flex-col h-full bg-white text-sans overflow-hidden">
      
      {/* 1. COMPACT FIXED HEADER */}
      <div id="panel-header" className="p-5 border-b border-gray-100 flex flex-col gap-3.5 shrink-0 bg-white">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">Aluno Ativo:</span>
            <h3 className="text-base font-black text-gray-950 truncate max-w-[200px]">{studentName}</h3>
          </div>

          {/* CLOUDSYNC REALTIME BADGE */}
          <div className="flex items-center gap-3">
            <div 
              id="cloud-status-badge"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] uppercase font-black tracking-wider transition-colors ${
                isUnsaved 
                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isUnsaved ? 'bg-amber-500' : 'bg-green-500 animate-pulse'}`} />
              <span>{isUnsaved ? 'Mudanças não salvas' : 'Salvo na Nuvem'}</span>
            </div>

            <button 
              id="btn-voltar-alunos"
              type="button"
              onClick={onGoBack} 
              className="text-xs font-bold text-gray-400 hover:text-gray-900 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* DIVISION SETTINGS ROW */}
        <div id="division-settings-bar" className="flex items-center gap-2 border-t border-gray-100 pt-3">
          {isEditingDivision ? (
            <div id="division-options" className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full">
              {(['AB', 'ABC', 'ABCD', 'ABCDE'] as const).map((divOption) => (
                <button
                  key={divOption}
                  type="button"
                  onClick={() => {
                    setDivision(divOption);
                    setIsEditingDivision(false);
                    if (activeIdx >= divOption.length) {
                      setActiveIdx(0);
                    }
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-colors ${
                    division === divOption ? 'bg-[#1D4ED8] text-white' : 'text-gray-600 hover:text-gray-950'
                  }`}
                >
                  {divOption}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-gray-400 block uppercase">Divisão:</span>
                <span className="text-sm font-black text-blue-600 uppercase bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md italic">
                  {division.split('').join('/')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingDivision(true)}
                className="text-xs font-black text-blue-600 hover:underline hover:text-blue-800"
              >
                Alterar Divisão
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. CHIPS RECTANGLE SELECT FOR SLOTS (A, B, C...) */}
      <div id="slots-chips-selector" className="px-5 py-2 shrink-0 border-b border-gray-150 bg-gray-50/50 flex gap-1.5 overflow-x-auto no-scrollbar">
        {Array.from({ length: slotsCount }).map((_, idx) => {
          const char = String.fromCharCode(65 + idx);
          const isSelected = idx === activeIdx;
          const count = routines[idx]?.exercises?.length || 0;
          return (
            <button
              key={idx}
              id={`slot-chip-tab-${idx}`}
              type="button"
              onClick={() => {
                setActiveIdx(idx);
                setConfiguredExId(null);
              }}
              className={`px-4 py-2.5 rounded-xl border text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                isSelected 
                  ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Slot {char}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${isSelected ? 'bg-blue-900/30 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE SLOT OVERVIEW CARD */}
      <div id="active-slot-jumbo" className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-150 space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 id="active-slot-h1-title" className="text-2xl font-black text-gray-950 tracking-tight block leading-none">
              SLOT {String.fromCharCode(65 + activeIdx)}
            </h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="bg-gray-200/60 text-gray-700 text-[10px] font-extrabold uppercase px-2 py-0.8 rounded-md">
                {exercisesList.length} Movimentos
              </span>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase px-2 py-0.8 rounded-md">
                {totalSets} Séries
              </span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase px-2 py-0.8 rounded-md">
                Vol. Est: {estimatedVolume} kg
              </span>
            </div>
          </div>

          {/* CARD ACTION BUTTONS */}
          <div className="flex items-center gap-1.5 self-start md:self-auto relative select-none">
            
            {/* 1. CLONAR FROM SLOT ACTION */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCloneMenu(!showCloneMenu)}
                className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-950 border border-gray-200 bg-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Clonar Treino</span>
                <ChevronDown size={12} />
              </button>
              {showCloneMenu && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-30 min-w-[130px]">
                  {Array.from({ length: slotsCount }).map((_, idx) => {
                    if (idx === activeIdx) return null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => cloneFromSlot(idx)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-700"
                      >
                        Copiar do Slot {String.fromCharCode(65 + idx)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. IMPORT FROM OTHER STUDENTS CARD */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowImportMenu(!showImportMenu)}
                className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-950 border border-gray-200 bg-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Importar...</span>
                <ChevronDown size={12} />
              </button>
              {showImportMenu && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-30 min-w-[160px] max-h-48 overflow-y-auto no-scrollbar">
                  {students
                    .filter(s => s.username !== studentUsername)
                    .map((s) => (
                      <button
                        key={s.username}
                        type="button"
                        onClick={() => importFromStudent(s.username)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-700 truncate"
                      >
                        {s.name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* 3. WIPING OUT THE PLAN */}
            <button
              type="button"
              onClick={clearCurrentSlot}
              className="px-2.5 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              title="Limpar Treino"
            >
              <Trash size={14} />
            </button>
          </div>
        </div>

        {/* INTERACTIVE COMPANION USER FOCUS DESCRIPTION */}
        <div id="description-foco-box" className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">
            Foco de Treinamento / Grupamento Muscular
          </label>
          <input
            id="slot-foco-input"
            type="text"
            placeholder="Ex: Peito, Ombros e Tríceps"
            value={currentSlotRoutine.title || ''}
            onChange={(e) => handleFocoChange(e.target.value)}
            className="w-full bg-white border border-gray-250 font-bold text-sm text-gray-950 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 4. ACTIVE SLOT SCROLLABLE EXERCISES LIST */}
      <div id="panel-exercises-scroller" className="flex-grow overflow-y-auto p-5 space-y-3 bg-gray-50/50 no-scrollbar">
        {exercisesList.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl p-5">
            <Sparkles size={28} className="mx-auto text-gray-300 animate-bounce mb-3" />
            <p className="text-gray-500 text-sm font-black">Slot de treino vazio</p>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Clique nos exercícios da Biblioteca ao lado para inserir movimentos, ou carregue um bloco pronto de forma rápida.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 pb-6">
            {exercisesList.map((ex, exIdx) => {
              const isConfigured = configuredExId === ex.id;
              return (
                <div 
                  key={ex.id} 
                  id={`slot-card-${ex.id}`}
                  className="bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden transition-all duration-200 hover:border-blue-200"
                >
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Segment Index numbering badge */}
                      <span className="text-xs font-black text-gray-400 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {String(exIdx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-gray-950 block truncate max-w-[210px] leading-tight">
                          {ex.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded border border-blue-105">
                            {ex.sets} X {ex.reps}
                          </span>
                          <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">
                            {ex.rest}s descanso
                          </span>
                          {ex.notes && ex.notes !== '0' && (
                            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              {ex.notes} kg
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ITEM ACTIONS TRIGGER STRIPS */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* 1. UP/DOWN INDEX ARROWS */}
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveExercise(exIdx, 'up')}
                          disabled={exIdx === 0}
                          className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(exIdx, 'down')}
                          disabled={exIdx === exercisesList.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown size={11} />
                        </button>
                      </div>

                      {/* 2. POPOVER SLIDERS SETS TRIGGER */}
                      <button
                        type="button"
                        onClick={() => setConfiguredExId(isConfigured ? null : ex.id)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          isConfigured 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white border-gray-200 text-gray-500 hover:text-gray-950 hover:bg-gray-50'
                        }`}
                        title="Configurar Parâmetros de Carga & Técnicas"
                      >
                        <Sliders size={13} />
                      </button>

                      {/* 3. TRASH REMOVE ROW */}
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.id)}
                        className="p-2.5 rounded-xl border border-transparent text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors cursor-pointer"
                        title="Deletar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* SLIDERS CONFIGURE POPOVER AREA INLINE COLLAPSIBLE */}
                  {isConfigured && (
                    <div id={`popover-config-${ex.id}`} className="bg-gray-50/70 border-t border-gray-150 p-4 space-y-4">
                      {/* Configuration grids */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">Séries</span>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={ex.sets}
                            onChange={(e) => updateExercise(ex.id, { sets: Math.max(1, parseInt(e.target.value) || 3) })}
                            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">Repetições</span>
                          <input
                            type="text"
                            value={ex.reps}
                            onChange={(e) => updateExercise(ex.id, { reps: e.target.value })}
                            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">Descanso (s)</span>
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={ex.rest}
                            onChange={(e) => updateExercise(ex.id, { rest: Math.max(0, parseInt(e.target.value) || 60) })}
                            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">Carga Estimada (KG)</span>
                          <input
                            type="text"
                            placeholder="Ex: 15"
                            value={ex.notes || ''}
                            onChange={(e) => updateExercise(ex.id, { notes: e.target.value })}
                            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-blue-500 placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      {/* INTENSITY TECHNIQUES TAGS IN LINE COGNITIVE CHECKBOXES */}
                      <div className="space-y-1.5 border-t border-gray-150 pt-3">
                        <span className="text-[10px] font-black text-gray-400 block uppercase tracking-widest">Técnicas de Intensidade</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[
                            { name: 'Drop Set', field: 'dropSet' as keyof Exercise },
                            { name: 'Bi-Set', field: 'biSet' as keyof Exercise },
                            { name: "Rest 'n Pause", field: 'restPause' as keyof Exercise },
                            { name: 'Cluster', field: 'cluster' as keyof Exercise },
                            { name: 'Isometria', field: 'isometria' as keyof Exercise },
                            { name: 'Até a Falha', field: 'falha' as keyof Exercise }
                          ].map((t) => {
                            const isCh = !!ex[t.field];
                            return (
                              <button
                                key={t.name}
                                type="button"
                                onClick={() => updateExercise(ex.id, { [t.field]: !isCh })}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${
                                  isCh 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800'
                                }`}
                              >
                                {t.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. FLOATING FOOTER CONSTRUCTOR ACTION BUTTONS */}
      <div id="panel-footer" className="p-4 border-t border-gray-150 bg-gray-50/50 flex flex-col gap-3 shrink-0">
        
        {/* UPPER ROW ADD CUSTOM / BLOCKS SHORT CUTS */}
        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={addCustomExercise}
            className="flex-1 py-3 text-[11px] font-black bg-blue-50 hover:bg-blue-100 text-[#1D4ED8] rounded-xl border border-blue-100 tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Plus size={13} />
            <span>+ Exercício</span>
          </button>

          {/* Quick preset triggers */}
          <div className="flex gap-1">
            {[
              { label: 'Peito', type: 'peito' as const },
              { label: 'Costas', type: 'costas' as const },
              { label: 'Pernas', type: 'quadriceps' as const }
            ].map((bt) => (
              <button
                key={bt.label}
                type="button"
                onClick={() => injectPresetBlock(bt.type)}
                className="px-2.5 py-3 text-[10px] font-black bg-white hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 truncate uppercase"
              >
                + {bt.label}
              </button>
            ))}
          </div>
        </div>

        {/* CORE SAVE GRANDE BOTÃO IN GREEN */}
        <button
          id="panel-btn-salvar-ficha"
          type="button"
          onClick={onSave}
          className="w-full h-14 bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>SALVAR FICHA</span>
          <span>✓</span>
        </button>
      </div>

    </div>
  );
};
