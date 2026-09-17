export const COUPONS = {

    RAJESH102: {
        code: "RAJESH102",
        type: "percentage",
        value: 35,
        plans: ["Professional"],
        active: true,
        campaign: "Rajesh Creator Campaign",
        creator: "Rajesh",
        usageLimit: null,
        perUserLimit: 1,
    },


    WELCOME40: {

        code: "WELCOME40",

        type: "percentage",

        value: 40,

        plans: [
            "Professional",
        ],

        active: true,

        campaign:
            "Welcome Campaign",

        creator:
            null,

        usageLimit:
            null,

        perUserLimit:
            1,

        // ONLY NEW USERS
        newUserOnly:
            true,
    },


    KRYOLT5: {

        code: "KRYOLT5",

        type: "percentage",

        value: 40,

        plans: [
            "Professional",
            "Business",
        ],

        active: true,

        campaign:
            "Kryolt General",

        creator:
            null,

        usageLimit:
            null,

        perUserLimit:
            1,
    },


    // =====================================================
    // RAKSHA BANDHAN FESTIVAL OFFER
    // =====================================================

    RAKHI50: {

        code: "RAKHI50",

        type: "percentage",

        value: 70,

        plans: [
            "Professional",
        ],

        active: false,

        campaign:
            "Raksha Bandhan Festival Sale",

        creator:
            null,

        usageLimit:
            null,

        perUserLimit:
            1,

        // Festival offer — not restricted to new users
        newUserOnly:
            false,

    },

};


export function getCoupon(code) {

    if (!code) {
        return null;
    }


    const normalizedCode =
        String(code)
            .trim()
            .toUpperCase();


    return (
        COUPONS[normalizedCode] ||
        null
    );

}