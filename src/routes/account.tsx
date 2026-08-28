import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  User,
  Package,
  Heart,
  ShoppingCart,
  MapPin,
  Bell,
  Settings,
  LogOut,
  Edit3,
  Trash2,
  Plus,
  ChevronRight,
  Star,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Eye,
  Home,
  Building,
  Phone,
  Mail,
  Calendar,
  Save,
  X,
  Shield,
  Globe,
  Lock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { useShop } from "@/lib/shop-store";
import { formatTaka, toBnNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { products, productImage } from "@/data/catalog";

const ORDERS_KEY = "patgram_orders";
const ADDRESSES_KEY = "patgram_addresses";

type Tab =
  | "overview"
  | "profile"
  | "orders"
  | "wishlist"
  | "cart"
  | "addresses"
  | "notifications"
  | "settings";

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

type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
};

const statusSteps = ["pending", "processing", "shipped", "delivered"] as const;

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
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

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const sidebarItems: { tab: Tab; label: string; icon: typeof User }[] = [
  { tab: "overview", label: "অ্যাকাউন্ট ওভারভিউ", icon: User },
  { tab: "profile", label: "আমার প্রোফাইল", icon: User },
  { tab: "orders", label: "আমার অর্ডার", icon: Package },
  { tab: "wishlist", label: "Wishlist", icon: Heart },
  { tab: "cart", label: "আমার Cart", icon: ShoppingCart },
  { tab: "addresses", label: "ঠিকানা", icon: MapPin },
  { tab: "notifications", label: "নোটিফিকেশন", icon: Bell },
  { tab: "settings", label: "সেটিংস", icon: Settings },
];

