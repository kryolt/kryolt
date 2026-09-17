import { lazy, Suspense } from "react";

import "./CustomerPage.css";

import CustomerHero from "./hero/CustomerHero";
import CustomerCards from "./cards/CustomerCards";
import CustomerInsights from "./insights/CustomerInsights";
import TopCustomers from "./table/TopCustomers";
import DataTable from "../dashboard/table/DataTable";

import { useDashboardDataContext } from "../../context/DashboardDataContext";

const CustomerGrowthChart = lazy(
    () => import("./charts/CustomerGrowthChart")
);

const CustomerRevenueChart = lazy(
    () => import("./charts/CustomerRevenueChart")
);

function CustomerPage() {
    const { data = [], analytics } = useDashboardDataContext();

    const orderCountByCustomer = data.reduce((acc, row) => {
        const name =
            row.Customer ??
            row.CustomerName ??
            row.Client ??
            row.Buyer ??
            row.Name ??
            "Unknown";

        acc[name] = (acc[name] || 0) + 1;

        return acc;
    }, {});

    const repeatCustomers = Object.values(orderCountByCustomer)
        .filter((count) => count > 1).length;

    const retentionRate =
        analytics.totalCustomers > 0
            ? Math.round(
                (repeatCustomers / analytics.totalCustomers) * 100
            )
            : 0;

    return (
        <div className="customers-page">
            <CustomerHero
                totalCustomers={analytics.totalCustomers}
            />

            <CustomerCards
                totalCustomers={analytics.totalCustomers}
                repeatCustomers={repeatCustomers}
                averagePurchase={analytics.averageOrderValue}
                retentionRate={retentionRate}
            />

            <CustomerInsights
                analytics={analytics}
            />

            <section className="customer-chart-grid">
                <Suspense
                    fallback={
                        <div
                            style={{ minHeight: 260 }}
                            aria-label="Loading customer charts"
                        />
                    }
                >
                    <CustomerGrowthChart
                        data={data}
                        analytics={analytics}
                    />

                    <CustomerRevenueChart
                        data={data}
                        analytics={analytics}
                    />
                </Suspense>
            </section>

            <TopCustomers
                csvData={data}
            />

            <DataTable
                csvData={data}
            />
        </div>
    );
}

export default CustomerPage;