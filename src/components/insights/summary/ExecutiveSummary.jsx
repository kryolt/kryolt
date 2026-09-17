import {
    Sparkles,
    FileText,
    ListChecks,
    Rocket,
    ClipboardList,
    LineChart,
    ShieldAlert,
    CheckCircle2,
    IndianRupee,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Users,
    Percent,
    Target,
    Clock,
    Gauge,
    Wallet,
    Receipt,
    Package,
} from "lucide-react";

import "./ExecutiveSummary.css";

/* ============================================================================
 * Data helpers
 * summary / analytics / recommendations / opportunities / forecast / risks
 * are AI-generated and may be partial or entirely absent. Every section and
 * every field below is only rendered when real data exists for it — nothing
 * is invented, no "N/A" / "No data" / "0" placeholders are ever shown.
 * ========================================================================== */

const isEmpty = (value) =>
    value === null || value === undefined || String(value).trim() === "";

const pick = (obj, keys) => {
    if (!obj || typeof obj !== "object") return null;
    for (const key of keys) {
        const value = obj[key];
        if (!isEmpty(value)) return value;
    }
    return null;
};

const pickArray = (obj, keys) => {
    if (!obj || typeof obj !== "object") return [];
    for (const key of keys) {
        const value = obj[key];
        if (Array.isArray(value) && value.length > 0) return value;
    }
    return [];
};

// Resolves an array from a top-level prop first, falling back to the
// equivalent field nested inside `summary`.
const resolveList = (directProp, summary, summaryKeys) => {
    if (Array.isArray(directProp) && directProp.length > 0) return directProp;
    return pickArray(summary, summaryKeys);
};

const resolveObject = (directProp, summary, summaryKeys) => {
    if (directProp && typeof directProp === "object" && Object.keys(directProp).length > 0) {
        return directProp;
    }
    const fromSummary = pick(summary, summaryKeys);
    return fromSummary && typeof fromSummary === "object" ? fromSummary : null;
};

const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

// Some AI fields (e.g. growth) may arrive as an object like
// { value, rate, trend } instead of a plain number — pull the numeric
// field out so we never render "[object Object]".
const extractNumeric = (value) => {
    if (value && typeof value === "object") {
        return toNumber(pick(value, ["value", "rate", "percent", "percentage", "growth", "amount"]));
    }
    return toNumber(value);
};

const formatCurrency = (value) => {
    const num = extractNumeric(value);
    if (num === null) return null;
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(num);
};

const formatNumber = (value) => {
    const num = extractNumeric(value);
    if (num === null) return null;
    return new Intl.NumberFormat("en-IN").format(num);
};

const formatPercent = (value, { signed = false } = {}) => {
    const num = extractNumeric(value);
    if (num === null) return null;
    const sign = signed && num > 0 ? "+" : "";
    return `${sign}${num}%`;
};

const toneFromLabel = (label) => {
    if (isEmpty(label)) return "neutral";
    const value = String(label).toLowerCase();
    if (["high", "critical", "urgent", "severe"].some((w) => value.includes(w))) return "danger";
    if (["medium", "moderate"].some((w) => value.includes(w))) return "warning";
    if (["low", "minor", "easy"].some((w) => value.includes(w))) return "success";
    return "neutral";
};

/* ============================================================================
 * Config
 * Each KPI can optionally set a fixed `tone` (success/warning/danger/neutral).
 * If omitted, tone falls back to sign-based logic (used by "growth").
 * ========================================================================== */

