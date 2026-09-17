import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    sendEmailVerification,
} from "firebase/auth";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../firebase/firebase";


// =====================================================
// GOOGLE PROVIDER
// =====================================================

const googleProvider =
    new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account",
});


// =====================================================
// NORMALIZE PLAN
// =====================================================
//
// IMPORTANT:
// Paid plans are NOT activated during signup.
//
// A user can only become Professional/Business
// after successful payment verification.
//
// Therefore new users always start as Free.
//
// =====================================================

const normalizePlan = (plan) => {

    if (!plan) {
        return "Free";
    }

    const value =
        String(plan)
            .trim()
            .toLowerCase();


    if (
        value === "professional" ||
        value === "pro"
    ) {

        return "Professional";

    }


    if (
        value === "business"
    ) {

        return "Business";

    }


    return "Free";

};


// =====================================================
// CREATE DEFAULT USER PROFILE
// =====================================================
//
// This profile is created ONLY for a new user.
//
// New users ALWAYS start with:
// plan = Free
// subscriptionStatus = active
//
// Paid plans are activated only after payment verification.
//
// =====================================================

const createDefaultUserProfile = (
    user,
    extraData = {}
) => {

    return {

        // =================================================
        // BASIC USER INFORMATION
        // =================================================

        uid:
            user.uid,

        name:
            extraData.name ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "User",

        email:
            user.email ||
            "",

        phone:
            user.phoneNumber ||
            "",

        avatar:
            user.photoURL ||
            "",


        // =================================================
        // WORKSPACE
        // =================================================

        workspace:
            "",

        company:
            "",

        industry:
            "",


        // =================================================
        // LOCATION
        // =================================================

        country:
            "India",

        timezone:
            "Asia/Kolkata",

        currency:
            "INR",


        // =================================================
        // ACCOUNT
        // =================================================

        role:
            "Owner",

        emailVerified: user.emailVerified,


        // =================================================
        // BILLING & SUBSCRIPTION
        // =================================================
        //
        // IMPORTANT:
        // Every new account starts on Free.
        //
        // selectedPlan from pricing page is NOT used
        // to directly activate a paid subscription.
        //
        // =================================================

        plan:
            "Free",

        subscriptionStatus:
            "active",

        billingCycle:
            null,

        subscriptionId:
            null,

        paymentProvider:
            null,

        currentPeriodStart:
            null,

        currentPeriodEnd:
            null,

        cancelAtPeriodEnd:
            false,

        lastPaymentId:
            null,

        lastPaymentStatus:
            null,


        // =================================================
        // USAGE
        // =================================================

        uploads:
            0,

        storageUsed:
            0,


        // =================================================
        // AI SETTINGS
        // =================================================

        aiLanguage:
            "English",

        reportStyle:
            "Professional",

        autoInsights:
            true,

        smartRecommendations:
            true,

        weeklyReports:
            false,


        // =================================================
        // APPEARANCE
        // =================================================

        theme:
            "System",

        accentColor:
            "#2563eb",

        compactMode:
            false,

        animations:
            true,

        chartStyle:
            "Modern",


        // =================================================
        // TIMESTAMPS
        // =================================================

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp(),

    };

};


// =====================================================
// CREATE OR GET USER PROFILE
// =====================================================
//
// Behaviour:
//
// NEW USER:
// Firebase Auth user
//       ↓
// Firestore profile created
//       ↓
// Free Plan
//
// EXISTING USER:
// Firebase Auth user
//       ↓
// Existing Firestore profile returned
//       ↓
// Existing plan preserved
//
// If an old user somehow has no Firestore profile,
// a new Free profile will be created.
//
// =====================================================

export async function createOrGetUserProfile(
    user,
    extraData = {}
) {

    if (!user) {

        throw new Error(
            "User is required."
        );

    }


    if (!db) {

        throw new Error(
            "Firestore is not initialized."
        );

    }


    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    const userSnap =
        await getDoc(
            userRef
        );


    // =================================================
    // EXISTING USER
    // =================================================

    if (
        userSnap.exists()
    ) {

        const existingData =
            userSnap.data();


        return {

            id:
                userSnap.id,

            ...existingData,

        };

    }


    // =================================================
    // NEW USER
    // =================================================

    const newUserProfile =
        createDefaultUserProfile(
            user,
            extraData
        );


    await setDoc(
        userRef,
        newUserProfile
    );


    console.log(
        "🟢 New Firestore profile created:",
        user.email
    );


    return {

        id:
            user.uid,

        ...newUserProfile,

    };

};


// =====================================================
// EMAIL LOGIN
// =====================================================
//
// Existing email/password users can login directly.
//
// After Firebase Authentication,
// we also ensure their Firestore profile exists.
//
// =====================================================

