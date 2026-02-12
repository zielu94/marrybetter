import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/landing/Footer";

/* ─── Feature-Showcase Items ─── */
const showcaseFeatures = [
  {
    id: "dashboard",
    badge: "Dashboard",
    title: "Alles auf einen Blick",
    desc: "Euer persönliches Dashboard zeigt Budget-Status, offene Aufgaben, den Countdown und die nächsten Termine — übersichtlich und auf den Punkt.",
    highlights: ["Budget-Überblick", "Aufgaben-Fortschritt", "Countdown", "Nächste Termine"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
      </svg>
    ),
  },
  {
    id: "gaeste",
    badge: "Gästeliste",
    title: "Gäste perfekt im Griff",
    desc: "Verwaltet RSVPs, Ernährungshinweise, Plus-Ones und Tischzuordnungen. Filtert nach Status und exportiert die fertige Liste als CSV.",
    highlights: ["RSVP-Tracking", "Ernährungsinfos", "Haushalte", "CSV Import/Export"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    id: "budget",
    badge: "Budget",
    title: "Jeder Euro im Blick",
    desc: "Setzt Limits pro Kategorie, trackt Zahlungen und seht in Echtzeit, wo euer Geld hinfließt — mit visuellen Auswertungen.",
    highlights: ["Kategorien", "Zahlungstracking", "Diagramme", "Live-Übersicht"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    id: "timeline",
    badge: "Tagesablauf",
    title: "Minute für Minute geplant",
    desc: "Plant euren Hochzeitstag Minute für Minute. Erkennt Konflikte automatisch und exportiert den Plan als PDF für eure Dienstleister.",
    highlights: ["Minutenplaner", "Konflikt-Erkennung", "PDF-Export", "Dienstleister-Ansicht"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "sitzplan",
    badge: "Sitzplan",
    title: "Tische per Drag & Drop",
    desc: "Weist Gäste per Drag & Drop ihren Tischen zu. Erkennt automatisch Konflikte und erstellt druckfertige Sitzpläne.",
    highlights: ["Drag & Drop", "Druckfertig", "Konflikterkennung", "Raumplanung"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    ),
  },
  {
    id: "dienstleister",
    badge: "Dienstleister",
    title: "Alle Kontakte. Ein Ort.",
    desc: "Vergleicht Angebote, trackt Verträge und Zahlungen. Behaltet den Überblick über Fotografen, DJs, Floristen und alle anderen.",
    highlights: ["Angebotsvergleich", "Verträge", "Zahlungsstatus", "Kontaktdaten"],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
];

/* ─── Weitere Funktionen (kompaktes Grid) ─── */
const moreFeatures = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Kalender",
    desc: "Alle Termine synchron.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Packliste",
    desc: "Nichts vergessen.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    title: "Fotos",
    desc: "Galerie & Shotlist.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: "Flitterwochen",
    desc: "Flüge & Hotels planen.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: "Moodboard",
    desc: "Visuell inspirieren.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
      </svg>
    ),
    title: "Musik & Playlisten",
    desc: "Spotify integriert.",
  },
];

/* ─── Stats ─── */
const stats = [
  { value: "15+", label: "Module" },
  { value: "100%", label: "Kostenlos starten" },
  { value: "0", label: "Werbung" },
  { value: "DSGVO", label: "Konform" },
];

/* ─── Beta feedback ─── */
const feedback = [
  {
    text: "Endlich ein Tool, das unser Spreadsheet-Chaos ersetzt hat. Alles an einem Ort, keine Workarounds mehr.",
    author: "Julia & Markus",
    detail: "Hochzeit September 2026",
    rating: 5,
  },
  {
    text: "Der Sitzplan-Editor allein hat uns Stunden gespart. Drag & Drop funktioniert einfach so, wie man es erwartet.",
    author: "Sarah & Tim",
    detail: "Hochzeit Juni 2026",
    rating: 5,
  },
  {
    text: "Übersichtlich, schnell und komplett auf Deutsch. Genau das, was wir gebraucht haben. Absolute Empfehlung.",
    author: "Lisa & Jan",
    detail: "Hochzeit August 2026",
    rating: 5,
  },
];

/* ─── How it works steps ─── */
const steps = [
  {
    step: "01",
    title: "Account erstellen",
    desc: "In 30 Sekunden registriert. Keine Kreditkarte nötig.",
  },
  {
    step: "02",
    title: "Hochzeit einrichten",
    desc: "Datum, Location und Gästeanzahl — wir kümmern uns um den Rest.",
  },
  {
    step: "03",
    title: "Gemeinsam planen",
    desc: "Nutzt alle Module. Budget, Gäste, Sitzplan, Timeline — alles verbunden.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-1">
      <Navbar />

      {/* ═══════════════════════════════════════════
          1) HERO — Full-width, dramatic
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-muted to-surface-1" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-br from-rose-100/40 via-primary-100/20 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-gold-100/30 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-[12px] font-semibold text-rose-600 tracking-wide">
                Jetzt kostenlos starten
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-text">
              Die Hochzeits-App,{" "}
              <br className="hidden sm:block" />
              die Spreadsheets{" "}
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-400">
                  überflüssig
                </span>
              </span>{" "}
              macht.
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
              Gästeliste, Budget, Sitzplan, Tagesablauf, Dienstleister —{" "}
              <span className="text-text font-medium">alles an einem Ort</span>.
              Für Paare, die es richtig machen wollen.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-text text-surface-1 font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-text/10"
              >
                Kostenlos starten
                <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#funktionen"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-border text-text-muted font-medium text-sm hover:border-text/20 hover:text-text transition-all"
              >
                Funktionen entdecken
              </Link>
            </div>

            {/* Trust text */}
            <p className="mt-6 text-[13px] text-text-faint">
              Keine Kreditkarte nötig &middot; DSGVO-konform &middot; Kostenloser Plan für immer
            </p>
          </div>

          {/* ── Hero Product Mockup ── */}
          <div className="mt-16 sm:mt-20 relative max-w-4xl mx-auto">
            <div className="bg-gray-950 rounded-2xl p-2.5 shadow-2xl shadow-black/20">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-2.5">
                <div className="w-3 h-3 rounded-full bg-gray-700/80" />
                <div className="w-3 h-3 rounded-full bg-gray-700/80" />
                <div className="w-3 h-3 rounded-full bg-gray-700/80" />
                <div className="flex-1 mx-4 h-6 bg-gray-800/80 rounded-lg flex items-center justify-center">
                  <span className="text-[11px] text-gray-500 font-medium">app.marrybetter.com/dashboard</span>
                </div>
              </div>
              {/* Dashboard mockup */}
              <div className="bg-surface-2 rounded-xl p-5 sm:p-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Gäste", value: "124/150", color: "from-blue-500/10 to-blue-500/5 text-blue-600", icon: "👥" },
                    { label: "Budget", value: "€32.4k", color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600", icon: "💰" },
                    { label: "Aufgaben", value: "18/24", color: "from-amber-500/10 to-amber-500/5 text-amber-600", icon: "✅" },
                    { label: "Tage noch", value: "217", color: "from-rose-500/10 to-rose-500/5 text-rose-600", icon: "💍" },
                  ].map((s) => (
                    <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-xl p-3.5 text-center border border-black/[0.03]`}>
                      <p className="text-base mb-0.5">{s.icon}</p>
                      <p className="text-xs font-medium opacity-60">{s.label}</p>
                      <p className="text-base sm:text-lg font-bold mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
                {/* Activity row */}
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {/* Task list mock */}
                  <div className="bg-surface-1 rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-semibold text-text">Nächste Aufgaben</span>
                      <span className="text-[10px] text-text-faint font-medium px-2 py-0.5 rounded-full bg-surface-2">75%</span>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { task: "Fotograf buchen", done: true },
                        { task: "Gästeliste finalisieren", done: false, badge: "In Arbeit" },
                        { task: "Einladungen versenden", done: false },
                        { task: "Torte bestellen", done: false },
                      ].map((item) => (
                        <div key={item.task} className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${item.done ? "border-emerald-400 bg-emerald-400" : "border-border"}`}>
                            {item.done && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-[12px] ${item.done ? "line-through text-text-faint" : "text-text"}`}>{item.task}</span>
                          {item.badge && <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">{item.badge}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Budget bar mock */}
                  <div className="bg-surface-1 rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-semibold text-text">Budget-Überblick</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">€7.6k übrig</span>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { cat: "Location", pct: 35, color: "bg-blue-500" },
                        { cat: "Catering", pct: 25, color: "bg-emerald-500" },
                        { cat: "Foto & Video", pct: 15, color: "bg-amber-500" },
                        { cat: "Musik & DJ", pct: 10, color: "bg-rose-500" },
                      ].map((b) => (
                        <div key={b.cat}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-text-muted">{b.cat}</span>
                            <span className="text-[11px] font-medium text-text">{b.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div className={`h-full ${b.color} rounded-full transition-all duration-700`} style={{ width: `${b.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow */}
            <div className="absolute -inset-8 bg-gradient-to-br from-rose-200/20 via-transparent to-primary-200/20 rounded-3xl -z-10 blur-2xl" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2) STATS STRIP
          ═══════════════════════════════════════════ */}
      <section className="border-y border-border bg-surface-2/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-text">{s.value}</div>
                <div className="text-[13px] text-text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3) FEATURE SHOWCASE — Cards grid
          ═══════════════════════════════════════════ */}
      <section id="funktionen" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
              <span className="text-[12px] font-semibold text-primary-600 tracking-wide">15+ integrierte Module</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight">
              Alles, was ihr braucht.{" "}
              <span className="text-text-faint">Nichts, was ihr nicht braucht.</span>
            </h2>
            <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
              Module, die zusammenarbeiten — keine Spreadsheets, keine Gruppenchats, keine Zettelwirtschaft.
            </p>
          </div>

          {/* Main feature cards — 2x3 grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {showcaseFeatures.map((feature) => (
              <div
                key={feature.id}
                className="group relative bg-surface-1 border border-border rounded-2xl p-6 sm:p-7 hover:border-text/10 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted mb-5 group-hover:bg-rose-500/10 group-hover:text-rose-500 group-hover:border-rose-500/20 transition-all duration-300">
                  {feature.icon}
                </div>

                {/* Badge */}
                <span className="text-[11px] font-semibold text-text-faint uppercase tracking-widest">
                  {feature.badge}
                </span>

                {/* Title & desc */}
                <h3 className="text-lg font-bold text-text mt-2 mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[13px] text-text-muted leading-relaxed mb-5">
                  {feature.desc}
                </p>

                {/* Highlight pills */}
                <div className="flex flex-wrap gap-1.5">
                  {feature.highlights.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-2 text-[11px] font-medium text-text-muted"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* "Und vieles mehr" compact grid */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-text tracking-tight">
                Plus: Noch mehr Werkzeuge
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {moreFeatures.map((f) => (
                <div
                  key={f.title}
                  className="group bg-surface-1 border border-border rounded-2xl p-4 text-center hover:border-text/10 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted mx-auto mb-2.5 group-hover:bg-primary-500/10 group-hover:text-primary-600 transition-colors">
                    {f.icon}
                  </div>
                  <h4 className="text-[13px] font-semibold text-text mb-0.5">{f.title}</h4>
                  <p className="text-[11px] text-text-faint leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4) HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-surface-2/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-text tracking-tight">
              In 3 Schritten zur perfekten Hochzeit
            </h2>
            <p className="mt-3 text-text-muted max-w-lg mx-auto">
              Einfach anfangen. Alles Weitere ergibt sich.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[1px] bg-border" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-surface-1 border border-border flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <span className="text-lg font-bold text-rose-500">{s.step}</span>
                </div>
                <h3 className="text-base font-bold text-text mb-2">{s.title}</h3>
                <p className="text-[13px] text-text-muted leading-relaxed max-w-[240px] mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5) SOCIAL PROOF — Reviews
          ═══════════════════════════════════════════ */}
      <section id="bewertungen" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-100/50 border border-gold-200/50 mb-4">
              <span className="text-base">⭐</span>
              <span className="text-[12px] font-semibold text-gold-400 tracking-wide">Von Paaren empfohlen</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text tracking-tight">
              Was unsere Nutzer sagen
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {feedback.map((f, i) => (
              <div
                key={i}
                className="bg-surface-1 border border-border rounded-2xl p-6 sm:p-7 flex flex-col hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: f.rating }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[14px] text-text leading-relaxed flex-1 mb-6">
                  &bdquo;{f.text}&ldquo;
                </p>

                {/* Author */}
                <div className="border-t border-border pt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-200 to-rose-300 flex items-center justify-center text-[11px] font-bold text-rose-700">
                    {f.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-text">{f.author}</p>
                    <p className="text-[11px] text-text-faint">{f.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6) PRICING TEASER
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-surface-2/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text tracking-tight">
              Transparente Preise
            </h2>
            <p className="mt-3 text-text-muted max-w-lg mx-auto">
              Startet kostenlos. Upgradet, wenn ihr bereit seid.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { name: "Free", price: "0 €", period: "für immer", desc: "Alle Grundfunktionen", highlight: false },
              { name: "Pro", price: "69 €", period: "/ Jahr", desc: "Voller Zugang, 39% günstiger", highlight: true, badge: "Beliebt" },
              { name: "Premium", price: "99 €", period: "einmalig", desc: "2 Jahre, einmal zahlen", highlight: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-surface-1 rounded-2xl p-6 border text-center ${
                  plan.highlight
                    ? "border-rose-300 shadow-lg shadow-rose-500/10"
                    : "border-border"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">{plan.name}</h3>
                <div className="mt-3 mb-2">
                  <span className="text-3xl font-bold text-text">{plan.price}</span>
                  <span className="text-sm text-text-muted ml-1">{plan.period}</span>
                </div>
                <p className="text-[13px] text-text-muted">{plan.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Alle Pläne vergleichen
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7) FINAL CTA
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-gray-950 to-gray-900 rounded-3xl p-10 sm:p-16 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-b from-rose-500/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-primary-500/5 to-transparent rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                Bereit, eure Hochzeit{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-300">
                  perfekt
                </span>{" "}
                zu planen?
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8 text-base">
                In 2 Minuten eingerichtet. Kostenlos starten.
                Keine Kreditkarte nötig.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-all shadow-lg"
                >
                  Jetzt kostenlos starten
                  <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-gray-700 text-gray-300 font-medium text-sm hover:border-gray-600 hover:text-white transition-all"
                >
                  Preise ansehen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
