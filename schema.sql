-- LivePaws D1 schema
-- Mirrors the Pet / BreederAccount / BreederDocument types currently
-- living in src/lib/pets-store.ts and src/lib/auth-store.ts.

CREATE TABLE IF NOT EXISTS breeders (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- TODO: hash before real users touch this
  usda_license TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  breeder_id TEXT NOT NULL REFERENCES breeders(id),
  created_at TEXT NOT NULL
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
  sex TEXT NOT NULL CHECK (sex IN ('Female', 'Male')),
  collar TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  deposit INTEGER NOT NULL DEFAULT 250,
  sale_type TEXT CHECK (sale_type IN ('full', 'deposit')),
  status TEXT NOT NULL CHECK (status IN ('Available', 'Reserved', 'Sold', 'Closed')) DEFAULT 'Available',
  microchip TEXT NOT NULL DEFAULT '',
  breeder_name TEXT NOT NULL,
  buyer_name TEXT,
  escrow_held INTEGER,
  review_rating INTEGER,
  review_comment TEXT,
  pickup_available INTEGER NOT NULL DEFAULT 1,
  shipping_available INTEGER NOT NULL DEFAULT 0,
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

-- Seed: the same demo breeder + pets currently hardcoded in pets-store.ts,
-- so switching to D1 doesn't lose the ability to click through the demo.
INSERT OR IGNORE INTO breeders (id, business_name, email, password, usda_license, status, applied_at)
VALUES ('demo-breeder', 'Oakwood Paws & Cattery Studio', 'demo@livepaws.example', 'demo1234', '22-B-0087', 'approved', '2026-01-10');

INSERT OR IGNORE INTO pets (id, species, name, breed, bio, age_weeks, location, image, sex, collar, price, deposit, sale_type, status, microchip, breeder_name, buyer_name, escrow_held, pickup_available, shipping_available, shipping_fee)
VALUES
  ('1', 'Dog', 'Puppy #1 (Light Cream)', 'Golden Retriever', 'Playful and affectionate, already crate-training well. Loves belly rubs and squeaky toys.', 9, 'Bend, OR', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=60', 'Female', 'Pink Collar', 1800, 250, 'deposit', 'Reserved', '9851410029381', 'Oakwood Paws & Cattery Studio', 'Sarah Miller', 250, 1, 1, 250),
  ('2', 'Cat', 'Kitten #1 (Blue Point Ragdoll)', 'Ragdoll', 'Gentle lap cat in training — calm around noise and already used to being handled daily.', 10, 'Bend, OR', 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=60', 'Male', 'Blue Collar', 1500, 200, NULL, 'Available', '9851410029399', 'Oakwood Paws & Cattery Studio', NULL, NULL, 1, 0, NULL),
  ('3', 'Dog', 'Puppy #3 (Dark Golden)', 'Golden Retriever', 'The bold one of the litter — first to explore new toys, good with other dogs.', 9, 'Bend, OR', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=60', 'Male', 'Green Collar', 1800, 250, 'full', 'Sold', '9851410029383', 'Oakwood Paws & Cattery Studio', 'Marcus Vance', 1800, 1, 1, 250);

INSERT OR IGNORE INTO documents (id, breeder_name, title, file_name, status, uploaded_at)
VALUES
  ('d1', 'Oakwood Paws & Cattery Studio', 'State Breeder License / Registration', 'breeder-license.pdf', 'Verified', '2026-01-15'),
  ('d2', 'Oakwood Paws & Cattery Studio', 'Vet Inspection & Health Certificates', 'vet-inspection-2026.pdf', 'Verified', '2026-06-20');
