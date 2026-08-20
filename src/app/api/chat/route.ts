import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { topic, history, level } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing.' }, { status: 500 });
    }

    if (!topic || !history || !Array.isArray(history)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.8 }
    });

    const levelContext = level === 'Beginner' 
      ? 'Use simple, everyday English vocabulary and short sentences appropriate for a beginner learner.' 
      : 'Use natural, slightly more complex phrasing and idiomatic expressions appropriate for an intermediate learner.';

    const formattedHistory = history.map((msg: any) => `${msg.role}: ${msg.text}`).join('\n');

    const prompt = `You are playing the role of "AI" in a casual conversation with a "User".
The topic of the conversation is: "${topic}"

${levelContext}

Here is the conversation history so far:
${formattedHistory}

Write the next reply for "AI" to continue the conversation naturally. 
- Keep your response brief, usually 1 to 3 sentences.
- Do not write "AI:" at the beginning of your response. Just provide the text that AI says.
- Do not write the User's response.
- Ask a follow-up question if appropriate to keep the conversation going.`;

    const result = await model.generateContent(prompt);
    let reply = result.response.text().trim();
    
    // Remove "AI:" prefix if the model accidentally included it
    if (reply.startsWith('AI:')) {
      reply = reply.substring(3).trim();
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error('Error generating chat reply:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
