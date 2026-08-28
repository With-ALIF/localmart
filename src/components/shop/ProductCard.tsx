import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ShoppingCart, Zap, Star, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { discountPercent, productImage, type Product } from "@/data/catalog";
import { formatTaka, toBnNumber } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartState, setCartState] = useState<"idle" | "loading" | "added">("idle");
  const off = discountPercent(product);
  const wished = isWishlisted(product.id);
  const inStock = product.stock > 0;
  const isNew = product.tags.includes("new");

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-hover">
      <Link
        to="/product/$productId"
        params={{ productId: product.id }}
        className="relative block overflow-hidden bg-white p-3 pb-0"
      >
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          width={400}
          height={300}
          className="aspect-[4/3] w-full rounded-xl object-contain transition duration-500 group-hover:scale-105"
        />
        {off > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-lg bg-destructive px-2 py-0.5 text-[10px] font-bold leading-tight text-destructive-foreground">
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
          wished && "border-destructive bg-destructive/10 text-destructive animate-in zoom-in-75",
        )}
      >
        <Heart className={cn("size-4 transition-all", wished && "fill-current scale-110")} />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-3 pt-2.5">
        <Link to="/product/$productId" params={{ productId: product.id }}>
          <h3 className="line-clamp-1 text-[13px] font-bold leading-snug transition group-hover:text-primary">
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

        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-[11px] font-semibold",
              inStock ? "text-success" : "text-destructive",
            )}
          >
            {inStock
              ? `স্টকে আছে ${toBnNumber(product.stock)}টি`
              : "স্টকে নেই"}
          </span>
          <span className="text-[11px] text-muted-foreground">{product.unit}</span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-1.5">
          <button
            disabled={!inStock || cartState !== "idle"}
            onClick={() => {
              setCartState("loading");
              addToCart(product.id);
              setTimeout(() => setCartState("added"), 300);
              setTimeout(() => {
                setCartState("idle");
                toast.success("কার্টে যোগ হয়েছে", { description: product.name });
              }, 1200);
            }}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
              cartState === "added"
                ? "bg-green-600 text-white"
                : "bg-primary text-primary-foreground hover:opacity-90",
            )}
          >
            {cartState === "loading" ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : cartState === "added" ? (
              <Check className="size-3.5" />
            ) : (
              <ShoppingCart className="size-3.5" />
            )}
            {cartState === "loading"
              ? "যোগ হচ্ছে..."
              : cartState === "added"
                ? "যোগ হয়েছে!"
                : "কার্টে যোগ"}
          </button>
          {user && (
            <button
              disabled={!inStock}
              onClick={() => {
                addToCart(product.id);
                navigate({ to: "/checkout" });
              }}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-green-600 text-xs font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <Zap className="size-3" />
              বাই নাও
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
