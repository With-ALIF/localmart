import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminAuthProvider } from "@/lib/admin/admin-auth";
import { DataProvider } from "@/lib/admin/admin-data";

function ProductsLayout() {
  return (
    <AdminAuthProvider>
      <DataProvider>
        <Outlet />
      </DataProvider>
    </AdminAuthProvider>
  );
}

export const Route = createFileRoute("/admin/products")({
  component: ProductsLayout,
});
