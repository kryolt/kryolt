import { useCallback, useEffect, useState } from "react";
import {
    ArrowRight,
    Check,
    CreditCard,
    LayoutGrid,
    Package,
    Sparkles,
    Target,
    TrendingUp,
    Upload,
    Users,
} from "lucide-react";
import SEO from "../../components/seo/SEO";
import AuthModal from "../../components/auth/AuthModal";
import HomeNavbar from "../../components/home/HomeNavbar";
import HomeFooter from "../../components/home/HomeFooter";
import "./BusinessAnalytics.css";

/* =========================================================
   CONTENT
   Heading hierarchy:  H1 hero  ->  H2 sections  ->  H3 cards / steps / FAQ
   Icons: Lucide only (Kryolt brand rule)
   ========================================================= */

const PROOF = ["Excel & CSV", "One business view", "AI-assisted insights"];

const SIGNALS = [
    { num: "01", title: "See", text: "Know what your numbers are doing." },
    { num: "02", title: "Understand", text: "Find the patterns behind the change." },
    { num: "03", title: "Act", text: "Move from insight to your next decision." },
];

const MODULES = [
    {
        icon: TrendingUp,
        title: "Performance",
        text: "See revenue, orders and business momentum together instead of checking multiple sheets.",
    },
    {
        icon: Package,
        title: "Products",
        text: "Spot top products, weak performers and changes in demand before they become problems.",
    },
    {
        icon: Users,
        title: "Customers",
        text: "Understand customer activity and the patterns that shape your business results.",
    },
    {
        icon: CreditCard,
        title: "Transactions",
        text: "Break down payment methods and transaction activity for a cleaner operational view.",
    },
];

const STEPS = [
    { icon: Upload, title: "Upload", text: "Bring in a supported Excel or CSV file." },
    { icon: LayoutGrid, title: "Organize", text: "Kryolt prepares the data for analysis and dashboard views." },
    { icon: TrendingUp, title: "Explore", text: "Review business performance, products, customers and transactions." },
    { icon: Sparkles, title: "Understand", text: "Use AI-assisted observations to spot meaningful changes faster." },
    { icon: Target, title: "Decide", text: "Take the findings into your next business action." },
];

const DECISIONS = [
    {
        title: "What is growing?",
        text: "Compare recent performance and identify the metrics moving in the right direction.",
    },
    {
        title: "What needs attention?",
        text: "Find unusual changes, weaker areas and patterns that deserve a closer look.",
    },
    {
        title: "What should I do next?",
        text: "Use AI-assisted observations to turn the numbers into practical next steps.",
    },
];

const AUDIENCE = [
    "Retail & stores",
    "Distributors & wholesalers",
    "Online businesses",
    "Founders & operators",
    "Growing teams",
    "Excel-first businesses",
];

const FAQS = [
    {
        q: "What does business analytics software do?",
        a: "It turns business data into structured metrics, visual analysis and insights that make everyday decisions easier.",
    },
    {
        q: "Can I use Excel or CSV files?",
        a: "Yes. Kryolt is designed around the business files many small teams already use, including supported Excel and CSV datasets.",
    },
    {
        q: "Do I need SQL or technical skills?",
        a: "Kryolt is built around a file-first workflow, so you can start with your existing business data instead of setting up a complex analytics stack.",
    },
    {
        q: "What can I analyze?",
        a: "Depending on the structure of your dataset, Kryolt can surface business performance, revenue, products, customers and transaction-related metrics.",
    },
    {
        q: "Are the AI insights automatic?",
        a: "Kryolt can generate AI-assisted observations from the analytics produced from your uploaded data, helping you understand important changes faster.",
    },
];

const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
};

/* =========================================================
   PAGE
   ========================================================= */

