import {
    Download,
    PlayCircle,
} from "lucide-react";

import {
    useState,
    useCallback,
    useRef,
    useEffect,
} from "react";

import ColumnMapping from "../../upload/ColumnMapping";
import { useNavigate } from "react-router-dom";

import UploadProgress from "./UploadProgress";
import FilePreview from "./FilePreview";
import CSVValidator from "./CSVValidator";

import { useUser } from "../../../context/UserContext";
import { useDashboardDataContext } from "../../../context/DashboardDataContext";

import {
    saveBusinessData,
    saveAnalytics,
    saveMetadata,
    saveUploadHistory,
    clearBusinessData,
} from "../../../utils/storage/indexedDB";

import "./UploadCSV.css";

const SAMPLE_FILE = "/samples/sample_sales.csv";


// =====================================
// Plan-wise Upload Limits
// =====================================
// Keep plan IDs normalized to lowercase.

const PLAN_LIMITS = {
    free: {
        maxFileSize: 5,
        maxRows: 10000,
    },

    professional: {
        maxFileSize: 25,
        maxRows: 50000,
    },

    business: {
        maxFileSize: 100,
        maxRows: 200000,
    },
};


// =========================================================
// PLAN HELPER
// =========================================================

const normalizePlan = (value) => {
    const normalized = String(value || "")
        .trim()
        .toLowerCase();

    if (normalized === "business") {
        return "business";
    }

    if (
        normalized === "professional" ||
        normalized === "pro"
    ) {
        return "professional";
    }

    return "free";
};


// =========================================================
// SUPPORTED FILE TYPES
// =========================================================

const SUPPORTED_EXTENSIONS = [
    "csv",
    "xlsx",
    "xls",
];


// =========================================================
// COMPONENT
// =========================================================

