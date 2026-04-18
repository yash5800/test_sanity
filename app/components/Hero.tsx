import Link from "next/link";

import { Badge } from "@/app/components/ui/badge";
import { ThemeToggle } from "@/app/components/theme-toggle";

const Hero = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20">
            SH
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight sm:text-lg">SanityHub</span>
            <span className="text-xs text-muted-foreground">Fast file storage, clean access</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge className="hidden rounded-full border-border/70 bg-secondary text-secondary-foreground sm:inline-flex">Private workspace</Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Hero
