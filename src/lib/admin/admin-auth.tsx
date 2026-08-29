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

const ADMIN_STORAGE_KEY = "patgram_admin_auth";

export type AdminUser = { name: string; email: string; id: string };

// Profile type returned from Supabase 'profiles' table
interface Profile {
  name: string | null;
  email: string | null;
}

type AdminAuthContextValue = {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  hydrated: boolean;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function getInitialAdminState(): { isAuth: boolean; user: AdminUser | null } {
  if (typeof window === "undefined") return { isAuth: false, user: null };
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) {
      const parsed: Partial<AdminUser> = JSON.parse(raw);
      if (parsed.email === "admin@patgram.com") {
        return {
          isAuth: true,
          user: { name: parsed.name ?? "Admin", email: parsed.email!, id: parsed.id ?? "" },
        };
      }
    }
  } catch {}
  return { isAuth: false, user: null };
}

async function fetchAdminProfile(userId: string): Promise<AdminUser | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", userId)
      .maybeSingle();
    if (data) {
      return { name: data.name ?? "Admin", email: data.email ?? "admin@patgram.com", id: userId };
    }
  } catch {}
  return null;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => getInitialAdminState(), []);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(initial.isAuth);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(initial.user);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const email = session.user.email?.trim().toLowerCase();
        if (email === "admin@patgram.com") {
          const profile = await fetchAdminProfile(session.user.id);
          const u: AdminUser = profile ?? { name: "Admin", email: session.user.email ?? "admin@patgram.com", id: session.user.id };
          setAdminUser(u);
          setIsAdminAuthenticated(true);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(u));
          }
        }
      } else if (event === "SIGNED_OUT") {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(ADMIN_STORAGE_KEY);
        }
        setIsAdminAuthenticated(false);
        setAdminUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email?.trim().toLowerCase();
        if (email === "admin@patgram.com") {
          const profile = await fetchAdminProfile(session.user.id);
          const u: AdminUser = profile ?? { name: "Admin", email: session.user.email ?? "admin@patgram.com", id: session.user.id };
          setAdminUser(u);
          setIsAdminAuthenticated(true);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(u));
          }
        }
      }
    });
  }, []);

  const adminLogin = useCallback(
    async (emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
      if (!isSupabaseConfigured) return { success: false, error: "Supabase configure হয়নি।" };

      const email = emailInput.trim().toLowerCase();
      const password = passwordInput.trim();

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Admin login error:", error.message, "status:", error.status);
        if (error.status === 429) return { success: false, error: "অনেক বেশি চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করুন।" };
        if (error.status === 400 && error.message.includes("Invalid login")) {
          return { success: false, error: "ভুল Email বা Password! অথবা এই account তৈরি হয়নি। 'Create Account' এ গিয়ে account তৈরি করুন।" };
        }
        return { success: false, error: error.message || "ভুল Email বা Password!" };
      }
      if (!data.user) return { success: false, error: "লগইন ব্যর্থ হয়েছে।" };

      const userEmail = data.user.email?.trim().toLowerCase();
      if (userEmail !== "admin@patgram.com") {
        await supabase.auth.signOut();
        return { success: false, error: "এই অ্যাকাউন্টের এডমিন অ্যাক্সেস নেই।" };
      }

      const profile = await fetchAdminProfile(data.user.id);
      const u: AdminUser = profile ?? { name: "Admin", email: data.user.email ?? "admin@patgram.com", id: data.user.id };
      setAdminUser(u);
      setIsAdminAuthenticated(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(u));
      }
      return { success: true };
    },
    [],
  );

  const adminLogout = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
    setIsAdminAuthenticated(false);
    setAdminUser(null);
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      isAdminAuthenticated,
      adminUser,
      hydrated,
      adminLogin,
      adminLogout,
    }),
    [isAdminAuthenticated, adminUser, hydrated, adminLogin, adminLogout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
