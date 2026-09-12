export const THEME_KEY = 'chrono-theme';

export function applyTheme(preference = localStorage.getItem(THEME_KEY) || 'System') {
  const resolved = preference === 'System'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : preference.toLowerCase();
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}

export function saveTheme(preference) {
  localStorage.setItem(THEME_KEY, preference);
  applyTheme(preference);
}
