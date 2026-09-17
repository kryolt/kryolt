import crypto from "crypto";

import razorpay from "../services/razorpayService.js";
import { activatePlan } from "../services/subscriptionService.js";
import { PRICING } from "../config/pricing.js";
import { getCoupon } from "../config/coupons.js";
import { adminDb } from "../services/firebaseAdmin.js";
import { FieldValue } from "firebase-admin/firestore";


// =====================================================
// PLAN NORMALIZER
// =====================================================

const normalizePlan = (plan) => {

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
};


// =====================================================
// MONEY NORMALIZER
// =====================================================

const normalizeMoney = (value) => {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Number(
        number.toFixed(2)
    );

};


// =====================================================
// GET SERVER PLAN PRICE
// =====================================================

function getServerPlanPrice(plan) {

    const normalizedPlan =
        normalizePlan(plan);

    if (!normalizedPlan) {

        throw new Error(
            "Invalid subscription plan."
        );

    }

    const amount =
        Number(
            PRICING[normalizedPlan]
        );

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        throw new Error(
            "Invalid subscription price."
        );

    }

    return normalizeMoney(amount);

}


// =====================================================
// CHECK NEW USER
// =====================================================
//
// IMPORTANT:
//
// A new user means the user has NEVER completed
// a successful paid subscription.
//
// If the user has an existing subscription/payment
// record, they are NOT considered a new user.
//
// Expired subscription also remains an old user.
// =====================================================

async function isNewUser(userId) {

    if (!userId) {
        return false;
    }

    const userRef =
        adminDb
            .collection("users")
            .doc(userId);

    const userSnapshot =
        await userRef.get();

    // User document does not exist
    // → new user

    if (!userSnapshot.exists) {
        return true;
    }

    const userData =
        userSnapshot.data() || {};

    const subscription =
        userData.subscription || null;


    // -------------------------------------------------
    // ANY PREVIOUS PAYMENT / SUBSCRIPTION
    // -------------------------------------------------
    //
    // Current subscription structure stores:
    // - paymentId
    // - orderId
    //
    // Either one means the user has already gone
    // through a successful payment.
    //

    const hasPaidBefore =
        Boolean(
            subscription?.paymentId ||
            subscription?.orderId
        );


    if (hasPaidBefore) {
        return false;
    }


    // -------------------------------------------------
    // EXISTING SUBSCRIPTION RECORD
    // -------------------------------------------------
    //
    // Safety check for older data where paymentId/orderId
    // might not exist but subscription was already created.
    //

    if (subscription) {
        return false;
    }


    return true;

}


// =====================================================
// COUPON USAGE HELPERS (NEW)
// =====================================================
//
// Coupon usage is tracked in three dedicated collections,
// keyed off the Firebase `uid` (never email):
//
// - couponRedemptions/{razorpay_payment_id}
//     One doc per *successfully verified payment* that
//     consumed a coupon. Because the doc id is the Razorpay
//     payment id, re-verifying the same payment (duplicate
//     webhook/client retry) is naturally idempotent — the
//     doc already exists and nothing is double-counted.
//
// - couponUserUsage/{couponCode}__{uid}
//     Tracks how many times this exact user has redeemed
//     this exact coupon. Used to enforce `perUserLimit`.
//
// - couponUsageCounters/{couponCode}
//     Tracks total successful redemptions for the coupon.
//     Used to enforce `usageLimit`. Only created/used when
//     `usageLimit` is a finite positive number — a `null`
//     usageLimit means "no cap" and this doc is never read
//     or written for that coupon.
//
// These are all read-only lookups until recordCouponUsage()
// runs inside a Firestore transaction *after* a payment has
// been verified — see the "VERY IMPORTANT" note in the task:
// previewCheckout/calculateDiscount/createOrder must never
// permanently consume usage.
// =====================================================

class CouponRejectedError extends Error {

    constructor(message) {
        super(message);
        this.name = "CouponRejectedError";
    }

}

function userUsageDocId(couponCode, userId) {
    return `${couponCode}__${userId}`;
}

function hasFiniteUsageLimit(coupon) {

    return (
        Number.isFinite(coupon?.usageLimit) &&
        coupon.usageLimit > 0
    );

}


