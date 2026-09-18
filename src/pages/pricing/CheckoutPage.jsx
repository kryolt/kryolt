import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    ArrowRight,
    Crown,
    Tag,
    ShieldCheck,
    Receipt,
    Check,
    Loader2,
    Lock,
    AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/useAuth";

import {
    createCheckout,
} from "../../services/billing/billingService";

import {
    getPlanById,
} from "../../config/pricingConfig";

import UpgradeButton from "../../components/payment/UpgradeButton";

import "./CheckoutPage.css";


const PLAN_FEATURES = {
    Professional: [
        "50,000 Rows / Upload",
        "AI Insights",
        "PDF Reports",
        "Advanced Analytics",
        "Priority Support",
    ],

    Business: [
        "200,000 Rows / Upload",
        "AI-Powered Business Insights",
        "Advanced Analytics & Reports",
        "Priority Processing",
        "Dedicated Priority Support",
    ],
};

function formatAmount(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "0";
    }

    return amount.toLocaleString("en-IN", {
        minimumFractionDigits:
            Number.isInteger(amount) ? 0 : 2,
        maximumFractionDigits: 2,
    });
}


function normalizeCoupon(value) {
    return String(value || "")
        .trim()
        .toUpperCase();
}


export default function CheckoutPage() {

    const navigate = useNavigate();
    const location = useLocation();

    const { currentUser } = useAuth();


    // =====================================================
    // PLAN FROM ROUTER
    // =====================================================

    const incomingPlan =
        location.state?.plan || {};


    // =====================================================
    // IMPORTANT
    // =====================================================
    // Coupon is NEVER taken from router state.
    //
    // This intentionally prevents:
    //
    // Pricing Offer
    //      ↓
    // Checkout
    //      ↓
    // Automatic coupon
    //
    // User must manually enter coupon.
    // =====================================================


    const [couponInput, setCouponInput] =
        useState("");

    const [appliedCoupon, setAppliedCoupon] =
        useState(null);

    const [summary, setSummary] =
        useState(null);

    const [couponChecking, setCouponChecking] =
        useState(false);

    const [loadingSummary, setLoadingSummary] =
        useState(false);

    const [checkoutError, setCheckoutError] =
        useState("");


    // =====================================================
    // PLAN
    // =====================================================

    const plan = useMemo(() => {

        const incomingId =
            incomingPlan?.id ||
            incomingPlan?.title ||
            "professional";


        const normalizedId =
            String(incomingId)
                .trim()
                .toLowerCase();


        const planId =
            normalizedId.includes("business")
                ? "business"
                : "professional";


        const configPlan =
            getPlanById(planId);


        if (!configPlan) {
            return {
                id: planId,
                title:
                    planId === "business"
                        ? "Business"
                        : "Professional",
                currency: "INR",
                billingCycle: "monthly",
                price: 0,
                originalPrice: 0,
            };
        }


        return {
            id: configPlan.id,

            title: configPlan.title,

            currency:
                configPlan.currency || "INR",

            billingCycle:
                configPlan.billingCycle ||
                "monthly",

            // SINGLE SOURCE OF PLAN PRICE
            price:
                Number(configPlan.price) || 0,

            originalPrice:
                Number(
                    configPlan.originalPrice ??
                    configPlan.price
                ) || 0,
        };

    }, [
        incomingPlan?.id,
        incomingPlan?.title,
    ]);


    const planTitle =
        plan.title;


    const originalPlanPrice =
        Number(plan.price) || 0;


    const features =
        PLAN_FEATURES[planTitle] || [];


    // =====================================================
    // LOAD CHECKOUT PRICING
    // =====================================================
    // Only appliedCoupon is sent.
    //
    // No coupon from Pricing page.
    // No promoOffer.
    // No automatic coupon.
    // =====================================================

    useEffect(() => {

        let cancelled = false;


        async function loadPricing() {

            if (!currentUser) {

                setSummary(null);
                setLoadingSummary(false);

                return;
            }


            setLoadingSummary(true);
            setCheckoutError("");


            const couponToValidate =
                appliedCoupon?.code || null;


            try {

                const data =
                    await createCheckout({
                        userId:
                            currentUser.uid,

                        plan,

                        couponCode:
                            couponToValidate,
                    });


                if (cancelled) {
                    return;
                }


                if (!data?.checkoutSummary) {

                    throw new Error(
                        "Unable to calculate checkout total."
                    );

                }


                const serverSummary =
                    data.checkoutSummary;


                setSummary(
                    serverSummary
                );


            } catch (error) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Checkout pricing error:",
                    error
                );


                setSummary(null);


                setCheckoutError(
                    error?.message ||
                    "Unable to calculate checkout."
                );


            } finally {

                if (!cancelled) {
                    setLoadingSummary(false);
                }

            }

        }


        loadPricing();


        return () => {
            cancelled = true;
        };

    }, [
        currentUser,
        plan,
        appliedCoupon?.code,
    ]);


    // =====================================================
    // MANUAL COUPON
    // =====================================================

    async function handleApplyCoupon() {

        const code =
            normalizeCoupon(
                couponInput
            );


        if (!currentUser) {

            setCheckoutError(
                "Please login before applying a coupon."
            );

            return;
        }


        if (!code) {

            setCheckoutError(
                "Please enter a coupon code."
            );

            return;
        }


        setCouponChecking(true);
        setCheckoutError("");


        try {

            const data =
                await createCheckout({
                    userId:
                        currentUser.uid,

                    plan,

                    couponCode:
                        code,
                });


            const serverSummary =
                data?.checkoutSummary;


            const serverCoupon =
                serverSummary?.coupon;


            const serverDiscount =
                Number(
                    serverSummary?.discount
                );


            if (
                !serverSummary ||
                !serverCoupon?.code ||
                !Number.isFinite(
                    serverDiscount
                ) ||
                serverDiscount <= 0
            ) {

                throw new Error(
                    "Coupon could not be applied."
                );

            }


            setAppliedCoupon({
                code:
                    serverCoupon.code,
            });


            setSummary(
                serverSummary
            );


            setCouponInput(
                serverCoupon.code
            );


        } catch (error) {

            console.error(
                "Coupon validation error:",
                error
            );


            setAppliedCoupon(null);
            setSummary(null);


            setCheckoutError(
                error?.message ||
                "Unable to apply coupon."
            );


        } finally {

            setCouponChecking(false);

        }

    }


    // =====================================================
    // REMOVE COUPON
    // =====================================================

    function handleRemoveCoupon() {

        setAppliedCoupon(null);

        setCouponInput("");

        setCheckoutError("");

        setSummary(null);

    }


    function handleCouponKeyDown(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            handleApplyCoupon();

        }

    }


    // =====================================================
    // SERVER PRICING
    // =====================================================

    const subtotal =
        Number.isFinite(
            Number(summary?.subtotal)
        )
            ? Number(summary.subtotal)
            : originalPlanPrice;


    const couponDiscount =
        Number.isFinite(
            Number(summary?.discount)
        )
            ? Number(summary.discount)
            : 0;


    const tax =
        Number.isFinite(
            Number(summary?.tax)
        )
            ? Number(summary.tax)
            : 0;


    const total =
        Number.isFinite(
            Number(summary?.total)
        )
            ? Number(summary.total)
            : originalPlanPrice;


    const coupon =
        summary?.coupon || null;


    const hasCouponDiscount =
        Boolean(
            appliedCoupon &&
            coupon?.code &&
            couponDiscount > 0
        );


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="checkout-page">

            <div className="checkout-card">


                {/* HEADER */}

                <div className="checkout-header">

                    <div>

                        <span className="checkout-eyebrow">

                            <Lock size={12} />

                            Secure Checkout

                        </span>


                        <h1>
                            Complete your upgrade
                        </h1>


                        <p>
                            Payments are processed securely
                            by Razorpay.
                        </p>

                    </div>


                    <div className="checkout-crown">

                        <Crown size={22} />

                    </div>

                </div>


                <div className="checkout-body">


                    {/* LEFT */}

                    <div className="checkout-left">

                        <div className="checkout-plan">

                            <span className="checkout-plan-label">
                                Plan
                            </span>


                            <h2>
                                {planTitle} Plan
                            </h2>


                            <div className="checkout-plan-price">

                                <h1>
                                    ₹
                                    {formatAmount(
                                        originalPlanPrice
                                    )}
                                </h1>

                                <span>
                                    / month
                                </span>

                            </div>


                            <div className="checkout-plan-divider" />


                            <ul className="checkout-features">

                                {features.map(
                                    (feature) => (

                                        <li key={feature}>

                                            <span className="checkout-feature-icon">

                                                <Check
                                                    size={12}
                                                    strokeWidth={3}
                                                />

                                            </span>

                                            {feature}

                                        </li>

                                    )
                                )}

                            </ul>

                        </div>


                        <div className="checkout-security-note">

                            <ShieldCheck size={15} />

                            256-bit encrypted ·
                            PCI-DSS compliant

                        </div>

                    </div>


                    {/* RIGHT */}

                    <div className="checkout-right">


                        {/* MANUAL COUPON */}

                        <div
                            className={
                                `coupon-box ${appliedCoupon
                                    ? "coupon-box--applied"
                                    : ""
                                }`
                            }
                        >

                            <Tag
                                size={17}
                                className="coupon-icon"
                            />


                            <input

                                type="text"

                                placeholder="Enter coupon code"

                                value={couponInput}

                                disabled={
                                    Boolean(
                                        appliedCoupon
                                    ) ||
                                    loadingSummary ||
                                    couponChecking
                                }

                                onChange={(event) =>
                                    setCouponInput(
                                        event.target.value
                                    )
                                }

                                onKeyDown={
                                    handleCouponKeyDown
                                }

                                autoComplete="off"

                                spellCheck="false"

                            />


                            <button

                                type="button"

                                disabled={
                                    loadingSummary ||
                                    couponChecking
                                }

                                onClick={
                                    appliedCoupon
                                        ? handleRemoveCoupon
                                        : handleApplyCoupon
                                }

                            >

                                {appliedCoupon
                                    ? "Remove"
                                    : "Apply"}

                            </button>

                        </div>


                        {/* COUPON SUCCESS */}

                        {hasCouponDiscount && (

                            <div className="checkout-coupon-status">

                                <Check size={14} />

                                Coupon{" "}

                                <strong>
                                    {coupon.code}
                                </strong>{" "}

                                applied

                            </div>

                        )}


                        {/* ERROR */}

                        {checkoutError && (

                            <div className="checkout-error">

                                <AlertCircle size={16} />

                                <span>
                                    {checkoutError}
                                </span>

                            </div>

                        )}


                        {/* SUMMARY */}

                        {loadingSummary && !summary ? (

                            <div className="checkout-summary checkout-summary--loading">

                                <Loader2
                                    size={18}
                                    className="spin"
                                />

                                Calculating totals…

                            </div>

                        ) : (

                            <div className="checkout-summary">


                                <div>

                                    <span>
                                        Original price
                                    </span>

                                    <span>
                                        ₹
                                        {formatAmount(
                                            subtotal
                                        )}
                                    </span>

                                </div>


                                {hasCouponDiscount && (

                                    <div className="checkout-summary-discount">

                                        <span>
                                            Coupon discount
                                        </span>

                                        <span>
                                            - ₹
                                            {formatAmount(
                                                couponDiscount
                                            )}
                                        </span>

                                    </div>

                                )}


                                {tax > 0 && (

                                    <div>

                                        <span>
                                            Tax
                                        </span>

                                        <span>
                                            + ₹
                                            {formatAmount(
                                                tax
                                            )}
                                        </span>

                                    </div>

                                )}


                                <hr />


                                <div className="checkout-total">

                                    <span>
                                        Total due today
                                    </span>

                                    <span>
                                        ₹
                                        {formatAmount(
                                            total
                                        )}
                                    </span>

                                </div>


                                {hasCouponDiscount && (

                                    <div className="checkout-total-savings">

                                        You save ₹
                                        {formatAmount(
                                            couponDiscount
                                        )}

                                    </div>

                                )}

                            </div>

                        )}


                        {/* PAY */}

                        <div className="checkout-pay-button">

                            <UpgradeButton

                                plan={
                                    planTitle
                                }

                                amount={
                                    total
                                }

                                couponCode={
                                    appliedCoupon?.code ||
                                    null
                                }

                                onSuccess={() => {
                                    navigate("/dashboard", { replace: true });
                                }}

                                disabled={
                                    loadingSummary ||
                                    couponChecking ||
                                    Boolean(checkoutError) ||
                                    !currentUser ||
                                    !summary ||
                                    total <= 0
                                }

                            >

                                <Lock size={17} />

                                <span>

                                    Pay ₹
                                    {formatAmount(
                                        total
                                    )}

                                </span>

                                <ArrowRight size={18} />

                            </UpgradeButton>

                        </div>


                        <div className="checkout-razorpay-note">

                            <ShieldCheck size={15} />

                            Secure payments powered by
                            Razorpay

                        </div>

                    </div>

                </div>


                {/* FOOTER */}

                <div className="checkout-footer">

                    <button

                        type="button"

                        className="back-btn"

                        onClick={() =>
                            navigate(-1)
                        }

                    >

                        <ArrowLeft size={16} />

                        Back

                    </button>


                    <div className="checkout-invoice-note">

                        <Receipt size={16} />

                        Invoice included

                    </div>

                </div>

            </div>

        </div>

    );

}