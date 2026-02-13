import { Activity, Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300"
      style={{
        borderBottom: "1px solid var(--border-header)",
        background: "var(--bg-header)",
      }}
    >
      <div className="mx-auto flex max-w-350 items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/30">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
            <div
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 bg-emerald-400"
              style={{ borderColor: "var(--dot-border)" }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight sm:text-xl" style={{ color: "var(--text-heading)" }}>
              Leap<span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Pulse</span>
            </span>
            <span className="hidden text-[10px] font-medium tracking-wider uppercase sm:block" style={{ color: "var(--text-muted)" }}>
              Brand Intelligence
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              borderColor: "var(--border-glass)",
              background: "var(--overlay)",
            }}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500 transition-transform duration-300" />
            )}
          </button>

          {/* Live badge */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 sm:px-4 sm:py-2">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden text-xs font-medium text-emerald-400 sm:inline">
              Live Monitoring
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
