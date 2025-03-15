import { NextResponse } from 'next/server';

export function middleware(request) {
  // Simple auth check using cookies rather than importing the full auth module
  const authCookie = request.cookies.get('next-auth.session-token');
  
  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/profile', '/settings'];
  const path = request.nextUrl.pathname;
  
  // Check if the path is protected and user is not authenticated
  if (protectedPaths.some(pp => path.startsWith(pp)) && !authCookie) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, api routes, and auth routes
    '/((?!api|_next/static|_next/image|auth|favicon.ico).*)'
  ],
};