import Anthropic from '@anthropic-ai/sdk';

/**
 * Singleton Anthropic client instance
 * Only used server-side in API routes
 */
let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is not set. ' +
        'Please add it to your .env.local file.'
      );
    }

    anthropicClient = new Anthropic({
      apiKey,
    });
  }

  return anthropicClient;
}

/**
 * Model to use for chat completions
 * Using Sonnet for balance of capability and cost
 */
export const CHAT_MODEL = 'claude-sonnet-4-20250514';

/**
 * Maximum tokens for response
 */
export const MAX_TOKENS = 1024;
