import { useMemo, useState, memo } from "react";

import "./SalesChart.css";

import {
    MapPin,
    Trophy,
    ArrowUpDown,
} from "lucide-react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from "recharts";


const COLORS = [
    "#0D46F5",
    "#3B78F3",
    "#6C93F5",
    "#9DB8FF",
    "#061E8C",
    "#1D4ED8",
    "#4C7CF0",
    "#7FA0F7",
];

const OTHERS_COLOR = "#CBD5E1";
const TOP_COLOR = "#061E8C";

const RANK_BADGE_CLASS = [
    "rank-gold",
    "rank-silver",
    "rank-bronze",
];

const LIMIT_OPTIONS = [
    { label: "Top 5", value: 5 },
    { label: "Top 10", value: 10 },
    { label: "All", value: "all" },
];

const EMPTY_CITY_SALES = [];


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


function SalesChartTooltip({
    active,
    payload,
    totalRevenue,
}) {

    if (!active || !payload?.length) {
        return null;
    }

    const {
        city,
        sales,
        fill,
    } = payload[0].payload;

    const contribution =
        totalRevenue > 0
            ? ((sales / totalRevenue) * 100).toFixed(1)
            : "0.0";

    return (
        <div className="sales-tooltip">

            <div className="sales-tooltip-head">

                <span
                    className="sales-tooltip-dot"
                    style={{ background: fill }}
                />

                {city}

            </div>

            <div className="sales-tooltip-value">

                ₹{Number(sales).toLocaleString("en-IN")}

            </div>

            <div className="sales-tooltip-contribution">

                {contribution}% of total

            </div>

        </div>
    );
}


