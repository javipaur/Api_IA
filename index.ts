const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

Bun.serve({
  port: Number.isFinite(PORT) ? PORT : 3000,
  hostname: "0.0.0.0",
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health" && (req.method === "GET" || req.method === "HEAD")) {
      if (req.method === "HEAD") {
        return new Response(null, { status: 200 });
      }

      return new Response("ok", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`API running on http://localhost:${PORT}`);