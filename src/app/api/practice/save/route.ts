import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
  try {
    const { topic, englishText, exampleText, feedback, score } = await req.json();
    
    if (!topic || !englishText) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const practiceData = {
      topic,
      englishText,
      exampleText,
      feedback,
      score: score !== undefined ? Number(score) : null,
      date: new Date().toISOString(),
    };

    const docRef = await db.collection('practices').add(practiceData);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: unknown) {
    console.error('Error saving practice:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
