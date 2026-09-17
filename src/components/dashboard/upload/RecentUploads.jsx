import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Clock3,
    FileSpreadsheet,
    FileText,
    RefreshCw,
    Trash2,
    UploadCloud,
} from "lucide-react";

import {
    getUploadHistory,
    deleteUploadHistory,
} from "../../../utils/storage/indexedDB";

import "./RecentUploads.css";


function RecentUploads() {

    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);


    // =====================================================
    // LOAD RECENT UPLOADS
    // =====================================================

    const loadUploads = useCallback(
        async (silent = false) => {

            try {

                if (silent) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const history =
                    await getUploadHistory();

                setUploads(
                    Array.isArray(history)
                        ? history
                        : []
                );

            } catch (error) {

                console.error(
                    "Failed to load recent uploads:",
                    error
                );

                setUploads([]);

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        },
        []
    );


    useEffect(() => {
        const timer = setTimeout(() => {
            loadUploads();
        }, 0);

        return () => clearTimeout(timer);
    }, [loadUploads]);


    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (id) => {

        if (!id) return;

        try {

            await deleteUploadHistory(id);

            setUploads((previous) =>
                previous.filter(
                    (item) => item.id !== id
                )
            );

        } catch (error) {

            console.error(
                "Failed to delete upload history:",
                error
            );

        }

    };


    // =====================================================
    // DATE
    // =====================================================

    const formatDate = (value) => {

        if (!value) {
            return "Recently uploaded";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Recently uploaded";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };


    // =====================================================
    // NUMBER
    // =====================================================

    const formatNumber = (value) => {

        const number = Number(value);

        return Number.isFinite(number)
            ? number.toLocaleString("en-IN")
            : "0";

    };


    // =====================================================
    // FILE ICON
    // =====================================================

    const getFileIcon = (fileName = "") => {

        const extension =
            fileName
                .split(".")
                .pop()
                ?.toLowerCase();

        return extension === "csv"
            ? <FileText size={20} />
            : <FileSpreadsheet size={20} />;

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <section className="recent-uploads">

            <div className="recent-uploads-header">

                <div className="recent-uploads-title">

                    <div className="recent-uploads-icon">
                        <Clock3 size={18} />
                    </div>

                    <div>

                        <h2>
                            Recent Uploads
                        </h2>

                        <p>
                            Your latest uploaded datasets
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="recent-uploads-refresh"
                    onClick={() =>
                        loadUploads(true)
                    }
                    disabled={
                        loading ||
                        refreshing
                    }
                    aria-label="Refresh recent uploads"
                    title="Refresh"
                >

                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "is-spinning"
                                : ""
                        }
                    />

                    <span>
                        Refresh
                    </span>

                </button>

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <div className="recent-uploads-loading">

                    <div className="recent-upload-skeleton" />

                    <div className="recent-upload-skeleton" />

                </div>

            ) : uploads.length === 0 ? (

                /* =================================================
                   EMPTY
                ================================================= */

                <div className="recent-uploads-empty">

                    <div className="recent-uploads-empty-icon">

                        <UploadCloud size={24} />

                    </div>

                    <h3>
                        No recent uploads
                    </h3>

                    <p>
                        Your uploaded CSV or Excel files
                        will appear here.
                    </p>

                </div>

            ) : (

                /* =================================================
                   UPLOAD LIST
                ================================================= */

                <div className="recent-uploads-list">

                    {uploads.map(
                        (upload, index) => {

                            const id =
                                upload.id ??
                                `${upload.fileName}-${upload.uploadedAt}-${index}`;

                            return (

                                <article
                                    className="recent-upload-item"
                                    key={id}
                                >

                                    {/* FILE ICON */}

                                    <div className="recent-upload-file-icon">

                                        {getFileIcon(
                                            upload.fileName
                                        )}

                                    </div>


                                    {/* MAIN */}

                                    <div className="recent-upload-main">

                                        <div className="recent-upload-name-row">

                                            <h3>

                                                {
                                                    upload.fileName ||
                                                    "Uploaded Dataset"
                                                }

                                            </h3>


                                            <span className="recent-upload-status">

                                                {
                                                    upload.status ||
                                                    "Completed"
                                                }

                                            </span>

                                        </div>


                                        {/* ONLY ROWS + DATE */}

                                        <div className="recent-upload-meta">

                                            <span>

                                                {
                                                    formatNumber(
                                                        upload.rows
                                                    )
                                                }{" "}
                                                rows

                                            </span>


                                            <span className="meta-dot">
                                                •
                                            </span>


                                            <span>

                                                {
                                                    formatDate(
                                                        upload.uploadedAt
                                                    )
                                                }

                                            </span>

                                        </div>

                                    </div>


                                    {/* DELETE */}

                                    {upload.id && (

                                        <button
                                            type="button"
                                            className="recent-upload-delete"
                                            onClick={() =>
                                                handleDelete(
                                                    upload.id
                                                )
                                            }
                                            aria-label={
                                                `Delete ${upload.fileName ||
                                                "upload"
                                                } from history`
                                            }
                                            title="Remove from history"
                                        >

                                            <Trash2
                                                size={16}
                                            />

                                        </button>

                                    )}

                                </article>

                            );

                        }
                    )}

                </div>

            )}

        </section>

    );

}


export default RecentUploads;