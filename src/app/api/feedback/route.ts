import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { topic, englishText, conversationHistory, style } = await req.json();
    
    const isConversation = style === 'Conversation';
    
    let userContentToEvaluate = '';
    
    if (isConversation && conversationHistory && Array.isArray(conversationHistory)) {
      const bMessages = conversationHistory.filter(msg => msg.role === 'User').map(msg => msg.text);
      if (bMessages.length === 0) {
        return new Response(JSON.stringify({ error: 'No user messages to evaluate' }), { status: 400 });
      }
      userContentToEvaluate = `Here is the full conversation. You played 'AI' and the user played 'User'.\n` + 
                              conversationHistory.map(msg => `${msg.role}: ${msg.text}`).join('\n') + 
                              `\n\nPlease evaluate ONLY the user's ('User') responses.`;
    } else {
      if (!topic || !englishText) {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
      }
      userContentToEvaluate = `User's English Text:\n"${englishText}"`;
    }

    const exampleInstruction = isConversation 
      ? "Provide a high-quality example of how native speakers might casually converse about this topic. The example MUST be formatted as a short dialogue (AI: ... User: ...) of no more than 10 lines."
      : "Provide a high-quality example of how a native speaker might write about this topic. The example MUST be a single paragraph of no more than 10 sentences.";

    const prompt = `You are an expert English tutor. The user has participated in an English writing exercise based on the following topic:
    Topic: "${topic}"
    Style: "${style || 'Essay'}"

    ${userContentToEvaluate}
    
    Your task is to evaluate the user's English.
    ${isConversation ? 'Focus specifically on natural, everyday spoken English, idioms, and casual conversational flow of the user.' : 'Focus on overall quality, grammar, and natural phrasing.'}

    1. Provide a score from 0 to 100 representing the overall quality.
    2. Provide detailed tips to improve their text (grammar corrections, better vocabulary, natural phrasing). Write this feedback in Korean.
    3. ${exampleInstruction}
    
    Return your response EXACTLY in the following format, preserving the tags. Do not use markdown code blocks or json.

---SCORE---
[Number between 0 and 100]

---FEEDBACK---
[Detailed explanation, grammar corrections, and tips for better expressions. Write this feedback in Korean.]

---EXAMPLE---
[${isConversation ? 'A high-quality, native-like dialogue example for the given topic. Max 10 lines.' : 'A high-quality, native-like example of writing for the given topic. MUST be exactly 1 paragraph and 10 sentences or fewer.'}]
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
