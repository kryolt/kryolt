/**
 * ==========================================
 * Kryolt Column Mapping Engine
 * ==========================================
 *
 * Converts user-defined column names into
 * Kryolt's canonical field names.
 *
 * Example:
 *
 * "cost price"   -> CostPrice
 * "Cost_Price"   -> CostPrice
 * "CP"           -> CostPrice
 * "purchase cost"-> CostPrice
 * "selling price"-> SalePrice
 * "qty"          -> Quantity
 * "order date"   -> Date
 *
 * IMPORTANT:
 * This layer runs BEFORE validation/cleaning.
 */

export const CANONICAL_FIELDS = {
    Date: "Date",
    Product: "Product",
    Quantity: "Quantity",
    CostPrice: "CostPrice",
    SalePrice: "SalePrice",
    Revenue: "Revenue",
    Profit: "Profit",
    OrderID: "OrderID",
    Category: "Category",
    Customer: "Customer",
    Email: "Email",
    Phone: "Phone",
    Payment: "Payment",
    City: "City",
    State: "State",
    Country: "Country",
    Brand: "Brand",
    Supplier: "Supplier",
    Warehouse: "Warehouse",
    SalesPerson: "SalesPerson",
    Gender: "Gender",
    AgeGroup: "AgeGroup",
    Industry: "Industry",
    Segment: "Segment",
};

export const REQUIRED_MAPPING_FIELDS = [
    "Date",
    "Product",
    "Quantity",
    "CostPrice",
    "SalePrice",
];

/* ==========================================
   NORMALIZE HEADER
========================================== */

