import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Tag,
  Star,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Sprout,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin/admin-auth";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/offers", label: "Offers", icon: Tag, placeholder: true },
  { to: "/admin/reviews", label: "Reviews", icon: Star, placeholder: true },
  { to: "/admin/reports", label: "Reports", icon: BarChart3, placeholder: true },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminLayout({ children }: { children?: ReactNode }) {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate({ to: "/admin" });
  };

  return (
    <div className="flex h-screen bg-muted/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <img src="/localmart.png" alt="Logo" className="h-8 w-auto object-contain" />
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold">Patgram</p>
            <p className="text-[10px] text-muted-foreground">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {sidebarLinks.map((l) => {
            const isActive =
              location.pathname === l.to ||
              (l.to !== "/admin/dashboard" && location.pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  l.placeholder && "opacity-50",
                )}
              >
                <l.icon className="size-[18px]" />
                {l.label}
                {l.placeholder && (
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="size-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="size-5" />
          </button>

          <div className="hidden flex-1 md:block">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search..."
                className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary">
              <Bell className="size-[18px]" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-secondary"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  A
                </div>
                <span className="hidden text-sm font-semibold md:block">
                  {adminUser?.name || "Admin"}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                    <div className="border-b border-border px-4 py-2">
                      <p className="text-sm font-bold">{adminUser?.name}</p>
                      <p className="text-[11px] text-muted-foreground">{adminUser?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg lg:hidden">
        <div className="grid grid-cols-5 items-center py-1.5">
          {[
            { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { to: "/admin/products", label: "Products", icon: Package },
            { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
            { to: "/admin/customers", label: "Customers", icon: Users },
            { to: "/admin/settings", label: "Settings", icon: Settings },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative flex flex-col items-center gap-0.5 py-1"
            >
              {({ isActive }) => (
                <>
                  <l.icon
                    className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground")}
                  />
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
    </div>
  );
}
