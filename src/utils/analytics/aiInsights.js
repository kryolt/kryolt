/**
 * src/utils/analytics/aiInsights.js
 * ---------------------------------------------------------------------------
 * Kryolt — AI Business Intelligence Engine
 * ---------------------------------------------------------------------------
 * This module is a RULE-BASED business intelligence layer. It does NOT call
 * any external AI service (no OpenAI, no Gemini, no third-party API). Every
 * insight, recommendation, forecast, and risk is derived purely from the
 * `analytics` object that is already computed by `analytics.js`.
 *
 * This file intentionally does NOT recompute revenue, orders, customers,
 * growth rates, etc. — it only *consumes* those numbers and turns them into
 * human-readable business intelligence (summaries, recommendations,
 * opportunities, forecasts, risks).
 *
 * All functions are defensive: every analytics field is read with optional
 * chaining and safe fallbacks, so a partially-populated analytics object
 * never throws — it simply produces fewer insights.
 * ---------------------------------------------------------------------------
 */

import {
    TrendingDown,
    ShoppingBag,
    Gauge,
    Package,
    Users,
    CreditCard,
    MapPin,
    Repeat,
    AlertTriangle,
    Target,
    PieChart,
} from "lucide-react";


/* =============================================================================
   INTERNAL HELPERS
   (not exported — pure utility functions used across the engine)
============================================================================= */

/**
 * Safely formats a number as Indian Rupees.
 */
