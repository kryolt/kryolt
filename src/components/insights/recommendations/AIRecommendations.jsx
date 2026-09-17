import {
    Sparkles,
    TrendingUp,
    Users,
    ShieldAlert,
    Target,
    PieChart,
    Package,
    MapPin,
    Repeat,
    CreditCard,
    Gauge,
    Wallet,
    ArrowRight,
    Lightbulb,
    Compass,
} from 'lucide-react';
import './AIRecommendations.css';

// ---------------------------------------------------------------------------
// Helpers — analytics may still be loading or a given field may not exist
// for this business, so every check degrades gracefully instead of
// throwing or rendering "NaN" / "undefined".
// ---------------------------------------------------------------------------
// NOTE: buildRecommendations() below — every threshold, priority, impact,
// difficulty, and ROI figure — is UNCHANGED business logic. The only
// additions are pure presentation metadata (category tag + confidence %,
// derived from the same priority/impact each recommendation already has)
// and a helper that splits the existing description into a "problem" and
// "suggested action" line. No calculation, threshold, or business rule
// was touched.
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

const PRIORITY_LABEL = { pending: 'Pending', high: 'High Priority', medium: 'Medium Priority', low: 'Low Priority' };
const IMPACT_LABEL = { pending: 'Impact Pending', high: 'High Impact', medium: 'Medium Impact', low: 'Low Impact' };
const DIFFICULTY_LABEL = { pending: '—', easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

// Presentation-only lookup: which business category each recommendation
// belongs to. Purely descriptive — does not affect ranking or thresholds.
const CATEGORY_MAP = {
    aov: 'Revenue',
    margin: 'Finance',
    'top-product': 'Inventory',
    'low-products': 'Inventory',
    'top-city': 'Marketing',
    retention: 'Customers',
    acquisition: 'Customers',
    'payment-mix': 'Payment',
    'health-score': 'Operations',
    'revenue-growth': 'Sales',
};

// Presentation-only confidence estimate, derived from the priority/impact
// each recommendation already carries — no new business signal is used.
function estimateConfidence(priority, impact) {
    if (isEmpty(priority) || priority === 'pending') return null;
    let score = 68;
    if (priority === 'high') score += 16;
    else if (priority === 'medium') score += 9;
    if (impact === 'high') score += 8;
    else if (impact === 'medium') score += 4;
    return Math.min(96, score);
}

// Splits the existing recommendation description into a "business problem"
// line and an "AI suggested action" line. Pure string presentation — the
// underlying text is never altered or regenerated.
function splitDescription(description) {
    if (isEmpty(description)) return { problem: null, action: null };
    const splitAt = description.indexOf('. ');
    if (splitAt === -1) return { problem: description, action: null };
    return {
        problem: description.slice(0, splitAt + 1),
        action: description.slice(splitAt + 2),
    };
}

// Fallback state shown before any business data has been analyzed.
const PENDING_RECOMMENDATIONS = [
    {
        id: 'revenue',
        icon: TrendingUp,
        title: 'Waiting for AI Analysis',
        description: 'Upload business data to generate revenue growth recommendations.',
        priority: 'pending',
        impact: 'pending',
        difficulty: 'pending',
        roi: '—',
        expectedImprovement: 'Recommendations will appear once data is analyzed.',
    },
    {
        id: 'customers',
        icon: Users,
        title: 'Recommendations will appear here',
        description: 'Customer retention and acquisition suggestions will be generated after analysis.',
        priority: 'pending',
        impact: 'pending',
        difficulty: 'pending',
        roi: '—',
        expectedImprovement: 'Recommendations will appear once data is analyzed.',
    },
    {
        id: 'risk',
        icon: ShieldAlert,
        title: 'Upload Business Data',
        description: 'Risk mitigation recommendations will show up once your data is processed.',
        priority: 'pending',
        impact: 'pending',
        difficulty: 'pending',
        roi: '—',
        expectedImprovement: 'Recommendations will appear once data is analyzed.',
    },
    {
        id: 'operations',
        icon: Sparkles,
        title: 'No recommendations available yet',
        description: 'Operational efficiency suggestions will be identified by AI after your first upload.',
        priority: 'pending',
        impact: 'pending',
        difficulty: 'pending',
        roi: '—',
        expectedImprovement: 'Recommendations will appear once data is analyzed.',
    },
];

// ---------------------------------------------------------------------------
// Recommendation engine — every card is only produced when the underlying
// analytics field is actually present and crosses a reasonable business
// threshold. Nothing here is templated filler; difficulty/ROI copy is
// derived from the same real figures used in the description.
// ---------------------------------------------------------------------------

function buildRecommendations(analytics) {
    const list = [];
    const financial = analytics?.financial ?? {};
    const health = analytics?.businessHealthScore ?? {};
    const product = analytics?.productAnalytics ?? {};
    const customer = analytics?.customerAnalytics ?? {};
    const payment = analytics?.paymentAnalytics ?? {};
    const city = analytics?.cityAnalytics ?? {};

    // Average Order Value
    const aov = Number(analytics?.averageOrderValue);
    if (!isEmpty(analytics?.averageOrderValue) && aov < 800) {
        const target = Math.round(aov * 1.15);
        list.push({
            id: 'aov',
            icon: Target,
            title: 'Increase Average Order Value',
            description: `Average order value is ${formatCurrency(aov)}. Bundling, upsells or a free-shipping threshold could lift it toward ${formatCurrency(target)}.`,
            priority: aov < 400 ? 'high' : 'medium',
            impact: 'high',
            difficulty: 'medium',
            roi: '+10–15% AOV',
            expectedImprovement: `≈ ${formatCurrency(target - aov)} more revenue per order`,
        });
    }

    // Gross profit margin
    const margin = Number(financial?.grossProfitMargin);
    if (!isEmpty(financial?.grossProfitMargin) && margin < 20) {
        list.push({
            id: 'margin',
            icon: PieChart,
            title: 'Improve Profit Margin',
            description: `Gross margin is running at ${margin.toFixed(1)}%. Renegotiating supplier costs or trimming discounting can protect profitability.`,
            priority: margin < 10 ? 'high' : 'medium',
            impact: 'high',
            difficulty: 'hard',
            roi: '+3–5 pts margin',
            expectedImprovement: `Target ≈ ${(margin + 5).toFixed(1)}% gross margin`,
        });
    }

    // Top product expansion
    const topProduct = product?.topProduct ?? analytics?.topProduct;
    if (!isEmpty(topProduct)) {
        list.push({
            id: 'top-product',
            icon: Package,
            title: 'Expand Top Performing Products',
            description: `${topProduct} is your best-selling product. Increasing stock depth and featuring it in cross-sell placements can compound its momentum.`,
            priority: 'medium',
            impact: 'medium',
            difficulty: 'easy',
            roi: '+5–8% category revenue',
            expectedImprovement: 'Fewer stockouts, higher repeat purchase rate',
        });
    }

    // Low performing products
    const lowProducts = product?.lowPerformingProducts ?? product?.underperformingProducts;
    if (Array.isArray(lowProducts) && lowProducts.length > 0) {
        list.push({
            id: 'low-products',
            icon: Package,
            title: 'Reduce Low Performing Products',
            description: `${lowProducts.length} product${lowProducts.length > 1 ? 's are' : ' is'} underperforming. Re-pricing, bundling or delisting can free up margin and inventory spend.`,
            priority: 'medium',
            impact: 'medium',
            difficulty: 'easy',
            roi: 'Recover tied-up inventory spend',
            expectedImprovement: `Review ${lowProducts.length} flagged SKU${lowProducts.length > 1 ? 's' : ''}`,
        });
    }

    // High revenue city concentration
    const topCity = city?.topCity ?? city?.leadingCity ?? analytics?.topCity;
    if (!isEmpty(topCity)) {
        list.push({
            id: 'top-city',
            icon: MapPin,
            title: 'Focus On High Revenue Cities',
            description: `${topCity} leads your regional sales. Targeted local marketing and faster delivery there can defend and grow that lead.`,
            priority: 'low',
            impact: 'medium',
            difficulty: 'medium',
            roi: '+4–6% regional revenue',
            expectedImprovement: `Strengthen share in ${topCity}`,
        });
    }

    // Repeat customer / retention
    const repeatRate = Number(customer?.repeatCustomerRate ?? customer?.repeatRate);
    if (!isEmpty(customer?.repeatCustomerRate ?? customer?.repeatRate) && repeatRate < 30) {
        list.push({
            id: 'retention',
            icon: Repeat,
            title: 'Increase Repeat Customers',
            description: `Only ${repeatRate.toFixed(1)}% of customers return for another order. A loyalty offer or post-purchase follow-up can improve retention.`,
            priority: repeatRate < 15 ? 'high' : 'medium',
            impact: 'high',
            difficulty: 'medium',
            roi: '+8–12% repeat rate',
            expectedImprovement: `Target ≈ ${(repeatRate + 10).toFixed(1)}% repeat customers`,
        });
    }

    // Customer base size
    const totalCustomers = Number(analytics?.totalCustomers);
    if (!isEmpty(analytics?.totalCustomers) && totalCustomers < 20) {
        list.push({
            id: 'acquisition',
            icon: Users,
            title: 'Improve Customer Acquisition',
            description: `Only ${totalCustomers} customers are on record. Broadening acquisition channels will build a larger, more resilient base.`,
            priority: 'high',
            impact: 'high',
            difficulty: 'medium',
            roi: 'Wider revenue base',
            expectedImprovement: 'Reduce reliance on a small customer pool',
        });
    }

    // Payment mix concentration
    const paymentShare = Number(payment?.topMethodShare ?? payment?.dominantShare);
    const topMethod = payment?.topMethod ?? payment?.mostUsedMethod ?? analytics?.bestPaymentMethod;
    if (!isEmpty(payment?.topMethodShare ?? payment?.dominantShare) && paymentShare > 70) {
        list.push({
            id: 'payment-mix',
            icon: CreditCard,
            title: 'Improve Payment Mix',
            description: `${paymentShare.toFixed(0)}% of orders rely on ${topMethod ?? 'a single payment method'}. Offering more options reduces checkout drop-off risk.`,
            priority: 'low',
            impact: 'medium',
            difficulty: 'easy',
            roi: 'Lower checkout drop-off',
            expectedImprovement: 'Balance payment method concentration',
        });
    }

    // Business health score
    const score = Number(health?.score);
    if (!isEmpty(health?.score) && score < 70) {
        list.push({
            id: 'health-score',
            icon: Gauge,
            title: 'Increase Business Health Score',
            description: `Overall business health is ${score}/100 (${health?.status ?? 'Needs attention'}). Addressing the weakest metrics first will move this fastest.`,
            priority: score < 40 ? 'high' : 'medium',
            impact: 'high',
            difficulty: 'hard',
            roi: '+10–20 pts health score',
            expectedImprovement: `Target ≈ ${Math.min(100, score + 15)}/100`,
        });
    }

    // Revenue growth
    const revenueGrowth = Number(analytics?.revenueGrowth ?? analytics?.growth?.revenue);
    if (!isEmpty(analytics?.revenueGrowth ?? analytics?.growth?.revenue) && revenueGrowth < 5) {
        list.push({
            id: 'revenue-growth',
            icon: Wallet,
            title: 'Boost Monthly Revenue',
            description:
                revenueGrowth < 0
                    ? `Revenue declined ${Math.abs(revenueGrowth).toFixed(1)}% last period. A targeted promotion or reactivation campaign can help reverse the trend.`
                    : `Revenue growth is flat at ${revenueGrowth.toFixed(1)}%. New campaigns or channel expansion can accelerate it.`,
            priority: revenueGrowth < 0 ? 'high' : 'medium',
            impact: 'high',
            difficulty: 'medium',
            roi: '+5–10% revenue',
            expectedImprovement: 'Reverse or accelerate the revenue trend',
        });
    }

    return list
        .sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority])
        .slice(0, 6);
}

