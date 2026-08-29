import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  LogIn,
  LogOut,
  Search,
  ShoppingCart,
  User,
  Home,
  LayoutGrid,
  Package,
  Tag,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useShop } from "@/lib/shop-store";
import { useAuth } from "@/lib/auth-store";
import { toBnNumber, formatTaka } from "@/lib/format";
import { productSlug } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { ProductImage } from "./ProductImage";

const navLinks = [
  { to: "/", label: "হোম", icon: Home },
  { to: "/categories", label: "ক্যাটাগরি", icon: LayoutGrid },
  { to: "/products", label: "সব পণ্য", icon: Package },
  { to: "/offers", label: "অফার", icon: Tag },
] as const;

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
      {toBnNumber(count)}
    </span>
  );
}

export function Header() {
  const { cartCount, wishlistCount, products, categories } = useShop();
  const { user, logout, hydrated } = useAuth();
  const [term, setTerm] = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!term.trim() || term.trim().length < 2) return [];
    return products.filter(p => p.name.toLowerCase().includes(term.toLowerCase()) || p.brand.toLowerCase().includes(term.toLowerCase())).slice(0, 5);
  }, [term, products]);

  const showSuggestions = focused && suggestions.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: term.trim() || undefined } });
    setOpen(false);
    setFocused(false);
  };

  const handleSuggestionClick = (id: string) => {
    setFocused(false);
    const product = products.find(p => p.id === id);
    if (product) {
      navigate({ to: "/product/$slug", params: { slug: productSlug(product.name) } });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-lg">
      <div className="container-page flex h-14 items-center gap-3 md:h-16 md:gap-5">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img
            src="/localmart.png"
            alt="Patgram Online Shop"
            className="h-9 w-auto object-contain sm:h-10"
          />
        </Link>

        <div ref={wrapperRef} className="hidden flex-1 md:block">
          <form onSubmit={submit} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="পণ্য খুঁজুন — চাল, তেল, ইয়ারবাডস..."
              aria-label="পণ্য অনুসন্ধান"
              className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-20 text-sm outline-none transition focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/25"
            />
            {term && (
              <button
                type="button"
                onClick={() => {
                  setTerm("");
                  inputRef.current?.focus();
                }}
                aria-label="সার্চ পরিষ্কার করুন"
                className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1 h-8 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              খুঁজুন
            </button>
          </form>

          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-card shadow-lg md:left-auto md:right-auto md:w-[calc(100%-8rem)] md:translate-x-0">
              <div className="p-2">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSuggestionClick(p.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-secondary"
                  >
                    <ProductImage
                      product={p}
                      categories={categories}
                      className="size-10 shrink-0 rounded-lg"
                      imgClassName="size-10 shrink-0 rounded-lg object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-xs font-bold text-primary">{formatTaka(p.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-border px-3 py-2">
                <button
                  onClick={submit}
                  className="w-full text-center text-xs font-semibold text-primary hover:underline"
                >
                  "{term}" দিয়ে সব ফলাফল দেখুন →
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="ml-auto flex items-center gap-1 md:gap-2">
          <Link
            to="/orders"
            aria-label="আমার অর্ডার"
            className="hidden size-9 items-center justify-center rounded-full text-foreground transition hover:bg-secondary md:flex"
          >
            <Package className="size-[18px]" />
          </Link>
          <Link
            to="/wishlist"
            aria-label="উইশলিস্ট"
            className="relative hidden size-9 items-center justify-center rounded-full text-foreground transition hover:bg-secondary md:flex"
          >
            <Heart className="size-[18px]" />
            <CountBadge count={wishlistCount} />
          </Link>
          <Link
            to="/cart"
            aria-label="কার্ট"
            className="relative flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-secondary"
          >
            <ShoppingCart className="size-[18px]" />
            <CountBadge count={cartCount} />
          </Link>
          {hydrated && user ? (
            <Link
              to="/account"
              className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-card transition hover:opacity-90 md:inline-flex"
            >
              <User className="size-3.5" />
              অ্যাকাউন্ট
            </Link>
          ) : hydrated ? (
            <Link
              to="/login"
              className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-card transition hover:opacity-90 md:inline-flex"
            >
              <LogIn className="size-3.5" />
              লগইন
            </Link>
          ) : null}
        </nav>
      </div>

      <div className="hidden border-t border-border/50 bg-card/80 backdrop-blur-md md:block">
        <div className="container-page flex h-10 items-center gap-0 text-[13px] font-semibold">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="relative px-4 py-2.5 transition hover:text-primary"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "transition",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {l.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </Link>
          ))}
          <span className="ml-auto text-[11px] font-medium text-muted-foreground">
            ৳৫০০+ অর্ডারে ফ্রি ডেলিভারি · ঢাকায় ২৪ ঘণ্টায় ডেলিভারি
          </span>
        </div>
      </div>
    </header>
  );
}
