export type Species = "dog" | "cat";

export const DOG_BREEDS = [
  "French Bulldog",
  "Golden Retriever",
  "Labrador Retriever",
  "Australian Shepherd",
  "Pembroke Welsh Corgi",
  "Dachshund",
] as const;

export const CAT_BREEDS = [
  "Maine Coon",
  "Ragdoll",
  "Sphynx",
  "Bengal",
  "British Shorthair",
  "Scottish Fold",
] as const;

export type Stream = {
  id: string;
  title: string;
  breeder: string;
  breed: string;
  species: Species;
  registry?: string;
  viewers: number;
  isLive: boolean;
  scheduledFor?: string;
  thumbnail: string;
  verified: boolean;
};

export type Litter = {
  id: string;
  name: string;
  breed: string;
  puppies: number;
  available: number;
  breeder: string;
  image: string;
  price: number;
};

export type Breeder = {
  id: string;
  name: string;
  location: string;
  rating: number;
  litters: number;
  verified: boolean;
  avatar: string;
};

export type Puppy = {
  id: string;
  name: string;
  breed: string;
  litter: string;
  breeder: string;
  price: number;
  deposit: number;
  image: string;
};

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=800&q=60`;

export const streams: Stream[] = [
  {
    id: "sunday-goldens",
    title: "Sunday morning with the Golden pups",
    breeder: "Cedar Ridge Kennel",
    breed: "Golden Retriever",
    viewers: 428,
    isLive: true,
    thumbnail: img("1587300003388-59208cc962cb"),
    verified: true,
  },
  {
    id: "frenchie-hour",
    title: "Frenchie Puppy Hour — 6 week check-in",
    breeder: "Rue Bulldogs",
    breed: "French Bulldog",
    viewers: 312,
    isLive: true,
    thumbnail: img("1583337130417-3346a1be7dee"),
    verified: true,
  },
  {
    id: "aussie-play",
    title: "Aussie shepherd litter playtime",
    breeder: "High Country Aussies",
    breed: "Australian Shepherd",
    viewers: 189,
    isLive: true,
    thumbnail: img("1548199973-03cce0bbc87b"),
    verified: false,
  },
  {
    id: "corgi-friday",
    title: "Corgi Friday — meet the puppies",
    breeder: "Meadowlark Corgis",
    breed: "Pembroke Welsh Corgi",
    viewers: 0,
    isLive: false,
    scheduledFor: "Fri 6:00 PM",
    thumbnail: img("1612536057832-2ff7ead58194"),
    verified: true,
  },
  {
    id: "dachshund-sat",
    title: "Mini dachshund weigh-in",
    breeder: "Little Line Dachshunds",
    breed: "Dachshund",
    viewers: 0,
    isLive: false,
    scheduledFor: "Sat 11:00 AM",
    thumbnail: img("1612774412771-005ed8e861d2"),
    verified: true,
  },
  {
    id: "labs-sunday",
    title: "Chocolate labs — 4 week milestone",
    breeder: "Riverbend Labradors",
    breed: "Labrador Retriever",
    viewers: 0,
    isLive: false,
    scheduledFor: "Sun 9:00 AM",
    thumbnail: img("1543466835-00a7907e9de1"),
    verified: true,
  },
];

export const litters: Litter[] = [
  {
    id: "goldens-may",
    name: "May Goldens",
    breed: "Golden Retriever",
    puppies: 8,
    available: 3,
    breeder: "Cedar Ridge Kennel",
    image: img("1587300003388-59208cc962cb"),
    price: 3200,
  },
  {
    id: "frenchies-spring",
    name: "Spring Frenchies",
    breed: "French Bulldog",
    puppies: 5,
    available: 2,
    breeder: "Rue Bulldogs",
    image: img("1583337130417-3346a1be7dee"),
    price: 4800,
  },
  {
    id: "aussies-april",
    name: "April Aussies",
    breed: "Australian Shepherd",
    puppies: 6,
    available: 4,
    breeder: "High Country Aussies",
    image: img("1548199973-03cce0bbc87b"),
    price: 2400,
  },
];

export const breeders: Breeder[] = [
  {
    id: "cedar-ridge",
    name: "Cedar Ridge Kennel",
    location: "Bend, OR",
    rating: 4.9,
    litters: 3,
    verified: true,
    avatar: img("1517849845537-4d257902454a"),
  },
  {
    id: "rue-bulldogs",
    name: "Rue Bulldogs",
    location: "Austin, TX",
    rating: 4.8,
    litters: 2,
    verified: true,
    avatar: img("1583337130417-3346a1be7dee"),
  },
  {
    id: "high-country",
    name: "High Country Aussies",
    location: "Boulder, CO",
    rating: 4.7,
    litters: 1,
    verified: false,
    avatar: img("1548199973-03cce0bbc87b"),
  },
  {
    id: "meadowlark",
    name: "Meadowlark Corgis",
    location: "Madison, WI",
    rating: 5.0,
    litters: 2,
    verified: true,
    avatar: img("1612536057832-2ff7ead58194"),
  },
];

export const puppies: Record<string, Puppy> = {
  "pup-01": {
    id: "pup-01",
    name: "Biscuit",
    breed: "Golden Retriever",
    litter: "May Goldens",
    breeder: "Cedar Ridge Kennel",
    price: 3200,
    deposit: 500,
    image: img("1587300003388-59208cc962cb"),
  },
  "pup-02": {
    id: "pup-02",
    name: "Olive",
    breed: "French Bulldog",
    litter: "Spring Frenchies",
    breeder: "Rue Bulldogs",
    price: 4800,
    deposit: 750,
    image: img("1583337130417-3346a1be7dee"),
  },
};

export function getStream(id: string): Stream | undefined {
  return streams.find((s) => s.id === id);
}

export function getPuppy(id: string): Puppy {
  return puppies[id] ?? {
    id,
    name: "Puppy",
    breed: "Mixed",
    litter: "Available litter",
    breeder: "Verified breeder",
    price: 2500,
    deposit: 400,
    image: img("1587300003388-59208cc962cb"),
  };
}
