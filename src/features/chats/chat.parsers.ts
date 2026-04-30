import type { ChatMessage, ChatRequestBody } from "./chat.types";

const VALID_ROLES = new Set(["system", "user", "assistant"]);

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;
  return (
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    typeof message.role === "string" &&
    VALID_ROLES.has(message.role)
  );
}

export async function parseChatRequest(req: Request): Promise<ChatRequestBody> {
  const payload = await req.json();
  const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : undefined;
  const model = typeof body.model === "string" ? body.model.trim() : undefined;
  const stream = typeof body.stream === "boolean" ? body.stream : undefined;
  const messages = Array.isArray(body.messages)
    ? body.messages.filter(isChatMessage)
    : undefined;

  return {
    prompt,
    messages,
    model,
    stream,
  };
}

export function resolveMessages(body: ChatRequestBody): ChatMessage[] | null {
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    return body.messages;
  }

  if (body.prompt) {
    return [{ role: "user", content: body.prompt }];
  }

  return null;
}
