interface WeddingStoryProps {
  story: string;
}

export default function WeddingStory({ story }: WeddingStoryProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-3">
            Unsere Geschichte
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Wie alles begann
          </h2>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none text-center">
          {story.split("\n").map((paragraph, i) => (
            paragraph.trim() ? (
              <p key={i} className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base sm:text-lg">
                {paragraph}
              </p>
            ) : null
          ))}
        </div>
      </div>
    </section>
  );
}
