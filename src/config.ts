export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openrouter/free";
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
export const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000";
export const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME ?? "Api_IA";

export const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
export const GROQ_MODEL = process.env.GROQ_MODEL ?? "gpt-oss-20b";
export const GROQ_BASE_URL = process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";

export const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY ?? "";
export const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL ?? "yama";
export const CEREBRAS_BASE_URL = process.env.CEREBRAS_BASE_URL ?? "https://api.cerebras.ai/v1";
