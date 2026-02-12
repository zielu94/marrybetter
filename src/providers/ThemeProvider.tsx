"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface ThemeContextValue {
  theme: string; // "light" | "dark" | "system"
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  theme: string;
}

export default function ThemeProvider({ children, theme: initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState(initialTheme);

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(mode: string) {
      if (mode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches ? "dark" : "light");

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
