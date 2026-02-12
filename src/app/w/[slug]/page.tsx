import { notFound } from "next/navigation";
import { getPublicWeddingData } from "@/actions/wedding-website.actions";
import WeddingHero from "@/components/wedding-website/WeddingHero";
import WeddingCountdown from "@/components/wedding-website/WeddingCountdown";
import WeddingLocation from "@/components/wedding-website/WeddingLocation";
import WeddingStory from "@/components/wedding-website/WeddingStory";
import WeddingSchedule from "@/components/wedding-website/WeddingSchedule";
import WeddingGallery from "@/components/wedding-website/WeddingGallery";
import WeddingAccommodation from "@/components/wedding-website/WeddingAccommodation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getPublicWeddingData(slug);
  if (!data) return { title: "Hochzeit" };

  const names = [data.user.name, data.user.partnerName].filter(Boolean).join(" & ");
  return {
    title: `${names} – Unsere Hochzeit`,
    description: `Hochzeitswebseite von ${names}`,
  };
}

export default async function WeddingWebsitePage({ params }: Props) {
  const { slug } = await params;
  const data = await getPublicWeddingData(slug);

  if (!data) notFound();

  const name1 = data.user.name || "Partner 1";
  const name2 = data.user.partnerName || "Partner 2";

  return (
    <main>
      {/* Hero */}
      <WeddingHero
        name1={name1}
        name2={name2}
        weddingDate={data.weddingDate}
        location={data.location}
        heroImage={data.websiteHeroImage}
      />

      {/* Countdown */}
      {data.weddingDate && (
        <WeddingCountdown weddingDate={data.weddingDate} />
      )}

      {/* Our Story */}
      {data.websiteStory && (
        <WeddingStory story={data.websiteStory} />
      )}

      {/* Location */}
      {data.location && (
        <WeddingLocation location={data.location} />
      )}

      {/* Schedule */}
      {data.scheduleDays && data.scheduleDays.length > 0 && (
        <WeddingSchedule scheduleDays={data.scheduleDays} />
      )}

      {/* Gallery */}
      {((data.photos && data.photos.length > 0) || (data.moodItems && data.moodItems.length > 0)) && (
        <WeddingGallery
          photos={data.photos || []}
          moodItems={data.moodItems || []}
        />
      )}

      {/* Accommodation */}
      {data.websiteAccommodation && (
        <WeddingAccommodation accommodation={data.websiteAccommodation} />
      )}

      {/* RSVP CTA */}
      <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
            Wir freuen uns auf euch!
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            Habt ihr einen persönlichen Einladungslink erhalten? Nutzt ihn, um eure Zusage oder Absage zu senden.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm text-zinc-500 dark:text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            RSVP über euren persönlichen Link
          </div>
        </div>
      </section>
    </main>
  );
}
