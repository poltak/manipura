import { createServer } from "node:http";

import { handleHealth } from "./routes/health";
import { handleMediate } from "./routes/mediate";

const DEFAULT_PORT = 4000;

function sendJson(
  response: import("node:http").ServerResponse,
  status: number,
  body: unknown
) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
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

export function startServer(port = DEFAULT_PORT) {
  const server = createServer(async (request, response) => {
    const method = request.method || "GET";
    const url = request.url || "/";

    if (method === "GET" && url === "/health") {
      const result = handleHealth();
      sendJson(response, result.status, result.body);
      return;
    }

    if (method === "POST" && url === "/v1/mediate") {
      const parsedBody = await parseBody(request);

      if (parsedBody === null || typeof parsedBody !== "object") {
        sendJson(response, 400, {
          mediated: "Invalid JSON request body.",
          tone: "clarify"
        });
        return;
      }

      const result = await handleMediate(parsedBody as { message?: string });
      sendJson(response, result.status, result.body);
      return;
    }

    sendJson(response, 404, {
      error: "Not found"
    });
  });

  server.listen(port);
  return server;
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT || DEFAULT_PORT);
  startServer(port);
}
