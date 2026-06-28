'use client';

import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark';

const applyTheme = (appearance: Appearance) => {
    document.documentElement.classList.toggle('dark', appearance === 'dark');
};

export function initializeTheme() {
    const saved = (localStorage.getItem('appearance') as Appearance) || 'light';
    applyTheme(saved);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    useEffect(() => {
        const saved = (localStorage.getItem('appearance') as Appearance) || 'light';
        setAppearance(saved);
        applyTheme(saved);
    }, []);

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
        const maxAge = 365 * 24 * 60 * 60;
        document.cookie = `appearance=${mode};path=/;max-age=${maxAge};SameSite=Lax`;
        applyTheme(mode);
    }, []);

    return { appearance, updateAppearance } as const;
}
