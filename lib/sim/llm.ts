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

const MOCK_LINES = [
  (mission: string) => `Given "${mission.slice(0, 80)}", my take is feasible if time-boxed.`,
  () => "We need crisp KPIs; uncertainty is fine, ambiguity isn't.",
  () => "Ship a 48h pilot, contain scope, measure conversion + variance.",
  () => "Main risk: creep. Guardrail: exit rule if metrics miss.",
  () => "Bias watch: recency. Compare against baseline before scaling.",
];

export class MockLLM implements LLMProvider {
  async generateLine({ personaName, mission, transcript }: Parameters<LLMProvider["generateLine"]>[0]) {
    const newlineCount = (transcript.match(/\n/g) || []).length;
    const generator = MOCK_LINES[newlineCount % MOCK_LINES.length];
    const statement = generator(mission);
    return `${personaName}: ${statement}`;
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

export async function loadLLM(): Promise<LLMProvider> {
  if (process.env.LLM_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    try {
      const moduleName = "openai";
      const { default: OpenAI } = await import(/* webpackIgnore: true */ moduleName);
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return new (class implements LLMProvider {
        async generateLine({ personaName, systemPrompt, mission, constraints, transcript }: Parameters<LLMProvider["generateLine"]>[0]) {
          const messages = [
            {
              role: "system" as const,
              content: systemPrompt ?? `You are ${personaName}. Reply in ≤ 26 words and advance the debate.`,
            },
            {
              role: "user" as const,
              content: `Mission: ${mission}\nConstraints: ${constraints ?? "-"}\nTranscript so far:\n${transcript}\n\nReply with one short sentence that progresses the conversation.`,
            },
          ];
          const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.4,
          });
          const text = response.choices[0]?.message?.content?.trim() ?? "…";
          return `${personaName}: ${text}`;
        }

        async summarize({ mission, transcript }: Parameters<LLMProvider["summarize"]>[0]) {
          const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.2,
            messages: [
              { role: "system" as const, content: "Summarize into 3 bullets + confidence (0-100) + 3 next steps." },
              {
                role: "user" as const,
                content: `Mission: ${mission}\nTranscript:\n${transcript}`,
              },
            ],
          });
          const text = response.choices[0]?.message?.content ?? "";
          const segments = text
            .split(/\n+/)
            .map((part: string) => part.replace(/^[-*\d\.\s]+/, "").trim())
            .filter(Boolean);
          const bullets = segments.slice(0, 3);
          const nextSteps = segments.slice(3, 6).length ? segments.slice(3, 6) : ["Step A", "Step B", "Step C"];
          return {
            bullets: bullets.length ? bullets : ["Debate summary unavailable."],
            confidence: 75,
            nextSteps,
          };
        }
      })();
    } catch (error) {
      console.error("Failed to load OpenAI provider, falling back to mock", error);
    }
  }

  return new MockLLM();
}
