const FujiApp = (() => {
    const Storage = {
        get: (key, defaultValue = null) => {
            try { const item = localStorage.getItem(`fuji_${key}`); return item ? JSON.parse(item) : defaultValue; } 
            catch (e) { return defaultValue; }
        },
        set: (key, value) => { try { localStorage.setItem(`fuji_${key}`, JSON.stringify(value)); } catch (e) {} },
        remove: (key) => { try { localStorage.removeItem(`fuji_${key}`); } catch (e) {} }
    };

    const Theme = {
        init: () => {
            const savedTheme = Storage.get('theme', null);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                Theme.set(savedTheme, false);
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                Theme.set(prefersDark ? 'dark' : 'light', false);
            }
            Theme.updateIcon();
        },
        set: (theme, save = true) => {
            document.documentElement.setAttribute('data-theme', theme);
            if (save) Storage.set('theme', theme);
            Theme.updateIcon();
        },
        toggle: () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            Theme.set(next, true);
        },
        updateIcon: () => {
            const themeBtn = document.getElementById('theme-toggle-btn');
            if (!themeBtn) return;
            const current = document.documentElement.getAttribute('data-theme');
            themeBtn.innerHTML = current === 'dark' 
                ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>` 
                : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;
        }
    };

    const Progress = {
        defaultData: { xp: 1240, streak: 5, lastStudyDate: new Date().toDateString(), jlptLevel: 'N5', completed: { grammar: [], kanji: [], vocab: [], tests: [] } },
        getData: () => {
            let data = Storage.get('progress', null);
            if (!data) { data = Progress.defaultData; Storage.set('progress', data); }
            return data;
        }
    };

    const initNavigation = () => {
        const navLinks = document.querySelectorAll('.app-nav .nav-item');
        let currentPage = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) link.classList.add('active');
        });
    };

    const init = () => {
        // Service worker registration removed - now handled in index.html with correct relative path
        Theme.init();
        initNavigation();
    };

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
    return { Storage, Progress, Theme };
})();