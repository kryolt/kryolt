import { useMemo, useState } from "react";
import {
    Search,
    Download,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Database
} from "lucide-react";

import "./DataTable.css";

// Internal/meta columns that should never be shown to the user
const HIDDEN_COLUMNS = ["availablefields", "extrafields"];

function DataTable({ csvData = [] }) {

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortKey, setSortKey] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    // visible column keys — everything except HIDDEN_COLUMNS
    const columns = useMemo(() => {
        if (!csvData.length) return [];
        return Object.keys(csvData[0]).filter(
            (key) => !HIDDEN_COLUMNS.includes(key.toLowerCase())
        );
    }, [csvData]);

    const filteredData = useMemo(() => {
        let rows = [...csvData];

        if (search) {
            rows = rows.filter((row) =>
                columns
                    .map((key) => row[key])
                    .join(" ")
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        if (sortKey) {
            rows.sort((a, b) => {
                const A = a[sortKey];
                const B = b[sortKey];

                if (!isNaN(A) && !isNaN(B)) {
                    return sortDirection === "asc"
                        ? Number(A) - Number(B)
                        : Number(B) - Number(A);
                }

                return sortDirection === "asc"
                    ? String(A).localeCompare(String(B))
                    : String(B).localeCompare(String(A));
            });
        }

        return rows;
    }, [csvData, search, sortKey, sortDirection, columns]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
    const start = (page - 1) * rowsPerPage;
    const currentRows = filteredData.slice(start, start + rowsPerPage);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    };

    const exportCSV = () => {
        if (!filteredData.length) return;

        const headers = columns;

        const csv = [
            headers.join(","),
            ...filteredData.map(row => headers.map(h => `"${row[h] ?? ""}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = "kryolt-records.csv";
        a.click();

        URL.revokeObjectURL(url);
    };

    if (!csvData.length) {
        return (
            <div className="table-empty">
                <Database size={48} />
                <h2>No customer data</h2>
                <p>Upload your business CSV to start exploring customer records.</p>
            </div>
        );
    }

    return (
        <section className="table-card">

            <div className="table-top">

                <div>
                    <h2>Customer database</h2>
                    <p>{filteredData.length.toLocaleString("en-IN")} records available</p>
                </div>

                <div className="table-tools">

                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <select
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>

                    <button
                        className="export-btn"
                        onClick={exportCSV}
                        disabled={!filteredData.length}
                    >
                        <Download size={16} />
                        Export
                    </button>

                </div>

            </div>

            {currentRows.length === 0 ? (
                <div className="table-no-results">
                    <p>No records match "{search}".</p>
                </div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table>

                            <thead>
                                <tr>
                                    <th>#</th>
                                    {columns.map((key) => (
                                        <th key={key} onClick={() => handleSort(key)}>
                                            <div className="table-head">
                                                {key}
                                                <ArrowUpDown size={13} />
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {currentRows.map((row, index) => (
                                    <tr key={index}>
                                        <td>{start + index + 1}</td>

                                        {columns.map((key) => {
                                            const value = row[key];
                                            return (
                                                <td key={key}>
                                                    {typeof value === "object" && value !== null
                                                        ? JSON.stringify(value)
                                                        : String(value ?? "-")}
                                                </td>
                                            );
                                        })}

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                    <div className="table-bottom">

                        <span>
                            Showing <strong>{start + 1}</strong>-
                            <strong>{Math.min(start + rowsPerPage, filteredData.length)}</strong>
                            {" "}of <strong>{filteredData.length}</strong>
                        </span>

                        <div className="pagination">
                            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                                <ChevronLeft size={16} />
                            </button>
                            <span>{page}/{totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                    </div>
                </>
            )}

        </section>
    );
}

export default DataTable;