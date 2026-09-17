import "./InsightsHero.css";
import { Sparkles, Brain, BarChart3, Gauge } from "lucide-react";

const isEmpty = (value) =>
    value === null || value === undefined || value === "" || Number.isNaN(value);

const withFallback = (value, fallback) => (isEmpty(value) ? fallback : value);

const pickScore = (...candidates) => {
    for (const value of candidates) {
        if (isEmpty(value)) continue;
        const num = Number(value);
        if (!Number.isNaN(num)) return num;
    }
    return null;
};

const FEATURE_CHIPS = [
    { icon: Sparkles, label: "AI Analysis" },
    { icon: Brain, label: "Smart Insights" },
    { icon: BarChart3, label: "Business Intelligence" },
];

function InsightsHero({ analytics }) {
    const rawScore = pickScore(
        analytics?.businessHealth?.score,
        analytics?.businessHealth,
        analytics?.overall?.score,
        analytics?.overall,
        analytics?.overallScore,
        analytics?.healthScore
    );

    if (rawScore === null && import.meta.env.DEV) {
        console.warn(
            "InsightsHero: couldn't find a score on `analytics`. Received:",
            analytics
        );
    }

    const score = Math.round(withFallback(rawScore, 0));

    return (
        <section className="insights-hero" aria-labelledby="insights-hero-heading">
            <div className="insights-mark" aria-hidden="true">
                <svg viewBox="0 0 100 100" fill="none">
                    <path d="M40 12 L40 46 L70 12 Z" fill="currentColor" />
                    <path d="M40 46 L40 88 L70 88 L52 66 Z" fill="currentColor" />
                </svg>
            </div>

            <div className="insights-left">
                <div className="insights-badge">
                    <Sparkles className="insights-chip-icon" aria-hidden="true" />
                    <span>AI Business Intelligence</span>
                </div>

                <h1 id="insights-hero-heading">
                    {withFallback(analytics?.title, "AI Insights")}
                </h1>

                <p>
                    {withFallback(
                        analytics?.description,
                        "Kryolt AI automatically analyzes your uploaded business data and generates professional executive insights, business recommendations and growth opportunities."
                    )}
                </p>

                <div className="insights-chip-row">
                    {FEATURE_CHIPS.map(({ icon: Icon, label }) => (
                        <div className="insights-chip" key={label}>
                            <Icon className="insights-chip-icon" aria-hidden="true" />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div
                className="insights-k-badge"
                role="img"
                aria-label={`Business health score: ${score} out of 100`}
            >
                <div className="insights-k-ring">
                    <div className="insights-k-circle">
                        <Gauge
                            className="insights-k-icon"
                            aria-hidden="true"
                            focusable="false"
                        />
                        <span className="insights-k-number">{score}</span>
                        <span className="insights-k-label">Score</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default InsightsHero;
