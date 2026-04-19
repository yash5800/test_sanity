"use client";

import { useEffect, useState } from 'react';
import { Loader2, LockKeyhole, RefreshCw } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

type Status = 'loading' | 'ready' | 'error' | 'redirecting';

const ShareUnlockCard = ({ token }: { token: string }) => {
  const [status, setStatus] = useState<Status>('loading');
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [filename, setFilename] = useState('Shared file');
  const [expiresAt, setExpiresAt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [redirectMessage, setRedirectMessage] = useState('Redirecting...');

  const redirectToFile = (fileUrl: string, message: string) => {
    if (!fileUrl) {
      setStatus('error');
      setErrorMessage('Shared file is no longer available');
      return;
    }

    setRedirectMessage(message);
    setStatus('redirecting');

    window.setTimeout(() => {
      window.location.replace(fileUrl);
    }, 900);
  };

  useEffect(() => {
    const loadShareInfo = async () => {
      setStatus('loading');
      setErrorMessage('');

      const response = await fetch(`/api/files/share/${token}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus('error');
        setErrorMessage(payload.error || 'Unable to open share link');
        return;
      }

      setRequiresPasscode(Boolean(payload.requiresPasscode));
      setFilename(payload.filename || 'Shared file');
      setExpiresAt(payload.expiresAt || '');

      if (!payload.requiresPasscode) {
        const unlockResponse = await fetch(`/api/files/share/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        const unlockPayload = await unlockResponse.json().catch(() => ({}));

        if (!unlockResponse.ok) {
          setStatus('error');
          setErrorMessage(unlockPayload.error || 'Unable to open share link');
          return;
        }

        redirectToFile(unlockPayload.fileUrl || '', 'Redirecting to file...');
        return;
      }

      setStatus('ready');
    };

    void loadShareInfo();
  }, [token]);

  const unlockLink = async () => {
    setErrorMessage('');

    const response = await fetch(`/api/files/share/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ passcode }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setErrorMessage(payload.error || 'Unable to unlock file');
      return;
    }

    redirectToFile(payload.fileUrl || '', 'Unlock successful. Redirecting...');
  };

  if (status === 'loading') {
    return (
      <div className='space-y-3'>
        <h1 className='text-2xl font-semibold tracking-tight'>Preparing secure access</h1>
        <p className='text-sm text-muted-foreground'>Checking link validity and file availability.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='space-y-3'>
        <h1 className='text-2xl font-semibold tracking-tight'>Link unavailable</h1>
        <p className='text-sm text-destructive'>{errorMessage}</p>
      </div>
    );
  }

  if (status === 'redirecting') {
    return (
      <div className='space-y-4'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold tracking-tight'>{filename}</h1>
          <p className='text-sm text-muted-foreground'>
            Expires {expiresAt ? new Date(expiresAt).toLocaleString() : 'soon'}
          </p>
        </div>
        <div className='flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground'>
          <RefreshCw className='h-4 w-4 animate-spin text-primary' />
          <span>{redirectMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>{filename}</h1>
        <p className='text-sm text-muted-foreground'>
          Expires {expiresAt ? new Date(expiresAt).toLocaleString() : 'soon'}
        </p>
      </div>

      {requiresPasscode ? (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <label className='inline-flex items-center gap-2 text-sm font-medium'>
              <LockKeyhole className='h-4 w-4' />
              Passcode
            </label>
            <Input
              type='password'
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              placeholder='Enter passcode'
              className='h-11 rounded-2xl'
            />
          </div>

          {errorMessage ? <p className='text-sm text-destructive'>{errorMessage}</p> : null}

          <Button
            type='button'
            className='h-11 rounded-full'
            onClick={unlockLink}
            disabled={passcode.trim().length === 0}
          >
            <LockKeyhole className='h-4 w-4' />
            Unlock and redirect
          </Button>
        </div>
      ) : (
        <div className='flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground'>
          <Loader2 className='h-4 w-4 animate-spin text-primary' />
          <span>Redirecting to file...</span>
        </div>
      )}
    </div>
  );
};

export default ShareUnlockCard;
