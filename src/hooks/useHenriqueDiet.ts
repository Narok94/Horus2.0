import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../../store';
import { isPersonalUser, localDay } from '../utils/personalData';
import { Diet, Meal, HENRIQUE_DIET_KEY, HENRIQUE_PLAN_ID, createHenriquePlan, emptyDiet, validDiet, withDietHistory, selectMealOption } from '../data/henriqueDiet';

const dietKey = (username?: string) => username === 'henrique' ? HENRIQUE_DIET_KEY : `horus_diet_${username}`;

type ReadResult = { diet: Diet; blocked: boolean; message: string };
function read(username?: string): ReadResult {
  if (!isPersonalUser(username)) return { diet: emptyDiet(), blocked: true, message: '' };
  try {
    const raw = localStorage.getItem(dietKey(username));
    if (raw === null) return { diet: emptyDiet(), blocked: false, message: '' };
    const value: unknown = JSON.parse(raw);
    if (validDiet(value)) return { diet: value, blocked: false, message: '' };
    return { diet: emptyDiet(), blocked: true, message: 'O cadastro alimentar não pôde ser lido. Os dados foram preservados; o carregamento está bloqueado para não sobrescrevê-los.' };
  } catch {
    return { diet: emptyDiet(), blocked: true, message: 'Não foi possível acessar o cadastro alimentar. Nenhum dado foi alterado.' };
  }
}

/** Reads and writes only the current user's diet, after an explicit user action. */
export function useHenriqueDiet() {
  const username = useStore(s => s.user?.username.toLowerCase());
  const key = dietKey(username);
  const [state, setState] = useState(() => ({ ...read(username), username }));
  const [error, setError] = useState('');
  useEffect(() => {
    const sync = () => setState({ ...read(username), username });
    const onStorage = (event: StorageEvent) => { if (!event.key || event.key === key) sync(); };
    sync();
    window.addEventListener('storage', onStorage);
    window.addEventListener(key, sync);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener(key, sync); };
  }, [username, key]);

  const update = useCallback((transform: (latest: Diet) => Diet, archive = false) => {
    // Re-read immediately before each write, preserving changes made in another view/tab.
    if (!isPersonalUser(username)) return false;
    const latest = read(username);
    if (latest.blocked) { setError(latest.message); return false; }
    try {
      const proposed = transform(latest.diet);
      if (proposed === latest.diet) return true;
      const next = withDietHistory(latest.diet, proposed, localDay());
      if (!validDiet(next)) throw new Error('Revise os horários e as opções da refeição.');
      if (archive && latest.diet.meals.length) {
        const raw = localStorage.getItem(dietKey(username));
        if (raw !== null) localStorage.setItem(`${key}_backup_${Date.now()}`, raw);
      }
      localStorage.setItem(key, JSON.stringify(next));
      setState({ diet: next, username, blocked: false, message: '' });
      setError('');
      window.dispatchEvent(new Event(key));
      return true;
    } catch (cause) {
      setError(cause instanceof Error && /Revise|mudou|existente/.test(cause.message) ? cause.message : 'Não foi possível salvar neste dispositivo. Seus registros anteriores foram preservados.');
      return false;
    }
  }, [username, key]);

  const loadPlan = (replace = false, supplied = createHenriquePlan()) => update(latest => {
    if (username !== 'henrique') return latest;
    if (latest.planId === HENRIQUE_PLAN_ID) return latest;
    if (latest.meals.length && !replace) throw new Error('Há um cadastro existente. Confirme a substituição antes de carregar o plano.');
    return { ...latest, ...supplied, completed: latest.completed, history: latest.history };
  }, replace);
  const updateMeal = (edited: Meal, expected?: Meal) => update(latest => {
    if (!edited.name.trim() || edited.variants?.some(v => v.foods.some(g => g.options.some(o => !o.label.trim())))) throw new Error('Revise o nome e os alimentos da refeição.');
    const current = latest.meals.find(m => m.id === edited.id);
    if (!current || (expected && JSON.stringify(current) !== JSON.stringify(expected))) throw new Error('A refeição mudou em outra tela. Reabra a edição para preservar as alterações.');
    return { ...latest, meals: latest.meals.map(m => m.id === edited.id ? { ...edited, name: edited.name.trim() } : m) };
  });
  const choose = (mealId: string, variantId: string, groupId?: string, optionId?: string) => update(latest => ({
    ...latest, meals: latest.meals.map(m => m.id !== mealId ? m : selectMealOption(m, variantId, groupId, optionId))
  }));
  const toggle = (mealId: string) => update(latest => {
    if (!latest.meals.some(m => m.id === mealId)) return latest;
    const today = localDay();
    const ids = latest.completed[today] || [];
    return { ...latest, completed: { ...latest.completed, [today]: ids.includes(mealId) ? ids.filter(id => id !== mealId) : [...ids, mealId] } };
  });
  const visible = state.username === username ? state : { ...read(username), username };
  return { diet: visible.diet, blocked: visible.blocked, error: error || visible.message, loadPlan, updateMeal, choose, toggle };
}
