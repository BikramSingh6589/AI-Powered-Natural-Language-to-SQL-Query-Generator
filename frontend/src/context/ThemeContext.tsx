import React, { createContext, useContext, useEffect, useState, useRef } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", systemPrefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const toggleTheme = (origin?: { x: number; y: number }) => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    // View Transitions API ripple — if supported
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      origin
    ) {
      const { x, y } = origin;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const style = document.createElement("style");
      style.textContent = `
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
        ::view-transition-new(root) {
          clip-path: circle(0px at ${x}px ${y}px);
          animation: theme-ripple 0.75s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes theme-ripple {
          to {
            clip-path: circle(${endRadius}px at ${x}px ${y}px);
          }
        }
      `;
      document.head.appendChild(style);

      // @ts-ignore – startViewTransition is not yet in TS types
      const transition = document.startViewTransition(() => {
        setThemeState(nextTheme);
      });

      transition.ready.then(() => {
        setTimeout(() => document.head.removeChild(style), 800);
      }).catch(() => {
        document.head.removeChild(style);
      });
    } else {
      setThemeState(nextTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
