import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Heart,
  Send,
  Share2,
  ShieldCheck,
  Users,
  Video,
  X,
} from "lucide-react";
import { SiteShell, LiveBadge } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { getStream } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

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
    <SiteShell>
      <div className="p-10 text-center text-muted-foreground">Stream not found.</div>
    </SiteShell>
  ),
});

// ── Puppies pinned to this stream ──────────────────────────────
type PinnedPuppy = {
  id: string;
  name: string;
  breed: string;
  price: number;
  deposit: number;
  microchip: string;
  status: "Available" | "Reserved" | "On hold";
  image: string;
};

const dogPinned: PinnedPuppy[] = [
  {
    id: "pup-blue",
    name: "Blue Collar Male — Frenchie",
    breed: "French Bulldog",
    price: 2800,
    deposit: 250,
    microchip: "985 141 002 883 041",
    status: "Available",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "pup-red",
    name: "Red Collar Female — Frenchie",
    breed: "French Bulldog",
    price: 3200,
    deposit: 250,
    microchip: "985 141 002 883 052",
    status: "Available",
    image: "https://images.unsplash.com/photo-1612774412771-005ed8e861d2?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "pup-green",
    name: "Green Collar Male — Frenchie",
    breed: "French Bulldog",
    price: 2600,
    deposit: 250,
    microchip: "985 141 002 883 067",
    status: "On hold",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=60",
  },
];

const catPinned: PinnedPuppy[] = [
  {
    id: "kit-silver",
    name: "Silver Tabby Female — Maine Coon",
    breed: "Maine Coon",
    price: 2200,
    deposit: 250,
    microchip: "985 141 004 771 018",
    status: "Available",
    image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "kit-blue",
    name: "Blue Mitted Male — Ragdoll",
    breed: "Ragdoll",
    price: 2400,
    deposit: 250,
    microchip: "985 141 004 771 022",
    status: "Available",
    image: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "kit-lilac",
    name: "Lilac Point Female — Ragdoll",
    breed: "Ragdoll",
    price: 2600,
    deposit: 250,
    microchip: "985 141 004 771 034",
    status: "On hold",
    image: "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?auto=format&fit=crop&w=800&q=60",
  },
];

// ── Chat with contact-sharing guard ───────────────────────────
const CONTACT_REGEX =
  /(\+?\d[\d\s().-]{7,}\d)|((https?:\/\/|www\.)\S+)|(\b[\w.+-]+@[\w-]+\.[\w.-]+\b)/gi;

function sanitize(msg: string): { text: string; masked: boolean } {
  let masked = false;
  const text = msg.replace(CONTACT_REGEX, () => {
    masked = true;
    return "•••••";
  });
  return { text, masked };
}

type ChatMsg = { id: number; user: string; msg: string; breeder?: boolean };

const seedChat: ChatMsg[] = [
  { id: 1, user: "Hannah", msg: "That little blue collar boy is EVERYTHING 😍" },
  { id: 2, user: "Marco", msg: "How much are they going for?" },
  { id: 3, user: "StoneHighland", msg: "Blue is $2,800, deposit holds him!", breeder: true },
  { id: 4, user: "Priya", msg: "Can you DM me at 555-123-4567?" },
  { id: 5, user: "Devon", msg: "Check my site www.puppyplug.co for trades" },
  { id: 6, user: "Ana", msg: "Reserved red collar last stream — so excited!" },
];

const chatPool = [
  "How much for the fawn one?",
  "Are the parents on site?",
  "Do you ship to CA?",
  "Blue collar melting my heart 🥺",
  "email me at buyer@mail.com",
  "call 415 555 9911",
  "OMG the puppy pile 😭",
  "Health tested? OFA?",
  "Just placed a deposit!",
  "Any girls left?",
];
const chatUsers = ["Kai", "Zoë", "Sam", "Riley", "Jordan", "Wren", "Ivy", "Theo"];

