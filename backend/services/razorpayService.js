import dotenv from "dotenv";
import Razorpay from "razorpay";

// =====================================================
// ENVIRONMENT
// =====================================================

dotenv.config();

// =====================================================
// RAZORPAY CONFIGURATION
// =====================================================

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

if (!keyId) {
    throw new Error(
        "RAZORPAY_KEY_ID is missing from environment variables."
    );
}

if (!keySecret) {
    throw new Error(
        "RAZORPAY_KEY_SECRET is missing from environment variables."
    );
}

// =====================================================
// RAZORPAY CLIENT
// =====================================================

const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
});

// =====================================================
// EXPORT
// =====================================================

export default razorpay;