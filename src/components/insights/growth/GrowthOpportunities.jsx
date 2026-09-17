import { createElement } from 'react';

import {
    TrendingUp,
    Users,
    Package,
    MapPin,
    Repeat,
    PieChart,
    CreditCard,
    Boxes,
    Target,
    Sparkles,
    Compass,
    Gauge,
    Zap,
    Clock,
    Rocket,
    Lightbulb,
    ArrowUpRight,
} from 'lucide-react';
import './GrowthOpportunities.css';

// ---------------------------------------------------------------------------
// Helpers — analytics may still be loading or a given field may not exist
// for this business, so every check degrades gracefully instead of
// throwing or rendering "NaN" / "undefined".
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

const lower = (str) => (typeof str === 'string' ? str.charAt(0).toLowerCase() + str.slice(1) : str);

const IMPACT_LABEL = { high: 'High Impact', medium: 'Medium Impact', low: 'Low Impact' };
const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };
const VALID_TIME_ESTIMATES = ['Quick Win', '1 Month', '3 Months', '6 Months'];

// Map of every icon name that could plausibly arrive as a string (e.g. from
// a backend/AI-generated opportunity payload) to the actual component.
const ICON_MAP = {
    TrendingUp,
    Users,
    Package,
    MapPin,
    Repeat,
    PieChart,
    CreditCard,
    Boxes,
    Target,
    Sparkles,
    Compass,
    Gauge,
    Zap,
    Clock,
    Rocket,
    Lightbulb,
    ArrowUpRight,
};

// Never trust the incoming `icon` value. It may be:
//  - a real lucide component (correct)
//  - a string like "TrendingUp" (from JSON/backend data)
//  - undefined/null/anything else
// This always returns a renderable component, never a string or undefined.
function resolveIcon(icon) {
    if (typeof icon === 'string') {
        return ICON_MAP[icon] || Sparkles;
    }
    if (icon) {
        return icon;
    }
    return Sparkles;
}

// Sensible fallback time-to-impact when a raw/backend opportunity doesn't
// specify one — inferred from difficulty so it never renders empty.
function deriveTimeEstimate(difficulty) {
    if (difficulty === 'easy') return 'Quick Win';
    if (difficulty === 'hard') return '3 Months';
    return '1 Month';
}

// ---------------------------------------------------------------------------
// Normalization — guarantees every card object has the exact shape the UI
// needs, regardless of whether it came from the backend or was generated
// locally from analytics. Never throws, never produces undefined icon/id.
// ---------------------------------------------------------------------------

function normalizeOpportunity(raw, index) {
    if (!raw || typeof raw !== 'object') return null;

    const title = raw.title || 'Growth Opportunity';
    const id = raw.id || `${title}-${index}`;
    const difficulty = DIFFICULTY_LABEL[raw.difficulty] ? raw.difficulty : 'medium';
    const timeEstimate = VALID_TIME_ESTIMATES.includes(raw.timeEstimate)
        ? raw.timeEstimate
        : deriveTimeEstimate(difficulty);

    return {
        id,
        icon: resolveIcon(raw.icon),
        title,
        businessReason: raw.businessReason || raw.description || 'No details available for this opportunity yet.',
        aiAction: raw.aiAction || raw.suggestedAction || 'Review this opportunity with your team to plan next steps.',
        priority: IMPACT_LABEL[raw.priority] ? raw.priority : 'medium',
        difficulty,
        timeEstimate,
        roi: raw.roi || raw.estimatedRoi || raw.estimatedROI || 'Business Growth',
        impact: raw.impact || raw.expectedImpact || 'Business Growth',
        category: raw.category || 'General',
    };
}

// ---------------------------------------------------------------------------
// Opportunity engine — every card is only produced when the underlying
// analytics field is actually present and crosses a reasonable business
// threshold. Descriptions quote the real figures behind each opportunity.
// ---------------------------------------------------------------------------

