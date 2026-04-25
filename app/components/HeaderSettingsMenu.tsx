"use client";

import { type ComponentType, useEffect, useMemo, useRef, useState } from "react";
import { Monitor, Moon, MousePointer2, Settings, Sun, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import { useCursor } from "@/app/components/cursor-provider";
import { Button } from "@/app/components/ui/button";

type CursorType = "gojo" | "luffy" | "system";

type ThemeOption = {
  id: "light" | "dark" | "pure-dark" | "system";
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const themeOptions: ThemeOption[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "pure-dark", label: "Pure Dark", icon: Zap },
  { id: "system", label: "System", icon: Monitor },
];

const cursorOptions: { id: CursorType; label: string }[] = [
  { id: "gojo", label: "Gojo" },
  { id: "luffy", label: "Luffy" },
  { id: "system", label: "System" },
];

const hideCodeStorageKey = (workspaceKey: string) => `sanityhub:hide-code-space:${workspaceKey}`;

const HeaderSettingsMenu = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { cursorType, setCursorType } = useCursor();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hideCodeSpace, setHideCodeSpace] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const workspaceKey = useMemo(() => {
    if (!pathname) return null;
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] !== "user" || !parts[1]) return null;
    return decodeURIComponent(parts[1]);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("touchstart", onOutsideClick);

    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("touchstart", onOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!workspaceKey) return;
    try {
      const raw = window.localStorage.getItem(hideCodeStorageKey(workspaceKey));
      setHideCodeSpace(raw === "1");
    } catch {
      setHideCodeSpace(false);
    }
  }, [workspaceKey, pathname]);

  const currentTheme = (theme ?? "system") as ThemeOption["id"];

  const onToggleHideCodeSpace = (nextValue: boolean) => {
    if (!workspaceKey) return;

    setHideCodeSpace(nextValue);
    try {
      window.localStorage.setItem(hideCodeStorageKey(workspaceKey), nextValue ? "1" : "0");
      window.dispatchEvent(new CustomEvent("sanityhub:hide-code-space-change", { detail: { workspaceKey, value: nextValue } }));
    } catch {
      // ignore localStorage errors in restricted mode
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full border border-border/70 bg-background/80 shadow-sm backdrop-blur hover:bg-background"
        aria-label="Open settings"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-[320px] rounded-2xl border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold">Settings</p>

          <div className="mt-3 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = mounted && currentTheme === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTheme(option.id)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/70 hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <MousePointer2 className="h-3.5 w-3.5" /> Cursor
              </p>
              <div className="grid grid-cols-3 gap-2">
                {cursorOptions.map((option) => {
                  const isActive = cursorType === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setCursorType(option.id)}
                      className={`rounded-xl border px-2 py-2 text-sm transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/70 hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {workspaceKey ? (
              <div className="rounded-xl border border-border/70 bg-card/60 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Hide Code Space</p>
                    <p className="text-xs text-muted-foreground">Default is off for this key.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center" aria-label="Hide code space toggle">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={hideCodeSpace}
                      onChange={(event) => onToggleHideCodeSpace(event.target.checked)}
                    />
                    <span className="h-7 w-12 rounded-full bg-muted transition-all duration-200 peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-emerald-500" />
                    <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HeaderSettingsMenu;
