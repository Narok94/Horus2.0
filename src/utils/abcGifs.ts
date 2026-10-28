/// <reference types="vite/client" />
import type { Exercise, WorkoutRoutine } from '../../types';

/** Associação pelos nomes fornecidos; o conteúdo visual ainda requer revisão técnica. */
export const abcGifFiles: Readonly<Record<string, string>> = {
  'supino-inclinado-halteres': 'Supino inclinado com halteres.gif',
  'supino-maquina': 'Supino reto na máquina.gif',
  'elevacao-lateral-polia': 'Elevação lateral na polia.gif',
  'desenvolvimento-halteres': 'Desenvolvimento com halteres.gif',
  'triceps-pulley-corda': 'Tríceps na polia com corda.gif',
  'triceps-unilateral-polia': 'Tríceps unilateral na polia.gif',
  'puxada-triangulo': 'Puxada alta pegada neutra.gif',
  'remada-articulada': 'Remada articulada com apoio no peito.gif',
  'puxada-unilateral-polia': 'Puxada unilateral na polia.gif',
  'crucifixo-inverso-maquina': 'Crucifixo inverso na máquina.gif',
  'rosca-polia-barra-w': 'Rosca direta polia baixa barra W.gif',
  'rosca-martelo-corda': 'Rosca martelo polia baixa corda.gif',
  'leg-press-45': 'Leg press 45°.gif',
  'cadeira-extensora': 'Cadeira extensora.gif',
  'mesa-flexora': 'Mesa flexora.gif',
  'stiff-halteres': 'Terra romeno com halteres.gif',
  'panturrilha-leg-press': 'Panturrilha no leg press.gif',
  'crunch-polia': 'Abdominal na polia.gif'
};
// Importa apenas URLs: o navegador transfere somente o GIF do exercício aberto.
const gifs = import.meta.glob<string>('../assets/Gif/*.gif', { eager: true, query: '?url', import: 'default' });
export function getABCExerciseGif(username: string | undefined, routine: Pick<WorkoutRoutine, 'id'>, exercise: Pick<Exercise, 'catalogExerciseId'>): string | undefined {
  if (username?.toLowerCase() !== 'henrique' || !/^henrique-abc-v1-[abc]$/.test(routine.id)) return;
  const file = exercise.catalogExerciseId && abcGifFiles[exercise.catalogExerciseId];
  return file ? gifs[`../assets/Gif/${file}`] : undefined;
}
