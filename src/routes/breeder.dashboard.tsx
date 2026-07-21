import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, DollarSign, Mic, MicOff, PawPrint, Play, Radio, Users, Video } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { litters, streams } from "@/lib/mock-data";

export const Route = createFileRoute("/breeder/dashboard")({
  head: () => ({
    meta: [
      { title: "Breeder dashboard — LivePaws" },
      { name: "description", content: "Manage litters, schedule Puppy Hour streams, and moderate live chat." },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Active viewers", value: "428", icon: Users, tone: "text-primary" },
  { label: "Reserved deposits", value: "$4,500", icon: DollarSign, tone: "text-trust" },
  { label: "Puppies available", value: "9", icon: PawPrint, tone: "text-warm-foreground" },
  { label: "Streams this week", value: "6", icon: Video, tone: "text-primary" },
];

function Dashboard() {
  return (
    <SiteShell>
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">Cedar Ridge Kennel</h1>
              <BadgeCheck className="h-5 w-5 shrink-0 text-trust" />
            </div>
            <p className="text-sm text-muted-foreground">Bend, OR · USDA #43-A-0182</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm"><Radio className="mr-1.5 h-4 w-4" /> Schedule Puppy Hour</Button>
            <Button size="sm"><Play className="mr-1.5 h-4 w-4" /> Go live now</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.tone}`} />
              </div>
              <p className="mt-2 text-2xl font-bold">{s.value}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Litter management */}
          <Card>
            <CardHeader>
              <CardTitle>My litters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {litters.map((l) => (
                <div
                  key={l.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3"
                >
                  <img src={l.image} alt={l.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{l.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{l.breed} · {l.puppies} puppies</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{l.available} left</Badge>
                    <Button size="sm" variant="outline">Manage</Button>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full">+ Add new litter</Button>
            </CardContent>
          </Card>

          {/* Stream controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-live" /> Stream controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Nursery cam</p>
                    <p className="text-xs text-muted-foreground">Streaming to 428 viewers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1"><Mic className="mr-1.5 h-4 w-4" /> Mic on</Button>
                <Button variant="outline" className="flex-1"><MicOff className="mr-1.5 h-4 w-4" /> Mute chat</Button>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Upcoming streams</p>
                <ul className="space-y-2 text-sm">
                  {streams.filter((s) => !s.isLive).slice(0, 3).map((s) => (
                    <li key={s.id} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                      <span className="truncate">{s.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{s.scheduledFor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}
