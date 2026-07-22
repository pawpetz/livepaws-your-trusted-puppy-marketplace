# Setting up the real database (Cloudflare D1)

Everything in the app right now (pets, breeder accounts, documents) lives in
server memory — it resets every time the app restarts or redeploys. This is
the move to a real, persistent database.

I've added two files that are safe to commit right now:
- `schema.sql` — the real table structure, matching what the app already models
- `wrangler.jsonc` — declares the database binding (placeholder ID for now)

## What you need to do (needs your Cloudflare login — I can't do this part)

1. Install Wrangler if you don't have it: `npm install -g wrangler`
2. Log in: `wrangler login`
3. Create the database:
   ```
   wrangler d1 create livepaws-db
   ```
   This prints something like:
   ```
   database_id = "a1b2c3d4-....."
   ```
4. Open `wrangler.jsonc` and replace `REPLACE_ME_AFTER_RUNNING_WRANGLER_D1_CREATE`
   with that real ID.
5. Apply the schema — once locally (for `wrangler dev`/testing) and once to
   the real remote database:
   ```
   wrangler d1 execute livepaws-db --local --file=schema.sql
   wrangler d1 execute livepaws-db --remote --file=schema.sql
   ```
6. Commit `schema.sql` and the updated `wrangler.jsonc` to your repo.

## Then tell me

Once the database exists and the schema's applied, tell me the binding name
you used (`DB`, if you didn't change it) and I'll rewrite `pets-store.ts` and
`auth-store.ts` to actually query D1 instead of the in-memory arrays — that's
the part I can do safely once the real database is there to point at.

## Why I'm not doing this in one shot
I verified the config wiring works (the D1 binding does get picked up into
the deploy config), but I can't provision or query a real Cloudflare database
from this environment — that requires your account credentials, which
should never be shared with me. Splitting it this way means every piece
gets tested against something real instead of me guessing at the last step.
