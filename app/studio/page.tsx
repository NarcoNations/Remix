"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import type { Persona } from "@/lib/sim/types";

type FormValues = {
  mission: string;
  constraints?: string;
  rounds: number;
};

type LineEvent = { type: "line"; personaId: string; text: string; round: number; idx: number };
type SummaryEvent = { type: "summary"; bullets: string[]; confidence: number; nextSteps: string[] };
type ErrorEvent = { type: "error"; message: string };
type SimEvent = LineEvent | SummaryEvent | ErrorEvent;

const DEFAULT_PERSONAS: Persona[] = [
  { id: "strategy", name: "Strategic Advisor", role: "Strategy", styleHint: "succinct" },
  { id: "ops", name: "Ops Coordinator", role: "Operations", styleHint: "pragmatic" },
];

export default function StudioPage() {
  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      mission: "Launch GTM pilot in 2 weeks.",
      constraints: "Budget < £5k; WCAG AA.",
      rounds: 3,
    },
  });

  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<LineEvent[]>([]);
  const [summary, setSummary] = useState<SummaryEvent | ErrorEvent | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const addPersona = useCallback(() => {
    setPersonas((prev) => [
      ...prev,
      {
        id: `persona-${prev.length + 1}`,
        name: `Advisor ${prev.length + 1}`,
        role: "Advisor",
        styleHint: "succinct",
      },
    ]);
  }, []);

  const removePersona = useCallback((id: string) => {
    setPersonas((prev) => prev.filter((persona) => persona.id !== id));
  }, []);

  const resetStudio = useCallback(() => {
    reset();
    setPersonas(DEFAULT_PERSONAS);
    setLines([]);
    setSummary(null);
  }, [reset]);

  const runSimulation = useCallback(
    async (values: FormValues) => {
      setRunning(true);
      setLines([]);
      setSummary(null);

      try {
        const response = await fetch("/api/sim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, personas, rounds: Number(values.rounds) }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Failed to start simulation");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex = buffer.indexOf("\n");
          while (newlineIndex >= 0) {
            const chunk = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            if (chunk) {
              try {
                const event: SimEvent = JSON.parse(chunk);
                if (event.type === "line") {
                  setLines((prev) => [...prev, event]);
                }
                if (event.type === "summary") {
                  setSummary(event);
                }
                if (event.type === "error") {
                  setSummary(event);
                }
              } catch (error) {
                console.error("Failed to parse event", error);
              }
            }
            newlineIndex = buffer.indexOf("\n");
          }
        }
      } catch (error) {
        console.error(error);
        setSummary({ type: "error", message: error instanceof Error ? error.message : "Simulation failed" });
      } finally {
        setRunning(false);
      }
    },
    [personas]
  );

  const canRun = Boolean(watch("mission")) && personas.length >= 2;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-panel p-6 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Studio — Run a Scenario</h1>
          <p className="mt-2 max-w-2xl text-sm text-fg/70">
            Assemble your expert personas, brief the mission, and stream a multiplayer debate that ends with a confident decision-ready summary.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSubmit(runSimulation)}
            disabled={!canRun || running}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? "Running…" : "Run Simulation"}
          </button>
          <button
            type="button"
            onClick={resetStudio}
            className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Reset
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form className="space-y-5 rounded-3xl border border-black/10 bg-panel p-6 shadow-soft" onSubmit={handleSubmit(runSimulation)}>
          <fieldset className="space-y-3">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-fg/80">Mission</span>
              <textarea
                rows={4}
                className="w-full rounded-2xl border border-black/10 bg-white/90 p-3 text-sm leading-relaxed text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                {...register("mission", { required: true })}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-fg/80">Constraints (optional)</span>
              <textarea
                rows={3}
                className="w-full rounded-2xl border border-black/10 bg-white/90 p-3 text-sm leading-relaxed text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                {...register("constraints")}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-fg/80">Rounds</span>
              <input
                type="number"
                min={1}
                max={6}
                className="w-24 rounded-2xl border border-black/10 bg-white/90 p-3 text-sm leading-relaxed text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                {...register("rounds", { valueAsNumber: true, min: 1, max: 6 })}
              />
            </label>
          </fieldset>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg">Personas</h2>
              <span className="text-xs text-fg/60">{personas.length} selected</span>
            </div>
            <ul className="space-y-3">
              {personas.map((persona) => (
                <li key={persona.id} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/90 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-base font-semibold text-fg">{persona.name}</div>
                    <div className="text-xs text-fg/60">
                      {persona.role ?? "Advisor"}
                      {persona.styleHint ? ` • ${persona.styleHint}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePersona(persona.id)}
                    className="self-start rounded-lg border border-black/10 px-3 py-1 text-xs font-medium text-fg/70 transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addPersona}
              className="inline-flex items-center justify-center rounded-xl border border-dashed border-black/20 px-4 py-2 text-sm font-semibold text-fg/70 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              + Add persona
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-6">
          <section className="flex h-[26rem] flex-col rounded-3xl border border-black/10 bg-panel p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg">Live debate</h2>
              <span className="text-xs text-fg/60">{lines.length} lines</span>
            </div>
            <div
              ref={transcriptRef}
              className="mt-4 flex-1 space-y-3 overflow-auto rounded-2xl border border-black/10 bg-white/95 p-4 text-sm leading-relaxed text-fg"
              aria-live="polite"
              aria-label="Simulation transcript"
            >
              {lines.length === 0 ? (
                <p className="text-sm text-fg/60">Run the simulation to watch the conversation unfold in real time.</p>
              ) : (
                lines.map((line) => {
                  const [speaker, ...rest] = line.text.split(":");
                  return (
                    <p key={`${line.round}-${line.idx}-${line.personaId}`} className="rounded-xl bg-panel/60 p-3">
                      <span className="font-semibold text-fg">{speaker}:</span> {rest.join(":").trim()}
                      <span className="ml-2 text-xs text-fg/50">(round {line.round})</span>
                    </p>
                  );
                })
              )}
            </div>
          </section>

          {summary && summary.type === "summary" && (
            <section className="space-y-4 rounded-3xl border border-black/10 bg-panel p-6 shadow-soft">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-fg">Summary</h2>
                <div className="flex items-center gap-2 text-sm text-fg/70">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Confidence {summary.confidence}%
                  </span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-fg/80">
                {summary.bullets.map((bullet, index) => (
                  <li key={index} className="rounded-xl bg-white/90 p-3 shadow-inner">
                    {bullet}
                  </li>
                ))}
              </ul>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-fg/70">Next steps</h3>
                <ol className="mt-2 space-y-2 text-sm text-fg/80">
                  {summary.nextSteps.map((step, index) => (
                    <li key={index} className="rounded-xl bg-white/90 p-3 shadow-inner">
                      {index + 1}. {step}
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {summary && summary.type === "error" && (
            <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-900 shadow-soft" role="alert">
              <h2 className="text-base font-semibold">Simulation failed</h2>
              <p className="mt-2">{summary.message}</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
