import { NextRequest, NextResponse } from 'next/server';

import { createSecureShareLink, SHARE_DURATION_OPTIONS } from '@/sanity/lib/share-links';
import { verifyFileOwnership } from '@/sanity/lib/file-actions';

export const runtime = 'nodejs';

const MAX_FILE_ID_LENGTH = 200;
const MAX_PASSCODE_LENGTH = 32;
const MIN_PASSCODE_LENGTH = 4;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fileId = typeof body.fileId === 'string' ? body.fileId.trim() : '';
    const key = typeof body.key === 'string' ? body.key.trim() : '';
    const durationHours = Number(body.durationHours);
    const passcode = typeof body.passcode === 'string' ? body.passcode : '';

    if (!fileId || fileId.length > MAX_FILE_ID_LENGTH) {
      return NextResponse.json({ error: 'Invalid fileId' }, { status: 400 });
    }

    if (!key || key.length < 4) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }

    const isOwner = await verifyFileOwnership(fileId, key);
    if (!isOwner) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 403 });
    }

    if (!Number.isFinite(durationHours) || !SHARE_DURATION_OPTIONS.includes(durationHours as (typeof SHARE_DURATION_OPTIONS)[number])) {
      return NextResponse.json({ error: 'Invalid duration option' }, { status: 400 });
    }

    const trimmedPasscode = passcode?.trim() || '';
    if (trimmedPasscode.length > 0 && trimmedPasscode.length < MIN_PASSCODE_LENGTH) {
      return NextResponse.json({ error: 'Passcode must be at least 4 characters' }, { status: 400 });
    }

    if (trimmedPasscode.length > MAX_PASSCODE_LENGTH) {
      return NextResponse.json({ error: 'Passcode too long' }, { status: 400 });
    }

    const { token, expiresAt } = await createSecureShareLink({
      fileId,
      durationHours,
      passcode: trimmedPasscode,
    });

    const origin = request.nextUrl.origin;
    const shareUrl = `${origin}/share/${token}`;

    return NextResponse.json({
      shareUrl,
      expiresAt,
      hasPasscode: Boolean(trimmedPasscode),
    });
  } catch {
    return NextResponse.json({ error: 'Unable to create secure share link' }, { status: 500 });
  }
}
