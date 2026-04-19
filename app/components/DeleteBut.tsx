"use client"

import React, { useState } from 'react'
import { AlertTriangle, Sparkles, Trash2, X } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/sanity/lib/client';

const DeleteBut = ({ fileId, fileName }: { fileId: string; fileName?: string }) => {
  const [isLoading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const {toast} = useToast();
  const deleteUploadedFile = async (): Promise<void> => {
    setLoading(true);
    try {
      const doc = await client.getDocument(fileId);
      const assetRef =
        doc?.file?.asset?._ref ||
        doc?.image?.asset?._ref;

      if (assetRef) {
        // 🔍 Find all documents referencing this asset
        const refs = await client.fetch(
          `*[_type != "sanity.fileAsset" && references($assetId)]._id`,
          { assetId: assetRef }
        );

        // 🧹 Remove references
        for (const refId of refs) {
          await client.patch(refId).unset(["file", "image"]).commit();
        }

        // 🗑️ Delete asset
        await client.delete(assetRef);
      }

      // 🗑️ Delete main document
      await client.delete(fileId);

      setOpen(false);

      toast({
        title: 'File deleted',
        description: fileName || 'Deleted successfully',
        variant: 'success'
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error
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
       <Button
         onClick={()=>setOpen(true)}
         variant="destructive"
         size="sm"
         disabled={isLoading}
         className='rounded-full'>
         <Trash2 className="h-4 w-4" />
         {isLoading?"Deleting...":"Delete"}
       </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={() => !isLoading && setOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-file-title"
            aria-describedby="delete-file-description"
            className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-border/80 bg-background p-6 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="-mx-6 -mt-6 mb-6 h-2 bg-gradient-to-r from-destructive via-chart-5 to-destructive" />
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h2 id="delete-file-title" className="text-lg font-semibold tracking-tight">
                  Delete this file?
                </h2>
                <p id="delete-file-description" className="text-sm text-muted-foreground">
                  {fileName
                    ? `${fileName} will be removed permanently from this workspace.`
                    : 'This file will be removed permanently from this workspace.'}
                </p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-chart-4" />
                  This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close delete dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={deleteUploadedFile}
                disabled={isLoading}
                className="rounded-full"
              >
                <Trash2 className="h-4 w-4" />
                {isLoading ? 'Deleting...' : 'Delete file'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default DeleteBut
