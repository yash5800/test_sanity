import { NextRequest, NextResponse } from 'next/server';

import { downloadFileById } from '@/sanity/lib/download';
import { verifyFileOwnership } from '@/sanity/lib/file-actions';

export const runtime = 'nodejs';

const MAX_FILE_ID_LENGTH = 200;

export async function GET(request: NextRequest, context: { params: Promise<{ fileId: string }> }) {
  const fileId = (await context.params).fileId;
  const key = request.nextUrl.searchParams.get('key')?.trim() || '';

  if (!fileId || fileId.length > MAX_FILE_ID_LENGTH) {
    return NextResponse.json({ error: 'Invalid file id' }, { status: 400 });
  }

  if (!key) {
    return NextResponse.json({ error: 'key parameter is required' }, { status: 400 });
  }

  if (key.length < 4) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  try {
    const isOwner = await verifyFileOwnership(fileId, key);
    if (!isOwner) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 403 });
    }

    return await downloadFileById(fileId);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to download file' },
      { status: 404 },
    );
  }
}