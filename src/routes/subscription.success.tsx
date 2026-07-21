import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { activateSubscription } from "../subscription";

export const Route = createFileRoute("/subscription/success")({
  component: SubscriptionSuccessPage,
});

function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("es_token") : null;

    if (!token) {
      setStatus("error");
      setErrorMsg("You must be logged in to activate your subscription.");
      return;
    }

    async function activate() {
      try {
        const result = await activateSubscription({ data: { token } });
        if (result.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(result.error === "no_token" || result.error === "invalid_token"
            ? "Your session has expired. Please log in and try again."
            : "There was a problem activating your subscription. Please contact support.");
        }
      } catch {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again or contact support.");
      }
    }

    activate();
  }, []);

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
        </div>
      </nav>

      {/* Main content */}
      <div className="flex items-center justify-center py-24 sm:py-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="text-lg text-gray-500">Activating your subscription…</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
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
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Thank you for subscribing!
                </h1>
                <p className="mt-3 text-lg text-gray-500">
                  Your subscription is now active. You have full access to all
                  features — unlimited Business Blueprints, the full Assets
                  Library, and everything new we ship.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 pt-4">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
                >
                  Go to Dashboard →
                </a>
                <a
                  href="/brief/new"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Or start a new Project Brief
                </a>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Activation failed
                </h1>
                <p className="mt-3 text-lg text-gray-500">{errorMsg}</p>
              </div>
              <div className="flex flex-col items-center gap-3 pt-4">
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
                >
                  Log In →
                </a>
                <a
                  href="/pricing"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Back to Pricing
                </a>
              </div>
            </div>
          )}
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
              <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
              <a href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
              <a href="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</a>
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
