"use client";

import Link from 'next/link';
import { Copy, Link2 } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const WorkspaceQuickActions = ({ workspaceKey }: { workspaceKey: string }) => {
  const { toast } = useToast();

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
    await copyText(url, 'Workspace link');
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Button type='button' variant='outline' size='sm' className='rounded-full' onClick={() => copyText(workspaceKey, 'Workspace key')}>
        <Copy className='h-4 w-4' />
        Copy key
      </Button>
      <Button type='button' variant='outline' size='sm' className='rounded-full' onClick={copyWorkspaceLink}>
        <Link2 className='h-4 w-4' />
        Copy link
      </Button>
      <Link
        href='#upload'
        className='inline-flex h-9 items-center justify-center rounded-full border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground'
      >
        Upload
      </Link>
      <Link
        href='#files'
        className='inline-flex h-9 items-center justify-center rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90'
      >
        Files
      </Link>
    </div>
  );
};

export default WorkspaceQuickActions;