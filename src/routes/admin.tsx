import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  LayoutGrid,
  Users,
  Dog,
  Wallet,
  MessageSquare,
  Search,
  Radio,
} from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { approveBreeder, listBreeders, rejectBreeder, type BreederAccount } from '@/lib/auth-store';
import { listPets, type Pet } from '@/lib/pets-store';
import { listBuyersForAdmin, type BuyerAccount } from '@/lib/buyer-auth';
import { listFlaggedMessages, type ChatMessage } from '@/lib/chat-store';
import { createAdmin, getSessionAdmin, loginAdmin, logoutAdmin, type AdminAccount } from '@/lib/admin-auth';

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Admin — LivePaws' }] }),
  component: AdminPage,
});

const TOKEN_KEY = 'livepaws_admin_token';

function AdminPage() {
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setChecked(true);
      return;
    }
    getSessionAdmin({ data: { token } }).then((account) => {
      if (!account) localStorage.removeItem(TOKEN_KEY);
      setAdmin(account);
      setChecked(true);
    });
  }, []);

  if (!checked) {
    return (
      <SiteShell>
        <p className="mx-auto max-w-sm px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">Loading…</p>
      </SiteShell>
    );
  }

  if (!admin) {
    return (
      <SiteShell>
        <AdminAuthGate
          onAuthed={(account, token) => {
            localStorage.setItem(TOKEN_KEY, token);
            setAdmin(account);
          }}
        />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <AdminControlCenter
        admin={admin}
        onLogout={async () => {
          const token = localStorage.getItem(TOKEN_KEY);
          if (token) await logoutAdmin({ data: { token } });
          localStorage.removeItem(TOKEN_KEY);
          setAdmin(null);
        }}
        onAuthFailed={() => {
          localStorage.removeItem(TOKEN_KEY);
          setAdmin(null);
        }}
      />
    </SiteShell>
  );
}

function AdminAuthGate({ onAuthed }: { onAuthed: (admin: AdminAccount, token: string) => void }) {
  const [mode, setMode] = useState<'signin' | 'create'>('signin');

  return (
    <div className="mx-auto max-w-sm space-y-4 px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-warm/40 bg-warm/15 text-warm-foreground">
          <Lock size={22} />
        </div>
        <h1 className="text-xl font-bold">Admin access</h1>
        <p className="mt-1 text-sm text-muted-foreground">This area is restricted.</p>
      </div>

      <div className="flex justify-center gap-2 text-sm">
        <button
          onClick={() => setMode('signin')}
          className={mode === 'signin' ? 'font-semibold text-primary underline underline-offset-4' : 'text-muted-foreground'}
        >
          Sign in
        </button>
        <span className="text-muted-foreground">·</span>
        <button
          onClick={() => setMode('create')}
          className={mode === 'create' ? 'font-semibold text-primary underline underline-offset-4' : 'text-muted-foreground'}
        >
          Create admin account
        </button>
      </div>

      {mode === 'signin' ? <AdminSignIn onAuthed={onAuthed} /> : <AdminCreateAccount onDone={() => setMode('signin')} />}
    </div>
  );
}

function AdminSignIn({ onAuthed }: { onAuthed: (admin: AdminAccount, token: string) => void }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    const res = await loginAdmin({ data: form });
    setChecking(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onAuthed(res.admin, res.token);
  };

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div className="space-y-1.5">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            autoFocus
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" disabled={checking} className="w-full">
          {checking ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Card>
  );
}

function AdminCreateAccount({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', masterPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await createAdmin({ data: form });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <Card className="space-y-3 p-5 text-center">
        <CheckCircle2 className="mx-auto h-7 w-7 text-trust" />
        <p className="text-sm">Admin account created.</p>
        <Button variant="outline" onClick={onDone} className="w-full">
          Sign in now
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 p-5">
      <p className="text-xs text-muted-foreground">
        Creating a new admin account requires the master admin password (the one set in Vercel's
        environment variables) — this keeps admin access from being open to anyone who finds this page.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div className="space-y-1.5">
          <Label htmlFor="new-admin-name">Your name</Label>
          <Input id="new-admin-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-admin-email">Email</Label>
          <Input
            id="new-admin-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-admin-password">Password</Label>
          <Input
            id="new-admin-password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="master-password">Master admin password</Label>
          <Input
            id="master-password"
            type="password"
            required
            value={form.masterPassword}
            onChange={(e) => setForm({ ...form, masterPassword: e.target.value })}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Creating…' : 'Create admin account'}
        </Button>
      </form>
    </Card>
  );
}

