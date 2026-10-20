import React, { useState } from 'react';
import { Check, Pencil, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { isPersonalUser, localDay, usePersonalClock } from '../../src/utils/personalData';
import { Meal, MealVariant, HENRIQUE_PLAN_ID, activeVariant, createHenriquePlan, selectMealOption } from '../../src/data/henriqueDiet';
import { useHenriqueDiet } from '../../src/hooks/useHenriqueDiet';

export const DietView = () => {
  const username = useStore(s => s.user?.username);
  return isPersonalUser(username) ? <PersonalDiet key={username} /> : null;
};

function MealCard({ meal, done = false, readOnly = false, previewOnly = false, choose, edit, toggle }: {
  meal: Meal; done?: boolean; readOnly?: boolean; previewOnly?: boolean;
  choose?: (variantId: string, groupId?: string, optionId?: string) => void;
  edit?: () => void; toggle?: () => void;
}) {
  const variant = activeVariant(meal);
  return <article className={`personal-card meal-card horus-blue-card diet-meal ${done ? 'meal-done' : ''}`} data-meal-id={meal.id}>
    <div className="personal-between"><time className="personal-tag">{meal.time}</time>{edit && <button aria-label={`Editar ${meal.name}`} onClick={edit}><Pencil size={17} /></button>}</div>
    <h2>{meal.name}</h2>
    {meal.variants && meal.variants.length > 1 && <fieldset className="diet-variants"><legend>Escolha uma versão da refeição</legend>{meal.variants.map(v => <label key={v.id} className={v.id === meal.selectedVariantId ? 'is-selected' : ''}><input type="radio" name={`${meal.id}-variant`} checked={v.id === meal.selectedVariantId} disabled={readOnly && !previewOnly} onChange={() => choose?.(v.id)} /><span>{v.name}</span></label>)}</fieldset>}
    {variant ? <div className="diet-foods">{variant.foods.map(group => group.options.length > 1 ? <fieldset key={group.id} className="diet-options"><legend>{group.name}<span>Escolha 1 opção</span></legend>{group.options.map(option => <label className={group.selectedId === option.id ? 'is-selected' : ''} key={option.id}><input type="radio" name={`${meal.id}-${variant.id}-${group.id}`} checked={group.selectedId === option.id} disabled={readOnly && !previewOnly} onChange={() => choose?.(variant.id, group.id, option.id)} /><span>{option.label}</span></label>)}</fieldset> : <p className="diet-single-food" key={group.id}>{group.options[0].label}</p>)}</div> : <p className="personal-prewrap">{meal.description || 'Seus alimentos ainda não foram definidos.'}</p>}
    {variant && meal.description && <p className="personal-prewrap">{meal.description}</p>}
    {variant?.note && <p className="personal-note">{variant.note}</p>}
    {meal.note && <details className="diet-note"><summary>Orientações desta refeição</summary><p className="personal-prewrap">{meal.note}</p></details>}
    {toggle ? <button className="personal-check" aria-pressed={done} onClick={toggle}><span>{done && <Check size={15} />}</span>{done ? 'Realizada' : 'Marcar como realizada'}</button> : readOnly && <p className="diet-readonly">{previewOnly ? 'Prévia do plano · sem registro' : done ? 'Realizada neste dia' : 'Não marcada como realizada'}</p>}
  </article>;
}

function MealEditor({ meal, save, cancel }: { meal: Meal; save: (meal: Meal) => void; cancel: () => void }) {
  const [edited, setEdited] = useState<Meal>(() => JSON.parse(JSON.stringify(meal)));
  const [editingVariantId, setEditingVariantId] = useState(meal.selectedVariantId);
  const variant = edited.variants?.find(v => v.id === editingVariantId);
  const changeVariant = (next: MealVariant) => setEdited({ ...edited, variants: edited.variants?.map(v => v.id === next.id ? next : v) });
  return <form className="personal-card personal-form diet-editor" onSubmit={event => { event.preventDefault(); save(edited); }}>
    <h2>Editar refeição</h2>
    <label>Nome da refeição<input required maxLength={80} value={edited.name} onChange={e => setEdited({ ...edited, name: e.target.value })} /></label>
    <label>Horário<input required type="time" value={edited.time} onChange={e => setEdited({ ...edited, time: e.target.value })} /></label>
    {edited.variants && edited.variants.length > 1 && <label>Versão para editar<select value={editingVariantId} onChange={e => setEditingVariantId(e.target.value)}>{edited.variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label>}
    {variant && <><p>Edite os alimentos e as porções. As opções do mesmo grupo são alternativas, não alimentos para consumir juntos.</p>{variant.foods.map(group => <fieldset className="diet-editor-group" key={group.id}><legend>{group.name}</legend>{group.options.map((option, index) => <label key={option.id}>{group.options.length > 1 ? `Opção ${index + 1}` : 'Alimento e porção'}<input aria-label={`${group.name}, opção ${index + 1}`} required maxLength={240} value={option.label} onChange={e => changeVariant({ ...variant, foods: variant.foods.map(g => g.id !== group.id ? g : { ...g, options: g.options.map(o => o.id !== option.id ? o : { ...o, label: e.target.value }) }) })} /></label>)}<button type="button" className="diet-remove-food" onClick={() => changeVariant({ ...variant, foods: variant.foods.filter(g => g.id !== group.id) })}><Trash2 size={14} />Remover {group.name}</button></fieldset>)}<button className="personal-link diet-add-food" type="button" onClick={() => { const id = crypto.randomUUID(); changeVariant({ ...variant, foods: [...variant.foods, { id, name: 'Alimento adicionado', options: [{ id: `${id}-0`, label: '' }], selectedId: `${id}-0` }] }); }}><Plus size={15} />Adicionar alimento</button><label>Preparo desta versão<textarea rows={2} maxLength={2000} value={variant.note} onChange={e => changeVariant({ ...variant, note: e.target.value })} /></label></>}
    <label>{variant ? 'Descrição adicional' : 'Alimentos / descrição'}<textarea rows={3} maxLength={2000} value={edited.description} onChange={e => setEdited({ ...edited, description: e.target.value })} /></label>
    <label>Orientações e observações<textarea rows={3} maxLength={2000} value={edited.note} onChange={e => setEdited({ ...edited, note: e.target.value })} /></label>
    <div className="personal-actions"><button type="submit" className="personal-primary">Salvar refeição</button><button type="button" onClick={cancel}>Cancelar</button></div>
  </form>;
}

const PersonalDiet = () => {
  const isHenrique = useStore(s => s.user?.username.toLowerCase() === 'henrique');
  const now = usePersonalClock();
  const today = localDay(now);
  const { diet, error, blocked, loadPlan, updateMeal, choose, toggle } = useHenriqueDiet();
  const [editing, setEditing] = useState<Meal | null>(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [preview, setPreview] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const day = selectedDay || today;
  const isToday = day === today;
  const shownMeals = isToday ? diet.meals : diet.history?.[day]?.meals || (diet.completed[day] ? diet.meals : []);
  const completed = diet.completed[day] || [];
  const count = shownMeals.filter(m => completed.includes(m.id)).length;
  const [supplied, setSupplied] = useState(createHenriquePlan);
  const apply = () => { if (loadPlan(diet.meals.length > 0 && confirmed, supplied)) { setPreview(false); setConfirmed(false); setSelectedDay(''); } };
  return <section className="personal-page diet-page">
    <header className="personal-heading"><span>UM CUIDADO DE CADA VEZ</span><h1>{isToday ? 'Dieta de hoje' : 'Histórico alimentar'}</h1><p>{count} de {shownMeals.length} refeições realizadas</p></header>
    {error && <p role="alert" className="diet-error">{error}</p>}
    {editing ? <MealEditor key={editing.id} meal={editing} cancel={() => setEditing(null)} save={next => { if (updateMeal(next, editing)) setEditing(null); }} /> : preview ? <>
      <button className="personal-link diet-back" onClick={() => { setPreview(false); setConfirmed(false); }}><ChevronLeft size={16} />Voltar ao meu cadastro</button>
      <article className="personal-card horus-blue-card diet-import"><h2>Plano fornecido · todos os dias</h2><p>Cinco refeições, com os horários e as substituições do plano. Nenhum valor de calorias ou macronutrientes foi estimado.</p>{diet.meals.length > 0 ? <><p>Seu cadastro atual só será substituído após esta confirmação. Uma cópia integral será guardada neste dispositivo; conclusões e registros anteriores serão preservados.</p><label className="diet-confirm-replace"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><span>Confirmo a substituição das refeições atuais pelo plano fornecido.</span></label></> : <p>Você pode escolher as substituições nesta prévia. As refeições e escolhas só serão cadastradas ao tocar no botão abaixo.</p>}<button disabled={blocked || (diet.meals.length > 0 && !confirmed)} className="personal-primary" onClick={apply}>{diet.meals.length ? 'Substituir cadastro e guardar cópia' : 'Carregar plano de 5 refeições'}</button></article>
      <Guidance items={supplied.guidance || []} />
      {supplied.meals.map(m => <MealCard key={m.id} meal={m} readOnly previewOnly choose={(v,g,o) => setSupplied({ ...supplied, meals: supplied.meals.map(item => item.id !== m.id ? item : selectMealOption(item,v,g,o)) })} />)}
    </> : <>
      <label className="personal-date diet-day">Dia do plano<input aria-label="Dia do plano" type="date" max={today} value={day} onChange={e => setSelectedDay(e.target.value === today ? '' : e.target.value)} /></label>
      {!isToday && <button className="personal-link" onClick={() => setSelectedDay('')}>Voltar para hoje</button>}
      {!isToday && diet.history?.[day]?.legacy && <p>Registro antigo: os status foram preservados. Os alimentos refletem o cadastro disponível na atualização, pois versões anteriores das refeições não estavam armazenadas.</p>}
      {isToday && isHenrique && !blocked && diet.planId !== HENRIQUE_PLAN_ID && <article className="personal-card horus-blue-card diet-import"><h2>{diet.meals.length ? 'Seu cadastro está preservado' : 'Seu plano está disponível'}</h2><p>{diet.meals.length ? 'Há um plano de cinco refeições disponível para Henrique. Nenhuma refeição ou escolha existente foi substituída.' : 'Confira o plano diário de cinco refeições e carregue quando desejar.'}</p><button className="personal-primary" onClick={() => setPreview(true)}>Ver plano fornecido</button></article>}
      {!!shownMeals.length && <div className="personal-progress" role="progressbar" aria-label="Refeições realizadas" aria-valuenow={count} aria-valuemin={0} aria-valuemax={shownMeals.length}><span style={{ width: `${count / shownMeals.length * 100}%` }} /></div>}
      {isToday && diet.guidance && <Guidance items={diet.guidance} />}
      {!shownMeals.length && <p className="personal-empty horus-blue-card">{blocked ? 'O cadastro existente foi preservado. Não foi possível exibi-lo.' : isToday ? (isHenrique ? 'Nenhuma refeição cadastrada. Carregue o plano acima para começar.' : 'Nenhuma refeição cadastrada. Seu espaço está pronto para receber seu plano alimentar.') : 'Nenhum registro alimentar salvo para esta data.'}</p>}
      {[...shownMeals].sort((a,b) => a.time.localeCompare(b.time)).map(m => <MealCard key={m.id} meal={m} done={completed.includes(m.id)} readOnly={!isToday || blocked} choose={(v,g,o) => choose(m.id,v,g,o)} edit={isToday && !blocked ? () => setEditing(m) : undefined} toggle={isToday && !blocked ? () => toggle(m.id) : undefined} />)}
    </>}
  </section>;
};
function Guidance({ items }: { items: string[] }) {
  return <details className="personal-card horus-blue-card diet-guidance"><summary>Orientações do plano</summary><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></details>;
}
