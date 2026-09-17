import { useMemo, useState, memo } from "react";

import "./ProductColumnChart.css";

import {
    Package,
    TrendingUp,
    ArrowUpDown,
} from "lucide-react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
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
    "#0A32B8",
    "#B7CBFF",
];

const OTHERS_COLOR = "#CBD5E1";

const BEST_COLOR = "#061E8C";

const RANK_BADGE_CLASS = [
    "rank-gold",
    "rank-silver",
    "rank-bronze",
];

const LIMIT_OPTIONS = [
    {
        label: "Top 5",
        value: 5,
    },
    {
        label: "Top 8",
        value: 8,
    },
    {
        label: "All",
        value: "all",
    },
];

const EMPTY_PRODUCT_SALES = [];


function getProductName(item) {

    return (
        item?.product ||
        item?.name ||
        "Unknown"
    );

}


function getProductValue(item) {

    return (
        Number(
            item?.count ??
            item?.value ??
            0
        ) || 0
    );

}


function buildChartData(
    productSales,
    limit,
    sortAsc
) {

    let entries = productSales.map(
        (item) => {

            const fullName =
                getProductName(item);

            return {
                name:
                    fullName.length > 12
                        ? `${fullName.substring(0, 12)}...`
                        : fullName,

                fullName,

                value:
                    getProductValue(item),
            };

        }
    );


    entries = [...entries].sort(
        (a, b) =>
            sortAsc
                ? a.value - b.value
                : b.value - a.value
    );


    if (limit === "all") {

        return entries;

    }


    const shown =
        entries.slice(
            0,
            limit
        );


    const othersTotal =
        entries
            .slice(limit)
            .reduce(
                (sum, item) =>
                    sum + item.value,
                0
            );


    if (othersTotal > 0) {

        shown.push({

            name: "Others",

            fullName: "Others",

            value: othersTotal,

        });

    }


    return shown;

}


/*
 * =====================================================
 * CUSTOM TOOLTIP
 * =====================================================
 *
 * Declared outside the chart component so React does
 * not create a new component during every render.
 */
function ProductChartTooltip({
    active,
    payload,
    totalOrders,
}) {

    if (
        !active ||
        !payload ||
        !payload.length
    ) {

        return null;

    }


    const item =
        payload[0]?.payload;


    if (!item) {

        return null;

    }


    const contribution =
        totalOrders > 0
            ? (
                (item.value /
                    totalOrders) *
                100
            ).toFixed(1)
            : "0.0";


    return (

        <div className="product-tooltip">

            <p className="product-tooltip-name">

                {item.fullName}

            </p>


            <p className="product-tooltip-orders">

                {(item.value || 0)
                    .toLocaleString("en-IN")}{" "}

                Orders

            </p>


            <p className="product-tooltip-contribution">

                {contribution}%

            </p>

        </div>

    );

}


