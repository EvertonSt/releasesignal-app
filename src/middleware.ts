import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Allow public routes
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow demo mode without auth
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.next();
  }

  // Check if user is authenticated for app routes
  const isAppRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/test-runs") ||
    pathname.startsWith("/failures") ||
    pathname.startsWith("/flaky-tests") ||
    pathname.startsWith("/quality-gates") ||
    pathname.startsWith("/pull-requests") ||
    pathname.startsWith("/performance") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/onboarding");

  if (isAppRoute && !req.auth) {
    const signInUrl = new URL("/login", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
