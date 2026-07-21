import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Heart, MessageSquare, ShieldCheck, Video } from "lucide-react";
import { SiteShell, LiveBadge, VerifiedBadge } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { breeders, litters, streams } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LivePaws — Watch litters live, meet ethical breeders" },
      {
        name: "description",
        content:
          "The live-streamed pet marketplace. Watch verified breeders raise puppies in real time and reserve yours with secure escrow.",
      },
      { property: "og:title", content: "LivePaws — Watch litters live" },
      {
        property: "og:description",
        content: "Live-streamed litters from verified breeders. Reserve with escrow-backed deposits.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const live = streams.filter((s) => s.isLive);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-warm/10" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-2">
              <LiveBadge>{live.length} live now</LiveBadge>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-trust/15 px-2.5 py-1 text-xs font-semibold text-trust">
                <ShieldCheck className="h-3.5 w-3.5" /> Escrow-backed
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Meet your puppy <span className="text-primary">before</span> you meet your puppy.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              LivePaws streams litters in real time from verified breeders. Watch, chat, and reserve
              with a refundable deposit held in escrow — the trustworthy way to bring home a pup.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/explore">
                  Explore live streams <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/breeder/dashboard">I'm a breeder</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-trust" /> USDA-verified breeders</span>
              <span className="inline-flex items-center gap-2"><Video className="h-4 w-4 text-live" /> 24/7 nursery cams</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Deposits in escrow</span>
            </div>
          </div>

          <div className="relative">
            {live[0] && (
              <Link
                to="/live/$streamId"
                params={{ streamId: live[0].id }}
                className="group block overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
              >
                <div className="relative aspect-[4/5] w-full sm:aspect-video md:aspect-[4/5]">
                  <img src={live[0].thumbnail} alt={live[0].title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <LiveBadge />
                    <span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
                      {live[0].viewers} watching
                    </span>
                  </div>
                  <div className="absolute inset-x-4 bottom-4 text-white">
                    <p className="text-xs uppercase tracking-wide opacity-80">Featured stream</p>
                    <h3 className="mt-1 text-lg font-semibold">{live[0].title}</h3>
                    <p className="text-sm opacity-90">{live[0].breeder}</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Live now strip */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Live right now</h2>
            <p className="text-sm text-muted-foreground">Drop in on nurseries around the country.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/explore">See all</Link>
          </Button>
        </div>

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
                <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
                  {s.viewers}
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
      </section>

      {/* Featured litters */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured litters</h2>
              <p className="text-sm text-muted-foreground">Reserve with a refundable escrow deposit.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {litters.map((l) => (
              <Card key={l.id} className="overflow-hidden py-0">
                <div className="relative aspect-[4/3]">
                  <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-warm px-2.5 py-1 text-xs font-bold text-warm-foreground">
                    {l.available} available
                  </span>
                </div>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{l.name}</h3>
                      <p className="text-sm text-muted-foreground">{l.breed} · {l.breeder}</p>
                    </div>
                    <span className="text-right text-sm font-bold text-primary">${l.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link to="/checkout/$puppyId" params={{ puppyId: "pup-01" }}>Reserve</Link>
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Save">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Active breeders */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Active breeders</h2>
          <p className="text-sm text-muted-foreground">Verified, USDA-licensed, and streaming this week.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {breeders.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-center gap-3">
                <img src={b.avatar} alt={b.name} className="h-12 w-12 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold">{b.name}</p>
                    {b.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-trust" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{b.location}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold">★ {b.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">{b.litters} active litters</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" /> Chat during live streams
              </div>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        LivePaws · Ethical, transparent, live.
      </footer>
    </SiteShell>
  );
}
