import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, Home, LayoutDashboard, Moon, PawPrint, Sun, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyTheme, getInitialTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/live/sunday-goldens", label: "Live", icon: Video },
  { to: "/breeder/dashboard", label: "Breeder", icon: LayoutDashboard },
] as const;

export function TopNav() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <PawPrint className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">
            Live<span className="text-primary">Paws</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label }) => {
            const active =
              to === "/" ? pathname === "/" : pathname.startsWith(to.split("/").slice(0, 2).join("/"));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/explore">Watch live</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {links.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/" ? pathname === "/" : pathname.startsWith(to.split("/").slice(0, 2).join("/"));
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
