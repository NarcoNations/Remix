"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import type { Persona as PersonaType } from "@/lib/sim/types";

type Persona = PersonaType;

type SimEvent =
  | { type: "line"; personaId: string; text: string; round: number; idx: number }
  | { type: "summary"; bullets: string[]; confidence: number; nextSteps: string[] }
  | { type: "error"; message: string };

type FormValues = {
  mission: string;
  constraints?: string;
  rounds: number;
};

const DEFAULT_PERSONAS: Persona[] = [
  { id: "strategy", name: "Strategic Advisor", role: "Strategy", styleHint: "succinct" },
  { id: "ops", name: "Ops Coordinator", role: "Operations", styleHint: "pragmatic" },
];

export default function StudioPage() {
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      mission: "Launch GTM pilot in 2 weeks.",
      constraints: "Budget < £5k; WCAG AA.",
      rounds: 3,
    },
  });

  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<{ text: string; personaId: string; round: number; idx: number }[]>([]);
  const [summary, setSummary] = useState<{ bullets: string[]; confidence: number; nextSteps: string[] } | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const transcriptRef = useRef<HTMLDivElement>(null);

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
    if (!transcriptRef.current) return;
    transcriptRef.current.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [lines, prefersReducedMotion]);

  const onRun = useMemo(
    () =>
      handleSubmit(async (form) => {
        setError(null);
        setLines([]);
        setSummary(null);
        setRunning(true);
        try {
          const response = await fetch("/api/sim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...form,
              rounds: Number(form.rounds),
              personas,
            }),
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
                    setLines((prev) => [
                      ...prev,
                      { text: event.text, personaId: event.personaId, round: event.round, idx: event.idx },
                    ]);
                  } else if (event.type === "summary") {
                    setSummary({
                      bullets: event.bullets,
                      confidence: event.confidence,
                      nextSteps: event.nextSteps,
                    });
                  } else if (event.type === "error") {
                    setError(event.message);
                  }
                } catch (parseError) {
                  console.error("Failed to parse simulation event", parseError);
                }
              }
              newlineIndex = buffer.indexOf("\n");
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(message);
        } finally {
          setRunning(false);
        }
      }),
    [handleSubmit, personas],
  );

  const canRun = Boolean(watch("mission")?.trim()) && personas.length >= 2;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <header className="flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-widest text-fg/60">Studio</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Run a Scenario</h1>
        </div>
        <button
          type="button"
          disabled={!canRun || running}
          onClick={onRun}
          className="inline-flex min-w-[12rem] items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60"
          aria-disabled={!canRun || running}
          aria-busy={running}
        >
          {running ? "Running…" : "Run Simulation"}
        </button>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
        <form className="space-y-5">
          <fieldset className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-fg/70">Mission</span>
              <textarea
                rows={4}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-panel p-3 text-sm text-fg shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("mission")}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-fg/70">Constraints (optional)</span>
              <textarea
                rows={3}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-panel p-3 text-sm text-fg shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("constraints")}
              />
            </label>
            <label className="block max-w-[8rem]">
              <span className="text-sm font-medium text-fg/70">Rounds</span>
              <input
                type="number"
                min={1}
                max={6}
                className="mt-2 w-full rounded-xl border border-black/10 bg-panel p-2 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("rounds", { valueAsNumber: true })}
              />
            </label>
          </fieldset>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg/90">Personas</h2>
              <span className="text-xs text-fg/60">{personas.length} selected</span>
            </div>
            <ul className="space-y-3">
              {personas.map((persona) => (
                <li
                  key={persona.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-panel p-3 text-sm shadow-soft"
                >
                  <div>
                    <p className="font-medium text-fg/90">{persona.name}</p>
                    <p className="text-xs text-fg/60">
                      {persona.role ?? "—"}
                      {persona.styleHint ? ` • ${persona.styleHint}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-black/10 px-3 py-1 text-xs font-medium text-fg/70 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() =>
                      setPersonas((prev) =>
                        prev.length > 2 ? prev.filter((item) => item.id !== persona.id) : prev,
                      )
                    }
                    disabled={personas.length <= 2}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-dashed border-black/20 px-3 py-2 text-sm font-medium text-fg/70 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() =>
                setPersonas((prev) => {
                  const uuid =
                    typeof crypto !== "undefined" && "randomUUID" in crypto
                      ? crypto.randomUUID()
                      : Math.random().toString(36).slice(2, 8);
                  return [
                    ...prev,
                    {
                      id: `p-${uuid}`,
                      name: `Advisor ${prev.length + 1}`,
                      role: "Advisor",
                      styleHint: "succinct",
                    },
                  ];
                })
              }
              disabled={personas.length >= 6}
            >
              <span aria-hidden="true">＋</span>
              Add persona
            </button>
            <p className="text-xs text-fg/50">Minimum 2 personas, maximum 6.</p>
          </div>
        </form>

        <div className="space-y-5">
          <div className="rounded-3xl border border-black/10 bg-panel p-5 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-fg/90">Live Debate</h2>
              <span className="text-xs text-fg/60">{lines.length} lines</span>
            </div>
            <div
              ref={transcriptRef}
              className="mt-4 h-72 overflow-y-auto rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-fg sm:h-80"
              aria-live="polite"
            >
              {lines.length ? (
                <ul className="space-y-3">
                  {lines.map((line) => {
                    const [speaker, ...rest] = line.text.split(":");
                    return (
                      <li key={`${line.round}-${line.idx}-${line.personaId}`}>
                        <p className="font-semibold text-fg/80">{speaker}:</p>
                        <p className="text-fg/80">{rest.join(":").trim()}</p>
                        <p className="text-xs text-fg/50">Round {line.round}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-fg/50">Run the simulation to see the transcript…</p>
              )}
            </div>
          </div>

          {summary && (
            <section className="rounded-3xl border border-black/10 bg-panel p-5 shadow-soft" aria-live="polite">
              <h2 className="text-lg font-semibold text-fg/90">Summary</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-fg/80">
                {summary.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-fg/80">
                Confidence: <strong>{summary.confidence}%</strong>
              </p>
              <h3 className="mt-4 text-sm font-semibold text-fg/80 uppercase tracking-wider">Next steps</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-6 text-sm text-fg/80">
                {summary.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
