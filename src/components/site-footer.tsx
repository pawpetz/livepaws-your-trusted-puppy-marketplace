import { Link } from '@tanstack/react-router';
import { PawPrint, ShieldCheck } from 'lucide-react';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <PawPrint className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">LivePaws</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The live-streamed pet marketplace. Watch verified breeders and catteries in real time,
              and reserve with escrow-backed deposits.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-trust/15 px-2.5 py-1 text-xs font-semibold text-trust">
              <ShieldCheck className="h-3.5 w-3.5" /> Escrow-backed
            </span>
          </div>

          <FooterColumn
            title="Explore"
            links={[
              { label: 'Browse dogs', to: '/explore', search: { species: 'dog' } },
              { label: 'Browse cats', to: '/explore', search: { species: 'cat' } },
              { label: 'Live now', to: '/explore' },
            ]}
          />

          <FooterColumn
            title="For breeders"
            links={[
              { label: 'Register as a breeder', to: '/breeder/apply' },
              { label: 'Login as a breeder', to: '/breeder/apply', search: { mode: 'signin' } },
              { label: 'How escrow works', to: '/how-it-works' },
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              { label: 'About', to: '/about' },
              { label: 'How it works', to: '/how-it-works' },
              { label: 'Blog', to: '/blog' },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {year} LivePaws. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string; search?: Record<string, string> }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              search={link.search as any}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
