"use client";
import { useRouter } from "next/navigation";
import { MicroSimPlayer } from "@/components/MicroSimPlayer";

const featureCards: [string, string][] = [
  ["Scenario-based simulations", "Define the challenge once and let curated personas debate risks and moves."],
  ["Persona intelligence", "Each expert is trained with tone, remit and constraints like a real colleague."],
  ["Instant playbooks", "Export briefs: GTM decks, legal drafts, conversion copy with confidence scores."],
  ["Confidence scoring", "See where personas agree, diverge and why before you commit."],
  ["Bias-aware guardrails", "Legal and safety personas flag blind spots so you move fast without breaking trust."],
  ["Collaboration-ready exports", "Share transcripts and summaries with context for stakeholders."],
];

const howSteps: [string, string][] = [
  ["Brief your virtual board", "Frame the mission, drop context docs, pick personas."],
  ["Watch debate in real time", "Experts challenge one another and converge on a call."],
  ["Ship the decision-ready output", "Export summary, confidence and next steps."],
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 p-8 text-white shadow-soft">
        <div className="absolute inset-y-0 right-[-10%] hidden w-[50%] rounded-full bg-white/10 blur-3xl md:block" aria-hidden />
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="space-y-6 text-balance">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-widest text-white/90">
              Assembled for your virtual boardroom
            </div>
            <h1 className="font-display text-4xl leading-none sm:text-5xl lg:text-6xl">
              Pick your AI experts. Simulate every critical decision with cinematic clarity.
            </h1>
            <p className="max-w-xl text-base text-white/90 sm:text-lg">
              Stress-test strategy, creative, legal, and ops in one run. Watch personas debate, then ship the decision-ready brief.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push("/studio")}
                className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-fg shadow-sm transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Launch a simulation
              </button>
              <a
                href="#how"
                className="rounded-xl border border-white/70 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Explore the workflow
              </a>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-xs uppercase tracking-wide text-white/80 sm:grid-cols-3">
              <div>
                <dt className="text-white/60">Simulated plays</dt>
                <dd className="text-lg font-semibold text-white">15+</dd>
              </div>
              <div>
                <dt className="text-white/60">Expert personas</dt>
                <dd className="text-lg font-semibold text-white">40+</dd>
              </div>
              <div>
                <dt className="text-white/60">Avg. decision lift</dt>
                <dd className="text-lg font-semibold text-white">3× faster</dd>
              </div>
            </dl>
          </div>
          <MicroSimPlayer onLaunchStudio={() => router.push("/studio")} />
        </div>
      </section>

      <section aria-labelledby="features" className="space-y-6">
        <div className="flex flex-col gap-3 text-balance sm:flex-row sm:items-end sm:justify-between">
          <h2 id="features" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to pressure-test ideas before they hit the real world
          </h2>
          <p className="max-w-xl text-sm text-slate-600">
            Simulate combines strategy, compliance, marketing, finance, and operations personas to deliver decision-ready playbooks you can share instantly.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featureCards.map(([title, description]) => (
            <article
              key={title}
              className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-panel p-5 text-sm shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-base font-semibold text-fg">{title}</h3>
              <p className="text-sm text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" aria-labelledby="howworks" className="space-y-6">
        <div className="flex flex-col gap-3 text-balance sm:flex-row sm:items-end sm:justify-between">
          <h2 id="howworks" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            A simulation engine designed for fast-moving teams
          </h2>
          <p className="max-w-xl text-sm text-slate-600">
            Every production-ready transcript is streamed in real time with summaries, KPIs, and confidence scoring you can act on immediately.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {howSteps.map(([title, description], index) => (
            <li key={title} className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-panel p-5 shadow-soft">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-500">0{index + 1}</span>
              <h3 className="text-base font-semibold text-fg">{title}</h3>
              <p className="text-sm text-slate-600">{description}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
