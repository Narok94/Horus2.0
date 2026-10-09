/// <reference types="vite/client" />
import type { Exercise, WorkoutRoutine } from '../../types';

export type ThumbnailPlan = 'treino-principal' | 'treino-feminino';
const assets = import.meta.glob<string>('../assets/miniaturas-horus/*/{divisoes,exercicios}/*.png', { eager: true, import: 'default', query: '?url' });
export const normalizeThumbnailName = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[º°ª]/g, '').replace(/\b(com|de|do|da|na|no)\b/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const thumbnails = new Map(Object.entries(assets).map(([path, url]) => {
  const [, plan, category, filename] = path.match(/\/miniaturas-horus\/([^/]+)\/([^/]+)\/([^/]+)\.png$/)!;
  return [`${plan}/${category}/${normalizeThumbnailName(filename)}`, url];
}));
export function getThumbnailPlan(username?: string, routine?: Pick<WorkoutRoutine, 'id'>): ThumbnailPlan {
  if (routine?.id.startsWith('t2-')) return 'treino-feminino';
  if (routine?.id.startsWith('h-')) return 'treino-principal';
  return normalizeThumbnailName(username || '') === 'jessica' ? 'treino-feminino' : 'treino-principal';
}
const aliases: Record<ThumbnailPlan, Record<string, string>> = {
  'treino-principal': {
    'crucifixo-maquina': 'crucifixo-na-maquina', 'rosca-martelo-halteres': 'rosca-martelo',
    'puxada-alta-frente': 'puxada-alta-pulley-frente', 'remada-curvada': 'remada-curvada-barra',
    'encolhimento-halteres': 'encolhimento-ombros', 'prancha': 'prancha-abdominal',
    'elevacao-pelvica-hip-thrust': 'elevacao-pelvica', 'panturrilha-sentada-2': 'panturrilha-sentada-2'
  },
  'treino-feminino': {
    'crucifixo-maquina': 'peck-deck', 'triceps-pulley-corda': 'triceps-corda',
    'agachamento-smith': 'agachamento-barra-guiada', 'agachamento-hack': 'hack',
    'puxada-frente-aberta': 'pulley-aberto', 'puxada-triangulo': 'pulley-triangulo',
    'stiff-halteres': 'stiff-com-halteres', 'agachamento-bulgaro': 'bulgaro',
    'elevacao-pelvica': 'levantamento-pelvico', 'desenvolvimento-barra': 'desenvolvimento-aberto-barra',
    'elevacao-frontal-halteres': 'frontal-com-halteres', 'elevacao-lateral-halteres': 'elevacao-lateral',
    'encolhimento': 'encolhimento-ombro'
  }
};
export function getExerciseThumbnail(exercise: Pick<Exercise, 'name' | 'catalogExerciseId'>, plan: ThumbnailPlan): string | undefined {
  for (const name of [exercise.catalogExerciseId, exercise.name]) {
    if (!name) continue;
    const key = normalizeThumbnailName(name);
    const url = thumbnails.get(`${plan}/exercicios/${key}`) || thumbnails.get(`${plan}/exercicios/${normalizeThumbnailName(aliases[plan][key] || '')}`);
    if (url) return url;
  }
}
export function getDivisionThumbnail(workout: Pick<WorkoutRoutine, 'id' | 'title'>, plan: ThumbnailPlan): string | undefined {
  const letter = workout.id.match(/^(?:h|t2)-([a-e])$/i)?.[1] || workout.title.match(/treino\s+([a-e])\b/i)?.[1];
  if (!letter) return;
  const prefix = `${plan}/divisoes/treino-${letter.toLowerCase()}-`;
  return [...thumbnails].find(([key]) => key.startsWith(prefix))?.[1];
}
// Retry the existing GIF once before letting each view display its icon fallback.
export function retryThumbnail(image: HTMLImageElement, gif: string): boolean {
  if (image.getAttribute('src') !== gif && image.dataset.gifRetry !== 'true') {
    image.dataset.gifRetry = 'true';
    image.src = gif;
    return true;
  }
  return false;
}
