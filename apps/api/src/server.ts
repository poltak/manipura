import { createServer } from "node:http";

import { resolveRequestId } from "./middleware/request-id";
import { handleGetContext, handlePutContext } from "./routes/context";
import { handleHealth } from "./routes/health";
import { handleMediate } from "./routes/mediate";

const DEFAULT_PORT = 4000;

type ErrorCode = "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_ERROR";

function sendJson(
  response: import("node:http").ServerResponse,
  status: number,
  body: unknown,
  requestId: string
) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("X-Request-Id", requestId);
  response.end(JSON.stringify(body));
}

function sendError(
  response: import("node:http").ServerResponse,
  status: number,
  code: ErrorCode,
  message: string,
  requestId: string
) {
  sendJson(
    response,
    status,
    {
      error: {
        code,
        message,
        requestId
      }
    },
    requestId
  );
}

async function parseBody(request: import("node:http").IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function resolveCoupleId(request: import("node:http").IncomingMessage) {
  const incoming = request.headers["x-couple-id"];
  const raw = Array.isArray(incoming) ? incoming[0] : incoming;
  const coupleId = raw?.trim();
  return coupleId || "dev-couple";
}

export function startServer(port = DEFAULT_PORT) {
  const server = createServer(async (request, response) => {
    const incomingRequestId = request.headers["x-request-id"];
    const requestId = resolveRequestId(
      Array.isArray(incomingRequestId) ? incomingRequestId[0] : incomingRequestId
    );

    try {
      const method = request.method || "GET";
      const url = request.url || "/";

      if (method === "GET" && url === "/health") {
        const result = handleHealth();
        sendJson(response, result.status, result.body, requestId);
        return;
      }

      if (method === "POST" && url === "/v1/mediate") {
        const parsedBody = await parseBody(request);

        if (parsedBody === null || typeof parsedBody !== "object") {
          sendJson(
            response,
            400,
            {
              mediated: "Invalid JSON request body.",
              tone: "clarify"
            },
            requestId
          );
          return;
        }

        const result = await handleMediate(parsedBody as { message?: string });
        sendJson(response, result.status, result.body, requestId);
        return;
      }

      if (method === "GET" && url === "/v1/context") {
        const result = await handleGetContext(resolveCoupleId(request));
        sendJson(response, result.status, result.body, requestId);
        return;
      }

      if (method === "PUT" && url === "/v1/context") {
        const parsedBody = await parseBody(request);

        if (parsedBody === null || typeof parsedBody !== "object") {
          sendError(
            response,
            400,
            "BAD_REQUEST",
            "Invalid request body",
            requestId
          );
          return;
        }

        const result = await handlePutContext(
          resolveCoupleId(request),
          parsedBody as {
            communicationStyle?: unknown;
            preferences?: unknown;
            triggers?: unknown;
          }
        );

        sendJson(response, result.status, result.body, requestId);
        return;
      }

      sendError(response, 404, "NOT_FOUND", "Not found", requestId);
    } catch {
      sendError(
        response,
        500,
        "INTERNAL_ERROR",
        "Unexpected server error",
        requestId
      );
    }
  });

  server.listen(port);
  return server;
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT || DEFAULT_PORT);
  startServer(port);
}
