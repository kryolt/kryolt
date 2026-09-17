import {
    doc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

// =====================================================
// SUBSCRIPTION SERVICE
// =====================================================

// -----------------------------------------------------
// Get calendar-month expiry
// -----------------------------------------------------
// Important:
// Subscription fixed 30 days ki nahi hai.
//
// Example:
// Jan 10  -> Feb 10
// Feb 10  -> Mar 10
//
// Isse billing monthly calendar cycle par rahegi.
// -----------------------------------------------------

function getNextMonthDate(startDate) {

    const date =
        new Date(startDate);

    const originalDay =
        date.getDate();

    date.setDate(1);

    date.setMonth(
        date.getMonth() + 1
    );

    // Last day of next month
    const lastDay =
        new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
        ).getDate();

    date.setDate(
        Math.min(
            originalDay,
            lastDay
        )
    );

    return date;
}


// =====================================================
// ACTIVATE PLAN
// =====================================================

export async function activatePlan({

    userId,

    plan,

    paymentId,

    orderId,

    amount,

    currency = "INR",

}) {

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!userId) {

        throw new Error(
            "User ID missing"
        );

    }

    if (!plan) {

        throw new Error(
            "Subscription plan missing"
        );

    }

    if (!paymentId) {

        throw new Error(
            "Payment ID missing"
        );

    }

    if (!orderId) {

        throw new Error(
            "Order ID missing"
        );

    }


    // -------------------------------------------------
    // NORMALIZE PLAN
    // -------------------------------------------------

    const normalizedPlan =
        String(plan)
            .trim()
            .toLowerCase();


    let finalPlan;


    if (
        normalizedPlan ===
        "professional"
    ) {

        finalPlan =
            "Professional";

    }

    else if (
        normalizedPlan ===
        "business"
    ) {

        finalPlan =
            "Business";

    }

    else {

        throw new Error(
            "Invalid subscription plan"
        );

    }


    // -------------------------------------------------
    // SUBSCRIPTION DATES
    // -------------------------------------------------

    const startDate =
        new Date();

    const endDate =
        getNextMonthDate(
            startDate
        );


    // -------------------------------------------------
    // USER DOCUMENT
    // -------------------------------------------------

    const userRef =
        doc(
            db,
            "users",
            userId
        );


    // -------------------------------------------------
    // UPDATE SUBSCRIPTION
    // -------------------------------------------------

    await setDoc(

        userRef,

        {

            subscription: {

                plan:
                    finalPlan,

                status:
                    "active",

                amount:
                    Number(amount) || 0,

                currency,

                paymentId,

                orderId,

                billingCycle:
                    "monthly",

                startDate,

                endDate,

                updatedAt:
                    serverTimestamp(),

            },

        },

        {
            merge: true,
        }

    );


    console.log(
        `✅ ${finalPlan} plan activated`
    );


    // -------------------------------------------------
    // RETURN
    // -------------------------------------------------

    return {

        plan:
            finalPlan,

        status:
            "active",

        amount:
            Number(amount) || 0,

        currency,

        paymentId,

        orderId,

        startDate,

        endDate,

    };

}


// =====================================================
// PROFESSIONAL PLAN
// =====================================================

export async function activateProfessionalPlan({

    userId,

    paymentId,

    orderId,

    amount,

}) {

    return activatePlan({

        userId,

        plan:
            "Professional",

        paymentId,

        orderId,

        amount,

    });

}


// =====================================================
// BUSINESS PLAN
// =====================================================

export async function activateBusinessPlan({

    userId,

    paymentId,

    orderId,

    amount,

}) {

    return activatePlan({

        userId,

        plan:
            "Business",

        paymentId,

        orderId,

        amount,

    });

}