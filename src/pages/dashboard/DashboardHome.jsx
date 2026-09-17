import { lazy, Suspense } from "react";
import "./DashboardHome.css";

import { Link } from "react-router-dom";

import HeroBanner from "../../components/dashboard/hero/HeroBanner";
import DashboardCards from "../../components/dashboard/cards/DashboardCards";
import BusinessSummary from "../../components/dashboard/analytics/BusinessSummary";
import KPIAnalytics from "../../components/dashboard/analytics/KPIAnalytics";
import RecentTransaction from "../../components/dashboard/table/RecentTransaction";
import ExecutiveWidgets from "../../components/dashboard/cards/ExecutiveWidgets";
import DateFilter from "../../components/dashboard/filters/DateFilter";

import { useDashboardDataContext } from "../../context/DashboardDataContext";

const MonthlySalesChart = lazy(
    () => import("../../components/dashboard/charts/MonthlySalesChart")
);

const SalesChart = lazy(
    () => import("../../components/dashboard/charts/SalesChart")
);

const PaymentChart = lazy(
    () => import("../../components/dashboard/charts/PaymentChart")
);

const ProductColumnChart = lazy(
    () => import("../../components/dashboard/charts/ProductColumnChart")
);

function DashboardHome() {
    const {
        analytics,
        loading,
        hasDataset,

        dateFilter,
        setDateFilter,
        setCustomDateRange,

        filterHasNoData,
        filterLoading,
        error,
    } = useDashboardDataContext();

    // --------------------------------------------------
    // INITIAL DASHBOARD LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-loading-card">
                    <div className="dashboard-loading-spinner" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // NO DATA / NEW USER STATE
    // --------------------------------------------------

    if (!hasDataset) {
        return (
            <div className="dashboard-home">
                <div className="dashboard-empty">
                    <div className="dashboard-empty-icon">
                        <span>↑</span>
                    </div>

                    <h2>No Business Data Found</h2>

                    <p>
                        Upload a CSV or Excel file to
                        generate your dashboard.
                    </p>

                    <Link
                        to="/dashboard/upload"
                        className="dashboard-upload-link"
                    >
                        <span>Upload Data</span>
                        <span
                            className="dashboard-upload-arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>
                    </Link>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // NORMAL DASHBOARD
    // --------------------------------------------------

    return (
        <div className="dashboard-home">
            <HeroBanner
                analytics={analytics}
            />

            <DateFilter
                value={dateFilter}
                onChange={setDateFilter}
                onCustomDateChange={setCustomDateRange}
            />

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            <div
                className={`dashboard-filter-content ${filterLoading
                        ? "is-filtering"
                        : "is-filtered"
                    }`}
            >
                {filterHasNoData ? (
                    <div className="dashboard-filter-empty">
                        <div className="filter-empty-icon">
                            <span>◷</span>
                        </div>

                        <h2>
                            No data found for this period
                        </h2>

                        <p>
                            Your business data is available,
                            but there are no records in the
                            selected date range.
                        </p>

                        <button
                            type="button"
                            className="view-all-data-btn"
                            onClick={() =>
                                setDateFilter("all")
                            }
                        >
                            <span>
                                View All Data
                            </span>

                            <span
                                className="view-all-data-arrow"
                                aria-hidden="true"
                            >
                                →
                            </span>
                        </button>
                    </div>
                ) : (
                    <>
                        <DashboardCards
                            analytics={analytics}
                        />

                        <BusinessSummary
                            analytics={analytics}
                        />

                        <KPIAnalytics
                            analytics={analytics}
                        />

                        <Suspense
                            fallback={
                                <div
                                    className="dashboard-grid"
                                    aria-label="Loading dashboard charts"
                                >
                                    <div />
                                    <div />
                                </div>
                            }
                        >
                            <section className="dashboard-grid">
                                <MonthlySalesChart
                                    analytics={analytics}
                                />

                                <ProductColumnChart
                                    analytics={analytics}
                                />
                            </section>

                            <section className="dashboard-grid">
                                <PaymentChart
                                    analytics={analytics}
                                />

                                <SalesChart
                                    analytics={analytics}
                                />
                            </section>
                        </Suspense>

                        <RecentTransaction
                            analytics={analytics}
                        />

                        <ExecutiveWidgets
                            analytics={analytics}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default DashboardHome;