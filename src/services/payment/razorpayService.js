// =====================================================
// KRYOLT RAZORPAY FRONTEND SERVICE
// Production-ready Standard Checkout
// =====================================================

const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:5000";

const RAZORPAY_SCRIPT_URL =
    "https://checkout.razorpay.com/v1/checkout.js";


// =====================================================
// LOAD RAZORPAY SCRIPT
// =====================================================

function loadRazorpayScript() {

    return new Promise((resolve, reject) => {

        if (typeof window === "undefined") {
            reject(
                new Error(
                    "Razorpay checkout is only available in the browser."
                )
            );
            return;
        }


        // Already loaded
        if (typeof window.Razorpay === "function") {
            resolve(true);
            return;
        }


        // Script already exists
        const existingScript =
            document.querySelector(
                `script[src="${RAZORPAY_SCRIPT_URL}"]`
            );


        if (existingScript) {

            existingScript.addEventListener(
                "load",
                () => resolve(true),
                { once: true }
            );

            existingScript.addEventListener(
                "error",
                () =>
                    reject(
                        new Error(
                            "Unable to load Razorpay Checkout."
                        )
                    ),
                { once: true }
            );

            return;
        }


        // Create script
        const script =
            document.createElement("script");

        script.src =
            RAZORPAY_SCRIPT_URL;

        script.async = true;


        script.onload = () => {

            if (
                typeof window.Razorpay !==
                "function"
            ) {

                reject(
                    new Error(
                        "Razorpay Checkout loaded incorrectly."
                    )
                );

                return;
            }

            resolve(true);

        };


        script.onerror = () => {

            reject(
                new Error(
                    "Unable to load Razorpay Checkout. Please check your internet connection or browser extensions."
                )
            );

        };


        document.body.appendChild(script);

    });

}


// =====================================================
// CREATE ORDER
// =====================================================

async function createRazorpayOrder({

    userId,
    plan,
    couponCode,

}) {

    const response =
        await fetch(
            `${API_BASE_URL}/api/payment/create-order`,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify({

                        userId,

                        plan,

                        couponCode:
                            couponCode ||
                            null,

                    }),

            }
        );


    let data;

    try {

        data =
            await response.json();

    } catch {

        throw new Error(
            "Payment server returned an invalid response."
        );

    }


    if (
        !response.ok ||
        !data?.success
    ) {

        throw new Error(
            data?.message ||
            "Unable to create Razorpay order."
        );

    }


    if (!data.order?.id) {

        throw new Error(
            "Razorpay order ID was not returned by the server."
        );

    }


    return data;

}


// =====================================================
// VERIFY PAYMENT
// =====================================================

async function verifyRazorpayPayment({

    userId,
    plan,
    response,

}) {

    const {

        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,

    } = response || {};


    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
    ) {

        throw new Error(
            "Razorpay returned incomplete payment information."
        );

    }


    const verifyResponse =
        await fetch(
            `${API_BASE_URL}/api/payment/verify-payment`,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify({

                        razorpay_order_id,

                        razorpay_payment_id,

                        razorpay_signature,

                        userId,

                        plan,

                    }),

            }
        );


    let data;

    try {

        data =
            await verifyResponse.json();

    } catch {

        throw new Error(
            "Payment verification server returned an invalid response."
        );

    }


    if (
        !verifyResponse.ok ||
        !data?.success
    ) {

        throw new Error(
            data?.message ||
            "Payment verification failed."
        );

    }


    return data;

}


// =====================================================
// OPEN RAZORPAY CHECKOUT
// =====================================================

