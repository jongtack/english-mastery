import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(_req: Request) {
  try {
    const practicesRef = db.collection('practices');
    const snapshot = await practicesRef.orderBy('date', 'desc').get();
    
    const practices: Record<string, unknown>[] = [];
    snapshot.forEach(doc => {
      practices.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({ practices });
  } catch (error: unknown) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
