export interface FoodOption { id: string; label: string }
export interface FoodGroup { id: string; name: string; options: FoodOption[]; selectedId: string }
export interface MealVariant { id: string; name: string; foods: FoodGroup[]; note: string }
export interface Meal {
  id: string; name: string; time: string; description: string; note: string;
  variants?: MealVariant[]; selectedVariantId?: string;
}
export interface Diet {
  meals: Meal[];
  completed: Record<string, string[]>;
  planId?: string;
  guidance?: string[];
  history?: Record<string, { meals: Meal[]; legacy?: boolean }>;
}
export const HENRIQUE_DIET_KEY = 'horus_diet_henrique';
export const HENRIQUE_PLAN_ID = 'henrique-nutrition-plan-v1';
export const emptyDiet = (): Diet => ({ meals: [], completed: {} });
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const foods = (id: string, name: string, ...labels: string[]): FoodGroup => ({
  id, name, options: labels.map((label, index) => ({ id: `${id}-${index}`, label })), selectedId: `${id}-0`
});
const variant = (id: string, name: string, groups: FoodGroup[], note = ''): MealVariant => ({ id, name, foods: groups, note });
const meal = (id: string, name: string, time: string, variants: MealVariant[], note = ''): Meal => ({
  id: `henrique-plan-${id}`, name, time, description: '', note, variants, selectedVariantId: variants[0].id
});
/** Transcription supplied by the user. No calculated nutrition values. */
export function createHenriquePlan(): Diet {
  return {
    planId: HENRIQUE_PLAN_ID, completed: {},
    guidance: [
      'Objetivo informado: melhorar composição corporal.',
      'Meta de água diária: orientação presente, sem volume especificado.',
      'Musculação cinco vezes por semana.',
      'Uma a duas refeições livres por semana.'
    ],
    meals: [
      meal('breakfast', 'Café da manhã', '08:30', [variant('breakfast', 'Café da manhã', [
        foods('bread', 'Pão', '2 fatias de pão integral', '1 pão de sal'),
        foods('breakfast-protein', 'Recheio proteico', '2 ovos', '60 g de frango desfiado'),
        foods('spread', 'Requeijão', '1 colher de sopa de requeijão light'),
        foods('coffee', 'Café', '1 xícara de café'),
        foods('fruit', 'Fruta', '1 maçã', '1 pera', '200 g de melancia', '200 g de mamão')
      ])], 'Pão + recheio proteico + café sem açúcar. Marcas sugeridas: Wickbold, Newbread ou Delícias do Trigo.'),
      meal('snack', 'Lanche', '11:00', [variant('snack', 'Lanche', [
        foods('whey', 'Whey protein', '30 g de whey protein'), foods('milk', 'Leite', '200 ml de leite desnatado')
      ])]),
      meal('lunch', 'Almoço', '13:30', [variant('lunch', 'Almoço', [
        foods('lunch-rice', 'Arroz', '150 g de arroz'), foods('lunch-beans', 'Feijão', '100 g de feijão'),
        foods('lunch-protein', 'Proteína', '130 g de carne bovina', '130 g de frango'),
        foods('lunch-vegetables', 'Legumes', '80 g de legumes cozidos'), foods('lunch-salad', 'Salada', 'Salada à vontade', 'Verdura crua à vontade')
      ])], 'Variar as verduras e legumes, escolhendo pelo menos três cores diferentes. Até três colheres de sopa de cada opção; folhas cruas à vontade. Preferir uma folha, um legume cru e um cozido.'),
      meal('afternoon', 'Lanche da tarde', '17:30', [variant('afternoon', 'Crepioca', [
        foods('eggs', 'Ovos', '2 ovos'), foods('tapioca', 'Tapioca', '15 g de tapioca (1 colher de sopa)'),
        foods('filling', 'Recheio', '1 fatia de mussarela', '1 colher de sobremesa de requeijão light'), foods('afternoon-coffee', 'Café', '1 xícara de café sem açúcar')
      ])], 'Preparo: crepioca com os ovos e a tapioca, recheada com uma das opções.'),
      meal('dinner', 'Jantar', '20:30', [
        variant('dinner-standard', 'Jantar do plano', [
          foods('dinner-rice', 'Arroz', '150 g de arroz'), foods('dinner-beans', 'Feijão', '100 g de feijão'),
          foods('dinner-protein', 'Proteína', '100 g de carne bovina', '100 g de frango'),
          foods('dinner-vegetables', 'Legumes', '80 g de legumes cozidos'), foods('dinner-salad', 'Salada', 'Salada à vontade', 'Verdura crua à vontade')
        ]),
        variant('dinner-couscous', 'Substituição: cuscuz', [
          foods('couscous', 'Cuscuz', '150 g de cuscuz de milho'),
          foods('couscous-protein', 'Recheio', '100 g de frango desfiado', '100 g de carne'),
          foods('couscous-salad', 'Salada', 'Meio prato cheio de salada', 'Meio prato cheio de verdura crua')
        ], 'Cuscuz recheado.')
      ])
    ]
  };
}
const record = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string';
const unique = (ids: string[]) => new Set(ids).size === ids.length;
const validGroup = (g: any): boolean => record(g) && text(g.id) && text(g.name) && Array.isArray(g.options) && g.options.length > 0 &&
  g.options.every((o: any) => record(o) && text(o.id) && text(o.label)) && unique(g.options.map((o: any) => o.id)) && g.options.some((o: any) => o.id === g.selectedId);
