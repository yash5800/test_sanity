"use client";

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { downloadFileWithProgress } from './download-client';

const DownloadBut = ({ file, workspaceKey }: { file: { _id: string; filename: string }; workspaceKey: string }) => {
  const [isDownloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      await downloadFileWithProgress({
        url: `/api/files/download/${file._id}?key=${encodeURIComponent(workspaceKey)}`,
        filename: file.filename,
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