function formatCurrency(value = 0) {
    return `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;
}

/**
 * Clamps a number between a min and max (defaults to a 0–100 score range).
 */
function clamp(value, min = 0, max = 100) {
    if (value === null || value === undefined || Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
}

/**
 * Returns the best-performing entry from a { label, value } style array,
 * e.g. citySales, productSales — sorted descending by `value`/`total`.
 */
function getTopEntry(list = [], valueKey = "value") {
    if (!Array.isArray(list) || list.length === 0) return null;

    return [...list].sort(
        (a, b) => (b?.[valueKey] ?? 0) - (a?.[valueKey] ?? 0)
    )[0];
}

/**
 * Returns the weakest-performing entry from a { label, value } style array.
 */
function getBottomEntry(list = [], valueKey = "value") {
    if (!Array.isArray(list) || list.length === 0) return null;

    return [...list].sort(
        (a, b) => (a?.[valueKey] ?? 0) - (b?.[valueKey] ?? 0)
    )[0];
}

/**
 * Returns the [method, count] pair with the highest transaction count from
 * analytics.paymentMethods.
 */
function getTopPaymentMethod(paymentMethods = {}) {
    const entries = Object.entries(paymentMethods || {});

    if (entries.length === 0) return null;

    return entries.sort((a, b) => b[1] - a[1])[0];
}


/* =============================================================================
   HELPER: getHealthStatus
   Converts a numeric business health score (0-100) into a readable label.
============================================================================= */

export function getHealthStatus(score) {

    const value = clamp(score);

    if (value >= 90) return { label: "Excellent", tone: "positive" };
    if (value >= 75) return { label: "Good", tone: "positive" };
    if (value >= 50) return { label: "Fair", tone: "neutral" };

    return { label: "Needs attention", tone: "warning" };

}


/* =============================================================================
   HELPER: calculateForecast
   Projects next month's revenue using recent growth rate and monthly trend,
   when available. Falls back to a conservative flat projection.
============================================================================= */

export function calculateForecast(analytics = {}) {

    const currentRevenue = Number(analytics?.totalRevenue) || 0;
    const growthRate = analytics?.revenueGrowth;
    const monthlySales = analytics?.monthlySales; // e.g. [{ month, revenue }]

    // Preferred method: use the two most recent months of real sales data,
    // and project the same month-over-month trend forward.
    if (Array.isArray(monthlySales) && monthlySales.length >= 2) {

        const last = monthlySales[monthlySales.length - 1];
        const prev = monthlySales[monthlySales.length - 2];

        const lastRevenue = Number(last?.revenue) || 0;
        const prevRevenue = Number(prev?.revenue) || 0;

        if (prevRevenue > 0) {

            const trendRate = ((lastRevenue - prevRevenue) / prevRevenue) * 100;
            const nextMonthRevenue = Math.round(lastRevenue * (1 + trendRate / 100));

            return {
                nextMonthRevenue: Math.max(nextMonthRevenue, 0),
                growthRate: Number(trendRate.toFixed(1)),
                source: "monthlySales",
            };

        }

    }

    // Fallback method: apply the already-computed revenueGrowth percentage
    // (period-over-period) to the current total revenue.
    if (growthRate !== undefined && growthRate !== null && currentRevenue > 0) {

        const nextMonthRevenue = Math.round(
            currentRevenue * (1 + growthRate / 100)
        );

        return {
            nextMonthRevenue: Math.max(nextMonthRevenue, 0),
            growthRate: Number(growthRate),
            source: "revenueGrowth",
        };

    }

    // Not enough data to forecast.
    return {
        nextMonthRevenue: null,
        growthRate: null,
        source: null,
    };

}


/* =============================================================================
   HELPER: calculateConfidence
   Estimates how reliable a forecast/summary is, based on how much real data
   backs it (record count, presence of growth history, business health).
============================================================================= */

export function calculateConfidence(analytics = {}, forecastSource = null) {

    let score = 40; // baseline — some data exists, but confidence starts modest

    const recordCount = Number(analytics?.totalOrders) || 0;

    if (recordCount >= 200) score += 25;
    else if (recordCount >= 50) score += 15;
    else if (recordCount >= 10) score += 5;

    if (forecastSource === "monthlySales") score += 20;
    else if (forecastSource === "revenueGrowth") score += 10;

    const health = analytics?.businessHealth;

    if (health !== undefined && health !== null) {
        score += Math.round(clamp(health) / 10); // up to +10
    }

    return clamp(Math.round(score));

}


/* =============================================================================
   HELPER: detectRisks
   Runs a fixed set of business-risk checks against analytics and returns
   only the risks that are actually supported by the data.
============================================================================= */

export function detectRisks(analytics = {}) {

    const risks = [];

    // ---- Low business health ----
    const health = analytics?.businessHealth;

    if (health !== undefined && health !== null && health < 60) {
        risks.push({
            level: health < 40 ? "high" : "medium",
            title: "Low business health",
            description: `Business health score is ${health}/100, below a healthy threshold.`,
        });
    }

    // ---- Low customer count ----
    const totalCustomers = analytics?.totalCustomers;

    if (
        analytics?.customerAnalytics?.available &&
        totalCustomers !== undefined &&
        totalCustomers !== null &&
        totalCustomers < 10
    ) {
        risks.push({
            level: "medium",
            title: "Low customer count",
            description: `Only ${totalCustomers} unique customers recorded — a small base increases revenue volatility.`,
        });
    }

    // ---- Revenue declining ----
    const revenueGrowth = analytics?.revenueGrowth;

    if (revenueGrowth !== undefined && revenueGrowth !== null && revenueGrowth < 0) {
        risks.push({
            level: revenueGrowth <= -15 ? "high" : "medium",
            title: "Revenue declining",
            description: `Revenue is down ${Math.abs(revenueGrowth)}% compared to the previous period.`,
        });
    }

    // ---- Single product dependency ----
    const productSales = analytics?.productAnalytics?.productSales; // [{ label/name, value/total }]

    if (Array.isArray(productSales) && productSales.length > 1) {

        const top = getTopEntry(productSales, "value") || getTopEntry(productSales, "total");
        const totalRevenue = Number(analytics?.totalRevenue) || 0;
        const topValue = Number(top?.value ?? top?.total) || 0;

        if (totalRevenue > 0 && top) {

            const share = (topValue / totalRevenue) * 100;

            if (share > 50) {
                risks.push({
                    level: share > 70 ? "high" : "medium",
                    title: "Single product dependency",
                    description: `${top?.label ?? top?.name ?? "Your top product"} accounts for ${share.toFixed(0)}% of total revenue.`,
                });
            }

        }

    }

    // ---- Single city dependency ----
    const citySales = analytics?.citySales;

    if (Array.isArray(citySales) && citySales.length > 1) {

        const top = getTopEntry(citySales, "total") || getTopEntry(citySales, "value");
        const totalCitySales = citySales.reduce(
            (sum, c) => sum + (Number(c?.total ?? c?.value) || 0),
            0
        );

        if (totalCitySales > 0 && top) {

            const share = ((Number(top?.total ?? top?.value) || 0) / totalCitySales) * 100;

            if (share > 60) {
                risks.push({
                    level: share > 80 ? "high" : "medium",
                    title: "Single city dependency",
                    description: `${top?.city ?? "Your top city"} contributes ${share.toFixed(0)}% of sales — limited geographic diversification.`,
                });
            }

        }

    }

    // ---- Low order value ----
    const avgOrderValue = analytics?.averageOrderValue;

    if (avgOrderValue !== undefined && avgOrderValue !== null && avgOrderValue > 0 && avgOrderValue < 500) {
        risks.push({
            level: "medium",
            title: "Low order value",
            description: `Average order value is only ${formatCurrency(avgOrderValue)}, limiting revenue per transaction.`,
        });
    }

    return risks;

}


/* =============================================================================
   1. generateExecutiveSummary
============================================================================= */

/**
 * Builds a top-level executive summary from analytics.
 *
 * @param {object} analytics
 * @returns {{
 *   title: string,
 *   description: string,
 *   businessHealth: number|null,
 *   healthStatus: string|null,
 *   highlights: Array<{ label: string, value: string }>
 * }}
 */
export function generateExecutiveSummary(analytics = {}) {

    const health = analytics?.businessHealth ?? null;
    const status = health !== null ? getHealthStatus(health) : null;

    const highlights = [];

    if (analytics?.totalRevenue !== undefined && analytics?.totalRevenue !== null) {
        highlights.push({ label: "Revenue", value: formatCurrency(analytics.totalRevenue) });
    }

    if (analytics?.totalOrders !== undefined && analytics?.totalOrders !== null) {
        highlights.push({ label: "Orders", value: String(analytics.totalOrders) });
    }

    if (analytics?.customerAnalytics?.available && analytics?.totalCustomers !== undefined) {
        highlights.push({ label: "Customers", value: String(analytics.totalCustomers) });
    }

    if (analytics?.averageOrderValue !== undefined && analytics?.averageOrderValue !== null) {
        highlights.push({ label: "Average Order Value", value: formatCurrency(analytics.averageOrderValue) });
    }

    if (analytics?.topProduct && analytics.topProduct !== "N/A") {
        highlights.push({ label: "Best Product", value: analytics.topProduct });
    }

    const topCity = getTopEntry(analytics?.citySales, "total") || getTopEntry(analytics?.citySales, "value");

    if (topCity?.city) {
        highlights.push({ label: "Best City", value: topCity.city });
    }

    const topPayment = getTopPaymentMethod(analytics?.paymentMethods);

    if (topPayment) {
        highlights.push({ label: "Best Payment Method", value: topPayment[0] });
    }

    // Compose a short narrative description from whatever is available.
    const sentences = [];

    if (analytics?.totalRevenue && analytics?.totalOrders) {
        sentences.push(
            `The business generated ${formatCurrency(analytics.totalRevenue)} from ${analytics.totalOrders} orders.`
        );
    }

    if (status) {
        sentences.push(`Overall business health is rated ${status.label.toLowerCase()}.`);
    }

    if (analytics?.topProduct && analytics.topProduct !== "N/A") {
        sentences.push(`${analytics.topProduct} is the strongest performing product.`);
    }

    const description = sentences.length
        ? sentences.join(" ")
        : "Upload more transaction data to generate a complete executive summary.";

    return {
        title: "AI Executive Summary",
        description,
        businessHealth: health,
        healthStatus: status?.label ?? null,
        highlights,
    };

}


/* =============================================================================
   2. generatePerformanceAnalysis
============================================================================= */

/**
 * Identifies business strengths and weaknesses from analytics, plus the
 * top/lowest performing products and highest/lowest sale values.
 *
 * @param {object} analytics
 * @returns {{
 *   strengths: string[],
 *   weaknesses: string[],
 *   topPerformer: string|null,
 *   lowestPerformer: string|null,
 *   highestSale: number|null,
 *   lowestSale: number|null
 * }}
 */
export function generatePerformanceAnalysis(analytics = {}) {

    const strengths = [];
    const weaknesses = [];

    // ---- Revenue ----
    if (analytics?.revenueGrowth !== undefined && analytics?.revenueGrowth !== null) {

        if (analytics.revenueGrowth >= 10) strengths.push("High revenue growth");
        else if (analytics.revenueGrowth < 0) weaknesses.push("Declining revenue");

    } else if (analytics?.totalRevenue > 0) {

        strengths.push("High revenue"); // no trend data, but revenue exists

    }

    // ---- Average order value ----
    if (analytics?.averageOrderValue !== undefined && analytics?.averageOrderValue !== null) {

        if (analytics.averageOrderValue >= 1000) strengths.push("Healthy order value");
        else if (analytics.averageOrderValue < 500) weaknesses.push("Low order value");

    }

    // ---- Customer base ----
    if (analytics?.customerAnalytics?.available && analytics?.totalCustomers !== undefined) {

        if (analytics.totalCustomers >= 50) strengths.push("Strong customer base");
        else if (analytics.totalCustomers < 10) weaknesses.push("Small customer base");

    }

    // ---- Repeat customers ----
    const retentionRate = analytics?.customerAnalytics?.retentionRate;

    if (retentionRate !== undefined && retentionRate !== null) {

        if (retentionRate >= 50) strengths.push("Strong customer retention");
        else weaknesses.push("Low repeat purchase rate");

    }

    // ---- Top product ----
    if (analytics?.topProduct && analytics.topProduct !== "N/A") {
        strengths.push("Best-selling product identified");
    }

    // ---- Business health ----
    if (analytics?.businessHealth !== undefined && analytics?.businessHealth !== null) {

        if (analytics.businessHealth >= 75) strengths.push("Healthy overall business score");
        else if (analytics.businessHealth < 50) weaknesses.push("Below-target business health");

    }

    // ---- Profit margin ----
    const margin = analytics?.financial?.grossProfitMargin;

    if (margin !== undefined && margin !== null) {

        if (margin >= 20) strengths.push("Healthy profit margin");
        else weaknesses.push("Thin profit margin");

    }

    // ---- Top / lowest performing product ----
    const productSales = analytics?.productAnalytics?.productSales;

    const topProductEntry = getTopEntry(productSales, "value") || getTopEntry(productSales, "total");
    const lowProductEntry = getBottomEntry(productSales, "value") || getBottomEntry(productSales, "total");

    const topPerformer = topProductEntry?.label ?? topProductEntry?.name ?? analytics?.topProduct ?? null;
    const lowestPerformer = lowProductEntry?.label ?? lowProductEntry?.name ?? analytics?.worstProduct ?? null;

    return {
        strengths,
        weaknesses,
        topPerformer,
        lowestPerformer,
        highestSale: analytics?.highestSale ?? null,
        lowestSale: analytics?.lowestSale ?? null,
    };

}


/* =============================================================================
   3. generateAIRecommendations
============================================================================= */

/**
 * Generates prioritized, data-backed recommendations.
 *
 * @param {object} analytics
 * @returns {Array<{
 *   id: string,
 *   icon: React.ComponentType,
 *   title: string,
 *   description: string,
 *   priority: "high"|"medium"|"low",
 *   impact: "high"|"medium"|"low",
 *   difficulty: "easy"|"medium"|"hard",
 *   roi: string,
 *   expectedImprovement: string
 * }>}
 */
export function generateAIRecommendations(analytics = {}) {

    const recommendations = [];

    // ---- Revenue ----
    if (analytics?.revenueGrowth !== undefined && analytics?.revenueGrowth !== null && analytics.revenueGrowth < 0) {
        const dropPct = Math.abs(analytics.revenueGrowth);
        recommendations.push({
            id: "reverse-revenue-decline",
            icon: TrendingDown,
            title: "Reverse the revenue decline",
            description: `Revenue is down ${dropPct}% — review pricing, promotions, and top-selling channels.`,
            priority: "high",
            impact: "high",
            difficulty: "medium",
            roi: `+${dropPct}% Revenue Recovery`,
            expectedImprovement: `Recover the ${dropPct}% drop in revenue`,
        });
    }

    // ---- Orders ----
    if (analytics?.ordersGrowth !== undefined && analytics?.ordersGrowth !== null && analytics.ordersGrowth < 0) {
        const dropPct = Math.abs(analytics.ordersGrowth);
        recommendations.push({
            id: "boost-order-volume",
            icon: ShoppingBag,
            title: "Boost order volume",
            description: "Order count is trending down — consider limited-time offers to drive purchase frequency.",
            priority: "medium",
            impact: "medium",
            difficulty: "easy",
            roi: `+${dropPct}% Orders Recovery`,
            expectedImprovement: `Recover the ${dropPct}% drop in orders`,
        });
    }

    // ---- Business health ----
    if (analytics?.businessHealth !== undefined && analytics?.businessHealth !== null && analytics.businessHealth < 75) {
        const health = Number(analytics.businessHealth);
        const target = clamp(health + 15);
        recommendations.push({
            id: "improve-business-health",
            icon: Gauge,
            title: "Improve overall business health",
            description: `Business health is at ${health}/100 — focus on the weakest contributing metric first.`,
            priority: health < 50 ? "high" : "medium",
            impact: "high",
            difficulty: "hard",
            roi: `+${target - health} pts Health Score`,
            expectedImprovement: `Target ≈ ${target}/100 business health score`,
        });
    }

    // ---- Top product ----
    if (analytics?.topProduct && analytics.topProduct !== "N/A") {
        recommendations.push({
            id: "stock-top-product",
            icon: Package,
            title: `Increase inventory of ${analytics.topProduct}`,
            description: `${analytics.topProduct} is your best-selling product — ensure stock availability to avoid missed sales.`,
            priority: "high",
            impact: "medium",
            difficulty: "easy",
            roi: "Protects top-selling revenue",
            expectedImprovement: `Maintain uninterrupted stock for ${analytics.topProduct}`,
        });
    }

    // ---- Customer count ----
    if (analytics?.customerAnalytics?.available && analytics?.totalCustomers < 20) {
        recommendations.push({
            id: "grow-customer-base",
            icon: Users,
            title: "Grow the customer base",
            description: "Your customer base is still small — invest in acquisition channels that match your best-selling products.",
            priority: "medium",
            impact: "high",
            difficulty: "medium",
            roi: "N/A",
            expectedImprovement: `Expand beyond ${analytics.totalCustomers} current customers`,
        });
    }

    // ---- Payment trend ----
    const topPayment = getTopPaymentMethod(analytics?.paymentMethods);

    if (topPayment) {

        const [method, count] = topPayment;
        const totalPayments = Object.values(analytics?.paymentMethods || {}).reduce((s, v) => s + v, 0);
        const share = totalPayments > 0 ? (count / totalPayments) * 100 : 0;

        if (share > 70) {
            recommendations.push({
                id: "diversify-payment-methods",
                icon: CreditCard,
                title: "Diversify payment methods",
                description: `${method} accounts for ${share.toFixed(0)}% of transactions — offering alternatives can reduce checkout friction.`,
                priority: "low",
                impact: "medium",
                difficulty: "easy",
                roi: `Reduce ${share.toFixed(0)}% payment concentration`,
                expectedImprovement: `Balance transaction share beyond ${method}`,
            });
        } else {
            recommendations.push({
                id: "promote-preferred-payment",
                icon: CreditCard,
                title: `Promote ${method} at checkout`,
                description: `${method} is your customers' preferred payment method — highlight it to reduce checkout drop-off.`,
                priority: "low",
                impact: "low",
                difficulty: "easy",
                roi: `${share.toFixed(0)}% current adoption`,
                expectedImprovement: `Reinforce ${method} as the primary checkout option`,
            });
        }

    }

    // ---- City performance ----
    const topCity = getTopEntry(analytics?.citySales, "total") || getTopEntry(analytics?.citySales, "value");

    if (topCity?.city) {
        const cityValue = Number(topCity?.total ?? topCity?.value) || 0;
        recommendations.push({
            id: "expand-top-city",
            icon: MapPin,
            title: `Expand marketing in ${topCity.city}`,
            description: `${topCity.city} is your best-performing market — targeted campaigns here are likely to yield strong returns.`,
            priority: "medium",
            impact: "medium",
            difficulty: "medium",
            roi: cityValue > 0 ? `${formatCurrency(cityValue)} regional revenue base` : "N/A",
            expectedImprovement: `Grow revenue share in ${topCity.city}`,
        });
    }

    // ---- Repeat customers ----
    const retentionRate = analytics?.customerAnalytics?.retentionRate;

    if (retentionRate !== undefined && retentionRate !== null && retentionRate < 50) {
        recommendations.push({
            id: "improve-repeat-customer-rate",
            icon: Repeat,
            title: "Improve repeat customer rate",
            description: `Only ${retentionRate}% of customers return — a loyalty program could meaningfully increase repeat purchases.`,
            priority: "high",
            impact: "high",
            difficulty: "medium",
            roi: `+${(50 - retentionRate).toFixed(0)} pts Retention`,
            expectedImprovement: `Target ≈ 50% repeat customer rate`,
        });
    }

    // ---- Inventory ----
    const lowStockCount = analytics?.inventory?.lowStockCount;

    if (lowStockCount > 0) {
        recommendations.push({
            id: "restock-low-inventory",
            icon: AlertTriangle,
            title: "Restock low-inventory items",
            description: `${lowStockCount} item${lowStockCount > 1 ? "s are" : " is"} running low — restock to avoid lost sales.`,
            priority: "high",
            impact: "high",
            difficulty: "easy",
            roi: `Protects ${lowStockCount} at-risk SKU${lowStockCount > 1 ? "s" : ""}`,
            expectedImprovement: `Restock ${lowStockCount} low-inventory item${lowStockCount > 1 ? "s" : ""}`,
        });
    }

    // ---- Upselling ----
    if (analytics?.averageOrderValue !== undefined && analytics?.averageOrderValue !== null && analytics.averageOrderValue < 1000) {
        const aov = Number(analytics.averageOrderValue) || 0;
        const gap = Math.max(1000 - aov, 0);
        const roiPct = aov > 0 ? Math.round((gap / aov) * 100) : null;

        recommendations.push({
            id: "increase-aov",
            icon: Target,
            title: "Increase average order value",
            description: "Introduce product bundles or premium variants to lift the average order value.",
            priority: "medium",
            impact: "medium",
            difficulty: "medium",
            roi: roiPct !== null ? `+${roiPct}% AOV` : "N/A",
            expectedImprovement: gap > 0
                ? `Increase average order value by ${formatCurrency(gap)}`
                : "More data required",
        });
    }

    // ---- Cross-selling ----
    if (analytics?.categoryAnalytics?.available && analytics?.categoryAnalytics?.topCategory) {
        recommendations.push({
            id: "cross-sell-top-category",
            icon: PieChart,
            title: `Cross-sell within ${analytics.categoryAnalytics.topCategory}`,
            description: `${analytics.categoryAnalytics.topCategory} is your strongest category — recommend related products at checkout.`,
            priority: "low",
            impact: "low",
            difficulty: "easy",
            roi: "N/A",
            expectedImprovement: `Recommend related products within ${analytics.categoryAnalytics.topCategory}`,
        });
    }

    return recommendations;

}


