import "./UploadCSV.css";

function UploadProgress({ progress }) {

    if (progress <= 0 || progress >= 100) return null;

    return (

        <div className="upload-progress-card">

            <div className="progress-top">

                <span>Uploading Dataset...</span>

                <span>{progress}%</span>

            </div>

            <div className="progress-bar">

                <div
                    className="progress-fill"
                    style={{
                        width: `${progress}%`
                    }}
                ></div>

            </div>

        </div>

    );

}

export default UploadProgress;