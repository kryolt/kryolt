/**
 * ==========================================
 * Kryolt Data Cleaner
 * Production Mapping + Cleaning Engine
 * ==========================================
 *
 * Pipeline:
 *
 * Raw CSV / Excel
 *      ↓
 * Header Normalization
 *      ↓
 * Smart Column Mapping
 *      ↓
 * Required Field Validation
 *      ↓
 * Data Cleaning
 *      ↓
 * Canonical Dataset
 *      ↓
 * Dashboard / Reports / Insights / Customers
 *
 * IMPORTANT:
 * Existing canonical field names are preserved for
 * backward compatibility.
 */

/* =========================================================
   1. CANONICAL FIELD DEFINITIONS
========================================================= */

export const REQUIRED_FIELDS = [
    "Date",
    "Product",
    "Quantity",
    "CostPrice",
    "SalePrice",
];

/* =========================================================
   2. COLUMN ALIASES
========================================================= */

export const COLUMN_ALIASES = {

    Date: [
        "date",
        "order date",
        "orderdate",
        "transaction date",
        "transactiondate",
        "sale date",
        "saledate",
        "sales date",
        "invoice date",
        "invoicedate",
        "purchase date",
        "created at",
        "createdat",
        "timestamp",
        "datetime",
        "date time",
    ],

    Product: [
        "product",
        "product name",
        "productname",
        "item",
        "item name",
        "itemname",
        "item description",
        "product description",
        "sku",
        "article",
        "product title",
        "item title",
    ],

    Quantity: [
        "quantity",
        "qty",
        "qnty",
        "units",
        "unit",
        "units sold",
        "quantity sold",
        "qty sold",
        "number of units",
        "count",
        "volume",
    ],

    CostPrice: [
        "cost price",
        "costprice",
        "cost_price",
        "cost-price",
        "cost",
        "unit cost",
        "unitcost",
        "unit_cost",
        "purchase price",
        "purchaseprice",
        "purchase_price",
        "purchase cost",
        "purchasecost",
        "buying price",
        "buyingprice",
        "buy price",
        "buying cost",
        "buy cost",
        "cp",
        "c.p",
        "c p",
        "c/p",
        "cost rate",
        "purchase rate",
        "buying rate",
    ],

    SalePrice: [
        "sale price",
        "saleprice",
        "sale_price",
        "sale-price",
        "selling price",
        "sellingprice",
        "selling_price",
        "selling rate",
        "sellingrate",
        "selling_rate",
        "unit price",
        "unitprice",
        "unit_price",
        "retail price",
        "retailprice",
        "sales price",
        "salesprice",
        "sale rate",
        "selling amount",
        "sp",
        "s.p",
        "s p",
        "s/p",
    ],

    Revenue: [
        "revenue",
        "sales",
        "sales amount",
        "sale amount",
        "amount",
        "total",
        "total sales",
        "total sale",
        "order amount",
        "orderamount",
        "total amount",
        "totalamount",
        "gross sales",
        "grosssales",
        "gross revenue",
        "turnover",
        "net sales",
    ],

    Profit: [
        "profit",
        "net profit",
        "netprofit",
        "profit amount",
        "profitamount",
        "margin amount",
        "earnings",
        "net earnings",
    ],

    OrderID: [
        "order id",
        "orderid",
        "order_id",
        "order-id",
        "order no",
        "order number",
        "transaction id",
        "transactionid",
        "transaction_id",
        "invoice id",
        "invoiceid",
        "invoice_id",
        "invoice no",
        "invoice number",
        "invoice number",
        "bill no",
        "bill number",
        "receipt no",
    ],

    Category: [
        "category",
        "product category",
        "productcategory",
        "product_category",
        "item category",
        "type",
        "item type",
        "itemtype",
        "class",
        "department",
        "product type",
    ],

    Customer: [
        "customer",
        "customer name",
        "customername",
        "customer_name",
        "name",
        "client",
        "client name",
        "clientname",
        "buyer",
        "buyer name",
        "customer full name",
    ],

    Email: [
        "email",
        "customer email",
        "customeremail",
        "email address",
        "emailaddress",
        "mail",
        "e-mail",
        "e mail",
    ],

    Phone: [
        "phone",
        "phone number",
        "phonenumber",
        "mobile",
        "mobile number",
        "contact",
        "contact no",
        "contact number",
        "cell",
        "telephone",
        "tel",
    ],

    Payment: [
        "payment",
        "payment method",
        "paymentmethod",
        "mode",
        "mode of payment",
        "modeofpayment",
        "payment type",
        "paymenttype",
        "pay method",
        "method of payment",
    ],

    City: [
        "city",
        "customer city",
        "customercity",
        "city name",
        "cityname",
        "location",
        "town",
    ],

    State: [
        "state",
        "customer state",
        "customerstate",
        "state name",
        "statename",
        "province",
        "region",
    ],

    Country: [
        "country",
        "nation",
        "territory",
    ],

    Brand: [
        "brand",
        "brand name",
        "brandname",
        "manufacturer",
        "make",
    ],

    Supplier: [
        "supplier",
        "vendor",
        "distributor",
        "source",
    ],

    Warehouse: [
        "warehouse",
        "fulfillment center",
        "fulfilment center",
        "depot",
        "store",
    ],

    SalesPerson: [
        "salesperson",
        "sales person",
        "sales representative",
        "sales rep",
        "agent",
        "representative",
        "rep",
    ],

    Gender: [
        "gender",
        "sex",
    ],

    AgeGroup: [
        "agegroup",
        "age group",
        "age demographic",
    ],

    Industry: [
        "industry",
        "sector",
        "vertical",
    ],

    Segment: [
        "segment",
        "customer segment",
        "market segment",
    ],
};

