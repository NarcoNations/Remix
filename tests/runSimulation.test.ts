import { describe, expect, it } from "vitest";
import { MockLLM } from "@/lib/sim/llm";
import { runSimulation } from "@/lib/sim/runSimulation";
import type { Scenario } from "@/lib/sim/types";

describe("runSimulation", () => {
  it("streams persona lines and summary", async () => {
    const scenario: Scenario = {
      mission: "Deliver the pilot within two weeks to hit launch milestones.",
      constraints: "Budget under 5k",
      rounds: 2,
      personas: [
        { id: "a", name: "Strategist" },
        { id: "b", name: "Operator" },
      ],
    };

    const events: unknown[] = [];
    await runSimulation(scenario, new MockLLM(), (event) => events.push(event));

    const lineEvents = events.filter((event): event is { type: "line" } =>
      typeof event === "object" && event !== null && "type" in event && (event as any).type === "line",
    );
    const summaryEvent = events.find((event) => typeof event === "object" && event !== null && (event as any).type === "summary");

    expect(lineEvents).toHaveLength(scenario.personas.length * scenario.rounds);
    expect(summaryEvent && (summaryEvent as any).type).toBe("summary");
  });
});
