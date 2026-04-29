import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { difficulty } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    let difficultyPrompt = "Korean adult English learners at a beginner level. Focus on highly diverse but simple topics like daily life, travel, hobbies, food, family, and personal preferences.";
    if (difficulty === 'Intermediate') difficultyPrompt = "Korean adult English learners at an intermediate level. Focus on highly diverse topics like workplace situations, career, relationships, modern culture, technology, or social trends.";
    if (difficulty === 'Advanced') difficultyPrompt = "Korean adult English learners at an advanced level. Focus on highly diverse, complex, and abstract topics like philosophy, global economy, ethics, politics, psychology, or deep societal debates.";
    
    const prompt = `Generate a single, random, highly engaging English writing prompt. 
    The prompt MUST be designed for: ${difficultyPrompt}.
    Vary the prompt type randomly (e.g., "Would you rather...", "Describe a time when...", "Do you agree that...", "Imagine if...", "Write a short story about...").
    Make the topic highly specific, relatable, and thought-provoking so the user has a lot to write about. DO NOT generate generic topics.
    Return ONLY the prompt text without any quotes, numbering, or extra words. Output should be in English.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ topic: text });
  } catch (error: unknown) {
    console.error('Error generating topic:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
