import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Heart, MessageSquare, ShieldCheck, Video, PawPrint } from "lucide-react";
import { SiteShell, LiveBadge, VerifiedBadge } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listApprovedBreeders, listLiveBreeders } from "@/lib/auth-store";
import { listPets } from "@/lib/pets-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LivePaws — Meet your next family member live" },
      {
        name: "description",
        content:
          "The live-streamed pet marketplace. Watch verified breeders and catteries raise puppies and kittens in real time, and reserve yours with escrow-backed deposits.",
      },
      { property: "og:title", content: "LivePaws — Puppies and kittens, live" },
      {
        property: "og:description",
        content: "Live-streamed puppies and kittens from verified breeders and catteries. Reserve with escrow-backed deposits.",
      },
    ],
  }),
  loader: async () => {
    const [liveBreeders, approvedBreeders, allPets] = await Promise.all([
      listLiveBreeders(),
      listApprovedBreeders(),
      listPets(),
    ]);
    return { liveBreeders, approvedBreeders, allPets };
  },
  component: Landing,
});

function Landing() {
  const { liveBreeders, approvedBreeders, allPets } = Route.useLoaderData();

  const liveEntries = liveBreeders.map((b) => ({
    ...b,
    pets: allPets.filter((p) => p.breederName === b.businessName && p.status === "Available"),
  }));

  const availablePets = allPets.filter((p) => p.status === "Available").slice(0, 3);

  const breederEntries = approvedBreeders.map((b) => ({
    ...b,
    availableCount: allPets.filter((p) => p.breederName === b.businessName && p.status === "Available").length,
  }));

  const featured = liveEntries[0];

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-warm/10" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-2">
              <LiveBadge>{liveEntries.length} live now</LiveBadge>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-trust/15 px-2.5 py-1 text-xs font-semibold text-trust">
                <ShieldCheck className="h-3.5 w-3.5" /> Escrow-backed
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Meet your next <span className="text-primary">family member</span> live before they come home.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              LivePaws streams litters of puppies and kittens in real time from verified breeders and
              catteries. Watch, chat, and reserve with a refundable deposit held in escrow — the
              trustworthy way to bring home your next companion.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/explore">
                  Explore live streams <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/breeder/apply">I'm a breeder</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-trust" /> USDA-verified breeders</span>
              <span className="inline-flex items-center gap-2"><Video className="h-4 w-4 text-live" /> Live nursery cams</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Deposits in escrow</span>
            </div>
          </div>

          <div className="relative">
            {featured && (
              <Link
                to="/live/$streamId"
                params={{ streamId: featured.slug }}
                className="group block overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
              >
                <div className="relative aspect-[4/5] w-full sm:aspect-video md:aspect-[4/5]">
                  {featured.pets[0] ? (
                    <img
                      src={featured.pets[0].image}
                      alt={featured.businessName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                      <PawPrint className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4">
                    <LiveBadge />
                  </div>
                  <div className="absolute inset-x-4 bottom-4 text-white">
                    <p className="text-xs uppercase tracking-wide opacity-80">Featured stream</p>
                    <h3 className="mt-1 text-lg font-semibold">{featured.businessName}</h3>
                    <p className="text-sm opacity-90">USDA #{featured.usdaLicense}</p>
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
            <p className="text-sm text-muted-foreground">Drop in on nurseries streaming live.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/explore">See all</Link>
          </Button>
        </div>

        {liveEntries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No breeders are live right now — check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveEntries.map((entry) => (
              <Link
                key={entry.id}
                to="/live/$streamId"
                params={{ streamId: entry.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-video overflow-hidden bg-secondary">
                  {entry.pets[0] ? (
                    <img
                      src={entry.pets[0].image}
                      alt={entry.businessName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <PawPrint className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3"><LiveBadge /></div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.pets.length} available</span>
                    <VerifiedBadge />
                  </div>
                  <h3 className="mt-1 line-clamp-1 font-semibold">{entry.businessName}</h3>
                  <p className="text-sm text-muted-foreground">USDA #{entry.usdaLicense}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured litters */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Available now</h2>
              <p className="text-sm text-muted-foreground">Reserve with a deposit, or buy in full — both held in escrow.</p>
            </div>
          </div>
          {availablePets.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/60 bg-background p-8 text-center text-sm text-muted-foreground">
              Nothing's listed as available right now — check back soon.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availablePets.map((p) => (
                <Card key={p.id} className="overflow-hidden py-0">
                  <div className="relative aspect-[4/3]">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    <span className="absolute left-3 top-3 rounded-full bg-warm px-2.5 py-1 text-xs font-bold text-warm-foreground">
                      {p.saleTerms === "full" ? "Full payment" : `Reserve for $${p.deposit}`}
                    </span>
                  </div>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="text-sm text-muted-foreground">{p.breed} · {p.breederName}</p>
                      </div>
                      <span className="text-right text-sm font-bold text-primary">${p.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link to="/checkout/$puppyId" params={{ puppyId: p.id }}>
                          {p.saleTerms === "full" ? "Buy now" : "Reserve"}
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" aria-label="Save">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Active breeders */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Verified breeders</h2>
          <p className="text-sm text-muted-foreground">USDA-licensed and reviewed before they can list or go live.</p>
        </div>
        {breederEntries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No verified breeders yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {breederEntries.map((b) => (
              <Card key={b.id} className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {b.businessName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold">{b.businessName}</p>
                      <BadgeCheck className="h-4 w-4 shrink-0 text-trust" />
                    </div>
                    <p className="text-xs text-muted-foreground">USDA #{b.usdaLicense}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{b.availableCount} available</span>
                  {b.isLive && <LiveBadge />}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" /> Chat during live streams
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        LivePaws · Ethical, transparent, live.
      </footer>
    </SiteShell>
  );
}
