"use client";
import { useEffect, useMemo, useState } from "react";

interface Persona { id: string; name: string; }
interface Line { personaId: string; text: string; }

interface MicroSimPlayerProps {
  personas?: Persona[];
  script?: Line[];
  onLaunchStudio?: () => void;
}

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

  const intervalDelay = 1800;
  const effectiveScript = useMemo(() => (script.length > 0 ? script : []), [script]);

  useEffect(() => {
    if (!effectiveScript.length) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % effectiveScript.length);
    }, intervalDelay);

    return () => window.clearInterval(timer);
  }, [effectiveScript, intervalDelay]);

  const line = effectiveScript[index] ?? { personaId: personas[0]?.id ?? "", text: "" };
  const personaName = personas.find((p) => p.id === line.personaId)?.name ?? "Advisor";

  return (
    <figure className="rounded-2xl border border-black/10 bg-panel p-4 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm opacity-70">Preview</div>
        <button
          onClick={onLaunchStudio}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-bg"
          type="button"
        >
          Recreate in Studio
        </button>
      </div>
      <div className="mt-4 min-h-[4rem] text-lg leading-relaxed" aria-live="polite">
        <strong>{personaName}:</strong> {line.text}
      </div>
      <figcaption className="sr-only" aria-live="polite">
        {personaName}: {line.text}
      </figcaption>
    </figure>
  );
}
