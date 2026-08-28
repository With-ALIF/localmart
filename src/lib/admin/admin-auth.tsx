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

export type AdminUser = { name: string; email: string };

type AdminAuthContextValue = {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  hydrated: boolean;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function getInitialAdminState(): { isAuth: boolean; user: AdminUser | null } {
  if (typeof window === "undefined") {
    return { isAuth: false, user: null };
  }
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.email === "admin@patgram.com" || parsed.isAdmin)) {
        return {
          isAuth: true,
          user: { name: parsed.name ?? "Admin", email: parsed.email ?? "admin@patgram.com" },
        };
      }
    }
  } catch (err) {
    console.warn("Failed to load initial admin session:", err);
  }
  return { isAuth: false, user: null };
}

async function fetchAdminProfile(userId: string): Promise<AdminUser | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Could not fetch admin profile from Supabase:", error.message);
      return null;
    }

    if (data) {
      const profile = data as { name?: string | null; email?: string | null };
      return {
        name: profile.name || "Admin",
        email: profile.email || "admin@patgram.com",
      };
    }
  } catch (e) {
    console.warn("Error fetching admin profile:", e);
  }
  return null;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => getInitialAdminState(), []);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(initial.isAuth);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(initial.user);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Sync Supabase Auth listener
  // Set hydrated flag after first render (client only)
  useEffect(() => {
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;
        const email = user.email?.trim().toLowerCase();
        if (email === "admin@patgram.com") {
          const profile = await fetchAdminProfile(user.id);
          const u: AdminUser = profile ?? { name: "Admin", email: user.email ?? "admin@patgram.com" };
          setAdminUser(u);
          setIsAdminAuthenticated(true);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ ...u, isAdmin: true }));
          }
        }
      } else if (event === "SIGNED_OUT") {
        // If session in storage was from Supabase login, clear it
        if (typeof window !== "undefined") {
          const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (!parsed?.isMasterLocal) {
              window.localStorage.removeItem(ADMIN_STORAGE_KEY);
              setIsAdminAuthenticated(false);
              setAdminUser(null);
            }
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync session on mount if available
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const user = session.user;
        const email = user.email?.trim().toLowerCase();
        if (email === "admin@patgram.com") {
          const profile = await fetchAdminProfile(user.id);
          const u: AdminUser = profile ?? { name: "Admin", email: user.email ?? "admin@patgram.com" };
          setAdminUser(u);
          setIsAdminAuthenticated(true);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ ...u, isAdmin: true }));
          }
        }
      }
    });
  }, []);

  const adminLogin = useCallback(
    async (emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
      const email = emailInput.trim().toLowerCase();
      const password = passwordInput.trim();

      const isMasterAdmin = email === "admin@patgram.com" && password === "admin123";

      // 1. Try Supabase Auth if configured
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: passwordInput, // preserve exact password chars
          });

          if (!error && data?.user) {
            const userEmail = data.user.email?.trim().toLowerCase();
            if (userEmail === "admin@patgram.com" || isMasterAdmin) {
              const profile = await fetchAdminProfile(data.user.id);
              const u: AdminUser = profile ?? {
                name: "Admin",
                email: data.user.email ?? "admin@patgram.com",
              };
              setAdminUser(u);
              setIsAdminAuthenticated(true);
              if (typeof window !== "undefined") {
                window.localStorage.setItem(
                  ADMIN_STORAGE_KEY,
                  JSON.stringify({ ...u, isAdmin: true, isMasterLocal: false }),
                );
              }
              return { success: true };
            } else {
              // Not an admin user email
              await supabase.auth.signOut();
              return { success: false, error: "এই অ্যাকাউন্টের এডমিন অ্যাক্সেস নেই।" };
            }
          } else if (error) {
            console.warn("Supabase Admin Sign-in Error:", error.message);
          }
        } catch (e: any) {
          console.warn("Supabase Auth Exception:", e?.message);
        }
      }

      // 2. Master Admin Fallback: If credentials match admin@patgram.com & admin123
      if (isMasterAdmin) {
        const u: AdminUser = { name: "Admin", email: "admin@patgram.com" };
        setAdminUser(u);
        setIsAdminAuthenticated(true);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            ADMIN_STORAGE_KEY,
            JSON.stringify({ ...u, isAdmin: true, isMasterLocal: true }),
          );
        }
        return { success: true };
      }

      return {
        success: false,
        error: "ভুল Email বা Password! দয়া করে সঠিক তথ্য দিন।",
      };
    },
    [],
  );

  const adminLogout = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Sign out notice:", err);
      }
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
  if (!ctx) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }
  return ctx;
}