const KPI_CONFIG = [
    { id: "revenue", label: "Revenue", icon: IndianRupee, keys: ["revenue", "totalRevenue", "totalSales"], format: formatCurrency },
    { id: "profit", label: "Total Profit", icon: TrendingUp, keys: ["profit", "netProfit", "totalProfit"], format: formatCurrency, tone: "success" },
    { id: "totalCost", label: "Total Cost", icon: Wallet, keys: ["totalCost", "cost", "totalExpense", "totalExpenses", "expenses"], format: formatCurrency, tone: "danger" },
    { id: "orders", label: "Orders", icon: ShoppingCart, keys: ["orders", "totalOrders", "orderCount"], format: formatNumber },
    { id: "customers", label: "Customers", icon: Users, keys: ["customers", "totalCustomers", "customerCount"], format: formatNumber },
    { id: "avgOrderValue", label: "Avg Order Value", icon: Receipt, keys: ["avgOrderValue", "averageOrderValue", "aov", "averageOrderSize"], format: formatCurrency },
    { id: "highestSale", label: "Highest Sale", icon: TrendingUp, keys: ["highestSale", "maxSale", "topSale", "highestOrderValue", "maxOrderValue"], format: formatCurrency, tone: "success" },
    { id: "lowestSale", label: "Lowest Sale", icon: TrendingDown, keys: ["lowestSale", "minSale", "lowestOrderValue", "minOrderValue"], format: formatCurrency, tone: "warning" },
    { id: "margin", label: "Margin", icon: Percent, keys: ["margin", "profitMargin", "marginPercent"], format: (v) => formatPercent(v) },
];

/* ============================================================================
 * Small render helpers
 * ========================================================================== */

function SectionLabel({ icon: Icon, children }) {
    return (
        <div className="kr-section__label">
            <Icon size={15} strokeWidth={2.2} />
            <span>{children}</span>
        </div>
    );
}

function KpiCard({ icon: Icon, label, value, tone }) {
    return (
        <div className={`kr-card kr-kpi kr-kpi--${tone}`}>
            <div className="kr-kpi__icon">
                <Icon size={17} strokeWidth={2.2} />
            </div>
            <div className="kr-kpi__body">
                <span className="kr-kpi__label">{label}</span>
                <span className="kr-kpi__value">{value}</span>
            </div>
        </div>
    );
}

function FindingCard({ title, description }) {
    return (
        <div className="kr-card kr-finding">
            <div className="kr-finding__icon">
                <CheckCircle2 size={17} strokeWidth={2.2} />
            </div>
            <div className="kr-finding__body">
                {!isEmpty(title) && <span className="kr-finding__title">{title}</span>}
                {!isEmpty(description) && <p className="kr-finding__text">{description}</p>}
            </div>
        </div>
    );
}

function MetaRow({ items }) {
    const visible = items.filter((item) => !isEmpty(item.value));
    if (visible.length === 0) return null;
    return (
        <div className="kr-meta-row">
            {visible.map(({ key, icon: Icon, value, tone }) => (
                <span className={`kr-meta-pill${tone ? ` kr-meta-pill--${tone}` : ""}`} key={key}>
                    {Icon && <Icon size={12} strokeWidth={2.4} />}
                    {value}
                </span>
            ))}
        </div>
    );
}

function OpportunityCard({ title, description, priority, expectedImpact, difficulty, businessValue }) {
    return (
        <div className="kr-card kr-panel">
            <div className="kr-panel__header">
                {!isEmpty(title) && <span className="kr-panel__title">{title}</span>}
                {!isEmpty(priority) && (
                    <span className={`kr-badge kr-badge--${toneFromLabel(priority)}`}>{priority}</span>
                )}
            </div>
            {!isEmpty(description) && <p className="kr-panel__text">{description}</p>}
            <MetaRow
                items={[
                    { key: "impact", icon: Target, value: expectedImpact },
                    { key: "difficulty", icon: Gauge, value: difficulty },
                    { key: "value", icon: TrendingUp, value: businessValue },
                ]}
            />
        </div>
    );
}

