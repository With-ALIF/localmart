import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-store";

function CategoriesPage() {
  const { products, categories } = useShop();

  return (
    <div className="pb-20 md:pb-0">
      <div className="container-page py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">ক্যাটাগরি</h1>
          <p className="mt-1 text-sm text-muted-foreground">সব ক্যাটাগরি ব্রাউজ করুন</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.slug }}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-hover"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-5xl">{c.icon || "📦"}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-lg font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-white/80">
                    {toBnNumber(products.filter(p => p.category === c.id).length)}টি পণ্য
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function toBnNumber(value: number | string) {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(value).replace(/\d/g, (d) => bnDigits[Number(d)]!);
}
