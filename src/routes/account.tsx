import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  PackageCheck,
  CheckCircle2,
  Clock,
  FileText,
  Star,
  Download,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Truck,
  Home as HomeIcon,
  LogIn,
} from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { confirmReceipt, listPets, payBalance, submitReview, type Pet } from '@/lib/pets-store';
import { getSessionBuyer, loginBuyer, logoutBuyer, signupBuyer, type BuyerAccount } from '@/lib/buyer-auth';

export const Route = createFileRoute('/account')({
  head: () => ({
    meta: [{ title: 'My pets — LivePaws' }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const [buyer, setBuyer] = useState<BuyerAccount | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('livepaws_buyer_token');
    if (!token) {
      setAuthChecked(true);
      setLoading(false);
      return;
    }
    getSessionBuyer({ data: { token } }).then((account) => {
      if (!account) localStorage.removeItem('livepaws_buyer_token');
      setBuyer(account);
      setAuthChecked(true);
    });
  }, []);

  const refresh = async () => {
    if (!buyer) return;
    const data = await listPets();
    setPets(data.filter((p) => p.buyerEmail === buyer.email));
  };

  useEffect(() => {
    if (!authChecked) return;
    if (buyer) {
      refresh().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, buyer]);

  const handleLogout = async () => {
    const token = localStorage.getItem('livepaws_buyer_token');
    if (token) await logoutBuyer({ data: { token } });
    localStorage.removeItem('livepaws_buyer_token');
    setBuyer(null);
    setPets([]);
  };

  if (!authChecked || loading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Loading…</div>
      </SiteShell>
    );
  }

  if (!buyer) {
    return (
      <SiteShell>
        <BuyerAuthGate
          onAuthed={(account, token) => {
            localStorage.setItem('livepaws_buyer_token', token);
            setBuyer(account);
          }}
        />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My pets</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as {buyer.name} · Track your reservations, your money in escrow, and confirm receipt
              when your pet arrives.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>

        {pets.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            You don't have any reservations or purchases yet — browse live streams to find your next pet.
          </Card>
        ) : (
          <div className="space-y-4">
            {pets.map((pet) => (
              <OrderCard key={pet.id} pet={pet} onChanged={refresh} />
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}

function BuyerAuthGate({ onAuthed }: { onAuthed: (account: BuyerAccount, token: string) => void }) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res =
      mode === 'signup'
        ? await signupBuyer({ data: { name: form.name, email: form.email, password: form.password } })
        : await loginBuyer({ data: { email: form.email, password: form.password } });
    setSubmitting(false);
    if (!res.ok) {
      setError('error' in res ? res.error : 'Something went wrong.');
      return;
    }
    onAuthed(res.buyer, res.token);
  };

  return (
    <div className="mx-auto max-w-sm space-y-6 px-4 py-14 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
          <LogIn size={20} />
        </div>
        <h1 className="text-xl font-bold">{mode === 'signup' ? 'Create your account' : 'Sign in'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to reserve pets, chat during live streams, and track your orders.
        </p>
      </div>

      <div className="flex justify-center gap-2 text-sm">
        <button
          onClick={() => setMode('signup')}
          className={mode === 'signup' ? 'font-semibold text-primary underline underline-offset-4' : 'text-muted-foreground'}
        >
          Sign up
        </button>
        <span className="text-muted-foreground">·</span>
        <button
          onClick={() => setMode('signin')}
          className={mode === 'signin' ? 'font-semibold text-primary underline underline-offset-4' : 'text-muted-foreground'}
        >
          Sign in
        </button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <Label htmlFor="buyer-name">Full name</Label>
              <Input
                id="buyer-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="buyer-email">Email</Label>
            <Input
              id="buyer-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buyer-password">Password</Label>
            <Input
              id="buyer-password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function OrderCard({ pet, onChanged }: { pet: Pet; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const balanceDue = pet.price - (pet.escrowHeld ?? 0);

  const handlePayBalance = async () => {
    setBusy(true);
    await payBalance({ data: { id: pet.id } });
    await onChanged();
    setBusy(false);
  };

  const handleConfirmReceipt = async () => {
    setBusy(true);
    await confirmReceipt({ data: { id: pet.id } });
    await onChanged();
    setBusy(false);
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        <img src={pet.image} alt={pet.name} className="h-24 w-full rounded-xl object-cover sm:w-24" />

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{pet.name}</h3>
              <p className="text-sm text-muted-foreground">{pet.breed} · Bred by {pet.breederName}</p>
            </div>
            <StatusPill status={pet.status} />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarDays size={12} /> {pet.ageWeeks} weeks old</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> {pet.location}</span>
            {pet.pickupAvailable && <span className="flex items-center gap-1"><HomeIcon size={12} /> Pickup available</span>}
            {pet.shippingAvailable && (
              <span className="flex items-center gap-1"><Truck size={12} /> Ships (${pet.shippingFee})</span>
            )}
          </div>
          {pet.bio && <p className="text-xs text-muted-foreground/80">{pet.bio}</p>}

          {/* One plain-language line about the money — the thing buyers actually worry about */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-trust" />
            {pet.status === 'Reserved' && (
              <span>
                ${pet.escrowHeld?.toLocaleString()} held in escrow · ${balanceDue.toLocaleString()} balance due before pickup
              </span>
            )}
            {pet.status === 'Sold' && (
              <span>${pet.escrowHeld?.toLocaleString()} held in escrow · releases to the breeder once you confirm receipt</span>
            )}
            {pet.status === 'Closed' && (
              <span>${pet.escrowHeld?.toLocaleString()} released to the breeder — sale closed</span>
            )}
          </div>

          {/* The one primary action, changes by stage */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {pet.status === 'Reserved' && (
              <Button size="sm" disabled={busy} onClick={handlePayBalance}>
                Pay remaining balance (${balanceDue.toLocaleString()})
              </Button>
            )}
            {pet.status === 'Sold' && (
              <>
                <Button size="sm" disabled={busy} onClick={handleConfirmReceipt}>
                  <PackageCheck className="h-4 w-4" /> Confirm receipt
                </Button>
                <Button size="sm" variant="outline" disabled={busy}>
                  <AlertTriangle className="h-4 w-4" /> Report a problem
                </Button>
              </>
            )}
            {pet.status === 'Closed' && !pet.reviewRating && <ReviewForm petId={pet.id} onSubmitted={onChanged} />}
            {pet.status === 'Closed' && pet.reviewRating && (
              <span className="flex items-center gap-1 text-xs font-medium text-trust">
                <CheckCircle2 className="h-3.5 w-3.5" /> Thanks — your review is posted on {pet.breederName}'s profile
              </span>
            )}
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="documents" className="border-none">
              <AccordionTrigger className="py-1 text-xs font-medium text-muted-foreground hover:no-underline">
                <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Documents</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 sm:grid-cols-3">
                  {['Health certificate', 'Microchip registration', '1-year guarantee'].map((doc) => (
                    <button
                      key={doc}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      <Download className="h-3 w-3" /> {doc}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </Card>
  );
}

function StatusPill({ status }: { status: Pet['status'] }) {
  const map: Record<Pet['status'], { label: string; cls: string; Icon: typeof Clock }> = {
    Available: { label: 'Available', cls: 'bg-trust/15 text-trust border-trust/30', Icon: Clock },
    Reserved: { label: 'Reserved', cls: 'bg-warm/20 text-warm-foreground border-warm/40', Icon: Clock },
    Sold: { label: 'Paid — awaiting pickup', cls: 'bg-warm/20 text-warm-foreground border-warm/40', Icon: Clock },
    Closed: { label: 'Closed', cls: 'bg-trust/15 text-trust border-trust/30', Icon: ShieldCheck },
  };
  const { label, cls, Icon } = map[status];
  return (
    <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function ReviewForm({ petId, onSubmitted }: { petId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Star className="h-4 w-4" /> Leave a review
      </Button>
    );
  }

  const handleSubmit = async () => {
    setBusy(true);
    await submitReview({ data: { id: petId, rating, comment } });
    await onSubmitted();
    setBusy(false);
  };

  return (
    <div className="w-full space-y-2 rounded-xl border border-border bg-secondary/30 p-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <Star className={`h-5 w-5 ${n <= rating ? 'fill-warm text-warm' : 'text-muted-foreground'}`} />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="How was your experience with this breeder?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="text-sm"
      />
      <Button size="sm" disabled={rating === 0 || busy} onClick={handleSubmit}>
        Post review
      </Button>
    </div>
  );
}
