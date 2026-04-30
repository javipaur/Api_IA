import { CEREBRAS_API_KEY, CEREBRAS_BASE_URL, CEREBRAS_MODEL } from "../config";
import type { ChatMessage } from "../features/chats/chat.types";
import { createOpenAiCompatChatStream } from "./openai-compat.service";

export async function createCerebrasChatStream(input: { model?: string; messages: ChatMessage[] }) {
  if (!CEREBRAS_API_KEY) {
    throw new Error("Missing CEREBRAS_API_KEY environment variable");
  }

  const model = input.model || CEREBRAS_MODEL;
  const { stream } = await createOpenAiCompatChatStream({
    baseUrl: CEREBRAS_BASE_URL,
    apiKey: CEREBRAS_API_KEY,
    model,
    messages: input.messages,
  });

  return { model, stream };
}

