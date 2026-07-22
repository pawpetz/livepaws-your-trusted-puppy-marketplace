import { createFileRoute } from '@tanstack/react-router';
import { ShieldCheck, Video, Lock, Users } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Card } from '@/components/ui/card';

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About LivePaws & Escrow' }] }),
  component: AboutPage,
});

const pillars = [
  {
    Icon: Video,
    title: 'See it live, not staged',
    body: 'Every listing is backed by a real nursery camera feed — you watch how a pet actually lives and behaves before you commit, not a curated photo set.',
  },
  {
    Icon: ShieldCheck,
    title: 'Verified breeders only',
    body: 'Breeders submit their USDA license and go through review before they can list or go live. A verified badge means someone actually checked, not that a breeder self-certified.',
  },
  {
    Icon: Lock,
    title: 'Your money is protected',
    body: 'Payments are held in escrow — full price or a deposit — and only release to the breeder after you confirm the pet arrived as shown. If something is wrong, funds stay held while it gets sorted out.',
  },
  {
    Icon: Users,
    title: 'A public track record',
    body: "Every review comes from a confirmed, closed sale. A breeder's history is visible before you buy, not discovered after.",
  },
];

function AboutPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Why LivePaws exists</h1>
          <p className="mt-3 text-muted-foreground">
            Buying a puppy or kitten online usually means trusting a few photos and a stranger's word —
            and paying before you can check anything. LivePaws was built around one idea: you should be
            able to see what you're getting, and your payment shouldn't leave escrow until you're sure.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <Card key={p.title} className="space-y-2 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                <p.Icon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
