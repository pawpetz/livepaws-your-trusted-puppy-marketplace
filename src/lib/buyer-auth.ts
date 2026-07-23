import { neon } from '@neondatabase/serverless';
import { createServerFn } from '@tanstack/react-start';

/* ------------------------------------------------------------
   Buyer accounts. Unlike breeders, there's no approval queue —
   anyone can sign up and immediately buy/chat. This is what lets
   chat messages and purchases be tied to a real, known identity
   instead of a free-typed name anyone could enter.

   Same security caveat as breeder auth: passwords are plain text
   here, for demo purposes only. Replace with real hashing before
   this touches real user data.
------------------------------------------------------------ */

export type BuyerAccount = {
  id: string;
  name: string;
  email: string;
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  return neon(url);
}

type BuyerRow = { id: string; name: string; email: string; password: string };

function publicBuyer(r: BuyerRow): BuyerAccount {
  return { id: r.id, name: r.name, email: r.email };
}

export const signupBuyer = createServerFn({ method: 'POST' })
  .validator((input: { name: string; email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const existing = (await sql`SELECT id FROM buyers WHERE lower(email) = lower(${data.email})`) as { id: string }[];
    if (existing.length > 0) {
      return { ok: false as const, error: 'An account with this email already exists.' };
    }
    const id = crypto.randomUUID();
    await sql`INSERT INTO buyers (id, name, email, password) VALUES (${id}, ${data.name}, ${data.email}, ${data.password})`;
    const token = crypto.randomUUID();
    await sql`INSERT INTO buyer_sessions (token, buyer_id) VALUES (${token}, ${id})`;
    return { ok: true as const, token, buyer: { id, name: data.name, email: data.email } };
  });

export const loginBuyer = createServerFn({ method: 'POST' })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`SELECT * FROM buyers WHERE lower(email) = lower(${data.email})`) as BuyerRow[];
    const account = rows[0];
    if (!account || account.password !== data.password) {
      return { ok: false as const, error: 'Incorrect email or password.' };
    }
    const token = crypto.randomUUID();
    await sql`INSERT INTO buyer_sessions (token, buyer_id) VALUES (${token}, ${account.id})`;
    return { ok: true as const, token, buyer: publicBuyer(account) };
  });

export const getSessionBuyer = createServerFn({ method: 'GET' })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      SELECT b.* FROM buyer_sessions s
      JOIN buyers b ON b.id = s.buyer_id
      WHERE s.token = ${data.token}
    `) as BuyerRow[];
    return rows[0] ? publicBuyer(rows[0]) : null;
  });

export const logoutBuyer = createServerFn({ method: 'POST' })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    await sql`DELETE FROM buyer_sessions WHERE token = ${data.token}`;
    return { ok: true };
  });

// Admin-only: full buyer directory. Password-checked server-side, same
// pattern as the breeder admin functions in auth-store.ts.
export const listBuyersForAdmin = createServerFn({ method: 'POST' })
  .validator((input: { password: string }) => input)
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || data.password !== expected) {
      return { ok: false as const, error: 'Incorrect password.' };
    }
    const sql = getSql();
    const rows = (await sql`SELECT * FROM buyers ORDER BY name`) as BuyerRow[];
    return { ok: true as const, buyers: rows.map((r) => publicBuyer(r)) };
  });