function AccountPage() {
  const { user, logout, hydrated } = useAuth();
  const { cartItems, cartCount, wishlistCount, wishlist, removeFromWishlist, addToCart, clearCart } = useShop();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    setAllOrders(readJson<Order[]>(ORDERS_KEY, []));
    setAddresses(readJson<Address[]>(ADDRESSES_KEY, []));
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email, phone: user.phone });
    }
  }, [user]);

  const myOrders = user
    ? allOrders.filter(
        (o) => o.email === user.email || o.phone === user.phone || o.customer === user.name,
      )
    : [];
  const sortedOrders = [...myOrders].sort((a, b) => b.date.localeCompare(a.date));
  const filteredOrders =
    orderFilter === "all" ? sortedOrders : sortedOrders.filter((o) => o.status === orderFilter);
  const completedOrders = sortedOrders.filter((o) => o.status === "delivered").length;
  const wishlistProducts = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  const saveAddresses = (addrs: Address[]) => {
    setAddresses(addrs);
    writeJson(ADDRESSES_KEY, addrs);
  };

  const saveProfile = () => {
    if (!profileForm.name || !profileForm.email) return;
    const updated = { ...user!, name: profileForm.name, email: profileForm.email, phone: profileForm.phone };
    writeJson("shobuj-bazar-auth", { isAuthenticated: true, user: updated });
    window.location.reload();
    setEditingProfile(false);
  };

  if (!hydrated) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <User className="size-10 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-extrabold">লগইন প্রয়োজন</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          আপনার অ্যাকাউন্ট দেখতে প্রথমে লগইন করুন।
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

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="container-page py-6 sm:py-8">
      <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">হোম</Link>
        <span>/</span>
        <span className="font-semibold text-foreground">আমার অ্যাকাউন্ট</span>
      </nav>

      {/* Profile Header */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="font-display text-2xl font-extrabold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground sm:justify-start">
              <Calendar className="size-3" />
              মেম্বার সিন্স ২০২৬
            </p>
          </div>
          <button
            onClick={() => { setActiveTab("profile"); setEditingProfile(true); }}
            className="sm:ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold transition hover:bg-secondary"
          >
            <Edit3 className="size-3.5" />
            প্রোফাইল সম্পাদনা
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <nav className="rounded-2xl border border-border bg-card p-2 shadow-soft">
            {sidebarItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                  activeTab === item.tab
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
                {item.tab === "wishlist" && wishlistCount > 0 && (
                  <span className="ml-auto text-xs">{toBnNumber(wishlistCount)}</span>
                )}
                {item.tab === "cart" && cartCount > 0 && (
                  <span className="ml-auto text-xs">{toBnNumber(cartCount)}</span>
                )}
              </button>
            ))}
            <div className="my-2 border-t border-border" />
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              <LogOut className="size-4" />
              লগআউট
            </button>
          </nav>
        </aside>

        {/* Mobile Tab Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar lg:hidden">
          {sidebarItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition",
                activeTab === item.tab
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-surface text-muted-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          {activeTab === "overview" && (
            <OverviewTab
              orderCount={sortedOrders.length}
              wishlistCount={wishlistCount}
              cartCount={cartCount}
              completedOrders={completedOrders}
              recentOrders={sortedOrders.slice(0, 3)}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "profile" && (
            <ProfileTab
              user={user}
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              saveProfile={saveProfile}
            />
          )}
          {activeTab === "orders" && (
            <OrdersTab
              orders={filteredOrders}
              orderFilter={orderFilter}
              setOrderFilter={setOrderFilter}
            />
          )}
          {activeTab === "wishlist" && (
            <WishlistTab
              products={wishlistProducts}
              removeFromWishlist={removeFromWishlist}
              addToCart={addToCart}
            />
          )}
          {activeTab === "cart" && (
            <CartTab cartItems={cartItems} clearCart={clearCart} />
          )}
          {activeTab === "addresses" && (
            <AddressesTab
              addresses={addresses}
              saveAddresses={saveAddresses}
              editingAddress={editingAddress}
              setEditingAddress={setEditingAddress}
              showAddressForm={showAddressForm}
              setShowAddressForm={setShowAddressForm}
            />
          )}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

/* ── Overview Tab ── */
function OverviewTab({
  orderCount,
  wishlistCount,
  cartCount,
  completedOrders,
  recentOrders,
  setActiveTab,
}: {
  orderCount: number;
  wishlistCount: number;
  cartCount: number;
  completedOrders: number;
  recentOrders: Order[];
  setActiveTab: (tab: Tab) => void;
}) {
  const stats = [
    { label: "মোট অর্ডার", value: orderCount, icon: Package, tab: "orders" as Tab, color: "bg-blue-50 text-blue-600" },
    { label: "Wishlist", value: wishlistCount, icon: Heart, tab: "wishlist" as Tab, color: "bg-pink-50 text-pink-600" },
    { label: "Cart Items", value: cartCount, icon: ShoppingCart, tab: "cart" as Tab, color: "bg-orange-50 text-orange-600" },
    { label: "সম্পন্ন অর্ডার", value: completedOrders, icon: CheckCircle, tab: "orders" as Tab, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-extrabold">অ্যাকাউন্ট ওভারভিউ</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => setActiveTab(s.tab)}
            className="rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition hover:shadow-md"
          >
            <div className={cn("mb-3 flex size-10 items-center justify-center rounded-xl", s.color)}>
              <s.icon className="size-5" />
            </div>
            <p className="font-display text-2xl font-extrabold">{toBnNumber(s.value)}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </button>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-muted-foreground">সাম্প্রতিক অর্ডার</h3>
            <button
              onClick={() => setActiveTab("orders")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              সব দেখুন →
            </button>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => {
              const config = statusConfig[order.status];
              return (
                <div key={order.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", config.bg)}>
                    <config.icon className={cn("size-4", config.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{order.id}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", config.bg, config.color)}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{order.date} · {order.items.length}টি পণ্য</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{formatTaka(order.total)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Profile Tab ── */
function ProfileTab({
  user,
  editingProfile,
  setEditingProfile,
  profileForm,
  setProfileForm,
  saveProfile,
}: {
  user: { name: string; email: string; phone: string };
  editingProfile: boolean;
  setEditingProfile: (v: boolean) => void;
  profileForm: { name: string; email: string; phone: string };
  setProfileForm: (v: { name: string; email: string; phone: string }) => void;
  saveProfile: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold">আমার প্রোফাইল</h2>
        {!editingProfile && (
          <button
            onClick={() => setEditingProfile(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold transition hover:bg-secondary"
          >
            <Edit3 className="size-3.5" />
            সম্পাদনা
          </button>
        )}
      </div>

      {editingProfile ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 text-sm font-bold">প্রোফাইল সম্পাদনা</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">নাম</label>
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">ইমেইল</label>
              <input
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">ফোন</label>
              <input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90"
              >
                <Save className="size-3.5" />
                সংরক্ষণ
              </button>
              <button
                onClick={() => {
                  setEditingProfile(false);
                  setProfileForm({ name: user.name, email: user.email, phone: user.phone });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-semibold transition hover:bg-secondary"
              >
                <X className="size-3.5" />
                বাতিল
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="size-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">নাম</p>
                <p className="text-sm font-semibold">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">ইমেইল</p>
                <p className="text-sm font-semibold">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">ফোন</p>
                <p className="text-sm font-semibold">{user.phone || "নেই"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">মেম্বার সিন্স</p>
                <p className="text-sm font-semibold">২০২৬</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Orders Tab ── */
function OrdersTab({
  orders,
  orderFilter,
  setOrderFilter,
}: {
  orders: Order[];
  orderFilter: string;
  setOrderFilter: (v: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filters = [
    { value: "all", label: "সব" },
    { value: "pending", label: "অপেক্ষমান" },
    { value: "processing", label: "প্রসেসিং" },
    { value: "shipped", label: "পাঠানো" },
    { value: "delivered", label: "ডেলিভারি" },
    { value: "cancelled", label: "বাতিল" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-extrabold">আমার অর্ডার</h2>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setOrderFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition",
              orderFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-surface text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-12 text-center">
          <Package className="size-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-muted-foreground">কোনো অর্ডার পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = statusConfig[order.status];
            const expanded = expandedId === order.id;
            return (
              <div key={order.id} className="rounded-2xl border border-border bg-card shadow-soft">
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted/50"
                >
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", config.bg)}>
                    <config.icon className={cn("size-5", config.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{order.id}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", config.bg, config.color)}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{order.date} · {order.items.length}টি পণ্য</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{formatTaka(order.total)}</p>
                  <ChevronRight className={cn("size-4 text-muted-foreground transition", expanded && "rotate-90")} />
                </button>

                {expanded && (
                  <div className="border-t border-border p-4">
                    <div className="mb-3 flex items-center gap-1">
                      {statusSteps.map((step, i) => {
                        const isCompleted = i <= statusSteps.indexOf(order.status as typeof statusSteps[number]);
                        return (
                          <div key={step} className="flex flex-1 items-center">
                            <div className="flex flex-1 flex-col items-center gap-1">
                              <div
                                className={cn(
                                  "flex size-7 items-center justify-center rounded-full text-[10px] font-bold",
                                  isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                                )}
                              >
                                {i + 1}
                              </div>
                              <span className={cn("text-[9px] font-semibold", isCompleted ? "text-primary" : "text-muted-foreground")}>
                                {statusConfig[step].label}
                              </span>
                            </div>
                            {i < statusSteps.length - 1 && (
                              <div className={cn("mx-1 h-0.5 flex-1 rounded-full", i < statusSteps.indexOf(order.status as typeof statusSteps[number]) ? "bg-primary" : "bg-muted")} />
                            )}
                          </div>
                        );
                      })}
                    </div>

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
          })}
        </div>
      )}
    </div>
  );
}

/* ── Wishlist Tab ── */
function WishlistTab({
  products: items,
  removeFromWishlist,
  addToCart,
}: {
  products: typeof products;
  removeFromWishlist: (id: string) => void;
  addToCart: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-lg font-extrabold">আমার Wishlist</h2>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-12 text-center">
          <Heart className="size-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-muted-foreground">Wishlist খালি আছে</p>
          <Link to="/products" className="mt-3 text-xs font-semibold text-primary hover:underline">
            পণ্য দেখুন →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-extrabold">আমার Wishlist</h2>
      <p className="text-sm text-muted-foreground">{toBnNumber(items.length)}টি পণ্য</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <Link to="/product/$productId" params={{ productId: p.id }} className="block">
              <div className="aspect-square bg-surface p-3">
                <img src={productImage(p)} alt={p.name} className="size-full object-contain" />
              </div>
            </Link>
            <div className="p-3">
              <Link to="/product/$productId" params={{ productId: p.id }} className="line-clamp-2 text-xs font-semibold hover:text-primary">
                {p.name}
              </Link>
              <p className="mt-1 text-sm font-bold text-primary">{formatTaka(p.price)}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => addToCart(p.id)}
                  className="flex-1 rounded-full bg-primary py-1.5 text-[10px] font-bold text-primary-foreground transition hover:opacity-90"
                >
                  কার্টে যোগ
                </button>
                <button
                  onClick={() => removeFromWishlist(p.id)}
                  className="rounded-full border border-border px-2 py-1.5 text-red-500 transition hover:bg-red-50"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Cart Tab ── */
function CartTab({
  cartItems,
  clearCart,
}: {
  cartItems: { product: typeof products[0]; qty: number }[];
  clearCart: () => void;
}) {
  if (cartItems.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-lg font-extrabold">আমার Cart</h2>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-12 text-center">
          <ShoppingCart className="size-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-muted-foreground">Cart খালি আছে</p>
          <Link to="/products" className="mt-3 text-xs font-semibold text-primary hover:underline">
            পণ্য দেখুন →
          </Link>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold">আমার Cart</h2>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-500 hover:underline"
        >
          সব মুছুন
        </button>
      </div>
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <Link to="/product/$productId" params={{ productId: item.product.id }} className="shrink-0">
              <div className="size-16 rounded-xl bg-surface p-2">
                <img src={productImage(item.product)} alt={item.product.name} className="size-full object-contain" />
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <Link to="/product/$productId" params={{ productId: item.product.id }} className="line-clamp-1 text-sm font-semibold hover:text-primary">
                {item.product.name}
              </Link>
              <p className="text-xs text-muted-foreground">পরিমাণ: {toBnNumber(item.qty)}</p>
              <p className="text-sm font-bold text-primary">{formatTaka(item.product.price * item.qty)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">মোট ({toBnNumber(cartItems.reduce((n, i) => n + i.qty, 0))}টি)</span>
          <span className="font-display text-lg font-extrabold text-primary">{formatTaka(total)}</span>
        </div>
        <Link
          to="/checkout"
          className="mt-3 block w-full rounded-full bg-primary py-3 text-center text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          চেকআউট
        </Link>
      </div>
    </div>
  );
}

/* ── Addresses Tab ── */
function AddressesTab({
  addresses,
  saveAddresses,
  editingAddress,
  setEditingAddress,
  showAddressForm,
  setShowAddressForm,
}: {
  addresses: Address[];
  saveAddresses: (addrs: Address[]) => void;
  editingAddress: Address | null;
  setEditingAddress: (a: Address | null) => void;
  showAddressForm: boolean;
  setShowAddressForm: (v: boolean) => void;
}) {
  const [form, setForm] = useState({ label: "বাসা", name: "", phone: "", address: "" });

  const resetForm = () => {
    setForm({ label: "বাসা", name: "", phone: "", address: "" });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const handleSave = () => {
    if (!form.name || !form.phone || !form.address) return;
    if (editingAddress) {
      saveAddresses(
        addresses.map((a) =>
          a.id === editingAddress.id ? { ...a, ...form } : a,
        ),
      );
    } else {
      const newAddr: Address = {
        id: Date.now().toString(),
        ...form,
        isDefault: addresses.length === 0,
      };
      saveAddresses([...addresses, newAddr]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (addresses.find((a) => a.id === id)?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
  };

  const handleSetDefault = (id: string) => {
    saveAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const startEdit = (addr: Address) => {
    setForm({ label: addr.label, name: addr.name, phone: addr.phone, address: addr.address });
    setEditingAddress(addr);
    setShowAddressForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold">আমার ঠিকানা</h2>
        <button
          onClick={() => { resetForm(); setShowAddressForm(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="size-3.5" />
          নতুন ঠিকানা
        </button>
      </div>

      {showAddressForm && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 text-sm font-bold">{editingAddress ? "ঠিকানা সম্পাদনা" : "নতুন ঠিকানা যোগ করুন"}</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              {["বাসা", "অফিস", "অন্যান্য"].map((l) => (
                <button
                  key={l}
                  onClick={() => setForm({ ...form, label: l })}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-semibold transition",
                    form.label === l ? "bg-primary text-primary-foreground" : "border border-border",
                  )}
                >
                  {l === "বাসা" ? "🏠" : l === "অফিস" ? "🏢" : "📍"} {l}
                </button>
              ))}
            </div>
            <input
              placeholder="নাম"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />
            <input
              placeholder="ফোন নম্বর"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />
            <textarea
              placeholder="পূর্ণ ঠিকানা"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90"
              >
                <Save className="size-3.5" />
                সংরক্ষণ
              </button>
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-semibold transition hover:bg-secondary"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {addresses.length === 0 && !showAddressForm ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-12 text-center">
          <MapPin className="size-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-muted-foreground">কোনো ঠিকানা নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const icon = addr.label === "বাসা" ? "🏠" : addr.label === "অফিস" ? "🏢" : "📍";
            return (
              <div key={addr.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          ★ Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{addr.name}</p>
                    <p className="text-xs text-muted-foreground">{addr.address}</p>
                    <p className="text-xs text-muted-foreground">{addr.phone}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="rounded-full border border-border px-3 py-1.5 text-[10px] font-semibold transition hover:bg-secondary"
                    >
                      Default করুন
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(addr)}
                    className="rounded-full border border-border px-3 py-1.5 text-[10px] font-semibold transition hover:bg-secondary"
                  >
                    <Edit3 className="mr-1 inline size-3" /> সম্পাদনা
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-[10px] font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 className="mr-1 inline size-3" /> মুছুন
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Notifications Tab ── */
function NotificationsTab() {
  const notifications = [
    { id: "1", title: "অর্ডার কনফার্ম হয়েছে", desc: "আপনার অর্ডার #ORD-1024 কনফার্ম হয়েছে।", time: "২ ঘণ্টা আগে", read: false },
    { id: "2", title: "ডেলিভারি সম্পন্ন", desc: "অর্ডার #ORD-1020 সফলভাবে ডেলিভারি হয়েছে।", time: "১ দিন আগে", read: true },
    { id: "3", title: "নতুন অফার!", desc: "২০% ছাড়ে চাল কিনুন। সীমিত সময়ের জন্য।", time: "৩ দিন আগে", read: true },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-extrabold">নোটিফিকেশন</h2>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "rounded-2xl border bg-card p-4 shadow-soft",
              n.read ? "border-border" : "border-primary/30 bg-primary/5",
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("mt-0.5 size-2 shrink-0 rounded-full", n.read ? "bg-muted" : "bg-primary")} />
              <div>
                <p className="text-sm font-bold">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Settings Tab ── */
function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-extrabold">সেটিংস</h2>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-bold text-muted-foreground">Account</p>
          </div>
          {[
            { icon: User, label: "প্রোফাইল সম্পাদনা", desc: "নাম, ইমেইল, ফোন পরিবর্তন করুন" },
            { icon: Lock, label: "পাসওয়ার্ড পরিবর্তন", desc: "আপনার পাসওয়ার্ড আপডেট করুন" },
            { icon: Shield, label: "লগইন ও নিরাপত্তা", desc: "দুই-ফ্যাক্টর অথেনটিকেশন এবং সেশন ম্যানেজমেন্ট" },
          ].map((item, i) => (
            <button
              key={i}
              className="flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition hover:bg-muted/50 last:border-0"
            >
              <item.icon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="ml-auto size-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-bold text-muted-foreground">Preferences</p>
          </div>
          {[
            { icon: Bell, label: "নোটিফিকেশন", desc: "ইমেইল ও SMS নোটিফিকেশন সেটিংস" },
            { icon: Globe, label: "ভাষা", desc: "বাংলা" },
          ].map((item, i) => (
            <button
              key={i}
              className="flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition hover:bg-muted/50 last:border-0"
            >
              <item.icon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="ml-auto size-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-bold text-muted-foreground">Privacy</p>
          </div>
          {[
            { icon: FileText, label: "প্রাইভেসি পলিসি", desc: "আমাদের প্রাইভেসি পলিসি পড়ুন" },
            { icon: AlertCircle, label: "শর্তাবলী", desc: "ব্যবহারের শর্তাবলী" },
          ].map((item, i) => (
            <button
              key={i}
              className="flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition hover:bg-muted/50 last:border-0"
            >
              <item.icon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="ml-auto size-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/account")({
  component: AccountPage,
});
