import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(req: Request) {
  try {
    const practicesRef = db.collection('practices');
    const snapshot = await practicesRef.orderBy('date', 'desc').get();
    
    const practices: any[] = [];
    snapshot.forEach(doc => {
      practices.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({ practices });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
