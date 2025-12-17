// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Public routes
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

/**
 * Onboarding route
 */
const isOnboardingRoute = createRouteMatcher([
  "/onboarding",
]);

/**
 * 🚨 API routes — MUST be skipped
 */
const isApiRoute = createRouteMatcher([
  "/api/graphql(.*)", // 👈 THIS WAS MISSING
]);

/**
 * Static & internals
 */
const isIgnoredRoute = createRouteMatcher([
  "/_next(.*)",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/images(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // 🚫 NEVER touch GraphQL
  if (isApiRoute(req) || isIgnoredRoute(req)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // 🔐 Protected routes
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (!userId) return NextResponse.next();

  const onboarded =
    (sessionClaims?.publicMetadata as { onboarded?: boolean })?.onboarded;

  if (onboarded === false && !isOnboardingRoute(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  if (onboarded === true && isOnboardingRoute(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/discover";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
