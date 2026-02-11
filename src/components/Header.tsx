import { Activity, Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Leap<span className="text-indigo-600">Pulse</span>
          </span>
        </div>

        {/* Live Monitoring Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm text-gray-600">
            <Activity className="h-4 w-4 text-gray-400" />
            <span>Live Monitoring</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
