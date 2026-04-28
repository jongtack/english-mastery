import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Practice ID is required' }, { status: 400 });
    }

    await db.collection('practices').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting practice:', error);
    return NextResponse.json({ error: 'Failed to delete practice' }, { status: 500 });
  }
}
