import { createElement } from 'react';
import {
    ShieldAlert,
    ShieldCheck,
    TrendingDown,
    PieChart,
    Activity,
    Users,
    Package,
    MapPin,
    Repeat,
    Boxes,
    CreditCard,
    Settings2,
    Sparkles,
    Gauge,
    ClipboardCheck,
} from 'lucide-react';
import './RiskAnalysis.css';

// ---------------------------------------------------------------------------
// Helpers — analytics may be partial, still loading, or absent entirely.
// Every function here degrades gracefully instead of throwing or
// rendering "NaN" / "undefined".
// ---------------------------------------------------------------------------

const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const lower = (str) => (typeof str === 'string' ? str.charAt(0).toLowerCase() + str.slice(1) : str);

const SEVERITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
const SEVERITY_WEIGHT = { critical: 0, high: 1, medium: 2, low: 3 };
const CATEGORY_LABEL = {
    financial: 'Financial',
    sales: 'Sales',
    operations: 'Operations',
    customers: 'Customers',
    inventory: 'Inventory',
    marketing: 'Marketing',
    payments: 'Payments',
};

const ICON_MAP = {
    ShieldAlert,
    TrendingDown,
    PieChart,
    Activity,
    Users,
    Package,
    MapPin,
    Repeat,
    Boxes,
    CreditCard,
    Settings2,
    Sparkles,
};

// Never trust an incoming `icon` value — it may be a real lucide component,
// a string name (from a backend/AI payload), or missing entirely. This
// always returns a renderable component, never a string or undefined.
function resolveIcon(icon) {
    if (typeof icon === 'string') {
        return ICON_MAP[icon] || ShieldAlert;
    }
    if (icon && (typeof icon === 'function' || typeof icon === 'object')) {
        return icon;
    }
    return ShieldAlert;
}

function resolveSeverity(value) {
    return SEVERITY_LABEL[value] ? value : 'medium';
}

function resolveCategory(value) {
    return CATEGORY_LABEL[value] ? value : 'operations';
}

// ---------------------------------------------------------------------------
// If a `risks` prop is supplied, trust it but normalize defensively —
// external/AI-generated payloads can be malformed.
// ---------------------------------------------------------------------------

function normalizeRisk(raw, index) {
    if (!raw || typeof raw !== 'object') return null;

    const title = raw.title || 'Business Risk';
    const id = raw.id || `${title}-${index}`;

    return {
        id,
        icon: raw.icon,
        title,
        description: raw.description || 'This risk was flagged from your business data.',
        severity: resolveSeverity(raw.severity),
        category: resolveCategory(raw.category),
        recommendedAction:
            raw.recommendedAction || raw.action || 'Review this area of your business more closely.',
    };
}

// ---------------------------------------------------------------------------
// Risk engine — every card is only produced when the underlying analytics
// field is actually present and crosses a reasonable risk threshold.
// Descriptions quote the real figures behind each risk.
// ---------------------------------------------------------------------------

