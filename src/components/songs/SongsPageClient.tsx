"use client";

import { useState, useMemo, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  createSong,
  updateSong,
  deleteSong,
  createSpotifyPlaylist,
  deleteSpotifyPlaylist,
} from "@/actions/songs.actions";
import {
  SONG_CATEGORY_LABELS,
  SONG_CATEGORY_ICONS,
  type SongCategory,
} from "@/types";

/* ─── Types ─── */

interface Song {
  id: string;
  title: string;
  artist: string | null;
  spotifyUrl: string | null;
  category: string;
  notes: string | null;
}

interface Playlist {
  id: string;
  name: string;
  spotifyUrl: string;
  description: string | null;
}

interface SongsPageClientProps {
  projectId: string;
  songs: Song[];
  playlists: Playlist[];
}

/* ─── Spotify URL Helpers ─── */

function isValidSpotifyUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "open.spotify.com";
  } catch {
    return false;
  }
}

function getSpotifyType(url: string): "track" | "playlist" | "album" | null {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    // Handle intl-xx prefix: /intl-de/track/...
    const filtered = segments.filter((s) => !s.startsWith("intl-"));
    if (filtered.length >= 2) {
      const type = filtered[0];
      if (type === "track" || type === "playlist" || type === "album") return type;
    }
    return null;
  } catch {
    return null;
  }
}

function buildSpotifyEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "open.spotify.com") return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    // Filter out locale prefix like intl-de
    const filtered = segments.filter((s) => !s.startsWith("intl-"));
    if (filtered.length < 2) return null;

    const type = filtered[0]; // track, playlist, album
    const id = filtered[1];

    if (!["track", "playlist", "album"].includes(type)) return null;

    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  } catch {
    return null;
  }
}

function getSpotifyEmbedHeight(url: string): number {
  const type = getSpotifyType(url);
  if (type === "playlist" || type === "album") return 352;
  return 152;
}

/* ─── Spotify Embed Component ─── */

