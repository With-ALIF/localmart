import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useShop } from "@/lib/shop-store";
import { products, productImage, discountPercent } from "@/data/catalog";
import { formatTaka, toBnNumber } from "@/lib/format";

function WishlistPage() {
  const { wishlist, toggleWishlist, removeFromWishlist, addToCart, wishlistCount } = useShop();

  const wishlistProducts = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  if (wishlistProducts.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-surface text-muted-foreground">
          <Heart className="size-9" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-extrabold">উইশলিস্ট খালি</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          আপনি এখনো কোনো পণ্য উইশলিস্টে যোগ করেননি। পণ্যের হৃদয় আইকনে ক্লিক করে উইশলিস্টে যোগ করুন।
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          পণ্য দেখুন
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">উইশলিস্ট</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {toBnNumber(wishlistCount)}টি পণ্য উইশলিস্টে আছে
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {wishlistProducts.map((product) => {
          const off = discountPercent(product);
          const img = productImage(product);
          const inStock = product.stock > 0;

          return (
            <article
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
            >
              <Link
                to="/product/$productId"
                params={{ productId: product.id }}
                className="relative block overflow-hidden bg-surface"
              >
                <img
                  src={img}
                  alt={product.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                />
                {off > 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground">
                    -{toBnNumber(off)}%
                  </span>
                )}
              </Link>

              <button
                onClick={() => {
                  removeFromWishlist(product.id);
                  toast.success("উইশলিস্ট থেকে সরানো হয়েছে");
                }}
                aria-label="উইশলিস্ট থেকে সরান"
                className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-destructive bg-card/90 text-destructive backdrop-blur transition hover:scale-110"
              >
                <Trash2 className="size-4" />
              </button>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <Link to="/product/$productId" params={{ productId: product.id }}>
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug transition group-hover:text-primary">
                    {product.name}
                  </h3>
                </Link>

                <div className="mt-auto flex items-end gap-2">
                  <span className="font-display text-lg font-extrabold text-primary">
                    {formatTaka(product.price)}
                  </span>
                  {product.oldPrice > product.price && (
                    <span className="pb-0.5 text-xs text-muted-foreground line-through">
                      {formatTaka(product.oldPrice)}
                    </span>
                  )}
                </div>

                <button
                  disabled={!inStock}
                  onClick={() => {
                    addToCart(product.id);
                    removeFromWishlist(product.id);
                    toast.success("কার্টে যোগ হয়েছে", {
                      description: `${product.name} — উইশলিস্ট থেকে সরানো হয়েছে`,
                    });
                  }}
                  className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                >
                  <ShoppingCart className="size-4" />
                  কার্টে সরান
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
});
