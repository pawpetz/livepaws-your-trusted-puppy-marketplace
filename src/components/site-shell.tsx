import type { ReactNode } from "react";
import { BottomNav, TopNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function SiteShell({ children, hideBottomNav = false }: { children: ReactNode; hideBottomNav?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopNav />
      <main className={"flex-1 " + (hideBottomNav ? "" : "pb-20 md:pb-0")}>
        {children}
        <SiteFooter />
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

export function LiveBadge({ children = "LIVE" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-live-foreground">
      <span className="live-pulse h-1.5 w-1.5 rounded-full bg-live-foreground" />
      {children}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-trust/15 px-2 py-0.5 text-xs font-semibold text-trust">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
        <path d="M12 2l2.4 2.1 3.2-.4.6 3.1 2.8 1.6-1.4 2.9 1.4 2.9-2.8 1.6-.6 3.1-3.2-.4L12 20l-2.4-2.1-3.2.4-.6-3.1-2.8-1.6 1.4-2.9L3 7.8l2.8-1.6.6-3.1 3.2.4L12 2z" />
      </svg>
      Verified
    </span>
  );
}