function SpotifyEmbed({ url, compact }: { url: string; compact?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const embedUrl = buildSpotifyEmbedUrl(url);
  const height = compact ? 152 : getSpotifyEmbedHeight(url);

  if (!embedUrl || failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 bg-[#1DB954]/10 text-[#1DB954] text-sm font-medium rounded-xl hover:bg-[#1DB954]/20 transition-colors"
      >
        <SpotifyIcon className="w-4 h-4" />
        Auf Spotify öffnen
      </a>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-surface-2 border border-border">
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10 bg-surface-2"
          style={{ height }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-border border-t-[#1DB954] rounded-full animate-spin" />
            <p className="text-xs text-text-faint">Spotify wird geladen...</p>
          </div>
        </div>
      )}
      <iframe
        src={embedUrl}
        className="w-full border-0 rounded-xl"
        style={{ height }}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Player"
      />
    </div>
  );
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

/* ─── Main Component ─── */

export default function SongsPageClient({
  projectId,
  songs,
  playlists,
}: SongsPageClientProps) {
  const [activeTab, setActiveTab] = useState<"songs" | "playlists">("songs");
  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSong, setExpandedSong] = useState<string | null>(null);

  // ── Filtered songs ──
  const filteredSongs = useMemo(() => {
    let list = songs;
    if (filterCategory) {
      list = list.filter((s) => s.category === filterCategory);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist?.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [songs, filterCategory, searchTerm]);

  // ── Category counts ──
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    songs.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [songs]);

  const songsWithSpotify = songs.filter((s) => s.spotifyUrl).length;

  return (
    <div className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text tracking-tight">
            Songs & Playlists
          </h1>
          <p className="text-[13px] text-text-muted mt-1">
            {songs.length} Songs · {playlists.length} Playlists
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "songs" ? (
            <Button size="sm" onClick={() => setShowAddSong(true)}>
              + Song
            </Button>
          ) : (
            <Button size="sm" onClick={() => setShowAddPlaylist(true)}>
              + Playlist
            </Button>
          )}
        </div>
      </div>

      {/* ═══ KPI Strip ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Songs",
            value: songs.length,
            color: "text-text",
          },
          {
            label: "Kategorien",
            value: Object.keys(categoryCounts).length,
            color: "text-purple-600",
          },
          {
            label: "Mit Spotify",
            value: songsWithSpotify,
            color: "text-[#1DB954]",
          },
          {
            label: "Playlists",
            value: playlists.length,
            color: "text-blue-600",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-1 rounded-2xl border border-border px-4 py-3 shadow-sm"
          >
            <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">
              {kpi.label}
            </p>
            <p className={`text-2xl font-semibold mt-1 ${kpi.color}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* ═══ Tabs ═══ */}
      <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl w-fit">
        {(["songs", "playlists"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab
                ? "bg-surface-1 text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            {tab === "songs"
              ? `Songs (${songs.length})`
              : `Playlists (${playlists.length})`}
          </button>
        ))}
      </div>

      {/* ═══ Songs Tab ═══ */}
      {activeTab === "songs" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Titel oder Künstler suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-xl bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterCategory("")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  !filterCategory
                    ? "bg-text text-surface-1"
                    : "bg-surface-2 text-text-muted hover:bg-border"
                }`}
              >
                Alle
              </button>
              {Object.entries(SONG_CATEGORY_LABELS).map(([key, label]) => {
                const count = categoryCounts[key] || 0;
                if (count === 0 && filterCategory !== key) return null;
                return (
                  <button
                    key={key}
                    onClick={() =>
                      setFilterCategory(filterCategory === key ? "" : key)
                    }
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      filterCategory === key
                        ? "bg-text text-surface-1"
                        : "bg-surface-2 text-text-muted hover:bg-border"
                    }`}
                  >
                    <span>{SONG_CATEGORY_ICONS[key as SongCategory]}</span>
                    {label}
                    <span className="text-[10px] text-text-faint">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Song List */}
          {filteredSongs.length > 0 ? (
            <div className="bg-surface-1 rounded-2xl border border-border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-faint uppercase tracking-wider w-8" />
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-faint uppercase tracking-wider">
                      Titel
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-faint uppercase tracking-wider hidden sm:table-cell">
                      Künstler
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-text-faint uppercase tracking-wider hidden md:table-cell">
                      Kategorie
                    </th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-text-faint uppercase tracking-wider w-20">
                      Aktion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSongs.map((song) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      expanded={expandedSong === song.id}
                      onToggleExpand={() =>
                        setExpandedSong(
                          expandedSong === song.id ? null : song.id
                        )
                      }
                      onEdit={() => setSelectedSong(song)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-surface-1 rounded-2xl border border-border shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#1DB954]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <p className="text-text-muted text-sm">
                {songs.length === 0
                  ? "Noch keine Songs gespeichert."
                  : "Keine Ergebnisse für den aktuellen Filter."}
              </p>
              {songs.length === 0 && (
                <button
                  onClick={() => setShowAddSong(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                >
                  Ersten Song hinzufügen
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ Playlists Tab ═══ */}
      {activeTab === "playlists" && (
        <div className="space-y-4">
          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface-1 rounded-2xl border border-border shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <SpotifyIcon className="w-8 h-8 text-[#1DB954]" />
              </div>
              <p className="text-text-muted text-sm">
                Noch keine Playlists gespeichert.
              </p>
              <p className="text-text-faint text-xs mt-1">
                Füge Spotify-Playlist-Links hinzu, um sie hier einzubetten.
              </p>
              <button
                onClick={() => setShowAddPlaylist(true)}
                className="text-[#1DB954] hover:text-[#1aa34a] text-sm font-medium mt-3"
              >
                Erste Playlist hinzufügen
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ Add Song Modal ═══ */}
      <Modal
        open={showAddSong}
        onClose={() => setShowAddSong(false)}
        title="Song hinzufügen"
      >
        <AddSongForm
          projectId={projectId}
          onClose={() => setShowAddSong(false)}
        />
      </Modal>

      {/* ═══ Add Playlist Modal ═══ */}
      <Modal
        open={showAddPlaylist}
        onClose={() => setShowAddPlaylist(false)}
        title="Spotify Playlist hinzufügen"
      >
        <AddPlaylistForm
          projectId={projectId}
          onClose={() => setShowAddPlaylist(false)}
        />
      </Modal>

      {/* ═══ Song Inspector Modal ═══ */}
      {selectedSong && (
        <SongInspector
          key={selectedSong.id}
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
        />
      )}
    </div>
  );
}

/* ─── Song Row ─── */

function SongRow({
  song,
  expanded,
  onToggleExpand,
  onEdit,
}: {
  song: Song;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <tr className="border-b border-border hover:bg-surface-2/50 transition-colors">
        {/* Spotify indicator */}
        <td className="px-4 py-3">
          {song.spotifyUrl ? (
            <button
              onClick={onToggleExpand}
              className={`p-1 rounded-lg transition-colors ${
                expanded
                  ? "text-[#1DB954] bg-[#1DB954]/10"
                  : "text-text-faint hover:text-[#1DB954] hover:bg-[#1DB954]/5"
              }`}
              title="Spotify-Vorschau"
            >
              <SpotifyIcon className="w-4 h-4" />
            </button>
          ) : (
            <span className="block w-4 h-4" />
          )}
        </td>
        {/* Title */}
        <td className="px-4 py-3">
          <button
            onClick={onEdit}
            className="text-left hover:text-primary-600 transition-colors"
          >
            <span className="font-medium text-text">{song.title}</span>
            {song.artist && (
              <span className="text-text-muted sm:hidden"> · {song.artist}</span>
            )}
            {song.notes && (
              <p className="text-[11px] text-text-faint line-clamp-1 mt-0.5">
                {song.notes}
              </p>
            )}
          </button>
        </td>
        {/* Artist */}
        <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
          {song.artist || "—"}
        </td>
        {/* Category */}
        <td className="px-4 py-3 hidden md:table-cell">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-2 rounded-lg text-[11px] font-medium text-text-muted">
            {SONG_CATEGORY_ICONS[song.category as SongCategory]}{" "}
            {SONG_CATEGORY_LABELS[song.category as SongCategory] || song.category}
          </span>
        </td>
        {/* Actions */}
        <td className="px-4 py-3 text-right">
          <button
            onClick={onEdit}
            className="p-1.5 text-text-faint hover:text-primary-500 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </td>
      </tr>
      {/* Expanded Spotify Player */}
      {expanded && song.spotifyUrl && (
        <tr>
          <td colSpan={5} className="px-4 pb-3">
            <SpotifyEmbed url={song.spotifyUrl} compact />
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── Playlist Card ─── */

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <div className="bg-surface-1 rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1DB954]/10 flex items-center justify-center shrink-0">
            <SpotifyIcon className="w-4 h-4 text-[#1DB954]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-text text-sm truncate">
              {playlist.name}
            </h3>
            {playlist.description && (
              <p className="text-[11px] text-text-faint truncate">
                {playlist.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={playlist.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-text-faint hover:text-[#1DB954] rounded-lg hover:bg-surface-2 transition-colors"
            title="Auf Spotify öffnen"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <form
            action={async (fd) => {
              fd.set("id", playlist.id);
              await deleteSpotifyPlaylist(fd);
            }}
          >
            <button
              type="submit"
              className="p-1.5 text-text-faint hover:text-red-500 rounded-lg hover:bg-surface-2 transition-colors"
              title="Entfernen"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      {/* Spotify Embed */}
      <div className="p-3">
        <SpotifyEmbed url={playlist.spotifyUrl} />
      </div>
    </div>
  );
}

/* ─── Add Song Form ─── */

function AddSongForm({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [spotifyUrl, setSpotifyUrl] = useState("");

  const showEmbed = spotifyUrl.trim() && isValidSpotifyUrl(spotifyUrl.trim());

  return (
    <form
      action={async (fd) => {
        fd.set("projectId", projectId);
        fd.set("spotifyUrl", spotifyUrl);
        await createSong(fd);
        onClose();
      }}
      className="space-y-4"
    >
      {/* Spotify URL with live embed preview */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Spotify-Link (optional)
        </label>
        <div className="relative">
          <SpotifyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
          <input
            type="url"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            placeholder="https://open.spotify.com/track/..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-[#1DB954]/30 transition-all text-sm placeholder:text-text-faint"
          />
        </div>
        {spotifyUrl.trim() && !isValidSpotifyUrl(spotifyUrl.trim()) && (
          <p className="text-xs text-amber-500 mt-1">
            Ungültige Spotify-URL. Kopiere den Link direkt aus Spotify.
          </p>
        )}
        {showEmbed && (
          <div className="mt-2">
            <SpotifyEmbed url={spotifyUrl.trim()} compact />
          </div>
        )}
      </div>

      <Input name="title" label="Titel" required placeholder="z.B. Perfect" />
      <Input name="artist" label="Künstler" placeholder="z.B. Ed Sheeran" />

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-2">
          Kategorie / Moment
        </label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(SONG_CATEGORY_LABELS).map(([key, label]) => (
            <label
              key={key}
              className="inline-flex items-center gap-1 cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                value={key}
                defaultChecked={key === "OTHER"}
                className="sr-only peer"
              />
              <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-2 text-text-muted peer-checked:bg-text peer-checked:text-surface-1 transition-all cursor-pointer">
                {SONG_CATEGORY_ICONS[key as SongCategory]} {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Notizen
        </label>
        <textarea
          name="notes"
          rows={2}
          placeholder="z.B. Einzug der Braut, Eröffnungstanz..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm placeholder:text-text-faint"
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button type="submit">Hinzufügen</Button>
      </div>
    </form>
  );
}

/* ─── Add Playlist Form ─── */

function AddPlaylistForm({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [spotifyUrl, setSpotifyUrl] = useState("");

  const isValid = spotifyUrl.trim() && isValidSpotifyUrl(spotifyUrl.trim());
  const spotifyType = spotifyUrl.trim() ? getSpotifyType(spotifyUrl.trim()) : null;
  const isPlaylistOrAlbum = spotifyType === "playlist" || spotifyType === "album";

  return (
    <form
      action={async (fd) => {
        fd.set("projectId", projectId);
        fd.set("spotifyUrl", spotifyUrl.trim());
        await createSpotifyPlaylist(fd);
        onClose();
      }}
      className="space-y-4"
    >
      {/* Spotify URL */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Spotify-Playlist-URL <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <SpotifyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
          <input
            type="url"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            required
            placeholder="https://open.spotify.com/playlist/..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-[#1DB954]/30 transition-all text-sm placeholder:text-text-faint"
          />
        </div>
        <p className="text-[11px] text-text-faint mt-1">
          Oeffne die Playlist in Spotify → Teilen → Link kopieren
        </p>
        {spotifyUrl.trim() && !isValid && (
          <p className="text-xs text-amber-500 mt-1">
            Ungültige Spotify-URL.
          </p>
        )}
        {isValid && !isPlaylistOrAlbum && (
          <p className="text-xs text-amber-500 mt-1">
            Das sieht nach einem einzelnen Song aus — nutze &quot;+ Song&quot; stattdessen.
          </p>
        )}
        {isValid && isPlaylistOrAlbum && (
          <div className="mt-2">
            <SpotifyEmbed url={spotifyUrl.trim()} />
          </div>
        )}
      </div>

      <Input name="name" label="Name" required placeholder="z.B. Hochzeit — Dinner" />
      <Input name="description" label="Beschreibung (optional)" placeholder="z.B. Ruhige Hintergrundmusik für das Abendessen" />

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={!isValid || !isPlaylistOrAlbum}>
          Hinzufügen
        </Button>
      </div>
    </form>
  );
}

/* ─── Song Inspector (Edit Modal) ─── */

function SongInspector({
  song,
  onClose,
}: {
  song: Song;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist || "");
  const [spotifyUrl, setSpotifyUrl] = useState(song.spotifyUrl || "");
  const [category, setCategory] = useState(song.category);
  const [notes, setNotes] = useState(song.notes || "");

  const showEmbed = spotifyUrl.trim() && isValidSpotifyUrl(spotifyUrl.trim());

  return (
    <Modal open={true} onClose={onClose} title="Song bearbeiten">
      <div className="space-y-4">
        {/* Spotify Embed */}
        {showEmbed && (
          <SpotifyEmbed url={spotifyUrl.trim()} compact />
        )}

        {/* Edit form */}
        <form
          action={async (fd) => {
            fd.set("id", song.id);
            fd.set("title", title);
            fd.set("artist", artist);
            fd.set("spotifyUrl", spotifyUrl);
            fd.set("category", category);
            fd.set("notes", notes);
            await updateSong(fd);
            onClose();
          }}
          className="space-y-4"
        >
          {/* Spotify URL */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Spotify-Link
            </label>
            <div className="relative">
              <SpotifyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
              <input
                type="url"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-[#1DB954]/30 transition-all text-sm placeholder:text-text-faint"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Titel
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm"
            />
          </div>

          {/* Artist */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Künstler
            </label>
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="z.B. Ed Sheeran"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Kategorie / Moment
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SONG_CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    category === key
                      ? "bg-text text-surface-1"
                      : "bg-surface-2 text-text-muted hover:bg-border"
                  }`}
                >
                  {SONG_CATEGORY_ICONS[key as SongCategory]} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Notizen
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="z.B. Einzug der Braut..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm placeholder:text-text-faint"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={async () => {
                const fd = new FormData();
                fd.set("id", song.id);
                await deleteSong(fd);
                onClose();
              }}
              className="text-[13px] text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Entfernen
            </button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
