import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request) {
  const session = await auth();

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/profile', '/settings'];
  const path = request.nextUrl.pathname;

  // Check if the path is protected and user is not authenticated
  if (protectedPaths.some(pp => path.startsWith(pp)) && !session) {
    return NextResponse.redirect(new URL('/api/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, api routes, and auth routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
};