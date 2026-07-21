import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import {
  ShieldCheck,
  DollarSign,
  Plus,
  Radio,
  Upload,
  FileText,
  Camera,
  Clock,
  Copy,
  CheckCircle2,
  Trash2,
  Cat,
  Dog,
  PackageCheck,
  Wallet,
} from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const Route = createFileRoute('/breeder/dashboard')({
  component: BreederDashboardPage,
});

/* ------------------------------------------------------------
   Data model — pets are the single source of truth.
   Escrow status lives on the pet record itself, so the
   "Listings" tab and "Escrow" tab can never drift out of sync.
------------------------------------------------------------ */

type Species = 'Dog' | 'Cat';
type SaleType = 'full' | 'deposit';
// Available -> nothing sold yet
// Reserved  -> deposit paid, balance still due before pickup
// Sold      -> full amount paid, awaiting pickup/delivery confirmation
// Closed    -> buyer confirmed receipt, escrow released to breeder
type PetStatus = 'Available' | 'Reserved' | 'Sold' | 'Closed';

type Pet = {
  id: string;
  species: Species;
  name: string;
  sex: 'Female' | 'Male';
  collar: string;
  price: number;
  deposit: number;
  saleType: SaleType | null;
  status: PetStatus;
  microchip: string;
  buyer?: string;
  escrowHeld?: number;
};

const statusStyle: Record<PetStatus, string> = {
  Available: 'bg-trust/15 text-trust border-trust/30',
  Reserved: 'bg-warm/20 text-warm-foreground border-warm/40',
  Sold: 'bg-warm/20 text-warm-foreground border-warm/40',
  Closed: 'bg-secondary text-muted-foreground border-border',
};

