"use client";

import { useState, useMemo, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  savePinterestBoard,
  clearPinterestBoard,
  createMoodItem,
  updateMoodItem,
  deleteMoodItem,
} from "@/actions/moodboard.actions";
import {
  MOOD_ITEM_CATEGORY_LABELS,
  MOOD_ITEM_CATEGORY_ICONS,
  type MoodItemCategory,
} from "@/types";

/* ─── Types ─── */

interface MoodItem {
  id: string;
  imageUrl: string;
  sourceUrl: string | null;
  category: string;
  tags: string | null;
  notes: string | null;
}

interface MoodboardPageClientProps {
  projectId: string;
  pinterestBoardUrl: string | null;
  pinterestEmbedEnabled: boolean;
  moodItems: MoodItem[];
}

/* ─── Pinterest URL Validation ─── */

function isValidPinterestBoardUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("pinterest.")) return false;
    // Board paths: /username/boardname/ or /pin/...
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.length >= 2;
  } catch {
    return false;
  }
}

function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ─── Pinterest Embed (iframe-based, reliable) ─── */

function buildPinterestEmbedUrl(boardUrl: string): string | null {
  try {
    const parsed = new URL(boardUrl);
    // Normalize: ensure host is pinterest.com for the widget
    // Pinterest widget: https://widgets.pinterest.com/v3/pidgets/boards/<username>/<boardname>/pins/
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;
    const username = segments[0];
    const boardname = segments[1];
    return `https://widgets.pinterest.com/v3/pidgets/boards/${username}/${boardname}/pins/`;
  } catch {
    return null;
  }
}

function PinterestEmbed({ url }: { url: string }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

  const embedUrl = buildPinterestEmbedUrl(url);

  if (!embedUrl || iframeFailed) {
    return <PinterestLinkFallback url={url} />;
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-surface-2 border border-border">
      {/* Loading skeleton */}
      {!iframeLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-surface-2">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-border border-t-red-500 rounded-full animate-spin" />
            <p className="text-xs text-text-faint">Pinterest Board wird geladen...</p>
          </div>
        </div>
      )}
      <iframe
        src={embedUrl}
        className="w-full border-0 rounded-xl"
        style={{ height: "520px" }}
        onLoad={() => setIframeLoaded(true)}
        onError={() => setIframeFailed(true)}
        sandbox="allow-scripts allow-same-origin allow-popups"
        title="Pinterest Board"
      />
      {/* Always show direct link below */}
      <div className="flex items-center justify-center gap-2 py-2.5 bg-surface-1 border-t border-border">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] text-red-500 hover:text-red-600 font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Vollständiges Board auf Pinterest öffnen
        </a>
      </div>
    </div>
  );
}

function PinterestLinkFallback({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 px-4 bg-surface-2 rounded-xl border border-border">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-text-muted">
          Pinterest-Vorschau nicht verfügbar
        </p>
        <p className="text-xs text-text-faint mt-1">
          Einbettung wird moeglicherweise blockiert — oeffne das Board direkt.
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
        Auf Pinterest öffnen
      </a>
    </div>
  );
}

/* ─── Main Component ─── */

