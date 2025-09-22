import type { NextRequest } from "next/server";
import { Scenario } from "@/lib/sim/types";
import { loadLLM } from "@/lib/sim/llm";
import { runSimulation } from "@/lib/sim/runSimulation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Scenario.safeParse(json);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }

  const scenario = parsed.data;
  const llm = await loadLLM();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      try {
        await runSimulation(scenario, llm, send);
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
