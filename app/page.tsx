"use client";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { MicroSimPlayer } from "@/components/MicroSimPlayer";

export default function HomePage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const hoverProps = prefersReducedMotion
    ? undefined
    : { whileHover: { scale: 1.03 }, whileTap: { scale: 0.98 } };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16 space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 p-8 text-white shadow-soft sm:p-10">
        <div className="grid gap-12 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="text-xs uppercase tracking-[0.35em] text-white/80">Assemble your virtual boardroom</div>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              Pick your AI experts. Simulate every critical decision with cinematic clarity.
            </h1>
            <p className="max-w-2xl text-base text-white/90 sm:text-lg">
              Stress-test strategy, creative, legal and ops in one run. Watch personas debate, then ship the decision-ready brief.
            </p>
            <div className="flex flex-wrap gap-3">
              <motion.button
                type="button"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-fg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={() => router.push("/studio")}
                {...hoverProps}
              >
                Launch a simulation
              </motion.button>
              <motion.a
                href="#how"
                className="rounded-xl border border-white/60 px-5 py-2.5 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                {...hoverProps}
              >
                Explore the workflow
              </motion.a>
            </div>
          </div>
          <MicroSimPlayer onLaunchStudio={() => router.push("/studio")} />
        </div>
      </section>

      <section aria-labelledby="features" className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 id="features" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything you need to pressure-test ideas
          </h2>
          <p className="text-sm text-fg/70 sm:text-base">
            Simulate.ai combines strategic intelligence with measurable playbooks so teams can commit without hesitation.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            [
              "Scenario-based simulations",
              "Define the challenge once and let curated personas debate risks and moves.",
            ],
            [
              "Persona intelligence",
              "Each expert is trained with tone, remit and constraints like a real colleague.",
            ],
            [
              "Instant playbooks",
              "Export briefs: GTM decks, legal drafts, conversion copy with confidence scores.",
            ],
            [
              "Confidence scoring",
              "See where personas agree, diverge and why before you commit.",
            ],
            [
              "Bias-aware guardrails",
              "Legal and safety personas flag blind spots so you move fast without breaking trust.",
            ],
            [
              "Collaboration-ready exports",
              "Share transcripts and summaries with context for stakeholders.",
            ],
          ].map(([title, description]) => (
            <article
              key={title}
              className="flex flex-col justify-between rounded-2xl border border-black/10 bg-panel p-5 shadow-soft transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg"
            >
              <div>
                <h3 className="text-lg font-semibold text-fg/90">{title}</h3>
                <p className="mt-2 text-sm text-fg/70">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="how" aria-labelledby="howworks" className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 id="howworks" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <p className="text-sm text-fg/70 sm:text-base">
            Pressure-test plans in minutes—brief your board, stream the debate, export the decision-ready output.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            [
              "Brief your virtual board",
              "Frame the mission, drop context docs, pick personas.",
            ],
            [
              "Watch debate in real time",
              "Experts challenge one another and converge on a call.",
            ],
            [
              "Ship the decision-ready output",
              "Export summary, confidence and next steps.",
            ],
          ].map(([title, description], index) => (
            <li
              key={title}
              className="rounded-2xl border border-black/10 bg-panel p-5 shadow-soft transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg"
            >
              <div className="text-xs font-mono uppercase tracking-widest text-fg/50">0{index + 1}</div>
              <h3 className="mt-3 text-lg font-semibold text-fg/90">{title}</h3>
              <p className="mt-2 text-sm text-fg/70">{description}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
