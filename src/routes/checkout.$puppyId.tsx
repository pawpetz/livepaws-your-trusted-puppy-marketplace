import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lock, ShieldCheck, Info } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { buyFullPrice, listPets, reservePet, type Pet } from '@/lib/pets-store';
import { getSessionBuyer, type BuyerAccount } from '@/lib/buyer-auth';

export const Route = createFileRoute('/checkout/$puppyId')({
  head: () => ({
    meta: [
      { title: 'Complete your purchase — LivePaws' },
      { name: 'description', content: 'Secure your pet with LivePaws escrow.' },
    ],
  }),
  loader: async ({ params }) => {
    const pets = await listPets();
    const pet = pets.find((p) => p.id === params.puppyId) ?? null;
    return { pet };
  },
  component: Checkout,
});

function Checkout() {
  const { pet } = Route.useLoaderData();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState<BuyerAccount | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('livepaws_buyer_token');
    if (!token) {
      setAuthChecked(true);
      return;
    }
    getSessionBuyer({ data: { token } }).then((account) => {
      setBuyer(account);
      setAuthChecked(true);
    });
  }, []);

  if (!authChecked) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">Loading…</div>
      </SiteShell>
    );
  }

  if (!buyer) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <h1 className="text-xl font-bold">Sign in to continue</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You'll need an account so this purchase and any chat messages are tied to a real identity.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate({ to: '/account' })}
          >
            Sign in or create an account
          </Button>
        </div>
      </SiteShell>
    );
  }

  if (!pet) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <h1 className="text-xl font-bold">This listing isn't available anymore</h1>
          <p className="mt-2 text-sm text-muted-foreground">It may have been sold or removed.</p>
          <Button asChild className="mt-4">
            <Link to="/explore">Browse other pets</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  if (pet.status !== 'Available') {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <h1 className="text-xl font-bold">{pet.name} is no longer available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Someone else has already reserved or purchased this pet.
          </p>
          <Button asChild className="mt-4">
            <Link to="/explore">Browse other pets</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  const isFullPayment = pet.saleTerms === 'full';
  const amountDueNow = isFullPayment ? pet.price : pet.deposit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isFullPayment) {
        await buyFullPrice({ data: { id: pet.id, buyerName: buyer.name, buyerEmail: buyer.email } });
      } else {
        await reservePet({ data: { id: pet.id, buyerName: buyer.name, buyerEmail: buyer.email } });
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-trust/15 text-trust">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold">
            {isFullPayment ? `$${amountDueNow.toLocaleString()} secured in escrow` : `${pet.name} is reserved`}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isFullPayment
              ? "Your payment is held safely. It releases to the breeder only after you confirm you've received your pet."
              : `Your deposit is held in escrow. The remaining $${(pet.price - pet.deposit).toLocaleString()} is due before pickup.`}
          </p>
          <Button asChild className="mt-6 w-full">
            <Link to="/account">Go to My Pets</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {isFullPayment ? `Buy ${pet.name}` : `Reserve ${pet.name}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isFullPayment
              ? 'Your payment is held in escrow until you confirm receipt.'
              : 'Your deposit holds this pet — balance due before pickup.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Your details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Buying as</Label>
                  <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm">
                    {buyer.name} · {buyer.email}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">Shipping city</Label>
                  <Input id="address" placeholder="Portland, OR" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Payment — held in escrow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="card">Card number</Label>
                    <Input id="card" placeholder="1234 1234 1234 1234" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="exp">Expiry</Label>
                    <Input id="exp" placeholder="MM / YY" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-warm/40 bg-warm/10 p-2.5 text-xs text-warm-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    These card fields are placeholders — no real payment processor is connected yet.
                    Submitting creates a real escrow record in the database (visible in your account and
                    the breeder's dashboard), but no card is actually charged. Wiring up a real processor
                    like Stripe is the next piece of work here.
                  </span>
                </div>
              </CardContent>
            </Card>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="rounded-xl border border-trust/30 bg-trust/5 p-4 text-sm">
              <div className="flex gap-2 font-semibold text-trust">
                <ShieldCheck className="h-4 w-4" /> LivePaws Escrow Guarantee
              </div>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-trust" /> Funds released only after you confirm receipt</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-trust" /> Health certificate and microchip docs included</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-trust" /> Report a problem instead of confirming if something's wrong</li>
              </ul>
            </div>
          </div>

          <div>
            <Card className="sticky top-20 overflow-hidden py-0">
              <div className="relative aspect-video">
                <img src={pet.image} alt={pet.name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="space-y-4 p-5">
                <div>
                  <h3 className="text-lg font-semibold">{pet.name}</h3>
                  <p className="text-sm text-muted-foreground">{pet.breed}</p>
                  <p className="text-sm text-muted-foreground">Bred by {pet.breederName}</p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span>${pet.price.toLocaleString()}</span>
                  </div>
                  {!isFullPayment && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deposit due today</span>
                        <span className="font-semibold">${pet.deposit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Balance at pickup</span>
                        <span>${(pet.price - pet.deposit).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold">Due now</span>
                  <span className="text-2xl font-bold text-primary">${amountDueNow.toLocaleString()}</span>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  <Lock className="mr-1.5 h-4 w-4" />
                  {submitting ? 'Processing…' : isFullPayment ? 'Pay in full — held in escrow' : 'Place deposit in escrow'}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  By continuing you agree to the LivePaws Escrow Terms.
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}
