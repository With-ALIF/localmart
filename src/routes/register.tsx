import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  if (isAuthenticated) {
    navigate({ to: (redirect as string) || "/", replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("পাসওয়ার্ড মিলছে না");
      return;
    }
    if (password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    setLoading(true);
    const result = await register(name, email, phone, password);
    setLoading(false);
    if (result.success) {
      toast.success("সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে!");
      navigate({ to: (redirect as string) || "/", replace: true });
    } else {
      toast.error(result.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (!result.success) {
      toast.error(result.error || "Google লগইন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/localmart.png" alt="লোগো" className="h-10 w-auto object-contain" />
          </Link>
          <h1 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">রেজিস্টার</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            এই সাইটের জন্য নিবন্ধন করা আপনাকে আপনার অর্ডার স্থিতি এবং ইতিহাস অ্যাক্সেস করতে দেয়৷ শুধু নীচের ক্ষেত্রগুলি পূরণ করুন, এবং আমরা কিছুক্ষণের মধ্যেই আপনার জন্য একটি নতুন অ্যাকাউন্ট সেট আপ করব৷ ক্রয় প্রক্রিয়াটি দ্রুত এবং সহজতর করার জন্য আমরা শুধুমাত্র আপনার কাছে প্রয়োজনীয় তথ্য চাইব।
          </p>
        </div>

        {redirect === "/checkout" && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-sm font-semibold text-primary">Checkout করতে Register করুন</p>
            <p className="mt-1 text-xs text-muted-foreground">আপনার Cart নিরাপদে সংরক্ষিত আছে।</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8"
        >
          <div>
            <label className="mb-2 block text-xs font-bold">পুরো নাম</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার পুরো নাম"
                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold">মোবাইল নম্বর</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold">ইমেইল</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল"
                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষর"
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

          <div>
            <label className="mb-2 block text-xs font-bold">পাসওয়ার্ড নিশ্চিত করুন</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="পাসওয়ার্ড আবার দিন"
                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "রেজিস্টার হচ্ছে..." : "রেজিস্টার করুন"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">অথবা</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card py-3 text-sm font-bold transition hover:bg-secondary disabled:opacity-60"
        >
          <svg className="size-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {googleLoading ? "লগইন হচ্ছে..." : "Google দিয়ে রেজিস্টার করুন"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link
            to="/login"
            search={redirect ? { redirect } : undefined}
            className="font-semibold text-primary hover:underline"
          >
            লগইন করুন
          </Link>
        </p>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            ← কেনাকাটা চালিয়ে যান
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: (search.redirect as string) || undefined,
  }),
});
