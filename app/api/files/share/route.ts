import { NextRequest, NextResponse } from 'next/server';

import { createSecureShareLink, SHARE_DURATION_OPTIONS } from '@/sanity/lib/share-links';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fileId = typeof body.fileId === 'string' ? body.fileId.trim() : '';
    const durationHours = Number(body.durationHours);
    const passcode = typeof body.passcode === 'string' ? body.passcode : '';

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    if (!Number.isFinite(durationHours) || !SHARE_DURATION_OPTIONS.includes(durationHours as (typeof SHARE_DURATION_OPTIONS)[number])) {
      return NextResponse.json({ error: 'Invalid duration option' }, { status: 400 });
    }

    if (passcode && passcode.trim().length > 0 && passcode.trim().length < 4) {
      return NextResponse.json({ error: 'Passcode must be at least 4 characters' }, { status: 400 });
    }

    const { token, expiresAt } = await createSecureShareLink({
      fileId,
      durationHours,
      passcode,
    });

    const origin = request.nextUrl.origin;
    const shareUrl = `${origin}/share/${token}`;

    return NextResponse.json({
      shareUrl,
      expiresAt,
      hasPasscode: Boolean(passcode?.trim()),
    });
  } catch {
    return NextResponse.json({ error: 'Unable to create secure share link' }, { status: 500 });
  }
}
