import "./CustomerInsights.css";

import {
    Crown,
    Wallet,
    TrendingUp,
    Sparkles,
} from "lucide-react";

function CustomerInsights({ analytics }) {

    const cards = [

        {
            title: "Best Customer",
            value: analytics.topCustomer || "N/A",
            icon: <Crown size={20} />,
        },

        {
            title: "Highest Spending",
            value: `₹${Number(
                analytics.topCustomerSpend || 0
            ).toLocaleString("en-IN")}`,
            icon: <Wallet size={20} />,
        },

        {
            title: "Total Revenue",
            value: `₹${Number(
                analytics.totalRevenue || 0
            ).toLocaleString("en-IN")}`,
            icon: <TrendingUp size={20} />,
        },

        {
            title: "Top Product",
            value: analytics.topProduct || "N/A",
            icon: <Sparkles size={20} />,
        },

    ];

    return (

        <section className="customer-insights">

            <div className="customer-insights-header">

                <h2>Customer Insights</h2>

                <p>
                    Business intelligence generated from your uploaded data.
                </p>

            </div>

            <div className="customer-insights-grid">

                {cards.map((card) => (

                    <div
                        key={card.title}
                        className="insight-card"
                    >

                        <div className="insight-icon">
                            {card.icon}
                        </div>

                        <span>{card.title}</span>

                        <h3>{card.value}</h3>

                    </div>

                ))}

            </div>

        </section>

    );

}

export default CustomerInsights;