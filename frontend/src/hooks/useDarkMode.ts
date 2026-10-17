import { useTheme } from '../contexts/ThemeContext';

// Backwards-compatible hook for components that still use the original API.
export const useDarkMode = () => {
  const { isDark, toggleTheme, setTheme } = useTheme();
  return {
    darkMode: isDark,
    setDarkMode: (dark: boolean) => setTheme(dark ? 'dark' : 'light'),
    toggleDarkMode: toggleTheme,
  };
};
