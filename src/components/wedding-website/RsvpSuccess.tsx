interface RsvpSuccessProps {
  guestName: string;
  coupleNames: string;
  rsvpStatus: string;
  slug: string;
}

export default function RsvpSuccess({ guestName, coupleNames, rsvpStatus, slug }: RsvpSuccessProps) {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">
          {rsvpStatus === "ATTENDING" ? "🎉" : "💌"}
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
          {rsvpStatus === "ATTENDING"
            ? "Du bist dabei!"
            : "Deine Antwort ist eingegangen"}
        </h1>

        <p className="text-zinc-500 dark:text-zinc-400 mb-2">
          Hallo {guestName}!
        </p>

        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
          {rsvpStatus === "ATTENDING"
            ? `${coupleNames} freuen sich, dich auf ihrer Hochzeit begrüßen zu dürfen.`
            : `Deine Absage wurde an ${coupleNames} übermittelt. Schade, dass du nicht dabei sein kannst!`}
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              rsvpStatus === "ATTENDING" ? "bg-emerald-500" : "bg-zinc-400"
            }`} />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Status: {rsvpStatus === "ATTENDING" ? "Zugesagt" : "Abgesagt"}
            </span>
          </div>
        </div>

        <a
          href={`/w/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Zur Hochzeitswebseite
        </a>
      </div>
    </main>
  );
}
