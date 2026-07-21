import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { startOrResumeBrief, saveBriefStep, submitBrief } from "../brief-fns";
import { checkSubscription } from "../subscription";

export const Route = createFileRoute("/brief/new")({
  component: BriefNewPage,
});

// --- Types ---

interface BriefData {
  id: number;
  title: string;
  status: string;
  answers: Record<string, unknown>;
}

type BriefAnswers = {
  // Step 1
  businessIdea?: string;
  problemSolved?: string;
  whyNow?: string;
  // Step 2
  offeringType?: string;
  offeringDescription?: string;
  deliveryMethod?: string;
  // Step 3
  idealCustomer?: string;
  customerPlatforms?: string[];
  customerChallenge?: string;
  // Step 4
  businessName?: string;
  brandPersonality?: string[];
  differentiation?: string;
  customerFeeling?: string;
  // Step 5
  primaryGoal?: string;
  revenueTarget?: string;
  weeklyTime?: string;
  biggestFear?: string;
};

const STEP_LABELS = [
  "Your Idea",
  "Your Offer",
  "Your Audience",
  "Brand & Voice",
  "Goals & Numbers",
  "Review",
] as const;

const TOTAL_STEPS = 6;

// --- Constants for selectors ---

const PLATFORM_OPTIONS = [
  "Instagram", "TikTok", "LinkedIn", "YouTube", "Facebook",
  "Twitter/X", "Reddit", "Pinterest", "Blogs", "Email", "Other",
];

const PERSONALITY_OPTIONS = [
  "Professional", "Playful", "Bold", "Warm", "Minimal",
  "Luxurious", "Friendly", "Authoritative", "Inspiring",
  "Quirky", "Trustworthy", "Innovative", "Empathetic",
  "Direct", "Educational",
];

const OFFERING_TYPES = [
  { value: "digital", label: "Digital products", emoji: "💻" },
  { value: "physical", label: "Physical products", emoji: "📦" },
  { value: "services", label: "Services / Coaching / Consulting", emoji: "🤝" },
  { value: "content", label: "Content / Media", emoji: "🎬" },
  { value: "saas", label: "Software / SaaS", emoji: "🖥️" },
  { value: "other", label: "Other", emoji: "✨" },
];

const GOAL_OPTIONS = [
  { value: "launch", label: "Launch my business" },
  { value: "customers", label: "Get first paying customers" },
  { value: "audience", label: "Grow my audience" },
  { value: "revenue", label: "Generate consistent revenue" },
  { value: "scale", label: "Scale an existing business" },
  { value: "other", label: "Other" },
];

const REVENUE_OPTIONS = [
  { value: "0-500", label: "$0 – $500 (side hustle)" },
  { value: "500-2000", label: "$500 – $2,000" },
  { value: "2000-5000", label: "$2,000 – $5,000" },
  { value: "5000-10000", label: "$5,000 – $10,000" },
  { value: "10000+", label: "$10,000+" },
];

const TIME_OPTIONS = [
  { value: "lt5", label: "Less than 5 hours" },
  { value: "5-10", label: "5–10 hours" },
  { value: "10-20", label: "10–20 hours" },
  { value: "20-40", label: "20–40 hours" },
  { value: "fulltime", label: "Full-time" },
];

function BriefNewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [answers, setAnswers] = useState<BriefAnswers>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState<"" | "generating" | "complete" | "error">("");
  const [generatedBlueprintId, setGeneratedBlueprintId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [justResumed, setJustResumed] = useState(false);
  const initialized = useRef(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("es_token") : null;

  // Auth check
  useEffect(() => {
    if (!token) {
      navigate({ to: "/login" });
    }
  }, [token, navigate]);

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
        // Allow access if check fails (graceful degradation)
      }
    }
    checkSub();
  }, [token, navigate]);

  // Load or create brief
  useEffect(() => {
    if (!token || initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        const result = await startOrResumeBrief({ data: { token } });
        setBrief(result.brief);
        setAnswers(result.brief.answers as BriefAnswers);
        if (result.isResumed) {
          setJustResumed(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [token]);

  // Auto-save when answers change (debounced)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();
  const saveAnswers = useCallback(
    async (newAnswers: BriefAnswers, briefId: number) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        setSaving(true);
        try {
          // Derive title from business name or idea
          const title = (newAnswers.businessName || newAnswers.businessIdea || "Untitled Brief").slice(0, 80);
          await saveBriefStep({
            data: {
              token: token!,
              briefId,
              answers: newAnswers,
              title,
            },
          });
        } catch {
          // Silently fail — data is in state
        } finally {
          setSaving(false);
        }
      }, 400);
    },
    [token]
  );

  function updateAnswers(partial: BriefAnswers) {
    const merged = { ...answers, ...partial };
    setAnswers(merged);
    if (brief) {
      saveAnswers(merged, brief.id);
    }
  }

  function nextStep() {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prevStep() {
    if (step > 0) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep(s: number) {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return !!answers.businessIdea?.trim();
      case 1:
        return !!answers.offeringType;
      case 2:
        return true; // all optional
      case 3:
        return true; // all optional
      case 4:
        return true; // all optional
      case 5:
        return true; // review step
      default:
        return true;
    }
  }

  async function handleSubmit() {
    if (!brief) return;
    setSubmitting(true);
    setError("");
    try {
      await submitBrief({ data: { token: token!, briefId: brief.id } });
      setSubmitting(false);
      setGeneratingStatus("generating");

      // Dynamically import blueprint generator
      const { generateBlueprint } = await import("../blueprint-fns");
      const result = await generateBlueprint({ data: { token: token!, briefId: brief.id } });

      if (result.status === "complete") {
        setGeneratingStatus("complete");
        setGeneratedBlueprintId(result.blueprintId);
        // Short delay so user sees completion, then redirect
        setTimeout(() => {
          navigate({ to: `/blueprint/${result.blueprintId}` } as any);
        }, 800);
      } else {
        // Still generating — start polling
        pollGeneration(result.blueprintId);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
      setGeneratingStatus("error");
    }
  }

  async function pollGeneration(blueprintId: number) {
    const { pollBlueprintStatus } = await import("../blueprint-fns");
    const maxPolls = 30;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const result = await pollBlueprintStatus({ data: { token: token!, blueprintId } });
        if (result.status === "complete") {
          clearInterval(interval);
          setGeneratingStatus("complete");
          setGeneratedBlueprintId(blueprintId);
          setTimeout(() => {
            navigate({ to: `/blueprint/${blueprintId}` } as any);
          }, 500);
        } else if (result.status === "error" || attempts >= maxPolls) {
          clearInterval(interval);
          setGeneratingStatus("error");
          setError("Blueprint generation took too long or failed. Please try again.");
        }
      } catch {
        if (attempts >= maxPolls) {
          clearInterval(interval);
          setGeneratingStatus("error");
          setError("Could not check blueprint status. Please refresh and try again.");
        }
      }
    }, 2000);
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-500">Preparing your workspace…</p>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-gray-500">{error || "We couldn't set up your Project Brief."}</p>
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

  return (
    <div className="min-h-dvh bg-gray-50 font-sans text-gray-900">
      {/* Mini nav */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="E-Simplicity AI" className="h-8 w-auto" />
            <span className="text-sm font-semibold text-gray-600 hidden sm:inline">E-Simplicity AI</span>
          </a>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-indigo-500 animate-pulse">Saving…</span>
            )}
            <span className="text-xs font-medium text-gray-400">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
          </div>
        </div>
      </nav>

      {/* Resume toast */}
      {justResumed && (
        <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-700 flex items-center gap-2">
            <span>👋</span>
            <span>Welcome back! We've restored your progress — pick up right where you left off.</span>
            <button
              onClick={() => setJustResumed(false)}
              className="ml-auto text-indigo-400 hover:text-indigo-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => i <= step ? goToStep(i) : undefined}
              className={`flex-1 text-center transition-all ${
                i <= step ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < step
                    ? "bg-indigo-600"
                    : i === step
                    ? "bg-indigo-500"
                    : "bg-gray-200"
                }`}
              />
              <span
                className={`mt-1.5 hidden sm:block text-[10px] font-medium transition-colors ${
                  i <= step ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
        {/* Mobile step label */}
        <p className="mt-2 text-center text-xs font-medium text-indigo-600 sm:hidden">
          {STEP_LABELS[step]}
        </p>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* --- Step 0: Your Business Idea --- */}
        {step === 0 && (
          <StepCard
            emoji="💡"
            title="Let's start with your idea"
            subtitle="There are no wrong answers here — just tell us what you're thinking."
          >
            <QuestionBlock>
              <Label required>What's your business idea?</Label>
              <Hint>Describe what you want to build or sell — don't worry about being perfect.</Hint>
              <TextArea
                value={answers.businessIdea || ""}
                onChange={(v) => updateAnswers({ businessIdea: v })}
                placeholder="I want to create a platform that connects freelance designers with startups who need branding help…"
                rows={3}
              />
              {!answers.businessIdea?.trim() && (
                <p className="mt-1 text-xs text-gray-400">This one's required — but keep it simple!</p>
              )}
            </QuestionBlock>

            <QuestionBlock>
              <Label>What problem does it solve?</Label>
              <Hint>Who struggles with this, and how does your idea help?</Hint>
              <TextArea
                value={answers.problemSolved || ""}
                onChange={(v) => updateAnswers({ problemSolved: v })}
                placeholder="Startups struggle to find affordable, quality design. My platform vets designers and makes the process seamless…"
                rows={3}
              />
            </QuestionBlock>

            <QuestionBlock>
              <Label optional>Why now?</Label>
              <Hint>Is there a trend, gap, or personal experience driving this?</Hint>
              <TextArea
                value={answers.whyNow || ""}
                onChange={(v) => updateAnswers({ whyNow: v })}
                placeholder="The freelance economy is booming and AI is making it easier to match talent with need…"
                rows={2}
              />
            </QuestionBlock>
          </StepCard>
        )}

        {/* --- Step 1: Products or Services --- */}
        {step === 1 && (
          <StepCard
            emoji="🛍️"
            title="What will you offer?"
            subtitle="Let's define what you'll actually sell or deliver."
          >
            <QuestionBlock>
              <Label required>What will you offer?</Label>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {OFFERING_TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswers({ offeringType: opt.value })}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                      answers.offeringType === opt.value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </QuestionBlock>

            <QuestionBlock>
              <Label>Describe your offering</Label>
              <Hint>
                {answers.offeringType === "digital"
                  ? "What digital products will you create? E-books, templates, courses, software…"
                  : answers.offeringType === "physical"
                  ? "What physical products will you sell? Describe them briefly."
                  : answers.offeringType === "services"
                  ? "What services will you provide? Coaching, consulting, design, development…"
                  : "Tell us more about what you'll offer — the more detail, the better your Blueprint."}
              </Hint>
              <TextArea
                value={answers.offeringDescription || ""}
                onChange={(v) => updateAnswers({ offeringDescription: v })}
                placeholder="I'll offer a subscription-based platform where startups can browse designer portfolios, post projects, and hire directly…"
                rows={3}
              />
            </QuestionBlock>

            <QuestionBlock>
              <Label optional>How will you deliver it?</Label>
              <Hint>Online courses, one-on-one calls, downloadable files, shipped products, etc.</Hint>
              <TextArea
                value={answers.deliveryMethod || ""}
                onChange={(v) => updateAnswers({ deliveryMethod: v })}
                placeholder="Everything happens through the platform — messaging, file sharing, payments, and project management."
                rows={2}
              />
            </QuestionBlock>
          </StepCard>
        )}

        {/* --- Step 2: Your Audience --- */}
        {step === 2 && (
          <StepCard
            emoji="👥"
            title="Who are you building for?"
            subtitle="The better you know your audience, the clearer your path will be."
          >
            <QuestionBlock>
              <Label>Who is your ideal customer?</Label>
              <Hint>Think about their age, job, interests, struggles. Be as specific as you can.</Hint>
              <TextArea
                value={answers.idealCustomer || ""}
                onChange={(v) => updateAnswers({ idealCustomer: v })}
                placeholder="Early-stage startup founders, aged 25-40, who need branding but can't afford a big agency. They're tech-savvy, time-poor, and want quality work fast."
                rows={3}
              />
            </QuestionBlock>

            <QuestionBlock>
              <Label>Where do they spend time online?</Label>
              <Hint>Pick all that apply — this helps us shape your marketing strategy.</Hint>
              <div className="mt-3 flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((platform) => {
                  const selected = (answers.customerPlatforms || []).includes(platform);
                  return (
                    <button
                      key={platform}
                      onClick={() => {
                        const current = answers.customerPlatforms || [];
                        const next = selected
                          ? current.filter((p) => p !== platform)
                          : [...current, platform];
                        updateAnswers({ customerPlatforms: next });
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </QuestionBlock>

            <QuestionBlock>
              <Label>What's the biggest challenge your customers face?</Label>
              <Hint>What keeps them up at night? What have they tried that hasn't worked?</Hint>
              <TextArea
                value={answers.customerChallenge || ""}
                onChange={(v) => updateAnswers({ customerChallenge: v })}
                placeholder="They've tried hiring on freelance marketplaces but got burned by poor quality and missed deadlines. They want reliability without the agency price tag."
                rows={3}
              />
            </QuestionBlock>
          </StepCard>
        )}

        {/* --- Step 3: Brand & Voice --- */}
        {step === 3 && (
          <StepCard
            emoji="🎨"
            title="Define your brand personality"
            subtitle="This shapes how your business looks, sounds, and feels to customers."
          >
            <QuestionBlock>
              <Label>What's your business name?</Label>
              <Hint>If you don't have one yet, that's okay — you can always change it later.</Hint>
              <input
                type="text"
                value={answers.businessName || ""}
                onChange={(e) => updateAnswers({ businessName: e.target.value })}
                placeholder="DesignMatch"
                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </QuestionBlock>

            <QuestionBlock>
              <Label>Pick 3-5 words that describe your brand personality</Label>
              <Hint>These words guide your brand voice, visuals, and messaging.</Hint>
              <div className="mt-3 flex flex-wrap gap-2">
                {PERSONALITY_OPTIONS.map((trait) => {
                  const selected = (answers.brandPersonality || []).includes(trait);
                  const atLimit = (answers.brandPersonality || []).length >= 5 && !selected;
                  return (
                    <button
                      key={trait}
                      onClick={() => {
                        const current = answers.brandPersonality || [];
                        const next = selected
                          ? current.filter((t) => t !== trait)
                          : atLimit
                          ? current
                          : [...current, trait];
                        updateAnswers({ brandPersonality: next });
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                          : atLimit
                          ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      disabled={atLimit}
                    >
                      {trait}
                      {selected && (
                        <span className="ml-1.5 text-xs text-indigo-400">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {(answers.brandPersonality || []).length === 0
                  ? "Pick at least 3 for the best results"
                  : `Selected ${(answers.brandPersonality || []).length} of 5`}
              </p>
            </QuestionBlock>

            <QuestionBlock>
              <Label>What makes you different from competitors?</Label>
              <Hint>What unique perspective, method, or experience do you bring?</Hint>
              <TextArea
                value={answers.differentiation || ""}
                onChange={(v) => updateAnswers({ differentiation: v })}
                placeholder="Unlike generic freelance platforms, we personally vet every designer and offer project guarantees. Founders get agency-quality work without the overhead."
                rows={3}
              />
            </QuestionBlock>

            <QuestionBlock>
              <Label>What feeling do you want customers to have?</Label>
              <Hint>Empowered? Understood? Excited? Confident?</Hint>
              <TextArea
                value={answers.customerFeeling || ""}
                onChange={(v) => updateAnswers({ customerFeeling: v })}
                placeholder="I want them to feel relieved — like they finally found a reliable partner who gets it."
                rows={2}
              />
            </QuestionBlock>
          </StepCard>
        )}

        {/* --- Step 4: Goals & Numbers --- */}
        {step === 4 && (
          <StepCard
            emoji="🎯"
            title="Let's talk goals"
            subtitle="Understanding your ambition and constraints helps us create the right plan for you."
          >
            <QuestionBlock>
              <Label>What's your primary goal for the next 6 months?</Label>
              <div className="mt-3 grid gap-2">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswers({ primaryGoal: opt.value })}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                      answers.primaryGoal === opt.value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs ${
                        answers.primaryGoal === opt.value
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {answers.primaryGoal === opt.value ? "✓" : ""}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </QuestionBlock>

            <QuestionBlock>
              <Label>Monthly revenue target (6 months out)?</Label>
              <Hint>Be honest — there's no wrong answer, and this helps us set realistic milestones.</Hint>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {REVENUE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswers({ revenueTarget: opt.value })}
                    className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                      answers.revenueTarget === opt.value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </QuestionBlock>

            <QuestionBlock>
              <Label>How much time can you dedicate weekly?</Label>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswers({ weeklyTime: opt.value })}
                    className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                      answers.weeklyTime === opt.value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </QuestionBlock>

            <QuestionBlock>
              <Label>What's your biggest fear or blocker right now?</Label>
              <Hint>Be honest — knowing this helps us give you the right plan.</Hint>
              <TextArea
                value={answers.biggestFear || ""}
                onChange={(v) => updateAnswers({ biggestFear: v })}
                placeholder="I'm worried nobody will pay for this. I've never launched anything before and I'm scared of failing publicly."
                rows={3}
              />
            </QuestionBlock>
          </StepCard>
        )}

        {/* --- Step 5: Review & Submit --- */}
        {step === 5 && (
          <div>
            <div className="text-center mb-8">
              <span className="text-5xl">✨</span>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Here's what you told us</h2>
              <p className="mt-2 text-gray-500">
                Review everything below — you can edit any section before generating your Blueprint.
              </p>
            </div>

            {/* Section: Business Idea */}
            <ReviewSection
              title="Your Business Idea"
              step={0}
              onEdit={() => goToStep(0)}
            >
              <ReviewItem label="Business idea" value={answers.businessIdea} />
              <ReviewItem label="Problem it solves" value={answers.problemSolved} />
              <ReviewItem label="Why now" value={answers.whyNow} />
            </ReviewSection>

            {/* Section: Products or Services */}
            <ReviewSection
              title="Products or Services"
              step={1}
              onEdit={() => goToStep(1)}
            >
              <ReviewItem
                label="Offering type"
                value={OFFERING_TYPES.find((o) => o.value === answers.offeringType)?.label}
              />
              <ReviewItem label="Description" value={answers.offeringDescription} />
              <ReviewItem label="Delivery method" value={answers.deliveryMethod} />
            </ReviewSection>

            {/* Section: Audience */}
            <ReviewSection
              title="Your Audience"
              step={2}
              onEdit={() => goToStep(2)}
            >
              <ReviewItem label="Ideal customer" value={answers.idealCustomer} />
              <ReviewItem
                label="Where they hang out"
                value={(answers.customerPlatforms || []).join(", ")}
              />
              <ReviewItem label="Biggest challenge" value={answers.customerChallenge} />
            </ReviewSection>

            {/* Section: Brand & Voice */}
            <ReviewSection
              title="Brand & Voice"
              step={3}
              onEdit={() => goToStep(3)}
            >
              <ReviewItem label="Business name" value={answers.businessName} />
              <ReviewItem
                label="Brand personality"
                value={(answers.brandPersonality || []).join(" · ")}
              />
              <ReviewItem label="What makes you different" value={answers.differentiation} />
              <ReviewItem label="Customer feeling" value={answers.customerFeeling} />
            </ReviewSection>

            {/* Section: Goals & Numbers */}
            <ReviewSection
              title="Goals & Numbers"
              step={4}
              onEdit={() => goToStep(4)}
            >
              <ReviewItem
                label="Primary goal"
                value={GOAL_OPTIONS.find((o) => o.value === answers.primaryGoal)?.label}
              />
              <ReviewItem
                label="Revenue target"
                value={REVENUE_OPTIONS.find((o) => o.value === answers.revenueTarget)?.label}
              />
              <ReviewItem
                label="Weekly time"
                value={TIME_OPTIONS.find((o) => o.value === answers.weeklyTime)?.label}
              />
              <ReviewItem label="Biggest fear" value={answers.biggestFear} />
            </ReviewSection>

            {/* Submit */}
            <div className="mt-10 text-center">
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {generatingStatus === "generating" && (
                <div className="rounded-2xl border border-indigo-200 bg-white p-8 shadow-sm">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                  <h3 className="text-lg font-bold text-gray-900">Generating your Blueprint…</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Our AI is crafting your personalized Business Blueprint. This usually takes about 30 seconds.
                  </p>
                  <div className="mt-6 mx-auto max-w-xs">
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                </div>
              )}

              {generatingStatus === "complete" && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-8 shadow-sm">
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="text-lg font-bold text-green-800">Blueprint ready!</h3>
                  <p className="mt-2 text-sm text-green-600">Redirecting you now…</p>
                </div>
              )}

              {generatingStatus === "error" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
                  <div className="text-5xl mb-3">😕</div>
                  <h3 className="text-lg font-bold text-red-800">Something went wrong</h3>
                  <p className="mt-2 text-sm text-red-600">{error || "We couldn't generate your blueprint. Don't worry — your brief is saved."}</p>
                  <button
                    onClick={handleSubmit}
                    className="mt-4 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-all"
                  >
                    Try Again
                  </button>
                  <a
                    href="/dashboard"
                    className="mt-3 block text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    ← Back to Dashboard
                  </a>
                </div>
              )}

              {!generatingStatus && (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting…
                      </span>
                    ) : (
                      "Generate My Business Blueprint ✨"
                    )}
                  </button>
                  <p className="mt-3 text-xs text-gray-400">
                    Your answers are saved — you can always come back to edit before generating.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons (not on review step) */}
        {step < 5 && (
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                step === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              ← Back
            </button>

            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                canProceed()
                  ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Back button on review step */}
        {step === 5 && (
          <div className="mt-6 text-center">
            <button
              onClick={prevStep}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:text-gray-900 hover:bg-gray-100"
            >
              ← Back to Goals
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Reusable sub-components ---

function StepCard({
  emoji,
  title,
  subtitle,
  children,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <span className="text-4xl">{emoji}</span>
        <h2 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
        <p className="mt-1 text-gray-500">{subtitle}</p>
      </div>
      <div className="space-y-8">{children}</div>
    </div>
  );
}

function QuestionBlock({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0">{children}</div>;
}

function Label({
  required,
  optional,
  children,
}: {
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-gray-800">
      {children}
      {required && <span className="ml-1 text-indigo-500">*</span>}
      {optional && <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-sm text-gray-400">{children}</p>;
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="mt-3 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
    />
  );
}

function ReviewSection({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          ✏️ Edit
        </button>
      </div>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3">
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm text-gray-700 leading-relaxed">
        {value?.trim() ? (
          value
        ) : (
          <span className="text-gray-300 italic">Not answered</span>
        )}
      </dd>
    </div>
  );
}
