import { Link } from "@tanstack/react-router";
import {
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
    <footer className="mt-20 border-t border-border bg-surface pb-20 md:pb-0">
      <div className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <img src="/localmart.png" alt="LocalMart" className="h-9 w-9 rounded-xl object-contain" />
            <span className="font-display text-lg font-extrabold">LocalMart</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            নিত্যপ্রয়োজনীয় মুদি থেকে ইলেকট্রনিক্স — সবকিছু এক জায়গায়, সেরা দামে ও দ্রুত
            ডেলিভারিতে।
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold">সাপোর্ট</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
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
          <h3 className="mb-2 text-sm font-bold">যোগাযোগ</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
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
        <div className="container-page flex items-center justify-center py-3">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            © ২০২৬ Patgram Online Shop <br />
            সর্বস্বত্ব সংরক্ষিত
          </p>
        </div>
      </div>
    </footer>
  );
}