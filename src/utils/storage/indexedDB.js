import { openDB } from "idb";

/* ============================================================
   KRYOLT INDEXED DB
   ============================================================ */

const DB_NAME = "KryoltBusinessDB";
const DB_VERSION = 3;

export const DATASET_CHUNK_SIZE = 5000;
export const CHUNK_SIZE = DATASET_CHUNK_SIZE;

export const STORES = {
    METADATA: "metadata",
    CHUNKS: "data_chunks",
    ANALYTICS: "analytics",
    DATE_INDEX: "date_index",
    UPLOAD_HISTORY: "upload_history",
};

const ALL_STORES = Object.values(STORES);

let dbPromise = null;

/* ============================================================
   DATABASE
   ============================================================ */

function createMissingStores(db) {
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

    if (!db.objectStoreNames.contains(STORES.UPLOAD_HISTORY)) {
        db.createObjectStore(STORES.UPLOAD_HISTORY, {
            keyPath: "id",
            autoIncrement: true,
        });
    }
}

async function openAndRepairDatabase() {
    let existingDB;

    try {
        existingDB = await openDB(DB_NAME);
    } catch {
        return openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                createMissingStores(db);
            },
        });
    }

    const existingVersion = existingDB.version;

    const missingStore = ALL_STORES.some(
        (storeName) =>
            !existingDB.objectStoreNames.contains(storeName)
    );

    existingDB.close();

    if (!missingStore) {
        return openDB(DB_NAME, existingVersion);
    }

    const nextVersion = Math.max(
        DB_VERSION,
        existingVersion + 1
    );

    return openDB(DB_NAME, nextVersion, {
        upgrade(db) {
            createMissingStores(db);
        },
    });
}

export async function getDB() {
    if (!dbPromise) {
        dbPromise = openAndRepairDatabase().catch((error) => {
            dbPromise = null;
            throw error;
        });
    }

    return dbPromise;
}

/* ============================================================
   HELPERS
   ============================================================ */

function safeNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}

function safePositiveInteger(value, fallback) {
    const number = Math.floor(Number(value));

    return Number.isFinite(number) && number > 0
        ? number
        : fallback;
}

/* ============================================================
   DATE HELPERS
   ============================================================ */

function getRowDateValue(row) {
    if (!row || typeof row !== "object") {
        return null;
    }

    const possibleKeys = [
        "Date",
        "date",
        "OrderDate",
        "orderDate",
        "Order Date",
        "Transaction Date",
        "TransactionDate",
        "Sale Date",
        "Sales Date",
    ];

    for (const key of possibleKeys) {
        const value = row[key];

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            return value;
        }
    }

    return null;
}

/**
 * Converts date values to local YYYY-MM-DD.
 *
 * Supports:
 * YYYY-MM-DD
 * DD/MM/YYYY
 * DD-MM-YYYY
 * Date objects
 * normal JS date strings
 */
function toDateKey(value) {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return null;
    }

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            return null;
        }

        return [
            value.getFullYear(),
            String(value.getMonth() + 1).padStart(2, "0"),
            String(value.getDate()).padStart(2, "0"),
        ].join("-");
    }

    const text = String(value).trim();

    /* YYYY-MM-DD */
    const isoMatch = text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})/
    );

    if (isoMatch) {
        const year = isoMatch[1];
        const month = Number(isoMatch[2]);
        const day = Number(isoMatch[3]);

        if (
            month >= 1 &&
            month <= 12 &&
            day >= 1 &&
            day <= 31
        ) {
            return `${year}-${String(month).padStart(
                2,
                "0"
            )}-${String(day).padStart(2, "0")}`;
        }
    }

    /* DD/MM/YYYY or DD-MM-YYYY */
    const separatedMatch = text.match(
        /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
    );

    if (separatedMatch) {
        const first = Number(separatedMatch[1]);
        const second = Number(separatedMatch[2]);
        const year = separatedMatch[3];

        let day;
        let month;

        /*
         * If one side is > 12, format is obvious.
         */
        if (first > 12 && second <= 12) {
            day = first;
            month = second;
        } else if (
            second > 12 &&
            first <= 12
        ) {
            month = first;
            day = second;
        } else {
            /*
             * Kryolt business data convention:
             * DD/MM/YYYY
             */
            day = first;
            month = second;
        }

        if (
            month >= 1 &&
            month <= 12 &&
            day >= 1 &&
            day <= 31
        ) {
            return `${year}-${String(month).padStart(
                2,
                "0"
            )}-${String(day).padStart(2, "0")}`;
        }
    }

    const parsed = new Date(text);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return [
        parsed.getFullYear(),
        String(parsed.getMonth() + 1).padStart(2, "0"),
        String(parsed.getDate()).padStart(2, "0"),
    ].join("-");
}