export default function BusinessAnalytics() {
    // -1 = every FAQ closed. Stays closed on load and refresh.
    const [openFaq, setOpenFaq] = useState(-1);
    const [showAuth, setShowAuth] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("Free");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleStartFree = useCallback(() => {
        setSelectedPlan("Free");
        setShowAuth(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setShowAuth(false);
    }, []);

    return (
        <div className="ba3-page">
            <SEO
                title="Business Analytics Software | Kryolt"
                description="Turn Excel and CSV business data into clear dashboards, analytics and AI-assisted insights with Kryolt."
                structuredData={structuredData}
            />

            <HomeNavbar onGetStartedClick={handleStartFree} />

            <main>

                {/* ================= HERO ================= */}
                <section className="ba3-hero" aria-labelledby="ba3-hero-title">
                    <div className="ba3-shell ba3-hero-grid">

                        <div className="ba3-hero-copy">
                            <span className="ba3-kicker">
                                <i className="ba3-dot" aria-hidden="true" />
                                Business analytics
                            </span>

                            <h1 id="ba3-hero-title">
                                <span className="ba3-heading-line ba3-heading-main">
                                    Business Analytics Software
                                </span>
                                <span className="ba3-heading-line ba3-accent">
                                    for Smarter Decisions.
                                </span>
                            </h1>

                            <p className="ba3-lead">
                                Kryolt turns your Excel and CSV data into clear dashboards,
                                business analytics and AI-assisted insights, so you can see
                                what changed and decide what to do next.
                            </p>

                            <div className="ba3-hero-actions">
                                <button
                                    type="button"
                                    onClick={handleStartFree}
                                    className="ba3-btn ba3-btn-primary"
                                >
                                    Analyze your data
                                    <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />
                                </button>
                            </div>

                            <ul className="ba3-proof">
                                {PROOF.map((item) => (
                                    <li key={item}>
                                        <Check size={16} strokeWidth={2.4} aria-hidden="true" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>



                    </div>
                </section>


                {/* ================= SIGNAL STRIP ================= */}
                <section className="ba3-signal" aria-label="See, understand, act">
                    <ul className="ba3-shell ba3-signal-grid">
                        {SIGNALS.map((item) => (
                            <li key={item.num}>
                                <span>{item.num}</span>
                                <div>
                                    <strong>{item.title}</strong>
                                    <p>{item.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>


                {/* ================= MODULES ================= */}
                <section
                    className="ba3-section ba3-tinted"
                    aria-labelledby="ba3-modules-title"
                >
                    <div className="ba3-shell">

                        <div className="ba3-head">
                            <span className="ba3-kicker">One view. More context.</span>

                            <h2 id="ba3-modules-title">
                                <span className="ba3-heading-line ba3-heading-main">
                                    Business analytics
                                </span>
                                <span className="ba3-heading-line ba3-accent">
                                    without the spreadsheet maze.
                                </span>
                            </h2>

                            <p>
                                Instead of jumping between tabs, bring the most important
                                parts of your business into one structured view.
                            </p>
                        </div>

                        <div className="ba3-bento">
                            {MODULES.map(({ icon: Icon, title, text }, index) => (
                                <article className="ba3-tile" key={title}>
                                    <div className="ba3-tile-top">
                                        <span className="ba3-ico">
                                            <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
                                        </span>
                                        <span className="ba3-num">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                    </div>

                                    <h3>{title}</h3>
                                    <p>{text}</p>
                                </article>
                            ))}

                            <article className="ba3-tile ba3-tile-ai">
                                <div className="ba3-tile-top">
                                    <span className="ba3-ico">
                                        <Sparkles size={20} strokeWidth={1.9} aria-hidden="true" />
                                    </span>
                                    <span className="ba3-num">05</span>
                                </div>

                                <h3>AI-assisted business signals</h3>

                                <p>
                                    Get a plain-language layer on top of your analytics. Kryolt
                                    helps surface meaningful changes, risks and opportunities
                                    so the dashboard is easier to act on.
                                </p>

                                <aside className="ba3-signal-card" aria-label="Example AI signal">
                                    <span>
                                        <Sparkles size={13} strokeWidth={2.2} aria-hidden="true" />
                                        Example AI signal
                                    </span>
                                    <strong>Revenue is growing, but 3 products are slowing.</strong>
                                    <small>
                                        Review product-level performance before your next stock
                                        decision.
                                    </small>
                                </aside>
                            </article>
                        </div>

                    </div>
                </section>


                {/* ================= HOW IT WORKS ================= */}
                <section
                    className="ba3-section"
                    id="how-it-works"
                    aria-labelledby="ba3-process-title"
                >
                    <div className="ba3-shell">

                        <div className="ba3-head">
                            <span className="ba3-kicker">How it works</span>

                            <h2 id="ba3-process-title">
                                <span className="ba3-heading-line ba3-heading-main">
                                    From business file to
                                </span>
                                <span className="ba3-heading-line ba3-accent">
                                    decision-ready view.
                                </span>
                            </h2>

                            <p>
                                No complicated setup story. Start with the data you already
                                work with and move through a simple analysis flow.
                            </p>
                        </div>

                        <ol className="ba3-steps">
                            {STEPS.map(({ icon: Icon, title, text }, index) => (
                                <li className="ba3-step" key={title}>
                                    <span className="ba3-step-ico">
                                        <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
                                    </span>

                                    <div className="ba3-step-body">
                                        <b>{String(index + 1).padStart(2, "0")}</b>
                                        <h3>{title}</h3>
                                        <p>{text}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <div className="ba3-center">
                            <button
                                type="button"
                                onClick={handleStartFree}
                                className="ba3-text-link"
                            >
                                Start with your data
                                <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
                            </button>
                        </div>

                    </div>
                </section>


                {/* ================= DECISION LAYER ================= */}
                <section
                    className="ba3-section ba3-tinted"
                    aria-labelledby="ba3-decision-title"
                >
                    <div className="ba3-shell">

                        <div className="ba3-head">
                            <span className="ba3-kicker">The decision layer</span>

                            <h2 id="ba3-decision-title">
                                <span className="ba3-heading-line ba3-heading-main">
                                    Good analytics answers
                                </span>
                                <span className="ba3-heading-line ba3-accent">
                                    better questions.
                                </span>
                            </h2>

                            <p>
                                Kryolt is not just about showing charts. The goal is to make
                                the information behind the charts easier to understand.
                            </p>
                        </div>

                        <div className="ba3-decisions">
                            {DECISIONS.map((item, index) => (
                                <article className="ba3-decision" key={item.title}>
                                    <span className="ba3-decision-num" aria-hidden="true">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </article>
                            ))}
                        </div>

                    </div>
                </section>


                {/* ================= AUDIENCE ================= */}
                <section className="ba3-section" aria-labelledby="ba3-audience-title">
                    <div className="ba3-shell">

                        <div className="ba3-head">
                            <span className="ba3-kicker">Built for small business</span>

                            <h2 id="ba3-audience-title">
                                <span className="ba3-heading-line ba3-heading-main">
                                    Made for teams with data,
                                </span>
                                <span className="ba3-heading-line ba3-accent">
                                    that need clarity.
                                </span>
                            </h2>

                            <p>
                                You do not need a dedicated analytics department to get a
                                useful view of your business.
                            </p>
                        </div>

                        <ul className="ba3-audience">
                            {AUDIENCE.map((item) => (
                                <li key={item}>
                                    <Check size={15} strokeWidth={2.6} aria-hidden="true" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                    </div>
                </section>


                {/* ================= FAQ ================= */}
                <section
                    className="ba3-section ba3-tinted"
                    aria-labelledby="ba3-faq-title"
                >
                    <div className="ba3-shell ba3-faq-grid">

                        <div className="ba3-faq-intro">
                            <span className="ba3-kicker">FAQ</span>

                            <h2 id="ba3-faq-title">
                                <span className="ba3-heading-line ba3-heading-main">
                                    Questions,
                                </span>
                                <span className="ba3-heading-line ba3-accent">
                                    answered clearly.
                                </span>
                            </h2>

                            <p>
                                Everything you need to know before bringing your business
                                data into Kryolt.
                            </p>
                        </div>

                        <div className="ba3-faq-list">
                            {FAQS.map((item, index) => {
                                const open = openFaq === index;

                                return (
                                    <div
                                        className={`ba3-faq-item${open ? " is-open" : ""}`}
                                        key={item.q}
                                    >
                                        <h3>
                                            <button
                                                type="button"
                                                id={`ba3-faq-q-${index}`}
                                                aria-expanded={open}
                                                aria-controls={`ba3-faq-a-${index}`}
                                                onClick={() => setOpenFaq(open ? -1 : index)}
                                            >
                                                <span>{item.q}</span>
                                                <span className="ba3-faq-plus" aria-hidden="true">
                                                    {open ? "−" : "+"}
                                                </span>
                                            </button>
                                        </h3>

                                        <div
                                            id={`ba3-faq-a-${index}`}
                                            role="region"
                                            aria-labelledby={`ba3-faq-q-${index}`}
                                            className="ba3-faq-answer"
                                            hidden={!open}
                                        >
                                            <p>{item.a}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </section>


                {/* ================= CTA ================= */}
                <section className="ba3-cta-wrap" aria-labelledby="ba3-cta-title">
                    <div className="ba3-shell">
                        <div className="ba3-cta">

                            <div className="ba3-cta-copy">
                                <span className="ba3-kicker ba3-kicker-light">
                                    Ready when your data is
                                </span>

                                <h2 id="ba3-cta-title">
                                    Stop reading rows. Start seeing the business.
                                </h2>

                                <p>
                                    Upload the data you already use and get a clearer starting
                                    point for your next decision.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleStartFree}
                                className="ba3-btn ba3-btn-light"
                            >
                                Analyze your data
                                <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />
                            </button>

                        </div>
                    </div>
                </section>

            </main>

            <HomeFooter />

            <AuthModal
                open={showAuth}
                onClose={closeAuthModal}
                selectedPlan={selectedPlan}
            />
        </div>
    );
}