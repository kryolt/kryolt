import {
    CheckCircle2,
    AlertTriangle,
    HelpCircle,
    X,
    ArrowRight,
} from "lucide-react";

import "./ColumnMapping.css";

function ColumnMapping({
    mapping,
    onConfirm,
    onCancel,
    isProcessing = false,
}) {

    if (!mapping) return null;

    const {
        mapping: mappedColumns = {},
        unmapped = [],
        ambiguous = [],
        requiredMissing = [],
    } = mapping;

    const entries =
        Object.entries(mappedColumns);

    if (
        entries.length === 0 &&
        unmapped.length === 0 &&
        ambiguous.length === 0
    ) {
        return null;
    }

    const canContinue =
        requiredMissing.length === 0 &&
        ambiguous.length === 0;

    return (
        <section className="column-mapping">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="column-mapping-header">

                <div>

                    <span className="mapping-eyebrow">
                        Data Mapping
                    </span>

                    <h3>
                        Kryolt recognized your columns
                    </h3>

                    <p>
                        Review how Kryolt mapped your uploaded
                        columns before processing your dataset.
                    </p>

                </div>


                {/* STATUS */}

                {canContinue ? (

                    <div className="mapping-status success">

                        <CheckCircle2 size={17} />

                        Ready

                    </div>

                ) : (

                    <div className="mapping-status warning">

                        <AlertTriangle size={17} />

                        Action required

                    </div>

                )}

            </div>


            {/* =========================================
                MAPPING LIST
            ========================================= */}

            <div className="mapping-list">

                {entries.map(
                    ([source, info]) => {

                        const confidence =
                            Number(info?.confidence || 0);

                        return (

                            <div
                                className="mapping-row"
                                key={source}
                            >

                                <div className="mapping-source">
                                    {source}
                                </div>


                                <div className="mapping-arrow">
                                    <ArrowRight size={16} />
                                </div>


                                <div className="mapping-target">

                                    <CheckCircle2 size={15} />

                                    {info?.field || "Unknown"}

                                </div>


                                <span
                                    className={
                                        `mapping-confidence ${confidence >= 0.9
                                            ? "high"
                                            : "medium"
                                        }`
                                    }
                                >

                                    {Math.round(
                                        confidence * 100
                                    )}%

                                </span>

                            </div>

                        );

                    }
                )}

            </div>


            {/* =========================================
                REQUIRED MISSING
            ========================================= */}

            {requiredMissing.length > 0 && (

                <div className="mapping-alert">

                    <AlertTriangle size={18} />

                    <div>

                        <strong>
                            Required columns not detected
                        </strong>

                        <p>
                            {requiredMissing.join(", ")}
                        </p>

                    </div>

                </div>

            )}


            {/* =========================================
                AMBIGUOUS
            ========================================= */}

            {ambiguous.length > 0 && (

                <div className="mapping-alert warning">

                    <HelpCircle size={18} />

                    <div>

                        <strong>
                            Some columns need attention
                        </strong>

                        {ambiguous.map(
                            (item, index) => (

                                <p key={index}>

                                    "{item.source}" could
                                    not be safely mapped to
                                    "{item.field}".

                                </p>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* =========================================
                EXTRA COLUMNS
            ========================================= */}

            {unmapped.length > 0 && (

                <div className="mapping-extra">

                    <span>
                        Additional columns
                    </span>

                    <div className="mapping-extra-list">

                        {unmapped.map(
                            (column) => (

                                <span key={column}>
                                    {column}
                                </span>

                            )
                        )}

                    </div>

                    <p>
                        These columns will be preserved
                        as additional data and won't be lost.
                    </p>

                </div>

            )}


            {/* =========================================
                ACTIONS
            ========================================= */}

            <div className="column-mapping-actions">

                <button
                    type="button"
                    className="mapping-cancel-btn"
                    onClick={onCancel}
                    disabled={isProcessing}
                >

                    <X size={17} />

                    Remove File

                </button>


                <button
                    type="button"
                    className="mapping-confirm-btn"
                    onClick={() => onConfirm(mapping)}
                    disabled={
                        isProcessing ||
                        !canContinue
                    }
                >

                    <CheckCircle2 size={17} />

                    {isProcessing
                        ? "Processing..."
                        : "Confirm & Continue"
                    }

                </button>

            </div>

        </section>
    );
}

export default ColumnMapping;