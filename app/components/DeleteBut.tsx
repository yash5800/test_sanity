"use client"

import React, { useState, useCallback } from 'react'
import { AlertTriangle, Sparkles, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/app/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogIcon,
  AlertDialogSecondaryAction,
  AlertDialogTitle,
  AlertDialogPortal,
} from '@/app/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type DeleteButProps = {
  fileId: string;
  workspaceKey: string;
  fileName?: string;
  className?: string;
  buttonLabel?: string;
  buttonVariant?: 'destructive' | 'outline';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DeleteBut = ({
  fileId,
  workspaceKey,
  fileName,
  className,
  buttonLabel = 'Delete',
  buttonVariant = 'destructive',
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DeleteButProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const {toast} = useToast();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback((nextOpen: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  }, [isControlled, controlledOnOpenChange]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (isLoading) return;
    setOpen(nextOpen);
  }, [isLoading, setOpen]);

  const deleteUploadedFile = async (): Promise<void> => {
    setLoading(true);

    try {
      const response = await fetch('/api/files/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, key: workspaceKey }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data && typeof data.error === 'string' ? data.error : 'Error deleting file',
        );
      }

      setOpen(false);

      toast({
        title: 'File deleted',
        description: fileName || 'Deleted successfully',
        variant: 'success',
      });

      router.refresh();

    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Error deleting file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isControlled && (
        <Button
          onClick={() => setOpen(true)}
          variant={buttonVariant}
          size="sm"
          disabled={isLoading}
          className={cn('rounded-full', className)}>
          <Trash2 className="h-4 w-4" />
          {isLoading ? "Deleting..." : buttonLabel}
        </Button>
      )}

      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogPortal>
          <AlertDialogContent className='max-w-md gap-0 border-border/70 bg-card p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)]'>
            <div className='h-1.5 bg-gradient-to-r from-destructive via-red-600 to-destructive' />
            <AlertDialogHeader className='px-6 pb-3 pt-6 text-left'>
              <div className='flex items-start gap-3'>
                <AlertDialogIcon>
                  <AlertTriangle className='h-5 w-5' />
                </AlertDialogIcon>
                <div className='min-w-0 flex-1 space-y-1'>
                  <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                  <AlertDialogDescription className='text-sm leading-relaxed'>
                    {fileName
                      ? `${fileName} will be removed permanently from this workspace.`
                      : 'This file will be removed permanently from this workspace.'}
                  </AlertDialogDescription>
                  <p className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Sparkles className='h-3.5 w-3.5 text-purple-500' />
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </AlertDialogHeader>

            <AlertDialogFooter className='gap-2 px-6 pb-6 pt-1 sm:justify-end'>
              <AlertDialogSecondaryAction 
                type="button"
                className='h-11 rounded-full border-border/70' 
                disabled={isLoading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </AlertDialogSecondaryAction>
              <Button
                type="button"
                variant="destructive"
                onClick={deleteUploadedFile}
                disabled={isLoading}
                className="h-11 rounded-full"
              >
                <Trash2 className="h-4 w-4" />
                {isLoading ? 'Deleting...' : 'Delete file'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  )
}

export default DeleteBut
