export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openrouter/free";
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "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";
export const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000";
export const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME ?? "Api_IA";
