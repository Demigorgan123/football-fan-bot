import { openai } from '@/app/openai';
import { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { threadId: string } },
) {
  const { content, assistantId } = await req.json();
  const { threadId } = params;

  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  return new Response(stream.toReadableStream());
}
