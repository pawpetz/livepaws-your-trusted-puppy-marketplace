import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, Lock } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { approveBreeder, listBreeders, rejectBreeder, type BreederAccount } from '@/lib/auth-store';

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Admin — LivePaws' }] }),
  component: AdminPage,
});

const SESSION_KEY = 'livepaws_admin_password';

function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setPassword(saved);
  }, []);

  if (!password) {
    return (
      <SiteShell>
        <PasswordGate
          onUnlock={(pw) => {
            sessionStorage.setItem(SESSION_KEY, pw);
            setPassword(pw);
          }}
        />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <AdminQueue
        password={password}
        onAuthFailed={() => {
          sessionStorage.removeItem(SESSION_KEY);
          setPassword(null);
        }}
      />
    </SiteShell>
  );
}

function PasswordGate({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [input, setInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    const res = await listBreeders({ data: { password: input } });
    setChecking(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onUnlock(input);
  };

  return (
    <div className="mx-auto max-w-sm space-y-4 px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-warm/40 bg-warm/15 text-warm-foreground">
          <Lock size={22} />
        </div>
        <h1 className="text-xl font-bold">Admin access</h1>
        <p className="mt-1 text-sm text-muted-foreground">This area is restricted.</p>
      </div>
      <Card className="p-5">
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Admin password</Label>
            <Input
              id="admin-password"
              type="password"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={checking} className="w-full">
            {checking ? 'Checking…' : 'Unlock'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function AdminQueue({ password, onAuthFailed }: { password: string; onAuthFailed: () => void }) {
  const [breeders, setBreeders] = useState<BreederAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    const res = await listBreeders({ data: { password } });
    if (!res.ok) {
      onAuthFailed();
      return;
    }
    setBreeders(res.breeders);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    await approveBreeder({ data: { id, password } });
    await refresh();
    setBusyId(null);
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    await rejectBreeder({ data: { id, password } });
    await refresh();
    setBusyId(null);
  };

  const pending = breeders.filter((b) => b.status === 'pending');
  const decided = breeders.filter((b) => b.status !== 'pending');

  return (
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

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Pending review ({pending.length})</h2>
            {pending.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">Nothing waiting on review.</Card>
            ) : (
              pending.map((b) => (
                <Card key={b.id} className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold">{b.businessName}</p>
                    <p className="text-xs text-muted-foreground">Contact: {b.fullName}</p>
                    <p className="text-xs text-muted-foreground">{b.email} · {b.phone}</p>
                    <p className="text-xs text-muted-foreground">{b.location}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.licenseType === 'usda' && `USDA license #${b.usdaLicense}`}
                      {b.licenseType === 'state' && `State license/permit #${b.usdaLicense}`}
                      {b.licenseType === 'none' && 'No formal license (hobby breeder)'}
                    </p>
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
  );
}
