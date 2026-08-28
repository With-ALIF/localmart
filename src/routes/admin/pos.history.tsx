import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Eye, X, Receipt, Calendar, Filter } from "lucide-react";
import { AdminAuthProvider } from "@/lib/admin/admin-auth";
import { DataProvider } from "@/lib/admin/admin-data";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePosStore } from "@/lib/admin/pos-store";
import { type POSSale, paymentMethodLabels } from "@/lib/admin/pos-types";
import { toBnNumber, formatTaka } from "@/lib/format";

export const Route = createFileRoute("/admin/pos/history")({ component: POSHistoryPage });

function POSHistoryPage() {
  return (
    <AdminAuthProvider>
      <DataProvider>
        <AdminLayout>
          <POSHistoryContent />
        </AdminLayout>
      </DataProvider>
    </AdminAuthProvider>
  );
}

function POSHistoryContent() {
  const { sales, hydrated } = usePosStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedSale, setSelectedSale] = useState<POSSale | null>(null);

  const filteredSales = useMemo(() => {
    let result = [...sales].reverse();
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) => s.saleNumber.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q) || s.customerPhone.includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter((s) => s.paymentStatus === statusFilter);
    if (methodFilter !== "all") result = result.filter((s) => s.paymentMethod === methodFilter);
    return result;
  }, [sales, searchTerm, statusFilter, methodFilter]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Direct Sale History</h1>
        <p className="text-sm text-muted-foreground">সব POS sales দেখুন</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sale ID, Customer, Phone..."
            className="h-9 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
        >
          <option value="all">সব Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="due">Due</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-9 rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
        >
          <option value="all">সব Method</option>
          <option value="cash">Cash</option>
          <option value="bkash">bKash</option>
          <option value="nagad">Nagad</option>
          <option value="rocket">Rocket</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Sale ID</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Method</th>
              <th className="px-4 py-3 font-semibold">Paid</th>
              <th className="px-4 py-3 font-semibold">Due</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {!hydrated ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : filteredSales.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">কোনো sale পাওয়া যায়নি</td></tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-border/50 hover:bg-surface/50">
                  <td className="px-4 py-2.5 font-semibold">{sale.saleNumber}</td>
                  <td className="px-4 py-2.5">{sale.customerName}</td>
                  <td className="px-4 py-2.5">{sale.customerPhone || "—"}</td>
                  <td className="px-4 py-2.5">{sale.date}</td>
                  <td className="px-4 py-2.5 font-semibold">{formatTaka(sale.total)}</td>
                  <td className="px-4 py-2.5">{paymentMethodLabels[sale.paymentMethod]}</td>
                  <td className="px-4 py-2.5 text-green-600 font-semibold">{formatTaka(sale.paidAmount)}</td>
                  <td className="px-4 py-2.5 text-orange-600 font-semibold">{formatTaka(sale.dueAmount)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sale.paymentStatus === "paid" ? "bg-green-100 text-green-700" : sale.paymentStatus === "partial" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                      {sale.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => { setSelectedSale(sale); setShowReceipt(true); }} className="rounded-lg bg-primary/10 p-1.5 text-primary hover:bg-primary hover:text-primary-foreground">
                      <Eye className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {hydrated && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Total: <strong>{toBnNumber(filteredSales.length)}</strong> sales</span>
          <span>·</span>
          <span>Total: <strong>{formatTaka(filteredSales.reduce((s, sale) => s + sale.total, 0))}</strong></span>
          <span>·</span>
          <span>Due: <strong className="text-orange-600">{formatTaka(filteredSales.reduce((s, sale) => s + sale.dueAmount, 0))}</strong></span>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">Receipt</h3>
              <button onClick={() => setShowReceipt(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            <div className="mb-4 text-center border-b border-dashed border-gray-300 pb-4">
              <h2 className="text-lg font-bold">PATGRAM ONLINE STORE</h2>
              <p className="text-xs text-gray-500">Direct Sale Receipt</p>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between"><span>Sale ID:</span><span className="font-bold">{selectedSale.saleNumber}</span></div>
              <div className="flex justify-between"><span>Date:</span><span>{selectedSale.date}</span></div>
              <div className="flex justify-between"><span>Time:</span><span>{selectedSale.time}</span></div>
              <div className="flex justify-between"><span>Customer:</span><span>{selectedSale.customerName}</span></div>
              {selectedSale.customerPhone && <div className="flex justify-between"><span>Phone:</span><span>{selectedSale.customerPhone}</span></div>}
              <div className="my-2 border-t border-dashed border-gray-300" />
              {selectedSale.items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span className="flex-1">{item.name}</span>
                  <span className="ml-2 whitespace-nowrap">{item.qty} × {formatTaka(item.price)} = {formatTaka(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="my-2 border-t border-dashed border-gray-300" />
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatTaka(selectedSale.subtotal)}</span></div>
              {selectedSale.discountAmount > 0 && <div className="flex justify-between text-red-500"><span>Discount:</span><span>-{formatTaka(selectedSale.discountAmount)}</span></div>}
              <div className="flex justify-between border-t border-gray-300 pt-1.5 text-sm font-bold"><span>Total:</span><span>{formatTaka(selectedSale.total)}</span></div>
              <div className="flex justify-between"><span>Payment:</span><span>{paymentMethodLabels[selectedSale.paymentMethod]}</span></div>
              <div className="flex justify-between"><span>Paid:</span><span className="text-green-600 font-bold">{formatTaka(selectedSale.paidAmount)}</span></div>
              {selectedSale.dueAmount > 0 && <div className="flex justify-between"><span>Due:</span><span className="text-orange-600 font-bold">{formatTaka(selectedSale.dueAmount)}</span></div>}
              <div className="flex justify-between"><span>Salesperson:</span><span>{selectedSale.adminName}</span></div>
            </div>
            <div className="mt-4 border-t border-dashed border-gray-300 pt-3 text-center text-xs text-gray-500">
              <p className="font-semibold">ধন্যবাদ, আবার আসবেন।</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-semibold hover:bg-gray-50">
                <Receipt className="size-3.5" /> Print
              </button>
              <button onClick={() => setShowReceipt(false)} className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:opacity-90">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
