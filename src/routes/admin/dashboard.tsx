import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/admin-auth";
import { DataProvider, useData } from "@/lib/admin/admin-data";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatTaka, toBnNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const ORDERS_KEY = "patgram_orders";

type Order = {
  id: string;
  total: number;
  date: string;
  status: string;
};

function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getSalesChartData(orders: Order[], period: string) {
  const now = new Date();
  const labels: string[] = [];
  const data: number[] = [];

  if (period === "7D") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("bn-BD", { weekday: "short" });
      const dayOrders = orders.filter((o) => o.date === dateStr);
      labels.push(dayLabel);
      data.push(dayOrders.reduce((sum, o) => sum + o.total, 0));
    }
  } else if (period === "30D") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOrders = orders.filter((o) => o.date === dateStr);
      labels.push(`${d.getDate()}`);
      data.push(dayOrders.reduce((sum, o) => sum + o.total, 0));
    }
  } else if (period === "3M") {
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toISOString().slice(0, 7);
      const monthLabel = d.toLocaleDateString("bn-BD", { month: "short" });
      const monthOrders = orders.filter((o) => o.date.startsWith(monthStr));
      labels.push(monthLabel);
      data.push(monthOrders.reduce((sum, o) => sum + o.total, 0));
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const monthStr = `${now.getFullYear()}-${String(i + 1).padStart(2, "0")}`;
      const monthLabel = new Date(now.getFullYear(), i).toLocaleDateString("bn-BD", { month: "short" });
      const monthOrders = orders.filter((o) => o.date.startsWith(monthStr));
      labels.push(monthLabel);
      data.push(monthOrders.reduce((sum, o) => sum + o.total, 0));
    }
  }

  return { labels, data };
}

function DashboardContent() {
  const { isAdminAuthenticated } = useAdminAuth();
  const {
    products,
    orders,
    totalSales,
    totalOrders,
    totalProducts,
    totalCustomers,
    updateOrderStatus,
  } = useData();
  const [period, setPeriod] = useState("1Y");

  if (!isAdminAuthenticated) return <Navigate to="/admin" />;

  const allOrders = readOrders();
  const { labels: salesLabels, data: salesData } = useMemo(
    () => getSalesChartData(allOrders, period),
    [allOrders, period],
  );
  const maxSales = Math.max(...salesData, 1);
  const lowStockProducts = products
    .filter((p) => p.stock > 0 && p.stock <= 10)
    .sort((a, b) => a.stock - b.stock);
  const topProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5);
  const recentOrders = [...orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const stats = [
    {
      label: "Total Sales",
      value: formatTaka(totalSales),
      change: "+12.5%",
      up: true,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      label: "Total Orders",
      value: toBnNumber(totalOrders),
      change: "+8.2%",
      up: true,
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      label: "Total Products",
      value: toBnNumber(totalProducts),
      change: "+3",
      up: true,
      icon: Package,
      color: "text-orange-500",
    },
    {
      label: "Total Customers",
      value: toBnNumber(totalCustomers),
      change: "+5.1%",
      up: true,
      icon: Users,
      color: "text-purple-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Welcome back, Admin</p>
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="size-4" /> Add Product
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">{s.label}</span>
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl bg-primary/10",
                    s.color,
                  )}
                >
                  <s.icon className="size-[18px]" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold">{s.value}</p>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold">
                {s.up ? (
                  <ArrowUpRight className="size-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="size-3 text-red-500" />
                )}
                <span className={s.up ? "text-green-500" : "text-red-500"}>{s.change}</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Sales Analytics</h2>
              <div className="flex gap-1">
                {["7D", "30D", "3M", "1Y"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPeriod(t)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                      t === period
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-1 sm:gap-2" style={{ height: 200 }}>
              {salesData.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-primary/20 transition-all hover:bg-primary/40"
                    style={{ height: `${(v / maxSales) * 160}px` }}
                  />
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate max-w-full">
                    {salesLabels[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-bold">Top Products</h2>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products yet</p>
              ) : (
                topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {toBnNumber(i + 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {toBnNumber(p.reviews)} sold
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      {formatTaka(p.price * p.reviews)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card shadow-soft lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-lg font-bold">Recent Orders</h2>
              <Link
                to="/admin/orders"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-bold text-muted-foreground">
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-8 text-center text-sm text-muted-foreground"
                      >
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((o) => (
                      <tr
                        key={o.id}
                        className="border-b border-border/50 transition hover:bg-muted/50"
                      >
                        <td className="px-5 py-3 font-semibold">{o.id}</td>
                        <td className="px-5 py-3">{o.customer}</td>
                        <td className="px-5 py-3 font-semibold">{formatTaka(o.total)}</td>
                        <td className="px-5 py-3 text-muted-foreground">{o.payment}</td>
                        <td className="px-5 py-3">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize outline-none border-0 cursor-pointer",
                              statusColors[o.status],
                            )}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-bold">Low Stock</h2>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">All products are well stocked.</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <AlertTriangle
                      className={cn(
                        "size-4 shrink-0",
                        p.stock <= 3 ? "text-destructive" : "text-orange-500",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {toBnNumber(p.stock)} left
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        p.stock <= 3
                          ? "bg-destructive/10 text-destructive"
                          : "bg-orange-100 text-orange-600",
                      )}
                    >
                      {p.stock <= 3 ? "Critical" : "Low"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              to: "/admin/products/new",
              label: "+ New Product",
              color: "bg-primary text-primary-foreground",
            },
            {
              to: "/admin/categories",
              label: "+ New Category",
              color: "bg-secondary text-foreground",
            },
            {
              to: "/admin/products",
              label: "View Products",
              color: "bg-secondary text-foreground",
            },
            { to: "/admin/orders", label: "View Orders", color: "bg-secondary text-foreground" },
          ].map((a) => (
            <Link
              key={a.to + a.label}
              to={a.to}
              className={cn(
                "flex items-center justify-center rounded-xl py-3 text-sm font-bold transition hover:opacity-90",
                a.color,
              )}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminDashboardPage() {
  return (
    <AdminAuthProvider>
      <DataProvider>
        <DashboardContent />
      </DataProvider>
    </AdminAuthProvider>
  );
}

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboardPage });
