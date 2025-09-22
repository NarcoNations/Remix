"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Persona = { id: string; name: string };
type Line = { personaId: string; text: string };

type MicroSimPlayerProps = {
  personas?: Persona[];
  script?: Line[];
  onLaunchStudio?: () => void;
};

export function MicroSimPlayer({
  personas = [
    { id: "a", name: "Strategic Advisor" },
    { id: "b", name: "Ops Coordinator" },
  ],
  script = [
    { personaId: "a", text: "We time-box a 48h pilot and measure conversion." },
    { personaId: "b", text: "Agree—add an exit rule if KPIs miss the mark." },
    { personaId: "a", text: "Let’s freeze scope, instrument metrics, and ship." },
  ],
  onLaunchStudio,
}: MicroSimPlayerProps) {
  const shouldReduceMotion = useReducedMotion();
  const safeScript = useMemo(() => (script.length ? script : [{ personaId: personas[0]?.id ?? "a", text: "Define your script." }]), [script, personas]);
  const [index, setIndex] = useState(0);
  const activeLine = safeScript[index % safeScript.length];
  const activePersona = personas.find((p) => p.id === activeLine.personaId)?.name ?? "Advisor";

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % safeScript.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [safeScript.length, shouldReduceMotion]);

  const advance = () => setIndex((value) => (value + 1) % safeScript.length);
  const retreat = () => setIndex((value) => (value - 1 + safeScript.length) % safeScript.length);

  return (
    <figure className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-panel p-4 shadow-soft" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm opacity-70">Preview</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={retreat}
            className="rounded-lg border border-white/10 bg-white/60 px-3 py-2 text-sm text-fg shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={advance}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onLaunchStudio}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Recreate in Studio
          </button>
        </div>
      </div>
      <motion.div
        key={`${activeLine.personaId}-${index}`}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-[4rem] text-balance text-lg leading-relaxed"
      >
        <strong>{activePersona}:</strong> {activeLine.text}
      </motion.div>
      <figcaption className="text-sm opacity-70">
        Rotate through a looping sample debate. Buttons provide full keyboard control and respect reduced-motion preferences.
      </figcaption>
    </figure>
  );
}
