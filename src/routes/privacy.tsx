import { createFileRoute } from '@tanstack/react-router';
import { SiteShell } from '@/components/site-shell';

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy — LivePaws' },
      { name: 'description', content: 'LivePaws Privacy Policy.' },
    ],
  }),
  component: PrivacyPage,
});

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-lg font-semibold">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-5 text-sm font-semibold">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>;
}
function LI({ children }: { children: React.ReactNode }) {
  return <li className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</li>;
}

function PrivacyPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Effective Date: July 23, 2026 · Last Updated: July 23, 2026</p>

        <P>
          At LivePaws ("we," "us," or "our"), protecting the privacy and security of our buyers,
          breeders, and visitors ("Users" or "you") is a top priority. This Privacy Policy explains how
          we collect, use, disclose, and safeguard your information when you visit our website, use our
          marketplace, interact with live video feeds, or make payments.
        </P>

        <H2>1. Information We Collect</H2>
        <H3>A. Personal information you provide</H3>
        <ul className="mt-2 list-disc pl-5">
          <LI><strong className="text-foreground">Account information:</strong> name, email address, phone number, and password when creating an account as a Buyer or Breeder.</LI>
          <LI><strong className="text-foreground">Breeder verification data:</strong> business/contact details and licensing information (USDA license, state permit, or hobby-breeder disclosure) collected during breeder onboarding. As LivePaws adds additional verification steps over time, this may expand to include further identity or tax documentation as required for compliance.</LI>
          <LI><strong className="text-foreground">Pet &amp; listing information:</strong> descriptions, photos, videos, health records, microchip IDs, and vaccination certificates uploaded to the Platform.</LI>
          <LI><strong className="text-foreground">Customer support &amp; communications:</strong> records of messages, inquiries, and support communications sent through the Platform.</LI>
        </ul>

        <H3>B. Payment &amp; financial information</H3>
        <P>
          LivePaws uses a third-party payment processing partner to handle payment processing, escrow
          holding, and Breeder payouts. We do not directly store full card numbers or raw bank
          credentials on our servers — financial data is transmitted directly to and processed by our
          payment partner in compliance with applicable payment card industry (PCI) standards.
        </P>

        <H3>C. Live video streaming &amp; media data</H3>
        <ul className="mt-2 list-disc pl-5">
          <LI><strong className="text-foreground">Breeder camera streams:</strong> when Breeders host live video, audio and video are transmitted through our third-party video infrastructure partner (Agora).</LI>
          <LI><strong className="text-foreground">Live chat &amp; interactions:</strong> comments and questions posted in live nursery chat are stored to maintain platform safety and moderation.</LI>
        </ul>

        <H3>D. Technical &amp; usage data</H3>
        <P>
          IP address, browser type, operating system, device identifiers, referral URLs, pages viewed,
          time spent on pages, and standard web log data, collected automatically.
        </P>

        <H2>2. How We Use Your Information</H2>
        <ul className="mt-2 list-disc pl-5">
          <LI><strong className="text-foreground">Platform operation:</strong> facilitating browsing, live video streaming, breeder-buyer communication, and account management.</LI>
          <LI><strong className="text-foreground">Transaction execution:</strong> processing deposits, holding escrow funds, calculating marketplace fees, and executing payouts to Breeders once receipt is confirmed.</LI>
          <LI><strong className="text-foreground">Verification &amp; fraud prevention:</strong> verifying breeder information, preventing illegal breeding operations, detecting fraudulent transactions, and maintaining platform security.</LI>
          <LI><strong className="text-foreground">Communication:</strong> sending transaction receipts, platform updates, security alerts, and administrative messages.</LI>
          <LI><strong className="text-foreground">Legal compliance:</strong> complying with applicable tax reporting obligations, state pet sale regulations, and legal process.</LI>
        </ul>

        <H2>3. How We Share Your Information</H2>
        <P>We do not sell your personal data. We share information only in these circumstances:</P>
        <ul className="mt-2 list-disc pl-5">
          <LI><strong className="text-foreground">Between marketplace participants:</strong> when a Buyer reserves or purchases a pet, necessary contact and delivery details are shared between Buyer and Breeder to coordinate pickup or transportation.</LI>
          <LI><strong className="text-foreground">Service providers:</strong> trusted providers who perform services on our behalf, including payment/escrow processing, live video infrastructure (Agora), and hosting/database infrastructure (Vercel, Neon).</LI>
          <LI><strong className="text-foreground">Legal &amp; regulatory requirements:</strong> we may disclose information if required by law, court order, subpoena, or government regulation, or to protect the safety, rights, or property of LivePaws, our users, or the public.</LI>
          <LI><strong className="text-foreground">Business transfers:</strong> in a merger, acquisition, reorganization, or sale of assets, user data may be transferred as part of the business assets.</LI>
        </ul>

        <H2>4. Cookies &amp; Tracking Technologies</H2>
        <P>
          We use cookies and similar technologies to analyze trends, administer the Platform, and
          understand usage. You can control cookies at the browser level, though disabling them may
          limit some features.
        </P>

        <H2>5. Data Security</H2>
        <P>
          We implement technical and organizational security measures — including encrypted
          connections, secure API practices, and restricted database access — to protect your
          information against unauthorized access, alteration, disclosure, or destruction. No internet
          transmission or storage method is 100% secure.
        </P>

        <H2>6. Data Retention</H2>
        <P>
          We retain personal information for as long as your account remains active, or as needed to
          provide services, comply with legal/tax/regulatory requirements, resolve disputes, and enforce
          our agreements.
        </P>

        <H2>7. Your Privacy Rights</H2>
        <P>Depending on your jurisdiction, you may have rights to:</P>
        <ul className="mt-2 list-disc pl-5">
          <LI><strong className="text-foreground">Access &amp; portability:</strong> request a copy of the personal information we hold about you.</LI>
          <LI><strong className="text-foreground">Correction:</strong> request that we update or correct inaccurate information.</LI>
          <LI><strong className="text-foreground">Deletion:</strong> request that we delete your personal data, subject to legal obligations where retention is required.</LI>
          <LI><strong className="text-foreground">Opt-out:</strong> opt out of promotional communications at any time.</LI>
        </ul>

        <H2>8. Children's Privacy</H2>
        <P>
          LivePaws is intended solely for adult buyers and verified breeders aged 18 and older. We do
          not knowingly collect personal information from children under 13. If we learn a child under
          13 has provided personal information, we will delete it.
        </P>

        <H2>9. Changes to This Privacy Policy</H2>
        <P>
          We may update this Privacy Policy periodically to reflect changes in our practices,
          technologies, or legal requirements. When we make material changes, we'll update the "Last
          Updated" date above.
        </P>

        <H2>10. Contact Us</H2>
        <P>Questions about this Privacy Policy can be sent to the LivePaws team.</P>

        <p className="mt-8 text-xs text-muted-foreground">
          This document is a working draft and will continue to be refined as the Platform evolves.
        </p>
      </div>
    </SiteShell>
  );
}
