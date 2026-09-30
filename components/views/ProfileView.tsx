import React, { useState } from 'react';
import { Edit2, Trophy, Zap, Dumbbell, Flame, Settings, CircleHelp, ChevronRight, X, Check, LogOut } from 'lucide-react';
import { useStore } from '../../store';

export const ProfileView: React.FC = () => {
  const { user, updateUserProfile, toggleTheme, logout, theme } = useStore();
  const [panel, setPanel] = useState<'edit' | 'settings' | 'help' | 'badges' | null>(null);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  if (!user) return null;
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthDays = new Set(user.checkIns.filter(date => date.startsWith(month))).size;
  const initials = user.name.trim().slice(0, 2).toUpperCase();
  const achievements = [
    { label: 'Primeiro Treino', icon: Trophy, color: 'cyan', unlocked: user.badges?.some(b => b.id === 'first_workout') },
    { label: 'Consistência', icon: Zap, color: 'gold', unlocked: user.badges?.some(b => b.id === 'ten_workouts') },
    { label: 'Hábito', icon: Dumbbell, color: 'white', unlocked: user.badges?.some(b => b.id === 'seven_day_streak') },
    { label: 'Foco', icon: Flame, color: 'rose', unlocked: user.badges?.some(b => /foco/i.test(b.name)) }
  ];
  return <section className="horus-screen horus-profile">
    <header className="horus-page-header"><h1>Meu Perfil</h1><p>Monitore sua evolução e personalize sua experiência.</p></header>
    <div className="horus-user-card"><span className="horus-avatar">{initials}</span><div className="flex-1 min-w-0"><h2>{user.name}</h2><p>{user.goal || 'Atleta'}</p></div><button className="horus-edit-button" aria-label="Editar perfil" onClick={() => { setName(user.name); setGoal(user.goal || 'Atleta'); setPanel('edit'); }}><Edit2 size={22} /></button></div>
    <div className="horus-consistency"><h2><span className="horus-small-icon"><Flame size={22} /></span>Consistência</h2><div className="horus-consistency-grid"><div><strong>{user.totalWorkouts}</strong><span>Treinos<br />realizados</span></div><div><strong>{user.streak}</strong><span>Dias<br />em sequência</span></div><div><strong>{monthDays}</strong><span>Dias<br />no mês</span></div></div></div>
    <div className="horus-section-title"><h2>Conquistas</h2><button onClick={() => setPanel('badges')}>Ver todas <ChevronRight size={16} /></button></div>
    <div className="horus-achievements">{achievements.map(item => <button key={item.label} className="horus-achievement" onClick={() => setPanel('badges')} aria-label={`${item.label}${item.unlocked ? ', conquistado' : ', não conquistado'}`}><span className={`horus-badge-icon ${item.color}`}><item.icon size={28} /></span><span>{item.label}</span></button>)}</div>
    <div className="horus-profile-links"><button className="horus-card" onClick={() => setPanel('settings')}><span className="horus-small-icon"><Settings size={25} /></span><span>Configurações</span><ChevronRight size={22} /></button><button className="horus-card" onClick={() => setPanel('help')}><span className="horus-small-icon"><CircleHelp size={25} /></span><span>Ajuda e Suporte</span><ChevronRight size={22} /></button></div>
    {panel && <div className="horus-modal-backdrop" onClick={() => setPanel(null)}><div className="horus-modal horus-card" role="dialog" aria-modal="true" aria-label={panel === 'edit' ? 'Editar perfil' : panel === 'settings' ? 'Configurações' : panel === 'help' ? 'Ajuda e Suporte' : 'Conquistas'} onClick={event => event.stopPropagation()}><button className="horus-modal-close" aria-label="Fechar" onClick={() => setPanel(null)}><X size={22} /></button>
      {panel === 'edit' && <form onSubmit={event => { event.preventDefault(); updateUserProfile({ name: name.trim() || user.name, goal: goal.trim() || 'Atleta' }); setPanel(null); }}><h2>Editar perfil</h2><label>Nome<input value={name} onChange={event => setName(event.target.value)} /></label><label>Identificação esportiva<input value={goal} onChange={event => setGoal(event.target.value)} /></label><button className="horus-action" type="submit"><Check size={18} />Salvar</button></form>}
      {panel === 'settings' && <><h2>Configurações</h2><button className="horus-action" onClick={toggleTheme}>Tema do aplicativo: {theme === 'light' ? 'claro' : 'escuro'}</button><button className="horus-action" onClick={logout}><LogOut size={18} />Sair da conta</button></>}
      {panel === 'help' && <><h2>Ajuda e Suporte</h2><p>Selecione uma rotina em Treinos e registre suas séries durante a execução. Consulte os resultados na aba Histórico.</p><p>Os dados ficam salvos neste navegador. Evite limpar os dados do site para manter seus registros.</p></>}
      {panel === 'badges' && <><h2>Suas conquistas</h2>{user.badges?.length ? user.badges.map(badge => <div className="horus-badge-detail" key={badge.id}><Trophy size={22} /><div><strong>{badge.name}</strong><p>{badge.description}</p></div></div>) : <p>Suas conquistas aparecerão aqui conforme você treina.</p>}</>}
    </div></div>}
  </section>;
};