function LiveView() {
  const { stream } = Route.useLoaderData();
  const isCat = stream.species === "cat";
  const pinnedPuppies = isCat ? catPinned : dogPinned;
  const registryLabel = stream.registry ?? (isCat ? "TICA Registered" : "USDA Licensed");
  const kindLabel = isCat ? "kittens" : "puppies";
  const [chat, setChat] = useState<ChatMsg[]>(seedChat);
  const [likes, setLikes] = useState(1284);
  const [liked, setLiked] = useState(false);
  const [reserving, setReserving] = useState<PinnedPuppy | null>(null);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLUListElement>(null);
  const nextId = useRef(seedChat.length + 1);

  // Auto-scroll chat
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [chat]);

  // Simulate live chat
  useEffect(() => {
    const t = setInterval(() => {
      const user = chatUsers[Math.floor(Math.random() * chatUsers.length)];
      const msg = chatPool[Math.floor(Math.random() * chatPool.length)];
      setChat((prev) =>
        [...prev, { id: nextId.current++, user, msg }].slice(-30),
      );
    }, 3200);
    return () => clearInterval(t);
  }, []);

  const sanitized = useMemo(
    () => chat.map((c) => ({ ...c, ...sanitize(c.msg) })),
    [chat],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setChat((prev) => [...prev, { id: nextId.current++, user: "You", msg: input }].slice(-30));
    setInput("");
  };

  const toggleLike = () => {
    setLikes((n) => n + (liked ? -1 : 1));
    setLiked((v) => !v);
  };

  return (
    <SiteShell hideBottomNav>
      <div className="mx-auto flex w-full max-w-md flex-col bg-black md:max-w-lg">
        <div className="relative aspect-[9/16] w-full overflow-hidden bg-neutral-900">
          {/* Video (mock) */}
          <img
            src={stream.thumbnail}
            alt={stream.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/0 to-black/80" />

          {/* Top overlay */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <div className="flex min-w-0 items-center gap-2 rounded-full bg-black/45 p-1 pr-3 backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=200&q=60"
                alt="StoneHighlandFrenchies"
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-live"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="truncate text-sm font-semibold text-white">StoneHighlandFrenchies</p>
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-trust" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-trust/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-trust-foreground">
                    <ShieldCheck className="h-2.5 w-2.5" /> USDA Licensed
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LiveBadge />
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
                <Users className="h-3 w-3" /> {stream.viewers}
              </span>
              <Button asChild size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70">
                <Link to="/explore" aria-label="Exit stream"><X className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          {/* Right-side floating actions */}
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3">
            <FloatingAction
              icon={<Heart className={cn("h-5 w-5", liked && "fill-live text-live")} />}
              label={likes.toLocaleString()}
              onClick={toggleLike}
              active={liked}
            />
            <FloatingAction
              icon={<Share2 className="h-5 w-5" />}
              label="Share"
              onClick={() => navigator.share?.({ title: stream.title, url: window.location.href }).catch(() => {})}
            />
            <FloatingAction
              icon={<Video className="h-5 w-5" />}
              label="1-on-1"
              tone="primary"
            />
          </div>

          {/* Pinned litter carousel */}
          <div className="absolute inset-x-0 bottom-[42%] px-3">
            <div className="flex items-center justify-between pb-1.5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                On camera now
              </p>
              <span className="text-[11px] opacity-70">{pinnedPuppies.length} puppies</span>
            </div>
            <div className="-mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {pinnedPuppies.map((p) => (
                <PuppyCard key={p.id} puppy={p} onReserve={() => setReserving(p)} />
              ))}
            </div>
          </div>

          {/* Floating chat feed (bottom-left) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 px-3 pb-3">
            <ul
              ref={chatRef}
              className="pointer-events-auto max-h-40 space-y-1.5 overflow-y-auto pr-16 [mask-image:linear-gradient(to_bottom,transparent,black_25%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {sanitized.map((c) => (
                <li
                  key={c.id}
                  className="animate-fade-in flex flex-col gap-0.5 rounded-2xl bg-black/45 px-3 py-1.5 text-sm text-white backdrop-blur"
                >
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "text-[11px] font-semibold",
                        c.breeder ? "text-trust" : "text-white/90",
                      )}
                    >
                      {c.user}
                      {c.breeder && (
                        <span className="ml-1 rounded bg-trust/25 px-1 text-[9px] uppercase text-trust">
                          Breeder
                        </span>
                      )}
                    </span>
                    <span className="text-sm leading-snug">{c.text}</span>
                  </div>
                  {c.masked && (
                    <span className="text-[10px] italic text-warm">
                      For your protection, contact sharing is disabled.
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Composer */}
            <form
              onSubmit={submit}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/50 p-1 pl-4 backdrop-blur"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Say something nice…"
                className="h-8 flex-1 border-0 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0"
              />
              <Button type="submit" size="icon" className="h-8 w-8 rounded-full" aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Reserve drawer */}
      <Drawer open={!!reserving} onOpenChange={(o) => !o && setReserving(null)}>
        <DrawerContent>
          {reserving && (
            <div className="mx-auto w-full max-w-md">
              <DrawerHeader className="text-left">
                <div className="flex items-center gap-3">
                  <img src={reserving.image} alt={reserving.name} className="h-16 w-16 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <DrawerTitle className="truncate">{reserving.name}</DrawerTitle>
                    <DrawerDescription>{reserving.breed} · ${reserving.price.toLocaleString()}</DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>

              <div className="space-y-3 px-4 pb-2">
                <InfoRow
                  icon={<BadgeCheck className="h-4 w-4 text-trust" />}
                  label="Microchip ID"
                  value={reserving.microchip}
                />
                <InfoRow
                  icon={<ShieldCheck className="h-4 w-4 text-trust" />}
                  label="1-Year Health Guarantee"
                  value="Full refund or replacement for congenital defects diagnosed within 12 months."
                  multi
                />
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Escrow deposit</span>
                    <span className="text-lg font-bold text-primary">${reserving.deposit}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Held by LivePaws until pickup. Fully refundable per our health guarantee.
                  </p>
                </div>
              </div>

              <DrawerFooter>
                <Button asChild size="lg">
                  <Link to="/checkout/$puppyId" params={{ puppyId: reserving.id }}>
                    Proceed to Escrow Checkout
                  </Link>
                </Button>
                <DrawerClose asChild>
                  <Button variant="ghost">Keep watching</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </SiteShell>
  );
}

