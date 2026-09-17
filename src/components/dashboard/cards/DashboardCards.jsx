import { useMemo } from "react";
import "./DashboardCards.css";

import {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    TrendingUp,
    TrendingDown,
    Star,
    BarChart3,
    ShieldCheck,
    Percent,
    MapPin,
    CreditCard
} from "lucide-react";

function DashboardCards({ analytics }) {

    const formatTrend = (value) =>
        value === null || value === undefined
            ? null
            : `${value > 0 ? "+" : ""}${value}%`;

    const cards = useMemo(() => {

        const revenue = analytics?.totalRevenue || 0;
        const orders = analytics?.totalOrders || 0;
        const customers = analytics?.totalCustomers || 0;
        const avgOrderValue = analytics?.averageOrderValue || 0;

        const topProduct = analytics?.topProduct || "N/A";
        const topProductCount = analytics?.topProductCount || 0;

        const topCustomer = analytics?.topCustomer || "N/A";
        const topCustomerSpend = analytics?.topCustomerSpend || 0;

        const topCity = analytics?.topCity || "N/A";
        const bestPayment = analytics?.bestPayment || "N/A";

        const highestSale = analytics?.highestSale || 0;
        const businessHealth = analytics?.businessHealth ?? 0;

        const revenueGrowth = analytics?.revenueGrowth;
        const ordersGrowth = analytics?.ordersGrowth;

        const totalProfit = analytics?.financial?.totalProfit || 0;
        const grossProfitMargin = analytics?.financial?.grossProfitMargin || 0;

        const hasCustomers = analytics?.customerAnalytics?.available;
        const hasProfit = analytics?.financial?.totalProfit > 0;
        const hasProduct = analytics?.productAnalytics?.available;
        const hasCity = analytics?.cityAnalytics?.available;
        const hasPayment = analytics?.paymentAnalytics?.available;

        return [
            {
                title: "Revenue",
                value: `₹${revenue.toLocaleString("en-IN")}`,
                icon: <DollarSign size={20} />,
                trend: formatTrend(revenueGrowth),
                trendUp: (revenueGrowth ?? 0) >= 0,
                subtitle: revenueGrowth === null ? "Total revenue" : "vs last month"
            },
            {
                title: "Orders",
                value: orders.toLocaleString("en-IN"),
                icon: <ShoppingCart size={20} />,
                trend: formatTrend(ordersGrowth),
                trendUp: (ordersGrowth ?? 0) >= 0,
                subtitle: ordersGrowth === null ? "Completed" : "vs last month"
            },
            hasCustomers && {
                title: "Customers",
                value: customers.toLocaleString("en-IN"),
                icon: <Users size={20} />,
                trend: null,
                trendUp: true,
                subtitle: "Unique buyers"
            },
            {
                title: "Avg order value",
                value: `₹${Math.round(avgOrderValue).toLocaleString("en-IN")}`,
                icon: <BarChart3 size={20} />,
                trend: null,
                trendUp: true,
                subtitle: "Per order"
            },
            hasProfit && {
                title: "Profit",
                value: `₹${totalProfit.toLocaleString("en-IN")}`,
                icon: <TrendingUp size={20} />,
                trend: null,
                trendUp: true,
                subtitle: "Total profit"
            },
            hasProfit && {
                title: "Profit margin",
                value: `${grossProfitMargin}%`,
                icon: <Percent size={20} />,
                trend: null,
                trendUp: true,
                subtitle: "Gross margin"
            },
            hasProduct && {
                title: "Top product",
                value: topProduct,
                icon: <Package size={20} />,
                trend: null,
                trendUp: true,
                subtitle: `${topProductCount} sold`
            },
            hasCustomers && {
                title: "Top customer",
                value: topCustomer,
                icon: <Star size={20} />,
                trend: null,
                trendUp: true,
                subtitle: `₹${topCustomerSpend.toLocaleString("en-IN")} spent`
            },
            hasCity && {
                title: "Top city",
                value: topCity,
                icon: <MapPin size={20} />,
                trend: null,
                trendUp: true,
                subtitle: "Leading location"
            },
            hasPayment && {
                title: "Best payment",
                value: bestPayment,
                icon: <CreditCard size={20} />,
                trend: null,
                trendUp: true,
                subtitle: "Most used method"
            },
            {
                title: "Highest sale",
                value: `₹${highestSale.toLocaleString("en-IN")}`,
                icon: <TrendingUp size={20} />,
                trend: null,
                trendUp: true,
                subtitle: "Single largest order"
            },
            {
                title: "Business health",
                value: `${businessHealth}%`,
                icon: <ShieldCheck size={20} />,
                trend: null,
                trendUp: true,
                subtitle:
                    businessHealth >= 90 ? "Excellent" :
                        businessHealth >= 80 ? "Good" :
                            businessHealth >= 70 ? "Fair" : "Needs attention"
            }
        ].filter(Boolean);
    }, [analytics]);

    return (
        <div className="dashboard-cards">
            {cards.map((card, index) => (
                <div key={index} className="dashboard-card">

                    <div className="card-top">
                        <div className="card-icon">{card.icon}</div>

                        {card.trend && (
                            <div className={`trend-pill ${card.trendUp ? "trend-up" : "trend-down"}`}>
                                {card.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span>{card.trend}</span>
                            </div>
                        )}
                    </div>

                    <div className="card-content">
                        <span className="card-title">{card.title}</span>
                        <h2 title={card.value}>{card.value}</h2>
                        <small className="card-subtitle">{card.subtitle}</small>
                    </div>

                </div>
            ))}
        </div>
    );
}

export default DashboardCards;