/* =========================================================
   3. HEADER NORMALIZATION
========================================================= */

/**
 * Converts:
 *
 * "Cost Price"
 * "cost_price"
 * "COST-PRICE"
 * "Cost.Price"
 * " cost   price "
 *
 * into one comparable representation.
 */
function normalizeHeader(value = "") {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[._/-]+/g, " ")
        .replace(/[()[\]{}]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}

/* =========================================================
   4. COMPACT HEADER
========================================================= */

/**
 * Used for stronger abbreviation matching.
 *
 * "Cost Price" → "costprice"
 * "C.P" → "cp"
 */
function compactHeader(value = "") {

    return normalizeHeader(value)
        .replace(/[^a-z0-9]/g, "");

}

/* =========================================================
   5. ALIAS MAP
========================================================= */

const NORMALIZED_ALIAS_MAP = {};

Object.entries(COLUMN_ALIASES).forEach(
    ([field, aliases]) => {

        NORMALIZED_ALIAS_MAP[field] =
            new Set(
                aliases.map(normalizeHeader)
            );

    }
);

/* =========================================================
   6. HEADER MATCHING
========================================================= */

function getHeaderMatchScore(
    actualHeader,
    aliases = []
) {

    const normalizedActual =
        normalizeHeader(actualHeader);

    const compactActual =
        compactHeader(actualHeader);

    let bestScore = 0;

    for (const alias of aliases) {

        const normalizedAlias =
            normalizeHeader(alias);

        const compactAlias =
            compactHeader(alias);

        /* Exact normalized match */

        if (normalizedActual === normalizedAlias) {
            bestScore = Math.max(bestScore, 100);
            continue;
        }

        /* Compact match */

        if (compactActual === compactAlias) {
            bestScore = Math.max(bestScore, 95);
            continue;
        }

        /* Token based match */

        const actualTokens =
            normalizedActual.split(" ");

        const aliasTokens =
            normalizedAlias.split(" ");

        const matchingTokens =
            aliasTokens.filter(
                token =>
                    actualTokens.includes(token)
            );

        if (
            matchingTokens.length ===
            aliasTokens.length
        ) {

            bestScore = Math.max(
                bestScore,
                85
            );

        }

    }

    return bestScore;

}

/* =========================================================
   7. FIND BEST COLUMN
========================================================= */

function findBestColumn(
    row,
    field
) {

    const keys = Object.keys(row || {});

    if (!keys.length) {
        return {
            column: null,
            score: 0,
        };
    }

    const aliases =
        COLUMN_ALIASES[field] || [];

    let bestColumn = null;
    let bestScore = 0;

    for (const key of keys) {

        const score =
            getHeaderMatchScore(
                key,
                aliases
            );

        if (score > bestScore) {

            bestScore = score;
            bestColumn = key;

        }

    }

    return {
        column: bestColumn,
        score: bestScore,
    };

}