function RecommendationCard({ title, reason, priority, expectedROI, eta }) {
    return (
        <div className="kr-card kr-panel">
            <div className="kr-panel__header">
                {!isEmpty(title) && <span className="kr-panel__title">{title}</span>}
                {!isEmpty(priority) && (
                    <span className={`kr-badge kr-badge--${toneFromLabel(priority)}`}>{priority}</span>
                )}
            </div>
            {!isEmpty(reason) && <p className="kr-panel__text">{reason}</p>}
            <MetaRow
                items={[
                    { key: "roi", icon: TrendingUp, value: expectedROI },
                    { key: "eta", icon: Clock, value: eta },
                ]}
            />
        </div>
    );
}

function RiskCard({ title, description, severity, impact, recommendation }) {
    const tone = toneFromLabel(severity);
    return (
        <div className={`kr-card kr-panel kr-panel--accent-${tone}`}>
            <div className="kr-panel__header">
                {!isEmpty(title) && <span className="kr-panel__title">{title}</span>}
                {!isEmpty(severity) && <span className={`kr-badge kr-badge--${tone}`}>{severity}</span>}
            </div>
            {!isEmpty(description) && <p className="kr-panel__text">{description}</p>}
            {!isEmpty(impact) && (
                <p className="kr-panel__meta-text">
                    <span className="kr-panel__meta-label">Impact:</span> {impact}
                </p>
            )}
            {!isEmpty(recommendation) && (
                <p className="kr-panel__meta-text">
                    <span className="kr-panel__meta-label">Recommendation:</span> {recommendation}
                </p>
            )}
        </div>
    );
}

/* ============================================================================
 * Component
 * ========================================================================== */

