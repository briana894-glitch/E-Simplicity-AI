import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "E-Simplicity AI — Turn Your Business Idea Into a Complete Launch Kit",
      },
      {
        name: "description",
        content:
          "One platform that turns your business idea into a complete launch kit — strategy, marketing, content, and funnels, all AI-generated from a single guided brief.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:title",
        content: "E-Simplicity AI — Turn Your Business Idea Into a Complete Launch Kit",
      },
      {
        property: "og:description",
        content:
          "One platform that turns your business idea into a complete launch kit — strategy, marketing, content, and funnels, all AI-generated from a single guided brief.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Page not found</h1>
        <p className="mt-2 text-gray-500">
          The page you're looking for doesn't exist.
        </p>
        <a href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          ← Back home
        </a>
      </div>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
