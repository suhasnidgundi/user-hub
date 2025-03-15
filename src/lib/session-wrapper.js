"use client"; // Required for Client Components

import { SessionProvider, useSession } from "next-auth/react";

// SessionWrapper component to provide authentication state across the app
export function SessionWrapper({ children, session }) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
}

// Custom hook for easier authentication state access
export function useAuth() {
    const { data: session, status } = useSession();

    return {
        session,
        isAuthenticated: !!session,
        isLoading: status === "loading",
    };
}
