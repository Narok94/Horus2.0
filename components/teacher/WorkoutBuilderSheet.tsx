import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check, Trash2, Sliders, ArrowUp, ArrowDown, Sparkles, Plus, Dumbbell } from 'lucide-react';
import { WorkoutRoutine, Exercise } from '../../types';
import { getHorusGifUrl } from '../../src/utils/exerciseUtils';
import { useStore } from '../../store';

const STATIC_EXERCISES_LIST = [
  { name: "Supino Reto Barra", muscle: "Peito", equipment: "Barra" },
  { name: "Supino Inclinado Halter", muscle: "Peito", equipment: "Halter" },
  { name: "Supino Declinado", muscle: "Peito", equipment: "Barra" },
  { name: "Crucifixo Máquina", muscle: "Peito", equipment: "Máquina" },
  { name: "Crossover Polia Alta", muscle: "Peito", equipment: "Cabo" },
  { name: "Peck Deck", muscle: "Peito", equipment: "Máquina" },
  { name: "Remada Curvada", muscle: "Costas", equipment: "Barra" },
  { name: "Puxada Frontal", muscle: "Costas", equipment: "Máquina" },
  { name: "Remada Unilateral", muscle: "Costas", equipment: "Halter" },
  { name: "Levantamento Terra", muscle: "Costas", equipment: "Barra" },
  { name: "Pulldown no Cabo", muscle: "Costas", equipment: "Cabo" },
  { name: "Rosca Direta", muscle: "Bíceps", equipment: "Barra" },
  { name: "Rosca Martelo", muscle: "Bíceps", equipment: "Halter" },
  { name: "Rosca Concentrada", muscle: "Bíceps", equipment: "Halter" },
  { name: "Tríceps Corda", muscle: "Tríceps", equipment: "Cabo" },
  { name: "Tríceps Testa", muscle: "Tríceps", equipment: "Barra" },
  { name: "Tríceps Mergulho", muscle: "Tríceps", equipment: "Livre" },
  { name: "Desenvolvimento", muscle: "Ombros", equipment: "Halter" },
  { name: "Elevação Lateral", muscle: "Ombros", equipment: "Halter" },
  { name: "Elevação Frontal", muscle: "Ombros", equipment: "Halter" },
  { name: "Agachamento", muscle: "Pernas", equipment: "Barra" },
  { name: "Leg Press", muscle: "Pernas", equipment: "Máquina" },
  { name: "Cadeira Extensora", muscle: "Pernas", equipment: "Máquina" },
  { name: "Cadeira Flexora", muscle: "Pernas", equipment: "Máquina" },
  { name: "Stiff", muscle: "Pernas", equipment: "Barra" },
  { name: "Hip Thrust", muscle: "Glúteos", equipment: "Barra" },
  { name: "Glúteo no Cross", muscle: "Glúteos", equipment: "Cabo" },
  { name: "Abdução na Máquina", muscle: "Glúteos", equipment: "Máquina" },
  { name: "Prancha", muscle: "Core", equipment: "Livre" },
  { name: "Crunch Abdominal", muscle: "Core", equipment: "Livre" },
  { name: "Panturrilha em Pé", muscle: "Pernas", equipment: "Máquina" }
];

const MUSCLE_GROUPS = [
  'Todos', 'Peito', 'Costas', 'Pernas', 'Glúteos', 'Ombros', 'Bíceps', 'Tríceps', 'Core', 'Cardio'
];

interface WorkoutBuilderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentUsername: string;
  division: 'AB' | 'ABC' | 'ABCD' | 'ABCDE';
  setDivision: (div: 'AB' | 'ABC' | 'ABCD' | 'ABCDE') => void;
  routines: WorkoutRoutine[];
  onUpdateRoutines: (updatedRoutines: WorkoutRoutine[]) => void;
  onSave: () => void;
}

