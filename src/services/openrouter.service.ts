import { OpenRouter } from "@openrouter/sdk";

import {
  DEFAULT_MODEL,
  OPENROUTER_API_KEY,
  OPENROUTER_APP_NAME,
  OPENROUTER_SITE_URL,
} from "../config";
import type { ChatMessage } from "../features/chats/chat.types";

const openrouter = new OpenRouter({
  apiKey: OPENROUTER_API_KEY,
});

export async function createOpenRouterChatStream(input: {
  model?: string;
  messages: ChatMessage[];
}) {
  const model = input.model || DEFAULT_MODEL;

  const stream = await openrouter.chat.send({
    httpReferer: OPENROUTER_SITE_URL,
    appTitle: OPENROUTER_APP_NAME,
    chatRequest: {
      model,
      messages: input.messages,
      stream: true,
    },
  });

  return { model, stream };
}

export async function sendChatToOpenRouter(input: {
  model?: string;
  messages: ChatMessage[];
}) {
  const { model, stream } = await createOpenRouterChatStream(input);

  let response = "";
  let reasoningTokens: number | null = null;

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;

    if (content) {
      response += content;
    }

    const chunkReasoningTokens = chunk.usage?.completionTokensDetails?.reasoningTokens;

    if (chunkReasoningTokens !== undefined && chunkReasoningTokens !== null) {
      reasoningTokens = chunkReasoningTokens;
    }
  }

  return {
    model,
    response,
    reasoningTokens,
  };
}
