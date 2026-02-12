"use client";

import { useState } from "react";

interface Photo {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
}

interface MoodItem {
  id: string;
  imageUrl: string;
  notes: string | null;
}

interface WeddingGalleryProps {
  photos: Photo[];
  moodItems: MoodItem[];
}

export default function WeddingGallery({ photos, moodItems }: WeddingGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Combine photos and mood items into a unified gallery
  const allImages = [
    ...photos.map((p) => ({ id: p.id, url: p.url, caption: p.title || p.description })),
    ...moodItems.map((m) => ({ id: m.id, url: m.imageUrl, caption: m.notes })),
  ];

  if (allImages.length === 0) return null;

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-3">
            Galerie
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Impressionen
          </h2>
        </div>

        {/* Masonry-style Grid */}
        <div className="columns-2 sm:columns-3 gap-3 sm:gap-4">
          {allImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setLightboxIdx(idx)}
              className="block w-full mb-3 sm:mb-4 rounded-xl overflow-hidden hover:opacity-90 transition-opacity cursor-pointer group"
            >
              <img
                src={img.url}
                alt={img.caption || "Hochzeitsfoto"}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2 z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Nav buttons */}
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
              className="absolute left-4 text-white/60 hover:text-white p-2"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {lightboxIdx < allImages.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
              className="absolute right-4 text-white/60 hover:text-white p-2"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <img
            src={allImages[lightboxIdx].url}
            alt={allImages[lightboxIdx].caption || "Foto"}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {allImages[lightboxIdx].caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center max-w-md">
              {allImages[lightboxIdx].caption}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
