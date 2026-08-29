import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, Eye, Edit, Trash2, ChevronDown, Package } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin/admin-auth";
import { useData } from "@/lib/admin/admin-data";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatTaka, toBnNumber } from "@/lib/format";
import { discountPercent, categoryName } from "@/data/catalog";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/shop/ProductImage";

function ProductListPage() {
  const { isAdminAuthenticated } = useAdminAuth();
  const { deleteProduct } = useData();
  const { products, categories } = useShop();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          categoryName(p.category, categories).toLowerCase().includes(q),
      );
    }
    if (catFilter) list = list.filter((p) => p.category === catFilter);
    if (stockFilter === "in") list = list.filter((p) => p.stock > 10);
    if (stockFilter === "low") list = list.filter((p) => p.stock > 0 && p.stock <= 10);
    if (stockFilter === "out") list = list.filter((p) => p.stock === 0);
    return list;
  }, [products, search, catFilter, stockFilter]);

  if (!isAdminAuthenticated) return <Navigate to="/admin" />;

  const handleDelete = (id: string) => {
    const p = products.find((x) => x.id === id);
    deleteProduct(id);
    setDeleteId(null);
    toast.success("Product deleted", { description: p?.name });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Products</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {toBnNumber(products.length)} products total
            </p>
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="size-4" /> Add Product
          </Link>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="relative">
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="h-10 appearance-none rounded-xl border border-border bg-card pl-4 pr-8 text-sm font-semibold outline-none focus:border-primary"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="h-10 appearance-none rounded-xl border border-border bg-card pl-4 pr-8 text-sm font-semibold outline-none focus:border-primary"
            >
              <option value="">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Package className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-bold text-muted-foreground">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const off = discountPercent(p);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 transition hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            product={p}
                            categories={categories}
                            className="size-10 rounded-lg"
                            imgClassName="size-10 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {categoryName(p.category, categories)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{formatTaka(p.price)}</span>
                        {off > 0 && (
                          <span className="ml-1 text-[11px] text-destructive">
                            -{toBnNumber(off)}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "font-semibold",
                            p.stock === 0
                              ? "text-destructive"
                              : p.stock <= 10
                                ? "text-orange-500"
                                : "text-green-600",
                          )}
                        >
                          {toBnNumber(p.stock)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{toBnNumber(p.rating)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-bold",
                            p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
                          )}
                        >
                          {p.stock > 0 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to="/product/$productId"
                            params={{ productId: p.id }}
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <Link
                            to="/admin/products/edit/$id"
                            params={{ id: p.id }}
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          >
                            <Edit className="size-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg">
              <h3 className="font-display text-lg font-bold">Delete Product?</h3>
              <p className="mt-2 text-sm text-muted-foreground">This action cannot be undone.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground transition hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export const Route = createFileRoute("/admin/products/")({
  component: ProductListPage,
});
