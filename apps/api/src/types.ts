export type MediationTone = "neutral" | "soften" | "clarify";

export type MediationResponse = {
  mediated: string;
  tone: MediationTone;
};

export type MediationRequest = {
  message?: string;
  threadId?: string;
  mode?: "mediate";
};
