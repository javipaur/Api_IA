export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequestBody = {
  prompt?: string;
  messages?: ChatMessage[];
  model?: string;
  stream?: boolean;
};
