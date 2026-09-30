import React, { useState } from 'react';
import { Sliders, Trash2, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { Exercise } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onUpdate: (id: string, updates: Partial<Exercise>) => void;
  onRemove: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Format sequential index with leading zero (e.g., 01, 02)
  const formattedIndex = String(index + 1).padStart(2, '0');

  // Multi-technique labels mapping
  const techniques = [
    { label: 'DropSet', field: 'dropSet' as keyof Exercise },
    { label: 'Bi-Set', field: 'biSet' as keyof Exercise },
    { label: 'RestPause', field: 'restPause' as keyof Exercise },
    { label: 'Falha', field: 'falha' as keyof Exercise },
    { label: 'Isometria', field: 'isometria' as keyof Exercise },
    { label: 'Cluster', field: 'cluster' as keyof Exercise }
  ];

  const activeTechniques = techniques.filter(t => !!exercise[t.field]);

  return (
    <div 
      className="bg-[#F8FAFC] border border-gray-100 hover:border-blue-200 rounded-xl p-3 shadow-xs hover:shadow-sm transition-all relative flex flex-col gap-2 group"
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-start gap-2 max-w-[70%]">
          {/* Sequential number */}
          <span className="text-gray-400 font-black text-xs mt-0.5 select-none">{formattedIndex}</span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-950 leading-tight break-words">
              {exercise.name}
            </span>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase mt-0.5 tracking-wider">
              {exercise.muscleGroup}
            </span>
          </div>
        </div>

        {/* Action icons row */}
        <div className="flex items-center gap-1 select-none">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded transition-colors"
              title="Mover para cima"
            >
              <ArrowUp size={12} />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded transition-colors"
              title="Mover para baixo"
            >
              <ArrowDown size={12} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`p-1 rounded transition-colors ${
              isConfigOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title="Configurar séries/reps"
          >
            <Sliders size={12} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(exercise.id)}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Remover"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Metrics overview on the same line */}
      <div className="flex flex-wrap items-center gap-2 mt-0.5 select-none text-[10px]">
        <span className="bg-blue-50 text-blue-700 font-black px-1.5 py-0.5 rounded">
          {exercise.sets}x{exercise.reps}
        </span>
        <span className="text-gray-400 font-medium">
          {exercise.rest}s desc.
        </span>
        {activeTechniques.map(t => (
          <span key={t.label} className="bg-amber-50 text-amber-700 font-extrabold border border-amber-200/50 px-1 rounded uppercase tracking-wide text-[8px]">
            {t.label}
          </span>
        ))}
      </div>

      {/* Expandable configuration popover inline panel with transition */}
      <AnimatePresence>
        {isConfigOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden bg-white border border-gray-150 rounded-lg p-2.5 mt-1 text-left space-y-2.5 shadow-inner"
          >
            <div className="grid grid-cols-3 gap-1.5 select-none">
              <div>
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Séries
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={exercise.sets}
                  onChange={(e) => onUpdate(exercise.id, { sets: Math.max(1, parseInt(e.target.value) || 3) })}
                  className="w-full bg-gray-50 border border-gray-200 text-center rounded py-1 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Reps
                </label>
                <input
                  type="text"
                  value={exercise.reps}
                  onChange={(e) => onUpdate(exercise.id, { reps: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-center rounded py-1 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Descanso (s)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={exercise.rest}
                  onChange={(e) => onUpdate(exercise.id, { rest: Math.max(0, parseInt(e.target.value) || 60) })}
                  className="w-full bg-gray-50 border border-gray-200 text-center rounded py-1 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Techniques selections toggles */}
            <div className="border-t border-gray-100 pt-2">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                Método de Intensidade
              </span>
              <div className="grid grid-cols-3 gap-1">
                {techniques.map((tech) => {
                  const isSelected = !!exercise[tech.field];
                  return (
                    <button
                      key={tech.label}
                      type="button"
                      onClick={() => onUpdate(exercise.id, { [tech.field]: !isSelected })}
                      className={`py-1 rounded text-[8px] font-black text-center uppercase border transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {tech.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="border-t border-gray-100 pt-2 select-none">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                Instruções / Carga (kg)
              </label>
              <input
                type="text"
                placeholder="Ex: Pirâmide 12/10/8, 40kg"
                value={exercise.notes || ''}
                onChange={(e) => onUpdate(exercise.id, { notes: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 px-2 py-1 text-[10px] font-semibold text-gray-900 rounded focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-gray-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