function buildDateIndex(data) {
    const dateMap = {};

    let minDate = null;
    let maxDate = null;

    for (
        let index = 0;
        index < data.length;
        index += 1
    ) {
        const dateKey = toDateKey(
            getRowDateValue(data[index])
        );

        if (!dateKey) {
            continue;
        }

        if (!dateMap[dateKey]) {
            dateMap[dateKey] = [];
        }

        dateMap[dateKey].push(index);

        if (!minDate || dateKey < minDate) {
            minDate = dateKey;
        }

        if (!maxDate || dateKey > maxDate) {
            maxDate = dateKey;
        }
    }

    return {
        dateMap,
        minDate,
        maxDate,
    };
}

/* ============================================================
   BUSINESS DATA
   ============================================================ */

export async function clearBusinessData() {
    const db = await getDB();

    const transaction = db.transaction(
        [
            STORES.METADATA,
            STORES.CHUNKS,
            STORES.ANALYTICS,
            STORES.DATE_INDEX,
        ],
        "readwrite"
    );

    await transaction
        .objectStore(STORES.METADATA)
        .clear();

    await transaction
        .objectStore(STORES.CHUNKS)
        .clear();

    await transaction
        .objectStore(STORES.ANALYTICS)
        .clear();

    await transaction
        .objectStore(STORES.DATE_INDEX)
        .clear();

    await transaction.done;
}

/**
 * Saves complete active dataset.
 *
 * New upload replaces previous active dataset.
 */
export async function saveBusinessData(data) {
    if (!Array.isArray(data)) {
        throw new Error(
            "Invalid business data format."
        );
    }

    if (data.length === 0) {
        throw new Error(
            "The uploaded dataset contains no usable rows."
        );
    }

    const db = await getDB();

    const {
        dateMap,
        minDate,
        maxDate,
    } = buildDateIndex(data);

    const totalRows = data.length;

    const firstObject = data.find(
        (row) =>
            row &&
            typeof row === "object" &&
            !Array.isArray(row)
    );

    const totalColumns = firstObject
        ? Object.keys(firstObject).length
        : 0;

    const chunkSize =
        DATASET_CHUNK_SIZE;

    const totalChunks =
        Math.ceil(
            totalRows / chunkSize
        );

    const datasetId =
        `dataset-${Date.now()}`;

    const transaction = db.transaction(
        [
            STORES.METADATA,
            STORES.CHUNKS,
            STORES.ANALYTICS,
            STORES.DATE_INDEX,
        ],
        "readwrite"
    );

    const metadataStore =
        transaction.objectStore(
            STORES.METADATA
        );

    const chunkStore =
        transaction.objectStore(
            STORES.CHUNKS
        );

    const analyticsStore =
        transaction.objectStore(
            STORES.ANALYTICS
        );

    const dateStore =
        transaction.objectStore(
            STORES.DATE_INDEX
        );

    /*
     * Replace active dataset.
     */
    await chunkStore.clear();

    await analyticsStore.clear();

    await dateStore.clear();

    /*
     * Write chunks.
     */
    for (
        let index = 0;
        index < totalChunks;
        index += 1
    ) {
        const start =
            index * chunkSize;

        const end =
            Math.min(
                start + chunkSize,
                totalRows
            );

        await chunkStore.put(
            data.slice(start, end),
            index
        );
    }

    /*
     * Metadata.
     */
    await metadataStore.put(
        {
            datasetId,

            totalRows,
            totalCount: totalRows,
            rows: totalRows,

            totalColumns,

            totalChunks,
            chunkCount: totalChunks,
            chunkSize,

            minDate,
            maxDate,

            updatedAt:
                new Date().toISOString(),
        },
        "current"
    );

    /*
     * Date index.
     */
    await dateStore.put(
        dateMap,
        "index"
    );

    await transaction.done;
}

/* ============================================================
   CHUNK SAVE API
   ============================================================ */

export async function saveBusinessDataChunks(
    chunks = [],
    dateMap = {}
) {
    if (!Array.isArray(chunks)) {
        throw new Error(
            "Invalid business data chunks."
        );
    }

    const db = await getDB();

    const transaction = db.transaction(
        [
            STORES.CHUNKS,
            STORES.DATE_INDEX,
        ],
        "readwrite"
    );

    const chunkStore =
        transaction.objectStore(
            STORES.CHUNKS
        );

    const dateStore =
        transaction.objectStore(
            STORES.DATE_INDEX
        );

    await chunkStore.clear();

    await dateStore.clear();

    for (
        let index = 0;
        index < chunks.length;
        index += 1
    ) {
        await chunkStore.put(
            chunks[index],
            index
        );
    }

    await dateStore.put(
        dateMap || {},
        "index"
    );

    await transaction.done;
}