/* =========================================================
   8. DETECT COLUMNS
========================================================= */

export function detectColumns(
    data = []
) {

    const emptyMap = {};

    Object.keys(COLUMN_ALIASES)
        .forEach(field => {
            emptyMap[field] = null;
        });

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        return emptyMap;

    }

    const firstRow =
        data.find(row =>
            row &&
            typeof row === "object" &&
            Object.keys(row).length > 0
        );

    if (!firstRow) {
        return emptyMap;
    }

    const detected = {};
    const usedColumns = new Set();

    Object.keys(COLUMN_ALIASES)
        .forEach(field => {

            const result =
                findBestColumn(
                    firstRow,
                    field
                );

            /**
             * Do not allow one physical
             * column to become multiple
             * canonical fields.
             */
            if (
                result.column &&
                !usedColumns.has(result.column) &&
                result.score >= 85
            ) {

                detected[field] =
                    result.column;

                usedColumns.add(
                    result.column
                );

            }
            else {

                detected[field] = null;

            }

        });

    return detected;

}

/* =========================================================
   9. DETAILED MAPPING
========================================================= */

export function detectColumnMapping(
    data = []
) {

    const empty = {};

    Object.keys(COLUMN_ALIASES)
        .forEach(field => {

            empty[field] = {
                column: null,
                confidence: 0,
                matched: false,
            };

        });

    if (
        !Array.isArray(data) ||
        !data.length
    ) {
        return empty;
    }

    const firstRow =
        data.find(
            row =>
                row &&
                typeof row === "object" &&
                Object.keys(row).length
        );

    if (!firstRow) {
        return empty;
    }

    const usedColumns =
        new Set();

    Object.keys(COLUMN_ALIASES)
        .forEach(field => {

            const result =
                findBestColumn(
                    firstRow,
                    field
                );

            if (
                result.column &&
                result.score >= 85 &&
                !usedColumns.has(result.column)
            ) {

                usedColumns.add(
                    result.column
                );

                empty[field] = {

                    column:
                        result.column,

                    confidence:
                        result.score,

                    matched: true,

                };

            }

        });

    return empty;

}

/* =========================================================
   10. REQUIRED COLUMN VALIDATION
========================================================= */

export function validateRequiredColumns(
    data = []
) {

    const columns =
        detectColumns(data);

    const missingColumns =
        REQUIRED_FIELDS.filter(
            field =>
                !columns[field]
        );

    return {

        valid:
            missingColumns.length === 0,

        missingColumns,

        detectedColumns:
            columns,

    };

}

/* =========================================================
   11. AVAILABLE OPTIONAL FIELDS
========================================================= */

export function detectAvailableFields(
    data = []
) {

    if (
        !Array.isArray(data) ||
        !data.length
    ) {
        return {};
    }

    const columns =
        detectColumns(data);

    return {

        customer: !!columns.Customer,
        email: !!columns.Email,
        phone: !!columns.Phone,
        category: !!columns.Category,
        payment: !!columns.Payment,
        city: !!columns.City,
        state: !!columns.State,
        country: !!columns.Country,
        brand: !!columns.Brand,
        supplier: !!columns.Supplier,
        warehouse: !!columns.Warehouse,
        salesPerson: !!columns.SalesPerson,
        gender: !!columns.Gender,
        ageGroup: !!columns.AgeGroup,
        industry: !!columns.Industry,
        segment: !!columns.Segment,

    };

}

/* =========================================================
   12. REQUIRED VALUE VALIDATION
========================================================= */

