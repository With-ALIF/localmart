import grocery from "@/assets/p-grocery.jpg";
import rice from "@/assets/p-rice.jpg";
import oil from "@/assets/p-oil.jpg";
import drink from "@/assets/p-drink.jpg";
import snack from "@/assets/p-snack.jpg";
import cloth from "@/assets/p-cloth.jpg";
import electronics from "@/assets/p-electronics.jpg";
import other from "@/assets/p-other.jpg";

export type CategorySlug = string;

export type Category = {
  slug: CategorySlug;
  name: string;
  icon: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  details: string;
  category: CategorySlug;
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

const imageByCategory: Record<string, string> = {
  grocery,
  fruits: grocery,
  vegetables: rice,
  "rice-dal": rice,
  oil,
  drinks: drink,
  beverages: drink,
  snacks: snack,
  clothing: cloth,
  electronics,
  others: other,
  fish: other,
  meat: other,
  dairy: other,
  bakery: snack,
  household: other,
};

export const productImage = (p: Product) => p.image || imageByCategory[p.category] || other;

export const discountPercent = (p: Product) =>
  p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

export const categoryName = (slug: string, cats?: Category[]) =>
  cats?.find((c) => c.slug === slug)?.name ?? slug;

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
