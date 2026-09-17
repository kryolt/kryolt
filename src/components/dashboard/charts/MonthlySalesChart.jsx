import { useState, useMemo, useCallback, memo } from "react";
import "./MonthlySalesChart.css";

import {
    TrendingUp,
    TrendingDown,
    BarChart3,
} from "lucide-react";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from "recharts";

const FILTERS = [
    { label: "3M", months: 3 },
    { label: "6M", months: 6 },
    { label: "1Y", months: 12 },
    { label: "All", months: null },
];

const EMPTY_ARRAY = [];

function formatIndianCompact(value) {
    const abs = Math.abs(value);

    if (abs >= 10000000) {
        return `₹${(value / 10000000).toFixed(1)}Cr`;
    }

    if (abs >= 100000) {
        return `₹${(value / 100000).toFixed(1)}L`;
    }

    if (abs >= 1000) {
        return `₹${(value / 1000).toFixed(0)}k`;
    }

    return `₹${value}`;
}


/*
 * =====================================================
 * CUSTOM TOOLTIP
 * =====================================================
 *
 * Kept outside MonthlySalesChart so React does not
 * create a new component type during every render.
 */
function MonthlySalesTooltip({
    active,
    payload,
    label,
    totalRevenue,
}) {
    if (
        !active ||
        !payload ||
        !payload.length
    ) {
        return null;
    }

    const value = Number(
        payload[0]?.value
    ) || 0;

    const contribution =
        totalRevenue > 0
            ? (
                (value / totalRevenue) *
                100
            ).toFixed(1)
            : "0.0";

    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-month">
                {label}
            </p>

            <p className="chart-tooltip-revenue">
                ₹{value.toLocaleString("en-IN")}
            </p>

            <p className="chart-tooltip-contribution">
                {contribution}% of shown range
            </p>
        </div>
    );
}