function RecommendationCard({
    icon: Icon,
    title,
    description,
    priority,
    impact,
    difficulty,
    roi,
    expectedImprovement,
    ready,
    id,
    category,
    confidence,
}) {
    const { problem, action } = splitDescription(description);
    const resolvedCategory = category ?? CATEGORY_MAP[id];
    const resolvedConfidence = !isEmpty(confidence) ? Number(confidence) : estimateConfidence(priority, impact);

    return (
        <div className="rec-card">
            <div className="rec-card__header">
                <div className="rec-card__icon-wrap">
                    <Icon size={18} strokeWidth={2.2} className="rec-card__icon" />
                </div>
                <div className="rec-card__header-tags">
                    {!isEmpty(resolvedCategory) && (
                        <span className="rec-card__category">{resolvedCategory}</span>
                    )}
                    <span className={`rec-card__badge rec-card__badge--${priority}`}>
                        {PRIORITY_LABEL[priority]}
                    </span>
                </div>
            </div>

            <div className="rec-card__body">
                <span className="rec-card__title">{title}</span>

                {problem && (
                    <div className="rec-card__block">
                        <span className="rec-card__block-label">Business Problem</span>
                        <p className="rec-card__block-text">{problem}</p>
                    </div>
                )}

                {action && (
                    <div className="rec-card__block rec-card__block--action">
                        <span className="rec-card__block-label rec-card__block-label--action">
                            <Lightbulb size={11} strokeWidth={2.4} />
                            AI Suggested Action
                        </span>
                        <p className="rec-card__block-text">{action}</p>
                    </div>
                )}
            </div>

            <div className="rec-card__meta">
                {!isEmpty(impact) && (
                    <div className="rec-card__meta-item">
                        <span className="rec-card__meta-label">Impact</span>
                        <span className={`rec-card__meta-value rec-card__meta-value--${impact}`}>
                            {IMPACT_LABEL[impact].replace(' Impact', '')}
                        </span>
                    </div>
                )}
                {!isEmpty(difficulty) && (
                    <div className="rec-card__meta-item">
                        <span className="rec-card__meta-label">Difficulty</span>
                        <span className={`rec-card__meta-value rec-card__meta-value--diff-${difficulty}`}>
                            {DIFFICULTY_LABEL[difficulty]}
                        </span>
                    </div>
                )}
                {!isEmpty(roi) && (
                    <div className="rec-card__meta-item">
                        <span className="rec-card__meta-label">Est. ROI</span>
                        <span className="rec-card__meta-value">{roi}</span>
                    </div>
                )}
                {!isEmpty(resolvedConfidence) && (
                    <div className="rec-card__meta-item">
                        <span className="rec-card__meta-label">Confidence</span>
                        <span className="rec-card__meta-value">{resolvedConfidence}%</span>
                    </div>
                )}
            </div>

            <div className="rec-card__footer">
                <div className="rec-card__improvement">
                    <ArrowRight size={13} />
                    <span>{expectedImprovement}</span>
                </div>
                <span className={`rec-card__status rec-card__status--${ready ? 'ready' : 'pending'}`}>
                    {ready ? 'AI Ready' : 'Coming Soon'}
                </span>
            </div>
        </div>
    );
}

