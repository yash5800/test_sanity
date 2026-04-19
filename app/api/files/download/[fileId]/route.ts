import { NextRequest, NextResponse } from 'next/server';

import { downloadFileById } from '@/sanity/lib/download';

export const runtime = 'nodejs';

export async function GET(_: NextRequest, context: { params: Promise<{ fileId: string }> }) {
  const fileId = (await context.params).fileId;

  if (!fileId) {
    return NextResponse.json({ error: 'Invalid file id' }, { status: 400 });
  }

  try {
    return await downloadFileById(fileId);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to download file' },
      { status: 404 },
    );
  }
}
