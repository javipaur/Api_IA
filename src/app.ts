import { handleChat } from "./features/chats/chat.controller";
import { textResponse } from "./lib/http";

export async function app(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname.toLowerCase();

  if (pathname === "/" && (req.method === "GET" || req.method === "HEAD")) {
    const file = Bun.file("public/index.html");

    if (req.method === "HEAD") {
      return new Response(null, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    return new Response(file, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  if (pathname === "/health" && (req.method === "GET" || req.method === "HEAD")) {
    if (req.method === "HEAD") {
      return new Response(null, { status: 200 });
    }

    return textResponse("ok");
  }

  if ((pathname === "/chat" || pathname === "/chats") && req.method === "POST") {
    return handleChat(req);
  }

  return textResponse("Not found", 404);
}
