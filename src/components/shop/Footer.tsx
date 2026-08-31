import {
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { useStoreSettings } from "@/lib/store-settings";

export function Footer() {
  const settings = useStoreSettings();

  return (
    <footer className="mt-20 border-t border-border bg-surface pb-20 md:pb-0">
      <div className="container-page flex flex-col justify-between gap-6 py-8 md:flex-row md:items-start">
        <div className="max-w-sm space-y-2">
          <div className="flex items-center gap-2.5">
            <img src="/localmart.png" alt={settings.storeName} className="h-9 w-9 rounded-xl object-contain" />
            <span className="font-display text-lg font-extrabold">{settings.storeName}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {settings.storeDescription}
          </p>
        </div>

        <div className="md:text-right">
          <h3 className="mb-2 text-sm font-bold">যোগাযোগ</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5 md:justify-end">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="text-left md:text-right">
                <p className="font-semibold">{settings.storePhone}</p>
                {settings.storePhone2 && <p className="text-sm">{settings.storePhone2}</p>}
              </div>
            </li>
            <li className="flex items-start gap-2.5 md:justify-end">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>{settings.storeEmail}</p>
            </li>
            <li className="flex items-start gap-2.5 md:justify-end">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>{settings.storeAddress}</p>
            </li>
            <li className="flex items-start gap-2.5 md:justify-end">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>সকাল ৮টা – রাত ১২টা</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex items-center justify-center py-3">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            © ২০২৬ {settings.storeName} <br />
            সর্বস্বত্ব সংরক্ষিত
          </p>
        </div>
      </div>
    </footer>
  );
}