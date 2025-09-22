import { z } from "zod";

export const Persona = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().optional(),
  systemPrompt: z.string().optional(),
  styleHint: z.string().optional(),
});
export type Persona = z.infer<typeof Persona>;

export const Scenario = z.object({
  mission: z.string().min(10),
  constraints: z.string().optional(),
  rounds: z.number().int().min(1).max(6).default(3),
  personas: z.array(Persona).min(2).max(6),
});
export type Scenario = z.infer<typeof Scenario>;

export type SimEventLine = { type: "line"; personaId: string; text: string; round: number; idx: number };
export type SimEventSummary = { type: "summary"; bullets: string[]; confidence: number; nextSteps: string[] };
export type SimEvent = SimEventLine | SimEventSummary;
