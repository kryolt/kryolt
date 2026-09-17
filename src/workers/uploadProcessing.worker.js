// =====================================================
// KRYOLT UPLOAD PROCESSING WORKER
// Heavy CSV/XLSX processing stays off the React main thread.
// =====================================================

import Papa from "papaparse";
import * as XLSX from "xlsx";

import {
    mapDatasetColumns,
    applyColumnMapping,
} from "../utils/csv/columnMapper";

import {
    cleanCSVData,
    validateDataset,
} from "../utils/csv/DataCleaner";

import {
    calculateAnalytics,
} from "../utils/analytics/analytics";


let rawData = null;

const CHUNK_SIZE = 10000;


// =====================================================
// PROGRESS
// =====================================================

const postProgress = (progress, stage) => {

    self.postMessage({
        type: "PROGRESS",
        progress,
        stage,
    });

};


// =====================================================
// GET ORIGINAL FILE COLUMNS
// =====================================================

const getSourceColumns = (data) => {

    if (!Array.isArray(data) || !data.length) {
        return [];
    }

    const columns = [];
    const seen = new Set();

    data.forEach((row) => {

        if (
            !row ||
            typeof row !== "object" ||
            Array.isArray(row)
        ) {
            return;
        }

        Object.keys(row).forEach((key) => {

            const column =
                String(key || "").trim();

            if (
                column &&
                !seen.has(column)
            ) {
                seen.add(column);
                columns.push(column);
            }

        });

    });

    return columns;

};


// =====================================================
// CSV PARSER
// =====================================================

const parseCSV = (file) =>
    new Promise((resolve, reject) => {

        Papa.parse(file, {

            header: true,

            skipEmptyLines: true,

            encoding: "UTF-8",

            complete: (results) => {

                const fatalError =
                    results.errors?.find(
                        (item) =>
                            item.code === "TooFewFields" ||
                            item.code === "TooManyFields"
                    );

                if (fatalError) {

                    reject(
                        new Error(
                            fatalError.message ||
                            "CSV structure is invalid."
                        )
                    );

                    return;
                }

                resolve(
                    Array.isArray(results.data)
                        ? results.data
                        : []
                );

            },

            error: (error) => {

                reject(
                    error instanceof Error
                        ? error
                        : new Error(
                            "Unable to read the CSV file."
                        )
                );

            },

        });

    });


// =====================================================
// EXCEL PARSER
// =====================================================

const parseExcel = async (file) => {

    const buffer =
        await file.arrayBuffer();

    if (!buffer?.byteLength) {

        throw new Error(
            "Empty file data."
        );

    }

    const workbook =
        XLSX.read(buffer, {
            type: "array",
            cellDates: true,
            cellNF: false,
            cellText: true,
        });

    if (
        !workbook.SheetNames ||
        !workbook.SheetNames.length
    ) {

        throw new Error(
            "No worksheet found."
        );

    }

    const worksheet =
        workbook.Sheets[
        workbook.SheetNames[0]
        ];

    if (!worksheet) {

        throw new Error(
            "Unable to read the first worksheet."
        );

    }

    return XLSX.utils.sheet_to_json(
        worksheet,
        {
            defval: "",
            raw: false,
            blankrows: false,
        }
    );

};


// =====================================================
// SEND DATA IN CHUNKS
// =====================================================

const emitCleanedDataInChunks = (data) => {

    for (
        let start = 0;
        start < data.length;
        start += CHUNK_SIZE
    ) {

        const chunk =
            data.slice(
                start,
                start + CHUNK_SIZE
            );

        const progress =
            Math.min(
                88,
                82 +
                Math.round(
                    (
                        (start + chunk.length) /
                        data.length
                    ) * 6
                )
            );

        self.postMessage({

            type: "DATA_CHUNK",

            chunk,

            progress,

        });

    }

};


// =====================================================
// MAIN WORKER
// =====================================================

