import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { ThemeToggle } from "@/app/components/theme-toggle";

const Hero = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-primary via-primary to-chart-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight sm:text-lg">SanityHub</span>
            <span className="text-xs text-muted-foreground">Material surfaces, private storage</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge className="hidden gap-1 rounded-full bg-secondary/90 text-secondary-foreground sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Private workspace
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Hero
