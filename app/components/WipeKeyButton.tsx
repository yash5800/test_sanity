"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogIcon,
  AlertDialogSecondaryAction,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Input } from "@/app/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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
      const response = await fetch('/api/files/wipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: uploadKey }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data && typeof data.error === 'string' ? data.error : 'Unable to wipe this key. Please try again.',
        );
      }

      const result = data as { deletedFiles: number; deletedAssets: number };

      if (!result.deletedFiles) {
        toast({
          title: "Nothing to wipe",
          description: `No files found for key ${uploadKey}.`,
          variant: "default",
        });
        setOpen(false);
        return;
      }

      toast({
        title: "Workspace wiped",
        description: `${result.deletedFiles} file${result.deletedFiles === 1 ? "" : "s"} removed from ${uploadKey}.`,
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
      <AlertDialog open={isOpen} onOpenChange={(nextOpen) => !isDeleting && setOpen(nextOpen)}>
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

        <AlertDialogContent className="max-w-xl gap-0 border-border/70 bg-card p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
          <div className="h-1.5 bg-gradient-to-r from-destructive via-chart-5 to-destructive" />
          <AlertDialogHeader className="px-6 pb-3 pt-6 text-left">
            <div className="flex items-start gap-3">
              <AlertDialogIcon>
                <AlertTriangle className="h-5 w-5" />
              </AlertDialogIcon>
              <div className="min-w-0 flex-1 space-y-1">
                <AlertDialogTitle>Wipe all files for this key?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed">
                  This action permanently deletes every file stored under <span className="font-semibold text-foreground">{uploadKey}</span>.
                </AlertDialogDescription>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-chart-4" />
                  Material warning surface with explicit confirmation.
                </p>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="mx-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Type <span className="font-mono">{expectedText}</span> to confirm.</p>
            <p className="mt-1">This prevents accidental wipes.</p>
          </div>

          <div className="space-y-2 px-6 pb-2 pt-5">
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

          <AlertDialogFooter className="gap-2 px-6 pb-6 pt-1 sm:justify-end">
            <AlertDialogSecondaryAction className="h-11 rounded-full border-border/70" disabled={isDeleting}>
              Cancel
            </AlertDialogSecondaryAction>
            <Button
              type="button"
              variant="destructive"
              onClick={wipeAllFiles}
              disabled={!canConfirm}
              className="h-11 rounded-full"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Wiping..." : `Wipe ${fileCount} file${fileCount === 1 ? "" : "s"}`}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WipeKeyButton;