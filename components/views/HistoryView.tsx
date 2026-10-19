import { getDivisionThumbnail, getExerciseThumbnail, getThumbnailPlan, retryThumbnail } from '../../src/utils/workoutThumbnails';
import type { ThumbnailPlan } from '../../src/utils/workoutThumbnails';
import { getExerciseDetails } from '../../src/utils/exerciseUtils';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, Dumbbell, Flame } from 'lucide-react';
import { useStore } from '../../store';
import type { WorkoutHistoryEntry } from '../../types';

const dateLabel = (date: string) => new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
const completedSets = (entry: WorkoutHistoryEntry) => entry.exercises.reduce((n, ex) => n + ex.performance.filter(s => s.completed).length, 0);
const groupOf = (entry: WorkoutHistoryEntry) => {
  const title = entry.workoutTitle.toLowerCase();
  if (/peito/.test(title)) return 'Peito';
  if (/costas|costa/.test(title)) return 'Costas';
  if (/quadríceps|posterior|glúteo|pernas/.test(title)) return 'Pernas';
  if (/ombro/.test(title)) return 'Ombros';
  return 'Todos';
};

const ExerciseThumbnail = ({ name, plan }: { name: string; plan: ThumbnailPlan }) => {
  const [unavailable, setUnavailable] = useState(false);
  return unavailable ? <Dumbbell size={22} /> : <img className="w-11 h-12 object-contain rounded-lg shrink-0" src={getExerciseThumbnail({ name }, plan) || getExerciseDetails(name).gif} alt="" loading="lazy" onError={event => { if (!retryThumbnail(event.currentTarget, getExerciseDetails(name).gif)) setUnavailable(true); }} />;
};