function buildOpportunities(analytics) {
    const list = [];
    const financial = analytics?.financial ?? {};
    const product = analytics?.productAnalytics ?? {};
    const customer = analytics?.customerAnalytics ?? {};
    const payment = analytics?.paymentAnalytics ?? {};
    const city = analytics?.cityAnalytics ?? {};

    // Increase Average Order Value
    const aov = Number(analytics?.averageOrderValue);
    if (!isEmpty(analytics?.averageOrderValue) && aov < 1000) {
        const target = Math.round(aov * 1.15);
        list.push({
            id: 'increase-aov',
            icon: Target,
            title: 'Increase Average Order Value',
            businessReason: `Average order value is ${formatCurrency(aov)}. Bundles, minimum-order discounts or premium variants could lift it toward ${formatCurrency(target)}.`,
            aiAction: 'Launch a product bundle and set a minimum-order threshold that unlocks free shipping.',
            priority: aov < 500 ? 'high' : 'medium',
            difficulty: 'medium',
            timeEstimate: '1 Month',
            roi: `+${formatCurrency(target - aov)} per order`,
            impact: 'Revenue Growth',
            category: 'Sales',
        });
    }

    // Expand Top Product
    const topProduct = product?.topProduct ?? analytics?.topProduct;
    if (!isEmpty(topProduct)) {
        list.push({
            id: 'expand-top-product',
            icon: Package,
            title: 'Expand Top Product',
            businessReason: `${topProduct} is your best-selling product. Deeper stock, bundling and featured placement can compound its momentum.`,
            aiAction: `Feature ${topProduct} on your homepage and increase its stock buffer by 20%.`,
            priority: 'medium',
            difficulty: 'easy',
            timeEstimate: 'Quick Win',
            roi: '+8-12% product revenue',
            impact: 'Revenue Growth',
            category: 'Product',
        });
    }

    // Expand Top City
    const topCity = city?.topCity ?? city?.leadingCity ?? analytics?.topCity;
    if (!isEmpty(topCity)) {
        list.push({
            id: 'expand-top-city',
            icon: MapPin,
            title: 'Expand Top City',
            businessReason: `${topCity} is your strongest market. Localized campaigns and faster delivery there can defend and grow that lead.`,
            aiAction: `Run a localized ad push in ${topCity} and tighten delivery SLAs for that region.`,
            priority: 'medium',
            difficulty: 'medium',
            timeEstimate: '3 Months',
            roi: '+10% regional revenue',
            impact: 'Revenue Growth',
            category: 'Marketing',
        });
    }

    // Customer Retention
    const retentionRate = Number(customer?.retentionRate ?? customer?.repeatCustomerRate);
    if (!isEmpty(customer?.retentionRate ?? customer?.repeatCustomerRate) && retentionRate < 50) {
        list.push({
            id: 'customer-retention',
            icon: Repeat,
            title: 'Customer Retention',
            businessReason: `Only ${retentionRate.toFixed(1)}% of customers return for another order. A loyalty offer or post-purchase follow-up can improve this.`,
            aiAction: 'Launch a loyalty program and automate a post-purchase follow-up email sequence.',
            priority: retentionRate < 25 ? 'high' : 'medium',
            difficulty: 'medium',
            timeEstimate: '1 Month',
            roi: '+15-20% repeat orders',
            impact: 'Customer Growth',
            category: 'Customers',
        });
    }

    // Cross Selling
    const topCategory = analytics?.categoryAnalytics?.topCategory;
    if (!isEmpty(topCategory)) {
        list.push({
            id: 'cross-selling',
            icon: PieChart,
            title: 'Cross Selling',
            businessReason: `${topCategory} is your strongest category. Recommending related products at checkout can lift basket size.`,
            aiAction: `Add "frequently bought together" recommendations for ${topCategory} at checkout.`,
            priority: 'low',
            difficulty: 'easy',
            timeEstimate: 'Quick Win',
            roi: '+5-8% basket size',
            impact: 'Revenue Growth',
            category: 'Product',
        });
    }

    // Improve Profit Margin
    const margin = Number(financial?.grossProfitMargin);
    if (!isEmpty(financial?.grossProfitMargin) && margin < 20) {
        list.push({
            id: 'improve-profit-margin',
            icon: PieChart,
            title: 'Improve Profit Margin',
            businessReason: `Gross margin is ${margin.toFixed(1)}%. Renegotiating supplier costs or reducing discounting can protect profitability.`,
            aiAction: 'Renegotiate your top 3 supplier contracts and audit current discount policies.',
            priority: margin < 10 ? 'high' : 'medium',
            difficulty: 'hard',
            timeEstimate: '6 Months',
            roi: '+3-5pp gross margin',
            impact: 'Profit Improvement',
            category: 'Finance',
        });
    }

    // Increase Revenue
    const revenueGrowth = Number(analytics?.revenueGrowth);
    if (!isEmpty(analytics?.revenueGrowth) && revenueGrowth < 5) {
        list.push({
            id: 'increase-revenue',
            icon: TrendingUp,
            title: 'Increase Revenue',
            businessReason:
                revenueGrowth < 0
                    ? `Revenue declined ${Math.abs(revenueGrowth).toFixed(1)}% last period. A targeted campaign can help reverse the trend.`
                    : `Revenue growth is flat at ${revenueGrowth.toFixed(1)}%. New campaigns or channel expansion can accelerate it.`,
            aiAction: 'Launch a multi-channel campaign targeting lapsed and low-frequency customers.',
            priority: revenueGrowth < 0 ? 'high' : 'medium',
            difficulty: 'medium',
            timeEstimate: '3 Months',
            roi: revenueGrowth < 0 ? 'Recover lost revenue' : '+5-10% revenue',
            impact: 'Revenue Growth',
            category: 'Sales',
        });
    }

    // Promote Best Payment Method
    const bestPayment = payment?.topMethod ?? payment?.mostUsedMethod ?? analytics?.bestPayment;
    if (!isEmpty(bestPayment)) {
        list.push({
            id: 'promote-best-payment',
            icon: CreditCard,
            title: 'Promote Best Payment Method',
            businessReason: `${bestPayment} is your customers' preferred payment method. Highlighting it at checkout can reduce drop-off.`,
            aiAction: `Set ${bestPayment} as the default option at checkout to reduce friction.`,
            priority: 'low',
            difficulty: 'easy',
            timeEstimate: 'Quick Win',
            roi: 'Lower checkout drop-off',
            impact: 'Operational Efficiency',
            category: 'Payments',
        });
    }

    // Inventory Optimization
    const lowProducts = product?.lowPerformingProducts ?? product?.underperformingProducts;
    if (Array.isArray(lowProducts) && lowProducts.length > 0) {
        list.push({
            id: 'inventory-optimization',
            icon: Boxes,
            title: 'Inventory Optimization',
            businessReason: `${lowProducts.length} product${lowProducts.length > 1 ? 's are' : ' is'} underperforming. Re-pricing, bundling or delisting can free up tied-up inventory spend.`,
            aiAction: 'Bundle or discount underperforming SKUs to clear tied-up inventory.',
            priority: 'medium',
            difficulty: 'easy',
            timeEstimate: '1 Month',
            roi: 'Free up working capital',
            impact: 'Inventory Optimization',
            category: 'Operations',
        });
    }

    // Upselling Opportunity
    const topCustomer = customer?.topCustomer ?? analytics?.topCustomer;
    if (!isEmpty(topCustomer)) {
        list.push({
            id: 'upselling-opportunity',
            icon: Sparkles,
            title: 'Upselling Opportunity',
            businessReason: `${topCustomer} is your highest-value customer. Personalized offers to similar customers can lift order value across the base.`,
            aiAction: 'Create a VIP tier with early access and personalized offers for high-value customers.',
            priority: 'low',
            difficulty: 'medium',
            timeEstimate: '3 Months',
            roi: '+10% high-value segment revenue',
            impact: 'Revenue Growth',
            category: 'Customers',
        });
    }

    return list
        .sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority])
        .slice(0, 8);
}

