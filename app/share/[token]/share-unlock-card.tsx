"use client";

import { useEffect, useState } from 'react';
import { CheckCircle2, LockKeyhole, RefreshCw, Download } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { downloadFileWithProgress, type DownloadProgressState } from '@/app/components/download-client';

type Status = 'loading' | 'ready' | 'error' | 'downloading' | 'done';

const ShareUnlockCard = ({ token }: { token: string }) => {
  const [status, setStatus] = useState<Status>('loading');
  const [passcode, setPasscode] = useState('');
  const [filename, setFilename] = useState('Shared file');
  const [expiresAt, setExpiresAt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState<DownloadProgressState | null>(null);

  const startRedirectHome = () => {
    window.setTimeout(() => {
      window.location.replace('/');
    }, 1400);
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

      setFilename(payload.filename || 'Shared file');
      setExpiresAt(payload.expiresAt || '');

      if (!payload.requiresPasscode) {
        setStatus('downloading');
        setProgress({ loaded: 0, total: 0, percent: 0 });

        try {
          await downloadFileWithProgress({
            url: `/api/files/share/${token}/download`,
            filename: payload.filename || 'download',
            onProgress: setProgress,
          });

          setStatus('done');
          startRedirectHome();
        } catch (downloadError) {
          setStatus('error');
          setErrorMessage(downloadError instanceof Error ? downloadError.message : 'Unable to download file');
        }
        return;
      }

      setStatus('ready');
    };

    void loadShareInfo();
  }, [token]);

  const unlockAndDownload = () => {
    setErrorMessage('');
    setStatus('downloading');
    setProgress({ loaded: 0, total: 0, percent: 0 });

    void (async () => {
      try {
        await downloadFileWithProgress({
          url: `/api/files/share/${token}/download`,
          method: 'POST',
          body: new URLSearchParams({ passcode }),
          filename,
          onProgress: setProgress,
        });

        setStatus('done');
        startRedirectHome();
      } catch (downloadError) {
        setStatus('ready');
        setErrorMessage(downloadError instanceof Error ? downloadError.message : 'Unable to download file');
      }
    })();
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

  if (status === 'downloading' || status === 'done') {
    return (
      <div className='space-y-4'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold tracking-tight'>{filename}</h1>
          <p className='text-sm text-muted-foreground'>
            {status === 'done' ? 'Downloaded successfully' : `Expires ${expiresAt ? new Date(expiresAt).toLocaleString() : 'soon'}`}
          </p>
        </div>
        <div className='space-y-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-4 text-sm text-muted-foreground'>
          <div className='flex items-center gap-3'>
            {status === 'done' ? <CheckCircle2 className='h-4 w-4 text-emerald-500' /> : <RefreshCw className='h-4 w-4 animate-spin text-primary' />}
            <span>{status === 'done' ? 'Downloaded. Redirecting home...' : 'Downloading securely...'}</span>
          </div>
          {progress ? (
            <div className='space-y-2'>
              <div className='h-2 overflow-hidden rounded-full bg-muted'>
                <div className='h-full rounded-full bg-primary transition-all duration-300' style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          ) : null}
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
          onClick={unlockAndDownload}
          disabled={passcode.trim().length === 0}
        >
          <Download className='h-4 w-4' />
          Unlock and download
        </Button>
      </div>
    </div>
  );
};

export default ShareUnlockCard;
