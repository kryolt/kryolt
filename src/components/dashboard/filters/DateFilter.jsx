import { useState } from "react";
import {
    Calendar,
    Settings2,
    ArrowRight,
} from "lucide-react";

import "./DateFilter.css";

function DateFilter({
    value = "all",
    onChange,
    onCustomDateChange,
}) {
    const [
        showCustom,
        setShowCustom,
    ] = useState(false);

    const [
        customStart,
        setCustomStart,
    ] = useState("");

    const [
        customEnd,
        setCustomEnd,
    ] = useState("");

    const handleQuickSelect =
        (preset) => {
            /*
             * Prevent any accidental form submission.
             */
            setShowCustom(false);

            onChange?.(preset);
        };

    const handleCustomOpen =
        () => {
            setShowCustom(
                (previous) =>
                    !previous
            );
        };

    const handleCustomClose =
        () => {
            setShowCustom(false);
        };

    const handleCustomDateApply =
        () => {
            if (
                !customStart ||
                !customEnd
            ) {
                return;
            }

            /*
             * Compare YYYY-MM-DD strings directly.
             * This avoids timezone problems.
             */
            if (
                customStart >
                customEnd
            ) {
                alert(
                    "Start date cannot be after End date."
                );

                return;
            }

            const dateRange = {
                type: "custom",
                startDate:
                    customStart,
                endDate:
                    customEnd,
            };

            /*
             * Send the actual range.
             *
             * Provider will perform the database query.
             */
            onCustomDateChange?.(
                dateRange
            );

            setShowCustom(false);
        };

    const presetOptions = [
        {
            label: "All time",
            value: "all",
        },
        {
            label: "Today",
            value: "today",
        },
        {
            label: "Last 7 days",
            value: "7days",
        },
        {
            label: "Last 30 days",
            value: "30days",
        },
        {
            label: "This month",
            value: "month",
        },
        {
            label: "This year",
            value: "year",
        },
    ];

    return (
        <div className="date-filter">
            <div className="date-filter-header">
                <div className="date-filter-label">
                    <Calendar
                        size={16}
                        className="label-icon"
                    />

                    <label>
                        Analytics Period
                    </label>
                </div>
            </div>

            <div className="date-filter-container">
                <div className="preset-buttons">
                    {presetOptions.map(
                        (option) => (
                            <button
                                key={
                                    option.value
                                }
                                type="button"
                                className={`preset-btn ${value ===
                                    option.value
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    handleQuickSelect(
                                        option.value
                                    )
                                }
                            >
                                {
                                    option.label
                                }
                            </button>
                        )
                    )}

                    <button
                        type="button"
                        className={`preset-btn custom-btn ${value ===
                            "custom"
                            ? "active"
                            : ""
                            }`}
                        onClick={
                            handleCustomOpen
                        }
                    >
                        <Settings2
                            size={14}
                            className="custom-icon"
                        />

                        Custom
                    </button>
                </div>

                {showCustom && (
                    <div className="custom-date-picker">
                        <div className="custom-date-header">
                            <h3>
                                Select Date Range
                            </h3>
                        </div>

                        <div className="date-inputs">
                            <div className="date-input-group">
                                <label>
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        customStart
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCustomStart(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="date-input"
                                />
                            </div>

                            <div className="date-separator">
                                <ArrowRight
                                    size={16}
                                />
                            </div>

                            <div className="date-input-group">
                                <label>
                                    End Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        customEnd
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCustomEnd(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="date-input"
                                />
                            </div>
                        </div>

                        <div className="custom-date-actions">
                            <button
                                type="button"
                                className="custom-cancel-btn"
                                onClick={
                                    handleCustomClose
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="custom-apply-btn"
                                disabled={
                                    !customStart ||
                                    !customEnd
                                }
                                onClick={
                                    handleCustomDateApply
                                }
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DateFilter;