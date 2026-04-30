import { GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL } from "../config";
import type { ChatMessage } from "../features/chats/chat.types";
import { createOpenAiCompatChatStream } from "./openai-compat.service";

export async function createGroqChatStream(input: { model?: string; messages: ChatMessage[] }) {
  if (!GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY environment variable");
  }

  const model = input.model || GROQ_MODEL;
  const { stream } = await createOpenAiCompatChatStream({
    baseUrl: GROQ_BASE_URL,
    apiKey: GROQ_API_KEY,
    model,
    messages: input.messages,
  });

  return { model, stream };
}

