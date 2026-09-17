/**
 * ==========================================
 * Kryolt Analytics Engine (Production Grade)
 * ==========================================
 *
 * Fully backward-compatible, single-pass O(n) analytics engine.
 * Supports up to 200,000+ rows and dynamically handles known
 * and future dynamic CSV columns without code modifications.
 */

/* ==========================================
   PUBLIC ENTRY POINT
========================================== */

export function calculateAnalytics(data = []) {
    if (!Array.isArray(data) || data.length === 0) {
        return getEmptyAnalytics();
    }

    const availability = getAvailability(data);

    /* ----------------------------------------
       RAW ACCUMULATORS (single pass)
    ---------------------------------------- */

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const customerSet = new Set();
    const customerSpend = {};          // { name: totalSpend }
    const customerOrderCount = {};     // { name: orderCount }

    const productMap = {};             // { name: { revenue, profit, quantity, orders } }
    const paymentMap = {};             // { name: { revenue, profit, quantity, orders } }
    const cityMap = {};                // { name: { revenue, profit, quantity, orders } }
    const categoryMap = {};            // { name: { revenue, profit, quantity, orders } }

    const monthlyRevenueMap = {};      // Short month keys e.g. "Jul"
    const monthlyOrdersMap = {};
    const monthlyProfitMap = {};

    const dailyMap = {};               // YYYY-MM-DD
    const weeklyMap = {};              // YYYY-Www
    const monthlyFullMap = {};         // YYYY-MM
    const quarterlyMap = {};           // YYYY-Qq
    const yearlyMap = {};              // YYYY

    const monthlyCustomerSets = {};    // "YYYY-MM": Set(customerNames)

    const extraDimMaps = {};           // { fieldName: { value: { revenue, profit, quantity, orders } } }

    let highestSaleOrder = null;
    let lowestSaleOrder = null;
    let highestProfitOrder = null;
    let lowestProfitOrder = null;

    // Known structural fields to ignore when identifying dynamic/extra columns
    const KNOWN_FIELDS = new Set([
        "Product", "ProductName", "Item",
        "Category",
        "Customer", "CustomerName", "Name", "Email", "Phone",
        "Payment", "PaymentMethod",
        "City", "Location", "State", "Country",
        "Quantity", "Amount", "Sales", "Total", "Revenue",
        "Cost", "CostPrice", "Profit",
        "OrderDate", "Date", "AvailableFields", "ExtraFields"
    ]);

    /* ----------------------------------------
       SINGLE PASS OVER DATASET
    ---------------------------------------- */

    for (let i = 0; i < data.length; i++) {
        const row = data[i] || {};

        const amount = extractAmount(row);
        const cost = extractCost(row);
        const profit = extractProfit(row, amount, cost);

        totalRevenue += amount;
        totalCost += cost;
        totalProfit += profit;

        const orderDetail = buildOrderDetail(row, amount, profit);

        if (!highestSaleOrder || amount > highestSaleOrder.amount) {
            highestSaleOrder = orderDetail;
        }
        if (!lowestSaleOrder || amount < lowestSaleOrder.amount) {
            lowestSaleOrder = orderDetail;
        }
        if (!highestProfitOrder || profit > highestProfitOrder.profit) {
            highestProfitOrder = orderDetail;
        }
        if (!lowestProfitOrder || profit < lowestProfitOrder.profit) {
            lowestProfitOrder = orderDetail;
        }

        // ---- Customer ----
        const customer = row.Customer ?? row.CustomerName ?? row.Name ?? "Unknown";
        customerSet.add(customer);
        customerSpend[customer] = (customerSpend[customer] || 0) + amount;
        customerOrderCount[customer] = (customerOrderCount[customer] || 0) + 1;

        // ---- Product ----
        const product = row.Product ?? row.ProductName ?? row.Item ?? "Unknown";
        bump(productMap, product, {
            revenue: amount,
            profit,
            quantity: Number(row.Quantity) || 0,
        });

        // ---- Payment ----
        if (availability.payment) {
            const payment = row.Payment ?? row.PaymentMethod ?? "Unknown";
            bump(paymentMap, payment, { revenue: amount, profit });
        }

        // ---- City ----
        if (availability.city) {
            const city = row.City ?? row.Location ?? "Unknown";
            bump(cityMap, city, { revenue: amount, profit });
        }

        // ---- Category ----
        if (availability.category) {
            const category = row.Category ?? "Unknown";
            bump(categoryMap, category, { revenue: amount, profit });
        }

        // ---- Short-month series (Legacy Compatibility) ----
        trackMonth(row, amount, profit, monthlyRevenueMap, monthlyOrdersMap, monthlyProfitMap);

        // ---- Date-based Time Buckets ----
        const rawDate = row.Date ?? row.OrderDate;
        const ymd = extractYMD(rawDate);

        if (ymd) {
            const keys = buildPeriodKeys(ymd);

            bump(dailyMap, keys.day, { revenue: amount, profit });
            bump(weeklyMap, keys.week, { revenue: amount, profit });
            bump(monthlyFullMap, keys.month, { revenue: amount, profit });
            bump(quarterlyMap, keys.quarter, { revenue: amount, profit });
            bump(yearlyMap, keys.year, { revenue: amount, profit });

            if (!monthlyCustomerSets[keys.month]) {
                monthlyCustomerSets[keys.month] = new Set();
            }
            monthlyCustomerSets[keys.month].add(customer);
        }

        // ---- Extra / Future-Proof Dynamic Dimensions ----
        const extraFields = row.ExtraFields || {};
        Object.entries(extraFields).forEach(([field, value]) => {
            if (value === null || value === undefined || value === "") return;
            if (!extraDimMaps[field]) extraDimMaps[field] = {};
            bump(extraDimMaps[field], String(value), { revenue: amount, profit, quantity: Number(row.Quantity) || 0 });
        });

        // Also automatically discover any unlisted root-level custom columns
        Object.keys(row).forEach((key) => {
            if (KNOWN_FIELDS.has(key)) return;
            const val = row[key];
            if (val === null || val === undefined || val === "" || typeof val === "object" || typeof val === "function") return;
            if (!extraDimMaps[key]) extraDimMaps[key] = {};
            bump(extraDimMaps[key], String(val), { revenue: amount, profit, quantity: Number(row.Quantity) || 0 });
        });
    }

    /* ----------------------------------------
       DERIVED: EXISTING FIELDS (Backward Compatible)
    ---------------------------------------- */

    const totalOrders = data.length;
    const totalCustomers = customerSet.size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productRevenuePlain = toPlainNumberMap(productMap, "revenue");
    const topProduct = getTopEntryName(productRevenuePlain);
    const topProductCount = productMap[topProduct]?.orders || 0;

    const topCustomer = getTopEntryName(customerSpend);
    const topCustomerSpend = customerSpend[topCustomer] || 0;

    const cityRevenuePlain = toPlainNumberMap(cityMap, "revenue");
    const topCity = availability.city ? getTopEntryName(cityRevenuePlain) : "N/A";

    const paymentMethods = toPlainNumberMap(paymentMap, "orders");
    const bestPayment = availability.payment ? getTopEntryName(paymentMethods) : "N/A";

    const monthlySales = buildMonthlySeries(monthlyRevenueMap, monthlyOrdersMap, monthlyProfitMap);

    const revenueGrowth = calculateGrowth(monthlySales, "sales");
    const ordersGrowth = calculateGrowth(monthlySales, "orders");

    const citySales = buildCitySeries(cityRevenuePlain);
    const productSales = buildProductSeries(productMap);

    const businessHealth = calculateBusinessHealthLegacy({
        totalRevenue,
        customerCount: totalCustomers,
        productCount: Object.keys(productMap).length,
    });

    /* ----------------------------------------
       DERIVED: FINANCIAL KPIs
    ---------------------------------------- */

    const grossProfitMargin = totalRevenue > 0 ? round2((totalProfit / totalRevenue) * 100) : 0;
    const averageProfitPerOrder = totalOrders > 0 ? round2(totalProfit / totalOrders) : 0;

    const financial = {
        totalRevenue,
        totalCost,
        totalProfit,
        grossProfitMargin,
        averageProfitPerOrder,
    };

    /* ----------------------------------------
       DERIVED: PRODUCT ANALYTICS
    ---------------------------------------- */

    const productAnalytics = {
        available: true,
        topByRevenue: topKeyBy(productMap, "revenue"),
        topByQuantity: topKeyBy(productMap, "quantity"),
        topByProfit: topKeyBy(productMap, "profit"),
        lowestProduct: bottomKeyBy(productMap, "revenue"),
        revenueByProduct: toPlainNumberMap(productMap, "revenue"),
        profitByProduct: toPlainNumberMap(productMap, "profit"),
        quantityByProduct: toPlainNumberMap(productMap, "quantity"),
    };

    /* ----------------------------------------
       DERIVED: CUSTOMER ANALYTICS
    ---------------------------------------- */

    const customerAnalytics = availability.customer ? {
        available: true,
        totalCustomers,
        repeatCustomers: Object.values(customerOrderCount).filter((c) => c > 1).length,
        averageSpend: totalCustomers > 0 ? round2(totalRevenue / totalCustomers) : 0,
        topCustomers: topNEntries(customerSpend, 5),
        customerRevenueMap: customerSpend,
    } : { available: false };

    /* ----------------------------------------
       DERIVED: PAYMENT ANALYTICS
    ---------------------------------------- */

    const paymentAnalytics = availability.payment ? {
        available: true,
        bestPayment,
        paymentCount: paymentMethods,
        paymentRevenue: toPlainNumberMap(paymentMap, "revenue"),
        paymentPercentage: buildPercentageMap(paymentMethods, totalOrders),
    } : { available: false };

    /* ----------------------------------------
       DERIVED: CITY ANALYTICS
    ---------------------------------------- */

    const cityAnalytics = availability.city ? {
        available: true,
        topCity,
        cityRevenue: cityRevenuePlain,
        cityOrders: toPlainNumberMap(cityMap, "orders"),
        cityProfit: toPlainNumberMap(cityMap, "profit"),
    } : { available: false };

    /* ----------------------------------------
       DERIVED: CATEGORY ANALYTICS
    ---------------------------------------- */

    const categoryAnalytics = availability.category ? {
        available: true,
        topCategory: topKeyBy(categoryMap, "revenue"),
        categoryRevenue: toPlainNumberMap(categoryMap, "revenue"),
        categoryProfit: toPlainNumberMap(categoryMap, "profit"),
        categoryOrders: toPlainNumberMap(categoryMap, "orders"),
    } : { available: false };

    /* ----------------------------------------
       DERIVED: TIME ANALYTICS
    ---------------------------------------- */

    const timeAnalytics = {
        daily: seriesFromMap(dailyMap),
        weekly: seriesFromMap(weeklyMap),
        monthly: seriesFromMap(monthlyFullMap),
        quarterly: seriesFromMap(quarterlyMap),
        yearly: seriesFromMap(yearlyMap),
    };

    /* ----------------------------------------
       DERIVED: GROWTH
    ---------------------------------------- */

    const monthlyCustomerCounts = Object.fromEntries(
        Object.entries(monthlyCustomerSets).map(([month, set]) => [month, set.size])
    );

    const growth = {
        revenueGrowth: calculateSeriesGrowth(timeAnalytics.monthly, "revenue"),
        profitGrowth: calculateSeriesGrowth(timeAnalytics.monthly, "profit"),
        orderGrowth: calculateSeriesGrowth(timeAnalytics.monthly, "orders"),
        customerGrowth: calculateMapGrowth(monthlyCustomerCounts),
    };

    /* ----------------------------------------
       DERIVED: WEIGHTED BUSINESS HEALTH
    ---------------------------------------- */

    const businessHealthScore = calculateBusinessHealthWeighted({
        totalRevenue,
        grossProfitMargin,
        averageOrderValue,
        customerCount: totalCustomers,
        productCount: Object.keys(productMap).length,
    });

    /* ----------------------------------------
       DERIVED: EXECUTIVE SUMMARY
    ---------------------------------------- */

    const executiveSummary = {
        revenue: totalRevenue,
        profit: totalProfit,
        margin: grossProfitMargin,
        orders: totalOrders,
        customers: totalCustomers,
        topProduct,
        topCity,
        bestPayment,
        highestSale: highestSaleOrder?.amount || 0,
        lowestSale: lowestSaleOrder?.amount || 0,
    };

    /* ----------------------------------------
       DERIVED: AI INSIGHTS
    ---------------------------------------- */

    const insights = buildInsights({
        totalRevenue,
        financial,
        totalOrders,
        totalCustomers,
        topProduct,
        productRevenue: productMap[topProduct]?.revenue || 0,
        topCity,
        bestPayment,
        paymentMethods,
        highestSaleOrder,
        lowestSaleOrder,
        highestProfitOrder,
        lowestProfitOrder,
        businessHealthScore,
        availability,
        growth,
    });

    /* ----------------------------------------
       DERIVED: EXTRA DIMENSIONS
    ---------------------------------------- */

    const extraDimensions = buildExtraDimensions(extraDimMaps);

    /* ----------------------------------------
       FINAL RETURN
    ---------------------------------------- */

    return {
        // Legacy Fields (Exact structure and field names preserved)
        totalRevenue,
        totalOrders,
        totalCustomers,
        averageOrderValue,
        highestSale: highestSaleOrder ? highestSaleOrder.amount : 0,
        lowestSale: lowestSaleOrder ? lowestSaleOrder.amount : 0,
        topProduct,
        topProductCount,
        topCustomer,
        topCustomerSpend,
        topCity,
        bestPayment,
        monthlySales,
        revenueGrowth,
        ordersGrowth,
        paymentMethods,
        citySales,
        productSales,
        customerSpend,
        businessHealth,

        // New Analytical Expansions
        financial,
        highestSaleOrder,
        lowestSaleOrder,
        highestProfitOrder,
        lowestProfitOrder,
        productAnalytics,
        customerAnalytics,
        paymentAnalytics,
        cityAnalytics,
        categoryAnalytics,
        timeAnalytics,
        growth,
        businessHealthScore,
        executiveSummary,
        insights,
        extraDimensions,
    };
}

