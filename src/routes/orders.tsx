import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatTaka, toBnNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type Order = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  email?: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  total: number;
  payment: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
};

const statusSteps = ["pending", "processing", "shipped", "delivered"] as const;

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: { label: "অপেক্ষমান", color: "text-yellow-600", bg: "bg-yellow-100", icon: Clock },
  processing: { label: "প্রসেসিং", color: "text-blue-600", bg: "bg-blue-100", icon: Package },
  shipped: { label: "পাঠানো হয়েছে", color: "text-purple-600", bg: "bg-purple-100", icon: Truck },
  delivered: { label: "ডেলিভারি সম্পন্ন", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle },
  cancelled: { label: "বাতিল", color: "text-red-600", bg: "bg-red-100", icon: XCircle },
};

const paymentLabels: Record<string, string> = {
  COD: "ক্যাশ অন ডেলিভারি",
  bKash: "bKash",
  Nagad: "Nagad",
};

const ORDERS_KEY = "patgram_orders";

function OrdersPage() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortedOrders, setSortedOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;

      if (isSupabaseConfigured && user.id) {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .eq("order_source", "online");

        if (ordersData) {
          const ordersWithItems: Order[] = await Promise.all(
            ordersData.map(async (order) => {
              const { data: itemsData } = await supabase
                .from("order_items")
                .select("*")
                .eq("order_id", order.id);

              return {
                id: order.id,
                customer: order.customer_name || "",
                phone: order.phone || "",
                address: order.address || "",
                email: order.email || "",
                items: (itemsData || []).map((item) => ({
                  productId: item.product_id,
                  name: item.product_name,
                  price: item.price,
                  qty: item.quantity,
                })),
                total: order.total || 0,
                payment: order.payment_method || "COD",
                status: order.status || "pending",
                date: order.created_at || "",
              };
            }),
          );
          setSortedOrders(ordersWithItems.sort((a, b) => b.date.localeCompare(a.date)));
        }
      } else {
        try {
          if (typeof window === "undefined") return;
          const raw = window.localStorage.getItem(ORDERS_KEY);
          const allOrders: Order[] = raw ? JSON.parse(raw) : [];
          const myOrders = allOrders.filter(
            (o) => o.email === user.email || o.phone === user.phone || o.customer === user.name,
          );
          setSortedOrders(myOrders.sort((a, b) => b.date.localeCompare(a.date)));
        } catch {
          setSortedOrders([]);
        }
      }
    }
    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-10 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-extrabold">লগইন প্রয়োজন</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          আপনার অর্ডার দেখতে প্রথমে লগইন করুন।
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          লগইন করুন
        </Link>
      </div>
    );
  }

  if (sortedOrders.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <Package className="size-10 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-extrabold">কোনো অর্ডার নেই</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          এখনো কোনো অর্ডার দেননি। আমাদের পণ্য দেখে অর্ডার করুন!
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          পণ্য দেখুন
        </Link>
      </div>
    );
  }

  const activeOrder = sortedOrders.find((o) => o.status !== "delivered" && o.status !== "cancelled");
  const pastOrders = sortedOrders.filter((o) => o.status === "delivered" || o.status === "cancelled");

  return (
    <div className="container-page py-6 sm:py-8">
      <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">হোম</Link>
        <span>/</span>
        <span className="font-semibold text-foreground">আমার অর্ডার</span>
      </nav>

      <h1 className="mb-6 font-display text-2xl font-extrabold sm:text-3xl">আমার অর্ডার</h1>

      {activeOrder && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-bold text-muted-foreground">সক্রিয় অর্ডার</h2>
          <ActiveOrderCard order={activeOrder} />
        </div>
      )}

      {pastOrders.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-bold text-muted-foreground">পূর্ববর্তী অর্ডার</h2>
          <div className="space-y-3">
            {pastOrders.map((order) => (
              <PastOrderCard
                key={order.id}
                order={order}
                expanded={expandedId === order.id}
                onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveOrderCard({ order }: { order: Order }) {
  const currentStep = statusSteps.indexOf(order.status as typeof statusSteps[number]);
  const config = statusConfig[order.status];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">অর্ডার আইডি</p>
          <p className="font-display text-lg font-extrabold">{order.id}</p>
        </div>
        <div className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", config.bg, config.color)}>
          <config.icon className="size-3.5" />
          {config.label}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-1">
        {statusSteps.map((step, i) => {
          const isCompleted = i <= currentStep;
          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-xs font-bold transition",
                    isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </div>
                <span className={cn("text-[10px] font-semibold", isCompleted ? "text-primary" : "text-muted-foreground")}>
                  {statusConfig[step].label}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={cn("mx-1 h-0.5 flex-1 rounded-full", i < currentStep ? "bg-primary" : "bg-muted")} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 text-sm">
        <div className="flex items-center gap-2 rounded-xl bg-surface p-3">
          <MapPin className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">ঠিকানা</p>
            <p className="truncate font-semibold">{order.address || "নির্ধারিত নেই"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-surface p-3">
          <CreditCard className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">পেমেন্ট</p>
            <p className="truncate font-semibold">{paymentLabels[order.payment] || order.payment}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-surface p-3">
          <Package className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">মোট</p>
            <p className="truncate font-bold text-primary">{formatTaka(order.total)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.name} × {toBnNumber(item.qty)}</span>
            <span className="font-semibold">{formatTaka(item.price * item.qty)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PastOrderCard({
  order,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  const config = statusConfig[order.status];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/50"
      >
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", config.bg)}>
          <config.icon className={cn("size-5", config.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-display font-bold">{order.id}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", config.bg, config.color)}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {order.date} · {order.items.length}টি পণ্য
          </p>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-primary">{formatTaka(order.total)}</p>
        </div>
        {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4">
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.name} × {toBnNumber(item.qty)}</span>
                <span className="font-semibold">{formatTaka(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span>পেমেন্ট: {paymentLabels[order.payment] || order.payment}</span>
            {order.address && <span>ঠিকানা: {order.address}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});
