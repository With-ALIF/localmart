import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product, Category, CategorySlug } from "@/data/catalog";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const PRODUCTS_KEY = "patgram_products";
const CATEGORIES_KEY = "patgram_categories";
const ORDERS_KEY = "patgram_orders";

export type Order = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  total: number;
  payment: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
};

const seedOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "রাহুল আহমেদ",
    phone: "01712345678",
    address: "ঢাকা, বাড্ডা",
    items: [
      { productId: "p-001", name: "প্রিমিয়াম মিনিকেট চাল ৫ কেজি", price: 420, qty: 2 },
      { productId: "p-003", name: "সয়াবিন তেল ২ লিটার", price: 355, qty: 1 },
    ],
    total: 1195,
    payment: "bKash",
    status: "delivered",
    date: "2026-08-27",
  },
  {
    id: "ORD-002",
    customer: "সাবরিনা আক্তার",
    phone: "01812345678",
    address: "চট্টগ্রাম, গেজারী",
    items: [
      { productId: "p-018", name: "ওয়্যারলেস ইয়ারবাডস TWS", price: 1790, qty: 1 },
      { productId: "p-012", name: "ক্রিম বিস্কুট ফ্যামিলি প্যাক", price: 145, qty: 2 },
    ],
    total: 2080,
    payment: "COD",
    status: "shipped",
    date: "2026-08-26",
  },
  {
    id: "ORD-003",
    customer: "তানভীর হাসান",
    phone: "01912345678",
    address: "সিলেট, জালালাবাদ",
    items: [
      { productId: "p-007", name: "হলুদ গুঁড়া ২০০ গ্রাম", price: 78, qty: 3 },
      { productId: "p-008", name: "মিক্সড মসলা কম্বো", price: 465, qty: 1 },
    ],
    total: 699,
    payment: "Nagad",
    status: "processing",
    date: "2026-08-26",
  },
  {
    id: "ORD-004",
    customer: "নাদিয়া খানম",
    phone: "01612345678",
    address: "রাজশাহী, বোয়ালী",
    items: [
      { productId: "p-015", name: "সুতি পাঞ্জাবি", price: 1290, qty: 2 },
      { productId: "p-016", name: "ফরমাল কটন শার্ট", price: 980, qty: 1 },
    ],
    total: 3560,
    payment: "bKash",
    status: "pending",
    date: "2026-08-25",
  },
  {
    id: "ORD-005",
    customer: "কামরুজ জামান",
    phone: "01512345678",
    address: "খুলনা, সোনাডাঙ্গা",
    items: [
      { productId: "p-024", name: "আটা (চাক্কি ফ্রেশ) ২ কেজি", price: 128, qty: 5 },
      { productId: "p-006", name: "গুঁড়া দুধ ৫০০ গ্রাম", price: 410, qty: 1 },
    ],
    total: 1050,
    payment: "COD",
    status: "delivered",
    date: "2026-08-25",
  },
  {
    id: "ORD-006",
    customer: "ফারহানা বেগম",
    phone: "01312345678",
    address: "কুমিল্লা, আদর্শনগর",
    items: [{ productId: "p-009", name: "অরেঞ্জ জুস ১ লিটার", price: 115, qty: 4 }],
    total: 460,
    payment: "bKash",
    status: "delivered",
    date: "2026-08-24",
  },
  {
    id: "ORD-007",
    customer: "ইমরান হোসেন",
    phone: "01412345678",
    address: "বরিশাল, কোতোয়ালি",
    items: [{ productId: "p-019", name: "ইলেকট্রিক কেটলি", price: 1450, qty: 1 }],
    total: 1450,
    payment: "Nagad",
    status: "cancelled",
    date: "2026-08-24",
  },
  {
    id: "ORD-008",
    customer: "রুমানা পারভীন",
    phone: "01112345678",
    address: "গাজীপুর, টঙ্গী",
    items: [
      { productId: "p-020", name: "মিনি রিচার্জেবল ফ্যান", price: 1150, qty: 1 },
      { productId: "p-010", name: "গ্রিন টি ব্যাগ", price: 190, qty: 2 },
    ],
    total: 1530,
    payment: "bKash",
    status: "shipped",
    date: "2026-08-23",
  },
];