/* ==========================================
   EMPTY STATE FALLBACK
========================================== */

function getEmptyAnalytics() {
    return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        averageOrderValue: 0,
        highestSale: 0,
        lowestSale: 0,
        topProduct: "N/A",
        topProductCount: 0,
        topCustomer: "N/A",
        topCustomerSpend: 0,
        topCity: "N/A",
        bestPayment: "N/A",
        monthlySales: [],
        revenueGrowth: null,
        ordersGrowth: null,
        paymentMethods: {},
        citySales: [],
        productSales: [],
        customerSpend: {},
        businessHealth: 0,

        financial: {
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            grossProfitMargin: 0,
            averageProfitPerOrder: 0,
        },

        highestSaleOrder: null,
        lowestSaleOrder: null,
        highestProfitOrder: null,
        lowestProfitOrder: null,

        productAnalytics: { available: false },
        customerAnalytics: { available: false },
        paymentAnalytics: { available: false },
        cityAnalytics: { available: false },
        categoryAnalytics: { available: false },

        timeAnalytics: { daily: [], weekly: [], monthly: [], quarterly: [], yearly: [] },

        growth: {
            revenueGrowth: null,
            profitGrowth: null,
            orderGrowth: null,
            customerGrowth: null,
        },

        businessHealthScore: { score: 0, grade: "F", status: "No Data" },

        executiveSummary: {
            revenue: 0,
            profit: 0,
            margin: 0,
            orders: 0,
            customers: 0,
            topProduct: "N/A",
            topCity: "N/A",
            bestPayment: "N/A",
            highestSale: 0,
            lowestSale: 0,
        },

        insights: ["No data available yet. Upload a dataset to generate insights."],

        extraDimensions: {},
    };
}

