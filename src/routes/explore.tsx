import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Search, Users } from "lucide-react";
import { SiteShell, LiveBadge, VerifiedBadge } from "@/components/site-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { streams } from "@/lib/mock-data";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore live streams — LivePaws" },
      { name: "description", content: "Browse live puppy streams and upcoming Puppy Hour schedules from verified breeders." },
      { property: "og:title", content: "Explore live streams — LivePaws" },
      { property: "og:description", content: "Browse live streams and upcoming Puppy Hour schedules." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const live = streams.filter((s) => s.isLive);
  const upcoming = streams.filter((s) => !s.isLive);

  return (
    <SiteShell>
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore</h1>
          <p className="mt-1 text-muted-foreground">Live nurseries and scheduled Puppy Hours.</p>
          <div className="mt-5 flex max-w-xl items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search breed, breeder, or city…"
              className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Tabs defaultValue="live">
          <TabsList>
            <TabsTrigger value="live">Live now ({live.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Puppy Hour ({upcoming.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6">
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
                      <span>{s.breed}</span>
                      {s.verified && <VerifiedBadge />}
                    </div>
                    <h3 className="mt-1 line-clamp-1 font-semibold">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.breeder}</p>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
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
          </TabsContent>
        </Tabs>
      </section>
    </SiteShell>
  );
}
