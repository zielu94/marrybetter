import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getVendorsData } from "@/actions/vendor.actions";
import VendorPageClient from "@/components/vendors/VendorPageClient";

export const metadata = { title: "Dienstleister | MarryBetter.com" };

export default async function VendorsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getVendorsData(session.user.id);
  if (!project) redirect("/onboarding");

  const vendors = project.vendors.map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    contactName: v.contactName,
    email: v.email,
    phone: v.phone,
    website: v.website,
    status: v.status,
    estimatedCost: v.estimatedCost,
    actualCost: v.actualCost,
    nextAction: v.nextAction,
    meetingDate: v.meetingDate ? v.meetingDate.toISOString() : null,
    notes: v.notes,
  }));

  return <VendorPageClient vendors={vendors} projectId={project.id} />;
}
