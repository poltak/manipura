import { NextResponse } from "next/server";

type MediationRequest = {
  message?: string;
};

const softenPhrases = [
  { match: /always|never/i, replace: "sometimes" },
  { match: /you don't/i, replace: "it feels like" },
  { match: /you should/i, replace: "would you be open to" }
];

function mediateMessage(message: string) {
  let mediated = message.trim();
  let tone: "neutral" | "soften" | "clarify" = "neutral";

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

export async function POST(request: Request) {
  const body = (await request.json()) as MediationRequest;
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      { mediated: "Please share a message to mediate.", tone: "clarify" },
      { status: 400 }
    );
  }

  const result = mediateMessage(message);
  return NextResponse.json(result);
}
