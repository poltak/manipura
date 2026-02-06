export type MediationTone = "neutral" | "soften" | "clarify";

export type MediationOutput = {
  mediated: string;
  tone: MediationTone;
};

export type OpenClawPrompt = {
  system: string;
  user: string;
};
