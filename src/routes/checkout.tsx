import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Shield, Truck, CreditCard, MapPin, ArrowLeft, CheckCircle, Home, Building, Plus, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useShop } from "@/lib/shop-store";
import { useAuth } from "@/lib/auth-store";
import { formatTaka, toBnNumber } from "@/lib/format";
import { discountPercent } from "@/data/catalog";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateOrderNumber } from "@/lib/id-generator";
import { ProductImage } from "@/components/shop/ProductImage";

type SavedAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
};

function CheckoutPage() {
  const { cartItems, subtotal, discount, total, cartCount, clearCart, categories } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("cod");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [bkashTrxId, setBkashTrxId] = useState("");
  const [bkashSenderPhone, setBkashSenderPhone] = useState("");
  const [nagadTrxId, setNagadTrxId] = useState("");
  const [nagadSenderPhone, setNagadSenderPhone] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);

  const BKASH_MERCHANT = "01711144376";
  const NAGAD_MERCHANT = "01711144376";

  useEffect(() => {
    async function loadAddresses() {
      if (isSupabaseConfigured) {
        const userId = user?.id ?? null;
        if (!userId) return;
        const { data } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", userId);
        if (data) {
          const mapped: SavedAddress[] = data.map((a) => ({
            id: a.id,
            label: a.label,
            name: a.name,
            phone: a.phone,
            address: a.address,
            isDefault: a.is_default,
          }));
          setSavedAddresses(mapped);
          const defaultAddr = mapped.find((a) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddrId(defaultAddr.id);
            setName(defaultAddr.name);
            setPhone(defaultAddr.phone);
            setAddress(defaultAddr.address);
          } else if (mapped.length > 0) {
            setSelectedAddrId(mapped[0].id);
            setName(mapped[0].name);
            setPhone(mapped[0].phone);
            setAddress(mapped[0].address);
          }
        }
      } else {
        try {
          const raw = window.localStorage.getItem("patgram_addresses");
          const addrs: SavedAddress[] = raw ? JSON.parse(raw) : [];
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddrId(defaultAddr.id);
            setName(defaultAddr.name);
            setPhone(defaultAddr.phone);
            setAddress(defaultAddr.address);
          } else if (addrs.length > 0) {
            setSelectedAddrId(addrs[0].id);
            setName(addrs[0].name);
            setPhone(addrs[0].phone);
            setAddress(addrs[0].address);
          }
        } catch {}
      }
    }
    loadAddresses();
  }, [user]);

  const handleOrder = async () => {
    if (!name.trim()) {
      toast.error("পুরো নাম দিন");
      return;
    }
    if (!phone.trim()) {
      toast.error("মোবাইল নম্বর দিন");
      return;
    }
    if (!address.trim()) {
      toast.error("ডেলিভারি ঠিকানা দিন");
      return;
    }

    if (payment === "bkash" && !bkashTrxId.trim()) {
      toast.error("bKash Transaction ID দিন");
      return;
    }

    if (payment === "nagad" && !nagadTrxId.trim()) {
      toast.error("Nagad Transaction ID দিন");
      return;
    }

    if (isSupabaseConfigured) {
      const userId = user && "id" in user ? (user as { id: string }).id : null;

      // Retry loop to handle race condition on order_number unique constraint
      let orderData: { id: string } | null = null;
      let lastOrderError: { message: string; code?: string } | null = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const freshOrderNumber = await generateOrderNumber("online");
        const { data, error } = await supabase
          .from("orders")
          .insert({
            order_number: freshOrderNumber,
            user_id: userId ?? undefined,
            order_source: "online",
            customer_name: name.trim(),
            customer_phone: phone.trim(),
            customer_email: user?.email || "",
            address: address.trim(),
            subtotal,
            discount_amount: discount,
            total_amount: total,
            paid_amount: 0,
            due_amount: total,
            payment_method: payment === "cod" ? "COD" : payment === "bkash" ? "bKash" : "Nagad",
            payment_status: "pending",
            status: "pending",
          })
          .select()
          .single();

        if (!error) {
          orderData = data;
          break;
        }
        // 23505 = unique_violation in PostgreSQL
        if (error.code === "23505") {
          lastOrderError = error;
          continue; // retry with a new order number
        }
        // Any other error → fail immediately
        toast.error("অর্ডার দেওয়া যায়নি", { description: error.message });
        return;
      }

      if (!orderData) {
        toast.error("অর্ডার দেওয়া যায়নি", { description: lastOrderError?.message });
        return;
      }

      const orderItems = cartItems.map(({ product, qty }) => ({
        order_id: orderData!.id,
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity: qty,
        subtotal: product.price * qty,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) {
        toast.error("অর্ডার আইটেম সংরক্ষণ করা যায়নি", { description: itemsError.message });
        return;
      }

      for (const { product, qty } of cartItems) {
        await supabase
          .from("products")
          .update({ stock: Math.max(0, (product.stock ?? 0) - qty) })
          .eq("id", product.id);
      }

      await supabase.from("order_status_history").insert({
        order_id: orderData.id,
        status: "pending",
        note: payment === "bkash"
          ? `Order placed. bKash TrxID: ${bkashTrxId.trim()}${bkashSenderPhone ? ` (Sender: ${bkashSenderPhone.trim()})` : ""}`
          : payment === "nagad"
          ? `Order placed. Nagad TrxID: ${nagadTrxId.trim()}${nagadSenderPhone ? ` (Sender: ${nagadSenderPhone.trim()})` : ""}`
          : "Order placed",
        created_by: userId,
      });
    } else {
      const order = {
        id: orderNumber,
        customer: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        email: user?.email || "",
        items: cartItems.map(({ product, qty }) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          qty,
        })),
        total,
        payment: payment === "cod" ? "COD" : payment === "bkash" ? "bKash" : "Nagad",
        bkashTrxId: payment === "bkash" ? bkashTrxId.trim() : "",
        bkashSender: payment === "bkash" ? bkashSenderPhone.trim() : "",
        nagadTrxId: payment === "nagad" ? nagadTrxId.trim() : "",
        nagadSender: payment === "nagad" ? nagadSenderPhone.trim() : "",
        status: "pending" as const,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      };

      try {
        const raw = window.localStorage.getItem("patgram_orders");
        const existing = raw ? JSON.parse(raw) : [];
        existing.push(order);
        window.localStorage.setItem("patgram_orders", JSON.stringify(existing));
      } catch {}
    }

    setConfirmed(true);
    clearCart();
    toast.success("অর্ডার সফলভাবে দেওয়া হয়েছে!", {
      description: "শীঘ্রই ডেলিভারি পাবেন",
    });
  };

  if (confirmed) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="size-10 text-success" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-extrabold">অর্ডার কনফার্ম হয়েছে!</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            অর্ডার ট্র্যাক করুন
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-bold transition hover:bg-secondary"
          >
            আরও কেনাকাটা করুন
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-extrabold">কার্ট খালি</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          চেকআউট করার জন্য প্রথমে কার্টে পণ্য যোগ করুন।
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

  return (
    <div className="container-page py-6 sm:py-8">
      <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          হোম
        </Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-primary">
          কার্ট
        </Link>
        <span>/</span>
        <span className="font-semibold text-foreground">চেকআউট</span>
      </nav>

      <h1 className="mb-6 font-display text-2xl font-extrabold sm:text-3xl">চেকআউট</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <MapPin className="size-5 text-primary" />
              ডেলিভারি ঠিকানা
            </h2>

            {savedAddresses.length > 0 && !showNewForm && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">সংরক্ষিত ঠিকানা থেকে বাছাই করুন:</p>
                {savedAddresses.map((addr) => {
                  const icon = addr.label === "বাসা" ? "🏠" : addr.label === "অফিস" ? "🏢" : "📍";
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setSelectedAddrId(addr.id);
                        setName(addr.name);
                        setPhone(addr.phone);
                        setAddress(addr.address);
                      }}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                        selectedAddrId === addr.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-lg">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{addr.label}</p>
                          {addr.isDefault && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              ★ Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{addr.name} · {addr.phone}</p>
                        <p className="text-xs text-muted-foreground">{addr.address}</p>
                      </div>
                      <div className={`mt-1 size-4 shrink-0 rounded-full border-2 ${
                        selectedAddrId === addr.id ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                        {selectedAddrId === addr.id && (
                          <div className="flex size-full items-center justify-center">
                            <div className="size-1.5 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => { setShowNewForm(true); setSelectedAddrId(null); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                >
                  <Plus className="size-3.5" />
                  নতুন ঠিকানা ব্যবহার করুন
                </button>
              </div>
            )}

            {(showNewForm || savedAddresses.length === 0) && savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="mb-4 text-xs font-semibold text-primary hover:underline"
              >
                ← সংরক্ষিত ঠিকানা থেকে বাছাই করুন
              </button>
            )}

            {(showNewForm || savedAddresses.length === 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold">পুরো নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold">সম্পূর্ণ ঠিকানা *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাসা নং, রাস্তা, এলাকা, শহর..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
                />
              </div>
            </div>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-bold">ডেলিভারি নোট (ঐচ্ছিক)</label>
              <input
                type="text"
                placeholder="যেমন: দরজায় ডেলিভারি দিন, বেল ১ টিপুন..."
                className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <CreditCard className="size-5 text-primary" />
              পেমেন্ট পদ্ধতি
            </h2>
            <div className="space-y-3">
              {[
                { id: "cod", label: "ক্যাশ অন ডেলিভারি", desc: "ডেলিভারি পেয়ে টাকা দিন" },
                { id: "bkash", label: "bKash", desc: "সেন্ড মানি" },
                { id: "nagad", label: "Nagad", desc: "সেন্ড মানি" },
              ].map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={payment === m.id}
                    onChange={(e) => setPayment(e.target.value)}
                    className="size-4 accent-primary"
                  />
                  <div>
                    <p className="text-sm font-bold">{m.label}</p>
                    <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {payment === "bkash" && (
            <div className="mt-3 overflow-hidden rounded-lg bg-[#E2136E] p-5">
              <div className="mt-3 text-center">
                <h2 className="mb-3 font-bangla font-semibold text-white">ট্রানজেকশন আইডি দিন</h2>
                <input
                  type="text"
                  value={bkashTrxId}
                  onChange={(e) => setBkashTrxId(e.target.value)}
                  placeholder="ট্রানজেকশন আইডি দিন"
                  maxLength={15}
                  required
                  autoComplete="off"
                  className="w-full appearance-none rounded-[10px] bg-white px-5 py-3.5 text-[15px] text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0057d0] sm:bg-[#fbfcff]"
                />
              </div>

              <div className="mt-3 text-center">
                <h2 className="mb-3 font-bangla font-semibold text-white">আপনার bKash নম্বর (ঐচ্ছিক)</h2>
                <input
                  type="tel"
                  value={bkashSenderPhone}
                  onChange={(e) => setBkashSenderPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  maxLength={12}
                  autoComplete="off"
                  className="w-full appearance-none rounded-[10px] bg-white px-5 py-3.5 text-[15px] text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0057d0] sm:bg-[#fbfcff]"
                />
              </div>

              <ul className="mt-5 text-sm text-white">
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">
                    <span>*247#</span> ডায়াল করে আপনার bKash মোবাইল মেনুতে যান অথবা bKash অ্যাপ খুলুন
                  </p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">সেন্ড মানি -এ ক্লিক করুন</p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="sm:w-[90%] font-bangla">
                    নিচের নম্বরে টাকা পাঠান{" "}
                    <span className="ml-1 font-semibold text-yellow-300">{BKASH_MERCHANT}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(BKASH_MERCHANT);
                        setCopiedNumber(true);
                        toast.success("নম্বর কপি হয়েছে!");
                        setTimeout(() => setCopiedNumber(false), 2000);
                      }}
                      className="mx-2 inline-block rounded-md bg-black/40 px-2 py-0.5 text-xs"
                    >
                      {copiedNumber ? "কপি হয়েছে ✓" : "কপি"}
                    </button>
                  </p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">
                    টাকার পরিমাণঃ{" "}
                    <span className="ml-1 font-semibold text-yellow-300">{formatTaka(total)}</span>
                  </p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">নিশ্চিত করে এখন আপনার bKash PIN লিখুন</p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">টাকা পাঠান এবং ট্রানজ্যাকশন আইডি কপি করুন</p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">ট্রানজ্যাকশন আইডি লিখে অর্ডার কনফার্ম করুন</p>
                </li>
              </ul>
            </div>
          )}

          {payment === "nagad" && (
            <div className="mt-3 overflow-hidden rounded-lg bg-[#F62B2B] p-5">
              <div className="mt-3 text-center">
                <h2 className="mb-3 font-bangla font-semibold text-white">ট্রানজেকশন আইডি দিন</h2>
                <input
                  type="text"
                  value={nagadTrxId}
                  onChange={(e) => setNagadTrxId(e.target.value)}
                  placeholder="ট্রানজেকশন আইডি দিন"
                  maxLength={15}
                  required
                  autoComplete="off"
                  className="w-full appearance-none rounded-[10px] bg-white px-5 py-3.5 text-[15px] text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F62B2B] sm:bg-[#fbfcff]"
                />
              </div>

              <div className="mt-3 text-center">
                <h2 className="mb-3 font-bangla font-semibold text-white">আপনার Nagad নম্বর (ঐচ্ছিক)</h2>
                <input
                  type="tel"
                  value={nagadSenderPhone}
                  onChange={(e) => setNagadSenderPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  maxLength={12}
                  autoComplete="off"
                  className="w-full appearance-none rounded-[10px] bg-white px-5 py-3.5 text-[15px] text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F62B2B] sm:bg-[#fbfcff]"
                />
              </div>

              <ul className="mt-5 text-sm text-white">
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">
                    <span>*167#</span> ডায়াল করে আপনার NAGAD মোবাইল মেনুতে যান অথবা NAGAD অ্যাপে যান
                  </p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">সেন্ড মানি -এ ক্লিক করুন</p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="sm:w-[90%] font-bangla">
                    নিচের নম্বরে টাকা পাঠান{" "}
                    <span className="ml-1 font-semibold text-yellow-300">{NAGAD_MERCHANT}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(NAGAD_MERCHANT);
                        setCopiedNumber(true);
                        toast.success("নম্বর কপি হয়েছে!");
                        setTimeout(() => setCopiedNumber(false), 2000);
                      }}
                      className="mx-2 inline-block rounded-md bg-black/40 px-2 py-0.5 text-xs"
                    >
                      {copiedNumber ? "কপি হয়েছে ✓" : "কপি"}
                    </button>
                  </p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">
                    টাকার পরিমাণঃ{" "}
                    <span className="ml-1 font-semibold text-yellow-300">{formatTaka(total)}</span>
                  </p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">নিশ্চিত করে এখন আপনার NAGAD মোবাইল মেনু PIN লিখুন</p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">টাকা পাঠান এবং ট্রানজ্যাকশন আইডি কপি করুন</p>
                </li>
                <hr className="my-3 border-white/20" />
                <li className="flex">
                  <div><span className="mb-0.5 mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white"></span></div>
                  <p className="font-bangla">ট্রানজ্যাকশন আইডি লিখে অর্ডার কনফার্ম করুন</p>
                </li>
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:hidden">
            <h2 className="mb-4 font-display text-lg font-bold">অর্ডার সারসংক্ষেপ</h2>
            <div className="space-y-3">
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <ProductImage
                    product={product}
                    categories={categories}
                    className="size-12 rounded-lg"
                    imgClassName="size-12 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">×{toBnNumber(qty)}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {formatTaka(product.price * qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">সাবটোটাল ({toBnNumber(cartCount)}টি)</span>
                <span className="font-semibold">{formatTaka(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>ছাড়</span>
                  <span className="font-semibold">-{formatTaka(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>ডেলিভারি</span>
                <span className="font-semibold text-success">ফ্রি</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-base font-bold">
                  <span>মোট</span>
                  <span className="font-display text-xl text-primary">{formatTaka(total)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleOrder}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              <Shield className="size-4" />
              অর্ডার কনফার্ম করুন — {formatTaka(total)}
            </button>
          </div>
        </div>

        <div className="hidden lg:col-span-1 lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="mb-4 font-display text-lg font-bold">অর্ডার সারসংক্ষেপ</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    সাবটোটাল ({toBnNumber(cartCount)}টি)
                  </span>
                  <span className="font-semibold">{formatTaka(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>ছাড়</span>
                    <span className="font-semibold">-{formatTaka(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>ডেলিভারি</span>
                  <span className="font-semibold text-success">ফ্রি</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-base font-bold">
                    <span>মোট</span>
                    <span className="font-display text-xl text-primary">{formatTaka(total)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleOrder}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
              >
                <Shield className="size-4" />
                অর্ডার কনফার্ম করুন
              </button>
            </div>

          </div>
        </div>
      </div>

      <Link
        to="/cart"
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        কার্টে ফিরে যান
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});
