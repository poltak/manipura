export type MediationTone = "neutral" | "soften" | "clarify";

export type MediationResult = {
  mediated: string;
  tone: MediationTone;
};

const softenPhrases = [
  { match: /always|never/i, replace: "sometimes" },
  { match: /you don't/i, replace: "it feels like" },
  { match: /you should/i, replace: "would you be open to" }
];

export function mediateMessage(message: string): MediationResult {
  let mediated = message.trim();
  let tone: MediationTone = "neutral";

  if (/(angry|upset|frustrated|mad)/i.test(mediated)) {
    tone = "soften";
    mediated = `I feel tense about this. ${mediated}`;
  }

  softenPhrases.forEach(({ match, replace }) => {
    if (match.test(mediated)) {
      tone = "soften";
      mediated = mediated.replace(match, replace);
    }
  });

  if (mediated.length < 20) {
    tone = "clarify";
    mediated = `${mediated} Could you share a bit more context so I can understand?`;
  }

  return { mediated, tone };
}
