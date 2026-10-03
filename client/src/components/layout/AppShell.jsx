import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { Topbar } from "./Topbar";
import { PageTransition } from "./PageTransition";
import { ErrorBoundary } from "../ui/ErrorBoundary";

/**
 * Authenticated app shell: fixed dark sidebar, sticky topbar, and a
 * max-width content canvas with route-change entrance animation.
 * The page subtree is isolated so a failing view never whites out.
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
          <PageTransition>
            <ErrorBoundary>{children}</ErrorBoundary>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
