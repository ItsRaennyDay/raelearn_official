"use client";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { createPortal } from "react-dom";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sweeping, setSweeping] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleToggle = useCallback((nextDark: boolean) => {
    if (sweeping) return;
    setSweeping(true);
    // Change theme slightly into the sweep so the bg transitions with the flash
    setTimeout(() => setTheme(nextDark ? "dark" : "light"), 280);
    // Remove overlay after animation finishes
    setTimeout(() => setSweeping(false), 760);
  }, [sweeping, setTheme]);

  if (!mounted) return <div style={{ width: 72 }} />;

  const isDark = theme === "dark";

  return (
    <>
      <div className="flex items-center gap-2" role="group" aria-label="Toggle dark mode">
        <SunIcon
          onClick={() => !isDark && handleToggle(false)}
          style={{
            width: 14, height: 14, cursor: "pointer",
            color: isDark ? "var(--admin-text-dim)" : "#2A5230",
            transition: "color 0.3s",
          }}
        />
        <Switch
          checked={isDark}
          onCheckedChange={handleToggle}
          aria-label="Toggle dark mode"
        />
        <MoonIcon
          onClick={() => isDark && handleToggle(true)}
          style={{
            width: 14, height: 14, cursor: "pointer",
            color: isDark ? "var(--admin-text-muted)" : "var(--admin-text-dim)",
            transition: "color 0.3s",
          }}
        />
      </div>

      {/* Running-edge overlay — portal so it sits above everything */}
      {sweeping && typeof document !== "undefined" && createPortal(
        <div className="admin-theme-sweep" />,
        document.body
      )}
    </>
  );
}