function FloatingAction({
  icon,
  label,
  onClick,
  active,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  tone?: "primary";
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-[10px] font-semibold text-white"
    >
      <span
        className={cn(
          "grid h-11 w-11 place-items-center rounded-full backdrop-blur transition-colors",
          tone === "primary"
            ? "bg-primary text-primary-foreground"
            : active
              ? "bg-live/90 text-live-foreground"
              : "bg-black/50 hover:bg-black/70",
        )}
      >
        {icon}
      </span>
      <span className="rounded-full bg-black/40 px-1.5 py-0.5">{label}</span>
    </button>
  );
}

function PuppyCard({ puppy, onReserve }: { puppy: PinnedPuppy; onReserve: () => void }) {
  const disabled = puppy.status !== "Available";
  return (
    <div className="snap-start w-64 shrink-0 overflow-hidden rounded-2xl bg-card text-card-foreground shadow-lg">
      <div className="flex gap-3 p-2.5">
        <img src={puppy.image} alt={puppy.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{puppy.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{puppy.breed}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-sm font-bold text-primary">${puppy.price.toLocaleString()}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                puppy.status === "Available"
                  ? "bg-trust/15 text-trust"
                  : puppy.status === "Reserved"
                    ? "bg-muted text-muted-foreground"
                    : "bg-warm/25 text-warm-foreground",
              )}
            >
              {puppy.status}
            </span>
          </div>
        </div>
      </div>
      <Button
        onClick={onReserve}
        disabled={disabled}
        className="w-full rounded-none rounded-b-2xl"
        size="sm"
      >
        {disabled ? puppy.status : `Reserve with $${puppy.deposit} Deposit`}
      </Button>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  multi,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  multi?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <p className={cn("mt-1 text-foreground", multi ? "text-sm" : "font-mono text-sm")}>{value}</p>
    </div>
  );
}