function buildRisks(analytics) {
    const list = [];

    const financial = analytics?.financial ?? {};
    const product = analytics?.productAnalytics ?? {};
    const customer = analytics?.customerAnalytics ?? {};
    const payment = analytics?.paymentAnalytics ?? {};
    const city = analytics?.cityAnalytics ?? {};

    // Revenue Decline
    const revenueGrowth = toNumber(analytics?.revenueGrowth);
    if (revenueGrowth !== null && revenueGrowth < 0) {
        list.push({
            id: 'revenue-decline',
            icon: TrendingDown,
            title: 'Revenue Decline',
            description: `Revenue has declined ${Math.abs(revenueGrowth).toFixed(1)}% compared to the previous period.`,
            severity: revenueGrowth < -15 ? 'critical' : revenueGrowth < -5 ? 'high' : 'medium',
            category: 'sales',
            recommendedAction: 'Launch a targeted campaign or promotion to reverse the revenue trend and investigate the drop-off channel.',
        });
    }

    // Low Profit Margin
    const grossMargin = toNumber(financial?.grossProfitMargin);
    if (grossMargin !== null && grossMargin < 20) {
        list.push({
            id: 'low-profit-margin',
            icon: PieChart,
            title: 'Low Profit Margin',
            description: `Gross profit margin is ${grossMargin.toFixed(1)}%, below a healthy retail benchmark of 20%.`,
            severity: grossMargin < 10 ? 'critical' : 'high',
            category: 'financial',
            recommendedAction: 'Renegotiate supplier costs, review pricing strategy, or reduce excessive discounting.',
        });
    }

    // Low Business Health
    const healthScore = toNumber(
        analytics?.businessHealthScore?.score ?? analytics?.businessHealthScore
    );
    if (healthScore !== null && healthScore < 60) {
        list.push({
            id: 'low-business-health',
            icon: Activity,
            title: 'Low Business Health',
            description: `Overall business health score is ${healthScore.toFixed(0)}/100, indicating underlying performance issues.`,
            severity: healthScore < 35 ? 'critical' : healthScore < 50 ? 'high' : 'medium',
            category: 'operations',
            recommendedAction: 'Review revenue, margin, and customer metrics together to identify the weakest performing area.',
        });
    }

    // Customer Concentration (revenue too dependent on top customer)
    const topCustomerShare = toNumber(customer?.topCustomerRevenueShare ?? customer?.topCustomerShare);
    if (topCustomerShare !== null && topCustomerShare > 25) {
        list.push({
            id: 'customer-concentration',
            icon: Users,
            title: 'Customer Concentration',
            description: `Your top customer accounts for ${topCustomerShare.toFixed(1)}% of total revenue, creating dependency risk.`,
            severity: topCustomerShare > 50 ? 'critical' : topCustomerShare > 35 ? 'high' : 'medium',
            category: 'customers',
            recommendedAction: 'Diversify your customer base through broader outreach so no single customer drives disproportionate revenue.',
        });
    }

    // Product Dependency (revenue too dependent on top product)
    const topProductShare = toNumber(product?.topProductRevenueShare ?? product?.topProductShare);
    if (topProductShare !== null && topProductShare > 30) {
        list.push({
            id: 'product-dependency',
            icon: Package,
            title: 'Product Dependency',
            description: `${product?.topProduct ?? analytics?.topProduct ?? 'Your top product'} contributes ${topProductShare.toFixed(1)}% of total revenue.`,
            severity: topProductShare > 60 ? 'critical' : topProductShare > 45 ? 'high' : 'medium',
            category: 'inventory',
            recommendedAction: 'Expand your product catalog so revenue is not overly reliant on a single item.',
        });
    }

    // Single City Dependency
    const topCityShare = toNumber(city?.topCityRevenueShare ?? city?.topCityShare);
    if (topCityShare !== null && topCityShare > 40) {
        list.push({
            id: 'single-city-dependency',
            icon: MapPin,
            title: 'Single City Dependency',
            description: `${city?.topCity ?? analytics?.topCity ?? 'Your top city'} accounts for ${topCityShare.toFixed(1)}% of total revenue.`,
            severity: topCityShare > 70 ? 'critical' : topCityShare > 55 ? 'high' : 'medium',
            category: 'marketing',
            recommendedAction: 'Expand marketing efforts into new cities to reduce reliance on a single market.',
        });
    }

    // Low Repeat Customers
    const retentionRate = toNumber(customer?.retentionRate ?? customer?.repeatCustomerRate);
    if (retentionRate !== null && retentionRate < 30) {
        list.push({
            id: 'low-repeat-customers',
            icon: Repeat,
            title: 'Low Repeat Customers',
            description: `Only ${retentionRate.toFixed(1)}% of customers return for another order.`,
            severity: retentionRate < 15 ? 'high' : 'medium',
            category: 'customers',
            recommendedAction: 'Introduce loyalty offers or post-purchase follow-ups to encourage repeat business.',
        });
    }

    // Inventory Risk (underperforming products tying up stock)
    const lowProducts = product?.lowPerformingProducts ?? product?.underperformingProducts;
    if (Array.isArray(lowProducts) && lowProducts.length >= 3) {
        list.push({
            id: 'inventory-risk',
            icon: Boxes,
            title: 'Inventory Risk',
            description: `${lowProducts.length} products are underperforming, potentially tying up working capital in slow-moving stock.`,
            severity: lowProducts.length >= 8 ? 'high' : 'medium',
            category: 'inventory',
            recommendedAction: 'Re-price, bundle, or delist underperforming products to free up inventory spend.',
        });
    }

    // Payment Dependency
    const topPaymentShare = toNumber(payment?.topMethodShare ?? payment?.topPaymentShare);
    if (topPaymentShare !== null && topPaymentShare > 70) {
        list.push({
            id: 'payment-dependency',
            icon: CreditCard,
            title: 'Payment Dependency',
            description: `${payment?.topMethod ?? analytics?.bestPayment ?? 'A single payment method'} accounts for ${topPaymentShare.toFixed(1)}% of all transactions.`,
            severity: topPaymentShare > 90 ? 'high' : 'medium',
            category: 'operations',
            recommendedAction: 'Offer and promote alternative payment methods to reduce reliance on a single payment channel.',
        });
    }

    // Operational Risk (orders declining while revenue is flat/growing, or vice versa)
    const ordersGrowth = toNumber(analytics?.ordersGrowth);
    if (ordersGrowth !== null && ordersGrowth < -5) {
        list.push({
            id: 'operational-risk',
            icon: Settings2,
            title: 'Operational Risk',
            description: `Order volume has declined ${Math.abs(ordersGrowth).toFixed(1)}% compared to the previous period.`,
            severity: ordersGrowth < -20 ? 'high' : 'medium',
            category: 'operations',
            recommendedAction: 'Investigate order fulfillment, checkout friction, or demand-side factors behind the decline.',
        });
    }

    return list
        .sort((a, b) => SEVERITY_WEIGHT[a.severity] - SEVERITY_WEIGHT[b.severity])
        .slice(0, 8);
}

