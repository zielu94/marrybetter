import { notFound } from "next/navigation";
import { getGuestByToken } from "@/actions/rsvp.actions";
import RsvpForm from "@/components/wedding-website/RsvpForm";
import RsvpSuccess from "@/components/wedding-website/RsvpSuccess";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return {
    title: `RSVP – Hochzeitseinladung`,
    description: `Bitte antworte auf die Hochzeitseinladung.`,
  };
}

export default async function RsvpPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            Ungültiger Link
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Dieser RSVP-Link ist nicht gültig. Bitte nutze den Link aus deiner persönlichen Einladung.
          </p>
        </div>
      </main>
    );
  }

  const guest = await getGuestByToken(token);

  if (!guest) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            Einladung nicht gefunden
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Dieser RSVP-Link ist ungültig oder abgelaufen. Bitte kontaktiere das Brautpaar.
          </p>
        </div>
      </main>
    );
  }

  // Already responded
  if (guest.rsvpRespondedAt && (guest.rsvpStatus === "ATTENDING" || guest.rsvpStatus === "DECLINED")) {
    const names = [guest.weddingProject.user.name, guest.weddingProject.user.partnerName].filter(Boolean).join(" & ");
    return (
      <RsvpSuccess
        guestName={`${guest.firstName} ${guest.lastName}`}
        coupleNames={names}
        rsvpStatus={guest.rsvpStatus}
        slug={slug}
      />
    );
  }

  const names = [guest.weddingProject.user.name, guest.weddingProject.user.partnerName].filter(Boolean).join(" & ");

  return (
    <main className="min-h-[80vh] py-12 sm:py-20 px-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
            Hochzeit von
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {names}
          </h1>
          {guest.weddingProject.weddingDate && (
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              {new Date(guest.weddingProject.weddingDate).toLocaleDateString("de-DE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Greeting */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 mb-8 text-center">
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            Hallo <span className="font-semibold">{guest.firstName}</span>! 👋
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Bitte teile uns mit, ob du dabei sein kannst.
          </p>
        </div>

        {/* Form */}
        <RsvpForm
          token={token}
          guestName={`${guest.firstName} ${guest.lastName}`}
          currentDiet={guest.diet}
          currentMealType={guest.mealType}
          currentAllergies={guest.allergiesNote}
          currentNotes={guest.notes}
          slug={slug}
        />
      </div>
    </main>
  );
}
