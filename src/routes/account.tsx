import { createFileRoute } from '@tanstack/react-router';
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
} from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { confirmReceipt, listPets, payBalance, submitReview, type Pet } from '@/lib/pets-store';

export const Route = createFileRoute('/account')({
  head: () => ({
    meta: [{ title: 'My pets — LivePaws' }],
  }),
  component: AccountPage,
});

// No auth system yet, so "my pets" stands in for whichever buyer name is
// on the record. Once real accounts exist, this filter becomes "buyerId ===
// current user" instead of a hardcoded name — the rest of this page doesn't
// need to change.
const CURRENT_BUYER = null; // null = show every pet that has any buyer, for demo purposes

function AccountPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const data = await listPets();
    setPets(data.filter((p) => (CURRENT_BUYER ? p.buyerName === CURRENT_BUYER : !!p.buyerName)));
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Loading your pets…</div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My pets</h1>
          <p className="text-sm text-muted-foreground">
            Track your reservations, your money in escrow, and confirm receipt when your pet arrives.
          </p>
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