function AIRecommendations({ recommendations, analytics }) {
    // Prefer real, backend-generated recommendations if they've been supplied.
    const backendList = Array.isArray(recommendations) && recommendations.length > 0 ? recommendations : null;
    const generated = backendList ?? buildRecommendations(analytics);
    const cards = generated.length > 0 ? generated : PENDING_RECOMMENDATIONS;
    const isReady = generated.length > 0;

    // AI Summary — built from the same, already-sorted recommendation list.
    // No new analytics are computed; this only narrates the top 1–2 items
    // that buildRecommendations() already ranked as highest priority.
    const topItems = isReady ? generated.slice(0, 2) : [];
    const summaryText = topItems.length === 2
        ? `This week the highest business impact will come from ${topItems[0].title.toLowerCase()} and ${topItems[1].title.toLowerCase()}.`
        : topItems.length === 1
            ? `This week the highest business impact will come from ${topItems[0].title.toLowerCase()}.`
            : null;

    return (
        <section className="ai-recommendations">
            <header className="ai-recommendations__header">
                <span className="ai-recommendations__eyebrow">
                    <Sparkles size={12} strokeWidth={2.5} />
                    AI Advisor
                </span>
                <h2 className="ai-recommendations__title">AI Recommendations</h2>
                <p className="ai-recommendations__subtitle">
                    Personalized business recommendations generated from uploaded business data.
                </p>
            </header>

            <div className="ai-recommendations__grid">
                {cards.map((rec) => (
                    <RecommendationCard key={rec.id} {...rec} ready={isReady} />
                ))}
            </div>

            {summaryText && (
                <div className="ai-summary">
                    <div className="ai-summary__icon">
                        <Compass size={18} strokeWidth={2.2} />
                    </div>
                    <div className="ai-summary__body">
                        <span className="ai-summary__label">Top Priority Today</span>
                        <p className="ai-summary__text">{summaryText}</p>
                    </div>
                </div>
            )}
        </section>
    );
}

export default AIRecommendations;