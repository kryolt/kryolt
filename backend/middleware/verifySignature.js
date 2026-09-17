import crypto from "crypto";

export const verifyRazorpaySignature = (req, res, next) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification data is missing",
            });
        }

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        if (
            generatedSignature.length !==
            razorpay_signature.length
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid signature length",
            });

        }

        const isValid = crypto.timingSafeEqual(
            Buffer.from(generatedSignature),
            Buffer.from(razorpay_signature)
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        req.payment = {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        };

        next();

    } catch (error) {

        console.error(
            "Signature Verification Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });

    }

};