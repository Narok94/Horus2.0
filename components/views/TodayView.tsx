import React from 'react';
import { Check, Play } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { useStore } from '../../store';
import { AppTab } from '../../types';
import { abcOnDay, activeWorkouts } from '../../data/henriqueABC';
import { getDivisionThumbnail, getThumbnailPlan } from '../../src/utils/workoutThumbnails';
import { localDay, usePersonalClock } from '../../src/utils/personalData';

export const TodayView = () => {
  const { user, allWorkouts, setActiveTab, setSelectedWorkout, selectedWorkout, isWorkoutActive } = useStore();
  const now = usePersonalClock();
  if (!user) return null;
  const today = localDay(now);
  const routines = activeWorkouts(allWorkouts[user.username.toLowerCase()] || []);
  const last = user.history.find(entry => routines.some(workout => workout.id === entry.workoutId));
  const nextIndex = last ? (routines.findIndex(workout => workout.id === last.workoutId) + 1) % routines.length : 0;
  const planned = user.username.toLowerCase() === 'henrique' ? abcOnDay(today) : routines[nextIndex];
  const workout = isWorkoutActive && selectedWorkout ? selectedWorkout : routines.find(item => item.id === planned?.id);
  const cover = workout && getDivisionThumbnail(workout, getThumbnailPlan(user.username, workout));
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7);
  const week = Array.from({length:7}, (_,index) => { const date = new Date(monday); date.setDate(date.getDate() + index); return localDay(date); });
  const count = week.slice(0,5).filter(day => user.checkIns.includes(day)).length;
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
  const open = () => { if (!isWorkoutActive && workout) setSelectedWorkout(workout); setActiveTab(AppTab.WORKOUT); };
  return <section className="redesign-today">
    <header className="redesign-greeting"><div><div className="redesign-brand"><BrandLogo/><span>HÓRUS GYM</span></div><h1>{greeting}, {user.name.split(' ')[0]}</h1><p>{now.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</p></div><button className="redesign-avatar" aria-label="Abrir perfil" onClick={()=>setActiveTab(AppTab.PROFILE)}>{user.avatar ? <img src={user.avatar} alt=""/> : user.name.slice(0,2).toUpperCase()}</button></header>
    <article className="redesign-week"><div><h2>Progresso da semana</h2><strong>{count}/5</strong></div><ol>{week.map((day,index)=><li key={day}><span className={user.checkIns.includes(day) ? 'done' : day===today ? 'current' : ''} aria-label={`${day}${user.checkIns.includes(day) ? ', treino realizado' : day===today ? ', hoje' : ''}`}>{user.checkIns.includes(day) ? <Check size={19}/> : ['SEG','TER','QUA','QUI','SEX','SÁB','DOM'][index]}</span><small>{['SEG','TER','QUA','QUI','SEX','SÁB','DOM'][index]}</small></li>)}</ol></article>
    <section className="redesign-today-workout"><h2>Treino de hoje</h2>{cover ? <img className="redesign-today-cover" src={cover} alt={workout.title}/> : <div className="redesign-rest"><h3>Dia de descanso</h3><p>Recupere as energias para o próximo treino.</p></div>}<button className="redesign-primary" onClick={open}><Play size={16} fill="currentColor"/>{isWorkoutActive ? 'Continuar treino' : workout ? 'Iniciar treino' : 'Ver meus treinos'}</button></section>
  </section>;
};
