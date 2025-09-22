"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

type Persona = {
  id: string;
  name: string;
  role?: string;
  systemPrompt?: string;
  styleHint?: string;
};

type SimEvent =
  | { type: "line"; personaId: string; text: string; round: number; idx: number }
  | { type: "summary"; bullets: string[]; confidence: number; nextSteps: string[] }
  | { type: "error"; message: string };

type Summary = { bullets: string[]; confidence: number; nextSteps: string[] };

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
  const [lines, setLines] = useState<{ text: string; personaId: string; round: number }[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transcriptRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    transcriptRef.current.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [lines]);

  const missionValue = watch("mission");
  const canRun = useMemo(() => missionValue?.trim().length >= 10 && personas.length >= 2, [missionValue, personas.length]);

  const handleRun = handleSubmit(async (form) => {
    setRunning(true);
    setError(null);
    setLines([]);
    setSummary(null);

    try {
      const response = await fetch("/api/sim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rounds: Number(form.rounds), personas }),
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
                setLines((prev) => [...prev, { text: event.text, personaId: event.personaId, round: event.round }]);
              } else if (event.type === "summary") {
                setSummary({ bullets: event.bullets, confidence: event.confidence, nextSteps: event.nextSteps });
              } else if (event.type === "error") {
                setError(event.message);
              }
            } catch (err) {
              console.error("Failed to parse event", err);
            }
          }
          newlineIndex = buffer.indexOf("\n");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
    } finally {
      setRunning(false);
    }
  });

  const addPersona = () => {
    const count = personas.length + 1;
    setPersonas((prev) => [
      ...prev,
      {
        id: `persona-${count}`,
        name: `Advisor ${count}`,
        role: "Advisor",
        styleHint: "succinct",
      },
    ]);
  };

  const removePersona = (id: string) => {
    setPersonas((prev) => prev.filter((persona) => persona.id !== id));
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-panel p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-fg/60">Studio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Run a scenario simulation</h1>
          <p className="mt-3 max-w-2xl text-sm text-fg/70">
            Define the mission, let curated personas debate in real time, and capture the decision-ready brief with confidence scoring.
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={!canRun || running}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-bg"
          type="button"
        >
          {running ? "Running…" : "Run simulation"}
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form className="flex flex-col gap-5 rounded-2xl border border-black/10 bg-panel p-6 shadow-soft" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="mission">
              Mission
              <textarea
                id="mission"
                rows={4}
                className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-fg shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-panel"
                {...register("mission")}
              />
            </label>
          </div>
          <div>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="constraints">
              Constraints (optional)
              <textarea
                id="constraints"
                rows={3}
                className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-fg shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-panel"
                {...register("constraints")}
              />
            </label>
          </div>
          <div className="flex flex-col gap-2 text-sm font-medium sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="rounds">Rounds</label>
            <input
              id="rounds"
              type="number"
              min={1}
              max={6}
              className="h-11 w-24 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-panel"
              {...register("rounds", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Personas</h2>
              <span className="text-xs text-fg/60">{personas.length} selected</span>
            </div>
            <ul className="space-y-3">
              {personas.map((persona) => (
                <li
                  key={persona.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm shadow-inner sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold">{persona.name}</p>
                    <p className="text-xs text-fg/60">
                      {persona.role ?? "—"}
                      {persona.styleHint ? ` • ${persona.styleHint}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePersona(persona.id)}
                    className="self-start rounded-lg border border-transparent px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-panel"
                    aria-label={`Remove ${persona.name}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addPersona}
              className="w-full rounded-xl border border-dashed border-primary/40 px-4 py-2 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-panel"
            >
              + Add persona
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-black/10 bg-panel p-6 shadow-soft">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold">Live debate</h2>
              <div className="text-xs text-fg/60" aria-live="polite">
                {lines.length ? `${lines.length} lines captured` : "Waiting for output"}
              </div>
            </div>
            <div
              ref={transcriptRef}
              className="mt-4 h-80 overflow-y-auto rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm leading-6 shadow-inner"
              aria-live="polite"
              role="log"
            >
              {lines.length ? (
                <ul className="space-y-3">
                  {lines.map((line, index) => {
                    const [speaker, ...rest] = line.text.split(":");
                    const content = rest.join(":").trim();
                    return (
                      <li key={`${line.personaId}-${index}`} className="rounded-lg bg-panel/60 px-3 py-2">
                        <div className="text-xs uppercase tracking-wide text-fg/60">Round {line.round}</div>
                        <p className="text-sm">
                          <span className="font-semibold">{speaker}:</span> {content}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-fg/60">Run the simulation to see the transcript stream here in real time.</p>
              )}
            </div>
          </div>

          {summary && (
            <section className="rounded-2xl border border-black/10 bg-panel p-6 shadow-soft" aria-live="polite">
              <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold">Summary</h2>
                <span className="text-xs text-fg/60">Confidence: {summary.confidence}%</span>
              </header>
              <ul className="mt-4 space-y-2 text-sm">
                {summary.bullets.map((bullet, index) => (
                  <li key={index} className="rounded-lg bg-white/70 px-3 py-2 shadow-inner">
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-fg/60">Next steps</h3>
                <ol className="mt-2 space-y-2 text-sm">
                  {summary.nextSteps.map((step, index) => (
                    <li key={index} className="rounded-lg bg-white/70 px-3 py-2 shadow-inner">
                      {index + 1}. {step}
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-soft" role="alert">
              {error}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
