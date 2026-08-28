import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  ShoppingCart,
  Zap,
  Star,
  Minus,
  Plus,
  ChevronRight,
  ChevronLeft,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import {
  productImage,
  discountPercent,
  categoryName,
} from "@/data/catalog";
import { formatTaka, toBnNumber } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { useAuth } from "@/lib/auth-store";
import { ProductCard } from "@/components/shop/ProductCard";
import { cn } from "@/lib/utils";

function ProductDetailsPage() {
  const { productId } = Route.useParams();
  const { addToCart, toggleWishlist, isWishlisted, products } = useShop();
  const product = products.find(p => p.id === productId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-bold">পণ্য পাওয়া যায়নি</h1>
        <p className="mt-2 text-sm text-muted-foreground">এই পণ্যটি আর উপলব্ধ নাও হতে পারে।</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          সব পণ্য দেখুন
        </Link>
      </div>
    );
  }

  const off = discountPercent(product);
  const wished = isWishlisted(product.id);
  const inStock = product.stock > 0;
  const related = products.filter(x => x.category === product.category && x.id !== product.id).slice(0, 4);
  const img = productImage(product);

  const thumbnails = [img, img, img, img];

  return (
    <div className="container-page py-6 sm:py-8">
      <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          হোম
        </Link>
        <ChevronRight className="size-3" />
        <Link to="/products" className="hover:text-primary">
          পণ্য
        </Link>
        <ChevronRight className="size-3" />
        <Link to="/products" search={{ category: product.category }} className="hover:text-primary">
          {categoryName(product.category)}
        </Link>
        <ChevronRight className="size-3" />
        <span className="truncate font-semibold text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
            <img
              src={thumbnails[selectedImage]}
              alt={product.name}
              className="aspect-square w-full object-cover"
              width={800}
              height={800}
            />
            {off > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-destructive px-3 py-1.5 text-sm font-bold text-destructive-foreground">
                -{toBnNumber(off)}% ছাড়
              </span>
            )}

            <button
              onClick={() =>
                setSelectedImage((prev) => (prev > 0 ? prev - 1 : thumbnails.length - 1))
              }
              className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 backdrop-blur transition hover:bg-card"
              aria-label="আগের ছবি"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() =>
                setSelectedImage((prev) => (prev < thumbnails.length - 1 ? prev + 1 : 0))
              }
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 backdrop-blur transition hover:bg-card"
              aria-label="পরের ছবি"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {thumbnails.map((thumb, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "size-16 shrink-0 overflow-hidden rounded-xl border-2 transition",
                  selectedImage === i ? "border-primary" : "border-border hover:border-primary/50",
                )}
              >
                <img src={thumb} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-primary">{product.brand}</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4",
                    i < Math.round(product.rating)
                      ? "fill-warning text-warning"
                      : "fill-muted text-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-bold">{toBnNumber(product.rating.toFixed(1))}</span>
            <span className="text-sm text-muted-foreground">
              ({toBnNumber(product.reviews)} রিভিউ)
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-extrabold text-primary">
              {formatTaka(product.price)}
            </span>
            {product.oldPrice > product.price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatTaka(product.oldPrice)}
              </span>
            )}
            {off > 0 && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                {toBnNumber(off)}% ছাড়
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="flex items-center gap-3 text-sm">
            <span className={cn("font-bold", inStock ? "text-success" : "text-destructive")}>
              {inStock ? `স্টকে আছে (${toBnNumber(product.stock)}টি)` : "স্টকে নেই"}
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">ওজন: {product.unit}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">পরিমাণ:</span>
            <div className="flex items-center rounded-xl border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex size-10 items-center justify-center transition hover:bg-secondary"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold">{toBnNumber(qty)}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex size-10 items-center justify-center transition hover:bg-secondary"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              disabled={!inStock}
              onClick={() => {
                addToCart(product.id, qty);
                toast.success("কার্টে যোগ হয়েছে", { description: product.name });
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <ShoppingCart className="size-5" />
              কার্টে যোগ করুন
            </button>
            {user && (
              <button
                disabled={!inStock}
                onClick={() => {
                  addToCart(product.id, qty);
                  navigate({ to: "/checkout" });
                }}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                <Zap className="size-5" />
                বাই নাও
              </button>
            )}
            <button
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(wished ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যোগ হয়েছে");
              }}
              className={cn(
                "flex size-12 items-center justify-center rounded-xl border-2 transition",
                wished
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border text-foreground hover:border-destructive hover:text-destructive",
              )}
            >
              <Heart className={cn("size-5", wished && "fill-current")} />
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-bold">পণ্যের তথ্য</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{product.details}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "দ্রুত ডেলিভারি" },
              { icon: RotateCcw, label: "৭ দিনের রিটার্ন" },
              { icon: Shield, label: "গ্যারান্টি" },
            ].map((b) => (
              <div
                key={b.label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center"
              >
                <b.icon className="size-4 text-primary" />
                <span className="text-[11px] font-semibold">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-xl font-extrabold sm:text-2xl">সম্পর্কিত পণ্য</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export const Route = createFileRoute("/product/$productId")({
  component: ProductDetailsPage,
});
