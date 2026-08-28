import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const ADMIN_KEY = "patgram_admin_auth";

const ADMIN_CREDENTIALS = {
  email: "admin@patgram.com",
  password: "admin123",
  name: "Admin",
};

type AdminUser = { name: string; email: string };

type AdminAuthContextValue = {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  hydrated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function readAdminAuth(): { isAdminAuthenticated: boolean; adminUser: AdminUser | null } {
  if (typeof window === "undefined") return { isAdminAuthenticated: false, adminUser: null };
  try {
    const raw = window.localStorage.getItem(ADMIN_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        isAdminAuthenticated: data.isAdminAuthenticated ?? false,
        adminUser: data.adminUser ?? null,
      };
    }
  } catch {}
  return { isAdminAuthenticated: false, adminUser: null };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(() => readAdminAuth());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_KEY, JSON.stringify(auth));
    }
  }, [auth, hydrated]);

  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 400));
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setAuth({ isAdminAuthenticated: true, adminUser: { name: ADMIN_CREDENTIALS.name, email } });
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setAuth({ isAdminAuthenticated: false, adminUser: null });
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      isAdminAuthenticated: auth.isAdminAuthenticated,
      adminUser: auth.adminUser,
      hydrated,
      adminLogin,
      adminLogout,
    }),
    [auth, hydrated, adminLogin, adminLogout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
