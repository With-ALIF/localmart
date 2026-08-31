import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  Shield,
  Headphones,
  Tag,
} from "lucide-react";
import { useShop } from "@/lib/shop-store";
import { ProductGrid, SectionHeading } from "@/components/shop/ProductGrid";
import { toBnNumber } from "@/lib/format";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function TrustBadges() {
  const badges = [
    { icon: Truck, title: "ফ্রি ডেলিভারি", desc: "৳৫০০+ অর্ডারে" },
    { icon: Shield, title: "নিরাপদ পেমেন্ট", desc: "১০০% নিরাপত্তা" },
    { icon: Headphones, title: "২৪/৭ সাপোর্ট", desc: "হটলাইনে কল করুন" },
    { icon: Tag, title: "সেরা দাম", desc: "হোলসেল মূল্য" },
  ];

  return (
    <section className="container-page mt-4 sm:mt-6 relative z-20">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-3 shadow-card sm:grid-cols-4 sm:p-5">
        {badges.map((b) => (
          <div key={b.title} className="flex items-center gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <b.icon className="size-4.5" />
            </span>
            <div>
              <p className="text-[11px] font-bold sm:text-xs">{b.title}</p>
              <p className="text-[10px] text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategorySection({ categories, products }: { categories: any[]; products: any[] }) {
  return (
    <section className="container-page mt-10">
      <SectionHeading
        title="ক্যাটাগরি"
        subtitle="সব ক্যাটাগরি ব্রাউজ করুন"
        viewAll={{ to: "/categories" }}
      />
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 sm:grid sm:grid-cols-5">
        {categories.slice(0, 5).map((c) => (
          <Link
            key={c.id}
            to="/products"
            search={{ category: c.slug }}
            className="group flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-soft transition hover:-translate-y-0.5 hover:border-primary hover:shadow-hover sm:shrink sm:p-4"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-surface text-2xl transition group-hover:bg-primary/10 group-hover:scale-110 sm:size-16">
              {c.icon}
            </span>
            <span className="text-[11px] font-bold sm:text-xs">{c.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {toBnNumber(products.filter(p => p.category === c.id).length)}টি
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PopularSection({ products }: { products: any[] }) {
  const popular = products.filter(p => p.tags.includes("popular")).slice(0, 4);
  if (!popular.length) return null;

  return (
    <section className="container-page mt-12">
      <SectionHeading
        title="জনপ্রিয় পণ্য"
        subtitle="গ্রাহকদের পছন্দের পণ্য"
        viewAll={{ to: "/products" }}
      />
      <ProductGrid products={popular} />
    </section>
  );
}

function NewArrivalsSection({ products }: { products: any[] }) {
  const newItems = products.filter(p => p.tags.includes("new")).slice(0, 4);
  if (!newItems.length) return null;

  return (
    <section className="container-page mt-12">
      <SectionHeading
        title="নতুন এসেছে"
        subtitle="সদ্য যোগ করা পণ্য"
        viewAll={{ to: "/products", search: { sort: "new" } }}
      />
      <ProductGrid products={newItems} />
    </section>
  );
}

function FeaturedSection({ products }: { products: any[] }) {
  const featured = products.filter(p => p.tags.includes("featured")).slice(0, 4);
  if (!featured.length) return null;

  return (
    <section className="container-page mt-12">
      <SectionHeading
        title="বৈশিষ্ট্যযুক্ত পণ্য"
        subtitle="আমাদের সেরা পণ্য"
        viewAll={{ to: "/products" }}
      />
      <ProductGrid products={featured} />
    </section>
  );
}

function BestSellersSection({ products }: { products: any[] }) {
  const bestSellers = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4);

  return (
    <section className="container-page mt-12">
      <SectionHeading
        title="সর্বাধিক বিক্রিত"
        subtitle="গ্রাহকদের সবচেয়ে পছন্দের পণ্য"
        viewAll={{ to: "/products" }}
      />
      <ProductGrid products={bestSellers} />
    </section>
  );
}

function HomePage() {
  const { products, categories, loading } = useShop();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-20 md:pb-0">
      <TrustBadges />
      <CategorySection categories={categories} products={products} />
      <PopularSection products={products} />
      <NewArrivalsSection products={products} />
      <FeaturedSection products={products} />
      <BestSellersSection products={products} />
    </div>
  );
}
