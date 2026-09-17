import "./BusinessSummary.css";

import {
    Brain,
} from "lucide-react";

import { useDashboardDataContext } from "../../../context/DashboardDataContext";


function healthTone(score = 0) {

    if (score >= 90)
        return { color: "#0E9F6E", label: "Excellent" };

    if (score >= 75)
        return { color: "#E08A1D", label: "Good" };

    if (score >= 50)
        return { color: "#F59E0B", label: "Fair" };

    return { color: "#E5484D", label: "Poor" };
}



function ScoreRing({ score = 0 }) {

    const radius = 30;

    const circumference = 2 * Math.PI * radius;

    const safeScore = Math.min(
        Math.max(score, 0),
        100
    );

    const offset =
        circumference -
        (safeScore / 100) * circumference;


    const tone = healthTone(safeScore);


    return (
        <div
            className="score-ring"
            style={{
                "--ring-color": tone.color
            }}
        >

            <svg viewBox="0 0 72 72">

                <circle
                    className="score-ring-track"
                    cx="36"
                    cy="36"
                    r={radius}
                />

                <circle
                    className="score-ring-fill"
                    cx="36"
                    cy="36"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />

            </svg>


            <div className="score-ring-label">

                <strong>
                    {safeScore}
                </strong>

                <span>
                    /100
                </span>

            </div>

        </div>
    );
}




function buildExecutiveSummary({
    totalRevenue,
    totalOrders,
    averageOrderValue,
    topProduct,
    topCity,
    bestPayment,
    businessHealth
}) {

    const sentences = [];


    if (totalRevenue > 0 && totalOrders > 0) {

        sentences.push(
            `Revenue reached ₹${totalRevenue.toLocaleString("en-IN")} from ${totalOrders} completed orders.`
        );

    }


    if (averageOrderValue > 0) {

        sentences.push(
            `Average order value stands at ₹${averageOrderValue.toFixed(0)}.`
        );

    }


    if (bestPayment && bestPayment !== "N/A") {

        sentences.push(
            `${bestPayment} is the preferred payment method among customers.`
        );

    }


    if (topProduct && topProduct !== "N/A") {

        sentences.push(
            `${topProduct} contributes the highest revenue among all products.`
        );

    }


    if (topCity && topCity !== "N/A") {

        sentences.push(
            `${topCity} is currently the strongest market.`
        );

    }


    if (businessHealth > 0) {

        sentences.push(
            `Overall business health is rated as ${healthTone(businessHealth).label.toLowerCase()}.`
        );

    }


    if (sentences.length === 0) {

        return "Upload transaction data to generate an AI-powered executive summary of your business.";

    }


    return sentences.join(" ");

}




function buildInsights({
    topProduct,
    topProductShare,
    topCity,
    topCityShare,
    bestPayment,
    bestPaymentShare,
    ordersPerCustomer,
    businessHealth
}) {


    const insights = [];


    if (businessHealth >= 75) {

        insights.push({
            icon: "📈",
            text: "Business performance is trending in a healthy direction."
        });

    }


    if (topProduct && topProduct !== "N/A") {

        insights.push({
            icon: "📦",
            text: topProductShare
                ? `${topProduct} contributes ${topProductShare}% of total sales.`
                : `${topProduct} is your best-selling product.`
        });

    }


    if (bestPayment && bestPayment !== "N/A") {

        insights.push({
            icon: "💳",
            text: bestPaymentShare
                ? `${bestPayment} accounts for ${bestPaymentShare}% of transactions.`
                : `${bestPayment} is the most used payment method.`
        });

    }


    if (topCity && topCity !== "N/A") {

        insights.push({
            icon: "🏙",
            text: topCityShare
                ? `${topCity} generates ${topCityShare}% of overall revenue.`
                : `${topCity} generates the highest revenue among all cities.`
        });

    }


    if (ordersPerCustomer >= 1.5) {

        insights.push({
            icon: "👥",
            text: "Customer retention remains healthy, with repeat orders on the rise."
        });

    }


    return insights;

}




function buildRecommendations({
    topProduct,
    topCity,
    bestPayment,
    ordersPerCustomer,
    businessHealth
}) {


    const items = [];


    if (
        topProduct &&
        topProduct !== "N/A"
    ) {

        items.push(
            `Increase inventory for ${topProduct}, your top-selling product.`
        );

    }



    if (
        topCity &&
        topCity !== "N/A"
    ) {

        items.push(
            `Launch targeted marketing campaigns in ${topCity}, your strongest market.`
        );

    }



    if (
        bestPayment &&
        bestPayment !== "N/A"
    ) {

        items.push(
            `Encourage digital payments through ${bestPayment} with added incentives.`
        );

    }



    if (
        ordersPerCustomer > 0 &&
        ordersPerCustomer < 1.5
    ) {

        items.push(
            "Most customers order only once — a loyalty or repeat-purchase campaign could help."
        );

    }



    if (
        businessHealth > 0 &&
        businessHealth < 75
    ) {

        items.push(
            "Increase average order value through bundles or upsell offers to improve overall health."
        );

    }



    if (items.length === 0) {

        items.push(
            "Upload more transaction data for tailored AI recommendations."
        );

    }


    return items;

}





