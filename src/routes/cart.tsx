import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useShop } from "@/lib/shop-store";
import { useAuth } from "@/lib/auth-store";
import { discountPercent, productSlug } from "@/data/catalog";
import { formatTaka, toBnNumber } from "@/lib/format";
import { ProductImage } from "@/components/shop/ProductImage";

function CartPage() {
  const {
    cartItems,
    subtotal,
    discount,
    total,
    cartCount,
    increment,
    decrement,
    removeFromCart,
    clearCart,
    categories,
  } = useShop();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-surface text-muted-foreground">
          <ShoppingBag className="size-9" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-extrabold">আপনার কার্ট খালি</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          এখনো কোনো পণ্য কার্টে যোগ করা হয়নি। আমাদের পণ্য দেখে কেনাকাটা শুরু করুন।
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          কেনাকাটা শুরু করুন
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">কার্ট</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {toBnNumber(cartCount)}টি পণ্য কার্টে আছে
          </p>
        </div>
        <button
          onClick={() => {
            clearCart();
            toast.success("কার্ট পরিষ্কার করা হয়েছে");
          }}
          className="text-sm font-semibold text-destructive hover:underline"
        >
          সব মুছুন
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map(({ product, qty }) => {
            const off = discountPercent(product);
            return (
              <div
                key={product.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5"
              >
                <Link
                  to="/product/$slug"
                  params={{ slug: productSlug(product.name) }}
                  className="relative shrink-0 overflow-hidden rounded-xl"
                >
                  <ProductImage
                    product={product}
                    categories={categories}
                    className="size-24 sm:size-28"
                    imgClassName="size-24 object-cover sm:size-28"
                  />
                  {off > 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                      -{toBnNumber(off)}%
                    </span>
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      to="/product/$slug"
                      params={{ slug: productSlug(product.name) }}
                      className="text-sm font-bold leading-snug transition hover:text-primary sm:text-base"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{product.unit}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-display text-sm font-extrabold text-primary">
                        {formatTaka(product.price)}
                      </span>
                      {product.oldPrice > product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatTaka(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-display text-lg font-extrabold text-primary">
                      {formatTaka(product.price * qty)}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-border">
                        <button
                          onClick={() => decrement(product.id)}
                          className="flex size-8 items-center justify-center transition hover:bg-secondary"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{toBnNumber(qty)}</span>
                        <button
                          onClick={() => increment(product.id)}
                          className="flex size-8 items-center justify-center transition hover:bg-secondary"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(product.id);
                          toast.success("কার্ট থেকে সরানো হয়েছে");
                        }}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-5 font-display text-lg font-extrabold">অর্ডার সারসংক্ষেপ</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  সাবটোটাল ({toBnNumber(cartCount)}টি পণ্য)
                </span>
                <span className="font-semibold">{formatTaka(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>ছাড়</span>
                  <span className="font-semibold">-{formatTaka(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>ডেলিভারি</span>
                <span className="font-semibold text-success">ফ্রি</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-base font-bold">
                  <span>মোট</span>
                  <span className="font-display text-xl text-primary">{formatTaka(total)}</span>
                </div>
              </div>
            </div>
            <Link
              to={isAuthenticated ? "/checkout" : "/login"}
              search={!isAuthenticated ? { redirect: "/checkout" } : undefined}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              চেকআউটে যান
              <ArrowRight className="size-4" />
            </Link>
            {!isAuthenticated && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                লগইন ছাড়াই কার্টে পণ্য রাখুন, চেকআউটে লগইন প্রয়োজন
              </p>
            )}
            <Link
              to="/products"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-border py-3 text-sm font-semibold transition hover:bg-secondary"
            >
              কেনাকাটা চালিয়ে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/cart")({
  component: CartPage,
});
