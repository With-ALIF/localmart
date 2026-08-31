import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useMatches,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { ShopProvider } from "../lib/shop-store";
import { AuthProvider } from "../lib/auth-store";
import { StoreSettingsProvider } from "../lib/store-settings";
import { AdminAuthProvider } from "../lib/admin/admin-auth";
import { DataProvider } from "../lib/admin/admin-data";
import { Header } from "../components/shop/Header";
import { Footer } from "../components/shop/Footer";
import { MobileBottomNav } from "../components/shop/MobileBottomNav";
import { PwaInstallBanner } from "../components/shop/PwaInstallBanner";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { toBnNumber } from "../lib/format";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">পৃষ্ঠা পাওয়া যায়নি</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          আপনি যে পৃষ্ঠাটি খুঁজছেন তা নেই বা সরিয়ে ফেলা হয়েছে।
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            হোমে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">পৃষ্ঠা লোড হয়নি</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          আমাদের পক্ষে কিছু সমস্যা হয়েছে। আপনি রিফ্রেশ করতে পারেন অথবা হোমে ফিরে যেতে পারেন।
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            আবার চেষ্টা করুন
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            হোমে ফিরে যান
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Patgram Online Store" },
      {
        name: "description",
        content:
          "নিত্যপ্রয়োজনীয় মুদি থেকে ইলেকট্রনিক্স — সবকিছু এক জায়গায়, সেরা দামে ও দ্রুত ডেলিভারিতে।",
      },
      { name: "author", content: "Patgram Online Store" },
      { property: "og:title", content: "Patgram Online Store" },
      {
        property: "og:description",
        content: "নিত্যপ্রয়োজনীয় মুদি থেকে ইলেকট্রনিক্স — সবকিছু এক জায়গায়।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#16a34a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Patgram" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/localmart.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const matches = useMatches();
  const isAdmin = matches.some((m) => m.pathname.startsWith("/admin"));

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StoreSettingsProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <DataProvider>
              <ShopProvider>
                <div className="min-h-screen">
                  {!isAdmin && <Header />}
                  <main>
                    <Outlet />
                  </main>
                  {!isAdmin && <Footer />}
                  {!isAdmin && <MobileBottomNav />}
                  {!isAdmin && <PwaInstallBanner />}
                </div>
                <Toaster position="top-center" richColors />
              </ShopProvider>
            </DataProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </StoreSettingsProvider>
    </QueryClientProvider>
  );
}