function ExecutiveSummary({ summary, analytics, recommendations, opportunities, forecast, risks }) {
    // ---- Executive snapshot KPIs ----
    const kpis = KPI_CONFIG.map((kpi) => {
        const raw = pick(analytics, kpi.keys) ?? pick(summary, kpi.keys);
        if (isEmpty(raw)) return null;
        const value = kpi.format(raw);
        if (isEmpty(value)) return null;
        const numeric = extractNumeric(raw);
        const tone = kpi.tone
            ? kpi.tone
            : kpi.signed && numeric !== null
                ? numeric >= 0
                    ? "success"
                    : "danger"
                : "neutral";
        return { ...kpi, value, tone };
    }).filter(Boolean);

    // ---- Top / bottom performing product (text, shown separately) ----
    const topProduct = pick(analytics, ["topProduct", "bestSellingProduct", "strongestProduct"]) ?? pick(summary, ["topProduct", "bestSellingProduct", "strongestProduct"]);
    const weakProduct = pick(analytics, ["weakestProduct", "lowestSellingProduct"]) ?? pick(summary, ["weakestProduct", "lowestSellingProduct"]);

    // ---- Narrative & conclusion ----
    const narrative = pick(summary, ["narrative", "businessPerformance", "overview", "description", "text"]);
    const conclusion = pick(summary, ["conclusion", "overallConclusion", "summaryConclusion"]);

    // ---- Key findings ----
    const findings = pickArray(summary, ["keyFindings", "findings", "insights"])
        .map((item) => {
            if (typeof item === "string") return { title: null, description: item };
            const title = pick(item, ["title", "label", "heading"]);
            const description = pick(item, ["description", "text", "detail"]);
            return isEmpty(title) && isEmpty(description) ? null : { title, description };
        })
        .filter(Boolean);

    // ---- Growth opportunities ----
    const opportunityList = resolveList(opportunities, summary, ["opportunities", "growthOpportunities"])
        .map((item) => {
            if (typeof item === "string") return { title: item, description: null, priority: null, expectedImpact: null, difficulty: null, businessValue: null };
            const title = pick(item, ["title", "name", "label"]);
            const description = pick(item, ["description", "text", "detail"]);
            const priority = pick(item, ["priority"]);
            const expectedImpact = pick(item, ["expectedImpact", "impact"]);
            const difficulty = pick(item, ["difficulty"]);
            const businessValue = pick(item, ["businessValue", "value"]);
            return isEmpty(title) && isEmpty(description) ? null : { title, description, priority, expectedImpact, difficulty, businessValue };
        })
        .filter(Boolean);

    // ---- AI recommendations ----
    const recommendationList = resolveList(recommendations, summary, ["recommendations", "aiRecommendations"])
        .map((item) => {
            if (typeof item === "string") return { title: item, reason: null, priority: null, expectedROI: null, eta: null };
            const title = pick(item, ["action", "title", "name"]);
            const reason = pick(item, ["reason", "description", "text"]);
            const priority = pick(item, ["priority"]);
            const expectedROI = pick(item, ["expectedROI", "roi"]);
            const eta = pick(item, ["eta", "timeline"]);
            return isEmpty(title) && isEmpty(reason) ? null : { title, reason, priority, expectedROI, eta };
        })
        .filter(Boolean);

    // ---- Revenue forecast ----
    const forecastData = resolveObject(forecast, summary, ["forecast", "revenueForecast"]);
    const forecastPrediction = pick(forecastData, ["prediction", "summary", "text"]);
    const forecastConfidence = pick(forecastData, ["confidence"]);
    const forecastGrowth = pick(forecastData, ["expectedGrowth", "growth"]);
    const forecastProjection = pick(forecastData, ["nextMonthProjection", "projection", "nextMonthRevenue"]);
    const hasForecast =
        !isEmpty(forecastPrediction) || !isEmpty(forecastConfidence) || !isEmpty(forecastGrowth) || !isEmpty(forecastProjection);

    // ---- Business risks ----
    const riskList = resolveList(risks, summary, ["risks", "riskFactors"])
        .map((item) => {
            if (typeof item === "string") return { title: item, description: null, severity: null, impact: null, recommendation: null };
            const title = pick(item, ["title", "name", "label"]);
            const description = pick(item, ["description", "text", "detail"]);
            const severity = pick(item, ["severity"]);
            const impact = pick(item, ["impact"]);
            const recommendation = pick(item, ["recommendation", "mitigation"]);
            return isEmpty(title) && isEmpty(description) ? null : { title, description, severity, impact, recommendation };
        })
        .filter(Boolean);

    const hasAnyContent =
        kpis.length > 0 ||
        !isEmpty(narrative) ||
        findings.length > 0 ||
        opportunityList.length > 0 ||
        recommendationList.length > 0 ||
        hasForecast ||
        riskList.length > 0 ||
        !isEmpty(conclusion);

    return (
        <section className="exec-summary">
            <div className="kr-report">
                <header className="kr-report__header">
                    <span className="kr-report__badge">
                        <Sparkles size={13} strokeWidth={2.4} />
                        AI Generated
                    </span>
                    <h2 className="kr-report__title">Executive Report</h2>
                    <p className="kr-report__subtitle">
                        A complete AI-generated overview of your business performance,
                        health, opportunities and strategic recommendations.
                    </p>
                </header>

                {!hasAnyContent && (
                    <div className="kr-empty">
                        <div className="kr-empty__icon">
                            <FileText size={20} strokeWidth={2} />
                        </div>
                        <span className="kr-empty__title">Report Not Ready Yet</span>
                        <p className="kr-empty__text">
                            Your AI executive report will appear here automatically once
                            enough business data has been analyzed.
                        </p>
                    </div>
                )}

                {hasAnyContent && (
                    <div className="kr-report__body">
                        {/* ---------------- Executive Snapshot ---------------- */}
                        {kpis.length > 0 && (
                            <div className="kr-section">
                                <SectionLabel icon={Gauge}>Executive Snapshot</SectionLabel>
                                <div className="kr-kpi-grid">
                                    {kpis.map((kpi) => (
                                        <KpiCard key={kpi.id} icon={kpi.icon} label={kpi.label} value={kpi.value} tone={kpi.tone} />
                                    ))}
                                </div>
                                {(!isEmpty(topProduct) || !isEmpty(weakProduct)) && (
                                    <div className="kr-product-row">
                                        {!isEmpty(topProduct) && (
                                            <span className="kr-meta-pill kr-meta-pill--success">
                                                <Package size={12} strokeWidth={2.4} />
                                                Top Product: {topProduct}
                                            </span>
                                        )}
                                        {!isEmpty(weakProduct) && (
                                            <span className="kr-meta-pill kr-meta-pill--warning">
                                                <Package size={12} strokeWidth={2.4} />
                                                Weakest Product: {weakProduct}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ---------------- Executive Narrative ---------------- */}
                        {!isEmpty(narrative) && (
                            <div className="kr-section">
                                <div className="kr-report__divider" />
                                <SectionLabel icon={FileText}>Executive Narrative</SectionLabel>
                                <p className="kr-narrative">{narrative}</p>
                            </div>
                        )}

                        {/* ---------------- Key Findings ---------------- */}
                        {findings.length > 0 && (
                            <div className="kr-section">
                                <div className="kr-report__divider" />
                                <SectionLabel icon={ListChecks}>Key Findings</SectionLabel>
                                <div className="kr-grid kr-grid--wide">
                                    {findings.map((finding, idx) => (
                                        <FindingCard key={idx} title={finding.title} description={finding.description} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ---------------- Growth Opportunities ---------------- */}
                        {opportunityList.length > 0 && (
                            <div className="kr-section">
                                <div className="kr-report__divider" />
                                <SectionLabel icon={Rocket}>Growth Opportunities</SectionLabel>
                                <div className="kr-grid kr-grid--wide">
                                    {opportunityList.map((item, idx) => (
                                        <OpportunityCard key={idx} {...item} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ---------------- AI Recommendations ---------------- */}
                        {recommendationList.length > 0 && (
                            <div className="kr-section">
                                <div className="kr-report__divider" />
                                <SectionLabel icon={ClipboardList}>AI Recommendations</SectionLabel>
                                <div className="kr-grid kr-grid--wide">
                                    {recommendationList.map((item, idx) => (
                                        <RecommendationCard key={idx} {...item} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ---------------- Revenue Forecast ---------------- */}
                        {hasForecast && (
                            <div className="kr-section">
                                <div className="kr-report__divider" />
                                <SectionLabel icon={LineChart}>Revenue Forecast</SectionLabel>
                                <div className="kr-forecast">
                                    {!isEmpty(forecastPrediction) && (
                                        <p className="kr-forecast__prediction">{forecastPrediction}</p>
                                    )}
                                    <MetaRow
                                        items={[
                                            { key: "confidence", icon: Gauge, value: !isEmpty(forecastConfidence) ? `Confidence: ${forecastConfidence}` : null },
                                            { key: "growth", icon: TrendingUp, value: !isEmpty(forecastGrowth) ? `Expected Growth: ${forecastGrowth}` : null },
                                            { key: "projection", icon: IndianRupee, value: !isEmpty(forecastProjection) ? `Next Month: ${forecastProjection}` : null },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ---------------- Business Risks ---------------- */}
                        {riskList.length > 0 && (
                            <div className="kr-section">
                                <div className="kr-report__divider" />
                                <SectionLabel icon={ShieldAlert}>Business Risks</SectionLabel>
                                <div className="kr-grid kr-grid--wide">
                                    {riskList.map((item, idx) => (
                                        <RiskCard key={idx} {...item} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ---------------- Final Conclusion ---------------- */}
                        {!isEmpty(conclusion) && (
                            <div className="kr-section">
                                <div className="kr-report__divider" />
                                <div className="kr-conclusion">
                                    <CheckCircle2 size={17} strokeWidth={2.2} className="kr-conclusion__icon" />
                                    <p className="kr-conclusion__text">{conclusion}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

export default ExecutiveSummary;