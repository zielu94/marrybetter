"use client";

import Sidebar, { SidebarProvider, useSidebar } from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ThemeProvider from "@/providers/ThemeProvider";
import { useSession } from "next-auth/react";

interface AppLayoutClientProps {
  children: React.ReactNode;
  sidebarConfigRaw: string;
  theme: string;
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { mobileOpen, setMobileOpen, collapsed } = useSidebar();

  const sidebarWidth = collapsed ? "w-[60px]" : "w-60";
  const sidebarMargin = collapsed ? "lg:ml-[60px]" : "lg:ml-60";

  return (
    <div className="min-h-screen flex bg-surface-muted">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:block ${sidebarWidth} fixed inset-y-0 left-0 z-10 transition-all duration-200 ease-in-out overflow-visible`}>
        <Sidebar collapsed={collapsed} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-60 z-30 lg:hidden">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className={`flex-1 ${sidebarMargin} flex flex-col overflow-hidden transition-all duration-200 ease-in-out`}>
        <Topbar
          userName={session?.user?.name}
          partnerName={null}
          weddingDate={null}
        />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AppLayoutClient({ children, sidebarConfigRaw, theme }: AppLayoutClientProps) {
  return (
    <ThemeProvider theme={theme}>
      <SidebarProvider sidebarConfigRaw={sidebarConfigRaw}>
        <AppLayoutContent>{children}</AppLayoutContent>
      </SidebarProvider>
    </ThemeProvider>
  );
}
