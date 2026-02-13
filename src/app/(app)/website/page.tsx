import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WebsitePageClient from "@/components/website/WebsitePageClient";

export const metadata = { title: "Hochzeitswebseite | MarryBetter.com" };

export default async function WebsitePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, partnerName: true },
  });

  const project = await prisma.weddingProject.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      slug: true,
      isPublicWebsite: true,
      websiteStory: true,
      websiteAccommodation: true,
      websiteHeroImage: true,
      weddingDate: true,
      location: true,
    },
  });

  if (!project) redirect("/onboarding");

  return (
    <WebsitePageClient
      projectId={project.id}
      name={user?.name ?? ""}
      partnerName={user?.partnerName ?? ""}
      slug={project.slug ?? ""}
      isPublicWebsite={project.isPublicWebsite}
      websiteStory={project.websiteStory ?? ""}
      websiteAccommodation={project.websiteAccommodation ?? ""}
      websiteHeroImage={project.websiteHeroImage ?? ""}
      weddingDate={project.weddingDate?.toISOString().split("T")[0] ?? ""}
      location={project.location ?? ""}
    />
  );
}