self.onmessage = async (event) => {

    const {
        type,
        file,
        fileType,
        mapping,
        maxRows,
    } = event.data || {};


    try {

        // =================================================
        // PARSE FILE
        // =================================================

        if (type === "PARSE_FILE") {

            rawData = null;

            if (!file) {

                throw new Error(
                    "No file received by the processor."
                );

            }

            postProgress(
                8,
                "Reading your dataset..."
            );


            // ---------------------------------------------
            // CSV
            // ---------------------------------------------

            if (fileType === "csv") {

                rawData =
                    await parseCSV(file);

            }


            // ---------------------------------------------
            // EXCEL
            // ---------------------------------------------

            else if (
                fileType === "xlsx" ||
                fileType === "xls"
            ) {

                rawData =
                    await parseExcel(file);

            }


            // ---------------------------------------------
            // Unsupported
            // ---------------------------------------------

            else {

                throw new Error(
                    "Unsupported file type."
                );

            }


            if (
                !Array.isArray(rawData) ||
                !rawData.length
            ) {

                throw new Error(
                    "The uploaded file does not contain any data."
                );

            }


            postProgress(
                25,
                "Detecting columns..."
            );


            // =================================================
            // IMPORTANT
            //
            // Capture ORIGINAL uploaded-file columns BEFORE
            // mapping / cleaning / analytics.
            //
            // This prevents 21 generated/mapped columns from
            // appearing when the real CSV contains 12 columns.
            // =================================================

            const sourceColumns =
                getSourceColumns(rawData);


            const detectedMapping =
                mapDatasetColumns(rawData);


            // =================================================
            // SEND ORIGINAL COLUMNS TO UPLOADCSV
            // =================================================

            self.postMessage({

                type: "MAPPING_READY",

                mapping:
                    detectedMapping,

                rows:
                    rawData.length,

                columns:
                    sourceColumns,

                sourceColumns:
                    sourceColumns,

            });

            return;
        }


        // =================================================
        // PROCESS MAPPED DATA
        // =================================================

        if (
            type ===
            "PROCESS_MAPPED_DATA"
        ) {

            if (
                !Array.isArray(rawData) ||
                !rawData.length
            ) {

                throw new Error(
                    "The raw dataset is no longer available. Please upload the file again."
                );

            }


            if (!mapping) {

                throw new Error(
                    "Column mapping is missing."
                );

            }


            // =================================================
            // REQUIRED COLUMNS
            // =================================================

            if (
                mapping.requiredMissing?.length > 0
            ) {

                self.postMessage({

                    type:
                        "VALIDATION_ERROR",

                    validation: {

                        valid: false,

                        reason:
                            "MISSING_COLUMNS",

                        missingColumns:
                            mapping.requiredMissing,

                    },

                });

                return;
            }


            postProgress(
                52,
                "Applying your column mapping..."
            );


            const mappedData =
                applyColumnMapping(
                    rawData,
                    mapping
                );


            if (
                !Array.isArray(mappedData) ||
                !mappedData.length
            ) {

                throw new Error(
                    "Column mapping produced no usable records."
                );

            }


            rawData = null;


            // =================================================
            // VALIDATION
            // =================================================

            postProgress(
                60,
                "Validating your dataset..."
            );


            const validation =
                validateDataset(
                    mappedData
                );


            if (!validation?.valid) {

                self.postMessage({

                    type:
                        "VALIDATION_ERROR",

                    validation,

                });

                return;
            }


            // =================================================
            // CLEAN DATA
            // =================================================

            postProgress(
                68,
                "Cleaning your data..."
            );


            const cleanedData =
                cleanCSVData(
                    mappedData
                );


            if (
                !Array.isArray(cleanedData) ||
                !cleanedData.length
            ) {

                throw new Error(
                    "No valid business records were found after cleaning the uploaded file."
                );

            }


            // =================================================
            // ROW LIMIT
            // =================================================

            if (
                Number.isFinite(
                    Number(maxRows)
                ) &&
                cleanedData.length >
                Number(maxRows)
            ) {

                self.postMessage({

                    type:
                        "VALIDATION_ERROR",

                    validation: {

                        valid: false,

                        reason:
                            "ROW_LIMIT",

                        rows:
                            cleanedData.length,

                        maxRows:
                            Number(maxRows),

                    },

                });

                return;
            }


            // =================================================
            // ANALYTICS
            // =================================================

            postProgress(
                78,
                "Generating business analytics..."
            );


            const analytics =
                calculateAnalytics(
                    cleanedData
                );


            if (!analytics) {

                throw new Error(
                    "Analytics calculation failed."
                );

            }


            // =================================================
            // SEND DASHBOARD DATA
            // =================================================

            postProgress(
                82,
                "Preparing your dashboard..."
            );


            emitCleanedDataInChunks(
                cleanedData
            );


            // =================================================
            // COMPLETE
            // =================================================

            self.postMessage({

                type: "COMPLETE",

                analytics,

                rows:
                    cleanedData.length,

            });

            return;
        }


        // =================================================
        // RESET
        // =================================================

        if (type === "RESET") {

            rawData = null;

            return;

        }


        throw new Error(
            `Unknown upload worker operation: ${type}`
        );


    } catch (error) {

        rawData = null;

        self.postMessage({

            type: "ERROR",

            message:
                error?.message ||
                "Unable to process the dataset.",

        });

    }

};