function SalesChart({ analytics }) {

    const [activeIndex, setActiveIndex] = useState(null);

    const [limit, setLimit] = useState(10);

    const [sortAsc, setSortAsc] = useState(false);

    // Stable fallback prevents a new [] from being created
    // on every render and fixes exhaustive-deps warnings.
    const citySales =
        analytics?.citySales ??
        EMPTY_CITY_SALES;


    const totalRevenue = useMemo(() => {

        return citySales.reduce(

            (sum, item) =>
                sum + (Number(item?.revenue) || 0),

            0

        );

    }, [citySales]);


    const totalCities =
        citySales.length;


    const averageRevenue = useMemo(() => {

        if (!totalCities) {
            return 0;
        }

        return totalRevenue / totalCities;

    }, [
        totalRevenue,
        totalCities,
    ]);


    const descSorted = useMemo(() => {

        return [...citySales].sort(

            (a, b) =>
                (Number(b?.revenue) || 0) -
                (Number(a?.revenue) || 0)

        );

    }, [citySales]);


    const topCity =
        descSorted[0] ||
        null;


    const topShare =
        topCity && totalRevenue

            ? (
                (
                    (Number(topCity.revenue) || 0) /
                    totalRevenue
                ) * 100
            ).toFixed(1)

            : null;


    const sortedData = useMemo(() => {

        const copy = [...citySales];

        copy.sort((a, b) =>

            sortAsc

                ? (Number(a?.revenue) || 0) -
                (Number(b?.revenue) || 0)

                : (Number(b?.revenue) || 0) -
                (Number(a?.revenue) || 0)

        );

        return copy;

    }, [
        citySales,
        sortAsc,
    ]);


    const filteredData = useMemo(() => {

        if (limit === "all") {
            return sortedData;
        }

        return sortedData.slice(
            0,
            limit
        );

    }, [
        sortedData,
        limit,
    ]);


    const chartData = useMemo(() => {

        const shown =
            filteredData.map(
                ({ city, revenue }) => ({
                    city,
                    sales: revenue,
                })
            );


        const remaining =
            sortedData.slice(
                filteredData.length
            );


        const othersTotal =
            remaining.reduce(

                (sum, item) =>
                    sum +
                    (Number(item?.revenue) || 0),

                0

            );


        if (
            limit !== "all" &&
            othersTotal > 0
        ) {

            shown.push({
                city: "Others",
                sales: othersTotal,
            });

        }


        return shown.map(
            (item, index) => {

                let fill =
                    COLORS[
                    index %
                    COLORS.length
                    ];


                if (
                    item.city === "Others"
                ) {

                    fill =
                        OTHERS_COLOR;

                } else if (
                    topCity &&
                    item.city ===
                    topCity.city
                ) {

                    fill =
                        TOP_COLOR;

                }


                return {
                    ...item,
                    fill,
                };

            }
        );

    }, [
        filteredData,
        sortedData,
        limit,
        topCity,
    ]);


    const rankingData =
        useMemo(
            () =>
                descSorted.slice(
                    0,
                    5
                ),
            [descSorted]
        );


    if (!chartData.length) {

        return (

            <div className="chart-card">

                <div className="chart-header">

                    <div className="chart-title-group">

                        <div className="chart-icon">

                            <MapPin size={14} />

                        </div>

                        <div>

                            <h2>
                                Sales by city
                            </h2>

                            <p>
                                Top performing cities
                            </p>

                        </div>

                    </div>

                </div>

                <div className="chart-empty">

                    <p>
                        No city sales data available.
                    </p>

                </div>

            </div>

        );

    }


    return (

        <div className="chart-card">

            <div className="chart-header">

                <div className="chart-title-group">

                    <div className="chart-icon">

                        <MapPin size={14} />

                    </div>

                    <div>

                        <h2>
                            Sales by city
                        </h2>

                        <p>
                            Top performing cities
                        </p>

                    </div>

                </div>

                <span className="chart-badge">

                    {totalCities} cities

                </span>

            </div>


            <div className="sales-summary">

                <div className="sales-summary-item">

                    <span className="sales-summary-label">
                        Total Cities
                    </span>

                    <span className="sales-summary-value">

                        {totalCities.toLocaleString(
                            "en-IN"
                        )}

                    </span>

                </div>


                <div className="sales-summary-item">

                    <span className="sales-summary-label">
                        Total Revenue
                    </span>

                    <span className="sales-summary-value">

                        {formatIndianCompact(
                            totalRevenue
                        )}

                    </span>

                </div>


                <div className="sales-summary-item">

                    <span className="sales-summary-label">
                        Avg per City
                    </span>

                    <span className="sales-summary-value">

                        {formatIndianCompact(
                            averageRevenue
                        )}

                    </span>

                </div>


                <div className="sales-summary-item">

                    <span className="sales-summary-label">
                        Top City
                    </span>

                    <span className="sales-summary-value">

                        {topCity?.city || "N/A"}

                        {topShare &&
                            ` (${topShare}%)`}

                    </span>

                </div>

            </div>


            <div className="sales-controls">

                <div className="sales-filter-group">

                    {LIMIT_OPTIONS.map(
                        (opt) => (

                            <button
                                key={opt.label}
                                type="button"
                                className={`sales-filter-btn ${limit === opt.value
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setLimit(
                                        opt.value
                                    )
                                }
                            >

                                {opt.label}

                            </button>

                        )
                    )}

                </div>


                <button
                    type="button"
                    className="sales-sort-btn"
                    onClick={() =>
                        setSortAsc(
                            (prev) => !prev
                        )
                    }
                >

                    <ArrowUpDown size={11} />

                    {sortAsc
                        ? "Low to high"
                        : "High to low"}

                </button>

            </div>


            <div className="sales-top-callout">

                <Trophy size={12} />

                <span>

                    <strong>
                        {topCity?.city}
                    </strong>

                    {" "}leads with{" "}

                    <strong>

                        ₹{Number(
                            topCity?.revenue || 0
                        ).toLocaleString("en-IN")}

                    </strong>

                    {topShare &&
                        ` (${topShare}% of total)`}

                </span>

            </div>


            <div className="chart-area">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 8,
                            left: 0,
                            bottom: 8,
                        }}
                        onMouseMove={(state) => {

                            if (
                                state?.isTooltipActive
                            ) {

                                setActiveIndex(
                                    state.activeTooltipIndex
                                );

                            } else {

                                setActiveIndex(null);

                            }

                        }}
                        onMouseLeave={() =>
                            setActiveIndex(null)
                        }
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#EEF1F6"
                        />


                        <XAxis
                            dataKey="city"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#64748b",
                                fontSize: 10.5,
                            }}
                        />


                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#64748b",
                                fontSize: 10.5,
                            }}
                            tickFormatter={
                                formatIndianCompact
                            }
                            width={38}
                            domain={[
                                0,
                                (dataMax) =>
                                    Math.ceil(
                                        dataMax * 1.2
                                    ),
                            ]}
                        />


                        <Tooltip
                            cursor={{
                                fill: "#F1F5F9",
                            }}
                            content={
                                <SalesChartTooltip
                                    totalRevenue={
                                        totalRevenue
                                    }
                                />
                            }
                        />


                        <ReferenceLine
                            y={averageRevenue}
                            stroke="#94a3b8"
                            strokeDasharray="4 4"
                            label={{
                                value: "Average",
                                position:
                                    "insideTopRight",
                                fill: "#94a3b8",
                                fontSize: 10,
                            }}
                        />


                        <Bar
                            dataKey="sales"
                            radius={[
                                5,
                                5,
                                0,
                                0,
                            ]}
                            animationDuration={700}
                        >

                            {chartData.map(
                                (
                                    item,
                                    index
                                ) => (

                                    <Cell
                                        key={
                                            item.city
                                        }
                                        fill={
                                            item.fill
                                        }
                                        opacity={
                                            activeIndex ===
                                                null ||
                                                activeIndex ===
                                                index
                                                ? 1
                                                : 0.35
                                        }
                                    />

                                )
                            )}

                        </Bar>

                    </BarChart>

                </ResponsiveContainer>

            </div>


            <div className="sales-ranking">

                {rankingData.map(
                    (
                        item,
                        index
                    ) => {

                        const percentage =
                            totalRevenue > 0
                                ? (
                                    (
                                        (Number(
                                            item.revenue
                                        ) || 0) /
                                        totalRevenue
                                    ) * 100
                                ).toFixed(0)
                                : 0;


                        const badgeClass =
                            RANK_BADGE_CLASS[
                            index
                            ] ||
                            "rank-default";


                        return (

                            <div
                                key={item.city}
                                className="sales-rank-item"
                            >

                                <span
                                    className={`sales-rank-badge ${badgeClass}`}
                                >

                                    {index + 1}

                                </span>


                                <span className="sales-rank-name">

                                    {item.city}

                                </span>


                                <span className="sales-rank-revenue">

                                    ₹{Number(
                                        item.revenue || 0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}

                                </span>


                                <span className="sales-rank-percent">

                                    {percentage}%

                                </span>

                            </div>

                        );

                    }
                )}

            </div>

        </div>

    );
}


export default memo(SalesChart);