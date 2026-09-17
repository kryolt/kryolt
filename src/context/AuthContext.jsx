/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    onAuthStateChanged,
} from "firebase/auth";

import {
    doc,
    onSnapshot,
} from "firebase/firestore";

import {
    auth,
    db,
} from "../firebase/firebase";


/**
 * Authentication Context
 *
 * This file is the single source of truth for:
 * - Firebase authenticated user
 * - Firestore user profile
 * - Subscription
 * - Premium status
 * - Current plan
 */
export const AuthContext = createContext(null);


/**
 * Auth Provider
 */
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);


    /**
     * Convert Firebase user into a plain application user object.
     */
    const buildAuthUser = useCallback((firebaseUser) => {
        if (!firebaseUser) {
            return null;
        }

        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            metadata: firebaseUser.metadata,
        };
    }, []);


    /**
     * Firebase authentication listener
     * + Firestore profile listener.
     */
    useEffect(() => {
        let unsubscribeProfile = null;
        let isMounted = true;

        const unsubscribeAuth = onAuthStateChanged(
            auth,
            (firebaseUser) => {
                // Remove previous Firestore listener.
                if (unsubscribeProfile) {
                    unsubscribeProfile();
                    unsubscribeProfile = null;
                }

                if (!isMounted) {
                    return;
                }

                // User is logged out.
                if (!firebaseUser) {
                    setCurrentUser(null);
                    setProfile(null);
                    setLoading(false);
                    return;
                }

                // Firebase user exists.
                const authUser = buildAuthUser(firebaseUser);

                setCurrentUser(authUser);
                setLoading(true);

                // Firestore user profile.
                const profileRef = doc(
                    db,
                    "users",
                    firebaseUser.uid
                );

                unsubscribeProfile = onSnapshot(
                    profileRef,
                    (snapshot) => {
                        if (!isMounted) {
                            return;
                        }

                        if (snapshot.exists()) {
                            setProfile({
                                id: snapshot.id,
                                ...snapshot.data(),
                            });
                        } else {
                            setProfile(null);
                        }

                        setLoading(false);
                    },
                    (error) => {
                        if (!isMounted) {
                            return;
                        }

                        console.error(
                            "Profile snapshot error:",
                            error
                        );

                        setProfile(null);
                        setLoading(false);
                    }
                );
            },
            (error) => {
                if (!isMounted) {
                    return;
                }

                console.error(
                    "Authentication state error:",
                    error
                );

                setCurrentUser(null);
                setProfile(null);
                setLoading(false);
            }
        );

        return () => {
            isMounted = false;

            unsubscribeAuth();

            if (unsubscribeProfile) {
                unsubscribeProfile();
            }
        };
    }, [buildAuthUser]);


    /**
     * Refresh Firebase authentication user.
     */
    const refreshUser = useCallback(async () => {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            setCurrentUser(null);
            setProfile(null);

            return null;
        }

        try {
            await firebaseUser.reload();

            const refreshedUser = auth.currentUser;

            if (!refreshedUser) {
                setCurrentUser(null);
                setProfile(null);

                return null;
            }

            const authUser = buildAuthUser(refreshedUser);

            setCurrentUser(authUser);

            return authUser;
        } catch (error) {
            console.error(
                "Refresh user error:",
                error
            );

            return null;
        }
    }, [buildAuthUser]);


    /**
     * Subscription information.
     */
    const subscription = useMemo(
        () => profile?.subscription ?? null,
        [profile]
    );


    /**
     * Premium status.
     */
    const isPremium = useMemo(
        () => subscription?.status === "active",
        [subscription]
    );


    /**
     * Current subscription plan.
     */
    const currentPlan = useMemo(
        () => subscription?.plan || "Free",
        [subscription]
    );


    /**
     * Context value.
     */
    const value = useMemo(
        () => ({
            currentUser,
            profile,
            loading,

            isAuthenticated: Boolean(currentUser),

            refreshUser,

            subscription,
            isPremium,
            currentPlan,
        }),
        [
            currentUser,
            profile,
            loading,
            refreshUser,
            subscription,
            isPremium,
            currentPlan,
        ]
    );


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}