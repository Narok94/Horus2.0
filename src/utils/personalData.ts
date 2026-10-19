import { useEffect, useState } from 'react';
export const isPersonalUser = (username?: string) => username?.toLowerCase() === 'henrique';
export const localDay = (date = new Date()) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
export interface Appointment {
    id: string;
    title: string;
    date: string;
    time: string;
    description: string;
    category: string;
}
export const categories = ['Pessoal', 'Trabalho', 'Saúde', 'Treino', 'Outros'];
const isText = (value: unknown): value is string => typeof value === 'string';
const validAppointment = (a: any) => a && ['id', 'title', 'date', 'time', 'description', 'category'].every(k => isText(a[k]));
// Only the new personal keys are read. Existing workout storage is untouched.
function useLocalData<T>(key: string, initial: () => T, valid: (value: any) => boolean) {
    const read = (): T => { try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const value = JSON.parse(raw);
            if (valid(value))
                return value;
        }
    }
    catch { } return initial(); };
    const [value, setValue] = useState<T>(read);
    const [error, setError] = useState('');
    useEffect(() => { const sync = () => setValue(read()); window.addEventListener('storage', sync); window.addEventListener(key, sync); return () => { window.removeEventListener('storage', sync); window.removeEventListener(key, sync); }; }, [key]);
    const save = (next: T) => { try {
        localStorage.setItem(key, JSON.stringify(next));
        setValue(next);
        setError('');
        window.dispatchEvent(new Event(key));
        return true;
    }
    catch {
        setError('Não foi possível salvar neste dispositivo. Tente novamente.');
        return false;
    } };
    return [value, save, error] as const;
}
export function usePersonalAgenda() { return useLocalData<Appointment[]>('horus_agenda_henrique', () => [], v => Array.isArray(v) && v.every(validAppointment)); }
export function usePersonalClock() { const [now, setNow] = useState(() => new Date()); useEffect(() => { const timer = setInterval(() => setNow(new Date()), 30000); const update = () => setNow(new Date()); window.addEventListener('focus', update); return () => { clearInterval(timer); window.removeEventListener('focus', update); }; }, []); return now; }