function ProductColumnChart({
    analytics,
}) {

    const [
        limit,
        setLimit,
    ] = useState(8);


    const [
        sortAsc,
        setSortAsc,
    ] = useState(false);


    /*
     * Stable fallback.
     *
     * This prevents a new [] from being created
     * on every render and fixes exhaustive-deps.
     */
    const productSales =
        analytics?.productSales ??
        EMPTY_PRODUCT_SALES;


    // =====================================================
    // CHART DATA
    // =====================================================

    const chartData = useMemo(
        () =>
            buildChartData(
                productSales,
                limit,
                sortAsc
            ),
        [
            productSales,
            limit,
            sortAsc,
        ]
    );


    // =====================================================
    // TOTAL ORDERS
    // =====================================================

    const totalOrders = useMemo(
        () =>
            productSales.reduce(
                (sum, item) =>
                    sum +
                    getProductValue(item),
                0
            ),
        [productSales]
    );


    // =====================================================
    // PRODUCT COUNT
    // =====================================================

    const productCount =
        productSales.length;


    // =====================================================
    // AVERAGE ORDERS
    // =====================================================

    const averageOrders =
        useMemo(() => {

            if (!productCount) {

                return 0;

            }


            return Math.round(
                totalOrders /
                productCount
            );

        }, [
            totalOrders,
            productCount,
        ]);


    // =====================================================
    // SORTED DATA
    // =====================================================

    const sortedData =
        useMemo(
            () =>
                [...productSales].sort(
                    (a, b) =>
                        getProductValue(b) -
                        getProductValue(a)
                ),
            [productSales]
        );


    // =====================================================
    // TOP PRODUCT
    // =====================================================

    const topProduct =
        sortedData[0];


    const topProductValue =
        topProduct
            ? getProductValue(
                topProduct
            )
            : 0;


    const topShare =
        topProduct &&
            totalOrders
            ? (
                (topProductValue /
                    totalOrders) *
                100
            ).toFixed(1)
            : null;


    // =====================================================
    // RANKING DATA
    // =====================================================

    const rankingData =
        useMemo(
            () =>
                sortedData
                    .slice(0, 5)
                    .map((item) => ({
                        name:
                            getProductName(
                                item
                            ),

                        value:
                            getProductValue(
                                item
                            ),
                    })),
            [sortedData]
        );


    // =====================================================
    // EMPTY STATE
    // =====================================================

    if (!chartData.length) {

        return (

            <div className="product-column-chart">

                <div className="chart-header">

                    <div className="chart-title-group">

                        <div className="chart-icon">

                            <Package size={14} />

                        </div>


                        <div>

                            <h3>
                                Product Distribution
                            </h3>

                            <p>
                                Sales by Product
                            </p>

                        </div>

                    </div>

                </div>


                <div className="chart-empty">

                    <Package size={26} />

                    <p>
                        No product sales data available.
                    </p>

                    <span>
                        Upload data to view chart
                    </span>

                </div>

            </div>

        );

    }


    // =====================================================
    // MAIN RENDER
    // =====================================================

    return (

        <div className="product-column-chart">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="chart-header">

                <div className="chart-title-group">

                    <div className="chart-icon">

                        <Package size={14} />

                    </div>


                    <div>

                        <h3>
                            Product Distribution
                        </h3>

                        <p>
                            Sales by Product
                        </p>

                    </div>

                </div>


                <span className="chart-badge">

                    {productCount} Products

                </span>

            </div>


            {/* =================================================
                CONTROLS
            ================================================= */}

            <div className="chart-controls">

                <div className="chart-filter-group">

                    {LIMIT_OPTIONS.map(
                        (opt) => (

                            <button
                                key={opt.label}
                                type="button"
                                className={`chart-filter-btn ${limit ===
                                    opt.value
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
                    className="chart-sort-btn"
                    onClick={() =>
                        setSortAsc(
                            (prev) =>
                                !prev
                        )
                    }
                >

                    <ArrowUpDown size={11} />

                    {sortAsc
                        ? "Low to High"
                        : "High to Low"}

                </button>

            </div>


            {/* =================================================
                STATS
            ================================================= */}

            <div className="chart-stats">


                <div className="stat-box">

                    <span className="stat-label">

                        Total Products

                    </span>


                    <span className="stat-value">

                        {productCount.toLocaleString(
                            "en-IN"
                        )}

                    </span>

                </div>


                <div className="stat-box">

                    <span className="stat-label">

                        Total Orders

                    </span>


                    <span className="stat-value">

                        {totalOrders.toLocaleString(
                            "en-IN"
                        )}

                    </span>

                </div>


                <div className="stat-box">

                    <span className="stat-label">

                        Avg Orders

                    </span>


                    <span className="stat-value">

                        {averageOrders.toLocaleString(
                            "en-IN"
                        )}

                    </span>

                </div>


                <div className="stat-box stat-box-highlight">

                    <span className="stat-label">

                        Top Product

                    </span>


                    <span className="stat-value-text">

                        {topProduct
                            ? getProductName(
                                topProduct
                            )
                            : "N/A"}

                    </span>


                    {topShare && (

                        <div className="growth-badge">

                            <TrendingUp size={9} />

                            {topShare}% Share

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                BAR CHART
            ================================================= */}

            <ResponsiveContainer
                width="100%"
                height={190}
            >

                <BarChart
                    data={chartData}
                    margin={{
                        top: 12,
                        right: 8,
                        left: 0,
                        bottom: 48,
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                    />


                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={54}
                        tick={{
                            fontSize: 10.5,
                        }}
                    />


                    <YAxis
                        tick={{
                            fontSize: 10.5,
                        }}
                        width={34}
                    />


                    <Tooltip
                        content={
                            <ProductChartTooltip
                                totalOrders={
                                    totalOrders
                                }
                            />
                        }
                    />


                    <ReferenceLine
                        y={averageOrders}
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
                        dataKey="value"
                        radius={[
                            5,
                            5,
                            0,
                            0,
                        ]}
                    >

                        {chartData.map(
                            (
                                item,
                                index
                            ) => {

                                let fill =
                                    COLORS[
                                    index %
                                    COLORS.length
                                    ];


                                if (
                                    item.fullName ===
                                    "Others"
                                ) {

                                    fill =
                                        OTHERS_COLOR;

                                } else if (
                                    topProduct &&
                                    item.fullName ===
                                    getProductName(
                                        topProduct
                                    )
                                ) {

                                    fill =
                                        BEST_COLOR;

                                }


                                return (

                                    <Cell
                                        key={
                                            item.fullName
                                        }
                                        fill={
                                            fill
                                        }
                                    />

                                );

                            }
                        )}

                    </Bar>

                </BarChart>

            </ResponsiveContainer>


            {/* =================================================
                PRODUCT RANKING
            ================================================= */}

            <div className="product-ranking">

                {rankingData.map(
                    (
                        item,
                        index
                    ) => {

                        const percentage =
                            totalOrders > 0
                                ? (
                                    (item.value /
                                        totalOrders) *
                                    100
                                ).toFixed(0)
                                : 0;


                        const badgeClass =
                            RANK_BADGE_CLASS[
                            index
                            ] ||
                            "rank-default";


                        return (

                            <div
                                key={
                                    item.name
                                }
                                className="product-rank-item"
                            >

                                <span
                                    className={`product-rank-badge ${badgeClass}`}
                                >

                                    {index + 1}

                                </span>


                                <span className="product-rank-name">

                                    {item.name}

                                </span>


                                <span className="product-rank-orders">

                                    {(item.value || 0)
                                        .toLocaleString(
                                            "en-IN"
                                        )}{" "}

                                    Orders

                                </span>


                                <span className="product-rank-percent">

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


export default memo(
    ProductColumnChart
);