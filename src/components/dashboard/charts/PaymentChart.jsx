import { useMemo, useCallback, memo } from "react";
import "./PaymentChart.css";

import { CreditCard } from "lucide-react";

import {
    PieChart,
    Pie,
    Cell,
    Sector,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

const COLORS = [
    "#0D46F5",
    "#3B78F3",
    "#6C93F5",
    "#061E8C",
    "#9DB8FF",
    "#1D4ED8",
];

const OTHERS_COLOR = "#CBD5E1";

const RANK_BADGE_CLASS = ["rank-gold", "rank-silver", "rank-bronze"];

function renderActiveShape(props) {

    const {
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
    } = props;

    return (

        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 6}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />

    );

}

function PaymentChart({ analytics }) {

    const rawData = useMemo(() => {

        return Object.entries(
            analytics?.paymentMethods || {}
        )
            .map(([name, value]) => ({
                name,
                value: value || 0,
            }))
            .sort((a, b) => b.value - a.value);

    }, [analytics]);

    const totalTransactions = useMemo(() => {

        return rawData.reduce(
            (sum, item) => sum + item.value,
            0
        );

    }, [rawData]);

    const chartData = useMemo(() => {

        if (!rawData.length || !totalTransactions) {
            return [];
        }

        const threshold = totalTransactions * 0.03;

        const main = [];
        let othersTotal = 0;

        rawData.forEach((item) => {

            if (item.value < threshold) {
                othersTotal += item.value;
            } else {
                main.push(item);
            }

        });

        const grouped = [...main];

        if (othersTotal > 0) {
            grouped.push({
                name: "Others",
                value: othersTotal,
            });
        }

        return grouped.sort((a, b) => b.value - a.value);

    }, [rawData, totalTransactions]);

    const sortedData = chartData;

    const topPayment = useMemo(() => {

        return rawData.length ? rawData[0].name : "N/A";

    }, [rawData]);

    const topPercentage = useMemo(() => {

        if (!rawData.length || !totalTransactions) {
            return 0;
        }

        return (
            (rawData[0].value / totalTransactions) *
            100
        );

    }, [rawData, totalTransactions]);

    const topIndex = useMemo(() => {

        return chartData.findIndex(
            (item) => item.name === topPayment
        );

    }, [chartData, topPayment]);

    const colorForEntry = (entry, index) => {

        if (entry.name === "Others") {
            return OTHERS_COLOR;
        }

        return COLORS[index % COLORS.length];

    };

    const tooltipFormatter = useCallback((value, name) => [

        `${value} Orders (${(
            (value / (totalTransactions || 1)) *
            100
        ).toFixed(1)}%)`,

        name,

    ], [totalTransactions]);

    if (!chartData.length) {

        return (

            <div className="chart-card">

                <div className="chart-header">

                    <div className="chart-title-group">

                        <div className="chart-icon">
                            <CreditCard size={14} />
                        </div>

                        <div>
                            <h2>Payment Methods</h2>
                            <p>Transactions by payment type</p>
                        </div>

                    </div>

                </div>

                <div className="chart-empty">
                    <p>No payment method data available.</p>
                </div>

            </div>

        );

    }

    return (

        <div className="chart-card">

            <div className="chart-header">

                <div className="chart-title-group">

                    <div className="chart-icon">
                        <CreditCard size={14} />
                    </div>

                    <div>
                        <h2>Payment Methods</h2>
                        <p>Transactions by payment type</p>
                    </div>

                </div>

                <span className="chart-badge">

                    {rawData.length}

                    {" "}

                    {rawData.length === 1
                        ? "method"
                        : "methods"}

                </span>

            </div>

            <div className="payment-summary">

                <div className="payment-summary-item">
                    <span className="payment-summary-label">
                        Total Transactions
                    </span>
                    <span className="payment-summary-value">
                        {totalTransactions.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="payment-summary-item">
                    <span className="payment-summary-label">
                        Top Method
                    </span>
                    <span className="payment-summary-value">
                        {topPayment}
                    </span>
                </div>

                <div className="payment-summary-item">
                    <span className="payment-summary-label">
                        Top Method %
                    </span>
                    <span className="payment-summary-value">
                        {topPercentage.toFixed(1)}%
                    </span>
                </div>

                <div className="payment-summary-item">
                    <span className="payment-summary-label">
                        Payment Methods
                    </span>
                    <span className="payment-summary-value">
                        {rawData.length}
                    </span>
                </div>

            </div>

            <div className="payment-content">

                <div className="pie-wrapper">

                    <ResponsiveContainer
                        width="100%"
                        height={210}
                    >

                        <PieChart>

                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={78}
                                innerRadius={50}
                                paddingAngle={3}
                                activeIndex={
                                    topIndex >= 0
                                        ? [topIndex]
                                        : []
                                }
                                activeShape={renderActiveShape}
                            >

                                {chartData.map((entry, index) => (

                                    <Cell
                                        key={entry.name}
                                        fill={colorForEntry(
                                            entry,
                                            index
                                        )}
                                    />

                                ))}

                            </Pie>

                            <Tooltip

                                contentStyle={{

                                    borderRadius: 9,

                                    border:
                                        "1px solid #e5e7eb",

                                    boxShadow:
                                        "0 8px 24px rgba(15,23,42,.08)",

                                    fontSize: 11,

                                }}

                                formatter={tooltipFormatter}

                            />

                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                iconSize={7}
                                wrapperStyle={{
                                    fontSize: 10,
                                    color: "#475569",
                                }}
                            />

                        </PieChart>

                    </ResponsiveContainer>

                    <div className="pie-total">

                        <h3>

                            {totalTransactions.toLocaleString(
                                "en-IN"
                            )}

                        </h3>

                        <p>Total Orders</p>

                    </div>

                </div>

                <div className="payment-ranking">

                    {sortedData.map((item, index) => {

                        const percentage =
                            totalTransactions > 0
                                ? (
                                    (item.value /
                                        totalTransactions) *
                                    100
                                ).toFixed(0)
                                : 0;

                        const badgeClass = RANK_BADGE_CLASS[index] || "rank-default";

                        return (

                            <div
                                key={item.name}
                                className="payment-rank-item"
                            >

                                <span className={`payment-rank-badge ${badgeClass}`}>
                                    {index + 1}
                                </span>

                                <span className="payment-rank-name">
                                    {item.name}
                                </span>

                                <span className="payment-rank-orders">
                                    {item.value.toLocaleString("en-IN")} Orders
                                </span>

                                <span className="payment-rank-percent">
                                    {percentage}%
                                </span>

                            </div>

                        );

                    })}

                </div>

            </div>

        </div>

    );

}

export default memo(PaymentChart);