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

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sprout className="size-4.5" />
            </span>
            <span className="font-display text-lg font-extrabold">Patgram</span>
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
          <h3 className="mb-4 text-sm font-bold">সাপোর্ট</h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
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
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold">যোগাযোগ</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">01611820567</p>
                <p className="font-semibold">01911820567</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>rs2pgm@gmail.com</p>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>পাটগ্রাম, লালমনিরহাট-৫৫৪০</p>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>সকাল ৮টা – রাত ১২টা</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-muted-foreground">© ২০২৬ Patgram Online Shop। সর্বস্বত্ব সংরক্ষিত।</p>
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
