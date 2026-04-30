# api_ia

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.13. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Environment variables

Create a `.env` file with:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=Api_IA
PORT=3000
```

## Endpoints

### `GET /health`

Returns `ok`.

### `POST /chat`

Accepts either a `prompt` or a `messages` array, uses `@openrouter/sdk`, and returns the model output.

By default it responds **as a stream (SSE)** with events:

- `meta`: `{ "model": "..." }`
- `delta`: `{ "content": "..." }` (many times)
- `done`: `{ "reasoningTokens": number|null }`

Example with `prompt`:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"Hola, dame una respuesta corta\"}"
```

Streaming example (recommended):

```bash
curl -N -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"Hola, dame una respuesta corta\"}"
```

Example with `messages`:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"openrouter/free\",\"messages\":[{\"role\":\"user\",\"content\":\"Hola\"}]}"
```

Expected response:

```json
{
  "model": "openrouter/free",
  "response": "Hola, ...",
  "reasoningTokens": 0
}
```
