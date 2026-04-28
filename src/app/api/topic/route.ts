import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Generate a single, engaging daily topic for an English writing practice session. The topic should be something that people can easily write 5 sentences about. It should be a simple question or a short prompt. Example: "What is your favorite childhood memory and why?" or "Describe your perfect weekend."
    Return ONLY the topic string, nothing else.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    return NextResponse.json({ topic: text });
  } catch (error: any) {
    console.error('Error generating topic:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
