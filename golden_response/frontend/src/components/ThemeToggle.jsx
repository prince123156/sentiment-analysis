import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      className="btn btn-muted h-10 w-10 px-0"
      onClick={() => setDark((value) => !value)}
      title={dark ? "Use light mode" : "Use dark mode"}
      type="button"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
