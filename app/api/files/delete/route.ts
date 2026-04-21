import { NextRequest, NextResponse } from 'next/server';

import { deleteSanityFileWithCleanup, verifyFileOwnership } from '@/sanity/lib/file-actions';

export const runtime = 'nodejs';

const MAX_FILE_ID_LENGTH = 200;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fileId = typeof body.fileId === 'string' ? body.fileId.trim() : '';
    const key = typeof body.key === 'string' ? body.key.trim() : '';

    if (!fileId || fileId.length > MAX_FILE_ID_LENGTH) {
      return NextResponse.json({ error: 'Invalid fileId' }, { status: 400 });
    }

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }

    const isOwner = await verifyFileOwnership(fileId, key);
    if (!isOwner) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 403 });
    }

    const result = await deleteSanityFileWithCleanup(fileId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to delete file' },
      { status: 500 },
    );
  }
}