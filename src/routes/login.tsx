import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, Sprout } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  if (isAuthenticated) {
    navigate({ to: (redirect as string) || "/", replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("ইমেইল এবং পাসওয়ার্ড দিন");
      return;
    }
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      toast.success("সফলভাবে লগইন হয়েছে!");
      navigate({ to: (redirect as string) || "/", replace: true });
    } else {
      toast.error("লগইন ব্যর্থ হয়েছে", { description: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" });
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/localmart.png" alt="লোগো" className="h-10 w-auto object-contain" />
          </Link>
          <h1 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">লগইন</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            এই সাইটের জন্য নিবন্ধন করা আপনাকে আপনার অর্ডার স্থিতি এবং ইতিহাস অ্যাক্সেস করতে দেয়৷ শুধু নীচের ক্ষেত্রগুলি পূরণ করুন, এবং আমরা কিছুক্ষণের মধ্যেই আপনার জন্য একটি নতুন অ্যাকাউন্ট সেট আপ করব৷ ক্রয় প্রক্রিয়াটি দ্রুত এবং সহজতর করার জন্য আমরা শুধুমাত্র আপনার কাছে প্রয়োজনীয় তথ্য চাইব।
          </p>
        </div>

        {redirect === "/checkout" && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-sm font-semibold text-primary">
              Checkout করতে Login অথবা Register করুন
            </p>
            <p className="mt-1 text-xs text-muted-foreground">আপনার Cart নিরাপদে সংরক্ষিত আছে।</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8"
        >
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
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold">পাসওয়ার্ড</label>
              <button
                type="button"
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড"
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
            <span className="text-sm text-muted-foreground">আমাকে মনে রাখুন</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          অ্যাকাউন্ট নেই?{" "}
          <Link
            to="/register"
            search={redirect ? { redirect } : undefined}
            className="font-semibold text-primary hover:underline"
          >
            রেজিস্টার করুন
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

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "",
  }),
});
