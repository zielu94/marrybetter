import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getHoneymoonData } from "@/actions/honeymoon.actions";
import HoneymoonPageClient from "@/components/honeymoon/HoneymoonPageClient";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = { title: "Flitterwochen | MarryBetter.com" };

export default async function HoneymoonPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getHoneymoonData(session.user.id);
  if (!project) redirect("/onboarding");

  return (
    <div className="space-y-6">
      <PageHeader title="Flitterwochen" />
      <HoneymoonPageClient
        items={project.honeymoonItems}
        projectId={project.id}
      />
    </div>
  );
}
