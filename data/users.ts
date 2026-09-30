import { User } from '../types';

export const localUser: User = {
  username: 'henrique',
  name: 'Henrique',
  role: 'student',
  streak: 0,
  totalWorkouts: 0,
  history: [],
  weights: {},
  checkIns: []
};

// Senha temporária para desenvolvimento local.
const LOCAL_PASSWORD = '12345';

export function getUserByUsername(username: string): User | null {
  if (username.trim().toLowerCase() !== localUser.username) return null;
  return { ...localUser, history: [], weights: {}, checkIns: [] };
}

export function validateCredentials(username: string, password: string): boolean {
  return username.trim().toLowerCase() === localUser.username && password === LOCAL_PASSWORD;
}
