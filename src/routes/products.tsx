import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  products as allProducts,
  categories,
  searchProducts,
  productImage,
  discountPercent,
  type CategorySlug,
  type Product,
} from "@/data/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { EmptyState } from "@/components/shop/ProductGrid";
import { formatTaka, toBnNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useShop } from "@/lib/shop-store";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Star, ShoppingCart, Heart, Sparkles } from "lucide-react";

type SortKey = "popular" | "new" | "price-asc" | "price-desc" | "rating";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "popular", label: "জনপ্রিয়" },
  { key: "new", label: "নতুন" },
  { key: "price-asc", label: "দাম: কম থেকে বেশি" },
  { key: "price-desc", label: "দাম: বেশি থেকে কম" },
  { key: "rating", label: "রেটিং" },
];

function sortProducts(list: ReturnType<typeof searchProducts>, sort: SortKey) {
  const sorted = [...list];
  switch (sort) {
    case "new":
      return sorted.reverse();
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "popular":
    default:
      return sorted.sort((a, b) => b.reviews - a.reviews);
  }
}

function parseSearch(search: Record<string, unknown>) {
  return {
    q: (search.q as string) || "",
    category: (search.category as CategorySlug) || ("" as CategorySlug),
    sort: (search.sort as SortKey) || "popular",
    minPrice: Number(search.minPrice) || 0,
    maxPrice: Number(search.maxPrice) || 0,
    minRating: Number(search.minRating) || 0,
    inStock: search.inStock === "true",
    page: Number(search.page) || 1,
    view: (search.view as "grid" | "list") || "grid",
  };
}

const ITEMS_PER_PAGE = 8;

