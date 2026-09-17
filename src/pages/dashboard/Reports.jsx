import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
// jsPDF is loaded lazily only when PDF export is used.
// jspdf-autotable is loaded lazily only when PDF export is used.
// XLSX is loaded lazily only when Excel export is used.
import "./Reports.css";

import { APP } from "../../config/appConfig";
import { useDashboardDataContext } from "../../context/DashboardDataContext";
import {
    formatCurrency,
    formatNumber
} from "../../utils/analytics/analytics";

const BRAND_COLOR = [47, 91, 234];
const BRAND_COLOR_LIGHT = [247, 248, 250];

const REPORT_TABS = [
    { key: "sales", label: "Sales Report" },
    { key: "customer", label: "Customer Report" },
    { key: "product", label: "Product Report" },
    { key: "financial", label: "Financial Report" }
];

function formatCurrencyPDF(value) {
    return String(formatCurrency(value ?? 0)).replace(/₹/g, "Rs. ");
}

function toBase64(url) {
    return new Promise((resolve, reject) => {
        if (!url) {
            resolve(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                const context = canvas.getContext("2d");
                if (!context) {
                    reject(new Error("Canvas context unavailable."));
                    return;
                }

                context.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error("Unable to load report logo."));
        };

        img.src = url;
    });
}

function SkeletonBlock({ className = "" }) {
    return <div className={`reports-skeleton ${className}`} />;
}

