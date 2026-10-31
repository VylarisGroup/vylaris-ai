import { Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { currentTheme, setTheme } from '@/lib/theme';
import { IconButton } from '@/Components/ui';

const order = ['system', 'light', 'dark'];
const icons = { system: Monitor, light: Sun, dark: Moon };
const labels = { system: 'Design: System', light: 'Design: Hell', dark: 'Design: Dunkel' };

export default function ThemeToggle() {
    const [theme, setLocal] = useState(currentTheme());
    const Icon = icons[theme];

    const next = () => {
        const value = order[(order.indexOf(theme) + 1) % order.length];
        setTheme(value);
        setLocal(value);
    };

    return (
        <IconButton label={labels[theme]} onClick={next}>
            <Icon className="h-4 w-4" />
        </IconButton>
    );
}