export const HistoryView: React.FC = () => {
  const user = useStore(s => s.user);
  const [filter, setFilter] = useState('Todos');
  const [selected, setSelected] = useState<WorkoutHistoryEntry | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, [selected, filter]);
  if (!user) return null;

  if (selected) {
    const volume = selected.exercises.reduce((n, ex) => n + ex.performance.filter(s => s.completed).reduce((sum, set) => sum + set.weight * set.reps, 0), 0);
    const seconds = selected.duration;
    const duration = seconds === undefined ? '—' : `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

    return (
      <section className="horus-history horus-history-detail w-full min-h-screen flex flex-col justify-start pt-8 sm:pt-6 px-3 pb-32 bg-transparent font-sans text-zinc-950">
        <button aria-label="Voltar ao Histórico" onClick={() => setSelected(null)} className="w-10 h-10 rounded-xl bg-white border border-zinc-200 shadow-sm grid place-items-center mb-3"><ArrowLeft size={18} /></button>

        <div className="horus-blue-card rounded-[22px] p-4 bg-gradient-to-br from-[#2563EB] to-[#0A192F] border border-white/10 text-white shadow-lg mb-3">
          <span className="text-[8px] font-mono font-black uppercase tracking-[0.22em] text-white/60">{dateLabel(selected.date)}</span>
          <h1 className="text-[22px] font-black uppercase tracking-tight leading-tight mt-1">{selected.workoutTitle}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[9px] font-mono font-bold uppercase">
            <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/10">{selected.exercises.length} exercícios</span>
            <span className="px-2 py-1 rounded-lg bg-white/10 border border-white/10">{completedSets(selected)} séries</span>
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-300/20 text-emerald-200">Concluído</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="horus-blue-card rounded-xl p-3 bg-gradient-to-br from-[#2563EB] to-[#122C60] text-white border border-white/10 shadow-lg"><Clock3 size={15} className="mb-2 text-white/80" /><strong className="block font-mono text-sm">{duration}</strong><span className="text-[8px] uppercase tracking-wider text-white/60">Duração</span></div>
          <div className="horus-blue-card rounded-xl p-3 bg-gradient-to-br from-[#2563EB] to-[#122C60] text-white border border-white/10 shadow-lg"><Dumbbell size={15} className="mb-2 text-white/80" /><strong className="block font-mono text-sm">{volume.toLocaleString('pt-BR')} kg</strong><span className="text-[8px] uppercase tracking-wider text-white/60">Volume</span></div>
          <div className="horus-blue-card rounded-xl p-3 bg-gradient-to-br from-[#2563EB] to-[#122C60] text-white border border-white/10 shadow-lg"><Flame size={15} className="mb-2 text-amber-300" /><strong className="block font-mono text-sm">{completedSets(selected)}</strong><span className="text-[8px] uppercase tracking-wider text-white/60">Séries</span></div>
        </div>

        <div className="space-y-2">
          {selected.exercises.map((ex, index) => {
            const key = `${ex.exerciseId}-${index}`;
            const open = expanded === key;
            return <div key={key}>
              <button onClick={() => setExpanded(open ? null : key)} className="horus-blue-card w-full rounded-2xl p-3.5 flex items-center gap-3 text-left bg-gradient-to-br from-[#2563EB] to-[#122C60] text-white border border-white/10 shadow-lg">
                <span className="w-9 h-9 rounded-xl bg-white/15 border border-white/10 grid place-items-center font-mono text-xs font-black">{index + 1}</span>
                <ExerciseThumbnail name={ex.name} plan={getThumbnailPlan(user.username, { id: selected.workoutId })} /><span className="min-w-0 flex-1"><strong className="block text-xs font-black uppercase tracking-tight leading-tight">{ex.name}</strong><small className="block mt-1 text-[9px] text-white/60 font-mono">{ex.performance.filter(s => s.completed).length} séries registradas</small></span>
                <ChevronRight size={16} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
              </button>
              {open && <div className="horus-blue-card mx-2 -mt-1 rounded-b-2xl bg-[#0A192F] text-white/80 border border-white/10 border-t-0 p-3 space-y-1.5">{ex.performance.map((set, i) => <div key={i} className="flex items-center justify-between text-[10px] font-mono"><span>Série {i + 1}</span><span>{set.weight.toLocaleString('pt-BR', { useGrouping: false, maximumFractionDigits: 20 })} kg · {set.durationSeconds !== undefined ? `${set.durationSeconds}s` : `${set.reps} reps`} {set.completed ? '✓' : '—'}</span></div>)}</div>}
            </div>;
          })}
        </div>
      </section>
    );
  }

  const history = user.history.filter(entry => filter === 'Todos' || groupOf(entry) === filter);

  return (
    <section className="horus-history w-full min-h-screen flex flex-col justify-start pt-12 sm:pt-6 px-3 pb-32 bg-transparent font-sans text-zinc-950">
      <div className="space-y-1 px-1 shrink-0 mb-4 text-left">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#2563EB] font-mono">Evolução</span>
        <h1 className="text-xl font-extrabold tracking-tight leading-none mt-1 text-zinc-950 font-[900]">Histórico</h1>
        <p className="text-xs leading-normal text-zinc-500 font-semibold">Acompanhe seus treinos concluídos.</p>
      </div>

      <div className="horus-history-filters flex gap-2 overflow-x-auto no-scrollbar px-1 mb-4">
        {['Todos','Peito','Costas','Pernas','Ombros'].map(label => <button key={label} aria-pressed={filter === label} onClick={() => setFilter(label)} className={`shrink-0 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${filter === label ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'bg-white border-zinc-200 text-zinc-500'}`}>{label}</button>)}
      </div>

      <div className="space-y-3 px-1">
        {history.map(entry => <button key={entry.id} onClick={() => { setSelected(entry); setExpanded(null); }} className="horus-blue-card horus-history-entry w-full rounded-2xl p-4 text-left bg-gradient-to-br from-[#2563EB] to-[#122C60] border border-white/10 text-white shadow-lg active:scale-[0.99] transition-transform">
          <div className="flex items-start gap-3">
            <div className="horus-history-art w-11 h-11 rounded-xl bg-white/15 border border-white/10 grid place-items-center shrink-0">{getDivisionThumbnail({ id: entry.workoutId, title: entry.workoutTitle }, getThumbnailPlan(user.username, { id: entry.workoutId })) ? <img src={getDivisionThumbnail({ id: entry.workoutId, title: entry.workoutTitle }, getThumbnailPlan(user.username, { id: entry.workoutId }))} alt="" loading="lazy" /> : entry.exercises[0] ? <ExerciseThumbnail name={entry.exercises[0].name} plan={getThumbnailPlan(user.username, { id: entry.workoutId })} /> : <Dumbbell size={18} />}</div>
            <div className="min-w-0 flex-1">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-white/55">{dateLabel(entry.date)}</span>
              <h2 className="text-[14px] font-black uppercase tracking-tight leading-tight mt-1">{entry.workoutTitle}</h2>
              <div className="flex gap-2 mt-2 text-[8px] font-mono uppercase text-white/70"><span>{entry.exercises.length} exercícios</span><span>•</span><span>{entry.duration === undefined ? 'sem duração' : `${Math.floor(entry.duration / 60)} min`}</span></div>
            </div>
            <div className="flex items-center gap-1 text-emerald-200 text-[8px] font-black uppercase"><CheckCircle2 size={15} /><ChevronRight size={15} className="text-white/60" /></div>
          </div>
        </button>)}
        {!history.length && <div className="horus-blue-card rounded-2xl p-6 text-center bg-gradient-to-br from-[#2563EB] to-[#122C60] text-white border border-white/10 shadow-lg"><Dumbbell size={24} className="mx-auto mb-2" /><h2 className="font-black uppercase text-sm">Nenhum treino registrado</h2><p className="text-xs text-white/60 mt-1">Seus treinos concluídos aparecerão aqui.</p></div>}
      </div>
    </section>
  );
};
