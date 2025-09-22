"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MicroSimPlayer } from "@/components/MicroSimPlayer";

const metrics = [
  { label: "Playbooks shipped", value: "40+" },
  { label: "Personas ready", value: "15" },
  { label: "Avg. decision time", value: "-3m" },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 p-8 text-white shadow-soft sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_55%)]" aria-hidden />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              Assemble your virtual boardroom
            </span>
            <h1 className="font-display text-5xl leading-tight sm:text-6xl lg:text-7xl">
              Pick your AI experts. Simulate every critical decision with cinematic clarity.
            </h1>
            <p className="max-w-xl text-base text-white/90 sm:text-lg">
              Stress-test strategy, creative, legal, and ops in one run. Watch personas debate, then ship the decision-ready brief.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/studio")}
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-fg shadow-soft transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:translate-y-[-1px] hover:shadow-soft"
              >
                Launch a simulation
              </button>
              <a
                href="#how"
                className="inline-flex items-center justify-center rounded-xl border border-white/60 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-500 hover:translate-y-[-1px]"
              >
                Explore the workflow
              </a>
            </div>
            <dl className="grid max-w-xl grid-cols-3 gap-4 text-sm">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex flex-col rounded-2xl bg-white/10 p-4 text-left">
                  <dt className="text-xs uppercase tracking-widest text-white/70">{metric.label}</dt>
                  <dd className="mt-2 text-2xl font-semibold">{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <MicroSimPlayer onLaunchStudio={() => router.push("/studio")} />
          </motion.div>
        </div>
      </section>

      <section aria-labelledby="features" className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="features" className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              Everything you need to pressure-test ideas before they hit the real world
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-fg/70 sm:text-base">
              Simulate combines strategic, creative, legal, and ops intelligence with instant playbooks and persona governance so you can move fast with confidence.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/studio")}
            className="self-start rounded-xl border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Open the Studio
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            [
              "Scenario-based simulations",
              "Define the challenge once and let curated personas debate risks and moves with structured rounds.",
            ],
            [
              "Persona intelligence",
              "Each expert is trained with tone, remit, and constraints like a real colleague for grounded debate.",
            ],
            [
              "Instant playbooks",
              "Export summaries, briefs, and talking points ready to drop into your workspace.",
            ],
            [
              "Confidence scoring",
              "See where experts agree, diverge, and why before you commit resources.",
            ],
            [
              "Bias-aware guardrails",
              "Safety and legal personas flag blind spots and compliance gaps in real time.",
            ],
            [
              "Collaboration-ready exports",
              "Share transcripts and briefs with stakeholders complete with next steps.",
            ],
          ].map(([title, description]) => (
            <div key={title} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-panel p-5 shadow-soft">
              <h3 className="text-lg font-semibold text-fg">{title}</h3>
              <p className="text-sm leading-relaxed text-fg/70">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" aria-labelledby="howworks" className="space-y-6">
        <h2 id="howworks" className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          How it works
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Brief your virtual board",
              "Frame the mission, drop context docs, and pick personas aligned to their real-world counterparts.",
            ],
            [
              "Watch experts debate in real time",
              "See personas challenge assumptions, surface blockers, and converge on a confident call.",
            ],
            [
              "Ship the decision-ready output",
              "Instantly export summaries, confidence scoring, and next steps with full transcript context.",
            ],
          ].map(([title, description], index) => (
            <li key={title} className="flex h-full flex-col gap-3 rounded-2xl border border-black/10 bg-panel p-5 shadow-soft">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-fg/60">0{index + 1}</span>
              <h3 className="text-lg font-semibold text-fg">{title}</h3>
              <p className="text-sm leading-relaxed text-fg/70">{description}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
