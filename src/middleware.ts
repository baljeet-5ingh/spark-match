// middleware.ts
import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req)) {
    return NextResponse.next();
  }

  const { userId, redirectToSignIn } = await auth();

  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (!userId) {
    return NextResponse.next();
  }

  // 🔥 Fetch fresh user metadata directly from Clerk
  // This ensures we always have the latest onboarding status
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const onboarded = (user.publicMetadata as { onboarded?: boolean })?.onboarded;

  // 🔍 DEBUG: Log the onboarding status (remove after testing)
  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("User ID:", userId);
  console.log("Public Metadata:", user.publicMetadata);
  console.log("Onboarded value:", onboarded);
  console.log("Onboarded type:", typeof onboarded);
  console.log("Is onboarded === true?", onboarded === true);
  console.log("========================");

  // Redirect to onboarding if NOT onboarded
  if (onboarded !== true && !isOnboardingRoute(req)) {
    console.log("🚨 Redirecting to onboarding");
    const url = req.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  // Prevent onboarded users from visiting onboarding
  if (onboarded === true && isOnboardingRoute(req)) {
    console.log("✅ User is onboarded, redirecting to discover");
    const url = req.nextUrl.clone();
    url.pathname = "/discover";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
