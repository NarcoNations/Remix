"use client";
import { useEffect, useMemo, useState } from "react";

type Persona = { id: string; name: string };
type ScriptLine = { personaId: string; text: string };

type MicroSimPlayerProps = {
  personas?: Persona[];
  script?: ScriptLine[];
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
  const [index, setIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (!media) return;
    const update = (event: MediaQueryListEvent | MediaQueryList) => setPrefersReducedMotion(event.matches);
    update(media);
    const listener = (event: MediaQueryListEvent) => update(event);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || script.length <= 1) return;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % script.length), 1800);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, script.length]);

  const activeLine = useMemo(() => script[index] ?? script[0], [index, script]);
  const speaker = useMemo(
    () => personas.find((persona) => persona.id === activeLine?.personaId)?.name ?? "Advisor",
    [activeLine?.personaId, personas],
  );

  return (
    <figure className="rounded-2xl border border-black/10 bg-panel p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm opacity-70">Preview</div>
        <button
          type="button"
          onClick={onLaunchStudio}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:opacity-50"
        >
          Recreate in Studio
        </button>
      </div>
      <div className="mt-3 min-h-[4rem] text-lg" aria-live="polite">
        <strong>{speaker}:</strong> {activeLine?.text}
      </div>
      <figcaption className="sr-only" aria-live="polite">
        {speaker}: {activeLine?.text}
      </figcaption>
      <div className="mt-4 flex items-center gap-2" aria-hidden="true">
        {script.map((_, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={`h-1.5 flex-1 rounded-full bg-primary/20 transition ${i === index ? "bg-primary" : ""}`}
          />
        ))}
      </div>
    </figure>
  );
}
