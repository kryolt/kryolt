import {
    Database,
    Columns3,
    TriangleAlert,
    Copy,
    BadgeCheck,
} from "lucide-react";

import "./UploadCSV.css";

function CSVValidator({ fileInfo }) {

    if (!fileInfo) return null;

    const totalRows =
        fileInfo.rows || 0;

    const totalColumns =
        fileInfo.columns?.length || 0;

    const validation =
        fileInfo.validation;

    if (!validation) return null;

    const missingColumns =
        validation.missingColumns || [];

    const invalidRows =
        validation.invalidRows || [];

    const missingValues =
        validation.missingValues || 0;

    const duplicateRows =
        fileInfo.duplicateRows || 0;

    const isValid =
        validation.valid === true;

    /*
     * Quality score
     *
     * Valid dataset starts at 100.
     * Missing values and duplicates reduce
     * the score.
     */

    const qualityScore =
        Math.max(
            0,
            100 -
            Math.min(
                50,
                missingValues
            ) -
            Math.min(
                30,
                duplicateRows
            )
        );

    return (

        <div className="validator-card">

            <div className="validator-header">

                <h3>

                    <BadgeCheck size={22} />

                    Data Validation

                </h3>

                <span
                    className="validator-status"
                >
                    {isValid
                        ? "Ready"
                        : "Action Required"}
                </span>

            </div>


            {/* =========================
                REQUIRED COLUMNS
            ========================== */}

            <div
                style={{
                    marginBottom: "18px",
                }}
            >

                <strong>
                    Required Fields
                </strong>

                {isValid ? (

                    <p
                        style={{
                            marginTop: "8px",
                        }}
                    >
                        ✓ Date
                        {" • "}
                        ✓ Product
                        {" • "}
                        ✓ Quantity
                        {" • "}
                        ✓ Cost Price
                        {" • "}
                        ✓ Sale Price
                    </p>

                ) : (

                    <p
                        style={{
                            marginTop: "8px",
                        }}
                    >

                        ⚠ Missing:

                        {" "}

                        {missingColumns
                            .map(formatField)
                            .join(", ")}

                    </p>

                )}

            </div>


            {/* =========================
                STATS
            ========================== */}

            <div className="validator-grid">

                <div className="validator-item blue">

                    <Database size={24} />

                    <h4>
                        {totalRows}
                    </h4>

                    <span>
                        Total Rows
                    </span>

                </div>


                <div className="validator-item purple">

                    <Columns3 size={24} />

                    <h4>
                        {totalColumns}
                    </h4>

                    <span>
                        Total Columns
                    </span>

                </div>


                <div className="validator-item orange">

                    <TriangleAlert size={24} />

                    <h4>
                        {missingValues}
                    </h4>

                    <span>
                        Missing Values
                    </span>

                </div>


                <div className="validator-item red">

                    <Copy size={24} />

                    <h4>
                        {duplicateRows}
                    </h4>

                    <span>
                        Duplicate Rows
                    </span>

                </div>

            </div>


            {/* =========================
                INVALID ROW WARNING
            ========================== */}

            {invalidRows.length > 0 && (

                <div
                    style={{
                        marginTop: "16px",
                    }}
                >

                    <strong>
                        Rows requiring attention:
                    </strong>

                    <p>
                        {invalidRows.length}
                        {" "}
                        row(s) have missing
                        required values.
                    </p>

                </div>

            )}


            {/* =========================
                QUALITY
            ========================== */}

            <div className="quality-box">

                <div className="quality-top">

                    <span>
                        Dataset Quality
                    </span>

                    <strong>
                        {qualityScore}%
                    </strong>

                </div>

                <div className="quality-progress">

                    <div
                        className="quality-fill"
                        style={{
                            width:
                                `${qualityScore}%`,
                        }}
                    />

                </div>

            </div>


            {/* =========================
                STATUS MESSAGE
            ========================== */}

            {!isValid && (

                <div
                    style={{
                        marginTop: "16px",
                    }}
                >

                    <strong>
                        ⚠ Upload cannot continue
                    </strong>

                    <p>
                        Add the required fields
                        and upload the file again.
                    </p>

                </div>

            )}

        </div>

    );

}


function formatField(field) {

    const labels = {

        Date: "Date",

        Product: "Product",

        Quantity: "Quantity",

        CostPrice: "Cost Price",

        SalePrice: "Sale Price",

    };

    return labels[field] || field;

}


export default CSVValidator;