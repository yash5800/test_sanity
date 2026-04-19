"use client";

import { useMemo, useState } from 'react';
import { Edit3, FolderInput, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import DeleteBut from './DeleteBut';
import DownloadBut from './DownloadBut';
import ShareBut from './ShareBut';
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
import { copySanityFileToKey, renameSanityFile } from '@/sanity/lib/file-actions';

type FileActionsProps = {
  file: {
    _id: string;
    filename: string;
    fileUrl: string;
  };
  currentKey: string;
};

const FileActions = ({ file, currentKey }: FileActionsProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isRenameOpen, setRenameOpen] = useState(false);
  const [isCopyOpen, setCopyOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(file.filename);
  const [copyKeyValue, setCopyKeyValue] = useState(currentKey);
  const [isRenaming, setRenaming] = useState(false);
  const [isCopying, setCopying] = useState(false);

  const trimmedRenameValue = useMemo(() => renameValue.trim(), [renameValue]);
  const trimmedCopyKeyValue = useMemo(() => copyKeyValue.trim(), [copyKeyValue]);

  const handleRename = async () => {
    setRenaming(true);
    try {
      await renameSanityFile(file._id, trimmedRenameValue);
      setRenameOpen(false);
      toast({
        title: 'File renamed',
        description: `${file.filename} is now ${trimmedRenameValue}`,
        variant: 'success',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unable to rename file',
        variant: 'destructive',
      });
    } finally {
      setRenaming(false);
    }
  };

  const handleCopyFile = async () => {
    setCopying(true);
    try {
      await copySanityFileToKey(file._id, trimmedCopyKeyValue, file.filename);
      setCopyOpen(false);
      toast({
        title: 'File copied',
        description: `Copied to workspace key ${trimmedCopyKeyValue}`,
        variant: 'success',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unable to copy file',
        variant: 'destructive',
      });
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap gap-2'>
        <Button type='button' variant='outline' size='sm' className='rounded-full' onClick={() => setRenameOpen(true)}>
          <Edit3 className='h-4 w-4' />
          Rename
        </Button>
        <Button type='button' variant='outline' size='sm' className='rounded-full' onClick={() => setCopyOpen(true)}>
          <FolderInput className='h-4 w-4' />
          Copy to key
        </Button>
      </div>

      <div className='flex flex-wrap gap-2'>
        <DownloadBut file={{ filename: file.filename, fileUrl: file.fileUrl }} />
        <ShareBut file={{ filename: file.filename, fileUrl: file.fileUrl }} />
        <DeleteBut fileId={file._id} fileName={file.filename} />
      </div>

      <AlertDialog
        open={isRenameOpen}
        onOpenChange={(nextOpen) => {
          if (isRenaming) {
            return;
          }

          setRenameOpen(nextOpen);
          if (!nextOpen) {
            setRenameValue(file.filename);
          }
        }}
      >
        <AlertDialogContent className='max-w-lg gap-0 border-border/70 bg-card p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)]'>
          <div className='h-1.5 bg-gradient-to-r from-primary via-chart-2 to-chart-4' />
          <AlertDialogHeader className='space-y-2 px-6 pb-3 pt-6 text-left'>
            <AlertDialogTitle>Rename file</AlertDialogTitle>
            <AlertDialogDescription className='text-sm leading-relaxed'>
              Change the display name stored for this file. This updates the document metadata only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-4 px-6 pb-2'>
            <Input
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              placeholder='New file name'
              className='h-11 rounded-2xl'
            />
          </div>
          <AlertDialogFooter className='gap-2 px-6 pb-6 pt-1 sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              className='h-11 rounded-full'
              onClick={() => {
                setRenameOpen(false);
                setRenameValue(file.filename);
              }}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              type='button'
              className='h-11 rounded-full'
              onClick={handleRename}
              disabled={isRenaming || trimmedRenameValue.length === 0}
            >
              {isRenaming ? <Loader2 className='h-4 w-4 animate-spin' /> : <Edit3 className='h-4 w-4' />}
              {isRenaming ? 'Saving...' : 'Save name'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isCopyOpen}
        onOpenChange={(nextOpen) => {
          if (isCopying) {
            return;
          }

          setCopyOpen(nextOpen);
          if (!nextOpen) {
            setCopyKeyValue(currentKey);
          }
        }}
      >
        <AlertDialogContent className='max-w-lg gap-0 border-border/70 bg-card p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)]'>
          <div className='h-1.5 bg-gradient-to-r from-primary via-chart-2 to-chart-4' />
          <AlertDialogHeader className='space-y-2 px-6 pb-3 pt-6 text-left'>
            <AlertDialogTitle>Copy file to another key</AlertDialogTitle>
            <AlertDialogDescription className='text-sm leading-relaxed'>
              This creates a new file record that points to the same uploaded asset. The original file stays in place.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-4 px-6 pb-2'>
            <Input
              value={copyKeyValue}
              onChange={(event) => setCopyKeyValue(event.target.value)}
              placeholder='Target private key'
              className='h-11 rounded-2xl'
            />
            <p className='text-xs text-muted-foreground'>
              The copied file keeps the same filename and asset, but it becomes a separate document in the target workspace.
            </p>
          </div>
          <AlertDialogFooter className='gap-2 px-6 pb-6 pt-1 sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              className='h-11 rounded-full'
              onClick={() => {
                setCopyOpen(false);
                setCopyKeyValue(currentKey);
              }}
              disabled={isCopying}
            >
              Cancel
            </Button>
            <Button
              type='button'
              className='h-11 rounded-full'
              onClick={handleCopyFile}
              disabled={isCopying || trimmedCopyKeyValue.length === 0}
            >
              {isCopying ? <Loader2 className='h-4 w-4 animate-spin' /> : <FolderInput className='h-4 w-4' />}
              {isCopying ? 'Copying...' : 'Copy file'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FileActions;