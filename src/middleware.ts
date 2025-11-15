import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Define protected routes and their required roles
    const protectedRoutes = {
      "/client": ["CUSTOMER"],
      "/client/dashboard": ["CUSTOMER"],
      "/attorney": ["ATTORNEY"],
      "/attorney/dashboard": ["ATTORNEY"],
      "/admin": ["ADMIN"],
      "/admin/dashboard": ["ADMIN"],
      "/admin/clients": ["ADMIN"],
      "/admin/attorneys": ["ADMIN"],
      "/admin/pricing": ["ADMIN"],
    };

    // Skip authentication check for admin login page
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check public routes first
    const publicRoutes = [
      "/",
      "/auth",
      "/auth/login",
      "/auth/register",
      "/admin/login",
      "/api/auth",
      "/blog",
      "/legal-research",
      "/attorney-features",
      "/client-features",
    ];

    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check if the current path requires authentication
    const route = Object.keys(protectedRoutes).find(route =>
      pathname.startsWith(route)
    );

    if (route) {
      const requiredRoles =
        protectedRoutes[route as keyof typeof protectedRoutes];

      // User must be authenticated
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }

      // Check if user has required role
      const userRole = token.role as "ATTORNEY" | "CUSTOMER";
      const isAdmin = token.isAdmin as boolean;

      // For admin routes, check admin authentication
      if (pathname.startsWith("/admin")) {
        if (!token || !token.isAdmin) {
          return NextResponse.redirect(new URL("/admin/login", req.url));
        }
      } else if (!requiredRoles.includes(userRole)) {
        // Redirect based on user's actual role
        if (userRole === "ATTORNEY") {
          return NextResponse.redirect(new URL("/attorney/dashboard", req.url));
        } else {
          return NextResponse.redirect(new URL("/client/dashboard", req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        const publicRoutes = [
          "/",
          "/auth",
          "/auth/login",
          "/auth/register",
          "/admin/login",
          "/api/auth",
          "/blog",
          "/legal-research",
          "/attorney-features",
          "/client-features",
        ];

        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // For all other routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
