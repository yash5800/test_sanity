"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CodeSpaceGuardProps = {
  workspaceKey: string;
  children: ReactNode;
};

const hideCodeStorageKey = (workspaceKey: string) => `sanityhub:hide-code-space:${workspaceKey}`;

const CodeSpaceGuard = ({ workspaceKey, children }: CodeSpaceGuardProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);

    const syncHidden = () => {
      try {
        const raw = window.localStorage.getItem(hideCodeStorageKey(workspaceKey));
        const nextHidden = raw === "1";
        setHidden(nextHidden);
        if (nextHidden) {
          router.replace(`/user/${workspaceKey}?space=storage`);
        }
      } catch {
        setHidden(false);
      }
    };

    const onHideCodeSpaceChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ workspaceKey?: string }>;
      if (customEvent.detail?.workspaceKey && customEvent.detail.workspaceKey !== workspaceKey) return;
      syncHidden();
    };

    syncHidden();
    window.addEventListener("sanityhub:hide-code-space-change", onHideCodeSpaceChange);

    return () => {
      window.removeEventListener("sanityhub:hide-code-space-change", onHideCodeSpaceChange);
    };
  }, [workspaceKey, router]);

  if (!mounted || hidden) {
    return null;
  }

  return <>{children}</>;
};

export default CodeSpaceGuard;
