import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";

import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

// ==============================================
// MIDDLEWARE
// ==============================================

app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

// ==============================================
// HEALTH CHECK
// ==============================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Kryolt Backend Running 🚀",
        environment:
            process.env.NODE_ENV ||
            "development",
    });
});

// ==============================================
// PAYMENT ROUTES
// ==============================================

app.use(
    "/api/payment",
    paymentRoutes
);

// ==============================================
// 404 HANDLER
// ==============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});

// ==============================================
// GLOBAL ERROR HANDLER
// ==============================================

app.use((err, req, res) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

// ==============================================
// SERVER
// ==============================================

const PORT =
    process.env.PORT ||
    5000;

app.listen(PORT, () => {
    console.log(
        `🚀 Kryolt Backend running on http://localhost:${PORT}`
    );

    console.log(
        `🌐 Frontend allowed: ${process.env.FRONTEND_URL ||
        "http://localhost:5173"
        }`
    );

    console.log(
        `💳 Razorpay: ${process.env.RAZORPAY_KEY_ID
            ? "Configured ✅"
            : "Missing ❌"
        }`
    );
});