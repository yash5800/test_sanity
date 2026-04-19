import { NextRequest, NextResponse } from 'next/server';

import { deleteSanityFileWithCleanup } from '@/sanity/lib/file-actions';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fileId = typeof body.fileId === 'string' ? body.fileId.trim() : '';

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
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
