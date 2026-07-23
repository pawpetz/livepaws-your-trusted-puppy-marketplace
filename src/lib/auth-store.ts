import { neon } from '@neondatabase/serverless';
import { createServerFn } from '@tanstack/react-start';
import { hashPassword, verifyPassword } from './password';

/* ------------------------------------------------------------
   Breeder accounts + verification — now backed by the same
   Postgres database as pets-store.ts.

   NOTE ON SECURITY: passwords are stored in plain text here for
   demo purposes only. Before this touches real user data, swap
   this for real password hashing (e.g. bcrypt/argon2) — do not
   ship this file's password handling as-is.
------------------------------------------------------------ */

export type BreederStatus = 'pending' | 'approved' | 'rejected';

export type LicenseType = 'usda' | 'state' | 'none';

export function licenseLabel(breeder: { licenseType: LicenseType; usdaLicense: string }): string {
  if (breeder.licenseType === 'usda') return `USDA #${breeder.usdaLicense}`;
  if (breeder.licenseType === 'state') return `State permit #${breeder.usdaLicense}`;
  return 'Hobby breeder (no formal license)';
}

export type BreederAccount = {
  id: string;
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  licenseType: LicenseType;
  usdaLicense: string; // license NUMBER, regardless of type — name kept for now to avoid a bigger migration
  status: BreederStatus;
  appliedAt: string;
  isLive: boolean;
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Connect a Neon/Postgres database to this project in Vercel (Storage tab) and redeploy.',
    );
  }
  return neon(url);
}

type BreederRow = {
  id: string;
  business_name: string;
  full_name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  license_type: string;
  usda_license: string;
  status: string;
  applied_at: string;
  is_live: boolean;
};

function publicAccount(r: BreederRow): BreederAccount {
  return {
    id: r.id,
    businessName: r.business_name,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    location: r.location,
    licenseType: (r.license_type as LicenseType) ?? 'usda',
    usdaLicense: r.usda_license,
    status: r.status as BreederStatus,
    appliedAt: r.applied_at,
    isLive: r.is_live,
  };
}

// Same slug format used for the Agora channel name — turns a business
// name into something usable in a URL, e.g. "Oakwood Paws & Cattery
// Studio" -> "oakwood-paws-cattery-studio".
function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const applyAsBreeder = createServerFn({ method: 'POST' })
  .validator(
    (input: {
      businessName: string;
      fullName: string;
      email: string;
      password: string;
      phone: string;
      location: string;
      licenseType: LicenseType;
      licenseNumber: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sql = getSql();
    const existing = (await sql`SELECT id FROM breeders WHERE lower(email) = lower(${data.email})`) as { id: string }[];
    if (existing.length > 0) {
      return { ok: false as const, error: 'An account with this email already exists.' };
    }
    const id = crypto.randomUUID();
    const appliedAt = new Date().toISOString().slice(0, 10);
    const hashed = await hashPassword(data.password);
    await sql`
      INSERT INTO breeders (id, business_name, full_name, email, password, phone, location, license_type, usda_license, status, applied_at)
      VALUES (${id}, ${data.businessName}, ${data.fullName}, ${data.email}, ${hashed}, ${data.phone}, ${data.location}, ${data.licenseType}, ${data.licenseNumber}, 'pending', ${appliedAt})
    `;
    return { ok: true as const, id };
  });

export const loginBreeder = createServerFn({ method: 'POST' })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`SELECT * FROM breeders WHERE lower(email) = lower(${data.email})`) as BreederRow[];
    const account = rows[0];
    if (!account || !(await verifyPassword(data.password, account.password))) {
      return { ok: false as const, error: 'invalid' as const };
    }
    if (account.status !== 'approved') {
      return { ok: false as const, error: account.status as BreederStatus };
    }
    const token = crypto.randomUUID();
    await sql`INSERT INTO sessions (token, breeder_id) VALUES (${token}, ${account.id})`;
    return { ok: true as const, token, breeder: publicAccount(account) };
  });

