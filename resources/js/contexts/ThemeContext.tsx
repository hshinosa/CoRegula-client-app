import { createContext, PropsWithChildren, useContext } from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface ThemeContextValue {
    darkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
    const darkModeState = useDarkMode();

    return (
        <ThemeContext.Provider value={darkModeState}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
