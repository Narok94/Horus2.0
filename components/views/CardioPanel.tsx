import React, { useState } from 'react';
import { HenriqueProgramDay } from './HenriqueProgramDay';
import { localDay, usePersonalAgenda } from '../../src/utils/personalData';
/** Reuses the existing cardio storage; removing Agenda never removes its records. */
export function CardioPanel() {
  const [day,setDay] = useState(localDay);
  const [records] = usePersonalAgenda();
  const cardio = records.filter(item => item.id.startsWith('henrique-abc-cardio:') || /cardio|caminhada|esteira/i.test(item.title)).sort((a,b)=>b.date.localeCompare(a.date));
  return <section className="redesign-cardio-panel"><h2>Registros de cardio</h2><label className="personal-date">Dia do cardio<input aria-label="Dia do cardio" type="date" value={day} onChange={event=>setDay(event.target.value || localDay())}/></label><HenriqueProgramDay day={day} cardioOnly/>{cardio.length>0 && <section><h3>Histórico de cardio</h3>{cardio.map(item=><button key={item.id} className="redesign-cardio-record" onClick={()=>setDay(item.date)}><strong>{new Date(item.date+'T12:00:00').toLocaleDateString('pt-BR')} · {item.time}</strong><span>{item.description}</span></button>)}</section>}</section>;
}
