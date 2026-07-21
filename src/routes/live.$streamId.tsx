import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, MessageSquare, Send, ShieldCheck, Users } from "lucide-react";
import { SiteShell, LiveBadge, VerifiedBadge } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStream } from "@/lib/mock-data";

export const Route = createFileRoute("/live/$streamId")({
  head: ({ params }) => ({
    meta: [
      { title: `Live stream — LivePaws` },
      { name: "description", content: `Watch the ${params.streamId} live stream on LivePaws.` },
    ],
  }),
  loader: ({ params }) => {
    const stream = getStream(params.streamId);
    if (!stream) throw notFound();
    return { stream };
  },
  component: LiveView,
  notFoundComponent: () => (
    <SiteShell><div className="p-10 text-center text-muted-foreground">Stream not found.</div></SiteShell>
  ),
});

const mockChat = [
  { user: "Hannah", msg: "The little cream one is melting my heart 😭", ago: "1m" },
  { user: "Marco", msg: "How much do they weigh now?", ago: "45s" },
  { user: "Cedar Ridge", msg: "Averaging 3.2 lb this week!", ago: "30s", breeder: true },
  { user: "Priya", msg: "Reserved #4 last week — can't wait!", ago: "10s" },
];

function LiveView() {
  const { stream } = Route.useLoaderData();

  return (
    <SiteShell hideBottomNav>
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_360px]">
        {/* Video */}
        <div className="relative flex flex-col bg-black">
          <div className="relative flex-1">
            <img src={stream.thumbnail} alt={stream.title} className="absolute inset-0 h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <LiveBadge />
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
                <Users className="h-3 w-3" /> {stream.viewers}
              </span>
            </div>
            <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3 text-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs opacity-80">
                  <span>{stream.breed}</span>
                  {stream.verified && <VerifiedBadge />}
                </div>
                <h1 className="mt-1 text-xl font-semibold sm:text-2xl">{stream.title}</h1>
                <p className="text-sm opacity-90">{stream.breeder}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Heart className="mr-1.5 h-4 w-4" /> 1.2k
                </Button>
                <Button asChild size="sm">
                  <Link to="/checkout/$puppyId" params={{ puppyId: "pup-01" }}>
                    Reserve a puppy
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 bg-background px-4 py-4 text-sm">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-4 text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-trust"><ShieldCheck className="h-4 w-4" /> Escrow protected</span>
              <span>·</span>
              <span>USDA license verified</span>
              <span>·</span>
              <span>Health-tested parents</span>
            </div>
          </div>
        </div>

        {/* Chat */}
        <aside className="flex min-h-[500px] flex-col border-l border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-2 font-semibold">
              <MessageSquare className="h-4 w-4" /> Live chat
            </div>
            <span className="text-xs text-muted-foreground">{stream.viewers} watching</span>
          </div>
          <ul className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {mockChat.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span
                  className={
                    c.breeder
                      ? "shrink-0 font-semibold text-trust"
                      : "shrink-0 font-semibold text-foreground"
                  }
                >
                  {c.user}
                  {c.breeder && <span className="ml-1 rounded bg-trust/15 px-1 py-0.5 text-[10px] uppercase">Breeder</span>}
                </span>
                <span className="min-w-0 flex-1 text-muted-foreground">{c.msg}</span>
                <span className="shrink-0 text-xs text-muted-foreground/70">{c.ago}</span>
              </li>
            ))}
          </ul>
          <form className="flex items-center gap-2 border-t border-border/60 p-3">
            <Input placeholder="Say hi to the breeder…" className="flex-1" />
            <Button type="submit" size="icon" aria-label="Send"><Send className="h-4 w-4" /></Button>
          </form>
        </aside>
      </div>
    </SiteShell>
  );
}