export default function MoodboardPageClient({
  projectId,
  pinterestBoardUrl,
  pinterestEmbedEnabled,
  moodItems,
}: MoodboardPageClientProps) {
  const [activeTab, setActiveTab] = useState<"pinterest" | "picks">(
    pinterestBoardUrl ? "pinterest" : "picks"
  );
  const [pinterestUrl, setPinterestUrl] = useState(pinterestBoardUrl || "");
  const [pinterestError, setPinterestError] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MoodItem | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTags, setSearchTags] = useState("");

  // ── Filtered mood items ──
  const filteredItems = useMemo(() => {
    let list = moodItems;
    if (filterCategory) {
      list = list.filter((i) => i.category === filterCategory);
    }
    if (searchTags) {
      const q = searchTags.toLowerCase();
      list = list.filter((i) => {
        const tags = parseTags(i.tags).map((t) => t.toLowerCase());
        const matchTags = tags.some((t) => t.includes(q));
        const matchNotes = i.notes?.toLowerCase().includes(q);
        return matchTags || matchNotes;
      });
    }
    return list;
  }, [moodItems, filterCategory, searchTags]);

  // ── Category counts ──
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    moodItems.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [moodItems]);

  // ── Pinterest save handler ──
  const handleSavePinterest = useCallback(async () => {
    const url = pinterestUrl.trim();
    if (!url) {
      setPinterestError("Bitte gib eine Pinterest-URL ein.");
      return;
    }
    if (!isValidPinterestBoardUrl(url)) {
      setPinterestError(
        "Ungültige Pinterest-Board-URL. Format: https://www.pinterest.de/nutzername/boardname/"
      );
      return;
    }
    setPinterestError("");
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("url", url);
    await savePinterestBoard(fd);
  }, [pinterestUrl, projectId]);

  const handleClearPinterest = useCallback(async () => {
    const fd = new FormData();
    fd.set("projectId", projectId);
    await clearPinterestBoard(fd);
    setPinterestUrl("");
    setPinterestError("");
  }, [projectId]);

  return (
    <div className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text tracking-tight">
            Moodboard
          </h1>
          <p className="text-[13px] text-text-muted mt-1">
            {moodItems.length} ausgewählte Inspirationen
            {pinterestBoardUrl && " \u00b7 Pinterest verbunden"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowAddItem(true)}>
            + Inspiration
          </Button>
        </div>
      </div>

      {/* ═══ KPI Strip ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Inspirationen",
            value: moodItems.length,
            color: "text-text",
          },
          {
            label: "Kategorien",
            value: Object.keys(categoryCounts).length,
            color: "text-purple-600",
          },
          {
            label: "Mit Quelle",
            value: moodItems.filter((i) => i.sourceUrl).length,
            color: "text-blue-600",
          },
          {
            label: "Pinterest",
            value: pinterestBoardUrl ? "Verbunden" : "—",
            color: pinterestBoardUrl ? "text-red-500" : "text-text-faint",
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
        {(["pinterest", "picks"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab
                ? "bg-surface-1 text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            {tab === "pinterest" ? "Pinterest Board" : `Auswahl (${moodItems.length})`}
          </button>
        ))}
      </div>

      {/* ═══ Pinterest Tab ═══ */}
      {activeTab === "pinterest" && (
        <div className="space-y-4">
          {/* URL Input Card */}
          <div className="bg-surface-1 rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-base font-semibold text-text mb-1">
              Pinterest Board verknuepfen
            </h2>
            <p className="text-[13px] text-text-muted mb-4">
              Füge die URL deines Pinterest-Boards ein, um eine Vorschau zu sehen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="url"
                  value={pinterestUrl}
                  onChange={(e) => {
                    setPinterestUrl(e.target.value);
                    setPinterestError("");
                  }}
                  placeholder="https://www.pinterest.de/nutzername/hochzeit/"
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-surface-1 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                />
                {pinterestError && (
                  <p className="text-xs text-red-500 mt-1.5">{pinterestError}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSavePinterest}>
                  Speichern
                </Button>
                {pinterestBoardUrl && (
                  <Button size="sm" variant="ghost" onClick={handleClearPinterest}>
                    Entfernen
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Board Preview */}
          {pinterestBoardUrl && (
            <PinterestEmbed url={pinterestBoardUrl} />
          )}

          {!pinterestBoardUrl && (
            <div className="bg-surface-1 rounded-2xl border border-border shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </div>
              <p className="text-text-muted text-sm">
                Noch kein Pinterest Board verknuepft.
              </p>
              <p className="text-text-faint text-xs mt-1">
                Füge oben eine Board-URL ein um loszulegen.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Selected Picks Tab ═══ */}
      {activeTab === "picks" && (
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
                placeholder="Tags oder Notizen suchen..."
                value={searchTags}
                onChange={(e) => setSearchTags(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-xl bg-surface-1 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterCategory("")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  !filterCategory
                    ? "bg-gray-900 text-white"
                    : "bg-surface-2 text-text-muted hover:bg-surface-2"
                }`}
              >
                Alle
              </button>
              {Object.entries(MOOD_ITEM_CATEGORY_LABELS).map(([key, label]) => {
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
                        ? "bg-gray-900 text-white"
                        : "bg-surface-2 text-text-muted hover:bg-surface-2"
                    }`}
                  >
                    <span>
                      {MOOD_ITEM_CATEGORY_ICONS[key as MoodItemCategory]}
                    </span>
                    {label}
                    <span
                      className={`text-[10px] ${
                        filterCategory === key
                          ? "text-text-faint"
                          : "text-text-faint"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <MoodCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface-1 rounded-2xl border border-border shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-text-muted text-sm">
                {moodItems.length === 0
                  ? "Noch keine Inspirationen gespeichert."
                  : "Keine Ergebnisse für den aktuellen Filter."}
              </p>
              {moodItems.length === 0 && (
                <button
                  onClick={() => setShowAddItem(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                >
                  Erste Inspiration hinzufügen
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ Add Item Modal ═══ */}
      <Modal
        open={showAddItem}
        onClose={() => setShowAddItem(false)}
        title="Inspiration hinzufügen"
      >
        <AddMoodItemForm
          projectId={projectId}
          onClose={() => setShowAddItem(false)}
        />
      </Modal>

      {/* ═══ Edit / Detail Inspector Modal ═══ */}
      {selectedItem && (
        <MoodItemInspector
          key={selectedItem.id}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

/* ─── Mood Card ─── */

function MoodCard({
  item,
  onClick,
}: {
  item: MoodItem;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const tags = parseTags(item.tags);

  return (
    <button
      onClick={onClick}
      className="group bg-surface-1 rounded-2xl border border-border shadow-sm overflow-hidden text-left hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-surface-2 relative overflow-hidden">
        {!imgError ? (
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2">
            <svg
              className="w-8 h-8 text-text-faint"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-surface-1/90 backdrop-blur-sm rounded-lg text-[11px] font-medium text-text-muted">
          {MOOD_ITEM_CATEGORY_ICONS[item.category as MoodItemCategory] || ""}{" "}
          {MOOD_ITEM_CATEGORY_LABELS[item.category as MoodItemCategory] ||
            item.category}
        </span>
      </div>
      {/* Content */}
      <div className="p-3">
        {item.notes && (
          <p className="text-sm text-text-muted line-clamp-2 mb-1.5">
            {item.notes}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-surface-2 text-[10px] text-text-muted rounded"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-text-faint">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
        {!item.notes && tags.length === 0 && (
          <p className="text-xs text-text-faint">Keine Notizen</p>
        )}
      </div>
    </button>
  );
}

/* ─── Add Mood Item Form ─── */

function AddMoodItemForm({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [imgPreviewOk, setImgPreviewOk] = useState(false);
  const [imgPreviewError, setImgPreviewError] = useState(false);

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setImgPreviewOk(false);
    setImgPreviewError(false);
  };

  return (
    <form
      action={async (fd) => {
        fd.set("projectId", projectId);
        fd.set("imageUrl", imageUrl);
        await createMoodItem(fd);
        onClose();
      }}
      className="space-y-4"
    >
      {/* Image URL with live preview */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Bild-URL <span className="text-red-400">*</span>
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          required
          placeholder="https://images.unsplash.com/... oder direkter Bild-Link"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm placeholder:text-text-faint"
        />
        <p className="text-[11px] text-text-faint mt-1">
          Direkte Bild-URL (muss mit .jpg, .png, .webp enden oder ein Bild-Link sein). Keine Pinterest-Seiten-URLs.
        </p>

        {/* Image preview */}
        {imageUrl.trim() && (
          <div className="mt-2 rounded-xl overflow-hidden bg-surface-2 border border-border">
            {!imgPreviewError ? (
              <div className="relative aspect-video">
                <img
                  src={imageUrl.trim()}
                  alt="Vorschau"
                  className="w-full h-full object-cover"
                  onLoad={() => { setImgPreviewOk(true); setImgPreviewError(false); }}
                  onError={() => { setImgPreviewOk(false); setImgPreviewError(true); }}
                />
                {imgPreviewOk && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500/90 text-white text-[10px] font-medium rounded-lg">
                    Bild OK
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-xs text-amber-600">
                  Bild konnte nicht geladen werden. Stelle sicher, dass es eine direkte Bild-URL ist (kein Pinterest-Link).
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Input
        name="sourceUrl"
        label="Quell-URL (optional)"
        placeholder="https://... (Pinterest-Pin, Blog, Dienstleister-Website)"
      />
      <div>
        <label className="block text-sm font-medium text-text-muted mb-2">
          Kategorie
        </label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(MOOD_ITEM_CATEGORY_LABELS).map(([key, label]) => (
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
              <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-2 text-text-muted peer-checked:bg-gray-900 peer-checked:text-white transition-all cursor-pointer">
                {MOOD_ITEM_CATEGORY_ICONS[key as MoodItemCategory]} {label}
              </span>
            </label>
          ))}
        </div>
      </div>
      <Input
        name="tags"
        label="Tags (kommagetrennt)"
        placeholder="z.B. rustikal, rosa, boho, outdoor"
      />
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Notizen
        </label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Warum gefaellt dir dieses Bild? Was genau ist inspirierend?"
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm placeholder:text-text-faint"
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={!imageUrl.trim() || imgPreviewError}>
          Hinzufügen
        </Button>
      </div>
    </form>
  );
}

/* ─── Mood Item Inspector (Detail/Edit Modal) ─── */

function MoodItemInspector({
  item,
  onClose,
}: {
  item: MoodItem;
  onClose: () => void;
}) {
  const [category, setCategory] = useState(item.category);
  const [tags, setTags] = useState(item.tags || "");
  const [notes, setNotes] = useState(item.notes || "");
  const [imgError, setImgError] = useState(false);

  return (
    <Modal open={true} onClose={onClose} title="Inspiration bearbeiten">
      <div className="space-y-4">
        {/* Image preview */}
        <div className="aspect-video bg-surface-2 rounded-xl overflow-hidden relative">
          {!imgError ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-2">
              <p className="text-xs text-text-faint">Bild konnte nicht geladen werden</p>
            </div>
          )}
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 bg-surface-1/90 backdrop-blur-sm rounded-lg text-[11px] font-medium text-text-muted hover:bg-surface-1 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Quelle öffnen
            </a>
          )}
        </div>

        {/* Edit form */}
        <form
          action={async (fd) => {
            fd.set("id", item.id);
            fd.set("category", category);
            fd.set("tags", tags);
            fd.set("notes", notes);
            await updateMoodItem(fd);
            onClose();
          }}
          className="space-y-4"
        >
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Kategorie
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(MOOD_ITEM_CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    category === key
                      ? "bg-gray-900 text-white"
                      : "bg-surface-2 text-text-muted hover:bg-surface-2"
                  }`}
                >
                  {MOOD_ITEM_CATEGORY_ICONS[key as MoodItemCategory]} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Tags (kommagetrennt)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="z.B. rustikal, rosa, boho"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Notizen
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Warum gefaellt dir dieses Bild?"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm placeholder:text-text-faint"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={async () => {
                const fd = new FormData();
                fd.set("id", item.id);
                await deleteMoodItem(fd);
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
