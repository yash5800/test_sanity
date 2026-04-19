import { NextRequest, NextResponse } from 'next/server';

import { deleteExpiredShareLinks } from '@/sanity/lib/share-links';

export const runtime = 'nodejs';

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get('authorization');

  return authHeader === `Bearer ${secret}`;
};

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured' },
      { status: 500 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deletedCount = await deleteExpiredShareLinks();

    return NextResponse.json({
      ok: true,
      deletedCount,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cleanup failed' },
      { status: 500 },
    );
  }
}
