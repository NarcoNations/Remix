import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

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
export class MockLLM implements LLMProvider {
  async generateLine({ personaName, mission, transcript }: Parameters<LLMProvider["generateLine"]>[0]) {
    const lineCount = (transcript.match(/\n/g) || []).length;
    const stub = [
      `Given "${mission.slice(0, 80)}", my take is feasible if time-boxed.`,
      "We need crisp KPIs; uncertainty is fine, ambiguity isn't.",
      "Ship a 48h pilot, contain scope, measure conversion + variance.",
      "Main risk: creep. Guardrail: exit rule if metrics miss.",
      "Bias watch: recency. Compare against baseline before scaling.",
    ];
    return `${personaName}: ${stub[lineCount % stub.length]}`;
  }

  async summarize({ mission }: Parameters<LLMProvider["summarize"]>[0]) {
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

    type ChatCompletion = {
      choices?: Array<{ message?: { content?: string | null } | null } | null>;
    };

    return new (class implements LLMProvider {
      async generateLine({ personaName, systemPrompt, mission, constraints, transcript }: Parameters<LLMProvider["generateLine"]>[0]) {
        const messages: ChatCompletionMessageParam[] = [
          {
            role: "system",
            content: systemPrompt ?? `You are ${personaName}. Be concise (≤ 26 words).`,
          },
          {
            role: "user",
            content: `Mission: ${mission}\nConstraints: ${constraints ?? "-"}\nTranscript so far:\n${transcript}\n\nReply with ONE short sentence that advances the debate.`,
          },
        ];
        const response = (await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.4,
          max_tokens: 60,
        })) as ChatCompletion;
        const text = response.choices?.[0]?.message?.content?.trim() || "…";
        return `${personaName}: ${text}`;
      }

      async summarize({ mission, transcript }: Parameters<LLMProvider["summarize"]>[0]) {
        const messages: ChatCompletionMessageParam[] = [
          { role: "system", content: "Summarize into 3 bullets + confidence (0..100) + 3 next steps." },
          { role: "user", content: `Mission: ${mission}\nTranscript:\n${transcript}` },
        ];
        const response = (await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.2,
          max_tokens: 200,
        })) as ChatCompletion;
        const text = response.choices?.[0]?.message?.content ?? "";
        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        const bullets = lines.filter((line) => line.startsWith("-") || line.match(/^\d+/)).slice(0, 3);
        const confidenceMatch = text.match(/confidence[^0-9]*([0-9]{1,3})/i);
        const nextSteps = lines.slice(bullets.length, bullets.length + 3) || ["Step A", "Step B", "Step C"];
        return {
          bullets: bullets.length ? bullets : lines.slice(0, 3),
          confidence: confidenceMatch ? Math.min(100, Number(confidenceMatch[1])) : 75,
          nextSteps: nextSteps.length ? nextSteps : ["Step A", "Step B", "Step C"],
        };
      }
    })();
  }

  return new MockLLM();
}