// ---------------------------------------------------------------------------
// Display-only derivations — computed purely from the already-normalized
// `cards` array. None of these influence buildRisks/normalizeRisk and none
// read raw analytics directly, so the score/matrix/plan can never drift
// from what's actually rendered as cards.
// ---------------------------------------------------------------------------

const PROBABILITY_BY_SEVERITY = { critical: 'high', high: 'high', medium: 'medium', low: 'low' };
const PROBABILITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' };
const URGENCY_BY_SEVERITY = { critical: 'immediate', high: 'this-week', medium: 'this-month', low: 'this-month' };
const URGENCY_LABEL = { immediate: 'Immediate', 'this-week': 'This Week', 'this-month': 'This Month' };

function deriveProbability(severity) {
    return PROBABILITY_BY_SEVERITY[severity] || 'medium';
}

function deriveUrgency(severity) {
    return URGENCY_BY_SEVERITY[severity] || 'this-month';
}

function deriveImpact(category) {
    const IMPACT_BY_CATEGORY = {
        financial: 'Profitability',
        sales: 'Revenue',
        operations: 'Operational Efficiency',
        customers: 'Customer Base',
        inventory: 'Capital Efficiency',
        marketing: 'Market Reach',
        payments: 'Checkout Reliability',
    };
    return IMPACT_BY_CATEGORY[category] || 'Business Performance';
}

function computeRiskScore(cards) {
    if (cards.length === 0) {
        return { score: 8, level: 'low', confidence: 60, status: 'Healthy' };
    }

    const WEIGHT = { critical: 25, high: 15, medium: 8, low: 3 };
    const raw = cards.reduce((sum, c) => sum + (WEIGHT[c.severity] || 8), 0);
    const score = Math.max(4, Math.min(96, raw));

    const criticalCount = cards.filter((c) => c.severity === 'critical').length;
    const highCount = cards.filter((c) => c.severity === 'high').length;

    let level = 'low';
    if (criticalCount > 0) level = 'critical';
    else if (highCount > 0) level = 'high';
    else if (cards.some((c) => c.severity === 'medium')) level = 'moderate';

    const STATUS_BY_LEVEL = {
        critical: 'Needs Immediate Attention',
        high: 'Elevated Risk',
        moderate: 'Monitor Closely',
        low: 'Stable',
    };

    const confidence = Math.min(95, 55 + cards.length * 5);

    return { score, level, confidence, status: STATUS_BY_LEVEL[level] };
}

const LEVEL_LABEL = { critical: 'Critical', high: 'High', moderate: 'Moderate', low: 'Low' };

// Short explanation shown inside the risk score ring card. Distinct from
// buildAiSummary below (which drives the separate "AI Risk Summary" card) —
// this one is purely a function of card count + severity level.
function buildScoreExplanation(cards, level) {
    const count = cards.length;

    if (count === 0) {
        return 'No significant risks detected. Business fundamentals look healthy based on available data.';
    }

    const EXPLANATION_BY_LEVEL = {
        critical: `${count} risk${count === 1 ? '' : 's'} detected, including at least one critical issue that needs immediate attention.`,
        high: `${count} risk${count === 1 ? '' : 's'} detected, including at least one high-severity issue affecting performance.`,
        moderate: `${count} risk${count === 1 ? '' : 's'} detected. Nothing urgent, but worth monitoring closely.`,
        low: `${count} minor risk${count === 1 ? '' : 's'} detected. Overall business fundamentals remain stable.`,
    };

    return EXPLANATION_BY_LEVEL[level] || EXPLANATION_BY_LEVEL.moderate;
}

