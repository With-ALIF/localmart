import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function getYYMM(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${yy}${mm}`;
}

function getPrefix(orderSource: "pos" | "online"): string {
  return orderSource === "pos" ? "POS" : "ORD";
}

export async function generateOrderNumber(
  orderSource: "pos" | "online"
): Promise<string> {
  const now = new Date();
  const prefix = getPrefix(orderSource);
  const yymm = getYYMM(now);
  const pattern = `${prefix}-${yymm}-%`;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("orders")
      .select("order_number")
      .like("order_number", pattern)
      .order("order_number", { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextSerial = 1;
    if (data && data.length > 0) {
      const last = data[0].order_number;
      const lastSerial = parseInt(last.split("-")[2], 10);
      if (!isNaN(lastSerial)) {
        nextSerial = lastSerial + 1;
      }
    }

    return `${prefix}-${yymm}-${String(nextSerial).padStart(4, "0")}`;
  }

  // Offline fallback: count from localStorage
  const storageKey =
    orderSource === "pos" ? "patgram_pos_sales" : "patgram_orders";
  try {
    const raw = localStorage.getItem(storageKey);
    const items: { order_number?: string; id?: string }[] = raw
      ? JSON.parse(raw)
      : [];
    const samePrefix = items.filter((item) =>
      (item.order_number || item.id || "").startsWith(`${prefix}-${yymm}-`)
    );
    const nextSerial = samePrefix.length + 1;
    return `${prefix}-${yymm}-${String(nextSerial).padStart(4, "0")}`;
  } catch {
    return `${prefix}-${yymm}-0001`;
  }
}
