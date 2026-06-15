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
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.9 }
    });
    
    let difficultyPrompt = "Korean adult English learners at a beginner level. Focus on highly diverse but simple topics like daily life, travel, hobbies, food, family, and personal preferences.";
    if (difficulty === 'Intermediate') difficultyPrompt = "Korean adult English learners at an intermediate level. Focus on highly diverse topics like workplace situations, career, relationships, modern culture, technology, or social trends.";
    if (difficulty === 'Advanced') difficultyPrompt = "Korean adult English learners at an advanced level. Focus on highly diverse, complex, and abstract topics like philosophy, global economy, ethics, politics, psychology, or deep societal debates.";
    
    const formats = [
      "Would you rather... (Choose A or B, and explain why)",
      "Describe a time when... (Share a personal experience)",
      "Do you agree or disagree with the statement... (Defend your opinion)",
      "Imagine if... (Describe a hypothetical scenario)",
      "Write a short story about... (Creative writing)",
      "Write a letter to... (A person, your past/future self, an object)",
      "Review or recommend... (A movie, book, food, or place)",
      "Explain how to... (A step-by-step guide or explanation)",
      "What are the pros and cons of... (Analytical writing)",
      "Describe your ideal... (Day, vacation, job, house, etc.)",
      "If you were the leader of... what would you change? (Policy or vision planning)",
      "Create a dialogue between two people about... (Conversational writing)",
      "What advice would you give to... (Mentoring or advising)",
      "Argue why X is better than Y... (Persuasive writing)",
      "Summarize the history or origin of... (Informational writing)",
      "What are your predictions for... in the next 10 years? (Future forecasting)",
      "Describe the biggest challenge in... and how to overcome it (Problem-solving)",
      "If you could invent something to solve... what would it be? (Creative invention)",
      "Write a diary entry for a day when... (First-person reflection)",
      "Compare and contrast the differences between... (Comparative analysis)",
      "What is your favorite memory of... and why? (Nostalgic reflection)",
      "Write a news report about... (Journalistic writing)",
      "Explain the meaning or importance of... to someone who has never heard of it (Explanatory writing)",
      "Create a bucket list of... and explain your top choice (Goal setting)",
      "Write an apology or forgiveness letter regarding... (Emotional expression)",
      "If you could have dinner with any historical figure to discuss... who would it be? (Historical imagination)",
      "Describe a typical day in the life of... (Observational or imaginative writing)",
      "Debunk a common myth or misconception about... (Critical thinking)",
      "Write a motivational speech about... (Inspirational writing)",
      "Plan a budget or itinerary for... (Practical planning)"
    ];
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];
    
    const randomSeed = Math.floor(Math.random() * 100000);
    
    const prompt = `Generate a single, random, highly engaging English writing prompt. 
    The prompt MUST be designed for: ${difficultyPrompt}.
    Format requirement: The prompt MUST be of this specific format/style: "${randomFormat}".
    Make the topic highly specific, relatable, and thought-provoking so the user has a lot to write about. DO NOT generate generic topics.
    Use this random seed to ensure the topic is entirely different from previous ones: ${randomSeed}.
    Return ONLY the prompt text without any quotes, numbering, or extra words. Output should be in English.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ topic: text });
  } catch (error: unknown) {
    console.error('Error generating topic:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
