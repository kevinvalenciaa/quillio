import { JournalEntry } from '@/types/journal';

export async function getAIResponse(
  apiKey: string,
  entries: JournalEntry[],
  newMessage: string
): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: `You are Quillio, a thoughtful AI thinking partner and guardian angel. You help people understand themselves through journaling and deep reflection. Your responses should be:
- Empathetic and warm, like a trusted friend
- Probing with gentle questions that spark insight
- Brief and conversational (2-3 sentences usually)
- Focused on patterns, connections, and deeper meaning
- Never judgmental, always curious

Remember past conversations and reference them naturally. Help users see what they might be missing about themselves.`,
    },
    ...entries.slice(-10).map(entry => ({
      role: entry.type === 'user' ? 'user' : 'assistant',
      content: entry.content,
    })),
    {
      role: 'user',
      content: newMessage,
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 200,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get AI response');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
