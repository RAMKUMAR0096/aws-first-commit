import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/api/applications(.*)",
]);

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_aWRlYWwtbGFiLTk3MTguY2xlcmsuYWNjb3VudHMuZGV2JA";
const secretKey =
  process.env.CLERK_SECRET_KEY ||
  "sk_test_mPkh9FJkAhTBuCMFisNFymJ1vYxxjquPABsFzINFuY";

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  { publishableKey, secretKey }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
