(() => {
  const key = 'donbosco-color-theme';
  const root = document.documentElement;
  const normalizeTheme = value => value === 'light' ? 'light' : 'dark';

  function applyTheme(value) {
    const theme = normalizeTheme(value);
    root.dataset.theme = theme;
    const isDark = theme === 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0d1d2c' : '#e4ebef');
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const target = isDark ? 'claro' : 'oscuro';
      button.setAttribute('aria-label', `Cambiar a modo ${target}`);
      button.title = `Cambiar a modo ${target}`;
      button.querySelector('[data-theme-label]').textContent = `Modo ${target}`;
      button.querySelector('[data-theme-icon]').textContent = isDark ? '☀' : '☾';
    });
  }

  let initialTheme = 'dark';
  try { initialTheme = normalizeTheme(localStorage.getItem(key)); } catch { /* Storage may be disabled. */ }
  applyTheme(initialTheme);
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(root.dataset.theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(key, next); } catch { /* The switch still works for this page. */ }
      });
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) applyTheme(event.newValue);
  });
})();
