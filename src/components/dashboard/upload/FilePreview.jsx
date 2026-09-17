import "./UploadCSV.css";

function FilePreview({
    fileInfo,
    removeFile,
    uploadSuccess,
}) {
    if (!fileInfo) {
        return null;
    }

    // -----------------------------------------
    // ORIGINAL FILE COLUMNS
    // -----------------------------------------
    // Prefer the original uploaded-file columns.
    // Do NOT calculate columns from processed data.
    const columns =
        Array.isArray(fileInfo.columns)
            ? fileInfo.columns
            : Array.isArray(fileInfo.columnNames)
                ? fileInfo.columnNames
                : [];

    // -----------------------------------------
    // SAFE ROW COUNT
    // -----------------------------------------
    const rows =
        Number.isFinite(Number(fileInfo.rows))
            ? Number(fileInfo.rows)
            : 0;

    // -----------------------------------------
    // SAFE FILE SIZE
    // -----------------------------------------
    const size =
        fileInfo.size !== undefined &&
            fileInfo.size !== null
            ? Number(fileInfo.size) || 0
            : 0;

    return (
        <>
            {/* ================================
                FILE INFORMATION
            ================================= */}

            <div className="file-preview">

                <div className="file-preview-info">

                    <h3>
                        📄{" "}
                        {fileInfo.name ||
                            "Uploaded File"}
                    </h3>

                    <p>
                        <strong>Size :</strong>{" "}
                        {size} KB
                    </p>

                    <p>
                        <strong>Rows :</strong>{" "}
                        {rows.toLocaleString("en-IN")}
                    </p>

                    <p>
                        <strong>Columns :</strong>{" "}
                        {columns.length}
                    </p>

                </div>

                <button
                    type="button"
                    className="remove-btn"
                    onClick={removeFile}
                >
                    Remove
                </button>

            </div>


            {/* ================================
                DETECTED COLUMNS
            ================================= */}

            <div className="column-box">

                <h4>
                    Detected Columns
                </h4>

                {columns.length > 0 ? (

                    <div className="column-list">

                        {columns.map(
                            (column, index) => (

                                <span
                                    key={`${String(
                                        column
                                    )}-${index}`}
                                    className="column-tag"
                                >
                                    {String(column)}
                                </span>

                            )
                        )}

                    </div>

                ) : (

                    <div className="column-empty">
                        No columns detected yet
                    </div>

                )}

            </div>


            {/* ================================
                UPLOAD SUCCESS
            ================================= */}

            {uploadSuccess && (

                <div className="upload-success">

                    <h3>
                        ✅ Upload Successful
                    </h3>

                    <p>
                        Dataset uploaded
                        successfully.
                    </p>

                </div>

            )}

        </>
    );
}

export default FilePreview;