/* ==========================================
   ROW-LEVEL EXTRACTORS
========================================== */

function extractAmount(row) {
    return Number(row.Amount ?? row.Sales ?? row.Total ?? row.Revenue ?? 0) || 0;
}

function extractCost(row) {
    if (row.Cost !== undefined && row.Cost !== null && row.Cost !== "") {
        return Number(row.Cost) || 0;
    }
    const quantity = Number(row.Quantity) || 0;
    const costPrice = Number(row.CostPrice) || 0;
    return quantity * costPrice;
}

function extractProfit(row, amount, cost) {
    if (row.Profit !== undefined && row.Profit !== null && row.Profit !== "") {
        return Number(row.Profit) || 0;
    }
    return amount - cost;
}

function buildOrderDetail(row, amount, profit) {
    return {
        customer: row.Customer ?? row.CustomerName ?? row.Name ?? "Unknown",
        product: row.Product ?? row.ProductName ?? row.Item ?? "Unknown",
        amount,
        profit,
        date: row.Date ?? row.OrderDate ?? "",
    };
}

/* ==========================================
   ACCUMULATOR HELPERS
========================================== */

function bump(map, key, { revenue = 0, profit = 0, quantity = 0 } = {}) {
    const k = key || "Unknown";
    if (!map[k]) {
        map[k] = { revenue: 0, profit: 0, quantity: 0, orders: 0 };
    }
    map[k].revenue += revenue;
    map[k].profit += profit;
    map[k].quantity += quantity;
    map[k].orders += 1;
}

