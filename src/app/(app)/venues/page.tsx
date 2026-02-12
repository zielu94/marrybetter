import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getVenueData } from "@/actions/venue.actions";
import VenuePageClient from "@/components/venues-compare/VenuePageClient";

export const metadata = { title: "Locations | MarryBetter.com" };

export default async function VenuesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getVenueData(session.user.id);
  if (!project) redirect("/onboarding");

  const venues = project.venueOptions.map((v) => ({
    id: v.id,
    name: v.name,
    status: v.status,
    contactName: v.contactName,
    email: v.email,
    phone: v.phone,
    website: v.website,
    address: v.address,
    city: v.city,
    capacity: v.capacity,
    imageUrl: v.imageUrl,
    pros: v.pros,
    notes: v.notes,
    visitDate: v.visitDate ? v.visitDate.toISOString() : null,
    costItems: v.costItems.map((c) => ({
      id: c.id,
      name: c.name,
      amount: c.amount,
      notes: c.notes,
    })),
  }));

  return <VenuePageClient projectId={project.id} venues={venues} />;
}
