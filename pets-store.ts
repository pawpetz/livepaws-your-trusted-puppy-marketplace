import { createServerFn } from '@tanstack/react-start';

/* ------------------------------------------------------------
   Shared data layer for LivePaws.

   NOTE ON PERSISTENCE: this store lives in the server process's
   memory. It's real shared state — the buyer portal and breeder
   dashboard both read and write through it, so actions on one
   side now actually show up on the other. But it resets on
   redeploy/restart, and won't stay consistent across multiple
   edge instances once this is deployed to Cloudflare Workers.

   This is the seam to swap in a real database (Cloudflare D1 is
   the natural fit given this project's nitro/cloudflare deploy
   target). Nothing calling these server functions needs to
   change when that happens — only the internals of this file do.
------------------------------------------------------------ */

export type Species = 'Dog' | 'Cat';
export type SaleType = 'full' | 'deposit';
// Available -> nothing sold yet
// Reserved  -> deposit paid, balance still due before pickup
// Sold      -> full amount paid, awaiting pickup/delivery confirmation
// Closed    -> buyer confirmed receipt, escrow released to breeder
export type PetStatus = 'Available' | 'Reserved' | 'Sold' | 'Closed';

export type Pet = {
  id: string;
  species: Species;
  name: string;
  breed: string;
  image: string;
  sex: 'Female' | 'Male';
  collar: string;
  price: number;
  deposit: number;
  saleType: SaleType | null;
  status: PetStatus;
  microchip: string;
  breederName: string;
  buyerName?: string;
  escrowHeld?: number;
  reviewRating?: number;
  reviewComment?: string;
};

const defaultImage = (species: Species) =>
  species === 'Dog'
    ? 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=60'
    : 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=60';

let pets: Pet[] = [
  {
    id: '1',
    species: 'Dog',
    name: 'Puppy #1 (Light Cream)',
    breed: 'Golden Retriever',
    image: defaultImage('Dog'),
    sex: 'Female',
    collar: 'Pink Collar',
    price: 1800,
    deposit: 250,
    saleType: 'deposit',
    status: 'Reserved',
    microchip: '9851410029381',
    breederName: 'Oakwood Paws & Cattery Studio',
    buyerName: 'Sarah Miller',
    escrowHeld: 250,
  },
  {
    id: '2',
    species: 'Cat',
    name: 'Kitten #1 (Blue Point Ragdoll)',
    breed: 'Ragdoll',
    image: defaultImage('Cat'),
    sex: 'Male',
    collar: 'Blue Collar',
    price: 1500,
    deposit: 200,
    saleType: null,
    status: 'Available',
    microchip: '9851410029399',
    breederName: 'Oakwood Paws & Cattery Studio',
  },
  {
    id: '3',
    species: 'Dog',
    name: 'Puppy #3 (Dark Golden)',
    breed: 'Golden Retriever',
    image: defaultImage('Dog'),
    sex: 'Male',
    collar: 'Green Collar',
    price: 1800,
    deposit: 250,
    saleType: 'full',
    status: 'Sold',
    microchip: '9851410029383',
    breederName: 'Oakwood Paws & Cattery Studio',
    buyerName: 'Marcus Vance',
    escrowHeld: 1800,
  },
];

export const listPets = createServerFn({ method: 'GET' }).handler(async () => pets);

export const addPet = createServerFn({ method: 'POST' })
  .validator(
    (input: {
      species: Species;
      name: string;
      sex: 'Female' | 'Male';
      collar: string;
      price: number;
      microchip: string;
      breederName: string;
      breed?: string;
      image?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const pet: Pet = {
      id: crypto.randomUUID(),
      species: data.species,
      name: data.name,
      breed: data.breed ?? (data.species === 'Dog' ? 'Mixed breed' : 'Mixed breed'),
      image: data.image ?? defaultImage(data.species),
      sex: data.sex,
      collar: data.collar,
      price: data.price,
      deposit: 250,
      saleType: null,
      status: 'Available',
      microchip: data.microchip,
      breederName: data.breederName,
    };
    pets = [...pets, pet];
    return pet;
  });

export const removePet = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    pets = pets.filter((p) => p.id !== data.id);
    return { id: data.id };
  });

// Reserve with a deposit (checkout "reservation" path)
export const reservePet = createServerFn({ method: 'POST' })
  .validator((input: { id: string; buyerName: string }) => input)
  .handler(async ({ data }) => {
    pets = pets.map((p) =>
      p.id === data.id
        ? { ...p, status: 'Reserved', saleType: 'deposit', buyerName: data.buyerName, escrowHeld: p.deposit }
        : p,
    );
    return pets.find((p) => p.id === data.id);
  });

// Pay in full up front (checkout "full payment" path)
export const buyFullPrice = createServerFn({ method: 'POST' })
  .validator((input: { id: string; buyerName: string }) => input)
  .handler(async ({ data }) => {
    pets = pets.map((p) =>
      p.id === data.id
        ? { ...p, status: 'Sold', saleType: 'full', buyerName: data.buyerName, escrowHeld: p.price }
        : p,
    );
    return pets.find((p) => p.id === data.id);
  });

// Pay the remaining balance on a reserved (deposit) pet
export const payBalance = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    pets = pets.map((p) => (p.id === data.id ? { ...p, status: 'Sold', escrowHeld: p.price } : p));
    return pets.find((p) => p.id === data.id);
  });

// Buyer confirms receipt -> escrow releases -> sale closes
export const confirmReceipt = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    pets = pets.map((p) => (p.id === data.id ? { ...p, status: 'Closed' } : p));
    return pets.find((p) => p.id === data.id);
  });

export const submitReview = createServerFn({ method: 'POST' })
  .validator((input: { id: string; rating: number; comment: string }) => input)
  .handler(async ({ data }) => {
    pets = pets.map((p) =>
      p.id === data.id ? { ...p, reviewRating: data.rating, reviewComment: data.comment } : p,
    );
    return pets.find((p) => p.id === data.id);
  });
