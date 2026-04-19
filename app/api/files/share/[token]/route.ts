import { NextRequest, NextResponse } from 'next/server';

import {
  getShareLinkByToken,
  isShareExpired,
  verifySharePasscode,
} from '@/sanity/lib/share-links';

export const runtime = 'nodejs';

export async function GET(_: NextRequest, context: { params: Promise<{ token: string }> }) {
  const token = (await context.params).token;

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const share = await getShareLinkByToken(token);

  if (!share || share.revoked) {
    return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
  }

  if (isShareExpired(share.expiresAt)) {
    return NextResponse.json({ error: 'Share link has expired' }, { status: 410 });
  }

  if (!share.fileId) {
    return NextResponse.json({ error: 'Shared file is no longer available' }, { status: 404 });
  }

  return NextResponse.json({
    requiresPasscode: Boolean(share.passcodeHash),
    expiresAt: share.expiresAt,
    filename: share.filename || 'Shared file',
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const token = (await context.params).token;

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const share = await getShareLinkByToken(token);

  if (!share || share.revoked) {
    return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
  }

  if (isShareExpired(share.expiresAt)) {
    return NextResponse.json({ error: 'Share link has expired' }, { status: 410 });
  }

  if (!share.fileId) {
    return NextResponse.json({ error: 'Shared file is no longer available' }, { status: 404 });
  }

  if (share.passcodeHash) {
    const body = await request.json().catch(() => ({}));
    const passcode = typeof body.passcode === 'string' ? body.passcode.trim() : '';

    if (!passcode) {
      return NextResponse.json({ error: 'Passcode is required' }, { status: 401 });
    }

    if (!share.passcodeSalt || !verifySharePasscode({ passcode, passcodeHash: share.passcodeHash, passcodeSalt: share.passcodeSalt })) {
      return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
    }
  }

  return NextResponse.json({
    filename: share.filename || 'Shared file',
    expiresAt: share.expiresAt,
    ready: true,
  });
}
