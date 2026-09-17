import { adminDb } from "./firebaseAdmin.js";


// =====================================================
// ADD ONE BILLING MONTH
// =====================================================

function addOneMonth(date) {

    const result = new Date(date);

    const originalDay = result.getDate();

    result.setMonth(
        result.getMonth() + 1
    );

    // Handles:
    // Jan 31 -> Feb end
    // Mar 31 -> Apr end
    if (
        result.getDate() !== originalDay
    ) {

        result.setDate(0);

    }

    return result;
}


// =====================================================
// NORMALIZE MONEY
// =====================================================

function normalizeMoney(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Number(
        number.toFixed(2)
    );
}


// =====================================================
// NORMALIZE PLAN
// =====================================================

function normalizePlan(plan) {

    if (!plan) {
        return null;
    }

    const value =
        String(plan)
            .trim()
            .toLowerCase();

    if (value === "professional") {
        return "Professional";
    }

    if (value === "business") {
        return "Business";
    }

    return null;
}


// =====================================================
// ACTIVATE PLAN
// =====================================================

export async function activatePlan({

    userId,

    orderId,

    paymentId,

    plan,

    amount,

    couponCode = null,

    discount = 0,

    originalAmount = null,

    creator = null,

    campaign = null,

}) {

    // =================================================
    // VALIDATION
    // =================================================

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }

    if (!orderId) {

        throw new Error(
            "Order ID is required."
        );

    }

    if (!paymentId) {

        throw new Error(
            "Payment ID is required."
        );

    }

    if (!plan) {

        throw new Error(
            "Plan is required."
        );

    }


    // =================================================
    // PLAN
    // =================================================

    const finalPlan =
        normalizePlan(plan);

    if (!finalPlan) {

        throw new Error(
            "Invalid subscription plan."
        );

    }


    // =================================================
    // AMOUNTS
    // =================================================

    const paidAmount =
        normalizeMoney(amount);

    const discountAmount =
        normalizeMoney(discount);

    const originalPlanAmount =
        normalizeMoney(
            originalAmount !== null
                ? originalAmount
                : paidAmount + discountAmount
        );


    // -------------------------------------------------
    // BASIC AMOUNT VALIDATION
    // -------------------------------------------------

    if (
        paidAmount <= 0
    ) {

        throw new Error(
            "Invalid subscription payment amount."
        );

    }

    if (
        discountAmount < 0
    ) {

        throw new Error(
            "Invalid subscription discount."
        );

    }

    if (
        originalPlanAmount <= 0
    ) {

        throw new Error(
            "Invalid original subscription amount."
        );

    }


    // =================================================
    // PRICING CONSISTENCY CHECK
    // =================================================
    //
    // IMPORTANT:
    //
    // Original price
    // - coupon discount
    // = amount paid
    //
    // There is NO promotional discount here.
    //

    const calculatedPaidAmount =
        normalizeMoney(
            originalPlanAmount -
            discountAmount
        );


    if (
        calculatedPaidAmount !==
        paidAmount
    ) {

        console.error(
            "❌ Subscription pricing mismatch",
            {
                originalPlanAmount,
                discountAmount,
                paidAmount,
                calculatedPaidAmount,
            }
        );

        throw new Error(
            "Subscription pricing verification failed."
        );

    }


    // =================================================
    // FIRESTORE USER
    // =================================================

    const userRef =
        adminDb
            .collection("users")
            .doc(userId);


    const userSnapshot =
        await userRef.get();


    const userData =
        userSnapshot.exists
            ? userSnapshot.data()
            : {};


    const existingSubscription =
        userData.subscription ||
        null;


    // =================================================
    // IDEMPOTENCY
    // =================================================
    //
    // Same Razorpay payment must never activate
    // the subscription twice.
    //

    if (
        existingSubscription?.paymentId ===
        paymentId
    ) {

        console.log(
            "ℹ️ Payment already processed.",
            {
                userId,
                paymentId,
            }
        );

        return existingSubscription;

    }


    // =================================================
    // DATES
    // =================================================

    const now =
        new Date();

    let startDate =
        now;


    // -------------------------------------------------
    // EXTEND EXISTING ACTIVE SUBSCRIPTION
    // -------------------------------------------------

    if (
        existingSubscription?.status ===
        "active" &&
        existingSubscription?.endDate
    ) {

        const existingEndDate =
            new Date(
                existingSubscription.endDate
            );


        if (
            Number.isFinite(
                existingEndDate.getTime()
            ) &&
            existingEndDate > now
        ) {

            startDate =
                existingEndDate;

        }

    }


    const endDate =
        addOneMonth(
            startDate
        );


    // =================================================
    // COUPON DATA
    // =================================================

    const normalizedCouponCode =
        couponCode
            ? String(couponCode)
                .trim()
                .toUpperCase()
            : null;


    const normalizedCreator =
        creator
            ? String(creator).trim()
            : null;


    const normalizedCampaign =
        campaign
            ? String(campaign).trim()
            : null;


    // =================================================
    // SUBSCRIPTION OBJECT
    // =================================================

    const subscription = {

        // ------------------------------------------------
        // PLAN
        // ------------------------------------------------

        plan:
            finalPlan,

        billingCycle:
            "monthly",


        // ------------------------------------------------
        // STATUS
        // ------------------------------------------------

        status:
            "active",


        // ------------------------------------------------
        // PRICING
        // ------------------------------------------------
        //
        // Example:
        //
        // originalAmount = 499
        // discount       = 199.60
        // amount         = 299.40
        //
        // ONLY coupon discount is stored.
        //

        amount:
            paidAmount,

        originalAmount:
            originalPlanAmount,

        discount:
            discountAmount,

        currency:
            "INR",


        // ------------------------------------------------
        // PAYMENT
        // ------------------------------------------------

        provider:
            "razorpay",

        orderId,

        paymentId,


        // ------------------------------------------------
        // COUPON
        // ------------------------------------------------

        couponCode:
            normalizedCouponCode,

        couponCreator:
            normalizedCreator,

        couponCampaign:
            normalizedCampaign,


        // ------------------------------------------------
        // SUBSCRIPTION DATES
        // ------------------------------------------------

        startDate:
            startDate.toISOString(),

        endDate:
            endDate.toISOString(),


        // ------------------------------------------------
        // UPDATED
        // ------------------------------------------------

        updatedAt:
            now.toISOString(),

    };


    // =================================================
    // SAVE TO FIRESTORE
    // =================================================

    await userRef.set(

        {
            subscription,
        },

        {
            merge: true,
        }

    );


    // =================================================
    // LOG
    // =================================================

    console.log(
        "✅ Subscription activated",
        {

            userId,

            plan:
                finalPlan,

            originalAmount:
                originalPlanAmount,

            couponDiscount:
                discountAmount,

            paidAmount,

            couponCode:
                normalizedCouponCode,

            creator:
                normalizedCreator,

            campaign:
                normalizedCampaign,

            orderId,

            paymentId,

            startDate:
                startDate.toISOString(),

            endDate:
                endDate.toISOString(),

        }
    );


    // =================================================
    // RETURN
    // =================================================

    return subscription;

}