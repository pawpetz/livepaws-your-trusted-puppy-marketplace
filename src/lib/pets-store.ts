import { neon } from '@neondatabase/serverless';
import { createServerFn } from '@tanstack/react-start';

/* ------------------------------------------------------------
   Shared data layer for LivePaws — now backed by a real Postgres
   database (Neon, connected via Vercel). This replaces the old
   in-memory version: data now survives redeploys and restarts.

   DATABASE_URL is set automatically by Vercel once the Neon
   database is connected to this project (Storage tab -> Connect).
   Locally, run `vercel env pull .env.development.local` to get it.
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
  bio: string;
  ageWeeks: number;
  location: string;
  image: string;
  sex: 'Female' | 'Male';
  collar: string;
  price: number;
  deposit: number;
  saleTerms: SaleType; // how the BREEDER has set this listing up to be sold
  saleType: SaleType | null; // how it was ACTUALLY bought, once someone buys it
  status: PetStatus;
  microchip: string;
  breederName: string;
  buyerName?: string;
  buyerEmail?: string;
  escrowHeld?: number;
  reviewRating?: number;
  reviewComment?: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  shippingFee?: number;
};

export const DEMO_BREEDER_NAME = 'Oakwood Paws & Cattery Studio';

const defaultImage = (species: Species) =>
  species === 'Dog'
    ? 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=60'
    : 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=60';

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Connect a Neon/Postgres database to this project in Vercel (Storage tab) and redeploy.',
    );
  }
  return neon(url);
}

type PetRow = {
  id: string;
  species: string;
  name: string;
  breed: string;
  bio: string;
  age_weeks: number;
  location: string;
  image: string;
  sex: string;
  collar: string;
  price: number;
  deposit: number;
  sale_terms: string;
  sale_type: string | null;
  status: string;
  microchip: string;
  breeder_name: string;
  buyer_name: string | null;
  buyer_email: string | null;
  escrow_held: number | null;
  review_rating: number | null;
  review_comment: string | null;
  pickup_available: boolean;
  shipping_available: boolean;
  shipping_fee: number | null;
};

function rowToPet(r: PetRow): Pet {
  return {
    id: r.id,
    species: r.species as Species,
    name: r.name,
    breed: r.breed,
    bio: r.bio,
    ageWeeks: r.age_weeks,
    location: r.location,
    image: r.image,
    sex: r.sex as 'Female' | 'Male',
    collar: r.collar,
    price: r.price,
    deposit: r.deposit,
    saleTerms: (r.sale_terms as SaleType) ?? 'deposit',
    saleType: (r.sale_type as SaleType | null) ?? null,
    status: r.status as PetStatus,
    microchip: r.microchip,
    breederName: r.breeder_name,
    buyerName: r.buyer_name ?? undefined,
    buyerEmail: r.buyer_email ?? undefined,
    escrowHeld: r.escrow_held ?? undefined,
    reviewRating: r.review_rating ?? undefined,
    reviewComment: r.review_comment ?? undefined,
    pickupAvailable: r.pickup_available,
    shippingAvailable: r.shipping_available,
    shippingFee: r.shipping_fee ?? undefined,
  };
}

export const listPets = createServerFn({ method: 'GET' }).handler(async () => {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM pets ORDER BY id`) as PetRow[];
  return rows.map(rowToPet);
});

export const addPet = createServerFn({ method: 'POST' })
  .validator(
    (input: {
      species: Species;
      name: string;
      sex: 'Female' | 'Male';
      collar: string;
      price: number;
      deposit: number;
      saleTerms: SaleType;
      microchip: string;
      breederName: string;
      breed: string;
      bio: string;
      ageWeeks: number;
      location: string;
      pickupAvailable: boolean;
      shippingAvailable: boolean;
      shippingFee?: number;
      image?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sql = getSql();
    const id = crypto.randomUUID();
    const image = data.image ?? defaultImage(data.species);
    const shippingFee = data.shippingAvailable ? data.shippingFee ?? null : null;
    const rows = (await sql`
      INSERT INTO pets (id, species, name, breed, bio, age_weeks, location, image, sex, collar, price, deposit, sale_terms, sale_type, status, microchip, breeder_name, pickup_available, shipping_available, shipping_fee)
      VALUES (${id}, ${data.species}, ${data.name}, ${data.breed || 'Mixed breed'}, ${data.bio}, ${data.ageWeeks}, ${data.location}, ${image}, ${data.sex}, ${data.collar}, ${data.price}, ${data.deposit}, ${data.saleTerms}, NULL, 'Available', ${data.microchip}, ${data.breederName}, ${data.pickupAvailable}, ${data.shippingAvailable}, ${shippingFee})
      RETURNING *
    `) as PetRow[];
    return rowToPet(rows[0]);
  });

export const removePet = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    await sql`DELETE FROM pets WHERE id = ${data.id}`;
    return { id: data.id };
  });

// Lets a breeder correct/update a listing after the fact — price, bio,
// age, location, photo, and fulfillment options. Intentionally does NOT
// allow editing status/buyer/escrow fields; those only change through the
// dedicated sale-lifecycle functions below, so a listing edit can never
// accidentally rewrite an in-progress transaction.
export const updatePet = createServerFn({ method: 'POST' })
  .validator(
    (input: {
      id: string;
      name: string;
      breed: string;
      bio: string;
      ageWeeks: number;
      location: string;
      price: number;
      deposit: number;
      saleTerms: SaleType;
      pickupAvailable: boolean;
      shippingAvailable: boolean;
      shippingFee?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sql = getSql();
    const shippingFee = data.shippingAvailable ? data.shippingFee ?? null : null;
    const rows = (await sql`
      UPDATE pets SET
        name = ${data.name},
        breed = ${data.breed},
        bio = ${data.bio},
        age_weeks = ${data.ageWeeks},
        location = ${data.location},
        price = ${data.price},
        deposit = ${data.deposit},
        sale_terms = ${data.saleTerms},
        pickup_available = ${data.pickupAvailable},
        shipping_available = ${data.shippingAvailable},
        shipping_fee = ${shippingFee}
      WHERE id = ${data.id}
      RETURNING *
    `) as PetRow[];
    return rows[0] ? rowToPet(rows[0]) : undefined;
  });

// Reserve with a deposit (checkout "reservation" path)
export const reservePet = createServerFn({ method: 'POST' })
  .validator((input: { id: string; buyerName: string; buyerEmail: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      UPDATE pets SET status = 'Reserved', sale_type = 'deposit', buyer_name = ${data.buyerName}, buyer_email = ${data.buyerEmail}, escrow_held = deposit
      WHERE id = ${data.id}
      RETURNING *
    `) as PetRow[];
    return rows[0] ? rowToPet(rows[0]) : undefined;
  });

// Pay in full up front (checkout "full payment" path)
export const buyFullPrice = createServerFn({ method: 'POST' })
  .validator((input: { id: string; buyerName: string; buyerEmail: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      UPDATE pets SET status = 'Sold', sale_type = 'full', buyer_name = ${data.buyerName}, buyer_email = ${data.buyerEmail}, escrow_held = price
      WHERE id = ${data.id}
      RETURNING *
    `) as PetRow[];
    return rows[0] ? rowToPet(rows[0]) : undefined;
  });

// Pay the remaining balance on a reserved (deposit) pet
export const payBalance = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      UPDATE pets SET status = 'Sold', escrow_held = price
      WHERE id = ${data.id}
      RETURNING *
    `) as PetRow[];
    return rows[0] ? rowToPet(rows[0]) : undefined;
  });

// Buyer confirms receipt -> escrow releases -> sale closes
export const confirmReceipt = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      UPDATE pets SET status = 'Closed'
      WHERE id = ${data.id}
      RETURNING *
    `) as PetRow[];
    return rows[0] ? rowToPet(rows[0]) : undefined;
  });

// Manual correction for an escrow entry — buyer name, amount held, sale
// type, and status. Kept separate from updatePet on purpose: updatePet
// covers listing details a breeder edits themselves, this covers the
// transaction record itself, for fixing mistakes (wrong buyer name typo,
// wrong amount, etc.) rather than the normal sale lifecycle.
export const updateEscrow = createServerFn({ method: 'POST' })
  .validator(
    (input: {
      id: string;
      buyerName: string;
      saleType: SaleType;
      escrowHeld: number;
      status: PetStatus;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      UPDATE pets SET
        buyer_name = ${data.buyerName},
        sale_type = ${data.saleType},
        escrow_held = ${data.escrowHeld},
        status = ${data.status}
      WHERE id = ${data.id}
      RETURNING *
    `) as PetRow[];
    return rows[0] ? rowToPet(rows[0]) : undefined;
  });

export const submitReview = createServerFn({ method: 'POST' })
  .validator((input: { id: string; rating: number; comment: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      UPDATE pets SET review_rating = ${data.rating}, review_comment = ${data.comment}
      WHERE id = ${data.id}
      RETURNING *
    `) as PetRow[];
    return rows[0] ? rowToPet(rows[0]) : undefined;
  });

/* ------------------------------------------------------------
   Breeder documents (licenses, health certs, etc). Real uploads
   go in here as "Pending Review" — nothing self-certifies. Moving
   a document from Pending to Verified is the admin/trust & safety
   dashboard's job, not something a breeder can toggle themselves.

   NOTE: this stores file name + type only, not the file bytes —
   there's no object storage (e.g. Vercel Blob) wired up yet, so
   the actual uploaded file isn't persisted anywhere. That's the
   next natural piece of work here.
------------------------------------------------------------ */

