import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("pwa_install_dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa_install_dismissed", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:bottom-auto lg:top-20 lg:left-auto lg:right-6 lg:w-80">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg">
        <img src="/localmart.png" alt="Patgram" className="size-10 shrink-0 rounded-xl object-contain" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold">Patgram Online Shop</p>
          <p className="text-[10px] text-muted-foreground">হোমস্ক্রিনে ইনস্টল করুন</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground transition hover:opacity-90"
          >
            <Download className="size-3" />
            ইনস্টল
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
