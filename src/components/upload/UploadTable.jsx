import { openDB } from "idb";

const DB_NAME = "KryoltBusinessDB";
const DB_VERSION = 2;

const STORES = {
    METADATA: "metadata",
    CHUNKS: "data_chunks",
    ANALYTICS: "analytics",
    DATE_INDEX: "date_index",
};

const DEFAULT_CHUNK_SIZE = 5000;

/* -------------------------------------------------------------------------- */
/*                                  DATABASE                                  */
/* -------------------------------------------------------------------------- */

export async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORES.METADATA)) {
                db.createObjectStore(STORES.METADATA);
            }

            if (!db.objectStoreNames.contains(STORES.CHUNKS)) {
                db.createObjectStore(STORES.CHUNKS);
            }

            if (!db.objectStoreNames.contains(STORES.ANALYTICS)) {
                db.createObjectStore(STORES.ANALYTICS);
            }

            if (!db.objectStoreNames.contains(STORES.DATE_INDEX)) {
                db.createObjectStore(STORES.DATE_INDEX);
            }
        },
    });
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function normalizeDate(value) {
    if (!value) return null;

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }

    const stringValue = String(value).trim();

    if (!stringValue) return null;

    // YYYY-MM-DD
    const directMatch = stringValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (directMatch) {
        return `${directMatch[1]}-${directMatch[2]}-${directMatch[3]}`;
    }

    const parsed = new Date(stringValue);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed.toISOString().slice(0, 10);
}

function getRowDate(row) {
    if (!row || typeof row !== "object") return null;

    const possibleKeys = [
        "date",
        "Date",
        "DATE",
        "transactionDate",
        "transaction_date",
        "Transaction Date",
        "saleDate",
        "sale_date",
        "Sale Date",
        "orderDate",
        "order_date",
        "Order Date",
    ];

    for (const key of possibleKeys) {
        if (row[key] !== undefined && row[key] !== null) {
            const normalized = normalizeDate(row[key]);

            if (normalized) {
                return normalized;
            }
        }
    }

    return null;
}

function emptyPage(page = 1, pageSize = 50) {
    return {
        data: [],
        rows: [],
        page,
        pageSize,
        totalRows: 0,
        totalPages: 0,
    };
}

function createPage(data, page, pageSize, totalRows) {
    return {
        data,
        rows: data,
        page,
        pageSize,
        totalRows,
        totalPages: Math.ceil(totalRows / pageSize),
    };
}

/* -------------------------------------------------------------------------- */
/*                               CLEAR STORAGE                                */
/* -------------------------------------------------------------------------- */

export async function clearBusinessData() {
    const db = await getDB();

    const tx = db.transaction(
        [
            STORES.METADATA,
            STORES.CHUNKS,
            STORES.ANALYTICS,
            STORES.DATE_INDEX,
        ],
        "readwrite"
    );

    await Promise.all([
        tx.objectStore(STORES.METADATA).clear(),
        tx.objectStore(STORES.CHUNKS).clear(),
        tx.objectStore(STORES.ANALYTICS).clear(),
        tx.objectStore(STORES.DATE_INDEX).clear(),
    ]);

    await tx.done;
}

/* -------------------------------------------------------------------------- */
/*                              SAVE BUSINESS DATA                             */
/* -------------------------------------------------------------------------- */

/**
 * Main chunk writer.
 *
 * chunks:
 * [
 *   [row,row,row...],
 *   [row,row,row...],
 *   ...
 * ]
 *
 * dateMap:
 * {
 *   "2026-08-01": [0,1,2],
 *   "2026-08-02": [3,4,5]
 * }
 */
