
/** Identidade do movimento, independente da prescrição e da ocorrência no treino. */
export interface CatalogExercise {
  id: string;
  name: string;
  muscleGroup: string;
  aliases?: readonly string[];
  /** Nome de busca aceito por getExerciseGifUrl; não é o ID do movimento. */
  gifKey: string;
}

export interface Exercise {
  id: string;
  catalogExerciseId?: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
  image?: string;
  videoUrl?: string;
  dropSet?: boolean;
  restPause?: boolean;
  biSet?: boolean;
  cluster?: boolean;
  isometria?: boolean;
  falha?: boolean;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  color: string;
}

export interface SetPerformance {
  durationSeconds?: number; // Execução por tempo; reps permanece 0.
  weight: number;
  reps: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
}

export interface WorkoutHistoryEntry {
  id: string;
  date: string; // ISO string
  workoutId: string;
  workoutTitle: string;
  duration?: number; // in seconds
  exercises: {
    exerciseId: string;
    name: string;
    performance: SetPerformance[];
  }[];
}

export interface User {
  username: string;
  name: string;
  goal?: string;
  streak: number;
  totalWorkouts: number;
  checkIns: string[];
  avatar?: string;
  role: 'student';
  weights?: Record<string, number>; 
  history: WorkoutHistoryEntry[];
  badges?: Badge[];
  preferredWorkoutId?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  WORKOUT = 'workout',
  HISTORY = 'history',
  PROFILE = 'profile',
}