export function validateRequiredValues(
    data = []
) {

    const {
        valid: columnsValid,
        detectedColumns,
        missingColumns,
    } =
        validateRequiredColumns(data);

    if (!columnsValid) {

        return {

            valid: false,

            missingColumns,

            invalidRows: [],

            missingValues: 0,

            detectedColumns,

        };

    }

    const invalidRows = [];

    let missingValues = 0;

    for (
        let index = 0;
        index < data.length;
        index++
    ) {

        const row =
            data[index] || {};

        const missingFields = [];

        for (
            const field
            of REQUIRED_FIELDS
        ) {

            const column =
                detectedColumns[field];

            const value =
                row[column];

            if (
                value === null ||
                value === undefined ||
                String(value).trim() === ""
            ) {

                missingFields.push(
                    field
                );

                missingValues++;

            }

        }

        if (
            missingFields.length
        ) {

            invalidRows.push({

                row: index + 2,

                fields:
                    missingFields,

            });

        }

    }

    return {

        valid:
            invalidRows.length === 0,

        missingColumns: [],

        invalidRows,

        missingValues,

        detectedColumns,

    };

}

/* =========================================================
   13. DATASET VALIDATION
========================================================= */

export function validateDataset(
    data = []
) {

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        return {

            valid: false,

            reason: "EMPTY_DATASET",

            missingColumns:
                REQUIRED_FIELDS,

            invalidRows: [],

            missingValues: 0,

            detectedColumns: {},

        };

    }

    const columnValidation =
        validateRequiredColumns(data);

    if (
        !columnValidation.valid
    ) {

        return {

            valid: false,

            reason: "MISSING_COLUMNS",

            missingColumns:
                columnValidation.missingColumns,

            invalidRows: [],

            missingValues: 0,

            detectedColumns:
                columnValidation.detectedColumns,

        };

    }

    const valueValidation =
        validateRequiredValues(data);

    return {

        ...valueValidation,

        reason:
            valueValidation.valid
                ? null
                : "MISSING_VALUES",

    };

}

/* =========================================================
   14. SAFE NUMBER PARSER
========================================================= */

function toNumber(
    value,
    {
        allowNegative = false
    } = {}
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (
        typeof value === "number"
    ) {

        if (
            !Number.isFinite(value)
        ) {
            return 0;
        }

        if (
            !allowNegative &&
            value < 0
        ) {
            return 0;
        }

        return value;

    }

    let str =
        String(value)
            .trim();

    if (!str) {
        return 0;
    }

    const isPercentage =
        str.includes("%");

    str =
        str.replace(
            /[₹$€£,%\s]/g,
            ""
        );

    const number =
        Number(str);

    if (
        !Number.isFinite(number)
    ) {
        return 0;
    }

    const finalNumber =
        isPercentage
            ? number / 100
            : number;

    if (
        !allowNegative &&
        finalNumber < 0
    ) {
        return 0;
    }

    return finalNumber;

}

/* =========================================================
   15. DATE HELPERS
========================================================= */

function pad2(num) {

    return String(num)
        .padStart(2, "0");

}

function isRealCalendarDate(
    year,
    month,
    day
) {

    if (
        year < 1000 ||
        year > 9999 ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31
    ) {
        return false;
    }

    const date =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        );

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );

}

/* =========================================================
   16. DATE NORMALIZER
========================================================= */

function normalizeDate(raw) {

    if (
        raw === null ||
        raw === undefined
    ) {
        return "";
    }

    /* Excel serial */

    if (
        typeof raw === "number" &&
        Number.isFinite(raw)
    ) {

        if (raw <= 0) {
            return "";
        }

        const excelEpoch =
            new Date(
                Date.UTC(
                    1899,
                    11,
                    30
                )
            );

        const converted =
            new Date(
                excelEpoch.getTime() +
                raw * 86400000
            );

        if (
            !Number.isNaN(
                converted.getTime()
            )
        ) {

            return `${converted.getUTCFullYear()}-${pad2(converted.getUTCMonth() + 1)}-${pad2(converted.getUTCDate())}`;

        }

        return "";

    }

    const value =
        String(raw).trim();

    if (!value) {
        return "";
    }

    /* YYYY-MM-DD */

    let match =
        value.match(
            /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/
        );

    if (match) {

        const [
            ,
            y,
            m,
            d
        ] =
            match.map(Number);

        return isRealCalendarDate(
            y,
            m,
            d
        )
            ? `${y}-${pad2(m)}-${pad2(d)}`
            : "";

    }

    /* DD-MM-YYYY */

    match =
        value.match(
            /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
        );

    if (match) {

        const [
            ,
            d,
            m,
            y
        ] =
            match.map(Number);

        return isRealCalendarDate(
            y,
            m,
            d
        )
            ? `${y}-${pad2(m)}-${pad2(d)}`
            : "";

    }

    /* Natural language date */

    const parsed =
        new Date(value);

    if (
        !Number.isNaN(
            parsed.getTime()
        )
    ) {

        return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;

    }

    return "";

}

