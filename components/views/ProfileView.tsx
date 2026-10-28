import { CardioPanel } from './CardioPanel';
import { AppTab } from '../../types';
import React, { useRef, useState } from 'react';
import { Check, ChevronRight, CircleHelp, Dumbbell, Edit2, Flame, LogOut, Settings, Trophy, X, Zap } from 'lucide-react';
import { useStore } from '../../store';

export const ProfileView: React.FC = () => {
  const { user, updateUserProfile, setThemePreference, themePreference, setActiveTab, logout, addToast } = useStore();
  const [panel, setPanel] = useState<'edit' | 'settings' | 'help' | 'badges' | 'cardio' | null>(null);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const photoInput = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState(false);

  if (!user) return null;

  const selectPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas indisponível');
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        context.fillStyle = '#fff';
        context.fillRect(0, 0, 256, 256);
        context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 256, 256);
        updateUserProfile({ avatar: canvas.toDataURL('image/jpeg', 0.8) });
        setPhotoError(false);
      } catch {
        addToast?.('Não foi possível salvar a foto. Tente outra imagem.', 'error');
      } finally { URL.revokeObjectURL(url); }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      addToast?.('Não foi possível abrir a foto. Selecione uma imagem JPG, PNG ou WebP.', 'error');
    };
    image.src = url;
  };

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthDays = new Set(user.checkIns.filter(date => date.startsWith(month))).size;
  const initials = user.name.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'AT';
  const achievements = [
    { label: 'Primeiro treino', icon: Trophy, unlocked: user.badges?.some(b => b.id === 'first_workout') },
    { label: 'Consistência', icon: Zap, unlocked: user.badges?.some(b => b.id === 'ten_workouts') },
    { label: 'Hábito', icon: Dumbbell, unlocked: user.badges?.some(b => b.id === 'seven_day_streak') },
    { label: 'Foco', icon: Flame, unlocked: user.badges?.some(b => /foco/i.test(b.name)) }
  ];

  return (
    <section className="horus-profile w-full min-h-screen flex flex-col justify-start pt-12 sm:pt-6 px-3 pb-32 bg-transparent font-sans antialiased select-none relative text-zinc-950">
      <div className="space-y-1 px-1 shrink-0 mb-4 text-left">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#2563EB] font-mono">SUA CONTA</span>
        <h1 className="text-xl font-extrabold tracking-tight leading-none mt-1 text-zinc-950 font-[900]">Meu Perfil</h1>
        <p className="text-xs leading-normal text-zinc-500 font-semibold">Monitore sua evolução e dados de atleta.</p>
      </div>

      <div className="w-full space-y-4 px-1">
        <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={selectPhoto} />
        <div className="horus-blue-card horus-profile-identity rounded-2xl p-4 flex items-center justify-between gap-4 border bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10 text-white shadow-lg">
          <div className="flex items-center gap-3.5 min-w-0">
            <button aria-label="Trocar foto de perfil" onClick={() => photoInput.current?.click()} className="horus-profile-avatar w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden text-base font-black shrink-0 border bg-white/15 border-white/10 text-white relative">
              {user.avatar && !photoError ? <img src={user.avatar} alt="Foto de perfil" className="w-full h-full object-cover" onError={() => setPhotoError(true)} /> : initials}
              <span className="absolute right-1 bottom-1 w-5 h-5 rounded-full bg-white text-[#2563EB] grid place-items-center"><Edit2 size={10} /></span>
            </button>
            <div className="min-w-0 text-left">
              <span className="text-[7.5px] font-mono font-extrabold uppercase tracking-widest block mb-1 text-white/60">Membro Horus</span>
              <h2 className="text-[15px] font-black text-white uppercase tracking-tight leading-none truncate mb-1.5">{user.name}</h2>
              <p className="text-[9px] font-mono font-bold leading-none uppercase text-white/80">{user.goal || 'Atleta'}</p>
            </div>
          </div>
          <button aria-label="Editar perfil" onClick={() => { setName(user.name); setGoal(user.goal || 'Atleta'); setPanel('edit'); }} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border bg-white/15 border-white/10 text-white"><Edit2 size={13} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="horus-blue-card p-4 rounded-2xl space-y-3 border bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10 text-white shadow-lg">
            <span className="text-[7.5px] font-extrabold tracking-[0.2em] uppercase font-mono block text-white/60">Consistência</span>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline"><span className="text-[8px] uppercase tracking-wider text-white/70 font-mono">TOTAL</span><strong className="font-mono text-xs">{user.totalWorkouts || 0}</strong></div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-baseline"><span className="text-[8px] uppercase tracking-wider text-white/70 font-mono">STREAK</span><strong className="font-mono text-xs text-amber-300">{user.streak || 0} dias</strong></div>
            </div>
          </div>
          <div className="horus-blue-card p-4 rounded-2xl space-y-3 border bg-gradient-to-br from-[#2563EB] to-[#122C60] border-white/10 text-white shadow-lg">
            <span className="text-[7.5px] font-extrabold tracking-[0.2em] uppercase font-mono block text-white/60">Este mês</span>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline"><span className="text-[8px] uppercase tracking-wider text-white/70 font-mono">DIAS</span><strong className="font-mono text-xs">{monthDays}</strong></div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-baseline"><span className="text-[8px] uppercase tracking-wider text-white/70 font-mono">BADGES</span><strong className="font-mono text-xs">{user.badges?.length || 0}</strong></div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-left">
          <span className="text-[7.5px] font-extrabold tracking-[0.2em] uppercase font-mono block px-0.5 text-zinc-500">Galeria de Conquistas</span>
          <div className="grid grid-cols-4 gap-2">
            {achievements.map(item => {
              const Icon = item.icon;
              return <button key={item.label} onClick={() => setPanel('badges')} className={`horus-blue-card flex flex-col items-center justify-center text-center py-2.5 px-1 rounded-2xl border transition-all ${item.unlocked ? 'bg-gradient-to-br from-[#2563EB] to-[#122C60] border-transparent text-white shadow-md' : 'bg-zinc-100 border-zinc-200 text-zinc-500'}`}>
                <div className={`p-1.5 rounded-xl border ${item.unlocked ? 'bg-white/15 border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-400'}`}><Icon size={14} /></div>
                <p className="text-[8px] font-black uppercase tracking-tight mt-1.5 truncate max-w-full">{item.label.split(' ')[0]}</p>
              </button>;
            })}
          </div>
        </div>

        <div className="space-y-2">
          <button className="horus-blue-card redesign-profile-row" onClick={()=>setActiveTab(AppTab.HISTORY)}>Histórico de treinos <ChevronRight size={18}/></button>
          {user.username.toLowerCase() === 'henrique' && <button className="horus-blue-card redesign-profile-row" onClick={()=>setPanel('cardio')}>Registros de cardio <ChevronRight size={18}/></button>}
          <button onClick={() => setPanel('settings')} className="horus-blue-card w-full rounded-2xl p-4 flex items-center gap-3 bg-gradient-to-br from-[#2563EB] to-[#122C60] text-white border border-white/10 shadow-lg text-left"><span className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center"><Settings size={16} /></span><span className="flex-1 font-black uppercase text-xs tracking-wide">Aparência</span><ChevronRight size={18} /></button>
          <button onClick={() => setPanel('help')} className="horus-blue-card w-full rounded-2xl p-4 flex items-center gap-3 bg-gradient-to-br from-[#2563EB] to-[#122C60] text-white border border-white/10 shadow-lg text-left"><span className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center"><CircleHelp size={16} /></span><span className="flex-1 font-black uppercase text-xs tracking-wide">Ajuda e Suporte</span><ChevronRight size={18} /></button>
        </div>
      </div>

      {panel && <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPanel(null)}>
        <div role="dialog" aria-modal="true" aria-label="Opções do perfil" className="redesign-profile-panel w-full max-w-sm rounded-2xl bg-white border border-zinc-200 p-5 shadow-2xl relative text-left" onClick={e => e.stopPropagation()}>
          <button className="absolute right-3 top-3 w-8 h-8 rounded-lg bg-zinc-100 grid place-items-center" aria-label="Fechar painel" onClick={() => setPanel(null)}><X size={16} /></button>
          {panel === 'edit' && <form className="space-y-4" onSubmit={e => { e.preventDefault(); updateUserProfile({ name: name.trim() || user.name, goal: goal.trim() || 'Atleta' }); setPanel(null); }}>
            <h2 className="text-lg font-black uppercase">Editar atleta</h2>
            <button type="button" onClick={() => photoInput.current?.click()} className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-black uppercase text-xs">Trocar foto</button>
            <label className="block text-xs font-bold">Nome<input className="mt-1 w-full border border-zinc-200 rounded-xl px-3 py-3" value={name} onChange={e => setName(e.target.value)} /></label>
            <label className="block text-xs font-bold">Identificação esportiva<input className="mt-1 w-full border border-zinc-200 rounded-xl px-3 py-3" value={goal} onChange={e => setGoal(e.target.value)} /></label>
            <button className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2"><Check size={15} />Salvar</button>
          </form>}
          {panel === 'cardio' && <CardioPanel/>}
          {panel === 'settings' && <div className="space-y-3"><h2 className="text-lg font-black">Aparência</h2><fieldset className="redesign-theme-options"><legend>Tema do aplicativo</legend>{([['light','Claro'],['dark','Escuro'],['auto','Automático']] as const).map(([value,label])=><label key={value}><input type="radio" name="appearance" checked={themePreference===value} onChange={()=>setThemePreference(value)}/>{label}</label>)}</fieldset><p className="redesign-theme-hint">Automático acompanha a aparência do seu iPhone.</p><button className="w-full bg-zinc-900 text-white py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2" onClick={logout}><LogOut size={15} />Sair</button></div>}
          {panel === 'help' && <div className="space-y-3"><h2 className="text-lg font-black uppercase">Ajuda e Suporte</h2><p className="text-sm text-zinc-600">Selecione uma rotina em Treinos e registre suas séries durante a execução. Consulte os resultados na aba Histórico.</p></div>}
          {panel === 'badges' && <div className="space-y-3"><h2 className="text-lg font-black uppercase">Suas conquistas</h2>{user.badges?.length ? user.badges.map(b => <div key={b.id} className="horus-blue-card rounded-xl bg-gradient-to-br from-[#2563EB] to-[#122C60] text-white p-3"><strong className="text-sm">{b.name}</strong><p className="text-xs text-white/70 mt-1">{b.description}</p></div>) : <p className="text-sm text-zinc-600">Suas conquistas aparecerão aqui conforme você treina.</p>}</div>}
        </div>
      </div>}
    </section>
  );
};
