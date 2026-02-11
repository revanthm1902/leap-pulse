import { Activity, Zap, Bell } from "lucide-react";

interface HeaderProps {
  alertCount?: number;
}

export default function Header({ alertCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-350 items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/25">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
            <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
              Leap<span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Pulse</span>
            </span>
            <span className="hidden text-[10px] font-medium tracking-wider text-gray-400 uppercase sm:block">
              Brand Intelligence
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live badge */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 sm:px-4 sm:py-2">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden text-xs font-medium text-emerald-700 sm:inline">
              Live Monitoring
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </div>

          {/* Notification bell — shows critical alerts + marketing gold count */}
          <div className="relative rounded-xl border border-gray-100 bg-white/80 p-2.5 text-gray-400 transition-all hover:border-indigo-100 hover:text-indigo-600 hover:shadow-sm">
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
