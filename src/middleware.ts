import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isOnboarded = req.auth?.user?.onboarded;

  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);
  const isOnboardingRoute = nextUrl.pathname === "/onboarding";
  const isPublicRoute = ["/", "/pricing"].includes(nextUrl.pathname)
    || nextUrl.pathname.startsWith("/w/");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuthRoute) return;
  if (isPublicRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (!isOnboarded) return Response.redirect(new URL("/onboarding", nextUrl));
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (isOnboardingRoute) {
    if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
    if (isOnboarded) return Response.redirect(new URL("/dashboard", nextUrl));
    return;
  }

  if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
  if (!isOnboarded) return Response.redirect(new URL("/onboarding", nextUrl));
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|images|favicon.ico).*)"],
};
