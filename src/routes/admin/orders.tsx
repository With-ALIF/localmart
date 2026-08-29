import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, ChevronDown, Eye, Clock, Package, Truck, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/admin-auth";
import { DataProvider, useData } from "@/lib/admin/admin-data";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatTaka, toBnNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, StatusHistoryEntry } from "@/lib/admin/admin-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDateTime(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const day = toBnNumber(d.getDate());
    const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    const month = monthNames[d.getMonth()] || "";
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "অপরাহ্ন" : "পূর্বাহ্ন";
    const h12 = hours % 12 || 12;
    return `${day} ${month}, ${toBnNumber(h12)}:${toBnNumber(minutes)} ${period}`;
  } catch {
    return iso;
  }
}

function OrdersContent() {
  const { isAdminAuthenticated } = useAdminAuth();
  const { orders, updateOrderStatus, getOrderStatusHistory, getValidNextStatuses } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewHistory, setViewHistory] = useState<StatusHistoryEntry[]>([]);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadHistory = useCallback(async (orderId: string) => {
    if (!isSupabaseConfigured) return;
    const dbOrder = orders.find((o) => o.id === orderId);
    if (!dbOrder) return;

    const { data } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", orderId)
      .single();

    if (data) {
      const history = await getOrderStatusHistory((data as { id: string }).id);
      setViewHistory(history);
    }
  }, [orders, getOrderStatusHistory]);

  useEffect(() => {
    if (viewOrder) {
      loadHistory(viewOrder.id);
      const validNext = getValidNextStatuses(viewOrder.status);
      setNewStatus(validNext[0] || "");
      setStatusNote("");
    }
  }, [viewOrder, loadHistory, getValidNextStatuses]);

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
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return counts;
  }, [orders]);

  const handleStatusUpdate = async () => {
    if (!viewOrder || !newStatus) return;
    setIsUpdating(true);
    const result = await updateOrderStatus(viewOrder.id, newStatus as Order["status"], statusNote);
    setIsUpdating(false);

    if (result.success) {
      toast.success("Status updated", { description: `${viewOrder.id} → ${statusLabels[newStatus]}` });
      setViewOrder({ ...viewOrder, status: newStatus as Order["status"] });
      loadHistory(viewOrder.id);
      setStatusNote("");
    } else {
      toast.error("Failed to update status", { description: result.error });
    }
  };

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
                {toBnNumber(statusCounts[s] ?? 0)}
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
                      <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize", statusColors[o.status])}>
                        {statusLabels[o.status]}
                      </span>
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
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[5vh] sm:items-center sm:pt-4">
            <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-lg sm:max-h-[90vh] sm:overflow-y-auto">
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
                {viewOrder.payment === "bKash" && viewHistory.length > 0 && (() => {
                  const note = viewHistory[0]?.note || "";
                  const trxMatch = note.match(/TrxID:\s*(\S+)/);
                  const senderMatch = note.match(/Sender:\s*(\S+)/);
                  if (trxMatch) {
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">bKash TrxID</span>
                          <span className="font-semibold text-[#E2136E]">{trxMatch[1]}</span>
                        </div>
                        {senderMatch && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sender</span>
                            <span className="font-semibold">{senderMatch[1]}</span>
                          </div>
                        )}
                      </>
                    );
                  }
                  return null;
                })()}
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

              {viewHistory.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-3 text-xs font-bold">Status History</p>
                  <div className="space-y-3">
                    {viewHistory.map((entry) => {
                      const Icon = statusIcons[entry.status] || Clock;
                      return (
                        <div key={entry.id} className="flex items-start gap-3">
                          <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", statusColors[entry.status]?.replace("text-", "text-").replace("bg-", "bg-"))}>
                            <Icon className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold capitalize">{statusLabels[entry.status] || entry.status}</p>
                              <p className="text-[11px] text-muted-foreground">{formatDateTime(entry.created_at)}</p>
                            </div>
                            {entry.note && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{entry.note}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewOrder.status !== "delivered" && viewOrder.status !== "cancelled" && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-bold">Update Status</p>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="flex-1 h-10 appearance-none rounded-xl border border-border bg-card pl-4 pr-8 text-sm font-semibold outline-none focus:border-primary"
                      >
                        {getValidNextStatuses(viewOrder.status).map((s) => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleStatusUpdate}
                        disabled={!newStatus || isUpdating}
                        className={cn(
                          "rounded-xl px-5 py-2.5 text-sm font-bold text-white transition",
                          newStatus && !isUpdating
                            ? "bg-primary hover:opacity-90"
                            : "bg-muted text-muted-foreground cursor-not-allowed",
                        )}
                      >
                        {isUpdating ? "Updating..." : "Update"}
                      </button>
                    </div>
                    <input
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Add a note (optional)"
                      className="h-10 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
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
