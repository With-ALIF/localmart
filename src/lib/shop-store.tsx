import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/data/catalog";

const CART_KEY = "shobuj-bazar-cart";
const WISHLIST_KEY = "shobuj-bazar-wishlist";

type CartLine = { id: string; qty: number };

type ShopContextValue = {
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  wishlistCount: number;
  cartItems: { product: Product; qty: number }[];
  subtotal: number;
  discount: number;
  total: number;
  addToCart: (id: string, qty?: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  removeFromWishlist: (id: string) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(read<CartLine[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISHLIST_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((id: string, qty = 1) => {
    setCart((prev) => {
      const found = prev.find((l) => l.id === id);
      if (found) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
      return [...prev, { id, qty }];
    });
  }, []);

  const increment = useCallback((id: string) => addToCart(id, 1), [addToCart]);

  const decrement = useCallback((id: string) => {
    setCart((prev) =>
      prev.flatMap((l) => (l.id === id ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l])),
    );
  }, []);

  const removeFromCart = useCallback(
    (id: string) => setCart((prev) => prev.filter((l) => l.id !== id)),
    [],
  );

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const removeFromWishlist = useCallback(
    (id: string) => setWishlist((prev) => prev.filter((x) => x !== id)),
    [],
  );

  const value = useMemo<ShopContextValue>(() => {
    const cartItems = cart
      .map((line) => {
        const product = products.find((p) => p.id === line.id);
        return product ? { product, qty: line.qty } : null;
      })
      .filter((x): x is { product: Product; qty: number } => x !== null);

    const subtotal = cartItems.reduce((sum, i) => sum + i.product.oldPrice * i.qty, 0);
    const total = cartItems.reduce((sum, i) => sum + i.product.price * i.qty, 0);

    return {
      cart,
      wishlist,
      cartItems,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      wishlistCount: wishlist.length,
      subtotal,
      discount: subtotal - total,
      total,
      addToCart,
      increment,
      decrement,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
      removeFromWishlist,
    };
  }, [
    cart,
    wishlist,
    addToCart,
    increment,
    decrement,
    removeFromCart,
    clearCart,
    toggleWishlist,
    removeFromWishlist,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
