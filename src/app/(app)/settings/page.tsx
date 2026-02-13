import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsPageClient from "@/components/settings/SettingsPageClient";
import { getSupportMessages } from "@/actions/settings.actions";

export const metadata = { title: "Einstellungen | MarryBetter.com" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      partnerName: true,
      email: true,
      image: true,
    },
  });

  if (!user) redirect("/login");

  const project = await prisma.weddingProject.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      weddingDate: true,
      hasNoDate: true,
      location: true,
      currency: true,
      guestCountTarget: true,
      sidebarConfig: true,
      theme: true,
      slug: true,
      isPublicWebsite: true,
      websiteStory: true,
      websiteAccommodation: true,
      websiteHeroImage: true,
    },
  });

  const supportMessages = await getSupportMessages(session.user.id);

  return (
    <SettingsPageClient
      userId={user.id}
      name={user.name ?? ""}
      partnerName={user.partnerName ?? ""}
      email={user.email}
      image={user.image ?? ""}
      projectId={project?.id ?? ""}
      weddingDate={project?.weddingDate?.toISOString().split("T")[0] ?? ""}
      hasNoDate={project?.hasNoDate ?? false}
      location={project?.location ?? ""}
      currency={project?.currency ?? "EUR"}
      guestCountTarget={project?.guestCountTarget ?? 0}
      sidebarConfigRaw={project?.sidebarConfig ?? "{}"}
      theme={project?.theme ?? "light"}
      slug={project?.slug ?? ""}
      isPublicWebsite={project?.isPublicWebsite ?? false}
      websiteStory={project?.websiteStory ?? ""}
      websiteAccommodation={project?.websiteAccommodation ?? ""}
      websiteHeroImage={project?.websiteHeroImage ?? ""}
      supportMessages={supportMessages.map((m) => ({
        id: m.id,
        subject: m.subject,
        message: m.message,
        status: m.status,
        reply: m.reply,
        repliedAt: m.repliedAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