// -------------------------------------------------
// READ-ONLY ELIGIBILITY CHECK
// -------------------------------------------------
//
// Safe to call from calculateDiscount()/previewCheckout()/
// createOrder(). Only reads usage counters — never writes.
// -------------------------------------------------

async function assertCouponUsageEligible({ coupon, userId }) {

    // Per-user limit (read-only check)

    if (
        coupon.perUserLimit != null &&
        Number.isFinite(coupon.perUserLimit) &&
        coupon.perUserLimit > 0
    ) {

        const userUsageSnap =
            await adminDb
                .collection("couponUserUsage")
                .doc(
                    userUsageDocId(coupon.code, userId)
                )
                .get();

        const existingCount =
            userUsageSnap.exists
                ? (userUsageSnap.data()?.count || 0)
                : 0;

        if (existingCount >= coupon.perUserLimit) {

            throw new CouponRejectedError(
                "This coupon has already been used by this account."
            );

        }

    }


    // Total usage limit (read-only check)

    if (hasFiniteUsageLimit(coupon)) {

        const counterSnap =
            await adminDb
                .collection("couponUsageCounters")
                .doc(coupon.code)
                .get();

        const currentTotal =
            counterSnap.exists
                ? (counterSnap.data()?.count || 0)
                : 0;

        if (currentTotal >= coupon.usageLimit) {

            throw new CouponRejectedError(
                "This coupon has reached its usage limit."
            );

        }

    }

}


// -------------------------------------------------
// ATOMIC USAGE RECORDING
// -------------------------------------------------
//
// Only ever called from verifyPayment(), only after the
// Razorpay payment has passed every existing verification
// check (signature, order/user/pricing/amount/currency/
// status). Runs inside a single Firestore transaction so
// two simultaneous redemption attempts by the same user
// (or attempts that would exceed usageLimit) can never both
// succeed — see the "Atomicity / Race Conditions" section
// of the task.
//
// If the same razorpay_payment_id is verified again (existing
// idempotency retry), the redemption doc already exists and
// this is a no-op — the coupon is never counted twice.
//
// If a race causes this to lose the race for a legitimate
// paid customer (extremely rare — both requests would need
// to pass the read-only eligibility check above at almost
// the exact same instant), we deliberately do NOT block
// subscription activation: the customer already paid via
// Razorpay. Instead we log a loud error for manual finance
// review rather than silently either losing the customer's
// paid subscription or double-counting/undercharging the
// coupon.
// -------------------------------------------------

