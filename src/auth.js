import { FirestoreAdapter } from "@auth/firebase-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
    debug: process.env.NODE_ENV === 'development',
    theme: { logo: "https://authjs.dev/img/logo-sm.png", colorScheme: "auto" },
    adapter: FirestoreAdapter(),
    providers: [
        Google
    ],
    basePath: "/auth",
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async authorized() {
            return true;
        },
        async jwt(token, user, account, profile, isNewUser) {
            return token;
        },
        async session(session, user) {
            return session;
        },
    },
    experimental: { enableWebAuthn: true },
});