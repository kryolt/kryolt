// =====================================================
// KRYOLT OFFERS CONFIG
// =====================================================
// Pricing is controlled separately by pricingConfig.js.
// This file controls ONLY promotional offers.
//
// IMPORTANT:
// - Never store final/discounted prices here.
// - discountPercent is applied to the current plan price.
// - Coupons are displayed to the user but are NOT
//   automatically sent to checkout.
// =====================================================

export const OFFERS = [

    // =================================================
    // FESTIVAL OFFER
    // =================================================

    {
        id: "raksha-bandhan-2026",

        type: "festival",

        title: "Raksha Bandhan Special",

        description:
            "Celebrate Raksha Bandhan with a special discount on Kryolt.",

        couponCode: "RAKHI50",

        discountPercent: 70,

        active: false,

        priority: 100,

        eligibleUsers: "all",

        planId: "professional",
    },


    // =================================================
    // NEW USER OFFER
    // =================================================

    {
        id: "new-user-welcome",

        type: "new-user",

        title: "New User Offer",

        description:
            "Get 40% off your first month on the Professional plan.",

        couponCode: "WELCOME40",

        discountPercent: 40,

        active: true,

        priority: 10,

        eligibleUsers: "new",

        planId: "professional",
    },

];


// =====================================================
// GET ACTIVE OFFER
// =====================================================

export function getActiveOffer({
    isNewUser = false,
} = {}) {

    const eligibleOffers = OFFERS.filter((offer) => {

        if (!offer.active) {
            return false;
        }

        if (offer.eligibleUsers === "all") {
            return true;
        }

        if (
            offer.eligibleUsers === "new" &&
            isNewUser
        ) {
            return true;
        }

        return false;
    });


    if (!eligibleOffers.length) {
        return null;
    }


    return [...eligibleOffers].sort(
        (a, b) =>
            (b.priority || 0) -
            (a.priority || 0)
    )[0];
}


// =====================================================
// CALCULATE DISCOUNTED PRICE
// =====================================================
// Original price ALWAYS comes from pricingConfig.
// =====================================================

export function calculateOfferPrice(
    originalPrice,
    discountPercent
) {

    const price = Number(originalPrice) || 0;

    const discount =
        Number(discountPercent) || 0;

    return Number(
        (
            price *
            (1 - discount / 100)
        ).toFixed(2)
    );
}