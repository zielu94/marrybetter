interface WeddingHeroProps {
  name1: string;
  name2: string;
  weddingDate: Date | null;
  location: string | null;
  heroImage: string | null;
}

export default function WeddingHero({ name1, name2, weddingDate, location, heroImage }: WeddingHeroProps) {
  const formattedDate = weddingDate
    ? new Date(weddingDate).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {heroImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900" />
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-20">
        <p className={`text-xs sm:text-sm uppercase tracking-[0.3em] mb-6 ${
          heroImage ? "text-white/70" : "text-zinc-400 dark:text-zinc-500"
        }`}>
          Wir heiraten
        </p>

        <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 ${
          heroImage ? "text-white" : "text-zinc-900 dark:text-white"
        }`}>
          <span>{name1}</span>
          <span className={`block text-2xl sm:text-3xl lg:text-4xl font-light my-2 sm:my-3 ${
            heroImage ? "text-white/60" : "text-zinc-300 dark:text-zinc-600"
          }`}>
            &
          </span>
          <span>{name2}</span>
        </h1>

        {(formattedDate || location) && (
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base ${
            heroImage ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"
          }`}>
            {formattedDate && (
              <span>{formattedDate}</span>
            )}
            {formattedDate && location && (
              <span className={heroImage ? "text-white/40" : "text-zinc-300 dark:text-zinc-600"}>·</span>
            )}
            {location && (
              <span>{location}</span>
            )}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce ${
        heroImage ? "text-white/40" : "text-zinc-300 dark:text-zinc-600"
      }`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
