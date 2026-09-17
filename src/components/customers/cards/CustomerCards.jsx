import "./CustomerCards.css";

import {
    Users,
    UserCheck,
    Wallet,
    RefreshCcw,
} from "lucide-react";

function CustomerCards({
    totalCustomers = 0,
    repeatCustomers = 0,
    averagePurchase = 0,
    retentionRate = 0,
}) {

    const cards = [
        {
            title: "Total Customers",
            value: totalCustomers,
            subtitle: "Unique customers",
            icon: <Users size={22} />,
        },
        {
            title: "Repeat Customers",
            value: repeatCustomers,
            subtitle: "Purchased more than once",
            icon: <UserCheck size={22} />,
        },
        {
            title: "Average Purchase",
            value: `₹${Number(averagePurchase).toLocaleString("en-IN")}`,
            subtitle: "Average order value",
            icon: <Wallet size={22} />,
        },
        {
            title: "Retention Rate",
            value: `${retentionRate}%`,
            subtitle: "Customer retention",
            icon: <RefreshCcw size={22} />,
        },
    ];

    return (
        <section className="customer-cards">

            {cards.map((card) => (

                <div
                    key={card.title}
                    className="customer-card"
                >

                    <div className="customer-card-icon">
                        {card.icon}
                    </div>

                    <span>{card.title}</span>

                    <h2>{card.value}</h2>

                    <p>{card.subtitle}</p>

                </div>

            ))}

        </section>
    );
}

export default CustomerCards;