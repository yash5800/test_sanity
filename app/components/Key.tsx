'use client'

import { useRouter } from "next/navigation";
import { useTransition, useState, type FormEvent } from "react";
import { ArrowRight, KeyRound, Sparkles, Loader2, Shield, AlertTriangle } from "lucide-react";

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
    <Card className="w-full max-w-lg overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-2xl shadow-black/20 backdrop-blur-xl rounded-xl sm:rounded-2xl">
      {/* Top gradient bar with enhanced colors */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <CardHeader className="space-y-4 pb-5 sm:pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Shield className="h-4 w-4" />
            Secure Key Access
          </span>
        </div>
        <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Open your workspace
        </CardTitle>
        <CardDescription className="text-sm sm:text-base lg:text-lg leading-relaxed text-foreground/70">
          Enter your access key to open your workspace. This app uses key-based access, not end-to-end encryption.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4 sm:space-y-5" onSubmit={handleInsertKey}>
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary soft-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              Start here: enter access key
            </p>
            <label htmlFor="key" className="block text-sm font-semibold text-foreground/90">
              Access Key
            </label>
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
              className="h-11 sm:h-12 rounded-xl bg-gradient-to-br from-background/60 to-background/40 text-sm sm:text-base border-primary/50 ring-2 ring-primary/25 focus:border-primary/70 focus:ring-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)] transition-all"
            />
          </div>

          {error ? (
            <p id="key-error" className="text-sm text-destructive font-medium flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
              {error}
            </p>
          ) : (
            <p className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />
              Use the same key you created for uploads
            </p>
          )}

          <Button 
            type="submit" 
            className="h-11 sm:h-12 w-full rounded-xl text-sm sm:text-base font-bold gap-2 mt-4 sm:mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 transition-all" 
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                <span className="hidden sm:inline">Unlock Workspace</span>
                <span className="sm:hidden">Unlock</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="grid gap-3 pt-2">
            <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground hover:border-border/60 transition-colors">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <span className="font-medium">Keep your key private. If someone gets it, they can access your files. If you lose it, recovery may not be possible.</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default Key
