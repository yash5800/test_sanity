"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Sparkles, Trash2, X } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { client } from "@/sanity/lib/client";

type FileRef = {
  _id: string;
  assetId?: string;
};

const WipeKeyButton = ({ uploadKey, fileCount }: { uploadKey: string; fileCount: number }) => {
  const [isOpen, setOpen] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const { toast } = useToast();

  const expectedText = useMemo(() => `wipe ${uploadKey}`, [uploadKey]);
  const canConfirm = confirmationText === expectedText && fileCount > 0 && !isDeleting;

  const wipeAllFiles = async () => {
    setDeleting(true);

    try {
      const files = await client.fetch<FileRef[]>(
        `*[_type == "post" && key == $key]{_id, "assetId": file.asset._ref}`,
        { key: uploadKey },
      );

      if (!files.length) {
        toast({
          title: "Nothing to wipe",
          description: `No files found for key ${uploadKey}.`,
          variant: "default",
        });
        setOpen(false);
        return;
      }

      const documentIds = files.map((file) => file._id);
      const uniqueAssetIds = Array.from(new Set(files.map((file) => file.assetId).filter(Boolean))) as string[];

      const deleteDocsTransaction = documentIds.reduce((tx, id) => tx.delete(id), client.transaction());
      await deleteDocsTransaction.commit();

      // Attempt to clean up file assets; failure here should not block document removal.
      await Promise.allSettled(uniqueAssetIds.map((assetId) => client.delete(assetId)));

      toast({
        title: "Workspace wiped",
        description: `${documentIds.length} file${documentIds.length === 1 ? "" : "s"} removed from ${uploadKey}.`,
        variant: "success",
      });
      setConfirmationText("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Wipe failed",
        description: error instanceof Error ? error.message : "Unable to wipe this key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className="inline-flex h-11 items-center justify-center rounded-2xl"
        onClick={() => setOpen(true)}
        disabled={isDeleting || fileCount === 0}
      >
        <Trash2 className="h-4 w-4" />
        Wipe
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={() => !isDeleting && setOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="wipe-key-title"
            aria-describedby="wipe-key-description"
            className="w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-destructive/30 bg-background p-6 shadow-2xl shadow-black/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="-mx-6 -mt-6 h-2 bg-gradient-to-r from-destructive via-chart-5 to-destructive" />
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h2 id="wipe-key-title" className="text-lg font-semibold tracking-tight">
                  Wipe all files for this key?
                </h2>
                <p id="wipe-key-description" className="text-sm text-muted-foreground">
                  This action permanently deletes every file stored under <span className="font-semibold text-foreground">{uploadKey}</span>.
                </p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-chart-4" />
                  Material warning surface with explicit confirmation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close wipe dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Type <span className="font-mono">{expectedText}</span> to confirm.</p>
              <p className="mt-1">This prevents accidental wipes.</p>
            </div>

            <div className="mt-4 space-y-2">
              <label htmlFor="wipe-confirmation" className="text-sm font-medium text-foreground">
                Confirmation text
              </label>
              <Input
                id="wipe-confirmation"
                value={confirmationText}
                onChange={(event) => setConfirmationText(event.target.value)}
                placeholder={expectedText}
                className="font-mono"
                autoComplete="off"
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={wipeAllFiles}
                disabled={!canConfirm}
                className="rounded-full"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Wiping..." : `Wipe ${fileCount} file${fileCount === 1 ? "" : "s"}`}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default WipeKeyButton;