function ProductListItem({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const off = discountPercent(product);
  const wished = isWishlisted(product.id);
  const inStock = product.stock > 0;
  const isNew = product.tags.includes("new");

  return (
    <article className="group relative flex overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-hover">
      <Link
        to="/product/$productId"
        params={{ productId: product.id }}
        className="relative block w-36 shrink-0 overflow-hidden bg-white p-2 sm:w-44"
      >
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full object-contain transition duration-500 group-hover:scale-105"
        />
        {off > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-lg bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
            -{toBnNumber(off)}%
          </span>
        )}
        {isNew && (
          <span className="absolute left-1.5 top-8 inline-flex items-center gap-0.5 rounded-lg bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            <Sparkles className="size-2.5" />
            নতুন
          </span>
        )}
      </Link>

      <button
        onClick={() => {
          toggleWishlist(product.id);
          toast.success(wished ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যোগ হয়েছে");
        }}
        aria-label="উইশলিস্ট"
        className={cn(
          "absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur transition-all duration-200 hover:scale-110",
          wished && "border-destructive bg-destructive/10 text-destructive",
        )}
      >
        <Heart className={cn("size-4", wished && "fill-current")} />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link to="/product/$productId" params={{ productId: product.id }}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug transition group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 rounded-md bg-warning/15 px-1.5 py-0.5 text-[11px] font-bold text-warning-foreground">
            <Star className="size-2.5 fill-current" />
            {toBnNumber(product.rating.toFixed(1))}
          </span>
          <span className="text-[11px] text-muted-foreground">({toBnNumber(product.reviews)})</span>
        </div>

        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>

        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-base font-extrabold text-primary">
            {formatTaka(product.price)}
          </span>
          {product.oldPrice > product.price && (
            <span className="text-[11px] text-muted-foreground line-through">
              {formatTaka(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className={cn("font-semibold", inStock ? "text-success" : "text-destructive")}>
            {inStock ? `স্টকে আছে (${toBnNumber(product.stock)}টি)` : "স্টকে নেই"}
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">{product.unit}</span>
        </div>

        <button
          disabled={!inStock}
          onClick={() => {
            addToCart(product.id);
            toast.success("কার্টে যোগ হয়েছে", { description: product.name });
          }}
          className="mt-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingCart className="size-3.5" />
          কার্টে যোগ করুন
        </button>
      </div>
    </article>
  );
}

function ProductsPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate();
  const params = parseSearch(searchParams);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = searchProducts(params.q);
    if (params.category) {
      list = list.filter((p) => p.category === params.category);
    }
    if (params.minPrice > 0) {
      list = list.filter((p) => p.price >= params.minPrice);
    }
    if (params.maxPrice > 0) {
      list = list.filter((p) => p.price <= params.maxPrice);
    }
    if (params.minRating > 0) {
      list = list.filter((p) => p.rating >= params.minRating);
    }
    if (params.inStock) {
      list = list.filter((p) => p.stock > 0);
    }
    return sortProducts(list, params.sort);
  }, [params]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (params.page - 1) * ITEMS_PER_PAGE,
    params.page * ITEMS_PER_PAGE,
  );

  const priceRange = useMemo(() => {
    const prices = allProducts.map((p) => p.price);
    return { min: 0, max: Math.max(...prices) };
  }, []);

  const [priceSlider, setPriceSlider] = useState<[number, number]>([
    params.minPrice || priceRange.min,
    params.maxPrice || priceRange.max,
  ]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    navigate({
      search: (prev) => {
        const next = { ...prev, ...updates };
        Object.keys(next).forEach((k) => {
          if (!next[k]) delete next[k];
        });
        return next;
      },
      replace: true,
    });
  };

  const activeFilterCount = [
    params.category,
    params.minPrice > 0,
    params.maxPrice > 0,
    params.minRating > 0,
    params.inStock,
  ].filter(Boolean).length;

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
          {params.category
            ? categories.find((c) => c.slug === params.category)?.name || "পণ্য"
            : params.q
              ? `"${params.q}" এর ফলাফল`
              : "সব পণ্য"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {toBnNumber(filtered.length)}টি পণ্য পাওয়া গেছে
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
              showFilters || activeFilterCount > 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card",
            )}
          >
            <SlidersHorizontal className="size-4" />
            ফিল্টার
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                updateParams({
                  category: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  minRating: undefined,
                  inStock: undefined,
                });
                setPriceSlider([priceRange.min, priceRange.max]);
              }}
              className="text-sm font-semibold text-destructive hover:underline"
            >
              সব ফিল্টার মুছুন
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-border bg-card">
            <button
              onClick={() => updateParams({ view: "grid" })}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition",
                params.view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="গ্রিড ভিউ"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => updateParams({ view: "list" })}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition",
                params.view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="লিস্ট ভিউ"
            >
              <List className="size-4" />
            </button>
          </div>

          <div className="relative">
            <select
              value={params.sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="appearance-none rounded-full border border-border bg-card px-4 py-2.5 pr-10 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-bold">ক্যাটাগরি</label>
              <select
                value={params.category}
                onChange={(e) => updateParams({ category: e.target.value || undefined })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">সব ক্যাটাগরি</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="mb-2 block text-xs font-bold">
                দামের পরিসীমা — {formatTaka(priceSlider[0])} থেকে {formatTaka(priceSlider[1])}
              </label>
              <Slider
                value={priceSlider}
                onValueChange={(value) => setPriceSlider(value as [number, number])}
                onValueCommit={(value) => {
                  const [min, max] = value as [number, number];
                  updateParams({
                    minPrice: min > priceRange.min ? String(min) : undefined,
                    maxPrice: max < priceRange.max ? String(max) : undefined,
                  });
                }}
                min={priceRange.min}
                max={priceRange.max}
                step={10}
                className="w-full"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>{formatTaka(priceRange.min)}</span>
                <span>{formatTaka(priceRange.max)}</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold">সর্বনিম্ন রেটিং</label>
              <select
                value={params.minRating}
                onChange={(e) => updateParams({ minRating: e.target.value || undefined })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">সব রেটিং</option>
                <option value="4.5">৪.৫ ও ততোধিক</option>
                <option value="4">৪.০ ও ততোধিক</option>
                <option value="3.5">৩.৫ ও ততোধিক</option>
                <option value="3">৩.০ ও ততোধিক</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={params.inStock}
                onChange={(e) => updateParams({ inStock: e.target.checked ? "true" : undefined })}
                className="size-4 rounded border-border accent-primary"
              />
              <span className="text-sm font-semibold">শুধুমাত্র স্টকে থাকা পণ্য</span>
            </label>
          </div>
        </div>
      )}

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            title="কোনো পণ্য পাওয়া যায়নি"
            message="আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
          />
        ) : params.view === "list" ? (
          <div className="grid gap-4">
            {paginated.map((p) => (
              <ProductListItem key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => updateParams({ page: String(Math.max(1, params.page - 1)) })}
              disabled={params.page <= 1}
              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold transition hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const show = p === 1 || p === totalPages || Math.abs(p - params.page) <= 1;
              if (!show) {
                if (p === params.page - 2 || p === params.page + 2) {
                  return (
                    <span key={p} className="px-1 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              }
              return (
                <button
                  key={p}
                  onClick={() => updateParams({ page: String(p) })}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-sm font-bold transition",
                    p === params.page
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {toBnNumber(p)}
                </button>
              );
            })}
            <button
              onClick={() => updateParams({ page: String(Math.min(totalPages, params.page + 1)) })}
              disabled={params.page >= totalPages}
              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold transition hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
    category: (search.category as string) || "",
    sort: (search.sort as string) || "popular",
    minPrice: Number(search.minPrice) || 0,
    maxPrice: Number(search.maxPrice) || 0,
    minRating: Number(search.minRating) || 0,
    inStock: (search.inStock as string) || "",
    page: Number(search.page) || 1,
    view: (search.view as string) || "grid",
  }),
});
