import { isValidHistoryEntry } from './localData';
import type { Exercise, User, WorkoutRoutine } from '../../types';

type WeightExercise = Pick<Exercise, 'id' | 'catalogExerciseId'>;
export const getExerciseWeightKey = (exercise: WeightExercise): string =>
  exercise.catalogExerciseId ?? exercise.id;

export const getExerciseReferenceWeight = (
  weights: User['weights'], exercise: WeightExercise
): number => weights?.[getExerciseWeightKey(exercise)] ?? weights?.[exercise.id] ?? 0;

/** Acrescenta chaves centrais; nunca remove chaves antigas ou substitui uma central. */
export function migrateExerciseWeights(user: User, workouts: WorkoutRoutine[]): User {
  const weights = user.weights || {};
  const validWeight = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const occurrences = new Map<string, Exercise>();
  const ambiguous = new Set<string>();
  for (const workout of workouts) for (const exercise of workout.exercises) {
    const previous = occurrences.get(exercise.id);
    if (previous?.catalogExerciseId && exercise.catalogExerciseId &&
        previous.catalogExerciseId !== exercise.catalogExerciseId) ambiguous.add(exercise.id);
    else occurrences.set(exercise.id, {
      ...exercise, catalogExerciseId: exercise.catalogExerciseId ?? previous?.catalogExerciseId
    });
  }
  const groups = new Map<string, Exercise[]>();
  for (const exercise of occurrences.values()) {
    if (!exercise.catalogExerciseId || ambiguous.has(exercise.id) || !validWeight(weights[exercise.id])) continue;
    const key = getExerciseWeightKey(exercise);
    groups.set(key, [...(groups.get(key) || []), exercise]);
  }
  let migrated: Record<string, number> | undefined;
  for (const [key, exercises] of groups) {
    if (weights[key] !== undefined) continue;
    const values = new Set(exercises.map(ex => weights[ex.id]));
    let value: number | undefined;
    if (values.size === 1) value = weights[exercises[0].id];
    else {
      // Datas empatadas ou histórico sem relação com a referência antiga não decidem conflitos.
      const candidates: { timestamp: number; weight: number }[] = [];
      for (const entry of Array.isArray(user.history) ? user.history : []) {
        if (!isValidHistoryEntry(entry)) continue;
        const timestamp = Date.parse(entry.date);
        if (!Number.isFinite(timestamp)) continue;
        for (const result of entry.exercises) {
          const exercise = exercises.find(ex => ex.id === result.exerciseId);
          if (!exercise) continue;
          const drop = exercise.dropSet ?? /^\s*\d+\s*\+\s*\d+\s*$/.test(exercise.reps);
          const main = result.performance.filter((set, index) => set.completed && (!drop || index % 2 === 0));
          const lastWeight = main[main.length - 1]?.weight;
          if (validWeight(lastWeight)) candidates.push({ timestamp, weight: lastWeight });
        }
      }
      const latest = Math.max(...candidates.map(candidate => candidate.timestamp));
      const latestWeights = new Set(candidates.filter(candidate => candidate.timestamp === latest).map(candidate => candidate.weight));
      if (latestWeights.size === 1) {
        const latestWeight = [...latestWeights][0];
        if (values.has(latestWeight)) value = latestWeight;
      }
    }
    if (value !== undefined) {
      migrated ??= { ...weights };
      migrated[key] = value;
    }
  }
  return migrated ? { ...user, weights: migrated } : user;
}
