import "./HomeHero.css";
import { APP } from "../../config/appConfig";

/* ---------- Custom brand icons (angular / diagonal-cut, matches K logo geometry) ---------- */

const IconSpark = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10L12 3Z" fill="currentColor" />
    </svg>
);

const IconRevenue = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 20L10 12L14.5 16L20 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M14.5 6H20V11.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
);

const IconProfit = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 4V20H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
        <path d="M8 15L12 10L15 12.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
);

const IconCustomers = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 19V17C4 14.7909 5.79086 13 8 13H10C12.2091 13 14 14.7909 14 17V19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M9 10L5 6H13L9 10Z" fill="currentColor" />
        <path d="M15 13.5C17.2091 13.5 19 15.2909 19 17.5V19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
);

const IconArrow = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
);

const IconPlay = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M5 4L20 12L5 20L5 4Z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="miter" fill="none" />
    </svg>
);

/* ---------- Data ---------- */

const HERO_STATS = [
    { value: "1,000+", label: "Reports generated" },
    { value: "99%", label: "AI accuracy" },
    { value: "24×7", label: "Support available" },
];

const DASHBOARD_METRICS = [
    {
        icon: <IconRevenue />,
        label: "Revenue",
        value: "₹61.3L",
        trend: "+12.4%",
        iconColor: "#2e5ce8",
        iconBg: "#dce6f8",
    },
    {
        icon: <IconProfit />,
        label: "Profit",
        value: "₹11.7L",
        trend: "+8.1%",
        iconColor: "#2e5ce8",
        iconBg: "#dce6f8",
    },
    {
        icon: <IconCustomers />,
        label: "Customers",
        value: "150",
        trend: "+5.6%",
        iconColor: "#2e5ce8",
        iconBg: "#dce6f8",
    },
];

const CHART_DATA = [
    { month: "Jan", value: 32, height: 38 },
    { month: "Feb", value: 41, height: 52 },
    { month: "Mar", value: 36, height: 45 },
    { month: "Apr", value: 52, height: 64 },
    { month: "May", value: 47, height: 58 },
    { month: "Jun", value: 63, height: 78 },
    { month: "Jul", value: 61, height: 70 },
];

const CHART_MAX = Math.max(...CHART_DATA.map((d) => d.value));

/* Initials shown in the "trusted by" avatar stack — kept as initials
   instead of photos so no external image dependency is needed. */
const TRUST_AVATARS = ["R", "P", "A", "S"];

function HomeHero({ onGetStartedClick }) {
    return (
        <section className="hero" aria-label="Introduction">
            <div className="hero-inner">
                <div className="hero-left">
                    <div className="hero-badge">
                        <span className="hero-badge-icon">
                            <IconSpark />
                        </span>
                        <span className="hero-badge-text">
                            {APP.tagline || "AI-Powered Business Suite"}
                        </span>
                    </div>

                    <h1 className="hero-title">
                        Manage your business
                        <br />
                        <span className="hero-title-accent">smarter, with AI</span>
                    </h1>

                    <p className="hero-subtext">
                        Turn raw CSV files into clear dashboards, AI-driven insights and
                        ready-to-share reports in seconds — no spreadsheets, no manual
                        formulas, no guesswork.
                    </p>

                    <div className="hero-buttons">
                        <button
                            className="btn-primary"
                            type="button"
                            onClick={onGetStartedClick}
                        >
                            Get started free
                            <IconArrow />
                        </button>

                        <a
                            className="btn-secondary"
                            href={APP.socials.youtube.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <IconPlay />
                            Watch demo
                        </a>
                    </div>

                    <div className="hero-trust">
                        <div className="trust-avatars" aria-hidden="true">
                            {TRUST_AVATARS.map((letter, i) => (
                                <span className="trust-avatar" key={i}>
                                    {letter}
                                </span>
                            ))}
                        </div>
                        <span className="trust-text">
                            Trusted by <strong>growing businesses</strong> across India
                        </span>
                    </div>

                    <div className="hero-stats">
                        {HERO_STATS.map(({ value, label }, i) => (
                            <div className="stat-item" key={label}>
                                {i > 0 && <span className="stat-divider" aria-hidden="true" />}
                                <div>
                                    <h3>{value}</h3>
                                    <span>{label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hero-right">
                    <div className="dashboard-preview">
                        <div className="dp-corner" aria-hidden="true" />
                        <div className="dp-grid" aria-hidden="true" />

                        {/* Browser-window chrome — gives the preview a tangible,
                            "real product" feel instead of a floating card. */}
                        <div className="dp-window-bar">
                            <span className="dp-dot dp-dot-red" />
                            <span className="dp-dot dp-dot-yellow" />
                            <span className="dp-dot dp-dot-green" />
                            <span className="dp-window-url">Kryolt Dashboard</span>
                        </div>

                        <div className="dp-header">
                            <span className="dp-header-title">Dashboard overview</span>
                            <span className="dp-live-badge">
                                <span className="dp-live-dot" />
                                Live
                            </span>
                        </div>

                        <div className="dp-metrics">
                            {DASHBOARD_METRICS.map(({ icon, label, value, trend, iconColor, iconBg }) => (
                                <div className="dp-metric-row" key={label}>
                                    <span className="dp-metric-label">
                                        <span
                                            className="dp-metric-icon"
                                            style={{ color: iconColor, background: iconBg }}
                                        >
                                            {icon}
                                        </span>
                                        {label}
                                    </span>
                                    <span className="dp-metric-values">
                                        <strong>{value}</strong>
                                        <em>{trend}</em>
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="dp-chart-head">
                            <p className="dp-chart-caption">Monthly sales growth</p>
                            <span className="dp-chart-total">
                                ₹{CHART_DATA[CHART_DATA.length - 1].value}.0L
                                <em className="dp-chart-total-trend">▲ 12.4%</em>
                            </span>
                        </div>

                        <div className="dp-chart" role="img" aria-label="Monthly sales growth trend chart">
                            <div className="dp-chart-gridlines" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>

                            <svg
                                className="dp-chart-trend"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                            >
                                <polyline
                                    points={CHART_DATA.map(
                                        (d, i) =>
                                            `${(i / (CHART_DATA.length - 1)) * 100},${100 - d.height}`
                                    ).join(" ")}
                                />
                            </svg>

                            {CHART_DATA.map(({ month, value, height }, i) => {
                                const isPeak = value === CHART_MAX;
                                return (
                                    <div className="dp-bar-col" key={month}>
                                        <span className="dp-bar-tooltip">₹{value}.0L</span>
                                        <div
                                            className={`dp-bar${isPeak ? " dp-bar-peak" : ""}`}
                                            style={{
                                                "--bar-h": `${height}%`,
                                                "--bar-delay": `${i * 70}ms`,
                                            }}
                                        />
                                        <span className="dp-bar-month">{month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HomeHero;