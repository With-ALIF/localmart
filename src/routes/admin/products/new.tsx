import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/admin-auth";
import { DataProvider, useData } from "@/lib/admin/admin-data";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Product, CategorySlug } from "@/data/catalog";

function AddProductPage() {
  const { isAdminAuthenticated, hydrated } = useAdminAuth();
  const { categories, addProduct } = useData();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    details: "",
    category: "" as CategorySlug | "",
    price: "",
    oldPrice: "",
    stock: "",
    unit: "",
    brand: "",
    image: "",
    rating: "4.5",
    reviews: "0",
    tags: [] as string[],
  });

  if (!hydrated) return null;
  if (!isAdminAuthenticated) return <Navigate to="/admin" />;

  const update = (field: string, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const toggleTag = (tag: string) =>
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      toast.error("Please fill required fields");
      return;
    }
    const product: Product = {
      id: `p-${Date.now()}`,
      name: form.name,
      description: form.description,
      details: form.details,
      category: form.category as CategorySlug,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice) || Number(form.price),
      stock: Number(form.stock) || 0,
      unit: form.unit || "১ পিস",
      brand: form.brand || "Patgram",
      image: form.image || undefined,
      rating: Number(form.rating) || 4.5,
      reviews: Number(form.reviews) || 0,
      tags: form.tags as Product["tags"],
    };
    addProduct(product);
    toast.success("Product added!", { description: product.name });
    navigate({ to: "/admin/products" });
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="flex size-9 items-center justify-center rounded-xl border border-border transition hover:bg-secondary"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Add Product</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5">
            <h2 className="font-display text-lg font-bold">Basic Information</h2>
            <div>
              <label className="mb-1.5 block text-xs font-bold">Product Name *</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">Short Description</label>
              <input
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">Full Description</label>
              <textarea
                value={form.details}
                onChange={(e) => update("details", e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">Category *</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">Product Image</label>
              <input
                value={form.image}
                onChange={(e) => update("image", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
              />
              <div className="mt-2">
                <ImageUploader
                  value={form.image}
                  onChange={(v) => update("image", v)}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                URL দিন অথবা ছবি আপলোড করুন (auto resize max 100KB)। খালি রাখলে ক্যাটাগরি অনুযায়ী ছবি ব্যবহার হবে
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5">
            <h2 className="font-display text-lg font-bold">Pricing & Stock</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold">Price *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold">Previous Price</label>
                <input
                  type="number"
                  value={form.oldPrice}
                  onChange={(e) => update("oldPrice", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold">Unit</label>
                <input
                  value={form.unit}
                  onChange={(e) => update("unit", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold">Brand</label>
                <input
                  value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5">
            <h2 className="font-display text-lg font-bold">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {["popular", "new", "offer", "featured"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${form.tags.includes(tag) ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-secondary"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Link
              to="/admin/products"
              className="rounded-xl border border-border px-6 py-3 text-sm font-semibold transition hover:bg-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              <Save className="size-4" /> Save Product
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

function AdminNewProductPage() {
  return (
    <AdminAuthProvider>
      <DataProvider>
        <AddProductPage />
      </DataProvider>
    </AdminAuthProvider>
  );
}

export const Route = createFileRoute("/admin/products/new")({
  component: AdminNewProductPage,
});
