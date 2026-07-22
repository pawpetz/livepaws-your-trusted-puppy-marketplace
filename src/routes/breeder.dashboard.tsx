import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useEffect, useRef, useState } from 'react';
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
  MapPin,
  Truck,
  Home as HomeIcon,
  CalendarDays,
  Pencil,
  ImagePlus,
  Hourglass,
} from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  addDocument,
  addPet,
  confirmReceipt,
  DEMO_BREEDER_NAME,
  listDocuments,
  listPets,
  removeDocument,
  removePet,
  updatePet,
  type BreederDocument,
  type Pet,
  type Species,
} from '@/lib/pets-store';
import { getSessionBreeder, logoutBreeder, type BreederAccount } from '@/lib/auth-store';

export const Route = createFileRoute('/breeder/dashboard')({
  component: BreederDashboardPage,
});

const statusStyle: Record<Pet['status'], string> = {
  Available: 'bg-trust/15 text-trust border-trust/30',
  Reserved: 'bg-warm/20 text-warm-foreground border-warm/40',
  Sold: 'bg-warm/20 text-warm-foreground border-warm/40',
  Closed: 'bg-secondary text-muted-foreground border-border',
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function BreederDashboardPage() {
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [breeder, setBreeder] = useState<BreederAccount | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth gate: no session token, or a token that no longer resolves to an
  // approved account, sends the breeder back to apply/sign in. Nothing on
  // this page loads until this check completes.
  useEffect(() => {
    const token = localStorage.getItem('livepaws_breeder_token');
    if (!token) {
      navigate({ to: '/breeder/apply' });
      return;
    }
    getSessionBreeder({ data: { token } }).then((account) => {
      if (!account) {
        localStorage.removeItem('livepaws_breeder_token');
        localStorage.removeItem('livepaws_breeder_name');
        navigate({ to: '/breeder/apply' });
        return;
      }
      setBreeder(account);
      setAuthChecked(true);
    });
  }, [navigate]);

  const businessName = breeder?.businessName ?? DEMO_BREEDER_NAME;

  const refresh = async () => {
    const data = await listPets();
    setPets(data.filter((p) => p.breederName === businessName));
  };

  const [documents, setDocuments] = useState<BreederDocument[]>([]);
  const refreshDocuments = async () => {
    const docs = await listDocuments({ data: { breederName: businessName } });
    setDocuments(docs);
  };

  useEffect(() => {
    if (!authChecked) return;
    Promise.all([refresh(), refreshDocuments()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked]);

  const handleLogout = async () => {
    const token = localStorage.getItem('livepaws_breeder_token');
    if (token) await logoutBreeder({ data: { token } });
    localStorage.removeItem('livepaws_breeder_token');
    localStorage.removeItem('livepaws_breeder_name');
    navigate({ to: '/breeder/apply' });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    await addDocument({
      data: { breederName: businessName, title: file.name.replace(/\.[^.]+$/, ''), fileName: file.name },
    });
    await refreshDocuments();
    setUploadingDoc(false);
    e.target.value = '';
  };

  const handleRemoveDoc = async (id: string) => {
    await removeDocument({ data: { id } });
    await refreshDocuments();
  };

  const [newPet, setNewPet] = useState({
    species: 'Dog' as Species,
    name: '',
    breed: '',
    bio: '',
    ageWeeks: '8',
    location: '',
    sex: 'Female' as 'Female' | 'Male',
    collar: '',
    price: '1500',
    microchip: '',
    pickupAvailable: true,
    shippingAvailable: false,
    shippingFee: '250',
    imageDataUrl: '' as string,
  });
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setNewPet((prev) => ({ ...prev, imageDataUrl: dataUrl }));
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPet.name || submitting) return;
    setSubmitting(true);
    await addPet({
      data: {
        species: newPet.species,
        name: newPet.name,
        breed: newPet.breed,
        bio: newPet.bio,
        ageWeeks: Number(newPet.ageWeeks) || 8,
        location: newPet.location,
        sex: newPet.sex,
        collar: newPet.collar || 'No ID Tag',
        price: Number(newPet.price),
        microchip: newPet.microchip || 'Pending Microchip',
        breederName: businessName,
        pickupAvailable: newPet.pickupAvailable,
        shippingAvailable: newPet.shippingAvailable,
        shippingFee: Number(newPet.shippingFee) || undefined,
        image: newPet.imageDataUrl || undefined,
      },
    });
    setNewPet({
      species: 'Dog',
      name: '',
      breed: '',
      bio: '',
      ageWeeks: '8',
      location: '',
      sex: 'Female',
      collar: '',
      price: '1500',
      microchip: '',
      pickupAvailable: true,
      shippingAvailable: false,
      shippingFee: '250',
      imageDataUrl: '',
    });
    await refresh();
    setSubmitting(false);
  };

  const handleRemove = async (id: string) => {
    await removePet({ data: { id } });
    await refresh();
  };

  // Stand-in for the buyer-side "Confirm receipt" action, kept here until
  // that flow is the only place this can be triggered from.
  const closeSale = async (id: string) => {
    await confirmReceipt({ data: { id } });
    await refresh();
  };

  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const handleSaveEdit = async () => {
    if (!editingPet) return;
    setSavingEdit(true);
    await updatePet({
      data: {
        id: editingPet.id,
        name: editingPet.name,
        breed: editingPet.breed,
        bio: editingPet.bio,
        ageWeeks: editingPet.ageWeeks,
        location: editingPet.location,
        price: editingPet.price,
        pickupAvailable: editingPet.pickupAvailable,
        shippingAvailable: editingPet.shippingAvailable,
        shippingFee: editingPet.shippingFee,
      },
    });
    await refresh();
    setSavingEdit(false);
    setEditingPet(null);
  };

  const heldTotal = pets.reduce((sum, p) => sum + (p.status !== 'Closed' ? p.escrowHeld ?? 0 : 0), 0);
  const releasedTotal = pets.reduce((sum, p) => sum + (p.status === 'Closed' ? p.escrowHeld ?? 0 : 0), 0);
  const salesPets = pets.filter((p) => p.saleType);

  if (!authChecked || loading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Loading your nursery…</div>
      </SiteShell>
    );
  }

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
                <h1 className="text-2xl font-extrabold">{businessName}</h1>
                <span className="flex items-center gap-1 rounded-full border border-trust/30 bg-trust/15 px-2.5 py-0.5 text-xs font-semibold text-trust">
                  <ShieldCheck size={13} /> Verified Breeder
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage litters (puppies &amp; kittens), vet docs, stream feed, and escrow payouts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
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

                  <div className="space-y-1.5">
                    <Label>Photo</Label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 p-3 transition-colors hover:border-primary">
                      {newPet.imageDataUrl ? (
                        <img src={newPet.imageDataUrl} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                          <ImagePlus size={18} />
                        </div>
                      )}
                      <span className="text-muted-foreground">
                        {newPet.imageDataUrl ? 'Change photo' : 'Upload a photo'}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pet-breed">Breed</Label>
                    <Input
                      id="pet-breed"
                      required
                      placeholder="e.g. Golden Retriever"
                      value={newPet.breed}
                      onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
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
                      <Label htmlFor="pet-age">Age (weeks)</Label>
                      <Input
                        id="pet-age"
                        type="number"
                        min={1}
                        required
                        value={newPet.ageWeeks}
                        onChange={(e) => setNewPet({ ...newPet, ageWeeks: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pet-location">Location</Label>
                      <Input
                        id="pet-location"
                        required
                        placeholder="e.g. Bend, OR"
                        value={newPet.location}
                        onChange={(e) => setNewPet({ ...newPet, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pet-bio">Bio</Label>
                    <Textarea
                      id="pet-bio"
                      required
                      placeholder="Temperament, what makes them unique, how they're doing so far..."
                      value={newPet.bio}
                      onChange={(e) => setNewPet({ ...newPet, bio: e.target.value })}
                      className="min-h-16 text-xs"
                    />
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

                  <div className="space-y-2 rounded-xl border border-border bg-secondary/30 p-3">
                    <Label className="mb-1 block text-muted-foreground">Fulfillment options</Label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={newPet.pickupAvailable}
                        onCheckedChange={(v) => setNewPet({ ...newPet, pickupAvailable: !!v })}
                      />
                      Local pickup available
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={newPet.shippingAvailable}
                        onCheckedChange={(v) => setNewPet({ ...newPet, shippingAvailable: !!v })}
                      />
                      Nationwide shipping available
                    </label>
                    {newPet.shippingAvailable && (
                      <div className="space-y-1.5 pl-6">
                        <Label htmlFor="pet-shipping-fee">Shipping fee ($)</Label>
                        <Input
                          id="pet-shipping-fee"
                          type="number"
                          value={newPet.shippingFee}
                          onChange={(e) => setNewPet({ ...newPet, shippingFee: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={submitting} className="mt-2 w-full">
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
                          {p.breed} • {p.sex} • {p.collar} • Microchip:{' '}
                          <span className="font-mono text-foreground/80">{p.microchip}</span>
                          {p.buyerName && <> • Buyer: <span className="text-foreground/80">{p.buyerName}</span></>}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pl-8 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarDays size={12} /> {p.ageWeeks} weeks old</span>
                          <span className="flex items-center gap-1"><MapPin size={12} /> {p.location}</span>
                          {p.pickupAvailable && <span className="flex items-center gap-1"><HomeIcon size={12} /> Pickup</span>}
                          {p.shippingAvailable && (
                            <span className="flex items-center gap-1"><Truck size={12} /> Ships (${p.shippingFee})</span>
                          )}
                        </div>
                        {p.bio && <p className="max-w-md pl-8 text-xs text-muted-foreground/80">{p.bio}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-extrabold">${p.price.toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground">${p.deposit} Escrow Deposit</div>
                        </div>
                        <button
                          onClick={() => setEditingPet(p)}
                          className="rounded-xl bg-secondary p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          aria-label="Edit listing"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleRemove(p.id)}
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

            {/* Edit listing dialog */}
            <Dialog open={!!editingPet} onOpenChange={(open) => !open && setEditingPet(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit listing</DialogTitle>
                </DialogHeader>
                {editingPet && (
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1.5">
                      <Label>Name or tag</Label>
                      <Input
                        value={editingPet.name}
                        onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Breed</Label>
                        <Input
                          value={editingPet.breed}
                          onChange={(e) => setEditingPet({ ...editingPet, breed: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Price ($)</Label>
                        <Input
                          type="number"
                          value={editingPet.price}
                          onChange={(e) => setEditingPet({ ...editingPet, price: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Age (weeks)</Label>
                        <Input
                          type="number"
                          value={editingPet.ageWeeks}
                          onChange={(e) => setEditingPet({ ...editingPet, ageWeeks: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Location</Label>
                        <Input
                          value={editingPet.location}
                          onChange={(e) => setEditingPet({ ...editingPet, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Bio</Label>
                      <Textarea
                        value={editingPet.bio}
                        onChange={(e) => setEditingPet({ ...editingPet, bio: e.target.value })}
                        className="min-h-16"
                      />
                    </div>
                    <div className="space-y-2 rounded-xl border border-border bg-secondary/30 p-3">
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={editingPet.pickupAvailable}
                          onCheckedChange={(v) => setEditingPet({ ...editingPet, pickupAvailable: !!v })}
                        />
                        Local pickup available
                      </label>
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={editingPet.shippingAvailable}
                          onCheckedChange={(v) => setEditingPet({ ...editingPet, shippingAvailable: !!v })}
                        />
                        Nationwide shipping available
                      </label>
                      {editingPet.shippingAvailable && (
                        <div className="space-y-1.5 pl-6">
                          <Label>Shipping fee ($)</Label>
                          <Input
                            type="number"
                            value={editingPet.shippingFee ?? 0}
                            onChange={(e) => setEditingPet({ ...editingPet, shippingFee: Number(e.target.value) })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingPet(null)}>
                    Cancel
                  </Button>
                  <Button disabled={savingEdit} onClick={handleSaveEdit}>
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* TAB 2: VET & HEALTH VAULT */}
          <TabsContent value="documents">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="space-y-4 p-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="text-primary" size={20} /> Upload Health Record
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Upload state breeder licenses, vet vaccination reports, or health guarantees. New uploads
                  are reviewed before they're marked Verified.
                </p>
                <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-secondary/40 p-6 text-center transition-colors hover:border-primary">
                  <Upload size={28} className="mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold">{uploadingDoc ? 'Uploading…' : 'Upload PDF or Image'}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    disabled={uploadingDoc}
                    onChange={handleDocUpload}
                  />
                </label>
              </Card>

              <div className="space-y-4 lg:col-span-2">
                <h2 className="text-lg font-bold">Your Documents ({documents.length})</h2>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <Card key={doc.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText size={20} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold">{doc.title}</span>
                            <span className="text-[10px] text-muted-foreground">{doc.fileName} • Uploaded {doc.uploadedAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status === 'Verified' ? (
                            <span className="flex items-center gap-1 rounded-full border border-trust/30 bg-trust/15 px-2.5 py-1 text-[10px] font-bold text-trust">
                              <CheckCircle2 size={12} /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full border border-warm/40 bg-warm/15 px-2.5 py-1 text-[10px] font-bold text-warm-foreground">
                              <Hourglass size={12} /> Pending Review
                            </span>
                          )}
                          <button
                            onClick={() => handleRemoveDoc(doc.id)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Remove document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
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

          {/* TAB 4: ESCROW SALES LEDGER — driven directly from the shared pets store */}
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
                        <TableCell className="text-muted-foreground">{p.buyerName}</TableCell>
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
                This ledger now reads from the same shared store as the buyer portal — a buyer confirming
                receipt on their end will show up here as "Released" without you doing anything.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SiteShell>
  );
}

export default BreederDashboardPage;
