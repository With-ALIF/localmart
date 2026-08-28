import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Product, Category } from "@/data/catalog";

type ShopContextValue = {
  products: Product[];
  categories: Category[];
  cart: { id: string; qty: number }[];
  wishlist: string[];
  cartCount: number;
  wishlistCount: number;
  cartItems: { product: Product; qty: number }[];
  subtotal: number;
  discount: number;
  total: number;
  loading: boolean;
  addToCart: (id: string, qty?: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  removeFromWishlist: (id: string) => void;
  refreshProducts: () => Promise<void>;
};

const ShopContext = createContext<ShopContextValue | null>(null);

const CART_KEY = "patgram-cart";
const WISHLIST_KEY = "patgram-wishlist";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || "",
    details: (row.details as string) || "",
    category: (row.category as string) || "",
    price: Number(row.price) || 0,
    oldPrice: Number(row.old_price) || 0,
    rating: Number(row.rating) || 0,
    reviews: Number(row.reviews) || 0,
    stock: Number(row.stock) || 0,
    unit: (row.unit as string) || "",
    brand: (row.brand as string) || "",
    image: (row.image as string) || undefined,
    tags: (row.tags as string[]) || [],
  };
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    slug: row.slug as string,
    name: row.name as string,
    icon: (row.icon as string) || "",
    image: (row.image as string) || "",
  };
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProducts([]);
      setCategories([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [prodsRes, catsRes] = await Promise.all([
        supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("sort_order"),
      ]);
      if (prodsRes.data) setProducts(prodsRes.data.map(mapProduct));
      if (catsRes.data) setCategories(catsRes.data.map(mapCategory));
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCart(readLocal(CART_KEY, []));
    setWishlist(readLocal(WISHLIST_KEY, []));
    setHydrated(true);
    fetchProducts();
  }, [fetchProducts]);

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
      prev.flatMap((l) => (l.id === id ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l]))
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((x) => x !== id));
  }, []);

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
      products,
      categories,
      cart,
      wishlist,
      cartItems,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      wishlistCount: wishlist.length,
      subtotal,
      discount: subtotal - total,
      total,
      loading,
      addToCart,
      increment,
      decrement,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
      removeFromWishlist,
      refreshProducts: fetchProducts,
    };
  }, [
    products,
    categories,
    cart,
    wishlist,
    loading,
    addToCart,
    increment,
    decrement,
    removeFromCart,
    clearCart,
    toggleWishlist,
    removeFromWishlist,
    fetchProducts,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