function toPlainNumberMap(map, field) {
    return Object.fromEntries(
        Object.entries(map).map(([key, val]) => [key, val[field] || 0])
    );
}

function getTopEntryName(plainNumberMap) {
    let name = "N/A";
    let value = -Infinity;
    const entries = Object.entries(plainNumberMap);
    if (entries.length === 0) return "N/A";

    for (let i = 0; i < entries.length; i++) {
        const [key, count] = entries[i];
        if (count > value) {
            value = count;
            name = key;
        }
    }
    return value === -Infinity ? "N/A" : name;
}

function topKeyBy(map, field) {
    let name = "N/A";
    let value = -Infinity;
    const entries = Object.entries(map);

    for (let i = 0; i < entries.length; i++) {
        const [key, val] = entries[i];
        if (val[field] > value) {
            value = val[field];
            name = key;
        }
    }
    return name;
}

function bottomKeyBy(map, field) {
    let name = "N/A";
    let value = Infinity;
    const entries = Object.entries(map);

    for (let i = 0; i < entries.length; i++) {
        const [key, val] = entries[i];
        if (val[field] < value) {
            value = val[field];
            name = key;
        }
    }
    return name === Infinity ? "N/A" : name;
}

function topNEntries(plainNumberMap, n = 5) {
    return Object.entries(plainNumberMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([name, value]) => ({ name, value }));
}

