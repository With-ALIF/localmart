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

export type Order = {
  id: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  items: { productId: string; name: string; price: number; qty: number }[];
  total: number;
  payment: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  time: string;
  bkashTrxId?: string;
  bkashSender?: string;
  nagadTrxId?: string;
  nagadSender?: string;
};

export type StatusHistoryEntry = {
  id: string;
  order_id: string;
  status: string;
  note: string;
  created_by: string | null;
  created_at: string;
};

type DataStoreValue = {
  products: Product[];
  categories: Category[];
  orders: Order[];
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (c: Category) => Promise<void>;
  updateCategory: (slug: CategorySlug, data: Partial<Category>) => Promise<void>;
  deleteCategory: (slug: CategorySlug) => Promise<void>;
  updateOrderStatus: (id: string, status: Order["status"], note?: string) => Promise<{ success: boolean; error?: string }>;
  getOrderStatusHistory: (orderId: string) => Promise<StatusHistoryEntry[]>;
  getValidNextStatuses: (currentStatus: Order["status"]) => Order["status"][];
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
};

const DataContext = createContext<DataStoreValue | null>(null);

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

function mapProductToDb(p: Product, includeId = true) {
  const row: Record<string, unknown> = {
    name: p.name,
    description: p.description,
    details: p.details,
    category: p.category || null,
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
  // Only include id when updating (id must be a valid UUID for Supabase)
  if (includeId && p.id && !p.id.startsWith("p-")) {
    row.id = p.id;
  }
  return row;
}

function mapCategoryFromDb(row: any): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon || "",
    image: row.image || "",
  };
}

function mapCategoryToDb(c: Category) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    image: c.image,
  };
}

function mapOrderFromDb(row: any, items: { productId: string; name: string; price: number; qty: number }[]): Order {
  const d = row.created_at ? new Date(row.created_at) : null;
  return {
    id: row.order_number || row.id,
    customer: row.customer_name,
    phone: row.customer_phone,
    email: row.customer_email || "",
    address: row.address || "",
    items,
    total: row.total_amount || 0,
    payment: row.payment_method || "",
    status: row.status as Order["status"],
    date: row.created_at ? row.created_at.slice(0, 10) : "",
    time: d ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "",
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        const raw = window.localStorage.getItem("patgram_orders");
        if (raw) {
          setOrders(JSON.parse(raw));
        }
      } catch {}
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
        .order("created_at", { ascending: false });

      if (productsData) setProducts(productsData.map(mapProductFromDb));
      if (categoriesData) setCategories(categoriesData.map(mapCategoryFromDb));

      if (ordersData && ordersData.length > 0) {
        const orderIds = ordersData.map((o) => o.id);

        // Batch-fetch all items in one query instead of N+1 per-order
        const { data: allItems } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

        const itemsByOrderId = new Map<string, { productId: string; name: string; price: number; qty: number }[]>();
        for (const item of allItems ?? []) {
          const list = itemsByOrderId.get(item.order_id) ?? [];
          list.push({
            productId: item.product_id || "",
            name: item.product_name,
            price: item.unit_price,
            qty: item.quantity,
          });
          itemsByOrderId.set(item.order_id, list);
        }

        const mappedOrders: Order[] = ordersData.map((row) =>
          mapOrderFromDb(row, itemsByOrderId.get(row.id) ?? [])
        );
        setOrders(mappedOrders);
      }
    }

    fetchData();
  }, []);

  const addProduct = useCallback(async (p: Product) => {
    if (!isSupabaseConfigured) return;
    // Don't send local p- IDs to DB — let Supabase generate a proper UUID
    const { data, error } = await supabase
      .from("products")
      .insert(mapProductToDb(p, false))
      .select("id")
      .single();
    if (error) { console.error("Failed to add product:", error); return; }
    // Use the DB-generated UUID in local state
    const saved = { ...p, id: data?.id ?? p.id };
    setProducts((prev) => [...prev, saved]);
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    if (!isSupabaseConfigured) return;
    const dbData: any = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.details !== undefined) dbData.details = data.details;
    if (data.category !== undefined) dbData.category = data.category || null;
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
    if (error) { console.error("Failed to update product:", error); return; }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { console.error("Failed to delete product:", error); return; }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCategory = useCallback(async (c: Category) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from("categories").insert(mapCategoryToDb(c));
    if (error) { console.error("Failed to add category:", error); return; }
    setCategories((prev) => [...prev, c]);
  }, []);

  const updateCategory = useCallback(async (slug: CategorySlug, data: Partial<Category>) => {
    if (!isSupabaseConfigured) return;
    const dbData: any = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.icon !== undefined) dbData.icon = data.icon;
    if (data.image !== undefined) dbData.image = data.image;

    const { error } = await supabase.from("categories").update(dbData).eq("slug", slug);
    if (error) { console.error("Failed to update category:", error); return; }
    setCategories((prev) => prev.map((c) => (c.slug === slug ? { ...c, ...data } : c)));
  }, []);

  const deleteCategory = useCallback(async (slug: CategorySlug) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from("categories").delete().eq("slug", slug);
    if (error) { console.error("Failed to delete category:", error); return; }
    setCategories((prev) => prev.filter((c) => c.slug !== slug));
  }, []);

  const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };

  const updateOrderStatus = useCallback(async (id: string, status: Order["status"], note?: string) => {
    if (!isSupabaseConfigured) return { success: false, error: "Supabase not configured" };

    const { data: sessionData } = await supabase.auth.getSession();
    const adminUserId = sessionData?.session?.user?.id || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: rpcError } = await (supabase as any).rpc("update_order_status", {
      p_order_id: id,
      p_new_status: status,
      p_created_by: adminUserId,
      p_note: note || "",
    });

    // RPC succeeded
    if (!rpcError && data) {
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        return { success: false, error: result.error || "Invalid status transition" };
      }
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      return { success: true };
    }

    // Fallback: RPC not available — do client-side validation + direct update
    console.warn("RPC not available, using client-side fallback:", rpcError?.message);

    const currentOrder = orders.find((o) => o.id === id);
    if (!currentOrder) return { success: false, error: "Order not found" };

    const allowed = VALID_TRANSITIONS[currentOrder.status] || [];
    if (!allowed.includes(status)) {
      return { success: false, error: `Cannot change from ${currentOrder.status} to ${status}` };
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("order_number", id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    const { data: orderRow } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", id)
      .single();

    if (orderRow) {
      const orderId = (orderRow as Record<string, unknown>).id as string;
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status,
        note: note || "",
        created_by: adminUserId,
      });
    }

    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    return { success: true };
  }, [orders]);

  const getOrderStatusHistory = useCallback(async (orderId: string): Promise<StatusHistoryEntry[]> => {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch status history:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row["id"] as string,
      order_id: row["order_id"] as string,
      status: row["status"] as string,
      note: (row["note"] as string) || "",
      created_by: (row["created_by"] as string) || null,
      created_at: row["created_at"] as string,
    }));
  }, []);

  const getValidNextStatuses = useCallback((currentStatus: Order["status"]): Order["status"][] => {
    const transitions: Record<string, string[]> = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };
    return (transitions[currentStatus] || []) as Order["status"][];
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
      getOrderStatusHistory,
      getValidNextStatuses,
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
    }),
    [products, categories, orders],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
