import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            onClick={toggleTheme}
            className="p-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon size={20} className="text-gray-600 hover:text-gray-900" />
            ) : (
                <Sun size={20} className="text-yellow-400 hover:text-yellow-300" />
            )}
        </Button>
    );
};
