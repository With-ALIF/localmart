import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

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

function mapUser(session: Session, profile?: { name?: string; phone?: string }): User {
  return {
    name: profile?.name ?? session.user.user_metadata?.name ?? "",
    email: session.user.email ?? "",
    phone: profile?.phone ?? session.user.user_metadata?.phone ?? "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setHydrated(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("profiles")
          .select("name, phone")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUser(mapUser(session, profile ?? undefined));
            setIsAuthenticated(true);
            setHydrated(true);
          });
      } else {
        setHydrated(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, phone")
          .eq("id", session.user.id)
          .single();
        setUser(mapUser(session, profile ?? undefined));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setHydrated(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      if (!email || !email.includes("@")) return false;
      await new Promise((r) => setTimeout(r, 500));
      setUser({ name: email.split("@")[0], email, phone: "" });
      setIsAuthenticated(true);
      return true;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, phone")
      .eq("id", data.session.user.id)
      .single();
    setUser(mapUser(data.session, profile ?? undefined));
    setIsAuthenticated(true);
    return true;
  }, []);

  const register = useCallback(
    async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
      if (!isSupabaseConfigured) {
        if (!name || !email || !email.includes("@")) return false;
        await new Promise((r) => setTimeout(r, 500));
        setUser({ name, email, phone });
        setIsAuthenticated(true);
        return true;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });
      if (error || !data.user) return false;

      await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        phone,
      });

      if (data.session) {
        setUser(mapUser(data.session, { name, phone }));
        setIsAuthenticated(true);
      }
      return true;
    },
    [],
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      hydrated,
      login,
      register,
      logout,
    }),
    [isAuthenticated, user, hydrated, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
