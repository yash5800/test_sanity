'use client'

import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

const Key = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [key, upkey] = useState("");
  const [isload, setload] = useState(false);

  const handleInsertKey = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedKey = key.trim();

      if (trimmedKey.length < 4) {
        setError("At least 4 characters required");
        return;
      }

      setError("");
      setload(true);

      try {
        router.push(`/user/${trimmedKey}`);
      } finally {
        setload(false);
      }
  };
  

  return (
    <Card className="w-full max-w-xl border-border/70 bg-card/90 shadow-2xl shadow-black/10 backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <KeyRound className="h-4 w-4" />
          Private access
        </div>
        <CardTitle className="text-3xl tracking-tight sm:text-4xl">Open your file space with a key.</CardTitle>
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
            className="h-12 rounded-xl bg-background/80 text-base"
          />
          {error ? (
            <p id="key-error" className="text-sm text-destructive">
              {error}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Use the same key you created for uploads.</p>
          )}
          <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold" disabled={isload}>
            {isload ? "Opening workspace..." : "Open workspace"}
            {!isload && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default Key
