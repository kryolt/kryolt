import { useState } from "react";

import "./Pricing.css";

import { APP } from "../../config/appConfig";

import {
    Check,
    ArrowRight,
    Sparkles,
    Tag,
    Copy,
    CheckCheck,
} from "lucide-react";

import {
    getActivePlans,
} from "../../config/pricingConfig";

import {
    getActiveOffer,
    calculateOfferPrice,
} from "../../config/offersConfig";


function Pricing({
    onGetStartedClick,
}) {

    const plans = getActivePlans();

    const [copiedCode, setCopiedCode] =
        useState(false);


    // =====================================================
    // FIND PROFESSIONAL PLAN
    // =====================================================

    const professionalPlan =
        plans.find(
            (plan) =>
                String(plan.title)
                    .toLowerCase() ===
                "professional"
        );


    // =====================================================
    // OFFER
    // =====================================================
    // Keep this simple for now.
    //
    // The offer config decides which campaign is active.
    // No coupon is passed to checkout automatically.
    // =====================================================

    const activeOffer =
        getActiveOffer({
            // New-user eligibility can be connected to
            // your auth/user state later without touching
            // pricingConfig.
            isNewUser: true,
        });


    // =====================================================
    // ORIGINAL PRICE
    // =====================================================

    const professionalPrice =
        Number(
            professionalPlan?.price ?? 0
        );


    // =====================================================
    // OFFER PRICE
    // =====================================================

    const discountedPrice =
        activeOffer
            ? calculateOfferPrice(
                professionalPrice,
                activeOffer.discountPercent
            )
            : professionalPrice;


    // =====================================================
    // COPY COUPON
    // =====================================================

    const handleCopyCoupon = async () => {

        if (!activeOffer?.couponCode) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                activeOffer.couponCode
            );

            setCopiedCode(true);

            setTimeout(() => {
                setCopiedCode(false);
            }, 1800);

        } catch (error) {

            console.error(
                "Unable to copy coupon:",
                error
            );

        }
    };


    // =====================================================
    // NORMAL PLAN ACTION
    // =====================================================

    const handlePlanAction = (plan) => {

        if (!onGetStartedClick) {
            return;
        }

        onGetStartedClick({
            ...plan,

            action:
                plan.action ||
                "checkout",
        });
    };


    return (

        <section
            id="pricing"
            className="pricing"
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="pricing-heading">

                <span>
                    PRICING
                </span>

                <h2>
                    Choose Your Plan
                </h2>

                <p>
                    Start free with {APP.name} and upgrade
                    whenever your business grows.
                </p>

            </div>


            {/* =================================================
                ACTIVE OFFER
            ================================================= */}

            {activeOffer &&
                professionalPlan && (

                    <div
                        className="pricing-promo-card"
                    >

                        <div
                            className="pricing-promo-content"
                        >

                            <div
                                className="pricing-promo-badge"
                            >

                                <Sparkles
                                    size={14}
                                />

                                {activeOffer.type ===
                                    "festival"
                                    ? "SPECIAL OFFER"
                                    : "NEW USER OFFER"
                                }

                            </div>


                            <h3>
                                {activeOffer.title}
                            </h3>


                            <p>
                                {activeOffer.description}
                            </p>


                            <div
                                className="pricing-promo-price"
                            >

                                <span
                                    className=
                                    "pricing-promo-old-price"
                                >

                                    ₹
                                    {professionalPrice.toLocaleString(
                                        "en-IN"
                                    )}

                                </span>


                                <strong>

                                    ₹
                                    {discountedPrice.toLocaleString(
                                        "en-IN"
                                    )}

                                </strong>


                                <span>
                                    / month
                                </span>

                            </div>


                            {/* =====================================
                            COUPON
                        ===================================== */}

                            <button
                                type="button"
                                className=
                                "pricing-promo-code"
                                onClick={
                                    handleCopyCoupon
                                }
                                title="Copy coupon code"
                            >

                                {copiedCode ? (
                                    <CheckCheck
                                        size={15}
                                    />
                                ) : (
                                    <Tag
                                        size={15}
                                    />
                                )}


                                <span>
                                    Use code
                                </span>


                                <strong>
                                    {
                                        activeOffer.couponCode
                                    }
                                </strong>


                                {copiedCode ? (
                                    <span>
                                        Copied
                                    </span>
                                ) : (
                                    <Copy
                                        size={14}
                                    />
                                )}

                            </button>


                            {/* =====================================
                            IMPORTANT:
                            NO AUTOMATIC CHECKOUT
                        ===================================== */}

                            <small
                                className=
                                "pricing-promo-note"
                            >
                                Copy the code and apply it
                                manually at checkout.
                            </small>

                        </div>


                        <div
                            className=
                            "pricing-promo-save"
                        >

                            <span>
                                SAVE
                            </span>

                            <strong>
                                {
                                    activeOffer
                                        .discountPercent
                                }%
                            </strong>

                        </div>

                    </div>
                )}


            {/* =================================================
                PRICING GRID
            ================================================= */}

            <div
                className=
                "pricing-grid three-columns"
            >

                {plans.map((plan) => (

                    <div
                        key={plan.id}
                        className={`
                            pricing-card
                            ${plan.popular
                                ? "popular"
                                : ""
                            }
                        `}
                    >

                        {plan.popular && (

                            <div
                                className=
                                "popular-tag"
                                aria-label=
                                "Most popular plan"
                            >

                                <Sparkles
                                    size={13}
                                    strokeWidth={2.5}
                                />

                                Most Popular

                            </div>

                        )}


                        <h3>
                            {plan.title}
                        </h3>


                        <div
                            className=
                            "plan-price-row"
                        >

                            <p
                                className=
                                "plan-price"
                            >
                                {plan.displayPrice}
                            </p>


                            {plan.period && (

                                <span
                                    className=
                                    "plan-period"
                                >
                                    {plan.period}
                                </span>

                            )}

                        </div>


                        <p
                            className=
                            "plan-desc"
                        >
                            {plan.desc}
                        </p>


                        <ul>

                            {plan.features.map(
                                (feature) => (

                                    <li
                                        key={feature}
                                    >

                                        <span
                                            className=
                                            "check-icon"
                                            aria-hidden="true"
                                        >

                                            <Check
                                                size={13}
                                                strokeWidth={3}
                                            />

                                        </span>

                                        {feature}

                                    </li>

                                ))}

                        </ul>


                        <button
                            type="button"
                            className={
                                plan.popular
                                    ? "btn-primary"
                                    : "btn-secondary"
                            }
                            onClick={() =>
                                handlePlanAction(
                                    plan
                                )
                            }
                        >

                            {plan.button}

                            <ArrowRight
                                size={16}
                                strokeWidth={2.5}
                            />

                        </button>

                    </div>

                ))}

            </div>

        </section>
    );
}


export default Pricing;