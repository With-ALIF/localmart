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

type User = {
  id?: string;
  name: string;
  email: string;
  phone: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "patgram_session";

function mapUser(data: { id: string; email?: string; user_metadata?: Record<string, any> }, profile?: { name?: string; phone?: string } | null): User {
  return {
    id: data.id,
    name: profile?.name ?? data.user_metadata?.name ?? "",
    email: data.email ?? "",
    phone: profile?.phone ?? data.user_metadata?.phone ?? "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(SESSION_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.email) {
              setUser(parsed);
              setIsAuthenticated(true);
            }
          }
        } catch {}
      }
      setHydrated(true);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, phone")
          .eq("id", session.user.id)
          .maybeSingle();
        const u = mapUser(session.user, profile);
        setUser(u);
        setIsAuthenticated(true);
      }
      setHydrated(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, phone")
          .eq("id", session.user.id)
          .maybeSingle();
        const u = mapUser(session.user, profile);
        setUser(u);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) return { success: false, error: "ইমেইল এবং পাসওয়ার্ড দিন" };

    if (!isSupabaseConfigured) {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.email === email && parsed._pw === password) {
            setUser(parsed);
            setIsAuthenticated(true);
            return { success: true };
          }
        }
        const usersRaw = window.localStorage.getItem("patgram_users");
        const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
        const found = users.find((u: any) => u.email === email && u.password === password);
        if (found) {
          const u: User = { name: found.name, email: found.email, phone: found.phone };
          setUser(u);
          setIsAuthenticated(true);
          window.localStorage.setItem(SESSION_KEY, JSON.stringify(u));
          return { success: true };
        }
      }
      return { success: false, error: "ভুল ইমেইল বা পাসওয়ার্ড!" };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.status === 429) return { success: false, error: "অনেক বেশি চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করুন।" };
      return { success: false, error: "ভুল ইমেইল বা পাসওয়ার্ড!" };
    }
    if (!data.session) return { success: false, error: "লগইন ব্যর্থ হয়েছে।" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, phone")
      .eq("id", data.session.user.id)
      .maybeSingle();
    const u = mapUser(data.session.user, profile);
    setUser(u);
    setIsAuthenticated(true);
    return { success: true };
  }, []);

  const register = useCallback(
    async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
      if (!name || !email || !password) return { success: false, error: "সব তথ্য পূরণ করুন" };
      if (password.length < 6) return { success: false, error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর" };

      if (!isSupabaseConfigured) {
        if (typeof window !== "undefined") {
          const usersRaw = window.localStorage.getItem("patgram_users");
          const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
          if (users.some((u: any) => u.email === email)) {
            return { success: false, error: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে" };
          }
          users.push({ name, email, phone, password });
          window.localStorage.setItem("patgram_users", JSON.stringify(users));
          const u: User = { name, email, phone };
          setUser(u);
          setIsAuthenticated(true);
          window.localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        }
        return { success: true };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });

      if (error) {
        if (error.status === 429) return { success: false, error: "অনেক বেশি চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করুন।" };
        return { success: false, error: error.message || "নিবন্ধন ব্যর্থ হয়েছে।" };
      }
      if (!data.user) return { success: false, error: "নিবন্ধন ব্যর্থ হয়েছে।" };

      await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        phone,
      }).catch(() => {});

      if (data.session) {
        const u = mapUser(data.session.user, { name, phone });
        setUser(u);
        setIsAuthenticated(true);
      }
      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_KEY);
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
