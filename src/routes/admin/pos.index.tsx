import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search, ShoppingCart, X, Plus, Minus, Trash2, CreditCard, Banknote,
  Smartphone, Check, Receipt, BarChart3, TrendingUp, AlertCircle, Clock,
  ChevronLeft,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/admin-auth";
import { DataProvider } from "@/lib/admin/admin-data";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePosStore } from "@/lib/admin/pos-store";
import { type POSPaymentMethod, type POSPaymentStatus, paymentMethodLabels } from "@/lib/admin/pos-types";
import { productImage } from "@/data/catalog";
import { toBnNumber, formatTaka, formatOrderDateTime } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { ProductImage } from "@/components/shop/ProductImage";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pos/")({ component: AdminPOSPage });

function AdminPOSPage() {
  return (
    <AdminAuthProvider>
      <DataProvider>
        <AdminLayout>
          <POSContent />
        </AdminLayout>
      </DataProvider>
    </AdminAuthProvider>
  );
}

function POSContent() {
  const { adminUser } = useAdminAuth();
  const { products, categories } = useShop();
  const { cart, hydrated: posHydrated, addToCart, updateQty, removeFromCart, clearCart, completeSale, getTodaySales } = usePosStore();

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Customer
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Discount
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [discountValue, setDiscountValue] = useState(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<POSPaymentMethod>("cash");
  const [paymentStatus, setPaymentStatus] = useState<POSPaymentStatus>("paid");
  const [paidAmount, setPaidAmount] = useState(0);

  // UI
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<ReturnType<typeof usePosStore>["sales"][0] | null>(null);
  const [showNewSaleConfirm, setShowNewSaleConfirm] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Product list
  const posProducts = useMemo(() => {
    return (
      products?.map((p) => ({
        ...p,
        image: productImage(p, categories),
      })) ?? []
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = posProducts;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [posProducts, searchTerm, selectedCategory]);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = discountType === "fixed" ? discountValue : Math.round((subtotal * discountValue) / 100);
  const total = Math.max(0, subtotal - discountAmount);
  const dueAmount = paymentStatus === "paid" ? 0 : total - paidAmount;

  // Today's sales stats
  const todaySales = posHydrated ? getTodaySales() : [];
  const todayTotalSale = todaySales.reduce((s, sale) => s + sale.total, 0);
  const todayCashSale = todaySales.filter((s) => s.paymentMethod === "cash").reduce((s, sale) => s + sale.total, 0);
  const todayDue = todaySales.reduce((s, sale) => s + sale.dueAmount, 0);
  const todayDiscount = todaySales.reduce((s, sale) => s + sale.discountAmount, 0);

  // Reset payment status based on paid amount
  const handlePaidChange = (val: number) => {
    setPaidAmount(val);
    if (val >= total) setPaymentStatus("paid");
    else if (val > 0) setPaymentStatus("partial");
    else setPaymentStatus("due");
  };

  // Complete sale handler
  const [completing, setCompleting] = useState(false);
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    if (cart.some((item) => item.qty > item.stock)) return;
    setCompleting(true);
    try {
      const sale = await completeSale({
        customerName,
        customerPhone,
        discountType,
        discountValue,
        paymentMethod,
        paymentStatus,
        paidAmount: paymentStatus === "due" ? 0 : paymentStatus === "partial" ? paidAmount : total,
        adminName: adminUser?.name || "Admin",
      });
      setLastSale(sale);
      setShowReceipt(true);
      setMobileCartOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setDiscountValue(0);
      setPaidAmount(0);
      setPaymentMethod("cash");
      setPaymentStatus("paid");
      toast.success("Sale completed!");
    } catch (err: any) {
      console.error("Complete sale error:", err);
      toast.error(err?.message || "Sale complete করতে সমস্যা হয়েছে");
    } finally {
      setCompleting(false);
    }
  };

  const handleNewSale = () => {
    setShowNewSaleConfirm(true);
  };

  const confirmNewSale = () => {
    clearCart();
    setCustomerName("");
    setCustomerPhone("");
    setDiscountValue(0);
    setPaidAmount(0);
    setPaymentMethod("cash");
    setPaymentStatus("paid");
    setShowNewSaleConfirm(false);
  };

  const today = new Date();

  return (
    <div className="space-y-4">
      {/* Today's Summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard icon={<TrendingUp className="size-4" />} label="আজকের মোট Sale" value={formatTaka(todayTotalSale)} color="text-green-600" />
        <SummaryCard icon={<BarChart3 className="size-4" />} label="Sale Count" value={toBnNumber(todaySales.length)} color="text-blue-600" />
        <SummaryCard icon={<Banknote className="size-4" />} label="Cash Sale" value={formatTaka(todayCashSale)} color="text-emerald-600" />
        <SummaryCard icon={<AlertCircle className="size-4" />} label="আজকের Due" value={formatTaka(todayDue)} color="text-orange-600" />
        <SummaryCard icon={<Receipt className="size-4" />} label="Discount" value={formatTaka(todayDiscount)} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        {/* Left: Product Search & Grid */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="পণ্য খুঁজুন (নাম, SKU, ক্যাটাগরি)..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${selectedCategory === "all" ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-secondary"}`}
            >
              সব
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${selectedCategory === c.id ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-secondary"}`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p) => {
              const inStock = p.stock > 0;
              return (
                <button
                  key={p.id}
                  disabled={!inStock}
                  onClick={() => addToCart({ id: p.id, name: p.name, price: p.price, stock: p.stock, unit: p.unit, image: productImage(p, categories) })}
                  className="group flex flex-col items-center rounded-xl border border-border bg-card p-2 text-center transition hover:border-primary hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ProductImage
                    product={p}
                    categories={categories}
                    className="mb-1.5 size-16 rounded-lg"
                    imgClassName="mb-1.5 size-16 rounded-lg object-contain"
                  />
                  <h4 className="line-clamp-2 text-[11px] font-semibold leading-tight">{p.name}</h4>
                  <p className="mt-0.5 text-xs font-bold text-primary">{formatTaka(p.price)}</p>
                  <p className={`text-[10px] font-medium ${inStock ? "text-green-600" : "text-red-500"}`}>
                    স্টক: {toBnNumber(p.stock)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Cart Toggle Button */}
        <button
          onClick={() => setMobileCartOpen(true)}
          className="fixed bottom-20 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700 lg:hidden"
        >
          <div className="relative">
            <ShoppingCart className="size-6" />
            {cart.length > 0 && (
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {toBnNumber(cart.length)}
              </span>
            )}
          </div>
        </button>

        {/* Mobile Cart Backdrop */}
        {mobileCartOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileCartOpen(false)}
          />
        )}

        {/* Right: POS Cart */}
        <div
          className={`
            flex flex-col rounded-2xl border border-border bg-card overflow-y-auto
            fixed inset-0 z-50 transition-transform duration-300
            lg:static lg:inset-auto lg:translate-x-0 lg:rounded-2xl lg:overflow-visible lg:transition-none
            ${mobileCartOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0"}
          `}
        >
          {/* Cart Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileCartOpen(false)} className="rounded-lg p-1 hover:bg-secondary lg:hidden">
                <ChevronLeft className="size-5" />
              </button>
              <ShoppingCart className="size-4 text-primary" />
              <h3 className="text-sm font-bold">Current Sale</h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {toBnNumber(cart.length)}টি
              </span>
            </div>
            <button onClick={handleNewSale} className="text-xs font-semibold text-red-500 hover:text-red-700">
              New Sale
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 min-h-[220px] max-h-[42vh] overflow-y-auto px-4 py-2 space-y-2">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <ShoppingCart className="mx-auto mb-2 size-8 opacity-30" />
                <p>কার্টে পণ্য নেই</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-10 shrink-0 rounded-lg object-contain"
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.style.display = "none";
                        const fallback = el.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div className={`size-10 shrink-0 rounded-lg bg-surface items-center justify-center ${item.image ? "hidden" : "flex"}`}>
                    <span className="text-lg">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-semibold">{item.name}</p>
                    <p className="text-[11px] font-bold text-primary">{formatTaka(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      disabled={item.qty <= 1}
                      className="size-6 rounded-md border border-border bg-card flex items-center justify-center text-xs hover:bg-secondary disabled:opacity-50"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">{toBnNumber(item.qty)}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      disabled={item.qty >= item.stock}
                      className="size-6 rounded-md border border-border bg-card flex items-center justify-center text-xs hover:bg-secondary disabled:opacity-50"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <p className="w-16 text-right text-[11px] font-bold">{formatTaka(item.price * item.qty)}</p>
                  <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Customer Info */}
          <div className="border-t border-border px-4 py-3 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground">Customer Info (ঐচ্ছিক)</p>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name (Default: Walk-in)"
              className="h-8 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone Number"
              className="h-8 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary"
            />
          </div>

          {/* Discount */}
          <div className="border-t border-border px-4 py-3 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground">Discount</p>
            <div className="flex gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "fixed" | "percentage")}
                className="h-8 rounded-lg border border-border bg-surface px-2 text-xs outline-none focus:border-primary"
              >
                <option value="fixed">Fixed</option>
                <option value="percentage">%</option>
              </select>
              <input
                type="number"
                min={0}
                max={discountType === "fixed" ? subtotal : 100}
                value={discountValue || ""}
                onChange={(e) => setDiscountValue(Math.min(Number(e.target.value), discountType === "fixed" ? subtotal : 100))}
                placeholder="0"
                className="h-8 flex-1 rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="border-t border-border px-4 py-3 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground">Payment Method</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(["cash", "bkash", "nagad", "rocket", "card", "other"] as POSPaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setPaymentMethod(m); if (m === "cash" && paymentStatus !== "due") handlePaidChange(total); }}
                  className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${paymentMethod === m ? "bg-primary text-primary-foreground" : "border border-border bg-surface hover:bg-secondary"}`}
                >
                  {paymentMethodLabels[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status & Amount */}
          <div className="border-t border-border px-4 py-3 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground">Payment Status</p>
            <div className="flex gap-1.5">
              {(["paid", "partial", "due"] as POSPaymentStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setPaymentStatus(s);
                    if (s === "paid") handlePaidChange(total);
                    else if (s === "due") handlePaidChange(0);
                  }}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold capitalize transition ${paymentStatus === s ? (s === "paid" ? "bg-green-600 text-white" : s === "partial" ? "bg-orange-500 text-white" : "bg-red-500 text-white") : "border border-border bg-surface hover:bg-secondary"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {paymentStatus === "partial" && (
              <input
                type="number"
                min={0}
                max={total}
                value={paidAmount || ""}
                onChange={(e) => handlePaidChange(Math.min(Number(e.target.value), total))}
                placeholder="Paid Amount"
                className="h-8 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary"
              />
            )}
          </div>

          {/* Summary */}
          <div className="border-t border-border px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatTaka(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-red-500">Discount</span>
                <span className="font-semibold text-red-500">-{formatTaka(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5 text-sm font-bold">
              <span>Total</span>
              <span className="text-primary">{formatTaka(total)}</span>
            </div>
            {paymentStatus === "partial" && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-semibold text-green-600">{formatTaka(Math.min(paidAmount, total))}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Due</span>
                  <span className="font-semibold text-orange-600">{formatTaka(Math.max(0, dueAmount))}</span>
                </div>
              </>
            )}
            {paymentStatus === "due" && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Due</span>
                <span className="font-semibold text-orange-600">{formatTaka(total)}</span>
              </div>
            )}
          </div>

          {/* Complete Sale Button */}
          <div className="border-t border-border px-4 py-3 pb-20 lg:pb-3">
            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0 || cart.some((item) => item.qty > item.stock) || completing}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <Check className="size-4" />
              {completing ? "Processing..." : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      {posHydrated && todaySales.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">আজকের Recent Sales</h3>
            <a href="/admin/pos/history" className="text-xs font-semibold text-primary hover:underline">
              সব দেখুন
            </a>
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-3 font-semibold">Sale ID</th>
                  <th className="pb-2 pr-3 font-semibold">Customer</th>
                  <th className="pb-2 pr-3 font-semibold">Total</th>
                  <th className="pb-2 pr-3 font-semibold">Method</th>
                  <th className="pb-2 pr-3 font-semibold">Paid</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {todaySales.slice(-5).reverse().map((sale) => (
                  <tr key={sale.id} className="border-b border-border/50">
                    <td className="py-2 pr-3 font-semibold">{sale.saleNumber}</td>
                    <td className="py-2 pr-3">{sale.customerName}</td>
                    <td className="py-2 pr-3 font-semibold">{formatTaka(sale.total)}</td>
                    <td className="py-2 pr-3">{paymentMethodLabels[sale.paymentMethod]}</td>
                    <td className="py-2 pr-3 text-green-600">{formatTaka(sale.paidAmount)}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sale.paymentStatus === "paid" ? "bg-green-100 text-green-700" : sale.paymentStatus === "partial" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="print-receipt w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 text-center border-b border-dashed border-gray-300 pb-4">
              <h2 className="text-lg font-bold">PATGRAM ONLINE STORE</h2>
              <p className="text-xs text-gray-500">Direct Sale Receipt</p>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between"><span>Sale ID:</span><span className="font-bold">{lastSale.saleNumber}</span></div>
              <div className="flex justify-between"><span>Date & Time:</span><span>{formatOrderDateTime(lastSale.date, lastSale.time)}</span></div>
              <div className="flex justify-between"><span>Customer:</span><span>{lastSale.customerName}</span></div>
              {lastSale.customerPhone && <div className="flex justify-between"><span>Phone:</span><span>{lastSale.customerPhone}</span></div>}
              <div className="my-2 border-t border-dashed border-gray-300" />
              <div className="flex justify-between font-semibold text-gray-500"><span>Item</span><span>Qty × Price</span></div>
              {lastSale.items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span className="flex-1">{item.name}</span>
                  <span className="ml-2 whitespace-nowrap">{item.qty} × {formatTaka(item.price)} = {formatTaka(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="my-2 border-t border-dashed border-gray-300" />
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatTaka(lastSale.subtotal)}</span></div>
              {lastSale.discountAmount > 0 && <div className="flex justify-between text-red-500"><span>Discount:</span><span>-{formatTaka(lastSale.discountAmount)}</span></div>}
              <div className="flex justify-between border-t border-gray-300 pt-1.5 text-sm font-bold"><span>Total:</span><span>{formatTaka(lastSale.total)}</span></div>
              <div className="flex justify-between"><span>Payment:</span><span>{paymentMethodLabels[lastSale.paymentMethod]}</span></div>
              <div className="flex justify-between"><span>Paid:</span><span className="text-green-600 font-bold">{formatTaka(lastSale.paidAmount)}</span></div>
              {lastSale.dueAmount > 0 && <div className="flex justify-between"><span>Due:</span><span className="text-orange-600 font-bold">{formatTaka(lastSale.dueAmount)}</span></div>}
              <div className="flex justify-between"><span>Salesperson:</span><span>{lastSale.adminName}</span></div>
            </div>
            <div className="mt-4 border-t border-dashed border-gray-300 pt-3 text-center text-xs text-gray-500">
              <p className="font-semibold">ধন্যবাদ, আবার আসবেন।</p>
            </div>
            <div className="print-hide mt-4 flex gap-2">
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-semibold hover:bg-gray-50">
                <Receipt className="size-3.5" /> Print
              </button>
              <button onClick={() => setShowReceipt(false)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:opacity-90">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Sale Confirm */}
      {showNewSaleConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-100">
              <AlertCircle className="size-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-bold">New Sale শুরু করবেন?</h3>
              <p className="mt-1 text-xs text-muted-foreground">বর্তমান Sale বাতিল করে নতুন Sale শুরু করতে চান?</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowNewSaleConfirm(false)} className="flex-1 rounded-xl border border-border py-2 text-xs font-semibold hover:bg-secondary">
                Cancel
              </button>
              <button onClick={confirmNewSale} className="flex-1 rounded-xl bg-red-500 py-2 text-xs font-bold text-white hover:bg-red-600">
                Yes, New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <div className={`mb-1 ${color}`}>{icon}</div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
