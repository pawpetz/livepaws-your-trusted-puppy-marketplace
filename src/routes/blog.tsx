import { createFileRoute } from '@tanstack/react-router';
import { Calendar } from 'lucide-react';
import { SiteShell } from '@/components/site-shell';
import { Card } from '@/components/ui/card';

export const Route = createFileRoute('/blog')({
  head: () => ({ meta: [{ title: 'Adoption & pet care blog — LivePaws' }] }),
  component: BlogPage,
});

const posts = [
  {
    title: 'What to actually look for during a nursery livestream',
    date: 'Jul 2, 2026',
    excerpt:
      "A live cam only helps if you know what to watch for — how the litter interacts, whether the space looks lived-in, and whether the breeder answers questions directly.",
  },
  {
    title: 'Reading a health certificate before you buy',
    date: 'Jun 18, 2026',
    excerpt:
      'Vaccination dates, deworming schedule, and a named vet clinic you can actually call — here\'s what a real certificate includes versus a template with blanks filled in.',
  },
  {
    title: 'The first 72 hours home with a new puppy or kitten',
    date: 'Jun 3, 2026',
    excerpt:
      'Confirming receipt closes your LivePaws order — but the settling-in period is where most early health issues actually show up. What to watch for.',
  },
];

function BlogPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adoption &amp; pet care blog</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Practical guidance for buyers and breeders using LivePaws.
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.title} className="p-5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> {post.date}
              </div>
              <h2 className="mt-1 font-semibold">{post.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
            </Card>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
