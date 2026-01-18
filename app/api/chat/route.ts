import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, CHAT_MODEL, MAX_TOKENS } from '@/lib/openai';
import { buildSystemPrompt } from '@/lib/chat/system-prompt';
import { chatTools } from '@/lib/chat/openai-tools';
import { executeToolCall } from '@/lib/chat/tool-executor';
import type { ChatRequest, ChatResponse, ChatMessage } from '@/types/chat';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * Simple in-memory rate limiter
 */
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const limit = rateLimiter.get(sessionId);

  if (!limit || limit.resetAt < now) {
    rateLimiter.set(sessionId, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Convert chat history to OpenAI message format
 */
function formatHistory(history: ChatMessage[]): ChatCompletionMessageParam[] {
  return history
    .filter((msg) => !msg.isLoading)
    .slice(-10)
    .map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
}

/**
 * POST /api/chat
 * Handle chat messages and communicate with OpenAI
 */
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'anonymous';

    if (!checkRateLimit(sessionId)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez patienter une minute.' },
        { status: 429 }
      );
    }

    const body: ChatRequest = await request.json();
    const { message, context, history } = body;

    if (!message || typeof message !== 'string' || message.length > 1000) {
      return NextResponse.json(
        { error: 'Message invalide ou trop long (max 1000 caractères)' },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(context);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...formatHistory(history),
      { role: 'user', content: message },
    ];

    const client = getOpenAIClient();

    let response = await client.chat.completions.create({
      model: CHAT_MODEL,
      max_tokens: MAX_TOKENS,
      messages,
      tools: chatTools,
      tool_choice: 'auto',
    });

    let iterations = 0;
    const maxIterations = 5;
    let createdExpense: ChatResponse['createdExpense'] = undefined;

    while (
      response.choices[0]?.finish_reason === 'tool_calls' &&
      iterations < maxIterations
    ) {
      iterations++;

      const toolCalls = response.choices[0].message.tool_calls;
      if (!toolCalls) break;

      // Add assistant message with tool calls
      messages.push({
        role: 'assistant',
        content: response.choices[0].message.content,
        tool_calls: toolCalls,
      });

      // Execute each tool and add results
      for (const toolCall of toolCalls) {
        if (toolCall.type !== 'function') continue;

        const toolInput = JSON.parse(toolCall.function.arguments);
        const { result, isError } = executeToolCall(
          toolCall.function.name,
          toolInput,
          context
        );

        // Check if this is a successful expense creation
        if (
          toolCall.function.name === 'create_expense' &&
          !isError &&
          typeof result === 'object' &&
          result !== null &&
          'success' in result
        ) {
          const expenseResult = result as {
            success: boolean;
            expense: {
              amount: number;
              description: string;
              categoryId: string;
              categoryName: string;
              date: string;
            };
          };
          createdExpense = expenseResult.expense;
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      // Continue conversation
      response = await client.chat.completions.create({
        model: CHAT_MODEL,
        max_tokens: MAX_TOKENS,
        messages,
        tools: chatTools,
        tool_choice: 'auto',
      });
    }

    const responseText = response.choices[0]?.message?.content || '';

    const chatResponse: ChatResponse = {
      response: responseText,
      createdExpense,
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: "Erreur de configuration API. Contactez l'administrateur." },
          { status: 500 }
        );
      }
      if (error.message.includes('rate')) {
        return NextResponse.json(
          { error: 'Limite de requêtes API atteinte. Réessayez plus tard.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
