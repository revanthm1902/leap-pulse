import Header from "./components/Header";
import HeroMetric from "./components/HeroMetric";
import PriorityTriage from "./components/PriorityTriage";
import InsightsSidebar from "./components/InsightsSidebar";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero Metric Section */}
        <section className="mb-8">
          <HeroMetric />
        </section>

        {/* Main Content: Triage Feed + Insights Sidebar */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PriorityTriage />
          </div>
          <div className="lg:col-span-1">
            <InsightsSidebar />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © 2026 LeapPulse · Brand Intelligence Platform · Real-time Monitoring
      </footer>
    </div>
  );
}

export default App;
