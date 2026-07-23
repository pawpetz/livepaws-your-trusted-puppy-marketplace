import { createFileRoute } from '@tanstack/react-router';
import { Lock } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Card } from '@/components/ui/card';

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy — LivePaws' },
      { name: 'description', content: 'LivePaws Privacy Policy.' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary text-muted-foreground">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
        <Card className="mt-6 p-6 text-left text-sm text-muted-foreground">
          <p>
            LivePaws's Privacy Policy is currently being finalized with legal counsel. We collect
            account information (name, email, phone) and transaction details to operate the escrow
            and live-streaming features — a full policy describing exactly how this data is stored,
            used, and protected will be published here before real users' data is handled at scale.
          </p>
          <p className="mt-3">Check back soon, or reach out directly with any questions.</p>
        </Card>
      </div>
    </SiteShell>
  );
}
