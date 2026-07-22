import { createFileRoute, Link } from '@tanstack/react-router';
import { Calendar, Users } from 'lucide-react';
import { SiteShell, LiveBadge, VerifiedBadge } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { streams } from '@/lib/mock-data';

export const Route = createFileRoute('/live/')({
  head: () => ({ meta: [{ title: 'Live streams schedule — LivePaws' }] }),
  component: LiveSchedule,
});

function LiveSchedule() {
  const live = streams.filter((s) => s.isLive);
  const upcoming = streams.filter((s) => !s.isLive);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live streams schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop in on a nursery cam right now, or set a reminder for an upcoming Pet Showcase.
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Live now ({live.length})</h2>
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
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Upcoming ({upcoming.length})</h2>
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
        </section>
      </div>
    </SiteShell>
  );
}