export async function saveBusinessDataChunks(
    chunks,
    dateMap = {},
    metadata = {}
) {
    const db = await getDB();

    const chunkSize = metadata.chunkSize || DEFAULT_CHUNK_SIZE;

    const normalizedMetadata = {
        ...metadata,
        chunkSize,
        totalRows:
            metadata.totalRows ??
            chunks.reduce(
                (total, chunk) =>
                    total + (Array.isArray(chunk) ? chunk.length : 0),
                0
            ),
        savedAt: Date.now(),
    };

    const tx = db.transaction(
        [
            STORES.METADATA,
            STORES.CHUNKS,
            STORES.DATE_INDEX,
        ],
        "readwrite"
    );

    const metadataStore = tx.objectStore(STORES.METADATA);
    const chunkStore = tx.objectStore(STORES.CHUNKS);
    const dateStore = tx.objectStore(STORES.DATE_INDEX);

    await metadataStore.put(normalizedMetadata, "current");

    await chunkStore.clear();
    await dateStore.clear();

    /*
     * IndexedDB can handle a lot of puts inside one transaction,
     * but yielding between batches keeps the browser responsive.
     */
    const WRITE_BATCH_SIZE = 20;

    for (let i = 0; i < chunks.length; i++) {
        const chunk = Array.isArray(chunks[i]) ? chunks[i] : [];

        await chunkStore.put(chunk, i);

        if ((i + 1) % WRITE_BATCH_SIZE === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }

    await dateStore.put(dateMap || {}, "index");

    await tx.done;

    return normalizedMetadata;
}

/**
 * Compatibility wrapper.
 *
 * Existing UploadCSV.jsx code can continue using:
 * saveBusinessData(...)
 */
export async function saveBusinessData(
    rows = [],
    options = {}
) {
    if (!Array.isArray(rows)) {
        throw new TypeError("saveBusinessData expects an array of rows.");
    }

    const chunkSize =
        options.chunkSize ||
        options.metadata?.chunkSize ||
        DEFAULT_CHUNK_SIZE;

    const chunks = [];

    for (let i = 0; i < rows.length; i += chunkSize) {
        chunks.push(rows.slice(i, i + chunkSize));
    }

    const dateMap = {};

    for (let i = 0; i < rows.length; i++) {
        const date = getRowDate(rows[i]);

        if (!date) continue;

        if (!dateMap[date]) {
            dateMap[date] = [];
        }

        dateMap[date].push(i);
    }

    const dates = Object.keys(dateMap).sort();

    const metadata = {
        ...(options.metadata || {}),
        totalRows: rows.length,
        totalCount: rows.length,
        count: rows.length,
        chunkSize,
        minDate: dates[0] || null,
        maxDate: dates[dates.length - 1] || null,
        savedAt: Date.now(),
    };

    await saveBusinessDataChunks(
        chunks,
        dateMap,
        metadata
    );

    return metadata;
}

/* -------------------------------------------------------------------------- */
/*                                  METADATA                                  */
/* -------------------------------------------------------------------------- */

export async function saveMetadata(metadata) {
    const db = await getDB();

    await db.put(
        STORES.METADATA,
        {
            ...(metadata || {}),
            savedAt: Date.now(),
        },
        "current"
    );
}

export async function getMetadata() {
    const db = await getDB();

    return (
        (await db.get(STORES.METADATA, "current")) ||
        null
    );
}

/* -------------------------------------------------------------------------- */
/*                                  ANALYTICS                                 */
/* -------------------------------------------------------------------------- */

export async function saveAnalytics(analytics) {
    const db = await getDB();

    await db.put(
        STORES.ANALYTICS,
        analytics,
        "current"
    );
}

export async function getAnalytics() {
    const db = await getDB();

    return (
        (await db.get(STORES.ANALYTICS, "current")) ||
        null
    );
}

/* -------------------------------------------------------------------------- */
/*                                  COUNTERS                                  */
/* -------------------------------------------------------------------------- */

export async function getBusinessDataCount() {
    const metadata = await getMetadata();

    return (
        metadata?.totalRows ??
        metadata?.totalCount ??
        metadata?.count ??
        0
    );
}

/* -------------------------------------------------------------------------- */
/*                              PAGINATED ALL DATA                             */
/* -------------------------------------------------------------------------- */

export async function getBusinessDataPaginated(
    page = 1,
    pageSize = 50
) {
    const db = await getDB();
    const metadata = await getMetadata();

    const total =
        metadata?.totalRows ??
        metadata?.totalCount ??
        0;

    const chunkSize =
        metadata?.chunkSize ||
        DEFAULT_CHUNK_SIZE;

    if (!total) {
        return emptyPage(page, pageSize);
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(
        1,
        Number(pageSize) || 50
    );

    const startIndex =
        (safePage - 1) * safePageSize;

    if (startIndex >= total) {
        return createPage(
            [],
            safePage,
            safePageSize,
            total
        );
    }

    const endIndex = Math.min(
        startIndex + safePageSize,
        total
    );

    const startChunk =
        Math.floor(startIndex / chunkSize);

    const endChunk =
        Math.floor((endIndex - 1) / chunkSize);

    const chunkCount =
        endChunk - startChunk + 1;

    const rows = [];

    /*
     * Usually only one chunk is required for a page.
     * If pageSize crosses a chunk boundary,
     * at most a few chunks are read.
     */
    for (
        let chunkIndex = startChunk;
        chunkIndex <= endChunk;
        chunkIndex++
    ) {
        const chunk = await db.get(
            STORES.CHUNKS,
            chunkIndex
        );

        if (Array.isArray(chunk)) {
            rows.push(...chunk);
        }
    }

    const offset =
        startIndex -
        startChunk * chunkSize;

    const result = rows.slice(
        offset,
        offset + (endIndex - startIndex)
    );

    return {
        data: result,
        rows: result,
        page: safePage,
        pageSize: safePageSize,
        totalRows: total,
        totalPages: Math.ceil(
            total / safePageSize
        ),
        chunkCount,
    };
}

/* -------------------------------------------------------------------------- */
/*                                DATE INDEX                                  */
/* -------------------------------------------------------------------------- */

export async function getDateIndex() {
    const db = await getDB();

    return (
        (await db.get(
            STORES.DATE_INDEX,
            "index"
        )) || {}
    );
}

/* -------------------------------------------------------------------------- */
/*                              FILTER RANGE                                  */
/* -------------------------------------------------------------------------- */

export async function getFilterRange(
    filter = "all",
    customRange = null
) {
    const metadata = await getMetadata();

    if (!metadata) {
        return {
            startKey: null,
            endKey: null,
        };
    }

    const minDate =
        normalizeDate(metadata.minDate);

    const maxDate =
        normalizeDate(metadata.maxDate);

    if (!minDate || !maxDate) {
        return {
            startKey: null,
            endKey: null,
        };
    }

    /*
     * IMPORTANT:
     *
     * "all" must represent the COMPLETE dataset.
     * Never convert it to today's date.
     */
    if (filter === "all") {
        return {
            startKey: minDate,
            endKey: maxDate,
        };
    }

    if (filter === "today") {
        return {
            startKey: maxDate,
            endKey: maxDate,
        };
    }

    const referenceDate = new Date(
        `${maxDate}T00:00:00`
    );

    if (Number.isNaN(referenceDate.getTime())) {
        return {
            startKey: minDate,
            endKey: maxDate,
        };
    }

    if (filter === "7days") {
        const start = new Date(referenceDate);

        start.setDate(
            start.getDate() - 6
        );

        return {
            startKey: normalizeDate(start),
            endKey: maxDate,
        };
    }

    if (filter === "30days") {
        const start = new Date(referenceDate);

        start.setDate(
            start.getDate() - 29
        );

        return {
            startKey: normalizeDate(start),
            endKey: maxDate,
        };
    }

    if (
        filter === "month" ||
        filter === "thisMonth"
    ) {
        const start = new Date(
            referenceDate.getFullYear(),
            referenceDate.getMonth(),
            1
        );

        return {
            startKey: normalizeDate(start),
            endKey: maxDate,
        };
    }

    if (
        filter === "year" ||
        filter === "thisYear"
    ) {
        const start = new Date(
            referenceDate.getFullYear(),
            0,
            1
        );

        return {
            startKey: normalizeDate(start),
            endKey: maxDate,
        };
    }

    if (
        filter === "custom" &&
        customRange
    ) {
        const start =
            customRange.startDate ||
            customRange.start ||
            customRange.from;

        const end =
            customRange.endDate ||
            customRange.end ||
            customRange.to;

        const startKey = normalizeDate(start);
        const endKey = normalizeDate(end);

        if (startKey && endKey) {
            return {
                startKey,
                endKey,
            };
        }
    }

    return {
        startKey: minDate,
        endKey: maxDate,
    };
}

/* -------------------------------------------------------------------------- */
/*                         DATE RANGE - RAW ROWS                              */
/* -------------------------------------------------------------------------- */

export async function getBusinessDataByDateRange(
    startKey,
    endKey
) {
    if (!startKey || !endKey) {
        return [];
    }

    const normalizedStart =
        normalizeDate(startKey);

    const normalizedEnd =
        normalizeDate(endKey);

    if (!normalizedStart || !normalizedEnd) {
        return [];
    }

    const db = await getDB();

    const dateIndex =
        await getDateIndex();

    const metadata =
        await getMetadata();

    const chunkSize =
        metadata?.chunkSize ||
        DEFAULT_CHUNK_SIZE;

    /*
     * First use the date index.
     *
     * We don't scan all 200k rows.
     * We only discover positions belonging
     * to the requested date range.
     */
    const matchingPositions = [];

    const matchingChunkIndices =
        new Set();

    for (
        const [date, positions] of
        Object.entries(dateIndex)
    ) {
        if (
            date < normalizedStart ||
            date > normalizedEnd
        ) {
            continue;
        }

        if (!Array.isArray(positions)) {
            continue;
        }

        for (const position of positions) {
            if (
                typeof position !== "number" ||
                position < 0
            ) {
                continue;
            }

            matchingPositions.push(position);

            matchingChunkIndices.add(
                Math.floor(
                    position / chunkSize
                )
            );
        }
    }

    if (!matchingPositions.length) {
        return [];
    }

    /*
     * Read each required chunk only once.
     */
    const chunkCache = new Map();

    for (
        const chunkIndex of
        matchingChunkIndices
    ) {
        const chunk =
            (await db.get(
                STORES.CHUNKS,
                chunkIndex
            )) || [];

        chunkCache.set(
            chunkIndex,
            Array.isArray(chunk)
                ? chunk
                : []
        );
    }

    const results =
        new Array(
            matchingPositions.length
        );

    for (
        let i = 0;
        i < matchingPositions.length;
        i++
    ) {
        const position =
            matchingPositions[i];

        const chunkIndex =
            Math.floor(
                position / chunkSize
            );

        const offset =
            position % chunkSize;

        const chunk =
            chunkCache.get(
                chunkIndex
            );

        if (
            chunk &&
            chunk[offset] !== undefined
        ) {
            results[i] =
                chunk[offset];
        }
    }

    return results.filter(
        (row) => row !== undefined
    );
}

/* -------------------------------------------------------------------------- */
/*                     FILTERED PAGINATION                                   */
/* -------------------------------------------------------------------------- */

/**
 * IMPORTANT PERFORMANCE NOTE
 *
 * This function intentionally keeps "all"
 * completely separate from date filtering.
 *
 * ALL:
 *     O(1) chunk reads for normal pages.
 *
 * DATE FILTER:
 *     Reads only chunks referenced by date index.
 *
 * This prevents 200k rows from being loaded
 * into React every time the filter changes.
 */
export async function getBusinessDataFilteredPaginated(
    page = 1,
    pageSize = 50,
    filter = "all",
    customRange = null
) {
    const safePage = Math.max(
        1,
        Number(page) || 1
    );

    const safePageSize = Math.max(
        1,
        Number(pageSize) || 50
    );

    /*
     * ALL DATA
     *
     * Never use getBusinessDataByDateRange()
     * here.
     *
     * It must directly read only the requested
     * page from IndexedDB.
     */
    if (
        !filter ||
        filter === "all"
    ) {
        return getBusinessDataPaginated(
            safePage,
            safePageSize
        );
    }

    const {
        startKey,
        endKey,
    } = await getFilterRange(
        filter,
        customRange
    );

    if (!startKey || !endKey) {
        return emptyPage(
            safePage,
            safePageSize
        );
    }

    /*
     * For date filters we first get matching
     * positions from the date index.
     *
     * This version still returns only the requested
     * page to the UI.
     */
    const db = await getDB();

    const dateIndex =
        await getDateIndex();

    const metadata =
        await getMetadata();

    const chunkSize =
        metadata?.chunkSize ||
        DEFAULT_CHUNK_SIZE;

    const matchingPositions = [];

    const matchingChunkIndices =
        new Set();

    for (
        const [date, positions] of
        Object.entries(dateIndex)
    ) {
        if (
            date < startKey ||
            date > endKey
        ) {
            continue;
        }

        if (!Array.isArray(positions)) {
            continue;
        }

        for (const position of positions) {
            if (
                typeof position !== "number" ||
                position < 0
            ) {
                continue;
            }

            matchingPositions.push(position);

            matchingChunkIndices.add(
                Math.floor(
                    position / chunkSize
                )
            );
        }
    }

    if (!matchingPositions.length) {
        return emptyPage(
            safePage,
            safePageSize
        );
    }

    /*
     * Sort positions so filtered data follows
     * original upload order.
     */
    matchingPositions.sort(
        (a, b) => a - b
    );

    const totalRows =
        matchingPositions.length;

    const totalPages =
        Math.ceil(
            totalRows / safePageSize
        );

    if (
        safePage > totalPages
    ) {
        return emptyPage(
            safePage,
            safePageSize
        );
    }

    const start =
        (safePage - 1) *
        safePageSize;

    const end =
        Math.min(
            start + safePageSize,
            totalRows
        );

    const pagePositions =
        matchingPositions.slice(
            start,
            end
        );

    /*
     * Only read chunks required by THIS PAGE.
     *
     * This is the important optimization.
     *
     * We don't load all matching rows.
     * We don't load all matching chunks.
     * We only load chunks containing the
     * requested page.
     */
    const pageChunkIndices =
        new Set();

    for (
        const position of pagePositions
    ) {
        pageChunkIndices.add(
            Math.floor(
                position / chunkSize
            )
        );
    }

    const chunkCache = new Map();

    for (
        const chunkIndex of
        pageChunkIndices
    ) {
        const chunk =
            (await db.get(
                STORES.CHUNKS,
                chunkIndex
            )) || [];

        chunkCache.set(
            chunkIndex,
            Array.isArray(chunk)
                ? chunk
                : []
        );
    }

    const result = [];

    for (
        const position of pagePositions
    ) {
        const chunkIndex =
            Math.floor(
                position / chunkSize
            );

        const offset =
            position % chunkSize;

        const chunk =
            chunkCache.get(
                chunkIndex
            );

        if (
            chunk &&
            chunk[offset] !== undefined
        ) {
            result.push(
                chunk[offset]
            );
        }
    }

    return {
        data: result,
        rows: result,
        page: safePage,
        pageSize: safePageSize,
        totalRows,
        totalPages,
    };
}

/* -------------------------------------------------------------------------- */
/*                              UPLOAD HISTORY                                */
/* -------------------------------------------------------------------------- */

/*
 * Compatibility functions.
 *
 * Your current UploadTable.jsx expects
 * deleteUploadHistory.
 *
 * We keep these functions so changing the
 * storage implementation doesn't break imports.
 */

const UPLOAD_HISTORY_KEY =
    "uploadHistory";

export async function getUploadHistory() {
    const db = await getDB();

    return (
        (await db.get(
            STORES.METADATA,
            UPLOAD_HISTORY_KEY
        )) || []
    );
}

export async function saveUploadHistory(
    history
) {
    const db = await getDB();

    await db.put(
        STORES.METADATA,
        Array.isArray(history)
            ? history
            : [],
        UPLOAD_HISTORY_KEY
    );
}

export async function deleteUploadHistory(
    uploadId = null
) {
    const db = await getDB();

    if (!uploadId) {
        await db.delete(
            STORES.METADATA,
            UPLOAD_HISTORY_KEY
        );

        return;
    }

    const history =
        await getUploadHistory();

    const filtered =
        history.filter(
            (item) =>
                item?.id !== uploadId &&
                item?.uploadId !== uploadId
        );

    await db.put(
        STORES.METADATA,
        filtered,
        UPLOAD_HISTORY_KEY
    );
}

/* -------------------------------------------------------------------------- */
/*                             DELETE DATA                                    */
/* -------------------------------------------------------------------------- */

export async function deleteBusinessData() {
    return clearBusinessData();
}

/* -------------------------------------------------------------------------- */
/*                                DEFAULT                                     */
/* -------------------------------------------------------------------------- */

export default {
    getDB,
    clearBusinessData,

    saveBusinessData,
    saveBusinessDataChunks,

    saveMetadata,
    getMetadata,

    saveAnalytics,
    getAnalytics,

    getBusinessDataCount,
    getBusinessDataPaginated,

    getDateIndex,
    getFilterRange,
    getBusinessDataByDateRange,
    getBusinessDataFilteredPaginated,

    getUploadHistory,
    saveUploadHistory,
    deleteUploadHistory,

    deleteBusinessData,
};