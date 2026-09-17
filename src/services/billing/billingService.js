// =====================================================
// KRYOLT BILLING SERVICE
// =====================================================

export const BILLING_STATUS = {

    ACTIVE: "active",

    PENDING: "pending",

    FAILED: "failed",

    CANCELLED: "cancelled",

    EXPIRED: "expired",

};


export const PAYMENT_STATUS = {

    CREATED: "created",

    PENDING: "pending",

    SUCCESS: "success",

    FAILED: "failed",

};


export const PAYMENT_PROVIDERS = {

    RAZORPAY: "razorpay",

};


// =====================================================
// API
// =====================================================

const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";


// =====================================================
// HELPERS
// =====================================================

function normalizeCouponCode(code) {

    return String(code || "")
        .trim()
        .toUpperCase();

}


function normalizePlan(plan) {

    if (!plan) {
        return null;
    }


    if (typeof plan === "string") {

        return plan
            .trim()
            .toLowerCase();

    }


    return String(

        plan.id ||
        plan.title ||
        ""

    )
        .trim()
        .toLowerCase();

}


function normalizeMoney(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {

        return 0;

    }


    return Number(
        number.toFixed(2)
    );

}


// =====================================================
// API REQUEST
// =====================================================

async function postJSON(
    endpoint,
    body
) {

    const response =
        await fetch(

            `${API_BASE_URL}${endpoint}`,

            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify(body),
            }

        );


    let data;


    try {

        data =
            await response.json();

    } catch {

        throw new Error(
            "Invalid response from payment server."
        );

    }


    if (
        !response.ok ||
        !data?.success
    ) {

        throw new Error(

            data?.message ||
            "Payment server request failed."

        );

    }


    return data;

}


// =====================================================
// BILLING DATA
// =====================================================

export const createBillingData = ({

    userId,

    plan,

    couponCode = null,

}) => {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    if (!plan) {

        throw new Error(
            "Plan is required."
        );

    }


    return {

        userId,

        planId:
            plan.id,

        planName:
            plan.title,

        amount:
            normalizeMoney(
                plan.price
            ),

        currency:
            plan.currency ||
            "INR",

        billingCycle:
            plan.billingCycle ||
            "monthly",

        couponCode:
            normalizeCouponCode(
                couponCode
            ) || null,

        paymentProvider:
            PAYMENT_PROVIDERS.RAZORPAY,

        paymentStatus:
            PAYMENT_STATUS.CREATED,

        billingStatus:
            BILLING_STATUS.PENDING,

        createdAt:
            new Date(),

    };

};


// =====================================================
// CHECKOUT PREVIEW
// =====================================================
//
// BACKEND IS THE ONLY PRICING AUTHORITY.
//
// Original price comes from server.
// Discount comes ONLY from coupon.
// No promotional discount.
// =====================================================

export const createCheckout = async ({

    userId,

    plan,

    couponCode = null,

}) => {

    if (!userId) {

        throw new Error(
            "User must be logged in."
        );

    }


    if (!plan) {

        throw new Error(
            "Plan is required."
        );

    }


    const planValue =
        normalizePlan(plan);


    if (!planValue) {

        throw new Error(
            "Invalid subscription plan."
        );

    }


    const normalizedCoupon =
        normalizeCouponCode(
            couponCode
        );


    const data =
        await postJSON(

            "/api/payment/preview",

            {

                userId,

                plan:
                    planValue,

                couponCode:
                    normalizedCoupon ||
                    null,

            }

        );


    const pricing =
        data?.pricing ||
        {};


    const subtotal =
        normalizeMoney(
            pricing.subtotal
        );


    const discount =
        normalizeMoney(
            pricing.discount
        );


    const tax =
        normalizeMoney(
            pricing.tax
        );


    const total =
        normalizeMoney(
            pricing.total
        );


    const expectedTotal =
        normalizeMoney(

            subtotal -
            discount +
            tax

        );


    if (
        total !==
        expectedTotal
    ) {

        throw new Error(
            "Payment pricing response is inconsistent. Please refresh and try again."
        );

    }


    const checkoutSummary = {

        plan:
            pricing.plan ||
            planValue,

        currency:
            pricing.currency ||
            "INR",

        subtotal,

        discount,

        tax,

        total,

        amountSaved:
            discount,

        coupon:
            pricing.coupon ||
            null,

    };


    return {

        success: true,

        billingData:
            createBillingData({

                userId,

                plan: {

                    id:
                        plan.id ||
                        planValue,

                    title:
                        plan.title ||
                        pricing.plan,

                    price:
                        subtotal,

                    currency:
                        pricing.currency ||
                        "INR",

                    billingCycle:
                        plan.billingCycle ||
                        "monthly",

                },

                couponCode:
                    normalizedCoupon ||
                    null,

            }),


        checkoutSummary,


        pricing,


        message:
            "Checkout pricing calculated successfully.",

    };

};


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

