// =====================================================
// KRYOLT PRICING CONFIG
// =====================================================

export const PRICING_CONFIG = {

    currency: "INR",

    currencySymbol: "₹",

    billingCycle: "monthly",

    // -------------------------------------------------
    // Subscription billing behaviour
    // -------------------------------------------------

    subscription: {

        type: "calendar_month",

        renewalEnabled: true,

        autoRenewDefault: false,

    },

    // -------------------------------------------------
    // Plans
    // -------------------------------------------------

    plans: [

        // =============================================
        // FREE
        // =============================================

        {
            id: "free",

            title: "Free",

            price: 0,

            originalPrice: 0,

            discount: 0,

            discountType: "none",

            currency: "INR",

            period: "/month",

            displayPrice: "₹0",

            displayOriginalPrice: null,

            displayDiscount: null,

            desc: "Perfect for beginners",

            features: [
                "10,000 Rows / Upload",
                "CSV & Excel Upload",
                "Business Dashboard",
                "Business Analytics",
                "Standard Support",
            ],

            button: "Get Started",

            action: "signup",

            popular: false,

            active: true,

            paymentRequired: false,

            billingCycle: "monthly",

        },


        // =============================================
        // PROFESSIONAL
        // =============================================

        {
            id: "professional",

            title: "Professional",

            // FINAL BASE PRICE
            // Coupon discount will be calculated
            // separately on this amount.
            price: 499,

            // No built-in plan discount.
            originalPrice: 499,

            discount: 0,

            discountType: "none",

            currency: "INR",

            period: "/month",

            displayPrice: "₹499",

            displayOriginalPrice: null,

            displayDiscount: null,

            desc: "For growing businesses",

            features: [
                "50,000 Rows / Upload",
                "AI Insights",
                "PDF Reports",
                "Advanced Charts",
                "Priority Support",
            ],

            button: "Upgrade Now",

            action: "checkout",

            popular: true,

            active: true,

            paymentRequired: true,

            billingCycle: "monthly",

        },


        // =============================================
        // BUSINESS
        // =============================================

        {
            id: "business",

            title: "Business",

            // FINAL BASE PRICE
            // Coupon discount will be calculated
            // separately on this amount.
            price: 999,

            // No built-in plan discount.
            originalPrice: 999,

            discount: 0,

            discountType: "none",

            currency: "INR",

            period: "/month",

            displayPrice: "₹999",

            displayOriginalPrice: null,

            displayDiscount: null,

            desc: "For teams at scale",

            features: [
                "200,000 Rows / Upload",
                "AI-Powered Business Insights",
                "Advanced Analytics & Reports",
                "Priority Processing",
                "Dedicated Priority Support",
            ],

            button: "Upgrade Now",

            action: "checkout",

            popular: false,

            active: true,

            paymentRequired: true,

            billingCycle: "monthly",

        },

    ],

};


// =====================================================
// PLAN HELPERS
// =====================================================

export const getPlanById = (planId) => {

    if (!planId) {
        return null;
    }

    return PRICING_CONFIG.plans.find(
        (plan) =>
            plan.id ===
            String(planId)
                .trim()
                .toLowerCase()
    ) || null;

};


// =====================================================
// ACTIVE PLANS
// =====================================================

export const getActivePlans = () => {

    return PRICING_CONFIG.plans.filter(
        (plan) =>
            plan.active === true
    );

};


// =====================================================
// PAID PLANS
// =====================================================

export const getPaidPlans = () => {

    return PRICING_CONFIG.plans.filter(
        (plan) =>
            plan.active === true &&
            plan.paymentRequired === true &&
            Number(plan.price) > 0
    );

};


// =====================================================
// IS PAID PLAN
// =====================================================

export const isPaidPlan = (planId) => {

    const plan =
        getPlanById(planId);

    return Boolean(
        plan &&
        plan.paymentRequired &&
        Number(plan.price) > 0
    );

};


// =====================================================
// CURRENT / FINAL PRICE
// =====================================================

export const getPlanPrice = (planId) => {

    const plan =
        getPlanById(planId);

    if (!plan) {
        return 0;
    }

    return Number(plan.price) || 0;

};


// =====================================================
// ORIGINAL PRICE
// =====================================================

export const getPlanOriginalPrice = (planId) => {

    const plan =
        getPlanById(planId);

    if (!plan) {
        return 0;
    }

    return Number(
        plan.originalPrice ?? plan.price
    ) || 0;

};


// =====================================================
// DISCOUNT
// =====================================================

export const getPlanDiscount = (planId) => {

    const plan =
        getPlanById(planId);

    if (!plan) {
        return 0;
    }

    return Number(
        plan.discount
    ) || 0;

};


// =====================================================
// DISPLAY PRICE
// =====================================================

export const getPlanDisplayPrice = (planId) => {

    const plan =
        getPlanById(planId);

    if (!plan) {
        return "₹0";
    }

    return plan.displayPrice;

};


// =====================================================
// DISPLAY ORIGINAL PRICE
// =====================================================

export const getPlanDisplayOriginalPrice = (planId) => {

    const plan =
        getPlanById(planId);

    if (!plan) {
        return null;
    }

    return plan.displayOriginalPrice || null;

};


// =====================================================
// DISPLAY DISCOUNT
// =====================================================

export const getPlanDisplayDiscount = (planId) => {

    const plan =
        getPlanById(planId);

    if (!plan) {
        return null;
    }

    return plan.displayDiscount || null;

};


// =====================================================
// HAS DISCOUNT
// =====================================================

export const hasPlanDiscount = (planId) => {

    const plan =
        getPlanById(planId);

    if (!plan) {
        return false;
    }

    return (
        Number(plan.originalPrice) >
        Number(plan.price)
    );

};


// =====================================================
// BILLING CYCLE
// =====================================================

export const getBillingCycle = (planId) => {

    const plan =
        getPlanById(planId);

    return (
        plan?.billingCycle ||
        PRICING_CONFIG.billingCycle
    );

};


// =====================================================
// CURRENCY
// =====================================================

export const getCurrency = () => {

    return PRICING_CONFIG.currency;

};


export const getCurrencySymbol = () => {

    return PRICING_CONFIG.currencySymbol;

};