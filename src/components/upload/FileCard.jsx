import "./FileCard.css";
import { FileSpreadsheet, Trash2, CheckCircle2 } from "lucide-react";

function FileCard({ fileInfo, onRemove }) {
    if (!fileInfo) return null;

    return (
        <div className="file-card">

            <div className="file-left">

                <div className="file-icon">
                    <FileSpreadsheet size={36} />
                </div>

                <div className="file-details">

                    <h3>{fileInfo.name}</h3>

                    <p>
                        {fileInfo.rows} Rows •{" "}
                        {fileInfo.columns?.length || 0} Columns
                    </p>

                    <small>
                        {fileInfo.size} KB
                    </small>

                </div>

            </div>

            <div className="file-right">

                <div className="upload-success">
                    <CheckCircle2 size={18} />
                    Ready
                </div>

                <button
                    className="remove-file-btn"
                    onClick={onRemove}
                >
                    <Trash2 size={18} />
                </button>

            </div>

        </div>
    );
}

export default FileCard;