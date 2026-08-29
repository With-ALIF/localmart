import { productImage, productFallbackIcon, type Product, type Category } from "@/data/catalog";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  categories?: Category[];
  className?: string;
  imgClassName?: string;
  alt?: string;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
};

export function ProductImage({
  product,
  categories,
  className,
  imgClassName,
  alt,
  loading = "lazy",
  width,
  height,
}: Props) {
  const src = productImage(product, categories);
  const fallback = productFallbackIcon(product, categories);

  if (src) {
    return (
      <img
        src={src}
        alt={alt || product.name}
        loading={loading}
        width={width}
        height={height}
        className={cn("object-contain", imgClassName)}
      />
    );
  }

  if (fallback) {
    return (
      <div className={cn("flex items-center justify-center bg-surface", className)}>
        <span className="select-none text-4xl">{fallback}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center bg-surface", className)}>
      <span className="select-none text-4xl text-muted-foreground/30">📦</span>
    </div>
  );
}