// ---------------------------------------------------------------------------
// Derived insights — score, timeline and summary are all computed purely
// from the normalized card list, never from separate raw analytics reads,
// so they always stay in sync with what's actually rendered.
// ---------------------------------------------------------------------------

function computeScore(cards) {
    const total = cards.length;
    const highCount = cards.filter((c) => c.priority === 'high').length;
    const quickWinCount = cards.filter((c) => c.timeEstimate === 'Quick Win').length;

    const score = Math.max(35, Math.min(95, 60 + quickWinCount * 8 - highCount * 6 + Math.min(total, 4)));
    const growthPotential = highCount >= 3 ? 'High' : highCount >= 1 ? 'Medium' : 'Steady';
    const confidence = Math.min(96, 45 + total * 6);

    const impactCounts = cards.reduce((acc, c) => {
        acc[c.impact] = (acc[c.impact] || 0) + 1;
        return acc;
    }, {});
    const leadingImpact = Object.entries(impactCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Business Growth';

    const top = cards[0];
    const explanation = top
        ? `Focus on "${top.title}" first — it carries ${IMPACT_LABEL[top.priority].toLowerCase()} and is rated ${DIFFICULTY_LABEL[top.difficulty].toLowerCase()} to execute.`
        : 'Upload more business data to sharpen this recommendation.';

    return { score, growthPotential, confidence, leadingImpact, explanation, total };
}

function buildTimeline(cards) {
    const lanes = {
        quick: { label: 'Quick Wins', icon: Zap, items: [] },
        medium: { label: 'Medium Term', icon: Clock, items: [] },
        long: { label: 'Long Term', icon: Rocket, items: [] },
    };

    cards.forEach((c) => {
        if (c.timeEstimate === 'Quick Win') lanes.quick.items.push(c);
        else if (c.timeEstimate === '6 Months') lanes.long.items.push(c);
        else lanes.medium.items.push(c);
    });

    return lanes;
}

function buildSummaryText(cards) {
    if (cards.length === 0) return '';
    const [first, second] = cards;
    if (second) {
        return `AI predicts the fastest growth comes from ${lower(first.title)} and ${lower(second.title)}. Prioritizing these first can compound results across ${first.category.toLowerCase()} and ${second.category.toLowerCase()}.`;
    }
    return `AI predicts the fastest growth comes from ${lower(first.title)}, offering ${first.impact.toLowerCase()} with ${DIFFICULTY_LABEL[first.difficulty].toLowerCase()} effort to implement.`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreCard({ score, growthPotential, confidence, leadingImpact, explanation }) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - score / 100);

    return (
        <div className="growth-score">
            <div className="growth-score__ring">
                <svg className="growth-score__ring-svg" viewBox="0 0 120 120">
                    <circle
                        className="growth-score__ring-track"
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        strokeWidth="10"
                    />
                    <circle
                        className="growth-score__ring-progress"
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
                <div className="growth-score__ring-center">
                    <strong>{score}</strong>
                    <span>GROWTH</span>
                </div>
            </div>

            <div className="growth-score__body">
                <div className="growth-score__label">
                    <Gauge size={15} />
                    <span>AI Opportunity Score</span>
                </div>

                <div className="growth-score__stats">
                    <div className="growth-score__stat">
                        <span className="growth-score__stat-label">Growth Potential</span>
                        <span className="growth-score__stat-value">{growthPotential}</span>
                    </div>
                    <div className="growth-score__stat">
                        <span className="growth-score__stat-label">Estimated Impact</span>
                        <span className="growth-score__stat-value">{leadingImpact}</span>
                    </div>
                    <div className="growth-score__stat">
                        <span className="growth-score__stat-label">Confidence</span>
                        <span className="growth-score__stat-value">{confidence}%</span>
                    </div>
                </div>

                <p className="growth-score__explanation">{explanation}</p>
            </div>
        </div>
    );
}

