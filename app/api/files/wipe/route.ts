import { NextRequest, NextResponse } from 'next/server';

import { wipeSanityFilesByKeyWithCleanup } from '@/sanity/lib/file-actions';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const key = typeof body.key === 'string' ? body.key.trim() : '';

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }

    const result = await wipeSanityFilesByKeyWithCleanup(key);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to wipe key' },
      { status: 500 },
    );
  }
}
