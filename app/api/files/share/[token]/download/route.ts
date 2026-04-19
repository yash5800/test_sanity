import { NextRequest, NextResponse } from 'next/server';

import { downloadShareFileByToken } from '@/sanity/lib/download';

export const runtime = 'nodejs';

export async function GET(_: NextRequest, context: { params: Promise<{ token: string }> }) {
  const token = (await context.params).token;

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  try {
    return await downloadShareFileByToken({ token });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to download shared file';
    const status = message === 'Passcode is required' ? 401 : 404;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const token = (await context.params).token;

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const formData = await request.formData().catch(() => null);
  const passcode = formData?.get('passcode');

  try {
    return await downloadShareFileByToken({
      token,
      passcode: typeof passcode === 'string' ? passcode : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to download shared file';
    const status = message === 'Passcode is required' ? 401 : message === 'Invalid passcode' ? 401 : 404;

    return NextResponse.json({ error: message }, { status });
  }
}
