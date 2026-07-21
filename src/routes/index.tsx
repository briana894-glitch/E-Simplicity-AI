import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("es_token");
    setLoggedIn(!!token);
  }, []);
  return loggedIn;
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const loggedIn = useIsLoggedIn();
  const ctaHref = loggedIn ? "/dashboard" : "/signup";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-indigo-100/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="E-Simplicity AI" className="h-9 w-auto" />
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            E-Simplicity AI
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Features
          </a>
          <a
            href="#who-its-for"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Who It's For
          </a>
          <a
            href="/pricing"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Pricing
          </a>
          <a
            href={ctaHref}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
          >
            {loggedIn ? "Dashboard" : "Get Started Free"}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 rounded bg-gray-600 transition-all ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 rounded bg-gray-600 transition-all ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 rounded bg-gray-600 transition-all ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-600"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-600"
            >
              Features
            </a>
            <a
              href="#who-its-for"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-600"
            >
              Who It's For
            </a>
            <a
              href="/pricing"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-600"
            >
              Pricing
            </a>
            <a
              href={ctaHref}
              className="mt-1 rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              {loggedIn ? "Dashboard" : "Get Started Free"}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const loggedIn = useIsLoggedIn();
  const ctaHref = loggedIn ? "/dashboard" : "/signup";

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-50 via-purple-50/50 to-transparent opacity-70 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          AI-Powered Business Launch Platform
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Turn Your Business Idea Into a{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Complete Launch Kit
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
          One platform that transforms your idea into a personalised strategy,
          marketing content, email campaigns, funnels, content calendars, and
          brand messaging — all AI-generated from a single guided brief.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={ctaHref}
            className="rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 active:scale-[0.98]"
          >
            {loggedIn ? "Go to Dashboard" : "Start Your Project Brief — Free"}
          </a>
          <a
            href="#how-it-works"
            className="rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            See How It Works →
          </a>
        </div>

        <p className="mt-5 text-sm text-gray-400">
          No credit card required. Launch your business in minutes.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Complete Your Project Brief",
      description:
        "Answer a guided, conversational questionnaire about your business idea, target audience, goals, and style preferences. It takes about 10 minutes and feels like a chat, not a form.",
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
    },
    {
      step: "02",
      title: "Get Your AI-Generated Business Blueprint",
      description:
        "Our AI processes your brief and generates a comprehensive, personalised Business Blueprint — executive summary, launch roadmap, marketing strategy, customer avatar, brand messaging, and more. Delivered in a beautiful, Notion-style layout.",
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
    },
    {
      step: "03",
      title: "Access Your Business Assets Library",
      description:
        "Dive into your library of downloadable resources — marketing templates, content calendars, email sequences, launch checklists, and educational courses. Everything you need to take action and launch with confidence.",
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            From Idea to Launch-Ready in Three Simple Steps
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            No complicated tools. No expensive agencies. No months of learning.
            Just a guided process that turns your idea into a complete,
            actionable business plan.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.step}
              className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:shadow-indigo-50"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                {s.icon}
              </div>
              <span className="text-sm font-bold text-indigo-400">{s.step}</span>
              <h3 className="mt-2 text-xl font-bold text-gray-900">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-gray-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: "AI-Powered Onboarding",
      description:
        "Our conversational Project Brief feels like chatting with a smart business coach — not filling out a boring form. Answer simple questions and let the AI do the heavy lifting.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      title: "Personalised Business Blueprints",
      description:
        "Get a complete, AI-generated strategy tailored to your specific idea — executive summary, launch roadmap, marketing plan, customer avatar, brand messaging, and content strategy.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
    },
    {
      title: "Marketing Automation",
      description:
        "Generate email sequences, social media content, and launch campaigns automatically. Your marketing assets are ready before you finish your morning coffee.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
    {
      title: "Content Generation",
      description:
        "From blog post outlines to social captions to ad copy — get AI-generated content that matches your brand voice and speaks directly to your ideal customers.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        </svg>
      ),
    },
    {
      title: "Business Asset Library",
      description:
        "Browse a growing collection of downloadable resources — templates, guides, courses, and checklists — organised by category and ready to use immediately.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
    },
    {
      title: "Always Fresh, Always Evolving",
      description:
        "New features, templates, and courses ship continuously. Your subscription gives you access to everything we build — the platform grows with your business.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M8.25 14.25l-1.5 1.5" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="bg-gray-50/80 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Features
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need to Launch — All in One Place
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Stop juggling a dozen tools. E-Simplicity AI brings strategy, content,
            marketing, and education together in a single, beautiful platform.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  const audiences = [
    {
      label: "First-Time Entrepreneurs",
      description:
        "You've got a great idea but no clue where to start. We guide you from concept to launch-ready with a clear, step-by-step plan.",
      emoji: "🚀",
    },
    {
      label: "Freelancers & Creators",
      description:
        "Turn your side hustle into a real business. Get professional marketing, content, and brand strategy without hiring a team.",
      emoji: "🎨",
    },
    {
      label: "Coaches & Consultants",
      description:
        "Launch your practice with confidence. Your Blueprint includes client personas, messaging frameworks, email sequences, and content calendars.",
      emoji: "🧠",
    },
    {
      label: "Side-Hustlers",
      description:
        "You're working a day job while building something on the side. E-Simplicity AI does the heavy lifting so you can focus on what matters.",
      emoji: "⚡",
    },
    {
      label: "Service-Based Businesses",
      description:
        "From local services to online offerings — get a complete brand strategy, marketing plan, and launch roadmap tailored to your business model.",
      emoji: "🛠️",
    },
    {
      label: "Anyone With an Idea",
      description:
        "You don't need an MBA or a marketing degree. If you have an idea and the drive to start, E-Simplicity AI is built for you.",
      emoji: "💡",
    },
  ];

  return (
    <section id="who-its-for" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Who It's For
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Built for People Who Want to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Start, Not Struggle
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            You don't need a business degree, a big budget, or a marketing team.
            You just need your idea and the drive to start. We handle the rest.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((a) => (
            <div
              key={a.label}
              className="group rounded-2xl border border-gray-100 p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <span className="text-3xl">{a.emoji}</span>
              <h3 className="mt-3 text-lg font-bold text-gray-900">{a.label}</h3>
              <p className="mt-2 leading-relaxed text-gray-500">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const loggedIn = useIsLoggedIn();
  const ctaHref = loggedIn ? "/dashboard" : "/signup";

  return (
    <section id="pricing" className="bg-gray-50/80 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            One subscription. Unlimited access to everything. No hidden fees, no
            surprises.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-lg">
          <div className="relative rounded-3xl border-2 border-indigo-600 bg-white p-8 shadow-xl shadow-indigo-100 sm:p-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white">
              Most Popular
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">E-Simplicity Plan</h3>
              <p className="mt-2 text-gray-500">
                Everything you need to launch and grow
              </p>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-gray-900">$29</span>
                <span className="ml-1 text-lg text-gray-500">/month</span>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Cancel anytime. No lock-in.
              </p>
            </div>

            <ul className="mt-8 space-y-4">
              {[
                "Unlimited Business Blueprints",
                "Full Business Assets Library",
                "AI-Generated Marketing Content",
                "Email Sequence & Funnel Builder",
                "Content Calendars & Strategy Docs",
                "All New Features as They Ship",
                "Priority Support",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="/pricing"
              className="mt-8 block rounded-xl bg-indigo-600 px-6 py-4 text-center text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
            >
              View Pricing
            </a>
            <p className="mt-3 text-center text-sm text-gray-400">
              No credit card required to get started
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const loggedIn = useIsLoggedIn();
  const ctaHref = loggedIn ? "/dashboard" : "/signup";

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-8 py-16 text-center shadow-2xl sm:px-16 sm:py-20">
          <div className="absolute inset-0 -z-0 opacity-20">
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-purple-400 blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to Turn Your Idea Into a Business?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-indigo-100">
              Stop dreaming. Start building. Your complete launch kit is one brief
              away — and it's completely free to get started.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={ctaHref}
                className="rounded-xl bg-white px-8 py-4 text-base font-bold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl active:scale-[0.98]"
              >
                {loggedIn ? "Go to Dashboard →" : "Get Started Free →"}
              </a>
            </div>
            <p className="mt-4 text-sm text-indigo-200">
              Join entrepreneurs who are launching smarter, faster, and simpler.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const loggedIn = useIsLoggedIn();

  return (
    <footer className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="E-Simplicity AI" className="h-8 w-auto" />
            <span className="text-lg font-semibold tracking-tight text-gray-900">
              E-Simplicity AI
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="/pricing" className="hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <a href={loggedIn ? "/dashboard" : "/signup"} className="hover:text-gray-900 transition-colors">
              {loggedIn ? "Dashboard" : "Sign Up"}
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} E-Simplicity AI. All rights reserved.</p>
          <p className="mt-1">
            Empowering entrepreneurs to launch smarter, faster, and simpler.
          </p>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <div className="min-h-dvh bg-white font-sans text-gray-900">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <Features />
      <WhoItsFor />
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  );
}
