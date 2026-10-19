import { useHenriqueDiet } from '../../src/hooks/useHenriqueDiet';
import { BrandLogo } from '../ui/BrandLogo';
import React, { useState } from 'react';
import { ArrowUpRight, CalendarDays, Utensils } from 'lucide-react';
import { useStore } from '../../store';
import { AppTab } from '../../types';
import { DashboardView } from './DashboardView';
import { isPersonalUser, localDay, usePersonalAgenda, usePersonalClock } from '../../src/utils/personalData';
export const TodayView = () => { const user = useStore(s => s.user); return isPersonalUser(user?.username) ? <PersonalToday /> : null; };
const PersonalToday = () => {
    const { user, setActiveTab } = useStore();
    const now = usePersonalClock();
    const today = localDay(now);
    const [agenda] = usePersonalAgenda();
    const { diet, blocked: dietBlocked } = useHenriqueDiet();
    const [avatarError, setAvatarError] = useState(false);
    if (!user)
        return null;
    const time = now.toTimeString().slice(0, 5);
    const next = [...agenda].filter(a => a.date > today || (a.date === today && a.time >= time)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
    const done = diet.completed[today] || [];
    const meals = [...diet.meals].sort((a, b) => a.time.localeCompare(b.time));
    const pending = meals.filter(m => !done.includes(m.id));
    const nextMeal = pending.find(m => m.time >= time) || pending[0];
    const complete = meals.filter(m => done.includes(m.id)).length;
    const trained = user.history.some(entry => localDay(new Date(entry.date)) === today);
    const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
    return <section className="personal-page personal-today"><header className="personal-today-header"><div><span className="personal-eyebrow horus-brand-eyebrow"><BrandLogo className="horus-header-logo" /><span>HÓRUS GYM</span></span><h1>{greeting}, {user.name.split(' ')[0]}</h1><p>{now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div><button className="personal-avatar" aria-label="Abrir perfil" onClick={() => setActiveTab(AppTab.PROFILE)}>{user.avatar && !avatarError ? <img src={user.avatar} alt="Foto de perfil" onError={() => setAvatarError(true)}/> : user.name.slice(0, 2).toUpperCase()}</button></header>
  <article className="personal-card horus-blue-card"><div className="personal-between"><span className="personal-eyebrow"><CalendarDays size={15}/>PRÓXIMO COMPROMISSO</span><button aria-label="Abrir Agenda" onClick={() => setActiveTab(AppTab.AGENDA)}><ArrowUpRight size={21}/></button></div>{next ? <><div className="personal-next-time">{next.time}<span>{next.date === today ? 'Hoje' : new Date(next.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span></div><h2>{next.title}</h2>{next.category && <span className="personal-tag">{next.category}</span>}</> : <><h2>Seu dia está livre</h2><p>Nenhum compromisso agendado.</p><button className="personal-link" onClick={() => setActiveTab(AppTab.AGENDA)}>Planejar meu dia →</button></>}</article>
  <DashboardView compact/>
  <article className="personal-card horus-blue-card"><div className="personal-between"><span className="personal-eyebrow"><Utensils size={15}/>SUA ALIMENTAÇÃO</span><button aria-label="Abrir Dieta" onClick={() => setActiveTab(AppTab.DIET)}><ArrowUpRight size={21}/></button></div><p>{dietBlocked ? 'Cadastro alimentar indisponível' : nextMeal ? (nextMeal.time < time ? 'Refeição pendente' : 'Próxima refeição') : meals.length ? 'Tudo realizado por hoje' : 'Seu plano alimentar'}</p><h2>{dietBlocked ? 'Seus dados foram preservados' : nextMeal ? nextMeal.name + ' · ' + nextMeal.time : meals.length ? 'Dia alimentar concluído' : 'Plano disponível para carregar'}</h2><div className="personal-progress"><span style={{ width: (meals.length ? complete / meals.length * 100 : 0) + '%' }}/></div>{meals.length ? <p>{complete} de {meals.length} refeições realizadas</p> : <button className="personal-link" onClick={() => setActiveTab(AppTab.DIET)}>{dietBlocked ? 'Ver cadastro na Dieta →' : 'Ver plano na Dieta →'}</button>}</article>
  <div className="personal-quick horus-blue-card" aria-label="Resumo do dia"><div><strong>{agenda.filter(a => a.date === today).length}</strong><span>compromissos</span></div><div><strong>{trained ? 'Concluído' : 'Pendente'}</strong><span>treino do dia</span></div><div><strong>{complete}/{meals.length}</strong><span>refeições · {pending.length} pendentes</span></div></div>
  </section>;
};
