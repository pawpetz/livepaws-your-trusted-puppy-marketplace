-- LivePaws schema for Neon (Postgres)
-- Mirrors the Pet / BreederAccount / BreederDocument types in
-- src/lib/pets-store.ts and src/lib/auth-store.ts.
--
-- Run this once in the Neon SQL Editor (Vercel Storage tab -> your
-- database -> "Open in Neon Console" -> SQL Editor), or via the "Query"
-- tab directly in the Vercel dashboard for this database.

CREATE TABLE IF NOT EXISTS breeders (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- TODO: hash before real users touch this
  phone TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  license_type TEXT NOT NULL DEFAULT 'usda' CHECK (license_type IN ('usda', 'state', 'none')),
  usda_license TEXT NOT NULL DEFAULT '', -- the license NUMBER, regardless of type
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at TEXT NOT NULL,
  is_live BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  breeder_id TEXT NOT NULL REFERENCES breeders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  species TEXT NOT NULL CHECK (species IN ('Dog', 'Cat')),
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  age_weeks INTEGER NOT NULL DEFAULT 8,
  location TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL,
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  sex TEXT NOT NULL CHECK (sex IN ('Female', 'Male')),
  collar TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  deposit INTEGER NOT NULL DEFAULT 250,
  sale_terms TEXT NOT NULL DEFAULT 'deposit' CHECK (sale_terms IN ('full', 'deposit')),
  sale_type TEXT CHECK (sale_type IN ('full', 'deposit')),
  status TEXT NOT NULL CHECK (status IN ('Available', 'Reserved', 'Sold', 'Closed')) DEFAULT 'Available',
  microchip TEXT NOT NULL DEFAULT '',
  breeder_name TEXT NOT NULL,
  buyer_name TEXT,
  escrow_held INTEGER,
  review_rating INTEGER,
  review_comment TEXT,
  pickup_available BOOLEAN NOT NULL DEFAULT true,
  shipping_available BOOLEAN NOT NULL DEFAULT false,
  shipping_fee INTEGER
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  breeder_name TEXT NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Verified', 'Pending Review')) DEFAULT 'Pending Review',
  uploaded_at TEXT NOT NULL
);

-- Seed: the same demo breeder + pets currently hardcoded in the app,
-- so switching to Postgres doesn't lose the ability to click through
-- the demo (demo@livepaws.example / demo1234).
INSERT INTO breeders (id, business_name, full_name, email, password, phone, location, license_type, usda_license, status, applied_at)
VALUES ('demo-breeder', 'Oakwood Paws & Cattery Studio', 'Jamie Oakwood', 'demo@livepaws.example', '3d2505f9234ba2dd37fb19cf6e8d1295:8948f294b29f1378401a6212989410ee436fdb38340e07e39d94a0489f2238fb9c749613efa2a5a307f9f00f4279327533ca1249ea1d7994351a9509a7d4936b', '555-201-4432', 'Bend, OR', 'usda', '22-B-0087', 'approved', '2026-01-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pets (id, species, name, breed, bio, age_weeks, location, image, sex, collar, price, deposit, sale_terms, sale_type, status, microchip, breeder_name, buyer_name, escrow_held, pickup_available, shipping_available, shipping_fee)
VALUES
  ('1', 'Dog', 'Puppy #1 (Light Cream)', 'Golden Retriever', 'Playful and affectionate, already crate-training well. Loves belly rubs and squeaky toys.', 9, 'Bend, OR', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=60', 'Female', 'Pink Collar', 1800, 250, 'deposit', 'deposit', 'Reserved', '9851410029381', 'Oakwood Paws & Cattery Studio', 'Sarah Miller', 250, true, true, 250),
  ('2', 'Cat', 'Kitten #1 (Blue Point Ragdoll)', 'Ragdoll', 'Gentle lap cat in training — calm around noise and already used to being handled daily.', 10, 'Bend, OR', 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=60', 'Male', 'Blue Collar', 1500, 200, 'deposit', NULL, 'Available', '9851410029399', 'Oakwood Paws & Cattery Studio', NULL, NULL, true, false, NULL),
  ('3', 'Dog', 'Puppy #3 (Dark Golden)', 'Golden Retriever', 'The bold one of the litter — first to explore new toys, good with other dogs.', 9, 'Bend, OR', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=60', 'Male', 'Green Collar', 1800, 250, 'full', 'full', 'Sold', '9851410029383', 'Oakwood Paws & Cattery Studio', 'Marcus Vance', 1800, true, true, 250)
ON CONFLICT (id) DO NOTHING;

INSERT INTO documents (id, breeder_name, title, file_name, status, uploaded_at)
VALUES
  ('d1', 'Oakwood Paws & Cattery Studio', 'State Breeder License / Registration', 'breeder-license.pdf', 'Verified', '2026-01-15'),
  ('d2', 'Oakwood Paws & Cattery Studio', 'Vet Inspection & Health Certificates', 'vet-inspection-2026.pdf', 'Verified', '2026-06-20')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  channel_slug TEXT NOT NULL,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  is_breeder BOOLEAN NOT NULL DEFAULT false,
  pinned BOOLEAN NOT NULL DEFAULT false,
  flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS buyers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL -- TODO: hash before real users touch this
);

CREATE TABLE IF NOT EXISTS buyer_sessions (
  token TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL REFERENCES buyers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pets ADD COLUMN IF NOT EXISTS buyer_email TEXT;

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
