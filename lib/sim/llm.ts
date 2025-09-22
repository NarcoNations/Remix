export interface LLMProvider {
  generateLine(args: {
    personaName: string;
    systemPrompt?: string;
    mission: string;
    constraints?: string;
    transcript: string;
  }): Promise<string>;
  summarize(args: { mission: string; transcript: string }): Promise<{
    bullets: string[];
    confidence: number;
    nextSteps: string[];
  }>;
}

/** Safe deterministic mock */
type GenerateArgs = Parameters<LLMProvider["generateLine"]>[0];
type SummarizeArgs = Parameters<LLMProvider["summarize"]>[0];

export class MockLLM implements LLMProvider {
  async generateLine({ personaName, mission, transcript }: GenerateArgs) {
    const n = (transcript.match(/\n/g) || []).length;
    const stub = [
      `Given "${mission.slice(0, 80)}", my take is feasible if time-boxed.`,
      "We need crisp KPIs; uncertainty is fine, ambiguity isn't.",
      "Ship a 48h pilot, contain scope, measure conversion + variance.",
      "Main risk: creep. Guardrail: exit rule if metrics miss.",
      "Bias watch: recency. Compare against baseline before scaling.",
    ];
    return `${personaName}: ${stub[n % stub.length]}`;
  }

  async summarize({ mission }: SummarizeArgs) {
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

const parseSummaryText = (text: string) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const bullets: string[] = [];
  const nextSteps: string[] = [];
  let confidence = 75;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith("confidence")) {
      const match = line.match(/([0-9]{1,3})/);
      if (match) confidence = Math.min(100, Math.max(0, Number(match[1])));
      continue;
    }
    if (lower.startsWith("next")) {
      const items = line.split(/[-•\d\)]+/).map((item) => item.trim()).filter(Boolean);
      if (items.length > 1) {
        nextSteps.push(...items.slice(1));
      }
      continue;
    }
    if (/^[-•*\d]/.test(line)) {
      bullets.push(line.replace(/^[-•*\d\.\)\s]+/, ""));
      continue;
    }
    bullets.push(line);
  }

  if (!nextSteps.length) {
    const tail = bullets.slice(-3);
    nextSteps.push(...tail);
  }

  const trimmedNext = nextSteps.slice(0, 3);

  return {
    bullets: bullets.slice(0, 3),
    confidence,
    nextSteps: trimmedNext.length ? trimmedNext : ["Define KPIs", "Run 48h pilot", "Review outcomes"],
  };
};

/** Plug real providers later without changing UI */
export async function loadLLM(): Promise<LLMProvider> {
  if (process.env.LLM_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return new (class implements LLMProvider {
        async generateLine({ personaName, systemPrompt, mission, constraints, transcript }) {
          const messages = [
            { role: "system", content: systemPrompt ?? `You are ${personaName}. Be concise (≤ 26 words).` },
            {
              role: "user",
              content: `Mission: ${mission}\nConstraints: ${constraints ?? "-"}\nTranscript so far:\n${transcript}\n\nReply with ONE short sentence that advances the debate.`,
            },
          ];
          const response = await client.chat.completions.create({ model: "gpt-4o-mini", messages, temperature: 0.4 });
          const text = response.choices[0]?.message?.content?.trim() || "…";
          return `${personaName}: ${text}`;
        }

        async summarize({ mission, transcript }) {
          const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Summarize into 3 bullets + confidence (0..100) + 3 next steps." },
              { role: "user", content: `Mission: ${mission}\nTranscript:\n${transcript}` },
            ],
            temperature: 0.2,
          });
          const text = response.choices[0]?.message?.content ?? "";
          const parsed = parseSummaryText(text);
          return parsed;
        }
      })();
    } catch (error) {
      console.warn("OpenAI provider requested but not available, falling back to MockLLM", error);
    }
  }
  return new MockLLM();
}
