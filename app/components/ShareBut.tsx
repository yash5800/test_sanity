"use client";

import { Share2 } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ShareBut = ({ file }: { file: { filename: string; fileUrl: string } }) => {
  const { toast } = useToast();

  const onShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: file.filename,
          text: `Shared from SanityHub: ${file.filename}`,
          url: file.fileUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(file.fileUrl);
      toast({
        title: 'Success',
        description: 'File link copied to clipboard',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Unable to share file link',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button onClick={onShare} variant='ghost' size='sm' className='rounded-full'>
      <Share2 className='h-4 w-4' />
      Share
    </Button>
  );
};

export default ShareBut;