const Reports = () => {
    const {
        analytics,
        loading,
        error,
        refreshDashboardData
    } = useDashboardDataContext();

    const [activeReport, setActiveReport] = useState("sales");
    const [exportLoading, setExportLoading] = useState(false);

    const safeAnalytics = analytics || {};

    const {
        totalRevenue = 0,
        totalOrders = 0,
        totalCustomers = 0,
        averageOrderValue = 0,
        highestSale = 0,
        lowestSale = 0,
        topProduct = null,
        topProductCount = 0,
        topCustomer = null,
        topCustomerSpend = 0,
        businessHealth = 0,
        monthlySales = [],
        revenueGrowth = null,
        ordersGrowth = null,
        paymentMethods = {},
        citySales = [],
        productSales = []
    } = safeAnalytics;

    const hasAnalytics =
        analytics &&
        typeof analytics === "object" &&
        Object.keys(analytics).length > 0;

    // Report configuration mapping
    const reportConfigs = useMemo(() => {
        if (!hasAnalytics) return null;

        const monthlyRows = Array.isArray(monthlySales)
            ? monthlySales.slice(0, 100).map((row) => [
                row?.month ?? "—",
                formatCurrency(row?.sales ?? 0),
                formatNumber(row?.orders ?? 0)
            ])
            : [];

        const monthlyRowsPDF = Array.isArray(monthlySales)
            ? monthlySales.slice(0, 100).map((row) => [
                row?.month ?? "—",
                formatCurrencyPDF(row?.sales ?? 0),
                formatNumber(row?.orders ?? 0)
            ])
            : [];

        const productRows = Array.isArray(productSales)
            ? productSales.slice(0, 10).map((row) => [
                row?.product ?? "—",
                formatNumber(row?.count ?? 0)
            ])
            : [];

        const productRowsPDF = Array.isArray(productSales)
            ? productSales.slice(0, 10).map((row) => [
                row?.product ?? "—",
                formatNumber(row?.count ?? 0)
            ])
            : [];

        const sortedPayments = paymentMethods && typeof paymentMethods === "object"
            ? Object.entries(paymentMethods).sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
            : [];

        const paymentRows = sortedPayments.map(([method, count]) => [
            method || "Unknown",
            formatNumber(count)
        ]);

        const paymentRowsPDF = sortedPayments.map(([method, count]) => [
            method || "Unknown",
            formatNumber(count)
        ]);

        const cityRows = Array.isArray(citySales)
            ? citySales.slice(0, 10).map((row) => [
                row?.city ?? "—",
                formatCurrency(row?.revenue ?? 0)
            ])
            : [];

        const cityRowsPDF = Array.isArray(citySales)
            ? citySales.slice(0, 10).map((row) => [
                row?.city ?? "—",
                formatCurrencyPDF(row?.revenue ?? 0)
            ])
            : [];

        return {
            sales: {
                title: "Sales Report",
                cards: [
                    { label: "Total Revenue", value: formatCurrency(totalRevenue) },
                    { label: "Orders", value: formatNumber(totalOrders) },
                    { label: "Average Order Value", value: formatCurrency(averageOrderValue) },
                    { label: "Highest Sale", value: formatCurrency(highestSale) },
                    { label: "Lowest Sale", value: formatCurrency(lowestSale) }
                ],
                tables: monthlyRows.length > 0
                    ? [{ title: "Monthly Sales", head: ["Month", "Revenue", "Orders"], rows: monthlyRows, rowsPDF: monthlyRowsPDF }]
                    : []
            },
            customer: {
                title: "Customer Report",
                cards: [
                    { label: "Total Customers", value: formatNumber(totalCustomers) },
                    { label: "Top Customer", value: topCustomer || "—" },
                    { label: "Top Customer Spend", value: formatCurrency(topCustomerSpend) }
                ],
                tables: []
            },
            product: {
                title: "Product Report",
                cards: [
                    { label: "Top Product", value: topProduct || "—" },
                    { label: "Top Product Orders", value: formatNumber(topProductCount) }
                ],
                tables: productRows.length > 0
                    ? [{ title: "Product Performance", head: ["Product", "Orders"], rows: productRows, rowsPDF: productRowsPDF }]
                    : []
            },
            financial: {
                title: "Financial Report",
                cards: [
                    { label: "Total Revenue", value: formatCurrency(totalRevenue) },
                    { label: "Business Health", value: `${Number(businessHealth || 0)}%` }
                ],
                tables: [
                    ...(paymentRows.length > 0
                        ? [{ title: "Payment Methods", head: ["Method", "Orders"], rows: paymentRows, rowsPDF: paymentRowsPDF }]
                        : []),
                    ...(cityRows.length > 0
                        ? [{ title: "Sales by City", head: ["City", "Revenue"], rows: cityRows, rowsPDF: cityRowsPDF }]
                        : [])
                ]
            }
        };
    }, [
        hasAnalytics, totalRevenue, totalOrders, totalCustomers, averageOrderValue,
        highestSale, lowestSale, topProduct, topProductCount, topCustomer,
        topCustomerSpend, businessHealth, monthlySales, paymentMethods, citySales, productSales
    ]);

    const current = reportConfigs?.[activeReport] || null;

    // Full business report configuration
    const fullReportConfig = useMemo(() => {
        if (!reportConfigs) return null;

        return {
            title: "Complete Business Report",
            cards: [
                { label: "Total Revenue", value: formatCurrency(totalRevenue) },
                { label: "Orders", value: formatNumber(totalOrders) },
                { label: "Total Customers", value: formatNumber(totalCustomers) },
                { label: "Average Order Value", value: formatCurrency(averageOrderValue) },
                { label: "Top Product", value: topProduct || "—" },
                { label: "Business Health", value: `${Number(businessHealth || 0)}%` }
            ],
            tables: [
                ...reportConfigs.sales.tables,
                ...reportConfigs.product.tables,
                ...reportConfigs.financial.tables
            ]
        };
    }, [reportConfigs, totalRevenue, totalOrders, totalCustomers, averageOrderValue, topProduct, businessHealth]);

    // PDF Download Handler
    const downloadPDF = useCallback(async (config) => {
        const targetConfig = config || current;
        if (!targetConfig) return;

        setExportLoading(true);

        try {
            const [{ jsPDF }, { default: autoTable }] = await Promise.all([
                import("jspdf"),
                import("jspdf-autotable"),
            ]);

            const logoData = APP.logo ? await toBase64(APP.logo).catch(() => null) : null;
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const marginX = 14;

            doc.setFillColor(...BRAND_COLOR);
            doc.rect(0, 0, pageWidth, 32, "F");

            if (logoData) {
                doc.addImage(logoData, "PNG", marginX, 6, 20, 20);
            } else {
                doc.setFillColor(255, 255, 255);
                doc.circle(marginX + 9, 16, 9, "F");
                doc.setTextColor(...BRAND_COLOR);
                doc.setFontSize(14);
                doc.setFont(undefined, "bold");
                doc.text(String(APP.name || "K").charAt(0).toUpperCase(), marginX + 9, 19.5, { align: "center" });
            }

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(17);
            doc.setFont(undefined, "bold");
            doc.text(`${APP.name} ${targetConfig.title}`, marginX + 28, 15);

            doc.setFontSize(10);
            doc.setFont(undefined, "normal");
            doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, marginX + 28, 23);

            doc.setTextColor(0, 0, 0);

            const styledTable = (options) => {
                autoTable(doc, {
                    theme: "striped",
                    headStyles: { fillColor: BRAND_COLOR, textColor: 255, fontStyle: "bold" },
                    alternateRowStyles: { fillColor: BRAND_COLOR_LIGHT },
                    styles: { fontSize: 9.5, cellPadding: 4 },
                    margin: { left: marginX, right: marginX },
                    ...options
                });
            };

            const cardRowsPDF = targetConfig.cards.map((card) => [
                card.label,
                typeof card.value === "string" ? card.value.replace(/₹/g, "Rs. ") : card.value
            ]);

            styledTable({
                startY: 42,
                head: [["Metric", "Value"]],
                body: cardRowsPDF
            });

            targetConfig.tables.forEach((table) => {
                const startY = doc.lastAutoTable.finalY + 19;
                doc.setFontSize(12.5);
                doc.setFont(undefined, "bold");
                doc.setTextColor(...BRAND_COLOR);
                doc.text(table.title, marginX, startY - 5);
                doc.setTextColor(0, 0, 0);

                styledTable({
                    startY,
                    head: [table.head],
                    body: table.rowsPDF
                });
            });

            const pageCount = doc.internal.getNumberOfPages();
            for (let page = 1; page <= pageCount; page += 1) {
                doc.setPage(page);
                doc.setDrawColor(230, 230, 230);
                doc.line(marginX, pageHeight - 16, pageWidth - marginX, pageHeight - 16);
                doc.setFontSize(8.5);
                doc.setTextColor(140);
                doc.text(APP.name, marginX, pageHeight - 10);
                doc.text(`Page ${page} of ${pageCount}`, pageWidth - marginX, pageHeight - 10, { align: "right" });
            }

            doc.save(`${APP.name}_${targetConfig.title.replace(/\s+/g, "_")}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF:", err);
        } finally {
            setExportLoading(false);
        }
    }, [current]);

    // Excel Download Handler
    const downloadExcel = useCallback(async (config) => {
        const targetConfig = config || current;
        if (!targetConfig) return;

        setExportLoading(true);

        try {
            const XLSX = await import("xlsx");
            const workbook = XLSX.utils.book_new();
            const summaryRow = {};

            targetConfig.cards.forEach((card) => {
                summaryRow[card.label] = card.value;
            });

            const summarySheet = XLSX.utils.json_to_sheet([summaryRow]);
            XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

            targetConfig.tables.forEach((table) => {
                const sheetData = table.rows.map((row) =>
                    Object.fromEntries(
                        table.head.map((heading, index) => [heading, row[index]])
                    )
                );

                const sheet = XLSX.utils.json_to_sheet(sheetData);
                const sheetName = table.title.replace(/[:\\/?*[\]]/g, "").slice(0, 31) || "Report";

                XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
            });

            XLSX.writeFile(workbook, `${APP.name}_${targetConfig.title.replace(/\s+/g, "_")}.xlsx`);
        } catch (err) {
            console.error("Failed to generate Excel:", err);
        } finally {
            setExportLoading(false);
        }
    }, [current]);

    // Loading State UI
    if (loading && !hasAnalytics) {
        return (
            <div className="reports-page">
                <div className="reports-empty">
                    <h2>Preparing reports…</h2>
                    <SkeletonBlock />
                    <SkeletonBlock />
                </div>
            </div>
        );
    }

    // Error State UI
    if (error && !hasAnalytics) {
        return (
            <div className="reports-page">
                <div className="reports-empty">
                    <h2>Unable to load reports</h2>
                    <p>{error}</p>
                    <button className="reports-btn reports-btn-primary" onClick={refreshDashboardData}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty State UI
    if (!hasAnalytics) {
        return (
            <div className="reports-page">
                <div className="reports-empty">
                    <h2>No Report Data Available</h2>
                    <p>Upload a business dataset first to generate reports.</p>
                    <Link to="/" className="reports-btn reports-btn-primary">
                        Go to Upload
                    </Link>
                </div>
            </div>
        );
    }

    const showSkeleton = !current || loading || exportLoading;

    return (
        <div className="reports-page">
            {/* HEADER SECTION */}
            <header className="reports-header">
                <div className="reports-title-row">
                    {APP.logo && (
                        <img
                            src={APP.logo}
                            alt={`${APP.name} logo`}
                            className="reports-logo"
                            onError={(e) => { e.target.style.display = "none"; }}
                        />
                    )}
                    <div>
                        <h1>{APP.name} {current ? current.title : "Report"}</h1>
                        <p className="reports-subtitle">Business Report</p>
                    </div>
                </div>

                <div className="reports-actions">
                    <button className="reports-btn" onClick={() => downloadExcel()} disabled={showSkeleton}>
                        Export CSV / Excel
                    </button>
                    <button className="reports-btn reports-btn-primary" onClick={() => downloadPDF()} disabled={showSkeleton}>
                        {exportLoading ? "Generating…" : "Download PDF"}
                    </button>
                </div>
            </header>

            {/* COMPLETE BUSINESS REPORT CARD */}
            <section className="business-report">
                <div className="business-report-content">
                    <div className="business-report-left">
                        <span className="business-report-badge">COMPLETE BUSINESS REPORT</span>
                        <h2>Export your complete business performance</h2>
                        <p>
                            Generate one professional report containing sales, customer, product, payment, and business health analytics.
                        </p>

                        <div className="business-report-list">
                            <div>✓ Sales Performance</div>
                            <div>✓ Customer Analytics</div>
                            <div>✓ Product Performance</div>
                            <div>✓ Payment Analytics</div>
                            <div>✓ Business Health Score</div>
                            <div>✓ Revenue &amp; Orders Trend</div>
                        </div>

                        <button
                            className="business-report-btn"
                            onClick={() => downloadPDF(fullReportConfig)}
                            disabled={showSkeleton || !fullReportConfig}
                        >
                            {exportLoading ? "Generating…" : "Download Complete Report (.PDF)"}
                        </button>
                    </div>

                    <div className="business-report-right">
                        <div className="business-report-preview">
                            <h4>Business Report Summary</h4>
                            <span>Sales Report</span>
                            <span>Customer Report</span>
                            <span>Product Report</span>
                            <span>Financial Report</span>
                            <span>Business Health</span>
                            <div className="business-report-footer">Export Ready</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* REPORT TABS */}
            <nav className="reports-tabs">
                {REPORT_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`reports-tab ${activeReport === tab.key ? "active" : ""}`}
                        onClick={() => setActiveReport(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* REPORT CONTENT WITH KEY-BASED ANIMATION TRIGGER */}
            <div className="reports-tab-content-wrapper" key={activeReport}>
                {showSkeleton ? (
                    <section className="reports-grid" aria-busy="true" aria-label="Preparing report data">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div className="reports-card" key={index}>
                                <SkeletonBlock className="reports-skeleton-label" />
                                <SkeletonBlock className="reports-skeleton-value" />
                            </div>
                        ))}
                    </section>
                ) : (
                    <>
                        {/* KPI CARDS */}
                        <section className="reports-grid">
                            {current.cards.map((card) => (
                                <div className="reports-card" key={card.label}>
                                    <span className="reports-card-label" title={card.label}>
                                        {card.label}
                                    </span>
                                    <span className="reports-card-value" title={String(card.value)}>
                                        {card.value}
                                    </span>

                                    {card.label === "Total Revenue" && revenueGrowth !== null && revenueGrowth !== undefined && (
                                        <span className={`reports-growth ${Number(revenueGrowth) >= 0 ? "up" : "down"}`}>
                                            {Number(revenueGrowth) >= 0 ? "▲" : "▼"} {Math.abs(Number(revenueGrowth))}% vs last month
                                        </span>
                                    )}

                                    {card.label === "Orders" && ordersGrowth !== null && ordersGrowth !== undefined && (
                                        <span className={`reports-growth ${Number(ordersGrowth) >= 0 ? "up" : "down"}`}>
                                            {Number(ordersGrowth) >= 0 ? "▲" : "▼"} {Math.abs(Number(ordersGrowth))}% vs last month
                                        </span>
                                    )}

                                    {card.label === "Business Health" && (
                                        <div className="reports-health-bar">
                                            <div
                                                className="reports-health-fill"
                                                style={{
                                                    width: `${Math.max(0, Math.min(100, Number(businessHealth || 0)))}%`
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>

                        {/* TABLES */}
                        {current.tables.map((table) => (
                            <section className="reports-table-section" key={table.title}>
                                <h2>{table.title}</h2>
                                <div className="reports-table-wrapper">
                                    <table className="reports-table">
                                        <thead>
                                            <tr>
                                                {table.head.map((heading, index) => (
                                                    <th key={`${heading}-${index}`}>{heading}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {table.rows.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        ))}

                        {current.tables.length === 0 && (
                            <section className="reports-empty">
                                <h2>No Detailed Data Available</h2>
                                <p>Summary analytics are available for this report.</p>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Reports;