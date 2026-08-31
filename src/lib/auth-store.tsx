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
  avatar: string;
  createdAt: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(data: { id: string; email?: string; created_at?: string; user_metadata?: Record<string, any> }, profile?: { name?: string; phone?: string; avatar_url?: string } | null): User {
  return {
    id: data.id,
    name: profile?.name ?? data.user_metadata?.full_name ?? data.user_metadata?.name ?? "",
    email: data.email ?? "",
    phone: profile?.phone ?? data.user_metadata?.phone ?? "",
    avatar: profile?.avatar_url ?? data.user_metadata?.avatar_url ?? "",
    createdAt: data.created_at ?? "",
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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, phone, avatar_url")
          .eq("id", session.user.id)
          .maybeSingle();
        const u = mapUser(session.user, profile);
        setUser(u);
        setIsAuthenticated(true);
      }
      setHydrated(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, phone, avatar_url")
          .eq("id", session.user.id)
          .maybeSingle();

        const meta = session.user.user_metadata || {};
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await supabase.from("profiles").upsert({
            id: session.user.id,
            name: meta.full_name || meta.name || profile?.name || "",
            phone: meta.phone || profile?.phone || "",
            email: session.user.email || "",
            avatar_url: meta.picture || meta.avatar_url || profile?.avatar_url || "",
          }, { onConflict: "id" });
        }

        const u = mapUser(session.user, { ...profile, avatar_url: meta.picture || meta.avatar_url || profile?.avatar_url || "" });
        setUser(u);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) return { success: false, error: "Supabase configure হয়নি।" };
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();
    if (!email || !password) return { success: false, error: "ইমেইল এবং পাসওয়ার্ড দিন" };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Login error:", error.message, "status:", error.status);
      if (error.status === 429) return { success: false, error: "অনেক বেশি চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করুন।" };
      if (error.message.includes("Email not confirmed")) {
        return { success: false, error: "আপনার ইমেইল ভেরিফাই করা হয়নি। অনুগ্রহ করে আপনার ইমেইল ইনবক্স চেক করুন।" };
      }
      if (error.status === 400 && error.message.includes("Invalid login")) {
        return { success: false, error: "ভুল ইমেইল বা পাসওয়ার্ড! অথবা account তৈরি হয়নি।" };
      }
      return { success: false, error: error.message || "ভুল ইমেইল বা পাসওয়ার্ড!" };
    }
    if (!data.session || !data.user) return { success: false, error: "লগইন ব্যর্থ হয়েছে।" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, phone, avatar_url")
      .eq("id", data.user.id)
      .maybeSingle();
    const u = mapUser(data.user, profile);
    setUser(u);
    setIsAuthenticated(true);
    return { success: true };
  }, []);

  const register = useCallback(
    async (nameInput: string, emailInput: string, phoneInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
      if (!isSupabaseConfigured) return { success: false, error: "Supabase configure হয়নি।" };
      const name = nameInput.trim();
      const email = emailInput.trim().toLowerCase();
      const phone = phoneInput.trim();
      const password = passwordInput.trim();

      if (!name || !email || !password) return { success: false, error: "সব তথ্য পূরণ করুন" };
      if (password.length < 6) return { success: false, error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });

      if (error) {
        console.error("Register error:", error.message, "status:", error.status);
        if (error.status === 429) return { success: false, error: "অনেক বেশি চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করুন।" };
        if (error.message.includes("already registered") || error.message.includes("already been registered")) {
          return { success: false, error: "এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে Login করুন।" };
        }
        return { success: false, error: error.message || "নিবন্ধন ব্যর্থ হয়েছে।" };
      }
      if (!data.user) return { success: false, error: "নিবন্ধন ব্যর্থ হয়েছে।" };

      if (data.session) {
        // If session exists, user is immediately logged in
        await supabase.from("profiles").upsert({
          id: data.user.id,
          name,
          phone,
          email,
          avatar_url: "",
        });

        const u = mapUser(data.session.user, { name, phone });
        setUser(u);
        setIsAuthenticated(true);
      }
      return { success: true };
    },
    [],
  );

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) return { success: false, error: "Supabase configure হয়নি।" };

    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: siteUrl,
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      return { success: false, error: error.message || "Google লগইন ব্যর্থ হয়েছে।" };
    }
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
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
      loginWithGoogle,
      logout,
    }),
    [isAuthenticated, user, hydrated, login, register, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
