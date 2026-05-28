export interface CardioSession {
  exercise: string;
  duration: number; // in minutes
}

export interface Exercise {
  id: string;
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
  cardio?: CardioSession;
  color: string;
}

export interface SetPerformance {
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
  cardio?: {
    exercise: string;
    duration: number;
    completed: boolean;
  };
}

export interface User {
  username: string;
  password?: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  sex?: 'masculino' | 'feminino';
  goalIMC?: number;
  goal?: string;
  streak: number;
  goalStreak?: number;
  totalWorkouts: number;
  goalWorkouts?: number;
  checkIns: string[];
  avatar?: string;
  isProfileComplete: boolean;
  role: 'student' | 'teacher';
  weights?: Record<string, number>; 
  history: WorkoutHistoryEntry[];
  badges?: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  requirement: (user: User) => boolean;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  WORKOUT = 'workout',
  HISTORY = 'history',
  PROFILE = 'profile',
  ADMIN = 'admin',
  TEACHER = 'teacher'
}
