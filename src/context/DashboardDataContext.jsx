/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
} from "react";

/**
 * DashboardDataContext
 *
 * IMPORTANT:
 * This file contains ONLY the context + hook.
 *
 * Dashboard state, loading, filtering, pagination and
 * IndexedDB communication belong to DashboardDataProvider.jsx.
 */

const DashboardDataContext = createContext(null);

DashboardDataContext.displayName =
    "DashboardDataContext";

export function useDashboardDataContext() {
    const context =
        useContext(DashboardDataContext);

    if (!context) {
        throw new Error(
            "useDashboardDataContext must be used inside DashboardDataProvider"
        );
    }

    return context;
}

export default DashboardDataContext;