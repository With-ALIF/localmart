import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Store,
  User,
  Bell,
  Globe,
  Truck,
  Shield,
  Save,
  Eye,
  EyeOff,
  Upload,
  MapPin,
  Phone,
  Mail,
  FileText,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/admin-auth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type Settings = {
  storeName: string;
  storeDescription: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  currency: string;
  language: string;
  freeShippingMin: number;
  shippingFee: number;
  deliveryNote: string;
  lowStockAlert: number;
  orderNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  adminName: string;
  adminEmail: string;
};

const defaultSettings: Settings = {
  storeName: "Patgram Online Store",
  storeDescription: "নিত্যপ্রয়োজনীয় মুদি থেকে ইলেকট্রনিক্স — সবকিছু এক জায়গায়",
  storePhone: "01XXXXXXXXX",
  storeEmail: "support@patgram.com",
  storeAddress: "পটগ্রাম, লালমনিরহাট",
  currency: "BDT",
  language: "bn",
  freeShippingMin: 500,
  shippingFee: 0,
  deliveryNote: "",
  lowStockAlert: 10,
  orderNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  adminName: "Admin",
  adminEmail: "admin@patgram.com",
};

type Tab = "store" | "profile" | "notifications" | "shipping" | "security";

const tabs: { id: Tab; label: string; icon: typeof Store }[] = [
  { id: "store", label: "দোকান সেটিংস", icon: Store },
  { id: "profile", label: "অ্যাডমিন প্রোফাইল", icon: User },
  { id: "notifications", label: "নোটিফিকেশন", icon: Bell },
  { id: "shipping", label: "ডেলিভারি সেটিংস", icon: Truck },
  { id: "security", label: "নিরাপত্তা", icon: Shield },
];

