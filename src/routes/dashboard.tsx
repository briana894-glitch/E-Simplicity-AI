import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listBlueprints } from "../blueprint-fns";
import { checkSubscription } from "../subscription";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  validateSearch: (search: Record<string, unknown>) => ({
    brief_submitted: search.brief_submitted as string | undefined,
  }),
});

interface UserData {
  id: number;
  name: string;
  email: string;
}

interface BlueprintSummary {
  id: number;
  briefId: number;
  title: string;
  status: string;
  createdAt: string;
}

interface SubInfo {
  valid: boolean;
  status?: string;
  trialEndsAt?: string | null;
  daysRemaining?: number | null;
  reason?: string;
}

function DashboardPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/dashboard" }) as { brief_submitted?: string };
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [blueprints, setBlueprints] = useState<BlueprintSummary[]>([]);
  const [blueprintsLoading, setBlueprintsLoading] = useState(true);
  const [subInfo, setSubInfo] = useState<SubInfo | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("es_token") : null;

  useEffect(() => {
    const userStr = localStorage.getItem("es_user");

    if (!token || !userStr) {
      navigate({ to: "/login" });
      return;
    }

    try {
      setUser(JSON.parse(userStr));
    } catch {
      navigate({ to: "/login" });
    }
  }, [navigate, token]);

  // Check subscription status
  useEffect(() => {
    if (!token) return;
    async function checkSub() {
      try {
        const result = await checkSubscription({ data: { token } });
        setSubInfo(result as SubInfo);
        if (!result.valid && result.reason !== "no_token" && result.reason !== "invalid_token") {
          navigate({ to: "/pricing" });
        }
      } catch {
        setSubInfo({ valid: true, status: "trialing", daysRemaining: 7 });
      } finally {
        setSubLoading(false);
      }
    }
    checkSub();
  }, [token, navigate]);

  // Fetch blueprints
  useEffect(() => {
    if (!token) return;
    async function fetchBlueprints() {
      try {
        const result = await listBlueprints({ data: { token } });
        setBlueprints(result);
      } catch {
        // Silently fail — blueprints will just be empty
      } finally {
        setBlueprintsLoading(false);
      }
    }
    fetchBlueprints();
  }, [token]);

  useEffect(() => {
    if (search.brief_submitted === "1") {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [search.brief_submitted]);

  function handleLogout() {
    localStorage.removeItem("es_token");
    localStorage.removeItem("es_user");
    navigate({ to: "/" });
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "Z");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function statusBadge(status: string) {
    if (status === "complete") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Complete
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
        Generating…
      </span>
    );
  }

  if (!user || subLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Determine subscription banner content
  const isActive = subInfo?.status === "active";
  const isTrialing = subInfo?.status === "trialing";
  const isExpired = subInfo?.reason === "trial_expired" || subInfo?.reason === "expired";
  const daysRemaining = subInfo?.daysRemaining ?? null;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "📊", active: true },
    { label: "Project Briefs", href: "/brief/new", icon: "📝" },
    { label: "Business Blueprints", href: "/dashboard", icon: "📋" },
    { label: "Assets Library", href: "/assets", icon: "📚" },
  ];

  return (
    <div className="min-h-dvh bg-gray-50 font-sans text-gray-900">
      {/* Mobile nav */}
      <div className="border-b border-gray-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="E-Simplicity AI" className="h-8 w-auto" />
            <span className="font-semibold text-gray-900">E-Simplicity AI</span>
          </a>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:min-h-dvh">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
            <img src="/logo.png" alt="E-Simplicity AI" className="h-8 w-auto" />
            <span className="font-semibold tracking-tight text-gray-900">E-Simplicity AI</span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="border-t border-gray-100 px-3 py-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <span className="text-lg">🚪</span>
              Sign out
            </button>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="E-Simplicity AI" className="h-8 w-auto" />
                  <span className="font-semibold tracking-tight text-gray-900">E-Simplicity AI</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 px-3 py-4">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <span className="text-lg">🚪</span>
                  Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 px-6 py-8 lg:px-10 lg:py-12">
          {/* Top bar — desktop */}
          <div className="hidden lg:flex lg:items-center lg:justify-between mb-10">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.name}!
              </h1>
              <p className="mt-1 text-gray-500">
                Your business launch dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/brief/new"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
              >
                + New Project Brief
              </a>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Active subscriber banner */}
          {isActive && (
            <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-5 py-4 flex items-center gap-3 shadow-sm">
              <span className="text-2xl">✨</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">
                  Active subscriber
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  You have full access to all features. Thanks for being a member!
                </p>
              </div>
            </div>
          )}

          {/* Trial banner */}
          {!isActive && isTrialing && daysRemaining !== null && daysRemaining > 0 && (
            <div className="mb-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 px-5 py-4 flex items-center gap-3 shadow-sm">
              <span className="text-2xl">✨</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-800">
                  Free trial — {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
                </p>
                <p className="text-xs text-indigo-600 mt-0.5">
                  Enjoy full access to everything. No credit card required.
                </p>
              </div>
              <a
                href="/pricing"
                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-all"
              >
                See Plans
              </a>
            </div>
          )}

          {/* Expired banner */}
          {!isActive && isExpired && (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-300 px-5 py-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800">
                    Your free trial has ended
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Subscribe to continue accessing your Business Blueprints,
                    Assets Library, and all platform features.
                  </p>
                  <a
                    href="/pricing"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
                  >
                    Subscribe Now →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Success toast — only show for brief completion redirects */}
          {showSuccess && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="text-2xl">🎉</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">Your Business Blueprint is ready!</p>
                <p className="text-sm text-green-600">Check it out below in your Business Blueprints section.</p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-green-400 hover:text-green-600 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Welcome card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Welcome, {user.name}! 👋
            </h2>
            <p className="mt-2 text-gray-500 leading-relaxed max-w-2xl">
              Ready to turn your idea into a business? Start a Project Brief below and
              we'll generate a personalised Business Blueprint just for you. It takes
              about 10 minutes — and you can save your progress anytime.
            </p>
            <a
              href="/brief/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
            >
              Start Your Project Brief →
            </a>
          </div>

          {/* Quick-start cards */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300 cursor-pointer">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-2xl shadow-sm">
                📝
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Project Briefs</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Complete a guided questionnaire to define your business idea
              </p>
              <a
                href="/brief/new"
                className="mt-4 inline-block text-sm font-medium text-indigo-600 group-hover:text-indigo-700"
              >
                Start a Brief →
              </a>
            </div>

            <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-2xl shadow-sm">
                📋
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Business Blueprints</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                View AI-generated launch strategies tailored to you
              </p>
              {blueprints.length > 0 ? (
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600">
                  {blueprints.length} blueprint{blueprints.length !== 1 ? "s" : ""} generated →
                </span>
              ) : (
                <span className="mt-4 inline-block text-sm font-medium text-gray-400">
                  Complete a brief to generate
                </span>
              )}
            </div>

            <a href="/assets" className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300 cursor-pointer block">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-2xl shadow-sm">
                📚
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Assets Library</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Browse templates, guides, courses, and AI prompts to launch faster
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-purple-600 group-hover:text-purple-700">
                Explore Library →
              </span>
            </a>
          </div>

          {/* Blueprints section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Business Blueprints</h2>
                <p className="mt-1 text-sm text-gray-500">
                  AI-generated launch strategies from your Project Briefs
                </p>
              </div>
            </div>

            {blueprintsLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                <p className="mt-4 text-sm text-gray-500">Loading your blueprints…</p>
              </div>
            ) : blueprints.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-bold text-gray-900">No blueprints yet</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                  Complete a Project Brief and we'll generate a personalised Business Blueprint for you.
                </p>
                <a
                  href="/brief/new"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
                >
                  Create Your First Brief →
                </a>
              </div>
            ) : (
              <div className="grid gap-3">
                {blueprints.map((bp) => (
                  <a
                    key={bp.id}
                    href={`/blueprint/${bp.id}`}
                    className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-lg shadow-sm">
                        📋
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                          {bp.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-gray-400">
                          Created {formatDate(bp.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {statusBadge(bp.status)}
                      <svg
                        className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
