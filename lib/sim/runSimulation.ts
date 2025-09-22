import type { LLMProvider } from "./llm";
import type { Scenario, SimEvent } from "./types";

export async function runSimulation(
  scenario: Scenario,
  llm: LLMProvider,
  emit: (event: SimEvent) => void,
) {
  let transcript = "";
  const { personas, rounds, mission, constraints } = scenario;

  for (let round = 1; round <= rounds; round += 1) {
    for (let idx = 0; idx < personas.length; idx += 1) {
      const persona = personas[idx];
      const line = await llm.generateLine({
        personaName: persona.name,
        systemPrompt: persona.systemPrompt,
        mission,
        constraints,
        transcript,
      });
      transcript += (transcript ? "\n" : "") + line;
      emit({ type: "line", personaId: persona.id, text: line, round, idx });
    }
  }

  const summary = await llm.summarize({ mission, transcript });
  emit({ type: "summary", bullets: summary.bullets, confidence: summary.confidence, nextSteps: summary.nextSteps });
}
