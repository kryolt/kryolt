import UploadCSV from "../../components/dashboard/upload/UploadCSV";
import RecentUploads from "../../components/dashboard/upload/RecentUploads";
import "./Upload.css";

function Upload() {
    return (
        <section className="upload-page">
            <div className="upload-header">
                <div className="upload-header-main">
                    <div className="upload-eyebrow">Data Import</div>
                    <h1>Upload Data</h1>
                    <p className="upload-description">
                        Upload your <strong>CSV or Excel</strong> business data to generate your dashboard.
                    </p>
                </div>
            </div>

            <div className="upload-content">
                <UploadCSV />
            </div>

            <div className="upload-history-section">
                <RecentUploads />
            </div>
        </section>
    );
}

export default Upload;