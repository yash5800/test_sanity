"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BarChart3, FilePlus2, FileText, Link2, UploadCloud } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const hideCodeStorageKey = (workspaceKey: string) => `sanityhub:hide-code-space:${workspaceKey}`;

const WorkspaceQuickActions = ({ workspaceKey, currentSpace }: { workspaceKey: string; currentSpace: 'storage' | 'code' }) => {
  const { toast } = useToast();
  const [isCopyingLink, setCopyingLink] = useState(false);
  const [isCodeSpaceHidden, setCodeSpaceHidden] = useState(false);

  useEffect(() => {
    const syncHideState = () => {
      try {
        const raw = window.localStorage.getItem(hideCodeStorageKey(workspaceKey));
        setCodeSpaceHidden(raw === '1');
      } catch {
        setCodeSpaceHidden(false);
      }
    };

    const onHideCodeSpaceChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ workspaceKey?: string }>;
      if (customEvent.detail?.workspaceKey && customEvent.detail.workspaceKey !== workspaceKey) return;
      syncHideState();
    };

    syncHideState();
    window.addEventListener('sanityhub:hide-code-space-change', onHideCodeSpaceChange);

    return () => {
      window.removeEventListener('sanityhub:hide-code-space-change', onHideCodeSpaceChange);
    };
  }, [workspaceKey]);

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
    const url = `${window.location.origin}/user/${workspaceKey}?space=${currentSpace}`;
    setCopyingLink(true);
    try {
      await copyText(url, 'Workspace link');
    } finally {
      setCopyingLink(false);
    }
  };

  return (
    <div className='flex flex-wrap gap-2'>
      <Button type='button' variant='outline' size='sm' className='rounded-full' onClick={copyWorkspaceLink} disabled={isCopyingLink}>
        <Link2 className={`h-4 w-4 ${isCopyingLink ? 'animate-pulse' : ''}`} />
        {isCopyingLink ? 'Copying...' : 'Copy link'}
      </Button>

      {currentSpace === 'storage' ? (
        <>
          <Link
            href={`/user/${workspaceKey}?space=storage#upload`}
            className='inline-flex h-9 items-center justify-center gap-2 rounded-full border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground'
          >
            <UploadCloud className='h-4 w-4' />
            Upload
          </Link>
          <Link
            href={`/user/${workspaceKey}?space=storage#files`}
            className='inline-flex h-9 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-3 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all'
          >
            <FileText className='h-4 w-4' />
            Files
          </Link>
        </>
      ) : (
        <a 
          href={`/user/${workspaceKey}?space=code#code-space`}
          className='flex gap-2 justify-center items-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-600 px-3 text-sm font-medium'
        >
          <FilePlus2 className='h-4 w-4' />
          New note
        </a>
      )}

      <Link
        href={`/user/${workspaceKey}/analysis`}
        className='inline-flex h-9 items-center justify-center gap-2 rounded-full border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground'
      >
        <BarChart3 className='h-4 w-4' />
        Analysis
      </Link>
    </div>
  );
};

export default WorkspaceQuickActions;