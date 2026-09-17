import { useMemo } from "react";
import "./KPIAnalytics.css";

import {
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    ShoppingCart,
    IndianRupee,
    Percent,
    ShieldCheck,
} from "lucide-react";

import { useDashboardDataContext } from "../../../context/DashboardDataContext";

function healthTone(score = 0) {
    if (score >= 90)
        return { label: "Excellent", color: "#0E9F6E" };

    if (score >= 80)
        return { label: "Good", color: "#E08A1D" };

    if (score >= 70)
        return { label: "Fair", color: "#F59E0B" };

    return { label: "Needs attention", color: "#E5484D" };
}

function trendDirection(value) {
    if (value === null || value === undefined)
        return "neutral";

    if (value > 0)
        return "positive";

    if (value < 0)
        return "negative";

    return "neutral";
}

function formatPercent(value) {
    if (value === null || value === undefined)
        return null;

    return `${value > 0 ? "+" : ""}${value}%`;
}

function TrendIcon({ direction }) {
    if (direction === "positive")
        return <TrendingUp size={13} />;

    if (direction === "negative")
        return <TrendingDown size={13} />;

    return <Minus size={13} />;
}

function KPIAnalytics() {

    const { analytics } = useDashboardDataContext();

    const kpis = useMemo(() => {

        if (!analytics)
            return [];

        const revenueGrowth = analytics?.revenueGrowth;
        const ordersGrowth = analytics?.ordersGrowth;

        const totalProfit = analytics?.financial?.totalProfit;
        const grossProfitMargin =
            analytics?.financial?.grossProfitMargin;

        const businessHealth =
            analytics?.businessHealth ?? 0;

        const hasProfit =
            totalProfit !== undefined &&
            totalProfit !== null &&
            totalProfit > 0;

        return [

            // Revenue performance
            {
                key: "revenueGrowth",
                icon: <TrendingUp size={18} />,
                title: "Revenue growth",
                value: formatPercent(revenueGrowth) ?? "—",
                growth: revenueGrowth,
                subtitle:
                    revenueGrowth === null ||
                        revenueGrowth === undefined
                        ? "Not enough data yet"
                        : "vs previous period",
            },

            // Order performance
            {
                key: "ordersGrowth",
                icon: <ShoppingCart size={18} />,
                title: "Order growth",
                value: formatPercent(ordersGrowth) ?? "—",
                growth: ordersGrowth,
                subtitle:
                    ordersGrowth === null ||
                        ordersGrowth === undefined
                        ? "Not enough data yet"
                        : "vs previous period",
            },

            // Profit performance
            hasProfit && {
                key: "profit",
                icon: <IndianRupee size={18} />,
                title: "Profit performance",
                value: `₹${Number(totalProfit).toLocaleString("en-IN")}`,
                growth: null,
                subtitle: "Total profit this period",
            },

            // Profit margin
            hasProfit && {
                key: "profitMargin",
                icon: <Percent size={18} />,
                title: "Profit margin",
                value: `${grossProfitMargin ?? 0}%`,
                growth: null,
                subtitle:
                    grossProfitMargin >= 20
                        ? "Healthy margin"
                        : "Below target margin",
            },

            // Business health
            {
                key: "businessHealth",
                icon: <ShieldCheck size={18} />,
                title: "Business health",
                value: `${businessHealth}%`,
                growth: null,
                subtitle: healthTone(businessHealth).label,
            },

        ].filter(Boolean);

    }, [analytics]);


    const insights = useMemo(() => {

        if (!analytics)
            return [];

        const result = [];

        const revenueGrowth = analytics?.revenueGrowth;
        const ordersGrowth = analytics?.ordersGrowth;

        const grossProfitMargin =
            analytics?.financial?.grossProfitMargin;

        const businessHealth =
            analytics?.businessHealth;


        if (
            revenueGrowth !== null &&
            revenueGrowth !== undefined &&
            ordersGrowth !== null &&
            ordersGrowth !== undefined &&
            revenueGrowth > ordersGrowth
        ) {
            result.push(
                "Revenue is growing faster than order volume."
            );
        }


        if (
            revenueGrowth !== null &&
            revenueGrowth !== undefined &&
            revenueGrowth < 0
        ) {
            result.push(
                "Revenue is declining compared with the previous period."
            );
        }


        if (
            ordersGrowth !== null &&
            ordersGrowth !== undefined &&
            ordersGrowth < 0
        ) {
            result.push(
                "Order volume is declining compared with the previous period."
            );
        }


        if (
            grossProfitMargin !== null &&
            grossProfitMargin !== undefined &&
            grossProfitMargin >= 20
        ) {
            result.push(
                "Profit margin is healthy."
            );
        }


        if (
            businessHealth !== null &&
            businessHealth !== undefined &&
            businessHealth >= 90
        ) {
            result.push(
                "Business health remains excellent."
            );
        }


        return result;

    }, [analytics]);


    const businessHealth =
        analytics?.businessHealth ?? 0;

    const tone =
        healthTone(businessHealth);


    if (!analytics) {

        return (
            <div className="kpi-analytics kpi-empty">

                <Activity size={26} />

                <h3>
                    No performance data yet
                </h3>

                <p>
                    Upload transaction data to unlock performance analytics.
                </p>

            </div>
        );

    }


    return (

        <div className="kpi-analytics">

            <div className="kpi-analytics-header">

                <div className="kpi-analytics-title">

                    <div className="kpi-title-icon">
                        <Activity size={20} />
                    </div>

                    <div>

                        <h2>
                            Performance Analytics
                        </h2>

                        <p>
                            Growth, profitability and health metrics for this period
                        </p>

                    </div>

                </div>


                <div
                    className="kpi-health-indicator"
                    style={{
                        color: tone.color,
                        background: `${tone.color}1A`,
                        borderColor: `${tone.color}33`,
                    }}
                >

                    <ShieldCheck size={14} />

                    <span>
                        {tone.label}
                    </span>

                </div>

            </div>


            {kpis.length > 0 ? (

                <div className="kpi-grid">

                    {kpis.map((kpi) => {

                        const direction =
                            trendDirection(kpi.growth);

                        return (

                            <div
                                className="kpi-card"
                                key={kpi.key}
                            >

                                <div className="kpi-top">

                                    <div className="kpi-icon">
                                        {kpi.icon}
                                    </div>


                                    {kpi.growth !== undefined &&
                                        kpi.growth !== null ? (

                                        <div
                                            className={`kpi-trend-pill trend-${direction}`}
                                        >

                                            <TrendIcon
                                                direction={direction}
                                            />

                                            <span>
                                                {formatPercent(kpi.growth)}
                                            </span>

                                        </div>

                                    ) : (

                                        <div className="kpi-trend-pill trend-neutral">
                                            <Minus size={12} />
                                        </div>

                                    )}

                                </div>


                                <h4>
                                    {kpi.title}
                                </h4>


                                <h2>
                                    {kpi.value}
                                </h2>


                                <span className="kpi-subtitle">
                                    {kpi.subtitle}
                                </span>


                                <span className="kpi-comparison">

                                    {kpi.growth === undefined ||
                                        kpi.growth === null
                                        ? "No comparison available"
                                        : (
                                            <>
                                                {direction === "positive"
                                                    ? "▲"
                                                    : direction === "negative"
                                                        ? "▼"
                                                        : "—"}

                                                {" "}

                                                {formatPercent(kpi.growth)}
                                            </>
                                        )}

                                </span>

                            </div>

                        );

                    })}

                </div>

            ) : (

                <div className="kpi-empty-inline">
                    Not enough analytics data to compute performance KPIs yet.
                </div>

            )}


            {insights.length > 0 && (

                <div className="kpi-insights">

                    <h3>
                        Performance Highlights
                    </h3>

                    <ul>

                        {insights.map((text, index) => (

                            <li key={index}>
                                {text}
                            </li>

                        ))}

                    </ul>

                </div>

            )}

        </div>
    );
}

export default KPIAnalytics;