export type DocumentStatus = 'Verified' | 'Pending Review';

export type BreederDocument = {
  id: string;
  breederName: string;
  title: string;
  fileName: string;
  status: DocumentStatus;
  uploadedAt: string;
};

type DocumentRow = {
  id: string;
  breeder_name: string;
  title: string;
  file_name: string;
  status: string;
  uploaded_at: string;
};

function rowToDocument(r: DocumentRow): BreederDocument {
  return {
    id: r.id,
    breederName: r.breeder_name,
    title: r.title,
    fileName: r.file_name,
    status: r.status as DocumentStatus,
    uploadedAt: r.uploaded_at,
  };
}

export const listDocuments = createServerFn({ method: 'GET' })
  .validator((input: { breederName: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`SELECT * FROM documents WHERE breeder_name = ${data.breederName} ORDER BY uploaded_at DESC`) as DocumentRow[];
    return rows.map(rowToDocument);
  });

export const addDocument = createServerFn({ method: 'POST' })
  .validator((input: { breederName: string; title: string; fileName: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const id = crypto.randomUUID();
    const uploadedAt = new Date().toISOString().slice(0, 10);
    const rows = (await sql`
      INSERT INTO documents (id, breeder_name, title, file_name, status, uploaded_at)
      VALUES (${id}, ${data.breederName}, ${data.title}, ${data.fileName}, 'Pending Review', ${uploadedAt})
      RETURNING *
    `) as DocumentRow[];
    return rowToDocument(rows[0]);
  });

export const removeDocument = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    await sql`DELETE FROM documents WHERE id = ${data.id}`;
    return { id: data.id };
  });
