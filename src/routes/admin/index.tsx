import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin/admin-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const { adminLogin, isAdminAuthenticated, hydrated } = useAdminAuth();
  const navigate = useNavigate();

  if (hydrated && isAdminAuthenticated) {
    navigate({ to: "/admin/dashboard", replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isSupabaseConfigured) {
      setError("Supabase configure হয়নি।");
      return;
    }
    if (!name.trim() || !email.trim() || !password) {
      setError("সব তথ্য পূরণ করুন");
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });
      if (signUpError) {
        console.error("Admin signup error:", signUpError);
        if (signUpError.status === 429) {
          setError("অনেক বেশি চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করুন।");
        } else if (signUpError.message.includes("already registered")) {
          setError("এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে। Login করুন।");
          setMode("login");
        } else {
          setError(signUpError.message || "নিবন্ধন ব্যর্থ হয়েছে।");
        }
        setLoading(false);
        return;
      }
      if (!data.user) {
        setError("নিবন্ধন ব্যর্থ হয়েছে।");
        setLoading(false);
        return;
      }
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name: name.trim(),
        email: email.trim(),
      }).catch(() => {});
      if (data.session) {
        const emailLower = data.user.email?.trim().toLowerCase();
        if (emailLower === "admin@patgram.com") {
          toast.success("Admin account created! Redirecting...");
          navigate({ to: "/admin/dashboard", replace: true });
        } else {
          toast.success("Account created! You can now login.");
          setMode("login");
        }
      } else {
        toast.success("Account created! Check email for verification, then login.");
        setMode("login");
      }
    } catch (err) {
      console.error("Admin registration unexpected error:", err);
      setError("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
    setLoading(false);
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
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          {error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive">
              {error}
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="mb-2 block text-xs font-bold">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin Name"
                className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading
              ? mode === "login" ? "Logging in..." : "Creating account..."
              : mode === "login" ? "Login" : "Create Admin Account"}
          </button>
        </form>

        {mode === "login" ? (
          <div className="text-center space-y-2">
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className="text-sm text-primary hover:underline font-medium"
            >
              Admin account নেই? Create করুন
            </button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="text-sm text-primary hover:underline font-medium"
            >
              আগের থেকে account আছে? Login করুন
            </button>
          </div>
        )}

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/")({
  component: AdminLoginPage,
});
