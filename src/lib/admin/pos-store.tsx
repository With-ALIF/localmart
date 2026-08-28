import { useState, useEffect, useCallback } from "react";
import {
  type POSCartProduct,
  type POSSale,
  POS_SALES_KEY,
  POS_CART_KEY,
  type POSPaymentMethod,
  type POSPaymentStatus,
} from "./pos-types";

function loadPOSSales(): POSSale[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(POS_SALES_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePOSSales(sales: POSSale[]) {
  localStorage.setItem(POS_SALES_KEY, JSON.stringify(sales));
}

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

export function usePosStore() {
  const [cart, setCart] = useState<POSCartProduct[]>([]);
  const [sales, setSales] = useState<POSSale[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadPOSCart());
    setSales(loadPOSSales());
    setHydrated(true);
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
    (opts: {
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
      savePOSSales(updatedSales);

      // Update stock in localStorage
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
    },
    [cart, sales]
  );

  const getTodaySales = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return sales.filter((s) => s.createdAt.startsWith(today));
  }, [sales]);

  return { cart, sales, hydrated, addToCart, updateQty, removeFromCart, clearCart, completeSale, getTodaySales };
}
