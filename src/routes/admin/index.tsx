import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/admin-auth";

function AdminLoginInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { adminLogin, isAdminAuthenticated, hydrated } = useAdminAuth();
  const navigate = useNavigate();

  if (hydrated && isAdminAuthenticated) {
    navigate({ to: "/admin/dashboard", replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email এবং Password দিন");
      return;
    }
    setLoading(true);
    const res = await adminLogin(email, password);
    setLoading(false);
    if (res.success) {
      toast.success("Admin login successful!");
      navigate({ to: "/admin/dashboard", replace: true });
    } else {
      setError(res.error || "ভুল credentials। আবার চেষ্টা করুন।");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/localmart.png" alt="Logo" className="h-10 w-auto object-contain" />
          </Link>
          <h1 className="mt-4 font-display text-2xl font-extrabold">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Patgram Online Store</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          {error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-bold">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@patgram.com"
                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-border accent-primary" />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminLoginPage() {
  return (
    <AdminAuthProvider>
      <AdminLoginInner />
    </AdminAuthProvider>
  );
}

export const Route = createFileRoute("/admin/")({
  component: AdminLoginPage,
});