async function recordCouponUsage({

    coupon,
    userId,
    paymentId,
    orderId,

}) {

    if (!coupon) {
        return { recorded: false, alreadyRecorded: false };
    }

    const redemptionRef =
        adminDb
            .collection("couponRedemptions")
            .doc(paymentId);

    const enforcePerUser =
        coupon.perUserLimit != null &&
        Number.isFinite(coupon.perUserLimit) &&
        coupon.perUserLimit > 0;

    const enforceTotal =
        hasFiniteUsageLimit(coupon);

    const userUsageRef =
        enforcePerUser
            ? adminDb
                .collection("couponUserUsage")
                .doc(userUsageDocId(coupon.code, userId))
            : null;

    const counterRef =
        enforceTotal
            ? adminDb
                .collection("couponUsageCounters")
                .doc(coupon.code)
            : null;

    return adminDb.runTransaction(async (tx) => {

        // ---------------------------------------------
        // IDEMPOTENCY: this exact payment already recorded
        // ---------------------------------------------

        const redemptionSnap =
            await tx.get(redemptionRef);

        if (redemptionSnap.exists) {

            return {
                recorded: false,
                alreadyRecorded: true,
            };

        }


        // ---------------------------------------------
        // RE-CHECK LIMITS INSIDE THE TRANSACTION
        // ---------------------------------------------
        //
        // This is the authoritative, race-proof check.
        // The read-only check in assertCouponUsageEligible()
        // is only a fast pre-payment guard; this repeated
        // check inside the transaction is what actually
        // prevents two concurrent redemptions.
        // ---------------------------------------------

        let userUsageSnap = null;

        if (userUsageRef) {

            userUsageSnap =
                await tx.get(userUsageRef);

            const existingCount =
                userUsageSnap.exists
                    ? (userUsageSnap.data()?.count || 0)
                    : 0;

            if (existingCount >= coupon.perUserLimit) {

                throw new CouponRejectedError(
                    "This coupon has already been used by this account."
                );

            }

        }

        let counterSnap = null;

        if (counterRef) {

            counterSnap =
                await tx.get(counterRef);

            const currentTotal =
                counterSnap.exists
                    ? (counterSnap.data()?.count || 0)
                    : 0;

            if (currentTotal >= coupon.usageLimit) {

                throw new CouponRejectedError(
                    "This coupon has reached its usage limit."
                );

            }

        }


        // ---------------------------------------------
        // ALL CHECKS PASSED — RECORD ATOMICALLY
        // ---------------------------------------------

        tx.set(redemptionRef, {

            couponCode: coupon.code,
            userId,
            orderId,
            paymentId,
            createdAt: FieldValue.serverTimestamp(),

        });

        if (userUsageRef) {

            const newCount =
                (userUsageSnap?.exists
                    ? (userUsageSnap.data()?.count || 0)
                    : 0) + 1;

            tx.set(
                userUsageRef,
                {
                    couponCode: coupon.code,
                    userId,
                    count: newCount,
                    lastRedeemedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );

        }

        if (counterRef) {

            const newTotal =
                (counterSnap?.exists
                    ? (counterSnap.data()?.count || 0)
                    : 0) + 1;

            tx.set(
                counterRef,
                {
                    couponCode: coupon.code,
                    count: newTotal,
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );

        }

        return { recorded: true, alreadyRecorded: false };

    });

}


// =====================================================
// CALCULATE COUPON
// =====================================================
//
// Server-side coupon validation.
//
// Supports:
//
// - percentage discount
// - fixed discount
// - plan restriction
// - active/inactive coupon
// - new-user-only coupon
// - per-user usage limit (read-only eligibility check)
// - total usage limit (read-only eligibility check)
//
// IMPORTANT:
//
// Frontend coupon eligibility is NOT trusted.
// Backend decides everything.
//
// This function NEVER marks a coupon as used — see
// recordCouponUsage(), which only runs after a successful
// Razorpay payment verification.
// =====================================================

async function calculateDiscount({

    amount,

    couponCode,

    plan,

    userId,

}) {

    const baseAmount =
        normalizeMoney(amount);


    // =================================================
    // NO COUPON
    // =================================================

    if (!couponCode) {

        return {

            coupon: null,

            discount: 0,

            finalAmount:
                baseAmount,

        };

    }


    // =================================================
    // FIND COUPON
    // =================================================

    const coupon =
        getCoupon(
            couponCode
        );


    if (!coupon) {

        throw new Error(
            "Invalid coupon code."
        );

    }


    // =================================================
    // ACTIVE
    // =================================================

    if (coupon.active !== true) {

        throw new Error(
            "This coupon is no longer active."
        );

    }


    // =================================================
    // PLAN
    // =================================================

    if (
        !Array.isArray(
            coupon.plans
        ) ||
        !coupon.plans.includes(
            plan
        )
    ) {

        throw new Error(
            "This coupon is not valid for this plan."
        );

    }


    // =================================================
    // NEW USER ONLY
    // =================================================

    if (
        coupon.newUserOnly === true
    ) {

        if (!userId) {

            throw new Error(
                "User ID is required to use this coupon."
            );

        }


        const newUser =
            await isNewUser(
                userId
            );


        if (!newUser) {

            throw new Error(
                "This coupon is available only to new users."
            );

        }

    }


    // =================================================
    // USAGE LIMITS (READ-ONLY ELIGIBILITY CHECK)
    // =================================================
    //
    // This only *reads* usage counters to reject ineligible
    // requests early. It never writes/consumes usage — that
    // only happens in recordCouponUsage() after a verified
    // payment.
    // =================================================

    if (!userId) {

        throw new Error(
            "User ID is required to use this coupon."
        );

    }

    await assertCouponUsageEligible({
        coupon,
        userId,
    });


    // =================================================
    // COUPON TYPE
    // =================================================

    if (
        coupon.type !== "percentage" &&
        coupon.type !== "fixed"
    ) {

        throw new Error(
            "Invalid coupon type."
        );

    }


    // =================================================
    // DISCOUNT
    // =================================================

    let discount = 0;


    // -------------------------------------------------
    // PERCENTAGE
    // -------------------------------------------------

    if (
        coupon.type === "percentage"
    ) {

        const percentage =
            Number(
                coupon.value
            );


        if (
            !Number.isFinite(
                percentage
            ) ||
            percentage < 0 ||
            percentage > 100
        ) {

            throw new Error(
                "Invalid coupon percentage."
            );

        }


        discount =
            baseAmount *
            (
                percentage / 100
            );

    }


    // -------------------------------------------------
    // FIXED
    // -------------------------------------------------

    if (
        coupon.type === "fixed"
    ) {

        const fixedValue =
            Number(
                coupon.value
            );


        if (
            !Number.isFinite(
                fixedValue
            ) ||
            fixedValue < 0
        ) {

            throw new Error(
                "Invalid coupon discount."
            );

        }


        discount =
            fixedValue;

    }


    // =================================================
    // NEVER DISCOUNT MORE THAN PRICE
    // =================================================

    discount =
        normalizeMoney(
            Math.min(
                discount,
                baseAmount
            )
        );


    // =================================================
    // FINAL CUSTOMER PRICE
    // =================================================

    const finalAmount =
        normalizeMoney(
            baseAmount -
            discount
        );


    if (finalAmount <= 0) {

        throw new Error(
            "Final payment amount must be greater than zero."
        );

    }


    // =================================================
    // COUPON SNAPSHOT
    // =================================================
    //
    // perUserLimit/usageLimit are carried in the snapshot
    // (not just code/type/value/campaign/creator) because
    // verifyPayment() needs them later to call
    // recordCouponUsage() without re-fetching coupon config
    // from a source the frontend could have influenced via
    // the order notes. They are read from getCoupon(), never
    // from the request body.
    // =================================================

    return {

        coupon: {

            code:
                coupon.code,

            type:
                coupon.type,

            value:
                Number(
                    coupon.value
                ),

            campaign:
                coupon.campaign ||
                null,

            creator:
                coupon.creator ||
                null,

            perUserLimit:
                coupon.perUserLimit ??
                null,

            usageLimit:
                coupon.usageLimit ??
                null,

        },

        discount,

        finalAmount,

    };

}


// =====================================================
// PREVIEW CHECKOUT
// =====================================================
//
// Does NOT create Razorpay order.
//
// Backend calculates:
//
// subtotal
// discount
// tax
// total
// coupon
// =====================================================

export const previewCheckout =
    async (
        req,
        res
    ) => {

        try {

            const {
                userId,
                plan,
                couponCode,
            } = req.body;


            // -------------------------------------------------
            // USER
            // -------------------------------------------------

            if (!userId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "User ID is required.",

                });

            }


            // -------------------------------------------------
            // PLAN
            // -------------------------------------------------

            const normalizedPlan =
                normalizePlan(
                    plan
                );


            if (!normalizedPlan) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid subscription plan.",

                });

            }


            // -------------------------------------------------
            // SERVER PRICE
            // -------------------------------------------------

            const baseAmount =
                getServerPlanPrice(
                    normalizedPlan
                );


            // -------------------------------------------------
            // COUPON
            // -------------------------------------------------

            let pricingResult;


            try {

                pricingResult =
                    await calculateDiscount({

                        amount:
                            baseAmount,

                        couponCode:
                            couponCode ||
                            null,

                        plan:
                            normalizedPlan,

                        userId,

                    });

            } catch (couponError) {

                return res.status(400).json({

                    success: false,

                    message:
                        couponError.message,

                });

            }


            const {
                coupon,
                discount,
                finalAmount,
            } =
                pricingResult;


            // -------------------------------------------------
            // TAX
            // -------------------------------------------------

            const tax = 0;


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(200).json({

                success: true,

                pricing: {

                    plan:
                        normalizedPlan,

                    currency:
                        "INR",

                    subtotal:
                        baseAmount,

                    discount,

                    tax,

                    total:
                        finalAmount,

                    amountSaved:
                        discount,

                    coupon,

                },

            });

        } catch (error) {

            console.error(
                "Preview checkout error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error?.message ||
                    "Unable to calculate checkout.",

            });

        }

    };


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

