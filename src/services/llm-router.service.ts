import { CEREBRAS_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY } from "../config";
import type { ChatMessage } from "../features/chats/chat.types";
import { createCerebrasChatStream } from "./cerebras.service";
import { createGroqChatStream } from "./groq.service";
import { createOpenRouterChatStream } from "./openrouter.service";

export type LlmProviderId = "openrouter" | "groq" | "cerebras";

export type LlmStream = AsyncIterable<{
  choices: Array<{ delta?: { content?: string } }>;
  usage?: { completionTokensDetails?: { reasoningTokens?: number } };
}>;

let rrIndex = 0;

function enabledProviders(): LlmProviderId[] {
  const ids: LlmProviderId[] = [];
  if (OPENROUTER_API_KEY) ids.push("openrouter");
  if (GROQ_API_KEY) ids.push("groq");
  if (CEREBRAS_API_KEY) ids.push("cerebras");
  return ids;
}

function nextProvider(order: LlmProviderId[]) {
  if (order.length === 0) return null;
  const idx = rrIndex % order.length;
  rrIndex = (rrIndex + 1) % Number.MAX_SAFE_INTEGER;
  return order[idx]!;
}

async function createStreamFor(provider: LlmProviderId, input: { model?: string; messages: ChatMessage[] }) {
  if (provider === "openrouter") {
    const { model, stream } = await createOpenRouterChatStream(input);
    return { provider, model, stream: stream as unknown as LlmStream };
  }

  if (provider === "groq") {
    const { model, stream } = await createGroqChatStream(input);
    const normalized: LlmStream = (async function* () {
      for await (const chunk of stream as any) {
        const content = chunk.delta?.content;
        const reasoningTokens = chunk.usage?.completion_tokens_details?.reasoning_tokens;
        yield {
          choices: [{ delta: { content } }],
          usage: reasoningTokens != null ? { completionTokensDetails: { reasoningTokens } } : undefined,
        };
      }
    })();

    return { provider, model, stream: normalized };
  }

  const { model, stream } = await createCerebrasChatStream(input);
  const normalized: LlmStream = (async function* () {
    for await (const chunk of stream as any) {
      const content = chunk.delta?.content;
      const reasoningTokens = chunk.usage?.completion_tokens_details?.reasoning_tokens;
      yield {
        choices: [{ delta: { content } }],
        usage: reasoningTokens != null ? { completionTokensDetails: { reasoningTokens } } : undefined,
      };
    }
  })();

  return { provider, model, stream: normalized };
}

export async function createRoundRobinChatStream(input: { model?: string; messages: ChatMessage[] }) {
  const order = enabledProviders();
  if (order.length === 0) {
    throw new Error(
      "No LLM providers configured. Set at least one of: OPENROUTER_API_KEY, GROQ_API_KEY, CEREBRAS_API_KEY.",
    );
  }

  const first = nextProvider(order);
  if (!first) {
    throw new Error("No LLM providers configured.");
  }

  // Try in round-robin order (first chosen by rr), then fall back to next providers on failure.
  const tried: LlmProviderId[] = [];
  let current: LlmProviderId | null = first;

  while (current) {
    tried.push(current);
    try {
      return await createStreamFor(current, input);
    } catch (err) {
      const remaining = order.filter((p) => !tried.includes(p));
      current = remaining.length ? remaining[0]! : null;
      if (!current) {
        const msg = err instanceof Error ? err.message : "LLM request failed";
        throw new Error(`All providers failed. Last error: ${msg}`);
      }
    }
  }

  throw new Error("All providers failed.");
}

