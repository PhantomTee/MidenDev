import { SYSTEM_PROMPT } from '@/lib/system-prompt';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }))
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.7-sonnet', // Default model, can be overridden or changed
        messages: formattedMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

            for (const line of lines) {
              if (line.trim() === '') continue;
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                  continue;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  console.error('Error parsing streaming response:', e, data);
                }
              }
            }
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error during stream reading:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: error.message || 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
