import type { MediationOutput, MediationTone } from "./types";

const TONES: MediationTone[] = ["neutral", "soften", "clarify"];

const codeFencePattern = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;

export function parseMediationOutput(raw: string): MediationOutput {
  const trimmed = raw.trim();
  const match = trimmed.match(codeFencePattern);
  const payload = match ? match[1].trim() : trimmed;
  const parsed = JSON.parse(payload) as Partial<MediationOutput>;

  if (!parsed || typeof parsed.mediated !== "string") {
    throw new Error("Missing mediated text.");
  }

  const tone = String(parsed.tone ?? "").toLowerCase() as MediationTone;
  if (!TONES.includes(tone)) {
    throw new Error("Invalid mediation tone.");
  }

  return {
    mediated: parsed.mediated.trim(),
    tone
  };
}
