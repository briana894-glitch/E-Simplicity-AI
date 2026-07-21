import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const STRIPE_MONTHLY = "https://buy.stripe.com/bJe7sLcVbendbwPeLG3VC01";
const STRIPE_ANNUAL = "https://buy.stripe.com/7sYcN53kBaX6X6cvgTO3VC02";

function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("es_token");
    setLoggedIn(!!token);
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem("es_user") || "{}");
        setUserEmail(user.email || null);
      } catch {
        setUserEmail(null);
      }
    }
  }, []);
  return { loggedIn, userEmail };
}

const FEATURES = [
  "Unlimited Business Blueprints",
  "Full Business Assets Library",
  "AI-Generated Marketing Content",
  "Email Sequence & Funnel Builder",
  "Content Calendars & Strategy Docs",
  "All New Features as They Ship",
  "Priority Support",
];

function PricingPage() {
  const { loggedIn, userEmail } = useIsLoggedIn();

  function getMonthlyUrl(): string {
    if (userEmail) {
      return `${STRIPE_MONTHLY}?prefilled_email=${encodeURIComponent(userEmail)}`;
    }
    return STRIPE_MONTHLY;
  }

  function getAnnualUrl(): string {
    if (userEmail) {
      return `${STRIPE_ANNUAL}?prefilled_email=${encodeURIComponent(userEmail)}`;
    }
    return STRIPE_ANNUAL;
  }

  return (
    <div className="min-h-dvh bg-white font-sans text-gray-900">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="E-Simplicity AI" className="h-9 w-auto" />
            <span className="text-lg font-semibold tracking-tight text-gray-900">
              E-Simplicity AI
            </span>
          </a>
          <div className="flex items-center gap-4">
            {loggedIn ? (
              <a
                href="/dashboard"
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
              >
                Dashboard
              </a>
            ) : (
              <a
                href="/signup"
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
              >
                Subscribe Now
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Pricing
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Start building immediately. No free trial — you keep everything you
              create.
            </p>
          </div>

          {/* Pricing cards — two side by side */}
          <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-2">
            {/* Monthly card */}
            <div className="relative rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Monthly</h3>
                <p className="mt-2 text-gray-500">
                  Full access, billed monthly
                </p>
                <div className="mt-6">
                  <span className="text-5xl font-extrabold text-gray-900">
                    $47
                  </span>
                  <span className="ml-1 text-lg text-gray-500">/month</span>
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Cancel anytime. No lock-in.
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {FEATURES.map((item) => (
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
                href={getMonthlyUrl()}
                className="mt-8 block w-full rounded-xl bg-indigo-600 px-6 py-4 text-center text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
              >
                Subscribe Monthly
              </a>
            </div>

            {/* Annual card */}
            <div className="relative rounded-3xl border-2 border-indigo-600 bg-white p-8 shadow-xl shadow-indigo-100 sm:p-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-1 text-sm font-semibold text-white">
                2 months free
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Annual</h3>
                <p className="mt-2 text-gray-500">
                  Best value — save $94/year
                </p>
                <div className="mt-6">
                  <span className="text-5xl font-extrabold text-gray-900">
                    $470
                  </span>
                  <span className="ml-1 text-lg text-gray-500">/year</span>
                </div>
                <p className="mt-1 text-sm text-indigo-600 font-medium">
                  That's just $39.17/month
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {FEATURES.map((item) => (
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
                href={getAnnualUrl()}
                className="mt-8 block w-full rounded-xl bg-indigo-600 px-6 py-4 text-center text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
              >
                Subscribe Annually
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="mx-auto mt-20 max-w-2xl">
            <h2 className="text-xl font-bold text-center text-gray-900">
              Frequently Asked Questions
            </h2>
            <dl className="mt-10 space-y-6">
              <div>
                <dt className="text-base font-semibold text-gray-900">
                  Can I cancel anytime?
                </dt>
                <dd className="mt-2 text-gray-500">
                  Absolutely. Cancel anytime from your dashboard. You'll
                  continue to have access until the end of your billing period.
                  No questions asked.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold text-gray-900">
                  What payment methods do you accept?
                </dt>
                <dd className="mt-2 text-gray-500">
                  We accept all major credit and debit cards through Stripe.
                  Payment processing is secure and your card details are never
                  stored on our servers.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold text-gray-900">
                  Do I keep my work if I cancel?
                </dt>
                <dd className="mt-2 text-gray-500">
                  Yes. Everything you create — Business Blueprints, Project
                  Briefs, and downloaded assets — is yours to keep. When you
                  cancel, you simply lose access to the platform; your data
                  remains safe and can be recovered if you resubscribe.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold text-gray-900">
                  Is there a refund policy?
                </dt>
                <dd className="mt-2 text-gray-500">
                  If you're not satisfied within the first 14 days of your
                  subscription, contact us for a full refund. We stand behind
                  the value of our platform.
                </dd>
              </div>
            </dl>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            {loggedIn ? (
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl"
              >
                Go to Dashboard →
              </a>
            ) : (
              <a
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl"
              >
                Create Account & Subscribe →
              </a>
            )}
            <p className="mt-3 text-sm text-gray-400">
              Join entrepreneurs who are launching smarter, faster, and simpler.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
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
              <a href="/" className="hover:text-gray-900 transition-colors">
                Home
              </a>
              <a
                href="/pricing"
                className="hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
              <a
                href={loggedIn ? "/dashboard" : "/signup"}
                className="hover:text-gray-900 transition-colors"
              >
                {loggedIn ? "Dashboard" : "Sign Up"}
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} E-Simplicity AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