function BusinessSummary() {

    const { analytics } = useDashboardDataContext();


    const totalRevenue =
        analytics.totalRevenue ?? 0;


    const totalOrders =
        analytics.totalOrders ?? 0;


    const totalCustomers =
        analytics.totalCustomers ?? 0;


    const averageOrderValue =
        analytics.averageOrderValue ?? 0;


    const businessHealth =
        analytics.businessHealth ?? 0;


    const topProduct =
        analytics.topProduct ?? "N/A";


    const citySales =
        analytics.citySales ?? [];


    const topCity =
        citySales.length
            ? citySales[0].city
            : "N/A";


    const totalCitySales =
        citySales.reduce(
            (sum, c) => sum + (c.total ?? c.sales ?? c.value ?? 0),
            0
        );


    const topCityShare =
        citySales.length && totalCitySales > 0
            ? (
                ((citySales[0].total ?? citySales[0].sales ?? citySales[0].value ?? 0) /
                    totalCitySales) *
                100
            ).toFixed(0)
            : null;


    const paymentEntries =
        Object.entries(
            analytics.paymentMethods ?? {}
        );


    const totalPayments =
        paymentEntries.reduce(
            (sum, [, count]) => sum + count,
            0
        );


    const sortedPayments =
        paymentEntries.sort(
            (a, b) => b[1] - a[1]
        );


    const bestPayment =
        sortedPayments[0]?.[0] || "N/A";


    const bestPaymentShare =
        sortedPayments.length && totalPayments > 0
            ? ((sortedPayments[0][1] / totalPayments) * 100).toFixed(0)
            : null;


    const topProductShare =
        analytics.topProductRevenue && totalRevenue > 0
            ? ((analytics.topProductRevenue / totalRevenue) * 100).toFixed(0)
            : null;


    const ordersPerCustomer =
        totalCustomers > 0
            ? totalOrders / totalCustomers
            : 0;


    const tone =
        healthTone(businessHealth);


    const executiveSummary =
        buildExecutiveSummary({
            totalRevenue,
            totalOrders,
            averageOrderValue,
            topProduct,
            topCity,
            bestPayment,
            businessHealth
        });


    const insights =
        buildInsights({
            topProduct,
            topProductShare,
            topCity,
            topCityShare,
            bestPayment,
            bestPaymentShare,
            ordersPerCustomer,
            businessHealth
        });


    const recommendations =
        buildRecommendations({
            topProduct,
            topCity,
            bestPayment,
            ordersPerCustomer,
            businessHealth
        });




    return (

        <div className="business-summary">


            <div className="summary-header">


                <div className="summary-title">

                    <div className="title-icon">

                        <Brain size={20} />

                    </div>


                    <div>

                        <h2>
                            AI Executive Report
                        </h2>


                        <p>
                            Automatically generated from your business data
                        </p>

                    </div>

                </div>




                <div className="health-block">


                    <ScoreRing
                        score={businessHealth}
                    />


                    <span
                        className="health-tag"
                        style={{
                            color: tone.color,
                            background: `${tone.color}1A`
                        }}
                    >

                        {tone.label}

                    </span>


                </div>


            </div>




            <div className="summary-report">


                <section className="report-section">

                    <h3>
                        Executive Summary
                    </h3>

                    <p className="summary-text">
                        {executiveSummary}
                    </p>

                </section>




                {
                    insights.length > 0 && (

                        <section className="report-section">

                            <h3>
                                Key Insights
                            </h3>

                            <ul className="insight-list">

                                {
                                    insights.map(
                                        (item, i) => (

                                            <li
                                                key={i}
                                                className="insight-item"
                                            >

                                                <span className="insight-icon">
                                                    {item.icon}
                                                </span>

                                                <span>
                                                    {item.text}
                                                </span>

                                            </li>

                                        )
                                    )
                                }

                            </ul>

                        </section>

                    )
                }




                <section className="report-section recommendation">

                    <h3>
                        AI Recommendations
                    </h3>

                    <ul>

                        {
                            recommendations.map(
                                (text, i) => (

                                    <li key={i}>
                                        {text}
                                    </li>

                                )
                            )
                        }

                    </ul>

                </section>


            </div>


        </div>

    );

}


export default BusinessSummary;