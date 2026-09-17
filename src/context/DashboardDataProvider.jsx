import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import DashboardDataContext from "./DashboardDataContext";
import { useAuth } from "./useAuth";

import {
    getMetadata,
    getBusinessDataCount,
    getBusinessDataPaginated,
    getBusinessDataFilteredPaginated,
    getBusinessDataByDateRange,
    getFilterRange,
} from "../utils/storage/indexedDB";

import { calculateAnalytics } from "../utils/analytics/analytics";

// Safe analytics object for users who have not uploaded a dataset yet.
// This prevents child dashboard pages (e.g. Customers) from crashing
// while still allowing DashboardHome to use hasDataset for its empty state.
const EMPTY_ANALYTICS = calculateAnalytics([]);

const DEFAULT_PAGE_SIZE = 50;

function normalizePositiveInteger(value, fallback) {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 1) {
        return fallback;
    }

    return Math.floor(number);
}

function extractRows(result) {
    if (Array.isArray(result?.data)) {
        return result.data;
    }

    if (Array.isArray(result?.rows)) {
        return result.rows;
    }

    if (Array.isArray(result)) {
        return result;
    }

    return [];
}

function extractTotal(result, fallback = 0) {
    const values = [
        result?.totalRows,
        result?.total,
        result?.count,
    ];

    for (const value of values) {
        const number = Number(value);

        if (Number.isFinite(number) && number >= 0) {
            return number;
        }
    }

    return Number(fallback) || 0;
}

function getColumnCount(rows, metadata) {
    const metadataColumns = Number(metadata?.totalColumns);

    if (
        Number.isFinite(metadataColumns) &&
        metadataColumns >= 0
    ) {
        return metadataColumns;
    }

    if (rows.length > 0) {
        return Object.keys(rows[0] || {}).length;
    }

    return 0;
}

