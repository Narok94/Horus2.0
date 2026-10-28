export type ThemePreference = 'light' | 'dark' | 'auto';
export const validThemePreference = (value: string | null): ThemePreference =>
  value === 'light' || value === 'dark' ? value : 'auto';
export const resolveTheme = (preference: ThemePreference, systemDark: boolean): 'light' | 'dark' =>
  preference === 'auto' ? (systemDark ? 'dark' : 'light') : preference;
export const systemIsDark = () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
