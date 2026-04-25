import { NextRequest, NextResponse } from 'next/server';

import { deleteCodeNote, updateCodeNote } from '@/sanity/lib/code-notes';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const id = (await params).id;
    const patch: { title?: string; content?: string } = {};

    if (typeof body.title === 'string') {
      patch.title = body.title;
    }

    if (typeof body.content === 'string') {
      patch.content = body.content;
    }

    const note = await updateCodeNote(id, patch);
    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update note' },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await deleteCodeNote(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to delete note' },
      { status: 500 },
    );
  }
}
