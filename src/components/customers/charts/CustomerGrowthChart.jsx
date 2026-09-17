import { memo } from "react";
import { Users, Crown } from "lucide-react";

import "./CustomerGrowthChart.css";

function CustomerGrowthChart({ data = [] }) {

    const customerMap = {};

    data.forEach((row) => {

        const customer =
            row.Customer ??
            row.CustomerName ??
            row.Client ??
            row.Buyer ??
            row.Name ??
            null;

        if (!customer) return;

        customerMap[customer] = (customerMap[customer] || 0) + 1;

    });

    const rankedData = Object.entries(customerMap)
        .map(([customer, orders]) => ({
            customer,
            orders,
        }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 7);

    const hasData = rankedData.length > 0;
    const topCustomer = hasData ? rankedData[0] : null;
    const totalOrders = rankedData.reduce((sum, entry) => sum + entry.orders, 0);
    const maxOrders = hasData ? rankedData[0].orders : 0;

    return (

        <div className="customer-growth-chart">

            <div className="chart-header">

                <div className="chart-header-text">
                    <p className="cgc-eyebrow">Customer Growth</p>
                    <h2 className="cgc-big-number">{totalOrders}</h2>
                    <p className="cgc-subtext">orders from top {rankedData.length || 0} customers</p>
                </div>

                {hasData && (
                    <div className="cgc-badge" title={topCustomer.customer}>
                        <Crown size={14} />
                        <div className="cgc-badge-text">
                            <span className="cgc-badge-label">Top Customer</span>
                            <span className="cgc-badge-name">{topCustomer.customer}</span>
                        </div>
                    </div>
                )}

            </div>

            {!hasData ? (

                <div className="cgc-empty-state">
                    <Users size={28} strokeWidth={1.5} />
                    <p>No customer data available yet</p>
                </div>

            ) : (

                <ul className="cgc-list">

                    {rankedData.map((entry, index) => {

                        const initial = entry.customer.charAt(0).toUpperCase();
                        const percent = maxOrders > 0 ? (entry.orders / maxOrders) * 100 : 0;
                        const isTop = index === 0;

                        return (

                            <li className="cgc-row" key={entry.customer}>

                                <span className="cgc-rank">{index + 1}</span>

                                <span className={`cgc-avatar ${isTop ? "cgc-avatar-top" : ""}`}>
                                    {isTop ? <Crown size={14} /> : initial}
                                </span>

                                <div className="cgc-row-main">

                                    <div className="cgc-row-top">
                                        <span className="cgc-name" title={entry.customer}>{entry.customer}</span>
                                        <span className="cgc-orders">
                                            {entry.orders} {entry.orders === 1 ? "order" : "orders"}
                                        </span>
                                    </div>

                                    <div className="cgc-track">
                                        <div
                                            className={`cgc-fill ${isTop ? "cgc-fill-top" : ""}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>

                                </div>

                            </li>

                        );

                    })}

                </ul>

            )}

        </div>

    );

}

export default memo(CustomerGrowthChart);