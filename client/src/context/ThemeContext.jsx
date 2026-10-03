/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const THEME_KEY = "tw-theme";
const TRANSITION_CLASS = "theme-transition";
const TRANSITION_DURATION = 260;

/** Read the persisted theme, falling back to the OS preference. */
function readInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* storage unavailable — fall through to system preference */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((next) => {
    const target = next === "dark" ? "dark" : "light";
    const root = document.documentElement;

    root.classList.add(TRANSITION_CLASS);
    setThemeState(target);
    try {
      localStorage.setItem(THEME_KEY, target);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }

    window.setTimeout(() => {
      root.classList.remove(TRANSITION_CLASS);
    }, TRANSITION_DURATION);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const target = current === "dark" ? "light" : "dark";
      const root = document.documentElement;

      root.classList.add(TRANSITION_CLASS);
      try {
        localStorage.setItem(THEME_KEY, target);
      } catch {
        /* storage unavailable */
      }
      window.setTimeout(() => {
        root.classList.remove(TRANSITION_CLASS);
      }, TRANSITION_DURATION);

      return target;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