type DataStoreValue = {
  products: Product[];
  categories: Category[];
  orders: Order[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (c: Category) => void;
  updateCategory: (slug: CategorySlug, data: Partial<Category>) => void;
  deleteCategory: (slug: CategorySlug) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
};

const DataContext = createContext<DataStoreValue | null>(null);

function readList<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function seedIfNeeded() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(PRODUCTS_KEY)) {
    window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
  }
  if (!window.localStorage.getItem(CATEGORIES_KEY)) {
    window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify([]));
  }
  if (!window.localStorage.getItem(ORDERS_KEY)) {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(seedOrders));
  }
}

function mapProductFromDb(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    details: row.details || "",
    category: row.category || "",
    price: row.price || 0,
    oldPrice: row.old_price || 0,
    rating: row.rating || 0,
    reviews: row.reviews || 0,
    stock: row.stock || 0,
    unit: row.unit || "",
    brand: row.brand || "",
    image: row.image || undefined,
    tags: (row.tags || []) as Product["tags"],
  };
}

function mapProductToDb(p: Product) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    details: p.details,
    category: p.category,
    price: p.price,
    old_price: p.oldPrice,
    rating: p.rating,
    reviews: p.reviews,
    stock: p.stock,
    unit: p.unit,
    brand: p.brand,
    image: p.image || null,
    tags: p.tags,
  };
}

function mapCategoryFromDb(row: any): Category {
  return {
    slug: row.slug,
    name: row.name,
    icon: row.icon || "",
    image: row.image || "",
  };
}

function mapCategoryToDb(c: Category) {
  return {
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    image: c.image,
  };
}

