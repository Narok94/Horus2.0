import type { Exercise, User, SetPerformance } from '../../types';
import { getExerciseReferenceWeight } from './exerciseWeights';
// Interpretação única da prescrição; valores desconhecidos não presumem repetições.
export const interpretPrescription = (exercise: Pick<Exercise, 'reps' | 'dropSet' | 'falha'>) => {
  const text = exercise.reps.trim().toLowerCase();
  const validReps = (value: number) => Number.isInteger(value) && value >= 0 && value <= 1000;
  if (exercise.falha || /falha/.test(text)) {
    return { kind: 'failure' as const, values: [0], drop: false, durationSeconds: undefined };
  }
  const time = text.match(/^(\d+(?:[.,]\d+)?)(?:\s*-\s*(\d+(?:[.,]\d+)?))?\s*(s|seg|segs|segundo|segundos|min|minuto|minutos)$/);
  if (time) {
    const seconds = Number(time[1].replace(',', '.')) * (time[3].startsWith('min') ? 60 : 1);
    const upper = time[2] ? Number(time[2].replace(',', '.')) * (time[3].startsWith('min') ? 60 : 1) : seconds;
    if (Number.isFinite(seconds) && seconds > 0 && upper >= seconds && upper <= 3600) {
      return { kind: 'time' as const, values: [0], drop: false, durationSeconds: Math.round(seconds) };
    }
  }
  const pair = /^\d+\s*\+\s*\d+$/.test(text) ? text.split('+').map(Number) : [];
  const hasPair = pair.length === 2 && pair.every(validReps);
  const numeric = /^\d+(?:\s*[-/]\s*\d+)*$/.test(text);
  const parts = numeric ? text.split(/[-/]/).map(Number) : [];
  if (hasPair && exercise.dropSet !== false) {
    return { kind: 'reps' as const, values: pair, drop: true, durationSeconds: undefined };
  }
  if (parts.length && parts.every(validReps)) {
    const sequence = text.includes('/') || parts.length >= 3;
    const values = sequence ? parts : [parts.length === 2 ? Math.min(...parts) : parts[0]];
    return { kind: sequence ? 'sequence' as const : 'reps' as const, values,
      drop: exercise.dropSet === true, durationSeconds: undefined };
  }
  // Uma flag explicitamente falsa mantém somente a série principal do formato legado.
  if (hasPair && exercise.dropSet === false) {
    return { kind: 'reps' as const, values: [pair[0]], drop: false, durationSeconds: undefined };
  }
  return { kind: 'invalid' as const, values: [0], drop: false, durationSeconds: undefined };
};

// Técnicas rest-pause/bi-set/cluster não expandem séries; isometria usa prescrição de tempo.
export function createInitialPerformance(ex: Exercise, weights: User['weights']): SetPerformance[] {
  const prescription = interpretPrescription(ex);
  const baseWeight = getExerciseReferenceWeight(weights, ex);
  const performance: SetPerformance[] = [];
  for (let index = 0; index < ex.sets; index++) {
    const reps = prescription.values[Math.min(index, prescription.values.length - 1)];
    performance.push({ weight: baseWeight, reps: prescription.drop ? prescription.values[0] : reps,
      completed: false, ...(prescription.kind === 'time' ? { durationSeconds: prescription.durationSeconds } : {}) });
    if (prescription.drop) performance.push({ weight: Math.round(baseWeight * 0.7),
      reps: prescription.values[1] ?? prescription.values[0], completed: false });
  }
  return performance;
}
export const getRestSeconds = (rest: unknown): number =>
  typeof rest === 'number' && Number.isFinite(rest) && rest >= 0 ? rest : 60;
