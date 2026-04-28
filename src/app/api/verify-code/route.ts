import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    // Strip accidental quotes and whitespace that users often copy-paste into Firebase console
    const validCode = process.env.APP_ACCESS_CODE?.replace(/["']/g, "").trim();
    
    if (validCode && code === validCode) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid access code' }, { status: 401 });
    }
  } catch (_error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
