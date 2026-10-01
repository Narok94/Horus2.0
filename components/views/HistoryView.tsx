import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, Dumbbell, Flame, Activity } from 'lucide-react';
import { useStore } from '../../store';
import type { WorkoutHistoryEntry } from '../../types';
import { getExerciseDetails } from '../../src/utils/exerciseUtils';

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
const groupColor = (entry: WorkoutHistoryEntry) => ({ Peito: 'rose', Costas: 'blue', Pernas: /posterior/i.test(entry.workoutTitle) ? 'violet' : 'green', Ombros: 'gold', Todos: 'orange' }[groupOf(entry)]);

const ExerciseThumbnail = ({ name }: { name: string }) => {
  const [unavailable, setUnavailable] = useState(false);
  return unavailable ? <span className="horus-thumbnail-fallback" title="GIF indisponível"><Dumbbell size={27} /></span> :
    <img src={getExerciseDetails(name).gif} alt="" loading="lazy" onError={() => setUnavailable(true)} />;
};

export const HistoryView: React.FC = () => {
  const user = useStore(s => s.user);
  const [filter, setFilter] = useState('Todos');
  const [selected, setSelected] = useState<WorkoutHistoryEntry | null>(null);
  const [tab, setTab] = useState('Exercícios');
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => { window.scrollTo(0, 0); }, [selected, filter]);
  if (!user) return null;
  if (selected) {
    const volume = selected.exercises.reduce((n, ex) => n + ex.performance.filter(s => s.completed).reduce((sum, set) => sum + set.weight * set.reps, 0), 0);
    const seconds = selected.duration;
    const duration = seconds === undefined ? '—' : `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
    return <section className="horus-screen horus-detail">
      <button className="horus-icon-button" aria-label="Voltar ao histórico" onClick={() => setSelected(null)}><ArrowLeft size={23} /></button>
      <header className="horus-detail-header">
        <div className={`horus-muscle-icon large ${groupColor(selected)}`}><Dumbbell size={47} strokeWidth={1.25} /></div>
        <div className="min-w-0 flex-1"><p className="horus-date">{dateLabel(selected.date)}</p><h1>{selected.workoutTitle}</h1><div className="horus-detail-meta"><span>{selected.exercises.length} exercícios • {completedSets(selected)} séries</span><span className="horus-completed">Concluído</span></div></div>
      </header>
      <div className="horus-metrics horus-card">
        <div><strong><Clock3 size={20} />{duration}</strong><span>Duração</span></div>
        <div><strong><Dumbbell size={20} />{volume.toLocaleString('pt-BR')} kg</strong><span>Volume total</span></div>
        <div><strong><Flame size={20} className="horus-orange" />—</strong><span>Calorias</span></div>
      </div>
      <div className="horus-tabs" role="tablist">{['Exercícios', 'Resumo', 'Observações'].map(label => <button role="tab" aria-selected={tab === label} key={label} className={tab === label ? 'active' : ''} onClick={() => setTab(label)}>{label}</button>)}</div>
      {tab === 'Exercícios' && <div className="horus-exercise-list">{selected.exercises.map((ex, index) => <div key={`${ex.exerciseId}-${index}`}>
        <button className="horus-exercise-row horus-card" aria-expanded={expanded === `${index}`} onClick={() => setExpanded(expanded === `${index}` ? null : `${index}`)}>
          <span className="horus-order">{index + 1}</span><ExerciseThumbnail name={ex.name} /><span className="horus-row-copy"><strong>{ex.name}</strong><small>{ex.performance.filter(s => s.completed).length} séries</small></span><ChevronRight size={19} />
        </button>
        {expanded === `${index}` && <div className="horus-set-details">{ex.performance.map((set, i) => <p key={i}><span>Série {i + 1}</span><span>{set.weight} kg · {set.durationSeconds !== undefined ? `${set.durationSeconds} s` : `${set.reps} repetições`} {set.completed ? '✓' : '—'}</span></p>)}</div>}
      </div>)}</div>}
      {tab === 'Resumo' && <div className="horus-card horus-information"><h2>Resumo do treino</h2><p>{selected.exercises.length} exercícios e {completedSets(selected)} séries concluídas.</p><p>Volume registrado: {volume.toLocaleString('pt-BR')} kg.</p><p>Calorias não são registradas pelo aplicativo.</p></div>}
      {tab === 'Observações' && <div className="horus-card horus-information"><p>Não há observações salvas neste registro.</p></div>}
    </section>;
  }
  const history = user.history.filter(entry => filter === 'Todos' || groupOf(entry) === filter);
  return <section className="horus-screen">
    <header className="horus-page-header"><h1>Histórico</h1><p>Acompanhe seus treinos e evolução.</p></header>
    <div className="horus-filters">{['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros'].map(label => <button key={label} className={filter === label ? 'active' : ''} onClick={() => setFilter(label)}>{label}</button>)}</div>
    <div className="horus-history-list">{history.map(entry => <button key={entry.id} className="horus-history-row horus-card" onClick={() => { setSelected(entry); setTab('Exercícios'); setExpanded(null); }}>
      <span className={`horus-muscle-icon ${groupColor(entry)}`}>{entry.exercises[0] ? <ExerciseThumbnail name={entry.exercises[0].name} /> : <Dumbbell size={30} strokeWidth={1.5} />}</span>
      <span className="horus-row-copy"><span className="horus-date">{dateLabel(entry.date)}</span><strong>{entry.workoutTitle}</strong><small>{entry.exercises.length} exercícios • {entry.duration === undefined ? 'Duração não registrada' : `${Math.floor(entry.duration / 60)} min`}</small><small className="horus-green">Concluído</small></span><CheckCircle2 className="horus-green shrink-0" size={24} /><ChevronRight size={18} className="shrink-0" />
    </button>)}</div>
    {!history.length && <div className="horus-card horus-information"><Dumbbell size={28} /><h2>Nenhum treino registrado</h2><p>Seus treinos concluídos aparecerão aqui.</p></div>}
  </section>;
};
