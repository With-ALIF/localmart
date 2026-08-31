import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Eye, X, Receipt, ShoppingCart, Clock, Filter } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/admin-auth";
import { DataProvider, useData } from "@/lib/admin/admin-data";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePosStore } from "@/lib/admin/pos-store";
import { type POSSale, paymentMethodLabels } from "@/lib/admin/pos-types";
import { toBnNumber, formatTaka, formatOrderDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/admin/admin-data";

export const Route = createFileRoute("/admin/history")({ component: HistoryPage });

function HistoryPage() {
  return (
    <AdminAuthProvider>
      <DataProvider>
        <AdminLayout>
          <HistoryContent />
        </AdminLayout>
      </DataProvider>
    </AdminAuthProvider>
  );
}

type UnifiedTransaction = {
  id: string;
  number: string;
  customer: string;
  phone: string;
  total: number;
  paid: number;
  due: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  date: string;
  time: string;
  source: "order" | "pos";
  items: { name: string; qty: number; price: number }[];
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  paid: "bg-green-100 text-green-700",
  partial: "bg-orange-100 text-orange-700",
  due: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  completed: "Completed",
  paid: "Paid",
  partial: "Partial",
  due: "Due",
};

function HistoryContent() {
  const { isAdminAuthenticated, hydrated } = useAdminAuth();
  const { orders } = useData();
  const { sales, hydrated: posHydrated } = usePosStore();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "order" | "pos">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState<UnifiedTransaction | null>(null);

  const allTransactions = useMemo<UnifiedTransaction[]>(() => {
    const orderTx: UnifiedTransaction[] = (orders || []).map((o) => ({
      id: o.id,
      number: o.id,
      customer: o.customer,
      phone: o.phone,
      total: o.total,
      paid: o.total,
      due: 0,
      paymentMethod: o.payment,
      paymentStatus: "paid",
      status: o.status,
      date: o.date,
      time: o.time,
      source: "order" as const,
      items: o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    }));

    const posTx: UnifiedTransaction[] = (sales || []).map((s) => ({
      id: s.id,
      number: s.saleNumber,
      customer: s.customerName,
      phone: s.customerPhone,
      total: s.total,
      paid: s.paidAmount,
      due: s.dueAmount,
      paymentMethod: paymentMethodLabels[s.paymentMethod] || s.paymentMethod,
      paymentStatus: s.paymentStatus,
      status: "completed",
      date: s.date,
      time: s.time,
      source: "pos" as const,
      items: s.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    }));

    return [...orderTx, ...posTx].sort((a, b) => b.date.localeCompare(a.date));
  }, [orders, sales]);

  const filtered = useMemo(() => {
    let list = allTransactions;
    if (typeFilter !== "all") list = list.filter((t) => t.source === typeFilter);
    if (statusFilter !== "all") {
      if (typeFilter === "order") list = list.filter((t) => t.status === statusFilter);
      else if (typeFilter === "pos") list = list.filter((t) => t.paymentStatus === statusFilter);
      else list = list.filter((t) => t.status === statusFilter || t.paymentStatus === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.number.toLowerCase().includes(q) ||
          t.customer.toLowerCase().includes(q) ||
          t.phone.includes(q),
      );
    }
    return list;
  }, [allTransactions, typeFilter, statusFilter, search]);

  const totalRevenue = filtered.reduce((s, t) => s + t.total, 0);
  const totalPaid = filtered.reduce((s, t) => s + t.paid, 0);
  const totalDue = filtered.reduce((s, t) => s + t.due, 0);

  if (!hydrated || !posHydrated) return null;
  if (!isAdminAuthenticated) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold">History</h1>
        <p className="text-sm text-muted-foreground">Orders এবং POS Sales একসাথে</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-[11px] text-muted-foreground">মোট Transaction</p>
          <p className="font-display text-lg font-extrabold">{toBnNumber(filtered.length)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-[11px] text-muted-foreground">মোট বিক্রয়</p>
          <p className="font-display text-lg font-extrabold text-primary">{formatTaka(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-[11px] text-muted-foreground">বকেয়</p>
          <p className="font-display text-lg font-extrabold text-orange-600">{formatTaka(totalDue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ID, Customer, Phone..."
            className="h-9 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "order", "pos"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-bold transition",
                typeFilter === t ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-secondary",
              )}
            >
              {t === "all" ? "সব" : t === "order" ? "🛒 Order" : "💰 POS"}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold transition",
                statusFilter === s ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-secondary",
              )}
            >
              {s === "all" ? "সব Status" : statusLabels[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-sm font-semibold text-muted-foreground">কোনো transaction পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-3 py-2.5 font-bold text-muted-foreground">ID</th>
                <th className="px-3 py-2.5 font-bold text-muted-foreground">Type</th>
                <th className="px-3 py-2.5 font-bold text-muted-foreground">Customer</th>
                <th className="px-3 py-2.5 font-bold text-muted-foreground">Date</th>
                <th className="px-3 py-2.5 font-bold text-muted-foreground">Payment</th>
                <th className="px-3 py-2.5 font-bold text-muted-foreground">Status</th>
                <th className="px-3 py-2.5 text-right font-bold text-muted-foreground">Total</th>
                <th className="px-3 py-2.5 text-right font-bold text-muted-foreground">Due</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="cursor-pointer border-b border-border last:border-0 transition hover:bg-secondary/40"
                >
                  <td className="px-3 py-2.5 font-bold">{tx.number}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        tx.source === "order" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700",
                      )}
                    >
                      {tx.source === "order" ? "Order" : "POS"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-semibold">{tx.customer}</p>
                    {tx.phone && <p className="text-[10px] text-muted-foreground">{tx.phone}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {formatOrderDateTime(tx.date, tx.time)}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{tx.paymentMethod}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold capitalize",
                        statusColors[tx.paymentStatus] || statusColors[tx.status] || "bg-gray-100 text-gray-700",
                      )}
                    >
                      {statusLabels[tx.paymentStatus] || statusLabels[tx.status] || tx.paymentStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-primary">{formatTaka(tx.total)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-orange-600">
                    {tx.due > 0 ? formatTaka(tx.due) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Eye className="ml-auto size-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print-history-overlay">
          <div className="print-history w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl max-h-[85vh] overflow-y-auto font-mono">
            <div className="text-center mb-3">
              <h2 className="text-lg font-black tracking-widest uppercase">Patgram Online Store</h2>
              <p className="text-[10px] text-gray-400 mt-0.5 tracking-wider">{selectedTx.source === "order" ? "ONLINE ORDER" : "DIRECT SALE"}</p>
            </div>
            <div className="border-t border-dashed border-gray-300 my-2" />
            <div className="space-y-1 text-[11px] text-gray-700">
              <div className="flex justify-between"><span className="text-gray-500">ID</span><span className="font-bold">{selectedTx.number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{formatOrderDateTime(selectedTx.date, selectedTx.time)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{selectedTx.customer}</span></div>
              {selectedTx.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{selectedTx.phone}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span>{selectedTx.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span>{statusLabels[selectedTx.paymentStatus] || statusLabels[selectedTx.status] || selectedTx.paymentStatus}</span></div>
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-gray-400 uppercase tracking-wider text-[9px] font-bold"><span>Item</span><span>Qty × Price</span></div>
              {selectedTx.items.map((item, i) => (
                <div key={i} className="flex justify-between leading-snug">
                  <span className="flex-1 pr-2">{item.name}</span>
                  <span className="whitespace-nowrap text-right">{toBnNumber(item.qty)}×{formatTaka(item.price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-black text-sm"><span>TOTAL</span><span>{formatTaka(selectedTx.total)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Paid</span><span className="font-bold text-green-600">{formatTaka(selectedTx.paid)}</span></div>
              {selectedTx.due > 0 && <div className="flex justify-between"><span className="text-gray-500">Due</span><span className="font-bold text-orange-600">{formatTaka(selectedTx.due)}</span></div>}
            </div>
            <div className="border-t border-dashed border-gray-300 my-3" />
            <div className="text-center text-[10px] text-gray-400 space-y-0.5">
              <p className="font-semibold text-gray-500">ধন্যবাদ, আবার আসবেন।</p>
            </div>
            <div className="mt-4 flex gap-2 print-hide">
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 py-2 text-xs font-semibold hover:bg-gray-50">
                <Receipt className="size-3.5" /> Print
              </button>
              <button onClick={() => setSelectedTx(null)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:opacity-90">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
