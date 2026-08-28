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

export const categories: Category[] = [
  { slug: "grocery", name: "মুদি", icon: "🛒", image: grocery },
  { slug: "rice-dal", name: "চাল ও ডাল", icon: "🌾", image: rice },
  { slug: "oil", name: "তেল", icon: "🫗", image: oil },
  { slug: "drinks", name: "পানীয়", icon: "🥤", image: drink },
  { slug: "snacks", name: "নাস্তা", icon: "🍪", image: snack },
  { slug: "clothing", name: "পোশাক", icon: "👕", image: cloth },
  { slug: "electronics", name: "ইলেকট্রনিক্স", icon: "🎧", image: electronics },
  { slug: "others", name: "অন্যান্য", icon: "🧺", image: other },
];

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
  image?: string;
  tags: ("popular" | "new" | "offer" | "featured")[];
};

const imageByCategory: Record<CategorySlug, string> = {
  grocery,
  "rice-dal": rice,
  oil,
  drinks: drink,
  snacks: snack,
  clothing: cloth,
  electronics,
  others: other,
};

export const productImage = (p: Product) => p.image || imageByCategory[p.category] || other;

export const discountPercent = (p: Product) =>
  p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

export const products: Product[] = [
  {
    id: "p-001",
    name: "প্রিমিয়াম মিনিকেট চাল ৫ কেজি",
    description: "ঝরঝরে সুগন্ধি মিনিকেট চাল, পরিবারের দৈনন্দিন রান্নার জন্য আদর্শ।",
    details: "১০০% পরিষ্কার ও পাথরমুক্ত। আধুনিক অটো মিলে প্রসেস করা, বায়ুরোধী প্যাকেটে সরবরাহ।",
    category: "rice-dal",
    price: 420,
    oldPrice: 520,
    rating: 4.7,
    reviews: 218,
    stock: 42,
    unit: "৫ কেজি",
    brand: "Shobuj Ghor",
    tags: ["popular", "offer", "featured"],
  },
  {
    id: "p-002",
    name: "মসুর ডাল (দেশি) ১ কেজি",
    description: "ছোট দানার দেশি মসুর ডাল, দ্রুত সিদ্ধ হয় এবং স্বাদে অতুলনীয়।",
    details: "হাতে বাছাই করা, কোনো রঙ বা কেমিক্যাল মেশানো নেই।",
    category: "rice-dal",
    price: 132,
    oldPrice: 150,
    rating: 4.5,
    reviews: 96,
    stock: 120,
    unit: "১ কেজি",
    brand: "Shobuj Ghor",
    tags: ["popular"],
  },
  {
    id: "p-003",
    name: "সয়াবিন তেল ২ লিটার বোতল",
    description: "ফর্টিফায়েড ভিটামিন-এ সমৃদ্ধ পরিশোধিত সয়াবিন তেল।",
    details: "রান্নায় কম শোষণ হয়, স্বাস্থ্যকর হৃদবান্ধব ফর্মুলা।",
    category: "oil",
    price: 355,
    oldPrice: 400,
    rating: 4.6,
    reviews: 341,
    stock: 60,
    unit: "২ লিটার",
    brand: "Fresh Fields",
    tags: ["popular", "offer"],
  },
  {
    id: "p-004",
    name: "সরিষার তেল (ঘানি ভাঙা) ৫০০ মিলি",
    description: "ঝাঁঝালো ঘানি ভাঙা খাঁটি সরিষার তেল, ভর্তা ও আচারের জন্য।",
    details: "কোল্ড প্রেসড, প্রিজারভেটিভমুক্ত। কাচের বোতলে সরবরাহ।",
    category: "oil",
    price: 245,
    oldPrice: 290,
    rating: 4.8,
    reviews: 74,
    stock: 25,
    unit: "৫০০ মিলি",
    brand: "Ghani Pure",
    tags: ["new", "featured"],
  },
  {
    id: "p-005",
    name: "চিনিগুঁড়া পোলাও চাল ২ কেজি",
    description: "সুগন্ধি চিনিগুঁড়া চাল, উৎসবের পোলাও ও বিরিয়ানির জন্য।",
    details: "দিনাজপুরের নির্বাচিত চাল, প্রাকৃতিক সুবাস অটুট।",
    category: "rice-dal",
    price: 298,
    oldPrice: 340,
    rating: 4.6,
    reviews: 58,
    stock: 0,
    unit: "২ কেজি",
    brand: "Shobuj Ghor",
    tags: ["new"],
  },
  {
    id: "p-006",
    name: "গুঁড়া দুধ ৫০০ গ্রাম",
    description: "ইনস্ট্যান্ট ফুল ক্রিম মিল্ক পাউডার, চা ও মিষ্টি তৈরিতে দারুণ।",
    details: "সহজে গুলে যায়, ক্যালসিয়াম ও ভিটামিন সমৃদ্ধ।",
    category: "grocery",
    price: 410,
    oldPrice: 460,
    rating: 4.4,
    reviews: 187,
    stock: 33,
    unit: "৫০০ গ্রাম",
    brand: "DailyMilk",
    tags: ["popular"],
  },
  {
    id: "p-007",
    name: "হলুদ গুঁড়া ২০০ গ্রাম",
    description: "খাঁটি হলুদ গুঁড়া, রঙ ও ঘ্রাণে সেরা।",
    details: "ভেজালমুক্ত, ল্যাব টেস্টেড মসলা।",
    category: "grocery",
    price: 78,
    oldPrice: 95,
    rating: 4.3,
    reviews: 65,
    stock: 200,
    unit: "২০০ গ্রাম",
    brand: "Moshla Bari",
    tags: ["offer"],
  },
  {
    id: "p-008",
    name: "মিক্সড মসলা কম্বো প্যাক",
    description: "মরিচ, ধনিয়া, জিরা ও গরম মসলার সাশ্রয়ী কম্বো।",
    details: "৪টি আলাদা এয়ারটাইট প্যাকেট, প্রতিটি ২০০ গ্রাম।",
    category: "grocery",
    price: 465,
    oldPrice: 580,
    rating: 4.5,
    reviews: 41,
    stock: 18,
    unit: "কম্বো",
    brand: "Moshla Bari",
    tags: ["offer", "featured"],
  },
  {
    id: "p-009",
    name: "অরেঞ্জ ফ্লেভার জুস ১ লিটার",
    description: "প্রাকৃতিক কমলার স্বাদে ঠান্ডা রিফ্রেশিং জুস।",
    details: "কৃত্রিম রঙমুক্ত, ভিটামিন-সি যুক্ত।",
    category: "drinks",
    price: 115,
    oldPrice: 135,
    rating: 4.2,
    reviews: 132,
    stock: 88,
    unit: "১ লিটার",
    brand: "FruitUp",
    tags: ["popular", "offer"],
  },
  {
    id: "p-010",
    name: "গ্রিন টি ব্যাগ (২৫ পিস)",
    description: "হালকা সুবাসের গ্রিন টি, প্রতিদিনের সতেজতার জন্য।",
    details: "শতভাগ প্রাকৃতিক পাতা, চিনি ছাড়া পান করার উপযোগী।",
    category: "drinks",
    price: 190,
    oldPrice: 220,
    rating: 4.6,
    reviews: 77,
    stock: 47,
    unit: "২৫ পিস",
    brand: "Hill Leaf",
    tags: ["new"],
  },
  {
    id: "p-011",
    name: "স্পার্কলিং লেমন ড্রিংক ৫০০ মিলি × ৪",
    description: "লেবুর ঝাঁঝালো স্বাদে কার্বনেটেড কোমল পানীয়।",
    details: "৪ বোতলের ফ্যামিলি প্যাক, ঠান্ডা পরিবেশন করুন।",
    category: "drinks",
    price: 220,
    oldPrice: 260,
    rating: 4.1,
    reviews: 54,
    stock: 65,
    unit: "৪ × ৫০০ মিলি",
    brand: "FizzCo",
    tags: ["offer"],
  },
  {
    id: "p-012",
    name: "ক্রিম বিস্কুট ফ্যামিলি প্যাক",
    description: "মুচমুচে বিস্কুটের ভেতরে ভ্যানিলা ক্রিম, নাস্তার সঙ্গী।",
    details: "৬টি মিনি প্যাক একসাথে, বাচ্চাদের টিফিনের জন্য উপযোগী।",
    category: "snacks",
    price: 145,
    oldPrice: 170,
    rating: 4.4,
    reviews: 209,
    stock: 140,
    unit: "৬ প্যাক",
    brand: "Crunchy",
    tags: ["popular", "offer"],
  },
  {
    id: "p-013",
    name: "পটেটো চিপস (সল্টেড) ১০০ গ্রাম",
    description: "পাতলা করে কাটা আলুর মুচমুচে চিপস।",
    details: "নাইট্রোজেন ফ্লাশড প্যাক, দীর্ঘ সময় ক্রিসপি থাকে।",
    category: "snacks",
    price: 60,
    oldPrice: 75,
    rating: 4.0,
    reviews: 158,
    stock: 210,
    unit: "১০০ গ্রাম",
    brand: "Crunchy",
    tags: ["popular"],
  },
  {
    id: "p-014",
    name: "রোস্টেড কাজু বাদাম ২৫০ গ্রাম",
    description: "হালকা লবণে রোস্ট করা প্রিমিয়াম কাজু বাদাম।",
    details: "গ্রেড W320 কাজু, রিসিলেবল পাউচে।",
    category: "snacks",
    price: 520,
    oldPrice: 640,
    rating: 4.7,
    reviews: 63,
    stock: 22,
    unit: "২৫০ গ্রাম",
    brand: "NutHouse",
    tags: ["featured", "new"],
  },
  {
    id: "p-015",
    name: "সুতি পাঞ্জাবি (স্লিম ফিট)",
    description: "আরামদায়ক সুতি কাপড়ের এমব্রয়ডারি করা পাঞ্জাবি।",
    details: "সাইজ: M, L, XL, XXL। রঙ পাকা, মেশিন ওয়াশ উপযোগী।",
    category: "clothing",
    price: 1290,
    oldPrice: 1790,
    rating: 4.5,
    reviews: 88,
    stock: 14,
    unit: "১ পিস",
    brand: "Rong Bangla",
    tags: ["featured", "offer"],
  },
  {
    id: "p-016",
    name: "ফরমাল কটন শার্ট",
    description: "অফিস ও দৈনন্দিন ব্যবহারের জন্য ক্লাসিক সাদা শার্ট।",
    details: "প্রিমিয়াম কটন, রিঙ্কেল রেজিস্ট্যান্ট ফিনিশ।",
    category: "clothing",
    price: 980,
    oldPrice: 1250,
    rating: 4.3,
    reviews: 47,
    stock: 30,
    unit: "১ পিস",
    brand: "Rong Bangla",
    tags: ["new"],
  },
  {
    id: "p-017",
    name: "সুতি থ্রি-পিস সেট",
    description: "হালকা নকশার আরামদায়ক সুতি থ্রি-পিস।",
    details: "আনস্টিচড, ওড়না ও সালোয়ারসহ সম্পূর্ণ সেট।",
    category: "clothing",
    price: 1650,
    oldPrice: 2100,
    rating: 4.6,
    reviews: 39,
    stock: 0,
    unit: "১ সেট",
    brand: "Rong Bangla",
    tags: ["offer"],
  },
  {
    id: "p-018",
    name: "ওয়্যারলেস ইয়ারবাডস TWS",
    description: "ব্লুটুথ ৫.৩, ৩০ ঘণ্টা ব্যাকআপসহ ইয়ারবাডস।",
    details: "টাচ কন্ট্রোল, ENC কল নয়েজ রিডাকশন, টাইপ-সি চার্জিং।",
    category: "electronics",
    price: 1790,
    oldPrice: 2490,
    rating: 4.4,
    reviews: 276,
    stock: 26,
    unit: "১ পিস",
    brand: "SoundOne",
    tags: ["popular", "offer", "featured"],
  },
  {
    id: "p-019",
    name: "ইলেকট্রিক কেটলি ১.৮ লিটার",
    description: "দ্রুত পানি গরম করার স্টেইনলেস স্টিল কেটলি।",
    details: "অটো শাট-অফ, ড্রাই বয়েল প্রোটেকশন, ১৫০০ ওয়াট।",
    category: "electronics",
    price: 1450,
    oldPrice: 1850,
    rating: 4.5,
    reviews: 121,
    stock: 19,
    unit: "১ পিস",
    brand: "HomeTech",
    tags: ["popular"],
  },
  {
    id: "p-020",
    name: "মিনি রিচার্জেবল ফ্যান",
    description: "লোডশেডিংয়ে ভরসা, ৬ ঘণ্টা ব্যাকআপের পোর্টেবল ফ্যান।",
    details: "৩ স্পিড মোড, LED লাইট সহ, টাইপ-সি চার্জ।",
    category: "electronics",
    price: 1150,
    oldPrice: 1500,
    rating: 4.2,
    reviews: 93,
    stock: 40,
    unit: "১ পিস",
    brand: "HomeTech",
    tags: ["new", "offer"],
  },
  {
    id: "p-021",
    name: "ফ্লোর ক্লিনার ১ লিটার",
    description: "সুগন্ধি ফ্লোর ক্লিনার, জীবাণু দূর করে ৯৯.৯%।",
    details: "টাইলস, মোজাইক ও মার্বেল ফ্লোরে ব্যবহারযোগ্য।",
    category: "others",
    price: 210,
    oldPrice: 250,
    rating: 4.3,
    reviews: 84,
    stock: 75,
    unit: "১ লিটার",
    brand: "CleanPro",
    tags: ["popular"],
  },
  {
    id: "p-022",
    name: "হ্যান্ডওয়াশ রিফিল ৯০০ মিলি",
    description: "মাইল্ড ফর্মুলার হ্যান্ডওয়াশ, ত্বকে কোমল।",
    details: "গ্লিসারিন সমৃদ্ধ, সাশ্রয়ী রিফিল প্যাক।",
    category: "others",
    price: 175,
    oldPrice: 215,
    rating: 4.4,
    reviews: 112,
    stock: 90,
    unit: "৯০০ মিলি",
    brand: "CleanPro",
    tags: ["offer"],
  },
  {
    id: "p-023",
    name: "মাইক্রোফাইবার ক্লিনিং টাওয়েল (৩ পিস)",
    description: "দ্রুত পানি শোষণ করে, দাগ ছাড়া পরিষ্কার করে।",
    details: "রান্নাঘর, গাড়ি ও কাচ পরিষ্কারে ব্যবহারযোগ্য।",
    category: "others",
    price: 320,
    oldPrice: 420,
    rating: 4.1,
    reviews: 36,
    stock: 55,
    unit: "৩ পিস",
    brand: "CleanPro",
    tags: ["new"],
  },
  {
    id: "p-024",
    name: "আটা (চাক্কি ফ্রেশ) ২ কেজি",
    description: "নরম রুটির জন্য চাক্কি ভাঙা তাজা আটা।",
    details: "১০০% গম, ফাইবার সমৃদ্ধ, প্রিজারভেটিভমুক্ত।",
    category: "grocery",
    price: 128,
    oldPrice: 145,
    rating: 4.5,
    reviews: 143,
    stock: 110,
    unit: "২ কেজি",
    brand: "Fresh Fields",
    tags: ["popular", "featured"],
  },
];

export const productCountByCategory = (slug: CategorySlug) =>
  products.filter((p) => p.category === slug).length;

export const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name ?? "সব ক্যাটাগরি";

export const byTag = (tag: Product["tags"][number], limit?: number) => {
  const list = products.filter((p) => p.tags.includes(tag));
  return limit ? list.slice(0, limit) : list;
};

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const relatedProducts = (p: Product, limit = 4) =>
  products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, limit);

export const searchProducts = (query: string, list: Product[] = products) => {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.details.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      categoryName(p.category).toLowerCase().includes(q),
  );
};
