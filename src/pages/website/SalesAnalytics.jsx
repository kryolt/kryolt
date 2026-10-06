import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/seo/SEO";
import AuthModal from "../../components/auth/AuthModal";
import HomeNavbar from "../../components/home/HomeNavbar";
import HomeFooter from "../../components/home/HomeFooter";
import "./SalesAnalytics.css";

const Icon = ({ children, size = 19 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const Icons = {
    Arrow: () => (
        <Icon size={17}>
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </Icon>
    ),

    Sparkles: () => (
        <Icon>
            <path d="m12 3-1.7 5.2a2 2 0 0 1-1.3 1.3L3.8 11.2l5.2 1.7a2 2 0 0 1 1.3 1.3L12 19.4l1.7-5.2a2 2 0 0 1 1.3-1.3l5.2-1.7-5.2-1.7a2 2 0 0 1-1.3-1.3L12 3Z" />
        </Icon>
    ),

    Trend: () => (
        <Icon>
            <path d="m4 16 5-5 4 4 7-8" />
            <path d="M15 7h5v5" />
        </Icon>
    ),

    Revenue: () => (
        <Icon>
            <path d="M7 3h10" />
            <path d="M7 8h10" />
            <path d="M8 13h3" />
            <path d="M8 13c0 4 2.5 7 7 8" />
            <path d="M8 13c4.5 0 7-2 8-5" />
        </Icon>
    ),

    Product: () => (
        <Icon>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </Icon>
    ),

    Users: () => (
        <Icon>
            <circle cx="9" cy="7" r="4" />
            <path d="M2 21v-2a7 7 0 0 1 14 0v2" />
            <path d="M19 8a4 4 0 0 1 0 7.7" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
        </Icon>
    ),

    Card: () => (
        <Icon>
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
        </Icon>
    ),

    Check: () => (
        <Icon size={17}>
            <path d="m5 12 4 4L19 6" />
        </Icon>
    ),
};

/* =========================================================
   PAGE DATA
   ========================================================= */

const FEATURES = [
    [
        Icons.Trend,
        "Sales performance",
        "See sales movement and performance trends in one place.",
    ],
    [
        Icons.Revenue,
        "Revenue analysis",
        "Understand revenue across products and periods.",
    ],
    [
        Icons.Product,
        "Product performance",
        "Compare products and spot your strongest sellers.",
    ],
    [
        Icons.Users,
        "Customer analysis",
        "Explore customer sales patterns when customer data is available.",
    ],
    [
        Icons.Card,
        "Payment analysis",
        "Break down sales by payment method and transaction mix.",
    ],
    [
        Icons.Sparkles,
        "AI insights",
        "Get concise, plain-language insights from your analytics.",
    ],
];

const WORKFLOW = [
    ["01", "Upload", "Add your Excel or CSV sales file."],
    ["02", "Process", "Kryolt prepares the uploaded data."],
    ["03", "Explore", "View dashboards and sales metrics."],
    ["04", "Understand", "Review AI-assisted insights."],
    ["05", "Report", "Use reports for business reviews."],
];

const BENEFITS = [
    [
        "Excel & CSV ready",
        "Start with the sales files you already use.",
    ],
    [
        "Small-business focused",
        "Keep sales analysis simple and practical.",
    ],
    [
        "Interactive dashboards",
        "Explore key numbers without rebuilding charts manually.",
    ],
    [
        "AI-assisted analysis",
        "See written insights alongside your visual data.",
    ],
    [
        "Reports",
        "Turn analyzed data into useful business reporting.",
    ],
];

const AUDIENCE = [
    "Retail businesses",
    "E-commerce teams",
    "Small business owners",
    "Store managers",
    "Founders & operators",
    "Excel-driven teams",
];

const FAQS = [
    [
        "What is sales analytics software?",
        "Sales analytics software helps businesses organize, visualize and analyze sales data so they can understand performance and trends more clearly.",
    ],
    [
        "Can I analyze Excel sales data with Kryolt?",
        "Yes. Kryolt is designed to work with Excel and CSV sales files and turn supported data into dashboards and analytics.",
    ],
    [
        "Do I need a complex integration?",
        "No. The workflow starts with uploading a supported file, making it suitable for teams already working with spreadsheets.",
    ],
    [
        "What can I analyze?",
        "The available analysis depends on the columns in your dataset. Kryolt can surface supported sales, product, customer and payment metrics from the uploaded data.",
    ],
    [
        "How do AI insights help?",
        "AI insights add written explanations and recommendations based on the analytics generated from your uploaded dataset.",
    ],
];

/* =========================================================
   SIMPLE DEMO CHART
   ========================================================= */

const CHART_VALUES = [34, 48, 42, 62, 55, 76];

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
];

const SimpleChart = ({ compact = false }) => (
    <div
        className={`sa-simple-chart ${compact ? "sa-simple-chart-compact" : ""
            }`}
        aria-label="Illustrative six-month sales trend chart"
    >
        <div className="sa-chart-lines" aria-hidden="true">
            <i />
            <i />
            <i />
        </div>

        <div className="sa-bars">
            {CHART_VALUES.map((value, index) => (
                <div
                    className="sa-bar-column"
                    key={MONTHS[index]}
                >
                    <div
                        className="sa-bar"
                        style={{ height: `${value}%` }}
                        aria-hidden="true"
                    />

                    {!compact && (
                        <span>{MONTHS[index]}</span>
                    )}
                </div>
            ))}
        </div>
    </div>
);

/* =========================================================
   SALES ANALYTICS PAGE
   ========================================================= */

const SalesAnalytics = () => {
    const [showAuth, setShowAuth] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("Free");

    const handleStartFree = useCallback(() => {
        setSelectedPlan("Free");
        setShowAuth(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setShowAuth(false);
    }, []);

    return (
        <>
            <SEO
                title="Sales Analytics Software for Small Businesses | Kryolt"
                description="Analyze sales data from Excel and CSV files with Kryolt. Explore sales dashboards, product performance, customer analytics, reports and AI-powered insights."
                canonicalPath="/sales-analytics"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    name: "Kryolt",
                    applicationCategory: "BusinessApplication",
                    operatingSystem: "Web",
                    url: "https://kryolt.com/sales-analytics",
                    description:
                        "Kryolt helps small businesses analyze sales data from Excel and CSV files through dashboards, analytics, reports and AI-powered insights.",
                }}
            />

            <div className="sa-page">
                <HomeNavbar onGetStartedClick={handleStartFree} />

                <main className="sa-root">

                    {/* =====================================================
                        HERO
                       ===================================================== */}

                    <section className="sa-hero">
                        <div className="sa-container sa-hero-grid">

                            <div className="sa-hero-copy">

                                <span className="sa-eyebrow">
                                    <Icons.Sparkles />
                                    SALES ANALYTICS
                                </span>

                                <h1>
                                    Turn Sales Data into{" "}
                                    <span>Better decisions.</span>
                                </h1>

                                <p>
                                    Analyze sales data from Excel or CSV files
                                    with a simple sales dashboard, clear
                                    performance metrics and AI-assisted insights.
                                </p>

                                <div className="sa-actions">

                                    <button
                                        type="button"
                                        onClick={handleStartFree}
                                        className="sa-btn sa-btn-primary"
                                    >
                                        Analyze your data
                                        <Icons.Arrow />
                                    </button>

                                    <Link
                                        to="/features"
                                        className="sa-btn sa-btn-secondary"
                                    >
                                        Explore features
                                    </Link>

                                </div>

                                <div className="sa-trust-line">

                                    <span>
                                        <Icons.Check />
                                        Excel & CSV
                                    </span>

                                    <span>
                                        <Icons.Check />
                                        Sales dashboard
                                    </span>

                                    <span>
                                        <Icons.Check />
                                        AI insights
                                    </span>

                                </div>

                            </div>

                            {/* Simple dashboard preview */}

                            <div className="sa-hero-visual">

                                <div className="sa-dashboard-card">

                                    <div className="sa-dashboard-top">

                                        <div>
                                            <small>
                                                Kryolt Sales Dashboard
                                            </small>

                                            <strong>
                                                Sales overview
                                            </strong>
                                        </div>

                                        <span>
                                            Preview
                                        </span>

                                    </div>

                                    <div className="sa-mini-kpis">

                                        <div>
                                            <small>Revenue</small>
                                            <strong>₹148.9K</strong>
                                            <em>+14.2%</em>
                                        </div>

                                        <div>
                                            <small>Orders</small>
                                            <strong>618</strong>
                                            <em>+8.6%</em>
                                        </div>

                                        <div>
                                            <small>AOV</small>
                                            <strong>₹240</strong>
                                            <em>+3.8%</em>
                                        </div>

                                    </div>

                                    <div className="sa-chart-heading">
                                        <span>Sales trend</span>
                                        <strong>Last 6 months</strong>
                                    </div>

                                    <SimpleChart />

                                    <div className="sa-dashboard-note">

                                        <span>
                                            <i />
                                            Clear sales performance view
                                        </span>

                                        <b>
                                            AI-assisted
                                        </b>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* =====================================================
                        QUICK OVERVIEW
                       ===================================================== */}

                    <section className="sa-overview">

                        <div className="sa-container sa-overview-grid">

                            {[
                                ["Sales", "Performance"],
                                ["Revenue", "Analysis"],
                                ["Products", "Performance"],
                                ["Customers", "Insights"],
                                ["Payments", "Breakdown"],
                            ].map(([title, text]) => (
                                <div
                                    className="sa-overview-item"
                                    key={title}
                                >
                                    <strong>{title}</strong>
                                    <span>{text}</span>
                                </div>
                            ))}

                        </div>

                    </section>

                    {/* =====================================================
                        CAPABILITIES
                       ===================================================== */}

                    <section className="sa-section">

                        <div className="sa-container">

                            <div className="sa-section-heading">

                                <span className="sa-kicker">
                                    CAPABILITIES
                                </span>

                                <h2>
                                    Understand the sales numbers that matter.
                                </h2>

                                <p>
                                    Focused analytics for the questions business
                                    owners ask every day.
                                </p>

                            </div>

                            <div className="sa-capabilities-grid">

                                {FEATURES.map(
                                    ([I, title, text]) => (
                                        <article
                                            className="sa-capability-card"
                                            key={title}
                                        >

                                            <div className="sa-icon-box">
                                                <I />
                                            </div>

                                            <h3>{title}</h3>

                                            <p>{text}</p>

                                        </article>
                                    )
                                )}

                            </div>

                        </div>

                    </section>

                    {/* =====================================================
                        WORKFLOW
                       ===================================================== */}

                    <section className="sa-section sa-section-soft">

                        <div className="sa-container">

                            <div className="sa-centered-heading">

                                <span className="sa-kicker">
                                    HOW IT WORKS
                                </span>

                                <h2>
                                    From spreadsheet to insight.
                                </h2>

                                <p>
                                    A simple five-step workflow. No complicated setup.
                                </p>

                            </div>

                            <div className="sa-workflow-grid">

                                {WORKFLOW.map(
                                    ([num, title, text]) => (
                                        <div
                                            className="sa-workflow-card"
                                            key={num}
                                        >

                                            <span className="sa-workflow-number">
                                                {num}
                                            </span>

                                            <h3>{title}</h3>

                                            <p>{text}</p>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                    </section>

                    {/* =====================================================
                        SALES DASHBOARD SHOWCASE
                       ===================================================== */}

                    <section className="sa-section">

                        <div className="sa-container sa-showcase-grid">

                            <div className="sa-showcase-copy">

                                <span className="sa-kicker">
                                    SALES DASHBOARD
                                </span>

                                <h2>
                                    See the numbers.
                                    Understand the story.
                                </h2>

                                <p>
                                    Kryolt brings important sales metrics into one
                                    focused dashboard, helping you move from raw
                                    rows to a clearer view of performance.
                                </p>

                                <div className="sa-check-list">

                                    <li>
                                        <Icons.Check />
                                        Sales trends
                                    </li>

                                    <li>
                                        <Icons.Check />
                                        Product performance
                                    </li>

                                    <li>
                                        <Icons.Check />
                                        Customer metrics
                                    </li>

                                    <li>
                                        <Icons.Check />
                                        Payment breakdowns
                                    </li>

                                </div>

                                <button
                                    type="button"
                                    onClick={handleStartFree}
                                    className="sa-btn sa-btn-primary"
                                >
                                    Open dashboard
                                    <Icons.Arrow />
                                </button>

                            </div>

                            <div className="sa-showcase-panel">

                                <div className="sa-panel-head">

                                    <span>
                                        Sales dashboard
                                    </span>

                                    <small>
                                        Simple overview
                                    </small>

                                </div>

                                <div className="sa-panel-kpis">

                                    <div>

                                        <small>
                                            Total sales
                                        </small>

                                        <strong>
                                            ₹2,48,920
                                        </strong>

                                        <span>
                                            Across the selected period
                                        </span>

                                    </div>

                                    <div>

                                        <small>
                                            Orders
                                        </small>

                                        <strong>
                                            1,248
                                        </strong>

                                        <span>
                                            Sales transactions
                                        </span>

                                    </div>

                                </div>

                                <div className="sa-summary-list">

                                    <div>
                                        <span>
                                            <i />
                                            Sales performance
                                        </span>

                                        <b>
                                            Clear
                                        </b>
                                    </div>

                                    <div>
                                        <span>
                                            <i />
                                            Product performance
                                        </span>

                                        <b>
                                            Available
                                        </b>
                                    </div>

                                    <div>
                                        <span>
                                            <i />
                                            Customer analytics
                                        </span>

                                        <b>
                                            Available
                                        </b>
                                    </div>

                                    <div>
                                        <span>
                                            <i />
                                            Payment analysis
                                        </span>

                                        <b>
                                            Available
                                        </b>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* =====================================================
                        BENEFITS
                       ===================================================== */}

                    <section className="sa-section sa-section-soft">

                        <div className="sa-container">

                            <div className="sa-section-heading">

                                <span className="sa-kicker">
                                    WHY KRYOLT
                                </span>

                                <h2>
                                    Useful by design.
                                </h2>

                                <p>
                                    Keep the experience focused on understanding
                                    your business data.
                                </p>

                            </div>

                            <div className="sa-benefits-grid">

                                {BENEFITS.map(
                                    ([title, text]) => (
                                        <div
                                            className="sa-benefit-card"
                                            key={title}
                                        >

                                            <div className="sa-icon-box">
                                                <Icons.Check />
                                            </div>

                                            <h3>{title}</h3>

                                            <p>{text}</p>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                    </section>

                    {/* =====================================================
                        AI INSIGHTS
                       ===================================================== */}

                    <section className="sa-section">

                        <div className="sa-container">

                            <div className="sa-ai-card">

                                <div className="sa-ai-copy">

                                    <span className="sa-kicker">
                                        AI-ASSISTED ANALYSIS
                                    </span>

                                    <h2>
                                        Numbers are useful. Context makes them
                                        easier to act on.
                                    </h2>

                                    <p>
                                        Kryolt adds plain-language observations
                                        to the analytics generated from your
                                        uploaded data, helping you understand
                                        important changes faster.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleStartFree}
                                        className="sa-btn sa-btn-secondary"
                                    >
                                        Explore AI insights
                                        <Icons.Arrow />
                                    </button>

                                </div>

                                <div className="sa-ai-points">

                                    <div className="sa-ai-point">
                                        <Icons.Trend />

                                        <span>
                                            Understand important sales changes
                                            faster.
                                        </span>
                                    </div>

                                    <div className="sa-ai-point">
                                        <Icons.Sparkles />

                                        <span>
                                            Review concise AI-assisted
                                            observations.
                                        </span>
                                    </div>

                                    <div className="sa-ai-point">
                                        <Icons.Product />

                                        <span>
                                            Explore product and period-level
                                            performance.
                                        </span>
                                    </div>

                                </div>

                                <div className="sa-ai-score">

                                    <div className="sa-ai-score-inner">

                                        <strong>
                                            AI
                                        </strong>

                                        <span>
                                            Assisted insights
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* =====================================================
                        AUDIENCE
                       ===================================================== */}

                    <section className="sa-section sa-section-soft">

                        <div className="sa-container">

                            <div className="sa-centered-heading">

                                <span className="sa-kicker">
                                    BUILT FOR
                                </span>

                                <h2>
                                    Made for teams working with sales data.
                                </h2>

                            </div>

                            <div className="sa-audience-grid">

                                {AUDIENCE.map((item) => (
                                    <div
                                        className="sa-audience-card"
                                        key={item}
                                    >

                                        <div className="sa-icon-box">
                                            <Icons.Check />
                                        </div>

                                        <div>

                                            <h3>{item}</h3>

                                            <p>
                                                Sales analytics and reporting
                                            </p>

                                        </div>

                                    </div>
                                ))}

                            </div>

                        </div>

                    </section>

                    {/* =====================================================
                        FAQ
                       ===================================================== */}

                    <section className="sa-section">

                        <div className="sa-container sa-faq">

                            <div className="sa-centered-heading">

                                <span className="sa-kicker">
                                    FAQ
                                </span>

                                <h2>
                                    Questions, answered.
                                </h2>

                            </div>

                            <div className="sa-faq-list">

                                {FAQS.map(([q, a]) => (
                                    <details
                                        key={q}
                                        className="sa-faq-item"
                                    >

                                        <summary className="sa-faq-question">

                                            <span>
                                                {q}
                                            </span>

                                            <Icons.Arrow />

                                        </summary>

                                        <div className="sa-faq-answer">
                                            {a}
                                        </div>

                                    </details>
                                ))}

                            </div>

                        </div>

                    </section>

                    {/* =====================================================
                        FINAL CTA
                       ===================================================== */}

                    <section className="sa-final">

                        <div className="sa-container sa-final-inner">

                            <span className="sa-kicker">
                                GET STARTED
                            </span>

                            <h2>
                                Make your sales data easier to understand.
                            </h2>

                            <p>
                                <span>Upload your Excel or CSV file</span> to explore
                                sales performance, trends, and insights with Kryolt.
                            </p>

                            <button
                                type="button"
                                onClick={handleStartFree}
                                className="sa-btn sa-btn-primary"
                            >
                                Analyze your data
                                <Icons.Arrow />
                            </button>

                        </div>

                    </section>

                </main>

                <HomeFooter />

            </div>

            <AuthModal
                open={showAuth}
                onClose={closeAuthModal}
                selectedPlan={selectedPlan}
            />
        </>
    );
};

export default SalesAnalytics;