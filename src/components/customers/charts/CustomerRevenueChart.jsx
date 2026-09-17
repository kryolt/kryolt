import { memo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import { IndianRupee, Crown } from "lucide-react";

import "./CustomerRevenueChart.css";

function formatCurrency(value) {
    return `₹${Number(value).toLocaleString("en-IN")}`;
}

function formatCompact(value) {
    return `₹${Intl.NumberFormat("en-IN", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value)}`;
}

function truncateName(name, max = 10) {
    return name.length > max ? `${name.slice(0, max)}…` : name;
}

function CustomTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;

    const { customer, revenue } = payload[0].payload;

    return (
        <div className="crc-tooltip">
            <p className="crc-tooltip-name">{customer}</p>
            <p className="crc-tooltip-value">{formatCurrency(revenue)}</p>
        </div>
    );
}

function CustomerRevenueChart({ data = [] }) {

    const customerRevenue = {};

    data.forEach((row) => {

        const customer =
            row.Customer ??
            row.CustomerName ??
            row.Client ??
            row.Buyer ??
            row.Name ??
            null;

        if (!customer) return;

        const revenue = Number(
            row.Amount ??
            row.Total ??
            row.Sales ??
            row.Revenue ??
            0
        );

        customerRevenue[customer] =
            (customerRevenue[customer] || 0) + revenue;

    });

    const chartData = Object.entries(customerRevenue)
        .map(([customer, revenue]) => ({
            customer,
            customerLabel: truncateName(customer),
            revenue,
        }))
        .filter((entry) => entry.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 7);

    const hasData = chartData.length > 0;
    const topCustomer = hasData ? chartData[0] : null;
    const totalRevenue = chartData.reduce((sum, entry) => sum + entry.revenue, 0);

    return (

        <div className="customer-revenue-chart">

            <div className="chart-header">

                <div className="chart-header-text">
                    <p className="crc-eyebrow">Customer Revenue</p>
                    {hasData ? (
                        <h2 className="crc-big-number">{formatCurrency(totalRevenue)}</h2>
                    ) : (
                        <h2 className="crc-big-number">₹0</h2>
                    )}
                    <p className="crc-subtext">from top {chartData.length || 0} customers</p>
                </div>

                {hasData && (
                    <div className="crc-badge" title={topCustomer.customer}>
                        <Crown size={14} />
                        <div className="crc-badge-text">
                            <span className="crc-badge-label">Top Customer</span>
                            <span className="crc-badge-name">{topCustomer.customer}</span>
                        </div>
                    </div>
                )}

            </div>

            {!hasData ? (

                <div className="crc-empty-state">
                    <IndianRupee size={28} strokeWidth={1.5} />
                    <p>No revenue data available yet</p>
                </div>

            ) : (

                <ResponsiveContainer width="100%" height={260}>

                    <BarChart
                        data={chartData}
                        margin={{ top: 8, right: 4, bottom: 4, left: 4 }}
                        barCategoryGap="28%"
                    >

                        <defs>
                            <linearGradient id="crcGradientTop" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2E5CE8" stopOpacity={1} />
                                <stop offset="100%" stopColor="#2E5CE8" stopOpacity={0.5} />
                            </linearGradient>
                            <linearGradient id="crcGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8AA6F0" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#8AA6F0" stopOpacity={0.35} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="#EEF1F8"
                        />

                        <XAxis
                            dataKey="customerLabel"
                            tick={{ fontSize: 12, fill: "#94A3B8" }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            tickFormatter={formatCompact}
                            tick={{ fontSize: 11, fill: "#94A3B8" }}
                            axisLine={false}
                            tickLine={false}
                            width={48}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "rgba(46, 92, 232, 0.04)" }}
                        />

                        <Bar
                            dataKey="revenue"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={44}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={entry.customer}
                                    fill={index === 0 ? "url(#crcGradientTop)" : "url(#crcGradient)"}
                                />
                            ))}
                        </Bar>

                    </BarChart>

                </ResponsiveContainer>

            )}

        </div>

    );

}

export default memo(CustomerRevenueChart);