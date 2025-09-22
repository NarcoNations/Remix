"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

const DEFAULT_PERSONAS = [
  { id: "strategy", name: "Strategic Advisor", role: "Strategy", styleHint: "succinct" },
  { id: "ops", name: "Ops Coordinator", role: "Operations", styleHint: "pragmatic" },
];

type Persona = (typeof DEFAULT_PERSONAS)[number] & {
  systemPrompt?: string;
};

type ScenarioForm = {
  mission: string;
  constraints?: string;
  rounds: number;
};

type LineEvent = { type: "line"; personaId: string; text: string; round: number; idx: number };
type SummaryEvent = { type: "summary"; bullets: string[]; confidence: number; nextSteps: string[] };
type ErrorEvent = { type: "error"; message: string };
type SimEvent = LineEvent | SummaryEvent | ErrorEvent;

type Summary = {
  bullets: string[];
  confidence: number;
  nextSteps: string[];
};

export default function StudioPage() {
  const { register, handleSubmit, watch, resetField } = useForm<ScenarioForm>({
    defaultValues: {
      mission: "Launch GTM pilot in 2 weeks.",
      constraints: "Budget < £5k; WCAG AA.",
      rounds: 3,
    },
  });
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<LineEvent[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transcriptRef.current) return;
    transcriptRef.current.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const canRun = Boolean(watch("mission")) && personas.length >= 2 && !running;
  const canAddPersona = personas.length < 6;

  async function onRun(formValues: ScenarioForm) {
    setLines([]);
    setSummary(null);
    setError(null);
    setRunning(true);

    try {
      const response = await fetch("/api/sim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission: formValues.mission,
          constraints: formValues.constraints,
          rounds: Number(formValues.rounds),
          personas,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Unable to start simulation. Try again.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const chunk = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          if (!chunk) continue;
          try {
            const event = JSON.parse(chunk) as SimEvent;
            if (event.type === "line") {
              setLines((prev) => [...prev, event]);
            } else if (event.type === "summary") {
              setSummary({ bullets: event.bullets, confidence: event.confidence, nextSteps: event.nextSteps });
            } else if (event.type === "error") {
              setError(event.message);
            }
          } catch (parseError) {
            console.error("Failed to parse chunk", parseError);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setRunning(false);
    }
  }

  function removePersona(id: string) {
    setPersonas((prev) => prev.filter((persona) => persona.id !== id));
  }

  function addPersona() {
    if (!canAddPersona) return;
    const count = personas.length + 1;
    setPersonas((prev) => [
      ...prev,
      {
        id: typeof crypto !== "undefined" ? crypto.randomUUID() : `persona-${count}`,
        name: `Advisor ${count}`,
        role: "Advisor",
        styleHint: "succinct",
      },
    ]);
  }

  const missionLength = watch("mission")?.length ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-panel p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Studio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Run a scenario</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Configure your personas, briefing, and guardrails. Simulate.ai will orchestrate a multi-round debate and stream the transcript in real time.
          </p>
        </div>
        <button
          type="button"
          disabled={!canRun}
          onClick={handleSubmit(onRun)}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? "Running…" : "Run simulation"}
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <form className="flex flex-col gap-5 rounded-2xl border border-black/10 bg-panel p-6 shadow-soft" onSubmit={handleSubmit(onRun)}>
          <div className="space-y-1">
            <label htmlFor="mission" className="text-sm font-medium text-fg">
              Mission
            </label>
            <textarea
              id="mission"
              rows={4}
              maxLength={800}
              {...register("mission")}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed shadow-inner"
              aria-describedby="mission-limit"
            />
            <div id="mission-limit" className="text-xs text-slate-500">
              {missionLength} / 800 characters
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="constraints" className="text-sm font-medium text-fg">
              Constraints (optional)
            </label>
            <textarea
              id="constraints"
              rows={3}
              maxLength={600}
              {...register("constraints")}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed shadow-inner"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex flex-col text-sm font-medium text-fg">
              Rounds
              <input
                type="number"
                min={1}
                max={6}
                step={1}
                {...register("rounds", { valueAsNumber: true })}
                className="mt-1 w-24 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-inner"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                resetField("mission", { keepError: true });
                resetField("constraints", { keepError: true });
                resetField("rounds", { defaultValue: 3 });
              }}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-fg shadow-sm transition hover:bg-white/80"
            >
              Reset fields
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-fg">Personas</h2>
              <span className="text-xs text-slate-500">Minimum 2 personas required</span>
            </div>
            <ul className="flex flex-col gap-3" aria-live="polite">
              {personas.map((persona) => (
                <li key={persona.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-fg">{persona.name}</p>
                    <p className="text-xs text-slate-500">
                      {persona.role ?? "—"}
                      {persona.styleHint ? ` • ${persona.styleHint}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePersona(persona.id)}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addPersona}
              disabled={!canAddPersona}
              className="inline-flex items-center justify-center rounded-lg border border-dashed border-primary/40 bg-white px-3 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add persona
            </button>
          </div>

          <button
            type="submit"
            className="mt-auto inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canRun}
          >
            {running ? "Running…" : "Run simulation"}
          </button>
        </form>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-black/10 bg-panel p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-fg">Live debate transcript</h2>
              <span className="text-xs text-slate-500">{lines.length} lines streamed</span>
            </div>
            <div
              ref={transcriptRef}
              className="mt-3 h-80 overflow-auto rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 shadow-inner"
              aria-live="polite"
            >
              {lines.length === 0 ? (
                <p className="text-sm text-slate-500">Run the simulation to stream the conversation in real time.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {lines.map((line) => {
                    const [speaker, ...rest] = line.text.split(":");
                    return (
                      <li key={`${line.round}-${line.idx}-${line.personaId}`} className="rounded-lg bg-panel/60 px-3 py-2">
                        <p className="text-sm font-semibold text-fg">{speaker ?? "Persona"}</p>
                        <p className="text-sm text-slate-600">{rest.join(":").trim()}</p>
                        <span className="text-xs text-slate-400">Round {line.round}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {summary && (
            <section className="rounded-2xl border border-black/10 bg-panel p-6 shadow-soft" aria-live="polite">
              <h2 className="text-base font-semibold text-fg">Simulation summary</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                {summary.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-fg">
                Confidence: <span className="font-semibold">{summary.confidence}%</span>
              </p>
              <h3 className="mt-4 text-sm font-semibold text-fg">Next steps</h3>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-600">
                {summary.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
