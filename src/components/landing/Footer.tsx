import Link from "next/link";
import Logo from "@/components/layout/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="mb-4">
              <Logo size="md" />
            </div>
            <p className="text-[13px] text-text-muted leading-relaxed max-w-[280px] mb-5">
              Die moderne Hochzeitsplanungs-App für Paare, die es richtig machen wollen. Gäste, Budget, Sitzplan und mehr — alles an einem Ort.
            </p>
            <div className="flex items-center gap-2 text-[12px] text-text-faint">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Made in Berlin
            </div>
          </div>

          {/* Produkt */}
          <div>
            <h4 className="text-[12px] font-bold text-text uppercase tracking-wider mb-4">
              Produkt
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="#funktionen" className="text-[13px] text-text-muted hover:text-text transition-colors">
                  Funktionen
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[13px] text-text-muted hover:text-text transition-colors">
                  Preise
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-[13px] text-text-muted hover:text-text transition-colors">
                  Kostenlos starten
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[13px] text-text-muted hover:text-text transition-colors">
                  Anmelden
                </Link>
              </li>
            </ul>
          </div>

          {/* Unternehmen */}
          <div>
            <h4 className="text-[12px] font-bold text-text uppercase tracking-wider mb-4">
              Unternehmen
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="#bewertungen" className="text-[13px] text-text-muted hover:text-text transition-colors">
                  Bewertungen
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[13px] text-text-muted hover:text-text transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[13px] text-text-muted hover:text-text transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h4 className="text-[12px] font-bold text-text uppercase tracking-wider mb-4">
              Rechtliches
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/datenschutz" className="text-[13px] text-text-muted hover:text-text transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/impressum" className="text-[13px] text-text-muted hover:text-text transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-[13px] text-text-muted hover:text-text transition-colors">
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-text-faint">
            &copy; {new Date().getFullYear()} MarryBetter.com &middot; Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-text-faint">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              DSGVO-konform
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              SSL verschlüsselt
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