function OpportunityCard({ icon, title, businessReason, aiAction, priority, difficulty, timeEstimate, roi, impact, category }) {
    // Belt-and-braces: even if a bad object slips through normalization,
    // never let a non-component reach JSX.
    const resolvedIcon = resolveIcon(icon);

    return (
        <div className="growth-card">
            <div className="growth-card__header">
                <div className="growth-card__icon-wrap">
                    {createElement(resolvedIcon, {
                        size: 18,
                        strokeWidth: 2.2,
                        className: 'growth-card__icon',
                    })}
                </div>
                <div className="growth-card__header-tags">
                    <span className="growth-card__category">{category}</span>
                    <span className={`growth-card__badge growth-card__badge--${priority}`}>
                        {IMPACT_LABEL[priority] || 'Medium Impact'}
                    </span>
                </div>
            </div>

            <div className="growth-card__body">
                <span className="growth-card__title">{title}</span>

                <div className="growth-card__block">
                    <span className="growth-card__block-label">Business Reason</span>
                    <p className="growth-card__block-text">{businessReason}</p>
                </div>

                <div className="growth-card__block growth-card__block--action">
                    <span className="growth-card__block-label growth-card__block-label--action">
                        <Lightbulb size={12} />
                        AI Suggested Action
                    </span>
                    <p className="growth-card__block-text">{aiAction}</p>
                </div>

                <div className="growth-card__meta">
                    <div className="growth-card__meta-item">
                        <span className="growth-card__meta-label">Difficulty</span>
                        <span className="growth-card__meta-value">{DIFFICULTY_LABEL[difficulty] || difficulty}</span>
                    </div>
                    <div className="growth-card__meta-item">
                        <span className="growth-card__meta-label">Est. Time</span>
                        <span className="growth-card__meta-value">{timeEstimate}</span>
                    </div>
                    <div className="growth-card__meta-item">
                        <span className="growth-card__meta-label">Est. ROI</span>
                        <span className="growth-card__meta-value">{roi}</span>
                    </div>
                    <div className="growth-card__meta-item">
                        <span className="growth-card__meta-label">Impact Area</span>
                        <span className="growth-card__meta-value">{impact}</span>
                    </div>
                </div>
            </div>

            <div className="growth-card__footer">
                <Sparkles size={13} />
                <span>AI Opportunity</span>
            </div>
        </div>
    );
}

