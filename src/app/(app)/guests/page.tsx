import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getGuestsData } from "@/actions/guest.actions";
import GuestPageClient from "@/components/guests/GuestPageClient";

export const metadata = { title: "Gästeverwaltung | MarryBetter.com" };

export default async function GuestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getGuestsData(session.user.id);
  if (!project) redirect("/onboarding");

  const guests = project.guests.map((g) => ({
    id: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    email: g.email,
    phone: g.phone,
    address: g.address,
    city: g.city,
    zip: g.zip,
    country: g.country,
    source: g.source,
    category: g.category,
    role: g.role,
    age: g.age,
    diet: g.diet,
    mealType: g.mealType,
    allergiesNote: g.allergiesNote,
    status: g.status,
    rsvpStatus: g.rsvpStatus,
    guestType: g.guestType,
    tableNumber: g.tableNumber,
    notes: g.notes,
    inviteSent: g.inviteSent,
    isWeddingParty: g.isWeddingParty,
    seatingTableName: g.seatingTable?.name ?? null,
    householdId: g.householdId,
    householdName: g.household?.name ?? null,
    invitationToken: g.invitationToken ?? null,
    tokenCreatedAt: g.tokenCreatedAt?.toISOString() ?? null,
    rsvpRespondedAt: g.rsvpRespondedAt?.toISOString() ?? null,
  }));

  const households = (project.households ?? []).map((h) => ({
    id: h.id,
    name: h.name,
    guestIds: h.guests.map((g) => g.id),
  }));

  return <GuestPageClient guests={guests} projectId={project.id} households={households} slug={project.slug ?? null} />;
}