function buildPercentageMap(plainCountMap, total) {
    if (!total) return {};
    return Object.fromEntries(
        Object.entries(plainCountMap).map(([key, count]) => [
            key,
            round2((count / total) * 100),
        ])
    );
}

function round2(value) {
    return Number((value || 0).toFixed(2));
}

/* ==========================================
   AVAILABILITY CHECKER
========================================== */

function getAvailability(data) {
    const sample = data[0] || {};
    const af = sample.AvailableFields || null;

    return {
        customer: af ? !!af.customer : !!(sample.Customer || sample.CustomerName || sample.Name),
        email: af ? !!af.email : !!sample.Email,
        category: af ? !!af.category : !!sample.Category,
        payment: af ? !!af.payment : !!(sample.Payment || sample.PaymentMethod),
        city: af ? !!af.city : !!(sample.City || sample.Location),
        state: af ? !!af.state : !!sample.State,
    };
}

/* ==========================================
   MONTH SERIES HELPERS
========================================== */

const MONTH_ORDER = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function trackMonth(row, amount, profit, revenueMap, ordersMap, profitMap) {
    const date = row.Date ?? row.OrderDate;
    if (!date) return;

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return;

    const month = parsed.toLocaleString("default", { month: "short" });
    revenueMap[month] = (revenueMap[month] || 0) + amount;
    ordersMap[month] = (ordersMap[month] || 0) + 1;
    profitMap[month] = (profitMap[month] || 0) + profit;
}

function buildMonthlySeries(revenueMap, ordersMap, profitMap) {
    return MONTH_ORDER
        .filter((month) => revenueMap[month] !== undefined)
        .map((month) => ({
            month,
            sales: revenueMap[month] || 0,
            orders: ordersMap[month] || 0,
            profit: profitMap[month] || 0,
        }));
}

function calculateGrowth(monthlySales, key) {
    if (!monthlySales || monthlySales.length < 2) return null;
    const previous = monthlySales[monthlySales.length - 2][key];
    const current = monthlySales[monthlySales.length - 1][key];
    if (!previous || previous === 0) return null;
    return round2(((current - previous) / previous) * 100);
}

/* ==========================================
   TIME PERIOD CALCULATIONS
========================================== */

function pad2(n) {
    return String(n).padStart(2, "0");
}

function extractYMD(value) {
    if (!value) return null;
    const str = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [y, m, d] = str.split("-").map(Number);
        return { y, m, d };
    }

    const parsed = new Date(str);
    if (isNaN(parsed.getTime())) return null;

    return {
        y: parsed.getFullYear(),
        m: parsed.getMonth() + 1,
        d: parsed.getDate(),
    };
}

