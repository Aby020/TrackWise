import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { Topbar } from "./Topbar";
import { PageTransition } from "./PageTransition";

/**
 * Authenticated app shell: fixed dark-glass sidebar, sticky topbar, and a
 * max-width content canvas with route-change entrance animation.
 */
export function AppShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setDrawerOpen(true)} />
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
