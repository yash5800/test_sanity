"use client";

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { downloadFileWithProgress } from './download-client';

const DownloadBut = ({ file, workspaceKey }: { file: { _id: string; filename: string }; workspaceKey: string }) => {
  const [isDownloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setDownloading(true);

    try {
      await downloadFileWithProgress({
        url: `/api/files/download/${file._id}?key=${encodeURIComponent(workspaceKey)}`,
        filename: file.filename,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unable to download file',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      className='rounded-full'
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Download className='h-4 w-4' />}
      {isDownloading ? 'Downloading...' : 'Download'}
    </Button>
  );
};

export default DownloadBut;
