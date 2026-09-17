import express from "express";

import {
    previewCheckout,
    createOrder,
    verifyPayment,
} from "../controllers/paymentController.js";

import {
    verifyRazorpaySignature,
} from "../middleware/verifySignature.js";

const router = express.Router();


// =====================================================
// PREVIEW CHECKOUT
// =====================================================

router.post(
    "/preview",
    previewCheckout
);


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

router.post(
    "/create-order",
    createOrder
);


// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

router.post(
    "/verify-payment",
    verifyRazorpaySignature,
    verifyPayment
);


// =====================================================
// COMPATIBILITY ROUTE
// =====================================================
// Keeps old frontend/service versions from breaking.
// Both URLs perform the same verification.

router.post(
    "/verify",
    verifyRazorpaySignature,
    verifyPayment
);


export default router;