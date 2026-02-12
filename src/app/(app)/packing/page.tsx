import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPackingData } from "@/actions/packing.actions";
import PackingPageClient from "@/components/packing/PackingPageClient";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = { title: "Packliste | MarryBetter.com" };

export default async function PackingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getPackingData(session.user.id);
  if (!project) redirect("/onboarding");

  return (
    <div className="space-y-6">
      <PageHeader title="Packliste" />
      <PackingPageClient items={project.packingItems} projectId={project.id} />
    </div>
  );
}
