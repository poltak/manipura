import type { MediationRequest } from "../types";
import { mediateText } from "../services/mediation-service";

export async function handleMediate(input: MediationRequest) {
  const message = input.message?.trim();

  if (!message) {
    return {
      status: 400,
      body: { mediated: "Please share a message to mediate.", tone: "clarify" as const }
    };
  }

  const result = await mediateText(message);
  return {
    status: 200,
    body: result
  };
}
