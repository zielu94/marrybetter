// Sidebar configuration utilities

export interface SidebarPageConfig {
  visible: boolean;
  order: number;
}

export interface SidebarConfig {
  pages: Record<string, SidebarPageConfig>;
}

// These pages are always visible and cannot be hidden
export const ALWAYS_VISIBLE_PAGES = ["/dashboard", "/settings"];

// Default sidebar pages in order (excluding always-visible)
export const CONFIGURABLE_PAGES = [
  { href: "/budget", name: "Budget" },
  { href: "/tasks", name: "Aufgaben" },
  { href: "/schedule", name: "Zeitplan" },
  { href: "/calendar", name: "Kalender" },
  { href: "/vendors", name: "Dienstleister" },
  { href: "/venues", name: "Locations" },
  { href: "/guests", name: "Gästeliste" },
  { href: "/weddingparty", name: "Hochzeitsgesellschaft" },
  { href: "/seating", name: "Sitzplan" },
  { href: "/food", name: "Essen & Trinken" },
  { href: "/packing", name: "Packliste" },
  { href: "/photos", name: "Fotos" },
  { href: "/moodboard", name: "Moodboard" },
  { href: "/songs", name: "Songs" },
  { href: "/honeymoon", name: "Flitterwochen" },
  { href: "/website", name: "Webseite" },
];

export function getDefaultSidebarConfig(): SidebarConfig {
  const pages: Record<string, SidebarPageConfig> = {};
  CONFIGURABLE_PAGES.forEach((page, index) => {
    pages[page.href] = { visible: true, order: index };
  });
  return { pages };
}

export function parseSidebarConfig(raw: string | null | undefined): SidebarConfig {
  if (!raw || raw === "{}") return getDefaultSidebarConfig();
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.pages) {
      // Merge with defaults to ensure all pages are present
      const defaults = getDefaultSidebarConfig();
      for (const href of Object.keys(defaults.pages)) {
        if (!parsed.pages[href]) {
          parsed.pages[href] = defaults.pages[href];
        }
      }
      return parsed as SidebarConfig;
    }
    return getDefaultSidebarConfig();
  } catch {
    return getDefaultSidebarConfig();
  }
}

export function stringifySidebarConfig(config: SidebarConfig): string {
  return JSON.stringify(config);
}