function getISOWeekKey(y, m, d) {
    const date = new Date(Date.UTC(y, m - 1, d));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return `${date.getUTCFullYear()}-W${pad2(weekNo)}`;
}

function buildPeriodKeys({ y, m, d }) {
    return {
        day: `${y}-${pad2(m)}-${pad2(d)}`,
        week: getISOWeekKey(y, m, d),
        month: `${y}-${pad2(m)}`,
        quarter: `${y}-Q${Math.ceil(m / 3)}`,
        year: `${y}`,
    };
}

function seriesFromMap(map) {
    return Object.entries(map)
        .sort((a, b) => (a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0))
        .map(([period, val]) => ({
            period,
            revenue: val.revenue,
            profit: val.profit,
            orders: val.orders,
        }));
}

function calculateSeriesGrowth(series, key) {
    if (!series || series.length < 2) return null;
    const previous = series[series.length - 2][key];
    const current = series[series.length - 1][key];
    if (!previous) return null;
    return round2(((current - previous) / previous) * 100);
}

function calculateMapGrowth(plainNumberMap) {
    const keys = Object.keys(plainNumberMap).sort();
    if (keys.length < 2) return null;
    const previous = plainNumberMap[keys[keys.length - 2]];
    const current = plainNumberMap[keys[keys.length - 1]];
    if (!previous) return null;
    return round2(((current - previous) / previous) * 100);
}

/* ==========================================
   CITY & PRODUCT SERIES BUILDERS
========================================== */

function buildCitySeries(cityRevenuePlain) {
    return Object.entries(cityRevenuePlain)
        .sort((a, b) => b[1] - a[1])
        .map(([city, revenue]) => ({ city, revenue }));
}

function buildProductSeries(productMap) {
    return Object.entries(productMap)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .map(([product, val]) => ({
            name: product,
            value: val.revenue,
            product,
            count: val.orders,
        }));
}

/* ==========================================
   BUSINESS HEALTH EVALUATORS
========================================== */

function calculateBusinessHealthLegacy({ totalRevenue, customerCount, productCount }) {
    let score = 70;
    if (totalRevenue >= 50000) score += 10;
    if (customerCount >= 20) score += 10;
    if (productCount >= 5) score += 10;
    return Math.min(score, 100);
}

function calculateBusinessHealthWeighted({
    totalRevenue,
    grossProfitMargin,
    averageOrderValue,
    customerCount,
    productCount,
}) {
    let score = 0;

    score += Math.min(30, (totalRevenue / 100000) * 30);
    score += Math.min(25, (grossProfitMargin / 40) * 25);
    score += Math.min(15, (averageOrderValue / 5000) * 15);
    score += Math.min(15, (customerCount / 50) * 15);
    score += Math.min(15, (productCount / 20) * 15);

    score = Math.round(Math.min(100, Math.max(0, score)));

    let grade = "F";
    let status = "Critical";

    if (score >= 90) {
        grade = "A";
        status = "Excellent";
    } else if (score >= 75) {
        grade = "B";
        status = "Good";
    } else if (score >= 60) {
        grade = "C";
        status = "Fair";
    } else if (score >= 40) {
        grade = "D";
        status = "Needs Improvement";
    }

    return { score, grade, status };
}

/* ==========================================
   AI INSIGHTS GENERATOR (8-15 INSIGHTS)
========================================== */

