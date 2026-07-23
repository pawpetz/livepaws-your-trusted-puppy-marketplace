import { neon } from '@neondatabase/serverless';
import { createServerFn } from '@tanstack/react-start';
import { hashPassword, verifyPassword } from './password';

/* ------------------------------------------------------------
   Real admin accounts, replacing the single shared ADMIN_PASSWORD
   check everywhere it was used before.

   Creating a NEW admin account still requires knowing the
   ADMIN_PASSWORD env var — think of it as a "master key" that lets
   someone who already has real access mint a new named admin
   account. This avoids open self-registration for admin access
   (which would be a real security problem) while still moving away
   from "everyone shares one password."
------------------------------------------------------------ */

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  return neon(url);
}

export type AdminAccount = { id: string; name: string; email: string };

type AdminRow = { id: string; name: string; email: string; password: string };

function publicAdmin(r: AdminRow): AdminAccount {
  return { id: r.id, name: r.name, email: r.email };
}

// Plain async function (not a server fn) — other files import this
// directly to check whether a token belongs to a currently valid
// admin session, replacing the old plain-password comparison.
export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token) return false;
  const sql = getSql();
  const rows = (await sql`
    SELECT a.id FROM admin_sessions s JOIN admins a ON a.id = s.admin_id WHERE s.token = ${token}
  `) as { id: string }[];
  return rows.length > 0;
}

export const createAdmin = createServerFn({ method: 'POST' })
  .validator((input: { name: string; email: string; password: string; masterPassword: string }) => input)
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || data.masterPassword !== expected) {
      return { ok: false as const, error: 'Incorrect master password.' };
    }
    const sql = getSql();
    const existing = (await sql`SELECT id FROM admins WHERE lower(email) = lower(${data.email})`) as { id: string }[];
    if (existing.length > 0) {
      return { ok: false as const, error: 'An admin with this email already exists.' };
    }
    const id = crypto.randomUUID();
    const hashed = await hashPassword(data.password);
    await sql`INSERT INTO admins (id, name, email, password) VALUES (${id}, ${data.name}, ${data.email}, ${hashed})`;
    return { ok: true as const, id };
  });

export const loginAdmin = createServerFn({ method: 'POST' })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`SELECT * FROM admins WHERE lower(email) = lower(${data.email})`) as AdminRow[];
    const account = rows[0];
    if (!account || !(await verifyPassword(data.password, account.password))) {
      return { ok: false as const, error: 'Incorrect email or password.' };
    }
    const token = crypto.randomUUID();
    await sql`INSERT INTO admin_sessions (token, admin_id) VALUES (${token}, ${account.id})`;
    return { ok: true as const, token, admin: publicAdmin(account) };
  });

export const getSessionAdmin = createServerFn({ method: 'GET' })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      SELECT a.* FROM admin_sessions s JOIN admins a ON a.id = s.admin_id WHERE s.token = ${data.token}
    `) as AdminRow[];
    return rows[0] ? publicAdmin(rows[0]) : null;
  });

export const logoutAdmin = createServerFn({ method: 'POST' })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    await sql`DELETE FROM admin_sessions WHERE token = ${data.token}`;
    return { ok: true };
  });
