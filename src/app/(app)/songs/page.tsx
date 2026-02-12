import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSongsData } from "@/actions/songs.actions";
import SongsPageClient from "@/components/songs/SongsPageClient";

export const metadata = { title: "Songs & Playlists | MarryBetter.com" };

export default async function SongsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getSongsData(session.user.id);
  if (!project) redirect("/onboarding");

  const songs = project.songs.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    spotifyUrl: s.spotifyUrl,
    category: s.category,
    notes: s.notes,
  }));

  const playlists = project.spotifyPlaylists.map((p) => ({
    id: p.id,
    name: p.name,
    spotifyUrl: p.spotifyUrl,
    description: p.description,
  }));

  return (
    <SongsPageClient
      projectId={project.id}
      songs={songs}
      playlists={playlists}
    />
  );
}