function AdminControlCenter({
  admin,
  onLogout,
  onAuthFailed,
}: {
  admin: AdminAccount;
  onLogout: () => void;
  onAuthFailed: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [breeders, setBreeders] = useState<BreederAccount[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [buyers, setBuyers] = useState<BuyerAccount[]>([]);
  const [flagged, setFlagged] = useState<ChatMessage[]>([]);

  const getToken = () => localStorage.getItem(TOKEN_KEY) ?? '';

  const refreshAll = async () => {
    const token = getToken();
    const [breedersRes, petsData, buyersRes, flaggedRes] = await Promise.all([
      listBreeders({ data: { token } }),
      listPets(),
      listBuyersForAdmin({ data: { token } }),
      listFlaggedMessages({ data: { token } }),
    ]);
    if (!breedersRes.ok || !buyersRes.ok || !flaggedRes.ok) {
      onAuthFailed();
      return;
    }
    setBreeders(breedersRes.breeders);
    setPets(petsData);
    setBuyers(buyersRes.buyers);
    setFlagged(flaggedRes.messages);
  };

  useEffect(() => {
    refreshAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Loading…</p>;
  }

  const pendingCount = breeders.filter((b) => b.status === 'pending').length;
  const approvedCount = breeders.filter((b) => b.status === 'approved').length;
  const liveCount = breeders.filter((b) => b.isLive).length;
  const heldTotal = pets.reduce((sum, p) => sum + (p.saleType && p.status !== 'Closed' ? p.escrowHeld ?? 0 : 0), 0);
  const releasedTotal = pets.reduce((sum, p) => sum + (p.status === 'Closed' ? p.escrowHeld ?? 0 : 0), 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-warm" />
            <h1 className="text-2xl font-bold tracking-tight">Admin control center</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Supervise breeders, listings, escrow, buyers, and chat across the platform.</p>
          <p className="mt-1 text-xs text-muted-foreground">Signed in as {admin.name} ({admin.email})</p>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          Log out
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview"><LayoutGrid className="mr-1.5 h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="breeders"><ShieldAlert className="mr-1.5 h-4 w-4" /> Breeders ({breeders.length})</TabsTrigger>
          <TabsTrigger value="listings"><Dog className="mr-1.5 h-4 w-4" /> Listings ({pets.length})</TabsTrigger>
          <TabsTrigger value="escrow"><Wallet className="mr-1.5 h-4 w-4" /> Escrow</TabsTrigger>
          <TabsTrigger value="buyers"><Users className="mr-1.5 h-4 w-4" /> Buyers ({buyers.length})</TabsTrigger>
          <TabsTrigger value="moderation"><MessageSquare className="mr-1.5 h-4 w-4" /> Moderation ({flagged.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Breeders — pending" value={pendingCount} tone="warm" />
            <StatCard label="Breeders — approved" value={approvedCount} tone="trust" />
            <StatCard label="Live right now" value={liveCount} tone="live" icon={<Radio className="h-4 w-4" />} />
            <StatCard label="Registered buyers" value={buyers.length} tone="default" />
            <StatCard label="Total listings" value={pets.length} tone="default" />
            <StatCard label="Available now" value={pets.filter((p) => p.status === 'Available').length} tone="trust" />
            <StatCard label="Held in escrow" value={`$${heldTotal.toLocaleString()}`} tone="warm" />
            <StatCard label="Released total" value={`$${releasedTotal.toLocaleString()}`} tone="trust" />
          </div>
          {flagged.length > 0 && (
            <Card className="mt-4 flex items-center justify-between border-warm/40 bg-warm/10 p-4 text-sm">
              <span>{flagged.length} flagged chat message{flagged.length === 1 ? '' : 's'} waiting for review.</span>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="breeders" className="mt-6">
          <BreedersTab breeders={breeders} getToken={getToken} onChanged={refreshAll} />
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          <ListingsTab pets={pets} />
        </TabsContent>

        <TabsContent value="escrow" className="mt-6">
          <EscrowTab pets={pets} />
        </TabsContent>

        <TabsContent value="buyers" className="mt-6">
          <BuyersTab buyers={buyers} />
        </TabsContent>

        <TabsContent value="moderation" className="mt-6">
          <ModerationTab messages={flagged} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  tone: 'default' | 'warm' | 'trust' | 'live';
  icon?: React.ReactNode;
}) {
  const toneClass = {
    default: 'text-foreground',
    warm: 'text-warm-foreground',
    trust: 'text-trust',
    live: 'text-live',
  }[tone];
  return (
    <Card className="p-4">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon} {label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
    </Card>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}

function BreedersTab({
  breeders,
  getToken,
  onChanged,
}: {
  breeders: BreederAccount[];
  getToken: () => string;
  onChanged: () => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return breeders.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (q && !b.businessName.toLowerCase().includes(q) && !b.email.toLowerCase().includes(q) && !b.fullName.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [breeders, search, statusFilter]);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    await approveBreeder({ data: { id, token: getToken() } });
    await onChanged();
    setBusyId(null);
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    await rejectBreeder({ data: { id, token: getToken() } });
    await onChanged();
    setBusyId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox value={search} onChange={setSearch} placeholder="Search business, contact, or email…" />
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={
                'rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors ' +
                (statusFilter === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground')
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">No breeders match this filter.</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Card key={b.id} className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{b.businessName}</p>
                  <StatusPill status={b.status} />
                  {b.isLive && <span className="text-xs font-semibold text-live">● LIVE</span>}
                </div>
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
              {b.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" disabled={busyId === b.id} onClick={() => handleApprove(b.id)}>
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" disabled={busyId === b.id} onClick={() => handleReject(b.id)}>
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const map = {
    pending: 'bg-warm/20 text-warm-foreground border-warm/40',
    approved: 'bg-trust/15 text-trust border-trust/30',
    rejected: 'bg-secondary text-muted-foreground border-border',
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${map[status]}`}>{status}</span>
  );
}

function ListingsTab({ pets }: { pets: Pet[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Pet['status']>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pets.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.breed.toLowerCase().includes(q) && !p.breederName.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [pets, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox value={search} onChange={setSearch} placeholder="Search pet, breed, or breeder…" />
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'Available', 'Reserved', 'Sold', 'Closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors ' +
                (statusFilter === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground')
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Breeder</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.breed}</TableCell>
                  <TableCell className="text-muted-foreground">{p.breederName}</TableCell>
                  <TableCell className="font-mono">${p.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold">{p.status}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No listings match this filter.</p>}
      </Card>
    </div>
  );
}

function EscrowTab({ pets }: { pets: Pet[] }) {
  const [search, setSearch] = useState('');
  const sales = useMemo(() => pets.filter((p) => p.saleType), [pets]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.breederName.toLowerCase().includes(q) ||
        (p.buyerName ?? '').toLowerCase().includes(q),
    );
  }, [sales, search]);

  return (
    <div className="space-y-4">
      <SearchBox value={search} onChange={setSearch} placeholder="Search pet, breeder, or buyer…" />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Breeder</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.breederName}</TableCell>
                  <TableCell className="text-muted-foreground">{p.buyerName ?? '—'}</TableCell>
                  <TableCell className="font-mono">${p.escrowHeld?.toLocaleString() ?? 0}</TableCell>
                  <TableCell>
                    {p.status === 'Closed' ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-trust">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Released
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-warm-foreground">
                        <Clock className="h-3.5 w-3.5" /> Held
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No sales match this search.</p>}
      </Card>
    </div>
  );
}

function BuyersTab({ buyers }: { buyers: BuyerAccount[] }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return buyers.filter((b) => !q || b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q));
  }, [buyers, search]);

  return (
    <div className="space-y-4">
      <SearchBox value={search} onChange={setSearch} placeholder="Search name or email…" />
      {filtered.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">No buyers match this search.</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <Card key={b.id} className="p-4">
              <p className="font-semibold">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.email}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ModerationTab({ messages }: { messages: ChatMessage[] }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => !q || m.userName.toLowerCase().includes(q) || m.channelSlug.toLowerCase().includes(q));
  }, [messages, search]);

  return (
    <div className="space-y-4">
      <SearchBox value={search} onChange={setSearch} placeholder="Search user or stream…" />
      {filtered.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">Nothing flagged right now.</Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">{m.userName}</span> in {m.channelSlug}
                </span>
                <span>{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-sm">{m.text}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