function TimelineLane({ lane }) {
    const LaneIcon = lane.icon;

    return (
        <div className="growth-timeline__lane">
            <div className="growth-timeline__lane-header">
                <LaneIcon size={14} />
                <span>{lane.label}</span>
                <span className="growth-timeline__count">{lane.items.length}</span>
            </div>
            <div className="growth-timeline__items">
                {lane.items.length > 0 ? (
                    lane.items.map((item) => (
                        <div className="growth-timeline__item" key={item.id}>
                            {item.title}
                        </div>
                    ))
                ) : (
                    <div className="growth-timeline__item">No opportunities in this window</div>
                )}
            </div>
        </div>
    );
}

function Timeline({ lanes }) {
    return (
        <div className="growth-block">
            <span className="growth-block__title">Opportunity Timeline</span>
            <div className="growth-timeline">
                {Object.values(lanes).map((lane) => (
                    <TimelineLane key={lane.label} lane={lane} />
                ))}
            </div>
        </div>
    );
}

function SummaryCard({ text }) {
    if (!text) return null;
    return (
        <div className="growth-summary">
            <div className="growth-summary__icon">
                <Sparkles size={18} />
            </div>
            <div className="growth-summary__body">
                <span className="growth-summary__label">AI Growth Summary</span>
                <p className="growth-summary__text">{text}</p>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="growth-empty">
            <div className="growth-empty__icon-wrap">
                <Compass size={22} />
            </div>
            <span className="growth-empty__title">No Growth Opportunities Yet</span>
            <p className="growth-empty__description">
                Upload business data to discover AI opportunities.
            </p>
        </div>
    );
}

function GrowthOpportunities({ opportunities, analytics }) {
    // Prefer real, backend-generated opportunities if they've been supplied,
    // but always run them through normalization — backend/AI payloads are
    // untrusted and may carry stringified icons, missing ids, etc.
    const rawList =
        Array.isArray(opportunities) && opportunities.length > 0
            ? opportunities
            : buildOpportunities(analytics);

    const cards = rawList
        .map((item, index) => normalizeOpportunity(item, index))
        .filter(Boolean);

    const hasCards = cards.length > 0;
    const scoreData = hasCards ? computeScore(cards) : null;
    const timelineLanes = hasCards ? buildTimeline(cards) : null;
    const summaryText = hasCards ? buildSummaryText(cards) : '';

    return (
        <section className="growth-opportunities">
            <header className="growth-opportunities__header">
                <span className="growth-opportunities__eyebrow">
                    <Sparkles size={12} />
                    AI Opportunity Engine
                </span>
                <h2 className="growth-opportunities__title">Growth Opportunities</h2>
                <p className="growth-opportunities__subtitle">
                    AI has identified the highest business opportunities based on your uploaded business data.
                </p>
            </header>

            {hasCards ? (
                <>
                    <ScoreCard {...scoreData} />

                    <div className="growth-opportunities__grid">
                        {cards.map((card) => (
                            <OpportunityCard key={card.id} {...card} />
                        ))}
                    </div>

                    <Timeline lanes={timelineLanes} />

                    <SummaryCard text={summaryText} />
                </>
            ) : (
                <EmptyState />
            )}
        </section>
    );
}

export default GrowthOpportunities;