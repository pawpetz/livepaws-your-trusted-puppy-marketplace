import { createFileRoute } from '@tanstack/react-router';
import { Lock, PackageCheck, ShieldCheck, Star } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Card } from '@/components/ui/card';

export const Route = createFileRoute('/how-it-works')({
  head: () => ({ meta: [{ title: 'How escrow works — LivePaws' }] }),
  component: HowItWorksPage,
});

const steps = [
  {
    Icon: Lock,
    title: 'You pay into escrow, not the breeder',
    body: 'Whether you pay in full or put down a deposit, the money is held by LivePaws — not sent directly to the breeder. Nobody gets paid yet.',
  },
  {
    Icon: PackageCheck,
    title: 'The pet is delivered or picked up',
    body: 'You receive your pet as arranged. This is your one chance to check that everything matches what you saw on the live stream and in the listing.',
  },
  {
    Icon: ShieldCheck,
    title: 'You confirm receipt',
    body: 'From your account, you tap "Confirm receipt." That single action is what releases the held funds to the breeder — there\'s no other way for them to get paid.',
  },
  {
    Icon: Star,
    title: 'You leave a review',
    body: "Right after the sale closes, you're prompted to review the breeder. Only confirmed buyers can leave a review, so a breeder's track record reflects real transactions.",
  },
];

function HowItWorksPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">How deposit &amp; escrow works</h1>
          <p className="mt-3 text-muted-foreground">
            Four steps stand between "I want this pet" and the breeder actually getting paid — and you
            control the one that matters most.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((s, i) => (
            <Card key={s.title} className="flex gap-4 p-5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                <s.Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Step {i + 1}</p>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="space-y-2 border-warm/40 bg-warm/10 p-5">
          <h3 className="text-sm font-semibold">What if something's wrong on arrival?</h3>
          <p className="text-sm text-muted-foreground">
            You don't have to confirm receipt if the pet doesn't match what was shown, or arrives with a
            health issue. Reporting a problem keeps the funds held while it's resolved, instead of
            releasing automatically.
          </p>
        </Card>
      </div>
    </SiteShell>
  );
}
