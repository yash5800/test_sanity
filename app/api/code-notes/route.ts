import { NextRequest, NextResponse } from 'next/server';

import { createCodeNote, listCodeNotes, wipeCodeNotesByKey } from '@/sanity/lib/code-notes';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')?.trim() || '';

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  try {
    const notes = await listCodeNotes(key);
    return NextResponse.json({ notes });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load notes' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const key = typeof body.key === 'string' ? body.key.trim() : '';
    const title = typeof body.title === 'string' ? body.title : '';
    const content = typeof body.content === 'string' ? body.content : '';

    if (!key) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    const note = await createCodeNote(key, title, content);
    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create note' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')?.trim() || '';

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  try {
    const deletedCount = await wipeCodeNotesByKey(key);
    return NextResponse.json({ deletedCount });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to wipe notes' },
      { status: 500 },
    );
  }
}