function buildMatrix(cards) {
    const matrix = { critical: [], high: [], medium: [], low: [] };
    cards.forEach((c) => {
        matrix[c.severity]?.push(c);
    });
    return matrix;
}

function buildMitigationPlan(cards) {
    // One action per risk, deduplicated by text, capped for readability.
    const seen = new Set();
    const plan = [];
    cards.forEach((c) => {
        const key = c.recommendedAction.trim().toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        plan.push({ id: c.id, text: c.recommendedAction, severity: c.severity, title: c.title });
    });
    return plan.slice(0, 8);
}

function buildAiSummary(cards) {
    if (cards.length === 0) {
        return 'The business currently shows no significant risk signals based on available data. Continue monitoring as new data comes in.';
    }

    const byCategory = cards.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
    }, {});
    const leadingCategoryEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const leadingCategory = leadingCategoryEntry ? CATEGORY_LABEL[leadingCategoryEntry[0]] : null;

    const financialRisk = cards.some((c) => c.category === 'financial')
        ? 'measurable financial risk'
        : 'low financial risk';

    const top = cards[0];
    const secondaryClause = leadingCategory && leadingCategory !== 'Financial'
        ? ` with the most concentrated exposure in ${leadingCategory.toLowerCase()}`
        : '';

    return `The business currently shows ${financialRisk}${secondaryClause}. Addressing "${lower(top.title)}" first will have the largest effect on lowering overall risk.`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RiskScoreCard({ score, level, confidence, status, explanation }) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - score / 100);

    return (
        <div className={`risk-score risk-score--${level}`}>
            <div className="risk-score__ring">
                <svg className="risk-score__ring-svg" viewBox="0 0 120 120">
                    <circle className="risk-score__ring-track" cx="60" cy="60" r={radius} fill="none" strokeWidth="10" />
                    <circle
                        className="risk-score__ring-progress"
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className="risk-score__ring-center">
                    <strong>{score}</strong>
                    <span>RISK SCORE</span>
                </div>
            </div>

            <div className="risk-score__body">
                <div className="risk-score__label">
                    <Gauge size={15} />
                    <span>Overall Risk Score</span>
                </div>

                <div className="risk-score__stats">
                    <div className="risk-score__stat">
                        <span className="risk-score__stat-label">Risk Level</span>
                        <span className={`risk-score__stat-value risk-score__stat-value--${level}`}>
                            {LEVEL_LABEL[level]}
                        </span>
                    </div>
                    <div className="risk-score__stat">
                        <span className="risk-score__stat-label">Confidence</span>
                        <span className="risk-score__stat-value">{confidence}%</span>
                    </div>
                    <div className="risk-score__stat">
                        <span className="risk-score__stat-label">Business Status</span>
                        <span className="risk-score__stat-value">{status}</span>
                    </div>
                </div>

                <p className="risk-score__explanation">{explanation}</p>
            </div>
        </div>
    );
}

function RiskCard({ icon, title, description, severity, category, recommendedAction }) {
    const Icon = resolveIcon(icon);
    const probability = deriveProbability(severity);
    const urgency = deriveUrgency(severity);
    const impact = deriveImpact(category);

    return (
        <div className="risk-card">
            <div className="risk-card__header">
                <div className="risk-card__icon-wrap">
                    {createElement(Icon, { size: 18, strokeWidth: 2.2, className: "risk-card__icon" })}
                </div>
                <div className="risk-card__header-tags">
                    <span className="risk-card__tag">{CATEGORY_LABEL[category] || 'Operations'}</span>
                    <span className={`risk-card__badge risk-card__badge--${severity}`}>
                        {SEVERITY_LABEL[severity] || 'Medium'}
                    </span>
                </div>
            </div>

            <div className="risk-card__body">
                <span className="risk-card__title">{title}</span>
                <p className="risk-card__description">{description}</p>
            </div>

            <div className="risk-card__meta">
                <div className="risk-card__meta-item">
                    <span className="risk-card__meta-label">Probability</span>
                    <span className={`risk-card__meta-value risk-card__meta-value--prob-${probability}`}>
                        {PROBABILITY_LABEL[probability]}
                    </span>
                </div>
                <div className="risk-card__meta-item">
                    <span className="risk-card__meta-label">Business Impact</span>
                    <span className="risk-card__meta-value">{impact}</span>
                </div>
                <div className="risk-card__meta-item">
                    <span className="risk-card__meta-label">Urgency</span>
                    <span className={`risk-card__meta-value risk-card__meta-value--urgency-${urgency}`}>
                        {URGENCY_LABEL[urgency]}
                    </span>
                </div>
            </div>

            <div className="risk-card__action">
                <span className="risk-card__action-label">Recommended Action</span>
                <p className="risk-card__action-text">{recommendedAction}</p>
            </div>
        </div>
    );
}

