'use client'

import { useRouter } from "next/navigation";
import { useTransition, useState, type FormEvent } from "react";
import { ArrowRight, KeyRound, Sparkles, UploadCloud, Loader2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

const Key = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [key, upkey] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleInsertKey = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedKey = key.trim();

      if (trimmedKey.length < 4) {
        setError("At least 4 characters required");
        return;
      }

      setError("");
      startTransition(() => {
        router.push(`/user/${trimmedKey}`);
      });
  };
  

  return (
    <Card className="w-full max-w-xl overflow-hidden border-border/70 bg-card/92 shadow-2xl shadow-black/10 backdrop-blur">
      <div className="h-2 bg-gradient-to-r from-primary via-chart-2 to-chart-4" />
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/90 px-3 py-1 text-secondary-foreground">
            <KeyRound className="h-4 w-4" />
            Private access
          </span>
        </div>
        <CardTitle className="text-3xl tracking-tight sm:text-4xl">Open your file space with one key.</CardTitle>
        <CardDescription className="text-base sm:text-lg">
          Drop into your workspace, upload files, and manage them from a layout that stays fast in both light and dark mode.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleInsertKey}>
          <Input
            type="text"
            name="key"
            value={key}
            id="key"
            minLength={4}
            placeholder="Enter your access key"
            onChange={(event) => upkey(event.target.value)}
            autoComplete="off"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "key-error" : undefined}
            className="h-12 rounded-2xl bg-background/80 text-base"
          />
          {error ? (
            <p id="key-error" className="text-sm text-destructive">
              {error}
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-chart-4" />
              Use the same key you created for uploads.
            </p>
          )}
          <Button type="submit" className="h-12 w-full rounded-2xl text-base font-semibold" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening workspace...
              </>
            ) : (
              <>
                Open workspace
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
              <UploadCloud className="h-4 w-4 text-primary" />
              Multi-file upload ready
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default Key
