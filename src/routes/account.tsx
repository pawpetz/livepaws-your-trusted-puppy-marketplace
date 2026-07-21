import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getPuppy } from '@/lib/mock-data';

export const Route = createFileRoute('/account')({
  head: () => ({
    meta: [{ title: 'My pets — LivePaws' }],
  }),
  component: AccountPage,
});

/* ------------------------------------------------------------
   Buyer-side order model. Mirrors the breeder's pet status
   (Reserved -> Sold -> Closed) so both sides describe the same
   transaction lifecycle. NOTE: this is local mock state seeded
   to match the breeder dashboard's sample data — with no shared
   backend yet, the two dashboards can't actually sync a live
   change to each other. That's the next real piece of work
   (see note at the bottom of this page).
------------------------------------------------------------ */

type OrderStatus = 'Reserved' | 'Sold' | 'Closed';

type Order = {
  id: string;
  puppyId: string;
  saleType: 'full' | 'deposit';
  status: OrderStatus;
  amountPaid: number;
  totalPrice: number;
  reviewed?: boolean;
};

function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([
    { id: 'ord-1', puppyId: 'pup-01', saleType: 'deposit', status: 'Reserved', amountPaid: 500, totalPrice: 3200 },
    { id: 'ord-2', puppyId: 'pup-02', saleType: 'full', status: 'Sold', amountPaid: 4800, totalPrice: 4800 },
  ]);

  const payBalance = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Sold', amountPaid: o.totalPrice } : o)),
    );
  };

  const confirmReceipt = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'Closed' } : o)));
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My pets</h1>
          <p className="text-sm text-muted-foreground">
            Track your reservations, your money in escrow, and confirm receipt when your pet arrives.
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPayBalance={() => payBalance(order.id)}
              onConfirmReceipt={() => confirmReceipt(order.id)}
              onReviewed={() =>
                setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, reviewed: true } : o)))
              }
            />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}

function OrderCard({
  order,
  onPayBalance,
  onConfirmReceipt,
  onReviewed,
}: {
  order: Order;
  onPayBalance: () => void;
  onConfirmReceipt: () => void;
  onReviewed: () => void;
}) {
  const puppy = getPuppy(order.puppyId);
  const balanceDue = order.totalPrice - order.amountPaid;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        <img src={puppy.image} alt={puppy.name} className="h-24 w-full rounded-xl object-cover sm:w-24" />

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{puppy.name}</h3>
              <p className="text-sm text-muted-foreground">{puppy.breed} · Bred by {puppy.breeder}</p>
            </div>
            <StatusPill status={order.status} />
          </div>

          {/* One plain-language line about the money — the thing buyers actually worry about */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-trust" />
            {order.status === 'Reserved' && (
              <span>
                ${order.amountPaid.toLocaleString()} held in escrow · ${balanceDue.toLocaleString()} balance due before pickup
              </span>
            )}
            {order.status === 'Sold' && (
              <span>${order.amountPaid.toLocaleString()} held in escrow · releases to the breeder once you confirm receipt</span>
            )}
            {order.status === 'Closed' && (
              <span>${order.amountPaid.toLocaleString()} released to the breeder — sale closed</span>
            )}
          </div>

          {/* The one primary action, changes by stage */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {order.status === 'Reserved' && (
              <Button size="sm" onClick={onPayBalance}>
                Pay remaining balance (${balanceDue.toLocaleString()})
              </Button>
            )}
            {order.status === 'Sold' && (
              <>
                <Button size="sm" onClick={onConfirmReceipt}>
                  <PackageCheck className="h-4 w-4" /> Confirm receipt
                </Button>
                <Button size="sm" variant="outline">
                  <AlertTriangle className="h-4 w-4" /> Report a problem
                </Button>
              </>
            )}
            {order.status === 'Closed' && !order.reviewed && <ReviewForm onSubmit={onReviewed} />}
            {order.status === 'Closed' && order.reviewed && (
              <span className="flex items-center gap-1 text-xs font-medium text-trust">
                <CheckCircle2 className="h-3.5 w-3.5" /> Thanks — your review is posted on {puppy.breeder}'s profile
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

function StatusPill({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; cls: string; Icon: typeof Clock }> = {
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

function ReviewForm({ onSubmit }: { onSubmit: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Star className="h-4 w-4" /> Leave a review
      </Button>
    );
  }

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
      <Button size="sm" disabled={rating === 0} onClick={onSubmit}>
        Post review
      </Button>
    </div>
  );
}
