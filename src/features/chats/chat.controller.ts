import { DEFAULT_MODEL, OPENROUTER_API_KEY } from "../../config";
import { jsonResponse } from "../../lib/http";
import { createOpenRouterChatStream } from "../../services/openrouter.service";
import { parseChatRequest, resolveMessages } from "./chat.parsers";

export async function handleChat(req: Request) {
  if (!OPENROUTER_API_KEY) {
    return jsonResponse(
      {
        error: "Missing OPENROUTER_API_KEY environment variable",
      },
      500,
    );
  }

  let body;

  try {
    body = await parseChatRequest(req);
  } catch {
    return jsonResponse(
      {
        error: "Invalid JSON body",
      },
      400,
    );
  }

  const messages = resolveMessages(body);

  if (!messages) {
    return jsonResponse(
      {
        error: "Send either a non-empty 'prompt' or a non-empty 'messages' array",
      },
      400,
    );
  }

  try {
    if (body.stream === false) {
      return jsonResponse(
        {
          error: "This endpoint only supports streaming (SSE). Remove 'stream: false' from the request body.",
        },
        400,
      );
    }

    const encoder = new TextEncoder();
    const { model, stream } = await createOpenRouterChatStream({
      model: body.model || DEFAULT_MODEL,
      messages,
    });

    let reasoningTokens: number | null = null;

    const sseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          sendEvent("meta", { model });

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              sendEvent("delta", { content });
            }

            const chunkReasoningTokens = chunk.usage?.completionTokensDetails?.reasoningTokens;
            if (chunkReasoningTokens !== undefined && chunkReasoningTokens !== null) {
              reasoningTokens = chunkReasoningTokens;
            }
          }

          sendEvent("done", { reasoningTokens });
          controller.close();
        } catch (error) {
          sendEvent("error", {
            message: error instanceof Error ? error.message : "OpenRouter request failed",
          });
          controller.close();
        }
      },
    });

    return new Response(sseStream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "OpenRouter request failed",
      },
      502,
    );
  }
}
