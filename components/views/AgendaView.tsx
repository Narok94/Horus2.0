import React, { useState } from 'react';
import { CalendarDays, Plus, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { Appointment, categories, isPersonalUser, localDay, usePersonalAgenda, usePersonalClock } from '../../src/utils/personalData';
export const AgendaView = () => { const user = useStore(s => s.user); return isPersonalUser(user?.username) ? <PersonalAgenda /> : null; };
const PersonalAgenda = () => {
    const now = usePersonalClock();
    const today = localDay(now);
    const [items, save, error] = usePersonalAgenda();
    const [day, setDay] = useState(today);
    const [editing, setEditing] = useState<Appointment | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const sorted = [...items].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const onSave = (event: React.FormEvent) => { event.preventDefault(); if (!editing || !editing.title.trim() || !editing.date || !editing.time)
        return; if (save([...items.filter(a => a.id !== editing.id), { ...editing, title: editing.title.trim() }])) {
        setDay(editing.date);
        setEditing(null);
    } };
    const list = (rows: Appointment[], empty: string) => rows.length ? rows.map(item => <article className="personal-card appointment-row" key={item.id}><time>{item.time}<small>{new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</small></time><div className="personal-grow"><span className="personal-tag">{item.category || 'Sem categoria'}</span><h3>{item.title}</h3>{item.description && <p className="personal-prewrap">{item.description}</p>}</div><div className="personal-row-actions"><button aria-label={'Editar ' + item.title} onClick={() => { setEditing({ ...item }); setDeleting(null); }}><Pencil size={17}/></button><button aria-label={'Excluir ' + item.title} onClick={() => setDeleting(item.id)}><Trash2 size={17}/></button></div>{deleting === item.id && <div className="personal-delete"><span>Excluir este compromisso?</span><button onClick={() => { if (save(items.filter(a => a.id !== item.id)))
        setDeleting(null); }}>Excluir</button><button onClick={() => setDeleting(null)}>Cancelar</button></div>}</article>) : <p className="personal-empty">{empty}</p>;
    return <section className="personal-page"><header className="personal-heading"><span>SEU DIA, ORGANIZADO</span><h1>Agenda</h1><p>Espaço para o que importa.</p></header>{error && <p role="alert">{error}</p>}
    {editing ? <form className="personal-card personal-form" onSubmit={onSave}><h2>{items.some(a => a.id === editing.id) ? 'Editar compromisso' : 'Novo compromisso'}</h2><label>Título<input required maxLength={120} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}/></label><div className="personal-fields"><label>Data<input type="date" required value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })}/></label><label>Horário<input type="time" required value={editing.time} onChange={e => setEditing({ ...editing, time: e.target.value })}/></label></div><label>Descrição opcional<textarea rows={3} maxLength={2000} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })}/></label><label>Categoria<select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}><option value="">Sem categoria</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><div className="personal-actions"><button type="submit" className="personal-primary">Salvar compromisso</button><button type="button" onClick={() => setEditing(null)}>Cancelar</button></div></form> : <><button className="personal-primary" onClick={() => setEditing({ id: crypto.randomUUID(), title: '', date: day, time: '09:00', description: '', category: '' })}><Plus size={18}/>Novo compromisso</button><label className="personal-date"><CalendarDays size={18}/><span>Dia</span><input aria-label="Dia da agenda" type="date" required value={day} onChange={e => setDay(e.target.value || today)}/></label><h2>{day === today ? 'Hoje' : 'Compromissos do dia'}</h2>{list(sorted.filter(a => a.date === day), 'Nenhum compromisso neste dia. Que tal planejar algo?')}<h2>Próximos dias</h2>{list(sorted.filter(a => a.date > day), 'Nenhum compromisso nos próximos dias.')}</>}
  </section>;
};
