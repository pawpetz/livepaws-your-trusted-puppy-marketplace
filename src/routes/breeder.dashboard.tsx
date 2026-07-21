import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck2,
  FileUp,
  Mic,
  MicOff,
  Pin,
  Plus,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
  Upload,
  Video,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { litters } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/breeder/dashboard")({
  head: () => ({
    meta: [
      { title: "Breeder dashboard — LivePaws" },
      {
        name: "description",
        content:
          "Go live, manage litters and puppies, and track escrow payouts from one breeder command center.",
      },
    ],
  }),
  component: Dashboard,
});

type QAItem = { id: string; user: string; question: string; featured: boolean };

const initialQuestions: QAItem[] = [
  { id: "q1", user: "@emma_r", question: "How much do the boys weigh at 5 weeks?", featured: true },
  { id: "q2", user: "@marcus", question: "Are the parents OFA hip certified?", featured: false },
  { id: "q3", user: "@lila.k", question: "What food are you weaning them on?", featured: false },
  { id: "q4", user: "@dogdad91", question: "Any merles in this litter?", featured: false },
];

type PuppyRow = {
  id: string;
  name: string;
  image: string;
  microchip: string;
  healthCert: "verified" | "pending" | "missing";
  price: number;
  available: boolean;
};

const puppyRows: Record<string, PuppyRow[]> = {
  "goldens-may": [
    { id: "p1", name: "Biscuit", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=60", microchip: "985 141 000 123 456", healthCert: "verified", price: 3200, available: true },
    { id: "p2", name: "Maple", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=60", microchip: "985 141 000 123 457", healthCert: "verified", price: 3200, available: true },
    { id: "p3", name: "Rusty", image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=60", microchip: "985 141 000 123 458", healthCert: "pending", price: 3400, available: false },
  ],
  "frenchies-spring": [
    { id: "p4", name: "Olive", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=60", microchip: "985 141 000 220 001", healthCert: "verified", price: 4800, available: true },
    { id: "p5", name: "Blue", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=60", microchip: "985 141 000 220 002", healthCert: "missing", price: 4800, available: true },
  ],
  "aussies-april": [
    { id: "p6", name: "Sage", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=60", microchip: "985 141 000 330 001", healthCert: "verified", price: 2400, available: true },
    { id: "p7", name: "River", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=60", microchip: "985 141 000 330 002", healthCert: "pending", price: 2400, available: true },
  ],
};

type EscrowRow = {
  id: string;
  puppy: string;
  buyer: string;
  amount: number;
  status: "holding" | "in_transit" | "delivered" | "released";
  payout: "pending" | "paid";
  updated: string;
};

const escrows: EscrowRow[] = [
  { id: "ES-1042", puppy: "Biscuit — Golden", buyer: "Emma R.", amount: 500, status: "holding", payout: "pending", updated: "2h ago" },
  { id: "ES-1039", puppy: "Olive — Frenchie", buyer: "Marcus T.", amount: 750, status: "in_transit", payout: "pending", updated: "1d ago" },
  { id: "ES-1035", puppy: "Sage — Aussie", buyer: "Lila K.", amount: 400, status: "delivered", payout: "pending", updated: "2d ago" },
  { id: "ES-1028", puppy: "Maple — Golden", buyer: "Jordan P.", amount: 500, status: "released", payout: "paid", updated: "5d ago" },
];

function Dashboard() {
  return (
    <SiteShell>
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                Cedar Ridge Kennel
              </h1>
              <BadgeCheck className="h-5 w-5 shrink-0 text-trust" />
            </div>
            <p className="text-sm text-muted-foreground">Bend, OR · USDA #43-A-0182</p>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-trust" /> Verified breeder
          </Badge>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
            <TabsTrigger value="live">Go Live Studio</TabsTrigger>
            <TabsTrigger value="litters">My Litters & Puppies</TabsTrigger>
            <TabsTrigger value="escrow">Escrow & Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6">
            <GoLiveStudio />
          </TabsContent>
          <TabsContent value="litters" className="mt-6">
            <LittersTab />
          </TabsContent>
          <TabsContent value="escrow" className="mt-6">
            <EscrowTab />
          </TabsContent>
        </Tabs>
      </section>
    </SiteShell>
  );
}

/* --------------------------------- LIVE ---------------------------------- */

function GoLiveStudio() {
  const [micOn, setMicOn] = useState(true);
  const [questions, setQuestions] = useState<QAItem[]>(initialQuestions);
  const [activeLitter, setActiveLitter] = useState(litters[0].id);

  const featureQ = (id: string) =>
    setQuestions((qs) => qs.map((q) => ({ ...q, featured: q.id === id ? !q.featured : q.featured })));
  const dismissQ = (id: string) => setQuestions((qs) => qs.filter((q) => q.id !== id));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Card className="overflow-hidden">
        <div className="relative aspect-video w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-2 text-white/70">
              <Video className="h-10 w-10" />
              <p className="text-sm">Camera preview</p>
              <p className="text-xs text-white/50">1080p · 30fps · Nursery cam</p>
            </div>
          </div>
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <Badge className="bg-live text-live-foreground hover:bg-live">● OFFLINE</Badge>
            <Badge variant="secondary" className="bg-white/15 text-white backdrop-blur">
              Preview
            </Badge>
          </div>
          <div className="absolute right-3 top-3">
            <Button size="sm" variant="secondary" className="bg-white/15 text-white backdrop-blur hover:bg-white/25">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Flip camera
            </Button>
          </div>
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div>
              <Label className="text-xs text-muted-foreground">Active litter on stream</Label>
              <Select value={activeLitter} onValueChange={setActiveLitter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {litters.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} · {l.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="sm:self-end"
              onClick={() => setMicOn((v) => !v)}
            >
              {micOn ? <Mic className="mr-1.5 h-4 w-4" /> : <MicOff className="mr-1.5 h-4 w-4" />}
              {micOn ? "Mic on" : "Muted"}
            </Button>
            <Button variant="outline" className="sm:self-end">
              <Camera className="mr-1.5 h-4 w-4" /> Flip
            </Button>
          </div>
          <Button size="lg" className="h-14 w-full bg-live text-live-foreground text-base font-bold hover:bg-live/90">
            <Radio className="mr-2 h-5 w-5" /> Start Live Stream
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Viewer Q&A queue
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-2">
          {questions.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending questions.</p>
          )}
          {questions.map((q) => (
            <div
              key={q.id}
              className={cn(
                "rounded-xl border p-3 transition-colors",
                q.featured ? "border-primary/50 bg-primary/5" : "border-border",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">{q.user}</p>
                {q.featured && (
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Pin className="h-3 w-3" /> On screen
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm">{q.question}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant={q.featured ? "default" : "outline"} onClick={() => featureQ(q.id)}>
                  <Pin className="mr-1 h-3.5 w-3.5" />
                  {q.featured ? "Unpin" : "Feature"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => dismissQ(q.id)}>
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------- LITTERS -------------------------------- */

function LittersTab() {
  const [rows, setRows] = useState(puppyRows);

  const toggleAvail = (litterId: string, puppyId: string) =>
    setRows((r) => ({
      ...r,
      [litterId]: r[litterId].map((p) =>
        p.id === puppyId ? { ...p, available: !p.available } : p,
      ),
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {litters.length} active litters ·{" "}
          {Object.values(rows).flat().filter((p) => p.available).length} puppies available
        </p>
        <AddLitterDialog />
      </div>

      {litters.map((l) => (
        <Card key={l.id}>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle>{l.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {l.breed} · {l.puppies} puppies
              </p>
            </div>
            <Badge variant="secondary">{l.available} available</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(rows[l.id] ?? []).map((p) => (
                <div key={p.id} className="overflow-hidden rounded-xl border border-border">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    <div className="absolute left-2 top-2">
                      <HealthBadge status={p.healthCert} />
                    </div>
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{p.name}</p>
                      <p className="font-bold text-primary">${p.price.toLocaleString()}</p>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">🔖 {p.microchip}</p>
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.available}
                          onCheckedChange={() => toggleAvail(l.id, p.id)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {p.available ? "Available" : "Reserved"}
                        </span>
                      </div>
                      {p.healthCert !== "verified" && (
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                          <FileUp className="h-3 w-3" /> Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function HealthBadge({ status }: { status: PuppyRow["healthCert"] }) {
  if (status === "verified")
    return (
      <Badge className="gap-1 bg-trust text-trust-foreground hover:bg-trust">
        <FileCheck2 className="h-3 w-3" /> Health cert
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge className="gap-1 bg-warm text-warm-foreground hover:bg-warm">
        <Clock className="h-3 w-3" /> Pending
      </Badge>
    );
  return (
    <Badge variant="destructive" className="gap-1">
      <FileUp className="h-3 w-3" /> Missing
    </Badge>
  );
}

function AddLitterDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1.5 h-4 w-4" /> Add new litter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add new litter</DialogTitle>
          <DialogDescription>
            Register pedigree, licensing, and expected timeline. Puppies can be added after the litter is created.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="litter-name">Litter name</Label>
            <Input id="litter-name" placeholder="e.g. June Goldens" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="mother">Mother pedigree</Label>
              <Button type="button" variant="outline" className="justify-start font-normal">
                <Upload className="mr-1.5 h-4 w-4" /> Upload PDF
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="father">Father pedigree</Label>
              <Button type="button" variant="outline" className="justify-start font-normal">
                <Upload className="mr-1.5 h-4 w-4" /> Upload PDF
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="usda">USDA License #</Label>
              <Input id="usda" placeholder="43-A-0182" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dob">Expected delivery</Label>
              <Input id="dob" type="date" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes for buyers</Label>
            <Textarea id="notes" placeholder="Champion bloodline, OFA hips & elbows, raised in-home…" rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create litter</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- ESCROW -------------------------------- */

function EscrowTab() {
  const totalHeld = escrows.filter((e) => e.status !== "released").reduce((s, e) => s + e.amount, 0);
  const paidOut = escrows.filter((e) => e.payout === "paid").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Held in escrow" value={`$${totalHeld.toLocaleString()}`} icon={ShieldCheck} tone="text-trust" />
        <StatCard label="Pending payout" value={`$${(totalHeld - paidOut).toLocaleString()}`} icon={DollarSign} tone="text-warm-foreground" />
        <StatCard label="Paid out (30d)" value={`$${paidOut.toLocaleString()}`} icon={CheckCircle2} tone="text-primary" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Active escrow holds</CardTitle>
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-trust" /> Stripe Connect
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escrow ID</TableHead>
                  <TableHead>Puppy</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escrows.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{e.id}</TableCell>
                    <TableCell className="font-medium">{e.puppy}</TableCell>
                    <TableCell>{e.buyer}</TableCell>
                    <TableCell>${e.amount.toLocaleString()}</TableCell>
                    <TableCell><DeliveryBadge status={e.status} /></TableCell>
                    <TableCell>
                      {e.payout === "paid" ? (
                        <Badge className="gap-1 bg-trust text-trust-foreground hover:bg-trust">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending · {e.updated}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={e.status === "delivered" ? "default" : "ghost"}
                        disabled={e.payout === "paid"}
                      >
                        {e.status === "delivered" ? "Release funds" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DeliveryBadge({ status }: { status: EscrowRow["status"] }) {
  const map = {
    holding: { label: "Awaiting pickup", cls: "bg-secondary text-secondary-foreground", Icon: Clock },
    in_transit: { label: "In transit", cls: "bg-warm text-warm-foreground", Icon: Truck },
    delivered: { label: "Delivered", cls: "bg-primary text-primary-foreground", Icon: CheckCircle2 },
    released: { label: "Released", cls: "bg-trust text-trust-foreground", Icon: CheckCircle2 },
  } as const;
  const { label, cls, Icon } = map[status];
  return (
    <Badge className={cn("gap-1 hover:opacity-100", cls)}>
      <Icon className="h-3 w-3" /> {label}
    </Badge>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof ShieldCheck;
  tone: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className={cn("h-4 w-4", tone)} />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Card>
  );
}
