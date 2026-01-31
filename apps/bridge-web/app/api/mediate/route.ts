import { NextResponse } from "next/server";

import { mediateMessage } from "../../../../../packages/core/src/mediator";

type MediationRequest = {
  message?: string;
};

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
