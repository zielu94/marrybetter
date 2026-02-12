import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMoodboardData } from "@/actions/moodboard.actions";
import MoodboardPageClient from "@/components/moodboard/MoodboardPageClient";

export const metadata = { title: "Moodboard | MarryBetter.com" };

export default async function MoodboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getMoodboardData(session.user.id);
  if (!project) redirect("/onboarding");

  const moodItems = project.moodItems.map((item) => ({
    id: item.id,
    imageUrl: item.imageUrl,
    sourceUrl: item.sourceUrl,
    category: item.category,
    tags: item.tags,
    notes: item.notes,
  }));

  return (
    <MoodboardPageClient
      projectId={project.id}
      pinterestBoardUrl={project.pinterestBoardUrl}
      pinterestEmbedEnabled={project.pinterestEmbedEnabled}
      moodItems={moodItems}
    />
  );
}
