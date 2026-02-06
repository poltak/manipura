export type MediationTone = "neutral" | "soften" | "clarify";

export type MediationResponse = {
  mediated: string;
  tone: MediationTone;
};

export type MediationRequest = {
  message?: unknown;
  threadId?: string;
  mode?: "mediate";
};

export type MediationRuntime = "openclaw" | "local";
export type MediationFallbackReason = "openclaw_error" | "not_configured";

export type MediationExecution = {
  response: MediationResponse;
  runtime: MediationRuntime;
  fallbackReason: MediationFallbackReason | null;
};

export type MediationEvent = {
  id: string;
  threadId: string | null;
  inputText: string;
  outputText: string;
  tone: MediationTone;
  runtime: MediationRuntime;
  fallbackReason: MediationFallbackReason | null;
  createdAt: string;
};
