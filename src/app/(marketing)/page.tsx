import Link from "next/link";
import { ArrowRight, Layers, Palette, Sparkles, Wand2, Image as ImageIcon, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: ImageIcon,
    title: "AI Image Generation",
    description: "Production-grade visuals from a single sentence, tuned for social formats out of the box.",
  },
  {
    icon: Layers,
    title: "Carousel Generator",
    description: "Describe a topic, get a fully structured multi-slide carousel with a consistent visual identity.",
  },
  {
    icon: Wand2,
    title: "Prompt Enhancement",
    description: "Kogni rewrites short ideas into detailed, professional prompts automatically.",
  },
  {
    icon: Palette,
    title: "Brand Kit",
    description: "Save your colors, fonts and tone once — every generation stays on-brand.",
  },
  {
    icon: PenTool,
    title: "Creative Studio",
    description: "A focused workspace to prompt, preview, refine and export — no technical setup required.",
  },
  {
    icon: Sparkles,
    title: "Templates",
    description: "Start from professionally designed templates across a dozen industries.",
  },
];

const STEPS = [
  { number: "01", title: "Describe", description: "Explain what you want to create in plain language." },
  { number: "02", title: "Generate", description: "Kogni composes and renders your visual in seconds." },
  { number: "03", title: "Refine", description: "Regenerate, create variations, or fine-tune the details." },
  { number: "04", title: "Publish", description: "Export and share, ready for Instagram or any platform." },
];

const FAQ = [
  {
    q: "Do I need design experience to use Kogni?",
    a: "No. Kogni is built so anyone can describe an idea in plain language and get a professional result — technical settings stay tucked away in Advanced options.",
  },
  {
    q: "Can I keep my carousel slides visually consistent?",
    a: "Yes — Kogni builds one shared visual identity for the whole carousel, then applies it consistently across every slide.",
  },
  {
    q: "What image formats are supported?",
    a: "All standard Instagram formats (post, portrait, story, reel cover) plus YouTube, LinkedIn, X, Facebook and custom dimensions.",
  },
  {
    q: "Can I switch AI models later?",
    a: "Kogni's generation layer is provider-agnostic by design, so new models can be added without disrupting your workflow.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_40%,transparent_100%)]" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-24 pb-20 text-center sm:px-6 sm:pt-32 sm:pb-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-brand" />
            The AI creative studio for social content
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Create anything.
            <br />
            Make it unforgettable.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            Kogni turns your ideas into stunning AI-generated visuals, social posts and carousels in seconds.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              render={<Link href="/signup" />} nativeButton={false}
            >
              Start creating
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<a href="#showcase" />} nativeButton={false}>
              Explore examples
            </Button>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-border/60 bg-muted/30 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Trusted by creators, marketers and teams
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.number}>
              <span className="text-sm font-mono text-brand">{step.number}</span>
              <h3 className="mt-3 text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 max-w-lg">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything for social-first content</h2>
          <p className="mt-3 text-muted-foreground">
            One studio for image generation, carousels, ads and copy — built for creators and teams who publish often.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-background p-6">
              <feature.icon className="size-5 text-brand" strokeWidth={1.75} />
              <h3 className="mt-4 text-sm font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section id="showcase" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 max-w-lg">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Made with Kogni</h2>
          <p className="mt-3 text-muted-foreground">A glimpse of what a single prompt can produce.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "aspect-4/5 rounded-xl border border-border bg-gradient-to-br from-muted to-card",
                i % 3 === 0 && "row-span-2 aspect-auto",
              )}
            />
          ))}
        </div>
      </section>

      {/* Carousel section */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Carousels, structured and generated automatically
            </h2>
            <p className="mt-4 text-muted-foreground">
              Describe your topic once. Kogni structures the narrative — hook, problem, insight, solution, CTA — and
              generates every slide with a consistent palette, typography and composition.
            </p>
            <Button className="mt-6 bg-brand text-brand-foreground hover:bg-brand/90" render={<Link href="/signup" />} nativeButton={false}>
              Try the carousel generator
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "aspect-4/5 w-1/3 shrink-0 rounded-xl border border-border bg-gradient-to-b from-muted to-card",
                  i === 1 && "scale-105 border-brand/40",
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 max-w-lg">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, credit-based pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade as your content output grows.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border p-6",
                plan.highlighted ? "border-brand bg-brand/[0.04] shadow-sm" : "border-border bg-card",
              )}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold">${plan.priceMonthly}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className={cn("mt-8", plan.highlighted && "bg-brand text-brand-foreground hover:bg-brand/90")}
                variant={plan.highlighted ? "default" : "outline"}
                render={<Link href="/signup" />} nativeButton={false}
              >
                Get started
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked questions</h2>
        <div className="mt-10 divide-y divide-border border-t border-border">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {item.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Your next great idea starts here.
        </h2>
        <p className="mt-4 text-muted-foreground">Start creating with Kogni.</p>
        <Button size="lg" className="mt-8 bg-brand text-brand-foreground hover:bg-brand/90" render={<Link href="/signup" />} nativeButton={false}>
          Start creating
          <ArrowRight className="size-4" />
        </Button>
      </section>
    </>
  );
}
