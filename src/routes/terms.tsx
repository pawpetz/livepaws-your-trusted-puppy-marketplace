import { createFileRoute } from '@tanstack/react-router';
import { FileText } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Card } from '@/components/ui/card';

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service — LivePaws' },
      { name: 'description', content: 'LivePaws Terms of Service.' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary text-muted-foreground">
          <FileText className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Terms of Service</h1>
        <Card className="mt-6 p-6 text-left text-sm text-muted-foreground">
          <p>
            LivePaws's Terms of Service are currently being finalized with legal counsel — pet sales
            involve rules that vary by state, and escrow-based payments have their own regulatory
            considerations we want to get right before publishing final terms.
          </p>
          <p className="mt-3">Check back soon, or reach out directly with any questions.</p>
        </Card>
      </div>
    </SiteShell>
  );
}
