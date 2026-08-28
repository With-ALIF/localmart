import { Link } from "@tanstack/react-router";
import { ArrowRight, PackageSearch } from "lucide-react";
import type { Product } from "@/data/catalog";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel = "সব পণ্য দেখুন",
  actionTo = "/products",
}: {
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-card text-primary shadow-soft">
        <PackageSearch className="size-7" />
      </span>
      <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      <Link
        to={actionTo}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        {actionLabel}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  viewAll,
}: {
  title: string;
  subtitle?: string;
  viewAll?: { to: string; search?: Record<string, unknown> };
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-extrabold sm:text-xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {viewAll && (
        <Link
          to={viewAll.to}
          search={viewAll.search as never}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-3.5 py-1.5 text-[11px] font-bold transition hover:border-primary hover:text-primary"
        >
          সব দেখুন
          <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
