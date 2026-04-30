import { app } from "./src/app";
import { PORT } from "./src/config";

Bun.serve({
  port: Number.isFinite(PORT) ? PORT : 3000,
  hostname: "0.0.0.0",
  fetch: app,
});

console.log(`API running on http://localhost:${PORT}`);