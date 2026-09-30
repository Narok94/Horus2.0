import { Timestamp } from './firebase';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  description?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
  name?: string; // Denormalized for display
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  date: Timestamp;
  exercises: WorkoutExercise[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  goal?: string;
  weight?: number;
  height?: number;
  role?: 'admin' | 'user';
}

export type MuscleGroup = 'Peito' | 'Costas' | 'Pernas' | 'Ombros' | 'Bíceps' | 'Tríceps' | 'Abdômen' | 'Antebraço' | 'Panturrilha';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Antebraço', 'Panturrilha'
];
