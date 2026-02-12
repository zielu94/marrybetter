interface WeddingAccommodationProps {
  accommodation: string;
}

export default function WeddingAccommodation({ accommodation }: WeddingAccommodationProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-3">
            Unterkunft
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Übernachtung
          </h2>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div className="flex-1">
              {accommodation.split("\n").map((paragraph, i) => (
                paragraph.trim() ? (
                  <p key={i} className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm sm:text-base mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ) : null
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
