import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Package, ShoppingCart, User, ShieldCheck } from "lucide-react";
import { useShop } from "@/lib/shop-store";
import { useAdminAuth } from "@/lib/admin/admin-auth";
import { toBnNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const { cartCount } = useShop();
  const { isAdminAuthenticated } = useAdminAuth();

  const links = [
    { to: "/", label: "হোম", icon: Home },
    { to: "/categories", label: "ক্যাটাগরি", icon: LayoutGrid },
    { to: "/products", label: "পণ্য", icon: Package },
    isAdminAuthenticated
      ? { to: "/admin", label: "এডমিন", icon: ShieldCheck }
      : { to: "/cart", label: "কার্ট", icon: ShoppingCart },
    { to: "/account", label: "অ্যাকাউন্ট", icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg md:hidden">
      <div className="grid grid-cols-5 items-center py-1.5">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={{ exact: l.to === "/" }}
            className="relative flex flex-col items-center gap-0.5 py-1"
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <l.icon
                    className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground")}
                  />
                  {l.to === "/cart" && cartCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {toBnNumber(cartCount)}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {l.label}
                </span>
                {isActive && <span className="absolute top-0 h-0.5 w-6 rounded-full bg-primary" />}
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
