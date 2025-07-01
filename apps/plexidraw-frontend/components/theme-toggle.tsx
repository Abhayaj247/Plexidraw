"use client"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-2 justify-center">
        <Button variant="outline" size="icon" aria-label="Light theme" disabled />
        <Button variant="outline" size="icon" aria-label="Dark theme" disabled />
        <Button variant="outline" size="icon" aria-label="System theme" disabled />
      </div>
    );
  }

  return (
    <div className="flex gap-2 justify-center">
      <Button
        variant={theme === "light" ? "default" : "outline"}
        size="icon"
        aria-label="Light theme"
        onClick={() => setTheme("light")}
        className="cursor-pointer"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        size="icon"
        aria-label="Dark theme"
        onClick={() => setTheme("dark")}
        className="cursor-pointer"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "system" ? "default" : "outline"}
        size="icon"
        aria-label="System theme"
        onClick={() => setTheme("system")}
        className="cursor-pointer"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}
