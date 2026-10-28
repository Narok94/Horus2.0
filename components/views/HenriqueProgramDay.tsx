import React, { useState } from 'react';
import { AppTab } from '../../types';
import { useStore } from '../../store';
import { abcOnDay, ABC_NAME, ABC_GUIDANCE } from '../../data/henriqueABC';
import { usePersonalAgenda } from '../../src/utils/personalData';

export function HenriqueProgramDay({ day }: { day: string }) {
  const { user, allWorkouts, setSelectedWorkout, setActiveTab, isWorkoutActive, addToast } = useStore();
  const [items, save, error] = usePersonalAgenda();
  const [message, setMessage] = useState('');
  if (user?.username.toLowerCase() !== 'henrique') return null;
  const workout = abcOnDay(day);
  const cardio = [1, 3, 5].includes(new Date(day + 'T12:00:00').getDay());
  const record = items.find(item => item.id === `henrique-abc-cardio:${day}`);
  return <article className="personal-card horus-blue-card henrique-program">
    <h2>{ABC_NAME}</h2><p>{ABC_GUIDANCE}</p>
    <p>Rodízio contínuo de três semanas, com início em 26/10/2026. Sábados e domingos: descanso da musculação.</p>
    <h3>{workout ? `07h30 · ${workout.title}` : 'Descanso da musculação'}</h3>
    {workout && <button className="personal-primary" onClick={() => {
      if (isWorkoutActive) { addToast?.('Uma sessão já está em andamento. Finalize ou descarte antes de iniciar outra.', 'info'); return; }
      setSelectedWorkout(allWorkouts.henrique.find(w => w.id === workout.id) || workout);
      setActiveTab(AppTab.WORKOUT);
    }}>Abrir treino</button>}
    {cardio && <><h3>11h30 · Caminhada rápida na esteira</h3>
      <p>20–25 minutos inicialmente; meta de 30 minutos. 4,5–5,5 km/h · inclinação de 2–4% · intensidade moderada.</p>
      <form key={day + (record?.description || '')} className="personal-form" onSubmit={event => {
        event.preventDefault();
        // Do not replace an unreadable agenda with a fresh cardio record.
        try { const raw = localStorage.getItem('horus_agenda_henrique');
          if (raw) { const saved = JSON.parse(raw); if (!Array.isArray(saved) || saved.some(item => !item || !['id','title','date','time','description','category'].every(key => typeof item[key] === 'string'))) throw new Error(); }
        } catch { setMessage('A agenda existente não pôde ser lida. Os registros foram preservados.'); return; }
        const form = new FormData(event.currentTarget);
        const description = `Tempo: ${form.get('tempo')} min; Distância: ${form.get('distancia')} km; Velocidade: ${form.get('velocidade')} km/h; Inclinação: ${form.get('inclinacao')}%; Conclusão: ${form.has('concluido') ? 'sim' : 'não'}`;
        if (save([...items.filter(item => item.id !== `henrique-abc-cardio:${day}`), { id: `henrique-abc-cardio:${day}`, title: 'Cardio — caminhada rápida na esteira', date: day, time: '11:30', category: 'Treino', description }])) setMessage('Registro de cardio salvo na agenda.');
      }}>
        {record && <p>{record.description}</p>}
        <div className="personal-fields">{[['tempo', 'Tempo (min)'], ['distancia', 'Distância (km)'], ['velocidade', 'Velocidade (km/h)'], ['inclinacao', 'Inclinação (%)']].map(([name, label]) => <label key={name}>{label}<input name={name} type="number" min="0" step="0.1" required defaultValue={record?.description.match(new RegExp(`${label.split(' ')[0]}: ([0-9.]+)`))?.[1]} /></label>)}</div>
        <label><input type="checkbox" name="concluido" defaultChecked={record?.description.includes('Conclusão: sim')}/>Concluído</label>
        <button className="personal-primary" type="submit">Salvar cardio na agenda</button>
      </form><p role="status">{message}</p>{error && <p role="alert">{error}</p>}</>}
  </article>;
}
