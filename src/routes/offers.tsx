import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Zap, ArrowRight } from "lucide-react";
import { byTag } from "@/data/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHeading } from "@/components/shop/ProductGrid";
import { toBnNumber } from "@/lib/format";

function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 32, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6 text-white shadow-lg sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Zap className="size-7" />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold sm:text-2xl">ফ্ল্যাশ সেল!</h2>
            <p className="mt-1 text-sm text-white/80">
              সীমিত সময়ের জন্য সর্বোচ্চ ৪০% পর্যন্ত ছাড় পাচ্ছেন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="size-5 text-white/70" />
          <div className="flex items-center gap-1.5">
            <span className="flex size-12 items-center justify-center rounded-xl bg-white/20 font-display text-2xl font-extrabold backdrop-blur-sm">
              {pad(timeLeft.hours)}
            </span>
            <span className="text-lg font-bold">:</span>
            <span className="flex size-12 items-center justify-center rounded-xl bg-white/20 font-display text-2xl font-extrabold backdrop-blur-sm">
              {pad(timeLeft.minutes)}
            </span>
            <span className="text-lg font-bold">:</span>
            <span className="flex size-12 items-center justify-center rounded-xl bg-white/20 font-display text-2xl font-extrabold backdrop-blur-sm">
              {pad(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OffersPage() {
  const offers = byTag("offer");

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">বিশেষ অফার</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          সীমিত সময়ের জন্য বিশেষ মূল্যে পণ্য কিনুন
        </p>
      </div>

      <FlashSaleBanner />

      <div className="mt-8">
        <SectionHeading title="সকল অফার" subtitle={`${offers.length}টি পণ্য অফারে আছে`} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {offers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <h2 className="font-display text-xl font-extrabold">আরও অফার আসছে!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          নতুন অফার নোটিফিকেশন পেতে আমাদের সাথে থাকুন
        </p>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          সব পণ্য দেখুন
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/offers")({
  component: OffersPage,
});