function mapOrderFromDb(row: any, items: { productId: string; name: string; price: number; qty: number }[]): Order {
  return {
    id: row.order_number || row.id,
    customer: row.customer_name,
    phone: row.customer_phone,
    address: row.address || "",
    items,
    total: row.total_amount || 0,
    payment: row.payment_method || "",
    status: row.status as Order["status"],
    date: row.created_at ? row.created_at.slice(0, 10) : "",
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    readList<Product[]>(PRODUCTS_KEY, []),
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    readList<Category[]>(CATEGORIES_KEY, []),
  );
  const [orders, setOrders] = useState<Order[]>(() => readList<Order[]>(ORDERS_KEY, seedOrders));

  useEffect(() => {
    if (!isSupabaseConfigured) {
      seedIfNeeded();
      setProducts(readList<Product[]>(PRODUCTS_KEY, []));
      setCategories(readList<Category[]>(CATEGORIES_KEY, []));
      setOrders(readList<Order[]>(ORDERS_KEY, seedOrders));
      return;
    }

    async function fetchData() {
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("order_source", "online")
        .order("created_at", { ascending: false });

      if (productsData) {
        setProducts(productsData.map(mapProductFromDb));
      }
      if (categoriesData) {
        setCategories(categoriesData.map(mapCategoryFromDb));
      }
      if (ordersData) {
        const mappedOrders: Order[] = [];
        for (const row of ordersData) {
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", row.id);

          const items = (itemsData || []).map((item: any) => ({
            productId: item.product_id || "",
            name: item.product_name,
            price: item.unit_price,
            qty: item.quantity,
          }));

          mappedOrders.push(mapOrderFromDb(row, items));
        }
        setOrders(mappedOrders);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured && typeof window !== "undefined")
      window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products, isSupabaseConfigured]);

  useEffect(() => {
    if (!isSupabaseConfigured && typeof window !== "undefined")
      window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories, isSupabaseConfigured]);

  useEffect(() => {
    if (!isSupabaseConfigured && typeof window !== "undefined")
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, isSupabaseConfigured]);

  const addProduct = useCallback(async (p: Product) => {
    let dbOk = false;
    if (isSupabaseConfigured) {
      const dbProduct = mapProductToDb(p);
      const { error } = await supabase.from("products").insert(dbProduct);
      if (!error) dbOk = true;
      else console.error("Failed to add product:", error);
    }
    if (!dbOk) {
      setProducts((prev) => {
        const next = [...prev, p];
        if (typeof window !== "undefined") window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(next));
        return next;
      });
    } else {
      setProducts((prev) => [...prev, p]);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    let dbOk = false;
    if (isSupabaseConfigured) {
      const dbData: any = {};
      if (data.name !== undefined) dbData.name = data.name;
      if (data.description !== undefined) dbData.description = data.description;
      if (data.details !== undefined) dbData.details = data.details;
      if (data.category !== undefined) dbData.category = data.category;
      if (data.price !== undefined) dbData.price = data.price;
      if (data.oldPrice !== undefined) dbData.old_price = data.oldPrice;
      if (data.rating !== undefined) dbData.rating = data.rating;
      if (data.reviews !== undefined) dbData.reviews = data.reviews;
      if (data.stock !== undefined) dbData.stock = data.stock;
      if (data.unit !== undefined) dbData.unit = data.unit;
      if (data.brand !== undefined) dbData.brand = data.brand;
      if (data.image !== undefined) dbData.image = data.image || null;
      if (data.tags !== undefined) dbData.tags = data.tags;

      const { error } = await supabase.from("products").update(dbData).eq("id", id);
      if (!error) dbOk = true;
      else console.error("Failed to update product:", error);
    }
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      if (typeof window !== "undefined") window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    let dbOk = false;
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) dbOk = true;
      else console.error("Failed to delete product:", error);
    }
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (typeof window !== "undefined") window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addCategory = useCallback(async (c: Category) => {
    let dbOk = false;
    if (isSupabaseConfigured) {
      const dbCategory = mapCategoryToDb(c);
      const { error } = await supabase.from("categories").insert(dbCategory);
      if (!error) dbOk = true;
      else console.error("Failed to add category:", error);
    }
    setCategories((prev) => {
      const next = [...prev, c];
      if (typeof window !== "undefined") window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateCategory = useCallback(async (slug: CategorySlug, data: Partial<Category>) => {
    let dbOk = false;
    if (isSupabaseConfigured) {
      const dbData: any = {};
      if (data.name !== undefined) dbData.name = data.name;
      if (data.icon !== undefined) dbData.icon = data.icon;
      if (data.image !== undefined) dbData.image = data.image;

      const { error } = await supabase.from("categories").update(dbData).eq("slug", slug);
      if (!error) dbOk = true;
      else console.error("Failed to update category:", error);
    }
    setCategories((prev) => {
      const next = prev.map((c) => (c.slug === slug ? { ...c, ...data } : c));
      if (typeof window !== "undefined") window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteCategory = useCallback(async (slug: CategorySlug) => {
    let dbOk = false;
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("categories").delete().eq("slug", slug);
      if (!error) dbOk = true;
      else console.error("Failed to delete category:", error);
    }
    setCategories((prev) => {
      const next = prev.filter((c) => c.slug !== slug);
      if (typeof window !== "undefined") window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: Order["status"]) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("order_number", id);
      if (error) {
        console.error("Failed to update order status:", error);
        return;
      }
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  const totalSales = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = useMemo(() => new Set(orders.map((o) => o.phone)).size, [orders]);

  const value = useMemo<DataStoreValue>(
    () => ({
      products,
      categories,
      orders,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      updateOrderStatus,
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
    }),
    [
      products,
      categories,
      orders,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      updateOrderStatus,
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