export const createOrder = async ({

    userId,

    plan,

    couponCode = null,

}) => {

    if (!userId) {

        throw new Error(
            "User must be logged in."
        );

    }


    if (!plan) {

        throw new Error(
            "Plan is required."
        );

    }


    const planValue =
        normalizePlan(plan);


    if (!planValue) {

        throw new Error(
            "Invalid subscription plan."
        );

    }


    const normalizedCoupon =
        normalizeCouponCode(
            couponCode
        );


    const data =
        await postJSON(

            "/api/payment/create-order",

            {

                userId,

                plan:
                    planValue,

                couponCode:
                    normalizedCoupon ||
                    null,

            }

        );


    if (!data?.order?.id) {

        throw new Error(
            "Razorpay order was not created."
        );

    }


    return {

        success: true,

        order:
            data.order,

        pricing:
            data.pricing ||
            null,

    };

};


// =====================================================
// VERIFY PAYMENT
// =====================================================

export const verifyPayment = async ({

    userId,

    plan,

    paymentId,

    orderId,

    signature,

}) => {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    if (!plan) {

        throw new Error(
            "Plan is required."
        );

    }


    if (!paymentId) {

        throw new Error(
            "Payment ID is missing."
        );

    }


    if (!orderId) {

        throw new Error(
            "Order ID is missing."
        );

    }


    if (!signature) {

        throw new Error(
            "Payment signature is missing."
        );

    }


    const planValue =
        normalizePlan(plan);


    if (!planValue) {

        throw new Error(
            "Invalid subscription plan."
        );

    }


    const data =
        await postJSON(

            "/api/payment/verify-payment",

            {

                userId,

                plan:
                    planValue,

                razorpay_payment_id:
                    paymentId,

                razorpay_order_id:
                    orderId,

                razorpay_signature:
                    signature,

            }

        );


    return {

        success: true,

        verified: true,

        payment:
            data.payment ||
            null,

        pricing:
            data.pricing ||
            null,

        subscription:
            data.subscription ||
            null,

        message:
            data.message ||
            "Payment verified successfully.",

    };

};


// =====================================================
// ACTIVATE SUBSCRIPTION
// =====================================================

export const activateSubscription = async ({

    userId,

    planId,

    subscriptionId = null,

}) => {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    if (!planId) {

        throw new Error(
            "Plan ID is required."
        );

    }


    return {

        success: true,

        handledByBackend: true,

        message:
            "Subscription activation is handled by the payment backend.",

        userId,

        planId,

        subscriptionId,

    };

};


// =====================================================
// CANCEL SUBSCRIPTION
// =====================================================

export const cancelSubscription = async ({

    userId,

    subscriptionId,

}) => {

    if (!userId) {

        throw new Error(
            "User ID is required."
        );

    }


    if (!subscriptionId) {

        throw new Error(
            "Subscription ID is required."
        );

    }


    return postJSON(

        "/api/payment/cancel-subscription",

        {

            userId,

            subscriptionId,

        }

    );

};