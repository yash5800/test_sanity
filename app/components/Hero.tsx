import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import HeaderSettingsMenu from "@/app/components/HeaderSettingsMenu";

const Hero = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-3xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-sm font-bold text-white shadow-lg shadow-purple-500/40 group-hover:shadow-lg group-hover:shadow-purple-500/60 transition-all">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight sm:text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">SanityHub</span>
            <span className="text-xs text-muted-foreground">Secure file management</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Badge className="gap-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-foreground/80 border border-blue-500/30 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Private storage space</span>
            <span className="sm:hidden">Private</span>
          </Badge>
          <HeaderSettingsMenu />
        </div>
      </div>
    </header>
  );
}

export default Hero
