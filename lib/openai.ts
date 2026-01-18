import OpenAI from 'openai';

/**
 * Singleton OpenAI client instance
 * Only used server-side in API routes
 */
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY environment variable is not set. ' +
        'Please add it to your .env.local file.'
      );
    }

    openaiClient = new OpenAI({
      apiKey,
    });
  }

  return openaiClient;
}

/**
 * Model to use for chat completions
 * Using GPT-4o for best capability
 */
export const CHAT_MODEL = 'gpt-4o';

/**
 * Maximum tokens for response
 */
export const MAX_TOKENS = 1024;
