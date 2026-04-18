"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react";

const Footer = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer className="border-t border-border/60 bg-background/80 px-4 py-6 text-sm text-muted-foreground backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>SanityHub keeps uploads tidy, searchable, and easy to access.</p>
        <div className="flex items-center gap-4">
          {!isHome ? (
            <Link href="/" className="font-medium text-foreground transition-colors hover:text-primary">
              Back to home
            </Link>
          ) : null}
          <a
            href="https://github.com/yash5800"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
