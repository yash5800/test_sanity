"use client";

import { useMemo, useState } from 'react';
import { Clock3, Link2, Loader2, LockKeyhole, Share2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const durationOptions = [
  { label: '1 hour', value: 1 },
  { label: '24 hours', value: 24 },
  { label: '3 days', value: 72 },
  { label: '7 days', value: 168 },
] as const;

const ShareBut = ({ file, workspaceKey }: { file: { _id: string; filename: string; fileUrl: string }; workspaceKey: string }) => {
  const { toast } = useToast();
  const [isOpen, setOpen] = useState(false);
  const [isSharing, setSharing] = useState(false);
  const [durationHours, setDurationHours] = useState<number>(24);
  const [passcode, setPasscode] = useState('');

  const trimmedPasscode = useMemo(() => passcode.trim(), [passcode]);

  const createSecureShare = async () => {
    setSharing(true);

    try {
      const response = await fetch('/api/files/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: file._id,
          key: workspaceKey,
          durationHours,
          passcode: trimmedPasscode,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.shareUrl) {
        throw new Error(payload.error || 'Unable to create secure share link');
      }

      const shareUrl = payload.shareUrl as string;

      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: file.filename,
          text: `Secure shared link for ${file.filename}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }

      toast({
        title: 'Share link created',
        description: 'Secure link generated and copied/shared successfully',
        variant: 'success',
      });

      setOpen(false);
      setPasscode('');
      setDurationHours(24);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unable to share file link',
        variant: 'destructive',
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant='ghost' size='sm' className='rounded-full' disabled={isSharing}>
        {isSharing ? <Loader2 className='h-4 w-4 animate-spin' /> : <Share2 className='h-4 w-4' />}
        {isSharing ? 'Sharing...' : 'Share'}
      </Button>

      <AlertDialog
        open={isOpen}
        onOpenChange={(nextOpen) => {
          if (isSharing) return;
          setOpen(nextOpen);
          if (!nextOpen) {
            setPasscode('');
            setDurationHours(24);
          }
        }}
      >
        <AlertDialogContent className='max-w-lg gap-0 border-border/70 bg-card p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)]'>
          <div className='h-1.5 bg-gradient-to-r from-primary via-chart-2 to-chart-4' />
          <AlertDialogHeader className='space-y-2 px-6 pb-3 pt-6 text-left'>
            <AlertDialogTitle>Create secure share link</AlertDialogTitle>
            <AlertDialogDescription className='text-sm leading-relaxed'>
              Generate an expiring link for {file.filename}. Optional passcode protection is available.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='space-y-4 px-6 pb-2'>
            <div className='space-y-2'>
              <span className='inline-flex items-center gap-2 text-sm font-medium'>
                <Clock3 className='h-4 w-4' />
                Link expiry
              </span>
              <div className='flex flex-wrap gap-2'>
                {durationOptions.map((option) => (
                  <Button
                    key={option.value}
                    type='button'
                    size='sm'
                    variant={durationHours === option.value ? 'default' : 'outline'}
                    className='rounded-full'
                    onClick={() => setDurationHours(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <label className='inline-flex items-center gap-2 text-sm font-medium'>
                <LockKeyhole className='h-4 w-4' />
                Passcode (optional)
              </label>
              <Input
                type='password'
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                placeholder='Add passcode to protect this link'
                className='h-11 rounded-2xl'
              />
              <p className='text-xs text-muted-foreground'>
                If set, recipients must enter this passcode to unlock the file.
              </p>
            </div>
          </div>

          <AlertDialogFooter className='gap-2 px-6 pb-6 pt-1 sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              className='h-11 rounded-full'
              onClick={() => setOpen(false)}
              disabled={isSharing}
            >
              Cancel
            </Button>
            <Button
              type='button'
              className='h-11 rounded-full'
              onClick={createSecureShare}
              disabled={isSharing || (trimmedPasscode.length > 0 && trimmedPasscode.length < 4)}
            >
              {isSharing ? <Loader2 className='h-4 w-4 animate-spin' /> : <Link2 className='h-4 w-4' />}
              {isSharing ? 'Generating...' : 'Create link'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShareBut;