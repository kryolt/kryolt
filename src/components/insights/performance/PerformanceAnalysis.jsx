import {
    Gauge,
    Sparkles,
    Activity,
    Users,
    ShoppingBag,
    PieChart,
    Target,
    Package,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    ShieldCheck,
} from 'lucide-react';
import './PerformanceAnalysis.css';

// ---------------------------------------------------------------------------
// Formatting helpers & Business Logic (Unchanged)
// ---------------------------------------------------------------------------

const isEmpty = (value) =>
    value === null || value === undefined || value === '' || Number.isNaN(value);

const formatCurrency = (value) => {
    if (isEmpty(value)) return '—';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

const formatNumber = (value) => {
    if (isEmpty(value)) return '—';
    return new Intl.NumberFormat('en-IN').format(value);
};

const formatGrowth = (value) => {
    if (isEmpty(value)) return null;
    const num = Number(value);
    return {
        display: `${num > 0 ? '+' : ''}${num.toFixed(1)}%`,
        direction: num > 2 ? 'up' : num < -2 ? 'down' : 'flat',
        raw: num,
    };
};

const GRADE_TONE = {
    A: 'excellent',
    B: 'good',
    C: 'average',
    D: 'poor',
    E: 'poor',
    F: 'poor',
};

const scoreTone = (score) => {
    if (isEmpty(score)) return 'pending';
    const n = Number(score);
    if (n >= 80) return 'excellent';
    if (n >= 60) return 'good';
    if (n >= 40) return 'average';
    return 'poor';
};

const POSITIVE_WORDS = ['healthy', 'strong', 'good', 'excellent', 'stable', 'optimal', 'balanced'];
const NEGATIVE_WORDS = ['low', 'critical', 'overstock', 'understock', 'shortage', 'weak', 'poor', 'risk'];

const resolveWordTone = (text) => {
    if (isEmpty(text)) return 'neutral';
    const value = String(text).toLowerCase();
    if (NEGATIVE_WORDS.some((word) => value.includes(word))) return 'danger';
    if (POSITIVE_WORDS.some((word) => value.includes(word))) return 'success';
    return 'neutral';
};

function classifyGrowth(growth) {
    if (!growth) return null;
    const magnitude = Math.abs(growth.raw);
    if (growth.direction === 'up') {
        return magnitude >= 10 ? { label: 'Strong Growth', tone: 'success' } : { label: 'Improving', tone: 'success' };
    }
    if (growth.direction === 'down') {
        return magnitude >= 10 ? { label: 'Declining', tone: 'danger' } : { label: 'Softening', tone: 'warning' };
    }
    return { label: 'Stable', tone: 'neutral' };
}

function impactLevel(growth) {
    if (!growth) return null;
    const magnitude = Math.abs(growth.raw);
    if (magnitude >= 15) return 'High';
    if (magnitude >= 5) return 'Medium';
    return 'Low';
}

function buildSignals(analytics) {
    const financial = analytics?.financial ?? {};
    const signals = [];

    const revenueGrowth = formatGrowth(analytics?.revenueGrowth);
    if (revenueGrowth) {
        const status = classifyGrowth(revenueGrowth);
        signals.push({
            key: 'revenueMomentum',
            icon: Activity,
            title: 'Revenue Momentum',
            status: status.label,
            tone: status.tone,
            detail: `Revenue is ${status.label.toLowerCase()}, moving ${revenueGrowth.display} versus the previous period.`,
        });
    }

    const customerGrowth = formatGrowth(
        analytics?.customerGrowth ?? analytics?.customerAnalytics?.growth ?? analytics?.customerAnalytics?.customerGrowth
    );
    if (customerGrowth) {
        const status = classifyGrowth(customerGrowth);
        signals.push({
            key: 'customerGrowth',
            icon: Users,
            title: 'Customer Growth',
            status: status.label,
            tone: status.tone,
            detail: `The customer base is ${status.label.toLowerCase()}, changing ${customerGrowth.display} over the period.`,
        });
    } else if (!isEmpty(analytics?.totalCustomers)) {
        const customers = Number(analytics.totalCustomers);
        const status = customers >= 50
            ? { label: 'Healthy Base', tone: 'success' }
            : { label: 'Early Stage', tone: 'warning' };
        signals.push({
            key: 'customerGrowth',
            icon: Users,
            title: 'Customer Growth',
            status: status.label,
            tone: status.tone,
            detail: customers >= 50
                ? `A broad customer base of ${formatNumber(customers)} supports steady demand.`
                : `The customer base of ${formatNumber(customers)} is still building — expanding reach could accelerate growth.`,
        });
    }

    const ordersGrowth = formatGrowth(analytics?.ordersGrowth);
    if (ordersGrowth) {
        const stabilityLabel = ordersGrowth.direction === 'up'
            ? (Math.abs(ordersGrowth.raw) >= 10 ? 'Expanding' : 'Growing')
            : ordersGrowth.direction === 'down'
                ? (Math.abs(ordersGrowth.raw) >= 10 ? 'Contracting' : 'Softening')
                : 'Stable';
        const tone = ordersGrowth.direction === 'up' ? 'success' : ordersGrowth.direction === 'down' ? 'danger' : 'neutral';
        signals.push({
            key: 'orderStability',
            icon: ShoppingBag,
            title: 'Order Stability',
            status: stabilityLabel,
            tone,
            detail: `Order volume is ${stabilityLabel.toLowerCase()}, changing ${ordersGrowth.display} versus the previous period.`,
        });
    }

    const margin = Number(financial?.grossProfitMargin);
    if (!isEmpty(financial?.grossProfitMargin)) {
        let status;
        if (margin >= 25) status = { label: 'Excellent', tone: 'success' };
        else if (margin >= 15) status = { label: 'Healthy', tone: 'success' };
        else if (margin >= 8) status = { label: 'Tight', tone: 'warning' };
        else status = { label: 'Weak', tone: 'danger' };

        signals.push({
            key: 'profitQuality',
            icon: PieChart,
            title: 'Profit Quality',
            status: status.label,
            tone: status.tone,
            detail: `Gross margin sits at ${margin.toFixed(1)}%, reflecting ${status.label.toLowerCase()} profit quality.`,
        });
    }

    const aov = Number(analytics?.averageOrderValue);
    if (!isEmpty(financial?.grossProfitMargin)) {
        let status;
        if (margin >= 20 && !isEmpty(analytics?.averageOrderValue) && aov >= 1000) {
            status = { label: 'High Efficiency', tone: 'success' };
        } else if (margin >= 10) {
            status = { label: 'Moderate Efficiency', tone: 'warning' };
        } else {
            status = { label: 'Needs Improvement', tone: 'danger' };
        }
        signals.push({
            key: 'businessEfficiency',
            icon: Target,
            title: 'Business Efficiency',
            status: status.label,
            tone: status.tone,
            detail: !isEmpty(analytics?.averageOrderValue)
                ? `Combining a ${margin.toFixed(1)}% margin with an average order value of ${formatCurrency(aov)} suggests ${status.label.toLowerCase()}.`
                : `A ${margin.toFixed(1)}% gross margin suggests ${status.label.toLowerCase()} across operations.`,
        });
    }

    const inventoryStatus = analytics?.inventoryAnalytics?.status ?? analytics?.inventoryHealth ?? analytics?.stockHealth;
    if (!isEmpty(inventoryStatus)) {
        signals.push({
            key: 'inventoryHealth',
            icon: Package,
            title: 'Inventory Health',
            status: inventoryStatus,
            tone: resolveWordTone(inventoryStatus),
            detail: analytics?.inventoryAnalytics?.note ?? `Current inventory position is rated ${String(inventoryStatus).toLowerCase()}.`,
        });
    }

    if (!isEmpty(analytics?.bestPayment)) {
        signals.push({
            key: 'paymentHealth',
            icon: CreditCard,
            title: 'Payment Health',
            status: 'Concentrated',
            tone: 'warning',
            detail: `${analytics.bestPayment} accounts for the majority of transactions — diversifying payment options could reduce dependency risk.`,
        });
    }

    return signals;
}

function buildTrends(analytics) {
    const trends = [];

    const revenueGrowth = formatGrowth(analytics?.revenueGrowth);
    if (revenueGrowth) {
        trends.push({
            key: 'revenueTrend',
            direction: revenueGrowth.direction,
            title: revenueGrowth.direction === 'up' ? 'Revenue is Improving' : revenueGrowth.direction === 'down' ? 'Revenue is Declining' : 'Revenue is Stable',
            description: revenueGrowth.direction === 'up'
                ? `Revenue grew ${revenueGrowth.display} versus the previous period, reflecting positive momentum.`
                : revenueGrowth.direction === 'down'
                    ? `Revenue fell ${revenueGrowth.display} versus the previous period and warrants attention.`
                    : `Revenue moved ${revenueGrowth.display}, remaining broadly steady versus the previous period.`,
            impact: impactLevel(revenueGrowth),
        });
    }

    const ordersGrowth = formatGrowth(analytics?.ordersGrowth);
    if (ordersGrowth) {
        trends.push({
            key: 'ordersTrend',
            direction: ordersGrowth.direction,
            title: ordersGrowth.direction === 'up' ? 'Order Volume is Growing' : ordersGrowth.direction === 'down' ? 'Order Volume is Declining' : 'Order Volume is Stable',
            description: ordersGrowth.direction === 'up'
                ? `Orders increased ${ordersGrowth.display} versus the previous period.`
                : ordersGrowth.direction === 'down'
                    ? `Orders dropped ${ordersGrowth.display} versus the previous period.`
                    : `Order volume changed ${ordersGrowth.display}, holding largely steady.`,
            impact: impactLevel(ordersGrowth),
        });
    }

    const retentionGrowth = formatGrowth(
        analytics?.customerAnalytics?.retentionGrowth ?? analytics?.retentionGrowth
    );
    if (retentionGrowth) {
        trends.push({
            key: 'retentionTrend',
            direction: retentionGrowth.direction,
            title: retentionGrowth.direction === 'up' ? 'Customer Retention is Improving' : retentionGrowth.direction === 'down' ? 'Customer Retention is Declining' : 'Customer Retention is Stable',
            description: retentionGrowth.direction === 'up'
                ? `Repeat purchase behavior improved ${retentionGrowth.display} versus the previous period.`
                : retentionGrowth.direction === 'down'
                    ? `Repeat purchase behavior weakened ${retentionGrowth.display} versus the previous period.`
                    : `Repeat purchase behavior held steady, moving ${retentionGrowth.display}.`,
            impact: impactLevel(retentionGrowth),
        });
    }

    const aovGrowth = formatGrowth(analytics?.aovGrowth ?? analytics?.averageOrderValueGrowth);
    if (aovGrowth) {
        trends.push({
            key: 'aovTrend',
            direction: aovGrowth.direction,
            title: aovGrowth.direction === 'up' ? 'Average Order Value is Improving' : aovGrowth.direction === 'down' ? 'Average Order Value is Declining' : 'Average Order Value is Stable',
            description: aovGrowth.direction === 'up'
                ? `Customers are spending more per order, up ${aovGrowth.display} versus the previous period.`
                : aovGrowth.direction === 'down'
                    ? `Average order value fell ${aovGrowth.display} versus the previous period.`
                    : `Average order value moved ${aovGrowth.display}, remaining broadly consistent.`,
            impact: impactLevel(aovGrowth),
        });
    }

    return trends;
}

function TrendIcon({ direction }) {
    if (direction === 'up') return <ArrowUpRight size={16} strokeWidth={2.5} />;
    if (direction === 'down') return <ArrowDownRight size={16} strokeWidth={2.5} />;
    return <Minus size={16} strokeWidth={2.5} />;
}

function PerformanceAnalysis({ analysis, analytics }) {
    const health = analytics?.businessHealthScore ?? {};
    const tone = GRADE_TONE[health?.grade] || scoreTone(health?.score);

    // Score ring calculations
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const clampedScore = Math.max(0, Math.min(100, Number(health?.score) || 0));
    const dashOffset = circumference - (clampedScore / 100) * circumference;

    const confidence = analytics?.businessHealthScore?.confidence ?? analytics?.confidence ?? analytics?.revenueForecast?.confidence;

    const explanation = !isEmpty(health?.status)
        ? `Overall business performance is currently rated ${String(health.status).toLowerCase()}${!isEmpty(health?.grade) ? ` with a ${health.grade} grade` : ''} based on the data analyzed so far.`
        : null;

    const signals = buildSignals(analytics);
    const trends = buildTrends(analytics);

    const observations = (
        Array.isArray(analytics?.insights) ? analytics.insights
            : Array.isArray(analytics?.aiObservations) ? analytics.aiObservations
                : Array.isArray(analytics?.observations) ? analytics.observations
                    : []
    ).filter((note) => !isEmpty(note));

    return (
        <section className="performance-analysis">
            {/* Header */}
            <header className="pa-header">
                <div className="pa-header__text">
                    <span className="pa-eyebrow">
                        <Sparkles size={12} strokeWidth={2.5} />
                        Business Performance
                    </span>
                    <h2 className="pa-title">Performance Analysis</h2>
                    <p className="pa-subtitle">
                        {analysis?.description ?? 'AI analysis of overall business performance using uploaded data.'}
                    </p>
                </div>
            </header>

            {/* 1 — Performance Score Card */}
            <div className={`pa-verdict pa-verdict--${tone}`}>
                <div className="pa-verdict__ring">
                    <svg viewBox="0 0 160 160" className="pa-ring-svg">
                        <defs>
                            <linearGradient id="paBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0647ED" />
                                <stop offset="100%" stopColor="#2563EB" />
                            </linearGradient>
                            <filter id="paGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0647ED" floodOpacity="0.25" />
                            </filter>
                        </defs>

                        {/* Outer decorative dotted circle */}
                        <circle className="pa-ring-outer-decor" cx="80" cy="80" r="76" fill="none" strokeWidth="1.5" strokeDasharray="3 5" />

                        {/* Background track */}
                        <circle className="pa-ring-track" cx="80" cy="80" r={radius} fill="none" strokeWidth="11" />

                        {/* Animated progress ring */}
                        <circle
                            className="pa-ring-progress"
                            cx="80"
                            cy="80"
                            r={radius}
                            fill="none"
                            strokeWidth="11"
                            stroke="url(#paBlueGradient)"
                            filter="url(#paGlow)"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="pa-ring-center">
                        <span className="pa-ring-label">SCORE</span>
                        <strong>{health?.score ?? '—'}</strong>
                        <span className="pa-ring-max">/ 100</span>
                    </div>
                </div>

                <div className="pa-verdict__body">
                    <div className="pa-verdict__label">
                        <Gauge size={15} strokeWidth={2.4} />
                        <span>Business Performance Score</span>
                    </div>

                    <div className="pa-verdict__meta">
                        <span className="pa-grade">{health?.grade ?? '—'}</span>
                        <span className="pa-status">{health?.status ?? 'Awaiting data'}</span>
                        {!isEmpty(confidence) && (
                            <span className="pa-confidence">
                                <ShieldCheck size={12} strokeWidth={2.4} />
                                {Number(confidence).toFixed(0)}% confidence
                            </span>
                        )}
                    </div>

                    {explanation && <p className="pa-verdict__explanation">{explanation}</p>}
                </div>
            </div>

            {/* 2 — Business Signals */}
            {signals.length > 0 && (
                <div className="pa-block">
                    <h3 className="pa-block__title">Business Signals</h3>
                    <div className="pa-grid">
                        {signals.map(({ key, icon: Icon, title, status, detail }) => (
                            <div className="pa-card pa-signal" key={key}>
                                <div className="pa-signal__icon">
                                    <Icon size={16} strokeWidth={2.2} />
                                </div>
                                <div className="pa-signal__body">
                                    <div className="pa-signal__row">
                                        <span className="pa-signal__title">{title}</span>
                                        <span className="pa-chip">{status}</span>
                                    </div>
                                    <p className="pa-signal__detail">{detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3 — Trend Analysis */}
            {trends.length > 0 && (
                <div className="pa-block">
                    <h3 className="pa-block__title">Trend Analysis</h3>
                    <div className="pa-grid">
                        {trends.map(({ key, direction, title, description, impact }) => (
                            <div className="pa-card pa-trend" key={key}>
                                <div className="pa-trend__icon">
                                    <TrendIcon direction={direction} />
                                </div>
                                <div className="pa-trend__body">
                                    <div className="pa-trend__row">
                                        <span className="pa-trend__title">{title}</span>
                                        {impact && (
                                            <span className="pa-impact">
                                                {impact} impact
                                            </span>
                                        )}
                                    </div>
                                    <p className="pa-trend__description">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4 — AI Observations */}
            {observations.length > 0 && (
                <div className="pa-block">
                    <h3 className="pa-block__title">AI Observations</h3>
                    <div className="pa-notes">
                        <div className="pa-notes__badge">
                            <Sparkles size={12} strokeWidth={2.5} />
                            <span>AI Generated</span>
                        </div>
                        <ul className="pa-notes__list">
                            {observations.map((note, index) => (
                                <li key={index} className="pa-notes__item">
                                    <span className="pa-notes__marker" aria-hidden="true" />
                                    <span>{note}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    );
}

export default PerformanceAnalysis;