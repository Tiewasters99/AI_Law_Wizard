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

    // Handle authenticated users
    if (token) {
      const userRole = token.role as "ATTORNEY" | "CUSTOMER" | null | undefined;
      const isAdmin = token.isAdmin as boolean;

      // For authenticated users with null role: force role selection
      if (userRole === null || userRole === undefined) {
        // Allow access to role-selection page
        if (pathname === "/auth/role-selection") {
          return NextResponse.next();
        }
        // Redirect ALL other routes to role-selection
        return NextResponse.redirect(new URL("/auth/role-selection", req.url));
      }

      // For authenticated users with role set
      // Redirect away from role-selection to their dashboard
      if (pathname === "/auth/role-selection") {
        if (userRole === "ATTORNEY") {
          return NextResponse.redirect(new URL("/attorney/dashboard", req.url));
        } else {
          return NextResponse.redirect(new URL("/client/dashboard", req.url));
        }
      }

      // For admin routes, check admin authentication
      if (pathname.startsWith("/admin")) {
        if (!isAdmin) {
          return NextResponse.redirect(new URL("/admin/login", req.url));
        }
        return NextResponse.next();
      }

      // Check if the current path requires authentication and specific role
      const route = Object.keys(protectedRoutes).find(route =>
        pathname.startsWith(route)
      );

      if (route) {
        const requiredRoles =
          protectedRoutes[route as keyof typeof protectedRoutes];

        // User must have the required role
        if (!requiredRoles.includes(userRole)) {
          // Redirect based on user's actual role
          if (userRole === "ATTORNEY") {
            return NextResponse.redirect(
              new URL("/attorney/dashboard", req.url)
            );
          } else {
            return NextResponse.redirect(new URL("/client/dashboard", req.url));
          }
        }
      }
    } else {
      // Not authenticated - redirect to login
      if (pathname !== "/auth/role-selection") {
        return NextResponse.redirect(new URL("/auth/login", req.url));
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

        // Allow access to role-selection page for authenticated users (even with null role)
        if (pathname === "/auth/role-selection") {
          return !!token;
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
