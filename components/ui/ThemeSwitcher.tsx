"use client";

import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (!mounted) {
      // Return a placeholder during SSR to prevent hydration mismatch
      return <Sun className="h-5 w-5" aria-hidden="true" />;
    }

    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5" aria-hidden="true" />;
      case "dark":
        return <Moon className="h-5 w-5" aria-hidden="true" />;
      default:
        return <Monitor className="h-5 w-5" aria-hidden="true" />;
    }
  };

  const getAriaLabel = () => {
    if (!mounted) return "Toggle theme";

    switch (theme) {
      case "light":
        return "Current theme: light. Click to switch to dark theme";
      case "dark":
        return "Current theme: dark. Click to switch to system theme";
      default:
        return "Current theme: system. Click to switch to light theme";
    }
  };

  return (
    <Button
      isIconOnly
      variant="light"
      onPress={cycleTheme}
      aria-label={getAriaLabel()}
      className="text-default-600 hover:text-default-900"
    >
      {getIcon()}
    </Button>
  );
}
