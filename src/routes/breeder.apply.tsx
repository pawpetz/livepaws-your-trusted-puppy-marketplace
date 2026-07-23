import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Info } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { applyAsBreeder, loginBreeder } from '@/lib/auth-store';

export const Route = createFileRoute('/breeder/apply')({
  validateSearch: (search: Record<string, unknown>): { mode?: 'apply' | 'signin' } => ({
    mode: search.mode === 'signin' ? 'signin' : undefined,
  }),
  head: () => ({ meta: [{ title: 'Become a verified breeder — LivePaws' }] }),
  component: BreederApplyPage,
});

function BreederApplyPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<'apply' | 'signin'>(initialMode ?? 'apply');

  return (
    <SiteShell>
      <div className="mx-auto max-w-md space-y-6 px-4 py-10 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-trust/30 bg-trust/15 text-trust">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'apply' ? 'Apply to sell on LivePaws' : 'Sign in to your breeder account'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'apply'
              ? 'Verified breeders get a live nursery cam, escrow-backed sales, and a dashboard to manage it all.'
              : 'Access your Breeder Studio dashboard.'}
          </p>
        </div>

        <div className="flex justify-center gap-2 text-sm">
          <button
            onClick={() => setMode('apply')}
            className={mode === 'apply' ? 'font-semibold text-primary underline underline-offset-4' : 'text-muted-foreground'}
          >
            Apply for verification
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            onClick={() => setMode('signin')}
            className={mode === 'signin' ? 'font-semibold text-primary underline underline-offset-4' : 'text-muted-foreground'}
          >
            Sign in
          </button>
        </div>

        {mode === 'apply' ? <ApplyForm onDone={() => setMode('signin')} /> : <SignInForm />}
      </div>
    </SiteShell>
  );
}

function ApplyForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ businessName: '', email: '', password: '', usdaLicense: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await applyAsBreeder({ data: form });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="space-y-3 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-trust" />
        <h2 className="font-semibold">Application submitted</h2>
        <p className="text-sm text-muted-foreground">
          We'll review your USDA license and business details before your dashboard goes live. This
          usually takes 1–2 business days.
        </p>
        <Button variant="outline" onClick={onDone} className="w-full">
          I'll sign in once approved
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-6">
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div className="space-y-1.5">
          <Label htmlFor="apply-name">Business / kennel name</Label>
          <Input
            id="apply-name"
            required
            placeholder="e.g. Oakwood Paws & Cattery Studio"
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apply-email">Email</Label>
          <Input
            id="apply-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apply-password">Password</Label>
          <Input
            id="apply-password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apply-license">USDA license #</Label>
          <Input
            id="apply-license"
            required
            placeholder="e.g. 22-B-0087"
            value={form.usdaLicense}
            onChange={(e) => setForm({ ...form, usdaLicense: e.target.value })}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Submitting…' : 'Submit application'}
        </Button>
      </form>
    </Card>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await loginBreeder({ data: form });
    setSubmitting(false);
    if (!res.ok) {
      if (res.error === 'pending') setError('Your application is still under review.');
      else if (res.error === 'rejected') setError('Your application was not approved. Contact support.');
      else setError('Incorrect email or password.');
      return;
    }
    localStorage.setItem('livepaws_breeder_token', res.token);
    localStorage.setItem('livepaws_breeder_name', res.breeder.businessName);
    navigate({ to: '/breeder/dashboard' });
  };

  return (
    <Card className="space-y-4 p-6">
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div className="space-y-1.5">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Demo account (already approved): <span className="font-mono">demo@livepaws.example</span> /{' '}
          <span className="font-mono">demo1234</span>
        </span>
      </div>
    </Card>
  );
}
