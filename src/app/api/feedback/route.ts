import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { topic, koreanText, englishText } = await req.json();
    
    if (!topic || !koreanText || !englishText) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    const prompt = `You are an expert English writing tutor and translator. The user has practiced translating their Korean thoughts into English based on the following topic:
    Topic: "${topic}"
    
    User's Korean Original Text:
    "${koreanText}"

    User's English Translation:
    "${englishText}"
    
    Your task is to evaluate the user's English translation.
    1. Check if the translation accurately conveys the meaning of the Korean text.
    2. Correct any grammatical errors.
    3. Improve the phrasing to make it sound more natural and native-like.
    4. Provide a score from 0 to 100 representing the overall quality and accuracy of the translation.
    
    Return your response EXACTLY in the following format, preserving the tags. Do not use markdown code blocks or json.
    
---CORRECTED---
[The fully corrected and improved version of the English text]

---FEEDBACK---
[A detailed explanation of corrections and tips for better expressions. Write this feedback in Korean.]

---SCORE---
[Number between 0 and 100]
    `;

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      prompt,
    });

    return result.toTextStreamResponse();

  } catch (error: unknown) {
    console.error('Error in feedback API:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
}