export const validMeal = (m: any): m is Meal => record(m) && ['id','name','time','description','note'].every(k => text(m[k])) && /^([01]\d|2[0-3]):[0-5]\d$/.test(m.time) &&
  (m.variants === undefined || (Array.isArray(m.variants) && m.variants.length > 0 && m.variants.every((v: any) => record(v) && text(v.id) && text(v.name) && text(v.note) && Array.isArray(v.foods) && v.foods.every(validGroup) && unique(v.foods.map((g: any) => g.id))) && unique(m.variants.map((v: any) => v.id)) && m.variants.some((v: any) => v.id === m.selectedVariantId)));
export const validDiet = (d: any): d is Diet => record(d) && Array.isArray(d.meals) && d.meals.every(validMeal) && unique(d.meals.map((m: Meal) => m.id)) && record(d.completed) &&
  Object.entries(d.completed).every(([day, ids]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Array.isArray(ids) && ids.every(text)) &&
  (d.planId === undefined || text(d.planId)) && (d.guidance === undefined || (Array.isArray(d.guidance) && d.guidance.every(text))) &&
  (d.history === undefined || (record(d.history) && Object.values(d.history).every(v => record(v) && Array.isArray(v.meals) && v.meals.every(validMeal))));
export const activeVariant = (m: Meal) => m.variants?.find(v => v.id === m.selectedVariantId);
export function selectMealOption(m: Meal, variantId: string, groupId?: string, optionId?: string): Meal {
  return groupId ? {
    ...m, variants: m.variants?.map(v => v.id !== variantId ? v : {
      ...v, foods: v.foods.map(g => g.id !== groupId ? g : { ...g, selectedId: optionId ?? g.selectedId })
    })
  } : { ...m, selectedVariantId: variantId };
}
/** Snapshot prior days before changing food choices or portions. Legacy records remain readable. */
export function withDietHistory(previous: Diet, next: Diet, day: string): Diet {
  const history = copy(previous.history || {});
  for (const recordedDay of Object.keys(previous.completed)) {
    if (!history[recordedDay]) history[recordedDay] = { meals: copy(previous.meals), legacy: true };
  }
  const merged = new Map((history[day]?.meals || []).map(m => [m.id, m]));
  for (const m of next.meals) merged.set(m.id, copy(m));
  history[day] = { ...history[day], meals: [...merged.values()] };
  return { ...next, history };
}
