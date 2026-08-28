import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Role-based route protection middleware
 *
 * Route groups:
 * /admin/*         → admin only
 * /collector/*     → collector only
 * /bank-sampah/*   → bank_sampah only
 * /umkm/*          → umkm only
 * /scan, /verifikasi/* → verifier only
 * /dashboard, /wallet, /marketplace, /disputes, etc → customer
 *
 * Note: Firebase auth state is managed client-side via AuthContext.
 * This middleware checks a custom header set by the client after auth.
 * In production, use Firebase Admin SDK to verify tokens server-side.
 */

// Role → allowed path prefixes
const ROLE_ROUTES: Record<string, string[]> = {
  admin: ["/admin"],
  collector: ["/collector"],
  bank_sampah: ["/bank-sampah"],
  umkm: ["/umkm"],
  verifier: ["/scan", "/verifikasi"],
  customer: [
    "/dashboard",
    "/input-sampah",
    "/wallet",
    "/marketplace",
    "/disputes",
    "/pickup",
    "/carbon-tracker",
    "/edukasi",
    "/eco-redeem",
    "/profil",
    "/riwayat",
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Check user role from cookie (set by AuthContext after login)
  const userRole = request.cookies.get("buangyuk_role")?.value;

  // If no role cookie, allow through (AuthContext handles actual auth)
  // This middleware is a defense-in-depth layer
  if (!userRole) {
    return NextResponse.next();
  }

  // Check if the current path requires a specific role
  for (const [role, prefixes] of Object.entries(ROLE_ROUTES)) {
    if (prefixes.some((prefix) => pathname.startsWith(prefix))) {
      if (userRole !== role && userRole !== "admin") {
        // Redirect to appropriate dashboard based on role
        const redirectPath = getRoleDashboard(userRole);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  }

  return NextResponse.next();
}

function getRoleDashboard(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "collector":
      return "/collector";
    case "bank_sampah":
      return "/bank-sampah";
    case "umkm":
      return "/umkm";
    case "verifier":
      return "/scan";
    default:
      return "/dashboard";
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/collector/:path*",
    "/bank-sampah/:path*",
    "/umkm/:path*",
    "/scan",
    "/verifikasi/:path*",
    "/dashboard",
    "/input-sampah",
    "/wallet",
    "/marketplace",
    "/disputes",
    "/pickup/:path*",
    "/carbon-tracker",
    "/edukasi",
    "/eco-redeem",
    "/profil",
    "/riwayat",
  ],
};
