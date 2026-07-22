import { neon } from '@neondatabase/serverless';
import { createServerFn } from '@tanstack/react-start';

/* ------------------------------------------------------------
   Breeder accounts + verification — now backed by the same
   Postgres database as pets-store.ts.

   NOTE ON SECURITY: passwords are stored in plain text here for
   demo purposes only. Before this touches real user data, swap
   this for real password hashing (e.g. bcrypt/argon2) — do not
   ship this file's password handling as-is.
------------------------------------------------------------ */

export type BreederStatus = 'pending' | 'approved' | 'rejected';

export type BreederAccount = {
  id: string;
  businessName: string;
  email: string;
  usdaLicense: string;
  status: BreederStatus;
  appliedAt: string;
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
  email: string;
  password: string;
  usda_license: string;
  status: string;
  applied_at: string;
};

function publicAccount(r: BreederRow): BreederAccount {
  return {
    id: r.id,
    businessName: r.business_name,
    email: r.email,
    usdaLicense: r.usda_license,
    status: r.status as BreederStatus,
    appliedAt: r.applied_at,
  };
}

export const applyAsBreeder = createServerFn({ method: 'POST' })
  .validator((input: { businessName: string; email: string; password: string; usdaLicense: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const existing = (await sql`SELECT id FROM breeders WHERE lower(email) = lower(${data.email})`) as { id: string }[];
    if (existing.length > 0) {
      return { ok: false as const, error: 'An account with this email already exists.' };
    }
    const id = crypto.randomUUID();
    const appliedAt = new Date().toISOString().slice(0, 10);
    await sql`
      INSERT INTO breeders (id, business_name, email, password, usda_license, status, applied_at)
      VALUES (${id}, ${data.businessName}, ${data.email}, ${data.password}, ${data.usdaLicense}, 'pending', ${appliedAt})
    `;
    return { ok: true as const, id };
  });

export const loginBreeder = createServerFn({ method: 'POST' })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`SELECT * FROM breeders WHERE lower(email) = lower(${data.email})`) as BreederRow[];
    const account = rows[0];
    if (!account || account.password !== data.password) {
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
