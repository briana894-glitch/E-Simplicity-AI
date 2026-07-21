import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { BlueprintContent } from "../blueprint-fns";
import { checkSubscription } from "../subscription";

export const Route = createFileRoute("/blueprint/$id")({
  component: BlueprintPage,
});

function BlueprintPage() {
  const navigate = useNavigate();
  const { id } = Route.useParams() as { id: string };
  const blueprintId = parseInt(id, 10);

  const [blueprint, setBlueprint] = useState<{
    id: number;
    briefId: number;
    title: string;
    status: string;
    content: BlueprintContent & { _isDemo?: boolean };
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("es_token");
    if (!token) {
      navigate({ to: "/login" });
      return;
    }
    loadBlueprint(token);
  }, [blueprintId]);

  // Subscription check
  useEffect(() => {
    const t = localStorage.getItem("es_token");
    if (!t) return;
    async function checkSub() {
      try {
        const result = await checkSubscription({ data: { token: t } });
        if (!result.valid && result.reason !== "no_token" && result.reason !== "invalid_token") {
          navigate({ to: "/pricing" });
        }
      } catch {
        // Allow access if check fails
      }
    }
    checkSub();
  }, [blueprintId, navigate]);

  async function loadBlueprint(token: string) {
    setLoading(true);
    setError("");
    try {
      // Dynamic import the server function
      const { getBlueprint } = await import("../blueprint-fns");
      const result = await getBlueprint({ data: { token, blueprintId } });
      setBlueprint(result as any);
    } catch (err: any) {
      setError(err.message || "Failed to load blueprint");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-500">Loading your blueprint…</p>
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-900">Couldn't load this blueprint</h1>
          <p className="mt-2 text-gray-500">{error || "Blueprint not found."}</p>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const content = blueprint.content;
  const isDemo = content._isDemo;

  return (
    <div className="min-h-dvh bg-gray-50 font-sans text-gray-900">
      {/* Top nav */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="E-Simplicity AI" className="h-8 w-auto" />
            <span className="text-sm font-semibold text-gray-600 hidden sm:inline">E-Simplicity AI</span>
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              🖨️ Print
            </button>
            <a
              href="/dashboard"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              ← Dashboard
            </a>
          </div>
        </div>
      </nav>

      {/* Demo banner */}
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 text-center">
            <p className="text-sm font-medium text-amber-800">
              ✨ <strong>Demo Blueprint</strong> — connect OpenAI for AI-powered blueprints. This is a sample generated from your brief.
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-4">
            📋 Business Blueprint
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {blueprint.title}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Generated {new Date(blueprint.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* 1. Executive Summary */}
        <SectionCard icon="📄" title="Executive Summary" defaultOpen>
          <div className="prose prose-gray max-w-none">
            {content.executiveSummary?.split("\n").map((p, i) =>
              p.trim() ? (
                <p key={i} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                  {p}
                </p>
              ) : null
            )}
          </div>
        </SectionCard>

        {/* 2. Launch Roadmap */}
        <SectionCard icon="🗺️" title="Business Launch Roadmap" subtitle="Your 90-day plan" defaultOpen>
          <div className="space-y-6">
            {(["phase1", "phase2", "phase3", "phase4"] as const).map((phaseKey, idx) => {
              const phase = content.launchRoadmap?.[phaseKey];
              if (!phase) return null;
              const colors = [
                "border-l-indigo-500 bg-indigo-50/50",
                "border-l-violet-500 bg-violet-50/50",
                "border-l-purple-500 bg-purple-50/50",
                "border-l-fuchsia-500 bg-fuchsia-50/50",
              ];
              return (
                <div
                  key={phaseKey}
                  className={`rounded-xl border border-gray-200 border-l-4 p-5 ${colors[idx]}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      Phase {idx + 1}: {phase.title}
                    </span>
                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {phase.days}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {phase.items?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-gray-300 text-xs font-bold text-gray-500">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 3. Customer Avatar */}
        <SectionCard icon="👤" title="Customer Avatar" subtitle="Your ideal customer profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBlock label="Demographics" value={content.customerAvatar?.demographics} />
            <InfoBlock label="Psychographics" value={content.customerAvatar?.psychographics} />
            <InfoBlock label="Pain Points & Challenges" value={content.customerAvatar?.painPoints} />
            <InfoBlock label="Buying Triggers" value={content.customerAvatar?.buyingTriggers} />
          </div>
          {content.customerAvatar?.platforms && (
            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Where They Spend Time
              </span>
              <p className="mt-1 text-sm text-gray-700">{content.customerAvatar.platforms}</p>
            </div>
          )}
        </SectionCard>

        {/* 4. Brand Messaging */}
        <SectionCard icon="🎨" title="Brand Messaging" subtitle="Your voice, UVP, and taglines">
          <div className="space-y-6">
            <HighlightBox label="Unique Value Proposition" icon="💎">
              {content.brandMessaging?.uvp}
            </HighlightBox>

            <HighlightBox label="Elevator Pitch (30 seconds)" icon="🎤">
              {content.brandMessaging?.elevatorPitch}
            </HighlightBox>

            {content.brandMessaging?.taglines && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tagline Options
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {content.brandMessaging.taglines.map((t: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-full bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 text-sm font-medium text-indigo-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {content.brandMessaging?.brandVoice && (
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoBlock label="Tone" value={content.brandMessaging.brandVoice.tone} />
                <InfoBlock label="Personality" value={content.brandMessaging.brandVoice.personality} />
                <div className="sm:col-span-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                        ✅ Do's
                      </span>
                      <ul className="mt-2 space-y-1">
                        {content.brandMessaging.brandVoice.dos?.map((d: string, i: number) => (
                          <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span> {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                        ❌ Don'ts
                      </span>
                      <ul className="mt-2 space-y-1">
                        {content.brandMessaging.brandVoice.donts?.map((d: string, i: number) => (
                          <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">✕</span> {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 5. Marketing Strategy */}
        <SectionCard icon="📣" title="Marketing Strategy" subtitle="Channels, content pillars, and 30-day calendar">
          <div className="space-y-6">
            {content.marketingStrategy?.channels && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recommended Channels
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {content.marketingStrategy.channels.map((ch: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-full bg-violet-50 border border-violet-100 px-3.5 py-1.5 text-sm font-medium text-violet-700"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {content.marketingStrategy?.contentPillars && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Content Pillars
                </span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {content.marketingStrategy.contentPillars.map((cp: any, i: number) => (
                    <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
                      <span className="text-sm font-semibold text-gray-900">{cp.title}</span>
                      <p className="mt-0.5 text-xs text-gray-500">{cp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.marketingStrategy?.leadMagnet && (
              <InfoBlock label="Lead Magnet Recommendation" value={content.marketingStrategy.leadMagnet} />
            )}

            {content.marketingStrategy?.calendar30Day && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  30-Day Content Calendar
                </span>
                <div className="mt-3 space-y-3">
                  {content.marketingStrategy.calendar30Day.map((week: any, wi: number) => (
                    <div key={wi} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <span className="text-sm font-semibold text-gray-700">
                          Week {week.week}: {week.focus}
                        </span>
                      </div>
                      <div className="p-3 space-y-2">
                        {week.posts?.map((post: any, pi: number) => (
                          <div key={pi} className="flex items-start gap-2 text-sm">
                            <span className="mt-0.5 shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                              {post.platform}
                            </span>
                            <span className="text-gray-700">{post.idea}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 6. Email Sequences */}
        <SectionCard icon="✉️" title="Email Sequences" subtitle="Welcome, nurture, and sales emails">
          <div className="space-y-8">
            {(["welcome", "nurture", "sales"] as const).map((seq) => {
              const emails = content.emailSequences?.[seq];
              if (!emails || emails.length === 0) return null;
              const labels = { welcome: "Welcome", nurture: "Nurture", sales: "Sales" };
              const colors = {
                welcome: "border-green-200 bg-green-50",
                nurture: "border-blue-200 bg-blue-50",
                sales: "border-orange-200 bg-orange-50",
              };
              const badges = {
                welcome: "bg-green-100 text-green-700",
                nurture: "bg-blue-100 text-blue-700",
                sales: "bg-orange-100 text-orange-700",
              };
              return (
                <div key={seq}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badges[seq]}`}>
                      {labels[seq]} ({emails.length} emails)
                    </span>
                  </div>
                  <div className="space-y-3">
                    {emails.map((email: any, i: number) => (
                      <div
                        key={i}
                        className={`rounded-xl border p-4 ${colors[seq]}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-gray-300 text-xs font-bold text-gray-500">
                            {i + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {email.subject}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 ml-8">{email.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 7. Sales Funnel */}
        <SectionCard icon="🔄" title="Sales Funnel Outline" subtitle="Your customer journey">
          <div className="space-y-4">
            {[
              { label: "Top of Funnel (Awareness)", key: "topOfFunnel", color: "border-t-blue-400" },
              { label: "Middle of Funnel (Consideration)", key: "middleOfFunnel", color: "border-t-violet-400" },
              { label: "Bottom of Funnel (Conversion)", key: "bottomOfFunnel", color: "border-t-green-400" },
            ].map((stage) => (
              <div
                key={stage.key}
                className={`rounded-xl border border-gray-200 border-t-4 ${stage.color} bg-white p-4`}
              >
                <span className="text-sm font-bold text-gray-900">{stage.label}</span>
                <p className="mt-1 text-sm text-gray-600">
                  {(content.salesFunnel as any)?.[stage.key]}
                </p>
              </div>
            ))}
          </div>

          {content.salesFunnel?.keyOffers && (
            <div className="mt-5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 p-5">
              <span className="text-sm font-bold text-indigo-800">💡 Key Conversion Offers</span>
              <ul className="mt-2 space-y-1.5">
                {content.salesFunnel.keyOffers.map((offer: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-indigo-700">
                    <span className="mt-0.5">✦</span>
                    {offer}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        {/* 8. Launch Checklist */}
        <SectionCard icon="✅" title="Launch Checklist" subtitle="15-20 actionable items to get you live">
          <div className="space-y-5">
            {content.launchChecklist?.map((group: any, gi: number) => (
              <div key={gi}>
                <span className="text-sm font-bold text-gray-800">{group.category}</span>
                <div className="mt-2 space-y-1.5">
                  {group.items?.map((item: string, ii: number) => (
                    <label
                      key={ii}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 9. Growth Milestones */}
        <SectionCard icon="📈" title="Growth Milestones" subtitle="Targets for your first 90 days">
          <div className="grid gap-4 sm:grid-cols-3">
            {(["day30", "day60", "day90"] as const).map((key, idx) => {
              const items = content.growthMilestones?.[key] as string[] | undefined;
              const labels = ["30-Day Targets", "60-Day Targets", "90-Day Targets"];
              const accents = ["indigo", "violet", "purple"];
              return (
                <div
                  key={key}
                  className={`rounded-xl border border-${accents[idx]}-200 bg-${accents[idx]}-50/50 p-4`}
                >
                  <span className={`text-xs font-bold text-${accents[idx]}-600 uppercase tracking-wider`}>
                    {labels[idx]}
                  </span>
                  <ul className="mt-2 space-y-1.5">
                    {items?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-0.5 text-indigo-400">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {content.growthMilestones?.keyMetrics && (
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <span className="text-sm font-bold text-gray-800">📊 Key Metrics to Track</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {content.growthMilestones.keyMetrics.map((metric: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-full bg-white border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Footer CTA */}
        <div className="mt-12 text-center pb-8">
          <p className="text-gray-500 text-sm mb-4">Ready for another Blueprint? Create a new Project Brief.</p>
          <a
            href="/brief/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-indigo-700 hover:to-violet-700 transition-all"
          >
            + New Project Brief
          </a>
        </div>
      </main>
    </div>
  );
}

// --- Reusable Components ---

function SectionCard({
  icon,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-5">{children}</div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <p className="mt-1 text-sm text-gray-700 leading-relaxed">{value}</p>
    </div>
  );
}

function HighlightBox({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 p-5">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm text-indigo-900 leading-relaxed">{children}</p>
    </div>
  );
}
