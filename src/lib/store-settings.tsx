import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type StoreSettings = {
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
};

const defaultSettings: StoreSettings = {
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
};

const StoreSettingsContext = createContext<StoreSettings>(defaultSettings);

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "store_settings")
            .single();
          if (data?.value && typeof data.value === "object" && !Array.isArray(data.value)) {
            setSettings({ ...defaultSettings, ...(data.value as Partial<StoreSettings>) });
          }
        } catch {
          // fallback to defaults
        }
      } else {
        try {
          const raw = window.localStorage.getItem("patgram_settings");
          if (raw) {
            setSettings({ ...defaultSettings, ...JSON.parse(raw) });
          }
        } catch {
          // fallback to defaults
        }
      }
    }
    load();
  }, []);

  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  );
}