/* =========================================================
   17. KNOWN HEADER SET
========================================================= */

function getKnownHeaderSet(
    columns
) {

    const set = new Set();

    Object.values(columns)
        .forEach(header => {

            if (header) {
                set.add(header);
            }

        });

    return set;

}

/* =========================================================
   18. NUMERIC EXTRA FIELD DETECTION
========================================================= */

function looksNumeric(
    value
) {

    if (
        typeof value !== "string" ||
        value.trim() === ""
    ) {
        return false;
    }

    const cleaned =
        value
            .replace(
                /[,₹$€£%\s]/g,
                ""
            );

    return (
        cleaned !== "" &&
        !Number.isNaN(
            Number(cleaned)
        )
    );

}

/* =========================================================
   19. EXTRA FIELD EXTRACTION
========================================================= */

function extractExtraFields(
    row,
    knownHeaders
) {

    const extra = {};

    const keys =
        Object.keys(row);

    for (
        const key of keys
    ) {

        if (
            knownHeaders.has(key)
        ) {
            continue;
        }

        const rawValue =
            row[key];

        if (
            rawValue === null ||
            rawValue === undefined
        ) {
            continue;
        }

        let value =
            typeof rawValue === "string"
                ? rawValue.trim()
                : rawValue;

        if (value === "") {
            continue;
        }

        if (
            typeof value === "string" &&
            looksNumeric(value)
        ) {

            extra[key] =
                Number(
                    value.replace(
                        /[,₹$€£%\s]/g,
                        ""
                    )
                );

        }
        else {

            extra[key] = value;

        }

    }

    return extra;

}

/* =========================================================
   20. AVAILABLE FIELD BUILDER
========================================================= */

function buildAvailableFields(
    columns
) {

    return {

        customer: !!columns.Customer,
        email: !!columns.Email,
        phone: !!columns.Phone,
        category: !!columns.Category,
        payment: !!columns.Payment,
        city: !!columns.City,
        state: !!columns.State,
        country: !!columns.Country,
        brand: !!columns.Brand,
        supplier: !!columns.Supplier,
        warehouse: !!columns.Warehouse,
        salesPerson: !!columns.SalesPerson,
        gender: !!columns.Gender,
        ageGroup: !!columns.AgeGroup,
        industry: !!columns.Industry,
        segment: !!columns.Segment,

    };

}

/* =========================================================
   21. MAIN CLEANING ENGINE
========================================================= */