export function DashboardDataProvider({ children }) {
    // Auth is resolved outside this provider, but the provider itself stays
    // mounted for the whole app. This is important: navigating
    // /dashboard -> / -> /dashboard must NOT recreate the provider and
    // trigger the dashboard loading screen again.
    const {
        currentUser,
        loading: authLoading,
    } = useAuth();

    // =========================================================
    // DATASET STATE
    // =========================================================

    const [hasDataset, setHasDataset] = useState(false);

    const [totalRecords, setTotalRecords] = useState(0);

    const [totalColumns, setTotalColumns] = useState(0);

    // =========================================================
    // VISIBLE DATA
    // =========================================================

    const [currentPageData, setCurrentPageData] = useState([]);

    // =========================================================
    // ANALYTICS
    // =========================================================

    const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);

    // =========================================================
    // FILTER
    // =========================================================

    const [dateFilter, setDateFilterState] = useState("all");

    const [customDateRange, setCustomDateRangeState] =
        useState(null);

    const [filterHasNoData, setFilterHasNoData] =
        useState(false);

    // =========================================================
    // PAGINATION
    // =========================================================

    const [currentPage, setCurrentPage] = useState(1);

    const [pageSize, setPageSize] =
        useState(DEFAULT_PAGE_SIZE);

    // =========================================================
    // LOADING
    // =========================================================

    const [loading, setLoading] = useState(true);

    const [filterLoading, setFilterLoading] =
        useState(false);

    const [pageLoading, setPageLoading] =
        useState(false);

    const [error, setError] = useState(null);

    // =========================================================
    // REQUEST CONTROL
    // =========================================================

    const requestIdRef = useRef(0);

    const mountedRef = useRef(false);

    // =========================================================
    // MOUNT
    // =========================================================

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            requestIdRef.current += 1;
        };
    }, []);

    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    const isRequestCurrent = useCallback((requestId) => {
        return (
            mountedRef.current &&
            requestId === requestIdRef.current
        );
    }, []);

    // =========================================================
    // COMMIT DATA
    // =========================================================

    const commitData = useCallback(
        ({
            rows,
            total,
            page = 1,
            size = DEFAULT_PAGE_SIZE,
            metadata = null,
        }) => {
            const safeRows = Array.isArray(rows)
                ? rows
                : [];

            const safeTotal =
                Number.isFinite(Number(total))
                    ? Number(total)
                    : safeRows.length;

            setCurrentPageData(safeRows);

            setTotalRecords(safeTotal);

            setCurrentPage(
                normalizePositiveInteger(page, 1)
            );

            setPageSize(
                normalizePositiveInteger(
                    size,
                    DEFAULT_PAGE_SIZE
                )
            );

            setTotalColumns(
                getColumnCount(
                    safeRows,
                    metadata
                )
            );
        },
        []
    );

    // =========================================================
    // LOAD ALL DATA
    // =========================================================

    const loadAllData = useCallback(
        async (
            requestId,
            page = 1,
            size = DEFAULT_PAGE_SIZE
        ) => {
            const safePage =
                normalizePositiveInteger(page, 1);

            const safePageSize =
                normalizePositiveInteger(
                    size,
                    DEFAULT_PAGE_SIZE
                );

            const [
                metadata,
                count,
                result,
            ] = await Promise.all([
                getMetadata(),
                getBusinessDataCount(),
                getBusinessDataPaginated(
                    safePage,
                    safePageSize
                ),
            ]);

            if (
                !isRequestCurrent(requestId)
            ) {
                return false;
            }

            const rows =
                extractRows(result);

            const total =
                extractTotal(
                    result,
                    count
                );

            /*
             * IMPORTANT:
             * Always trust the CURRENT IndexedDB dataset.
             * This is required after a new upload replaces the
             * previous dataset.
             */
            if (total <= 0) {
                commitData({
                    rows: [],
                    total: 0,
                    page: 1,
                    size: safePageSize,
                    metadata,
                });

                setHasDataset(false);
                setAnalytics(EMPTY_ANALYTICS);
                setFilterHasNoData(false);

                return true;
            }

            setHasDataset(true);

            commitData({
                rows,
                total,
                page: safePage,
                size: safePageSize,
                metadata,
            });

            setFilterHasNoData(false);

            /*
             * Recalculate analytics from the CURRENT dataset.
             *
             * Do not use saveAnalytics/getAnalytics here because
             * an upload may have just replaced the dataset.
             */
            const allRows =
                await getBusinessDataByDateRange(
                    "1970-01-01",
                    "2099-12-31"
                );

            if (
                !isRequestCurrent(requestId)
            ) {
                return false;
            }

            if (
                Array.isArray(allRows) &&
                allRows.length > 0
            ) {
                setAnalytics(
                    calculateAnalytics(
                        allRows
                    )
                );
            } else {
                setAnalytics(EMPTY_ANALYTICS);
            }

            return true;
        },
        [
            commitData,
            isRequestCurrent,
        ]
    );

    // =========================================================
    // LOAD FILTERED DATA
    // =========================================================

    const loadFilteredData = useCallback(
        async (
            filter,
            customRange,
            requestId,
            page = 1
        ) => {
            const selectedFilter =
                filter || "all";

            // -----------------------------------------------------
            // ALL DATA
            // -----------------------------------------------------

            if (selectedFilter === "all") {
                const success =
                    await loadAllData(
                        requestId,
                        page,
                        DEFAULT_PAGE_SIZE
                    );

                if (
                    success &&
                    isRequestCurrent(requestId)
                ) {
                    setDateFilterState("all");
                    setCustomDateRangeState(null);
                    setFilterHasNoData(false);
                }

                return success;
            }

            // -----------------------------------------------------
            // DATE RANGE
            // -----------------------------------------------------

            const range =
                getFilterRange(
                    selectedFilter,
                    customRange
                );

            if (
                !range ||
                !range.startKey ||
                !range.endKey
            ) {
                if (
                    isRequestCurrent(requestId)
                ) {
                    setDateFilterState(
                        selectedFilter
                    );

                    setCustomDateRangeState(
                        selectedFilter === "custom"
                            ? customRange
                            : null
                    );

                    setFilterHasNoData(true);
                }

                return false;
            }

            // -----------------------------------------------------
            // FETCH FILTERED PAGE
            // -----------------------------------------------------

            const result =
                await getBusinessDataFilteredPaginated(
                    page,
                    DEFAULT_PAGE_SIZE,
                    selectedFilter,
                    customRange
                );

            if (
                !isRequestCurrent(requestId)
            ) {
                return false;
            }

            const rows = extractRows(result);

            const total =
                extractTotal(
                    result,
                    0
                );

            // -----------------------------------------------------
            // NO MATCHING DATA
            // -----------------------------------------------------
            //
            // IMPORTANT:
            // Do NOT destroy the currently visible dashboard.
            //
            // Example:
            // All Data = 149 rows
            // Today = 0 rows
            //
            // The dashboard stays visible.
            // filterHasNoData becomes true.
            //
            // -----------------------------------------------------

            if (total === 0) {
                /*
                 * IMPORTANT:
                 * Keep the requested filter selected even when it has
                 * no records. The dashboard may intentionally keep the
                 * previous/all-time data visible behind the empty-state,
                 * but the filter UI must reflect what the user selected.
                 */
                setDateFilterState(
                    selectedFilter
                );

                setCustomDateRangeState(
                    selectedFilter === "custom"
                        ? customRange
                        : null
                );

                setFilterHasNoData(true);

                return false;
            }

            // -----------------------------------------------------
            // FILTER HAS DATA
            // -----------------------------------------------------

            setDateFilterState(
                selectedFilter
            );

            setCustomDateRangeState(
                selectedFilter === "custom"
                    ? customRange
                    : null
            );

            setFilterHasNoData(false);

            commitData({
                rows,
                total,
                page,
                size: DEFAULT_PAGE_SIZE,
                metadata: null,
            });

            // -----------------------------------------------------
            // CALCULATE ANALYTICS FROM EXACT FILTER RANGE
            // -----------------------------------------------------

            const filteredRows =
                await getBusinessDataByDateRange(
                    range.startKey,
                    range.endKey
                );

            if (
                !isRequestCurrent(requestId)
            ) {
                return false;
            }

            if (
                Array.isArray(filteredRows) &&
                filteredRows.length > 0
            ) {
                const calculated =
                    calculateAnalytics(
                        filteredRows
                    );

                setAnalytics(calculated);
            }

            return true;
        },
        [
            commitData,
            isRequestCurrent,
            loadAllData,
        ]
    );

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        // Do not touch dashboard state while Firebase auth is still
        // initializing. PrivateRoute will wait for auth before rendering the
        // protected dashboard.
        if (authLoading) {
            return undefined;
        }

        // No authenticated user: there is no dashboard dataset to load.
        // Reset the in-memory dashboard state so a different account cannot
        // inherit the previous account's visible state.
        if (!currentUser?.uid) {
            requestIdRef.current += 1;

            const resetTimer = setTimeout(() => {
                setLoading(false);
                setHasDataset(false);
                setCurrentPageData([]);
                setTotalRecords(0);
                setTotalColumns(0);
                setAnalytics(EMPTY_ANALYTICS);
                setDateFilterState("all");
                setCustomDateRangeState(null);
                setFilterHasNoData(false);
                setFilterLoading(false);
                setPageLoading(false);
                setError(null);
            }, 0);

            return () => clearTimeout(resetTimer);
        }

        let cancelled = false;

        const requestId =
            ++requestIdRef.current;

        async function initialize() {
            try {
                setLoading(true);

                setError(null);

                const metadata =
                    await getMetadata();

                const count =
                    await getBusinessDataCount();

                if (
                    cancelled ||
                    !isRequestCurrent(requestId)
                ) {
                    return;
                }

                const result =
                    await getBusinessDataPaginated(
                        1,
                        DEFAULT_PAGE_SIZE
                    );

                if (
                    cancelled ||
                    !isRequestCurrent(requestId)
                ) {
                    return;
                }

                const rows =
                    extractRows(result);

                const total =
                    extractTotal(
                        result,
                        count
                    );

                if (total <= 0) {
                    setHasDataset(false);

                    setCurrentPageData([]);

                    setTotalRecords(0);

                    setTotalColumns(0);

                    setAnalytics(EMPTY_ANALYTICS);

                    return;
                }

                setHasDataset(true);

                setDateFilterState("all");

                setCustomDateRangeState(null);

                setFilterHasNoData(false);

                commitData({
                    rows,
                    total,
                    page: 1,
                    size: DEFAULT_PAGE_SIZE,
                    metadata,
                });

                // -------------------------------------------------
                // IMPORTANT:
                // Always calculate current analytics from current
                // IndexedDB dataset.
                //
                // Do NOT blindly trust stale cached analytics.
                // -------------------------------------------------

                const allRows =
                    await getBusinessDataByDateRange(
                        "1970-01-01",
                        "2099-12-31"
                    );

                if (
                    cancelled ||
                    !isRequestCurrent(requestId)
                ) {
                    return;
                }

                if (
                    Array.isArray(allRows) &&
                    allRows.length > 0
                ) {
                    const calculated =
                        calculateAnalytics(
                            allRows
                        );

                    setAnalytics(calculated);
                } else {
                    setAnalytics(EMPTY_ANALYTICS);
                }
            } catch (err) {
                console.error(
                    "Dashboard initialization failed:",
                    err
                );

                if (
                    !cancelled &&
                    isRequestCurrent(requestId)
                ) {
                    setError(
                        err?.message ||
                        "Failed to load dashboard."
                    );
                }
            } finally {
                if (
                    !cancelled &&
                    isRequestCurrent(requestId)
                ) {
                    setLoading(false);
                }
            }
        }

        initialize();

        return () => {
            cancelled = true;
        };
    }, [
        authLoading,
        commitData,
        currentUser?.uid,
        isRequestCurrent,
    ]);

    // =========================================================
    // DATE FILTER
    // =========================================================

    const setDateFilter = useCallback(
        async (nextFilter) => {
            const selectedFilter =
                nextFilter || "all";

            /*
             * Same-filter clicks are normally no-ops.
             *
             * Exception: "all" must be allowed to reload because a new
             * upload can replace the active IndexedDB dataset while the
             * selected filter is already "all".
             */
            if (
                selectedFilter === dateFilter &&
                selectedFilter !== "custom" &&
                selectedFilter !== "all"
            ) {
                return true;
            }

            const requestId =
                ++requestIdRef.current;

            setFilterLoading(true);

            setError(null);

            try {
                return await loadFilteredData(
                    selectedFilter,
                    null,
                    requestId,
                    1
                );
            } catch (err) {
                console.error(
                    "Date filter failed:",
                    err
                );

                if (
                    isRequestCurrent(requestId)
                ) {
                    setError(
                        err?.message ||
                        "Failed to apply date filter."
                    );
                }

                return false;
            } finally {
                if (
                    isRequestCurrent(requestId)
                ) {
                    setFilterLoading(false);
                }
            }
        },
        [
            dateFilter,
            isRequestCurrent,
            loadFilteredData,
        ]
    );

    // =========================================================
    // CUSTOM RANGE
    // =========================================================

    const setCustomDateRange =
        useCallback(
            async (range) => {
                if (!range) {
                    return setDateFilter(
                        "all"
                    );
                }

                const requestId =
                    ++requestIdRef.current;

                setFilterLoading(true);

                setError(null);

                try {
                    return await loadFilteredData(
                        "custom",
                        range,
                        requestId,
                        1
                    );
                } catch (err) {
                    console.error(
                        "Custom date filter failed:",
                        err
                    );

                    if (
                        isRequestCurrent(
                            requestId
                        )
                    ) {
                        setError(
                            err?.message ||
                            "Failed to apply custom date range."
                        );
                    }

                    return false;
                } finally {
                    if (
                        isRequestCurrent(
                            requestId
                        )
                    ) {
                        setFilterLoading(false);
                    }
                }
            },
            [
                isRequestCurrent,
                loadFilteredData,
                setDateFilter,
            ]
        );

    // =========================================================
    // PAGINATION
    // =========================================================

    const fetchPage = useCallback(
        async (page = 1) => {
            const safePage =
                normalizePositiveInteger(
                    page,
                    1
                );

            const requestId =
                ++requestIdRef.current;

            setPageLoading(true);

            setError(null);

            try {
                return await loadFilteredData(
                    dateFilter,
                    dateFilter === "custom"
                        ? customDateRange
                        : null,
                    requestId,
                    safePage
                );
            } catch (err) {
                console.error(
                    "Dashboard page loading failed:",
                    err
                );

                if (
                    isRequestCurrent(requestId)
                ) {
                    setError(
                        err?.message ||
                        "Failed to load dashboard page."
                    );
                }

                return false;
            } finally {
                if (
                    isRequestCurrent(requestId)
                ) {
                    setPageLoading(false);
                }
            }
        },
        [
            customDateRange,
            dateFilter,
            isRequestCurrent,
            loadFilteredData,
        ]
    );

    // =========================================================
    // MANUAL REFRESH
    // =========================================================

    const refreshDashboardData =
        useCallback(
            async () => {
                const requestId =
                    ++requestIdRef.current;

                setFilterLoading(true);

                setError(null);

                try {
                    return await loadFilteredData(
                        dateFilter,
                        dateFilter === "custom"
                            ? customDateRange
                            : null,
                        requestId,
                        currentPage
                    );
                } catch (err) {
                    console.error(
                        "Dashboard refresh failed:",
                        err
                    );

                    if (
                        isRequestCurrent(
                            requestId
                        )
                    ) {
                        setError(
                            err?.message ||
                            "Failed to refresh dashboard."
                        );
                    }

                    return false;
                } finally {
                    if (
                        isRequestCurrent(
                            requestId
                        )
                    ) {
                        setFilterLoading(false);

                        setPageLoading(false);
                    }
                }
            },
            [
                currentPage,
                customDateRange,
                dateFilter,
                isRequestCurrent,
                loadFilteredData,
            ]
        );

    // =========================================================
    // CONTEXT VALUE
    // =========================================================

    const value = useMemo(
        () => ({
            // Dataset
            hasDataset,

            // Data
            data: currentPageData,

            filteredData:
                currentPageData,

            currentPageData,

            // Metadata
            totalRecords,

            totalColumns,

            // Analytics
            analytics,

            // Pagination
            currentPage,

            pageSize,

            fetchPage,

            // Loading
            loading,

            pageLoading,

            filterLoading,

            // Filter
            filterHasNoData,

            dateFilter,

            setDateFilter,

            customDateRange,

            customRange:
                customDateRange,

            setCustomDateRange,

            // Errors
            error,

            // Refresh
            refreshDashboard:
                refreshDashboardData,

            refreshDashboardData,

            retry:
                refreshDashboardData,
        }),
        [
            analytics,
            currentPage,
            currentPageData,
            customDateRange,
            dateFilter,
            error,
            fetchPage,
            filterHasNoData,
            filterLoading,
            hasDataset,
            loading,
            pageLoading,
            pageSize,
            refreshDashboardData,
            setCustomDateRange,
            setDateFilter,
            totalColumns,
            totalRecords,
        ]
    );

    return (
        <DashboardDataContext.Provider
            value={value}
        >
            {children}
        </DashboardDataContext.Provider>
    );
}

export default DashboardDataProvider;