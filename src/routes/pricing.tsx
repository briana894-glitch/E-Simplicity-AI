import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/00wbJ1bR72Ev6cvfPK3VC00";

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

function PricingPage() {
  const { loggedIn, userEmail } = useIsLoggedIn();

  function getStripeUrl(): string {
    if (userEmail) {
      return `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(userEmail)}`;
    }
    return STRIPE_PAYMENT_LINK;
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
                Start Your Free Trial
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
              One plan. Unlimited access to everything. No hidden fees, no
              surprises. Start with a 7-day free trial — no credit card
              required.
            </p>
          </div>

          {/* Pricing card */}
          <div className="mx-auto mt-16 max-w-lg">
            <div className="relative rounded-3xl border-2 border-indigo-600 bg-white p-8 shadow-xl shadow-indigo-100 sm:p-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white">
                Launch Offer
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  E-Simplicity Plan
                </h3>
                <p className="mt-2 text-gray-500">
                  Everything you need to launch and grow
                </p>
                <div className="mt-6">
                  <span className="text-5xl font-extrabold text-gray-900">
                    $29
                  </span>
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
                href={getStripeUrl()}
                className="mt-6 block w-full rounded-xl bg-indigo-600 px-6 py-4 text-center text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
              >
                Subscribe Now
              </a>

              {!loggedIn && (
                <a
                  href="/signup"
                  className="mt-3 block rounded-xl border-2 border-indigo-100 px-6 py-4 text-center text-base font-semibold text-indigo-600 transition-all hover:border-indigo-300 hover:bg-indigo-50"
                >
                  Start Your Free Trial →
                </a>
              )}

              <p className="mt-4 text-center text-sm text-gray-400">
                7-day free trial included. No credit card required to get
                started.
              </p>
            </div>
          </div>

          {/* FAQ — minimal */}
          <div className="mx-auto mt-20 max-w-2xl">
            <h2 className="text-xl font-bold text-center text-gray-900">
              Frequently Asked Questions
            </h2>
            <dl className="mt-10 space-y-6">
              <div>
                <dt className="text-base font-semibold text-gray-900">
                  What happens after my free trial?
                </dt>
                <dd className="mt-2 text-gray-500">
                  After 7 days, you'll need to subscribe to continue accessing
                  your Business Blueprints and the Assets Library. Your data is
                  always saved — you won't lose anything.
                </dd>
              </div>
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
                  Is there a free plan?
                </dt>
                <dd className="mt-2 text-gray-500">
                  We offer a 7-day free trial that gives you full access to
                  everything. After that, the subscription is $29/month. We
                  believe in being upfront — no bait-and-switch.
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
                Start Your Free Trial →
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
