export interface LLMProvider {
  generateLine(args: {
    personaName: string;
    systemPrompt?: string;
    mission: string;
    constraints?: string;
    transcript: string;
  }): Promise<string>;
  summarize(args: { mission: string; transcript: string }): Promise<{ bullets: string[]; confidence: number; nextSteps: string[] }>;
}

/** Safe deterministic mock */
export class MockLLM implements LLMProvider {
  async generateLine({ personaName, mission, transcript }: { personaName: string; mission: string; transcript: string }) {
    const linesSoFar = (transcript.match(/\n/g) || []).length;
    const stub = [
      `Given "${mission.slice(0, 80)}", my take is feasible if time-boxed.`,
      "We need crisp KPIs; uncertainty is fine, ambiguity isn't.",
      "Ship a 48h pilot, contain scope, measure conversion + variance.",
      "Main risk: creep. Guardrail: exit rule if metrics miss.",
      "Bias watch: recency. Compare against baseline before scaling.",
    ];
    return `${personaName}: ${stub[linesSoFar % stub.length]}`;
  }

  async summarize({ mission }: { mission: string }) {
    return {
      bullets: [
        `Decision centered on: "${mission.slice(0, 100)}"`,
        "Consensus: run a time-boxed pilot with 3 KPIs.",
        "Risks: scope creep; unclear exit; mitigated by criteria.",
      ],
      confidence: 72,
      nextSteps: ["Define KPIs", "Run 48h pilot", "Review → Go/No-Go"],
    };
  }
}

/** Plug real providers later without changing UI */
export async function loadLLM(): Promise<LLMProvider> {
  if (process.env.LLM_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return new (class implements LLMProvider {
      async generateLine({ personaName, systemPrompt, mission, constraints, transcript }: {
        personaName: string;
        systemPrompt?: string;
        mission: string;
        constraints?: string;
        transcript: string;
      }) {
        const messages = [
          { role: "system" as const, content: systemPrompt ?? `You are ${personaName}. Be concise (≤ 26 words).` },
          {
            role: "user" as const,
            content: `Mission: ${mission}\nConstraints: ${constraints ?? "-"}\nTranscript so far:\n${transcript}\n\nReply with ONE short sentence that advances the debate.`,
          },
        ];
        const response = await client.chat.completions.create({ model: "gpt-4o-mini", messages, temperature: 0.4 });
        const text = response.choices[0]?.message?.content?.trim() || "…";
        return `${personaName}: ${text}`;
      }

      async summarize({ mission, transcript }: { mission: string; transcript: string }) {
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system" as const, content: "Summarize into 3 bullets + confidence (0..100) + 3 next steps." },
            { role: "user" as const, content: `Mission: ${mission}\nTranscript:\n${transcript}` },
          ],
          temperature: 0.2,
        });
        const text = response.choices[0]?.message?.content ?? "";
        const bullets = text.split("\n").filter(Boolean).slice(0, 3);
        return { bullets, confidence: 75, nextSteps: ["Step A", "Step B", "Step C"] };
      }
    })();
  }
  return new MockLLM();
}
