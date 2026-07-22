import { createServerFn } from '@tanstack/react-start';
import { DEMO_BREEDER_NAME } from './pets-store';

/* ------------------------------------------------------------
   Breeder accounts + verification.

   NOTE ON SECURITY: passwords are stored in plain text here for
   demo purposes only. Before this touches real user data, swap
   this for real password hashing (e.g. bcrypt/argon2) — do not
   ship this file's password handling as-is.

   NOTE ON PERSISTENCE: same as pets-store.ts, this is server
   in-memory state. Fine for building/demoing the flow end to
   end, resets on redeploy, and is the same seam to swap for a
   real database + real sessions (e.g. signed cookies) later.
------------------------------------------------------------ */

export type BreederStatus = 'pending' | 'approved' | 'rejected';

export type BreederAccount = {
  id: string;
  businessName: string;
  email: string;
  password: string;
  usdaLicense: string;
  status: BreederStatus;
  appliedAt: string;
};

let breeders: BreederAccount[] = [
  {
    id: 'demo-breeder',
    businessName: DEMO_BREEDER_NAME,
    email: 'demo@livepaws.example',
    password: 'demo1234',
    usdaLicense: '22-B-0087',
    status: 'approved',
    appliedAt: '2026-01-10',
  },
];

// token -> breeder id
const sessions = new Map<string, string>();

function publicAccount(b: BreederAccount) {
  const { password, ...rest } = b;
  return rest;
}

export const applyAsBreeder = createServerFn({ method: 'POST' })
  .validator((input: { businessName: string; email: string; password: string; usdaLicense: string }) => input)
  .handler(async ({ data }) => {
    if (breeders.some((b) => b.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false as const, error: 'An account with this email already exists.' };
    }
    const account: BreederAccount = {
      id: crypto.randomUUID(),
      businessName: data.businessName,
      email: data.email,
      password: data.password,
      usdaLicense: data.usdaLicense,
      status: 'pending',
      appliedAt: new Date().toISOString().slice(0, 10),
    };
    breeders = [...breeders, account];
    return { ok: true as const, id: account.id };
  });

export const loginBreeder = createServerFn({ method: 'POST' })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const account = breeders.find((b) => b.email.toLowerCase() === data.email.toLowerCase());
    if (!account || account.password !== data.password) {
      return { ok: false as const, error: 'invalid' as const };
    }
    if (account.status !== 'approved') {
      return { ok: false as const, error: account.status };
    }
    const token = crypto.randomUUID();
    sessions.set(token, account.id);
    return { ok: true as const, token, breeder: publicAccount(account) };
  });

export const getSessionBreeder = createServerFn({ method: 'GET' })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const id = sessions.get(data.token);
    if (!id) return null;
    const account = breeders.find((b) => b.id === id);
    if (!account || account.status !== 'approved') return null;
    return publicAccount(account);
  });

export const logoutBreeder = createServerFn({ method: 'POST' })
  .validator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    sessions.delete(data.token);
    return { ok: true };
  });

// --- Admin (verification queue) ---

export const listBreeders = createServerFn({ method: 'GET' }).handler(async () =>
  breeders.map(publicAccount),
);

export const approveBreeder = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    breeders = breeders.map((b) => (b.id === data.id ? { ...b, status: 'approved' } : b));
    return { ok: true };
  });

export const rejectBreeder = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    breeders = breeders.map((b) => (b.id === data.id ? { ...b, status: 'rejected' } : b));
    return { ok: true };
  });
