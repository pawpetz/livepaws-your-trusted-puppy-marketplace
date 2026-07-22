import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { approveBreeder, listBreeders, rejectBreeder, type BreederAccount } from '@/lib/auth-store';

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Admin — LivePaws' }] }),
  component: AdminPage,
});

function AdminPage() {
  const [breeders, setBreeders] = useState<BreederAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    setBreeders(await listBreeders());
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    await approveBreeder({ data: { id } });
    await refresh();
    setBusyId(null);
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    await rejectBreeder({ data: { id } });
    await refresh();
    setBusyId(null);
  };

  const pending = breeders.filter((b) => b.status === 'pending');
  const decided = breeders.filter((b) => b.status !== 'pending');

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-warm" />
            <h1 className="text-2xl font-bold tracking-tight">Breeder verification queue</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Approving here is what makes a breeder's "Verified" badge and dashboard access real.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-warm/40 bg-warm/10 p-3 text-xs text-warm-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            This page isn't access-restricted yet — anyone with the link can reach it. Add real admin
            authentication before this goes live; right now it exists so the breeder approval flow can be
            demoed end to end.
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Pending review ({pending.length})
              </h2>
              {pending.length === 0 ? (
                <Card className="p-6 text-center text-sm text-muted-foreground">Nothing waiting on review.</Card>
              ) : (
                pending.map((b) => (
                  <Card key={b.id} className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-semibold">{b.businessName}</p>
                      <p className="text-xs text-muted-foreground">{b.email} · USDA #{b.usdaLicense}</p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> Applied {b.appliedAt}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={busyId === b.id} onClick={() => handleApprove(b.id)}>
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" disabled={busyId === b.id} onClick={() => handleReject(b.id)}>
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">Decided ({decided.length})</h2>
              {decided.map((b) => (
                <Card key={b.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{b.businessName}</p>
                    <p className="text-xs text-muted-foreground">{b.email}</p>
                  </div>
                  {b.status === 'approved' ? (
                    <span className="flex items-center gap-1 rounded-full border border-trust/30 bg-trust/15 px-2.5 py-1 text-xs font-semibold text-trust">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      <XCircle className="h-3.5 w-3.5" /> Rejected
                    </span>
                  )}
                </Card>
              ))}
            </section>
          </>
        )}
      </div>
    </SiteShell>
  );
}