function BreederDashboardPage() {
  const [isLive, setIsLive] = useState(true);

  const [pets, setPets] = useState<Pet[]>([
    {
      id: '1',
      species: 'Dog',
      name: 'Puppy #1 (Light Cream)',
      sex: 'Female',
      collar: 'Pink Collar',
      price: 1800,
      deposit: 250,
      saleType: 'deposit',
      status: 'Reserved',
      microchip: '9851410029381',
      buyer: 'Sarah Miller',
      escrowHeld: 250,
    },
    {
      id: '2',
      species: 'Cat',
      name: 'Kitten #1 (Blue Point Ragdoll)',
      sex: 'Male',
      collar: 'Blue Collar',
      price: 1500,
      deposit: 200,
      saleType: null,
      status: 'Available',
      microchip: '9851410029399',
    },
    {
      id: '3',
      species: 'Dog',
      name: 'Puppy #3 (Dark Golden)',
      sex: 'Male',
      collar: 'Green Collar',
      price: 1800,
      deposit: 250,
      saleType: 'full',
      status: 'Sold',
      microchip: '9851410029383',
      buyer: 'Marcus Vance',
      escrowHeld: 1800,
    },
  ]);

  const [documents] = useState([
    { id: '1', title: 'State Breeder License / Registration', type: 'PDF Document', status: 'Verified', date: '2026-01-15' },
    { id: '2', title: 'Vet Inspection & Health Certificates', type: 'PDF Document', status: 'Verified', date: '2026-06-20' },
  ]);

  const [newPet, setNewPet] = useState({ species: 'Dog' as Species, name: '', sex: 'Female' as 'Female' | 'Male', collar: '', price: '1500', microchip: '' });

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPet.name) return;
    setPets((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        species: newPet.species,
        name: newPet.name,
        sex: newPet.sex,
        collar: newPet.collar || 'No ID Tag',
        price: Number(newPet.price),
        deposit: 250,
        saleType: null,
        status: 'Available',
        microchip: newPet.microchip || 'Pending Microchip',
      },
    ]);
    setNewPet({ species: 'Dog', name: '', sex: 'Female', collar: '', price: '1500', microchip: '' });
  };

  // Buyer confirms receipt -> escrow releases -> sale closes.
  // In production this is triggered from the buyer portal, not here;
  // this button stands in for that until the buyer-side flow is wired up.
  const closeSale = (id: string) => {
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Closed' } : p)));
  };

  const heldTotal = pets.reduce((sum, p) => sum + (p.status !== 'Closed' ? p.escrowHeld ?? 0 : 0), 0);
  const releasedTotal = pets.reduce((sum, p) => sum + (p.status === 'Closed' ? p.escrowHeld ?? 0 : 0), 0);
  const salesPets = pets.filter((p) => p.saleType);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* Header banner */}
        <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-2xl font-bold text-primary">
              LP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold">Oakwood Paws &amp; Cattery Studio</h1>
                <span className="flex items-center gap-1 rounded-full border border-trust/30 bg-trust/15 px-2.5 py-0.5 text-xs font-semibold text-trust">
                  <ShieldCheck size={13} /> Verified Breeder
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage litters (puppies &amp; kittens), vet docs, stream feed, and escrow payouts
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsLive(!isLive)}
            className={
              isLive
                ? 'bg-live text-live-foreground hover:bg-live/90'
                : 'bg-trust text-trust-foreground hover:bg-trust/90'
            }
          >
            <Radio size={16} className={isLive ? 'live-pulse' : ''} />
            {isLive ? 'Nursery Camera Live' : 'Start Live Camera'}
          </Button>
        </Card>

        <Tabs defaultValue="listings">
          <TabsList>
            <TabsTrigger value="listings"><Dog size={15} className="mr-1.5" /> Pet Listings ({pets.length})</TabsTrigger>
            <TabsTrigger value="documents"><FileText size={15} className="mr-1.5" /> Health &amp; Vet Vault ({documents.length})</TabsTrigger>
            <TabsTrigger value="stream"><Camera size={15} className="mr-1.5" /> Live Stream Feed</TabsTrigger>
            <TabsTrigger value="escrow"><DollarSign size={15} className="mr-1.5" /> Escrow Sales (${heldTotal.toLocaleString()})</TabsTrigger>
          </TabsList>

          {/* TAB 1: PET LISTINGS */}
          <TabsContent value="listings">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="text-primary" size={20} /> Add Puppy or Kitten
                </CardTitle>
                <form onSubmit={handleAddPet} className="space-y-3 pt-4 text-xs">
                  <div>
                    <Label className="mb-1 block text-muted-foreground">Pet Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Dog', 'Cat'] as Species[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewPet({ ...newPet, species: s })}
                          className={
                            'flex items-center justify-center gap-2 rounded-xl border p-2 font-bold transition-colors ' +
                            (newPet.species === s
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground')
                          }
                        >
                          {s === 'Dog' ? <Dog size={16} /> : <Cat size={16} />} {s === 'Dog' ? 'Dog / Puppy' : 'Cat / Kitten'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pet-name">Name or Tag</Label>
                    <Input
                      id="pet-name"
                      required
                      placeholder="e.g. Kitten #2 or Puppy #4"
                      value={newPet.name}
                      onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="pet-sex">Gender</Label>
                      <select
                        id="pet-sex"
                        value={newPet.sex}
                        onChange={(e) => setNewPet({ ...newPet, sex: e.target.value as 'Female' | 'Male' })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pet-collar">Collar / Identifier</Label>
                      <Input
                        id="pet-collar"
                        placeholder="e.g. Yellow Collar"
                        value={newPet.collar}
                        onChange={(e) => setNewPet({ ...newPet, collar: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="pet-price">Price ($)</Label>
                      <Input
                        id="pet-price"
                        type="number"
                        required
                        value={newPet.price}
                        onChange={(e) => setNewPet({ ...newPet, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pet-chip">Microchip # (Optional)</Label>
                      <Input
                        id="pet-chip"
                        placeholder="98514..."
                        value={newPet.microchip}
                        onChange={(e) => setNewPet({ ...newPet, microchip: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="mt-2 w-full">
                    <Plus size={16} /> Post Pet to Nursery
                  </Button>
                </form>
              </Card>

              <div className="space-y-4 lg:col-span-2">
                <h2 className="text-lg font-bold">Active Nursery Listings ({pets.length})</h2>
                <div className="space-y-3">
                  {pets.map((p) => (
                    <Card key={p.id} className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-secondary p-1.5 text-primary">
                            {p.species === 'Dog' ? <Dog size={16} /> : <Cat size={16} />}
                          </span>
                          <span className="text-sm font-bold">{p.name}</span>
                          <span className={'rounded border px-2 py-0.5 text-[10px] font-bold ' + statusStyle[p.status]}>
                            {p.status === 'Reserved' ? 'Reserved (Escrow Paid)' : p.status}
                          </span>
                        </div>
                        <p className="pl-8 text-xs text-muted-foreground">
                          {p.sex} • {p.collar} • Microchip:{' '}
                          <span className="font-mono text-foreground/80">{p.microchip}</span>
                          {p.buyer && <> • Buyer: <span className="text-foreground/80">{p.buyer}</span></>}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-extrabold">${p.price.toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground">${p.deposit} Escrow Deposit</div>
                        </div>
                        <button
                          onClick={() => setPets((prev) => prev.filter((item) => item.id !== p.id))}
                          className="rounded-xl bg-secondary p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove listing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: VET & HEALTH VAULT */}
          <TabsContent value="documents">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="space-y-4 p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="text-primary" size={20} /> Upload Health Record
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Upload state breeder licenses, vet vaccination reports, or health guarantees.
                </p>
                <div className="cursor-pointer rounded-2xl border-2 border-dashed border-border bg-secondary/40 p-6 text-center transition-colors hover:border-primary">
                  <Upload size={28} className="mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">Upload PDF or Image</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Up to 10MB</p>
                </div>
              </Card>

              <div className="space-y-4 lg:col-span-2">
                <h2 className="text-lg font-bold">Verified Records ({documents.length})</h2>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FileText size={20} />
                        </div>
                        <div>
                          <span className="block text-xs font-bold">{doc.title}</span>
                          <span className="text-[10px] text-muted-foreground">{doc.type} • Uploaded {doc.date}</span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 rounded-full border border-trust/30 bg-trust/15 px-2.5 py-1 text-[10px] font-bold text-trust">
                        <CheckCircle2 size={12} /> {doc.status}
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: STREAM SETUP */}
          <TabsContent value="stream">
            <Card className="max-w-2xl space-y-6 p-6">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="text-primary" size={20} /> Single Nursery Camera Feed
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Connect your mobile camera or RTMP stream. Keep it simple and go live in seconds.
                </p>
              </div>
              <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4 text-xs">
                <div>
                  <span className="mb-1 block font-bold">Your Unique Live Stream Key</span>
                  <span className="block overflow-x-auto rounded-lg border border-border bg-background p-2 font-mono text-muted-foreground">
                    rtmp://live.livepaws.health/app/oakwood_nursery_feed
                  </span>
                </div>
                <Button variant="secondary" size="sm">
                  <Copy size={14} /> Copy Stream Key
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: ESCROW SALES LEDGER — driven directly from pets, no duplicate data */}
          <TabsContent value="escrow">
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wallet className="text-trust" size={20} /> Escrow Sales &amp; Payout Ledger
                </CardTitle>
              </CardHeader>
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-warm/40 bg-warm/10 p-3">
                  <p className="text-xs text-muted-foreground">Held in escrow</p>
                  <p className="text-lg font-extrabold">${heldTotal.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-trust/30 bg-trust/10 p-3">
                  <p className="text-xs text-muted-foreground">Released to you</p>
                  <p className="text-lg font-extrabold">${releasedTotal.toLocaleString()}</p>
                </div>
              </div>

              {salesPets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales yet — once a buyer reserves or purchases a pet, it shows up here.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pet</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Sale type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesPets.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">{p.buyer}</TableCell>
                        <TableCell>{p.saleType === 'full' ? 'Paid in full' : 'Deposit + balance'}</TableCell>
                        <TableCell className="font-mono">${p.escrowHeld?.toLocaleString()}</TableCell>
                        <TableCell>
                          {p.status === 'Closed' ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-trust">
                              <CheckCircle2 size={13} /> Released
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-warm-foreground">
                              <Clock size={13} /> Held in escrow
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.status !== 'Closed' ? (
                            <Button size="sm" variant="outline" onClick={() => closeSale(p.id)}>
                              <PackageCheck size={14} /> Confirm handoff
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Paid out</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <p className="mt-3 text-[11px] text-muted-foreground">
                In production, "Confirm handoff" is triggered by the buyer confirming receipt in their own
                portal — this button stands in for that until the buyer-side flow is connected.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SiteShell>
  );
}

export default BreederDashboardPage;
