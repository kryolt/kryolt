/**
 * Date filtering utility for Kryolt.
 *
 * Rules:
 * - Never creates fake data.
 * - Invalid/missing dates NEVER pass a date filter.
 * - "today" means today's actual local calendar date.
 * - 7days = today + previous 6 calendar days.
 * - 30days = today + previous 29 calendar days.
 * - month = current calendar month.
 * - year = current calendar year.
 * - custom = inclusive start/end dates.
 */

const DATE_FIELDS = [
    "Date",
    "OrderDate",
    "orderDate",
    "date",
    "Order Date",
    "Transaction Date",
];

function getRowDateValue(row) {
    if (!row || typeof row !== "object") {
        return null;
    }

    for (const field of DATE_FIELDS) {
        if (
            row[field] !== undefined &&
            row[field] !== null &&
            String(row[field]).trim() !== ""
        ) {
            return row[field];
        }
    }

    return null;
}

/**
 * Convert supported values to a local Date.
 *
 * Handles:
 * - Date
 * - YYYY-MM-DD
 * - YYYY/MM/DD
 * - normal JS date strings
 */
function parseLocalDate(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            return null;
        }

        return new Date(value);
    }

    const text = String(value).trim();

    if (!text) {
        return null;
    }

    // YYYY-MM-DD / YYYY/MM/DD
    const isoLike =
        text.match(
            /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/
        );

    if (isoLike) {
        const year = Number(isoLike[1]);
        const month = Number(isoLike[2]) - 1;
        const day = Number(isoLike[3]);

        const result =
            new Date(
                year,
                month,
                day
            );

        if (
            result.getFullYear() === year &&
            result.getMonth() === month &&
            result.getDate() === day
        ) {
            return result;
        }

        return null;
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const indianLike =
        text.match(
            /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/
        );

    if (indianLike) {
        const day = Number(indianLike[1]);
        const month = Number(indianLike[2]) - 1;
        const year = Number(indianLike[3]);

        const result =
            new Date(
                year,
                month,
                day
            );

        if (
            result.getFullYear() === year &&
            result.getMonth() === month &&
            result.getDate() === day
        ) {
            return result;
        }

        return null;
    }

    const parsed = new Date(text);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

function startOfDay(date) {
    const result = new Date(date);

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;
}

function endOfDay(date) {
    const result = new Date(date);

    result.setHours(
        23,
        59,
        59,
        999
    );

    return result;
}

function normalizeCustomDate(value) {
    const parsed =
        parseLocalDate(value);

    return parsed
        ? startOfDay(parsed)
        : null;
}

/**
 * Returns the local date range for a filter.
 */
export function getDateRange(
    filter = "all",
    customRange = null
) {
    const now = new Date();

    const todayStart =
        startOfDay(now);

    const todayEnd =
        endOfDay(now);

    switch (String(filter).toLowerCase()) {
        case "all":
            return null;

        case "today":
            return {
                start: todayStart,
                end: todayEnd,
            };

        case "7days": {
            const start =
                new Date(todayStart);

            start.setDate(
                start.getDate() - 6
            );

            return {
                start,
                end: todayEnd,
            };
        }

        case "30days": {
            const start =
                new Date(todayStart);

            start.setDate(
                start.getDate() - 29
            );

            return {
                start,
                end: todayEnd,
            };
        }

        case "month": {
            const start =
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                );

            return {
                start: startOfDay(start),
                end: todayEnd,
            };
        }

        case "year": {
            const start =
                new Date(
                    now.getFullYear(),
                    0,
                    1
                );

            return {
                start: startOfDay(start),
                end: todayEnd,
            };
        }

        case "custom": {
            const start =
                normalizeCustomDate(
                    customRange?.startDate ??
                    customRange?.start ??
                    customRange?.from
                );

            const end =
                normalizeCustomDate(
                    customRange?.endDate ??
                    customRange?.end ??
                    customRange?.to
                );

            if (!start || !end) {
                return null;
            }

            if (start > end) {
                return {
                    start: end,
                    end: endOfDay(start),
                };
            }

            return {
                start,
                end: endOfDay(end),
            };
        }

        default:
            return null;
    }
}

/**
 * Main filtering function.
 */
export function filterDataByDate(
    data = [],
    filter = "all",
    customRange = null
) {
    if (!Array.isArray(data)) {
        return [];
    }

    const normalizedFilter =
        String(filter || "all")
            .trim()
            .toLowerCase();

    // ALL means exactly the uploaded dataset.
    if (normalizedFilter === "all") {
        return data;
    }

    const range =
        getDateRange(
            normalizedFilter,
            customRange
        );

    // Invalid custom range => NO DATA.
    // Never fallback to all data.
    if (!range) {
        return [];
    }

    return data.filter((row) => {
        const rawDate =
            getRowDateValue(row);

        // Critical rule:
        // A row without a valid date cannot belong
        // to a date-based filter.
        const rowDate =
            parseLocalDate(rawDate);

        if (!rowDate) {
            return false;
        }

        return (
            rowDate >= range.start &&
            rowDate <= range.end
        );
    });
}

export function hasDataForFilter(
    data = [],
    filter = "all",
    customRange = null
) {
    return (
        filterDataByDate(
            data,
            filter,
            customRange
        ).length > 0
    );
}

export default filterDataByDate;