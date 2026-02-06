import { mediateMessage } from "../../../../packages/core/src/mediator";
import { buildMediationPrompt } from "../../../../packages/core/src/prompts";
import {
  isOpenClawConfigured,
  mediateWithOpenClaw
} from "../../../../packages/llm/src/openclaw";

import type { MediationExecution } from "../types";

export async function mediateText(message: string): Promise<MediationExecution> {
  const prompt = buildMediationPrompt(message);

  if (isOpenClawConfigured()) {
    try {
      const response = await mediateWithOpenClaw(prompt);
      return {
        response,
        runtime: "openclaw",
        fallbackReason: null
      };
    } catch {
      return {
        response: mediateMessage(message),
        runtime: "local",
        fallbackReason: "openclaw_error"
      };
    }
  }

  return {
    response: mediateMessage(message),
    runtime: "local",
    fallbackReason: "not_configured"
  };
}
