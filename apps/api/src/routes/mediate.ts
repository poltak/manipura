import { defaultRepositories, type ApiRepositories } from "../db/repositories";
import type { MediationRequest } from "../types";
import { mediateText } from "../services/mediation-service";

export async function handleMediate(
  input: MediationRequest,
  repositories: ApiRepositories = defaultRepositories
) {
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (!message) {
    return {
      status: 400,
      body: { mediated: "Please share a message to mediate.", tone: "clarify" as const }
    };
  }

  const execution = await mediateText(message);

  await repositories.mediationEvents.create({
    threadId: typeof input.threadId === "string" ? input.threadId : null,
    inputText: message,
    outputText: execution.response.mediated,
    tone: execution.response.tone,
    runtime: execution.runtime,
    fallbackReason: execution.fallbackReason
  });

  return {
    status: 200,
    body: execution.response
  };
}
