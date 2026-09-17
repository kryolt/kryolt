/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useMemo,
} from "react";

import {
    useDashboardDataContext,
} from "./DashboardDataContext";

const DashboardFilterContext =
    createContext(null);

DashboardFilterContext.displayName =
    "DashboardFilterContext";

export function DashboardFilterProvider({
    children,
}) {
    const dashboard =
        useDashboardDataContext();

    const value =
        useMemo(
            () => ({
                dateFilter:
                    dashboard.dateFilter,

                activeFilter:
                    dashboard.dateFilter,

                setDateFilter:
                    dashboard.setDateFilter,

                customDateRange:
                    dashboard.customDateRange,

                customRange:
                    dashboard.customDateRange,

                setCustomDateRange:
                    dashboard.setCustomDateRange,

                filterHasNoData:
                    dashboard.filterHasNoData,

                filterLoading:
                    dashboard.filterLoading,
            }),
            [
                dashboard.dateFilter,
                dashboard.setDateFilter,
                dashboard.customDateRange,
                dashboard.setCustomDateRange,
                dashboard.filterHasNoData,
                dashboard.filterLoading,
            ]
        );

    return (
        <DashboardFilterContext.Provider
            value={value}
        >
            {children}
        </DashboardFilterContext.Provider>
    );
}

export function useDashboardFilter() {
    const context =
        useContext(
            DashboardFilterContext
        );

    if (!context) {
        throw new Error(
            "useDashboardFilter must be used inside DashboardFilterProvider"
        );
    }

    return context;
}

export default DashboardFilterContext;