/* =============================================================================
   4. generateGrowthOpportunities
============================================================================= */

/**
 * Identifies growth opportunities, each with an estimated impact and
 * difficulty to help prioritize execution.
 *
 * @param {object} analytics
 * @returns {Array<{ title: string, description: string, impact: string, difficulty: string }>}
 */
export function generateGrowthOpportunities(analytics = {}) {

    const opportunities = [];

    const topCity = getTopEntry(analytics?.citySales, "total") || getTopEntry(analytics?.citySales, "value");

    if (topCity?.city) {
        opportunities.push({
            title: `Expand in ${topCity.city}`,
            description: `${topCity.city} already leads in sales — increasing local marketing spend here has the highest chance of return.`,
            impact: "High",
            difficulty: "Medium",
        });
    }

    const retentionRate = analytics?.customerAnalytics?.retentionRate;

    if (retentionRate !== undefined && retentionRate !== null) {
        opportunities.push({
            title: "Increase repeat purchases",
            description: retentionRate >= 50
                ? "Retention is already healthy — a tiered loyalty program could push it further."
                : "Repeat purchase rate is low — a simple loyalty or discount-on-next-order program can improve it quickly.",
            impact: "High",
            difficulty: "Low",
        });
    }

    if (analytics?.topProduct && analytics.topProduct !== "N/A") {
        opportunities.push({
            title: `Promote ${analytics.topProduct}`,
            description: `${analytics.topProduct} is already your best seller — feature it in campaigns and bundle it with complementary items.`,
            impact: "Medium",
            difficulty: "Low",
        });
    }

    const topPayment = getTopPaymentMethod(analytics?.paymentMethods);
    const paymentEntries = Object.entries(analytics?.paymentMethods || {});

    if (topPayment && paymentEntries.length > 1) {

        const totalPayments = paymentEntries.reduce((s, [, c]) => s + c, 0);
        const share = totalPayments > 0 ? (topPayment[1] / totalPayments) * 100 : 0;

        if (share < 60) {
            opportunities.push({
                title: "Improve payment adoption",
                description: "No single payment method dominates yet — promoting UPI or cards at checkout can reduce friction and boost conversion.",
                impact: "Medium",
                difficulty: "Low",
            });
        }

    }

    if (analytics?.averageOrderValue !== undefined && analytics?.averageOrderValue !== null) {
        opportunities.push({
            title: "Increase average order value",
            description: "Introducing bundles, minimum-order-value discounts, or premium variants can raise revenue per order.",
            impact: "Medium",
            difficulty: "Medium",
        });
    }

    return opportunities;

}


