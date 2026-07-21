import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAssetById, type AssetDetail } from "../assets-fns";
import { checkSubscription } from "../subscription";

export const Route = createFileRoute("/assets/$id")({
  component: AssetDetailPage,
});

function AssetDetailPage() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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

  // Fetch asset
  useEffect(() => {
    if (!token) return;
    async function fetchAsset() {
      try {
        const result = await getAssetById({
          data: {
            token,
            assetId: parseInt(id, 10),
          },
        });
        setAsset(result);
      } catch (err: any) {
        setError(err.message || "Asset not found");
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [token, id]);

  function handleLogout() {
    localStorage.removeItem("es_token");
    localStorage.removeItem("es_user");
    navigate({ to: "/" });
  }

  const categoryMap: Record<string, { label: string; emoji: string; color: string }> = {
    courses: { label: "Course", emoji: "🎓", color: "bg-amber-50 text-amber-700" },
    templates: { label: "Template", emoji: "📄", color: "bg-blue-50 text-blue-700" },
    guides: { label: "Guide", emoji: "📘", color: "bg-emerald-50 text-emerald-700" },
    prompts: { label: "AI Prompt", emoji: "🤖", color: "bg-purple-50 text-purple-700" },
  };

  const cat = asset ? (categoryMap[asset.category] || categoryMap.guides) : null;

  // Simple markdown-like rendering for the body
  function renderBody(body: string): string {
    return body
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-gray-900 mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-8 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700 before:content-[\'•\'] before:mr-2 before:text-gray-400">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-gray-700">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/^---$/gm, '<hr class="my-6 border-gray-200" />')
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-3">')
      .replace(/\n/g, '<br />');
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50 font-sans text-gray-900">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="E-Simplicity AI" className="h-8 w-auto" />
            <span className="hidden sm:inline font-semibold text-gray-900">E-Simplicity AI</span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/assets"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Library
            </a>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-900">Asset not found</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <a
              href="/assets"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
            >
              ← Back to Library
            </a>
          </div>
        ) : asset && cat ? (
          <>
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
              <a href="/assets" className="hover:text-gray-600 transition-colors">Assets Library</a>
              <span>/</span>
              <span className="text-gray-600">{cat.emoji} {cat.label}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate">{asset.title}</span>
            </nav>

            {/* Header card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm mb-8">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-3xl shadow-sm">
                  {asset.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}>
                      {cat.label}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{asset.title}</h1>
                  <p className="mt-2 text-gray-500 leading-relaxed">{asset.description}</p>
                </div>
                {/* Copy button for prompts */}
                {asset.category === "prompts" && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(asset.body);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 active:scale-[0.98]"
                  >
                    {copied ? (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy All Prompts
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Body content */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{
                  __html: `<p class="text-gray-700 leading-relaxed mb-3">${renderBody(asset.body)}</p>`,
                }}
              />
            </div>

            {/* Bottom nav */}
            <div className="mt-8 text-center">
              <a
                href="/assets"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Assets Library
              </a>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