function UploadCSV() {

    const navigate = useNavigate();

    // -----------------------------------------------------
    // Mapping-related state (must live inside the component)
    // -----------------------------------------------------

    const [columnMapping, setColumnMapping] =
        useState(null);

    const [showMapping, setShowMapping] =
        useState(false);

    // Heavy datasets never live in React state.
    const workerRef = useRef(null);
    const workerDataRef = useRef([]);
    const workerReadyRef = useRef(false);
    const workerFileRef = useRef(null);
    const workerAnalyticsRef = useRef(null);

    const {
        refreshDashboard,
    } = useDashboardDataContext();

    const {
        user,
        plan: contextPlan,
        subscription,
        updateStorage,
    } = useUser();


    // =====================================================
    // STATE
    // =====================================================

    const [fileInfo, setFileInfo] =
        useState(null);

    const [dragActive, setDragActive] =
        useState(false);

    const [uploadSuccess, setUploadSuccess] =
        useState(false);

    const [progress, setProgress] =
        useState(0);

    const [isProcessing, setIsProcessing] =
        useState(false);


    // =====================================================
    // REFS
    // =====================================================

    const inputRef =
        useRef(null);

    const redirectTimerRef =
        useRef(null);


    // =====================================================
    // USER PLAN & RESOLVED LIMITS
    // =====================================================

    const plan = normalizePlan(
        contextPlan ||
        subscription?.plan ||
        user?.plan
    );

    const currentLimit =
        PLAN_LIMITS[plan] || PLAN_LIMITS.free;


    // =====================================================
    // CLEANUP
    // =====================================================

    useEffect(() => {

        return () => {

            if (redirectTimerRef.current) {
                clearTimeout(
                    redirectTimerRef.current
                );
            }

            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }

        };

    }, []);


    // =====================================================
    // RESET INPUT
    // =====================================================

    const resetInput = useCallback(() => {

        if (inputRef.current) {

            inputRef.current.value = "";

        }

    }, []);


    // =====================================================
    // RESET MAPPING
    // =====================================================

    const resetMapping = useCallback(() => {

        setColumnMapping(null);

        setShowMapping(false);

    }, []);


    // =====================================================
    // DOWNLOAD SAMPLE CSV
    // =====================================================

    const downloadSampleCSV = useCallback(() => {

        try {

            const link =
                document.createElement("a");

            link.href =
                SAMPLE_FILE;

            link.download =
                "Kryolt_Sample_Sales_Data.csv";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

        }

        catch (error) {

            if (import.meta.env?.DEV) {

                console.error(
                    "Sample download failed:",
                    error
                );

            }

            alert(
                "Unable to download the sample dataset."
            );

        }

    }, []);


    // =====================================================
    // VALIDATION ERROR
    // =====================================================

    const showValidationError = useCallback(
        (validation) => {

            if (
                validation?.reason ===
                "MISSING_COLUMNS"
            ) {

                alert(
                    `Missing required columns:\n\n` +
                    `${validation.missingColumns?.join(", ") || "Unknown"}\n\n` +
                    `Required columns:\n` +
                    `Date, Product, Quantity, Cost Price, Sale Price`
                );

                return;

            }


            if (
                validation?.reason ===
                "MISSING_VALUES"
            ) {

                alert(
                    `Some required values are missing.\n\n` +
                    `Invalid rows: ${validation.invalidRows?.length || 0}\n` +
                    `Missing values: ${validation.missingValues || 0}\n\n` +
                    `Please fix your file and upload it again.`
                );

                return;

            }


            alert(
                "The uploaded file is empty or invalid."
            );

        },
        []
    );


    // =====================================================
    // WORKER ERROR / VALIDATION
    // =====================================================

    const showWorkerError = useCallback((message) => {
        alert(
            message ||
            "Something went wrong while processing your dataset. Please try again."
        );
        setProgress(0);
        setUploadSuccess(false);
        setIsProcessing(false);
    }, []);


    // =====================================================
    // SAVE FINAL BUSINESS DATA
    // Worker performs mapping, validation, cleaning and analytics.
    // Main thread only persists the final result and refreshes UI.
    // =====================================================

    const handleSaveBusinessData = useCallback(
        async (data, file) => {

            try {

                setProgress(90);

                if (!Array.isArray(data) || !data.length) {
                    throw new Error(
                        "The uploaded file does not contain any usable data."
                    );
                }

                const analytics = workerAnalyticsRef.current;

                if (!analytics) {
                    throw new Error(
                        "Analytics calculation failed."
                    );
                }

                // saveBusinessData replaces the active dataset atomically.
                // Do not clear the old dataset before the new dataset is safely saved.
                setProgress(92);

                await saveBusinessData(data);
                await saveAnalytics(analytics);

                await saveMetadata({
                    fileName: file?.name || "Kryolt Sample Dataset",
                    rows: data.length,
                    uploadedAt: new Date().toISOString(),
                });

                try {
                    // IMPORTANT:
                    // `data` contains processed/canonical fields.
                    // Upload history must show the ORIGINAL uploaded
                    // file's columns, not internal processed fields.

                    const originalColumns =
                        Array.isArray(columnMapping?.columns)
                            ? columnMapping.columns
                            : Array.isArray(columnMapping?.sourceColumns)
                                ? columnMapping.sourceColumns
                                : Array.isArray(columnMapping?.headers)
                                    ? columnMapping.headers
                                    : Array.isArray(fileInfo?.columns)
                                        ? fileInfo.columns
                                        : [];

                    await saveUploadHistory({
                        fileName:
                            file?.name ||
                            "Kryolt Sample Dataset",

                        rows: data.length,

                        // Show actual uploaded-file column count
                        columns: originalColumns.length,

                        // Keep the actual column names available
                        // for future Recent Uploads UI.
                        columnNames: originalColumns,

                        uploadedAt:
                            new Date().toISOString(),

                        status: "Completed",
                    });

                } catch (historyError) {

                    if (import.meta.env?.DEV) {
                        console.warn(
                            "Upload history could not be saved:",
                            historyError
                        );
                    }

                    // Upload itself is already successful.
                }

                const sizeInMB = file
                    ? file.size / (1024 * 1024)
                    : 0;

                await updateStorage(
                    Number(sizeInMB.toFixed(4))
                );

                try {
                    await refreshDashboard();
                } catch (refreshError) {
                    if (import.meta.env?.DEV) {
                        console.warn(
                            "Dashboard refresh warning:",
                            refreshError
                        );
                    }
                }

                setFileInfo((previous) => {

                    const detectedColumns =
                        Array.isArray(previous?.columns) &&
                            previous.columns.length > 0
                            ? previous.columns
                            : data.length > 0
                                ? Object.keys(data[0])
                                : [];

                    return {
                        ...(previous || {}),

                        name:
                            file?.name ||
                            "Kryolt Sample Dataset",

                        size:
                            file?.size || 0,

                        rows:
                            data.length,

                        columns:
                            detectedColumns,

                        columnCount:
                            detectedColumns.length,
                    };
                });

                setUploadSuccess(true);
                setProgress(100);

                workerDataRef.current = [];
                workerAnalyticsRef.current = null;
                workerReadyRef.current = false;

                resetInput();
                resetMapping();

                redirectTimerRef.current = setTimeout(() => {
                    navigate("/dashboard");
                }, 700);

            } catch (error) {

                if (import.meta.env?.DEV) {
                    console.error(
                        "Business data save failed:",
                        error
                    );
                }

                alert(
                    error?.message ||
                    "Something went wrong while saving your data. Please try again."
                );

                setProgress(0);
                setUploadSuccess(false);

            } finally {
                setIsProcessing(false);
            }

        },
        [
            columnMapping,
            fileInfo,
            navigate,
            refreshDashboard,
            resetInput,
            resetMapping,
            updateStorage,
        ]
    );


    // =====================================================
    // WORKER SETUP
    // =====================================================

    const ensureWorker = useCallback(() => {

        if (workerRef.current) {
            return workerRef.current;
        }

        const worker = new Worker(
            new URL(
                "../../../workers/uploadProcessing.worker.js",
                import.meta.url
            ),
            { type: "module" }
        );

        worker.onmessage = async (event) => {

            const {
                type,
                progress: workerProgress,
                mapping,
                rows,
                chunk,
                analytics,
                validation,
                message,
            } = event.data || {};

            try {

                if (type === "PROGRESS") {
                    if (Number.isFinite(workerProgress)) {
                        setProgress(workerProgress);
                    }
                    return;
                }

                if (type === "MAPPING_READY") {
                    workerReadyRef.current = true;

                    setColumnMapping(mapping || null);

                    // Detect original uploaded file columns safely
                    const detectedColumns =
                        Array.isArray(mapping?.columns)
                            ? mapping.columns
                            : Array.isArray(mapping?.sourceColumns)
                                ? mapping.sourceColumns
                                : Array.isArray(mapping?.headers)
                                    ? mapping.headers
                                    : [];

                    setFileInfo((previous) => ({
                        ...(previous || {}),
                        rows: Number(rows) || 0,
                        columns: detectedColumns,
                    }));

                    setProgress(40);
                    setIsProcessing(false);
                    setShowMapping(true);

                    return;
                }

                if (type === "DATA_CHUNK") {
                    if (Array.isArray(chunk) && chunk.length) {
                        workerDataRef.current.push(...chunk);
                    }
                    if (Number.isFinite(workerProgress)) {
                        setProgress(workerProgress);
                    }
                    return;
                }

                if (type === "VALIDATION_ERROR") {

                    if (validation?.reason === "ROW_LIMIT") {
                        alert(
                            `Your ${plan} plan allows a maximum of ` +
                            `${currentLimit.maxRows.toLocaleString("en-IN")} rows.\n\n` +
                            `This file contains ` +
                            `${Number(validation.rows || 0).toLocaleString("en-IN")} rows.\n\n` +
                            `Upgrade your plan to upload larger datasets.`
                        );
                    } else {
                        showValidationError(validation);
                    }

                    workerDataRef.current = [];
                    workerAnalyticsRef.current = null;
                    setProgress(0);
                    setIsProcessing(false);
                    return;
                }

                if (type === "COMPLETE") {

                    workerAnalyticsRef.current = analytics || null;

                    const cleanedData = workerDataRef.current;

                    if (!cleanedData.length) {
                        throw new Error(
                            "No usable records were produced after processing."
                        );
                    }

                    await handleSaveBusinessData(
                        cleanedData,
                        workerFileRef.current
                    );
                    return;
                }

                if (type === "ERROR") {
                    throw new Error(
                        message ||
                        "Unable to process the dataset."
                    );
                }

            } catch (error) {

                if (import.meta.env?.DEV) {
                    console.error(
                        "Upload worker message handling failed:",
                        error
                    );
                }

                showWorkerError(
                    error?.message || message
                );
            }
        };

        worker.onerror = (error) => {
            if (import.meta.env?.DEV) {
                console.error(
                    "Upload worker crashed:",
                    error
                );
            }
            showWorkerError(
                "Unable to process this dataset. Please try again."
            );
        };

        workerRef.current = worker;
        return worker;

    }, [
        currentLimit.maxRows,
        handleSaveBusinessData,
        plan,
        showWorkerError,
        showValidationError,
    ]);


    // =====================================================
    // APPLY CONFIRMED COLUMN MAPPING
    // The raw dataset remains inside the worker.
    // =====================================================

    const handleMappingConfirm = useCallback(
        (mappingResult) => {

            if (!workerRef.current || !workerReadyRef.current) {
                alert(
                    "The dataset processor is not ready yet. Please try again."
                );
                return;
            }

            if (!mappingResult?.mapping) {
                alert("Invalid column mapping.");
                return;
            }

            if (mappingResult.requiredMissing?.length > 0) {
                alert(
                    `Required columns are missing:\n\n` +
                    `${mappingResult.requiredMissing.join(", ")}`
                );
                setProgress(40);
                return;
            }

            setIsProcessing(true);
            setShowMapping(false);
            setProgress(50);
            workerDataRef.current = [];
            workerAnalyticsRef.current = null;

            workerRef.current.postMessage({
                type: "PROCESS_MAPPED_DATA",
                mapping: mappingResult,
                maxRows: currentLimit.maxRows,
            });

        },
        [currentLimit.maxRows]
    );


    // =====================================================
    // PROCESS FILE
    // Parsing and mapping detection happen inside Web Worker.
    // =====================================================

    const processFile = useCallback(
        (file) => {

            if (!file || isProcessing) {
                return;
            }

            const fileName = String(file.name || "").trim();

            if (!fileName) {
                alert("Invalid file selected.");
                return;
            }

            const extension = fileName
                .split(".")
                .pop()
                .toLowerCase();

            if (!SUPPORTED_EXTENSIONS.includes(extension)) {
                alert(
                    "Unsupported file type.\n\n" +
                    "Please upload a .csv, .xlsx, or .xls file."
                );
                resetInput();
                return;
            }

            const fileSizeMB =
                file.size / (1024 * 1024);

            if (!Number.isFinite(fileSizeMB)) {
                alert("Unable to determine the file size.");
                resetInput();
                return;
            }

            if (fileSizeMB > currentLimit.maxFileSize) {
                alert(
                    `Your ${plan} plan allows a maximum file size of ` +
                    `${currentLimit.maxFileSize} MB.\n\n` +
                    `This file is ${fileSizeMB.toFixed(2)} MB.\n\n` +
                    `Upgrade your plan to upload larger files.`
                );
                resetInput();
                return;
            }

            try {

                const worker = ensureWorker();

                workerDataRef.current = [];
                workerAnalyticsRef.current = null;
                workerReadyRef.current = false;
                workerFileRef.current = {
                    name: fileName,
                    size: file.size,
                };

                setIsProcessing(true);
                setProgress(5);
                setUploadSuccess(false);
                setShowMapping(false);
                setColumnMapping(null);

                setFileInfo({
                    name: fileName,
                    size: file.size,
                    rows: null,
                });

                worker.postMessage({
                    type: "PARSE_FILE",
                    file,
                    fileType: extension,
                });

            } catch (error) {

                if (import.meta.env?.DEV) {
                    console.error(
                        "Upload worker initialization failed:",
                        error
                    );
                }

                showWorkerError(
                    error?.message ||
                    "Unable to start dataset processing."
                );
            }

        },
        [
            currentLimit.maxFileSize,
            ensureWorker,
            isProcessing,
            plan,
            resetInput,
            showWorkerError,
        ]
    );


    // =====================================================
    // FILE INPUT
    // =====================================================

    const handleChange =
        useCallback(

            (event) => {

                const file =
                    event.target?.files?.[0];

                if (!file) {

                    return;

                }

                processFile(
                    file
                );

            },

            [processFile]

        );


    // =====================================================
    // SAMPLE DATASET
    // =====================================================

    const trySampleDataset =
        useCallback(

            async () => {

                if (isProcessing) {

                    return;

                }


                try {

                    setIsProcessing(true);

                    setProgress(20);

                    setUploadSuccess(false);


                    const response =
                        await fetch(
                            SAMPLE_FILE,
                            {
                                cache: "no-store",
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            `Sample dataset request failed: ${response.status}`
                        );

                    }


                    const blob =
                        await response.blob();


                    if (!blob.size) {

                        throw new Error(
                            "Sample dataset is empty."
                        );

                    }


                    const sampleFile =
                        new File(

                            [blob],

                            "Kryolt_Sample_Sales_Data.csv",

                            {
                                type:
                                    "text/csv",
                            }

                        );


                    processFile(
                        sampleFile
                    );

                }

                catch (error) {

                    if (import.meta.env?.DEV) {

                        console.error(
                            "Sample dataset failed:",
                            error
                        );

                    }

                    alert(
                        "Unable to load the sample dataset. Please try again."
                    );

                    setProgress(0);

                    setIsProcessing(false);

                }

            },

            [
                isProcessing,
                processFile,
            ]

        );


    // =====================================================
    // REMOVE DATASET
    // =====================================================

    const removeFile =
        useCallback(

            async () => {

                if (isProcessing) {

                    return;

                }


                try {

                    setIsProcessing(true);


                    await clearBusinessData();


                    await updateStorage(
                        0
                    );


                    setFileInfo(null);

                    setUploadSuccess(false);

                    setProgress(0);

                    resetMapping();

                    resetInput();

                }

                catch (error) {

                    if (import.meta.env?.DEV) {

                        console.error(
                            "Dataset removal failed:",
                            error
                        );

                    }

                    alert(
                        "Unable to remove the current dataset. Please try again."
                    );

                }

                finally {

                    setIsProcessing(false);

                }

            },

            [
                isProcessing,
                resetInput,
                resetMapping,
                updateStorage,
            ]

        );


    // =====================================================
    // MAPPING SCREEN
    //
    // Only pass props ColumnMapping.jsx actually uses.
    // No manual override UI in this iteration, so data /
    // onMappingChange are intentionally NOT passed.
    // =====================================================

    if (showMapping && columnMapping) {

        return (

            <div className="upload-card">

                <ColumnMapping

                    mapping={
                        columnMapping
                    }

                    onConfirm={
                        handleMappingConfirm
                    }

                    onCancel={() => {

                        resetMapping();

                        setProgress(0);

                        resetInput();

                    }}

                    isProcessing={
                        isProcessing
                    }

                />

            </div>

        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <>

            <div className="upload-card">

                <UploadProgress
                    progress={progress}
                />


                {/* =========================================
                    DROP ZONE
                ========================================= */}

                <div

                    className={
                        `upload-area ${dragActive
                            ? "active"
                            : ""
                        } ${isProcessing
                            ? "processing"
                            : ""
                        }`
                    }

                    onDragOver={(event) => {

                        event.preventDefault();

                        if (!isProcessing) {

                            setDragActive(true);

                        }

                    }}

                    onDragLeave={() => {

                        setDragActive(false);

                    }}

                    onDrop={(event) => {

                        event.preventDefault();

                        setDragActive(false);

                        if (isProcessing) {

                            return;

                        }

                        const file =
                            event.dataTransfer
                                ?.files?.[0];

                        processFile(file);

                    }}

                    aria-busy={
                        isProcessing
                    }

                >


                    <div className="upload-icon">

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >

                            <path
                                d="M7 16.5C4.79 16.5 3 14.71 3 12.5C3 10.5 4.5 8.81 6.44 8.55C7.13 6.02 9.44 4.17 12.19 4.17C15.47 4.17 18.14 6.84 18.14 10.12C18.14 10.24 18.14 10.36 18.13 10.48C19.79 10.9 21 12.41 21 14.2C21 16.32 19.28 18.04 17.16 18.04H7.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <path
                                d="M12 12V20M12 12L9.5 14.5M12 12L14.5 14.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                        </svg>

                    </div>


                    <h2>

                        {
                            isProcessing
                                ? "Processing your dataset..."
                                : "Upload CSV or Excel Dataset"
                        }

                    </h2>


                    <p>

                        {
                            isProcessing
                                ? "Please wait while Kryolt reads and maps your data."
                                : "Drag and drop your file here"
                        }

                    </p>


                    {!isProcessing && (

                        <>

                            <span>
                                or
                            </span>


                            <label
                                className="browse-btn"
                            >

                                Browse File

                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    hidden
                                    disabled={
                                        isProcessing
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </label>


                            <div className="upload-hint">

                                Accepted formats:
                                {" "}
                                .csv • .xlsx • .xls
                                {" "}
                                •
                                {" "}
                                Max size:
                                {" "}
                                {currentLimit.maxFileSize}
                                {" "}
                                MB
                                {" "}
                                •
                                {" "}
                                Max rows:
                                {" "}
                                {currentLimit.maxRows.toLocaleString(
                                    "en-IN"
                                )}

                            </div>

                        </>

                    )}

                </div>


                <FilePreview

                    fileInfo={
                        fileInfo
                    }

                    removeFile={
                        removeFile
                    }

                    uploadSuccess={
                        uploadSuccess
                    }

                />


                <CSVValidator

                    fileInfo={
                        fileInfo
                    }

                />

            </div>


            {/* =============================================
                SAMPLE DATASET
            ============================================= */}

            <div className="sample-dataset-card">

                <div className="sample-left">

                    <h3>
                        New here?
                    </h3>

                    <p>

                        Don't have a CSV yet?

                        {" "}

                        Try Kryolt instantly using our
                        sample sales dataset.

                    </p>

                </div>


                <div className="sample-actions">

                    <button
                        type="button"
                        className="sample-btn"
                        onClick={
                            trySampleDataset
                        }
                        disabled={
                            isProcessing
                        }
                    >

                        <PlayCircle
                            size={18}
                        />

                        {
                            isProcessing
                                ? "Processing..."
                                : "Try Sample"
                        }

                    </button>


                    <button
                        type="button"
                        className="download-btn"
                        onClick={
                            downloadSampleCSV
                        }
                        disabled={
                            isProcessing
                        }
                    >

                        <Download
                            size={18}
                        />

                        Download CSV

                    </button>

                </div>

            </div>

        </>

    );

}


export default UploadCSV;