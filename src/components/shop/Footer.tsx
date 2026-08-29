import {
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface pb-20 md:pb-0">
      <div className="container-page flex flex-col justify-between gap-6 py-8 md:flex-row md:items-start">
        <div className="max-w-sm space-y-2">
          <div className="flex items-center gap-2.5">
            <img src="/localmart.png" alt="Patgram Online Shop" className="h-9 w-9 rounded-xl object-contain" />
            <span className="font-display text-lg font-extrabold">Patgram Online Shop</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            নিত্যপ্রয়োজনীয় মুদি থেকে ইলেকট্রনিক্স — সবকিছু এক জায়গায়, সেরা দামে ও দ্রুত
            ডেলিভারিতে।
          </p>
        </div>

        <div className="md:text-right">
          <h3 className="mb-2 text-sm font-bold">যোগাযোগ</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5 md:justify-end">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="text-left md:text-right">
                <p className="font-semibold">01611820567</p>
                <p className="font-semibold">01911820567</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 md:justify-end">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>rs2pgm@gmail.com</p>
            </li>
            <li className="flex items-start gap-2.5 md:justify-end">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>পাটগ্রাম, লালমনিরহাট-৫৫৪০</p>
            </li>
            <li className="flex items-start gap-2.5 md:justify-end">
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