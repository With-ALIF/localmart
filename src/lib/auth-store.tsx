import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const AUTH_KEY = "shobuj-bazar-auth";

type User = {
  name: string;
  email: string;
  phone: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readAuth(): { isAuthenticated: boolean; user: User | null } {
  if (typeof window === "undefined") return { isAuthenticated: false, user: null };
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { isAuthenticated: data.isAuthenticated ?? false, user: data.user ?? null };
    }
  } catch {}
  return { isAuthenticated: false, user: null };
}

function writeAuth(isAuthenticated: boolean, user: User | null) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated, user }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(() => readAuth());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeAuth(auth.isAuthenticated, auth.user);
  }, [auth, hydrated]);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Mock login — accept any valid-looking email
    if (!email || !email.includes("@")) return false;
    await new Promise((r) => setTimeout(r, 500));
    const user: User = { name: email.split("@")[0], email, phone: "" };
    setAuth({ isAuthenticated: true, user });
    return true;
  }, []);

  const register = useCallback(
    async (name: string, email: string, phone: string, _password: string): Promise<boolean> => {
      // Mock register — accept any valid-looking input
      if (!name || !email || !email.includes("@")) return false;
      await new Promise((r) => setTimeout(r, 500));
      const user: User = { name, email, phone };
      setAuth({ isAuthenticated: true, user });
      return true;
    },
    [],
  );

  const logout = useCallback(() => {
    setAuth({ isAuthenticated: false, user: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: auth.isAuthenticated,
      user: auth.user,
      hydrated,
      login,
      register,
      logout,
    }),
    [auth, hydrated, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