export const createOrder =
    async (
        req,
        res
    ) => {

        try {

            const {
                plan,
                userId,
                couponCode,
            } = req.body;


            // -------------------------------------------------
            // USER
            // -------------------------------------------------

            if (!userId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "User ID is required.",

                });

            }


            // -------------------------------------------------
            // PLAN
            // -------------------------------------------------

            const normalizedPlan =
                normalizePlan(
                    plan
                );


            if (!normalizedPlan) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid subscription plan.",

                });

            }


            // -------------------------------------------------
            // SERVER PRICE
            // -------------------------------------------------

            const baseAmount =
                getServerPlanPrice(
                    normalizedPlan
                );


            // -------------------------------------------------
            // COUPON
            // -------------------------------------------------

            let pricingResult;


            try {

                pricingResult =
                    await calculateDiscount({

                        amount:
                            baseAmount,

                        couponCode:
                            couponCode ||
                            null,

                        plan:
                            normalizedPlan,

                        userId,

                    });

            } catch (couponError) {

                return res.status(400).json({

                    success: false,

                    message:
                        couponError.message,

                });

            }


            const {
                coupon,
                discount,
                finalAmount,
            } =
                pricingResult;


            // -------------------------------------------------
            // RAZORPAY AMOUNT
            // -------------------------------------------------

            const razorpayAmount =
                Math.round(
                    finalAmount * 100
                );


            if (
                razorpayAmount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid final payment amount.",

                });

            }


            // -------------------------------------------------
            // RECEIPT
            // -------------------------------------------------

            const receipt =
                `KRY-${Date.now()}-${Math.floor(
                    Math.random() * 10000
                )}`;


            // -------------------------------------------------
            // RAZORPAY ORDER
            // -------------------------------------------------

            const options = {

                amount:
                    razorpayAmount,

                currency:
                    "INR",

                receipt,

                notes: {

                    // USER

                    userId,


                    // PLAN

                    plan:
                        normalizedPlan,


                    // PRICING SNAPSHOT

                    baseAmount:
                        String(
                            baseAmount
                        ),

                    discount:
                        String(
                            discount
                        ),

                    finalAmount:
                        String(
                            finalAmount
                        ),


                    // COUPON SNAPSHOT

                    couponCode:
                        coupon?.code ||
                        "",

                    couponType:
                        coupon?.type ||
                        "",

                    couponValue:
                        coupon
                            ? String(
                                coupon.value
                            )
                            : "",

                    campaign:
                        coupon?.campaign ||
                        "",

                    creator:
                        coupon?.creator ||
                        "",

                    couponPerUserLimit:
                        coupon?.perUserLimit != null
                            ? String(coupon.perUserLimit)
                            : "",

                    couponUsageLimit:
                        coupon?.usageLimit != null
                            ? String(coupon.usageLimit)
                            : "",

                },

            };


            const order =
                await razorpay.orders.create(
                    options
                );


            // -------------------------------------------------
            // LOG
            // -------------------------------------------------

            console.log(
                "Razorpay order created",
                {

                    orderId:
                        order.id,

                    userId,

                    plan:
                        normalizedPlan,

                    baseAmount,

                    discount,

                    finalAmount,

                    coupon:
                        coupon?.code ||
                        null,

                    creator:
                        coupon?.creator ||
                        null,

                }
            );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return res.status(200).json({

                success: true,

                order,

                pricing: {

                    plan:
                        normalizedPlan,

                    currency:
                        "INR",

                    subtotal:
                        baseAmount,

                    discount,

                    tax: 0,

                    total:
                        finalAmount,

                    amountSaved:
                        discount,

                    coupon,

                },

            });

        } catch (error) {

            console.error(
                "Create order error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error?.error?.description ||
                    error?.message ||
                    "Order creation failed.",

            });

        }

    };


