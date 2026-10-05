import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="text-cocoa-600 hover:text-caramel-600 transition-colors"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
