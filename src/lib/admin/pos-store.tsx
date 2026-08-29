import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  type POSCartProduct,
  type POSSale,
  POS_CART_KEY,
  type POSPaymentMethod,
  type POSPaymentStatus,
} from "./pos-types";

function loadPOSCart(): POSCartProduct[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(POS_CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePOSCart(cart: POSCartProduct[]) {
  localStorage.setItem(POS_CART_KEY, JSON.stringify(cart));
}

function loadPOSSalesLocal(): POSSale[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("patgram_pos_sales") || "[]");
  } catch {
    return [];
  }
}

function savePOSSalesLocal(sales: POSSale[]) {
  localStorage.setItem("patgram_pos_sales", JSON.stringify(sales));
}

export function usePosStore() {
  const [cart, setCart] = useState<POSCartProduct[]>([]);
  const [sales, setSales] = useState<POSSale[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadPOSCart());

    if (isSupabaseConfigured) {
      (async () => {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("order_source", "pos")
          .order("created_at", { ascending: false });

        if (error) {
          setSales(loadPOSSalesLocal());
        } else {
          const mapped: POSSale[] =
            data?.map((o) => ({
              id: o.id,
              saleNumber: o.order_number,
              customerName: o.customer_name || "Walk-in Customer",
              customerPhone: o.customer_phone || "",
              items: [],
              subtotal: o.subtotal || 0,
              discountType: "fixed" as const,
              discountValue: 0,
              discountAmount: o.discount_amount || 0,
              total: o.total_amount || 0,
              paymentMethod: (o.payment_method as POSPaymentMethod) || "cash",
              paymentStatus: (o.payment_status as POSPaymentStatus) || "paid",
              paidAmount: o.paid_amount || 0,
              dueAmount: o.due_amount || 0,
              adminName: o.admin_name || "",
              date: new Date(o.created_at).toLocaleDateString("en-GB"),
              time: new Date(o.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
              createdAt: o.created_at,
              source: "pos" as const,
            })) ?? [];

          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*");

          if (itemsData) {
            mapped.forEach((sale) => {
              sale.items = itemsData
                .filter((i) => i.order_id === sale.id)
                .map((i) => ({
                  productId: i.product_id || "",
                  name: i.product_name,
                  price: i.unit_price,
                  stock: 0,
                  qty: i.quantity,
                  unit: "",
                }));
            });
          }

          setSales(mapped);
        }
        setHydrated(true);
      })();
    } else {
      setSales(loadPOSSalesLocal());
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) savePOSCart(cart);
  }, [cart, hydrated]);

  const addToCart = useCallback((product: { id: string; name: string; price: number; stock: number; unit: string; image?: string }) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.productId === product.id);
      if (existing) {
        if (existing.qty >= existing.stock) return prev;
        return prev.map((p) => (p.productId === product.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, stock: product.stock, qty: 1, unit: product.unit, image: product.image }];
    });
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setCart((prev) => prev.map((p) => (p.productId === productId ? { ...p, qty: Math.max(1, Math.min(qty, p.stock)) } : p)));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const completeSale = useCallback(
    async (opts: {
      customerName: string;
      customerPhone: string;
      discountType: "fixed" | "percentage";
      discountValue: number;
      paymentMethod: POSPaymentMethod;
      paymentStatus: POSPaymentStatus;
      paidAmount: number;
      adminName: string;
    }) => {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const discountAmount = opts.discountType === "fixed" ? opts.discountValue : Math.round((subtotal * opts.discountValue) / 100);
      const total = Math.max(0, subtotal - discountAmount);
      const dueAmount = total - opts.paidAmount;

      const now = new Date();

      if (isSupabaseConfigured) {
        const { count } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("order_source", "pos");

        const saleNumber = `POS-${String((count || 0) + 1).padStart(6, "0")}`;

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: saleNumber,
            order_source: "pos",
            customer_name: opts.customerName || "Walk-in Customer",
            customer_phone: opts.customerPhone,
            subtotal,
            discount_amount: discountAmount,
            total_amount: total,
            paid_amount: opts.paidAmount,
            due_amount: Math.max(0, dueAmount),
            payment_method: opts.paymentMethod,
            payment_status: opts.paymentStatus,
            status: "completed",
            admin_name: opts.adminName,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const orderItems = cart.map((item) => ({
          order_id: orderData.id,
          product_id: item.productId,
          product_name: item.name,
          unit_price: item.price,
          quantity: item.qty,
          subtotal: item.price * item.qty,
        }));

        await supabase.from("order_items").insert(orderItems);

        for (const item of cart) {
          const { data: product } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.productId)
            .single();

          if (product) {
            await supabase
              .from("products")
              .update({ stock: Math.max(0, product.stock - item.qty) })
              .eq("id", item.productId);
          }
        }

        const sale: POSSale = {
          id: orderData.id,
          saleNumber,
          customerName: opts.customerName || "Walk-in Customer",
          customerPhone: opts.customerPhone,
          items: [...cart],
          subtotal,
          discountType: opts.discountType,
          discountValue: opts.discountValue,
          discountAmount,
          total,
          paymentMethod: opts.paymentMethod,
          paymentStatus: opts.paymentStatus,
          paidAmount: opts.paidAmount,
          dueAmount: Math.max(0, dueAmount),
          adminName: opts.adminName,
          date: now.toLocaleDateString("en-GB"),
          time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          createdAt: now.toISOString(),
          source: "pos",
        };

        setSales((prev) => [sale, ...prev]);
        setCart([]);
        savePOSCart([]);
        return sale;
      } else {
        const saleNumber = `POS-${String(sales.length + 1).padStart(6, "0")}`;

        const sale: POSSale = {
          id: `pos-sale-${Date.now()}`,
          saleNumber,
          customerName: opts.customerName || "Walk-in Customer",
          customerPhone: opts.customerPhone,
          items: [...cart],
          subtotal,
          discountType: opts.discountType,
          discountValue: opts.discountValue,
          discountAmount,
          total,
          paymentMethod: opts.paymentMethod,
          paymentStatus: opts.paymentStatus,
          paidAmount: opts.paidAmount,
          dueAmount: Math.max(0, dueAmount),
          adminName: opts.adminName,
          date: now.toLocaleDateString("en-GB"),
          time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          createdAt: now.toISOString(),
          source: "pos",
        };

        const updatedSales = [...sales, sale];
        setSales(updatedSales);
        savePOSSalesLocal(updatedSales);

        try {
          const products = JSON.parse(localStorage.getItem("patgram_products") || "[]");
          const updated = products.map((p: { id: string; stock: number }) => {
            const item = cart.find((c) => c.productId === p.id);
            if (item) return { ...p, stock: Math.max(0, p.stock - item.qty) };
            return p;
          });
          localStorage.setItem("patgram_products", JSON.stringify(updated));
        } catch {}

        setCart([]);
        savePOSCart([]);
        return sale;
      }
    },
    [cart, sales]
  );

  const getTodaySales = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return sales.filter((s) => s.createdAt.startsWith(today));
  }, [sales]);

  return { cart, sales, hydrated, addToCart, updateQty, removeFromCart, clearCart, completeSale, getTodaySales };
}
