"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

export const AVAILABLE_THEMES = [
  { id: "light", label: "Light", icon: "☀️" },
  { id: "dark", label: "Dark", icon: "🌙" },
  { id: "pure-dark", label: "Pure Dark", icon: "⚫" },
  { id: "system", label: "System", icon: "🖥️" },
] as const;

export type ThemeType = typeof AVAILABLE_THEMES[number]["id"];

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}