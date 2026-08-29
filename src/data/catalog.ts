export type CategorySlug = string;

export type Category = {
  id: string;
  slug: CategorySlug;
  name: string;
  icon: string;
  image: string;
  sort_order?: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  details: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviews: number;
  stock: number;
  unit: string;
  brand: string;
  image?: string | undefined;
  tags: ("popular" | "new" | "offer" | "featured")[];
};

export const productImage = (p: Product, cats?: Category[]) => {
  if (p.image) return p.image;
  if (cats) {
    const cat = cats.find((c) => c.id === p.category);
    if (cat?.image) return cat.image;
  }
  return "";
};

export const productFallbackIcon = (p: Product, cats?: Category[]): string => {
  if (p.image) return "";
  if (cats) {
    const cat = cats.find((c) => c.id === p.category);
    if (cat?.image) return "";
    if (cat?.icon) return cat.icon;
  }
  return "";
};

const EMOJI_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

export const isEmoji = (s: string) => EMOJI_RE.test(s);

export const discountPercent = (p: Product) =>
  p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

export const categoryName = (categoryId: string, cats?: Category[]) =>
  cats?.find((c) => c.id === categoryId)?.name ?? categoryId;

export const searchProducts = (query: string, list: Product[]) => {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
  );
};

export function productSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
