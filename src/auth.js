import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials"
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebase_auth } from "@/utils/firebaseClient";

// Only import FirestoreAdapter on the server
const adapter = typeof window === 'undefined' ? FirestoreAdapter() : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
    debug: process.env.NODE_ENV === 'development',
    theme: { logo: "https://authjs.dev/img/logo-sm.png", colorScheme: "auto" },
    adapter,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    console.log("Credentials:", credentials);
                    const userCredential = await signInWithEmailAndPassword(
                        firebase_auth,
                        credentials.email,
                        credentials.password
                    );
                    const user = userCredential.user;

                    if (user) {
                        return {
                            id: user.uid,
                            name: user.displayName,
                            email: user.email,
                            image: user.photoURL
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // Add user info to token if available
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Add user id to session from token
            if (session?.user) {
                session.user.id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error'
    },
});