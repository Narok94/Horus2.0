import React, { useState } from 'react';
import { Search, Plus, Sparkles, Check } from 'lucide-react';

const STATIC_EXERCISES = [
  // Peito
  { name: 'Supino Reto', muscleGroup: 'Peito' },
  { name: 'Supino Inclinado', muscleGroup: 'Peito' },
  { name: 'Supino Declinado', muscleGroup: 'Peito' },
  { name: 'Crucifixo', muscleGroup: 'Peito' },
  { name: 'Cross Cable', muscleGroup: 'Peito' },
  // Costas
  { name: 'Remada Curvada', muscleGroup: 'Costas' },
  { name: 'Puxada Frontal', muscleGroup: 'Costas' },
  { name: 'Remada Unilateral', muscleGroup: 'Costas' },
  // Pernas
  { name: 'Agachamento', muscleGroup: 'Pernas' },
  { name: 'Leg Press', muscleGroup: 'Pernas' },
  { name: 'Cadeira Extensora', muscleGroup: 'Pernas' },
  { name: 'Cadeira Flexora', muscleGroup: 'Pernas' },
  { name: 'Stiff', muscleGroup: 'Pernas' },
  { name: 'Glúteo no Cross', muscleGroup: 'Pernas' },
  { name: 'Hip Thrust', muscleGroup: 'Pernas' },
  { name: 'Panturrilha', muscleGroup: 'Pernas' },
  // Ombros
  { name: 'Desenvolvimento', muscleGroup: 'Ombros' },
  { name: 'Elevação Lateral', muscleGroup: 'Ombros' },
  // Bíceps
  { name: 'Rosca Direta', muscleGroup: 'Bíceps' },
  { name: 'Rosca Martelo', muscleGroup: 'Bíceps' },
  // Tríceps
  { name: 'Tríceps Corda', muscleGroup: 'Tríceps' },
  { name: 'Tríceps Testa', muscleGroup: 'Tríceps' },
  // Outros
  { name: 'Abdômen Crunch', muscleGroup: 'Outros' },
  { name: 'Prancha', muscleGroup: 'Outros' }
];

interface ExerciseLibraryProps {
  onAddExercise: (name: string, muscleGroup: string) => void;
  variant?: 'desktop' | 'mobile';
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ 
  onAddExercise,
  variant = 'desktop' 
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [addedFlash, setAddedFlash] = useState<string | null>(null);

  const categories = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps'];

  const filtered = STATIC_EXERCISES.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    if (category === 'Todos') return matchesSearch;
    return matchesSearch && ex.muscleGroup === category;
  });

  const handleAdd = (name: string, muscleGroup: string) => {
    onAddExercise(name, muscleGroup);
    setAddedFlash(name);
    setTimeout(() => setAddedFlash(null), 850);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      e.preventDefault();
      // Match category based on search term or fallback to "Livre"
      const lower = search.toLowerCase();
      let detectedGroup = 'Livre';
      if (lower.includes('peito') || lower.includes('supino') || lower.includes('crucifixo')) detectedGroup = 'Peito';
      else if (lower.includes('costas') || lower.includes('remada') || lower.includes('puxada')) detectedGroup = 'Costas';
      else if (lower.includes('perna') || lower.includes('agacha') || lower.includes('leg') || lower.includes('stiff')) detectedGroup = 'Pernas';
      else if (lower.includes('ombro') || lower.includes('elevaç') || lower.includes('desenvolvi')) detectedGroup = 'Ombros';
      else if (lower.includes('biceps') || lower.includes('rosca')) detectedGroup = 'Bíceps';
      else if (lower.includes('triceps') || lower.includes('corda') || lower.includes('testa')) detectedGroup = 'Tríceps';

      handleAdd(search.trim(), detectedGroup);
      setSearch('');
    }
  };

  return (
    <div id="exercise-library-container" className="flex flex-col h-full bg-[#F1F5F9] md:bg-gray-50/50 p-5 select-none text-sans">
      {/* Search Header */}
      <div id="lib-header" className="space-y-4 pb-3 shrink-0">
        <div id="lib-search-box" className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={16} />
          </div>
          <input
            id="lib-search-input"
            type="text"
            placeholder="Buscar exercício... [Enter para add]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm py-3 pl-11 pr-4 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all font-semibold shadow-sm"
          />
        </div>

        {/* Filter categories tabs with scroll */}
        <div id="lib-filter-tabs" className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                id={`lib-cat-tab-${cat}`}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.8 text-xs font-black rounded-full transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-sm'
                    : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested & Filtered item lists */}
      <div id="lib-exercises-list" className="flex-grow overflow-y-auto space-y-1.5 pr-1 mt-2 no-scrollbar">
        {filtered.map((item) => {
          const isAdded = addedFlash === item.name;
          return (
            <button
              key={item.name}
              id={`lib-item-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
              type="button"
              onClick={() => handleAdd(item.name, item.muscleGroup)}
              className="w-full text-left bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-3.5 flex items-center justify-between transition-all hover:translate-x-0.5"
            >
              <div>
                <span className="text-sm font-bold text-gray-950 block">{item.name}</span>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase mt-0.5 block tracking-wider">
                  {item.muscleGroup}
                </span>
              </div>
              <div className="shrink-0">
                {isAdded ? (
                  <span className="text-xs text-white bg-emerald-500 px-2 py-1 rounded-lg flex items-center gap-1 font-bold">
                    <Check size={11} />
                    <span>Adicionado</span>
                  </span>
                ) : (
                  <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white px-2.5 py-1.2 rounded-lg font-black transition-colors block">
                    + ADD
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && search.trim() && (
          <button
            id="lib-add-custom-suggestion"
            type="button"
            onClick={() => {
              handleAdd(search.trim(), 'Customizado');
              setSearch('');
            }}
            className="w-full text-left bg-blue-50 border border-dashed border-blue-300 rounded-xl p-4 flex items-center justify-between pointer-events-auto cursor-pointer"
          >
            <div>
              <span className="text-xs font-black text-blue-700 block">Adicionar personalizado</span>
              <span className="text-sm font-extrabold text-blue-900 mt-1 block">"{search}"</span>
            </div>
            <span className="text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5 font-bold uppercase tracking-widest shrink-0">
              + NOVO
            </span>
          </button>
        )}

        {filtered.length === 0 && !search.trim() && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-xs font-semibold">Nenhum exercício cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
};
