import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAssets, type AssetSummary } from "../assets-fns";
import { checkSubscription } from "../subscription";

export const Route = createFileRoute("/assets")({
  component: AssetsPage,
});

function AssetsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("es_token") : null;

  // Auth check
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

  // Subscription check
  useEffect(() => {
    if (!token) return;
    async function checkSub() {
      try {
        const result = await checkSubscription({ data: { token } });
        if (!result.valid && result.reason !== "no_token" && result.reason !== "invalid_token") {
          navigate({ to: "/pricing" });
        }
      } catch {
        // Allow access if check fails
      }
    }
    checkSub();
  }, [token, navigate]);

  // Fetch assets
  useEffect(() => {
    if (!token) return;
    async function fetchAssets() {
      try {
        const result = await listAssets({
          data: {
            token,
            category: activeCategory !== "all" ? activeCategory : undefined,
          },
        });
        setAssets(result);
      } catch {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, [token, activeCategory]);

  function handleLogout() {
    localStorage.removeItem("es_token");
    localStorage.removeItem("es_user");
    navigate({ to: "/" });
  }

  // Filter by search query client-side (searching title + description)
  const filteredAssets = searchQuery.trim()
    ? assets.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : assets;

  const categories = [
    { key: "all", label: "All", emoji: "📚" },
    { key: "courses", label: "Courses", emoji: "🎓" },
    { key: "templates", label: "Templates", emoji: "📄" },
    { key: "guides", label: "Guides", emoji: "📘" },
    { key: "prompts", label: "AI Prompts", emoji: "🤖" },
  ];

  const categoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      courses: "Course",
      templates: "Template",
      guides: "Guide",
      prompts: "AI Prompt",
    };
    return map[cat] || cat;
  };

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Project Briefs", href: "/brief/new", icon: "📝" },
    { label: "Business Blueprints", href: "/dashboard", icon: "📋" },
    { label: "Assets Library", href: "/assets", icon: "📚", active: true },
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📚</span>
              <h1 className="text-2xl font-bold text-gray-900">Assets Library</h1>
            </div>
            <p className="text-gray-500 max-w-2xl">
              Courses, templates, guides, and AI prompts to help you launch and grow your business faster.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mb-6 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Category tabs */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : filteredAssets.length === 0 ? (
            /* Empty state */
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center shadow-sm">
              <div className="text-5xl mb-4">
                {searchQuery ? "🔍" : "📭"}
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {searchQuery ? "No matching assets" : "No assets in this category"}
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                {searchQuery
                  ? `No assets matching "${searchQuery}". Try a different search term or browse all categories.`
                  : "There are no assets in this category yet. Check back soon for new resources."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            /* Asset cards grid */
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map((asset) => (
                <a
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-2xl shadow-sm">
                      {asset.emoji}
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      asset.category === "courses"
                        ? "bg-amber-50 text-amber-700"
                        : asset.category === "templates"
                        ? "bg-blue-50 text-blue-700"
                        : asset.category === "guides"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-purple-50 text-purple-700"
                    }`}>
                      {categoryLabel(asset.category)}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors leading-snug">
                    {asset.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed flex-1">
                    {asset.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    {asset.category === "courses" ? "View Course" : asset.category === "templates" ? "View Template" : asset.category === "prompts" ? "View Prompts" : "Read Guide"}
                    <svg className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Asset count footer */}
          {!loading && filteredAssets.length > 0 && (
            <p className="mt-8 text-center text-sm text-gray-400">
              Showing {filteredAssets.length} of {assets.length} asset{assets.length !== 1 ? "s" : ""}
              {activeCategory !== "all" && ` in ${categories.find((c) => c.key === activeCategory)?.label}`}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
