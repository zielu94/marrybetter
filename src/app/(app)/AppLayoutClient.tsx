"use client";

import Sidebar, { SidebarProvider, useSidebar } from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ThemeProvider from "@/providers/ThemeProvider";
import { useSession } from "next-auth/react";

interface AppLayoutClientProps {
  children: React.ReactNode;
  sidebarConfigRaw: string;
  theme: string;
  userImage?: string | null;
  userRole?: string;
  projectCoupleName?: string | null;
}

function AppLayoutContent({
  children,
  userImage,
  userRole,
  projectCoupleName,
}: {
  children: React.ReactNode;
  userImage?: string | null;
  userRole?: string;
  projectCoupleName?: string | null;
}) {
  const { data: session } = useSession();
  const { mobileOpen, setMobileOpen, collapsed } = useSidebar();

  const sidebarWidth = collapsed ? "w-[60px]" : "w-60";
  const sidebarMargin = collapsed ? "lg:ml-[60px]" : "lg:ml-60";

  return (
    <div className="min-h-screen flex bg-surface-muted">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:block ${sidebarWidth} fixed inset-y-0 left-0 z-10 transition-all duration-200 ease-in-out overflow-visible`}>
        <Sidebar collapsed={collapsed} userRole={userRole} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-60 z-30 lg:hidden">
            <Sidebar onClose={() => setMobileOpen(false)} userRole={userRole} />
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className={`flex-1 ${sidebarMargin} flex flex-col overflow-hidden transition-all duration-200 ease-in-out`}>
        <Topbar
          userName={session?.user?.name}
          partnerName={null}
          weddingDate={null}
          userImage={userImage}
          userRole={userRole}
          projectCoupleName={projectCoupleName}
        />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AppLayoutClient({
  children,
  sidebarConfigRaw,
  theme,
  userImage,
  userRole,
  projectCoupleName,
}: AppLayoutClientProps) {
  return (
    <ThemeProvider theme={theme}>
      <SidebarProvider sidebarConfigRaw={sidebarConfigRaw}>
        <AppLayoutContent
          userImage={userImage}
          userRole={userRole}
          projectCoupleName={projectCoupleName}
        >
          {children}
        </AppLayoutContent>
      </SidebarProvider>
    </ThemeProvider>
  );
}
