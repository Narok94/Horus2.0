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
  const identity = username.trim().toLowerCase();
  if (!['henrique', 'jessica'].includes(identity)) return null;
  return { ...localUser, username: identity, name: identity === 'jessica' ? 'J\u00e9ssica' : 'Henrique', history: [], weights: {}, checkIns: [] };
}

export function validateCredentials(username: string, password: string): boolean {
  return getUserByUsername(username) !== null && password === LOCAL_PASSWORD;
}
