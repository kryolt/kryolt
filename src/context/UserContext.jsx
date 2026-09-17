/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";

import { useAuth } from "./useAuth";

import {
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";


const UserContext = createContext(null);


const STORAGE_KEY = "kryolt_user_profile";


const DEFAULT_USER = {

    // ========================================
    // BASIC
    // ========================================

    uid: "",

    name: "",

    email: "",

    phone: "",

    avatar: "",

    role: "Owner",


    // ========================================
    // WORKSPACE
    // ========================================

    workspaceCount: 1,

    company: "",

    industry: "",


    // ========================================
    // LOCATION
    // ========================================

    country: "India",

    timezone: "Asia/Kolkata",

    currency: "INR",


    // ========================================
    // PLAN
    // ========================================

    plan: "Free",

    subscriptionStatus: "inactive",

    billingCycle: null,

    currentPeriodStart: null,

    currentPeriodEnd: null,

    cancelAtPeriodEnd: false,


    // ========================================
    // USAGE
    // ========================================

    uploads: 0,

    storageUsed: 0,


    // ========================================
    // AI
    // ========================================

    aiLanguage: "English",

    reportStyle: "Professional",

    autoInsights: true,

    smartRecommendations: true,

    weeklyReports: false,


    // ========================================
    // APPEARANCE
    // ========================================

    theme: "System",

    accentColor: "#2563eb",

    compactMode: false,

    animations: true,

    chartStyle: "Modern",

};


// =====================================================
// SUBSCRIPTION DATE HELPERS
// =====================================================

const getSubscriptionEndDate = (subscription = {}) => {

    const rawEndDate =
        subscription?.endDate ||
        subscription?.currentPeriodEnd ||
        null;

    if (!rawEndDate) {
        return null;
    }

    /*
     * Firestore Timestamp
     */
    if (
        typeof rawEndDate === "object" &&
        typeof rawEndDate.toDate === "function"
    ) {

        const date =
            rawEndDate.toDate();

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    }


    /*
     * JavaScript Date
     */
    if (
        rawEndDate instanceof Date
    ) {

        return Number.isNaN(
            rawEndDate.getTime()
        )
            ? null
            : rawEndDate;
    }


    /*
     * ISO string / timestamp
     */
    const date =
        new Date(rawEndDate);

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;

};


const isSubscriptionExpired = (
    subscription = {}
) => {

    const endDate =
        getSubscriptionEndDate(
            subscription
        );

    /*
     * Existing users without an
     * endDate keep existing behaviour.
     */
    if (!endDate) {
        return false;
    }

    return (
        endDate.getTime() <=
        Date.now()
    );

};


export function UserProvider({ children }) {

    const { currentUser } =
        useAuth();


    const [user, setUser] =
        useState(() => {

            try {

                const cached =
                    localStorage.getItem(
                        STORAGE_KEY
                    );

                if (!cached)
                    return DEFAULT_USER;

                return {

                    ...DEFAULT_USER,

                    ...JSON.parse(cached),

                };

            }

            catch {

                return DEFAULT_USER;

            }

        });


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState(null);


    // ========================================
    // SAVE CACHE
    // ========================================

    const saveCache =
        useCallback(
            (data) => {

                try {

                    localStorage.setItem(

                        STORAGE_KEY,

                        JSON.stringify(data)

                    );

                }

                catch (err) {

                    console.error(

                        "Cache save failed",

                        err

                    );

                }

            },
            []
        );


    // ========================================
    // CLEAR CACHE
    // ========================================

    const clearCache =
        useCallback(() => {

            try {

                localStorage.removeItem(
                    STORAGE_KEY
                );

            }

            catch {
                // Cache may already be unavailable or removed.
            }

        }, []);


    // ========================================
    // LOAD PROFILE
    // ========================================

    const loadProfile =
        useCallback(

            async (uid) => {

                try {

                    const profileRef =
                        doc(
                            db,
                            "users",
                            uid
                        );


                    const snap =
                        await getDoc(
                            profileRef
                        );


                    if (!snap.exists()) {

                        return null;

                    }


                    return {

                        id: snap.id,

                        ...DEFAULT_USER,

                        ...snap.data(),

                    };

                }

                catch (err) {

                    console.error(

                        "Profile load error",

                        err

                    );

                    return null;

                }

            },

            []

        );


    // ========================================
    // REALTIME LISTENER
    // ========================================

    useEffect(() => {

        if (!currentUser) {

            const resetTimer = setTimeout(() => {
                setUser(DEFAULT_USER);
                clearCache();
                setLoading(false);
            }, 0);

            return () => clearTimeout(resetTimer);

        }


        const loadingTimer = setTimeout(() => {
            setLoading(true);
            setError(null);
        }, 0);

        const ref =
            doc(
                db,
                "users",
                currentUser.uid
            );


        const unsubscribe =
            onSnapshot(

                ref,

                async (snapshot) => {

                    if (snapshot.exists()) {

                        const firestoreData =
                            snapshot.data();


                        const firestoreUser = {

                            ...DEFAULT_USER,

                            ...firestoreData,

                        };


                        const subscription =
                            firestoreData?.subscription ||
                            {};


                        const expired =
                            isSubscriptionExpired(
                                subscription
                            );


                        const topLevelPlan =
                            String(
                                firestoreData?.plan ||
                                "Free"
                            )
                                .trim()
                                .toLowerCase();


                        const nestedPlan =
                            String(
                                subscription?.plan ||
                                ""
                            )
                                .trim()
                                .toLowerCase();


                        const currentStatus =
                            String(
                                firestoreData?.subscriptionStatus ||
                                ""
                            )
                                .trim()
                                .toLowerCase();


                        const nestedStatus =
                            String(
                                subscription?.status ||
                                ""
                            )
                                .trim()
                                .toLowerCase();


                        const isPaidSubscription =
                            (
                                topLevelPlan !==
                                "free"
                            ) ||
                            (
                                nestedPlan !==
                                "" &&
                                nestedPlan !==
                                "free"
                            );


                        const isActiveSubscription =
                            currentStatus ===
                            "active" ||

                            currentStatus ===
                            "paid" ||

                            currentStatus ===
                            "trialing" ||

                            nestedStatus ===
                            "active" ||

                            nestedStatus ===
                            "paid" ||

                            nestedStatus ===
                            "trialing";


                        /*
                         * ====================================
                         * SUBSCRIPTION EXPIRY
                         * ====================================
                         *
                         * Existing subscription has reached
                         * its endDate.
                         *
                         * We only expire it when:
                         *
                         * 1. It has an actual endDate
                         * 2. It is a paid subscription
                         * 3. It is currently active
                         *
                         * Payment history, coupon data,
                         * orderId, paymentId etc. are preserved.
                         */

                        if (

                            expired &&

                            isPaidSubscription &&

                            isActiveSubscription

                        ) {


                            const expiredUser = {

                                ...firestoreUser,


                                /*
                                 * Main plan becomes Free
                                 */

                                plan: "Free",


                                /*
                                 * Existing application uses
                                 * subscriptionStatus for access.
                                 */

                                subscriptionStatus:
                                    "inactive",


                                billingCycle:
                                    null,


                                currentPeriodStart:
                                    null,


                                currentPeriodEnd:
                                    null,


                                /*
                                 * Preserve all existing
                                 * subscription information
                                 * such as coupon/order/payment.
                                 */

                                subscription: {

                                    ...subscription,

                                    plan: "Free",

                                    status: "expired",

                                },

                            };


                            /*
                             * Update UI immediately.
                             */

                            setUser(
                                expiredUser
                            );


                            saveCache(
                                expiredUser
                            );


                            /*
                             * Sync the expiry state
                             * back to Firestore.
                             *
                             * We don't modify:
                             *
                             * couponCode
                             * couponCampaign
                             * couponCreator
                             * orderId
                             * paymentId
                             * originalAmount
                             * discount
                             * amount
                             */

                            try {

                                await updateDoc(

                                    ref,

                                    {

                                        plan: "Free",

                                        subscriptionStatus:
                                            "inactive",

                                        billingCycle:
                                            null,

                                        currentPeriodStart:
                                            null,

                                        currentPeriodEnd:
                                            null,

                                        subscription: {

                                            ...subscription,

                                            plan: "Free",

                                            status:
                                                "expired",

                                        },

                                    }

                                );

                            }

                            catch (err) {

                                console.error(

                                    "Subscription expiry sync failed",

                                    err

                                );

                            }

                        }

                        else {

                            /*
                             * Normal existing behaviour.
                             */

                            setUser(
                                firestoreUser
                            );

                            saveCache(
                                firestoreUser
                            );

                        }

                    }

                    else {

                        const fallback = {

                            ...DEFAULT_USER,

                            uid:
                                currentUser.uid,

                            name:
                                currentUser.displayName ||

                                currentUser.email?.split(
                                    "@"
                                )[0] ||

                                "User",

                            email:
                                currentUser.email ||
                                "",

                            avatar:
                                currentUser.photoURL ||
                                "",

                        };


                        setUser(
                            fallback
                        );


                        saveCache(
                            fallback
                        );

                    }


                    setLoading(false);

                },


                (err) => {

                    console.error(
                        err
                    );


                    setError(
                        err
                    );


                    setLoading(false);

                }

            );


        return () => {
            clearTimeout(loadingTimer);
            unsubscribe();
        };


    }, [

        currentUser,

        saveCache,

        clearCache,

    ]);


    // ========================================
    // REFRESH PROFILE
    // ========================================

    const refreshProfile =
        useCallback(

            async () => {

                if (!currentUser) {

                    setUser(
                        DEFAULT_USER
                    );

                    clearCache();

                    return;

                }


                setLoading(true);


                const profile =
                    await loadProfile(
                        currentUser.uid
                    );


                if (profile) {

                    setUser(
                        profile
                    );

                    saveCache(
                        profile
                    );

                }


                setLoading(false);

            },

            [

                currentUser,

                loadProfile,

                saveCache,

                clearCache,

            ]

        );


    // ========================================
    // UPDATE LOCAL USER
    // ========================================

    const updateUser =
        useCallback(

            async (data) => {

                if (!currentUser)
                    return;


                try {

                    const ref =
                        doc(
                            db,
                            "users",
                            currentUser.uid
                        );


                    await updateDoc(
                        ref,
                        data
                    );


                    // Snapshot automatically UI update kar dega

                }

                catch (err) {

                    console.error(

                        "Profile Update Failed",

                        err

                    );

                }

            },

            [currentUser]

        );


    // ========================================
    // UPDATE STORAGE
    // ========================================

    const updateStorage =
        useCallback(

            async (sizeInMB) => {

                if (!currentUser)
                    return;


                try {

                    const ref =
                        doc(
                            db,
                            "users",
                            currentUser.uid
                        );


                    await updateDoc(

                        ref,

                        {

                            storageUsed:
                                Number(
                                    sizeInMB
                                ),

                        }

                    );

                }

                catch (err) {

                    console.error(

                        "Storage Update Failed",

                        err

                    );

                }

            },

            [currentUser]

        );


    // ========================================
    // RESET USER
    // ========================================

    const resetUser =
        useCallback(

            () => {

                setUser(
                    DEFAULT_USER
                );

                clearCache();

            },

            [clearCache]

        );


    // ========================================
    // PLAN HELPERS
    // ========================================

    const subscription = useMemo(
        () => user.subscription || {},
        [user.subscription]
    );


    const plan =
        String(

            subscription.plan ||

            user.plan ||

            "Free"

        )
            .trim()
            .toLowerCase();


    const subscriptionStatus =
        String(

            subscription.status ||

            user.subscriptionStatus ||

            "inactive"

        )
            .trim()
            .toLowerCase();


    // ========================================
    // SUBSCRIPTION EXPIRY STATUS
    // ========================================

    const subscriptionExpired =
        isSubscriptionExpired(
            subscription
        );


    // ========================================
    // PLAN HELPERS
    // ========================================

    const isFreePlan =
        plan === "free";


    const isProfessional =
        plan === "professional";


    const isBusiness =
        plan === "business";


    const isPaidPlan =
        isProfessional || isBusiness;


    /*
     * Premium access now requires:
     *
     * 1. Paid plan
     * 2. Active subscription
     * 3. Subscription has not expired
     */

    const hasPremiumAccess =

        isPaidPlan &&

        subscriptionStatus ===
        "active" &&

        !subscriptionExpired;


    // ========================================
    // CONTEXT VALUE
    // ========================================

    const value =
        useMemo(

            () => ({

                user,

                loading,

                error,

                refreshProfile,

                updateUser,

                updateStorage,

                resetUser,

                plan,

                subscription,

                subscriptionStatus,

                subscriptionExpired,

                isFreePlan,

                isProfessional,

                isBusiness,

                isPaidPlan,

                hasPremiumAccess,

            }),

            [

                user,

                loading,

                error,

                refreshProfile,

                updateUser,

                updateStorage,

                resetUser,

                plan,

                subscription,

                subscriptionStatus,

                subscriptionExpired,

                isFreePlan,

                isProfessional,

                isBusiness,

                isPaidPlan,

                hasPremiumAccess,

            ]

        );


    // ========================================
    // PROVIDER
    // ========================================

    return (

        <UserContext.Provider
            value={value}
        >

            {children}

        </UserContext.Provider>

    );

}


// ========================================
// CUSTOM HOOK
// ========================================

export function useUser() {

    const context =
        useContext(
            UserContext
        );


    if (!context) {

        throw new Error(

            "useUser must be used inside UserProvider"

        );

    }


    return context;

}