export async function loginWithEmail(
    email,
    password
) {

    if (
        !email?.trim() ||
        !password
    ) {

        throw new Error(
            "Email and password are required."
        );

    }


    // =================================================
    // FIREBASE EMAIL LOGIN
    // =================================================

    const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
        );


    const user =
        userCredential.user;

    console.log(
        "🟢 Email login successful:",
        user.email
    );


    // =================================================
    // ENSURE FIRESTORE PROFILE EXISTS
    // =================================================

    try {

        const profile =
            await createOrGetUserProfile(
                user
            );

        await setDoc(
            doc(db, "users", user.uid),
            {
                emailVerified: user.emailVerified,
                lastLogin: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );


        console.log(
            "🟢 Email user profile ready:",
            profile.plan
        );


        return {

            user,

            profile,

        };

    } catch (error) {

        console.error(
            "⚠️ Firestore profile initialization failed:",
            error
        );


        // Authentication was successful.
        // Return user even if Firestore temporarily fails.

        return {

            user,

            profile:
                null,

        };

    }

};


// =====================================================
// EMAIL SIGNUP
// =====================================================
//
// New user:
// Firebase Auth account
//       ↓
// Display name
//       ↓
// Firestore profile
//       ↓
// Free Plan
//
// selectedPlan is accepted for future checkout flow,
// but it does NOT activate paid subscription.
//
// =====================================================

export async function signupWithEmail(
    name,
    email,
    password,
    selectedPlan = "Free"
) {

    if (
        !name?.trim() ||
        !email?.trim() ||
        !password
    ) {

        throw new Error(
            "Name, email and password are required."
        );

    }


    // =================================================
    // CREATE FIREBASE AUTH ACCOUNT
    // =================================================

    const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
        );


    const user =
        userCredential.user;


    // =================================================
    // ADD DISPLAY NAME
    // =================================================

    await updateProfile(
        user,
        {

            displayName:
                name.trim(),

        }
    );

    // Send verification email
    await sendEmailVerification(user);

    // Refresh user
    await user.reload();

    // =================================================
    // CREATE FIRESTORE PROFILE
    // =================================================

    try {

        const profile =
            await createOrGetUserProfile(
                user,
                {

                    name:
                        name.trim(),

                    // Store only for future flow if needed.
                    // It will NOT change the user's plan.

                    selectedPlan:
                        normalizePlan(
                            selectedPlan
                        ),

                }
            );

        await setDoc(
            doc(db, "users", user.uid),
            {
                emailVerified: false,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );


        console.log(
            "🟢 Email signup profile ready:",
            profile.plan
        );


        return {

            user,

            profile,

        };

    } catch (error) {

        console.error(
            "⚠️ Firestore profile creation failed:",
            error
        );


        // Auth account was successfully created.

        return {

            user,

            profile:
                null,

        };

    }

};


// =====================================================
// GOOGLE LOGIN / SIGNUP
// =====================================================
//
// ONE FUNCTION HANDLES BOTH:
//
// NEW GOOGLE USER:
// Google Popup
//       ↓
// Firebase creates account
//       ↓
// Firestore profile created
//       ↓
// Free Plan
//
// EXISTING GOOGLE USER:
// Google Popup
//       ↓
// Firebase login
//       ↓
// Existing Firestore profile loaded
//       ↓
// Existing plan preserved
//
// =====================================================

export async function loginWithGoogle(
    selectedPlan = "Free"
) {

    console.log(
        "1️⃣ Google authentication started"
    );


    // =================================================
    // GOOGLE AUTHENTICATION
    // =================================================

    const result =
        await signInWithPopup(
            auth,
            googleProvider
        );


    const user =
        result.user;


    console.log(
        "2️⃣ Google authentication successful:",
        user.email
    );


    // =================================================
    // ENSURE FIRESTORE PROFILE EXISTS
    // =================================================

    try {

        const profile =
            await createOrGetUserProfile(
                user,
                {

                    selectedPlan:
                        normalizePlan(
                            selectedPlan
                        ),

                }
            );


        console.log(
            "🟢 Google user profile ready:",
            profile.plan
        );


        return {

            user,

            profile,

        };

    } catch (error) {

        console.error(
            "⚠️ Google profile initialization failed:",
            error
        );


        // Firebase Authentication succeeded.
        // Firestore failed temporarily.

        return {

            user,

            profile:
                null,

        };

    }

};


// =====================================================
// LOGOUT
// =====================================================

export async function logoutUser() {

    await signOut(
        auth
    );


    console.log(
        "🔴 User logged out"
    );

};