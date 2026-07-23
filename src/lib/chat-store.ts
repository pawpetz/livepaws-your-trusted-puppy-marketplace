import { neon } from '@neondatabase/serverless';
import { createServerFn } from '@tanstack/react-start';

/* ------------------------------------------------------------
   Real shared live chat. Messages are stored in Postgres and
   read via polling (viewers/breeder check for new messages every
   few seconds) rather than a persistent socket connection — this
   fits Vercel's serverless functions much better than websockets
   would, at the cost of a small (1-3s) delay rather than instant.
------------------------------------------------------------ */

export type ChatMessage = {
  id: string;
  channelSlug: string;
  userName: string;
  text: string;
  isBreeder: boolean;
  pinned: boolean;
  flagged: boolean;
  createdAt: string;
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Connect a Neon/Postgres database to this project in Vercel.');
  }
  return neon(url);
}

type ChatRow = {
  id: string;
  channel_slug: string;
  user_name: string;
  text: string;
  is_breeder: boolean;
  pinned: boolean;
  flagged: boolean;
  created_at: string;
};

function rowToMessage(r: ChatRow): ChatMessage {
  return {
    id: r.id,
    channelSlug: r.channel_slug,
    userName: r.user_name,
    text: r.text,
    isBreeder: r.is_breeder,
    pinned: r.pinned,
    flagged: r.flagged,
    createdAt: r.created_at,
  };
}

// Same phone-number/URL masking from the original live-stream spec —
// now actually applied to real messages, server-side, so it can't be
// bypassed by a modified client.
function maskUnsafe(text: string): { clean: string; flagged: boolean } {
  const phoneRe = /(\+?\d[\d\-. ]{7,}\d)/g;
  const urlRe = /((https?:\/\/)?(www\.)?[a-z0-9-]+\.(com|net|org|co|io|me)\b\S*)/gi;
  let flagged = false;
  let clean = text.replace(phoneRe, () => {
    flagged = true;
    return '•••-•••-••••';
  });
  clean = clean.replace(urlRe, () => {
    flagged = true;
    return '[link hidden]';
  });
  return { clean, flagged };
}

export const listMessages = createServerFn({ method: 'GET' })
  .validator((input: { channelSlug: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM chat_messages
      WHERE channel_slug = ${data.channelSlug}
      ORDER BY created_at ASC
      LIMIT 200
    `) as ChatRow[];
    return rows.map(rowToMessage);
  });

export const sendMessage = createServerFn({ method: 'POST' })
  .validator((input: { channelSlug: string; userName: string; text: string; isBreeder: boolean }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    const { clean, flagged } = maskUnsafe(data.text);
    const id = crypto.randomUUID();
    const rows = (await sql`
      INSERT INTO chat_messages (id, channel_slug, user_name, text, is_breeder, pinned, flagged)
      VALUES (${id}, ${data.channelSlug}, ${data.userName}, ${clean}, ${data.isBreeder}, false, ${flagged})
      RETURNING *
    `) as ChatRow[];
    return rowToMessage(rows[0]);
  });

// Only one pinned message per channel at a time — pinning a new one
// automatically unpins the previous one, so the breeder's "featured
// question" is always unambiguous for viewers.
export const pinMessage = createServerFn({ method: 'POST' })
  .validator((input: { id: string; channelSlug: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    await sql`UPDATE chat_messages SET pinned = false WHERE channel_slug = ${data.channelSlug}`;
    await sql`UPDATE chat_messages SET pinned = true WHERE id = ${data.id}`;
    return { ok: true };
  });

export const unpinMessage = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const sql = getSql();
    await sql`UPDATE chat_messages SET pinned = false WHERE id = ${data.id}`;
    return { ok: true };
  });

// Admin-only: every flagged message across every stream, for moderation.
// Password-checked server-side, same pattern as the other admin functions.
export const listFlaggedMessages = createServerFn({ method: 'POST' })
  .validator((input: { password: string }) => input)
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || data.password !== expected) {
      return { ok: false as const, error: 'Incorrect password.' };
    }
    const sql = getSql();
    const rows = (await sql`
      SELECT * FROM chat_messages WHERE flagged = true ORDER BY created_at DESC LIMIT 200
    `) as ChatRow[];
    return { ok: true as const, messages: rows.map(rowToMessage) };
  });
