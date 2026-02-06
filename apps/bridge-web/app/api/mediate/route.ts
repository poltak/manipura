import { NextResponse } from "next/server";

import { mediateMessage } from "../../../../../packages/core/src/mediator";

type MediationRequest = {
  message?: string;
};

type MediationResponse = {
  mediated: string;
  tone: "neutral" | "soften" | "clarify";
};

const API_URL = process.env.MANIPURA_API_URL?.trim();

export async function POST(request: Request) {
  const body = (await request.json()) as MediationRequest;
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      { mediated: "Please share a message to mediate.", tone: "clarify" },
      { status: 400 }
    );
  }

  const apiResult = await attemptApi(message);
  if (apiResult) {
    return NextResponse.json(apiResult.body, { status: apiResult.status });
  }

  const fallback = mediateMessage(message);
  return NextResponse.json(fallback);
}

async function attemptApi(message: string) {
  if (!API_URL) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/v1/mediate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        mode: "mediate"
      })
    });

    const payload = (await response.json()) as MediationResponse;
    if (!payload || typeof payload.mediated !== "string") {
      return null;
    }

    return {
      status: response.status,
      body: payload
    };
  } catch {
    return null;
  }
}
