import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Eye,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Package,
  ArrowUpRight,
  X,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/admin-auth";
import { DataProvider, useData, type Order } from "@/lib/admin/admin-data";
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

const statusLabels: Record<string, string> = {
  pending: "অপেক্ষমান",
  processing: "প্রসেসিং",
  shipped: "পাঠানো",
  delivered: "ডেলিভারি",
  cancelled: "বাতিল",
};

type Customer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  orders: Order[];
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
  firstOrderDate: string;
};

function extractCustomers(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>();

  for (const order of orders) {
    const key = order.phone || order.customer;
    const existing = map.get(key);

    if (existing) {
      existing.orders.push(order);
      existing.totalSpent += order.total;
      existing.orderCount += 1;
      if (order.date > existing.lastOrderDate) existing.lastOrderDate = order.date;
      if (order.date < existing.firstOrderDate) existing.firstOrderDate = order.date;
      if (!existing.email && order.email) existing.email = order.email;
      if (!existing.address && order.address) existing.address = order.address;
    } else {
      map.set(key, {
        name: order.customer,
        phone: order.phone,
        email: order.email || "",
        address: order.address,
        orders: [order],
        totalSpent: order.total,
        orderCount: 1,
        lastOrderDate: order.date,
        firstOrderDate: order.date,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.lastOrderDate.localeCompare(a.lastOrderDate));
}

function CustomersContent() {
  const { isAdminAuthenticated } = useAdminAuth();
  const { orders } = useData();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  if (!isAdminAuthenticated) return <Navigate to="/admin" />;

  const customers = useMemo(() => extractCustomers(orders), [orders]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
  const repeatCustomers = customers.filter((c) => c.orderCount > 1).length;

  const stats = [
    { label: "মোট কাস্টমার", value: toBnNumber(customers.length), icon: Users, color: "text-blue-500" },
    { label: "মোট বিক্রয়", value: formatTaka(totalSpent), icon: TrendingUp, color: "text-green-500" },
    { label: "গড় অর্ডার", value: formatTaka(avgOrderValue), icon: ShoppingCart, color: "text-orange-500" },
    { label: "রিপিট কাস্টমার", value: toBnNumber(repeatCustomers), icon: ArrowUpRight, color: "text-purple-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Customers</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage your customer base</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">{s.label}</span>
                <div className={cn("flex size-9 items-center justify-center rounded-xl bg-primary/10", s.color)}>
                  <s.icon className="size-[18px]" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {toBnNumber(filtered.length)} জন কাস্টমার
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-bold text-muted-foreground">
                  <th className="px-4 py-3">কাস্টমার</th>
                  <th className="px-4 py-3">ফোন</th>
                  <th className="px-4 py-3 hidden sm:table-cell">অর্ডার</th>
                  <th className="px-4 py-3 hidden md:table-cell">মোট খরচ</th>
                  <th className="px-4 py-3 hidden lg:table-cell">শেষ অর্ডার</th>
                  <th className="px-4 py-3">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      কোনো কাস্টমার পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr key={i} className="border-b border-border/50 transition hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {c.name.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{c.name}</p>
                            {c.email && <p className="truncate text-[11px] text-muted-foreground">{c.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {toBnNumber(c.orderCount)}টি
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-semibold">{formatTaka(c.totalSpent)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{c.lastOrderDate}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
                        >
                          <Eye className="size-3.5" />
                          দেখুন
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      )}
    </AdminLayout>
  );
}

function CustomerDetailModal({
  customer,
  onClose,
  statusFilter,
  setStatusFilter,
}: {
  customer: Customer;
  onClose: () => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}) {
  const filteredOrders =
    statusFilter === "all"
      ? customer.orders
      : customer.orders.filter((o) => o.status === statusFilter);

  const sortedOrders = [...filteredOrders].sort((a, b) => b.date.localeCompare(a.date));
  const deliveredCount = customer.orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <h2 className="font-display text-lg font-extrabold">কাস্টমার বিবরণ</h2>
          <button onClick={onClose} className="rounded-lg p-1 transition hover:bg-secondary">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {customer.name.slice(0, 2)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{customer.name}</h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5" /> {customer.phone}
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5" /> {customer.email}
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5" /> {customer.address}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5" /> প্রথম অর্ডার: {customer.firstOrderDate}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-surface p-3 text-center">
              <p className="font-display text-xl font-extrabold text-primary">{toBnNumber(customer.orderCount)}</p>
              <p className="text-[11px] text-muted-foreground">মোট অর্ডার</p>
            </div>
            <div className="rounded-xl bg-surface p-3 text-center">
              <p className="font-display text-xl font-extrabold text-primary">{formatTaka(customer.totalSpent)}</p>
              <p className="text-[11px] text-muted-foreground">মোট খরচ</p>
            </div>
            <div className="rounded-xl bg-surface p-3 text-center">
              <p className="font-display text-xl font-extrabold text-green-600">{toBnNumber(deliveredCount)}</p>
              <p className="text-[11px] text-muted-foreground">ডেলিভারি সম্পন্ন</p>
            </div>
          </div>

          <div>
            <div className="mb-3 space-y-2">
              <h4 className="text-sm font-bold">অর্ডার ইতিহাস</h4>
              <div className="flex flex-wrap gap-1.5">
                {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold transition",
                      statusFilter === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {f === "all" ? "সব" : statusLabels[f]}
                  </button>
                ))}
              </div>
            </div>

            {sortedOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">কোনো অর্ডার নেই</p>
            ) : (
              <div className="space-y-2">
                {sortedOrders.map((order) => {
                  const config = statusColors[order.status];
                  return (
                    <div key={order.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{order.id}</p>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", config)}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.date} · {order.items.length}টি পণ্য
                        </p>
                      </div>
                      <p className="text-sm font-bold text-primary">{formatTaka(order.total)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminCustomersPage() {
  return (
    <AdminAuthProvider>
      <DataProvider>
        <CustomersContent />
      </DataProvider>
    </AdminAuthProvider>
  );
}

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
});
