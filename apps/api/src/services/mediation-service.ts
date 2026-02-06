import { mediateMessage } from "../../../../packages/core/src/mediator";
import { buildMediationPrompt } from "../../../../packages/core/src/prompts";
import {
  isOpenClawConfigured,
  mediateWithOpenClaw
} from "../../../../packages/llm/src/openclaw";

import type { MediationResponse } from "../types";

export async function mediateText(message: string): Promise<MediationResponse> {
  const prompt = buildMediationPrompt(message);

  if (isOpenClawConfigured()) {
    try {
      return await mediateWithOpenClaw(prompt);
    } catch {
      return mediateMessage(message);
    }
  }

  return mediateMessage(message);
}
