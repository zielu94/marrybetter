import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPhotoData } from "@/actions/photo.actions";
import PhotoPageClient from "@/components/photos/PhotoPageClient";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = { title: "Fotos | MarryBetter.com" };

export default async function PhotosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getPhotoData(session.user.id);
  if (!project) redirect("/onboarding");

  return (
    <div className="space-y-6">
      <PageHeader title="Fotos" />
      <PhotoPageClient
        photos={project.photos}
        projectId={project.id}
      />
    </div>
  );
}
