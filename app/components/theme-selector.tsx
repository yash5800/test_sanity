"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun, Zap } from "lucide-react";

import { Button } from "@/app/components/ui/button";

const THEMES = [
  {
    id: "light",
    label: "Light",
    description: "Bright and clean",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Easy on the eyes",
    icon: Moon,
  },
  {
    id: "pure-dark",
    label: "Pure Dark",
    description: "Real dark mode",
    icon: Zap,
  },
  {
    id: "system",
    label: "System",
    description: "Your device setting",
    icon: Monitor,
  },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme || "system";
  const isPureDark = currentTheme === "pure-dark";
  const currentThemeObj = THEMES.find((t) => t.id === currentTheme);
  const CurrentIcon = currentThemeObj?.icon || Monitor;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full border border-border/70 bg-background/80 shadow-sm backdrop-blur hover:bg-background/90 transition-all"
        aria-label="Theme selector"
      >
        <CurrentIcon className="h-4 w-4 transition-transform" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-border bg-background shadow-lg">
            <div className="p-2">
              <div className="px-3 py-2 text-center font-semibold text-sm">
                Theme
              </div>
              <div className="h-px bg-border my-1" />

              <div className="space-y-1 p-1">
                {THEMES.map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isSelected = currentTheme === themeOption.id;

                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => {
                        setTheme(themeOption.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all text-left ${
                        isSelected
                          ? isPureDark
                            ? "bg-white/10 border border-white/30 text-foreground font-medium"
                            : "bg-blue-600/20 border border-blue-500/30 text-foreground font-medium"
                          : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium leading-tight">
                          {themeOption.label}
                        </div>
                        <div className="text-xs opacity-70">
                          {themeOption.description}
                        </div>
                      </div>
                      {isSelected && (
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${isPureDark ? "bg-white" : "bg-blue-600"}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-border my-1" />
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                Theme saved to browser
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
