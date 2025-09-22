"use client";
import { useRouter } from "next/navigation";
import { MicroSimPlayer } from "@/components/MicroSimPlayer";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:py-16">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 p-8 text-white shadow-soft">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="text-xs uppercase tracking-[0.32em] text-white/80">Assemble your virtual boardroom</div>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Pick your AI experts. Simulate every critical decision with cinematic clarity.
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-white/85">
              Stress-test strategy, creative, legal, and ops in one run. Watch personas debate, then ship the decision-ready brief.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/studio")}
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-fg shadow-soft transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-transparent"
                type="button"
              >
                Launch a simulation
              </button>
              <a
                href="#how"
                className="inline-flex items-center justify-center rounded-xl border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-transparent"
              >
                Explore the workflow
              </a>
            </div>
          </div>
          <MicroSimPlayer onLaunchStudio={() => router.push("/studio")} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" aria-hidden="true" />
      </section>

      <section aria-labelledby="features-heading" className="space-y-6">
        <div className="flex flex-col gap-4 text-center lg:text-left">
          <h2 id="features-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything you need to pressure-test ideas</h2>
          <p className="mx-auto max-w-3xl text-sm text-fg/70 lg:mx-0">
            Simulate combines strategic frameworks with real reasoning traces so every product squad aligns before launch.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Scenario-based simulations", "Define the challenge once and let curated personas debate risks and moves."],
            ["Persona intelligence", "Each expert is trained with tone, remit, and constraints like a real colleague."],
            ["Instant playbooks", "Export briefs: GTM decks, legal drafts, conversion copy with confidence scores."],
            ["Confidence scoring", "See where personas agree, diverge, and why before you commit."],
            ["Bias-aware guardrails", "Legal and safety personas flag blind spots so you move fast without breaking trust."],
            ["Collaboration-ready exports", "Share transcripts and summaries with context for stakeholders."],
          ].map(([title, description]) => (
            <article key={title} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-panel p-5 shadow-soft">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-fg/70">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" aria-labelledby="how-heading" className="space-y-6">
        <div className="flex flex-col gap-4 text-center lg:text-left">
          <h2 id="how-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mx-auto max-w-3xl text-sm text-fg/70 lg:mx-0">
            Launch a simulation, stream the debate, then export the confident decision-ready brief for your stakeholders.
          </p>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {["Brief your virtual board", "Watch experts debate in real time", "Ship the decision-ready output"].map((title, index) => (
            <li key={title} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-panel p-5 shadow-soft">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-fg/50">0{index + 1}</span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-fg/70">
                {index === 0 && "Frame the mission, drop context docs, pick personas."}
                {index === 1 && "Experts challenge one another and converge on a call."}
                {index === 2 && "Export the summary, confidence, and next steps instantly."}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
