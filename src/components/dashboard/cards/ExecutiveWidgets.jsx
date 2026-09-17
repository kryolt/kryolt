import "./ExecutiveWidgets.css";

import { useMemo } from "react";
import {
    IndianRupee,
    ShoppingCart,
    Users,
    Star,
    Tag,
    Rocket,
    PackageX,
    Repeat,
    BrainCircuit,
} from "lucide-react";

import { useDashboardDataContext } from "../../../context/DashboardDataContext";
import { formatCurrency } from "../../../utils/analytics/analytics";

function getRowDate(row) {
    return row?.Date || row?.OrderDate || null;
}

function toDayKey(date) {
    if (!date) return null;

    const parsed = new Date(date);

    if (isNaN(parsed)) return null;

    return parsed.toLocaleDateString("en-CA");
}

function formatDayLabel(dayKey) {
    if (!dayKey) return "No data";

    return new Date(dayKey).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
}

function WidgetCard({ widget }) {
    const {
        icon,
        title,
        value,
        subtitle,
        trend,
        badge,
        accent,
    } = widget;

    return (
        <div
            className="executive-card"
            style={{ "--accent": accent || "#0D46F5" }}
        >
            <div className="executive-top">
                <div className="executive-icon">
                    {icon}
                </div>

                {badge && (
                    <span className="executive-badge">
                        {badge}
                    </span>
                )}
            </div>

            <div className="executive-info">
                <p>{title}</p>

                <div className="executive-value-row">
                    <h2>{value}</h2>

                    {trend && (
                        <span
                            className={`executive-trend executive-trend--${trend.direction}`}
                        >
                            {trend.label}
                        </span>
                    )}
                </div>

                <span className="executive-subtitle">
                    {subtitle}
                </span>
            </div>
        </div>
    );
}

