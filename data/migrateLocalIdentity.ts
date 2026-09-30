import { isUsableProfile } from '../src/utils/localData';
/** Executada antes de carregar catálogos, perfil ou sessão. Não mescla resultados. */
export function migrateLocalIdentity(storage: Storage): void {
  try {
    const oldProfileKey = 'tatugym_user_profile_teste';
    const profileKey = 'tatugym_user_profile_henrique';
    const oldProfile = storage.getItem(oldProfileKey);
    const destination = storage.getItem(profileKey);
    const parseProfile = (raw: string | null): unknown => {
      try { return raw === null ? null : JSON.parse(raw); } catch { return null; }
    };
    const sourceProfile = parseProfile(oldProfile);
    if (oldProfile !== null && isUsableProfile(sourceProfile) && !isUsableProfile(parseProfile(destination))) {
      if (destination !== null) storage.setItem(`${profileKey}_backup`, destination);
      storage.setItem(profileKey, JSON.stringify({ ...(sourceProfile as object), username: 'henrique', name: 'Henrique', role: 'student' }));
      storage.removeItem(oldProfileKey);
    } else if (oldProfile !== null && isUsableProfile(parseProfile(destination))) {
      storage.setItem(`${oldProfileKey}_backup`, oldProfile);
      storage.removeItem(oldProfileKey);
    }
  } catch (error) {
    console.warn('[Migration] Perfil original preservado:', error);
  }

  try {
    const oldKey = 'tatugym_active_session_teste';
    const newKey = 'tatugym_active_session_henrique';
    const snapshot = storage.getItem(oldKey);
    if (snapshot !== null && storage.getItem(newKey) !== null) {
      storage.setItem(`${oldKey}_backup`, snapshot);
      storage.removeItem(oldKey);
    }
    if (snapshot !== null && storage.getItem(newKey) === null) {
      // Cópia literal: validação e expiração continuam sob responsabilidade do hook.
      storage.setItem(newKey, snapshot);
      storage.removeItem(oldKey);
    }
  } catch (error) {
    console.warn('[Migration] Sessão original preservada:', error);
  }

  try {
    const key = 'tatugym_all_workouts';
    const saved = storage.getItem(key);
    if (saved !== null) {
      const workouts = JSON.parse(saved);
      if (workouts && typeof workouts === 'object' && !Array.isArray(workouts) &&
          !Array.isArray(workouts.henrique) && Array.isArray(workouts.teste)) {
        const { teste, ...rest } = workouts;
        storage.setItem(key, JSON.stringify({ ...rest, henrique: teste }));
      }
    }
  } catch (error) {
    console.warn('[Migration] Catálogo original preservado:', error);
  }

  try {
    const key = 'tatugym_remembered';
    const saved = storage.getItem(key);
    if (saved === null) return;
    let remembered: unknown;
    try { remembered = JSON.parse(saved); }
    catch { remembered = saved; }
    const username = typeof remembered === 'string' ? remembered :
      remembered && typeof remembered === 'object' && 'username' in remembered ? remembered.username : null;
    if (typeof username === 'string' && ['teste', 'henrique'].includes(username.trim().toLowerCase())) {
      storage.setItem(key, JSON.stringify({ username: 'henrique' }));
    } else {
      storage.removeItem(key);
    }
  } catch (error) {
    console.warn('[Migration] Não foi possível atualizar o login lembrado:', error);
  }
}
