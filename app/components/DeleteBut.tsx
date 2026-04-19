"use client"

import React, { useState } from 'react'
import { AlertTriangle, Sparkles, Trash2 } from 'lucide-react';

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
} from '@/app/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const DeleteBut = ({ fileId, fileName }: { fileId: string; fileName?: string }) => {
  const [isLoading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const {toast} = useToast();

  const deleteUploadedFile = async (): Promise<void> => {
    setLoading(true);

    try {
      const response = await fetch('/api/files/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
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
      <AlertDialog open={isOpen} onOpenChange={(nextOpen) => !isLoading && setOpen(nextOpen)}>
        <Button
          onClick={() => setOpen(true)}
          variant="destructive"
          size="sm"
          disabled={isLoading}
          className='rounded-full'>
          <Trash2 className="h-4 w-4" />
          {isLoading ? "Deleting..." : "Delete"}
        </Button>

        <AlertDialogContent className='max-w-md gap-0 border-border/70 bg-card p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)]'>
          <div className='h-1.5 bg-gradient-to-r from-destructive via-chart-5 to-destructive' />
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
                  <Sparkles className='h-3.5 w-3.5 text-chart-4' />
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className='gap-2 px-6 pb-6 pt-1 sm:justify-end'>
            <AlertDialogSecondaryAction className='h-11 rounded-full border-border/70' disabled={isLoading}>
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
      </AlertDialog>
    </>
  )
}

export default DeleteBut