/* =============================================================================
   5. generateRevenueForecast
============================================================================= */

/**
 * Produces a next-period revenue forecast using available trend data, along
 * with a confidence score and a plain-language explanation.
 *
 * @param {object} analytics
 * @returns {{
 *   nextMonthRevenue: number|null,
 *   growthRate: number|null,
 *   confidence: number,
 *   forecastText: string
 * }}
 */
export function generateRevenueForecast(analytics = {}) {

    const { nextMonthRevenue, growthRate, source } = calculateForecast(analytics);
    const confidence = calculateConfidence(analytics, source);

    let forecastText;

    if (nextMonthRevenue === null) {

        forecastText = "Not enough historical data to generate a reliable revenue forecast yet.";

    } else {

        const direction = growthRate >= 0 ? "grow" : "decline";

        forecastText = `Based on current trends, revenue is projected to ${direction} to approximately ${formatCurrency(nextMonthRevenue)} next month ` +
            `(${growthRate >= 0 ? "+" : ""}${growthRate}% vs. the current period), with ${confidence}% confidence.`;

    }

    return {
        nextMonthRevenue,
        growthRate,
        confidence,
        forecastText,
    };

}


/* =============================================================================
   6. generateRiskAnalysis
============================================================================= */

/**
 * Returns the list of business risks currently supported by the analytics
 * object. This is a thin, documented wrapper around detectRisks() so callers
 * have one obvious public entry point for risk analysis.
 *
 * @param {object} analytics
 * @returns {Array<{ level: string, title: string, description: string }>}
 */
export function generateRiskAnalysis(analytics = {}) {
    return detectRisks(analytics);
}