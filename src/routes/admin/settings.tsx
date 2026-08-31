import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Store,
  Save,
  MapPin,
  Phone,
  Mail,
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
  storePhone2: string;
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
  storePhone: "01611820567",
  storePhone2: "01911820567",
  storeEmail: "rs2pgm@gmail.com",
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
  adminName: "Raju",
  adminEmail: "admin@patgram.com",
};

type Tab = "store";

const tabs: { id: Tab; label: string; icon: typeof Store }[] = [
  { id: "store", label: "দোকান সেটিংস", icon: Store },
];

function SettingsContent() {
  const { isAdminAuthenticated, adminUser, hydrated } = useAdminAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<Tab>("store");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "store_settings")
            .single();
          if (data?.value && typeof data.value === "object" && !Array.isArray(data.value)) {
            const merged = { ...defaultSettings, ...(data.value as Partial<Settings>) };
            setSettings(merged);
            try {
              window.localStorage.setItem("patgram_settings", JSON.stringify(merged));
            } catch {}
          }
        } else {
          const raw = window.localStorage.getItem("patgram_settings");
          if (raw) {
            setSettings({ ...defaultSettings, ...JSON.parse(raw) });
          }
        }
      } catch {
        // keep defaultSettings
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (!hydrated || isLoading) return null;
  if (!isAdminAuthenticated) return <Navigate to="/admin" />;

  const update = (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = async () => {
    try {
      window.localStorage.setItem("patgram_settings", JSON.stringify(settings));
      if (isSupabaseConfigured) {
        await supabase
          .from("settings")
          .upsert({ key: "store_settings", value: settings as unknown as import("@/lib/database.types").Json }, { onConflict: "key" });
      }
      toast.success("সেটিংস সংরক্ষিত হয়েছে!");
    } catch {
      toast.error("সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে");
    }
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
                      <label className="mb-1.5 block text-xs font-bold">বিকল্প ফোন</label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          value={settings.storePhone2}
                          onChange={(e) => update({ storePhone2: e.target.value })}
                          placeholder="ঐচ্ছিক"
                          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none focus:border-primary"
                        />
                      </div>
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
