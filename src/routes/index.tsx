import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  Truck,
  Shield,
  Headphones,
  Tag,
  Zap,
  Clock,
} from "lucide-react";
import { useShop } from "@/lib/shop-store";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGrid, SectionHeading } from "@/components/shop/ProductGrid";
import { toBnNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const heroSlides = [
  {
    tagline: "বিশেষ অফার",
    title: "নিত্যপ্রয়োজনীয় পণ্য",
    subtitle: "সেরা দামে, দ্রুত ডেলিভারি",
    cta: "এখনই কেনাকাটা করুন",
    discount: "৩০%",
    bg: "from-emerald-600 to-teal-700",
  },
  {
    tagline: "নতুন সংগ্রহ",
    title: "প্রিমিয়াম চাল ও ডাল",
    subtitle: "ঘরে বসে সরাসরি অর্ডার করুন",
    cta: "এখনই কেনাকাটা করুন",
    discount: "২৫%",
    bg: "from-amber-600 to-orange-700",
  },
  {
    tagline: "ফ্যামিলি প্যাক",
    title: "ইলেকট্রনিক্স সেল",
    subtitle: "সব ইলেকট্রনিক্স আইটেমে ভারি ছাড়",
    cta: "এখনই কেনাকাটা করুন",
    discount: "৪০%",
    bg: "from-blue-600 to-indigo-700",
  },
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % heroSlides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = heroSlides[current]!;

  return (
    <section className="relative overflow-hidden">
      <div
        className={cn(
          "flex min-h-[240px] items-center bg-gradient-to-r py-8 sm:min-h-[320px] md:min-h-[380px]",
          slide.bg,
        )}
      >
        <div className="container-page grid items-center gap-6 md:grid-cols-2">
          <div className="space-y-4 text-white animate-fade-up">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur">
              {slide.tagline}
            </span>
            <h1 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
              {slide.title}
            </h1>
            <p className="max-w-md text-sm text-white/85 sm:text-base">{slide.subtitle}</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-900 shadow-lg transition hover:shadow-xl hover:scale-105"
            >
              {slide.cta}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative hidden md:flex md:justify-center">
            <div className="flex size-48 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm lg:size-64">
              <div className="text-center">
                <span className="block font-display text-4xl font-extrabold lg:text-5xl">
                  {slide.discount}
                </span>
                <span className="mt-1 block text-base font-bold text-white/80">ছাড় পাচ্ছেন</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`ব্যানার ${toBnNumber(i + 1)}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/50",
            )}
          />
        ))}
      </div>
    </section>
  );
}

function TrustBadges() {
  const badges = [
    { icon: Truck, title: "ফ্রি ডেলিভারি", desc: "৳৫০০+ অর্ডারে" },
    { icon: Shield, title: "নিরাপদ পেমেন্ট", desc: "১০০% নিরাপত্তা" },
    { icon: Headphones, title: "২৪/৭ সাপোর্ট", desc: "হটলাইনে কল করুন" },
    { icon: Tag, title: "সেরা দাম", desc: "হোলসেল মূল্য" },
  ];

  return (
    <section className="container-page -mt-6 relative z-20">
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
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 sm:grid sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/products"
            search={{ category: c.slug }}
            className="group flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-soft transition hover:-translate-y-0.5 hover:border-primary hover:shadow-hover sm:shrink sm:p-4"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-surface text-2xl transition group-hover:bg-primary/10 group-hover:scale-110 sm:size-16">
              {c.icon}
            </span>
            <span className="text-[11px] font-bold sm:text-xs">{c.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {toBnNumber(products.filter(p => p.category === c.slug).length)}টি
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 32, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="container-page mt-12">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-4 text-white shadow-lg sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Zap className="size-6" />
            </span>
            <div>
              <h2 className="font-display text-lg font-extrabold sm:text-xl">ফ্ল্যাশ সেল!</h2>
              <p className="mt-0.5 text-xs text-white/80">
                সীমিত সময়ের জন্য সর্বোচ্চ ৪০% পর্যন্ত ছাড়
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-4 text-white/70" />
            <div className="flex items-center gap-1">
              <span className="flex size-10 items-center justify-center rounded-lg bg-white/20 font-display text-lg font-extrabold backdrop-blur-sm">
                {pad(timeLeft.hours)}
              </span>
              <span className="text-sm font-bold">:</span>
              <span className="flex size-10 items-center justify-center rounded-lg bg-white/20 font-display text-lg font-extrabold backdrop-blur-sm">
                {pad(timeLeft.minutes)}
              </span>
              <span className="text-sm font-bold">:</span>
              <span className="flex size-10 items-center justify-center rounded-lg bg-white/20 font-display text-lg font-extrabold backdrop-blur-sm">
                {pad(timeLeft.seconds)}
              </span>
            </div>
          </div>

          <Link
            to="/offers"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-bold text-rose-600 shadow-lg transition hover:shadow-xl hover:scale-105"
          >
            সব অফার দেখুন
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function OffersSection({ products }: { products: any[] }) {
  const offers = products.filter(p => p.tags.includes("offer")).slice(0, 8);
  if (!offers.length) return null;

  return (
    <section className="container-page mt-12">
      <SectionHeading
        title="বিশেষ অফার"
        subtitle="সীমিত সময়ের জন্য বিশেষ মূল্যে"
        viewAll={{ to: "/offers" }}
      />
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
            🔥 আজকের বিশেষ অফার
          </span>
          <span className="text-xs text-muted-foreground">নির্বাচিত পণ্যে ৩০% পর্যন্ত ছাড়</span>
        </div>
        <ProductGrid products={offers} />
      </div>
    </section>
  );
}

function PopularSection({ products }: { products: any[] }) {
  const popular = products.filter(p => p.tags.includes("popular")).slice(0, 8);
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
  const newItems = products.filter(p => p.tags.includes("new")).slice(0, 8);
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
  const featured = products.filter(p => p.tags.includes("featured")).slice(0, 8);
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
  const bestSellers = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 8);

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
      <HeroBanner />
      <TrustBadges />
      <CategorySection categories={categories} products={products} />
      <FlashSaleBanner />
      <PopularSection products={products} />
      <NewArrivalsSection products={products} />
      <OffersSection products={products} />
      <FeaturedSection products={products} />
      <BestSellersSection products={products} />
    </div>
  );
}
