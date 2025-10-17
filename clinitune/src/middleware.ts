import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');

    if (isAuthPage) {
      if (isAuth) {
        const role = token?.role as string;
        const redirectPath = role === 'clinician' 
          ? '/dashboard/clinician' 
          : '/dashboard/patient';
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
      return null;
    }

    if (isDashboard && !isAuth) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Role-based access control
    if (isDashboard && isAuth) {
      const role = token?.role as string;
      const pathname = req.nextUrl.pathname;

      if (pathname.startsWith('/dashboard/clinician') && role !== 'clinician') {
        return NextResponse.redirect(new URL('/dashboard/patient', req.url));
      }

      if (pathname.startsWith('/dashboard/patient') && role !== 'patient') {
        return NextResponse.redirect(new URL('/dashboard/clinician', req.url));
      }
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
        const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
        
        if (isAuthPage) return true;
        if (isDashboard) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
};