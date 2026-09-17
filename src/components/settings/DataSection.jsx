import {
    Database,
    Upload,
    Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./DataSection.css";

function DataSection() {
    const navigate = useNavigate();

    return (
        <div className="settings-card">
            <div className="settings-header">
                <div>
                    <h2>Data & Storage</h2>

                    <p>
                        Manage your workspace data and access your reports.
                    </p>
                </div>

                <span className="status-badge data">
                    <Database size={14} />
                    Storage
                </span>
            </div>

            <div className="data-grid">
                {/* Uploaded Files */}
                <div className="data-card">
                    <Upload size={22} />

                    <h4>Uploaded Files</h4>

                    <p>
                        View and manage CSV and Excel files uploaded to your
                        workspace.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/upload")}
                    >
                        Manage Uploads
                    </button>
                </div>

                {/* Export Reports */}
                <div className="data-card">
                    <Download size={22} />

                    <h4>Export Reports</h4>

                    <p>
                        Download dashboards, analytics and reports in PDF or
                        Excel format.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/reports")}
                    >
                        Open Reports
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DataSection;