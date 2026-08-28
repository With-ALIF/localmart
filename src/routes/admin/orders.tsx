import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, ChevronDown, Eye } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/admin-auth";
import { DataProvider, useData } from "@/lib/admin/admin-data";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatTaka, toBnNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/admin/admin-data";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function OrdersContent() {
  const { isAdminAuthenticated } = useAdminAuth();
  const { orders, updateOrderStatus } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  if (!isAdminAuthenticated) return <Navigate to="/admin" />;

  const filtered = useMemo(() => {
    let list = [...orders].sort((a, b) => b.date.localeCompare(a.date));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.phone.includes(q),
      );
    }
    if (statusFilter) list = list.filter((o) => o.status === statusFilter);
    return list;
  }, [orders, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      counts[o.status]++;
    });
    return counts;
  }, [orders]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Orders</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {toBnNumber(orders.length)} orders total
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(["pending", "processing", "shipped", "delivered", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                statusFilter === s
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30",
              )}
            >
              <span
                className={cn(
                  "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize",
                  statusColors[s],
                )}
              >
                {s}
              </span>
              <p className="mt-1.5 font-display text-xl font-extrabold">
                {toBnNumber(statusCounts[s])}
              </p>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer, phone..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 appearance-none rounded-xl border border-border bg-card pl-4 pr-8 text-sm font-semibold outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-sm font-semibold text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-bold text-muted-foreground">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border/50 transition hover:bg-muted/50">
                    <td className="px-4 py-3 font-semibold">{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{o.customer}</p>
                      <p className="text-[11px] text-muted-foreground">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                    <td className="px-4 py-3">{toBnNumber(o.items.length)}</td>
                    <td className="px-4 py-3 font-semibold">{formatTaka(o.total)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.payment}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value as Order["status"])}
                        className={cn(
                          "rounded-full border-0 px-2.5 py-0.5 text-[11px] font-bold capitalize outline-none cursor-pointer",
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
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setViewOrder(o)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground ml-auto"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{viewOrder.id}</h3>
                <button
                  onClick={() => setViewOrder(null)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-semibold">{viewOrder.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-semibold">{viewOrder.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-semibold text-right max-w-[200px]">
                    {viewOrder.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-semibold">{viewOrder.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-semibold">{viewOrder.payment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <select
                    value={viewOrder.status}
                    onChange={(e) => {
                      updateOrderStatus(viewOrder.id, e.target.value as Order["status"]);
                      setViewOrder({ ...viewOrder, status: e.target.value as Order["status"] });
                    }}
                    className={cn(
                      "rounded-full border-0 px-2.5 py-0.5 text-[11px] font-bold capitalize outline-none cursor-pointer",
                      statusColors[viewOrder.status],
                    )}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-bold">Items</p>
                {viewOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="ml-2 text-muted-foreground">×{toBnNumber(item.qty)}</span>
                    <span className="ml-3 font-semibold">{formatTaka(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatTaka(viewOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function AdminOrdersPage() {
  return (
    <AdminAuthProvider>
      <DataProvider>
        <OrdersContent />
      </DataProvider>
    </AdminAuthProvider>
  );
}

export const Route = createFileRoute("/admin/orders")({ component: AdminOrdersPage });
