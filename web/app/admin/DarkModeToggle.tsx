"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: 80 }} />;

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2" aria-label="Toggle dark mode">
      <SunIcon
        className="cursor-pointer transition-colors"
        style={{
          width: 14, height: 14,
          color: isDark ? "var(--admin-text-dim)" : "#2A5230",
        }}
        onClick={() => setTheme("light")}
      />
      <Switch
        checked={isDark}
        onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <MoonIcon
        className="cursor-pointer transition-colors"
        style={{
          width: 14, height: 14,
          color: isDark ? "#7AAA7A" : "var(--admin-text-dim)",
        }}
        onClick={() => setTheme("dark")}
      />
    </div>
  );
}
