"use client";
import { useEffect, useRef, useState } from "react";

interface PersonaPreview {
  id: string;
  name: string;
}

interface ScriptLine {
  personaId: string;
  text: string;
}

interface MicroSimPlayerProps {
  personas?: PersonaPreview[];
  script?: ScriptLine[];
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
  const [reduceMotion, setReduceMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mediaQuery.matches);
    update();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
    } else {
      mediaQuery.addListener(update);
    }
    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", update);
      } else {
        mediaQuery.removeListener(update);
      }
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    timer.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % script.length);
    }, 2200);
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [reduceMotion, script.length]);

  const activeLine = script[index] ?? script[0];
  const personaName = personas.find((p) => p.id === activeLine.personaId)?.name ?? "Advisor";

  return (
    <figure className="rounded-2xl border border-black/10 bg-panel p-4 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs uppercase tracking-wide text-fg/70">Preview</div>
        <button
          type="button"
          onClick={onLaunchStudio}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-soft transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-panel hover:translate-y-[-1px] hover:shadow-soft disabled:opacity-70"
        >
          Recreate in Studio
        </button>
      </div>
      <div className="mt-3 min-h-[4rem] rounded-xl border border-black/5 bg-white/90 p-4 text-base leading-relaxed text-fg shadow-inner">
        <span className="font-semibold text-fg/90">{personaName}:</span> {activeLine.text}
      </div>
      <figcaption className="sr-only" aria-live="polite">
        {personaName}: {activeLine.text}
      </figcaption>
    </figure>
  );
}