// =====================================================
// VERIFY PAYMENT
// =====================================================

export const verifyPayment =
    async (
        req,
        res
    ) => {

        try {

            const {

                razorpay_order_id,

                razorpay_payment_id,

                razorpay_signature,

                userId,

            } =
                req.body;


            // -------------------------------------------------
            // BASIC VALIDATION
            // -------------------------------------------------

            if (
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid payment details.",

                });

            }


            if (!userId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "User ID is required.",

                });

            }


            // -------------------------------------------------
            // FETCH ORDER
            // -------------------------------------------------

            const order =
                await razorpay.orders.fetch(
                    razorpay_order_id
                );


            if (!order) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Razorpay order not found.",

                });

            }


            // -------------------------------------------------
            // ORDER USER
            // -------------------------------------------------

            const orderUserId =
                order.notes?.userId ||
                "";


            if (
                orderUserId !== userId
            ) {

                console.error(
                    "Order user mismatch",
                    {
                        orderUserId,
                        userId,
                    }
                );


                return res.status(403).json({

                    success: false,

                    message:
                        "Payment user verification failed.",

                });

            }


            // -------------------------------------------------
            // ORDER PLAN
            // -------------------------------------------------

            const normalizedPlan =
                normalizePlan(
                    order.notes?.plan
                );


            if (!normalizedPlan) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment plan verification failed.",

                });

            }


            // -------------------------------------------------
            // ORDER PRICING SNAPSHOT
            // -------------------------------------------------

            const orderBaseAmount =
                normalizeMoney(
                    order.notes?.baseAmount
                );


            const orderDiscount =
                normalizeMoney(
                    order.notes?.discount
                );


            const orderFinalAmount =
                normalizeMoney(
                    order.notes?.finalAmount
                );


            if (
                orderBaseAmount <= 0 ||
                orderFinalAmount <= 0 ||
                orderDiscount < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid order pricing data.",

                });

            }


            // -------------------------------------------------
            // INTERNAL PRICING CHECK
            // -------------------------------------------------

            const calculatedFinal =
                normalizeMoney(
                    orderBaseAmount -
                    orderDiscount
                );


            if (
                calculatedFinal !==
                orderFinalAmount
            ) {

                console.error(
                    "Order pricing snapshot mismatch",
                    {

                        orderBaseAmount,

                        orderDiscount,

                        orderFinalAmount,

                        calculatedFinal,

                    }
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "Order pricing verification failed.",

                });

            }


            // -------------------------------------------------
            // SERVER PRICE CHECK
            // -------------------------------------------------

            const currentServerPrice =
                getServerPlanPrice(
                    normalizedPlan
                );


            if (
                orderBaseAmount !==
                currentServerPrice
            ) {

                console.error(
                    "Server price changed after order creation",
                    {

                        orderId:
                            razorpay_order_id,

                        orderBaseAmount,

                        currentServerPrice,

                    }
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "Subscription price has changed. Please create a new payment order.",

                });

            }


            // -------------------------------------------------
            // ORDER AMOUNT
            // -------------------------------------------------

            const expectedAmountPaise =
                Math.round(
                    orderFinalAmount * 100
                );


            if (
                Number(order.amount) !==
                expectedAmountPaise
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment amount verification failed.",

                });

            }


            // -------------------------------------------------
            // CURRENCY
            // -------------------------------------------------

            if (
                order.currency !==
                "INR"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment currency verification failed.",

                });

            }


            // -------------------------------------------------
            // SIGNATURE
            // -------------------------------------------------

            const generatedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        process.env
                            .RAZORPAY_KEY_SECRET
                    )
                    .update(
                        `${razorpay_order_id}|${razorpay_payment_id}`
                    )
                    .digest("hex");


            if (
                generatedSignature !==
                razorpay_signature
            ) {

                console.error(
                    "Razorpay signature mismatch"
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "Payment signature verification failed.",

                });

            }


            // -------------------------------------------------
            // FETCH PAYMENT
            // -------------------------------------------------

            const payment =
                await razorpay.payments.fetch(
                    razorpay_payment_id
                );


            if (!payment) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Razorpay payment not found.",

                });

            }


            // -------------------------------------------------
            // PAYMENT -> ORDER
            // -------------------------------------------------

            if (
                payment.order_id !==
                razorpay_order_id
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment does not belong to this order.",

                });

            }


            // -------------------------------------------------
            // PAYMENT AMOUNT
            // -------------------------------------------------

            if (
                Number(payment.amount) !==
                expectedAmountPaise
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment amount verification failed.",

                });

            }


            // -------------------------------------------------
            // PAYMENT CURRENCY
            // -------------------------------------------------

            if (
                payment.currency !==
                "INR"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment currency verification failed.",

                });

            }


            // -------------------------------------------------
            // PAYMENT STATUS
            // -------------------------------------------------

            if (
                payment.status !==
                "captured"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Payment is not captured. Current status: ${payment.status}`,

                });

            }


            // -------------------------------------------------
            // ORDER STATUS
            // -------------------------------------------------

            if (
                order.status !==
                "paid"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Order is not paid. Current status: ${order.status}`,

                });

            }


            // -------------------------------------------------
            // COUPON SNAPSHOT
            // -------------------------------------------------

            const couponCode =
                order.notes?.couponCode ||
                null;


            const creator =
                order.notes?.creator ||
                null;


            const campaign =
                order.notes?.campaign ||
                null;

            const couponPerUserLimit =
                order.notes?.couponPerUserLimit
                    ? Number(order.notes.couponPerUserLimit)
                    : null;

            const couponUsageLimit =
                order.notes?.couponUsageLimit
                    ? Number(order.notes.couponUsageLimit)
                    : null;


            // -------------------------------------------------
            // ACTIVATE SUBSCRIPTION
            // -------------------------------------------------
            //
            // Existing payment idempotency (activatePlan) is
            // preserved as-is — if this exact
            // orderId/paymentId was already processed, it must
            // continue to short-circuit there without creating
            // a duplicate subscription. We rely on that same
            // guarantee here: recordCouponUsage() below is
            // additionally keyed by paymentId, so even if this
            // whole handler were invoked twice for the same
            // payment, the coupon is still only ever counted
            // once.
            // -------------------------------------------------

            const subscription =
                await activatePlan({

                    userId,

                    orderId:
                        razorpay_order_id,

                    paymentId:
                        razorpay_payment_id,

                    plan:
                        normalizedPlan,

                    amount:
                        orderFinalAmount,

                    originalAmount:
                        orderBaseAmount,

                    discount:
                        orderDiscount,

                    couponCode,

                    creator,

                    campaign,

                });


            // -------------------------------------------------
            // RECORD COUPON USAGE (ATOMIC, POST-PAYMENT ONLY)
            // -------------------------------------------------
            //
            // Runs only after activatePlan() has succeeded, i.e.
            // only after every existing verification check has
            // passed. Never runs in previewCheckout/createOrder.
            // -------------------------------------------------

            if (couponCode) {

                try {

                    await recordCouponUsage({

                        coupon: {
                            code: couponCode,
                            perUserLimit: couponPerUserLimit,
                            usageLimit: couponUsageLimit,
                        },

                        userId,

                        paymentId:
                            razorpay_payment_id,

                        orderId:
                            razorpay_order_id,

                    });

                } catch (usageError) {

                    // The payment already succeeded and the
                    // subscription is already active — we do not
                    // undo either of those over a coupon-ledger
                    // race. Log loudly for manual finance review
                    // instead of failing the request.

                    console.error(
                        "Coupon usage recording failed after successful payment " +
                        "— subscription remains active, needs manual review.",
                        {
                            userId,
                            couponCode,
                            orderId: razorpay_order_id,
                            paymentId: razorpay_payment_id,
                            error: usageError?.message || usageError,
                        }
                    );

                }

            }


            // -------------------------------------------------
            // SUCCESS LOG
            // -------------------------------------------------

            console.log(
                "Subscription activated",
                {

                    userId,

                    plan:
                        normalizedPlan,

                    orderId:
                        razorpay_order_id,

                    paymentId:
                        razorpay_payment_id,

                    originalAmount:
                        orderBaseAmount,

                    discount:
                        orderDiscount,

                    amount:
                        orderFinalAmount,

                    coupon:
                        couponCode,

                    creator,

                    campaign,

                }
            );


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            return res.status(200).json({

                success: true,

                message:
                    "Payment verified and subscription activated successfully.",

                payment: {

                    razorpay_order_id,

                    razorpay_payment_id,

                    status:
                        payment.status,

                },

                pricing: {

                    plan:
                        normalizedPlan,

                    currency:
                        "INR",

                    subtotal:
                        orderBaseAmount,

                    discount:
                        orderDiscount,

                    tax: 0,

                    total:
                        orderFinalAmount,

                    amountSaved:
                        orderDiscount,

                    coupon:
                        couponCode
                            ? {

                                code:
                                    couponCode,

                                type:
                                    order.notes?.couponType ||
                                    null,

                                value:
                                    Number(
                                        order.notes?.couponValue
                                    ) || 0,

                                campaign,

                                creator,

                            }
                            : null,

                },

                subscription,

            });

        } catch (error) {

            console.error(
                "Verify payment error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error?.error?.description ||
                    error?.message ||
                    "Payment verification failed.",

            });

        }

    };