export function cleanCSVData(
    data = []
) {

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {
        return [];
    }

    const validation =
        validateDataset(data);

    if (
        !validation.valid
    ) {
        return [];
    }

    const columns =
        validation.detectedColumns;

    const knownHeaders =
        getKnownHeaderSet(columns);

    const availableFields =
        buildAvailableFields(columns);

    const uniqueRows =
        new Set();

    const cleaned = [];

    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const row =
            data[i] || {};

        /* Empty row */

        const values =
            Object.values(row);

        let hasContent = false;

        for (
            const value
            of values
        ) {

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {

                hasContent = true;
                break;

            }

        }

        if (!hasContent) {
            continue;
        }

        /* Duplicate row */

        const rowStringKey =
            JSON.stringify(row);

        if (
            uniqueRows.has(
                rowStringKey
            )
        ) {
            continue;
        }

        uniqueRows.add(
            rowStringKey
        );

        /* Core */

        const date =
            normalizeDate(
                row[columns.Date]
            );

        const product =
            String(
                row[columns.Product]
            )
                .trim()
                .replace(
                    /\s+/g,
                    " "
                ) || "Unknown";

        const quantity =
            toNumber(
                row[columns.Quantity]
            );

        const costPrice =
            toNumber(
                row[columns.CostPrice]
            );

        const salePrice =
            toNumber(
                row[columns.SalePrice]
            );

        /* Revenue */

        const explicitRevenue =
            columns.Revenue
                ? toNumber(
                    row[columns.Revenue]
                )
                : 0;

        const totalSales =
            explicitRevenue > 0
                ? explicitRevenue
                : quantity * salePrice;

        /* Cost */

        const totalCost =
            quantity * costPrice;

        /* Profit */

        const explicitProfit =
            columns.Profit
                ? toNumber(
                    row[columns.Profit],
                    {
                        allowNegative: true,
                    }
                )
                : null;

        const profit =
            explicitProfit !== null
                ? explicitProfit
                : totalSales - totalCost;

        /* Margin */

        const profitMargin =
            totalSales > 0
                ? Number(
                    (
                        profit /
                        totalSales *
                        100
                    ).toFixed(2)
                )
                : 0;

        /* Optional */

        const customer =
            columns.Customer
                ? String(
                    row[columns.Customer] ?? ""
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    ) || null
                : null;

        const email =
            columns.Email
                ? String(
                    row[columns.Email] ?? ""
                )
                    .trim()
                    .toLowerCase() || null
                : null;

        const phone =
            columns.Phone
                ? String(
                    row[columns.Phone] ?? ""
                )
                    .trim() || null
                : null;

        const category =
            columns.Category
                ? String(
                    row[columns.Category] ?? ""
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    ) || null
                : null;

        const payment =
            columns.Payment
                ? String(
                    row[columns.Payment] ?? ""
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    ) || null
                : null;

        const city =
            columns.City
                ? String(
                    row[columns.City] ?? ""
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    ) || null
                : null;

        const state =
            columns.State
                ? String(
                    row[columns.State] ?? ""
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    ) || null
                : null;

        const country =
            columns.Country
                ? String(
                    row[columns.Country] ?? ""
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    ) || null
                : null;

        const orderID =
            columns.OrderID
                ? String(
                    row[columns.OrderID] ?? ""
                )
                    .trim() || null
                : null;

        /* Extra */

        const extraFields =
            extractExtraFields(
                row,
                knownHeaders
            );

        /* Preserve recognized optional fields */

        const optionalFields = [
            "Brand",
            "Supplier",
            "Warehouse",
            "SalesPerson",
            "Gender",
            "AgeGroup",
            "Industry",
            "Segment",
        ];

        optionalFields.forEach(
            field => {

                if (
                    columns[field] &&
                    row[columns[field]] !==
                    undefined &&
                    row[columns[field]] !==
                    null &&
                    String(
                        row[columns[field]]
                    ).trim() !== ""
                ) {

                    extraFields[field] =
                        String(
                            row[columns[field]]
                        )
                            .trim();

                }

            }
        );

        /* Canonical output */

        cleaned.push({

            /* Customer compatibility */

            Name: customer,

            /* Product */

            Product: product,

            Category: category,

            /* Location */

            City: city,

            State: state,

            Country: country,

            /* Customer */

            Customer: customer,

            Email: email,

            Phone: phone,

            /* Payment */

            Payment: payment,

            /* Quantity */

            Quantity: quantity,

            /* Pricing */

            CostPrice: costPrice,

            SalePrice: salePrice,

            /* Financial */

            Sales: totalSales,

            Cost: totalCost,

            Profit: profit,

            ProfitMargin: profitMargin,

            /* Metadata */

            OrderID: orderID,

            Date: date,

            /* Dynamic */

            AvailableFields:
                availableFields,

            ExtraFields:
                extraFields,

        });

    }

    return cleaned;

}

/* =========================================================
   22. CLEAN DATA + METADATA
========================================================= */

export function cleanDataWithMetadata(
    data = []
) {

    const detectedColumns =
        detectColumns(data);

    const mapping =
        detectColumnMapping(data);

    const availableFields =
        detectAvailableFields(data);

    const cleanedRows =
        cleanCSVData(data);

    return {

        data: cleanedRows,

        metadata: {

            totalRawRows:
                data.length,

            cleanedRowsCount:
                cleanedRows.length,

            removedRows:
                Math.max(
                    0,
                    data.length -
                    cleanedRows.length
                ),

            detectedColumns,

            mapping,

            availableFields,

        },

        detectedColumns,

        mapping,

        availableFields,

    };

}