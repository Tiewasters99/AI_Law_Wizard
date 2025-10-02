import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Define protected routes and their required roles
    const protectedRoutes = {
      '/wizard': ['LAWYER', 'CUSTOMER'],
      '/tokens': ['LAWYER'],
      '/admin': ['LAWYER'],
      '/grand-wizard': ['LAWYER', 'CUSTOMER'],
      '/profile': ['LAWYER', 'CUSTOMER'],
      '/query-history': ['LAWYER', 'CUSTOMER'],
    };

    // Check if the current path requires authentication
    const requiredRoles = protectedRoutes[pathname as keyof typeof protectedRoutes];
    
    if (requiredRoles) {
      // User must be authenticated
      if (!token) {
        return NextResponse.redirect(new URL('/auth', req.url));
      }

      // Check if user has required role
      if (!requiredRoles.includes(token.role as 'LAWYER' | 'CUSTOMER')) {
        // Redirect based on user's actual role
        if (token.role === 'LAWYER') {
          return NextResponse.redirect(new URL('/wizard', req.url));
        } else {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }

      // Only redirect to profile-setup if user has no role and is trying to access protected routes
      if (!token.role && requiredRoles && pathname !== '/profile-setup') {
        return NextResponse.redirect(new URL('/profile-setup', req.url));
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
          '/',
          '/auth',
          '/login',
          '/register',
          '/api/auth',
          '/profile-setup',
          '/blog',
          '/miniverse',
          '/apprentice',
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
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
