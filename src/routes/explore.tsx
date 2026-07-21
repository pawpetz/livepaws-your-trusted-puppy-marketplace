import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar, PawPrint, Search, Users } from "lucide-react";
import { SiteShell, LiveBadge, VerifiedBadge } from "@/components/site-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CAT_BREEDS, DOG_BREEDS, streams, type Species } from "@/lib/mock-data";

type CategoryFilter = "all" | Species;

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore live streams — LivePaws" },
      { name: "description", content: "Browse live puppy and kitten streams and upcoming Pet Showcase schedules from verified breeders and catteries." },
      { property: "og:title", content: "Explore live streams — LivePaws" },
      { property: "og:description", content: "Browse live puppy and kitten streams and upcoming Pet Showcase schedules." },
    ],
  }),
  component: Explore,
});

const CATEGORIES: { id: CategoryFilter; label: string; emoji: string }[] = [
  { id: "all", label: "All Pets", emoji: "🐾" },
  { id: "dog", label: "Dogs", emoji: "🐶" },
  { id: "cat", label: "Cats", emoji: "🐱" },
];

function Explore() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [breed, setBreed] = useState<string>("all");

  // Reset breed when category changes to avoid mismatched selections
  const onCategory = (id: CategoryFilter) => {
    setCategory(id);
    setBreed("all");
  };

  const filtered = useMemo(() => {
    return streams.filter((s) => {
      if (category !== "all" && s.species !== category) return false;
      if (breed !== "all" && s.breed !== breed) return false;
      return true;
    });
  }, [category, breed]);

  const live = filtered.filter((s) => s.isLive);
  const upcoming = filtered.filter((s) => !s.isLive);

  return (
    <SiteShell>
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore</h1>
          <p className="mt-1 text-muted-foreground">Live nurseries and scheduled Pet Showcases.</p>

          {/* Category chips */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onCategory(c.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background hover:bg-secondary",
                  )}
                  aria-pressed={active}
                >
                  <span aria-hidden>{c.emoji}</span>
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex max-w-xl flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search breed, breeder, or city…"
                className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Select value={breed} onValueChange={setBreed}>
              <SelectTrigger className="w-full sm:w-56">
                <PawPrint className="mr-1 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All breeds</SelectItem>
                {(category === "all" || category === "dog") && (
                  <SelectGroup>
                    <SelectLabel>Dog breeds</SelectLabel>
                    {DOG_BREEDS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {(category === "all" || category === "cat") && (
                  <SelectGroup>
                    <SelectLabel>Cat breeds</SelectLabel>
                    {CAT_BREEDS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Tabs defaultValue="live">
          <TabsList>
            <TabsTrigger value="live">Live now ({live.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Pet Showcase ({upcoming.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6">
            {live.length === 0 ? (
              <EmptyState message="No live streams match this filter yet." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {live.map((s) => (
                  <Link
                    key={s.id}
                    to="/live/$streamId"
                    params={{ streamId: s.id }}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img src={s.thumbnail} alt={s.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute left-3 top-3"><LiveBadge /></div>
                      <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
                        <Users className="h-3 w-3" /> {s.viewers}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span aria-hidden>{s.species === "cat" ? "🐱" : "🐶"}</span>
                        <span>{s.breed}</span>
                        {s.verified && <VerifiedBadge />}
                      </div>
                      <h3 className="mt-1 line-clamp-1 font-semibold">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.breeder}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {upcoming.length === 0 ? (
              <EmptyState message="No upcoming showcases match this filter yet." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((s) => (
                  <div key={s.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="relative aspect-video overflow-hidden">
                      <img src={s.thumbnail} alt={s.title} className="h-full w-full object-cover opacity-90" />
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-warm px-2.5 py-1 text-xs font-bold text-warm-foreground">
                        <Calendar className="h-3 w-3" /> {s.scheduledFor}
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span aria-hidden>{s.species === "cat" ? "🐱" : "🐶"}</span>
                          <span>{s.breed}</span>
                          {s.verified && <VerifiedBadge />}
                        </div>
                        <h3 className="mt-1 line-clamp-1 font-semibold">{s.title}</h3>
                        <p className="text-sm text-muted-foreground">{s.breeder}</p>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">Remind me</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </SiteShell>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