export const WorkoutBuilderSheet: React.FC<WorkoutBuilderSheetProps> = ({
  isOpen,
  onClose,
  studentName,
  studentUsername,
  division,
  setDivision,
  routines,
  onUpdateRoutines,
  onSave
}) => {
  const { addToast } = useStore();

  // Mobile Top Tab choice: "library" | "sheet"
  const [mobileTab, setMobileTab] = useState<'library' | 'sheet'>('sheet');

  // Slots Tab Index tracker (A=0, B=1, C=2...)
  const [activeSlotIdx, setActiveSlotIdx] = useState<number>(0);

  // Library Category and Search tracker inside bottom sheet
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');
  const [customItems, setCustomItems] = useState<any[]>([]);

  // Selection list for multiple choices inside Bottom Sheet biblioteca tab
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  // Collapsed exercises items for inline configurations
  const [configuredExId, setConfiguredExId] = useState<string | null>(null);

  // Load custom exercises on mounting
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('tatugym_custom_exercises');
      if (saved) {
        try {
          setCustomItems(JSON.parse(saved));
        } catch (_) {}
      }
    }
  }, [isOpen]);

  const slotLimit = (): number => {
    switch (division) {
      case 'AB': return 2;
      case 'ABC': return 3;
      case 'ABCD': return 4;
      case 'ABCDE': return 5;
      default: return 3;
    }
  };

  const limitCount = slotLimit();
  const currentSlotRoutine = routines[activeSlotIdx] || {
    id: `routine_${activeSlotIdx}`,
    title: `Treino ${String.fromCharCode(65 + activeSlotIdx)}`,
    description: '',
    exercises: [],
    color: 'blue'
  };

  const exercises = currentSlotRoutine.exercises || [];
  const currentLetter = String.fromCharCode(65 + activeSlotIdx);

  // Filter exercises in real time inside Bottom Sheet library
  const allAvailableItems = [...STATIC_EXERCISES_LIST, ...customItems];
  const filtered = allAvailableItems.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
                          ex.muscle.toLowerCase().includes(search.toLowerCase());
    if (selectedMuscle === 'Todos') return matchesSearch;
    return matchesSearch && ex.muscle === selectedMuscle;
  });

  // Adding multiple selection confirmation
  const handleAddMultipleSelected = () => {
    if (selectedNames.length === 0) return;

    const selectedObjects = allAvailableItems.filter(item => selectedNames.includes(item.name));
    
    const newExs: Exercise[] = selectedObjects.map(item => ({
      id: `ex_${Math.random().toString(36).substring(2, 9)}`,
      name: item.name,
      muscleGroup: item.muscle,
      sets: 3,
      reps: '12',
      rest: 60,
      notes: '',
      image: getHorusGifUrl(item.name)
    }));

    const updatedRoutines = routines.map((r, rIdx) => {
      if (rIdx === activeSlotIdx) {
        return {
          ...r,
          exercises: [...(r.exercises || []), ...newExs]
        } as any;
      }
      return r;
    });

    onUpdateRoutines(updatedRoutines);
    
    if (addToast) {
      addToast(`${selectedNames.length} exercícios incluídos no Treino ${currentLetter}! 💪`, "success");
    }

    setSelectedNames([]);
    setSearch('');
    // Switch back to Ficha tab to organize configurations
    setMobileTab('sheet');
  };

  // Add individual custom exercise
  const handleAddCustomSelection = () => {
    const cleanSearch = search.trim();
    if (!cleanSearch) return;

    // Check if it already exists
    const exists = allAvailableItems.some(i => i.name.toLowerCase() === cleanSearch.toLowerCase());
    if (exists) return;

    // Guess
    let g = 'Peito';
    const s = cleanSearch.toLowerCase();
    if (s.includes('peito') || s.includes('supino')) g = 'Peito';
    else if (s.includes('costas') || s.includes('puxada') || s.includes('remada')) g = 'Costas';
    else if (s.includes('perna') || s.includes('agachamento') || s.includes('leg')) g = 'Pernas';
    else if (s.includes('ombro') || s.includes('elevacao')) g = 'Ombros';
    else if (s.includes('rosca') || s.includes('biceps')) g = 'Bíceps';
    else if (s.includes('triceps') || s.includes('testa')) g = 'Tríceps';
    else if (s.includes('glute')) g = 'Glúteos';
    else if (s.includes('abd') || s.includes('prancha')) g = 'Core';

    const newItem = {
      name: cleanSearch,
      muscle: g,
      equipment: 'Livre',
      isCustom: true
    };

    const nextCustom = [...customItems, newItem];
    setCustomItems(nextCustom);
    localStorage.setItem('tatugym_custom_exercises', JSON.stringify(nextCustom));

    setSelectedNames(prev => [...prev, newItem.name]);
    setSearch('');
  };

  // Toggle checklist inside library tab
  const handleToggleCheck = (name: string) => {
    setSelectedNames(prev => {
      if (prev.includes(name)) {
        return prev.filter(n => n !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  // Modify individual parameters inline on mobile
  const handleUpdateExField = (id: string, updates: Partial<Exercise>) => {
    const updated = routines.map((r, rIdx) => {
      if (rIdx === activeSlotIdx) {
        return {
          ...r,
          exercises: r.exercises.map((ex) => {
            if (ex.id === id) {
              return { ...ex, ...updates };
            }
            return ex;
          })
        };
      }
      return r;
    });
    onUpdateRoutines(updated);
  };

  // Remove exercises from active index slot
  const handleRemoveEx = (id: string, name: string) => {
    const updated = routines.map((r, rIdx) => {
      if (rIdx === activeSlotIdx) {
        return {
          ...r,
          exercises: r.exercises.filter((ex) => ex.id !== id)
        };
      }
      return r;
    });
    onUpdateRoutines(updated);
    if (addToast) addToast(`"${name}" removido do Treino ${currentLetter}`, "success");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="builder-sheet-wrapper" className="fixed inset-0 flex items-end justify-center z-50 p-0 font-sans select-none pointer-events-none md:hidden">
          
          {/* Backdrop screen overlay */}
          <motion.div
            id="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black pointer-events-auto"
          />

          {/* Core Bottom Sheet Sliding component */}
          <motion.div
            id="mobile-bottom-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative bg-white w-full rounded-t-3xl shadow-2xl z-50 flex flex-col h-[90dvh] overflow-hidden pointer-events-auto"
          >
            {/* Top gray handlebar decoration */}
            <div id="drag-bar" className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-3 shrink-0" />

            {/* Back Close X button */}
            <button
              id="close-bottom-sheet-btn"
              type="button"
              onClick={onClose}
              className="absolute top-2.5 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} />
            </button>

            {/* HEADER INFO */}
            <div className="px-5 pb-3 pt-1 border-b border-gray-100 shrink-0 bg-white">
              <span className="text-[9px] font-extrabold uppercase text-blue-600 tracking-wider block">CONSTRUTOR DE FICHA</span>
              <h2 className="text-sm font-black text-gray-900 mt-0.5">{studentName} • Ficha {division}</h2>
            </div>

            {/* MOBILE TWO MAIN SWITCH TABS (Libraries | Fichas) */}
            <div id="mobile-tabs-switch" className="flex border-b border-gray-100 shrink-0 bg-white select-none">
              <button
                type="button"
                onClick={() => setMobileTab('library')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider relative flex items-center justify-center gap-1.5 transition-colors ${
                  mobileTab === 'library' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>📚 Biblioteca</span>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black rounded-full px-2 py-0.5 border border-blue-105">
                  {allAvailableItems.length}
                </span>
                {mobileTab === 'library' && (
                  <motion.div layoutId="m-active-indicator" className="absolute bottom-0 inset-x-6 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileTab('sheet')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider relative flex items-center justify-center gap-1.5 transition-colors ${
                  mobileTab === 'sheet' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>📋 Ficha [{currentLetter}]</span>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-black rounded-full px-2 py-0.5">
                  {exercises.length}
                </span>
                {mobileTab === 'sheet' && (
                  <motion.div layoutId="m-active-indicator" className="absolute bottom-0 inset-x-6 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            </div>

            {/* DYNAMIC VIEWPORTS MAIN AREA */}
            <div className="flex-grow overflow-y-auto bg-gray-50/70 p-4 min-h-0 relative">
              
              {/* TAB 1: LIBRARY CATEGORY SEARCH WITH MULTI SELECTION */}
              {mobileTab === 'library' && (
                <div id="mobile-lib-section" className="flex flex-col h-full space-y-3 pb-16">
                  {/* Search box row */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddCustomSelection();
                    }}
                    className="relative shrink-0 select-none"
                  >
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search size={15} />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar exercício... [Enter p/ personalizado]"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs py-3 pl-10 pr-4 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 font-semibold shadow-xs"
                    />
                  </form>

                  {/* Horizontal Category Pill scrollbar */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 select-none shrink-0">
                    {MUSCLE_GROUPS.map((cat) => {
                      const sel = selectedMuscle === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedMuscle(cat)}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-lg shrink-0 transition-colors border ${
                            sel ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white border-gray-200 text-gray-600'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Exercises clickable rows */}
                  <div className="space-y-2 mt-1 px-0.5 pb-10">
                    {filtered.map((item) => {
                      const isChecked = selectedNames.includes(item.name);
                      return (
                        <div
                          key={item.name}
                          onClick={() => handleToggleCheck(item.name)}
                          className={`w-full text-left bg-white border rounded-xl p-3 flex items-center justify-between shadow-xs transition-all cursor-pointer ${
                            isChecked ? 'bg-blue-50/80 border-blue-200 pl-2.5' : 'border-gray-200'
                          }`}
                          style={{
                            borderLeftWidth: isChecked ? '4px' : '1px',
                            borderLeftColor: isChecked ? '#1D4ED8' : undefined
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check size={10} strokeWidth={3} />}
                            </div>

                            <div>
                              <span className="text-xs font-semibold text-gray-950 block">{item.name}</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[8px] text-gray-500 font-extrabold uppercase bg-gray-150 px-1.5 rounded tracking-wider">
                                  {item.muscle}
                                </span>
                                {item.isCustom && (
                                  <span className="bg-purple-100 text-purple-700 font-extrabold text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded">
                                    Personalizado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filtered.length === 0 && search.trim() && (
                      <div
                        onClick={handleAddCustomSelection}
                        className="w-full text-center bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-xl p-5 cursor-pointer block"
                      >
                        <Sparkles size={16} className="mx-auto text-purple-500 mb-1" />
                        <span className="text-xs font-black text-blue-700 block">Adicionar personalizado</span>
                        <span className="text-sm font-semibold text-blue-900 mt-0.5 block italic">"{search}"</span>
                        <span className="mt-3 inline-block bg-blue-600 text-white text-[9px] font-black rounded px-3 py-1 uppercase tracking-wide">
                          Incluir Nova Meta
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ACTIVE SLOT LIST EDITOR */}
              {mobileTab === 'sheet' && (
                <div id="mobile-sheet-section" className="flex flex-col h-full space-y-4 pb-16">
                  {/* Slots switches tabs (A | B | C...) */}
                  <div className="flex gap-1 overflow-x-auto shrink-0 select-none pb-1.5 no-scrollbar-all border-b border-gray-150">
                    {Array.from({ length: limitCount }).map((_, idx) => {
                      const tabChar = String.fromCharCode(65 + idx);
                      const isSel = idx === activeSlotIdx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveSlotIdx(idx);
                            setConfiguredExId(null);
                          }}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-colors border ${
                            isSel ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200'
                          }`}
                        >
                          Treino {tabChar}
                        </button>
                      );
                    })}
                  </div>

                  {/* Heading slot input focus text */}
                  <div className="space-y-1.5 shrink-0 select-none">
                    <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wider">Foco / Grupamento do Treino:</span>
                    <input
                      type="text"
                      placeholder="Ex: Peito, Ombro e Tríceps..."
                      value={currentSlotRoutine.title || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const upd = routines.map((r, rIdx) => {
                          if (rIdx === activeSlotIdx) {
                            return { ...r, title: val };
                          }
                          return r;
                        });
                        onUpdateRoutines(upd);
                      }}
                      className="w-full bg-white border border-gray-200 font-bold text-xs text-gray-900 px-3 py-3 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-350"
                    />
                  </div>

                  {/* Exercises inside active mobile index cards */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-gray-400 block uppercase tracking-wide">Exercícios Incluídos ({exercises.length}):</span>
                    
                    {exercises.length === 0 ? (
                      <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-white/70">
                        <Dumbbell className="mx-auto text-gray-400 opacity-50 mb-2" size={24} />
                        <span className="text-gray-400 text-xs font-bold block">Nenhum movimento incluído neste slot</span>
                        <button
                          type="button"
                          onClick={() => setMobileTab('library')}
                          className="mt-4 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] tracking-wider uppercase font-black border border-blue-100 px-4 py-2 rounded-lg"
                        >
                          Ir para Biblioteca
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {exercises.map((ex, idx) => {
                          const openSet = configuredExId === ex.id;
                          return (
                            <div key={ex.id} className="bg-white border border-gray-150 rounded-xl p-3.5 flex flex-col gap-2 shadow-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-900 truncate max-w-[190px] block">
                                  {String(idx + 1).padStart(2, '0')}. {ex.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setConfiguredExId(openSet ? null : ex.id)}
                                    className={`p-1.5 rounded-lg border transition-all ${openSet ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent hover:bg-gray-50 text-gray-400 border-transparent'}`}
                                  >
                                    <Sliders size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEx(ex.id, ex.name)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* Static display values or dynamic editable sliders row */}
                              {openSet ? (
                                <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 mt-1 space-y-3 shadow-inner">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Séries</span>
                                      <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={ex.sets}
                                        onChange={(e) => handleUpdateExField(ex.id, { sets: Math.max(1, parseInt(e.target.value) || 3) })}
                                        className="w-full bg-white border border-gray-200 text-center rounded-lg py-1 text-xs font-bold"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Reps</span>
                                      <input
                                        type="text"
                                        value={ex.reps}
                                        onChange={(e) => handleUpdateExField(ex.id, { reps: e.target.value })}
                                        className="w-full bg-white border border-gray-200 text-center rounded-lg py-1 text-xs font-bold"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Rest (s)</span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={ex.rest}
                                        onChange={(e) => handleUpdateExField(ex.id, { rest: Math.max(0, parseInt(e.target.value) || 60) })}
                                        className="w-full bg-white border border-gray-200 text-center rounded-lg py-1 text-xs font-bold"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1 border-t border-gray-150 pt-2">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Técnica Avançada:</span>
                                    <div className="grid grid-cols-3 gap-1">
                                      {[
                                        { label: 'DropSet', field: 'dropSet' as keyof Exercise },
                                        { label: 'Bi-Set', field: 'biSet' as keyof Exercise },
                                        { label: 'Falha', field: 'falha' as keyof Exercise }
                                      ].map((t) => {
                                        const isCh = !!ex[t.field];
                                        return (
                                          <button
                                            key={t.label}
                                            type="button"
                                            onClick={() => handleUpdateExField(ex.id, { [t.field]: !isCh })}
                                            className={`py-1 rounded text-[8px] font-black text-center uppercase border transition-colors ${
                                              isCh ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-500'
                                            }`}
                                          >
                                            {t.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-1 pt-1">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Observação / Carga:</span>
                                    <input
                                      type="text"
                                      placeholder="Ex: 50kg, Pirâmide..."
                                      value={ex.notes || ''}
                                      onChange={(e) => handleUpdateExField(ex.id, { notes: e.target.value })}
                                      className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-[10px] font-semibold text-gray-900 placeholder:text-gray-350"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center gap-1.5 select-none text-[9px] mt-0.5">
                                  <span className="bg-blue-50 text-blue-700 font-extrabold px-1.8 py-0.5 rounded">
                                    {ex.sets}x{ex.reps}
                                  </span>
                                  <span className="text-gray-400 font-medium">
                                    {ex.rest}s descanso
                                  </span>
                                  {ex.notes && (
                                    <span className="text-gray-500 break-words font-semibold italic max-w-full">
                                      • {ex.notes}
                                    </span>
                                  )}
                                  {ex.dropSet && (
                                    <span className="bg-amber-50 text-amber-600 font-bold px-1 rounded text-[8px] uppercase">
                                      DropSet
                                    </span>
                                  )}
                                  {ex.biSet && (
                                    <span className="bg-amber-50 text-amber-600 font-bold px-1 rounded text-[8px] uppercase">
                                      Bi-Set
                                    </span>
                                  )}
                                  {ex.falha && (
                                    <span className="bg-amber-50 text-amber-600 font-bold px-1 rounded text-[8px] uppercase">
                                      Até a Falha
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Add extra individual button inside active screen */}
                        <button
                          type="button"
                          onClick={() => setMobileTab('library')}
                          className="w-full py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-black text-xs uppercase tracking-wider rounded-xl border border-dashed border-blue-200 flex items-center justify-center gap-1.5 mt-2 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Adicionar Exercício</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* STICKY BOTTOM MULTI-SELECT PANEL FLOATING ONLY IN LIBRARY TAB WHEN > 0 */}
            {mobileTab === 'library' && selectedNames.length > 0 && (
              <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-150 p-4 select-none z-30 shadow-2xl flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">
                  {selectedNames.length} {selectedNames.length === 1 ? 'mecanismo' : 'mecanismos'}
                </span>
                <button
                  type="button"
                  onClick={handleAddMultipleSelected}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-widest rounded-xl px-5 py-3 shadow-md flex items-center gap-1"
                >
                  Incluir no Treino {currentLetter}
                </button>
              </div>
            )}

            {/* FIXED GREEN SAVE TRIGGER FOOTER IN EMERALD GREEN - DISPLAYED ON SHEETS TAB */}
            {mobileTab === 'sheet' && (
              <div id="mobile-sheet-footer" className="p-4 border-t border-gray-150 shrink-0 bg-white z-20 select-none">
                <button
                  id="mobile-btn-salvar-ficha"
                  type="button"
                  onClick={onSave}
                  className="w-full h-13 bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>SALVAR FICHA</span>
                  <span>✓</span>
                </button>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
