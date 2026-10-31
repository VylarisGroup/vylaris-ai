export function applyTheme(theme) {
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
}

export function setTheme(theme) {
    try {
        localStorage.setItem('theme', theme);
    } catch (e) {
        // Speicher nicht verfügbar
    }
    applyTheme(theme);
}

export function currentTheme() {
    try {
        return localStorage.getItem('theme') || 'system';
    } catch (e) {
        return 'system';
    }
}
