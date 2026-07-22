import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PawPrint, Search, ShieldCheck, CalendarClock } from "lucide-react";
import { SiteShell, LiveBadge, VerifiedBadge } from "@/components/site-shell";
import { Input } from "@/components/ui/input";
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
import { CAT_BREEDS, DOG_BREEDS, type Species } from "@/lib/mock-data";
import { listLiveBreeders } from "@/lib/auth-store";
import { listPets, type Pet } from "@/lib/pets-store";

type CategoryFilter = "all" | Species;

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): { species?: Species } => ({
    species: search.species === "dog" || search.species === "cat" ? search.species : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore live streams — LivePaws" },
      { name: "description", content: "Browse live puppy and kitten streams from verified breeders and catteries." },
    ],
  }),
  loader: async () => {
    const liveBreeders = await listLiveBreeders();
    const allPets = await listPets();
    return { liveBreeders, allPets };
  },
  component: Explore,
});

const CATEGORIES: { id: CategoryFilter; label: string; emoji: string }[] = [
  { id: "all", label: "All Pets", emoji: "🐾" },
  { id: "dog", label: "Dogs", emoji: "🐶" },
  { id: "cat", label: "Cats", emoji: "🐱" },
];

function speciesOf(pet: Pet): Species {
  return pet.species === "Cat" ? "cat" : "dog";
}

function Explore() {
  const { species } = Route.useSearch();
  const { liveBreeders, allPets } = Route.useLoaderData();
  const [category, setCategory] = useState<CategoryFilter>(species ?? "all");
  const [breed, setBreed] = useState<string>("all");
  const [search, setSearch] = useState("");

  const onCategory = (id: CategoryFilter) => {
    setCategory(id);
    setBreed("all");
  };

  // Group real available pets under each real live breeder
  const entries = useMemo(() => {
    return liveBreeders.map((b) => ({
      ...b,
      pets: allPets.filter((p) => p.breederName === b.businessName && p.status === "Available"),
    }));
  }, [liveBreeders, allPets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (q && !entry.businessName.toLowerCase().includes(q) && !entry.pets.some((p) => p.breed.toLowerCase().includes(q))) {
        return false;
      }
      // No filter applied — show every live breeder, even ones with nothing listed yet.
      if (category === "all" && breed === "all") return true;
      // Otherwise, only show breeders with at least one matching available pet.
      return entry.pets.some((p) => {
        if (category !== "all" && speciesOf(p) !== category) return false;
        if (breed !== "all" && p.breed !== breed) return false;
        return true;
      });
    });
  }, [entries, category, breed, search]);

  return (
    <SiteShell>
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore</h1>
          <p className="mt-1 text-muted-foreground">Live nurseries from verified breeders and catteries.</p>

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
                placeholder="Search breeder or breed…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            <TabsTrigger value="live">Live now ({filtered.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Scheduled showcases</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6">
            {filtered.length === 0 ? (
              <EmptyState
                message={
                  entries.length === 0
                    ? "No breeders are live right now — check back soon."
                    : "No live breeders match this filter right now."
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((entry) => {
                  const cover = entry.pets[0];
                  const breeds = [...new Set(entry.pets.map((p) => p.breed))];
                  return (
                    <Link
                      key={entry.id}
                      to="/live/$streamId"
                      params={{ streamId: entry.slug }}
                      className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                    >
                      <div className="relative aspect-video overflow-hidden bg-secondary">
                        {cover ? (
                          <img
                            src={cover.image}
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
                          <span>{breeds.length > 0 ? breeds.join(", ") : "No pets listed yet"}</span>
                          <VerifiedBadge />
                        </div>
                        <h3 className="mt-1 line-clamp-1 font-semibold">{entry.businessName}</h3>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ShieldCheck className="h-3 w-3" /> USDA #{entry.usdaLicense}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <CalendarClock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">Scheduling isn't built yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Breeders can't schedule future streams yet — for now, check the "Live now" tab to see who's
                broadcasting right this moment.
              </p>
            </div>
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
