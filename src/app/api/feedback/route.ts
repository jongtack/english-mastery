import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
  }

  try {
    const { topic, koreanText, englishText } = await req.json();
    
    if (!topic || !koreanText || !englishText) {
      return NextResponse.json({ error: 'Invalid payload. Missing topic or texts.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
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
    
    Return a JSON object exactly in this format (no markdown code blocks, just raw JSON text):
    {
      "correctedText": "The fully corrected and improved version of the entire English text.",
      "feedback": "A detailed but concise explanation of what was corrected, why it was corrected, and any tips for better expressions. Write this feedback in Korean so the user can easily understand.",
      "score": 85
    }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Strip markdown code block wrappers if they exist
    if (text.startsWith('\`\`\`json')) {
      text = text.slice(7, -3);
    } else if (text.startsWith('\`\`\`')) {
      text = text.slice(3, -3);
    }
    
    const feedbackData = JSON.parse(text);
    
    // Save to Firestore
    const practiceData = {
      topic,
      koreanText,
      englishText,
      correctedText: feedbackData.correctedText,
      feedback: feedbackData.feedback,
      score: feedbackData.score,
      date: new Date().toISOString(), // Use ISO string for ease of use
    };

    const docRef = await db.collection('practices').add(practiceData);

    const practice = {
      id: docRef.id,
      ...practiceData,
    };

    return NextResponse.json({ practice });
  } catch (error: any) {
    console.error('Error in feedback API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
