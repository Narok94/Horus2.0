import React from 'react';
import { Search, Info, Plus } from 'lucide-react';
import { BaseExercise } from '../../../data/exerciseDatabase';

interface ExerciseLibraryProps {
  filteredSuggestions: BaseExercise[];
  searchExerciseQuery: string;
  setSearchExerciseQuery: (val: string) => void;
  selectedMuscleFilter: string;
  setSelectedMuscleFilter: (val: string) => void;
  recentAddedId: string | null;
  onAddExercise: (ex: BaseExercise) => void;
  onInjectBlock: (list: BaseExercise[]) => void;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  filteredSuggestions,
  searchExerciseQuery,
  setSearchExerciseQuery,
  selectedMuscleFilter,
  setSelectedMuscleFilter,
  recentAddedId,
  onAddExercise,
  onInjectBlock
}) => {
  const muscleGroups = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Abdômen', 'Glúteos', 'Livre'];

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden px-4 md:px-6 py-4 pb-0 text-left select-none relative z-10 w-full min-w-0 flex-grow">
      {/* 2.1 BIBLIOTECA HEADER E FILTROS */}
      <div className="sticky top-0 bg-[#0F1014] z-30 pt-4 pb-2 -mt-4 border-b border-white/[0.015]">
        <h2 className="text-[12px] font-black tracking-tight uppercase italic text-zinc-400 leading-none shrink-0 mb-3">
          Dicionário Técnico
        </h2>
        
        <div className="shrink-0 space-y-3 relative z-10">
          {/* Input Text Box Modernization */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
              <Search size={14} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              className="w-full bg-[#111318] border border-white/[0.03] text-white text-[12px] md:text-[11px] font-bold rounded-xl pl-9 pr-3 py-3 md:py-2.5 focus:outline-none focus:border-white/15 focus:bg-[#15171e] transition-all placeholder-zinc-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
              placeholder="Buscar biomecânica ou grupo..."
              value={searchExerciseQuery}
              onChange={(e) => setSearchExerciseQuery(e.target.value)}
            />
          </div>

          {/* Scrollable Filter Chips - Clean look */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {muscleGroups.map(group => (
              <button
                key={group}
                onClick={() => setSelectedMuscleFilter(group)}
                className={`px-4 py-2 rounded-[8px] text-[10px] md:text-[9.5px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 font-mono shadow-sm cursor-pointer ${
                  selectedMuscleFilter === group
                    ? 'bg-zinc-100 text-[#09090B] border-zinc-200'
                    : 'bg-[#111318] border-white/[0.03] text-zinc-500 hover:text-zinc-200 hover:border-white/[0.08]'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2.2 LISTA DA BIBLIOTECA (Scrollable) */}
      <div className="flex-grow min-h-0 overflow-y-auto no-scrollbar pr-1 mt-2 pb-6 space-y-2 relative z-10 w-full mb-12">
        {filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((ex, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between p-3.5 pr-3 rounded-[12px] border shadow-sm transition-all focus:outline-none active:scale-[0.98] cursor-pointer ${
                recentAddedId === ex.name 
                ? 'bg-zinc-100 border-zinc-200 shadow-zinc-100/20' 
                : 'bg-[#111318] border-white/[0.04] hover:bg-[#15171e] hover:border-white/[0.08]'
              }`}
              onClick={() => onAddExercise(ex)}
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                {/* Tech Square Bullet */}
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-inner font-black text-[10px] uppercase font-mono transition-colors ${
                  recentAddedId === ex.name
                  ? 'bg-black text-white border-black/10'
                  : 'bg-[#09090B] border-white/5 text-zinc-500'
                }`}>
                  {ex.muscleGroup.slice(0,2)}
                </div>
                
                <div className="text-left min-w-0 leading-tight">
                  <h4 className={`text-[11px] md:text-[12px] font-black uppercase tracking-tight truncate ${
                    recentAddedId === ex.name ? 'text-black' : 'text-zinc-200'
                  }`}>
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 leading-none">
                    <span className={`text-[9px] font-bold tracking-widest uppercase font-mono ${
                      recentAddedId === ex.name ? 'text-zinc-600' : 'text-zinc-500'
                    }`}>
                      {ex.muscleGroup}
                    </span>
                    <span className={`text-[10px] font-[900] ${
                      recentAddedId === ex.name ? 'text-black/30' : 'text-zinc-600'
                    }`}>•</span>
                    <span className={`text-[9.5px] font-bold tracking-wider font-mono ${
                      recentAddedId === ex.name ? 'text-black underline decoration-black/20 decoration-2 underline-offset-1' : 'text-zinc-300'
                    }`}>
                      {ex.defaultSets}×{ex.defaultReps}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                type="button"
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  recentAddedId === ex.name
                  ? 'bg-transparent text-black border-transparent opacity-50 cursor-default'
                  : 'bg-[#09090B] border-white/5 text-white shadow hover:bg-white hover:text-black cursor-pointer'
                }`}
              >
                {recentAddedId === ex.name ? <Info size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={2.5} />}
              </button>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none pb-12 w-full">
             <Search size={24} className="mb-3 text-zinc-600" />
             <p className="text-[10px] text-zinc-400 font-bold max-w-[180px] uppercase tracking-widest font-mono">NENHUM EXERCÍCIO ENCONTRADO NO ACERVO</p>
          </div>
        )}
      </div>

      {/* QUICK INJECT BLOCK STRIP */}
      {filteredSuggestions.length > 0 && selectedMuscleFilter !== 'Todos' && (
        <div className="lg:absolute lg:bottom-0 lg:inset-x-0 w-[calc(100%-2rem)] mx-auto p-3 mb-2 rounded-xl bg-zinc-900 border border-white/5 shadow-2xl z-20">
           <button
              className="w-full py-2 bg-white text-black font-black uppercase text-[9px] tracking-[0.1em] rounded-lg active:scale-95 transition-all"
              onClick={() => onInjectBlock(filteredSuggestions.slice(0, 4))}
           >
              INJETAR GRUPO {selectedMuscleFilter.slice(0, 4)} ({Math.min(4, filteredSuggestions.length)} EX)
           </button>
        </div>
      )}
    </div>
  );
};