/* ============================================================
   METADATA
   ============================================================ */

export async function saveMetadata(
    metadata = {}
) {
    const db = await getDB();

    const existing =
        (await db.get(
            STORES.METADATA,
            "current"
        )) || {};

    await db.put(
        STORES.METADATA,
        {
            ...existing,
            ...metadata,
            updatedAt:
                new Date().toISOString(),
        },
        "current"
    );
}

export async function getMetadata() {
    const db = await getDB();

    return (
        (await db.get(
            STORES.METADATA,
            "current"
        )) || null
    );
}

export async function getBusinessDataCount() {
    const metadata =
        await getMetadata();

    return safeNumber(
        metadata?.totalRows ??
        metadata?.totalCount ??
        metadata?.rows ??
        metadata?.count,
        0
    );
}

/* ============================================================
   ANALYTICS CACHE
   ============================================================ */

export async function saveAnalytics(
    analytics
) {
    const db = await getDB();

    await db.put(
        STORES.ANALYTICS,
        analytics || {},
        "current"
    );
}

export async function getAnalytics() {
    const db = await getDB();

    return (
        (await db.get(
            STORES.ANALYTICS,
            "current"
        )) || null
    );
}

/* ============================================================
   PAGINATION
   ============================================================ */

export async function getBusinessDataPaginated(
    page = 1,
    pageSize = 50
) {
    const db = await getDB();

    const metadata =
        await getMetadata();

    const safePage =
        safePositiveInteger(
            page,
            1
        );

    const safePageSize =
        Math.min(
            safePositiveInteger(
                pageSize,
                50
            ),
            500
        );

    const total =
        safeNumber(
            metadata?.totalRows ??
            metadata?.totalCount ??
            metadata?.rows,
            0
        );

    const chunkSize =
        safePositiveInteger(
            metadata?.chunkSize,
            DATASET_CHUNK_SIZE
        );

    if (total <= 0) {
        return {
            data: [],
            rows: [],
            page: 1,
            pageSize: safePageSize,
            totalRows: 0,
            totalPages: 0,
        };
    }

    const totalPages =
        Math.ceil(
            total / safePageSize
        );

    if (safePage > totalPages) {
        return {
            data: [],
            rows: [],
            page: safePage,
            pageSize: safePageSize,
            totalRows: total,
            totalPages,
        };
    }

    const startIndex =
        (safePage - 1) *
        safePageSize;

    const endIndex =
        Math.min(
            startIndex + safePageSize,
            total
        );

    const startChunk =
        Math.floor(
            startIndex / chunkSize
        );

    const endChunk =
        Math.floor(
            (endIndex - 1) /
            chunkSize
        );

    const rows = [];

    for (
        let chunkIndex = startChunk;
        chunkIndex <= endChunk;
        chunkIndex += 1
    ) {
        const chunk =
            await db.get(
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

    const sliced =
        rows.slice(
            offset,
            offset +
            (endIndex - startIndex)
        );

    return {
        data: sliced,
        rows: sliced,
        page: safePage,
        pageSize: safePageSize,
        totalRows: total,
        totalPages,
    };
}

/* ============================================================
   DATE INDEX
   ============================================================ */

export async function getDateIndex() {
    const db = await getDB();

    return (
        (await db.get(
            STORES.DATE_INDEX,
            "index"
        )) || {}
    );
}

/* ============================================================
   FILTER RANGE
   ============================================================ */

/**
 * Returns the REAL calendar range for dashboard filters.
 *
 * IMPORTANT:
 * - Today = actual current calendar day
 * - 7days = today + previous 6 calendar days
 * - 30days = today + previous 29 calendar days
 * - month = current month through today
 * - year = current year through today
 * - custom = selected custom range
 *
 * NEVER use dataset maxDate as "today".
 */

export function getFilterRange(
    dateFilter = "all",
    customRange = null
) {
    const now = new Date();

    const localDayKey = (date) => {
        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const todayKey =
        localDayKey(now);


    /* =====================================================
       ALL
    ===================================================== */

    if (
        !dateFilter ||
        dateFilter === "all"
    ) {
        return null;
    }


    /* =====================================================
       TODAY
       EXACT CURRENT LOCAL CALENDAR DATE
    ===================================================== */

    if (
        dateFilter === "today"
    ) {
        return {
            startKey:
                todayKey,

            endKey:
                todayKey,
        };
    }


    /* =====================================================
       7 DAYS
       Today + previous 6 calendar days
    ===================================================== */

    if (
        dateFilter === "7days"
    ) {

        const start =
            new Date(now);

        start.setHours(
            0,
            0,
            0,
            0
        );

        start.setDate(
            start.getDate() - 6
        );

        return {
            startKey:
                localDayKey(start),

            endKey:
                todayKey,
        };
    }


    /* =====================================================
       30 DAYS
       Today + previous 29 calendar days
    ===================================================== */

    if (
        dateFilter === "30days"
    ) {

        const start =
            new Date(now);

        start.setHours(
            0,
            0,
            0,
            0
        );

        start.setDate(
            start.getDate() - 29
        );

        return {
            startKey:
                localDayKey(start),

            endKey:
                todayKey,
        };
    }


    /* =====================================================
       THIS MONTH
    ===================================================== */

    if (
        dateFilter === "month"
    ) {

        return {
            startKey:
                `${now.getFullYear()}-${String(
                    now.getMonth() + 1
                ).padStart(2, "0")}-01`,

            endKey:
                todayKey,
        };
    }


    /* =====================================================
       THIS YEAR
    ===================================================== */

    if (
        dateFilter === "year"
    ) {

        return {
            startKey:
                `${now.getFullYear()}-01-01`,

            endKey:
                todayKey,
        };
    }


    /* =====================================================
       CUSTOM
    ===================================================== */

    if (
        dateFilter === "custom"
    ) {

        const start =
            customRange?.startDate ??
            customRange?.start ??
            customRange?.from ??
            null;

        const end =
            customRange?.endDate ??
            customRange?.end ??
            customRange?.to ??
            null;


        if (
            !start ||
            !end
        ) {
            return null;
        }


        const startDate =
            start instanceof Date
                ? new Date(start)
                : new Date(start);

        const endDate =
            end instanceof Date
                ? new Date(end)
                : new Date(end);


        if (
            Number.isNaN(
                startDate.getTime()
            ) ||
            Number.isNaN(
                endDate.getTime()
            )
        ) {
            return null;
        }


        startDate.setHours(
            0,
            0,
            0,
            0
        );

        endDate.setHours(
            23,
            59,
            59,
            999
        );


        if (
            startDate >
            endDate
        ) {
            return null;
        }


        return {
            startKey:
                localDayKey(
                    startDate
                ),

            endKey:
                localDayKey(
                    endDate
                ),
        };
    }


    return null;
}

/* ============================================================
   FILTERED ROWS
   ============================================================ */

export async function getBusinessDataByDateRange(
    startKey,
    endKey
) {
    if (
        !startKey ||
        !endKey
    ) {
        return [];
    }

    const db =
        await getDB();

    const dateIndex =
        await getDateIndex();

    const metadata =
        await getMetadata();

    const chunkSize =
        safePositiveInteger(
            metadata?.chunkSize,
            DATASET_CHUNK_SIZE
        );

    const matchingPositions = [];

    const matchingChunks =
        new Set();

    const dates =
        Object.keys(
            dateIndex
        ).sort();

    for (
        const date
        of dates
    ) {
        if (
            date < startKey ||
            date > endKey
        ) {
            continue;
        }

        const positions =
            Array.isArray(
                dateIndex[date]
            )
                ? dateIndex[date]
                : [];

        for (
            const position
            of positions
        ) {
            matchingPositions.push(
                position
            );

            matchingChunks.add(
                Math.floor(
                    position /
                    chunkSize
                )
            );
        }
    }

    /*
     * IMPORTANT:
     *
     * No matching date means no matching data.
     *
     * Do NOT fall back to:
     * - latest dataset date
     * - previous filter
     * - cached analytics
     * - complete dataset
     */
    if (
        matchingPositions.length === 0
    ) {
        return [];
    }

    const chunks =
        new Map();

    for (
        const chunkIndex
        of matchingChunks
    ) {
        const chunk =
            (await db.get(
                STORES.CHUNKS,
                chunkIndex
            )) || [];

        chunks.set(
            chunkIndex,
            chunk
        );
    }

    const results = [];

    for (
        const position
        of matchingPositions
    ) {
        const chunkIndex =
            Math.floor(
                position /
                chunkSize
            );

        const offset =
            position %
            chunkSize;

        const chunk =
            chunks.get(
                chunkIndex
            );

        if (
            Array.isArray(chunk) &&
            chunk[offset] !== undefined
        ) {
            results.push(
                chunk[offset]
            );
        }
    }

    return results;
}

/* ============================================================
   FILTERED PAGINATION
   ============================================================ */

export async function getBusinessDataFilteredPaginated(
    page = 1,
    pageSize = 50,
    dateFilter = "all",
    customRange = null
) {
    const normalizedFilter =
        String(
            dateFilter || "all"
        )
            .trim()
            .toLowerCase();

    /* ========================================================
       ALL TIME
       ======================================================== */

    if (
        !normalizedFilter ||
        normalizedFilter === "all" ||
        normalizedFilter === "alltime" ||
        normalizedFilter === "all-time"
    ) {
        return getBusinessDataPaginated(
            page,
            pageSize
        );
    }

    /* ========================================================
       GET REAL DATE RANGE
       ======================================================== */

    const range =
        await getFilterRange(
            normalizedFilter,
            customRange
        );

    /*
     * Invalid custom range / invalid filter.
     *
     * Return empty dataset instead of falling back
     * to all data.
     */
    if (
        !range?.startKey ||
        !range?.endKey
    ) {
        const safePageSize =
            Math.min(
                safePositiveInteger(
                    pageSize,
                    50
                ),
                500
            );

        return {
            data: [],
            rows: [],
            page: 1,
            pageSize: safePageSize,
            totalRows: 0,
            totalPages: 0,
        };
    }

    /* ========================================================
       GET ONLY MATCHING DATE ROWS
       ======================================================== */

    const matchingRows =
        await getBusinessDataByDateRange(
            range.startKey,
            range.endKey
        );

    const totalRows =
        matchingRows.length;

    const safePage =
        safePositiveInteger(
            page,
            1
        );

    const safePageSize =
        Math.min(
            safePositiveInteger(
                pageSize,
                50
            ),
            500
        );

    /* ========================================================
       NO DATA
       ======================================================== */

    if (
        totalRows === 0
    ) {
        return {
            data: [],
            rows: [],
            page: 1,
            pageSize: safePageSize,
            totalRows: 0,
            totalPages: 0,
        };
    }

    /* ========================================================
       PAGINATION
       ======================================================== */

    const totalPages =
        Math.ceil(
            totalRows /
            safePageSize
        );

    const actualPage =
        Math.min(
            safePage,
            totalPages
        );

    const startIndex =
        (actualPage - 1) *
        safePageSize;

    const rows =
        matchingRows.slice(
            startIndex,
            startIndex +
            safePageSize
        );

    return {
        data: rows,
        rows,

        page:
            actualPage,

        pageSize:
            safePageSize,

        totalRows,

        totalPages,
    };
}

/* ============================================================
   UPLOAD HISTORY
   ============================================================ */

export async function saveUploadHistory(
    history = {}
) {
    const db =
        await getDB();

    if (
        !db.objectStoreNames.contains(
            STORES.UPLOAD_HISTORY
        )
    ) {
        throw new Error(
            "Upload history store is unavailable."
        );
    }

    return db.add(
        STORES.UPLOAD_HISTORY,
        {
            ...history,

            createdAt:
                history.createdAt ||
                new Date().toISOString(),
        }
    );
}

export async function getUploadHistory(
    limit = 20
) {
    const db =
        await getDB();

    if (
        !db.objectStoreNames.contains(
            STORES.UPLOAD_HISTORY
        )
    ) {
        return [];
    }

    const safeLimit =
        Math.max(
            1,
            Math.floor(
                Number(limit)
            ) || 20
        );

    const transaction =
        db.transaction(
            STORES.UPLOAD_HISTORY,
            "readonly"
        );

    const store =
        transaction.objectStore(
            STORES.UPLOAD_HISTORY
        );

    const records = [];

    let cursor =
        await store.openCursor(
            null,
            "prev"
        );

    while (
        cursor &&
        records.length <
        safeLimit
    ) {
        records.push(
            cursor.value
        );

        cursor =
            await cursor.continue();
    }

    await transaction.done;

    return records;
}

export async function deleteUploadHistory(
    id
) {
    const db =
        await getDB();

    if (
        !db.objectStoreNames.contains(
            STORES.UPLOAD_HISTORY
        )
    ) {
        return;
    }

    await db.delete(
        STORES.UPLOAD_HISTORY,
        id
    );
}

export async function clearUploadHistory() {
    const db =
        await getDB();

    if (
        !db.objectStoreNames.contains(
            STORES.UPLOAD_HISTORY
        )
    ) {
        return;
    }

    await db.clear(
        STORES.UPLOAD_HISTORY
    );
}