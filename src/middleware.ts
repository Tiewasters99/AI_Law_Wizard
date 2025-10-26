import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Define protected routes and their required roles
    const protectedRoutes = {
      "/client": ["CUSTOMER", "ADMIN"],
      "/client/dashboard": ["CUSTOMER", "ADMIN"],
      "/attorney": ["ATTORNEY", "ADMIN"],
      "/attorney/dashboard": ["ATTORNEY", "ADMIN"],
      "/admin": ["ADMIN"],
      "/admin/dashboard": ["ADMIN"],
    };

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
      if (
        !requiredRoles.includes(token.role as "ATTORNEY" | "CUSTOMER" | "ADMIN")
      ) {
        // Redirect based on user's actual role
        if (token.role === "ATTORNEY") {
          return NextResponse.redirect(new URL("/attorney/dashboard", req.url));
        } else if (token.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
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
          "/api/auth",
          "/blog",
          "/legal-research",
          "/attorney-features",
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
