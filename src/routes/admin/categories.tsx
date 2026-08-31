import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/admin-auth";
import { DataProvider, useData } from "@/lib/admin/admin-data";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toBnNumber } from "@/lib/format";
import type { Category, CategorySlug } from "@/data/catalog";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function CategoriesContent() {
  const { isAdminAuthenticated, hydrated } = useAdminAuth();
  const { categories, products, addCategory, updateCategory, deleteCategory } = useData();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "🛒", description: "" });

  const filtered = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [categories, search]);

  if (!hydrated) return null;
  if (!isAdminAuthenticated) return <Navigate to="/admin" />;

  const productCount = (slug: string) => products.filter((p) => p.category === slug).length;

  const openAdd = () => {
    setEditSlug(null);
    setForm({ name: "", slug: "", icon: "🛒", description: "" });
    setShowForm(true);
  };
  const openEdit = (slug: string) => {
    const c = categories.find((x) => x.slug === slug);
    if (!c) return;
    setEditSlug(slug);
    setForm({ name: c.name, slug: c.slug, icon: c.icon, description: "" });
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error("Name and slug are required");
      return;
    }
    if (editSlug) {
      updateCategory(editSlug as CategorySlug, {
        name: form.name,
        icon: form.icon,
      });
      toast.success("Category updated!", { description: form.name });
    } else {
      if (categories.some((c) => c.slug === form.slug)) {
        toast.error("Slug already exists");
        return;
      }
      addCategory({
        slug: form.slug as CategorySlug,
        name: form.name,
        icon: form.icon,
        image: "",
      });
      toast.success("Category created!", { description: form.name });
    }
    setShowForm(false);
    setEditSlug(null);
  };

  const handleDelete = (slug: string) => {
    const count = productCount(slug);
    if (count > 0) {
      toast.warning(`${count} products in this category will become uncategorized`, {
        duration: 4000,
      });
    }
    deleteCategory(slug as CategorySlug);
    setDeleteSlug(null);
    toast.success("Category deleted");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Categories</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {toBnNumber(categories.length)} categories
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="size-4" /> Add Category
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-sm font-semibold text-muted-foreground">No categories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-bold text-muted-foreground">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.slug}
                    className="border-b border-border/50 transition hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.icon}</span>
                        <span className="font-semibold">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.slug}</td>
                    <td className="px-4 py-3">{toBnNumber(productCount(c.id))}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c.slug)}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteSlug(c.slug)}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lg">
              <h3 className="font-display text-lg font-bold">
                {editSlug ? "Edit Category" : "Add Category"}
              </h3>
              <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({
                        ...f,
                        name,
                        slug: editSlug ? f.slug : toSlug(name),
                      }));
                    }}
                    placeholder="Category name"
                    className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold">Slug *</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    disabled={!!editSlug}
                    placeholder="category-slug"
                    className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary disabled:opacity-50"
                  />
                  {!editSlug && form.name && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Auto: <span className="font-mono text-primary">{toSlug(form.name)}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold">Icon (emoji)</label>
                  <input
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                  >
                    {editSlug ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteSlug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg">
              <h3 className="font-display text-lg font-bold">Delete Category?</h3>
              {productCount(deleteSlug) > 0 && (
                <div className="mt-2 rounded-xl bg-orange-50 p-3 text-xs font-semibold text-orange-700">
                  This category has {productCount(deleteSlug)} product(s). They will become
                  uncategorized.
                </div>
              )}
              <p className="mt-3 text-sm text-muted-foreground">This action cannot be undone.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteSlug(null)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteSlug)}
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

function AdminCategoriesPage() {
  return (
    <AdminAuthProvider>
      <DataProvider>
        <CategoriesContent />
      </DataProvider>
    </AdminAuthProvider>
  );
}

export const Route = createFileRoute("/admin/categories")({ component: AdminCategoriesPage });
