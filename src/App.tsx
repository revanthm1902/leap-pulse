import { Database, TestTubeDiagonal, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import Header from "./components/Header";
import HeroMetric from "./components/HeroMetric";
import PriorityTriage from "./components/PriorityTriage";
import InsightsSidebar from "./components/InsightsSidebar";
import { useRealtimeData } from "./hooks/useRealtimeData";

function App() {
  const {
    mentions,
    sentimentBreakdown,
    platformBreakdown,
    trendingTopics,
    metrics,
    weeklyTrend,
    dataSource,
    isLoading,
    error,
    lastUpdated,
    toggleDataSource,
  } = useRealtimeData();

  return (
    <div className="relative min-h-screen">
      {/* Subtle background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-125 w-125 rounded-full bg-indigo-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-100 w-100 rounded-full bg-violet-100/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header
          alertCount={mentions.filter((m) => m.priority === "CRITICAL ALERT" || m.priority === "MARKETING GOLD").length}
        />

        <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {/* Data Source Toggle */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDataSource}
                className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur transition-all hover:shadow-md ${
                  dataSource === "live"
                    ? "border-emerald-200 bg-emerald-50/80"
                    : "border-violet-200 bg-violet-50/80"
                }`}
              >
                {dataSource === "live" ? (
                  <>
                    <Database className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-800">Live Data</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </>
                ) : (
                  <>
                    <TestTubeDiagonal className="h-3.5 w-3.5 text-violet-600" />
                    <span className="text-violet-800">Mock Data</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  </>
                )}
              </button>
              <span className="text-[10px] font-medium text-gray-400">
                Click to switch
              </span>
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              )}
            </div>
            <div className="flex items-center gap-3">
              {error && (
                <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[11px] text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {error.slice(0, 60)}
                </div>
              )}
              {lastUpdated && dataSource === "live" && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <RefreshCw className="h-3 w-3" />
                  Updated {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Hero Metric Section */}
          <section className="mb-6 sm:mb-8">
            <HeroMetric
              netSentimentScore={metrics.netSentiment}
              sentimentChange={metrics.sentimentChange}
              weeklyTrend={weeklyTrend}
              totalMentions={metrics.totalMentions}
              avgEngagement={metrics.avgEngagement}
            />
          </section>

          {/* Main Content: Triage Feed + Insights Sidebar */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-5 xl:grid-cols-3">
            <div className="lg:col-span-3 xl:col-span-2">
              <PriorityTriage mentions={mentions} />
            </div>
            <div className="lg:col-span-2 xl:col-span-1">
              <InsightsSidebar
                sentimentBreakdown={sentimentBreakdown}
                platformBreakdown={platformBreakdown}
                trendingTopics={trendingTopics}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 border-t border-gray-100/60 py-6">
          <div className="mx-auto max-w-350 flex flex-col items-center gap-2 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
            <span className="text-[11px] font-medium text-gray-400">
              &copy; {new Date().getFullYear()} LeapPulse
            </span>
            <span className="text-[11px] text-gray-300">
              Brand Intelligence Platform &middot; Real-time Monitoring
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
