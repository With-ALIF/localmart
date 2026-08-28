export type POSCartProduct = {
  productId: string;
  name: string;
  price: number;
  stock: number;
  qty: number;
  unit: string;
  image?: string;
};

export type POSPaymentMethod = "cash" | "bkash" | "nagad" | "rocket" | "card" | "other";
export type POSPaymentStatus = "paid" | "partial" | "due";

export type POSSale = {
  id: string;
  saleNumber: string;
  customerName: string;
  customerPhone: string;
  items: POSCartProduct[];
  subtotal: number;
  discountType: "fixed" | "percentage";
  discountValue: number;
  discountAmount: number;
  total: number;
  paymentMethod: POSPaymentMethod;
  paymentStatus: POSPaymentStatus;
  paidAmount: number;
  dueAmount: number;
  adminName: string;
  date: string;
  time: string;
  createdAt: string;
  source: "pos";
};

export const POS_SALES_KEY = "patgram_pos_sales";
export const POS_CART_KEY = "patgram_pos_cart";

export const paymentMethodLabels: Record<POSPaymentMethod, string> = {
  cash: "Cash",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  card: "Card",
  other: "Other",
};

export const paymentStatusLabels: Record<POSPaymentStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  due: "Due",
};
