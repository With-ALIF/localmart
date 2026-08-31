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
      .like("order_number", pattern);

    if (error) throw error;

    let maxSerial = 0;
    if (data && data.length > 0) {
      for (const row of data) {
        if (row.order_number) {
          const parts = row.order_number.split("-");
          const serial = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(serial) && serial > maxSerial) {
            maxSerial = serial;
          }
        }
      }
    }

    return `${prefix}-${yymm}-${String(maxSerial + 1).padStart(4, "0")}`;
  }

  // Offline fallback: count from localStorage
  const storageKey =
    orderSource === "pos" ? "patgram_pos_sales" : "patgram_orders";
  try {
    const raw = localStorage.getItem(storageKey);
    const items: { order_number?: string; id?: string }[] = raw
      ? JSON.parse(raw)
      : [];
    let maxSerial = 0;
    for (const item of items) {
      const num = item.order_number || item.id || "";
      if (num.startsWith(`${prefix}-${yymm}-`)) {
        const parts = num.split("-");
        const serial = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(serial) && serial > maxSerial) {
          maxSerial = serial;
        }
      }
    }
    return `${prefix}-${yymm}-${String(maxSerial + 1).padStart(4, "0")}`;
  } catch {
    return `${prefix}-${yymm}-0001`;
  }
}
