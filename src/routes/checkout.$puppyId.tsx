import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getPuppy } from "@/lib/mock-data";

export const Route = createFileRoute("/checkout/$puppyId")({
  head: () => ({
    meta: [
      { title: "Reserve your puppy — LivePaws" },
      { name: "description", content: "Secure your puppy with an escrow-backed deposit." },
    ],
  }),
  loader: ({ params }) => ({ puppy: getPuppy(params.puppyId) }),
  component: Checkout,
});

function Checkout() {
  const { puppy } = Route.useLoaderData();
  const total = puppy.deposit;

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reserve {puppy.name}</h1>
          <p className="text-sm text-muted-foreground">
            Your deposit is held in escrow until pickup — fully refundable per our health guarantee.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Your details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Jamie Rivera" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="jamie@example.com" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Shipping city</Label>
                  <Input id="address" placeholder="Portland, OR" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Payment — held in escrow
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="card">Card number</Label>
                  <Input id="card" placeholder="1234 1234 1234 1234" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exp">Expiry</Label>
                  <Input id="exp" placeholder="MM / YY" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" />
                </div>
              </CardContent>
            </Card>

            <div className="rounded-xl border border-trust/30 bg-trust/5 p-4 text-sm">
              <div className="flex gap-2 font-semibold text-trust">
                <ShieldCheck className="h-4 w-4" /> LivePaws Escrow Guarantee
              </div>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-trust" /> Funds released only after successful pickup</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-trust" /> 14-day health guarantee refund window</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-trust" /> Cancel anytime before the puppy is 6 weeks</li>
              </ul>
            </div>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-20 overflow-hidden py-0">
              <div className="relative aspect-video">
                <img src={puppy.image} alt={puppy.name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="space-y-4 p-5">
                <div>
                  <h3 className="text-lg font-semibold">{puppy.name}</h3>
                  <p className="text-sm text-muted-foreground">{puppy.breed} · {puppy.litter}</p>
                  <p className="text-sm text-muted-foreground">Bred by {puppy.breeder}</p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Puppy price</span>
                    <span>${puppy.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Escrow deposit due today</span>
                    <span className="font-semibold">${puppy.deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Balance at pickup</span>
                    <span>${(puppy.price - puppy.deposit).toLocaleString()}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold">Due now</span>
                  <span className="text-2xl font-bold text-primary">${total.toLocaleString()}</span>
                </div>
                <Button size="lg" className="w-full">
                  <Lock className="mr-1.5 h-4 w-4" /> Place deposit in escrow
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  By reserving you agree to the LivePaws Escrow Terms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
