"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Binary, HardDrive } from "lucide-react";

type SpaceSwitcherProps = {
  workspaceKey: string;
  currentSpace: "storage" | "code";
};

const getStorageKey = (workspaceKey: string) => `sanityhub:hide-code-space:${workspaceKey}`;

const SpaceSwitcher = ({ workspaceKey, currentSpace }: SpaceSwitcherProps) => {
  const router = useRouter();
  const [hideCodeSpace, setHideCodeSpace] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const syncHideState = () => {
      try {
        const raw = window.localStorage.getItem(getStorageKey(workspaceKey));
        setHideCodeSpace(raw === "1");
      } catch {
        setHideCodeSpace(false);
      }
    };

    const onHideCodeSpaceChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ workspaceKey?: string }>;
      if (customEvent.detail?.workspaceKey && customEvent.detail.workspaceKey !== workspaceKey) return;
      syncHideState();
    };

    syncHideState();
    window.addEventListener("sanityhub:hide-code-space-change", onHideCodeSpaceChange);

    return () => {
      window.removeEventListener("sanityhub:hide-code-space-change", onHideCodeSpaceChange);
    };
  }, [workspaceKey]);

  const storageHref = useMemo(() => `/user/${workspaceKey}?space=storage`, [workspaceKey]);
  const codeHref = useMemo(() => `/user/${workspaceKey}?space=code`, [workspaceKey]);

  useEffect(() => {
    if (!mounted) return;
    if (hideCodeSpace && currentSpace === "code") {
      router.replace(storageHref);
    }
  }, [currentSpace, hideCodeSpace, mounted, router, storageHref]);

  return (
    <div className="rounded-[1.2rem] border border-border/70 bg-card/80 p-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={storageHref}
          className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all ${
            currentSpace === "storage"
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
              : "border border-border/70 bg-background hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <HardDrive className="h-4 w-4" />
          Storage Space
        </Link>

        {!mounted || !hideCodeSpace ? (
          <Link
            href={codeHref}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all ${
              currentSpace === "code"
                ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                : "border border-border/70 bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Binary className="h-4 w-4" />
            Code Space
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default SpaceSwitcher;
