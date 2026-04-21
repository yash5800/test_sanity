import { NextRequest, NextResponse } from 'next/server';

import { wipeSanityFilesByKeyWithCleanup, verifyKeyOwnership } from '@/sanity/lib/file-actions';

export const runtime = 'nodejs';

const MIN_KEY_LENGTH = 4;
const MAX_KEY_LENGTH = 100;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const key = typeof body.key === 'string' ? body.key.trim() : '';

    if (!key || key.length < MIN_KEY_LENGTH || key.length > MAX_KEY_LENGTH) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
    }

    const hasFiles = await verifyKeyOwnership(key);
    if (!hasFiles) {
      return NextResponse.json({ error: 'No files found for this key' }, { status: 404 });
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