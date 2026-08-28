import { Link } from "@tanstack/react-router";
import {
  Sprout,
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  FileText,
  Lock,
} from "lucide-react";
import { categories } from "@/data/catalog";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sprout className="size-4.5" />
            </span>
            <span className="font-display text-lg font-extrabold">সবুজ বাজার</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            নিত্যপ্রয়োজনীয় মুদি থেকে ইলেকট্রনিক্স — সবকিছু এক জায়গায়, সেরা দামে ও দ্রুত
            ডেলিভারিতে।
          </p>
          <div className="flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              <Youtube className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold">ক্যাটাগরি</h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/products"
                  search={{ category: c.slug }}
                  className="transition hover:text-primary"
                >
                  {c.icon} {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold">দ্রুত লিংক</h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/products" className="transition hover:text-primary">
                সব পণ্য
              </Link>
            </li>
            <li>
              <Link to="/offers" className="transition hover:text-primary">
                বিশেষ অফার
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="transition hover:text-primary">
                উইশলিস্ট
              </Link>
            </li>
            <li>
              <Link to="/cart" className="transition hover:text-primary">
                কার্ট
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition hover:text-primary">
                লগইন / রেজিস্টার
              </Link>
            </li>
          </ul>
          <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
            <h3 className="mb-2 text-sm font-bold">সাপোর্ট</h3>
            <li className="flex items-center gap-2">
              <Shield className="size-3.5 text-primary" />
              <a href="#" className="transition hover:text-primary">
                প্রাইভেসি পলিসি
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FileText className="size-3.5 text-primary" />
              <a href="#" className="transition hover:text-primary">
                টার্মস ও কন্ডিশনস
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Lock className="size-3.5 text-primary" />
              <a href="#" className="transition hover:text-primary">
                রিফান্ড পলিসি
              </a>
            </li>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold">যোগাযোগ</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">হটলাইন: ০৯৬১১-১২৩৪৫৬</p>
                <p className="text-xs">ইমের্জেন্সি: ০১৭০০-০০০০০০</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p>care@shobujbazar.com</p>
                <p className="text-xs">info@shobujbazar.com</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>বসুন্ধরা সিটি, ঢাকা, বাংলাদেশ</p>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p>সকাল ৯টা – রাত ১০টা</p>
                <p className="text-xs">প্রতিদিন (শুক্রবার বন্ধ)</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-muted-foreground">© ২০২৬ সবুজ বাজার। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="transition hover:text-primary">
              প্রাইভেসি
            </a>
            <a href="#" className="transition hover:text-primary">
              শর্তাবলী
            </a>
            <a href="#" className="transition hover:text-primary">
              সাইটম্যাপ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
