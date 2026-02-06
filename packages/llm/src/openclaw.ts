import type { MediationOutput, OpenClawPrompt } from "./types";
import { parseMediationOutput } from "./parse";

type OpenClawConfig = {
  baseUrl: string;
  agentId: string;
  token?: string;
};

type OpenClawChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const CHAT_COMPLETIONS_PATH = "/v1/chat/completions";

export function getOpenClawConfig(): OpenClawConfig | null {
  const baseUrl = process.env.OPENCLAW_GATEWAY_URL?.trim();
  if (!baseUrl) return null;

  const agentId = process.env.OPENCLAW_AGENT_ID?.trim() || "main";
  const token = process.env.OPENCLAW_GATEWAY_TOKEN?.trim();

  return {
    baseUrl,
    agentId,
    token: token || undefined
  };
}

export function isOpenClawConfigured(): boolean {
  return Boolean(getOpenClawConfig());
}

export async function mediateWithOpenClaw(
  prompt: OpenClawPrompt,
  options: { signal?: AbortSignal } = {}
): Promise<MediationOutput> {
  const config = getOpenClawConfig();
  if (!config) {
    throw new Error("OpenClaw is not configured.");
  }

  const response = await fetch(`${config.baseUrl}${CHAT_COMPLETIONS_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {})
    },
    body: JSON.stringify({
      model: `openclaw:${config.agentId}`,
      temperature: 0.2,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user }
      ]
    }),
    signal: options.signal
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `OpenClaw request failed (${response.status}). ${errorText}`.trim()
    );
  }

  const payload = (await response.json()) as OpenClawChatCompletion;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenClaw response missing content.");
  }

  return parseMediationOutput(content);
}
