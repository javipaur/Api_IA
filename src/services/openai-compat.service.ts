import type { ChatMessage } from "../features/chats/chat.types";

export type OpenAiCompatStreamChunk = {
  delta?: { content?: string };
  usage?: {
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
};

function parseSseLines(buffer: string) {
  const events: string[] = [];
  let rest = buffer;

  for (;;) {
    const idx = rest.indexOf("\n\n");
    if (idx === -1) break;
    events.push(rest.slice(0, idx));
    rest = rest.slice(idx + 2);
  }

  return { events, rest };
}

function parseOpenAiCompatDataLine(line: string): unknown | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const data = trimmed.slice(5).trim();
  if (!data) return null;
  if (data === "[DONE]") return { done: true };
  try {
    return JSON.parse(data);
  } catch {
    return { raw: data };
  }
}

export async function createOpenAiCompatChatStream(input: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
}) {
  const url = input.baseUrl.replace(/\/+$/, "") + "/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: input.model,
      messages: input.messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upstream error (${res.status}): ${text || res.statusText}`);
  }

  if (!res.body) {
    throw new Error("Upstream response has no body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  async function* chunks(): AsyncGenerator<OpenAiCompatStreamChunk> {
    let buffer = "";

    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseLines(buffer);
      buffer = parsed.rest;

      for (const ev of parsed.events) {
        for (const line of ev.split("\n")) {
          const data = parseOpenAiCompatDataLine(line);
          if (!data) continue;

          if (typeof data === "object" && data && "done" in (data as any)) {
            return;
          }

          const obj = data as any;
          const content = obj?.choices?.[0]?.delta?.content;
          const reasoningTokens = obj?.usage?.completion_tokens_details?.reasoning_tokens;

          const chunk: OpenAiCompatStreamChunk = {};
          if (typeof content === "string") chunk.delta = { content };
          if (typeof reasoningTokens === "number") {
            chunk.usage = { completion_tokens_details: { reasoning_tokens: reasoningTokens } };
          }

          if (chunk.delta || chunk.usage) {
            yield chunk;
          }
        }
      }
    }
  }

  return { stream: chunks() };
}

