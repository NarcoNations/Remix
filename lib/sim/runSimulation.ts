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
    for (let index = 0; index < personas.length; index += 1) {
      const persona = personas[index];
      const line = await llm.generateLine({
        personaName: persona.name,
        systemPrompt: persona.systemPrompt,
        mission,
        constraints,
        transcript,
      });
      transcript += (transcript ? "\n" : "") + line;
      emit({ type: "line", personaId: persona.id, text: line, round, idx: index });
    }
  }

  const summary = await llm.summarize({ mission, transcript });
  emit({ type: "summary", bullets: summary.bullets, confidence: summary.confidence, nextSteps: summary.nextSteps });
}
