import { GoogleGenerativeAI } from "@google/genai";

export interface PromptToGraphOptions {
  model?: string;
  temperature?: number;
}

/**
 * Convert a natural language prompt into a Vislzr GraphData-like structure.
 * This returns a raw JSON object you can validate with schema.ts:isGraphData.
 */
export async function promptToGraph(prompt: string, opts: PromptToGraphOptions = {}) {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Missing VITE_GOOGLE_API_KEY");

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: opts.model ?? "gemini-2.0-flash-exp" });

  const sys = `You are an assistant that outputs JSON only. Return a graph object with {project, nodes, edges, milestones?}. Do not include explanations.`;
  const user = `Build a project graph for: ${prompt}`;

  const res = await model.generateContent({ contents: [{ role: "user", parts: [{ text: sys + "\n\n" + user }] }], generationConfig: { temperature: opts.temperature ?? 0.2 } });
  const text = res.response.text();
  // Try to parse the first JSON block
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in model response");
  return JSON.parse(match[0]);
}
