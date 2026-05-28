import React from 'react';
import { Play, Copy, X, Trash2, GripVertical, Plus } from 'lucide-react';
import { WorkoutRoutine, Exercise, User } from '../../../types';
import { BaseExercise } from '../../../data/exerciseDatabase';

interface WorkoutWorkspaceProps {
  localRoutines: WorkoutRoutine[];
  activeRoutineIdx: number;
  setActiveRoutineIdx: (idx: number) => void;
  expandedExerciseId: string | null;
  setExpandedExerciseId: (id: string | null) => void;
  sheetFrequency: string;
  getFrequencyCount: () => number;
  onUpdateExerciseField: (id: string, field: keyof Exercise, val: any) => void;
  onRemoveExercise: (id: string) => void;
  onAddCustomExercise: () => void;
  onUpdateRoutineTitle: (title: string) => void;
  students: User[];
  onCloneRoutine: (idx: number) => void;
  onCloneFromOtherStudent: (username: string) => void;
  onClearWorkoutRoutine: () => void;
  onInjectBlock: (list: BaseExercise[]) => void;
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
  students,
  onCloneRoutine,
  onCloneFromOtherStudent,
  onClearWorkoutRoutine,
  onInjectBlock
}) => {
  const chars = ['A', 'B', 'C', 'D', 'E'];
  const limit = getFrequencyCount();

  const routine = localRoutines[activeRoutineIdx];
  if (!routine) return null;

  return (
    <div className="flex flex-col h-full bg-[#111318] text-white overflow-hidden text-left relative z-10 w-full min-w-0">
      {/* 3.1 SHEET TABS - Desktop and Mobile adaptive width */}
      <div className="flex border-b border-white/[0.015] bg-[#0A0B0E] p-2 gap-2 overflow-x-auto no-scrollbar shrink-0 px-4 md:px-6">
        {chars.slice(0, limit).map((char, idx) => (
          <button
            key={char}
            onClick={() => {
              setActiveRoutineIdx(idx);
              setExpandedExerciseId(null);
            }}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 font-mono flex items-center justify-center min-w-[100px] shrink-0  ${
              activeRoutineIdx === idx
                ? 'bg-zinc-100 text-[#09090B] border border-zinc-300 shadow-md transform scale-100'
                : 'bg-[#15171e] text-zinc-600 border border-transparent hover:text-zinc-300 hover:bg-[#1A1D24] transform scale-95'
            }`}
          >
            Treino {char}
          </button>
        ))}
        
        {/* Fill remaining empty space in scroll container for safety bounding */}
        <div className="w-4 shrink-0 pointer-events-none"></div>
      </div>

      {/* 3.2 WORKSPACE ACTIVE ROUTINE AREA (Spans 100% horizontally/vertically) */}
      <div className="flex-1 overflow-y-auto w-full no-scrollbar px-4 md:px-8 xl:px-12 py-6 md:py-8 lg:pb-32 pb-48 relative z-10 space-y-4">
        
        {/* Title Editor Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/[0.03] pb-6 shrink-0 z-20 relative max-w-[1100px] mx-auto">
          <div className="flex-1 max-w-xl">
             <input
               value={routine.title || `Treino ${chars[activeRoutineIdx]}`}
               onChange={(e) => onUpdateRoutineTitle(e.target.value)}
               className="bg-transparent text-xl md:text-3xl font-[900] text-white tracking-tight uppercase italic focus:outline-none w-full placeholder-zinc-700 leading-none"
               placeholder="Título (ex: Push Inferior...)"
             />
             <div className="flex items-center gap-2 mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
               <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded">Ficha principal</span>
               <span>•</span>
               <span>{(routine.exercises || []).length} Exercícios Prescritos</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
             <div className="relative group">
                <button className="h-8 md:h-10 px-3 md:px-4 bg-[#1A1D24] border border-white/5 hover:border-white/20 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer font-mono whitespace-nowrap">
                   <Copy size={13} />
                   Clonar Treino / Bloco
                </button>
                {/* Clone Dropdown Desktop Engine */}
                <div className="absolute right-0 top-full mt-2 w-max min-w-[240px] bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 space-y-3">
                    <div className="space-y-1 bg-zinc-900 border border-transparent p-1.5 rounded-lg">
                       <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest px-1.5 pt-1 block mb-1">Desta mesma planilha:</span>
                       {chars.slice(0, limit).map((char, i) => (
                           i !== activeRoutineIdx && (
                              <button key={`c_${char}`} onClick={() => onCloneRoutine(i)} className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded uppercase font-bold tracking-tight">
                                  Clonar do Treino {char}
                              </button>
                           )
                       ))}
                    </div>
                    {students.length > 1 && (
                       <div className="space-y-1">
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest px-1.5 block">Planilha Completa de:</span>
                          {students.slice(0, 5).map((s) => (
                              <button key={`oc_${s.username}`} onClick={() => onCloneFromOtherStudent(s.username)} className="w-full text-left px-2.5 py-1.5 text-xs text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/10 rounded uppercase font-bold tracking-tight">
                                 @{(s.name || s.username).split(' ')[0]}
                              </button>
                          ))}
                       </div>
                    )}
                </div>
             </div>
             
             {routine.exercises && routine.exercises.length > 0 && (
                <button 
                  onClick={onClearWorkoutRoutine}
                  className="h-8 md:h-10 w-8 md:w-10 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
                  title="Limpar todos os exercícios"
                >
                   <Trash2 size={13} strokeWidth={2.5} />
                </button>
             )}
          </div>
        </div>

        {/* Exercises Sequence Canvas List */}
        <div className="space-y-3 pt-2 z-10 relative max-w-[1100px] mx-auto w-full">
          {(!routine.exercises || routine.exercises.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-48 md:h-64 border-2 border-dashed border-white/[0.03] rounded-2xl bg-zinc-950/20 opacity-80 backdrop-blur-sm select-none">
              <Plus size={32} className="text-zinc-700 mb-4" />
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest text-center px-4">Selecione exercícios na biblioteca para começar</p>
            </div>
          ) : (
            routine.exercises.map((ex, exIdx) => {
              const isExpanded = expandedExerciseId === ex.id;
              
              return (
                <div 
                   key={ex.id}
                   className={`rounded-[14px] transition-all duration-300 border bg-[#0F1014] text-left w-full mx-auto relative ${
                     isExpanded 
                     ? 'border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] z-20 transform md:scale-[1.01]' 
                     : 'border-white/[0.02] shadow-sm z-10 focus-within:border-white/10'
                   }`}
                >
                  <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col justify-center items-center text-white/5 opacity-50 cursor-grab hover:text-white/20 hover:opacity-100 transition-colors pl-0.5">
                    <GripVertical size={14} />
                  </div>
                  
                  {/* Row List Item Collapsed Overview Header */}
                  <div 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 pl-5 md:pl-6 cursor-pointer gap-2 md:gap-4 select-none min-w-0 w-full"
                    onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                  >
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pr-4">
                      {/* Tech Pill Row Sequence Index */}
                      <div className={`w-8 h-8 rounded-lg border font-mono text-[10px] font-black flex items-center justify-center shrink-0 transition-colors ${
                         isExpanded 
                         ? 'bg-zinc-100 text-black border-zinc-200' 
                         : 'bg-zinc-900 border-white/5 text-zinc-400'
                      }`}>
                        #{exIdx + 1}
                      </div>

                      <div className="flex-1 min-w-0 w-full overflow-hidden text-left leading-none space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 w-full">
                           <h4 className={`text-sm md:text-base font-[900] tracking-tight uppercase truncate leading-none ${isExpanded ? 'text-white' : 'text-zinc-200'}`}>
                              {ex.name}
                           </h4>
                           <span className={`text-[7px] font-black tracking-widest uppercase font-mono px-1.5 py-0.5 rounded leading-none shrink-0 ${isExpanded ? 'bg-zinc-800 text-white' : 'bg-zinc-950 text-zinc-500'}`}>
                             {ex.muscleGroup.substring(0, 3)}
                           </span>
                        </div>
                        {/* Dynamic Quick Tag Descriptor line */}
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-3 text-zinc-500 font-mono text-[9px] mt-1 shrink-0 whitespace-nowrap overflow-hidden leading-none h-3">
                           {(!isExpanded && ex.dropSet) && <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1 rounded font-bold">Dropset</span>}
                           {(!isExpanded && ex.biSet) && <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1 rounded font-bold">Biset</span>}
                           {(!isExpanded && ex.cluster) && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 rounded font-bold">Cluster Set</span>}
                           {(!isExpanded && ex.isometria) && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded font-bold">Isometria</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 shrink-0 pl-11 sm:pl-0 w-full sm:w-auto mt-1 sm:mt-0 justify-between sm:justify-end border-t border-white/[0.03] sm:border-none pt-2 sm:pt-0">
                       <span className="bg-[#15171E] border border-white/5 py-1 px-3 md:px-4 rounded-lg text-xs md:text-sm font-black font-mono tracking-widest uppercase text-white shadow-inner">
                         {ex.sets} × {ex.reps}
                       </span>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           onRemoveExercise(ex.id);
                         }}
                         className="p-1.5 md:p-2 text-zinc-600 hover:text-white bg-transparent hover:bg-rose-500 hover:border-rose-500 border border-transparent rounded-lg transition-all"
                       >
                         <Trash2 size={13} strokeWidth={2.5}/>
                       </button>
                    </div>
                  </div>

                  {/* Expanded Builder Area for this Exercise Block */}
                  {isExpanded && (
                    <div className="p-4 md:p-6 bg-[#0B0C0E] border-t border-white/10 space-y-5 rounded-b-[14px]">
                      
                      {/* Name input row if custom modification is needed */}
                      <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => onUpdateExerciseField(ex.id, 'name', e.target.value)}
                          className="w-full bg-transparent text-lg md:text-xl font-[900] text-accent tracking-tighter uppercase italic border-b border-white/10 pb-1 focus:outline-none focus:border-accent selection:bg-accent/30"
                          placeholder="Nome da Máquina ou Exercício..."
                      />

                      {/* Main Data Variables Editor Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-end">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Séries Ativas</label>
                          <select 
                            value={ex.sets}
                            onChange={(e) => onUpdateExerciseField(ex.id, 'sets', parseInt(e.target.value))}
                            className="w-full bg-zinc-950 border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-bold font-mono focus:outline-none focus:border-white/30"
                          >
                            {[1,2,3,4,5,6,7,8,10].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Repetições <span className="text-zinc-700 ml-0.5 italic lowercase">(ou faixa)</span></label>
                          <input 
                            type="text" 
                            value={ex.reps}
                            onChange={(e) => onUpdateExerciseField(ex.id, 'reps', e.target.value)}
                            placeholder="ex: 8-12"
                            className="w-full bg-zinc-950 border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-bold font-mono focus:outline-none focus:border-white/30 placeholder:text-zinc-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Intervalo (s)</label>
                          <select 
                            value={ex.rest}
                            onChange={(e) => onUpdateExerciseField(ex.id, 'rest', parseInt(e.target.value))}
                            className="w-full bg-zinc-950 border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-bold font-mono focus:outline-none focus:border-white/30"
                          >
                            {[15,30,45,60,90,120,150,180].map(v => <option key={v} value={v}>{v}s</option>)}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Grupo Base</label>
                          <select 
                            value={ex.muscleGroup}
                            onChange={(e) => onUpdateExerciseField(ex.id, 'muscleGroup', e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-bold uppercase focus:outline-none focus:border-white/30"
                          >
                            {['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Isquiotibiais', 'Glúteos', 'Panturrilha', 'Abdômen', 'Manguito', 'Livre'].map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Technical Mods Metadatas Tags Row */}
                      <div className="border border-white/5 bg-zinc-950/40 rounded-xl py-3 px-4">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono block mb-2.5">Variáveis Avançadas </span>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          {[
                            { id: 'falha', label: 'Até a Falha Total', color: 'red' },
                            { id: 'dropSet', label: 'Apply Drop-Set', color: 'rose' },
                            { id: 'biSet', label: 'Conjugado (BiSet)', color: 'purple' },
                            { id: 'restPause', label: 'Rest-Pause (10s)', color: 'zinc' },
                            { id: 'cluster', label: 'Cluster Sets', color: 'amber' },
                            { id: 'isometria', label: 'Isometria de Pico', color: 'emerald' },
                          ].map(t => (
                            <label key={t.id} className={`flex items-center gap-2 cursor-pointer select-none px-3 md:px-4 py-1.5 border rounded border-white/[0.04] transition-all hover:bg-white/[0.04] text-[9.5px] uppercase tracking-wide font-black`}>
                               <input 
                                 type="checkbox" 
                                 className="hidden"
                                 checked={ex[t.id as keyof Exercise] === true}
                                 onChange={(e) => onUpdateExerciseField(ex.id, t.id as keyof Exercise, e.target.checked)}
                               />
                               <span className={`w-3.5 h-3.5 rounded flex shrink-0 items-center justify-center border font-mono transition-colors ${
                                  ex[t.id as keyof Exercise] ? `bg-white text-[#050505] border-white` : `bg-[#09090B] text-transparent border-zinc-600`
                               }`}>
                                  <X size={10} strokeWidth={4} />
                               </span>
                               <span className={ex[t.id as keyof Exercise] ? `text-white` : 'text-zinc-500'}>{t.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Optional observation metadata text box */}
                      <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono shrink-0 pl-0.5">Observações da Prescrição ou Set Point Inicial</label>
                          <textarea 
                             rows={1}
                             placeholder="Dica técnica para a execução pelo aluno ou anotação de restrição articular..."
                             className="w-full bg-zinc-950/40 border border-white/[0.05] focus:bg-zinc-950 focus:border-white/10 text-white rounded-lg px-4 py-2.5 text-xs font-medium placeholder-zinc-700 transition-all font-sans resize-none"
                             value={ex.notes === '0' ? '' : ex.notes}
                             onChange={(e) => onUpdateExerciseField(ex.id, 'notes', e.target.value)}
                          />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* ADD CUSTOM BUTTON FOOTER BLOCK */}
          <button 
             onClick={onAddCustomExercise}
             className="w-full max-w-[1100px] mx-auto py-5 border-2 border-dashed border-white/5 hover:border-white/20 mt-4 rounded-[14px] bg-transparent text-zinc-500 hover:text-white uppercase tracking-widest text-[9.5px] font-black transition-all flex items-center justify-center gap-2.5 group cursor-pointer shadow-sm hover:bg-white/[0.02]"
          >
             <Plus size={14} className="group-hover:scale-125 transition-transform" />
             Criar Cartão / Exercício Livre Manualmente
          </button>
        </div>
      </div>
    </div>
  );
};