export async function openRazorpayCheckout({

    plan,

    // Kept for UpgradeButton compatibility.
    // NEVER trusted for payment amount.

    userId,

    name,

    email,

    couponCode = null,

    onSuccess = null,

}) {

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!userId) {

        throw new Error(
            "User ID is missing."
        );

    }


    if (!plan) {

        throw new Error(
            "Subscription plan is missing."
        );

    }


    const normalizedPlan =
        typeof plan === "string"
            ? plan.trim()
            : String(
                plan?.title ||
                plan?.id ||
                ""
            ).trim();


    if (!normalizedPlan) {

        throw new Error(
            "Invalid subscription plan."
        );

    }


    // =================================================
    // ENVIRONMENT CHECK
    // =================================================

    const razorpayKey =
        import.meta.env
            .VITE_RAZORPAY_KEY_ID;


    if (!razorpayKey) {

        console.error(
            "VITE_RAZORPAY_KEY_ID is missing."
        );

        throw new Error(
            "Razorpay Key ID is missing from frontend environment."
        );

    }


    // =================================================
    // LOAD RAZORPAY
    // =================================================

    await loadRazorpayScript();


    if (
        typeof window.Razorpay !==
        "function"
    ) {

        throw new Error(
            "Razorpay Checkout is not available."
        );

    }


    // =================================================
    // CREATE SERVER ORDER
    // =================================================

    const orderData =
        await createRazorpayOrder({

            userId,

            plan:
                normalizedPlan,

            couponCode:
                couponCode ||
                null,

        });


    const order =
        orderData.order;

    const pricing =
        orderData.pricing;


    // =================================================
    // SERVER VALIDATION
    // =================================================

    if (!order?.id) {

        throw new Error(
            "Payment order ID is missing."
        );

    }


    if (
        !Number.isFinite(
            Number(order.amount)
        ) ||
        Number(order.amount) <= 0
    ) {

        throw new Error(
            "Invalid payment amount received from server."
        );

    }


    if (
        order.currency !== "INR"
    ) {

        throw new Error(
            "Unsupported payment currency."
        );

    }


    if (!pricing) {

        throw new Error(
            "Payment pricing information is missing."
        );

    }


    const serverTotal =
        Number(pricing.total);


    if (
        !Number.isFinite(serverTotal) ||
        serverTotal <= 0
    ) {

        throw new Error(
            "Invalid payable amount received from server."
        );

    }


    // Razorpay order amount is paise.
    const expectedPaise =
        Math.round(
            serverTotal * 100
        );


    if (
        Number(order.amount) !==
        expectedPaise
    ) {

        console.error(
            "Razorpay amount mismatch",
            {
                orderAmount:
                    order.amount,

                serverTotal,

                expectedPaise,
            }
        );

        throw new Error(
            "Payment amount mismatch. Please refresh and try again."
        );

    }


    // =================================================
    // DEBUG
    // =================================================

    console.log(
        "💳 Kryolt Razorpay Checkout",
        {

            key:
                razorpayKey
                    .startsWith("rzp_test_")
                    ? "TEST MODE"
                    : razorpayKey
                        .startsWith("rzp_live_")
                        ? "LIVE MODE"
                        : "UNKNOWN KEY",

            plan:
                pricing.plan,

            subtotal:
                pricing.subtotal,

            discount:
                pricing.discount,

            total:
                pricing.total,

            razorpayAmount:
                order.amount,

            orderId:
                order.id,

            coupon:
                pricing.coupon?.code ||
                null,

        }
    );


    // =================================================
    // RAZORPAY OPTIONS
    // =================================================

    const options = {

        key:
            razorpayKey,

        amount:
            Number(order.amount),

        currency:
            "INR",

        name:
            "Kryolt",

        description:
            `${pricing.plan} Subscription`,

        order_id:
            order.id,


        prefill: {

            name:
                name ||
                "Kryolt User",

            email:
                email ||
                "",

        },


        notes: {

            userId,

            plan:
                pricing.plan,

            couponCode:
                pricing.coupon?.code ||
                "",

        },


        theme: {

            color:
                "#2563eb",

        },


        retry: {

            enabled:
                true,

            max_count:
                3,

        },


        modal: {

            confirm_close:
                true,

            escape:
                true,

            animation:
                true,

        },


        handler:
            async function (
                response
            ) {

                try {

                    console.log(
                        "Razorpay payment response received.",
                        {
                            orderId:
                                response?.razorpay_order_id,

                            paymentId:
                                response?.razorpay_payment_id,
                        }
                    );


                    // =================================
                    // SERVER VERIFICATION
                    // =================================

                    const verifyData =
                        await verifyRazorpayPayment({

                            userId,

                            plan:
                                pricing.plan,

                            response,

                        });


                    console.log(
                        "✅ Payment verified successfully.",
                        verifyData
                    );


                    // =================================
                    // SUCCESS NAVIGATION
                    // =================================

                    if (typeof onSuccess === "function") {
                        onSuccess(verifyData);
                    } else {
                        window.location.replace("/dashboard");
                    }

                } catch (error) {

                    console.error(
                        "❌ Payment verification error:",
                        error
                    );


                    alert(
                        error?.message ||
                        "Payment was received but verification failed. Please contact support."
                    );

                }

            },

    };


    // =================================================
    // CREATE RAZORPAY INSTANCE
    // =================================================

    let razorpay;

    try {

        razorpay =
            new window.Razorpay(
                options
            );

    } catch (error) {

        console.error(
            "Razorpay initialization error:",
            error
        );

        throw new Error(
            "Unable to initialize Razorpay Checkout.",
            { cause: error }
        );

    }


    // =================================================
    // PAYMENT FAILED
    // =================================================

    razorpay.on(
        "payment.failed",
        function (response) {

            console.error(
                "❌ Razorpay Payment Failed:",
                response?.error
            );


            const description =
                response?.error?.description ||
                "Payment failed. Please try again.";


            alert(
                description
            );

        }
    );


    // =================================================
    // OPEN CHECKOUT
    // =================================================

    try {

        razorpay.open();

    } catch (error) {

        console.error(
            "❌ Razorpay open() error:",
            error
        );

        throw new Error(
            error?.message ||
            "Unable to open Razorpay Checkout.",
            { cause: error }
        );

    }

}