export function normalizeColumnName(value = "") {

    return String(value)
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/&/g, " and ")
        .replace(/[()[\]{}]/g, " ")
        .replace(/[._/-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}

/* ==========================================
   COMPACT NORMALIZATION
========================================== */

function compact(value = "") {

    return normalizeColumnName(value)
        .replace(/\s+/g, "");

}

/* ==========================================
   ALIASES
========================================== */

export const COLUMN_MAPPING_ALIASES = {

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
        "invoice date/time",
        "created at",
        "created date",
        "timestamp",
        "order day",
        "purchase date",
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
    ],

    Quantity: [
        "quantity",
        "qty",
        "qnty",
        "units",
        "unit",
        "number of units",
        "no of units",
        "count",
        "sold units",
        "units sold",
        "pieces",
        "pcs",
        "volume sold",
    ],

    CostPrice: [
        "cost price",
        "costprice",
        "cost",
        "unit cost",
        "unitcost",
        "purchase price",
        "purchaseprice",
        "purchase cost",
        "buying price",
        "buyingprice",
        "buy price",
        "buying cost",
        "procurement price",
        "cp",
        "c p",
        "c.p",
        "c.p.",
        "cost rate",
        "purchase rate",
        "buy rate",
    ],

    SalePrice: [
        "sale price",
        "saleprice",
        "selling price",
        "sellingprice",
        "sell price",
        "unit price",
        "unitprice",
        "selling rate",
        "sellingrate",
        "sale rate",
        "rate",
        "price",
        "retail price",
        "selling amount per unit",
        "sp",
        "s p",
        "s.p",
        "s.p.",
    ],

    Revenue: [
        "revenue",
        "sales",
        "sales amount",
        "sales value",
        "amount",
        "total",
        "total amount",
        "total sales",
        "order amount",
        "order value",
        "gross sales",
        "gross revenue",
        "turnover",
    ],

    Profit: [
        "profit",
        "net profit",
        "gross profit",
        "profit amount",
        "profit value",
        "earnings",
        "margin amount",
    ],

    OrderID: [
        "order id",
        "orderid",
        "order number",
        "order no",
        "order no.",
        "transaction id",
        "transactionid",
        "transaction number",
        "invoice id",
        "invoiceid",
        "invoice number",
        "invoice no",
        "invoice no.",
        "bill number",
        "bill no",
        "receipt number",
        "receipt no",
    ],

    Category: [
        "category",
        "product category",
        "product type",
        "item type",
        "type",
        "class",
        "department",
        "product group",
    ],

    Customer: [
        "customer",
        "customer name",
        "customername",
        "client",
        "client name",
        "buyer",
        "buyer name",
        "customer full name",
        "name",
    ],

    Email: [
        "email",
        "email address",
        "customer email",
        "customeremail",
        "mail",
        "e mail",
    ],

    Phone: [
        "phone",
        "phone number",
        "mobile",
        "mobile number",
        "contact",
        "contact number",
        "contact no",
        "telephone",
        "cell",
    ],

    Payment: [
        "payment",
        "payment method",
        "paymentmethod",
        "payment type",
        "paymenttype",
        "mode",
        "mode of payment",
        "payment mode",
        "pay method",
        "paid by",
    ],

    City: [
        "city",
        "customer city",
        "city name",
        "town",
        "customer location",
    ],

    State: [
        "state",
        "state name",
        "customer state",
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
        "manufacturer",
        "make",
    ],

    Supplier: [
        "supplier",
        "supplier name",
        "vendor",
        "vendor name",
        "distributor",
    ],

    Warehouse: [
        "warehouse",
        "warehouse name",
        "store",
        "store location",
        "depot",
        "fulfillment center",
    ],

    SalesPerson: [
        "salesperson",
        "sales person",
        "sales representative",
        "representative",
        "agent",
        "rep",
    ],

    Gender: [
        "gender",
        "sex",
    ],

    AgeGroup: [
        "age group",
        "agegroup",
        "age demographic",
        "customer age group",
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

/* ==========================================
   EXACT MATCH
========================================== */

function findExactMatch(header) {

    const normalized = normalizeColumnName(header);
    const compactHeader = compact(header);

    for (const [field, aliases] of Object.entries(
        COLUMN_MAPPING_ALIASES
    )) {

        for (const alias of aliases) {

            if (
                normalized === normalizeColumnName(alias) ||
                compactHeader === compact(alias)
            ) {
                return {
                    field,
                    confidence: 1,
                    method: "exact",
                    matchedAlias: alias,
                };
            }

        }

    }

    return null;
}

/* ==========================================
   TOKEN SIMILARITY
========================================== */

function getTokens(value) {

    return new Set(
        normalizeColumnName(value)
            .split(" ")
            .filter(Boolean)
    );

}

function similarityScore(header, alias) {

    const headerTokens = getTokens(header);
    const aliasTokens = getTokens(alias);

    if (!headerTokens.size || !aliasTokens.size) {
        return 0;
    }

    let common = 0;

    headerTokens.forEach((token) => {

        if (aliasTokens.has(token)) {
            common++;

        }

    });

    const score =
        common /
        Math.max(
            headerTokens.size,
            aliasTokens.size
        );

    return score;

}

/* ==========================================
   SMART MATCH
========================================== */

function findSmartMatch(header) {

    let best = null;

    for (
        const [field, aliases]
        of Object.entries(COLUMN_MAPPING_ALIASES)
    ) {

        for (const alias of aliases) {

            const score =
                similarityScore(
                    header,
                    alias
                );

            if (
                !best ||
                score > best.confidence
            ) {

                best = {
                    field,
                    confidence: score,
                    method: "smart",
                    matchedAlias: alias,
                };

            }

        }

    }

    /*
     * We intentionally keep the threshold
     * conservative.
     *
     * A wrong mapping is worse than
     * an unmapped column.
     */

    if (
        best &&
        best.confidence >= 0.75
    ) {

        return best;

    }

    return null;

}

/* ==========================================
   MAP HEADERS
========================================== */

export function mapColumns(headers = []) {

    if (!Array.isArray(headers)) {
        return {
            mapping: {},
            columns: [],
            sourceColumns: [],
            unmapped: [],
            ambiguous: [],
            requiredMissing:
                REQUIRED_MAPPING_FIELDS,
        };
    }

    // -------------------------------------------------
    // ORIGINAL UPLOADED FILE COLUMNS
    // -------------------------------------------------
    // IMPORTANT:
    // These are the real CSV/Excel headers.
    // Do NOT use cleaned/canonical data here.
    const originalColumns = [
        ...new Set(
            headers
                .map((header) =>
                    String(header ?? "").trim()
                )
                .filter(Boolean)
        ),
    ];

    const mapping = {};
    const unmapped = [];
    const ambiguous = [];

    const usedCanonicalFields =
        new Set();

    originalColumns.forEach((header) => {

        const exact =
            findExactMatch(header);

        const match =
            exact ||
            findSmartMatch(header);

        // ---------------------------------------------
        // UNMAPPED COLUMN
        // ---------------------------------------------

        if (!match) {

            unmapped.push(header);

            return;
        }

        // ---------------------------------------------
        // DUPLICATE CANONICAL FIELD
        // ---------------------------------------------

        if (
            usedCanonicalFields.has(
                match.field
            )
        ) {

            ambiguous.push({
                source: header,

                field:
                    match.field,

                confidence:
                    match.confidence,

                reason:
                    "Another column is already mapped to this field.",
            });

            return;
        }

        // ---------------------------------------------
        // MAPPING
        // ---------------------------------------------

        mapping[header] = {

            field:
                match.field,

            confidence:
                match.confidence,

            method:
                match.method,

            matchedAlias:
                match.matchedAlias,
        };

        usedCanonicalFields.add(
            match.field
        );
    });

    // ---------------------------------------------
    // REQUIRED FIELDS
    // ---------------------------------------------

    const requiredMissing =
        REQUIRED_MAPPING_FIELDS.filter(
            (field) =>
                !Object.values(mapping)
                    .some(
                        (item) =>
                            item.field ===
                            field
                    )
        );

    return {

        // Mapping used by processing engine
        mapping,

        // IMPORTANT:
        // Actual columns from uploaded file
        columns:
            originalColumns,

        // Explicit alias for clarity
        sourceColumns:
            originalColumns,

        unmapped,

        ambiguous,

        requiredMissing,
    };
}

/* ==========================================
   APPLY MAPPING
========================================== */

export function applyColumnMapping(
    data = [],
    mappingResult
) {

    if (
        !Array.isArray(data) ||
        !mappingResult?.mapping
    ) {
        return data;
    }

    return data.map((row) => {

        const mappedRow = {};

        Object.entries(row).forEach(
            ([sourceColumn, value]) => {

                const mapping =
                    mappingResult.mapping[
                    sourceColumn
                    ];

                if (mapping?.field) {

                    mappedRow[
                        mapping.field
                    ] = value;

                } else {

                    /*
                     * Keep unknown columns.
                     * DataCleaner will later place
                     * them inside ExtraFields.
                     */

                    mappedRow[sourceColumn] =
                        value;

                }

            }
        );

        return mappedRow;

    });

}

/* ==========================================
   COMPLETE DATA MAPPING
========================================== */

export function mapDatasetColumns(
    data = []
) {

    if (
        !Array.isArray(data) ||
        !data.length
    ) {

        return {
            data: [],
            ...mapColumns([]),
        };

    }

    const headers =
        Object.keys(data[0] || {});

    const mappingResult =
        mapColumns(headers);

    const mappedData =
        applyColumnMapping(
            data,
            mappingResult
        );

    return {
        data: mappedData,
        ...mappingResult,
    };

}