function RiskMatrix({ matrix }) {
    const columns = [
        { key: 'critical', label: 'Critical' },
        { key: 'high', label: 'High' },
        { key: 'medium', label: 'Medium' },
        { key: 'low', label: 'Low' },
    ];

    return (
        <div className="risk-block">
            <span className="risk-block__title">Risk Matrix</span>
            <div className="risk-matrix">
                {columns.map((col) => (
                    <div className={`risk-matrix__col risk-matrix__col--${col.key}`} key={col.key}>
                        <div className="risk-matrix__col-header">
                            <span>{col.label}</span>
                            <span className="risk-matrix__count">{matrix[col.key].length}</span>
                        </div>
                        <div className="risk-matrix__items">
                            {matrix[col.key].length > 0 ? (
                                matrix[col.key].map((item) => (
                                    <div className="risk-matrix__item" key={item.id}>
                                        {item.title}
                                    </div>
                                ))
                            ) : (
                                <div className="risk-matrix__item risk-matrix__item--empty">None detected</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MitigationPlan({ plan }) {
    if (!plan || plan.length === 0) return null;

    return (
        <div className="risk-mitigation">
            <div className="risk-mitigation__header">
                <ClipboardCheck size={15} />
                <span>Risk Mitigation Plan</span>
            </div>
            <ul className="risk-mitigation__list">
                {plan.map((item) => (
                    <li className="risk-mitigation__item" key={item.id}>
                        <span className={`risk-mitigation__dot risk-mitigation__dot--${item.severity}`} />
                        <span className="risk-mitigation__text">{item.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function AiSummaryCard({ text }) {
    if (!text) return null;
    return (
        <div className="risk-summary">
            <div className="risk-summary__icon">
                <Sparkles size={18} />
            </div>
            <div className="risk-summary__body">
                <span className="risk-summary__label">AI Risk Summary</span>
                <p className="risk-summary__text">{text}</p>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="risk-empty">
            <div className="risk-empty__icon-wrap">
                <ShieldCheck size={22} />
            </div>
            <span className="risk-empty__title">No Significant Risks Detected</span>
            <p className="risk-empty__description">
                Your business currently shows healthy performance based on available data.
            </p>
        </div>
    );
}

function RiskAnalysis({ risks, analytics }) {
    // Prefer real, backend-generated risks if supplied, but always run them
    // through normalization — external/AI payloads are untrusted and may
    // carry stringified icons, missing ids, or unknown severity/category.
    const rawList =
        Array.isArray(risks) && risks.length > 0 ? risks : buildRisks(analytics);

    const cards = rawList
        .map((item, index) => normalizeRisk(item, index))
        .filter(Boolean);

    const hasCards = cards.length > 0;
    const scoreData = computeRiskScore(cards);
    const explanation = buildScoreExplanation(cards, scoreData.level);
    const matrix = hasCards ? buildMatrix(cards) : null;
    const mitigationPlan = hasCards ? buildMitigationPlan(cards) : [];
    const aiSummary = buildAiSummary(cards);

    return (
        <section className="risk-analysis">
            <header className="risk-analysis__header">
                <span className="risk-analysis__eyebrow">
                    <ShieldAlert size={12} />
                    AI Risk Intelligence
                </span>
                <h2 className="risk-analysis__title">Business Risk Analysis</h2>
                <p className="risk-analysis__subtitle">
                    AI continuously analyzes your uploaded business data to identify potential business risks before they become serious problems.
                </p>
            </header>

            <RiskScoreCard {...scoreData} explanation={explanation} />

            {hasCards ? (
                <>
                    <div className="risk-analysis__grid">
                        {cards.map((card) => (
                            <RiskCard key={card.id} {...card} />
                        ))}
                    </div>

                    <RiskMatrix matrix={matrix} />

                    <MitigationPlan plan={mitigationPlan} />

                    <AiSummaryCard text={aiSummary} />
                </>
            ) : (
                <EmptyState />
            )}
        </section>
    );
}

export default RiskAnalysis;