import "./RecentTransaction.css";

import { useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { useDashboardDataContext } from "../../../context/DashboardDataContext";

const TIME_FILTERS = [
    { label: "Today", type: "today" },
    { label: "7D", type: "days", value: 7 },
    { label: "30D", type: "days", value: 30 },
    { label: "3M", type: "months", value: 3 },
    { label: "6M", type: "months", value: 6 },
    { label: "1Y", type: "months", value: 12 },
    { label: "All", type: "all" },
];

const SORT_OPTIONS = [
    { label: "Latest", value: "latest" },
    { label: "Oldest", value: "oldest" },
    { label: "Highest Amount", value: "amount_desc" },
    { label: "Lowest Amount", value: "amount_asc" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const OPTIONAL_COLUMNS = [
    { key: "qty", label: "Qty", keys: ["Quantity"] },
    { key: "city", label: "City", keys: ["City", "Location"] },
    { key: "category", label: "Category", keys: ["Category", "ProductCategory"] },
    { key: "payment", label: "Payment", keys: ["Payment", "PaymentMethod", "Mode"] },
    { key: "status", label: "Status", keys: ["Status"] },
];

function getRow(row, keys, fallback = "") {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
            return row[key];
        }
    }
    return fallback;
}

function getAmount(row) {
    return Number(
        row.Amount || row.Sales || row.Total || row.Revenue || 0
    );
}

function getDate(row) {
    return new Date(row.Date || row.OrderDate || 0);
}

function statusClass(status) {
    const s = (status || "").toLowerCase();
    if (s === "pending") return "status-pending";
    if (s === "cancelled" || s === "canceled" || s === "failed") return "status-failed";
    if (s === "completed" || s === "") return "status-completed";
    return "status-unknown";
}

function csvEscape(value) {
    const str = String(value ?? "");
    if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function RecentTransaction() {

    const { data } = useDashboardDataContext();

    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("All");
    const [timeFilter, setTimeFilter] = useState("All");
    const [sortOption, setSortOption] = useState("latest");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);

    const paymentOptions = useMemo(() => {
        const set = new Set();

        data.forEach((row) => {
            const method = getRow(row, ["Payment", "PaymentMethod", "Mode"]);
            if (method) set.add(method);
        });

        return ["All", ...Array.from(set).sort()];
    }, [data]);

    const visibleColumns = useMemo(() => {

        return OPTIONAL_COLUMNS.filter((col) =>
            data.some((row) => getRow(row, col.keys) !== "")
        );

    }, [data]);

    const summary = useMemo(() => {

        const totalTransactions = data.length;

        const totalRevenue = data.reduce(
            (sum, row) => sum + getAmount(row),
            0
        );

        const averageOrderValue =
            totalTransactions > 0
                ? totalRevenue / totalTransactions
                : 0;

        let completed = 0;
        let pending = 0;
        let cancelled = 0;

        data.forEach((row) => {
            const cls = statusClass(row.Status);
            if (cls === "status-pending") pending += 1;
            else if (cls === "status-failed") cancelled += 1;
            else completed += 1;
        });

        return {
            totalTransactions,
            totalRevenue,
            averageOrderValue,
            completed,
            pending,
            cancelled,
        };

    }, [data]);

    const filteredRows = useMemo(() => {

        const filter = TIME_FILTERS.find((f) => f.label === timeFilter);

        let cutoff = null;
        let isToday = false;

        if (filter?.type === "days") {
            cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - filter.value);
        } else if (filter?.type === "months") {
            cutoff = new Date();
            cutoff.setMonth(cutoff.getMonth() - filter.value);
        } else if (filter?.type === "today") {
            isToday = true;
        }

        const todayStr = new Date().toDateString();

        const result = data.filter((row) => {

            const customer = getRow(row, ["Customer", "CustomerName", "Name"]).toString().toLowerCase();
            const product = getRow(row, ["Product", "ProductName", "Item"]).toString().toLowerCase();

            const matchesSearch =
                customer.includes(search.toLowerCase()) ||
                product.includes(search.toLowerCase());

            const method = getRow(row, ["Payment", "PaymentMethod", "Mode"]);
            const matchesPayment = paymentFilter === "All" || method === paymentFilter;

            const rowDate = getDate(row);

            let matchesTime = true;

            if (isToday) {
                matchesTime = rowDate.toDateString() === todayStr;
            } else if (cutoff) {
                matchesTime = rowDate >= cutoff;
            }

            return matchesSearch && matchesPayment && matchesTime;

        });

        result.sort((a, b) => {

            if (sortOption === "amount_desc") {
                return getAmount(b) - getAmount(a);
            }

            if (sortOption === "amount_asc") {
                return getAmount(a) - getAmount(b);
            }

            const dateA = getDate(a);
            const dateB = getDate(b);

            return sortOption === "oldest"
                ? dateA - dateB
                : dateB - dateA;

        });

        return result;

    }, [data, search, paymentFilter, timeFilter, sortOption]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredRows.length / pageSize)
    );

    const displayPage = Math.min(page, totalPages);

    const paginatedRows = useMemo(() => {

        const start = (displayPage - 1) * pageSize;

        return filteredRows.slice(start, start + pageSize);

    }, [filteredRows, displayPage, pageSize]);

    const rangeStart = filteredRows.length
        ? (displayPage - 1) * pageSize + 1
        : 0;

    const rangeEnd = Math.min(
        displayPage * pageSize,
        filteredRows.length
    );

    const handleExportCsv = () => {

        const headers = [
            "#",
            "Date",
            "Customer",
            "Product",
            ...visibleColumns.map((col) => col.label),
            "Amount",
        ];

        const lines = [headers.map(csvEscape).join(",")];

        filteredRows.forEach((row, index) => {

            const cells = [
                index + 1,
                row.Date || row.OrderDate || "-",
                row.Customer || row.CustomerName || row.Name || "-",
                row.Product || row.ProductName || row.Item || "-",
                ...visibleColumns.map((col) =>
                    col.key === "qty"
                        ? (row.Quantity || 1)
                        : getRow(row, col.keys, "-")
                ),
                getAmount(row),
            ];

            lines.push(cells.map(csvEscape).join(","));

        });

        const csvContent = lines.join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "recent-transactions.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    };

    const handlePrint = () => {
        window.print();
    };

    if (!data.length) {
        return (
            <div className="table-card">
                <h2>Recent transactions</h2>
                <p>No transaction data available.</p>
            </div>
        );
    }

    return (
        <div className="table-card">

            <div className="table-header">

                <h2>Recent transactions</h2>

                <div className="table-export-actions">

                    <button
                        type="button"
                        className="export-btn"
                        onClick={handleExportCsv}
                    >
                        <Download size={13} />
                        Export CSV
                    </button>

                    <button
                        type="button"
                        className="export-btn"
                        onClick={handlePrint}
                    >
                        <Printer size={13} />
                        Print
                    </button>

                </div>

            </div>

            <div className="summary-cards">

                <div className="summary-card">
                    <span className="summary-label">Total Transactions</span>
                    <span className="summary-value">
                        {summary.totalTransactions.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="summary-card">
                    <span className="summary-label">Total Revenue</span>
                    <span className="summary-value">
                        ₹{summary.totalRevenue.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="summary-card">
                    <span className="summary-label">Avg Order Value</span>
                    <span className="summary-value">
                        ₹{Math.round(summary.averageOrderValue).toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="summary-card">
                    <span className="summary-label">Completed</span>
                    <span className="summary-value summary-value-completed">
                        {summary.completed.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="summary-card">
                    <span className="summary-label">Pending</span>
                    <span className="summary-value summary-value-pending">
                        {summary.pending.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="summary-card">
                    <span className="summary-label">Cancelled</span>
                    <span className="summary-value summary-value-cancelled">
                        {summary.cancelled.toLocaleString("en-IN")}
                    </span>
                </div>

            </div>

            <div className="table-actions">

                <input
                    type="text"
                    placeholder="Search customer or product..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />

                <select
                    value={paymentFilter}
                    onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                    className="table-select"
                >
                    {paymentOptions.map((option) => (
                        <option key={option} value={option}>
                            {option === "All" ? "All payments" : option}
                        </option>
                    ))}
                </select>

                <select
                    value={sortOption}
                    onChange={(e) => { setSortOption(e.target.value); setPage(1); }}
                    className="table-select"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <div className="table-filter-group">
                    {TIME_FILTERS.map(({ label }) => (
                        <button
                            key={label}
                            type="button"
                            className={`table-filter-btn ${timeFilter === label ? "active" : ""}`}
                            onClick={() => { setTimeFilter(label); setPage(1); }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="table-select"
                >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                            {size} / page
                        </option>
                    ))}
                </select>

                <span>{filteredRows.length} records</span>

            </div>

            <div className="table-wrapper">

                <table className="transactions-table">
                    <colgroup>
                        <col className="col-index" />
                        <col className="col-date" />
                        <col className="col-customer" />
                        <col className="col-product" />

                        {visibleColumns.map((col) => (
                            <col
                                key={`col-${col.key}`}
                                className={`col-${col.key}`}
                            />
                        ))}

                        <col className="col-amount" />
                    </colgroup>

                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Product</th>

                            {visibleColumns.map((col) => (
                                <th key={col.key}>{col.label}</th>
                            ))}

                            <th>Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedRows.map((row, index) => {
                            const amount = getAmount(row);
                            const status = row.Status || "Completed";

                            return (
                                <tr
                                    key={(page - 1) * pageSize + index}
                                    className="table-row"
                                >
                                    <td data-label="#">
                                        {(page - 1) * pageSize + index + 1}
                                    </td>

                                    <td data-label="Date">
                                        {row.Date || row.OrderDate || "-"}
                                    </td>

                                    <td data-label="Customer">
                                        {row.Customer ||
                                            row.CustomerName ||
                                            row.Name ||
                                            "-"}
                                    </td>

                                    <td data-label="Product">
                                        {row.Product ||
                                            row.ProductName ||
                                            row.Item ||
                                            "-"}
                                    </td>

                                    {visibleColumns.map((col) => (
                                        <td key={col.key} data-label={col.label}>
                                            {col.key === "status" ? (
                                                <span
                                                    className={`status ${statusClass(status)}`}
                                                >
                                                    {status}
                                                </span>
                                            ) : col.key === "qty" ? (
                                                row.Quantity || 1
                                            ) : (
                                                getRow(row, col.keys, "-")
                                            )}
                                        </td>
                                    ))}

                                    <td data-label="Amount">
                                        ₹{amount.toLocaleString("en-IN")}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

            </div>

            <div className="table-footer">

                <span className="table-footer-info">
                    Showing {rangeStart}–{rangeEnd} of {filteredRows.length} transactions
                </span>

                <div className="pagination">

                    <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={displayPage <= 1}
                    >
                        Previous
                    </button>

                    <span className="pagination-current">
                        Page {displayPage} of {totalPages}
                    </span>

                    <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={displayPage >= totalPages}
                    >
                        Next
                    </button>

                </div>

            </div>

        </div>
    );
}

export default RecentTransaction;