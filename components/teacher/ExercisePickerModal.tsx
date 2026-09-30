import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check, Dumbbell, Sparkles } from 'lucide-react';
import { getHorusGifUrl } from '../../src/utils/exerciseUtils';

export interface PickerItem {
  name: string;
  muscle: string;
  equipment: 'Barra' | 'Halter' | 'Máquina' | 'Livre' | 'Cabo' | string;
  isCustom?: boolean;
}

const STATIC_EXERCISES_LIST: PickerItem[] = [
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

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnTitle: string;
  onConfirm: (selectedExercises: PickerItem[]) => void;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  isOpen,
  onClose,
  columnTitle,
  onConfirm
}) => {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');
  const [customItems, setCustomItems] = useState<PickerItem[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  // Load custom items from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem('tatugym_custom_exercises');
    if (saved) {
      try {
        setCustomItems(JSON.parse(saved));
      } catch (err) {
        // ignore
      }
    }
  }, [isOpen]);

  // Combined searchable exercises list
  const allAvailableItems = [...STATIC_EXERCISES_LIST, ...customItems];

  // Filtering list based on search and selected muscle group
  const filtered = allAvailableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.muscle.toLowerCase().includes(search.toLowerCase());
    
    if (selectedMuscle === 'Todos') return matchesSearch;
    return matchesSearch && item.muscle === selectedMuscle;
  });

  // Toggle selection
  const handleToggleSelection = (name: string) => {
    setSelectedNames(prev => {
      if (prev.includes(name)) {
        return prev.filter(n => n !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  // Add custom typed exercises when pressing Enter or submitting
  const handleCreateCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSearch = search.trim();
    if (!cleanSearch) return;

    // Check if it already exists
    const exists = allAvailableItems.some(i => i.name.toLowerCase() === cleanSearch.toLowerCase());
    if (exists) return;

    // Estimate muscle group
    let g = 'Cardio';
    const s = cleanSearch.toLowerCase();
    if (s.includes('supino') || s.includes('peito') || s.includes('peitoral')) g = 'Peito';
    else if (s.includes('remada') || s.includes('puxada') || s.includes('costas')) g = 'Costas';
    else if (s.includes('agacha') || s.includes('leg') || s.includes('flexora') || s.includes('perna')) g = 'Pernas';
    else if (s.includes('elev') || s.includes('ombro') || s.includes('desenv'))  g = 'Ombros';
    else if (s.includes('rosca') || s.includes('biceps')) g = 'Bíceps';
    else if (s.includes('triceps') || s.includes('testa') || s.includes('mergulho')) g = 'Tríceps';
    else if (s.includes('abd') || s.includes('prancha') || s.includes('crunch')) g = 'Core';
    else if (s.includes('glute') || s.includes('elevacao p')) g = 'Glúteos';

    const newItem: PickerItem = {
      name: cleanSearch,
      muscle: g,
      equipment: 'Livre',
      isCustom: true
    };

    const nextCustom = [...customItems, newItem];
    setCustomItems(nextCustom);
    localStorage.setItem('tatugym_custom_exercises', JSON.stringify(nextCustom));
    
    // Auto select newly created custom exercise
    setSelectedNames(prev => [...prev, newItem.name]);
    setSearch('');
  };

  const handleConfirm = () => {
    const selectedList = allAvailableItems.filter(item => selectedNames.includes(item.name));
    onConfirm(selectedList);
    // Reset states
    setSelectedNames([]);
    setSearch('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="exercise-picker-overlay-wrapper"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans"
        style={{ backdropFilter: 'blur(3px)' }}
      >
        {/* Backdrop dismiss */}
        <div className="absolute inset-0 cursor-default" onClick={onClose} />

        {/* Modal body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 210 }}
          className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col h-[80dvh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 block uppercase tracking-wider">
                Adicionar Exercícios
              </span>
              <h3 className="text-sm font-black text-gray-900 mt-0.5 uppercase">
                {columnTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateCustom();
            }}
            className="p-4 bg-gray-50/70 border-b border-gray-100 shrink-0 select-none"
          >
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar exercício ou grupo muscular... [Enter cria]"
                className="w-full bg-white border border-gray-200 text-xs py-3 pl-10 pr-4 rounded-xl text-gray-900 placeholder:text-gray-450 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold shadow-inner"
              />
            </div>
          </form>

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 py-2.5 border-b border-gray-100 shrink-0 select-none">
            {MUSCLE_GROUPS.map((cat) => {
              const isSelected = selectedMuscle === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedMuscle(cat)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg shrink-0 transition-all border ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-55'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Exercise Items List (Vertical Scroll) */}
          <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-gray-50/30">
            {filtered.map((item) => {
              const isSelected = selectedNames.includes(item.name);
              return (
                <div
                  key={item.name}
                  onClick={() => handleToggleSelection(item.name)}
                  className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-blue-50/80 border-blue-200 pl-2.5' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    borderLeftWidth: isSelected ? '4px' : '1px',
                    borderLeftColor: isSelected ? '#1D4ED8' : undefined
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <div 
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-900 leading-tight">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 select-none">
                        <span className="bg-gray-150 text-gray-550 text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded">
                          {item.muscle}
                        </span>
                        {item.equipment && (
                          <span className="text-gray-400 text-[8px] font-bold">
                            • {item.equipment}
                          </span>
                        )}
                        {item.isCustom && (
                          <span className="bg-purple-100 text-purple-700 font-extrabold text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Sparkles size={7} /> Personalizado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-gray-340 hover:text-gray-600">
                    <Dumbbell size={13} className="opacity-40" />
                  </span>
                </div>
              );
            })}

            {filtered.length === 0 && search.trim() && (
              <div
                onClick={() => handleCreateCustom()}
                className="border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 rounded-xl p-5 text-center cursor-pointer transition-all"
              >
                <Sparkles size={18} className="mx-auto text-purple-500 mb-1 animate-pulse" />
                <span className="text-xs font-black text-blue-700 block">Adicionar personalizado</span>
                <span className="text-sm font-extrabold text-blue-900 mt-0.5 block italic">"{search}"</span>
                <span className="mt-3 inline-block bg-blue-600 text-white text-[9px] font-black rounded px-3 py-1 uppercase tracking-wide">
                  Criar Movimento
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-150 px-5 py-4 shrink-0 flex items-center justify-between bg-white select-none">
            <span className="text-xs font-bold text-gray-500">
              {selectedNames.length} {selectedNames.length === 1 ? 'exercício selecionado' : 'exercícios selecionados'}
            </span>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedNames.length === 0}
              className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                selectedNames.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md cursor-pointer'
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              Confirmar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
