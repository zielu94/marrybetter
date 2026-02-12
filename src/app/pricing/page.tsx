import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = { title: "Preise | MarryBetter.com" };

const PLANS = [
  {
    name: "Free",
    price: "0",
    period: "Für immer kostenlos",
    description: "Perfekt zum Ausprobieren. Alle Grundfunktionen für eure Hochzeitsplanung.",
    cta: "Kostenlos starten",
    ctaHref: "/register",
    ctaStyle: "bg-surface-2 text-text hover:bg-surface-border",
    popular: false,
    features: [
      { text: "Unbegrenzte Gäste", included: true },
      { text: "Budgetplanung mit Kategorien", included: true },
      { text: "Aufgabenverwaltung", included: true },
      { text: "Sitzplan-Editor (Drag & Drop)", included: true },
      { text: "Tagesablauf planen", included: true },
      { text: "Dienstleister-Verwaltung", included: true },
      { text: "RSVP-Management", included: false },
      { text: "CSV Import & Export", included: false },
    ],
  },
  {
    name: "Starter",
    price: "9",
    period: "/ Monat",
    billingNote: "Monatlich kündbar",
    description: "Voller Zugang zu allen Features. Ideal für kürzere Planungszeiten.",
    cta: "Starter wählen",
    ctaHref: "/register",
    ctaStyle: "bg-text text-surface-1 hover:opacity-90",
    popular: false,
    features: [
      { text: "Alles aus Free", included: true },
      { text: "RSVP-Management", included: true },
      { text: "CSV Import & Export", included: true },
      { text: "Erweiterte Berichte", included: true },
      { text: "Prioritäts-Support", included: true },
      { text: "Einladungs-Designer", included: false },
      { text: "Gäste-App", included: false },
      { text: "Früher Zugang zu Features", included: false },
    ],
  },
  {
    name: "Pro",
    price: "69",
    period: "/ Jahr",
    billingNote: "Spare 39% gegenüber monatlich",
    description: "Bestes Preis-Leistungs-Verhältnis. Für Paare, die bald heiraten.",
    cta: "Pro wählen",
    ctaHref: "/register",
    ctaStyle: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20",
    popular: true,
    saveBadge: "Spare 39%",
    features: [
      { text: "Alles aus Starter", included: true },
      { text: "39% günstiger als monatlich", included: true },
      { text: "Einladungs-Designer", included: true },
      { text: "Gäste-App (Zu-/Absagen)", included: true },
      { text: "Ideal für 12 Monate Planung", included: true },
      { text: "Früher Zugang zu Features", included: false },
      { text: "VIP-Support", included: false },
      { text: "2 Jahre Zugang", included: false },
    ],
  },
  {
    name: "Premium",
    price: "99",
    period: "einmalig",
    billingNote: "2 Jahre Zugang — einmal zahlen",
    description: "Einmal zahlen, 2 Jahre nutzen. Für entspannte Langzeitplanung.",
    cta: "Premium wählen",
    ctaHref: "/register",
    ctaStyle: "bg-text text-surface-1 hover:opacity-90",
    popular: false,
    saveBadge: "Bester Deal",
    features: [
      { text: "Alles aus Pro", included: true },
      { text: "14 Monate gratis (vs. monatlich)", included: true },
      { text: "Endet automatisch — keine Kosten", included: true },
      { text: "Früher Zugang zu neuen Features", included: true },
      { text: "VIP-Support per E-Mail", included: true },
      { text: "2 Jahre voller Zugang", included: true },
      { text: "Einladungs-Designer", included: true },
      { text: "Gäste-App", included: true },
    ],
  },
];

const FAQ = [
  {
    q: "Kann ich jederzeit kündigen?",
    a: "Ja. Alle Pläne sind jederzeit kündbar. Beim Jahresplan wird der verbleibende Zeitraum nicht erstattet, aber euer Zugang bleibt bis zum Ende der Laufzeit bestehen.",
  },
  {
    q: "Was passiert nach dem kostenlosen Plan?",
    a: "Der Free-Plan bleibt für immer kostenlos. Ihr könnt jederzeit upgraden, wenn ihr erweiterte Features wie RSVP-Management oder CSV-Export benötigt.",
  },
  {
    q: "Gibt es eine Geld-zurück-Garantie?",
    a: "Ja. Innerhalb der ersten 14 Tage nach dem Upgrade könnt ihr ohne Angabe von Gründen eine volle Erstattung erhalten.",
  },
  {
    q: "Kann ich den Plan wechseln?",
    a: "Jederzeit. Beim Upgrade wird der verbleibende Betrag eures aktuellen Plans anteilig verrechnet.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface-1">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-muted to-surface-1" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-rose-200/30 to-primary-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
            <span className="text-[12px] font-semibold text-rose-600 tracking-wide">14 Tage Geld-zurück-Garantie</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight">
            Der richtige Plan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-400">
              für eure Hochzeit
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Startet kostenlos mit allen Grundfunktionen. Upgradet jederzeit für RSVP-Tools, Einladungs-Designer und mehr.
          </p>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-surface-1 rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.05] ${
                plan.popular
                  ? "border-rose-300 shadow-lg shadow-rose-500/10 scale-[1.02] lg:scale-105"
                  : "border-border"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="bg-gradient-to-r from-rose-500 to-rose-400 text-white text-[11px] font-bold text-center py-2 tracking-wider uppercase">
                  Beliebtester Plan
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                {/* Plan Header */}
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-text">{plan.name}</h3>
                    {plan.saveBadge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-wide">
                        {plan.saveBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-text-muted mt-1.5 leading-relaxed">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-text">{plan.price}</span>
                    <span className="text-lg font-bold text-text">&euro;</span>
                    <span className="text-sm text-text-muted ml-0.5">{plan.period}</span>
                  </div>
                  {plan.billingNote && (
                    <p className="text-[11px] text-text-faint mt-1.5">{plan.billingNote}</p>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.ctaHref}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[13px] font-semibold transition-all ${plan.ctaStyle}`}
                >
                  {plan.cta}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                {/* Divider */}
                <div className="border-t border-border my-5" />

                {/* Features */}
                <div className="space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex gap-2.5">
                      {feature.included ? (
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-text-faint/40 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-[13px] ${feature.included ? "text-text" : "text-text-faint"}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[13px] text-text-muted">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Jederzeit kündbar
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            14 Tage Geld-zurück
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Keine versteckten Kosten
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            DSGVO-konform
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-20 border-t border-border bg-surface-2/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
              Häufige Fragen
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-surface-1 border border-border rounded-2xl p-5 sm:p-6">
                <h3 className="text-[14px] font-bold text-text mb-2">{item.q}</h3>
                <p className="text-[13px] text-text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text tracking-tight mb-4">
            Bereit loszulegen?
          </h2>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            Startet kostenlos und upgradet, wenn ihr bereit seid. In 2 Minuten eingerichtet.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-text text-surface-1 font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-text/10"
          >
            Jetzt kostenlos starten
            <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