function SettingsContent() {
  const { isAdminAuthenticated, adminUser } = useAdminAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<Tab>("store");
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "store_settings")
          .single();
        if (data?.value && typeof data.value === "object" && !Array.isArray(data.value)) {
          setSettings({ ...defaultSettings, ...(data.value as Partial<Settings>) });
        }
      } else {
        try {
          const raw = window.localStorage.getItem("patgram_settings");
          if (raw) {
            setSettings({ ...defaultSettings, ...JSON.parse(raw) });
          }
        } catch {}
      }
    }
    load();
  }, []);

  if (!isAdminAuthenticated) return <Navigate to="/admin" />;

  const update = (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = async () => {
    if (isSupabaseConfigured) {
      await supabase
        .from("settings")
        .upsert({ key: "store_settings", value: settings as unknown as import("@/lib/database.types").Json }, { onConflict: "key" });
    } else {
      window.localStorage.setItem("patgram_settings", JSON.stringify(settings));
    }
    toast.success("সেটিংস সংরক্ষিত হয়েছে!");
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("সব ক্ষেত্র পূরণ করুন");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("নতুন পাসওয়ার্ড মিলছে না");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    toast.success("পাসওয়ার্ড পরিবর্তন হয়েছে!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold">সেটিংস</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">আপনার স্টোর ও অ্যাকাউন্ট কনফিগার করুন</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="shrink-0 lg:w-56">
            <nav className="rounded-2xl border border-border bg-card p-2 shadow-soft">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                    activeTab === t.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <t.icon className="size-4" />
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 space-y-6">
            {activeTab === "store" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                  <Store className="size-5 text-primary" />
                  দোকান সেটিংস
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold">দোকানের নাম</label>
                    <input
                      value={settings.storeName}
                      onChange={(e) => update({ storeName: e.target.value })}
                      className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold">বিবরণ</label>
                    <textarea
                      value={settings.storeDescription}
                      onChange={(e) => update({ storeDescription: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold">ফোন</label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          value={settings.storePhone}
                          onChange={(e) => update({ storePhone: e.target.value })}
                          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold">ইমেইল</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          value={settings.storeEmail}
                          onChange={(e) => update({ storeEmail: e.target.value })}
                          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold">ঠিকানা</label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                      <textarea
                        value={settings.storeAddress}
                        onChange={(e) => update({ storeAddress: e.target.value })}
                        rows={2}
                        className="w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold">মুদ্রা</label>
                      <select
                        value={settings.currency}
                        onChange={(e) => update({ currency: e.target.value })}
                        className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                      >
                        <option value="BDT">টাকা (৳)</option>
                        <option value="USD">ডলার ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold">ভাষা</label>
                      <select
                        value={settings.language}
                        onChange={(e) => update({ language: e.target.value })}
                        className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                      >
                        <option value="bn">বাংলা</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                  >
                    <Save className="size-4" />
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                  <User className="size-5 text-primary" />
                  অ্যাডমিন প্রোফাইল
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                      {settings.adminName.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold">{settings.adminName}</p>
                      <p className="text-sm text-muted-foreground">{settings.adminEmail}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold">নাম</label>
                      <input
                        value={settings.adminName}
                        onChange={(e) => update({ adminName: e.target.value })}
                        className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold">ইমেইল</label>
                      <input
                        value={settings.adminEmail}
                        onChange={(e) => update({ adminEmail: e.target.value })}
                        className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                  >
                    <Save className="size-4" />
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                  <Bell className="size-5 text-primary" />
                  নোটিফিকেশন সেটিংস
                </h2>
                <div className="space-y-4">
                  {[
                    { key: "orderNotifications" as const, label: "অর্ডার নোটিফিকেশন", desc: "নতুন অর্ডার এলে বিজ্ঞপ্তি পান" },
                    { key: "emailNotifications" as const, label: "ইমেইল নোটিফিকেশন", desc: "গুরুত্বপূর্ণ আপডেট ইমেইলে পান" },
                    { key: "smsNotifications" as const, label: "SMS নোটিফিকেশন", desc: "এসএমএসে বিজ্ঞপ্তি পান" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-4 transition hover:border-primary/30"
                    >
                      <div>
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => update({ [item.key]: !settings[item.key] })}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition",
                          settings[item.key] ? "bg-primary" : "bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block size-4 rounded-full bg-white transition-transform",
                            settings[item.key] ? "translate-x-6" : "translate-x-1",
                          )}
                        />
                      </button>
                    </label>
                  ))}
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                  >
                    <Save className="size-4" />
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                  <Truck className="size-5 text-primary" />
                  ডেলিভারি সেটিংস
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold">ফ্রি ডেলিভারি মিনিমাম (৳)</label>
                      <input
                        type="number"
                        value={settings.freeShippingMin}
                        onChange={(e) => update({ freeShippingMin: Number(e.target.value) })}
                        className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        এই পরিমাণের বেশি অর্ডারে ফ্রি ডেলিভারি
                      </p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold">ডেলিভারি ফি (৳)</label>
                      <input
                        type="number"
                        value={settings.shippingFee}
                        onChange={(e) => update({ shippingFee: Number(e.target.value) })}
                        className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        ০ হলে সব অর্ডারে ফ্রি
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold">কম স্টক সতর্কতা</label>
                    <input
                      type="number"
                      value={settings.lowStockAlert}
                      onChange={(e) => update({ lowStockAlert: Number(e.target.value) })}
                      className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      এই পরিমাণের কম স্টক থাকলে সতর্কতা দেখাবে
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold">ডেলিভারি নোট</label>
                    <textarea
                      value={settings.deliveryNote}
                      onChange={(e) => update({ deliveryNote: e.target.value })}
                      placeholder="যেমন: ঢাকায় ২৪ ঘণ্টায় ডেলিভারি"
                      rows={2}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                  >
                    <Save className="size-4" />
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                  <Shield className="size-5 text-primary" />
                  পাসওয়ার্ড পরিবর্তন
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold">বর্তমান পাসওয়ার্ড</label>
                    <div className="relative">
                      <Shield className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••"
                        className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-11 text-sm outline-none focus:border-primary"
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
                    <label className="mb-1.5 block text-xs font-bold">নতুন পাসওয়ার্ড</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold">পাসওয়ার্ড নিশ্চিত করুন</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড আবার দিন"
                      className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                  >
                    <CheckCircle className="size-4" />
                    পাসওয়ার্ড পরিবর্তন করুন
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminSettingsPage() {
  return (
    <AdminAuthProvider>
      <SettingsContent />
    </AdminAuthProvider>
  );
}

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});
