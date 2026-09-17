import { memo } from "react";
import {
    Crown,
    Medal,
    Trophy,
    Users,
} from "lucide-react";

import "./TopCustomers.css";

function formatCurrency(value) {
    return `₹${Number(value).toLocaleString("en-IN")}`;
}

function getRankVisual(index) {

    if (index === 0) return { icon: <Crown size={15} />, className: "rank-gold" };

    if (index === 1) return { icon: <Trophy size={15} />, className: "rank-silver" };

    if (index === 2) return { icon: <Medal size={15} />, className: "rank-bronze" };

    return { icon: <span>{index + 1}</span>, className: "rank-default" };

}

function TopCustomers({ csvData = [] }) {

    const customerMap = {};

    csvData.forEach((row) => {

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

        if (!customerMap[customer]) {

            customerMap[customer] = {

                customer,

                orders: 0,

                revenue: 0,

            };

        }

        customerMap[customer].orders++;

        customerMap[customer].revenue += revenue;

    });

    const customers = Object.values(customerMap)
        .filter((entry) => entry.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

    const hasData = customers.length > 0;
    const totalRevenue = customers.reduce((sum, entry) => sum + entry.revenue, 0);
    const maxRevenue = hasData ? customers[0].revenue : 0;

    return (

        <div className="top-customers">

            <div className="top-header">

                <div>
                    <p className="tc-eyebrow">Top Customers</p>
                    <h2 className="tc-big-number">
                        {hasData ? formatCurrency(totalRevenue) : "₹0"}
                    </h2>
                    <p className="tc-subtext">
                        from top {customers.length || 0} customers
                    </p>
                </div>

            </div>

            {!hasData ? (

                <div className="tc-empty-state">
                    <Users size={28} strokeWidth={1.5} />
                    <p>No customer data available yet</p>
                </div>

            ) : (

                <div className="top-list">

                    {customers.map((item, index) => {

                        const { icon, className } = getRankVisual(index);
                        const percent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                        return (

                            <div
                                key={item.customer}
                                className="top-item"
                            >

                                <div className={`rank ${className}`}>
                                    {icon}
                                </div>

                                <div className="customer-info">

                                    <div className="customer-info-top">
                                        <h4 title={item.customer}>{item.customer}</h4>
                                        <div className="customer-revenue">
                                            {formatCurrency(item.revenue)}
                                        </div>
                                    </div>

                                    <div className="customer-info-bottom">
                                        <span>
                                            {item.orders} {item.orders === 1 ? "Order" : "Orders"}
                                        </span>
                                    </div>

                                    <div className="tc-track">
                                        <div
                                            className={`tc-fill ${index === 0 ? "tc-fill-top" : ""}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}

export default memo(TopCustomers);