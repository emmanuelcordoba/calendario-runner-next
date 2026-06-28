'use client';

import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export default function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div className="flex items-center rounded-md border">
            <button
                type="button"
                onClick={() => updateAppearance('light')}
                aria-label="Tema claro"
                className={`flex items-center gap-1 rounded-l-md px-3 py-1.5 text-sm transition-colors ${
                    appearance === 'light'
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
                <Sun className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => updateAppearance('dark')}
                aria-label="Tema oscuro"
                className={`flex items-center gap-1 rounded-r-md px-3 py-1.5 text-sm transition-colors ${
                    appearance === 'dark'
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
                <Moon className="h-4 w-4" />
            </button>
        </div>
    );
}