export const getSessionBreeder = createServerFn({ method: 'GET' })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      SELECT b.* FROM sessions s
      JOIN breeders b ON b.id = s.breeder_id
      WHERE s.token = ${data.token}
    `) as BreederRow[];
    const account = rows[0];
    if (!account || account.status !== 'approved') return null;
    return publicAccount(account);
  });

export const logoutBreeder = createServerFn({ method: 'POST' })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    await sql`DELETE FROM sessions WHERE token = ${data.token}`;
    return { ok: true };
  });

// Flipped by the real Agora broadcast component when a breeder actually
// starts/stops their camera — not just a UI toggle, so "live now" lists
// elsewhere in the app reflect something real.
export const setBreederLive = createServerFn({ method: 'POST' })
  .validator((input: { id: string; isLive: boolean }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    await sql`UPDATE breeders SET is_live = ${data.isLive} WHERE id = ${data.id}`;
    return { ok: true };
  });

// Resolves a URL slug (e.g. "oakwood-paws-cattery-studio") back to the
// real breeder it belongs to. Slugs aren't stored — computed on the fly
// from business_name, since there's no separate slug column (yet).
export const getBreederBySlug = createServerFn({ method: 'GET' })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`SELECT * FROM breeders WHERE status = 'approved'`) as BreederRow[];
    const match = rows.find((r) => slugify(r.business_name) === data.slug);
    return match ? publicAccount(match) : null;
  });

// For explore/landing "live now" sections.
export const listLiveBreeders = createServerFn({ method: 'GET' }).handler(async () => {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM breeders WHERE status = 'approved' AND is_live = true`) as BreederRow[];
  return rows.map((r) => ({ ...publicAccount(r), slug: slugify(r.business_name) }));
});

// Public directory of verified breeders — no password needed, this is
// the same kind of info a "verified sellers" listing on any marketplace
// would show publicly.
export const listApprovedBreeders = createServerFn({ method: 'GET' }).handler(async () => {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM breeders WHERE status = 'approved'`) as BreederRow[];
  return rows.map((r) => ({ ...publicAccount(r), slug: slugify(r.business_name) }));
});

// --- Admin (verification queue) ---
//
// Protected by a single shared password stored in the ADMIN_PASSWORD
// environment variable (set this in Vercel -> Settings -> Environment
// Variables; never commit the actual value to the repo). Every admin
// action below checks it server-side, so knowing the /admin URL alone
// isn't enough to approve or reject a breeder.

function checkAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error('ADMIN_PASSWORD is not set. Add it in Vercel -> Settings -> Environment Variables.');
  }
  return password === expected;
}

export const listBreeders = createServerFn({ method: 'POST' })
  .validator((input: { password: string }) => input)
  .handler(async ({ data }) => {
    if (!checkAdminPassword(data.password)) return { ok: false as const, error: 'Incorrect password.' };
    const sql = getSql();
    const rows = (await sql`SELECT * FROM breeders ORDER BY applied_at DESC`) as BreederRow[];
    return { ok: true as const, breeders: rows.map(publicAccount) };
  });

export const approveBreeder = createServerFn({ method: 'POST' })
  .validator((input: { id: string; password: string }) => input)
  .handler(async ({ data }) => {
    if (!checkAdminPassword(data.password)) return { ok: false as const, error: 'Incorrect password.' };
    const sql = getSql();
    await sql`UPDATE breeders SET status = 'approved' WHERE id = ${data.id}`;
    return { ok: true as const };
  });

export const rejectBreeder = createServerFn({ method: 'POST' })
  .validator((input: { id: string; password: string }) => input)
  .handler(async ({ data }) => {
    if (!checkAdminPassword(data.password)) return { ok: false as const, error: 'Incorrect password.' };
    const sql = getSql();
    await sql`UPDATE breeders SET status = 'rejected' WHERE id = ${data.id}`;
    return { ok: true as const };
  });
