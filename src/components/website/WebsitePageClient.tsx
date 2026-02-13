"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import { updateWebsiteSettings, generateSlug } from "@/actions/wedding-website.actions";

interface WebsitePageClientProps {
  projectId: string;
  name: string;
  partnerName: string;
  slug: string;
  isPublicWebsite: boolean;
  websiteStory: string;
  websiteAccommodation: string;
  websiteHeroImage: string;
  weddingDate: string;
  location: string;
}

function FeedbackMessage({ error, success }: { error: string | null; success: string | null }) {
  if (error) {
    return (
      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-200 dark:border-red-800/40">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        {error}
      </div>
    );
  }
  if (success) {
    return (
      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-sm border border-green-200 dark:border-green-800/40">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {success}
      </div>
    );
  }
  return null;
}

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 flex-shrink-0">
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <SectionIcon>{icon}</SectionIcon>
      <div>
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
    </div>
  );
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end items-center gap-3 pt-5 mt-5 border-t border-border -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-2">
      {children}
    </div>
  );
}

export default function WebsitePageClient({
  projectId, name, partnerName,
  slug: initialSlug, isPublicWebsite: initialIsPublic,
  websiteStory: initialStory, websiteAccommodation: initialAccommodation,
  websiteHeroImage: initialHeroImage, weddingDate, location,
}: WebsitePageClientProps) {
  const [wsSlug, setWsSlug] = useState(initialSlug);
  const [wsIsPublic, setWsIsPublic] = useState(initialIsPublic);
  const [wsStory, setWsStory] = useState(initialStory);
  const [wsAccommodation, setWsAccommodation] = useState(initialAccommodation);
  const [wsHeroImage, setWsHeroImage] = useState(initialHeroImage);
  const [wsPending, setWsPending] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [wsSuccess, setWsSuccess] = useState<string | null>(null);

  async function handleGenerateSlug() {
    if (!name || !partnerName) return;
    const slug = await generateSlug(name, partnerName);
    setWsSlug(slug);
  }

  async function handleWebsiteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setWsPending(true); setWsError(null); setWsSuccess(null);
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("slug", wsSlug);
    if (wsIsPublic) fd.set("isPublicWebsite", "on");
    fd.set("websiteStory", wsStory);
    fd.set("websiteAccommodation", wsAccommodation);
    fd.set("websiteHeroImage", wsHeroImage);
    const result = await updateWebsiteSettings(fd);
    if (result?.error) setWsError(result.error);
    if (result?.success) setWsSuccess("Webseiten-Einstellungen gespeichert!");
    setWsPending(false);
  }

  const hasWebsite = wsSlug && wsSlug.length >= 3;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Hochzeitswebseite"
        description="Erstelle und verwalte eure öffentliche Webseite für Gäste."
      />

      {/* Quick Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface-1 rounded-2xl border border-border px-4 py-3 shadow-sm">
          <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">Status</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${wsIsPublic ? "bg-green-500" : "bg-orange-400"}`} />
            <p className="text-sm font-semibold text-text">{wsIsPublic ? "Online" : "Offline"}</p>
          </div>
        </div>
        <div className="bg-surface-1 rounded-2xl border border-border px-4 py-3 shadow-sm">
          <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">Datum</p>
          <p className="text-sm font-semibold text-text mt-1">
            {weddingDate ? new Date(weddingDate).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" }) : "Nicht gesetzt"}
          </p>
        </div>
        <div className="bg-surface-1 rounded-2xl border border-border px-4 py-3 shadow-sm">
          <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">Ort</p>
          <p className="text-sm font-semibold text-text mt-1 truncate">{location || "Nicht gesetzt"}</p>
        </div>
        <div className="bg-surface-1 rounded-2xl border border-border px-4 py-3 shadow-sm">
          <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">URL</p>
          {hasWebsite ? (
            <a
              href={`/w/${wsSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1 block truncate hover:underline"
            >
              /w/{wsSlug}
            </a>
          ) : (
            <p className="text-sm font-semibold text-text-faint mt-1">Nicht erstellt</p>
          )}
        </div>
      </div>

      {/* Preview Banner */}
      {hasWebsite && wsIsPublic && (
        <a
          href={`/w/${wsSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 bg-gradient-to-r from-primary-50 to-rose-50 dark:from-primary-900/20 dark:to-rose-900/20 border border-primary-200 dark:border-primary-800/40 rounded-2xl px-5 py-4 mb-6 group hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text">Webseite ansehen</p>
              <p className="text-[12px] text-text-muted">marrybetter.vercel.app/w/{wsSlug}</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-text-faint group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      )}

      <div className="space-y-6">
        {/* Info Box */}
        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-[13px] text-blue-700 dark:text-blue-400">
            <p className="font-medium mb-1">Daten aus anderen Modulen:</p>
            <ul className="text-[12px] space-y-0.5 text-blue-600 dark:text-blue-400/80">
              <li>• <strong>Datum & Ort</strong> → Einstellungen → Hochzeitsdetails</li>
              <li>• <strong>Tagesablauf</strong> → Zeitplan-Modul (Sidebar)</li>
              <li>• <strong>Galerie</strong> → Fotos & Moodboard-Module</li>
            </ul>
          </div>
        </div>

        {/* URL & Visibility */}
        <Card padding="lg">
          <SectionHeader
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
            title="URL & Sichtbarkeit"
            description="Adresse und Veröffentlichungsstatus eurer Webseite"
          />

          <form onSubmit={handleWebsiteSubmit} className="space-y-6">
            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">URL der Webseite</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center border border-border rounded-xl overflow-hidden bg-surface-input">
                  <span className="px-3 text-sm text-text-faint bg-surface-2 border-r border-border py-2.5 whitespace-nowrap">
                    marrybetter.vercel.app/w/
                  </span>
                  <input
                    type="text"
                    value={wsSlug}
                    onChange={(e) => setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    placeholder="euer-slug"
                    className="flex-1 px-3 py-2.5 text-sm text-text bg-transparent focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="px-3 py-2.5 text-[13px] text-text-muted hover:text-text bg-surface-2 border border-border rounded-xl hover:bg-surface-2/80 transition-colors whitespace-nowrap"
                >
                  Generieren
                </button>
              </div>
              {hasWebsite && (
                <p className="text-[11px] text-text-faint mt-1.5">
                  Vorschau:{" "}
                  <a href={`/w/${wsSlug}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    marrybetter.vercel.app/w/{wsSlug}
                  </a>
                </p>
              )}
            </div>

            {/* Public Toggle */}
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl">
              <div>
                <div className="text-[13px] font-semibold text-text">Webseite öffentlich</div>
                <div className="text-[11px] text-text-faint mt-0.5">Wenn aktiviert, ist die Webseite für alle mit dem Link sichtbar</div>
              </div>
              <button
                type="button"
                onClick={() => setWsIsPublic(!wsIsPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  wsIsPublic ? "bg-primary-600" : "bg-surface-2 border border-border"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-surface-1 shadow-sm transition-transform duration-200 ${
                  wsIsPublic ? "translate-x-[22px]" : "translate-x-1"
                }`} />
              </button>
            </div>

            {/* Hero Image URL */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Hero-Bild</label>
              <Input
                id="websiteHeroImage"
                name="websiteHeroImage"
                type="url"
                label="Bild-URL"
                value={wsHeroImage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWsHeroImage(e.target.value)}
                placeholder="https://example.com/hero.jpg"
              />
              <p className="text-[11px] text-text-faint mt-1.5">URL zu einem großen Hintergrundbild für den Hero-Bereich</p>
              {wsHeroImage && (
                <div className="mt-3 rounded-xl overflow-hidden border border-border aspect-[3/1]">
                  <img src={wsHeroImage} alt="Hero-Vorschau" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Story */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="websiteStory" className="text-sm font-medium text-text">Eure Geschichte</label>
                <span className="text-[11px] text-text-faint">{wsStory.length}/5000</span>
              </div>
              <textarea
                id="websiteStory"
                value={wsStory}
                onChange={(e) => setWsStory(e.target.value.slice(0, 5000))}
                placeholder="Wie habt ihr euch kennengelernt? Erzählt eure Liebesgeschichte..."
                rows={6}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-surface-input text-text focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
              />
            </div>

            {/* Accommodation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="websiteAccommodation" className="text-sm font-medium text-text">Unterkunfts-Tipps</label>
                <span className="text-[11px] text-text-faint">{wsAccommodation.length}/3000</span>
              </div>
              <textarea
                id="websiteAccommodation"
                value={wsAccommodation}
                onChange={(e) => setWsAccommodation(e.target.value.slice(0, 3000))}
                placeholder="Empfehlungen für Hotels, Pensionen oder Ferienwohnungen in der Nähe..."
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-surface-input text-text focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
              />
            </div>

            <FeedbackMessage error={wsError} success={wsSuccess} />
            <CardFooter>
              <Button type="submit" variant="primary" size="lg" disabled={wsPending}>
                {wsPending ? "Wird gespeichert..." : "Webseite speichern"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
