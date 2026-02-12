"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import {
  updateProfile,
  updateWeddingDetailsExtended,
  changePassword,
  updateSidebarConfig,
  updateTheme,
  sendSupportMessage,
} from "@/actions/settings.actions";
import { updateWebsiteSettings, generateSlug } from "@/actions/wedding-website.actions";
import { parseSidebarConfig, stringifySidebarConfig, CONFIGURABLE_PAGES, type SidebarConfig } from "@/lib/sidebar-config";
import { useTheme } from "@/providers/ThemeProvider";

// ── Types ───────────────────────────────────────────

interface SupportMessageData {
  id: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface SettingsPageClientProps {
  userId: string;
  name: string;
  partnerName: string;
  email: string;
  projectId: string;
  weddingDate: string;
  hasNoDate: boolean;
  location: string;
  currency: string;
  guestCountTarget: number;
  sidebarConfigRaw: string;
  theme: string;
  slug: string;
  isPublicWebsite: boolean;
  websiteStory: string;
  websiteAccommodation: string;
  websiteHeroImage: string;
  supportMessages: SupportMessageData[];
}

// ── Tab Type ────────────────────────────────────────

type SettingsTab = "account" | "wedding" | "website" | "sidebar" | "support" | "billing";

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  {
    key: "account",
    label: "Konto",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: "wedding",
    label: "Hochzeitsdetails",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    key: "website",
    label: "Webseite",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    key: "sidebar",
    label: "Seitenleiste",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    key: "support",
    label: "Support",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    key: "billing",
    label: "Abrechnung",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
];

const CURRENCIES = [
  { value: "EUR", label: "Euro (EUR)", symbol: "\u20AC" },
  { value: "USD", label: "US-Dollar (USD)", symbol: "$" },
  { value: "GBP", label: "Pfund (GBP)", symbol: "\u00A3" },
  { value: "CHF", label: "Schweizer Franken (CHF)", symbol: "CHF" },
  { value: "PLN", label: "Polnischer Z\u0142oty (PLN)", symbol: "z\u0142" },
  { value: "CZK", label: "Tschechische Krone (CZK)", symbol: "K\u010D" },
  { value: "SEK", label: "Schwedische Krone (SEK)", symbol: "kr" },
  { value: "NOK", label: "Norwegische Krone (NOK)", symbol: "kr" },
  { value: "DKK", label: "D\u00E4nische Krone (DKK)", symbol: "kr" },
];

// ── Shared Helper Components ────────────────────────

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

// ── Main Component ──────────────────────────────────

export default function SettingsPageClient({
  userId, name, partnerName, email,
  projectId, weddingDate, hasNoDate: initialHasNoDate, location,
  currency: initialCurrency, guestCountTarget: initialGuestCountTarget,
  sidebarConfigRaw, theme: _initialTheme,
  slug: initialSlug, isPublicWebsite: initialIsPublic,
  websiteStory: initialStory, websiteAccommodation: initialAccommodation,
  websiteHeroImage: initialHeroImage,
  supportMessages: initialSupportMessages,
}: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // ── Account state ──
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profilePending, setProfilePending] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordPending, setPasswordPending] = useState(false);

  // ── Wedding Details state ──
  const [hasNoDate, setHasNoDate] = useState(initialHasNoDate);
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const [guestCountTarget, setGuestCountTarget] = useState(String(initialGuestCountTarget || ""));
  const [weddingError, setWeddingError] = useState<string | null>(null);
  const [weddingSuccess, setWeddingSuccess] = useState<string | null>(null);
  const [weddingPending, setWeddingPending] = useState(false);

  // ── Website state ──
  const [wsSlug, setWsSlug] = useState(initialSlug);
  const [wsIsPublic, setWsIsPublic] = useState(initialIsPublic);
  const [wsStory, setWsStory] = useState(initialStory);
  const [wsAccommodation, setWsAccommodation] = useState(initialAccommodation);
  const [wsHeroImage, setWsHeroImage] = useState(initialHeroImage);
  const [wsPending, setWsPending] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [wsSuccess, setWsSuccess] = useState<string | null>(null);

  // ── Sidebar state ──
  const [sidebarConfig, setSidebarConfig] = useState<SidebarConfig>(() => parseSidebarConfig(sidebarConfigRaw));
  const [sidebarPending, setSidebarPending] = useState(false);
  const [sidebarSuccess, setSidebarSuccess] = useState<string | null>(null);
  const [sidebarError, setSidebarError] = useState<string | null>(null);

  // ── Theme state ──
  const { theme: currentTheme, setTheme: setContextTheme } = useTheme();
  const [themePending, setThemePending] = useState(false);
  const [themeSuccess, setThemeSuccess] = useState<string | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);

  // ── Support state ──
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportPending, setSupportPending] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportSuccess, setSupportSuccess] = useState<string | null>(null);

  // ── Sidebar helpers ──
  const sortedPages = CONFIGURABLE_PAGES.map((p) => ({
    ...p,
    config: sidebarConfig.pages[p.href] ?? { visible: true, order: 999 },
  })).sort((a, b) => a.config.order - b.config.order);

  // ── Handlers ──

  async function handleProfileSubmit(formData: FormData) {
    setProfilePending(true); setProfileError(null); setProfileSuccess(null);
    const result = await updateProfile(formData);
    if (result?.error) setProfileError(result.error);
    if (result?.success) setProfileSuccess(result.success);
    setProfilePending(false);
  }

  async function handleWeddingSubmit(formData: FormData) {
    setWeddingPending(true); setWeddingError(null); setWeddingSuccess(null);
    formData.set("hasNoDate", String(hasNoDate));
    formData.set("currency", selectedCurrency);
    formData.set("guestCountTarget", guestCountTarget);
    const result = await updateWeddingDetailsExtended(formData);
    if (result?.error) setWeddingError(result.error);
    if (result?.success) setWeddingSuccess(result.success);
    setWeddingPending(false);
  }

  async function handlePasswordSubmit(formData: FormData) {
    setPasswordPending(true); setPasswordError(null); setPasswordSuccess(null);
    const result = await changePassword(formData);
    if (result?.error) setPasswordError(result.error);
    if (result?.success) setPasswordSuccess(result.success);
    setPasswordPending(false);
  }

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

  function togglePageVisibility(href: string) {
    setSidebarConfig((prev) => {
      const updated = { ...prev, pages: { ...prev.pages } };
      const current = updated.pages[href] ?? { visible: true, order: 999 };
      updated.pages[href] = { ...current, visible: !current.visible };
      return updated;
    });
  }

  function movePageUp(href: string) {
    setSidebarConfig((prev) => {
      const entries = CONFIGURABLE_PAGES.map((p) => ({
        href: p.href,
        config: { ...(prev.pages[p.href] ?? { visible: true, order: 999 }) },
      })).sort((a, b) => a.config.order - b.config.order);
      const idx = entries.findIndex((e) => e.href === href);
      if (idx <= 0) return prev;
      const tempOrder = entries[idx].config.order;
      entries[idx].config.order = entries[idx - 1].config.order;
      entries[idx - 1].config.order = tempOrder;
      const updated: SidebarConfig = { pages: {} };
      for (const entry of entries) updated.pages[entry.href] = entry.config;
      return updated;
    });
  }

  function movePageDown(href: string) {
    setSidebarConfig((prev) => {
      const entries = CONFIGURABLE_PAGES.map((p) => ({
        href: p.href,
        config: { ...(prev.pages[p.href] ?? { visible: true, order: 999 }) },
      })).sort((a, b) => a.config.order - b.config.order);
      const idx = entries.findIndex((e) => e.href === href);
      if (idx < 0 || idx >= entries.length - 1) return prev;
      const tempOrder = entries[idx].config.order;
      entries[idx].config.order = entries[idx + 1].config.order;
      entries[idx + 1].config.order = tempOrder;
      const updated: SidebarConfig = { pages: {} };
      for (const entry of entries) updated.pages[entry.href] = entry.config;
      return updated;
    });
  }

  async function handleSaveSidebar() {
    setSidebarPending(true); setSidebarError(null); setSidebarSuccess(null);
    const result = await updateSidebarConfig(projectId, stringifySidebarConfig(sidebarConfig));
    if (result?.error) setSidebarError(result.error);
    if (result?.success) setSidebarSuccess(result.success);
    setSidebarPending(false);
  }

  async function handleThemeChange(newTheme: string) {
    setContextTheme(newTheme);
    setThemePending(true); setThemeError(null); setThemeSuccess(null);
    const result = await updateTheme(projectId, newTheme);
    if (result?.error) setThemeError(result.error);
    if (result?.success) setThemeSuccess(result.success);
    setThemePending(false);
  }

  async function handleSendSupport() {
    if (!supportSubject.trim() || !supportMessage.trim()) return;
    setSupportPending(true); setSupportError(null); setSupportSuccess(null);
    const result = await sendSupportMessage({
      userId,
      subject: supportSubject.trim(),
      message: supportMessage.trim(),
    });
    if (result.success) {
      setSupportSuccess("Nachricht erfolgreich gesendet! Wir melden uns so schnell wie möglich.");
      setSupportSubject("");
      setSupportMessage("");
    } else {
      setSupportError(result.error || "Fehler beim Senden der Nachricht.");
    }
    setSupportPending(false);
  }

  // ── Render ────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Einstellungen"
        description="Verwalte dein Konto, Hochzeitsdetails und Einstellungen."
      />

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-primary-600 text-white shadow-sm"
                : "text-text-muted hover:text-text hover:bg-surface-2"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="space-y-6">

        {/* ════════════════════════════════════════════
            KONTO TAB
            ════════════════════════════════════════════ */}
        {activeTab === "account" && (
          <>
            {/* Personal Data */}
            <Card padding="lg">
              <SectionHeader
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                title="Persönliche Daten"
                description="Eure Namen und Kontaktdaten"
              />
              <form action={handleProfileSubmit} className="space-y-5">
                <input type="hidden" name="userId" value={userId} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <Input id="name" name="name" type="text" label="Dein Name" defaultValue={name} placeholder="Max Mustermann" required autoComplete="name" />
                  <Input id="partnerName" name="partnerName" type="text" label="Name des Partners / der Partnerin" defaultValue={partnerName} placeholder="Maria Musterfrau" required autoComplete="off" />
                </div>
                <Input id="email" name="email" type="email" label="E-Mail-Adresse" defaultValue={email} placeholder="max@beispiel.de" required autoComplete="email" />
                <FeedbackMessage error={profileError} success={profileSuccess} />
                <CardFooter>
                  <Button type="submit" variant="primary" size="lg" disabled={profilePending}>
                    {profilePending ? "Wird gespeichert..." : "Änderungen speichern"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Change Password */}
            <Card padding="lg">
              <SectionHeader
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                title="Passwort ändern"
                description="Ändere dein Anmelde-Passwort"
              />
              <form action={handlePasswordSubmit} className="space-y-5">
                <input type="hidden" name="userId" value={userId} />
                <Input id="currentPassword" name="currentPassword" type="password" label="Aktuelles Passwort" placeholder="Dein aktuelles Passwort" required autoComplete="current-password" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <Input id="newPassword" name="newPassword" type="password" label="Neues Passwort" placeholder="Mindestens 6 Zeichen" required autoComplete="new-password" />
                  <Input id="confirmNewPassword" name="confirmNewPassword" type="password" label="Neues Passwort bestätigen" placeholder="Passwort wiederholen" required autoComplete="new-password" />
                </div>
                <FeedbackMessage error={passwordError} success={passwordSuccess} />
                <CardFooter>
                  <Button type="submit" variant="primary" size="lg" disabled={passwordPending}>
                    {passwordPending ? "Wird geändert..." : "Passwort ändern"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </>
        )}

        {/* ════════════════════════════════════════════
            HOCHZEITSDETAILS TAB
            ════════════════════════════════════════════ */}
        {activeTab === "wedding" && (
          <Card padding="lg">
            <SectionHeader
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
              title="Hochzeitsdetails"
              description="Datum, Ort und weitere Details eurer Hochzeit"
            />
            <form action={handleWeddingSubmit} className="space-y-6">
              <input type="hidden" name="projectId" value={projectId} />

              {/* Date & Location */}
              <div>
                <h3 className="text-[13px] font-semibold text-text mb-3">Datum & Ort</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <Input id="weddingDate" name="weddingDate" type="date" label="Hochzeitsdatum" defaultValue={weddingDate} disabled={hasNoDate} />
                    <div className="flex items-center mt-3">
                      <input id="hasNoDate" type="checkbox" checked={hasNoDate} onChange={(e) => setHasNoDate(e.target.checked)} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
                      <label htmlFor="hasNoDate" className="ml-2 text-sm text-text-muted">Wir haben noch kein Datum</label>
                    </div>
                  </div>
                  <Input id="location" name="location" type="text" label="Ort der Hochzeit" defaultValue={location} placeholder="z.B. Berlin, Deutschland" autoComplete="off" />
                </div>
              </div>

              {/* Guest Count & Currency */}
              <div className="border-t border-border pt-5">
                <h3 className="text-[13px] font-semibold text-text mb-3">Gäste & Währung</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="guestCountTarget" className="block text-sm font-medium text-text mb-1.5">
                      Geplante Gästeanzahl
                    </label>
                    <input
                      id="guestCountTarget"
                      type="number"
                      min="0"
                      max="9999"
                      value={guestCountTarget}
                      onChange={(e) => setGuestCountTarget(e.target.value)}
                      placeholder="z.B. 120"
                      className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-surface-input text-text focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                    <p className="text-[11px] text-text-faint mt-1.5">Die Zielanzahl der Gäste für eure Hochzeit</p>
                  </div>
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-text mb-1.5">
                      Währung
                    </label>
                    <select
                      id="currency"
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-surface-input text-text focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.symbol} {c.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-text-faint mt-1.5">Wird für Budget und Kosten verwendet</p>
                  </div>
                </div>
              </div>

              <FeedbackMessage error={weddingError} success={weddingSuccess} />
              <CardFooter>
                <Button type="submit" variant="primary" size="lg" disabled={weddingPending}>
                  {weddingPending ? "Wird gespeichert..." : "Änderungen speichern"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* ════════════════════════════════════════════
            WEBSEITE TAB
            ════════════════════════════════════════════ */}
        {activeTab === "website" && (
          <Card padding="lg">
            <SectionHeader
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
              title="Hochzeitswebseite"
              description="Eure öffentliche Webseite für Gäste"
            />
            <form onSubmit={handleWebsiteSubmit} className="space-y-6">
              {/* Slug */}
              <div>
                <h3 className="text-[13px] font-semibold text-text mb-3">URL der Webseite</h3>
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
                {wsSlug && wsSlug.length >= 3 && (
                  <p className="text-[11px] text-text-faint mt-1.5">
                    Vorschau:{" "}
                    <a
                      href={`/w/${wsSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
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
                    wsIsPublic ? "translate-x-5.5" : "translate-x-1"
                  }`} />
                </button>
              </div>

              {/* Hero Image URL */}
              <div>
                <h3 className="text-[13px] font-semibold text-text mb-3">Hero-Bild</h3>
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
                <h3 className="text-[13px] font-semibold text-text mb-3">Eure Geschichte</h3>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="websiteStory" className="text-sm font-medium text-text">Text</label>
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
                <h3 className="text-[13px] font-semibold text-text mb-3">Unterkunfts-Tipps</h3>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="websiteAccommodation" className="text-sm font-medium text-text">Text</label>
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
        )}

        {/* ════════════════════════════════════════════
            SEITENLEISTE TAB
            ════════════════════════════════════════════ */}
        {activeTab === "sidebar" && (
          <>
            {/* Sidebar Configuration */}
            <Card padding="lg">
              <SectionHeader
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>}
                title="Seitenleiste anpassen"
                description="Seiten ein-/ausblenden und Reihenfolge ändern"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 bg-surface-2 rounded-lg mb-2">
                  <div className="w-8" />
                  <span className="flex-1 text-[13px] text-text-faint">Startseite & Einstellungen sind immer sichtbar</span>
                </div>
                {sortedPages.map((page, index) => (
                  <div key={page.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-colors group">
                    <div className="flex flex-col gap-0.5">
                      <button type="button" onClick={() => movePageUp(page.href)} disabled={index === 0} className="p-0.5 rounded hover:bg-surface-2 disabled:opacity-20 disabled:cursor-not-allowed text-text-faint hover:text-text-muted transition-colors" title="Nach oben">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button type="button" onClick={() => movePageDown(page.href)} disabled={index === sortedPages.length - 1} className="p-0.5 rounded hover:bg-surface-2 disabled:opacity-20 disabled:cursor-not-allowed text-text-faint hover:text-text-muted transition-colors" title="Nach unten">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                    <span className={`flex-1 text-[13px] font-medium ${page.config.visible ? "text-text" : "text-text-faint line-through"}`}>{page.name}</span>
                    <button type="button" onClick={() => togglePageVisibility(page.href)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${page.config.visible ? "bg-primary-600" : "bg-surface-2 border border-border"}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-surface-1 shadow-sm transition-transform duration-200 ${page.config.visible ? "translate-x-4.5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
              <FeedbackMessage error={sidebarError} success={sidebarSuccess} />
              <CardFooter>
                <Button type="button" variant="primary" size="lg" disabled={sidebarPending} onClick={handleSaveSidebar}>
                  {sidebarPending ? "Wird gespeichert..." : "Seitenleiste speichern"}
                </Button>
              </CardFooter>
            </Card>

            {/* Appearance / Theme */}
            <Card padding="lg">
              <SectionHeader
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                title="Erscheinungsbild"
                description="Wähle zwischen hellem und dunklem Modus"
              />
              <div className="flex gap-3">
                {[
                  { value: "light", label: "Hell", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg> },
                  { value: "dark", label: "Dunkel", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg> },
                  { value: "system", label: "System", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg> },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleThemeChange(opt.value)}
                    disabled={themePending}
                    className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 ${
                      currentTheme === opt.value
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300"
                        : "border-border hover:border-text-faint text-text-muted hover:text-text"
                    }`}
                  >
                    {opt.icon}
                    <span className="text-[13px] font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
              <FeedbackMessage error={themeError} success={themeSuccess} />
            </Card>
          </>
        )}

        {/* ════════════════════════════════════════════
            SUPPORT TAB
            ════════════════════════════════════════════ */}
        {activeTab === "support" && (
          <>
            {/* Send New Message */}
            <Card padding="lg">
              <SectionHeader
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                title="Nachricht senden"
                description="Kontaktiere unser Support-Team"
              />
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="supportSubject" className="text-sm font-medium text-text">Betreff</label>
                    <span className="text-[11px] text-text-faint">{supportSubject.length}/200</span>
                  </div>
                  <input
                    id="supportSubject"
                    type="text"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value.slice(0, 200))}
                    placeholder="Worum geht es?"
                    className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-surface-input text-text focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="supportMessage" className="text-sm font-medium text-text">Nachricht</label>
                    <span className="text-[11px] text-text-faint">{supportMessage.length}/5000</span>
                  </div>
                  <textarea
                    id="supportMessage"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value.slice(0, 5000))}
                    placeholder="Beschreibe dein Anliegen so detailliert wie möglich..."
                    rows={6}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-surface-input text-text focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  />
                </div>
                <FeedbackMessage error={supportError} success={supportSuccess} />
                <CardFooter>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={supportPending || !supportSubject.trim() || !supportMessage.trim()}
                    onClick={handleSendSupport}
                  >
                    {supportPending ? "Wird gesendet..." : "Nachricht senden"}
                  </Button>
                </CardFooter>
              </div>
            </Card>

            {/* Previous Messages */}
            <Card padding="lg">
              <SectionHeader
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                title="Bisherige Nachrichten"
                description="Dein Nachrichtenverlauf mit dem Support-Team"
              />
              {initialSupportMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">{"\uD83D\uDCEC"}</div>
                  <p className="text-sm text-text-faint">Noch keine Nachrichten gesendet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {initialSupportMessages.map((msg) => (
                    <div key={msg.id} className="border border-border rounded-xl overflow-hidden">
                      <div className="px-4 py-3 bg-surface-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[13px] font-semibold text-text">{msg.subject}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                              msg.status === "ANSWERED"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : msg.status === "CLOSED"
                                ? "bg-surface-2 text-text-faint"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                            }`}>
                              {msg.status === "OPEN" ? "Offen" : msg.status === "ANSWERED" ? "Beantwortet" : "Geschlossen"}
                            </span>
                            <span className="text-[11px] text-text-faint">
                              {new Date(msg.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-[13px] text-text-muted whitespace-pre-wrap">{msg.message}</p>
                        {msg.reply && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center">
                                <svg className="w-3 h-3 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                              </div>
                              <span className="text-[11px] font-medium text-primary-600 dark:text-primary-400">Support-Team</span>
                              {msg.repliedAt && (
                                <span className="text-[11px] text-text-faint">
                                  {new Date(msg.repliedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                </span>
                              )}
                            </div>
                            <p className="text-[13px] text-text whitespace-pre-wrap">{msg.reply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* ════════════════════════════════════════════
            ABRECHNUNG TAB
            ════════════════════════════════════════════ */}
        {activeTab === "billing" && (
          <>
            {/* Current Plan */}
            <Card padding="lg">
              <SectionHeader
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                title="Aktuelles Abo"
                description="Dein aktueller Plan und Abo-Status"
              />
              <div className="bg-surface-2 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-text">Free Plan</h3>
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 uppercase tracking-wider">Aktiv</span>
                    </div>
                    <p className="text-sm text-text-muted mt-1">Kostenloser Zugang zu allen Grundfunktionen</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-text">0 {CURRENCIES.find((c) => c.value === initialCurrency)?.symbol || "\u20AC"}</div>
                    <div className="text-[11px] text-text-faint">/ Monat</div>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {[
                    "Unbegrenzte Gäste",
                    "Budgetplanung",
                    "Aufgabenverwaltung",
                    "Sitzplan-Editor",
                    "Tagesablauf",
                    "Dienstleister-Verwaltung",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-[13px] text-text-muted">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Upgrade Teaser */}
            <Card padding="lg">
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-primary-100 dark:from-rose-500/15 dark:to-primary-500/15 mb-4">
                  <svg className="w-7 h-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-text mb-2">Premium-Funktionen bald verfügbar</h3>
                <p className="text-sm text-text-muted max-w-md mx-auto mb-5">
                  Wir arbeiten an exklusiven Premium-Features wie erweiterten RSVP-Tools, Einladungs-Designer und mehr.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[13px] font-semibold transition-colors"
                >
                  Preise und Pläne ansehen
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
