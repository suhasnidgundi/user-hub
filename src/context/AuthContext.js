'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/utils/firebaseClient';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const router = useRouter();

    // Firebase auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Check if user exists in Firestore, if not create profile
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        photoURL: firebaseUser.photoURL || '',
                        createdAt: serverTimestamp(),
                        preferences: {
                            minSustainabilityScore: 5,
                            preferredStyles: [],
                            preferredMaterials: [],
                            priceRange: { min: 0, max: 10000 }
                        }
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sync with NextAuth session when available
    useEffect(() => {
        if (session?.user && !user) {
            // User is logged in with NextAuth but not Firebase
            setUser(session.user);
        }
    }, [session, user]);

    // Email/Password Registration
    const signup = async (email, password, displayName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update profile with displayName
            await updateProfile(userCredential.user, { displayName });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email,
                displayName,
                photoURL: '',
                createdAt: serverTimestamp(),
                preferences: {
                    minSustainabilityScore: 5,
                    preferredStyles: [],
                    preferredMaterials: [],
                    priceRange: { min: 0, max: 10000 }
                }
            });

            return userCredential.user;
        } catch (error) {
            throw error;
        }
    };

    // Email/Password Login
    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            throw error;
        }
    };

    // Google Sign In
    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Check if user exists in Firestore
            const userRef = doc(db, 'users', result.user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: result.user.uid,
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL,
                    createdAt: serverTimestamp(),
                    preferences: {
                        minSustainabilityScore: 5,
                        preferredStyles: [],
                        preferredMaterials: [],
                        priceRange: { min: 0, max: 10000 }
                    }
                });
            }

            // Also sign in with NextAuth
            await nextAuthSignIn('google');

            return result.user;
        } catch (error) {
            throw error;
        }
    };

    // Log out
    const logout = async () => {
        setUser(null);
        await signOut(auth);
        await nextAuthSignOut({ callbackUrl: '/' });
    };

    // Password reset
    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    // Update user preferences
    const updateUserPreferences = async (preferences) => {
        if (!user) return null;

        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { preferences }, { merge: true });
            return true;
        } catch (error) {
            console.error("Error updating preferences:", error);
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signup,
            login,
            logout,
            signInWithGoogle,
            resetPassword,
            updateUserPreferences
        }}>
            {children}
        </AuthContext.Provider>
    );
};