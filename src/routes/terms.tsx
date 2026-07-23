import { createFileRoute } from '@tanstack/react-router';
import { SiteShell } from '@/components/site-shell';

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of Service — LivePaws' },
      { name: 'description', content: 'LivePaws Terms of Service.' },
    ],
  }),
  component: TermsPage,
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

function TermsPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Effective Date: July 23, 2026 · Last Updated: July 23, 2026</p>

        <P>
          Welcome to LivePaws ("Platform," "we," "us," or "our"). By creating an account, accessing our
          website, purchasing or listing pets, or interacting with live video streams, you ("User,"
          "Buyer," or "Breeder") agree to be bound by these Terms of Service ("Terms"). If you do not
          agree to all of these Terms, you may not access or use the Platform.
        </P>

        <H2>1. Overview of Platform Services</H2>
        <P>
          LivePaws provides an online marketplace technology platform that connects verified pet
          breeders ("Breeders") with prospective pet owners ("Buyers"). LivePaws enables Buyers to view
          live video broadcasts of puppies and kittens, communicate with Breeders, place escrow-backed
          deposits, and arrange pet purchase transactions.
        </P>
        <P>
          <strong className="text-foreground">Important disclosure:</strong> LivePaws is an independent
          technology marketplace. LivePaws is not a pet breeder, dealer, broker, animal shelter, or
          transport agency, and does not take legal ownership of any animal listed on the Platform. All
          purchase contracts, health guarantees, and transfers of ownership occur directly between the
          Buyer and the Breeder.
        </P>

        <H2>2. Eligibility &amp; Account Registration</H2>
        <ul className="mt-2 list-disc pl-5">
          <LI><strong className="text-foreground">Age requirement:</strong> you must be at least 18 years old and capable of entering binding legal contracts to use LivePaws.</LI>
          <LI><strong className="text-foreground">Account accuracy:</strong> you agree to provide accurate, complete, and current information when registering, and to keep it updated.</LI>
          <LI><strong className="text-foreground">Account security:</strong> you're responsible for keeping your login credentials confidential and for all activity under your account.</LI>
        </ul>

        <H2>3. Breeder Requirements &amp; Verification</H2>
        <P>Breeders listing animals on LivePaws must comply with the following:</P>
        <ul className="mt-2 list-disc pl-5">
          <LI><strong className="text-foreground">Identity &amp; licensing verification:</strong> breeders complete an application reviewed before their listings or livestreams go public, including business/contact details and licensing information (USDA license, state permit, or hobby-breeder disclosure, as applicable).</LI>
          <LI><strong className="text-foreground">Legal compliance &amp; welfare:</strong> breeders warrant that they comply with all applicable local, state, and federal laws, including USDA animal welfare regulations, state licensing requirements, and municipal pet limitations where relevant.</LI>
          <LI><strong className="text-foreground">Animal health &amp; care:</strong> breeders agree to maintain clean, humane, safe conditions and provide proper nutrition, socialization, and veterinary care/vaccinations prior to delivery or pickup.</LI>
          <LI><strong className="text-foreground">Prohibited practices:</strong> LivePaws strictly prohibits puppy/kitten mills, illegal breeding operations, animal abuse, or fraudulent listings, and may suspend or terminate a Breeder account without notice for suspected animal neglect or fraud.</LI>
        </ul>

        <H2>4. Payments, Escrow &amp; Fees</H2>
        <P>
          LivePaws uses a third-party payment processing partner to handle transactions, hold escrow
          funds, and issue Breeder payouts. LivePaws does not directly store full card numbers or raw
          bank credentials — financial data is transmitted to and processed by our payment partner in
          compliance with applicable payment card industry (PCI) standards.
        </P>
        <H3>Escrow deposits &amp; final payments</H3>
        <ul className="mt-2 list-disc pl-5">
          <LI><strong className="text-foreground">Escrow holding:</strong> when a Buyer pays a deposit or the full purchase price, funds are held in escrow rather than released to the Breeder immediately.</LI>
          <LI><strong className="text-foreground">Payout release:</strong> escrowed funds are released to the Breeder only after the Buyer confirms receipt of the pet through the Platform.</LI>
          <LI><strong className="text-foreground">Platform fees:</strong> LivePaws may charge a marketplace service fee on completed transactions, deducted before disbursing payouts to the Breeder.</LI>
        </ul>
        <H3>Cancellations &amp; refunds</H3>
        <ul className="mt-2 list-disc pl-5">
          <LI><strong className="text-foreground">Breeder default:</strong> if a Breeder cancels a reservation, fails to produce the pet, or fails to provide required health documentation prior to delivery, the Buyer is entitled to a full refund of escrowed funds tied to that transaction.</LI>
          <LI><strong className="text-foreground">Buyer default:</strong> deposits are generally non-refundable if the Buyer cancels without cause after the agreed reservation window, except where required by law or otherwise agreed with the Breeder in writing.</LI>
        </ul>

        <H2>5. Live Streaming &amp; User Conduct</H2>
        <P>
          Breeders may stream live video of their animals ("Live Nursery Feeds") through our video
          infrastructure partner. Live video and chat must remain professional, safe, and
          family-friendly. Users may not broadcast, post, or transmit:
        </P>
        <ul className="mt-2 list-disc pl-5">
          <LI>Content showing mistreatment, physical harm, or distress to animals.</LI>
          <LI>Offensive, abusive, harassing, or sexually explicit content or language.</LI>
          <LI>Attempts to move buyers off-platform to avoid marketplace transaction protections.</LI>
        </ul>
        <P>LivePaws reserves the right to end any live stream or suspend chat privileges for violations of these conduct rules.</P>

        <H2>6. Pet Health Guarantees &amp; Disclaimers</H2>
        <ul className="mt-2 list-disc pl-5">
          <LI><strong className="text-foreground">Direct Breeder responsibility:</strong> health guarantees, vaccination histories, and veterinary certificates are provided solely by the Breeder.</LI>
          <LI><strong className="text-foreground">Veterinary exam period:</strong> Buyers are strongly encouraged to have a newly acquired pet examined by a licensed veterinarian within 48–72 hours of pickup or delivery.</LI>
          <LI><strong className="text-foreground">No platform warranty:</strong> LivePaws does not conduct physical medical exams on animals and disclaims any implied warranties of health, temperament, or fitness for a particular purpose regarding animals listed on the Platform.</LI>
        </ul>

        <H2>7. Intellectual Property</H2>
        <P>
          All Platform code, trademarks, logos, UI designs, graphics, and text are the exclusive
          property of LivePaws and protected by intellectual property law. By uploading photos, video,
          or pet descriptions, Breeders grant LivePaws a non-exclusive, worldwide, royalty-free license
          to use, display, and distribute that media for platform operation and marketing purposes.
        </P>

        <H2>8. Limitation of Liability</H2>
        <P>
          To the maximum extent permitted by law, LivePaws and its founders, officers, employees, and
          partners are not liable for indirect, incidental, consequential, special, or punitive damages
          arising from: the health, behavior, temperament, or longevity of any pet acquired through the
          Platform; disputes between Buyers and Breeders; unauthorized access to our servers, payment
          infrastructure, or data; or technical interruptions, stream outages, or Platform errors. In no
          event shall LivePaws' total liability exceed the total service fees LivePaws retained from the
          specific transaction giving rise to the claim.
        </P>

        <H2>9. Indemnification</H2>
        <P>
          You agree to defend, indemnify, and hold harmless LivePaws, its affiliates, officers,
          directors, and employees from claims, liabilities, losses, damages, or costs (including
          reasonable legal fees) resulting from your violation of these Terms, misuse of the Platform, or
          your transactions with other Users.
        </P>

        <H2>10. Governing Law &amp; Dispute Resolution</H2>
        <P>
          These Terms are governed by the laws of the State of Ohio, United States, without regard to
          conflict-of-law principles. Any legal action arising under these Terms will be brought
          exclusively in the federal or state courts located in Ohio, and you consent to personal
          jurisdiction there.
        </P>

        <H2>11. Changes to These Terms</H2>
        <P>
          We may modify these Terms at any time. When we do, we'll update the "Last Updated" date above.
          Continued use of the Platform after changes take effect constitutes acceptance of the new
          Terms.
        </P>

        <H2>12. Contact Us</H2>
        <P>Questions about these Terms can be sent to the LivePaws team.</P>

        <p className="mt-8 text-xs text-muted-foreground">
          This document is a working draft and will continue to be refined as the Platform evolves.
        </p>
      </div>
    </SiteShell>
  );
}
