import type { User, WorkoutRoutine, WorkoutHistoryEntry, SetPerformance } from '../../types';
import { defaultWorkouts, jessicaWorkouts } from '../../data/workoutData';
import { exerciseCatalog } from '../../data/exerciseCatalog';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const text = (value: unknown): value is string => typeof value === 'string';
const date = (value: unknown): value is string => text(value) && Number.isFinite(Date.parse(value));
const validSet = (value: unknown): value is SetPerformance => isRecord(value) && number(value.weight) &&
  number(value.reps) && Number.isInteger(value.reps) && typeof value.completed === 'boolean' &&
  (value.durationSeconds === undefined || number(value.durationSeconds)) &&
  (value.rpe === undefined || (number(value.rpe) && value.rpe <= 10));
export const isValidHistoryEntry = (value: unknown): value is WorkoutHistoryEntry =>
  isRecord(value) && text(value.id) && date(value.date) && text(value.workoutId) && text(value.workoutTitle) &&
  (value.duration === undefined || number(value.duration)) && Array.isArray(value.exercises) &&
  value.exercises.every(ex => isRecord(ex) && text(ex.exerciseId) && text(ex.name) &&
    Array.isArray(ex.performance) && ex.performance.every(validSet));

/** Um objeto com ao menos um campo de treino utilizável pode ser recuperado parcialmente. */
export const isUsableProfile = (value: unknown): boolean => isRecord(value) && (
  isRecord(value.weights) || Array.isArray(value.history) || Array.isArray(value.checkIns) ||
  Array.isArray(value.badges) || number(value.totalWorkouts) || number(value.streak)
);

export function validateLocalProfile(value: unknown, defaults: User): User {
  const saved = isRecord(value) ? value : {};
  return {
    ...defaults,
    weights: isRecord(saved.weights) ? Object.fromEntries(Object.entries(saved.weights).filter((entry): entry is [string, number] => number(entry[1]))) : {},
    history: Array.isArray(saved.history) ? saved.history.filter(isValidHistoryEntry) : [],
    checkIns: Array.isArray(saved.checkIns) ? saved.checkIns.filter(value => text(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) && date(value) && new Date(value).toISOString().slice(0, 10) === value) : [],
    badges: Array.isArray(saved.badges) ? saved.badges.filter(value => isRecord(value) && text(value.id) && text(value.name) && text(value.description) && text(value.icon) && date(value.unlockedAt)) as User['badges'] : [],
    streak: number(saved.streak) && Number.isInteger(saved.streak) ? saved.streak : defaults.streak,
    totalWorkouts: number(saved.totalWorkouts) && Number.isInteger(saved.totalWorkouts) ? saved.totalWorkouts : defaults.totalWorkouts,
    preferredWorkoutId: text(saved.preferredWorkoutId) ? saved.preferredWorkoutId : undefined,
    goal: text(saved.goal) ? saved.goal : undefined,
    avatar: text(saved.avatar) ? saved.avatar : undefined
  };
}

const normalizeName = (name: string) => name.normalize('NFC').trim().toLocaleLowerCase('pt-BR');
export function normalizeSavedWorkouts(workouts: unknown[]): unknown[] {
  const catalogIds = new Set(exerciseCatalog.map(ex => ex.id));
  const known = new Map([...defaultWorkouts, ...jessicaWorkouts].flatMap(w => w.exercises).map(ex => [ex.id, ex.catalogExerciseId]));
  const names = new Map<string, Set<string>>();
  for (const ex of exerciseCatalog) for (const name of [ex.name, ...(ex.aliases || [])]) {
    const key = normalizeName(name);
    names.set(key, new Set([...(names.get(key) || []), ex.id]));
  }
  return workouts.map(workout => {
    if (!isRecord(workout) || !Array.isArray(workout.exercises)) return workout;
    return { ...workout, exercises: workout.exercises.map(ex => {
      if (!isRecord(ex)) return ex;
      if (text(ex.catalogExerciseId) && catalogIds.has(ex.catalogExerciseId)) return ex;
      const byId = text(ex.id) ? known.get(ex.id) : undefined;
      const matches = text(ex.name) ? names.get(normalizeName(ex.name)) : undefined;
      const catalogExerciseId = byId ?? (matches?.size === 1 ? [...matches][0] : undefined);
      const { catalogExerciseId: _invalid, ...rest } = ex;
      return catalogExerciseId ? { ...rest, catalogExerciseId } : rest;
    }) };
  });
}

export const isValidWorkout = (value: unknown): value is WorkoutRoutine => isRecord(value) &&
  text(value.id) && text(value.title) && text(value.description) && text(value.color) &&
  Array.isArray(value.exercises) && value.exercises.every(ex => isRecord(ex) && text(ex.id) && text(ex.name) &&
    text(ex.muscleGroup) && number(ex.sets) && Number.isInteger(ex.sets) && text(ex.reps) && number(ex.rest));