function ExecutiveWidgets() {
    const dashboard = useDashboardDataContext();

    /*
     * IMPORTANT:
     * Hooks must always execute in the same order.
     * Do not return before useMemo calls.
     */
    const {
        data = [],
        analytics = {},
    } = dashboard || {};

    const {
        periodSales,
        periodOrders,
        hasToday,
        referenceKey,
    } = useMemo(() => {
        const todayKey =
            new Date().toLocaleDateString("en-CA");

        const dayKeys = data
            .map((row) => getRowDate(row))
            .filter(Boolean)
            .map(toDayKey)
            .filter(Boolean);

        const hasToday =
            dayKeys.includes(todayKey);

        const latestKey =
            dayKeys.length > 0
                ? dayKeys.reduce(
                    (latest, key) =>
                        key > latest ? key : latest
                )
                : todayKey;

        const referenceKey =
            hasToday
                ? todayKey
                : latestKey;

        const referenceRows =
            data.filter((row) => {
                const date = getRowDate(row);

                return (
                    date &&
                    toDayKey(date) === referenceKey
                );
            });

        const periodSales =
            referenceRows.reduce(
                (sum, row) =>
                    sum +
                    Number(
                        row.Amount ??
                        row.Sales ??
                        row.Total ??
                        row.Revenue ??
                        0
                    ),
                0
            );

        return {
            periodSales,
            periodOrders:
                referenceRows.length,
            hasToday,
            referenceKey,
        };
    }, [data]);

    const widgets = useMemo(() => {
        const list = [];

        // ---- Today / latest day sales ----

        if (data.length > 0) {
            list.push({
                key: "periodSales",
                icon: <IndianRupee size={20} />,
                title: hasToday
                    ? "Today's sales"
                    : "Latest day's sales",
                value: formatCurrency(
                    periodSales ?? 0
                ),
                subtitle: hasToday
                    ? "Today"
                    : formatDayLabel(
                        referenceKey
                    ),
                accent: "#0D46F5",
            });

            list.push({
                key: "periodOrders",
                icon: <ShoppingCart size={20} />,
                title: hasToday
                    ? "Today's orders"
                    : "Latest day's orders",
                value: (
                    periodOrders ?? 0
                ).toLocaleString("en-IN"),
                subtitle: hasToday
                    ? "Today"
                    : formatDayLabel(
                        referenceKey
                    ),
                accent: "#0D46F5",
            });
        }

        // ---- Customers ----

        if (
            analytics?.customerAnalytics
                ?.available
        ) {
            list.push({
                key: "customers",
                icon: <Users size={20} />,
                title: "Customers",
                value: (
                    analytics?.totalCustomers ??
                    0
                ).toLocaleString("en-IN"),
                subtitle: "Unique buyers",
                accent: "#7C3AED",
            });
        }

        // ---- Avg order value ----

        if (analytics?.averageOrderValue) {
            list.push({
                key: "avgOrderValue",
                icon: <Star size={20} />,
                title: "Avg order value",
                value: formatCurrency(
                    analytics?.averageOrderValue ??
                    0
                ),
                subtitle: "Per order",
                accent: "#7C3AED",
            });
        }

        // ---- Top category ----

        const topCategory =
            analytics?.categoryAnalytics
                ?.topCategory;

        if (
            analytics?.categoryAnalytics
                ?.available &&
            topCategory
        ) {
            const share =
                analytics?.categoryAnalytics
                    ?.topCategoryShare;

            list.push({
                key: "topCategory",
                icon: <Tag size={20} />,
                title: "Top category",
                value: topCategory,
                subtitle: share
                    ? `${share}% of sales`
                    : "Leading category",
                badge: share
                    ? `${share}%`
                    : null,
                accent: "#E08A1D",
            });
        }

        // ---- Fastest growing product ----

        const fastestProduct =
            analytics?.productAnalytics
                ?.fastestGrowing;

        if (fastestProduct) {
            const growth =
                analytics?.productAnalytics
                    ?.fastestGrowingRate;

            list.push({
                key: "fastestGrowing",
                icon: <Rocket size={20} />,
                title:
                    "Fastest growing product",
                value: fastestProduct,
                subtitle:
                    "Momentum building",
                trend: growth
                    ? {
                        direction: "positive",
                        label: `+${growth}%`,
                    }
                    : null,
                accent: "#0E9F6E",
            });
        }

        // ---- Inventory alert ----

        const lowStockCount =
            analytics?.inventory
                ?.lowStockCount;

        if (lowStockCount > 0) {
            list.push({
                key: "inventoryAlert",
                icon: <PackageX size={20} />,
                title: "Inventory alert",
                value: `${lowStockCount} item${lowStockCount > 1
                    ? "s"
                    : ""
                    }`,
                subtitle:
                    "Running low on stock",
                badge: "Action needed",
                accent: "#E5484D",
            });
        }

        // ---- Customer retention ----

        const retentionRate =
            analytics?.customerAnalytics
                ?.retentionRate;

        if (
            analytics?.customerAnalytics
                ?.available &&
            retentionRate !== undefined &&
            retentionRate !== null
        ) {
            list.push({
                key: "retention",
                icon: <Repeat size={20} />,
                title: "Customer retention",
                value: `${retentionRate}%`,
                subtitle:
                    retentionRate >= 50
                        ? "Healthy repeat rate"
                        : "Room to improve",
                trend: {
                    direction:
                        retentionRate >= 50
                            ? "positive"
                            : "negative",
                    label:
                        retentionRate >= 50
                            ? "Healthy"
                            : "Low",
                },
                accent: "#059669",
            });
        }

        // ---- AI confidence score ----

        const confidenceScore =
            analytics?.aiConfidenceScore;

        if (
            confidenceScore !== undefined &&
            confidenceScore !== null
        ) {
            list.push({
                key: "aiConfidence",
                icon: (
                    <BrainCircuit size={20} />
                ),
                title:
                    "AI confidence score",
                value: `${confidenceScore}%`,
                subtitle:
                    "Based on data completeness",
                accent: "#0D46F5",
            });
        }

        return list;
    }, [
        data,
        analytics,
        periodSales,
        periodOrders,
        hasToday,
        referenceKey,
    ]);

    /*
     * Safe to return now.
     * All hooks above have already executed.
     */
    if (!dashboard) {
        return null;
    }

    if (widgets.length === 0) {
        return null;
    }

    return (
        <section className="executive-grid">
            {widgets.map((widget) => (
                <WidgetCard
                    widget={widget}
                    key={widget.key}
                />
            ))}
        </section>
    );
}

export default ExecutiveWidgets;