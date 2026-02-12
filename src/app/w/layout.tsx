export default function WeddingWebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {children}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Erstellt mit{" "}
          <a
            href="/"
            className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors"
          >
            MarryBetter.com
          </a>
        </p>
      </footer>
    </div>
  );
}