function buildInsights({
    totalRevenue,
    financial,
    totalOrders,
    totalCustomers,
    topProduct,
    productRevenue,
    topCity,
    bestPayment,
    paymentMethods,
    highestSaleOrder,
    lowestSaleOrder,
    highestProfitOrder,
    lowestProfitOrder,
    businessHealthScore,
    availability,
    growth,
}) {
    const insights = [];

    // 1. Total Revenue and Order Insight
    insights.push(
        `Total revenue generated is ${formatCurrency(totalRevenue)} across ${formatNumber(totalOrders)} orders with an average order value of ${formatCurrency(totalOrders ? totalRevenue / totalOrders : 0)}.`
    );

    // 2. Financial Profitability Insight
    insights.push(
        `Gross profit stands at ${formatCurrency(financial.totalProfit)} with a margin of ${financial.grossProfitMargin}% and an average profit per order of ${formatCurrency(financial.averageProfitPerOrder)}.`
    );

    // 3. Customer Base Insight
    if (availability.customer && totalCustomers > 0) {
        insights.push(
            `The business served ${formatNumber(totalCustomers)} unique customers, generating an average customer spend of ${formatCurrency(totalRevenue / totalCustomers)}.`
        );
    }

    // 4. Top Performing Product Insight
    if (topProduct && topProduct !== "N/A" && totalRevenue > 0) {
        const share = round2((productRevenue / totalRevenue) * 100);
        insights.push(
            `Top performing product by revenue is "${topProduct}", contributing ${share}% (${formatCurrency(productRevenue)}) of total revenue.`
        );
    }

    // 5. Payment Preference Insight
    if (availability.payment && bestPayment && bestPayment !== "N/A" && totalOrders > 0) {
        const count = paymentMethods[bestPayment] || 0;
        const share = round2((count / totalOrders) * 100);
        insights.push(
            `Primary payment method chosen by customers is "${bestPayment}", representing ${share}% (${formatNumber(count)}) of total transactions.`
        );
    }

    // 6. Geographic Distribution Insight
    if (availability.city && topCity && topCity !== "N/A") {
        insights.push(
            `Top revenue-generating location is "${topCity}", outperforming all other recorded territories.`
        );
    }

    // 7. Highest Value Order Insight
    if (highestSaleOrder) {
        insights.push(
            `Highest single order amount recorded was ${formatCurrency(highestSaleOrder.amount)} for product "${highestSaleOrder.product}".`
        );
    }

    // 8. Lowest Value Order Insight
    if (lowestSaleOrder) {
        insights.push(
            `Lowest single order transaction was ${formatCurrency(lowestSaleOrder.amount)} for product "${lowestSaleOrder.product}".`
        );
    }

    // 9. Highest Profit Order Insight
    if (highestProfitOrder) {
        insights.push(
            `Most profitable individual transaction generated ${formatCurrency(highestProfitOrder.profit)} in net profit.`
        );
    }

    // 10. Lowest Profit Order Insight
    if (lowestProfitOrder) {
        insights.push(
            `Lowest profit recorded on a single transaction was ${formatCurrency(lowestProfitOrder.profit)}.`
        );
    }

    // 11. Revenue Growth Trend
    if (growth.revenueGrowth !== null) {
        const direction = growth.revenueGrowth >= 0 ? "increased" : "decreased";
        insights.push(
            `Month-over-month revenue has ${direction} by ${Math.abs(growth.revenueGrowth)}% compared to the prior period.`
        );
    }

    // 12. Business Health Grade
    insights.push(
        `Overall Business Health score is calculated at ${businessHealthScore.score}/100 (Grade ${businessHealthScore.grade} - ${businessHealthScore.status}).`
    );

    // 13. Strategic Recommendation 1
    if (financial.grossProfitMargin < 20) {
        insights.push(
            `Recommendation: Gross margin is low (${financial.grossProfitMargin}%). Review cost structure or price point strategy to increase margins.`
        );
    } else {
        insights.push(
            `Recommendation: Maintain healthy unit economics and scale investment in high-margin SKUs.`
        );
    }

    // 14. Strategic Recommendation 2
    if (businessHealthScore.score < 75) {
        insights.push(
            `Recommendation: Focus on customer retention strategies to boost repeat buyer volume and improve total customer lifetime value.`
        );
    } else {
        insights.push(
            `Recommendation: Expand marketing spend in top-performing regions like ${topCity !== "N/A" ? topCity : "key markets"} to accelerate customer acquisition.`
        );
    }

    return insights;
}

/* ==========================================
   DYNAMIC EXTRA DIMENSIONS PARSER
========================================== */

function buildExtraDimensions(extraDimMaps) {
    const result = {};

    Object.entries(extraDimMaps).forEach(([field, valueMap]) => {
        const breakdown = Object.entries(valueMap)
            .map(([value, val]) => ({
                value,
                revenue: val.revenue,
                profit: val.profit,
                quantity: val.quantity,
                orders: val.orders,
            }))
            .sort((a, b) => b.revenue - a.revenue);

        result[field] = {
            available: true,
            topValue: breakdown[0]?.value || "N/A",
            breakdown,
        };
    });

    return result;
}

/* ==========================================
   EXPORTED FORMATTERS
========================================== */

export function formatCurrency(value = 0) {
    return Number(value).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });
}

export function formatNumber(value = 0) {
    return Number(value).toLocaleString("en-IN");
}