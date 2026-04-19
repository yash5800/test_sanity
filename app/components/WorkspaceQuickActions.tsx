"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Copy, Link2, FileText, UploadCloud } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const WorkspaceQuickActions = ({ workspaceKey }: { workspaceKey: string }) => {
  const { toast } = useToast();
  const [isCopyingKey, setCopyingKey] = useState(false);
  const [isCopyingLink, setCopyingLink] = useState(false);

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: 'Success',
        description: `${label} copied`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Error',
        description: `Unable to copy ${label.toLowerCase()}`,
        variant: 'destructive',
      });
    }
  };

  const copyWorkspaceLink = async () => {
    const url = `${window.location.origin}/user/${workspaceKey}`;
    setCopyingLink(true);
    try {
      await copyText(url, 'Workspace link');
    } finally {
      setCopyingLink(false);
    }
  };

  const copyWorkspaceKey = async () => {
    setCopyingKey(true);
    try {
      await copyText(workspaceKey, 'Workspace key');
    } finally {
      setCopyingKey(false);
    }
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Button type='button' variant='outline' size='sm' className='rounded-full' onClick={copyWorkspaceKey} disabled={isCopyingKey}>
        <Copy className={`h-4 w-4 ${isCopyingKey ? 'animate-pulse' : ''}`} />
        {isCopyingKey ? 'Copying...' : 'Copy key'}
      </Button>
      <Button type='button' variant='outline' size='sm' className='rounded-full' onClick={copyWorkspaceLink} disabled={isCopyingLink}>
        <Link2 className={`h-4 w-4 ${isCopyingLink ? 'animate-pulse' : ''}`} />
        {isCopyingLink ? 'Copying...' : 'Copy link'}
      </Button>
      <Link
        href='#upload'
        className='inline-flex h-9 items-center justify-center gap-2 rounded-full border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground'
      >
        <UploadCloud className='h-4 w-4' />
        Upload
      </Link>
      <Link
        href='#files'
        className='inline-flex h-9 items-center justify-center gap-2 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90'
      >
        <FileText className='h-4 w-4' />
        Files
      </Link>
    </div>
  );
};

export default WorkspaceQuickActions;