function MonthlySalesChart({ analytics }) {
    /*
     * Use a stable empty-array fallback.
     * This prevents the dependency warning caused by
     * creating [] on every render.
     */
    const fullChartData =
        analytics?.monthlySales ??
        EMPTY_ARRAY;

    const revenueGrowth =
        analytics?.revenueGrowth ?? null;

    const [
        activeFilter,
        setActiveFilter,
    ] = useState("All");


    // =====================================================
    // FILTERED CHART DATA
    // =====================================================

    const chartData = useMemo(() => {
        const filter =
            FILTERS.find(
                (item) =>
                    item.label ===
                    activeFilter
            );

        if (
            !filter ||
            !filter.months
        ) {
            return fullChartData;
        }

        /*
         * Normalize sales values so chart calculations
         * always work with numbers.
         */
        const normalized =
            fullChartData.map((item) => ({
                ...item,
                sales:
                    Number(item.sales) ||
                    0,
            }));

        return normalized.slice(
            -filter.months
        );
    }, [
        activeFilter,
        fullChartData,
    ]);


    // =====================================================
    // TOTAL REVENUE
    // =====================================================

    const totalRevenue = useMemo(() => {
        return chartData.reduce(
            (sum, item) =>
                sum +
                (
                    Number(item.sales) ||
                    0
                ),
            0
        );
    }, [chartData]);


    // =====================================================
    // AVERAGE REVENUE
    // =====================================================

    const averageRevenue = useMemo(() => {
        if (!chartData.length) {
            return 0;
        }

        return (
            totalRevenue /
            chartData.length
        );
    }, [
        chartData,
        totalRevenue,
    ]);


    // =====================================================
    // HIGHEST MONTH
    // =====================================================

    const highestMonth = useMemo(() => {
        if (!chartData.length) {
            return null;
        }

        return chartData.reduce(
            (best, item) =>
                item.sales >
                    best.sales
                    ? item
                    : best,
            chartData[0]
        );
    }, [chartData]);


    // =====================================================
    // LOWEST MONTH
    // =====================================================

    const lowestMonth = useMemo(() => {
        if (!chartData.length) {
            return null;
        }

        return chartData.reduce(
            (worst, item) =>
                item.sales <
                    worst.sales
                    ? item
                    : worst,
            chartData[0]
        );
    }, [chartData]);


    // =====================================================
    // DOT RENDERER
    // =====================================================

    const renderDot = useCallback(
        (props) => {
            const {
                cx,
                cy,
                payload,
                index,
            } = props;

            const isHighest =
                highestMonth &&
                payload.month ===
                highestMonth.month &&
                payload.sales ===
                highestMonth.sales;

            const isLowest =
                lowestMonth &&
                payload.month ===
                lowestMonth.month &&
                payload.sales ===
                lowestMonth.sales;


            if (isHighest) {
                return (
                    <circle
                        key={`dot-${index}`}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#0D46F5"
                        stroke="#fff"
                        strokeWidth={2}
                    />
                );
            }


            if (isLowest) {
                return (
                    <circle
                        key={`dot-${index}`}
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill="#fff"
                        stroke="#EF4444"
                        strokeWidth={2}
                    />
                );
            }


            return (
                <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="#fff"
                    stroke="#0D46F5"
                    strokeWidth={2}
                />
            );
        },
        [
            highestMonth,
            lowestMonth,
        ]
    );


    // =====================================================
    // EMPTY STATE
    // =====================================================

    if (!fullChartData.length) {
        return (
            <div className="chart-card">
                <div className="chart-header">
                    <div className="chart-title-group">
                        <div className="chart-icon">
                            <BarChart3 size={15} />
                        </div>

                        <div>
                            <h2>
                                Monthly Sales
                            </h2>

                            <p>
                                Revenue Trend
                            </p>
                        </div>
                    </div>
                </div>

                <div className="chart-empty">
                    <p>
                        No monthly sales data
                        available
                    </p>
                </div>
            </div>
        );
    }


    // =====================================================
    // MAIN RENDER
    // =====================================================

    return (
        <div className="chart-card">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="chart-header">

                <div className="chart-title-group">

                    <div className="chart-icon">
                        <BarChart3 size={15} />
                    </div>

                    <div>
                        <h2>
                            Monthly Sales
                        </h2>

                        <p>
                            Revenue Trend
                        </p>
                    </div>

                </div>


                <div className="chart-badges">

                    {revenueGrowth !== null && (
                        <span
                            className={`chart-growth-pill ${revenueGrowth >= 0
                                ? "growth-up"
                                : "growth-down"
                                }`}
                        >

                            {revenueGrowth >= 0 ? (
                                <TrendingUp size={11} />
                            ) : (
                                <TrendingDown size={11} />
                            )}

                            {revenueGrowth > 0
                                ? "+"
                                : ""}

                            {revenueGrowth}%

                        </span>
                    )}


                    <span className="chart-badge">

                        {chartData.length}

                        {" "}

                        {chartData.length === 1
                            ? "month"
                            : "months"}

                    </span>

                </div>

            </div>


            {/* =================================================
                STATS
            ================================================= */}

            <div className="chart-stats">

                <div className="chart-stat-item">
                    <span className="chart-stat-label">
                        Total Revenue
                    </span>

                    <span className="chart-stat-value">
                        {formatIndianCompact(
                            totalRevenue
                        )}
                    </span>
                </div>


                <div className="chart-stat-item">
                    <span className="chart-stat-label">
                        Avg Monthly
                    </span>

                    <span className="chart-stat-value">
                        {formatIndianCompact(
                            averageRevenue
                        )}
                    </span>
                </div>


                <div className="chart-stat-item">
                    <span className="chart-stat-label">
                        Best Month
                    </span>

                    <span className="chart-stat-value">
                        {highestMonth
                            ? highestMonth.month
                            : "N/A"}
                    </span>
                </div>


                <div className="chart-stat-item">
                    <span className="chart-stat-label">
                        Worst Month
                    </span>

                    <span className="chart-stat-value">
                        {lowestMonth
                            ? lowestMonth.month
                            : "N/A"}
                    </span>
                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="chart-controls">

                <div
                    className="chart-filter-group"
                    role="tablist"
                    aria-label="Filter by time range"
                >

                    {FILTERS.map(
                        ({ label }) => (
                            <button
                                key={label}
                                type="button"
                                role="tab"
                                aria-selected={
                                    activeFilter ===
                                    label
                                }
                                className={`chart-filter-btn ${activeFilter ===
                                    label
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setActiveFilter(
                                        label
                                    )
                                }
                            >
                                {label}
                            </button>
                        )
                    )}

                </div>

            </div>


            {/* =================================================
                CHART
            ================================================= */}

            <div className="chart-area">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <AreaChart
                        key={activeFilter}
                        data={chartData}
                        margin={{
                            top: 28,
                            right: 4,
                            left: 0,
                            bottom: 0,
                        }}
                    >

                        <defs>

                            <linearGradient
                                id="salesGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >

                                <stop
                                    offset="5%"
                                    stopColor="#0D46F5"
                                    stopOpacity={0.35}
                                />

                                <stop
                                    offset="95%"
                                    stopColor="#0D46F5"
                                    stopOpacity={0}
                                />

                            </linearGradient>

                        </defs>


                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#EEF1F6"
                        />


                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#94a3b8",
                                fontSize: 11,
                                fontWeight: 500,
                            }}
                        />


                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#94a3b8",
                                fontSize: 11,
                            }}
                            tickFormatter={
                                formatIndianCompact
                            }
                            width={44}
                            domain={[
                                0,
                                (dataMax) =>
                                    Math.ceil(
                                        dataMax *
                                        1.25
                                    ),
                            ]}
                        />


                        <Tooltip
                            content={
                                <MonthlySalesTooltip
                                    totalRevenue={
                                        totalRevenue
                                    }
                                />
                            }
                        />


                        {chartData.length > 1 && (
                            <ReferenceLine
                                y={averageRevenue}
                                stroke="#94a3b8"
                                strokeDasharray="4 4"
                                label={{
                                    value: "Average",
                                    position:
                                        "insideTopRight",
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                }}
                            />
                        )}


                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#0D46F5"
                            strokeWidth={2.5}
                            fill="url(#salesGradient)"
                            dot={renderDot}
                            activeDot={{
                                r: 5,
                            }}
                        />

                    </AreaChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}

export default memo(MonthlySalesChart);